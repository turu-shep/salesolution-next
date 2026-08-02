#!/usr/bin/env python3
"""Dump the surrounding text for a random sample of brand extractions.

Precision has to be MEASURED, not asserted. This pulls each sampled
(domain, brand) pair back out of the response cache and prints the sentence the
match came from, so a human can mark it true or false. Reads cache only -- no
network, no second hit on any dealer.

    python3 linecard_verify.py --n 25            # draw + print the sample
    python3 linecard_verify.py --n 25 --json     # machine-readable
"""
import argparse
import gzip
import importlib.util
import json
import os
import random
import re
import sys

CAPTURED = "2026-08-01"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ENRICH = os.path.join(ROOT, "data", "enrichment")


def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


harv = _load("harv", os.path.join(HERE, "linecard_harvest.py"))
brands_mod = _load("brands", os.path.join(HERE, "brands.py"))


def cached_text(url):
    cp = harv.cache_path(url)
    if not os.path.exists(cp):
        return None
    with gzip.open(cp, "rb") as f:
        return json.loads(f.read().decode("utf-8", "ignore")).get("text") or ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=25)
    ap.add_argument("--seed", type=int, default=20260801)
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    with open(os.path.join(ENRICH, f"linecards-{CAPTURED}.json")) as f:
        recs = json.load(f)["records"]

    pool = [(r, b) for r in recs if r["brand_count"] for b in r["brands"]]
    picks = random.Random(args.seed).sample(pool, min(args.n, len(pool)))

    rows = []
    for r, brand in picks:
        # the URL the brands were actually read from
        url = r["source_url"]
        text = cached_text(url)
        if text is None:
            for a in r.get("attempts", []):
                text = cached_text(a["url"])
                if text:
                    url = a["url"]
                    break
        ctx, form = None, None
        if text:
            _, ev = brands_mod.extract(text, r["domain"], return_evidence=True)
            if brand in ev:
                ctx, form = ev[brand]["context"], ev[brand]["form"]
        rows.append({
            "domain": r["domain"], "brand": brand, "surface_form": form,
            "url": url, "brands_from": r.get("brands_from"),
            "kind": r.get("linecard_kind"), "context": ctx,
        })

    if args.json:
        print(json.dumps({"seed": args.seed, "pool": len(pool),
                          "rows": rows}, indent=1))
        return 0

    print(f"Random sample of {len(rows)} extractions "
          f"from a pool of {len(pool)} (domain,brand) pairs. seed={args.seed}\n")
    for i, row in enumerate(rows, 1):
        print(f"[{i:2}] {row['brand']}  <- {row['domain']}  "
              f"({row['brands_from']}/{row['kind']})")
        print(f"     {row['url'][:100]}")
        print(f"     form={row['surface_form']!r}")
        print(f"     ...{(row['context'] or 'NO CONTEXT RECOVERED')[:300]}...")
        print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
