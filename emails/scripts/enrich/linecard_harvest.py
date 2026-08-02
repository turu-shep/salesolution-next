#!/usr/bin/env python3
"""Harvest dealers' own published line cards, and read the brands off them.

Why. S1c measured the depth gap directly: a SERP result excerpt names 0.35
brands, the dealer's own line-card page names 2.17 (max 24). The line card was
never missing from the world, only from the cross-source join that S2 falsified
(98.3% of companies appear in exactly one locator; only 8 carry 2+ brands). So
read it at the source instead of reconstructing it.

Method, per domain, hard-capped at 3 URL attempts:

  1. GET the homepage. Parse every anchor and score it for line-card intent
     (anchor text or URL slug matching line card / brands / manufacturers /
     our lines / vendors / suppliers / partners). Brands on the homepage are
     kept as a fallback signal.
  2. GET the best-scoring candidate. PDFs are followed too -- the prior sweep
     found manufacturer catalogue PDFs carrying printed authorization
     boilerplate, which located dealers who declare nothing in HTML.
  3. GET the second-best candidate. If the nav yielded nothing, fall back to
     guessed conventional paths (/line-card, /brands, /manufacturers, ...).

Compliance -- these are real small businesses:
  * >= 3s between requests to the same host; concurrency is across DISTINCT
    hosts only, so no origin ever sees two of our requests at once.
  * one honest desktop Chrome UA, never rotated, no fingerprint spoofing.
  * ANY 403 stops that domain and is recorded. No retry, no bypass, ever.
  * 429 gets one exponential back-off, then the domain is left alone.
  * every response is cached, so re-runs and the verification pass cost the
    origin nothing.
  * connection failure on the homepage stops the domain -- a dead host is not
    worth three probes.

Never deletes a record. A null line-card page is a finding, and is written.

Durability: every record is appended to a `.jsonl` partial the moment it lands
and the file is fsynced periodically, so a stall costs at most the last few
records. §5g learned this the hard way twice — and learned the corollary the
harder way, when a still-alive stalled process wrote a truncated file over a
good one. The final JSON is therefore reconcilable against the partial, and
`--seed` reads prior runs' outputs rather than overwriting them.
"""
import argparse
import gzip
import hashlib
import importlib.util
import io
import json
import os
import re
import subprocess
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

CAPTURED = "2026-08-01"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ENRICH = os.path.join(ROOT, "data", "enrichment")
CACHE = os.path.join(ENRICH, "_cache")

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
HOST_DELAY = 3.0          # seconds between requests to the same host
TIMEOUT = 12
MAX_BYTES = 6_000_000
MAX_ATTEMPTS = 3          # distinct URLs per domain
MAX_REQUESTS = 4          # incl. one www/scheme retry and one 429 back-off

_bm = importlib.util.spec_from_file_location(
    "brands", os.path.join(HERE, "brands.py"))
brands_mod = importlib.util.module_from_spec(_bm)
_bm.loader.exec_module(brands_mod)

# ---------------------------------------------------------------- link scoring
# Higher is a stronger line-card signal. "partners" scores lowest because it is
# very often a customer-logo or channel-program page, not a line card.
LINK_PATTERNS = [
    (100, re.compile(r"line[\s\-_]?cards?\b", re.I)),
    (90, re.compile(r"\b(?:our|the)[\s\-_]lines\b", re.I)),
    (80, re.compile(r"\bmanufacturers?\b", re.I)),
    (78, re.compile(r"\bbrands?\b", re.I)),
    (70, re.compile(r"\b(?:lines|products?)[\s\-_]we[\s\-_](?:carry|sell|represent)\b", re.I)),
    (68, re.compile(r"\bwhat[\s\-_]we[\s\-_](?:carry|sell)\b", re.I)),
    (60, re.compile(r"\bvendors?\b", re.I)),
    (58, re.compile(r"\bsuppliers?\b", re.I)),
    (40, re.compile(r"\bpartners?\b", re.I)),
]
GUESS_PATHS = ["/line-card", "/linecard", "/brands", "/manufacturers", "/lines",
               "/our-lines", "/vendors", "/suppliers", "/products/brands"]

