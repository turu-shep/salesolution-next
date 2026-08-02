#!/usr/bin/env python3
"""Measure the S1 raw pulls. Counting only — writes nothing back to the payloads.

Rough company normalization for DISTINCT counts (lowercase, strip legal suffixes
and punctuation). This is a measurement convenience, NOT the S2 normalizer —
the shared normalizer in emails/scripts/lib/ is owned elsewhere and is what the
pipeline actually uses.
"""
import html
import json
import os
import re
import sys
from collections import Counter

RAW = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw"))
SUFFIX = re.compile(
    r"\b(incorporated|inc|llc|l\.l\.c|corp|corporation|company|co|ltd|limited|"
    r"lp|llp|plc|the)\b", re.I)


def norm(name):
    """The count the task asked for: lowercase + strip inc/llc/corp/etc."""
    if not name:
        return ""
    n = html.unescape(name).lower()
    n = re.sub(r"[^\w\s]", " ", n)
    n = SUFFIX.sub(" ", n)
    return re.sub(r"\s+", " ", n).strip()


def norm_branch(name):
    """Harsher variant: also drop the branch/location qualifier after a dash or
    inside parens ("Motion Ai - MN", "BHQ - Joliet, IL"). This is what research
    /06 used for Dorner, and it moves the distinct count a lot — so both are
    reported and the gap is the honest uncertainty band on dedupe collapse."""
    if not name:
        return ""
    n = re.split(r"\s*[-–—]\s*", html.unescape(name))[0]
    n = re.sub(r"\([^)]*\)", "", n).lower()
    n = re.sub(r"[^\w\s]", " ", n)
    n = SUFFIX.sub(" ", n)
    return re.sub(r"\s+", " ", n).strip()


def pct(n, d):
    return f"{100.0 * n / d:.1f}%" if d else "n/a"


def report(path, name_key, web_keys, phone_keys, email_keys, extra=None):
    with open(path) as f:
        payload = json.load(f)
    recs = payload["records"]
    total = len(recs)

    def filled(keys):
        return sum(1 for r in recs
                   if any(str(r.get(k) or "").strip() for k in keys))

    distinct = {norm(r.get(name_key)) for r in recs} - {""}
    branch = {norm_branch(r.get(name_key)) for r in recs} - {""}
    print(f"\n=== {payload['source']} — {payload.get('source_name','')} ===")
    print(f"  raw records      : {total}")
    print(f"  distinct company : {len(distinct)}  (lowercase + strip inc/llc/corp)")
    print(f"  distinct, branch-stripped: {len(branch)}  (also drops ' - <branch>')")
    print(f"  distinct raw name: {len({r.get(name_key) for r in recs if r.get(name_key)})}")
    print(f"  with website     : {filled(web_keys)}  ({pct(filled(web_keys), total)})")
    print(f"  with phone       : {filled(phone_keys)}  ({pct(filled(phone_keys), total)})")
    print(f"  with email       : {filled(email_keys)}  ({pct(filled(email_keys), total)})")

    # Rows repeat across queries (a company inside two metro radii, or matched by
    # several territory ZIPs). Fill rates per DISTINCT company are the honest read.
    best = {}
    for r in recs:
        k = norm(r.get(name_key))
        if not k:
            continue
        cur = best.setdefault(k, {"web": 0, "phone": 0, "email": 0})
        for tag, keys in (("web", web_keys), ("phone", phone_keys), ("email", email_keys)):
            if any(str(r.get(x) or "").strip() for x in keys):
                cur[tag] = 1
    n = len(best)
    print(f"  -- per distinct company (n={n}) --")
    for tag, label in (("web", "website"), ("phone", "phone"), ("email", "email")):
        c = sum(v[tag] for v in best.values())
        print(f"     with {label:8s}: {c}  ({pct(c, n)})")
    print(f"  origin requests  : {payload.get('requests_to_origin')}")
    if extra:
        extra(payload, recs, distinct)
    return payload, recs, distinct


