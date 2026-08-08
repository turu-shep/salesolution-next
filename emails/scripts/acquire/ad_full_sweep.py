#!/usr/bin/env python3
"""S1 raw acquisition — AD (Affiliated Distributors) member locator, full sweep.

11 divisions x top-50 US metros = 550 public GETs against www.adhq.com.
Reuses the proven request pattern from emails/research/scripts/ad_sweep.py.

RAW ACQUISITION ONLY. No dedupe, no filtering, no normalization: every row from
every query is kept with its own provenance. S2 owns normalize/dedupe.

Pacing: >=3s between requests, single worker, exponential backoff on 429,
hard stop on 403. Every response cached to disk so a re-run never re-hits the
origin.
"""
import csv
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

CAPTURED = "2026-08-01"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
BASE = "https://www.adhq.com/resources/member-locator"

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "data", "raw")
CACHE = os.path.join(RAW, "_cache", "ad")
PROGRESS = os.path.join(CACHE, "_progress.jsonl")

DELAY = 3.0            # seconds between requests to this host
BACKOFF = [15, 30, 60, 120, 240]

# All 11 AD divisions, scraped from the locator form's industries[] checkboxes.
DIVISIONS = {
    "BPT": "Bearings & Power Transmission",
    "BSDC": "BSDC",
    "DBP": "DBP",
    "ESD": "Electrical",
    "GSD": "Gypsum Supply",
    "HVAC": "HVAC",
    "ISD": "Industrial, Safety and Construction",
    "ISC": "ISC",
    "PVF": "Pipe, Valves & Fittings",
    "PLBG": "Plumbing",
    "WWD": "Waterworks",
}

# Top 50 US metropolitan areas by population.
METROS = [
    "New York, NY", "Los Angeles, CA", "Chicago, IL", "Dallas, TX", "Houston, TX",
    "Atlanta, GA", "Washington, DC", "Philadelphia, PA", "Miami, FL", "Phoenix, AZ",
    "Boston, MA", "Riverside, CA", "San Francisco, CA", "Detroit, MI", "Seattle, WA",
    "Minneapolis, MN", "Tampa, FL", "San Diego, CA", "Denver, CO", "Baltimore, MD",
    "Orlando, FL", "Charlotte, NC", "St. Louis, MO", "San Antonio, TX", "Portland, OR",
    "Austin, TX", "Pittsburgh, PA", "Sacramento, CA", "Las Vegas, NV", "Cincinnati, OH",
    "Kansas City, MO", "Columbus, OH", "Indianapolis, IN", "Cleveland, OH", "San Jose, CA",
    "Nashville, TN", "Virginia Beach, VA", "Providence, RI", "Jacksonville, FL",
    "Milwaukee, WI", "Oklahoma City, OK", "Raleigh, NC", "Memphis, TN", "Richmond, VA",
    "Louisville, KY", "New Orleans, LA", "Salt Lake City, UT", "Hartford, CT",
    "Buffalo, NY", "Birmingham, AL",
]


class Blocked(Exception):
    """Host returned a hard access control. Stop this source, never bypass."""


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def txt(x):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x))).strip()


def url_for(div, metro):
    q = urllib.parse.urlencode({"location": metro, "industries": div})
    return f"{BASE}?{q}"


def note(rec):
    with open(PROGRESS, "a") as f:
        f.write(json.dumps(rec) + "\n")


def fetch(div, metro):
    """Return (body, from_cache). Caches every response to disk."""
    path = os.path.join(CACHE, f"{div}__{slug(metro)}.html")
    if os.path.exists(path) and os.path.getsize(path) > 2000:
        with open(path, encoding="utf-8", errors="ignore") as f:
            return f.read(), True

    url = url_for(div, metro)
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
                note({"div": div, "metro": metro, "status": 403, "action": "STOP"})
                raise Blocked(f"403 on {url} — stopping AD source, no bypass")
            if e.code == 429:
                wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
                note({"div": div, "metro": metro, "status": 429, "backoff_s": wait})
                print(f"  429 -> backoff {wait}s", flush=True)
                time.sleep(wait)
                continue
            note({"div": div, "metro": metro, "status": e.code, "action": "skip"})
            return None, False
        except Exception as e:  # timeouts, resets
            wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
            note({"div": div, "metro": metro, "error": repr(e)[:200], "retry_in_s": wait})
            print(f"  ERR {e!r} -> retry in {wait}s", flush=True)
            time.sleep(wait)
    note({"div": div, "metro": metro, "action": "gave_up"})
    return None, False


