#!/usr/bin/env python3
"""Merge the S3 catalog passes into one per-domain record, and report on it.

Inputs (all produced upstream, all keyed on apex domain):
  _ecom-<date>.json      task 1, offline cart/platform detection
  _sitemap-<date>.json   task 2, sitemap product-URL counts
  linecards-<date>.json  the prior run's brand counts (task 4's other axis)

Output: catalog-<date>.json -- the deliverable.

Two judgement calls are made here, both deliberately:

1. **Sitemap evidence can upgrade a class, never downgrade it.** A homepage
   that looks like a brochure while the sitemap lists 4,000 /product/ URLs is a
   catalogue whose front page happens to be marketing. The reverse -- a cart on
   the homepage and an empty sitemap -- proves nothing about the cart, so the
   class stands. This is the plan's "absence is not proof of absence" rule
   applied in the only direction it is safe to apply.

2. **`sku_estimate` stays null when nothing measured it.** No sitemap and no
   product links means unknown, not zero. A fabricated zero would push a real
   distributor under the floor.
"""
import argparse
import collections
import csv
import json
import os
import statistics
import sys

CAPTURED = "2026-08-01"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ENRICH = os.path.join(ROOT, "data", "enrichment")
LISTS = os.path.join(ROOT, "lists")

FLOOR_GENERAL = 1000      # Segment C, general MRO
FLOOR_SPECIALIST = 200    # Segments A/B, fluid power + bearings/PT


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _int(v):
    try:
        return int(str(v).strip())
    except (TypeError, ValueError):
        return None


def bucket(n):
    if n is None:
        return "unknown"
    for lo, hi, label in ((0, 0, "0"), (1, 49, "1-49"), (50, 199, "50-199"),
                          (200, 999, "200-999"), (1000, 4999, "1,000-4,999"),
                          (5000, 19999, "5,000-19,999")):
        if lo <= n <= hi:
            return label
    return "20,000+"


BUCKET_ORDER = ["0", "1-49", "50-199", "200-999", "1,000-4,999",
                "5,000-19,999", "20,000+", "unknown"]


def brand_bucket(n):
    if n is None:
        return "unknown"
    for lo, hi, label in ((0, 0, "0"), (1, 2, "1-2"), (3, 5, "3-5"),
                          (6, 10, "6-10"), (11, 20, "11-20"), (21, 40, "21-40")):
        if lo <= n <= hi:
            return label
    return "41+"