def ad_extra(payload, recs, distinct):
    labels = payload["divisions"]
    by_div = Counter(r["division_code"] for r in recs)
    print("  division breakdown (raw rows / distinct companies):")
    for code, label in labels.items():
        sub = [r for r in recs if r["division_code"] == code]
        d = {norm(r["company"]) for r in sub if r["company"]}
        db = {norm_branch(r["company"]) for r in sub if r["company"]}
        print(f"    {code:5s} {label[:34]:36s} rows={len(sub):5d}  distinct={len(d):4d}  branch_stripped={len(db):4d}")
    pq = [q for q in payload["per_query"] if q.get("rows") is not None]
    empty = sum(1 for q in pq if q["rows"] == 0)
    failed = [q for q in payload["per_query"] if q.get("rows") is None]
    rows = sorted(q["rows"] for q in pq)
    fdiv = Counter(q["division"] for q in failed)
    print(f"  queries: {len(payload['per_query'])} | returned rows: {len(pq)} | "
          f"empty(200, 0 rows): {empty} | failed: {len(failed)} {dict(fdiv)}")
    if rows:
        print(f"  rows/query: min={rows[0]} median={rows[len(rows)//2]} "
              f"max={rows[-1]} — no server-side result cap observed")
    # Yield curve: cumulative distinct companies as metros are added, per division.
    order = payload["metros"]
    seen, curve = set(), []
    for m in order:
        for r in recs:
            if r["query_metro"] == m and r["company"]:
                seen.add(norm(r["company"]))
        curve.append(len(seen))
    print("  cumulative distinct companies by metro # (all divisions):")
    pts = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
    print("    " + "  ".join(f"m{p}={curve[p-1]}" for p in pts if p <= len(curve)))
    if len(curve) >= 10:
        last10 = curve[-1] - curve[-11]
        print(f"  net-new companies from the last 10 metros: {last10} "
              f"({pct(last10, curve[-1])} of total) -> "
              f"{'FLATTENED' if last10 < 0.05 * curve[-1] else 'STILL CLIMBING'}")
    gmaps = sum(1 for r in recs if r.get("website")
                and "google.com/maps" in (r["website"] or "").lower()
                or "maps.google" in (r.get("website") or "").lower())
    print(f"  website values that are Google-Maps URLs: {gmaps}")


def dorner_extra(payload, recs, distinct):
    print("  tier_raw:", dict(Counter(r["tier_raw"] for r in recs)))
    print("  market counts (facet):", payload.get("market_counts"))
    print("  records with >=1 market:", sum(1 for r in recs if r.get("markets")))
    locs = Counter(norm(r["company"]) for r in recs if r["company"])
    print(f"  single-location companies: {sum(1 for v in locs.values() if v == 1)}")


def spx_extra(payload, recs, distinct):
    ids = {r.get("id") for r in recs}
    print(f"  distinct location ids: {len(ids)}")
    print("  businessunit:", dict(Counter(r.get("businessunit") for r in recs).most_common(8)))
    print("  priority_name (tier_raw):",
          dict(Counter(r.get("priority_name") for r in recs).most_common(8)))
    print("  states:", len({r.get("state") for r in recs if r.get("state")}))
    sat = payload.get("saturation", [])
    if sat:
        pts = [1, 10, 25, 40, 51, 60, 75, 90, len(sat)]
        print("  saturation (cumulative distinct location ids by query #):")
        print("    " + "  ".join(f"q{p}={sat[p-1]['cumulative_ids']}"
                                 for p in pts if p <= len(sat)))
        if len(sat) >= 20:
            last20 = sat[-1]["cumulative_ids"] - sat[-21]["cumulative_ids"]
            print(f"  net-new ids from the last 20 queries: {last20} -> "
                  f"{'FLATTENED' if last20 < 0.05 * sat[-1]['cumulative_ids'] else 'STILL CLIMBING'}")
    with_terr = sum(1 for r in recs if r.get("territoriesbystate"))
    print(f"  records carrying territoriesbystate: {with_terr} ({pct(with_terr, len(recs))})")


JOBS = {
    "ad": ("ad-2026-08-01.json", "company", ["website"], ["phone_raw"], [], ad_extra),
    "dorner": ("dorner-2026-08-01.json", "company", ["website"],
               ["phone_raw", "phone_formatted"], ["email"], dorner_extra),
    "spxflow": ("spxflow-2026-08-01.json", "name", ["link"], ["phone"], ["email"], spx_extra),
}

if __name__ == "__main__":
    want = sys.argv[1:] or list(JOBS)
    for key in want:
        fn, nk, wk, pk, ek, ex = JOBS[key]
        p = os.path.join(RAW, fn)
        if not os.path.exists(p):
            print(f"\n=== {key} === NOT YET WRITTEN ({fn})")
            continue
        report(p, nk, wk, pk, ek, ex)
