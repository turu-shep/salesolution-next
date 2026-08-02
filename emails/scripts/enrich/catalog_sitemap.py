#!/usr/bin/env python3
"""S3 task 2 -- catalogue depth from the dealer's own sitemap.

The SKU floors (>=1,000 for general MRO, >=200 for specialists) need a count.
Crawling a catalogue to count it is the slowest, most fragile thing in S3, and
the build plan says so (§7.2: "timebox it"). A sitemap is the cheap version:
the dealer publishes the URL list themselves, so counting product-shaped URLs
costs a handful of requests instead of a full crawl.

Per domain, hard-capped at MAX_REQUESTS:

  1. GET /robots.txt. Take every `Sitemap:` line, and keep the Disallow rules
     for `*` so we never fetch a path the dealer asked crawlers to skip.
  2. If robots named none, try /sitemap.xml then /sitemap_index.xml.
  3. A <urlset> is counted directly. A <sitemapindex> is expanded, product-
     named children first, obviously-non-product children (blog, author, tag)
     dropped, up to the child budget.
  4. If children remain unfetched, the count is extrapolated from the mean of
     the fetched product children and the confidence drops to low.

Compliance is the harvest's: >=3s per host, honest desktop UA, 403 recorded
and abandoned with no bypass, one back-off on 429, everything cached.

A domain with no sitemap gets sku_estimate null and method "none". That is a
finding, not a failure -- and per the plan it never disqualifies anyone.
"""
import argparse
import collections
import gzip
import hashlib
import importlib.util
import io
import json
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

CAPTURED = "2026-08-01"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ENRICH = os.path.join(ROOT, "data", "enrichment")
CACHE = os.path.join(ENRICH, "_sitemap_cache")

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
HOST_DELAY = 3.0
TIMEOUT = 15
MAX_BYTES = 12_000_000
MAX_REQUESTS = 12          # robots + up to 2 roots + up to 9 children
MAX_CHILDREN = 8
MAX_URLS_COUNTED = 200_000

_s = importlib.util.spec_from_file_location(
    "catalog_signals", os.path.join(HERE, "catalog_signals.py"))
sig = importlib.util.module_from_spec(_s)
_s.loader.exec_module(sig)

LOC_RX = re.compile(r"<loc>\s*(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?\s*</loc>", re.I | re.S)
INDEX_RX = re.compile(r"<sitemapindex", re.I)
SITEMAP_LINE_RX = re.compile(r"^\s*sitemap\s*:\s*(\S+)", re.I | re.M)

_host_lock = threading.Lock()
_host_next = {}
_stats_lock = threading.Lock()
_stats = collections.Counter()


def throttle(host):
    while True:
        with _host_lock:
            now = time.monotonic()
            nxt = _host_next.get(host, 0.0)
            if now >= nxt:
                _host_next[host] = now + HOST_DELAY
                return
            wait = nxt - now
        time.sleep(min(wait, 5.0))


def cache_path(url):
    return os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest() + ".gz")


def fetch(url, state):
    """One polite GET. Cached forever; the origin pays once."""
    cp = cache_path(url)
    if os.path.exists(cp):
        try:
            with gzip.open(cp, "rb") as f:
                blob = json.loads(f.read().decode("utf-8", "ignore"))
            blob["cached"] = True
            return blob
        except (OSError, ValueError):
            pass
    if state["requests"] >= MAX_REQUESTS:
        return {"status": None, "error": "request-budget", "body": ""}
    host = urllib.parse.urlsplit(url).netloc.lower()
    throttle(host)
    state["requests"] += 1

    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "application/xml,text/xml,text/plain,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip",
    })
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            raw = r.read(MAX_BYTES)
            enc = (r.headers.get("Content-Encoding") or "").lower()
            final, status = r.geturl(), r.status
    except urllib.error.HTTPError as e:
        if e.code == 429 and not state.get("backed_off"):
            state["backed_off"] = True
            time.sleep(12)
            throttle(host)
            if state["requests"] < MAX_REQUESTS:
                state["requests"] += 1
                try:
                    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                        raw = r.read(MAX_BYTES)
                        enc = (r.headers.get("Content-Encoding") or "").lower()
                        final, status = r.geturl(), r.status
                except Exception as e2:
                    return {"status": getattr(e2, "code", None), "body": "",
                            "refused": True, "error": repr(e2)[:120]}
            else:
                return {"status": 429, "body": "", "refused": True}
        else:
            # 403 especially: record it and walk away. Never bypassed.
            return {"status": e.code, "body": "", "error": "HTTP %d" % e.code,
                    "refused": e.code in (401, 403, 429, 451)}
    except Exception as e:
        return {"status": None, "body": "", "error": repr(e)[:120],
                "conn_failed": True}

    if enc == "gzip" or raw[:2] == b"\x1f\x8b":
        try:
            raw = gzip.GzipFile(fileobj=io.BytesIO(raw)).read(MAX_BYTES)
        except OSError:
            pass
    blob = {"status": status, "final_url": final,
            "body": raw.decode("utf-8", "ignore")[:MAX_BYTES]}
    try:
        os.makedirs(CACHE, exist_ok=True)
        with gzip.open(cp, "wb") as f:
            f.write(json.dumps(blob).encode())
    except OSError:
        pass
    blob["cached"] = False
    return blob


