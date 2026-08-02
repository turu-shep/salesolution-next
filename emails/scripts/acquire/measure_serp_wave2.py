#!/usr/bin/env python3
"""Measure SERP self-identification WAVE 2 against wave 1.

Answers exactly the questions the build plan needs to decide whether a wave 3
is worth running:
  - net-new dealer domains vs wave 1, and the rate versus wave 1's own rate
  - did it saturate (marginal net-new per query, in PLAN order, per 50-query block)
  - which query axis is still paying
  - how many net-new domains carry a quotable verbatim self-declaration
  - automotive contamination in wave 2 vs wave 1, measured with ONE regex over
    BOTH waves (wave 1 predates the flag, so it is recomputed, not read)

Read-only. Writes nothing.
"""
import json
import os
import re
import sys
from collections import Counter, defaultdict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "data", "raw")
W1 = os.path.join(RAW, "serp-selfid-2026-08-01.json")
W2 = os.path.join(RAW, "serp-selfid-wave2-2026-08-01.json")

AUTO_TRUCK_RX = re.compile(
    r"(?<![A-Za-z])("
    r"automotive|auto\s+parts|autoparts|aftermarket|truck\s+parts|"
    r"heavy\s+duty\s+truck|fleet\s+(?:service|supply|parts|maintenance)|"
    r"semi[- ]truck|trailer\s+parts|brake\s+(?:parts|shop)|"
    r"transmission\s+shop|collision|body\s+shop|tire\s+(?:shop|center)|"
    r"napa|carquest|o'?reilly|autozone|advance\s+auto|parts\s+authority|"
    r"rush\s+truck|freightliner|peterbilt|kenworth|mack\s+truck|"
    r"engine\s+rebuild|radiator\s+shop|muffler|car\s+care|quick\s+lube"
    r")(?![A-Za-z])", re.I)

FIELDS = ("title", "snippet", "pre_snippet", "extended_snippet", "page_url")


def auto_flag(r):
    blob = " ".join(str(r.get(f) or "") for f in FIELDS) + " " + str(r.get("breadcrumb") or "")
    return bool(AUTO_TRUCK_RX.search(blob))


def dealers(records):
    return [r for r in records if r["classification"] == "dealer_candidate" and r["domain"]]


def pct(n, d):
    return f"{100.0 * n / d:.1f}%" if d else "n/a"


