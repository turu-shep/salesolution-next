#!/usr/bin/env python3
"""Measure the second S1 wave: SERP self-identification, AD expansion, PTDA.

Counting only — writes nothing back to the payloads. Reuses measure_raw.py's
rough name normalizers so the numbers are comparable to the first wave. Neither
is the S2 normalizer; the shared one in emails/scripts/lib/ is owned elsewhere.
"""
import importlib.util
import json
import os
import re
import sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.abspath(os.path.join(HERE, "..", "..", "data", "raw"))
_s = importlib.util.spec_from_file_location("mr", os.path.join(HERE, "measure_raw.py"))
mr = importlib.util.module_from_spec(_s)
_s.loader.exec_module(mr)
norm, norm_branch, pct = mr.norm, mr.norm_branch, mr.pct

BLOCKED = ["Parker", "Gates", "ESAB", "Norton", "WEG", "Regal Rexnord", "Dixon", "ifm"]


def load(fn):
    p = os.path.join(RAW, fn)
    if not os.path.exists(p):
        return None
    with open(p) as f:
        return json.load(f)


# --------------------------------------------------------------------- SERP
def serp():
    d = load("serp-selfid-2026-08-01.json")
    if not d:
        print("SERP: not written yet")
        return
    recs, qs = d["records"], d["per_query"]
    ok = [q for q in qs if not q.get("error")]
    bad = [q for q in qs if q.get("error")]
    print("\n" + "=" * 78)
    print("SERP SELF-IDENTIFICATION PROGRAM")
    print("=" * 78)
    print(f"queries planned      {d['program']['queries_planned']}")
    print(f"queries succeeded    {len(ok)}")
    print(f"queries no-result    {len(bad)}")
    print(f"API cost (measured)  ${d['api_cost_measured']:.4f}")
    print(f"balance delta        ${d['balance_delta']:.4f}")
    print(f"organic results      {len(recs)}")

    cand = [r for r in recs if r["classification"] == "dealer_candidate"]
    doms = {r["domain"] for r in cand}
    print(f"dealer-candidate results {len(cand)}  ({pct(len(cand), len(recs))} of organic)")
    print(f"DISTINCT DEALER DOMAINS  {len(doms)}")
    print(f"  website coverage       100.0% (by construction — the record IS a site)")
    print(f"  phone coverage         0.0% (SERP carries no NAP; S3 must resolve)")

    print("\nfiltered out (by class):")
    for k, v in Counter(r["classification"] for r in recs).most_common():
        print(f"  {k:24s} {v:5d}  ({pct(v, len(recs))})")

    # quotable self-declarations
    decl = [r for r in cand if r["declaration"]]
    quotable = [r for r in decl if not r["declaration_is_boilerplate"]]
    qdoms = {r["domain"] for r in quotable}
    print(f"\nself-declaration text present   {len(decl)} results / "
          f"{len({r['domain'] for r in decl})} domains")
    print(f"QUOTABLE (dealer's own words)   {len(quotable)} results / {len(qdoms)} domains")
    print(f"manufacturer boilerplate only   {len(decl)-len(quotable)} results "
          f"(finds the account, words are the manufacturer's — not quotable)")
    print(f"domains with a quotable line    {pct(len(qdoms), len(doms))} of dealer domains")
    print("\nsample quotable declarations (verbatim, as the SERP published them):")
    seen = set()
    for r in sorted(quotable, key=lambda x: (x["rank_absolute"] or 99)):
        if r["domain"] in seen:
            continue
        seen.add(r["domain"])
        print(f'  #{r["rank_absolute"]:>3} {r["domain"][:34]:34s} "{r["declaration"][:96]}"')
        if len(seen) >= 12:
            break

    # brand coverage across the 8 blocked brands
    print("\nblocked-brand coverage (distinct dealer domains):")
    print(f"  {'brand':16s} {'via brand query':>16s} {'names the brand':>16s} {'union':>7s}")
    tot = set()
    for b in BLOCKED:
        via_q = {r["domain"] for r in cand if r["brand_hint"] == b}
        names = {r["domain"] for r in cand if b in (r["brands_named"] or [])}
        u = via_q | names
        tot |= u
        print(f"  {b:16s} {len(via_q):>16d} {len(names):>16d} {len(u):>7d}")
    print(f"  {'ANY blocked':16s} {'':>16s} {'':>16s} {len(tot):>7d}"
          f"   ({pct(len(tot), len(doms))} of all dealer domains)")

    # axis productivity — the research/04 pivot
    print("\naxis productivity (net-new dealer domains, in program order):")
    seen_d, per_axis = set(), defaultdict(lambda: [0, 0, 0])  # q, results, net-new
    order = {"A": 0, "B": 1, "Cn": 2, "Cs": 3}
    by_axis_q = defaultdict(set)
    for r in cand:
        by_axis_q[r["query_axis"]].add(r["query"])
    for ax in sorted(by_axis_q, key=lambda a: order.get(a, 9)):
        rows = [r for r in cand if r["query_axis"] == ax]
        new = {r["domain"] for r in rows} - seen_d
        seen_d |= {r["domain"] for r in rows}
        nq = sum(1 for q in qs if q["axis"] == ax and not q.get("error"))
        per_axis[ax] = [nq, len(rows), len(new)]
    for ax in sorted(per_axis, key=lambda a: order.get(a, 9)):
        nq, nr, nn = per_axis[ax]
        desc = next((r["query_axis_desc"] for r in cand if r["query_axis"] == ax), ax)
        print(f"  {ax:3s} {desc:34s} q={nq:4d} results={nr:5d} "
              f"net-new domains={nn:4d}  ({nn/nq:.2f}/query)" if nq else "")

    # line-card x state, the workhorse: net-new per state
    print("\nline-card axis: distinct dealer domains per category (Cn+Cs):")
    for cat, c in Counter(r["query_category"] for r in cand
                          if r["query_category"]).most_common():
        dd = len({r["domain"] for r in cand if r["query_category"] == cat})
        print(f"  {cat:16s} results={c:5d} distinct_domains={dd:4d}")

    # rank distribution — free qualification signal
    ranks = [r["rank_absolute"] for r in cand if r["rank_absolute"]]
    if ranks:
        ranks.sort()
        print(f"\nrank of dealer results: median={ranks[len(ranks)//2]} "
              f"p25={ranks[len(ranks)//4]} p75={ranks[3*len(ranks)//4]} max={ranks[-1]}")
    pdf = sum(1 for r in cand if r["is_pdf"])
    print(f"hosted-PDF results (catalog-PDF pattern): {pdf} "
          f"/ {len({r['domain'] for r in cand if r['is_pdf']})} domains")

    if bad:
        print("\nno-result / errored queries:")
        for q in bad[:20]:
            print(f"  [{q['axis']}] {q['keyword'][:72]}  :: {q['error']}")
        if len(bad) > 20:
            print(f"  ... and {len(bad)-20} more")


