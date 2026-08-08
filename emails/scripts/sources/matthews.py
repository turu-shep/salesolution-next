#!/usr/bin/env python3
"""S1 wave-3 — Matthews Marking Systems US distributor list. **GATED — 403.**

  GET https://matthewsmarking.com/us-distributors/   -> HTTP 403, Cloudflare
      interstitial ("Just a moment...", 5,735 bytes)

`research/06` measured this page at HTTP 200 / 70KB WordPress with 29 US
address blocks, and recorded that only the `www.` host was Cloudflare-403 while
the apex served fine. **That has changed: on 2026-08-01 the apex is 403 too.**

This source is therefore STOPPED, per the binding pacing/compliance rule:
a hard 403 is recorded and abandoned. Specifically NOT attempted, in any form:

  - the `www.` host (a known-403 alternate — switching hosts to dodge a block
    is a bypass, not a fallback)
  - UA rotation, header spoofing, cookie replay, or a challenge solver
  - a retry storm (one request was made; one 403 was returned; that is all)

The 29 companies `research/06` measured are a real, known, and currently
unreachable pool. They are NOT written as records here — we hold no captured
rows for them, and inventing rows from a prior read of a page we can no longer
fetch would produce leads without live provenance, which §1 forbids.

Re-run this file if the block is ever lifted; nothing else about the source
was hard.
"""
import os
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _polite import RAW, Blocked, Fetcher, write_raw  # noqa: E402

SOURCE = "matthews"
URL = "https://matthewsmarking.com/us-distributors/"


def main():
    f = Fetcher(SOURCE, min_bytes=60000)  # a real list page is ~70KB; the 403 body is ~6KB
    blocked = None
    signature = None

    # Read the block off the cached response if we already have it. Re-requesting
    # a host that just 403'd only to re-confirm the 403 is a retry, not evidence.
    cached_403 = os.path.join(RAW, "_cache", SOURCE, "index.html")
    if os.path.exists(cached_403):
        with open(cached_403, encoding="utf-8", errors="ignore") as fh:
            head = fh.read(4000)
        signature = {
            "bytes": os.path.getsize(cached_403),
            "title": "Just a moment..." if "Just a moment" in head else None,
            "cloudflare_marker": "cloudflare" in head.lower(),
        }
        if signature["cloudflare_marker"] and signature["bytes"] < 60000:
            blocked = (f"HTTP 403 on {URL} — Cloudflare interstitial "
                       f"({signature['bytes']} bytes), read from the cached "
                       f"response; source stopped, no bypass, not re-requested")
            print(f"BLOCKED (from cache): {blocked}")

    if blocked is None:
        try:
            body, cached = f.get(URL, "index.html")
            print(f"UNEXPECTED 200 ({len(body)} bytes, {'cached' if cached else 'live'}) — "
                  f"the block may have lifted. Re-derive the parser from research/06 §Matthews.")
        except Blocked as e:
            blocked = str(e)
            print(f"BLOCKED: {e}")

    write_raw(SOURCE, {
        "source_name": "Matthews Marking Systems — US distributor list",
        "source_url": URL,
        "method": "one unauthenticated GET, honest desktop UA",
        "status": "GATED — HTTP 403 (Cloudflare interstitial). Source stopped.",
        "blocked": blocked,
        "block_signature": signature,
        "research_06_expectation": ("HTTP 200, ~70KB WordPress, 29 US address "
                                    "blocks (company + street + city/state/ZIP), "
                                    "no per-record website or phone; apex served, "
                                    "www 403"),
        "what_changed": ("The apex host now returns the same Cloudflare 403 that "
                         "research/06 saw only on the www host."),
        "bypass_attempted": False,
        "bypass_options_deliberately_not_taken": [
            "www.matthewsmarking.com (known-403 alternate host)",
            "user-agent rotation / header spoofing",
            "challenge solving or cookie replay",
            "retry storm",
        ],
        "records_note": ("Zero records. The 29 companies research/06 measured are "
                         "real but currently unreachable; they are not "
                         "reconstructed here because a lead needs live "
                         "source_url + captured provenance (§1)."),
        "origin_requests": f.origin_requests,
        "stats": {"total_records": 0, "us_records": 0, "distinct_companies": 0,
                  "pct_website": 0.0, "pct_phone": 0.0, "pct_email": 0.0},
    }, [])


if __name__ == "__main__":
    main()
