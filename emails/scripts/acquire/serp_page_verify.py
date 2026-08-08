#!/usr/bin/env python3
"""S1 raw acquisition — fetch the dealer pages the SERP program found.

Why this exists. The SERP payload gives a truncated page excerpt, and measuring
it showed the excerpt carries a mean of 0.35 named brands per result. The two
things the SERP route is supposed to be best at — the dealer's own authorization
sentence, verbatim, and their line card on one page — are properties of the PAGE,
not of the search result. research/04 got Keystone's 20 named manufacturers by
fetching the page, not from the SERP.

So: one GET per domain, for the domains whose SERP result already showed a
quotable self-declaration. Best-ranked URL per domain, one request per host,
never a second.

Compliance, unchanged: public pages only, one honest desktop Chrome UA, no
rotation, no fingerprint spoofing, no challenge solving. Any 403 or 429 is
recorded and the host is left alone — no retry, no bypass. Concurrency is across
DISTINCT hosts only, so no origin sees more than one request.

RAW ACQUISITION ONLY. Writes a companion file; the SERP payload is not modified.
"""
import gzip
import io
import json
import os
import re
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

CAPTURED = "2026-08-01"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "data", "raw")
CACHE = os.path.join(RAW, "_cache", "serp_pages")
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
WORKERS = 6          # across distinct hosts only
TIMEOUT = 25
MAX_BYTES = 3_000_000

import importlib.util
_s = importlib.util.spec_from_file_location(
    "ss", os.path.join(os.path.dirname(os.path.abspath(__file__)), "serp_selfid.py"))
ss = importlib.util.module_from_spec(_s)
_s.loader.exec_module(ss)
DECL_RX, BOILERPLATE_RX, BRAND_RX = ss.DECL_RX, ss.BOILERPLATE_RX, ss.BRAND_RX

TAG_RX = re.compile(r"<(script|style|noscript|svg)[^>]*>.*?</\1>", re.S | re.I)


def visible_text(body):
    t = TAG_RX.sub(" ", body)
    t = re.sub(r"<[^>]+>", " ", t)
    t = (t.replace("&nbsp;", " ").replace("&amp;", "&").replace("&#39;", "'")
         .replace("&quot;", '"').replace("&rsquo;", "'").replace("&ndash;", "-"))
    return re.sub(r"[ \t\r\f\v]+", " ", t)


def declarations(text, limit=6):
    out, seen = [], set()
    for m in DECL_RX.finditer(text):
        sent = ss.sentence_around(text, m)
        sent = re.sub(r"\s+", " ", sent).strip()
        if len(sent) < 12 or len(sent) > 300 or sent.lower() in seen:
            continue
        seen.add(sent.lower())
        out.append({"text": sent,
                    "is_boilerplate": bool(BOILERPLATE_RX.search(sent))})
        if len(out) >= limit:
            break
    return out


def fetch(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip",
    })
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        raw = r.read(MAX_BYTES)
        if r.headers.get("Content-Encoding") == "gzip":
            try:
                raw = gzip.GzipFile(fileobj=io.BytesIO(raw)).read()
            except Exception:
                pass
        ctype = r.headers.get("Content-Type", "")
        return r.status, ctype, raw.decode("utf-8", "ignore"), r.geturl()


def job(item):
    dom, url = item["domain"], item["page_url"]
    path = os.path.join(CACHE, re.sub(r"[^a-z0-9.]+", "_", dom.lower())[:120] + ".html.gz")
    if os.path.exists(path):
        with gzip.open(path, "rt", encoding="utf-8", errors="ignore") as f:
            body = f.read()
        return {**item, "http_status": 200, "cached": True, "body": body}
    try:
        status, ctype, body, final = fetch(url)
        if "html" not in ctype.lower():
            return {**item, "http_status": status, "skipped": f"content-type {ctype}",
                    "body": None}
        with gzip.open(path, "wt", encoding="utf-8") as f:
            f.write(body)
        return {**item, "http_status": status, "final_url": final,
                "cached": False, "body": body}
    except urllib.error.HTTPError as e:
        # 403 / 429 are recorded and left alone. No retry, ever.
        return {**item, "http_status": e.code, "body": None,
                "refused": e.code in (401, 403, 429, 451)}
    except Exception as e:
        return {**item, "http_status": None, "error": repr(e)[:160], "body": None}


