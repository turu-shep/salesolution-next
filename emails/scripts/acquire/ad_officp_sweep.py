#!/usr/bin/env python3
"""S1 raw acquisition — AD member locator, off-ICP divisions, metros 51-150.

GATE:HUMAN cleared 2026-08-03: Artur answered "in scope — run the sweep now"
to `ad [*]/01-prompt.md` step 3's question. This sweeps the five off-ICP
divisions that were never taken past metro 50:

    ESD (electrical) · PLBG (plumbing) · HVAC · GSD (gypsum) · WWD (waterworks)

BSDC is excluded (6 distinct companies in the whole top-50 sweep — noise), and
DBP / ISC stay excluded (server-side 404 on every query, AD's own dead codes).

5 divisions x 100 metros = 500 queries, stated before the run; no extension
clause. Nothing billed — polite GETs >= 3s/host, single worker, cache-first,
hard stop on 403 (ad_full_sweep.fetch, reused verbatim). Metro list is
ad_expansion.py's METROS (51-150), imported, not copied.

RAW ACQUISITION ONLY. S2 owns normalize/dedupe; on fold-in these rows route by
division to pool-adjacent-trades unless the segment definition changes.
"""
import csv
import importlib.util
import json
import os
import re
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))


def _load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, f"{name}.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


ad = _load("ad_full_sweep")
exp = _load("ad_expansion")

CAPTURED = "2026-08-03"
ad.CAPTURED = CAPTURED  # parse() stamps records from the module global
RAW = ad.RAW
CACHE = ad.CACHE
METROS = exp.METROS  # metros 51-150, the expansion's exact list

DIVISIONS = {
    "ESD": "Electrical",
    "PLBG": "Plumbing",
    "HVAC": "HVAC",
    "GSD": "Gypsum Supply",
    "WWD": "Waterworks",
}

SUFFIX = re.compile(r"\b(inc|llc|corp|co|company|ltd|the)\b")


def loose_norm(name):
    if not name:
        return None
    s = re.sub(r"[^a-z0-9]+", " ", name.lower().replace(".", ""))
    s = SUFFIX.sub(" ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s or None


def prior_distinct():
    names = set()
    for fname in ("ad-2026-08-01.csv", "ad-expansion-2026-08-01.csv",
                  "ad-gridprobe-2026-08-03.csv"):
        path = os.path.join(RAW, fname)
        if not os.path.exists(path):
            continue
        with open(path, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                names.add(loose_norm(row["company"]))
    names.discard(None)
    return names


def main():
    os.makedirs(CACHE, exist_ok=True)
    prior = prior_distinct()
    print(f"prior AD distinct (loose norm, all runs): {len(prior)}")

    records, stats, seen, seen_new = [], [], set(), set()
    fetched = 0
    t0 = time.time()
    total = len(DIVISIONS) * len(METROS)
    n = 0
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
                nn = loose_norm(r["company"])
                if nn:
                    seen.add(nn)
                    if nn not in prior:
                        seen_new.add(nn)
            records.extend(recs)
            stats.append({"division": div, "metro": metro, "rows": len(recs),
                          "cached": cached})
            if not cached:
                fetched += 1
                time.sleep(ad.DELAY)
            if n % 50 == 0 or n == total:
                print(f"[{n}/{total}] {div}/{metro} rows={len(recs)} "
                      f"raw={len(records)} distinct={len(seen)} "
                      f"net_new={len(seen_new)} fetched={fetched} "
                      f"elapsed={time.time()-t0:.0f}s", flush=True)

    os.makedirs(RAW, exist_ok=True)
    payload = {
        "source": "ad",
        "source_name": ("Affiliated Distributors member locator — off-ICP "
                        "divisions (ESD/PLBG/HVAC/GSD/WWD), metros 51-150"),
        "captured": CAPTURED,
        "base_url": ad.BASE,
        "divisions": DIVISIONS,
        "metros": METROS,
        "metro_rank_band": "51-150",
        "gate": "GATE:HUMAN cleared 2026-08-03 — Artur: in scope, run now",
        "queries_planned": total,
        "queries_completed": len(stats),
        "requests_to_origin": fetched,
        "distinct_in_pull": len(seen),
        "net_new_distinct_vs_all_prior": len(seen_new),
        "per_query": stats,
        "records": records,
    }
    with open(os.path.join(RAW, f"ad-officp-{CAPTURED}.json"), "w") as f:
        json.dump(payload, f, indent=1)

    cols = list(records[0].keys()) if records else []
    with open(os.path.join(RAW, f"ad-officp-{CAPTURED}.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(records)
    print(f"\nDONE raw_records={len(records)} queries={len(stats)} "
          f"origin_requests={fetched} distinct={len(seen)} "
          f"net_new={len(seen_new)} elapsed={time.time()-t0:.0f}s")


if __name__ == "__main__":
    try:
        main()
    except ad.Blocked as e:
        print(f"\nBLOCKED: {e}", file=sys.stderr)
        sys.exit(2)
