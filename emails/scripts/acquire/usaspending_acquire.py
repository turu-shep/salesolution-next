#!/usr/bin/env python3
"""USAspending.gov prime-award recipient acquisition — Tier 2 source, first run.

Specced in `handoff/strategy/00-sourcing-strategy.md` §3 (Tier 2, item 6) and
`research/02-alternative-channels.md` §8b. Never run until 2026-08-01.

WHY THIS SOURCE (it is a SIGNAL source, not a volume source — we already hold
25,332 companies from DataForSEO alone):
  1. Verified legitimacy — a federal award proves the company exists and transacts.
  2. Revenue-band proxy — the small-business flag and cumulative award value are
     size signals independent of the headcount proxies the $2M floor rests on.
  3. Personalization — "you supply DLA with hydraulic fittings" is a line nothing
     else in the pipeline can write.

COMPLIANCE (`00-sourcing-strategy.md` §7):
  - Public federal API, documented, no key, no bot gate. `api.usaspending.gov`
    is offered for exactly this kind of query.
  - <=1 request per 2s, single worker, never parallelised.
  - Every response cached to disk; re-runs replay from disk and never re-hit the origin.
  - `source_url` + `captured` on every record. A row without provenance is a bug.
  - Nothing is deleted. Scoping sets a flag; it never drops a record.

ENGINEERING (the §5g lesson — two agents lost everything to in-memory accumulation):
  - Every record is appended to a `.jsonl` partial the moment it is parsed.
  - fsync every 25 writes.
  - Resume skips any slice whose response is already cached.
  - The final JSON is assembled from the partials, so a killed run loses nothing.

LANDMINE FOUND AND WORKED AROUND (2026-08-01, measured):
  `spending_by_award.page_metadata.hasNext` LIES AT DEPTH. On NAICS 423610 page
  120 reported `hasNext: false` while pages 121-126 held 550 more awards. Trusting
  it would have silently truncated the largest code by 4.4%. We page until the
  results array is EMPTY and assert the harvested total against the independent
  `spending_by_award_count` endpoint.

USAGE:
    python3 usaspending_acquire.py counts     # phase 0 — ground-truth award counts
    python3 usaspending_acquire.py awards     # phase A — award-level harvest
    python3 usaspending_acquire.py recipients # phase B — cumulative recipient enumeration
    python3 usaspending_acquire.py detail     # phase C — address + business-type flags
    python3 usaspending_acquire.py naics      # phase D — full NAICS profile per recipient
    python3 usaspending_acquire.py assemble   # build the final JSON from partials
"""
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.request
from collections import Counter, defaultdict

CAPTURED = "2026-08-01"
SOURCE = "usaspending"

# Honest desktop UA. Not rotated, not disguised.
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "data", "raw")
CACHE = os.path.join(RAW, "_cache", SOURCE)

DELAY = 2.0                       # <=1 request per 2s, per the brief
BACKOFF = [15, 30, 60, 120]
FSYNC_EVERY = 25

API = "https://api.usaspending.gov/api/v2"
EP_AWARDS = f"{API}/search/spending_by_award/"
EP_COUNT = f"{API}/search/spending_by_award_count/"
EP_CAT = f"{API}/search/spending_by_category/recipient/"
EP_CAT_NAICS = f"{API}/search/spending_by_category/naics/"
EP_RECIPIENT = f"{API}/recipient/"

# 2021-2026, ~5 years. The API floors search at 2007-10-01.
TIME_PERIOD = [{"start_date": "2021-01-01", "end_date": "2026-07-31"}]
# Prime contract awards only: BPA Call / Purchase Order / Delivery Order / Definitive.
AWARD_TYPES = ["A", "B", "C", "D"]
# Award-level harvest floor. Below this the set is DLA micro-purchases: 830,923
# awards total across the ten codes, 27,604 of them >= $25k. The recipients whose
# federal business is entirely sub-$25k orders are still caught by phase B, which
# aggregates cumulative value per recipient with no per-award floor.
AWARD_FLOOR = 25000

# Upper bound on the DETAIL pull only — never a delete, never a filter on the
# output. A recipient billing >$100M of federal work over five years is a federal
# logistics prime (SupplyCore $607M, ASRC Federal $602M, Noble Supply $522M), not
# a $2M-$75M regional distributor. They are also exactly the recipients whose
# profile endpoint 502s on a gateway timeout. They stay in the file with
# `above_detail_ceiling: true` and their cumulative value intact.
DETAIL_CEILING = 100_000_000

