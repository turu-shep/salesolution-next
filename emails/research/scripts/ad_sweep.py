#!/usr/bin/env python3
"""Estimate AD Member Locator yield: sweep metro seeds, count unique companies + websites.
Public GET endpoint, ICP divisions only, rate-limited."""
import re, html, time, urllib.parse, urllib.request, json, csv

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126 Safari/537.36")
BASE = "https://www.adhq.com/resources/member-locator"
INDS = "ISD,BPT,PVF"
SEEDS = ["Chicago, IL", "Houston, TX", "Atlanta, GA", "Los Angeles, CA", "Cleveland, OH",
         "Charlotte, NC", "Denver, CO", "Seattle, WA", "Boston, MA", "Minneapolis, MN",
         "Dallas, TX", "Philadelphia, PA", "Phoenix, AZ", "Detroit, MI", "Nashville, TN",
         "Kansas City, MO", "Portland, OR", "Tampa, FL", "St. Louis, MO", "Milwaukee, WI"]

def txt(x):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x))).strip()

def fetch(loc):
    q = urllib.parse.urlencode({"location": loc, "industries": INDS})
    req = urllib.request.Request(f"{BASE}?{q}", headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.read().decode("utf-8", "ignore")

companies = {}
for seed in SEEDS:
    try:
        s = fetch(seed)
    except Exception as e:
        print(seed, "ERR", e); continue
    rows = re.split(r'<div class="map-row">', s)[1:]
    n = 0
    for row in rows:
        name = re.search(r'class="company-title">(.*?)</div>', row, re.S)
        ind = re.search(r'class="company-industry">(.*?)</div>', row, re.S)
        addr = re.search(r'class="company-address">(.*?)</div>', row, re.S)
        phone = re.search(r'href="tel:([0-9+]+)"', row)
        web = re.search(r'href="(https?://(?!www\.google\.com)[^"]+)"[^>]*>\s*'
                        r'(?:<i[^>]*>\s*</i>)?\s*Visit Website', row, re.S | re.I)
        if not web:
            web = re.search(r'href="(https?://(?!\w+\.google\.com|google\.com)[^"]+)"', row)
        if not name:
            continue
        nm = txt(name.group(1))
        if not nm:
            continue
        key = nm.lower()
        rec = {"company": nm,
               "division": txt(ind.group(1)) if ind else "",
               "address": txt(addr.group(1)) if addr else "",
               "phone": phone.group(1) if phone else "",
               "website": web.group(1) if web else "",
               "source_url": f"{BASE}?location={urllib.parse.quote(seed)}&industries={INDS}",
               "captured": "2026-08-01"}
        if key not in companies or (not companies[key]["website"] and rec["website"]):
            companies[key] = rec
        n += 1
    withweb = sum(1 for c in companies.values() if c["website"])
    print(f"{seed:18s} rows={n:3d}  cumulative_companies={len(companies):4d}  with_website={withweb:4d}")
    time.sleep(2.5)

print("\nUNIQUE COMPANIES: %d | WITH WEBSITE: %d"
      % (len(companies), sum(1 for c in companies.values() if c["website"])))
with open("ad_members.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(next(iter(companies.values())).keys()))
    w.writeheader()
    for c in companies.values():
        w.writerow(c)
for c in list(companies.values())[:12]:
    print("  ", c["company"], "|", c["division"], "|", c["address"][:45], "|", c["website"])
