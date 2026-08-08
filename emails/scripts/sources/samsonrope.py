#!/usr/bin/env python3
"""S1 — Samson Rope find-a-distributor API, full take.

**Authorization.** Probed 2026-08-03 under `linecard-locators [PROBED]/`
(one query + one corrected query; log §3). The build was GATE:HUMAN R-L1,
default NO; **signed by Artur 2026-08-04** — "Continue, build anything needed
to get as much as possible" (log header note). robots: `www.samsonrope.com`
publishes `Allow: /` — no override involved, no robots question at all.

**Route (measured, not guessed).** The locator page's own `submitclicked()`
calls `GET /api/FindDistributor/GetDistributors?category=&SearchString=&Id=`.
`validateForm()` requires an industry AND a ≥2-char place text — there is no
unfiltered query. The response is JSON rows of CMS content items
(`Title: Distributor_NNN`), the same company appearing as multiple items with
different industry sets; observed behaviour is location-anchored
(Energy+Houston returned TX/AR/OK only), so the sweep runs an anchor grid —
but CALIBRATES first: one industry from two far-apart anchors; if the sets
match, the API ignores geography and one query per industry suffices.

**Budget, stated before the run:** calibration ≤4 + at most 16 industries ×
12 anchors + 4 slack = **ceiling 200 origin requests**, one worker, ≥3s
apart, every response cached (`_polite.Fetcher`). 403 stops the source.

⚠ §5i SOURCE-NATIVE CODES, verbatim and uninterpreted: `Industries` /
`Category` (the 16-option filter — Samson's own vertical code; marine
verticals will need the sort test before anything is seated), `Region`,
`Title` (the CMS item id), `finalIsDefault`. Samson's own HQ row comes back
as a fallback on empty matches — it is detected by name and recorded, never
counted as a distributor.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402

_polite.CAPTURED = "2026-08-04"

from _polite import Blocked, Fetcher, apex, digits, norm_company, report, \
    write_raw  # noqa: E402

CAPTURED = _polite.CAPTURED
SOURCE = "samsonrope"
API = "https://www.samsonrope.com/api/FindDistributor/GetDistributors"
PAGE = "https://www.samsonrope.com/resources/find-a-distributor"

# The 16 options exactly as the page carries them (label + GUID), captured
# 2026-08-03. 'towing' is lowercase in the source.
INDUSTRIES = [
    ("Arborist", "5e24da57-1d34-40e9-9aff-7d5b86f50585"),
    ("Commercial Fishing", "af804f52-c17f-4b77-962f-51cc1ff9438c"),
    ("Crane", "7b46eaf6-6d7c-43be-ae24-370fbbb17098"),
    ("Defense", "7f57a017-3679-4559-b12f-486ae094c947"),
    ("Energy", "6152e8d7-8929-4897-839b-9ce728ee9639"),
    ("Entertainment", "aa927769-d89f-40d2-8fbe-3024b7af21d2"),
    ("General Cordage", "ab4c6c5f-6f91-4dea-8f5e-dba469aceb3a"),
    ("Inland River", "eb76740f-ba34-4284-891a-af6f7e888e29"),
    ("Mining", "0146b60a-7da2-4b5a-bcb0-59ada8339725"),
    ("Mooring", "0c13b663-7c42-4915-94f2-390d476394eb"),
    ("Other", "32da0cc4-9972-41f7-9493-83c193bc083d"),
    ("Recreational Marine", "70e174c0-85da-4be6-a96d-f7bdb3a813b8"),
    ("Safety / Rescue", "276f586c-5677-4df4-a43a-92f5f4270b2c"),
    ("towing", "a719c406-a9b2-4803-a17b-169dff6da642"),
    ("Tug", "3cc301b6-2d33-4c57-86d2-c5ef7e86674a"),
    ("Utility", "29792bf7-ed8e-4484-abd4-8749f4b6c507"),
]

# Anchor grid, rope/rigging-aware: coasts and inland waterways first, then the
# interior. City text (the API text-matches place fields, then ranks).
#
# ⚠ The grid is 36 anchors because **the API caps a result set at 24 rows** —
# measured, not assumed: five Utility queries on the first 12-anchor pass
# returned exactly 24, and four other industries were still returning fresh
# companies at the last anchor. A 12-anchor pass was therefore incomplete by
# construction. More anchors is the only way to see past a cap you cannot page.
ANCHORS = [
    "Seattle", "Portland", "Los Angeles", "San Diego", "Houston",
    "New Orleans", "Miami", "Norfolk", "New York", "Boston",
    "Chicago", "Denver",
    "Atlanta", "Dallas", "Minneapolis", "Kansas City", "Pittsburgh",
    "Charlotte", "Nashville", "Phoenix", "Salt Lake City", "St Louis",
    "Indianapolis", "Cleveland", "Birmingham", "Oklahoma City", "Billings",
    "Spokane", "Sacramento", "Tampa", "Philadelphia", "Buffalo",
    "Anchorage", "Honolulu", "Duluth", "Mobile",
]
RESULT_CAP = 24        # measured 2026-08-04

HDRS = {"Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": PAGE}


def q(f, cat, guid, place, tag):
    """One query, SINGLE-ATTEMPT on 5xx.

    `_polite.Fetcher` retries 5xx through a 15/30/60/120s ladder, which is
    right for a flaky host and wrong here: this API answers 500 for place
    strings it cannot resolve (measured on "Fargo"), so the ladder spends 345s
    and five origin hits re-asking a question with a permanent answer. A 5xx
    is recorded and the sweep moves on. 403 still stops the source dead — that
    path is untouched.
    """
    qs = urllib.parse.urlencode(
        {"category": cat, "SearchString": place, "Id": guid})
    url = f"{API}?{qs}"
    path = os.path.join(f.cache, f"{tag}.json")
    if os.path.exists(path) and os.path.getsize(path) >= f.min_bytes:
        with open(path, encoding="utf-8", errors="ignore") as fh:
            rows = json.loads(fh.read())
        return (rows if isinstance(rows, list) else []), "cache"
    f._pace()
    req = urllib.request.Request(url, headers={
        "User-Agent": _polite.UA, "Accept-Language": "en-US,en;q=0.9", **HDRS})
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            body = r.read().decode("utf-8", "ignore")
        f._last = time.time()
        f.origin_requests += 1
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(body)
        rows = json.loads(body)
        return (rows if isinstance(rows, list) else []), "200"
    except urllib.error.HTTPError as e:
        f._last = time.time()
        f.origin_requests += 1
        if e.code in (401, 403):
            raise Blocked(f"HTTP {e.code} on {url} — source stopped, no bypass")
        return [], f"HTTP {e.code}"
    except Exception as e:  # noqa: BLE001 — transport failure is a finding
        f._last = time.time()
        return [], f"ERR {type(e).__name__}"


def is_hq_fallback(r):
    return "samson rope" in norm_company(r.get("AccountName"))


def slug(s):
    return "".join(c if c.isalnum() else "-" for c in s.lower()).strip("-")


def main():
    f = Fetcher(SOURCE, min_bytes=2)
    seen_titles = {}     # Title -> row (CMS item id is the natural key)
    per_query = []
    hq_hits = 0

    # ── calibration: does geography change the result set? ──────────────────
    try:
        cal_a, _ = q(f, "Energy", dict(INDUSTRIES)["Energy"], "Houston",
                     "cal-energy-houston")
        cal_b, _ = q(f, "Energy", dict(INDUSTRIES)["Energy"], "Seattle",
                     "cal-energy-seattle")
    except Blocked as e:
        print(f"BLOCKED during calibration: {e}")
        write_raw(SOURCE, {"source_url": API, "blocked": str(e)}, [])
        return
    ta = {r.get("Title") for r in cal_a if not is_hq_fallback(r)}
    tb = {r.get("Title") for r in cal_b if not is_hq_fallback(r)}
    location_limited = bool(ta.symmetric_difference(tb)) or not (ta or tb)
    print(f"calibration: Houston={sorted(ta)} Seattle={sorted(tb)} "
          f"-> location_limited={location_limited}")

    anchors = ANCHORS if location_limited else ["Houston"]
    blocked = False
    for cat, guid in INDUSTRIES:
        if blocked:
            break
        for place in anchors:
            tag = f"{slug(cat)}-{slug(place)}"
            try:
                rows, status = q(f, cat, guid, place, tag)
            except Blocked as e:
                print(f"BLOCKED at {tag}: {e} — stopping source")
                per_query.append({"industry": cat, "anchor": place,
                                  "blocked": str(e)})
                blocked = True
                break
            if status.startswith(("HTTP", "ERR")):
                per_query.append({"industry": cat, "anchor": place,
                                  "status": status})
                print(f"  {cat:22s} @ {place:16s} {status}", flush=True)
                continue
            real = [r for r in rows if not is_hq_fallback(r)]
            hq_hits += len(rows) - len(real)
            fresh = 0
            for r in real:
                t = r.get("Title")
                if t not in seen_titles:
                    r["industries_seen_in"] = []
                    seen_titles[t] = r
                    fresh += 1
                seen_titles[t]["industries_seen_in"].append(
                    f"{cat}@{place}")
            per_query.append({"industry": cat, "anchor": place,
                              "rows": len(rows), "real": len(real),
                              "fresh_titles": fresh,
                              "clipped_at_cap": len(rows) >= RESULT_CAP})
            print(f"  {cat:22s} @ {place:16s} rows={len(rows):3d} "
                  f"real={len(real):3d} fresh={fresh}"
                  f"{'  [CAP]' if len(rows) >= RESULT_CAP else ''}",
                  flush=True)

    # ── normalize-lite: provenance + counting keys; S2 owns the real pass ───
    records = []
    for t, r in sorted(seen_titles.items()):
        rec = dict(r)
        rec["source"] = SOURCE
        rec["source_url"] = API
        rec["captured"] = CAPTURED
        rec["company"] = (r.get("AccountName") or "").strip() or None
        rec["website"] = (r.get("Website") or "").strip() or None
        rec["domain"] = apex(rec["website"])
        rec["email"] = (r.get("Email") or "").strip() or None
        rec["phone_raw"] = (r.get("Phone1") or "").strip() or None
        rec["phone_10"] = digits(r.get("Phone1"))
        rec["is_us"] = (str(r.get("Country") or "").strip().upper()
                        in ("USA", "US", "UNITED STATES"))
        rec["industries_seen_in"] = "|".join(r.get("industries_seen_in", []))
        records.append(rec)

    stats = report(SOURCE, records,
                   code_fields=("Industries", "Category", "Region",
                                "finalIsDefault"))
    # company-level rollup (items → companies)
    comp = {}
    for r in records:
        k = norm_company(r.get("company"))
        if k:
            comp.setdefault(k, []).append(r)
    with_domain = {k for k, rs in comp.items() if any(x["domain"] for x in rs)}
    stats["cms_items"] = len(records)
    stats["distinct_companies"] = len(comp)
    stats["companies_with_domain"] = len(with_domain)
    stats["hq_fallback_rows_dropped"] = hq_hits
    stats["location_limited"] = location_limited
    stats["anchors_used"] = anchors
    print(f"\nitems={len(records)} companies={len(comp)} "
          f"with_domain={len(with_domain)}")

    # net-new vs the current master, if it is where the E4 work left it
    import csv
    import os
    master = os.path.join(_polite.ROOT, "data", "deduped-v7.csv")
    if os.path.exists(master):
        have = set()
        with open(master, newline="", encoding="utf-8", errors="ignore") as fh:
            for row in csv.DictReader(fh):
                d = apex(row.get("domain") or row.get("website") or "")
                if d:
                    have.add(d)
        new_domains = {apex(r["website"]) for r in records if r["website"]}
        new_domains.discard(None)
        stats["net_new_domains_vs_deduped_v7"] = len(new_domains - have)
        print(f"net-new domains vs deduped-v7: "
              f"{stats['net_new_domains_vs_deduped_v7']} of {len(new_domains)}")
    else:
        stats["net_new_domains_vs_deduped_v7"] = "deduped-v7.csv not found"

    write_raw(SOURCE, {
        "source_name": "Samson Rope find-a-distributor API",
        "source_url": API,
        "locator_page": PAGE,
        "method": "GET per (industry GUID × anchor city); calibration first "
                  "(one industry, two far anchors) to detect whether the API "
                  "is location-limited; CMS items deduped on Title; Samson's "
                  "own HQ fallback rows detected by name and dropped.",
        "authorization": "GATE R-L1 signed by Artur 2026-08-04 — 'Continue, "
                         "build anything needed to get as much as possible' "
                         "(linecard-locators log). robots: Allow: / — no "
                         "override involved.",
        "robots_check": "www.samsonrope.com/robots.txt: `Allow: /` (verdict "
                        "in linecard-evidence-2026-08-03.json).",
        "industry_filter_verbatim": [
            {"label": c, "id": g} for c, g in INDUSTRIES],
        "vertical_code_note": "Industries/Category are Samson's own vertical "
                              "codes; captured verbatim, untested for sort — "
                              "marine verticals (Commercial Fishing, "
                              "Recreational Marine, Mooring, Tug…) are "
                              "presumptively off-ICP and must be sorted "
                              "before any seating (§5i).",
        "per_query": per_query,
        "origin_requests": f.origin_requests,
        "stats": stats,
    }, records)


if __name__ == "__main__":
    main()