# `vertical` is OUR read, recorded for S3 to adjudicate. Nothing is filtered on it
# here — §5e's lesson is to capture source-native codes verbatim and interpret late.
NAICS_CODES = {
    "423830": ("Industrial Machinery and Equipment Merchant Wholesalers", "core"),
    "423840": ("Industrial Supplies Merchant Wholesalers", "core"),
    "423610": ("Electrical Apparatus and Equipment, Wiring Supplies Merchant Wholesalers", "core"),
    "423710": ("Hardware Merchant Wholesalers", "core"),
    "423720": ("Plumbing and Heating Equipment and Supplies Merchant Wholesalers", "core"),
    # FLAG, DO NOT SEAT — §5f measured construction/building materials at 20.5% of
    # the DFS pool and named it the next contamination vertical.
    "423810": ("Construction and Mining Machinery Merchant Wholesalers", "flag-construction"),
    # FLAG, LIKELY WRONG VERTICAL — §5e measured truck-fleet at 21.5% of the locator pool.
    "423860": ("Transportation Equipment and Supplies Merchant Wholesalers", "flag-transport"),
    "332991": ("Ball and Roller Bearing Manufacturing", "core-mfg"),
    "333996": ("Fluid Power Pump and Motor Manufacturing", "core-mfg"),
    "333995": ("Fluid Power Cylinder and Actuator Manufacturing", "core-mfg"),
}

US_STATES = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID",
    "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO",
    "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA",
    "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    "PR", "VI", "GU", "AS", "MP",
]
US_STATE_SET = set(US_STATES)

AWARD_FIELDS = [
    "Award ID", "Recipient Name", "Recipient UEI", "Recipient DUNS Number",
    "Recipient Location", "Award Amount", "Total Outlays", "Start Date", "End Date",
    "Base Obligation Date", "Last Modified Date", "naics_code", "naics_description",
    "psc_code", "psc_description", "Description", "Awarding Agency",
    "Awarding Sub Agency", "Funding Agency", "Funding Sub Agency",
    "Contract Award Type", "recipient_id", "Place of Performance State Code",
]

# The category endpoint hard-caps at 250 results per filter combination
# (measured: 100 + 100 + 50, hasNext false at page 3). Slices that hit it are
# flagged truncated rather than silently accepted.
CAT_CAP_PAGES = 3


# ── polite HTTP ──────────────────────────────────────────────────────────────

