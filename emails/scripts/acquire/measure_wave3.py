#!/usr/bin/env python3
"""Measurement for the two pool-gap sources: SERP wave 2 and DFS listings.

Read-only. Reports what the build plan's §5e gap arithmetic needs:
saturation, net-new rate, distinct companies, fill rates, and the
source-native category codes (§5e — the Timken lesson).

Overlap is measured against `emails/lists/deduped-v4.csv` READ-ONLY. That file
is owned by another stage; nothing here writes to it.
"""
import csv
import json
import os
import re
import sys
from collections import Counter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "data", "raw")
POOL = os.path.join(ROOT, "lists", "deduped-v4.csv")

SUFFIX_RX = re.compile(
    r"\b(inc|incorporated|llc|l\.l\.c|corp|corporation|co|company|ltd|limited|"
    r"lp|llp|plc|the)\b", re.I)
BRANCH_RX = re.compile(
    r"\s*[-–—,]?\s*\b(branch|division|div|store|location|warehouse|dc|"
    r"distribution center|service center)\b.*$", re.I)


def norm_name(n, strip_branch=True):
    n = (n or "").lower()
    if strip_branch:
        n = BRANCH_RX.sub("", n)
    n = re.sub(r"[^a-z0-9 ]+", " ", n)
    n = SUFFIX_RX.sub(" ", n)
    return re.sub(r"\s+", " ", n).strip()


def apex(d):
    d = (d or "").lower().strip().lstrip(".")
    return d[4:] if d.startswith("www.") else d


def digits(p):
    d = re.sub(r"\D", "", p or "")
    if len(d) == 11 and d.startswith("1"):
        d = d[1:]
    return d if len(d) == 10 else ""


def load_pool():
    if not os.path.exists(POOL):
        return set(), set(), set()
    doms, phones, names = set(), set(), set()
    with open(POOL, newline="") as f:
        for row in csv.DictReader(f):
            if row.get("domain"):
                doms.add(apex(row["domain"]))
            p = digits(row.get("phone_e164"))
            if p:
                phones.add(p)
            n = norm_name(row.get("company") or row.get("company_display"))
            if n:
                names.add(n)
    return doms, phones, names


