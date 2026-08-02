#!/usr/bin/env python3
"""S1 raw acquisition — Dorner Conveyors distributor locator.

The entire US set ships inline in the page as a `distributorPlaces` JS array:
one GET, no JS, no API. Five extra GETs (one per `markets[]` value) recover the
per-record market assignment, which the base payload does not carry.

RAW ACQUISITION ONLY — no dedupe, no filtering. S2 owns normalize/dedupe.
Pacing: >=3s between requests, single worker, responses cached to disk.
"""
import csv
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request

CAPTURED = "2026-08-01"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
BASE = "https://www.dornerconveyors.com/distributors"
COUNTRY = "United States of America"

# Decoded from the page's markets[] <select>.
MARKETS = {"53": "Automation", "54": "Food Industry", "55": "Material Handling",
           "56": "General Industry", "57": "Packaging"}

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "data", "raw")
CACHE = os.path.join(RAW, "_cache", "dorner")
DELAY = 3.0
BACKOFF = [15, 30, 60, 120]

MARKER = "var distributorPlaces = "


def fetch(url, cache_name):
    path = os.path.join(CACHE, cache_name)
    if os.path.exists(path) and os.path.getsize(path) > 10000:
        with open(path, encoding="utf-8", errors="ignore") as f:
            return f.read(), True
    for attempt in range(len(BACKOFF) + 1):
        req = urllib.request.Request(url, headers={
            "User-Agent": UA,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        })
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                body = r.read().decode("utf-8", "ignore")
            with open(path, "w", encoding="utf-8") as f:
                f.write(body)
            return body, False
        except urllib.error.HTTPError as e:
            if e.code == 403:
                raise SystemExit(f"403 on {url} — stopping Dorner, no bypass")
            wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
            print(f"  HTTP {e.code} -> backoff {wait}s", flush=True)
            time.sleep(wait)
        except Exception as e:
            wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
            print(f"  ERR {e!r} -> retry in {wait}s", flush=True)
            time.sleep(wait)
    raise SystemExit(f"gave up on {url}")


def places(body):
    i = body.index(MARKER) + len(MARKER)
    data, _ = json.JSONDecoder().raw_decode(body, i)
    return data


def main():
    os.makedirs(CACHE, exist_ok=True)
    os.makedirs(RAW, exist_ok=True)
    requests_made = 0

    base_url = f"{BASE}?{urllib.parse.urlencode({'country': COUNTRY})}"
    body, cached = fetch(base_url, "distributors-us.html")
    requests_made += 0 if cached else 1
    base = places(body)
    print(f"base US records: {len(base)}")

    # Per-record market assignment via the markets[] facet.
    market_map = {}
    market_counts = {}
    for code, label in MARKETS.items():
        url = f"{BASE}?{urllib.parse.urlencode({'country': COUNTRY, 'markets[]': code})}"
        mbody, mcached = fetch(url, f"markets-{code}.html")
        if not mcached:
            requests_made += 1
            time.sleep(DELAY)
        ids = [r["id"] for r in places(mbody)]
        market_counts[label] = len(ids)
        for rid in ids:
            market_map.setdefault(rid, []).append(label)
        print(f"  markets[]={code} ({label}): {len(ids)} records")

    records = []
    for r in base:
        records.append({
            "dorner_id": r.get("id"),
            "company": r.get("name"),
            "address_raw": r.get("address"),
            "address_1": r.get("marker_address_line_1"),
            "address_2": r.get("marker_address_line_2"),
            "lat": r.get("lat"),
            "lng": r.get("lon"),
            "phone_raw": r.get("tel"),
            "phone_formatted": r.get("phone"),
            "email": r.get("email"),
            "website": r.get("url"),
            "country": r.get("country"),
            "tier_raw": "|".join(r.get("type") or []),
            "markets": "|".join(market_map.get(r.get("id"), [])),
            "is_leading": r.get("is_leading"),
            "source": "dorner",
            "source_url": base_url,
            "captured": CAPTURED,
        })

    payload = {
        "source": "dorner",
        "source_name": "Dorner Conveyors distributor locator",
        "captured": CAPTURED,
        "base_url": base_url,
        "method": "inline distributorPlaces JS array, one GET; markets[] facet "
                  "queried once per value for per-record market assignment",
        "markets_legend": MARKETS,
        "market_counts": market_counts,
        "requests_to_origin": requests_made,
        "records": records,
    }
    with open(os.path.join(RAW, f"dorner-{CAPTURED}.json"), "w") as f:
        json.dump(payload, f, indent=1)
    with open(os.path.join(RAW, f"dorner-{CAPTURED}.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(records[0].keys()))
        w.writeheader()
        w.writerows(records)
    print(f"DONE raw_records={len(records)} origin_requests={requests_made}")


if __name__ == "__main__":
    main()
