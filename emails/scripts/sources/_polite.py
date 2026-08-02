"""Shared polite HTTP for the wave-3 dealer-locator extractors.

Same compliance posture as `emails/scripts/lib/fetch.mjs` and the `acquire/*.py`
scripts, restated here so the wave-3 sources stay self-contained (the `lib/`
tree is owned by the parallel SERP/DFS acquisition):

  - **<=1 request per 3s per host.** Single worker. Never parallelise per host.
  - **429 / 5xx -> exponential backoff** (15/30/60/120s), bounded retries.
  - **A hard 403 stops the source.** Recorded as a finding, never bypassed:
    no UA rotation, no challenge solving, no retry storm.
  - **401 / credential wall stops the source.** An auth check is a control, not
    a request; the robots.txt override (Artur, 2026-08-01) does not touch it.
  - **Every response cached to disk** so re-runs never re-hit the origin.
  - **`source_url` + `captured` on every record.** A row without provenance is
    a bug, not a lead.
"""
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request

CAPTURED = "2026-08-01"

# Honest desktop UA. We do not rotate it or disguise the client.
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "data", "raw")

DELAY = 3.0
BACKOFF = [15, 30, 60, 120]


class Blocked(Exception):
    """A 403/401 wall. Stop the source, record it, do not work around it."""


class Fetcher:
    """One instance per source. Tracks request count and enforces the delay."""

    def __init__(self, source, min_bytes=200):
        self.source = source
        self.cache = os.path.join(RAW, "_cache", source)
        self.min_bytes = min_bytes
        self.origin_requests = 0
        self.notes = []
        os.makedirs(self.cache, exist_ok=True)
        os.makedirs(RAW, exist_ok=True)
        self._last = 0.0

    def _pace(self):
        wait = DELAY - (time.time() - self._last)
        if wait > 0:
            time.sleep(wait)

    def get(self, url, cache_name, data=None, headers=None, timeout=180):
        """GET, or POST when `data` is a dict. Returns (body_text, from_cache)."""
        path = os.path.join(self.cache, cache_name)
        if os.path.exists(path) and os.path.getsize(path) >= self.min_bytes:
            with open(path, encoding="utf-8", errors="ignore") as f:
                return f.read(), True

        payload = None
        if data is not None:
            payload = urllib.parse.urlencode(data, doseq=True).encode()

        hdrs = {
            "User-Agent": UA,
            "Accept": "application/json, text/html;q=0.9, */*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }
        if data is not None:
            hdrs["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8"
            hdrs["X-Requested-With"] = "XMLHttpRequest"
        hdrs.update(headers or {})

        for attempt in range(len(BACKOFF) + 1):
            self._pace()
            req = urllib.request.Request(url, data=payload, headers=hdrs)
            try:
                with urllib.request.urlopen(req, timeout=timeout) as r:
                    body = r.read().decode("utf-8", "ignore")
                self._last = time.time()
                self.origin_requests += 1
                with open(path, "w", encoding="utf-8") as f:
                    f.write(body)
                return body, False
            except urllib.error.HTTPError as e:
                self._last = time.time()
                if e.code in (401, 403):
                    raise Blocked(f"HTTP {e.code} on {url} — source stopped, no bypass")
                if e.code == 404:
                    raise Blocked(f"HTTP 404 on {url}")
                wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
                print(f"  HTTP {e.code} on {url} -> backoff {wait}s", flush=True)
                time.sleep(wait)
            except Exception as e:  # noqa: BLE001 — transport errors are retryable
                self._last = time.time()
                wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
                print(f"  ERR {e!r} -> retry in {wait}s", flush=True)
                time.sleep(wait)
        raise Blocked(f"gave up on {url}")

    def json(self, url, cache_name, **kw):
        body, cached = self.get(url, cache_name, **kw)
        return json.loads(body), cached


def write_raw(source, payload, records):
    """One raw file per source, per `01-build-plan.md` §2."""
    payload = dict(payload)
    payload["records"] = records
    payload.setdefault("source", source)
    payload.setdefault("captured", CAPTURED)
    path = os.path.join(RAW, f"{source}-{CAPTURED}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=1)
    print(f"raw -> {path}  ({len(records)} records)")
    return path


# ── measurement helpers (§7 risk 1: measure, never restate the estimate) ─────

US_STATES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID",
    "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO",
    "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA",
    "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    "PR", "VI", "GU", "AS", "MP",
}

_SUFFIXES = (" inc", " llc", " l l c", " corp", " corporation", " co", " company",
             " ltd", " lp", " llp", " plc", " incorporated")


def norm_company(name):
    """Rough normalisation FOR COUNTING ONLY. S2 owns the real normalizer."""
    if not name:
        return ""
    s = " ".join(str(name).lower().replace("&amp;", "&").split())
    s = "".join(ch if ch.isalnum() or ch.isspace() or ch == "&" else " " for ch in s)
    s = " ".join(s.split())
    changed = True
    while changed:
        changed = False
        for suf in _SUFFIXES:
            if s.endswith(suf):
                s = s[: -len(suf)].strip()
                changed = True
    return s


def apex(url):
    if not url:
        return None
    u = str(url).strip()
    if not u:
        return None
    if "://" not in u:
        u = "http://" + u
    try:
        host = urllib.parse.urlparse(u).netloc.lower()
    except ValueError:
        return None
    host = host.split("@")[-1].split(":")[0]
    if host.startswith("www."):
        host = host[4:]
    return host or None


def digits(phone):
    if not phone:
        return None
    d = "".join(c for c in str(phone) if c.isdigit())
    if len(d) == 11 and d.startswith("1"):
        d = d[1:]
    return d if len(d) == 10 else None


def report(source, records, code_fields=(), us_key="is_us"):
    """Measured per-source report. Never an estimate."""
    us = [r for r in records if r.get(us_key)]
    names = {norm_company(r.get("company")) for r in us}
    names.discard("")
    n = len(us) or 1
    web = sum(1 for r in us if r.get("website"))
    ph = sum(1 for r in us if r.get("phone_raw"))
    em = sum(1 for r in us if r.get("email"))
    print(f"\n── {source} counts ────────────────────────────────")
    print(f"total records:            {len(records)}")
    print(f"US records:               {len(us)}")
    print(f"distinct companies:       {len(names)}")
    print(f"with website:             {web}  {web / n * 100:.1f}%")
    print(f"with phone:               {ph}  {ph / n * 100:.1f}%")
    print(f"with email:               {em}  {em / n * 100:.1f}%")
    for field in code_fields:
        dist = {}
        for r in us:
            v = r.get(field)
            v = "|".join(v) if isinstance(v, list) else ("" if v is None else str(v))
            dist[v or "(null)"] = dist.get(v or "(null)", 0) + 1
        top = sorted(dist.items(), key=lambda kv: -kv[1])[:12]
        print(f"source-native code `{field}` (VERBATIM, UNMAPPED): {top}")
    return {
        "total_records": len(records),
        "us_records": len(us),
        "distinct_companies": len(names),
        "pct_website": round(web / n * 100, 1),
        "pct_phone": round(ph / n * 100, 1),
        "pct_email": round(em / n * 100, 1),
    }
