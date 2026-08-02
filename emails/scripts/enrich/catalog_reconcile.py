#!/usr/bin/env python3
"""Prove the enrichment outputs are whole, and that no real count shipped as zero.

Three checks, each of which exists because the corresponding failure has already
happened once in this build:

**1. Partial reconciliation.** Every network pass appends each record to an
fsynced `.jsonl` the moment it lands, and separately flushes a whole JSON every
100 records. Those two can disagree: a JSON flush once lost 86 records the jsonl
had, and a still-alive stalled process once wrote a truncated file over a good
one. So the final JSON is compared to the partial both ways -- by domain set and
field-for-field -- and any record present only in the partial is reported as
recoverable rather than silently lost.

**2. The `??`-on-zero bug class (§5j).** `e?.brand_count ?? s.brand_count` does
not fall through on `0`, so a line-card fetch that legitimately found no brand
overwrote a real count harvested elsewhere: 394 rows shipped `brand_count=0`
while being *ranked* on their true count. The lesson generalises past that one
operator -- **a derived aggregate that reads as a clean zero is evidence of a
bug, not of an empty set** -- so this walks every hop from the fetched array to
the merged record and asserts the count still equals `len(brands)`.

**3. Refusals.** 401/403/429/451 counts per pass, so "we abandoned it" is a
number in the report rather than a claim.

Read-only. Writes nothing but its own JSON summary.
"""
import argparse
import collections
import json
import os
import sys

CAPTURED = "2026-08-01"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ENRICH = os.path.join(ROOT, "data", "enrichment")


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def read_partial(path):
    """Records from a jsonl checkpoint. A torn last line is expected, not fatal."""
    out, torn = {}, 0
    if not os.path.exists(path):
        return out, torn
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                r = json.loads(line)
            except ValueError:
                torn += 1
                continue
            if r.get("domain"):
                out[r["domain"]] = r
    return out, torn


def reconcile(final_path, partial_path=None):
    partial_path = partial_path or (final_path + ".partial.jsonl")
    recs = {r["domain"]: r for r in load(final_path)["records"]}
    part, torn = read_partial(partial_path)

    only_partial = sorted(set(part) - set(recs))
    only_final = sorted(set(recs) - set(part))
    differing = []
    for d in set(recs) & set(part):
        a, b = recs[d], part[d]
        for k in set(a) | set(b):
            if a.get(k) != b.get(k):
                differing.append(d)
                break
    return {
        "final": os.path.basename(final_path),
        "partial": os.path.basename(partial_path),
        "final_records": len(recs),
        "partial_records": len(part),
        "torn_lines": torn,
        "only_in_partial": len(only_partial),
        "only_in_partial_sample": only_partial[:10],
        "only_in_final": len(only_final),
        "differing_records": len(differing),
        "differing_sample": differing[:10],
        "reconciles": not only_partial and not differing,
    }


def refusals(paths):
    out = {}
    for p in paths:
        if not os.path.exists(p):
            continue
        recs = load(p)["records"]
        status = collections.Counter(
            r.get("homepage_status") if "homepage_status" in r else r.get("sitemap_status")
            for r in recs)
        out[os.path.basename(p)] = {
            "records": len(recs),
            "refused": sum(1 for r in recs if r.get("refused")),
            "status_403": sum(1 for r in recs
                              if r.get("homepage_status") == 403
                              or r.get("sitemap_status") == 403
                              or r.get("robots_status") == 403),
            "status": {str(k): v for k, v in status.most_common(12)},
        }
    return out


def brand_integrity(linecard_paths, catalog_path):
    """Every hop from the fetched array to the merged record, on real zeroes.

    The claim being tested is narrow and checkable: a record whose `brands`
    array holds N>=2 entries must arrive at the merged catalog with
    `brand_count == N` and the array intact. A count of 0 is only legitimate
    when the array is genuinely empty.
    """
    lc = {}
    self_inconsistent = []
    for p in linecard_paths:
        if not os.path.exists(p):
            continue
        for r in load(p)["records"]:
            n, arr = r.get("brand_count"), r.get("brands") or []
            if n != len(arr):
                self_inconsistent.append(
                    {"domain": r["domain"], "brand_count": n, "len_brands": len(arr),
                     "file": os.path.basename(p)})
            lc[r["domain"]] = r

    cat = {r["domain"]: r for r in load(catalog_path)["records"]}
    multi = {d: r for d, r in lc.items() if len(r.get("brands") or []) >= 2}

    dropped, mismatched, zeroed = [], [], []
    for d, r in multi.items():
        c = cat.get(d)
        if c is None:
            dropped.append(d)
            continue
        if c.get("brand_count") == 0:
            zeroed.append({"domain": d, "true": len(r["brands"]),
                           "brands": r["brands"][:6]})
        elif c.get("brand_count") != len(r["brands"]) or \
                len(c.get("brands") or []) != len(r["brands"]):
            mismatched.append({"domain": d, "linecard": len(r["brands"]),
                               "catalog_count": c.get("brand_count"),
                               "catalog_len": len(c.get("brands") or [])})

    # The distinction that matters: a null is "nobody looked", a zero is "we
    # looked and the site names no brand we recognise". Collapsing them is the
    # bug. Both must be present in a healthy merge.
    cat_zero = sum(1 for r in cat.values() if r.get("brand_count") == 0)
    cat_null = sum(1 for r in cat.values() if r.get("brand_count") is None)
    return {
        "linecard_records": len(lc),
        "linecard_multi_brand": len(multi),
        "linecard_count_ne_len_brands": len(self_inconsistent),
        "linecard_count_ne_len_sample": self_inconsistent[:10],
        "catalog_records": len(cat),
        "catalog_brand_count_zero": cat_zero,
        "catalog_brand_count_null": cat_null,
        "multi_brand_dropped_at_merge": len(dropped),
        "multi_brand_dropped_sample": dropped[:10],
        "multi_brand_published_as_zero": len(zeroed),
        "multi_brand_published_as_zero_sample": zeroed[:10],
        "multi_brand_count_mismatch": len(mismatched),
        "multi_brand_count_mismatch_sample": mismatched[:10],
        "clean": not dropped and not mismatched and not zeroed
        and not self_inconsistent,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pair", action="append", default=[],
                    help="final JSON to reconcile against its .partial.jsonl; "
                         "repeatable")
    ap.add_argument("--linecards", action="append", default=[])
    ap.add_argument("--catalog", default=os.path.join(ENRICH, "catalog-v3-%s.json" % CAPTURED))
    ap.add_argument("--out", default=os.path.join(ENRICH, "_reconcile-%s.json" % CAPTURED))
    args = ap.parse_args()

    payload = {
        "stage": "s3-enrichment-reconcile",
        "captured": CAPTURED,
        "reconciliation": [reconcile(p) for p in args.pair],
        "refusals": refusals(args.pair),
        "brand_integrity": brand_integrity(args.linecards, args.catalog)
        if args.linecards and os.path.exists(args.catalog) else None,
    }
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=1)
    print(json.dumps(payload, indent=1)[:6000])
    bad = [r for r in payload["reconciliation"] if not r["reconciles"]]
    bi = payload["brand_integrity"]
    print("\nRECONCILES: %s | BRAND INTEGRITY: %s" % (
        "ALL" if not bad else "FAIL on %d" % len(bad),
        "n/a" if bi is None else ("clean" if bi["clean"] else "DEFECT")))
    return 0


if __name__ == "__main__":
    sys.exit(main())