def main():
    os.makedirs(CACHE, exist_ok=True)
    with open(os.path.join(RAW, f"serp-selfid-{CAPTURED}.json")) as f:
        serp = json.load(f)

    # Best-ranked quotable-declaration URL per dealer domain. One host, one URL.
    best = {}
    for r in serp["records"]:
        if r["classification"] != "dealer_candidate":
            continue
        if not r["declaration"] or r["declaration_is_boilerplate"]:
            continue
        if r["is_pdf"]:
            continue
        k = r["domain"]
        rank = r["rank_absolute"] or 999
        if k not in best or rank < best[k]["rank_absolute"]:
            best[k] = {"domain": k, "page_url": r["page_url"],
                       "rank_absolute": rank, "serp_declaration": r["declaration"],
                       "serp_query": r["query"], "brand_hint": r["brand_hint"]}
    targets = list(best.values())
    print(f"targets: {len(targets)} domains (one URL each)", flush=True)

    out, refused, errors = [], [], []
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        for i, res in enumerate(pool.map(job, targets), 1):
            body = res.pop("body", None)
            if body is None:
                (refused if res.get("refused") else errors).append(
                    {"domain": res["domain"], "status": res.get("http_status"),
                     "error": res.get("error") or res.get("skipped")})
            else:
                text = visible_text(body)
                decls = declarations(text)
                brands = sorted({b for b, rx in BRAND_RX if rx.search(text)})
                title = re.search(r"<title[^>]*>(.*?)</title>", body, re.S | re.I)
                out.append({
                    "domain": res["domain"],
                    "page_url": res["page_url"],
                    "final_url": res.get("final_url") or res["page_url"],
                    "http_status": res["http_status"],
                    "page_title": re.sub(r"\s+", " ", visible_text(
                        title.group(1))).strip() if title else None,
                    "rank_absolute": res["rank_absolute"],
                    "serp_declaration": res["serp_declaration"],
                    "page_declarations": decls,
                    "page_declaration_count": len(decls),
                    "quotable_on_page": any(not d["is_boilerplate"] for d in decls),
                    "brands_named_on_page": brands,
                    "brands_named_count": len(brands),
                    "page_text_len": len(text),
                    "found_by_query": res["serp_query"],
                    "brand_hint": res["brand_hint"],
                    "source": "serp_page",
                    "source_url": res["page_url"],
                    "captured": CAPTURED,
                })
            if i % 50 == 0 or i == len(targets):
                print(f"  [{i}/{len(targets)}] ok={len(out)} refused={len(refused)} "
                      f"err={len(errors)} elapsed={time.time()-t0:.0f}s", flush=True)

    payload = {
        "source": "serp_page",
        "source_name": "Dealer page fetch over SERP self-identification hits",
        "captured": CAPTURED,
        "policy": ("public pages only; one honest desktop UA; one request per host; "
                   "403/401/429/451 recorded and left alone, never retried, never bypassed"),
        "targets": len(targets),
        "fetched_ok": len(out),
        "refused": refused,
        "errors": errors,
        "records": out,
    }
    with open(os.path.join(RAW, f"serp-selfid-pages-{CAPTURED}.json"), "w") as f:
        json.dump(payload, f, indent=1)
    print(f"\nDONE fetched={len(out)}/{len(targets)} refused={len(refused)} "
          f"errors={len(errors)} elapsed={time.time()-t0:.0f}s")


if __name__ == "__main__":
    main()