A_RX = re.compile(r"<a\b([^>]*)>(.*?)</a>", re.I | re.S)
HREF_RX = re.compile(r"""href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))""", re.I)
TAG_RX = re.compile(r"<(script|style|noscript|svg|template)[^>]*>.*?</\1>", re.S | re.I)
TITLE_RX = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
BAD_HREF_RX = re.compile(
    r"^(?:#|mailto:|tel:|javascript:|data:)|"
    r"\.(?:jpe?g|png|gif|webp|svg|css|js|zip|mp4|ico)(?:$|\?)", re.I)

_host_lock = threading.Lock()
_host_next = {}


def visible_text(html):
    t = TAG_RX.sub(" ", html)
    t = re.sub(r"<[^>]+>", " ", t)
    for a, b in (("&nbsp;", " "), ("&amp;", "&"), ("&#39;", "'"), ("&quot;", '"'),
                 ("&rsquo;", "'"), ("&ndash;", "-"), ("&mdash;", "-"),
                 ("&reg;", " "), ("&trade;", " "), ("&#8217;", "'")):
        t = t.replace(a, b)
    return re.sub(r"\s+", " ", t)


def throttle(host):
    """>= HOST_DELAY between requests to the same host, across all workers."""
    while True:
        with _host_lock:
            now = time.monotonic()
            nxt = _host_next.get(host, 0.0)
            if now >= nxt:
                _host_next[host] = now + HOST_DELAY
                return
            wait = nxt - now
        time.sleep(min(wait, 5.0))


def cache_path(url):
    return os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest() + ".gz")


def fetch(url, state):
    """One polite GET. Returns dict with status/kind/text/final_url.

    `state` carries the per-domain request budget so retries can't run away.
    """
    cp = cache_path(url)
    if os.path.exists(cp):
        with gzip.open(cp, "rb") as f:
            blob = json.loads(f.read().decode("utf-8", "ignore"))
        blob["cached"] = True
        return blob

    if state["requests"] >= MAX_REQUESTS:
        return {"status": None, "error": "request-budget", "kind": None}
    host = urllib.parse.urlsplit(url).netloc.lower()
    throttle(host)
    state["requests"] += 1

    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip",
    })
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            raw = r.read(MAX_BYTES)
            if r.headers.get("Content-Encoding") == "gzip":
                try:
                    raw = gzip.GzipFile(fileobj=io.BytesIO(raw)).read()
                except OSError:
                    pass
            ctype = (r.headers.get("Content-Type") or "").lower()
            final = r.geturl()
            status = r.status
    except urllib.error.HTTPError as e:
        if e.code == 429 and not state.get("backed_off"):
            state["backed_off"] = True
            time.sleep(10)
            throttle(host)
            if state["requests"] < MAX_REQUESTS:
                state["requests"] += 1
                try:
                    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                        raw = r.read(MAX_BYTES)
                        if r.headers.get("Content-Encoding") == "gzip":
                            try:
                                raw = gzip.GzipFile(fileobj=io.BytesIO(raw)).read()
                            except OSError:
                                pass
                        ctype = (r.headers.get("Content-Type") or "").lower()
                        final, status = r.geturl(), r.status
                except Exception as e2:
                    return {"status": getattr(e2, "code", None), "kind": None,
                            "refused": True, "error": repr(e2)[:120]}
            else:
                return {"status": 429, "kind": None, "refused": True}
        else:
            # 403 in particular: record and walk away. No bypass, ever.
            return {"status": e.code, "kind": None,
                    "refused": e.code in (401, 403, 429, 451),
                    "error": f"HTTP {e.code}"}
    except Exception as e:
        return {"status": None, "kind": None, "error": repr(e)[:120],
                "conn_failed": True}

    is_pdf = "application/pdf" in ctype or (
        final.lower().split("?")[0].endswith(".pdf")) or raw[:5] == b"%PDF-"
    if is_pdf:
        text = pdf_text(raw)
        blob = {"status": status, "kind": "pdf", "final_url": final,
                "text": text, "html": None}
    elif "html" in ctype or "xml" in ctype or not ctype:
        html = raw.decode("utf-8", "ignore")
        blob = {"status": status, "kind": "html", "final_url": final,
                "text": visible_text(html), "html": html}
    else:
        blob = {"status": status, "kind": "other", "final_url": final,
                "text": "", "html": None, "error": f"content-type {ctype[:40]}"}

    store = dict(blob)
    store["html"] = store["html"][:900_000] if store["html"] else None
    store["text"] = store["text"][:600_000] if store["text"] else ""
    with gzip.open(cp, "wb") as f:
        f.write(json.dumps(store).encode())
    blob["cached"] = False
    return blob


