#!/usr/bin/env python3
"""bobcat — THE NATIONAL SWEEP. Separate file because it had to be EARNED.

`bobcat.py` is the three-metro probe and it is bounded in code. This file is the
sweep, and it exists only because the probe passed the decision rule it inherited
from E4 (`e4-headless-locators/00-README.md`), measured 2026-08-04:

  - **leg 1 — >=150 projected net-new companies WITHIN the size band: PASS.**
    59 in-band net-new domains observed inside the three 100 mi circles; the
    circles hold 2,264 of deduped-v7's 14,284 geocoded rows = 15.85%; 59 / 0.1585
    = **372 projected nationally**, which is what authorised this sweep. Re-run
    afterwards with the fuller field list it measures 65 -> 410; the extra six
    are dealers whose website only appears once `sfwebsite` is requested
    explicitly. Either figure clears 150 by >2x. Stated as an UPPER bound, for
    the reason in
    `_eq_sizeband.py` §2: a cluster measured inside three circles is a LOWER
    bound on that group's national footprint, so the in-band count — and every
    number derived from it — is biased optimistic.
  - **leg 2 — a tier code OR a per-record line card: PASS, on the line card.**
    `account_contract_code_names` is populated on 100% of records and carries 29
    distinct value-sets in the probe (Bobcat product programs the dealer is
    contracted for). `bobc_accountproduct_dict` sorts too, at 28.

Keeping the sweep in its own file is the point: the probe cannot silently grow
into a sweep, and anyone reading `bobcat.py` sees a bounded probe rather than
something that might page the national index depending on a flag.

## What it costs, stated before it runs

The Coveo pipeline `Dealer Locator NA Search` returns **15 results per request
regardless of `numberOfResults`**, and the index holds **2,701** dealer records.
So the sweep is `ceil(2701/15) = 181` requests, paced >=3s = **roughly 10
minutes of wall clock**. That is the whole bill. Nothing is billed to a vendor;
this is origin load only.

It walks `firstResult` straight through the index. Two partition schemes were
tried and rejected first, and `sweep()`'s docstring records why — the short
version is that `@sfbillingstate` is queryable but not facetable, and a
state-partitioned sweep drops every record with a blank billing state. Deep
paging was verified at `firstResult=2000` before being committed to, because
Coveo indexes commonly refuse offsets past ~1,000 and a refusal mid-sweep would
leave a half-list with no way to tell which half was missing.

## Posture

Unchanged and inherited: one worker, >=3s per host, honest desktop UA never
rotated, every response cached so a re-run costs zero, 401/403 stops the source
with no bypass, deterministic 4xx terminal on the first attempt, and `source` /
`source_url` / `captured` on every record.

**Robots: no override involved.** `bobcatproduction10bzen8ct.org.coveo.com`
publishes `Allow: /rest/search` above a bare `Disallow: /`; longest match wins
(RFC 9309 §2.2.2), so the data path is explicitly allowed. Full per-host table in
`bobcat.py`.

## ⚠ THE SORT TRAP — a SECOND silent zero, found 2026-08-04 on this same pipeline

`bobcat.py` records that supplying any `context` object returns `totalCount: 0`
with a clean HTTP 200. **`sortCriteria` does exactly the same thing on a
non-sortable field.** Measured, four requests:

    sortCriteria "@sfid ascending"          -> HTTP 200, totalCount 0, 0 results
    sortCriteria "@permanentid ascending"   -> HTTP 200, totalCount 0, 0 results
    sortCriteria "date ascending"           -> HTTP 200, totalCount 2701, 15 rows
    sortCriteria "nosort"                   -> HTTP 200, totalCount 2701, 15 rows

No error, no warning, no `exception` key — the same "no dealers found" shape.
So the rule generalises past `context`: **on this pipeline a wrong parameter
value is answered with an empty result set, not an error.** Any zero from this
index has to be re-tested against a known-good payload before it is written down.

## Why the sweep is SORTED

The first (unsorted) walk drifted. Relevancy sort with `q: ""` gives every
document the same score, so the tie-break is arbitrary and the result list
re-orders between requests: **6 page-boundary duplicates in the first 63 pages**
(e.g. `MCCLUNG-LOGAN EQUIPMENT CO` was row 14 of `firstResult=690` and row 0 of
`firstResult=705`). A duplicate at a boundary is the visible half of the problem;
the invisible half is that the same drift **skips** records, and a census that
silently drops rows is worth less than one that admits it.

`date ascending` is near-deterministic here — 1,062 distinct timestamps across
1,230 sampled rows, largest tie 7 — so drift can only happen inside a tie group.
The sweep pages the sorted axis, and additionally **unions in the 63 unsorted
pages already on disk at zero cost**: they are a different ordering of the same
unfiltered index, so anything the sorted walk skips has a second chance to appear.
Coverage is then reported as `distinct_by_source_id` against `totalCount`, and a
shortfall is reported as a shortfall.

## What this file does NOT do

**No fold-in.** It writes `data/raw/bobcat-national-2026-08-04.json` and `.csv`
and stops. It never touches `lists/` or `data/side-pools/` — a parallel session
owns the domain-resolution run and a concurrent write there would collide.
"""
import base64
import csv
import glob
import json
import os
import re
import sys
import time

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _eq_sizeband as SB  # noqa: E402
import _polite  # noqa: E402
from _polite import Blocked  # noqa: E402