BRAND_ORDER = ["0", "1-2", "3-5", "6-10", "11-20", "21-40", "41+", "unknown"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(ENRICH, "catalog-%s.json" % CAPTURED))
    ap.add_argument("--ecom", default=os.path.join(ENRICH, "_ecom-%s.json" % CAPTURED))
    ap.add_argument("--sitemap", action="append", default=None,
                    help="sitemap pass output; repeatable, later wins")
    ap.add_argument("--linecards", action="append", default=None,
                    help="line-card harvest output; repeatable, later wins")
    ap.add_argument("--list", action="append", default=None,
                    help="CSV with a `domain` column; repeatable. "
                         "Default: lists/deduped-v2.csv")
    args = ap.parse_args()

    ecom = {r["domain"]: r for r in load(args.ecom)["records"]}
    smap = {}
    for sp in (args.sitemap or [os.path.join(ENRICH, "_sitemap-%s.json" % CAPTURED)]):
        if os.path.exists(sp):
            for r in load(sp)["records"]:
                smap[r["domain"]] = r
    lc = {}
    for p in (args.linecards or [os.path.join(ENRICH, "linecards-%s.json" % CAPTURED)]):
        for r in load(p)["records"]:
            lc[r["domain"]] = r

    csv.field_size_limit(10 ** 7)
    listed = {}
    for path in (args.list or [os.path.join(LISTS, "deduped-v2.csv")]):
        if not os.path.exists(path):
            path = os.path.join(ROOT, path)
        with open(path, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                d = (row.get("domain") or "").strip().lower()
                if d:
                    listed.setdefault(d, row)

    out = []
    for domain in sorted(ecom):
        e = ecom[domain]
        s = smap.get(domain, {})
        b = lc.get(domain, {})
        row = listed.get(domain, {})

        klass = e["ecommerce_class"]
        note = e.get("detect_note")
        product_urls = s.get("product_urls") or 0
        sku = s.get("sku_estimate")

        # Rule 1: sitemap evidence upgrades, never downgrades.
        if product_urls >= 5 and klass in ("brochure", "unknown"):
            klass = "catalog_no_cart"
            note = ((note + "; ") if note else "") + (
                "upgraded from %s on %d product URLs in the sitemap"
                % (e["ecommerce_class"], product_urls))

        # Rule 2: no measurement means null, never zero.
        method = s.get("sku_method") or "none"
        conf = s.get("sku_confidence")
        if method == "none" or sku is None:
            sku, conf, method = None, None, "none"
        elif sku == 0 and klass == "brochure":
            conf = "medium"           # consistent with the HTML: no catalogue
        elif sku == 0:
            # A catalogue we can see in HTML but not in the sitemap: the
            # sitemap is category-only, or the catalogue is JS-rendered.
            sku, conf, method = None, None, "sitemap_no_product_urls"

        out.append({
            "domain": domain,
            "company_display": e.get("company_display") or row.get("company_display"),
            "state": e.get("state") or (row.get("state") or None),
            "origins": e.get("origins"),
            "in_deduped_v2": domain in listed,

            "ecommerce_class": klass,
            "ecommerce_class_raw": e["ecommerce_class"],
            "platform": e.get("platform"),
            "cart_signals": e.get("cart_signals"),
            "price_signals": e.get("price_signals"),
            "product_signals": e.get("product_signals"),
            "quote_signals": e.get("quote_signals"),
            "pages_scanned": e.get("pages_scanned"),
            "detect_status": e.get("detect_status"),
            "detect_note": note,

            "sku_estimate": sku,
            "sku_method": method,
            "sku_confidence": conf,
            "sitemap_url": s.get("sitemap_url"),
            "sitemap_kind": s.get("sitemap_kind"),
            "sitemap_urls_seen": s.get("sitemap_urls_seen"),
            "sitemap_product_urls": s.get("product_urls"),
            "sitemap_product_patterns": s.get("product_patterns"),
            "sitemap_children_total": s.get("children_total"),
            "sitemap_children_fetched": s.get("children_fetched"),
            "sitemap_extrapolated": s.get("extrapolated"),
            "sitemap_status": s.get("sitemap_status"),
            "robots_status": s.get("robots_status"),
            "sitemap_error": s.get("error"),
            "refused": bool(e.get("detect_note") and "refused" in
                            (e.get("detect_note") or "")) or bool(s.get("refused")),

            "brand_count": b.get("brand_count"),
            "brands": b.get("brands"),
            "linecard_url": b.get("linecard_url"),
            # Carried read-only from the list so task 4 can cross-tab breadth
            # against the only size proxy S2 actually measured.
            "location_count": _int(row.get("location_count")),

            "source_url": e.get("detect_source_url") or s.get("sitemap_url")
            or (b.get("source_url") if b else None),
            "captured": CAPTURED,
        })

    payload = {
        "stage": "s3-qualification-catalog",
        "captured": CAPTURED,
        "inputs": {
            "ecom": os.path.basename(args.ecom),
            "sitemap": [os.path.basename(p) for p in
                        (args.sitemap or ["_sitemap-%s.json" % CAPTURED])],
            "linecards": [os.path.basename(p) for p in
                          (args.linecards or ["linecards-%s.json" % CAPTURED])],
            "list": [os.path.basename(p) for p in
                     (args.list or ["lists/deduped-v2.csv (read-only, pinned)"])],
        },
        "floors": {"segment_c_general_mro": FLOOR_GENERAL,
                   "segment_a_b_specialist": FLOOR_SPECIALIST},
        "caveat": ("Absence of detection is never proof of absence. These fields "
                   "tier evidence; they must not set disposition on their own."),
        "domains": len(out),
        "records": out,
    }
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=1)
    report(out, args.out)
    return 0


