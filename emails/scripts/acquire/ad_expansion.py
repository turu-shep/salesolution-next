#!/usr/bin/env python3
"""S1 raw acquisition — AD member locator, metros 51-150, ICP divisions only.

Rationale (01-build-plan.md 2a): AD's yield curve did NOT flatten — the last 10
of the first 50 metros still added 255 companies (14.9%). The constraint is AD's
fixed 50-mile search radius, not a result cap. But only BPT + PVF + ISD are
ICP-shaped (493 of 1,712 distinct companies), so the efficient extension is
3 divisions x 100 new metros = 300 requests, not 9 x 100.

DBP and ISC are invalid server-side codes (404 always) — excluded, not retried.

Reuses ad_full_sweep.py's proven fetch/parse pattern verbatim by import. Same
cache dir; the first 50 metros' responses are already on disk under different
keys, so nothing is re-fetched and nothing is clobbered.

RAW ACQUISITION ONLY. S2 owns normalize/dedupe.
"""
import csv
import importlib.util
import json
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location(
    "ad_full_sweep", os.path.join(HERE, "ad_full_sweep.py"))
ad = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ad)

CAPTURED = "2026-08-01"
RAW = ad.RAW
CACHE = ad.CACHE

# The three ICP-shaped divisions only.
DIVISIONS = {
    "BPT": "Bearings & Power Transmission",
    "PVF": "Pipe, Valves & Fittings",
    "ISD": "Industrial, Safety and Construction",
}

# US metropolitan areas ranked 51-150 by population, continuing the top-50 grid
# already swept in ad_full_sweep.py. No overlap with that list.
METROS = [
    "Rochester, NY", "Grand Rapids, MI", "Tucson, AZ", "Honolulu, HI", "Tulsa, OK",
    "Fresno, CA", "Worcester, MA", "Omaha, NE", "Bridgeport, CT", "Greenville, SC",
    "Albuquerque, NM", "Bakersfield, CA", "Albany, NY", "Knoxville, TN", "McAllen, TX",
    "Baton Rouge, LA", "El Paso, TX", "New Haven, CT", "Allentown, PA", "Oxnard, CA",
    "Columbia, SC", "Sarasota, FL", "Dayton, OH", "Charleston, SC", "Greensboro, NC",
    "Cape Coral, FL", "Little Rock, AR", "Stockton, CA", "Colorado Springs, CO",
    "Boise, ID", "Des Moines, IA", "Lakeland, FL", "Madison, WI", "Ogden, UT",
    "Winston-Salem, NC", "Deltona, FL", "Syracuse, NY", "Provo, UT", "Wichita, KS",
    "Springfield, MA", "Toledo, OH", "Durham, NC", "Augusta, GA", "Palm Bay, FL",
    "Akron, OH", "Jackson, MS", "Harrisburg, PA", "Chattanooga, TN", "Scranton, PA",
    "Spokane, WA", "Youngstown, OH", "Portland, ME", "Lancaster, PA",
    "Fayetteville, AR", "Lansing, MI", "Lexington, KY", "Pensacola, FL",
    "Corpus Christi, TX", "Fort Wayne, IN", "Santa Rosa, CA", "Reno, NV",
    "Huntsville, AL", "Port St. Lucie, FL", "Fayetteville, NC", "Asheville, NC",
    "Visalia, CA", "Springfield, MO", "Killeen, TX", "Vallejo, CA", "York, PA",
    "Salinas, CA", "Savannah, GA", "Rockford, IL", "Salem, OR", "Mobile, AL",
    "Naples, FL", "Peoria, IL", "Montgomery, AL", "Eugene, OR", "Shreveport, LA",
    "Trenton, NJ", "Tallahassee, FL", "Ann Arbor, MI", "Hickory, NC",
    "Green Bay, WI", "Fort Collins, CO", "Wilmington, NC", "Evansville, IN",
    "Kalamazoo, MI", "Lafayette, LA", "Waco, TX", "Beaumont, TX", "Ocala, FL",
    "Manchester, NH", "Lubbock, TX", "Anchorage, AK", "South Bend, IN",
    "Roanoke, VA", "Gulfport, MS", "Davenport, IA",
]


def main():
    os.makedirs(CACHE, exist_ok=True)
    records, stats = [], []
    fetched = 0
    t0 = time.time()
    total = len(DIVISIONS) * len(METROS)
    n = 0
    try:
        for div in DIVISIONS:
            for metro in METROS:
                n += 1
                body, cached = ad.fetch(div, metro)
                if body is None:
                    stats.append({"division": div, "metro": metro, "rows": None,
                                  "status": "failed"})
                    continue
                recs = ad.parse(body, div, metro)
                for r in recs:
                    r["metro_rank_band"] = "51-150"
                records.extend(recs)
                stats.append({"division": div, "metro": metro, "rows": len(recs),
                              "capped": len(recs) >= 16, "cached": cached})
                if not cached:
                    fetched += 1
                    time.sleep(ad.DELAY)
                if n % 25 == 0 or n == total:
                    print(f"[{n}/{total}] {div}/{metro} rows={len(recs)} "
                          f"raw={len(records)} fetched={fetched} "
                          f"elapsed={time.time()-t0:.0f}s", flush=True)
    except ad.Blocked as e:
        print(f"\nBLOCKED: {e}", file=sys.stderr)

    os.makedirs(RAW, exist_ok=True)
    payload = {
        "source": "ad",
        "source_name": "Affiliated Distributors member locator — metros 51-150, ICP divisions",
        "captured": CAPTURED,
        "base_url": ad.BASE,
        "divisions": DIVISIONS,
        "metros": METROS,
        "metro_rank_band": "51-150",
        "queries_planned": total,
        "queries_completed": len(stats),
        "requests_to_origin": fetched,
        "per_query": stats,
        "records": records,
    }
    with open(os.path.join(RAW, f"ad-expansion-{CAPTURED}.json"), "w") as f:
        json.dump(payload, f, indent=1)

    cols = list(records[0].keys()) if records else []
    with open(os.path.join(RAW, f"ad-expansion-{CAPTURED}.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(records)
    print(f"\nDONE raw_records={len(records)} queries={len(stats)} "
          f"origin_requests={fetched} elapsed={time.time()-t0:.0f}s")


if __name__ == "__main__":
    main()
