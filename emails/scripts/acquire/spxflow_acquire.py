#!/usr/bin/env python3
"""S1 raw acquisition — SPX FLOW distributor locator (MetaLocator, Itemid 18647).

Record endpoint discovered from the iframe's own JS:
  view=directory&task=search_zip&format=raw&no_html=1&layout=_json&postal_code=&radius=

Measured behaviour (2026-08-01), which differs from research/06's assumption:
  * `view=location&task=load&format=json` returns the 26 FIELD DEFINITIONS only,
    never records. That is what research/06 profiled.
  * `search_zip` with a lat,lng centre ignores radius and returns one fixed set
    of 41 rows for every centre tried.
  * `search_zip` with a real US ZIP is TERRITORY-matched and returns a different
    subset per ZIP. So the full set needs a ZIP grid, not a radius sweep.

Grid: one ZIP per state + DC (51) plus 50 secondary metro ZIPs = 101 queries.

RAW ACQUISITION ONLY — no dedupe, no filtering. S2 owns normalize/dedupe.
Pacing: >=3s between requests, single worker, every response cached to disk.
"""
import csv
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request

CAPTURED = "2026-08-01"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
HOST = "https://admin.metalocator.com/index.php"
ITEMID = "18647"
IFRAME = (f"{HOST}?option=com_locator&view=directory&layout=combined_bootstrap"
          f"&framed=1&tmpl=component&Itemid={ITEMID}")

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "data", "raw")
CACHE = os.path.join(RAW, "_cache", "spxflow")
DELAY = 3.0
BACKOFF = [15, 30, 60, 120]

# One ZIP per state + DC.
STATE_ZIPS = [
    ("AL", "35203"), ("AK", "99501"), ("AZ", "85004"), ("AR", "72201"), ("CA", "90001"),
    ("CO", "80202"), ("CT", "06103"), ("DE", "19801"), ("DC", "20001"), ("FL", "33101"),
    ("GA", "30303"), ("HI", "96813"), ("ID", "83702"), ("IL", "60601"), ("IN", "46204"),
    ("IA", "50309"), ("KS", "67202"), ("KY", "40202"), ("LA", "70112"), ("ME", "04101"),
    ("MD", "21201"), ("MA", "02101"), ("MI", "48226"), ("MN", "55401"), ("MS", "39201"),
    ("MO", "63101"), ("MT", "59101"), ("NE", "68102"), ("NV", "89101"), ("NH", "03101"),
    ("NJ", "07102"), ("NM", "87102"), ("NY", "10001"), ("NC", "28202"), ("ND", "58102"),
    ("OH", "44114"), ("OK", "73102"), ("OR", "97204"), ("PA", "19107"), ("RI", "02903"),
    ("SC", "29201"), ("SD", "57104"), ("TN", "37201"), ("TX", "77002"), ("UT", "84101"),
    ("VT", "05401"), ("VA", "23219"), ("WA", "98101"), ("WV", "25301"), ("WI", "53202"),
    ("WY", "82001"),
]

# Secondary metros, to catch sub-state (county / postal-code) territory splits.
METRO_ZIPS = [
    ("CA", "94105"), ("CA", "92101"), ("CA", "95814"), ("TX", "75201"), ("TX", "78205"),
    ("TX", "78701"), ("FL", "32801"), ("FL", "33602"), ("FL", "32202"), ("NY", "14202"),
    ("NY", "13202"), ("PA", "15222"), ("OH", "43215"), ("OH", "45202"), ("OH", "43604"),
    ("MI", "49503"), ("IL", "61602"), ("MO", "64106"), ("TN", "38103"), ("NC", "27601"),
    ("NC", "27401"), ("GA", "31401"), ("VA", "23510"), ("WA", "99201"), ("IN", "46601"),
    ("WI", "53703"), ("MN", "55802"), ("AL", "36602"), ("LA", "70801"), ("KY", "41011"),
    ("SC", "29601"), ("CO", "80903"), ("UT", "84601"), ("AZ", "85701"), ("NV", "89501"),
    ("OR", "97401"), ("IA", "52401"), ("KS", "66603"), ("AR", "72701"), ("MS", "39530"),
    ("OK", "74103"), ("NE", "68508"), ("NJ", "08608"), ("CT", "06510"), ("MA", "01103"),
    ("MD", "21701"), ("WV", "26101"), ("ID", "83201"), ("MT", "59801"), ("NM", "88001"),
]

GRID = STATE_ZIPS + METRO_ZIPS

