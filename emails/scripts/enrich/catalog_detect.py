#!/usr/bin/env python3
"""S3 task 1 -- e-commerce / cart detection, entirely from cached HTML.

Zero network. The line-card harvest already paid for ~2,185 homepage 200s and
1,240 line-card pages; this reads them again for a different question.

Why it matters commercially: the offer fixes catalogues. "Has a website, has
products, has no cart and no prices" is the sharpest prospect on the list --
sharper than a dealer already running Shopify. So the classifier is built to
separate those two, not to score "how modern is this site".

Output: emails/data/enrichment/_ecom-2026-08-01.json (intermediate; merged with
the sitemap pass by catalog_report.py).
"""
import argparse
import collections
import csv
import gzip
import hashlib
import importlib.util
import json
import os
import sys

CAPTURED = "2026-08-01"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ENRICH = os.path.join(ROOT, "data", "enrichment")
CACHE = os.path.join(ENRICH, "_cache")
LISTS = os.path.join(ROOT, "lists")

_s = importlib.util.spec_from_file_location(
    "catalog_signals", os.path.join(HERE, "catalog_signals.py"))
sig = importlib.util.module_from_spec(_s)
_s.loader.exec_module(sig)


def cache_path(url):
    return os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest() + ".gz")


def read_cache(url):
    p = cache_path(url)
    if not os.path.exists(p):
        return None
    try:
        with gzip.open(p, "rb") as f:
            return json.loads(f.read().decode("utf-8", "ignore"))
    except (OSError, ValueError):
        return None