def parse_robots(body):
    """Sitemap URLs, plus the Disallow prefixes that apply to everyone."""
    sitemaps = [m.group(1).strip() for m in SITEMAP_LINE_RX.finditer(body)]
    disallow, in_star = [], False
    for line in body.splitlines():
        line = line.split("#", 1)[0].strip()
        if not line:
            continue
        key, _, val = line.partition(":")
        key, val = key.strip().lower(), val.strip()
        if key == "user-agent":
            in_star = val == "*"
        elif key == "disallow" and in_star and val:
            disallow.append(val)
    return sitemaps, disallow


def blocked(url, disallow):
    path = urllib.parse.urlsplit(url).path or "/"
    for d in disallow:
        prefix = d.split("*", 1)[0]
        if prefix and path.startswith(prefix):
            return True
        if d == "/":
            return True
    return False


def absolutize(url, base):
    """A `<loc>` resolved against its sitemap, or None if it is not fetchable.

    Sitemaps are supposed to carry absolute URLs and plenty do not:
    `pinabrothersservice.com/post-sitemap.xml` has no scheme, and passing it to
    `urllib.request.Request` raises `ValueError: unknown url type` -- which
    `ex.map` re-raises in the main thread and which killed a 2,220-domain run
    at record 1,586. One malformed tag on one host must not cost the pass.
    """
    if not url:
        return None
    try:
        joined = urllib.parse.urljoin(base, url.strip())
    except ValueError:
        return None
    parts = urllib.parse.urlsplit(joined)
    if parts.scheme not in ("http", "https") or not parts.netloc:
        return None
    return joined


def is_sitemapish(body):
    return "<loc" in body.lower() or "<urlset" in body.lower() \
        or "<sitemapindex" in body.lower()


def count_urls(locs):
    """(product_count, total, per-pattern breakdown) over one sitemap's URLs."""
    hits = collections.Counter()
    n = 0
    for u in locs:
        n += 1
        pat = sig.classify_product_url(u)
        if pat:
            hits[pat] += 1
    return sum(hits.values()), n, dict(hits)


def child_tier(u):
    """0 = product-named, 1 = neutral, 2 = definitely-not-product."""
    if sig.PRODUCT_SITEMAP_HINT.search(u) and not sig.NON_PRODUCT_SITEMAP.search(u):
        return 0
    if sig.NON_PRODUCT_SITEMAP.search(u):
        return 2
    return 1


def order_children(children):
    """Product-named children first; blog/author/tag children last."""
    return sorted(children, key=lambda u: (child_tier(u), len(u)))