_polite.CAPTURED = "2026-08-04"

import bobcat as B  # noqa: E402
from caseih import report  # same measured report, same definitions  # noqa: E402

SOURCE = "bobcat-national"
CACHE_SOURCE = "bobcat"        # share the probe's cache; re-runs cost zero
PAGE_SIZE = B.PAGE_SIZE        # 15, forced by the pipeline
MAX_ORIGIN_REQUESTS = 250      # hard cap for this run. 181 pages + diagnostics.

# See the header: a non-sortable field here returns a SILENT ZERO, not an error.
# `date ascending` is the one field-based sort measured to hold totalCount=2701.
SORT_CRITERIA = "date ascending"
CACHE_PREFIX = "natdate"       # sorted walk. `national-*` is the older unsorted one.
LEGACY_PREFIX = "national"     # unsorted pages already on disk — unioned for free.

# The token is a 24h anonymous JWT. Re-mint if less than this is left, so the
# sweep never trips a 401 (which is terminal by policy) for a reason that is
# merely clock. The value is never printed, logged or written to a record.
TOKEN_MIN_REMAINING_S = 1800


def token_seconds_left(token):
    """Seconds until the anonymous JWT expires. Reads `exp` only."""
    try:
        body = token.split(".")[1]
        body += "=" * (-len(body) % 4)
        claims = json.loads(base64.urlsafe_b64decode(body))
        return int(claims.get("exp", 0) - time.time())
    except Exception:  # noqa: BLE001 — an unreadable token is simply re-minted
        return -1


def fresh_token(f):
    """Return a token with real life left on it, re-minting if the cached one is
    stale. Deletes only the cached token body, never any data page."""
    token, _ = B.get_token(f)
    left = token_seconds_left(token)
    if left < TOKEN_MIN_REMAINING_S:
        print(f"  token has {left}s left — re-minting (value never recorded)")
        try:
            os.remove(os.path.join(f.cache, "token.json"))
        except OSError:
            pass
        token, _ = B.get_token(f)
        left = token_seconds_left(token)
    print(f"  token OK, {left}s remaining (value never recorded)")
    return token


def load_legacy_unsorted():
    """Rows from the earlier UNSORTED walk, straight off disk. Zero requests.

    Same endpoint, same unfiltered query, different sort — so this is a second
    ordering of the same index and it covers some of what a drifting sorted walk
    may skip. It is unioned, never counted separately.
    """
    rows = []
    pat = os.path.join(_polite.RAW, "_cache", CACHE_SOURCE, f"{LEGACY_PREFIX}-*.json")
    for path in sorted(glob.glob(pat)):
        if not re.search(rf"{LEGACY_PREFIX}-\d+\.json$", path):
            continue
        try:
            with open(path, encoding="utf-8") as fh:
                data = json.load(fh)
        except Exception:  # noqa: BLE001
            continue
        for r in data.get("results") or []:
            rows.append(B.to_record(r, "national:legacy-unsorted", B.SEARCH_URL))
    return rows


