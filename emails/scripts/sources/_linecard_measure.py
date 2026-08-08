#!/usr/bin/env python3
"""Measure every linecard-lane source against the pack's own decision rules.

One consistent pass over the raw payloads this lane produced, so the numbers in
the dossier all come from the same arithmetic instead of five per-script
variants. Reads only; writes one report JSON. Zero network.

What it computes per source, and why each one is here:

  * **website coverage** — the §5a criterion. Timken's 67.6% is the benchmark;
    the linecard log §2 fixed the band at >=55% = "at or near".
  * **distinct companies / with-domain companies** — a locator's real size.
    Rows flatter, companies do not (E4's Walter lesson: 12,368 rows -> 0 usable).
  * **net-new domains vs `lists/deduped-v7.csv`** — the master. NOTE: the
    per-source scripts looked for `data/deduped-v7.csv`, which does not exist,
    so their embedded `net_new_*` fields read "not found". THIS file is the
    authority for net-new; those fields are stale by construction.
  * **chain share** — E4 measured 77% of SKF's probe as five nationals. A
    net-new count that is mostly Motion/Fastenal branches is not 150 companies,
    it is five.
  * **source-native code distributions**, verbatim — and, where a code exists,
    whether it SORTS (§5i / the SKF lesson: a code you have not tested is not
    yet a signal).
"""
import csv
import json
import os
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402
from _polite import RAW, ROOT, apex, norm_company  # noqa: E402

MASTER = os.path.join(ROOT, "lists", "deduped-v7.csv")

# National chains / above-ceiling groups already suppressed elsewhere in the
# program (§5c, §2b, E4's SKF finding). Probe-level only — S2 owns the rule.
CHAINS = {
    "motion industries", "motion", "applied industrial technologies", "applied",
    "fastenal", "fastenal company", "grainger", "w w grainger", "msc direct",
    "msc industrial", "kaman industrial technologies", "kaman", "bdi",
    "ibt industrial solutions", "purvis industries", "hydradyne", "vallen",
    "vallen distribution", "wesco", "rexel", "mcmaster carr", "dxp enterprises",
    "dxp", "eis", "certex", "united central industrial supply", "sunsource",
    "singer industrial", "mi conveyance solutions", "bishop lifting products",
    "crane 1", "ace industries", "lift all company", "delta rigging & tools",
}

SOURCES = [
    # (token, raw file, website key, company key, code keys, us predicate)
    ("linecard-flexco", "linecard-flexco-2026-08-03.json", "weburl", "name",
     ["flexfirst"], lambda r: r.get("country") == "UNITED STATES OF AMERICA"),
    ("samsonrope", "samsonrope-2026-08-04.json", "Website", "AccountName",
     ["Industries", "Region"], lambda r: r.get("is_us")),
    ("cmco", "cmco-2026-08-04.json", "website", "company",
     ["distributorLevel", "certifications", "preferred", "locator"],
     lambda r: r.get("is_us")),
    ("ocenco", "ocenco-2026-08-04.json", "website", "company",
     ["market_raw"], lambda r: r.get("is_us")),
    ("linecard-chromalox", "linecard-chromalox-2026-08-03.json", None, None,
     [], None),
]


def load_master():
    have = set()
    if not os.path.exists(MASTER):
        return have, "MISSING"
    with open(MASTER, newline="", encoding="utf-8", errors="ignore") as fh:
        for row in csv.DictReader(fh):
            d = apex(row.get("domain") or row.get("website") or "")
            if d:
                have.add(d)
    return have, os.path.basename(MASTER)