def pct(n, d):
    return "%5.1f%%" % (100.0 * n / d) if d else "    -"


def report(out, path):
    n = len(out)
    print("\n== catalog-%s.json: %d domains -> %s" % (CAPTURED, n, path))

    print("\n-- e-commerce class")
    dist = collections.Counter(r["ecommerce_class"] for r in out)
    for k in ("ecom_full", "catalog_no_cart", "brochure", "unknown"):
        print("  %-16s %5d  %s" % (k, dist[k], pct(dist[k], n)))
    up = sum(1 for r in out if r["ecommerce_class"] != r["ecommerce_class_raw"])
    print("  (of which upgraded by sitemap evidence: %d)" % up)

    print("\n-- platform (detected)")
    plat = collections.Counter(r["platform"] for r in out if r["platform"])
    print("  any platform    %5d  %s" % (sum(plat.values()), pct(sum(plat.values()), n)))
    for k, v in plat.most_common(12):
        print("    %-22s %4d" % (k, v))

    print("\n-- sku_estimate")
    known = [r["sku_estimate"] for r in out if r["sku_estimate"] is not None]
    bdist = collections.Counter(bucket(r["sku_estimate"]) for r in out)
    for k in BUCKET_ORDER:
        print("  %-14s %5d  %s" % (k, bdist[k], pct(bdist[k], n)))
    if known:
        known.sort()
        print("  measured n=%d  median=%d  p75=%d  p90=%d  max=%d" % (
            len(known), statistics.median(known),
            known[int(0.75 * (len(known) - 1))], known[int(0.90 * (len(known) - 1))],
            known[-1]))
    mdist = collections.Counter(r["sku_method"] for r in out)
    print("  method:", dict(mdist))
    cdist = collections.Counter(r["sku_confidence"] for r in out)
    print("  confidence:", dict(cdist))

    print("\n-- against the decided floors (evidence only, sets no disposition)")
    for label, floor in (("specialist A/B >=%d" % FLOOR_SPECIALIST, FLOOR_SPECIALIST),
                         ("general MRO C >=%d" % FLOOR_GENERAL, FLOOR_GENERAL)):
        over = sum(1 for r in out if (r["sku_estimate"] or 0) >= floor)
        under = sum(1 for r in out if r["sku_estimate"] is not None
                    and r["sku_estimate"] < floor)
        unk = sum(1 for r in out if r["sku_estimate"] is None)
        print("  %-22s over %4d | under %4d | unmeasured %4d" % (label, over, under, unk))

    print("\n-- brand count x e-commerce class (task 4)")
    xt = collections.defaultdict(collections.Counter)
    for r in out:
        xt[brand_bucket(r["brand_count"])][r["ecommerce_class"]] += 1
    hdr = ["ecom_full", "catalog_no_cart", "brochure", "unknown"]
    print("  %-8s %6s %16s %10s %9s %8s" % ("brands", "n", *hdr[1:2], "brochure", "unknown", "ecom%"))
    for k in BRAND_ORDER:
        row = xt.get(k)
        if not row:
            continue
        tot = sum(row.values())
        print("  %-8s %6d %16d %10d %9d %7s" % (
            k, tot, row["catalog_no_cart"], row["brochure"], row["unknown"],
            pct(row["ecom_full"], tot).strip()))

    print("\n-- brand count x sku_estimate (task 4)")
    print("  %-8s %6s %10s %10s %10s %8s" % (
        "brands", "n", "measured", "median", "p75", ">=1000"))
    for k in BRAND_ORDER:
        grp = [r for r in out if brand_bucket(r["brand_count"]) == k]
        if not grp:
            continue
        vals = sorted(r["sku_estimate"] for r in grp if r["sku_estimate"] is not None)
        med = statistics.median(vals) if vals else None
        p75 = vals[int(0.75 * (len(vals) - 1))] if vals else None
        big = sum(1 for r in grp if (r["sku_estimate"] or 0) >= FLOOR_GENERAL)
        print("  %-8s %6d %10d %10s %10s %7s" % (
            k, len(grp), len(vals),
            "%d" % med if med is not None else "-",
            "%d" % p75 if p75 is not None else "-",
            pct(big, len(grp)).strip()))

    sweet_spot(out)
    return 0