def pdf_text(raw):
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tf:
        tf.write(raw)
        path = tf.name
    try:
        out = subprocess.run(["pdftotext", "-q", "-l", "12", path, "-"],
                             capture_output=True, timeout=45)
        return re.sub(r"\s+", " ", out.stdout.decode("utf-8", "ignore"))[:600_000]
    except Exception:
        return ""
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass


def _same_page(a, b):
    """URL equality that ignores scheme, a www prefix and a trailing slash."""
    def key(u):
        p = urllib.parse.urlsplit(u)
        host = re.sub(r"^www\.", "", p.netloc.lower().split(":")[0])
        return host + "/" + p.path.strip("/").lower() + "?" + p.query
    return key(a) == key(b)


def score_links(html, base_url, apex):
    """Rank same-site anchors by line-card intent."""
    out, seen = [], set()
    for m in A_RX.finditer(html):
        attrs, inner = m.group(1), m.group(2)
        hm = HREF_RX.search(attrs)
        if not hm:
            continue
        href = (hm.group(1) or hm.group(2) or hm.group(3) or "").strip()
        if not href or BAD_HREF_RX.search(href):
            continue
        text = re.sub(r"<[^>]+>", " ", inner)
        text = re.sub(r"\s+", " ", text).strip()[:120]
        try:
            url = urllib.parse.urljoin(base_url, href)
        except ValueError:
            continue
        parts = urllib.parse.urlsplit(url)
        if parts.scheme not in ("http", "https"):
            continue
        host = parts.netloc.lower().split(":")[0]
        # stay on the dealer's own site (apex or any of its subdomains)
        if not (host == apex or host.endswith("." + apex)
                or host == "www." + apex):
            continue
        url = urllib.parse.urlunsplit((parts.scheme, parts.netloc, parts.path,
                                       parts.query, ""))
        # A "Brands" link that just points back at the homepage is not a line
        # card. Compare www-insensitively or half of them slip through.
        if url in seen or _same_page(url, base_url):
            continue
        seen.add(url)

        best = 0
        for weight, rx in LINK_PATTERNS:
            if rx.search(text):
                best = max(best, weight)
            if rx.search(urllib.parse.unquote(parts.path + " " + parts.query)):
                best = max(best, weight - 4)   # slug is slightly weaker evidence
        if not best:
            continue
        if parts.path.lower().endswith(".pdf"):
            best += 6                          # printed line cards are the good ones
        out.append((best, url, text))
    out.sort(key=lambda r: (-r[0], len(r[1])))
    return out