def sorts(records, code_key, us_pred):
    """Does this source-native code actually SORT the records? (§5i/SKF.)

    A code sorts if its values partition the set unevenly enough to act as a
    filter — measured, not asserted. Returns the distribution plus the share
    held by the largest single value.
    """
    rows = [r for r in records if us_pred is None or us_pred(r)]
    dist = {}
    for r in rows:
        v = r.get(code_key)
        v = "|".join(map(str, v)) if isinstance(v, list) else (
            "(null)" if v in (None, "", False) else str(v))
        dist[v] = dist.get(v, 0) + 1
    if not dist:
        return {"values": {}, "distinct_values": 0, "verdict": "no values"}
    top = max(dist.values())
    n = sum(dist.values())
    nulls = dist.get("(null)", 0)
    verdict = ("SINGLE-VALUED — sorts nothing"
               if len(dist) <= 1 else
               f"{len(dist)} values; largest holds {top / n * 100:.1f}%; "
               f"null on {nulls / n * 100:.1f}% — "
               + ("usable as a filter" if nulls / n < 0.5 and len(dist) > 1
                  else "too sparse to filter on"))
    return {"values": dict(sorted(dist.items(), key=lambda kv: -kv[1])[:20]),
            "distinct_values": len(dist), "verdict": verdict}


def measure(token, fname, web_key, name_key, code_keys, us_pred, have):
    path = os.path.join(RAW, fname)
    if not os.path.exists(path):
        return {"token": token, "status": f"raw file missing: {fname}"}
    doc = json.load(open(path, encoding="utf-8"))
    records = doc.get("records") or []
    # samson's probe file kept its extra query under another key
    records = records + (doc.get("records_query_2") or [])
    out = {"token": token, "raw_file": fname, "rows_total": len(records)}
    if not records or not web_key:
        out["status"] = "no measurable records (no website field in payload)"
        out["pct_website"] = 0.0
        return out

    rows = [r for r in records if us_pred is None or us_pred(r)]
    n = len(rows) or 1
    out["rows_us"] = len(rows)
    web_rows = [r for r in rows if str(r.get(web_key) or "").strip()]
    out["pct_website"] = round(len(web_rows) / n * 100, 1)
    out["benchmark_67_6_verdict"] = (
        "AT/NEAR (>=55%)" if out["pct_website"] >= 55 else
        "MATERIALLY BELOW (<55%)")

    comp = {}
    for r in rows:
        k = norm_company(r.get(name_key))
        if k:
            comp.setdefault(k, []).append(r)
    out["distinct_companies"] = len(comp)
    with_dom = {k for k, rs in comp.items()
                if any(apex(x.get(web_key)) for x in rs)}
    out["companies_with_domain"] = len(with_dom)
    chains = sorted(set(comp) & CHAINS)
    out["chain_companies_matched"] = chains
    chain_rows = sum(len(comp[c]) for c in chains)
    out["chain_row_share_pct"] = round(chain_rows / n * 100, 1)

    domains = {apex(r.get(web_key)) for r in web_rows} - {None}
    out["distinct_domains"] = len(domains)
    new = domains - have
    out["net_new_domains"] = len(new)
    # chains are the flattering part of any net-new count — strip them
    new_nonchain = {d for d in new
                    if not any(c.replace(" ", "") in d.replace("-", "")
                               for c in chains)}
    out["net_new_domains_excl_matched_chains"] = len(new_nonchain)
    out["net_new_sample"] = sorted(new)[:25]

    out["codes"] = {ck: sorts(records, ck, us_pred) for ck in code_keys}
    return out


def main():
    have, master_name = load_master()
    print(f"master: {master_name} — {len(have)} domains\n")
    report = {"generated": "2026-08-04", "master": master_name,
              "master_domains": len(have), "sources": []}
    for token, fname, wk, nk, cks, pred in SOURCES:
        r = measure(token, fname, wk, nk, cks, pred, have)
        report["sources"].append(r)
        print(f"── {token}")
        for k in ("rows_total", "rows_us", "distinct_companies",
                  "companies_with_domain", "pct_website",
                  "benchmark_67_6_verdict", "distinct_domains",
                  "net_new_domains", "net_new_domains_excl_matched_chains",
                  "chain_row_share_pct", "status"):
            if k in r:
                print(f"   {k:38s} {r[k]}")
        for ck, cv in (r.get("codes") or {}).items():
            print(f"   code `{ck}`: {cv['verdict']}")
        print()

    out = os.path.join(RAW, "linecard-measure-2026-08-04.json")
    json.dump(report, open(out, "w"), indent=1)
    print(f"report -> {out}")


if __name__ == "__main__":
    main()