class Fetcher:
    def __init__(self):
        os.makedirs(CACHE, exist_ok=True)
        os.makedirs(RAW, exist_ok=True)
        self.origin_requests = 0
        self.cache_hits = 0
        self.errors = []
        self._last = 0.0

    def _pace(self):
        """Enforce >=DELAY between request STARTS, which is exactly the stated
        rule (<=1 request per 2s). Pacing from response-end instead adds the
        server's latency on top and silently runs 40% slower than the budget."""
        wait = DELAY - (time.time() - self._last)
        if wait > 0:
            time.sleep(wait)
        self._last = time.time()

    def post(self, url, body, key, timeout=180):
        """POST JSON. Returns (parsed, from_cache). Cached by an explicit key."""
        path = os.path.join(CACHE, key + ".json")
        if os.path.exists(path) and os.path.getsize(path) > 2:
            self.cache_hits += 1
            with open(path, encoding="utf-8") as f:
                return json.load(f), True
        payload = json.dumps(body).encode()
        hdrs = {"User-Agent": UA, "Accept": "application/json",
                "Content-Type": "application/json"}
        for attempt in range(len(BACKOFF) + 1):
            self._pace()
            req = urllib.request.Request(url, data=payload, headers=hdrs)
            try:
                with urllib.request.urlopen(req, timeout=timeout) as r:
                    raw = r.read().decode("utf-8", "ignore")
                self._last = time.time()
                self.origin_requests += 1
                parsed = json.loads(raw)
                with open(path, "w", encoding="utf-8") as f:
                    json.dump(parsed, f)
                return parsed, False
            except urllib.error.HTTPError as e:
                self._last = time.time()
                if e.code in (400, 404):
                    detail = e.read().decode("utf-8", "ignore")[:300]
                    self.errors.append({"url": url, "key": key, "code": e.code,
                                        "detail": detail})
                    return None, False
                wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
                print(f"  HTTP {e.code} {key} -> backoff {wait}s", flush=True)
                time.sleep(wait)
            except Exception as e:  # noqa: BLE001 — transport errors are retryable
                self._last = time.time()
                wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
                print(f"  ERR {e!r} {key} -> retry {wait}s", flush=True)
                time.sleep(wait)
        self.errors.append({"url": url, "key": key, "code": "gave_up"})
        return None, False

    def get(self, url, key, timeout=120):
        path = os.path.join(CACHE, key + ".json")
        if os.path.exists(path) and os.path.getsize(path) > 2:
            self.cache_hits += 1
            with open(path, encoding="utf-8") as f:
                return json.load(f), True
        hdrs = {"User-Agent": UA, "Accept": "application/json"}
        for attempt in range(len(BACKOFF) + 1):
            self._pace()
            req = urllib.request.Request(url, headers=hdrs)
            try:
                with urllib.request.urlopen(req, timeout=timeout) as r:
                    raw = r.read().decode("utf-8", "ignore")
                self._last = time.time()
                self.origin_requests += 1
                parsed = json.loads(raw)
                with open(path, "w", encoding="utf-8") as f:
                    json.dump(parsed, f)
                return parsed, False
            except urllib.error.HTTPError as e:
                self._last = time.time()
                if e.code in (400, 404):
                    self.errors.append({"url": url, "key": key, "code": e.code})
                    with open(path, "w", encoding="utf-8") as f:
                        json.dump({"_http_error": e.code}, f)
                    return None, False
                # 502/504 on this endpoint is a gateway timeout while USAspending
                # aggregates a recipient with hundreds of thousands of transactions
                # (measured: SupplyCore, $607M / 5yr, 502s after 59.6s every time).
                # It is a property of the recipient, not a transient fault, so the
                # full 15/30/60/120 ladder just burns 225s per giant. One retry.
                if e.code in (502, 503, 504) and attempt >= 1:
                    self.errors.append({"url": url, "key": key, "code": e.code,
                                        "note": "gateway timeout, recipient too large"})
                    with open(path, "w", encoding="utf-8") as f:
                        json.dump({"_http_error": e.code}, f)
                    return None, False
                wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
                print(f"  HTTP {e.code} {key} -> backoff {wait}s", flush=True)
                time.sleep(wait)
            except Exception as e:  # noqa: BLE001
                self._last = time.time()
                wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
                print(f"  ERR {e!r} {key} -> retry {wait}s", flush=True)
                time.sleep(wait)
        self.errors.append({"url": url, "key": key, "code": "gave_up"})
        return None, False


class Partial:
    """Append-only JSONL checkpoint. fsync every FSYNC_EVERY writes."""

    def __init__(self, name):
        self.path = os.path.join(RAW, f"{SOURCE}-{CAPTURED}.{name}.partial.jsonl")
        self.f = open(self.path, "a", encoding="utf-8")
        self.n = 0

    def write(self, obj):
        self.f.write(json.dumps(obj, ensure_ascii=False) + "\n")
        self.n += 1
        if self.n % FSYNC_EVERY == 0:
            self.flush()

    def flush(self):
        self.f.flush()
        os.fsync(self.f.fileno())

    def close(self):
        self.flush()
        self.f.close()


def read_partial(name):
    path = os.path.join(RAW, f"{SOURCE}-{CAPTURED}.{name}.partial.jsonl")
    out = []
    if not os.path.exists(path):
        return out
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                out.append(json.loads(line))
            except json.JSONDecodeError:
                continue  # a torn final line from a killed run
    return out


def ckey(*parts):
    s = "|".join(str(p) for p in parts)
    return hashlib.sha1(s.encode()).hexdigest()[:20]


_SUFFIXES = (" inc", " llc", " l l c", " corp", " corporation", " co", " company",
             " ltd", " lp", " llp", " plc", " incorporated")


def norm_company(name):
    """Normalisation for the fallback join key only. S2 owns the real normalizer."""
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