def harvest(target):
    apex = target["domain"]
    rec = {
        "domain": apex,
        "company_display": target.get("company_display"),
        "origins": target.get("origins", []),
        "linecard_url": None,
        "linecard_kind": None,
        "fetch_status": None,
        "homepage_status": None,
        "attempts": [],
        "brands": [],
        "brand_count": 0,
        "brands_from": None,
        "homepage_brands": [],
        "refused": False,
        "error": None,
        "source_url": None,
        "captured": CAPTURED,
    }
    state = {"requests": 0}
    urls_tried = 0

    home = f"https://{apex}/"
    r = fetch(home, state)
    urls_tried += 1
    rec["attempts"].append({"url": home, "status": r.get("status"),
                            "kind": r.get("kind"), "error": r.get("error")})
    if r.get("conn_failed"):
        r2 = fetch(f"https://www.{apex}/", state)
        rec["attempts"].append({"url": f"https://www.{apex}/",
                                "status": r2.get("status"), "kind": r2.get("kind"),
                                "error": r2.get("error")})
        if not r2.get("conn_failed"):
            r, home = r2, f"https://www.{apex}/"

    rec["homepage_status"] = r.get("status")
    rec["source_url"] = home
    if r.get("refused"):
        rec["refused"] = True
        rec["fetch_status"] = r.get("status")
        rec["error"] = r.get("error")
        return rec
    if not r.get("html"):
        rec["fetch_status"] = r.get("status")
        rec["error"] = r.get("error") or "no-html"
        if r.get("kind") == "pdf" and r.get("text"):
            rec["brands"] = brands_mod.extract(r["text"], apex)
            rec["brand_count"] = len(rec["brands"])
            rec["brands_from"] = "homepage-pdf"
        return rec

    base = r.get("final_url") or home
    rec["homepage_brands"] = brands_mod.extract(r["text"], apex)
    ranked = score_links(r["html"], base, apex)

    candidates = [u for _, u, _ in ranked]
    if not candidates:
        candidates = [urllib.parse.urljoin(base, p) for p in GUESS_PATHS[:2]]
    elif len(candidates) == 1:
        candidates.append(urllib.parse.urljoin(base, GUESS_PATHS[0]))

    best = None
    for url in candidates:
        if urls_tried >= MAX_ATTEMPTS:
            break
        rr = fetch(url, state)
        urls_tried += 1
        rec["attempts"].append({"url": url, "status": rr.get("status"),
                                "kind": rr.get("kind"), "error": rr.get("error")})
        if rr.get("refused"):
            rec["refused"] = True
            rec["fetch_status"] = rr.get("status")
            rec["error"] = rr.get("error")
            break
        if rr.get("status") != 200 or not rr.get("text"):
            continue
        final = rr.get("final_url") or url
        if _same_page(final, base):
            continue          # the link redirected home; not a line card
        found = brands_mod.extract(rr["text"], apex)
        cand = {"url": final, "kind": rr.get("kind"),
                "brands": found, "status": rr.get("status")}
        if best is None or len(found) > len(best["brands"]):
            best = cand
        if len(found) >= 5:
            break        # deep enough; stop spending the origin's bandwidth

    if best and best["brands"]:
        rec["linecard_url"] = best["url"]
        rec["linecard_kind"] = best["kind"]
        rec["fetch_status"] = best["status"]
        rec["brands"] = best["brands"]
        rec["brands_from"] = "linecard"
        rec["source_url"] = best["url"]
    elif best:
        # page fetched fine, it just names no brand we recognise
        rec["linecard_url"] = best["url"]
        rec["linecard_kind"] = best["kind"]
        rec["fetch_status"] = best["status"]
        rec["source_url"] = best["url"]

    if not rec["brands"] and rec["homepage_brands"]:
        rec["brands"] = rec["homepage_brands"]
        rec["brands_from"] = "homepage"
    if rec["fetch_status"] is None:
        rec["fetch_status"] = rec["homepage_status"]
    rec["brand_count"] = len(rec["brands"])
    return rec