# ----------------------------------------------------------------------- AD
def ad():
    d = load("ad-expansion-2026-08-01.json")
    if not d:
        print("\nAD expansion: not written yet")
        return
    recs = d["records"]
    print("\n" + "=" * 78)
    print("AD EXPANSION — metros 51-150, ICP divisions (BPT/PVF/ISD)")
    print("=" * 78)
    print(f"queries planned/completed  {d['queries_planned']}/{d['queries_completed']}")
    print(f"origin requests            {d['requests_to_origin']}")
    print(f"raw records                {len(recs)}")
    dn = {norm(r["company"]) for r in recs} - {""}
    db = {norm_branch(r["company"]) for r in recs} - {""}
    print(f"distinct company (loose)   {len(dn)}")
    print(f"distinct company (branch-stripped) {len(db)}")
    web = sum(1 for r in recs if (r.get("website") or "").strip())
    ph = sum(1 for r in recs if (r.get("phone_raw") or "").strip())
    print(f"with website               {web}/{len(recs)} = {pct(web, len(recs))}")
    print(f"with phone                 {ph}/{len(recs)} = {pct(ph, len(recs))}")
    percomp_web = len({norm(r["company"]) for r in recs
                       if (r.get("website") or "").strip()} - {""})
    print(f"per distinct company w/ website  {pct(percomp_web, len(dn))}")
    print("\nby division:")
    for div in ("BPT", "PVF", "ISD"):
        rr = [r for r in recs if r["division_code"] == div]
        print(f"  {div:4s} rows={len(rr):5d} distinct={len({norm(r['company']) for r in rr}-{''}):5d}")

    # net-new against the first 50 metros
    prev = load("ad-2026-08-01.json")
    if prev:
        old = {norm(r["company"]) for r in prev["records"]} - {""}
        old_icp = {norm(r["company"]) for r in prev["records"]
                   if r["division_code"] in ("BPT", "PVF", "ISD")} - {""}
        print(f"\nvs first 50 metros (all 9 divisions, {len(old)} distinct):")
        print(f"  net-new vs ALL of run 1        {len(dn - old)}")
        print(f"  net-new vs run 1 ICP divisions {len(dn - old_icp)} "
              f"(run 1 ICP had {len(old_icp)})")
        print(f"  combined ICP-division pool     {len(dn | old_icp)}")

    # yield curve — did metros 51-150 flatten?
    print("\nyield curve over the 100 new metros (cumulative distinct, loose norm):")
    metros = d["metros"]
    seen, curve = set(), []
    for i, mm in enumerate(metros):
        for r in recs:
            if r["query_metro"] == mm:
                seen.add(norm(r["company"]))
        curve.append(len(seen - {""}))
    for cut in (10, 25, 50, 75, 90, 100):
        if cut <= len(curve):
            print(f"  after {cut:3d} metros: {curve[cut-1]:5d}")
    if len(curve) >= 100:
        last10 = curve[-1] - curve[-11]
        print(f"  last 10 of 100 metros added {last10} "
              f"({100.0*last10/curve[-1]:.1f}% of the expansion total)")
        print("  run 1 comparison: last 10 of 50 metros added 14.9% — "
              f"{'STILL CLIMBING' if 100.0*last10/curve[-1] > 7 else 'FLATTENING'}")