def base_filters(naics, state=None, floor=None):
    f = {"time_period": TIME_PERIOD,
         "naics_codes": {"require": [naics]},
         "award_type_codes": AWARD_TYPES}
    loc = {"country": "USA"}
    if state:
        loc["state"] = state
    f["recipient_locations"] = [loc]
    if floor is not None:
        f["award_amounts"] = [{"lower_bound": floor}]
    return f


# ── phase 0 — ground-truth counts ────────────────────────────────────────────

def phase_counts(fx):
    out = {}
    for code in NAICS_CODES:
        for label, floor in (("all", None), ("floor", AWARD_FLOOR)):
            body = {"filters": base_filters(code, floor=floor), "subawards": False}
            r, _ = fx.post(EP_COUNT, body, ckey("count", code, label))
            n = r["results"]["contracts"] if r else None
            out.setdefault(code, {})[label] = n
            print(f"count {code} {label}: {n}", flush=True)
    path = os.path.join(RAW, f"{SOURCE}-{CAPTURED}.counts.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=1)
    return out


# ── phase A — award-level harvest ────────────────────────────────────────────

def phase_awards(fx):
    """Per NAICS, awards >= AWARD_FLOOR. Page until the results array is EMPTY —
    `hasNext` is not trustworthy at depth (measured, see module docstring)."""
    done = {r["_slice"] for r in read_partial("awards")}
    part = Partial("awards")
    stats = {}
    for code, (desc, vertical) in NAICS_CODES.items():
        page, got = 1, 0
        while True:
            slice_id = f"{code}:p{page}"
            if slice_id in done:
                page += 1
                got += 100
                continue
            body = {"filters": base_filters(code, floor=AWARD_FLOOR),
                    "fields": AWARD_FIELDS, "limit": 100, "page": page,
                    "sort": "Award Amount", "order": "desc", "subawards": False}
            r, cached = fx.post(EP_AWARDS, body, ckey("aw", code, page))
            if r is None:
                break
            res = r.get("results", [])
            if not res:                       # the ONLY reliable stop condition
                break
            for a in res:
                rec = dict(a)
                rec["_slice"] = slice_id
                rec["_query_naics"] = code
                rec["_query_naics_desc"] = desc
                rec["_query_vertical_flag"] = vertical
                rec["captured"] = CAPTURED
                rec["api_url"] = EP_AWARDS
                gid = a.get("generated_internal_id")
                rec["source_url"] = (f"https://www.usaspending.gov/award/{gid}"
                                     if gid else EP_AWARDS)
                part.write(rec)
            got += len(res)
            print(f"  awards {code} p{page}: +{len(res)} (tot {got})"
                  f"{' [cache]' if cached else ''}", flush=True)
            page += 1
        stats[code] = got
        print(f"awards {code}: {got}", flush=True)
    part.close()
    return stats


# ── phase B — cumulative recipient enumeration ───────────────────────────────

def phase_recipients(fx):
    """`spending_by_category/recipient` gives CUMULATIVE award value per recipient
    with no per-award floor — the only way to see the distributor whose federal
    business is 400 micro-purchases. It hard-caps at 250 rows per filter, so a
    national pass that caps is re-run state by state."""
    done = {r["_slice"] for r in read_partial("recipients")}
    part = Partial("recipients")
    truncated = []
    counts = {}

    def sweep(code, state):
        sid = f"{code}:{state or 'US'}"
        rows, page = 0, 1
        while page <= CAT_CAP_PAGES:
            slice_id = f"{sid}:p{page}"
            if slice_id in done:
                page += 1
                rows += 100
                continue
            body = {"filters": base_filters(code, state=state),
                    "category": "recipient", "limit": 100, "page": page}
            r, _ = fx.post(EP_CAT, body, ckey("cat", code, state or "US", page))
            if r is None:
                break
            res = r.get("results", [])
            if not res:
                break
            for x in res:
                rid = x.get("recipient_id")
                part.write({
                    "_slice": slice_id, "_query_naics": code,
                    "_query_state": state, "recipient_id": rid,
                    "name": x.get("name"), "uei": x.get("uei"),
                    "duns": x.get("code"), "amount": x.get("amount"),
                    "total_outlays": x.get("total_outlays"),
                    "captured": CAPTURED, "api_url": EP_CAT,
                    "source_url": (f"https://www.usaspending.gov/recipient/{rid}/latest"
                                   if rid else EP_CAT),
                })
            rows += len(res)
            if len(res) < 100:
                break
            page += 1
        return rows

    for code in NAICS_CODES:
        n = sweep(code, None)
        counts[f"{code}:US"] = n
        print(f"recipients {code} national: {n}", flush=True)
        if n >= 250:                       # hit the cap -> go state by state
            truncated.append(f"{code}:US")
            for st in US_STATES:
                m = sweep(code, st)
                counts[f"{code}:{st}"] = m
                if m >= 250:
                    truncated.append(f"{code}:{st}")
            print(f"recipients {code} state sweep done", flush=True)
    part.close()
    path = os.path.join(RAW, f"{SOURCE}-{CAPTURED}.slice-stats.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"counts": counts, "truncated": truncated}, f, indent=1)
    return counts, truncated


# ── scoping ──────────────────────────────────────────────────────────────────

def build_index():
    """Union phases A + B into one recipient index. Nothing is dropped."""
    idx = {}

    def slot(rid, name, uei, duns):
        r = idx.get(rid)
        if r is None:
            r = idx[rid] = {
                "recipient_id": rid, "company_display": name, "uei": uei,
                "duns": duns, "naics_codes": {}, "naics_award_value": {},
                "states_seen": set(), "award_count": 0, "award_value": 0.0,
                "cumulative_award_value": 0.0, "first_award": None,
                "last_award": None, "agencies": Counter(), "sub_agencies": Counter(),
                "psc_codes": {}, "award_types": Counter(),
                "descriptions": [], "sources": set(), "address": None,
            }
        if name and not r["company_display"]:
            r["company_display"] = name
        if uei and not r["uei"]:
            r["uei"] = uei
        if duns and not r["duns"]:
            r["duns"] = duns
        return r

    for a in read_partial("awards"):
        # 296 awards (1.1%) carry no recipient_id — all of them the GSA placeholder
        # entity "MISCELLANEOUS FOREIGN AWARDEES", which has no recipient page.
        # Keyed on UEI instead of dropped: the no-delete rule has no exception for
        # records we think are junk. S3 pools it.
        rid = a.get("recipient_id") or (f"uei:{a['Recipient UEI']}"
                                        if a.get("Recipient UEI") else None)
        if not rid:
            continue
        r = slot(rid, a.get("Recipient Name"), a.get("Recipient UEI"),
                 a.get("Recipient DUNS Number"))
        r["sources"].add("award")
        code = a.get("naics_code") or a.get("_query_naics")
        if code:
            r["naics_codes"][code] = a.get("naics_description") or ""
        amt = a.get("Award Amount") or 0.0
        r["award_count"] += 1
        r["award_value"] += amt
        for k, ctr in (("Awarding Agency", "agencies"),
                       ("Awarding Sub Agency", "sub_agencies"),
                       ("Contract Award Type", "award_types")):
            if a.get(k):
                r[ctr][a[k]] += 1
        if a.get("psc_code"):
            r["psc_codes"][a["psc_code"]] = a.get("psc_description") or ""
        for k in ("Start Date", "End Date", "Base Obligation Date"):
            d = a.get(k)
            if d:
                if r["first_award"] is None or d < r["first_award"]:
                    r["first_award"] = d
                if r["last_award"] is None or d > r["last_award"]:
                    r["last_award"] = d
        desc = (a.get("Description") or "").strip()
        if desc and len(r["descriptions"]) < 8:
            r["descriptions"].append(desc)
        loc = a.get("Recipient Location") or {}
        if loc.get("state_code"):
            r["states_seen"].add(loc["state_code"])
        if r["address"] is None and loc:
            r["address"] = loc

    # Phase B: cumulative value. Awards partition cleanly by NAICS, so summing the
    # per-NAICS maxima is the right roll-up; per-state rows within one NAICS are
    # taken at max (a recipient can appear under two address states) to avoid
    # double counting.
    per = defaultdict(lambda: defaultdict(dict))
    for x in read_partial("recipients"):
        rid = x.get("recipient_id")
        if not rid:
            continue
        r = slot(rid, x.get("name"), x.get("uei"), x.get("duns"))
        r["sources"].add("category")
        code = x.get("_query_naics")
        if code and code not in r["naics_codes"]:
            r["naics_codes"][code] = NAICS_CODES.get(code, ("", ""))[0]
        st = x.get("_query_state") or "US"
        per[rid][code][st] = x.get("amount") or 0.0
        if x.get("_query_state"):
            r["states_seen"].add(x["_query_state"])

    for rid, bycode in per.items():
        r = idx[rid]
        total = 0.0
        for code, bystate in bycode.items():
            national = bystate.get("US")
            v = national if national is not None else sum(bystate.values())
            r["naics_award_value"][code] = v
            total += v
        r["cumulative_award_value"] = total

    for r in idx.values():
        # Recipients found only in phase A have no category-endpoint aggregate;
        # their >= $25k award sum is the floor on their cumulative value.
        if not r["cumulative_award_value"]:
            r["cumulative_award_value"] = r["award_value"]
    return idx


def scope(idx, floor):
    """Rank by cumulative award value, keep US, apply the detail-call floor.
    Nothing is deleted — `in_scope` is a flag on the record."""
    ranked = []
    for r in idx.values():
        st = None
        if r["address"]:
            st = r["address"].get("state_code")
        if not st and r["states_seen"]:
            st = sorted(r["states_seen"])[0]
        is_us = (st in US_STATE_SET) if st else True  # unknown -> resolved at phase C
        r["_is_us"] = is_us
        r["_state_hint"] = st
        ranked.append(r)
    ranked.sort(key=lambda r: -(r["cumulative_award_value"] or 0))
    for r in ranked:
        v = r["cumulative_award_value"] or 0
        r["above_detail_ceiling"] = v > DETAIL_CEILING
        r["in_scope"] = bool(r["_is_us"] and v >= floor and v <= DETAIL_CEILING)
    return ranked


# ── phase C — recipient detail (address + business-type flags) ───────────────

def phase_detail(fx, floor):
    idx = build_index()
    ranked = scope(idx, floor)
    # `uei:` pseudo-ids have no recipient page to fetch.
    todo = [r for r in ranked
            if r["in_scope"] and not r["recipient_id"].startswith("uei:")]
    done = {r["recipient_id"] for r in read_partial("detail")}
    part = Partial("detail")
    print(f"detail: {len(todo)} in scope, {len(done)} already done", flush=True)
    for i, r in enumerate(todo, 1):
        rid = r["recipient_id"]
        if rid in done:
            continue
        d, cached = fx.get(f"{EP_RECIPIENT}{rid}/", ckey("rec", rid))
        if d is None or d.get("_http_error"):
            part.write({"recipient_id": rid, "_error": (d or {}).get("_http_error", "fail"),
                        "captured": CAPTURED})
            continue
        d["recipient_id"] = rid
        d["captured"] = CAPTURED
        d["api_url"] = f"{EP_RECIPIENT}{rid}/"
        d["source_url"] = f"https://www.usaspending.gov/recipient/{rid}/latest"
        part.write(d)
        if i % 100 == 0:
            print(f"  detail {i}/{len(todo)} (origin {fx.origin_requests}, "
                  f"cache {fx.cache_hits})", flush=True)
    part.close()


# ── phase D — full NAICS profile per recipient ───────────────────────────────

def phase_naics(fx, floor, cap):
    """§5e's lesson: never discard a source's classification codes. Our ten query
    codes only prove a recipient touched those codes; this returns EVERY NAICS the
    recipient bills under, which is how construction/transport contamination shows
    itself. Top-weighted by cumulative value so a truncated run is still useful."""
    idx = build_index()
    ranked = scope(idx, floor)
    todo = [r for r in ranked if r["in_scope"] and r["uei"]][:cap]
    done = {r["_rid"] for r in read_partial("naics")}
    part = Partial("naics")
    print(f"naics: {len(todo)} targets, {len(done)} already done", flush=True)
    for i, r in enumerate(todo, 1):
        rid = r["recipient_id"]
        if rid in done:
            continue
        body = {"filters": {"time_period": TIME_PERIOD,
                            "recipient_search_text": [r["uei"]],
                            "award_type_codes": AWARD_TYPES},
                "category": "naics", "limit": 50, "page": 1}
        d, _ = fx.post(EP_CAT_NAICS, body, ckey("nprof", rid))
        if d is None:
            continue
        part.write({"_rid": rid, "uei": r["uei"],
                    "results": d.get("results", []),
                    "has_more": (d.get("page_metadata") or {}).get("hasNext"),
                    "captured": CAPTURED, "api_url": EP_CAT_NAICS,
                    "source_url": f"https://www.usaspending.gov/recipient/{rid}/latest"})
        if i % 100 == 0:
            print(f"  naics {i}/{len(todo)} (origin {fx.origin_requests})", flush=True)
    part.close()


# ── assemble ─────────────────────────────────────────────────────────────────

BUSINESS_FLAGS = [
    "small_business", "other_than_small_business", "woman_owned_business",
    "veteran_owned_business", "service_disabled_veteran_owned_business",
    "minority_owned_business", "historically_underutilized_business_firm",
    "8a_program_participant", "sba_certified_8a_joint_venture",
    "self_certified_small_disadvantaged_business", "alaskan_native_owned_business",
    "american_indian_owned_business", "native_hawaiian_owned_business",
    "tribally_owned_business", "hispanic_american_owned_business",
    "black_american_owned_business", "asian_pacific_american_owned_business",
    "subcontinent_asian_indian_american_owned_business", "nonprofit",
]


def assemble(floor):
    idx = build_index()
    ranked = scope(idx, floor)

    detail = {}
    for d in read_partial("detail"):
        if d.get("recipient_id") and not d.get("_error"):
            detail[d["recipient_id"]] = d
    naics_prof = {}
    for n in read_partial("naics"):
        naics_prof[n["_rid"]] = n

    counts_path = os.path.join(RAW, f"{SOURCE}-{CAPTURED}.counts.json")
    slice_path = os.path.join(RAW, f"{SOURCE}-{CAPTURED}.slice-stats.json")
    ground = json.load(open(counts_path)) if os.path.exists(counts_path) else {}
    slices = json.load(open(slice_path)) if os.path.exists(slice_path) else {}

    records, seen = [], {}
    for r in ranked:
        rid = r["recipient_id"]
        d = detail.get(rid, {})
        # MERGE, don't overwrite. The recipient-detail location carries `zip` and a
        # canonical street; the award location carries `county_name` and
        # `congressional_code` that detail returns null for. Taking one wholesale
        # silently drops the other's fields.
        aloc = r["address"] or {}
        dloc = d.get("location") or {}
        loc = dict(aloc)
        loc.update({k: v for k, v in dloc.items() if v is not None})
        zip5 = (dloc.get("zip") or aloc.get("zip5") or "") or None
        if zip5 and len(str(zip5)) > 5:
            zip5 = str(zip5)[:5]
        state = loc.get("state_code") or r["_state_hint"]
        btypes = d.get("business_types") or []
        prof = naics_prof.get(rid)

        # Every NAICS this recipient is associated with, from every angle we saw it.
        all_naics = dict(r["naics_codes"])
        if prof:
            for x in prof.get("results", []):
                if x.get("code"):
                    all_naics.setdefault(x["code"], x.get("name") or "")

        rec = {
            "source": SOURCE,
            "source_url": f"https://www.usaspending.gov/recipient/{rid}/latest",
            "captured": CAPTURED,
            "recipient_id": rid,
            "company_display": (d.get("name") or r["company_display"]),
            "company": norm_company(d.get("name") or r["company_display"]),
            "uei": d.get("uei") or r["uei"],
            "duns": d.get("duns") or r["duns"],
            "alternate_names": d.get("alternate_names") or [],
            "parent_name": d.get("parent_name"),
            "parent_uei": d.get("parent_uei"),
            "recipient_level": d.get("recipient_level"),
            "address_1": loc.get("address_line1"),
            "address_2": loc.get("address_line2"),
            "city": loc.get("city_name"),
            "state": state,
            "zip5": zip5,
            "zip4": loc.get("zip4"),
            "county_name": loc.get("county_name"),
            "congressional_code": loc.get("congressional_code"),
            "country_code": loc.get("country_code") or loc.get("location_country_code"),
            "domain": None,           # USAspending publishes no website field
            "email": None,            # nor an email
            "phone_e164": None,       # nor a phone
            # ── the three signals this source exists for ──
            "business_types": btypes,
            "business_flags": {f: (f in btypes) for f in BUSINESS_FLAGS},
            "is_small_business": "small_business" in btypes,
            "cumulative_award_value": round(r["cumulative_award_value"] or 0.0, 2),
            "naics_award_value": {k: round(v, 2) for k, v in r["naics_award_value"].items()},
            "award_count_over_floor": r["award_count"],
            "award_value_over_floor": round(r["award_value"], 2),
            "total_federal_transaction_amount": d.get("total_transaction_amount"),
            "total_federal_transactions": d.get("total_transactions"),
            "first_award_date": r["first_award"],
            "last_award_date": r["last_award"],
            "award_window": {"start": TIME_PERIOD[0]["start_date"],
                             "end": TIME_PERIOD[0]["end_date"]},
            # ── source-native classification codes, VERBATIM, unmapped (§5e) ──
            "naics_codes": all_naics,
            "naics_codes_queried": sorted(r["naics_codes"].keys()),
            "naics_profile_complete": bool(prof),
            "naics_profile_truncated": bool(prof and prof.get("has_more")),
            "psc_codes": r["psc_codes"],
            "awarding_agencies": dict(r["agencies"]),
            "awarding_sub_agencies": dict(r["sub_agencies"]),
            "contract_award_types": dict(r["award_types"]),
            "award_descriptions": r["descriptions"],
            # ── our reads, recorded not applied ──
            "vertical_flags": sorted({NAICS_CODES[c][1] for c in r["naics_codes"]
                                      if c in NAICS_CODES}),
            "found_via": sorted(r["sources"]),
            "is_us": bool(r["_is_us"]),
            "in_scope": bool(r["in_scope"]),
            "has_detail": rid in detail,
        }
        key = rec["uei"] or f"{rec['company']}|{rec['zip5'] or ''}"
        if key in seen:
            seen[key]["_dupe_recipient_ids"] = \
                seen[key].get("_dupe_recipient_ids", []) + [rid]
            continue
        seen[key] = rec
        records.append(rec)

    payload = {
        "source": SOURCE,
        "captured": CAPTURED,
        "api": "https://api.usaspending.gov (public, documented, no key)",
        "award_window": TIME_PERIOD[0],
        "award_type_codes": AWARD_TYPES,
        "award_level_floor_usd": AWARD_FLOOR,
        "detail_scope_floor_usd": floor,
        "naics_queried": {k: {"description": v[0], "vertical_flag": v[1]}
                          for k, v in NAICS_CODES.items()},
        "ground_truth_award_counts": ground,
        "slice_stats": slices,
        "landmine": ("spending_by_award page_metadata.hasNext is unreliable at depth "
                     "(423610 p120 said hasNext=false with 550 awards still to come). "
                     "Paged until the results array was empty; totals asserted "
                     "against spending_by_award_count."),
        "known_gaps": ["no website field", "no email field", "no phone field",
                       "no employee count", "no revenue field"],
        "records": records,
    }
    out = os.path.join(RAW, f"{SOURCE}-{CAPTURED}.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=1)
    print(f"raw -> {out}  ({len(records)} distinct companies)")
    return payload


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "assemble"
    floor = float(sys.argv[2]) if len(sys.argv) > 2 else 50000.0
    fx = Fetcher()
    t0 = time.time()
    if cmd == "counts":
        phase_counts(fx)
    elif cmd == "awards":
        phase_awards(fx)
    elif cmd == "recipients":
        phase_recipients(fx)
    elif cmd == "detail":
        phase_detail(fx, floor)
    elif cmd == "naics":
        cap = int(sys.argv[3]) if len(sys.argv) > 3 else 4000
        phase_naics(fx, floor, cap)
    elif cmd == "assemble":
        assemble(floor)
    else:
        print(__doc__)
        return
    print(f"\n[{cmd}] origin requests: {fx.origin_requests} | cache hits: "
          f"{fx.cache_hits} | errors: {len(fx.errors)} | "
          f"{time.time() - t0:.0f}s", flush=True)
    if fx.errors:
        with open(os.path.join(RAW, f"{SOURCE}-{CAPTURED}.errors.jsonl"), "a") as f:
            for e in fx.errors:
                f.write(json.dumps(e) + "\n")


if __name__ == "__main__":
    main()
