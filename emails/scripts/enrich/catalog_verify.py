#!/usr/bin/env python3
"""S3 task 3 -- does `sku_estimate` actually track the visible catalogue?

The floors (>=1,000 general MRO, >=200 specialist) are only safe to apply
mechanically if the proxy is accurate. This measures it two ways on a
stratified sample:

  A. **URL precision.** Sample URLs the sitemap counted as products and fetch
     them. A real product page carries at least one of: schema.org/Product,
     an add-to-cart or add-to-quote control, price markup, or a part-number
     label. Precision = the share that do.

  B. **Count agreement.** Fetch the catalogue root and read the dealer's own
     rendered total ("1-24 of 3,812 products", "Showing all 47 results").
     Where the site publishes one, that is independent ground truth for the
     magnitude of `sku_estimate`.

Neither is a substitute for looking. The output is written for a human to
adjudicate -- it names the failure mode per domain rather than emitting a
single accuracy number and hiding the cases that produced it.
"""
import argparse
import collections
import gzip
import hashlib
import io
import json
import os
import random
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

CAPTURED = "2026-08-01"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ENRICH = os.path.join(ROOT, "data", "enrichment")
CACHE = os.path.join(ENRICH, "_verify_cache")

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
HOST_DELAY = 3.0
TIMEOUT = 15
MAX_BYTES = 4_000_000

LOC_RX = re.compile(r"<loc>\s*(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?\s*</loc>", re.I | re.S)
PRODUCT_PAGE_MARKERS = [
    ("schema_product", re.compile(
        r'"@type"\s*:\s*"Product"|itemtype=["\'][^"\']*schema\.org/Product', re.I)),
    ("add_control", re.compile(
        r"add[-_\s]?to[-_\s]?(?:cart|basket|quote|rfq)|addtocart", re.I)),
    ("price_markup", re.compile(
        r'itemprop=["\']price|"priceCurrency"|class=["\'][^"\']*\bprice\b', re.I)),
    ("part_number", re.compile(
        r"\b(?:part\s*(?:#|no\.?|number)|item\s*(?:#|no\.?|number)|sku|mfr\.?\s*part)\b",
        re.I)),
    ("qty_input", re.compile(
        r'name=["\'](?:qty|quantity|Quantity)["\']|id=["\']qty', re.I)),
]
# "1-24 of 3,812 products"  /  "Showing all 47 results"  /  "3,812 items found"
COUNT_RX = [
    re.compile(r"of\s+([\d,]{2,9})\s+(?:results?|products?|items?|parts?)", re.I),
    re.compile(r"showing\s+all\s+([\d,]{2,9})\s+(?:results?|products?|items?)", re.I),
    re.compile(r"([\d,]{2,9})\s+(?:products?|items?|parts?|results?)\s+found", re.I),
    re.compile(r"found\s+([\d,]{2,9})\s+(?:products?|items?|parts?|results?)", re.I),
    re.compile(r"([\d,]{3,9})\s+(?:products?|items?|parts?)\s+(?:in stock|available)", re.I),
]
TAG_RX = re.compile(r"<(script|style|noscript|svg)[^>]*>.*?</\1>", re.S | re.I)

_lock = threading.Lock()
_next = {}


def throttle(host):
    while True:
        with _lock:
            now = time.monotonic()
            nxt = _next.get(host, 0.0)
            if now >= nxt:
                _next[host] = now + HOST_DELAY
                return
            wait = nxt - now
        time.sleep(min(wait, 5.0))


def cache_path(url):
    return os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest() + ".gz")


def fetch(url):
    cp = cache_path(url)
    if os.path.exists(cp):
        try:
            with gzip.open(cp, "rb") as f:
                return json.loads(f.read().decode("utf-8", "ignore"))
        except (OSError, ValueError):
            pass
    host = urllib.parse.urlsplit(url).netloc.lower()
    throttle(host)
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Accept": "text/html,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9", "Accept-Encoding": "gzip"})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            raw = r.read(MAX_BYTES)
            if (r.headers.get("Content-Encoding") or "").lower() == "gzip":
                try:
                    raw = gzip.GzipFile(fileobj=io.BytesIO(raw)).read()
                except OSError:
                    pass
            blob = {"status": r.status, "final_url": r.geturl(),
                    "html": raw.decode("utf-8", "ignore")}
    except urllib.error.HTTPError as e:
        blob = {"status": e.code, "html": "", "error": "HTTP %d" % e.code}
    except Exception as e:
        blob = {"status": None, "html": "", "error": repr(e)[:120]}
    os.makedirs(CACHE, exist_ok=True)
    try:
        with gzip.open(cp, "wb") as f:
            f.write(json.dumps(blob).encode())
    except OSError:
        pass
    return blob


def visible(html):
    t = TAG_RX.sub(" ", html)
    t = re.sub(r"<[^>]+>", " ", t)
    for a, b in (("&nbsp;", " "), ("&amp;", "&"), ("&#8217;", "'")):
        t = t.replace(a, b)
    return re.sub(r"\s+", " ", t)