def report_serp():
    p2 = os.path.join(RAW, "serp-selfid-wave2-2026-08-01.json")
    p1 = os.path.join(RAW, "serp-selfid-2026-08-01.json")
    if not os.path.exists(p2):
        print("[serp] wave 2 output not present yet")
        return
    w2 = json.load(open(p2))
    w1 = json.load(open(p1))
    w1_all = {r["domain"] for r in w1["records"] if r.get("domain")}
    w1_dealer = {r["domain"] for r in w1["records"]
                 if r.get("domain") and r["classification"] == "dealer_candidate"}

    recs = w2["records"]
    dealer = {r["domain"] for r in recs
              if r["classification"] == "dealer_candidate" and r["domain"]}
    net_new = dealer - w1_all
    print("=" * 78)
    print("SERP WAVE 2")
    print("=" * 78)
    m = w2["measured"]
    print(f"queries planned/ok/failed : {w2['program']['queries_planned']} / "
          f"{w2['program']['queries_completed']} / {w2['program']['queries_failed']}")
    print(f"api cost                  : ${w2['api_cost_measured']:.4f}")
    print(f"organic results           : {len(recs):,}")
    print(f"wave-2 dealer domains     : {len(dealer):,}")
    print(f"NET-NEW vs wave 1         : {len(net_new):,}  "
          f"({len(net_new)/max(1,len(dealer)):.1%} of wave-2 domains)")
    print(f"wave 1 (250q)             : {len(w1_dealer):,} dealer domains "
          f"= {len(w1_dealer)/250:.2f}/query")
    print(f"wave 2 ({w2['program']['queries_planned']}q)  "
          f"           : {len(net_new):,} net-new "
          f"= {len(net_new)/w2['program']['queries_planned']:.2f}/query")
    print(f"declarations captured     : {m['records_with_declaration']:,} results")
    decl_doms = {r["domain"] for r in recs
                 if r["declaration"] and r["classification"] == "dealer_candidate"
                 and r["domain"]}
    print(f"  ...on distinct domains  : {len(decl_doms):,} "
          f"({len(decl_doms - w1_all):,} of them net-new)")
    print(f"auto/truck flagged results: {m['records_auto_truck_flagged']:,}")
    at_doms = {r["domain"] for r in recs if r["auto_truck_signal"] and r["domain"]}
    print(f"  ...distinct domains     : {len(at_doms):,} "
          f"({len(at_doms & net_new):,} of the net-new)")

    print("\nper-axis yield (net-new dealer domains attributable to each axis,")
    print("counted first-come so axes are not double-credited):")
    seen = set(w1_all)
    axis_new, axis_q = Counter(), Counter()
    for r in recs:
        axis_q[r["query_axis"]] += 0
    for q in w2["per_query"]:
        axis_q[q["axis"]] += 1
    for r in recs:
        if r["classification"] != "dealer_candidate" or not r["domain"]:
            continue
        if r["domain"] not in seen:
            seen.add(r["domain"])
            axis_new[r["query_axis"]] += 1
    for ax in ("A2", "B2", "C2", "D2n", "D2s"):
        if axis_q[ax]:
            print(f"  {ax:<4} {axis_q[ax]:>4} queries -> {axis_new[ax]:>5} net-new "
                  f"({axis_new[ax]/axis_q[ax]:.2f}/query)  "
                  f"{w2['program']['axis_counts'].get(ax,'')}")

    print("\nsaturation curve (net-new per query, in completion order, deciles):")
    order = [q for q in w2["per_query"] if not q.get("error")]
    dec = max(1, len(order) // 10)
    for i in range(0, len(order), dec):
        chunk = order[i:i + dec]
        nn = sum(q.get("net_new_vs_w1", 0) for q in chunk)
        print(f"  q{i+1:>4}-{i+len(chunk):<4} raw net-new hits/query "
              f"{nn/max(1,len(chunk)):.2f}")

    doms, phones, names = load_pool()
    if doms:
        print(f"\noverlap with deduped-v4 ({len(doms):,} pooled domains): "
              f"{len(net_new & doms):,} of {len(net_new):,} net-new domains already "
              f"in the pool -> {len(net_new - doms):,} genuinely new to the program")


def report_dfs():
    p = os.path.join(RAW, "dfs-listings-2026-08-01.json")
    if not os.path.exists(p):
        print("[dfs] output not present yet")
        return
    d = json.load(open(p))
    recs = d["records"]
    m = d["measured"]
    print("\n" + "=" * 78)
    print("DFS BUSINESS LISTINGS")
    print("=" * 78)
    print(f"requests                  : {d['program']['requests']}  "
          f"cost ${d['api_cost_measured']:.4f}")
    print(f"raw rows                  : {m['raw_rows']:,}")
    print(f"distinct listings (cid)   : {m['distinct_listings_by_cid']:,}")
    print(f"distinct companies (norm) : {m['distinct_company_names_normalized']:,}")
    print(f"distinct domains          : {m['distinct_domains']:,}")
    print(f"website / phone / email   : {m['pct_with_website']}% / "
          f"{m['pct_with_phone']}% / {m['pct_with_email']}%")
    print(f"zip / street / claimed    : {m['pct_with_zip']}% / "
          f"{m['pct_with_street']}% / {m['pct_is_claimed']}%")
    print(f"Segment W (no website)    : {m['segment_w_candidates_no_website']:,}")
    print(f"auto/truck flagged        : {m['auto_truck_flagged']:,} "
          f"({m['auto_truck_flagged_by_category_id']:,} by category_id alone)")
    print(f"national-chain name flag  : {m['national_chain_name_flagged']:,}")
    print(f"mean category_ids/record  : {m['mean_category_ids_per_record']}")
    print(f"distinct category_ids     : {m['distinct_category_ids_seen']}")
    print(f"carries industrial_equipment_supplier: "
          f"{m['carries_industrial_equipment_supplier']:,}")

    # branch-stripped company count, the §2b lever
    by_cid = {}
    for r in recs:
        by_cid.setdefault(r["cid"] or f"{r['company_display']}|{r['address_full']}", r)
    uniq = list(by_cid.values())
    loose = {norm_name(r["company_display"], strip_branch=False) for r in uniq}
    strip = {norm_name(r["company_display"], strip_branch=True) for r in uniq}
    loose.discard("")
    strip.discard("")
    print(f"\ncompanies loose / branch-stripped: {len(loose):,} / {len(strip):,} "
          f"({100*(len(loose)-len(strip))/max(1,len(loose)):.1f}% collapse)")
    multi = Counter(norm_name(r["company_display"]) for r in uniq)
    big = [(n, c) for n, c in multi.most_common(15) if n]
    print("largest multi-location names (chain candidates for S2):")
    for n, c in big:
        print(f"  {c:>4}  {n}")

    print("\ntop source-native category_ids (§5e — captured verbatim, uninterpreted):")
    for c, n in list(m["category_id_histogram"].items())[:30]:
        print(f"  {n:>6}  {c}")

    # do any AUTOMOTIVE codes appear, and how much would decoding them cost us?
    auto = Counter()
    for r in uniq:
        for c in r["auto_truck_category_ids"]:
            auto[c] += 1
    print("\nautomotive/truck category_ids present in the haul "
          "(flagged, NOT dropped):")
    if auto:
        for c, n in auto.most_common(25):
            print(f"  {n:>6}  {c}")
    else:
        print("  none")

    doms, phones, names = load_pool()
    if doms:
        dfs_doms = {r["domain"] for r in uniq if r["domain"]}
        dfs_ph = {digits(r["phone"]) for r in uniq if digits(r["phone"])}
        dfs_nm = {norm_name(r["company_display"]) for r in uniq}
        dfs_nm.discard("")
        print(f"\noverlap with deduped-v4 (read-only):")
        print(f"  domains  {len(dfs_doms & doms):,} of {len(dfs_doms):,} "
              f"-> {len(dfs_doms - doms):,} new domains")
        print(f"  phones   {len(dfs_ph & phones):,} of {len(dfs_ph):,} "
              f"-> {len(dfs_ph - phones):,} new phones")
        print(f"  names    {len(dfs_nm & names):,} of {len(dfs_nm):,} "
              f"-> {len(dfs_nm - names):,} new names")
        joined = {r["cid"] for r in uniq
                  if (r["domain"] and r["domain"] in doms)
                  or (digits(r["phone"]) and digits(r["phone"]) in phones)}
        print(f"  listings matching the pool on domain OR phone: {len(joined):,} "
              f"of {len(uniq):,} ({100*len(joined)/max(1,len(uniq)):.1f}%)")


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    if which in ("all", "serp"):
        report_serp()
    if which in ("all", "dfs"):
        report_dfs()
