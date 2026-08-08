#!/usr/bin/env python3
"""Recompute brands[] for every harvested record, from the response cache only.

Extraction rules get tightened as false positives turn up in verification.
Re-fetching to apply them would hit thousands of small businesses a second time
for no reason, so extraction is separated from acquisition: this pass replays
the exact same harvest logic with the request budget set to ZERO, so every URL
resolves out of the gzipped cache and a cache miss simply yields nothing.

Zero network -- enforced, not promised. Idempotent. Never drops a record: a
record whose pages are not cached keeps its original extraction.
"""
import importlib.util
import json
import os
import sys

CAPTURED = "2026-08-01"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ENRICH = os.path.join(ROOT, "data", "enrichment")

_spec = importlib.util.spec_from_file_location(
    "harv", os.path.join(HERE, "linecard_harvest.py"))
harv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(harv)

# The hard guarantee: no request may leave this process.
harv.MAX_REQUESTS = 0

KEEP = ("origins", "company_display")


def main():
    path = os.path.join(ENRICH, f"linecards-{CAPTURED}.json")
    with open(path) as f:
        payload = json.load(f)

    out, changed, uncached = [], 0, 0
    for old in payload["records"]:
        target = {"domain": old["domain"],
                  "origins": old.get("origins", []),
                  "company_display": old.get("company_display")}
        try:
            new = harv.harvest(target)
        except Exception:  # noqa: BLE001 - keep the old record, never drop it
            out.append(old)
            continue

        if new.get("error") == "request-budget" or (
                new["brand_count"] == 0 and old["brand_count"] > 0
                and new.get("homepage_status") is None):
            uncached += 1
            out.append(old)          # nothing cached for it; keep what we had
            continue

        for k in KEEP:
            new[k] = old.get(k) or new.get(k)
        if new["brands"] != old["brands"]:
            changed += 1
        out.append(new)

    payload["records"] = sorted(out, key=lambda r: r["domain"])
    payload["reextracted"] = True
    tmp = path + ".tmp"
    with open(tmp, "w") as f:
        json.dump(payload, f, indent=1)
    os.replace(tmp, path)
    print(f"re-extracted {len(out)} records | brands changed on {changed} "
          f"| {uncached} kept as-is (nothing cached)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