def probe_domain(target):
    domain = target["domain"]
    rec = {
        "domain": domain,
        "sku_estimate": None,
        "sku_method": "none",
        "sku_confidence": None,
        "sitemap_url": None,
        "sitemap_kind": None,
        "sitemap_urls_seen": 0,
        "product_urls": 0,
        "product_patterns": {},
        "children_total": 0,
        "children_candidate": 0,
        "children_fetched": 0,
        "extrapolated": False,
        "extrapolated_over": 0,
        "robots_status": None,
        "sitemap_status": None,
        "refused": False,
        "error": None,
        "source_url": None,
        "captured": CAPTURED,
    }
    state = {"requests": 0}
    base = "https://%s" % domain

    robots = fetch(base + "/robots.txt", state)
    rec["robots_status"] = robots.get("status")
    declared, disallow = [], []
    if robots.get("status") == 200:
        declared, disallow = parse_robots(robots.get("body") or "")
    elif robots.get("refused"):
        rec["refused"] = True
        rec["error"] = robots.get("error")

    candidates = []
    for u in declared[:4]:
        got = absolutize(u, base + "/")
        if got:
            candidates.append(got)
    for guess in ("/sitemap.xml", "/sitemap_index.xml", "/sitemap-index.xml"):
        candidates.append(base + guess)

    seen, root, root_body = set(), None, None
    for cand in candidates:
        if cand in seen:
            continue
        seen.add(cand)
        if blocked(cand, disallow):
            rec["error"] = "robots disallows %s" % cand
            continue
        if state["requests"] >= MAX_REQUESTS - MAX_CHILDREN:
            break
        got = fetch(cand, state)
        rec["sitemap_status"] = got.get("status")
        if got.get("refused"):
            rec["refused"] = True
            rec["error"] = got.get("error")
            break
        if got.get("status") == 200 and is_sitemapish(got.get("body") or ""):
            root, root_body = got.get("final_url") or cand, got["body"]
            break
        if got.get("error") == "request-budget":
            break

    if root is None:
        rec["sku_method"] = "none"
        if not rec["error"]:
            rec["error"] = "no sitemap found"
        return rec

    rec["sitemap_url"] = root
    rec["source_url"] = root
    locs = [m.group(1).strip() for m in LOC_RX.finditer(root_body)]

    if INDEX_RX.search(root_body):
        rec["sitemap_kind"] = "index"
        children = [c for c in (absolutize(u, root) for u in locs) if c]
        rec["children_total"] = len(children)
        ordered = order_children(children)
        product_total, seen_total = 0, 0
        pats = collections.Counter()
        fetched, counted_children = 0, []
        for child in ordered:
            if fetched >= MAX_CHILDREN or state["requests"] >= MAX_REQUESTS:
                break
            if blocked(child, disallow):
                continue
            got = fetch(child, state)
            if got.get("refused"):
                rec["refused"] = True
                break
            if got.get("status") != 200 or not is_sitemapish(got.get("body") or ""):
                if got.get("error") == "request-budget":
                    break
                fetched += 1
                continue
            fetched += 1
            child_locs = [m.group(1).strip()
                          for m in LOC_RX.finditer(got["body"])][:MAX_URLS_COUNTED]
            p, t, h = count_urls(child_locs)
            product_total += p
            seen_total += t
            pats.update(h)
            counted_children.append(p)
        rec["children_fetched"] = fetched
        rec["sitemap_urls_seen"] = seen_total
        rec["product_urls"] = product_total
        rec["product_patterns"] = dict(pats)

        # Extrapolate ONLY over children that could plausibly hold products.
        # The fetch order is product-named first, so extrapolating the fetched
        # mean across *every* remaining child (blog, pages, images) inflates
        # wildly -- that bug produced a 7,051,436-SKU estimate on 8 sampled
        # children of 142. Unfetched blog/tag/author sitemaps contribute zero.
        candidates = [c for c in ordered if child_tier(c) < 2]
        rec["children_candidate"] = len(candidates)
        remaining = max(0, len(candidates) - fetched)
        # Extrapolating 8 sampled children across 4,096 is not an estimate, it
        # is a 512x guess -- it produced 7,350,528 SKUs for jstor.org. Past a
        # 5x sampled fraction, stop estimating and report what was actually
        # counted as a FLOOR. A floor still answers the qualification question:
        # if the counted subset already clears 1,000, the dealer clears it.
        if remaining and counted_children and remaining <= 4 * max(1, fetched):
            mean = product_total / max(1, len(counted_children))
            rec["sku_estimate"] = int(round(product_total + mean * remaining))
            rec["extrapolated"] = True
            rec["extrapolated_over"] = remaining
            rec["sku_method"] = "sitemap_index_extrapolated"
            rec["sku_confidence"] = "low"
        elif remaining and counted_children:
            rec["sku_estimate"] = product_total
            rec["extrapolated"] = False
            rec["extrapolated_over"] = 0
            rec["sku_method"] = "sitemap_index_floor"
            rec["sku_confidence"] = "low"
            rec["error"] = ("counted %d of %d candidate child sitemaps; "
                            "sku_estimate is a floor, not a total"
                            % (fetched, len(candidates)))
        else:
            rec["sku_estimate"] = product_total
            rec["sku_method"] = "sitemap_index"
            rec["sku_confidence"] = "high" if product_total else "medium"
    else:
        rec["sitemap_kind"] = "urlset"
        p, t, h = count_urls(locs[:MAX_URLS_COUNTED])
        rec["sitemap_urls_seen"] = t
        rec["product_urls"] = p
        rec["product_patterns"] = h
        rec["sku_estimate"] = p
        rec["sku_method"] = "sitemap_urlset"
        rec["sku_confidence"] = "high" if p else "medium"

    with _stats_lock:
        _stats[rec["sku_method"]] += 1
    return rec


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--targets", default=os.path.join(ENRICH, "_ecom-%s.json" % CAPTURED))
    ap.add_argument("--out", default=os.path.join(ENRICH, "_sitemap-%s.json" % CAPTURED))
    ap.add_argument("--workers", type=int, default=24)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--resume", action="store_true",
                    help="keep records already in --out, only probe the rest")
    ap.add_argument("--seed", action="append", default=[],
                    help="prior sitemap output whose domains are answered for "
                         "and must NOT be re-probed; repeatable")
    ap.add_argument("--only", action="append", default=[],
                    help="restrict targets to the domains in this JSON's "
                         "records (or targets); repeatable")
    ap.add_argument("--partial",
                    help="jsonl checkpoint path (default: <out>.partial.jsonl)")
    args = ap.parse_args()

    src = json.load(open(args.targets))
    targets = [{"domain": r["domain"]} for r in src["records"]]
    if args.only:
        keep = set()
        for p in args.only:
            payload = json.load(open(p))
            for r in payload.get("records", payload.get("targets", [])):
                keep.add(r["domain"])
        targets = [t for t in targets if t["domain"] in keep]

    done, carry = set(), {}
    for p in args.seed:
        if os.path.exists(p):
            for r in json.load(open(p))["records"]:
                done.add(r["domain"])
    if args.resume and os.path.exists(args.out):
        for r in json.load(open(args.out))["records"]:
            done.add(r["domain"])
            carry[r["domain"]] = r

    partial_path = args.partial or (args.out + ".partial.jsonl")
    resumed = 0
    if os.path.exists(partial_path):
        with open(partial_path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    r = json.loads(line)
                except ValueError:
                    continue          # torn last line after a kill
                if r.get("domain") and r["domain"] not in carry:
                    carry[r["domain"]] = r
                    done.add(r["domain"])
                    resumed += 1

    targets = [t for t in targets if t["domain"] not in done]
    if args.limit:
        targets = targets[:args.limit]
    print("targets %d | already answered %d (resumed from partial %d)"
          % (len(targets), len(done), resumed), flush=True)

    os.makedirs(CACHE, exist_ok=True)
    out = list(carry.values())
    t0 = time.time()
    pf = open(partial_path, "a", encoding="utf-8")
    # `as_completed`, not `ex.map`. §5g fixed this once in the SERP harness and
    # the reason is the same here: `map` yields IN SUBMISSION ORDER, so one slow
    # origin at the head of the queue stalls the entire write path while 31
    # workers keep finishing behind it. The checkpoint then lags the work it is
    # supposed to protect -- measured at 125 records written against ~900 done.
    try:
        with ThreadPoolExecutor(max_workers=args.workers) as ex:
            futures = {ex.submit(probe_domain, t): t for t in targets}
            for i, fut in enumerate(as_completed(futures), 1):
                try:
                    rec = fut.result()
                except Exception as e:  # noqa: BLE001 - one bad host must not kill the run
                    t = futures[fut]
                    rec = {"domain": t["domain"], "sku_estimate": None,
                           "sku_method": "none", "refused": False,
                           "error": "probe-crash %r" % (e,), "captured": CAPTURED}
                out.append(rec)
                pf.write(json.dumps(rec) + "\n")
                if i % 25 == 0:
                    pf.flush()
                    os.fsync(pf.fileno())
                if i % 100 == 0:
                    el = time.time() - t0
                    print("  %d/%d  %.0fs  (%.1f/s)" % (i, len(targets), el, i / el),
                          flush=True)
                    _flush(out, args.out)
    finally:
        pf.flush()
        os.fsync(pf.fileno())
        pf.close()
    _flush(out, args.out)
    dist = collections.Counter(r["sku_method"] for r in out)
    print("sitemap pass: %d domains -> %s" % (len(out), args.out))
    print("partial: %s" % partial_path)
    for k, v in dist.most_common():
        print("  %-30s %5d" % (k, v))
    return 0


def _flush(out, path):
    payload = {
        "stage": "s3-catalog-depth",
        "captured": CAPTURED,
        "method": "robots.txt + sitemap.xml product-URL counting",
        "policy": {"host_delay_s": HOST_DELAY, "max_requests_per_domain": MAX_REQUESTS,
                   "max_children": MAX_CHILDREN, "user_agent": UA,
                   "on_403": "recorded, abandoned, never bypassed",
                   "robots": "Disallow honoured for user-agent *"},
        "domains": len(out),
        "records": sorted(out, key=lambda r: r["domain"]),
    }
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=1)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, path)


if __name__ == "__main__":
    sys.exit(main())