def read_records(path):
    """Records from a prior output, or []. Tolerates a missing file."""
    if not os.path.exists(path):
        return []
    with open(path, encoding="utf-8") as f:
        return json.load(f).get("records", [])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workers", type=int, default=24)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--minutes", type=float, default=70.0, help="wall-clock timebox")
    ap.add_argument("--targets",
                    default=os.path.join(ENRICH, f"_targets-{CAPTURED}.json"))
    ap.add_argument("--out",
                    default=os.path.join(ENRICH, f"linecards-{CAPTURED}.json"))
    ap.add_argument("--seed", action="append", default=[],
                    help="prior output whose domains are already answered for "
                         "and must NOT be re-fetched; repeatable")
    ap.add_argument("--partial",
                    help="jsonl checkpoint path (default: <out>.partial.jsonl)")
    args = ap.parse_args()

    os.makedirs(CACHE, exist_ok=True)
    with open(args.targets) as f:
        targets = json.load(f)["targets"]
    if args.limit:
        targets = targets[:args.limit]

    out_path = args.out
    partial_path = args.partial or (out_path + ".partial.jsonl")
    # `done` is what we must not re-fetch; `carry` is what this file must
    # re-emit. A seeded domain is answered for elsewhere, so it is skipped but
    # not copied — the report merges the seeds itself.
    done, carry = set(), {}
    for p in args.seed:
        for r in read_records(p):
            done.add(r["domain"])
    for r in read_records(out_path):
        done.add(r["domain"])
        carry[r["domain"]] = r
    # Resume from the jsonl partial too: a stall leaves records there and
    # nowhere else, and re-fetching them would bill the origin twice.
    resumed = 0
    if os.path.exists(partial_path):
        with open(partial_path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    r = json.loads(line)
                except ValueError:
                    continue      # a torn last line is expected after a kill
                if r.get("domain") and r["domain"] not in carry:
                    carry[r["domain"]] = r
                    done.add(r["domain"])
                    resumed += 1
    todo = [t for t in targets if t["domain"] not in done]
    print(f"targets {len(targets)} | already answered {len(done)} "
          f"(resumed from partial {resumed}) | to fetch {len(todo)}", flush=True)

    deadline = time.monotonic() + args.minutes * 60
    records, lock, stop = list(carry.values()), threading.Lock(), threading.Event()
    n = [0]
    pf = open(partial_path, "a", encoding="utf-8")
    t0 = time.monotonic()

    def work(t):
        if stop.is_set() or time.monotonic() > deadline:
            stop.set()
            return None
        try:
            rec = harvest(t)
        except Exception as e:  # noqa: BLE001 - one bad host must not kill the run
            rec = {"domain": t["domain"], "linecard_url": None, "brands": [],
                   "brand_count": 0, "fetch_status": None,
                   "error": f"harvest-crash {e!r}"[:160],
                   "source_url": f"https://{t['domain']}/", "captured": CAPTURED,
                   "origins": t.get("origins", []), "refused": False}
        with lock:
            records.append(rec)
            pf.write(json.dumps(rec) + "\n")
            n[0] += 1
            if n[0] % 25 == 0:
                pf.flush()
                os.fsync(pf.fileno())
            if n[0] % 100 == 0:
                found = sum(1 for r in records if r.get("linecard_url"))
                print(f"  {n[0]}/{len(todo)} fetched | linecards {found} | "
                      f"{time.monotonic() - t0:.0f}s", flush=True)
                write(out_path, records, targets, partial=True)
        return None

    try:
        with ThreadPoolExecutor(max_workers=args.workers) as ex:
            list(ex.map(work, todo))
    finally:
        pf.flush()
        os.fsync(pf.fileno())
        pf.close()

    write(out_path, records, targets, partial=stop.is_set())
    print(f"\nwrote {len(records)} records -> {out_path}")
    print(f"partial: {partial_path}")
    if stop.is_set():
        print("TIMEBOX HIT - partial coverage. Re-run to resume from cache.")
    return 0


def write(path, records, targets, partial):
    records = sorted(records, key=lambda r: r["domain"])
    payload = {
        "source": "linecard",
        "source_name": "Dealer-published line cards (own site)",
        "captured": CAPTURED,
        "policy": {
            "host_delay_s": HOST_DELAY,
            "max_url_attempts_per_domain": MAX_ATTEMPTS,
            "user_agent": UA,
            "on_403": "recorded, domain abandoned, never bypassed",
            "on_429": "one exponential back-off, then abandoned",
        },
        "target_count": len(targets),
        "attempted": len(records),
        "partial": partial,
        "records": records,
    }
    tmp = path + ".tmp"
    with open(tmp, "w") as f:
        json.dump(payload, f, indent=1)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, path)


if __name__ == "__main__":
    sys.exit(main())
