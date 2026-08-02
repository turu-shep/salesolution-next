#!/usr/bin/env python3
"""Measure the line-card harvest. Reads the cache, never the network.

Reports the numbers that decide whether Angle 2 has an evidence base:
  * coverage: how many domains yielded a line-card page
  * the brands-per-dealer distribution (0 / 1 / 2-4 / 5-9 / 10+)
  * how many companies now carry brand_authorized >= 2, against the 8 S2 measured
  * HTML vs PDF split, 403 and failure counts
  * `--sample N` prints N random (domain, brand, surrounding text) extractions
    for hand verification -- precision must be measured, never assumed.
"""
import argparse
import collections
import json
import os
import random
import sys

CAPTURED = "2026-08-01"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ENRICH = os.path.join(ROOT, "data", "enrichment")


def bucket(n):
    if n == 0:
        return "0"
    if n == 1:
        return "1"
    if n <= 4:
        return "2-4"
    if n <= 9:
        return "5-9"
    return "10+"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sample", type=int, default=0)
    ap.add_argument("--seed", type=int, default=20260801)
    ap.add_argument("--examples", type=int, default=0)
    args = ap.parse_args()

    with open(os.path.join(ENRICH, f"linecards-{CAPTURED}.json")) as f:
        payload = json.load(f)
    recs = payload["records"]
    n = len(recs)

    print(f"=== LINE-CARD HARVEST  captured {CAPTURED} ===")
    print(f"target set              : {payload['target_count']}")
    print(f"attempted               : {n}"
          f"   ({n / payload['target_count'] * 100:.1f}% coverage)"
          f"{'   [PARTIAL RUN]' if payload.get('partial') else ''}")

    with_page = [r for r in recs if r.get("linecard_url")]
    with_brands = [r for r in recs if r["brand_count"] > 0]
    from_lc = [r for r in recs if r.get("brands_from") == "linecard"]
    from_home = [r for r in recs if r.get("brands_from") in ("homepage", "homepage-pdf")]

    print(f"\n-- line-card pages")
    print(f"page found              : {len(with_page)}  "
          f"({len(with_page) / n * 100:.1f}% of attempted)")
    print(f"  and it named brands   : {len(from_lc)}")
    print(f"  page found, 0 brands  : {len(with_page) - len(from_lc)}")
    print(f"no page (null result)   : {n - len(with_page)}")
    print(f"brands off homepage only: {len(from_home)}")
    print(f"ANY brand evidence      : {len(with_brands)}  "
          f"({len(with_brands) / n * 100:.1f}%)")

    kinds = collections.Counter(r.get("linecard_kind") for r in with_page)
    print(f"\n-- HTML vs PDF (of {len(with_page)} pages found)")
    for k, c in kinds.most_common():
        print(f"  {str(k):6}: {c}")
    pdf_brands = [r for r in from_lc if r.get("linecard_kind") == "pdf"]
    print(f"  PDFs that yielded brands: {len(pdf_brands)}")

    print(f"\n-- BRANDS PER DEALER (all {n} attempted)")
    dist = collections.Counter(bucket(r["brand_count"]) for r in recs)
    for b in ["0", "1", "2-4", "5-9", "10+"]:
        c = dist.get(b, 0)
        print(f"  {b:>4} brands : {c:5}  ({c / n * 100:5.1f}%)  "
              f"{'#' * int(c / n * 50)}")
    counts = [r["brand_count"] for r in recs]
    nz = [c for c in counts if c]
    print(f"  mean over all        : {sum(counts) / n:.2f}")
    if nz:
        print(f"  mean where >0        : {sum(nz) / len(nz):.2f}")
    lc_counts = [r["brand_count"] for r in from_lc]
    if lc_counts:
        print(f"  mean on a line-card page: {sum(lc_counts) / len(lc_counts):.2f}"
              f"   max {max(lc_counts)}")

    ge2 = [r for r in recs if r["brand_count"] >= 2]
    print(f"\n-- THE NUMBER THAT DECIDES ANGLE 2")
    print(f"  brand_authorized >= 2 : {len(ge2)}   (S2 measured 8)")
    print(f"  >= 2 from a line-card page: "
          f"{sum(1 for r in ge2 if r.get('brands_from') == 'linecard')}")
    print(f"  >= 3                  : {sum(1 for r in recs if r['brand_count'] >= 3)}")
    print(f"  >= 5                  : {sum(1 for r in recs if r['brand_count'] >= 5)}")

    print(f"\n-- fetch outcomes")
    refused = [r for r in recs if r.get("refused")]
    codes = collections.Counter()
    for r in recs:
        for a in r.get("attempts", []):
            if a.get("status") in (401, 403, 429, 451):
                codes[a["status"]] += 1
    print(f"  domains abandoned on refusal : {len(refused)}")
    for c, k in codes.most_common():
        print(f"    HTTP {c} responses : {k}")
    conn = sum(1 for r in recs if r.get("homepage_status") is None
               and not r.get("refused"))
    print(f"  homepage unreachable (DNS/TLS/timeout) : {conn}")
    print(f"  homepage 200 : "
          f"{sum(1 for r in recs if r.get('homepage_status') == 200)}")
    other = collections.Counter(r.get("homepage_status") for r in recs
                                if r.get("homepage_status") not in (200, None))
    print(f"  homepage other statuses : {dict(other.most_common(8))}")

    top = collections.Counter()
    for r in recs:
        top.update(r["brands"])
    print(f"\n-- top 25 brands extracted ({len(top)} distinct canonicals seen)")
    print("  " + ", ".join(f"{b} {c}" for b, c in top.most_common(25)))

    if args.examples:
        print(f"\n-- deepest line cards")
        for r in sorted(from_lc, key=lambda r: -r["brand_count"])[:args.examples]:
            print(f"  {r['domain']}  ({r['brand_count']}) {r['linecard_url']}")
            print(f"     {', '.join(r['brands'])}")

    if args.sample:
        rnd = random.Random(args.seed)
        pool = [(r, b) for r in recs if r["brand_count"] for b in r["brands"]]
        picks = rnd.sample(pool, min(args.sample, len(pool)))
        out = []
        for r, b in picks:
            out.append({"domain": r["domain"], "brand": b,
                        "source_url": r["source_url"],
                        "brands_from": r.get("brands_from"),
                        "kind": r.get("linecard_kind")})
        path = os.path.join(ENRICH, f"_precision-sample-{CAPTURED}.json")
        with open(path, "w") as f:
            json.dump({"seed": args.seed, "pool_size": len(pool),
                       "n": len(out), "picks": out}, f, indent=1)
        print(f"\n-- precision sample: {len(out)} of {len(pool)} "
              f"(domain,brand) pairs -> {path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
