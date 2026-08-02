#!/usr/bin/env python3
"""Split the enrichment target set into host-disjoint shards.

Why this exists. The line-card pass and the sitemap pass both fetch from the
dealer's own origin, and the >=1-request-per-3s-per-host rule is enforced by an
in-process lock. Two processes running at once would each think they owned the
delay budget and the origin would see two of our requests inside 3s. So the
passes cannot simply be run in parallel over the same domains.

They CAN be run in parallel over disjoint domain sets. This splits the target
universe on a stable hash of the domain, so:

    phase 1:  line-card(A)  ||  sitemap(B)
    phase 2:  line-card(B)  ||  sitemap(A)

No host is ever touched by two live processes, and the wall clock is roughly
halved -- which is what makes 13.4k domains tractable inside a timebox.

Emits both shapes: `targets` for linecard_harvest.py, `records` for
catalog_sitemap.py. No network, no list is written.
"""
import argparse
import hashlib
import json
import os
import sys

CAPTURED = "2026-08-01"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ENRICH = os.path.join(ROOT, "data", "enrichment")


def load_domains(path, keys=("targets", "records")):
    with open(path, encoding="utf-8") as f:
        payload = json.load(f)
    for k in keys:
        if k in payload:
            return payload[k]
    return []


def covered(paths):
    """Domains a prior pass already answered for. A refusal counts as answered."""
    done = set()
    for p in paths:
        if not os.path.exists(p):
            continue
        with open(p, encoding="utf-8") as f:
            payload = json.load(f)
        for r in payload.get("records", []):
            d = (r.get("domain") or "").strip().lower()
            if d:
                done.add(d)
    return done


def shard_of(domain, n):
    """Stable, uniform, and independent of input order or list version."""
    h = hashlib.sha1(domain.encode()).hexdigest()
    return int(h[:8], 16) % n


def write(path, rows, key, meta):
    payload = dict(meta)
    payload[key] = rows
    payload["domains"] = len(rows)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=1)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, path)
    print("  %-58s %6d" % (os.path.basename(path), len(rows)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--targets", default=os.path.join(
        ENRICH, "_targets-v3-%s.json" % CAPTURED),
        help="full target universe (linecard_targets.py output)")
    ap.add_argument("--lc-done", action="append", default=[],
                    help="prior line-card outputs; their domains are skipped")
    ap.add_argument("--sm-done", action="append", default=[],
                    help="prior sitemap outputs; their domains are skipped")
    ap.add_argument("--shards", type=int, default=2)
    ap.add_argument("--tag", default="v3")
    args = ap.parse_args()

    universe = load_domains(args.targets)
    lc_done, sm_done = covered(args.lc_done), covered(args.sm_done)

    lc = [t for t in universe if t["domain"] not in lc_done]
    sm = [{"domain": t["domain"]} for t in universe if t["domain"] not in sm_done]
    print("universe %d | line-card todo %d | sitemap todo %d"
          % (len(universe), len(lc), len(sm)))

    meta = {"stage": "s3-enrichment-shard", "captured": CAPTURED,
            "note": ("host-disjoint shard: the two network passes run "
                     "concurrently on different shards so no origin is ever "
                     "hit by two processes inside the 3s window")}
    letters = "abcdefghij"
    print("\nshards:")
    for i in range(args.shards):
        s = letters[i]
        write(os.path.join(ENRICH, "_targets-%s%s-%s.json" % (args.tag, s, CAPTURED)),
              [t for t in lc if shard_of(t["domain"], args.shards) == i],
              "targets", meta)
        write(os.path.join(ENRICH, "_sitemap-targets-%s%s-%s.json" % (args.tag, s, CAPTURED)),
              [t for t in sm if shard_of(t["domain"], args.shards) == i],
              "records", meta)
    return 0


if __name__ == "__main__":
    sys.exit(main())
