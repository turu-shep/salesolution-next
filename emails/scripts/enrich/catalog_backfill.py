#!/usr/bin/env python3
"""Fetch homepages for the domains the line-card run never attempted.

The line-card targets were built off deduped-v1; deduped-v2 added domains after
it ran, so ~143 dealers have no cached page at all. Those are genuinely missing
data, not cache misses, so they are worth the requests. Everything else the
cache already covers, and nothing already fetched is re-fetched -- including
the 403s and dead hosts, which are left alone on purpose.

Writes into the line-card run's own cache, in its blob shape, so
catalog_detect.py picks the pages up with no special-casing.
"""
import argparse
import collections
import csv
import gzip
import hashlib
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
from concurrent.futures import ThreadPoolExecutor

CAPTURED = "2026-08-01"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ENRICH = os.path.join(ROOT, "data", "enrichment")
CACHE = os.path.join(ENRICH, "_cache")
LISTS = os.path.join(ROOT, "lists")

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
HOST_DELAY = 3.0
TIMEOUT = 12
MAX_BYTES = 3_000_000

TAG_RX = re.compile(r"<(script|style|noscript|svg|template)[^>]*>.*?</\1>", re.S | re.I)
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


def visible_text(html):
    t = TAG_RX.sub(" ", html)
    t = re.sub(r"<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", t)


def cache_path(url):
    return os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest() + ".gz")


def grab(domain):
    url = "https://%s/" % domain
    cp = cache_path(url)
    rec = {"domain": domain, "url": url, "status": None, "error": None,
           "refused": False, "cached": os.path.exists(cp), "captured": CAPTURED}
    if rec["cached"]:
        return rec
    throttle(domain)
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip",
    })
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            raw = r.read(MAX_BYTES)
            if (r.headers.get("Content-Encoding") or "").lower() == "gzip":
                try:
                    raw = gzip.GzipFile(fileobj=io.BytesIO(raw)).read()
                except OSError:
                    pass
            ctype = (r.headers.get("Content-Type") or "").lower()
            final, status = r.geturl(), r.status
    except urllib.error.HTTPError as e:
        rec["status"] = e.code
        rec["error"] = "HTTP %d" % e.code
        rec["refused"] = e.code in (401, 403, 429, 451)   # recorded, never bypassed
        return rec
    except Exception as e:
        rec["error"] = repr(e)[:120]
        return rec

    rec["status"] = status
    if "html" not in ctype and ctype:
        rec["error"] = "content-type %s" % ctype[:40]
        return rec
    html = raw.decode("utf-8", "ignore")
    blob = {"status": status, "kind": "html", "final_url": final,
            "text": visible_text(html)[:600_000], "html": html[:900_000]}
    with gzip.open(cp, "wb") as f:
        f.write(json.dumps(blob).encode())
    return rec


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(ENRICH, "_backfill-%s.json" % CAPTURED))
    ap.add_argument("--workers", type=int, default=16)
    args = ap.parse_args()

    lc = json.load(open(os.path.join(ENRICH, "linecards-%s.json" % CAPTURED)))
    attempted = {r["domain"] for r in lc["records"]}
    csv.field_size_limit(10 ** 7)
    todo = []
    seen = set()
    with open(os.path.join(LISTS, "deduped-v2.csv"), newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            d = (row.get("domain") or "").strip().lower()
            if d and d not in attempted and d not in seen:
                seen.add(d)
                todo.append(d)
    print("never attempted: %d domains" % len(todo))

    out = []
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        for rec in ex.map(grab, todo):
            out.append(rec)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump({"stage": "s3-catalog-backfill", "captured": CAPTURED,
                   "policy": {"host_delay_s": HOST_DELAY, "user_agent": UA,
                              "on_403": "recorded, abandoned, never bypassed"},
                   "domains": len(out), "records": out}, f, indent=1)
    print(collections.Counter(r["status"] for r in out).most_common())
    print("refused %d" % sum(1 for r in out if r["refused"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