# Fields carrying template/markup noise rather than data.
DROP = {"html", "map", "detail", "marker_options", "icon_markup", "address_format",
        "fulltext", "staticlink", "ml_zebra", "ml_number", "ml_offset", "number",
        "offset", "isdirty", "user_id", "reviewmonitoringenabled", "factualenabled",
        "tagmasksum", "marker", "marker_order"}


def search_url(zip_code):
    q = urllib.parse.urlencode({
        "option": "com_locator", "view": "directory", "force_link": "1",
        "tmpl": "component", "task": "search_zip", "framed": "1", "format": "raw",
        "no_html": "1", "templ[0]": "address_format", "layout": "_json",
        "Itemid": ITEMID, "postal_code": zip_code, "radius": "500",
    })
    return f"{HOST}?{q}"


def fetch(url, cache_name):
    path = os.path.join(CACHE, cache_name)
    if os.path.exists(path) and os.path.getsize(path) > 50:
        with open(path, encoding="utf-8", errors="ignore") as f:
            return f.read(), True
    for attempt in range(len(BACKOFF) + 1):
        req = urllib.request.Request(url, headers={
            "User-Agent": UA,
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": IFRAME,
        })
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                body = r.read().decode("utf-8", "ignore")
            with open(path, "w", encoding="utf-8") as f:
                f.write(body)
            return body, False
        except urllib.error.HTTPError as e:
            if e.code == 403:
                raise SystemExit(f"403 on {url} — stopping SPX FLOW, no bypass")
            wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
            print(f"  HTTP {e.code} -> backoff {wait}s", flush=True)
            time.sleep(wait)
        except Exception as e:
            wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
            print(f"  ERR {e!r} -> retry in {wait}s", flush=True)
            time.sleep(wait)
    return None, False


def main():
    os.makedirs(CACHE, exist_ok=True)
    os.makedirs(RAW, exist_ok=True)
    records, per_query = [], []
    seen_ids, saturation = set(), []
    requests_made = 0

    for i, (state, zip_code) in enumerate(GRID, 1):
        url = search_url(zip_code)
        body, cached = fetch(url, f"zip-{zip_code}.json")
        if not cached:
            requests_made += 1
        if body is None:
            per_query.append({"state": state, "zip": zip_code, "rows": None,
                              "status": "failed"})
            continue
        try:
            rows = json.loads(body)
        except Exception:
            per_query.append({"state": state, "zip": zip_code, "rows": None,
                              "status": "unparseable"})
            if not cached:
                time.sleep(DELAY)
            continue
        new = 0
        for r in rows:
            if r.get("id") not in seen_ids:
                new += 1
            seen_ids.add(r.get("id"))
            rec = {k: v for k, v in r.items() if k not in DROP}
            rec["query_state"] = state
            rec["query_zip"] = zip_code
            rec["source"] = "spxflow"
            rec["source_url"] = url
            rec["captured"] = CAPTURED
            records.append(rec)
        per_query.append({"state": state, "zip": zip_code, "rows": len(rows),
                          "new_ids": new, "cumulative_ids": len(seen_ids)})
        saturation.append({"query": i, "cumulative_ids": len(seen_ids)})
        print(f"[{i}/{len(GRID)}] {state} {zip_code}: rows={len(rows)} "
              f"new={new} cum_ids={len(seen_ids)}", flush=True)
        if not cached:
            time.sleep(DELAY)

    payload = {
        "source": "spxflow",
        "source_name": "SPX FLOW distributor locator (MetaLocator Itemid 18647)",
        "captured": CAPTURED,
        "iframe_url": IFRAME,
        "record_endpoint": search_url("<ZIP>"),
        "method": "territory-matched search_zip over a 101-ZIP US grid "
                  "(one per state + DC, plus 50 secondary metros)",
        "queries": len(GRID),
        "requests_to_origin": requests_made,
        "distinct_location_ids": len(seen_ids),
        "saturation": saturation,
        "per_query": per_query,
        "records": records,
    }
    with open(os.path.join(RAW, f"spxflow-{CAPTURED}.json"), "w") as f:
        json.dump(payload, f, indent=1)

    cols = sorted({k for r in records for k in r})
    with open(os.path.join(RAW, f"spxflow-{CAPTURED}.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(records)
    print(f"\nDONE raw_rows={len(records)} distinct_location_ids={len(seen_ids)} "
          f"origin_requests={requests_made}")


if __name__ == "__main__":
    main()
