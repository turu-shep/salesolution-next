#!/usr/bin/env python3
"""Measured report over `data/raw/usaspending-2026-08-01.json`.

Every number here is counted off the written file. Nothing is restated from an
estimate (`01-build-plan.md` §7 risk 1).
"""
import json
import os
import sys
from collections import Counter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "data", "raw")

# Codes we flagged at query time.
FLAG_CONSTRUCTION = {"423810"}
FLAG_TRANSPORT = {"423860"}

# Wrong-vertical NAICS prefixes for the contamination read over the FULL profile
# (phase D), not just our ten query codes. §5f named construction (20.5% of the
# DFS pool) and §5e named truck/auto (21.5% of the locator pool).
CONSTRUCTION_PREFIX = ("236", "237", "238", "23")          # construction sectors
CONSTRUCTION_EXTRA = {"423320", "423330", "423310", "444110", "444190", "327",
                      "423810", "444"}
TRANSPORT_PREFIX = ("484", "485", "486", "487", "488", "3361", "3362", "3363")
TRANSPORT_EXTRA = {"423860", "423110", "423120", "441", "811111", "811121"}


def is_construction(code):
    c = str(code)
    return c.startswith(("236", "237", "238")) or c in CONSTRUCTION_EXTRA \
        or c.startswith("3273") or c.startswith("4233")


def is_transport(code):
    c = str(code)
    return c.startswith(TRANSPORT_PREFIX) or c in TRANSPORT_EXTRA \
        or c.startswith("4411") or c.startswith("4412")