# The chain / above-ceiling rule S2 settled on: >=20 distinct addresses is
# above the $75M revenue ceiling, whatever the name says.
CEILING_LOCATIONS = 20


def sweet_spot(out):
    """Task 4 -- is breadth monotonic? Test it against the size proxy.

    The line-card run found the deepest cards (65-96 brands) on catalogue
    houses above the ceiling, the same inversion Adaptall's `premier` tier
    showed. So breadth is cross-tabbed against `location_count` -- the only
    size proxy S2 actually measured -- rather than assumed to be good.
    """
    print("\n-- task 4: breadth vs size vs commerce (is 'more brands' better?)")
    print("  %-8s %6s %9s %8s %9s %9s %9s" % (
        "brands", "n", "med locs", ">=20loc", "med SKU", "no-cart%", "ecom%"))
    bands = [(0, 0), (1, 2), (3, 5), (6, 10), (11, 20), (21, 40), (41, 64),
             (65, 10 ** 6)]
    rows = []
    for lo, hi in bands:
        grp = [r for r in out if r["brand_count"] is not None
               and lo <= r["brand_count"] <= hi]
        if not grp:
            continue
        locs = sorted(r["location_count"] for r in grp
                      if r["location_count"] is not None)
        skus = sorted(r["sku_estimate"] for r in grp if r["sku_estimate"] is not None)
        over = sum(1 for r in grp if (r["location_count"] or 0) >= CEILING_LOCATIONS)
        nocart = sum(1 for r in grp if r["ecommerce_class"] == "catalog_no_cart")
        full = sum(1 for r in grp if r["ecommerce_class"] == "ecom_full")
        label = "%d-%d" % (lo, hi) if hi < 10 ** 6 else "%d+" % lo
        rows.append((label, len(grp), locs, skus, over, nocart, full))
        print("  %-8s %6d %9s %7s %9s %8s %8s" % (
            label, len(grp),
            "%.1f" % statistics.median(locs) if locs else "-",
            pct(over, len(grp)).strip(),
            "%d" % statistics.median(skus) if skus else "-",
            pct(nocart, len(grp)).strip(), pct(full, len(grp)).strip()))

    print("\n  ICP-fit score per band = share that are catalog_no_cart AND")
    print("  under the location ceiling AND clear the specialist floor (>=%d)."
          % FLOOR_SPECIALIST)
    print("  %-8s %6s %10s %10s" % ("brands", "n", "fit n", "fit %"))
    for lo, hi in bands:
        grp = [r for r in out if r["brand_count"] is not None
               and lo <= r["brand_count"] <= hi]
        if not grp:
            continue
        fit = [r for r in grp
               if r["ecommerce_class"] == "catalog_no_cart"
               and (r["location_count"] or 0) < CEILING_LOCATIONS
               and (r["sku_estimate"] or 0) >= FLOOR_SPECIALIST]
        label = "%d-%d" % (lo, hi) if hi < 10 ** 6 else "%d+" % lo
        print("  %-8s %6d %10d %9s" % (label, len(grp), len(fit),
                                       pct(len(fit), len(grp)).strip()))


if __name__ == "__main__":
    sys.exit(main())