def parse(body, div, metro):
    """Every row in the response becomes one raw record. Nothing is dropped."""
    src = url_for(div, metro)
    rows = re.split(r'<div class="map-row">', body)[1:]

    # Hidden map-locations block carries lat/lng/zip in the same order as the rows.
    geo = []
    for blk in re.split(r'<div class="map-location"', body)[1:]:
        head = blk[:400]
        geo.append({
            "lat": (re.search(r'data-lat="([-\d.]+)"', head) or [None, None])[1]
            if re.search(r'data-lat="([-\d.]+)"', head) else None,
            "lng": (re.search(r'data-lng="([-\d.]+)"', head) or [None, None])[1]
            if re.search(r'data-lng="([-\d.]+)"', head) else None,
            "zip": (re.search(r'data-zip="([^"]*)"', head) or [None, None])[1]
            if re.search(r'data-zip="([^"]*)"', head) else None,
        })

    out = []
    for i, row in enumerate(rows):
        name = re.search(r'class="company-title">(.*?)</div>', row, re.S)
        if not name or not txt(name.group(1)):
            continue
        ind = re.search(r'class="company-industry">(.*?)</div>', row, re.S)
        addr = re.search(r'class="company-address">(.*?)</div>', row, re.S)
        dist = re.search(r'class="distance">(.*?)</div>', row, re.S)
        phone = re.search(r'href="tel:([0-9+]+)"', row)
        bid = re.search(r'data-branch-id="(\d+)"', row)
        logo = re.search(r'class="company-logo">.*?<img src="([^"]+)"', row, re.S)
        # The real website link is the anchor labelled "Visit Website".
        web = re.search(r'href="([^"]+)"[^>]*>\s*(?:<i[^>]*>\s*</i>)?\s*Visit Website',
                        row, re.S | re.I)
        maps = re.search(r'href="(https://www\.google\.com/maps/dir[^"]*)"', row)
        g = geo[i] if i < len(geo) else {}
        out.append({
            "branch_id": bid.group(1) if bid else None,
            "company": txt(name.group(1)),
            "division_label": txt(ind.group(1)) if ind else None,
            "division_code": div,
            "address_raw": txt(addr.group(1)) if addr else None,
            "zip": g.get("zip"),
            "lat": g.get("lat"),
            "lng": g.get("lng"),
            "phone_raw": phone.group(1) if phone else None,
            "website": web.group(1) if web else None,
            "maps_url": maps.group(1) if maps else None,
            "logo_url": logo.group(1) if logo else None,
            "distance_mi": txt(dist.group(1)) if dist else None,
            "query_metro": metro,
            "row_index": i,
            "source": "ad",
            "source_url": src,
            "captured": CAPTURED,
        })
    return out


def main():
    os.makedirs(CACHE, exist_ok=True)
    records, stats = [], []
    fetched = 0
    t0 = time.time()
    total = len(DIVISIONS) * len(METROS)
    n = 0
    try:
        for div in DIVISIONS:
            for metro in METROS:
                n += 1
                body, cached = fetch(div, metro)
                if body is None:
                    stats.append({"division": div, "metro": metro, "rows": None,
                                  "status": "failed"})
                    continue
                recs = parse(body, div, metro)
                records.extend(recs)
                stats.append({"division": div, "metro": metro, "rows": len(recs),
                              "capped": len(recs) >= 16, "cached": cached})
                if not cached:
                    fetched += 1
                    time.sleep(DELAY)
                if n % 25 == 0 or n == total:
                    print(f"[{n}/{total}] {div}/{metro} rows={len(recs)} "
                          f"raw={len(records)} fetched={fetched} "
                          f"elapsed={time.time()-t0:.0f}s", flush=True)
    except Blocked as e:
        print(f"\nBLOCKED: {e}", file=sys.stderr)

    os.makedirs(RAW, exist_ok=True)
    payload = {
        "source": "ad",
        "source_name": "Affiliated Distributors member locator",
        "captured": CAPTURED,
        "base_url": BASE,
        "divisions": DIVISIONS,
        "metros": METROS,
        "queries_planned": total,
        "queries_completed": len(stats),
        "requests_to_origin": fetched,
        "per_query": stats,
        "records": records,
    }
    with open(os.path.join(RAW, f"ad-{CAPTURED}.json"), "w") as f:
        json.dump(payload, f, indent=1)

    cols = list(records[0].keys()) if records else []
    with open(os.path.join(RAW, f"ad-{CAPTURED}.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(records)
    print(f"\nDONE raw_records={len(records)} queries={len(stats)} "
          f"origin_requests={fetched} elapsed={time.time()-t0:.0f}s")


if __name__ == "__main__":
    main()