def pct(n, d):
    return f"{n / d * 100:.1f}%" if d else "n/a"


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        RAW, "usaspending-2026-08-01.json")
    payload = json.load(open(path))
    recs = payload["records"]
    n = len(recs)
    scoped = [r for r in recs if r["in_scope"]]
    detailed = [r for r in recs if r["has_detail"]]
    ns = len(scoped) or 1
    nd = len(detailed) or 1

    print("=" * 74)
    print("USASPENDING.GOV — MEASURED REPORT")
    print("=" * 74)
    gt = payload.get("ground_truth_award_counts", {})
    print(f"\nNAICS queried ({len(payload['naics_queried'])}):")
    for code, meta in payload["naics_queried"].items():
        g = gt.get(code, {})
        print(f"  {code}  {meta['vertical_flag']:<18} awards all={g.get('all')}"
              f"  >=$25k={g.get('floor')}   {meta['description'][:52]}")

    print(f"\nDistinct companies (deduped UEI, else name+zip5): {n}")
    print(f"  in scope (detail pulled):     {len(scoped)}")
    print(f"  with recipient-detail record: {len(detailed)}")
    fv = sum(1 for r in recs if "award" in r["found_via"])
    fc = sum(1 for r in recs if "category" in r["found_via"])
    fb = sum(1 for r in recs if len(r["found_via"]) == 2)
    print(f"  found via award harvest:      {fv}")
    print(f"  found via recipient rollup:   {fc}")
    print(f"  found via both:               {fb}")

    print("\n── FILL RATES (all records) ──")
    for label, key in (("company_display", "company_display"), ("UEI", "uei"),
                       ("DUNS", "duns"), ("street address_1", "address_1"),
                       ("city", "city"), ("state", "state"), ("zip5", "zip5"),
                       ("county", "county_name"), ("congressional", "congressional_code"),
                       ("domain (website)", "domain"), ("email", "email"),
                       ("phone", "phone_e164")):
        k = sum(1 for r in recs if r.get(key))
        print(f"  {label:<22} {k:>6}  {pct(k, n)}")

    print("\n── FILL RATES (in-scope / detail-pulled only) ──")
    for label, key in (("street address_1", "address_1"), ("zip5", "zip5"),
                       ("county", "county_name"), ("business_types", "business_types")):
        k = sum(1 for r in detailed if r.get(key))
        print(f"  {label:<22} {k:>6}  {pct(k, nd)}")

    print("\n── BUSINESS-TYPE FLAGS (records with a detail record: "
          f"{len(detailed)}) ──")
    flags = Counter()
    for r in detailed:
        for f in r.get("business_types") or []:
            flags[f] += 1
    sb = sum(1 for r in detailed if r["is_small_business"])
    otsb = sum(1 for r in detailed if "other_than_small_business" in (r.get("business_types") or []))
    print(f"  small_business              {sb:>6}  {pct(sb, nd)}")
    print(f"  other_than_small_business   {otsb:>6}  {pct(otsb, nd)}")
    for f, c in flags.most_common(24):
        if f in ("small_business", "other_than_small_business"):
            continue
        print(f"  {f:<40} {c:>6}  {pct(c, nd)}")

    print("\n── NAICS DISTRIBUTION (our 10 query codes; a company can carry many) ──")
    qd = Counter()
    for r in recs:
        for c in r["naics_codes_queried"]:
            qd[c] += 1
    for c, k in qd.most_common():
        print(f"  {c}  {k:>6}  {pct(k, n)}   "
              f"{payload['naics_queried'].get(c, {}).get('vertical_flag', '')}")
    multi = Counter(len(r["naics_codes_queried"]) for r in recs)
    print("  codes per company: " + ", ".join(f"{k}:{v}" for k, v in sorted(multi.items())))

    print("\n── CONTAMINATION: construction + transport ──")
    cflag = sum(1 for r in recs if set(r["naics_codes_queried"]) & FLAG_CONSTRUCTION)
    tflag = sum(1 for r in recs if set(r["naics_codes_queried"]) & FLAG_TRANSPORT)
    conly = sum(1 for r in recs if set(r["naics_codes_queried"]) <= FLAG_CONSTRUCTION
                and r["naics_codes_queried"])
    tonly = sum(1 for r in recs if set(r["naics_codes_queried"]) <= FLAG_TRANSPORT
                and r["naics_codes_queried"])
    print(f"  carry 423810 construction:        {cflag:>6}  {pct(cflag, n)}")
    print(f"    ...and NOTHING else (seat=no):  {conly:>6}  {pct(conly, n)}")
    print(f"  carry 423860 transport:           {tflag:>6}  {pct(tflag, n)}")
    print(f"    ...and NOTHING else (seat=no):  {tonly:>6}  {pct(tonly, n)}")

    prof = [r for r in recs if r["naics_profile_complete"]]
    np_ = len(prof) or 1
    if prof:
        pc = sum(1 for r in prof if any(is_construction(c) for c in r["naics_codes"]))
        pt = sum(1 for r in prof if any(is_transport(c) for c in r["naics_codes"]))
        both = sum(1 for r in prof if any(is_construction(c) for c in r["naics_codes"])
                   and any(is_transport(c) for c in r["naics_codes"]))
        print(f"\n  FULL NAICS PROFILE pulled for {len(prof)} companies "
              f"({pct(len(prof), n)} of all):")
        print(f"    any construction-sector NAICS anywhere:  {pc:>6}  {pct(pc, np_)}")
        print(f"    any transport-sector NAICS anywhere:     {pt:>6}  {pct(pt, np_)}")
        print(f"    both:                                     {both:>6}  {pct(both, np_)}")
        allcodes = Counter()
        for r in prof:
            for c in r["naics_codes"]:
                allcodes[c] += 1
        print(f"    distinct NAICS codes seen across profiles: {len(allcodes)}")
        print("    top 15 codes outside our query set:")
        qs = set(payload["naics_queried"])
        for c, k in [(c, k) for c, k in allcodes.most_common() if c not in qs][:15]:
            name = ""
            for r in prof:
                if c in r["naics_codes"] and r["naics_codes"][c]:
                    name = r["naics_codes"][c]
                    break
            print(f"      {c}  {k:>5}  {pct(k, np_):>6}  {name[:50]}")
        breadth = Counter(min(len(r["naics_codes"]), 20) for r in prof)
        print("    NAICS codes per company (profiled): "
              + ", ".join(f"{k}:{v}" for k, v in sorted(breadth.items())))

    print("\n── PSC (what was actually bought) — free vertical evidence ──")
    psc = Counter()
    for r in recs:
        for c, d in (r.get("psc_codes") or {}).items():
            psc[(c, d[:44])] += 1
    npsc = sum(1 for r in recs if r.get("psc_codes"))
    print(f"  companies with >=1 PSC code: {npsc}  {pct(npsc, n)}")
    for (c, d), k in psc.most_common(15):
        print(f"    {c}  {k:>5}  {d}")

    print("\n── AWARD VALUE — the revenue-band proxy ──")
    vals = sorted((r["cumulative_award_value"] or 0) for r in recs)
    def q(p):
        return vals[min(int(len(vals) * p), len(vals) - 1)] if vals else 0
    print(f"  min ${vals[0]:,.0f} | p25 ${q(.25):,.0f} | median ${q(.5):,.0f} | "
          f"p75 ${q(.75):,.0f} | p90 ${q(.90):,.0f} | max ${vals[-1]:,.0f}")
    bands = [(0, 25e3), (25e3, 100e3), (100e3, 500e3), (500e3, 2e6), (2e6, 10e6),
             (10e6, 75e6), (75e6, float("inf"))]
    for lo, hi in bands:
        k = sum(1 for v in vals if lo <= v < hi)
        hs = "inf" if hi == float("inf") else f"{hi:,.0f}"
        print(f"    ${lo:,.0f}–${hs:<12} {k:>6}  {pct(k, n)}")
    neg = sum(1 for v in vals if v < 0)
    print(f"  net-negative cumulative (deobligations exceed awards): {neg}")

    tot = [r["total_federal_transaction_amount"] for r in detailed
           if r.get("total_federal_transaction_amount") is not None]
    if tot:
        tot.sort()
        print(f"\n  TOTAL federal spend (all NAICS, from recipient detail), "
              f"n={len(tot)}:")
        print(f"    median ${tot[len(tot)//2]:,.0f} | p90 "
              f"${tot[int(len(tot)*.9)]:,.0f} | max ${tot[-1]:,.0f}")
        # Does the small-business flag separate the value distribution?
        sbv = sorted(r["total_federal_transaction_amount"] for r in detailed
                     if r["is_small_business"]
                     and r.get("total_federal_transaction_amount") is not None)
        lgv = sorted(r["total_federal_transaction_amount"] for r in detailed
                     if "other_than_small_business" in (r.get("business_types") or [])
                     and r.get("total_federal_transaction_amount") is not None)
        if sbv and lgv:
            print(f"    small_business       n={len(sbv):<5} median "
                  f"${sbv[len(sbv)//2]:,.0f}  p90 ${sbv[int(len(sbv)*.9)]:,.0f}")
            print(f"    other_than_small     n={len(lgv):<5} median "
                  f"${lgv[len(lgv)//2]:,.0f}  p90 ${lgv[int(len(lgv)*.9)]:,.0f}")

    print("\n── DATE RANGE (award-harvest records only) ──")
    fa = [r["first_award_date"] for r in recs if r.get("first_award_date")]
    la = [r["last_award_date"] for r in recs if r.get("last_award_date")]
    print(f"  companies with a date range: {len(fa)}  {pct(len(fa), n)}")
    if fa:
        print(f"  earliest first_award {min(fa)} | latest last_award {max(la)}")
        recent = sum(1 for d in la if d >= "2024-01-01")
        print(f"  last award on/after 2024-01-01: {recent}  {pct(recent, len(la))}")

    print("\n── AGENCIES (personalization fuel) ──")
    ag = Counter()
    for r in recs:
        for a in (r.get("awarding_sub_agencies") or {}):
            ag[a] += 1
    for a, k in ag.most_common(10):
        print(f"    {a[:52]:<54} {k:>5}")
    withdesc = sum(1 for r in recs if r.get("award_descriptions"))
    print(f"  companies with >=1 award description: {withdesc}  {pct(withdesc, n)}")

    print("\n── DEDUPE ──")
    byuei = sum(1 for r in recs if r.get("uei"))
    dupes = sum(len(r.get("_dupe_recipient_ids", [])) for r in recs)
    print(f"  keyed on UEI:            {byuei}  {pct(byuei, n)}")
    print(f"  keyed on name+zip5:      {n - byuei}  {pct(n - byuei, n)}")
    print(f"  collapsed duplicate recipient_ids: {dupes}")
    print(f"  US records: {sum(1 for r in recs if r['is_us'])}  "
          f"non-US/unknown: {sum(1 for r in recs if not r['is_us'])}")
    print("=" * 74)


if __name__ == "__main__":
    main()