def main():
    w1 = json.load(open(W1))
    w2 = json.load(open(W2))
    w1r, w2r = w1["records"], w2["records"]
    w1d, w2d = dealers(w1r), dealers(w2r)
    w1_all_dom = {r["domain"] for r in w1r if r["domain"]}
    w1_dealer_dom = {r["domain"] for r in w1d}
    w2_dealer_dom = {r["domain"] for r in w2d}
    net_new = w2_dealer_dom - w1_all_dom
    nq1 = w1["program"]["queries_completed"]
    nq2 = w2["program"]["queries_completed"]

    print("=" * 78)
    print("SERP SELF-IDENTIFICATION — WAVE 2 vs WAVE 1")
    print("=" * 78)
    print(f"queries        w1 {nq1:>5}   w2 {nq2:>5}"
          f"   (w2 failed {w2['program']['queries_failed']})")
    print(f"spend          w1 ${w1['api_cost_measured']:.4f}  "
          f"w2 ${w2['api_cost_measured']:.4f}")
    print(f"organic rows   w1 {len(w1r):>5}   w2 {len(w2r):>5}")
    print(f"dealer rows    w1 {len(w1d):>5}   w2 {len(w2d):>5}")
    print(f"dealer domains w1 {len(w1_dealer_dom):>5}   w2 {len(w2_dealer_dom):>5}")
    print()
    print(f"NET-NEW dealer domains (not in ANY wave-1 domain): {len(net_new)}")
    print(f"  net-new per query      w2 {len(net_new)/nq2:.2f}  "
          f"vs w1 all-new-by-definition {len(w1_dealer_dom)/nq1:.2f}")
    print(f"  overlap with wave 1    {len(w2_dealer_dom & w1_all_dom)} "
          f"({pct(len(w2_dealer_dom & w1_all_dom), len(w2_dealer_dom))} of w2 dealer domains)")
    print(f"  union w1+w2 dealer domains {len(w1_dealer_dom | w2_dealer_dom)}")

    print()
    print("--- SATURATION (plan order, per 50-query block) " + "-" * 30)
    for b in w2["measured"]["saturation_curve_per_50_queries"]:
        bar = "#" * int(b["per_query"] * 6)
        print(f"  q{b['queries']:>9}  net-new {b['net_new_dealer_domains']:>4}"
              f"  = {b['per_query']:>5}/query  {bar}")
    blocks = w2["measured"]["saturation_curve_per_50_queries"]
    first, last = blocks[0]["per_query"], blocks[-1]["per_query"]
    print(f"  first block {first}/query -> last block {last}/query "
          f"({'DECAY ' + pct(first - last, first) if first else ''})")

    print()
    print("--- NET-NEW BY AXIS " + "-" * 56)
    for ax, v in sorted(w2["measured"]["net_new_by_axis"].items(),
                        key=lambda kv: -kv[1]["net_new_per_query"]):
        print(f"  {ax:<5} {v['queries']:>4} queries  net-new {v['net_new']:>4}"
              f"  = {v['net_new_per_query']:>5}/query")

    print()
    print("--- QUOTABLE SELF-DECLARATIONS " + "-" * 45)
    for label, ds in (("wave 1", w1d), ("wave 2", w2d)):
        with_decl = {r["domain"] for r in ds if r.get("declaration")}
        clean = {r["domain"] for r in ds
                 if r.get("declaration") and not r.get("declaration_is_boilerplate")}
        print(f"  {label}: {len(with_decl)} dealer domains carry a declaration "
              f"({pct(len(with_decl), len({r['domain'] for r in ds}))}), "
              f"{len(clean)} non-boilerplate")
    nn_decl = {r["domain"] for r in w2d
               if r.get("declaration") and r["domain"] in net_new}
    nn_clean = {r["domain"] for r in w2d
                if r.get("declaration") and not r.get("declaration_is_boilerplate")
                and r["domain"] in net_new}
    print(f"  NET-NEW domains with a declaration: {len(nn_decl)} "
          f"({pct(len(nn_decl), len(net_new))} of net-new); "
          f"{len(nn_clean)} non-boilerplate")

    print()
    print("--- AUTOMOTIVE CONTAMINATION (one regex, both waves) " + "-" * 23)
    for label, rows, ds in (("wave 1", w1r, w1d), ("wave 2", w2r, w2d)):
        ra = sum(1 for r in rows if auto_flag(r))
        dom_all = {r["domain"] for r in ds}
        dom_auto = {r["domain"] for r in ds if auto_flag(r)}
        print(f"  {label}: rows {ra}/{len(rows)} = {pct(ra, len(rows))}   |   "
              f"dealer domains {len(dom_auto)}/{len(dom_all)} = "
              f"{pct(len(dom_auto), len(dom_all))}")
    nn_auto = {r["domain"] for r in w2d if auto_flag(r) and r["domain"] in net_new}
    print(f"  wave-2 NET-NEW domains auto-flagged: {len(nn_auto)}/{len(net_new)} "
          f"= {pct(len(nn_auto), len(net_new))}")

    print()
    print("--- BRANDS ON THE PAGE " + "-" * 53)
    for label, ds in (("wave 1", w1d), ("wave 2", w2d)):
        bd = defaultdict(set)
        for r in ds:
            for b in r.get("brands_named") or []:
                bd[r["domain"]].add(b)
        n = sum(len(v) for v in bd.values())
        print(f"  {label}: {len(bd)} domains name >=1 brand, "
              f"{n/max(1,len(bd)):.2f} brands/domain")

    print()
    print("--- CLASSIFICATION MIX (wave 2) " + "-" * 44)
    for k, v in Counter(r["classification"] for r in w2r).most_common():
        print(f"  {k:<24} {v:>6}  {pct(v, len(w2r))}")

    print()
    print("--- PROVENANCE " + "-" * 61)
    bad = sum(1 for r in w2r if not r.get("source_url") or not r.get("captured"))
    print(f"  wave-2 rows missing source_url or captured: {bad}")
    print(f"  wave-2 rows total: {len(w2r)}  (nothing deleted; "
          f"{len(w2r)-len(w2d)} non-dealer rows kept and tagged)")


if __name__ == "__main__":
    sys.exit(main())