# --------------------------------------------------------------------- PTDA
def ptda():
    d = load("ptda-2026-08-01.json")
    if not d:
        print("\nPTDA: not written yet")
        return
    recs = d["records"]
    print("\n" + "=" * 78)
    print("PTDA FIND-A-DISTRIBUTOR — full category pull")
    print("=" * 78)
    print(f"queries planned/completed  {d['queries_planned']}/{d['queries_completed']}")
    print(f"origin requests            {d['requests_to_origin']}")
    print(f"raw records                {len(recs)}")
    dn = {norm(r["company"]) for r in recs} - {""}
    db = {norm_branch(r["company"]) for r in recs} - {""}
    print(f"distinct company (loose)   {len(dn)}")
    print(f"distinct company (branch-stripped) {len(db)}")
    locs = {(norm(r["company"]), (r.get("address_1") or "").lower(),
             (r.get("zip") or "")[:5]) for r in recs}
    print(f"distinct (company,address) {len(locs)}")
    web = sum(1 for r in recs if (r.get("website") or "").strip())
    ph = sum(1 for r in recs if (r.get("phone_raw") or "").strip())
    addr = sum(1 for r in recs if (r.get("address_1") or "").strip())
    print(f"with website               {pct(web, len(recs))}")
    print(f"with phone                 {pct(ph, len(recs))}")
    print(f"with parsed street address {pct(addr, len(recs))}")
    percomp_web = len({norm(r["company"]) for r in recs
                       if (r.get("website") or "").strip()} - {""})
    print(f"per distinct company w/ website  {pct(percomp_web, len(dn))}")

    # line-card material: categories per company
    cats = defaultdict(set)
    for r in recs:
        if r["product_category_code"]:
            cats[norm(r["company"])].add(r["product_category_code"])
    if cats:
        widths = Counter(len(v) for v in cats.values())
        print(f"\ncompanies with >=1 product category: {len(cats)}")
        print("categories per company (line_card breadth):")
        for k in sorted(widths):
            print(f"  {k:2d} categories: {widths[k]:5d} companies")
        avg = sum(len(v) for v in cats.values()) / len(cats)
        print(f"  mean {avg:.1f} of 14")

    print("\ntop 15 names by distinct location count (the chain skew):")
    loc_by = defaultdict(set)
    for r in recs:
        loc_by[norm(r["company"])].add(
            ((r.get("address_1") or "").lower(), (r.get("zip") or "")[:5]))
    for n, s in sorted(loc_by.items(), key=lambda kv: -len(kv[1]))[:15]:
        print(f"  {len(s):5d}  {n[:56]}")
    big = sum(1 for s in loc_by.values() if len(s) >= 20)
    covered = sum(len(s) for s in loc_by.values() if len(s) >= 20)
    print(f"names with >=20 distinct addresses: {big} "
          f"covering {covered}/{len(locs)} locations ({pct(covered, len(locs))})")

    print("\nrecords per category:")
    for c, n in Counter(r["product_category"] or "(Any)" for r in recs).most_common():
        print(f"  {str(c)[:44]:44s} {n:6d}")


if __name__ == "__main__":
    which = sys.argv[1:] or ["serp", "ad", "ptda"]
    if "serp" in which:
        serp()
    if "ad" in which:
        ad()
    if "ptda" in which:
        ptda()