H1_RX = re.compile(r"<h1[^>]*>(.*?)</h1>", re.I | re.S)
TITLE_RX = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
HREF_RX = re.compile(r"""href=["']([^"']+)["']""", re.I)
SPEC_RX = re.compile(
    r"\b(?:specifications?|spec sheet|datasheet|data sheet|technical data|"
    r"model\s*(?:#|no\.?|number)|dimensions)\b", re.I)


def check_product_page(url):
    """Is this URL a single product page, a category listing, or neither?

    The first version of this only looked for e-commerce markup, and scored
    airoil.com and heqingele.com at 0% precision when every sampled URL was in
    fact an individual product page -- they just have no cart, no prices and no
    schema.org. That is our target profile, so a validator that calls it "not a
    product" is measuring the wrong thing.

    Two additions fix it:
      * `title_match` -- the URL's own slug words appear in the <title>/<h1>,
        i.e. the page is *about* that part.
      * `listing` -- the page links to many sibling product URLs, which makes
        it a category page. That is the real over-count mode and it now gets
        named instead of being silently scored as a hit.
    """
    blob = fetch(url)
    if blob.get("status") != 200 or not blob.get("html"):
        return {"url": url, "status": blob.get("status"),
                "is_product": None, "kind": None, "markers": [],
                "error": blob.get("error") or "no body"}
    html = blob["html"]
    markers = [n for n, rx in PRODUCT_PAGE_MARKERS if rx.search(html)]

    import importlib.util
    _s = importlib.util.spec_from_file_location(
        "catalog_signals", os.path.join(HERE, "catalog_signals.py"))
    sig = importlib.util.module_from_spec(_s)
    _s.loader.exec_module(sig)

    leaf = urllib.parse.urlsplit(url).path.rstrip("/").rsplit("/", 1)[-1]
    leaf = re.sub(r"\.(?:html?|asp|aspx|php|jsp|shtml)$", "", leaf, flags=re.I)
    tokens = [t for t in re.split(r"[-_]+", leaf.lower()) if len(t) > 2]
    head = " ".join(TITLE_RX.findall(html)[:1] + H1_RX.findall(html)[:1]).lower()
    head = re.sub(r"<[^>]+>", " ", head)
    hits = sum(1 for t in tokens if t in head)
    title_match = bool(tokens) and hits >= max(1, len(tokens) // 2)
    if title_match:
        markers.append("title_match")
    if SPEC_RX.search(html):
        markers.append("spec_table")

    siblings = 0
    for href in HREF_RX.findall(html):
        full = urllib.parse.urljoin(url, href)
        if full != url and sig.classify_product_url(full):
            siblings += 1
    listing = siblings >= 15
    if listing:
        markers.append("listing(%d)" % siblings)

    mset = set(markers)
    # Sibling count alone is a bad discriminator: real product pages carry
    # related-item carousels (westermans.com links 38 siblings from a single
    # welder page). Single-product evidence therefore outranks it.
    if {"schema_product", "qty_input"} & mset and "title_match" in mset:
        kind = "product"
    elif siblings >= 100 and "schema_product" not in mset:
        kind = "listing"
    elif listing and "title_match" not in mset:
        kind = "listing"
    elif "title_match" in mset and (
            mset & {"part_number", "price_markup", "spec_table", "add_control"}):
        kind = "product"
    elif {"schema_product", "qty_input"} & mset:
        kind = "product"
    else:
        kind = "other"
    return {"url": url, "status": 200, "is_product": kind == "product",
            "kind": kind, "siblings": siblings, "markers": markers,
            "error": None}


def visible_count(domain, rec):
    """The dealer's own rendered catalogue total, when they publish one."""
    roots = []
    base = "https://%s" % domain
    for path in ("/shop/", "/products/", "/catalog/", "/store/", "/parts/",
                 "/product-category/", "/collections/all", "/"):
        roots.append(base + path)
    out = []
    for u in roots[:4]:
        blob = fetch(u)
        if blob.get("status") != 200 or not blob.get("html"):
            continue
        text = visible(blob["html"])
        for rx in COUNT_RX:
            m = rx.search(text)
            if m:
                try:
                    n = int(m.group(1).replace(",", ""))
                except ValueError:
                    continue
                if n >= 5:
                    s = max(0, m.start() - 50)
                    out.append({"url": blob.get("final_url") or u, "count": n,
                                "quote": text[s:m.end() + 30]})
                    break
        if out:
            break
    return out[0] if out else None


def sample_product_urls(rec, k, rng):
    """Pull URLs the sitemap pass counted as products, straight from cache."""
    smurl = rec.get("sitemap_url")
    if not smurl:
        return []
    import importlib.util
    _s = importlib.util.spec_from_file_location(
        "catalog_signals", os.path.join(HERE, "catalog_signals.py"))
    sig = importlib.util.module_from_spec(_s)
    _s.loader.exec_module(sig)
    sm_cache = os.path.join(ENRICH, "_sitemap_cache")

    def read(u):
        p = os.path.join(sm_cache, hashlib.sha1(u.encode()).hexdigest() + ".gz")
        if not os.path.exists(p):
            return None
        try:
            with gzip.open(p, "rb") as f:
                return json.loads(f.read().decode("utf-8", "ignore"))
        except (OSError, ValueError):
            return None

    seen, prods = set(), []
    stack = [smurl]
    while stack and len(prods) < 400:
        u = stack.pop(0)
        if u in seen:
            continue
        seen.add(u)
        blob = read(u)
        if not blob or blob.get("status") != 200:
            continue
        body = blob.get("body") or ""
        locs = [m.group(1).strip() for m in LOC_RX.finditer(body)]
        if "<sitemapindex" in body.lower():
            stack.extend(locs[:12])
            continue
        for loc in locs:
            if sig.classify_product_url(loc):
                prods.append(loc)
    rng.shuffle(prods)
    return prods[:k]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--catalog", default=os.path.join(ENRICH, "catalog-%s.json" % CAPTURED))
    ap.add_argument("--out", default=os.path.join(ENRICH, "_verify-%s.json" % CAPTURED))
    ap.add_argument("--n", type=int, default=15)
    ap.add_argument("--per-domain", type=int, default=4)
    ap.add_argument("--seed", type=int, default=3)
    args = ap.parse_args()

    recs = json.load(open(args.catalog))["records"]
    rng = random.Random(args.seed)

    # Stratify across the whole range, including the nulls -- the failure modes
    # live at the ends, not in the middle.
    strata = collections.OrderedDict([
        ("null", lambda r: r["sku_estimate"] is None and
         r["ecommerce_class"] in ("catalog_no_cart", "ecom_full")),
        ("0", lambda r: r["sku_estimate"] == 0),
        ("1-49", lambda r: r["sku_estimate"] is not None and 1 <= r["sku_estimate"] <= 49),
        ("50-199", lambda r: r["sku_estimate"] is not None and 50 <= r["sku_estimate"] <= 199),
        ("200-999", lambda r: r["sku_estimate"] is not None and 200 <= r["sku_estimate"] <= 999),
        ("1k-5k", lambda r: r["sku_estimate"] is not None and 1000 <= r["sku_estimate"] <= 4999),
        ("5k+", lambda r: r["sku_estimate"] is not None and r["sku_estimate"] >= 5000),
    ])
    picks = []
    per = max(1, args.n // len(strata))
    for label, fn in strata.items():
        pool = [r for r in recs if fn(r)]
        rng.shuffle(pool)
        for r in pool[:per]:
            picks.append((label, r))
    picks = picks[:args.n]
    print("sample: %d domains across %d strata" % (len(picks), len(strata)))

    def work(item):
        label, r = item
        d = r["domain"]
        urls = sample_product_urls(r, args.per_domain, random.Random(hash(d) & 0xffff))
        checks = [check_product_page(u) for u in urls]
        vc = visible_count(d, r)
        ok = [c for c in checks if c["is_product"] is True]
        testable = [c for c in checks if c["is_product"] is not None]
        kinds = collections.Counter(c.get("kind") for c in checks if c.get("kind"))
        return {
            "kinds": dict(kinds),
            "stratum": label,
            "domain": d,
            "sku_estimate": r["sku_estimate"],
            "sku_method": r["sku_method"],
            "sku_confidence": r["sku_confidence"],
            "ecommerce_class": r["ecommerce_class"],
            "platform": r["platform"],
            "sitemap_url": r["sitemap_url"],
            "sitemap_kind": r["sitemap_kind"],
            "sitemap_urls_seen": r["sitemap_urls_seen"],
            "sitemap_extrapolated": r["sitemap_extrapolated"],
            "url_samples": checks,
            "url_precision": round(len(ok) / len(testable), 3) if testable else None,
            "visible_count": vc,
            "ratio_estimate_over_visible": (
                round(r["sku_estimate"] / vc["count"], 3)
                if vc and r["sku_estimate"] else None),
        }

    with ThreadPoolExecutor(max_workers=10) as ex:
        out = list(ex.map(work, picks))

    prec = [r["url_precision"] for r in out if r["url_precision"] is not None]
    ratios = [r["ratio_estimate_over_visible"] for r in out
              if r["ratio_estimate_over_visible"] is not None]
    payload = {
        "stage": "s3-catalog-proxy-validation",
        "captured": CAPTURED,
        "sample": len(out),
        "url_precision_mean": round(sum(prec) / len(prec), 3) if prec else None,
        "url_precision_n": len(prec),
        "count_agreement_n": len(ratios),
        "count_ratios": sorted(ratios),
        "records": out,
    }
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=1)
    for r in out:
        print("  %-8s %-32s est=%-8s prec=%-6s visible=%s" % (
            r["stratum"], r["domain"], r["sku_estimate"], r["url_precision"],
            r["visible_count"]["count"] if r["visible_count"] else "-"))
    print(json.dumps({k: v for k, v in payload.items() if k != "records"}, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