def sweep(f, token):
    """Walk the whole index by `firstResult`, PAGE_SIZE rows at a time.

    ⚠ **Two partition strategies were tried first and both are recorded because
    the failures are the useful part.**

    1. `groupBy` on `@sfbillingstate` — returns `values: []`. The field is
       *queryable* but not *facetable* in this index, so it cannot produce per-state
       counts. A sweep planned off that empty result would have swept nothing and
       reported "0 states" as if it were a finding, which is exactly what happened
       on the first run of this file.
    2. Per-state `aq` — this DOES work (`@sfbillingstate=="TX"` returns 105), but
       it needs a state list we would have to assume rather than measure, and any
       record with a blank billing state is invisible to it. Measured: the field
       is blank on some records, so a state-partitioned sweep silently drops them.

    Straight `firstResult` paging avoids both problems. It was verified to work
    at depth before committing to it — `firstResult=2000` returns a full page,
    so this index does not impose the ~1,000-offset refusal that Coveo indexes
    commonly do.
    """
    hdrs = {"Authorization": f"Bearer {token}", "Referer": B.PAGE}
    records, log, first, total = [], [], 0, None
    prev_tail, drift = set(), []
    while True:
        if f.origin_requests >= MAX_ORIGIN_REQUESTS:
            print(f"  BUDGET STOP at {MAX_ORIGIN_REQUESTS} origin requests — "
                  "the sweep is INCOMPLETE and is recorded as incomplete")
            return records, log, total, True, drift
        payload = {"q": "", "searchHub": B.SEARCH_HUB, "sortCriteria": SORT_CRITERIA,
                   "numberOfResults": PAGE_SIZE, "firstResult": first}
        try:
            data, cached = f.post_json(B.SEARCH_URL,
                                       f"{CACHE_PREFIX}-{first}.json",
                                       payload, headers=hdrs)
        except Blocked as e:
            print(f"  BLOCKED at firstResult={first} — {e}")
            log.append({"firstResult": first, "blocked": str(e)})
            return records, log, total, True, drift
        page = data.get("results") or []
        total = data.get("totalCount")
        # ⚠ A zero here is NOT evidence of an empty index — on this pipeline it is
        # the shape a wrong parameter produces. Say so loudly rather than writing
        # a short list and calling it a census.
        if total == 0:
            print("  ⚠ totalCount==0 on a payload that returned 2701 before — "
                  "this is the SILENT-ZERO shape, not an empty index. STOPPING.")
            log.append({"firstResult": first, "silent_zero": True})
            return records, log, total, True, drift

        ids = [(r.get("raw") or {}).get("sfid") for r in page]
        overlap = prev_tail & set(ids)
        if overlap:
            drift.append({"firstResult": first, "repeated_ids": sorted(overlap)})
        prev_tail = set(ids[-3:])

        records.extend(B.to_record(r, f"national:{first}", B.SEARCH_URL)
                       for r in page)
        log.append({"firstResult": first, "returned": len(page),
                    "totalCount": total, "cached": cached})
        first += len(page)
        if first % 300 == 0 or not page:
            print(f"  firstResult={first:>5} of {total}  "
                  f"({len(records)} records, {len(drift)} drift events, "
                  f"{f.origin_requests} live reqs)", flush=True)
        if not page or (total is not None and first >= total):
            break
    return records, log, total, False, drift