def load_universe(lists, linecards):
    """Every domain we owe an answer for: the list(s) plus the SERP-only dealers.

    deduped-v2 is read-only and owned by another agent; a v3 may land mid-run,
    so v2 is pinned deliberately. Domains the line-card run reached that are
    not in v2 are still carried -- no record is ever dropped.
    """
    csv.field_size_limit(10 ** 7)
    uni = {}
    for path in lists:
        if not os.path.exists(path):
            path = os.path.join(ROOT, path)
        with open(path, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                d = (row.get("domain") or "").strip().lower()
                if not d:
                    continue
                rec = uni.setdefault(d, {"domain": d, "origins": set(),
                                         "company_display": None, "state": None})
                rec["origins"].add("list")
                if not rec["company_display"]:
                    rec["company_display"] = row.get("company_display") or None
                if not rec["state"]:
                    rec["state"] = row.get("state") or None

    lc_by_domain = {}
    for path in linecards:
        if not os.path.exists(path):
            path = os.path.join(ROOT, path)
        for r in json.load(open(path))["records"]:
            d = r["domain"]
            lc_by_domain[d] = r
            rec = uni.setdefault(d, {"domain": d, "origins": set(),
                                     "company_display": None, "state": None})
            rec["origins"].update(r.get("origins") or ["linecard"])
            if not rec["company_display"]:
                rec["company_display"] = r.get("company_display")
    for r in uni.values():
        r["origins"] = sorted(r["origins"])
    return uni, lc_by_domain


def pages_for(domain, lc_rec):
    """Cached page blobs for a domain, homepage first. Empty when nothing hit.

    Covers both caches: the line-card run's attempts, and the backfill pass's
    plain homepage for domains deduped-v2 added after that run.
    """
    urls, seen = [], set()
    for guess in ("https://%s/" % domain, "https://www.%s/" % domain):
        if os.path.exists(cache_path(guess)):
            seen.add(guess)
            urls.append(guess)
    if not lc_rec:
        return [(u, b) for u, b in ((u, read_cache(u)) for u in urls)
                if b and b.get("status") == 200]
    for a in lc_rec.get("attempts") or []:
        u = a.get("url")
        if u and a.get("status") == 200 and u not in seen:
            seen.add(u)
            urls.append(u)
    for u in (lc_rec.get("source_url"), lc_rec.get("linecard_url")):
        if u and u not in seen:
            seen.add(u)
            urls.append(u)
    out = []
    for u in urls:
        blob = read_cache(u)
        if blob and blob.get("status") == 200:
            out.append((u, blob))
    return out


def classify(domain, lc_rec):
    """Tiered evidence, then a class. Nulls survive; nothing is invented."""
    rec = {
        "domain": domain,
        "ecommerce_class": "unknown",
        "platform": None,
        "platform_source": None,
        "cart_signals": [],
        "price_signals": [],
        "product_signals": [],
        "quote_signals": [],
        "pages_scanned": 0,
        "html_bytes": 0,
        "detect_source_url": None,
        "detect_status": None,
        "detect_note": None,
        "captured": CAPTURED,
    }
    if lc_rec:
        rec["detect_status"] = lc_rec.get("homepage_status")
        if lc_rec.get("refused"):
            rec["detect_note"] = "refused (%s) -- recorded, not bypassed" % (
                lc_rec.get("homepage_status"))

    pages = pages_for(domain, lc_rec)
    if not pages:
        if not lc_rec:
            rec["detect_note"] = "no fetch attempted in the line-card run"
        elif not rec["detect_note"]:
            rec["detect_note"] = "no cached 200 (status %s)" % (
                lc_rec.get("homepage_status"))
        return rec

    cart, price, product, quote = set(), set(), set(), set()
    platform = None
    platform_url = None
    scanned = 0
    total_bytes = 0
    for url, blob in pages:
        html = blob.get("html")
        if not html:
            continue                      # PDF line cards carry no cart markup
        scanned += 1
        total_bytes += len(html)
        if rec["detect_source_url"] is None:
            rec["detect_source_url"] = blob.get("final_url") or url
        cart.update(sig.match_signals(html, sig.CART_SIGNALS))
        price.update(sig.match_signals(html, sig.PRICE_SIGNALS))
        product.update(sig.match_signals(html, sig.PRODUCT_SIGNALS))
        quote.update(sig.match_signals(html, sig.QUOTE_SIGNALS))
        if platform is None:
            found = sig.detect_platform(html)
            if found:
                platform, platform_url = found, url

    rec["pages_scanned"] = scanned
    rec["html_bytes"] = total_bytes
    rec["cart_signals"] = sorted(cart)
    rec["price_signals"] = sorted(price)
    rec["product_signals"] = sorted(product)
    rec["quote_signals"] = sorted(quote)
    rec["platform"] = platform
    rec["platform_source"] = platform_url

    if not scanned:
        rec["detect_note"] = "cached pages are PDF only -- no HTML to read"
        return rec

    # A lone `cart_widget` is the weakest cart signal (a stray `class="cart"`
    # on a WordPress theme fires it), so it needs corroboration.
    strong_cart = bool(cart - {"cart_widget"})
    has_cart = strong_cart or (
        "cart_widget" in cart and platform in sig.CART_BEARING)
    # A bare `$12.34` anywhere on a page is not a product price; require either
    # structured price markup or a literal price alongside product evidence.
    strong_price = bool(price - {"price_literal"})
    has_price = strong_price or ("price_literal" in price and bool(product))
    has_product = bool(product) or platform in sig.CART_BEARING

    if has_cart and has_price:
        rec["ecommerce_class"] = "ecom_full"
    elif has_cart and not has_price:
        rec["ecommerce_class"] = "catalog_no_cart"
        rec["detect_note"] = "cart present, no price markup (login/quote pricing)"
    elif has_product:
        rec["ecommerce_class"] = "catalog_no_cart"
    else:
        rec["ecommerce_class"] = "brochure"
    return rec


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(ENRICH, "_ecom-%s.json" % CAPTURED))
    ap.add_argument("--list", action="append", default=None,
                    help="CSV with a `domain` column; repeatable. "
                         "Default: lists/deduped-v2.csv")
    ap.add_argument("--linecards", action="append", default=None,
                    help="line-card harvest output; repeatable, later wins")
    args = ap.parse_args()

    uni, lc_by_domain = load_universe(
        args.list or [os.path.join(LISTS, "deduped-v2.csv")],
        args.linecards or [os.path.join(ENRICH, "linecards-%s.json" % CAPTURED)],
    )
    out = []
    for domain in sorted(uni):
        rec = classify(domain, lc_by_domain.get(domain))
        rec["origins"] = uni[domain]["origins"]
        rec["company_display"] = uni[domain]["company_display"]
        rec["state"] = uni[domain]["state"]
        out.append(rec)

    payload = {
        "stage": "s3-catalog-ecommerce",
        "captured": CAPTURED,
        "method": "offline pattern-match over the line-card run's HTTP cache",
        "network_calls": 0,
        "domains": len(out),
        "records": out,
    }
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=1)

    dist = collections.Counter(r["ecommerce_class"] for r in out)
    plat = collections.Counter(r["platform"] for r in out if r["platform"])
    print("domains %d -> %s" % (len(out), args.out))
    for k, v in dist.most_common():
        print("  %-16s %5d  %5.1f%%" % (k, v, 100 * v / len(out)))
    print("platforms detected: %d" % sum(plat.values()))
    for k, v in plat.most_common(15):
        print("  %-22s %4d" % (k, v))
    return 0


if __name__ == "__main__":
    sys.exit(main())