def main():
    deduped = SB.load_deduped()
    print(f"baseline: deduped-v7.csv, {len(deduped)} data rows, domain-keyed")
    print(f"robots: {B.ROBOTS_VERDICT}\n")
    print("THIS IS THE EARNED NATIONAL SWEEP. Probe verdict 2026-08-04: "
          "leg 1 PASS (372 projected in-band net-new, upper bound), "
          "leg 2 PASS (per-record line card `account_contract_code_names`).\n")

    f = B.JsonPostFetcher(CACHE_SOURCE, min_bytes=2)
    try:
        token = fresh_token(f)
    except Blocked as e:
        print(f"TOKEN BLOCKED — {e}")
        return
    records, log, total, budget_stop, drift = sweep(f, token)
    if not records:
        print("no records — nothing to write")
        return

    sorted_rows = len(records)
    legacy = load_legacy_unsorted()
    print(f"\nsorted walk: {sorted_rows} rows  |  legacy unsorted pages on disk: "
          f"{len(legacy)} rows (0 requests)")

    # De-dupe on the source's own stable ids before measuring anything. The
    # sorted walk goes first so its `probe_metro` provenance wins on ties.
    seen, uniq = set(), []
    from_legacy = 0
    for r in records + legacy:
        key = r.get("sfid_raw") or r.get("sfmdm_id_raw") or r.get("dealer_uri_raw") \
            or (r.get("company"), r.get("address_1"))
        if key in seen:
            continue
        seen.add(key)
        uniq.append(r)
        if r.get("probe_metro") == "national:legacy-unsorted":
            from_legacy += 1
    print(f"rows fetched: {len(records) + len(legacy)}  |  distinct by source id: "
          f"{len(uniq)}  |  recovered only from the legacy ordering: {from_legacy}")
    if total and len(uniq) < total:
        print(f"⚠ COVERAGE SHORTFALL: {len(uniq)} distinct of totalCount={total} "
              f"— {total - len(uniq)} records were never returned by either "
              f"ordering. Reported as a shortfall, not rounded away.")

    for r in uniq:
        m = SB.in_any_metro(r.get("lat"), r.get("lng"))
        r["in_probe_circle"] = bool(m)
        r["probe_circle"] = m

    code_fields = tuple(f"{c}_raw" for c in B.CODE_FIELDS_SRC)
    groups, unresolvable, meta = SB.apply_size_band(uniq, code_fields=code_fields)
    report(SOURCE, uniq, groups, meta, deduped, code_fields)

    bands_clu = {}
    for rows in groups.values():
        b = rows[0]["size_band"]
        bands_clu[b] = bands_clu.get(b, 0) + 1

    complete = (total is not None and len(uniq) >= total and not budget_stop)
    payload = {
        "source_name": "Bobcat dealer locator (Coveo) — NATIONAL SWEEP",
        "locator_page": B.PAGE,
        "data_path": B.SEARCH_URL,
        "serving_host": f"{B.ORG}.org.coveo.com",
        "token_host": "bobcat.api.bobcat.com",
        "robots_verdict": B.ROBOTS_VERDICT,
        "robots_override_needed": False,
        "gates": {"ICP-EQ": "SIGNED Artur 2026-08-04 — 1–4-location tail only",
                  "per-OEM robots": "no override needed on any of the 3 hosts"},
        "why_this_sweep_ran": (
            "The three-metro probe cleared BOTH legs of the E4 decision rule on "
            "2026-08-04: 59 in-band net-new domains inside circles covering "
            "15.85% of the geocoded baseline => 372 projected nationally "
            "(>=150), and `account_contract_code_names` is a per-record line "
            "card populated on 100% of records. The projection is an UPPER "
            "bound — see _eq_sizeband.py §2 — and this sweep replaces it with a "
            "count."),
        "method": f"Straight `firstResult` paging over the whole index, "
                  f"{PAGE_SIZE} rows per request because the pipeline caps it "
                  f"there regardless of `numberOfResults`, sorted by "
                  f"`{SORT_CRITERIA}` so the walk is near-deterministic. The "
                  "unsorted (relevancy) ordering drifts: q:\"\" scores every "
                  "document equally, so ties re-order between requests and the "
                  "walk both duplicates and skips. The earlier unsorted pages "
                  "already on disk are unioned in at zero request cost as a "
                  "second ordering of the same index.",
        "silent_zero_trap": (
            "Measured 2026-08-04: `sortCriteria: \"@sfid ascending\"` and "
            "`\"@permanentid ascending\"` each return HTTP 200 with "
            "totalCount:0 and no error — the same silent-zero shape `context` "
            "produces. `date ascending` and `nosort` both hold totalCount:2701. "
            "A zero from this pipeline is a parameter bug until proven otherwise."),
        "size_band_filter": "designed BEFORE any sweep — `_eq_sizeband.py`",
        "coverage": {
            "index_total_count": total,
            "rows_fetched_sorted_walk": sorted_rows,
            "rows_read_from_legacy_unsorted_cache": len(legacy),
            "distinct_by_source_id": len(uniq),
            "recovered_only_from_legacy_ordering": from_legacy,
            "shortfall_vs_total_count": (total - len(uniq)) if total else None,
            "sweep_complete": complete,
            "stopped_by_budget": budget_stop,
            "page_boundary_drift_events": len(drift),
            "page_boundary_drift": drift,
            "partition": "none — straight `firstResult` paging over the whole "
                         "index. groupBy on @sfbillingstate returns no values "
                         "(queryable, not facetable) and a per-state `aq` sweep "
                         "would silently drop records with a blank billing "
                         "state. Deep paging was verified at firstResult=2000 "
                         "before this was committed to.",
        },
        "size_bands_clusters": bands_clu,
        "codes_captured_verbatim": list(code_fields),
        "requests": log,
        "origin_requests": f.origin_requests,
        "origin_request_budget": MAX_ORIGIN_REQUESTS,
        "no_fold_in": "This file writes raw only. It never touches lists/ or "
                      "data/side-pools/ — a parallel session owns the "
                      "domain-resolution run.",
    }
    path = os.path.join(_polite.RAW, f"{SOURCE}-{_polite.CAPTURED}.json")
    with open(path, "w", encoding="utf-8") as fh:
        json.dump({**payload, "records": uniq, "source": "bobcat",
                   "captured": _polite.CAPTURED}, fh, indent=1)
    print(f"raw -> {path}  ({len(uniq)} records)")

    cols = sorted({k for r in uniq for k in r})
    cpath = os.path.join(_polite.RAW, f"{SOURCE}-{_polite.CAPTURED}.csv")
    with open(cpath, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=cols)
        w.writeheader()
        w.writerows(uniq)
    print(f"csv -> {cpath}")
    print(f"\norigin requests this run: {f.origin_requests}")


if __name__ == "__main__":
    main()
