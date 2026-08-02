#!/usr/bin/env python3
"""S1 raw acquisition — PTDA Find-a-Distributor, full category pull.

Power Transmission Distributors Association public member locator. ASP.NET
WebForms + Telerik RadGrid behind a postback, per emails/research/scripts/
ptda_post.py. Three things that script did not have, discovered 2026-08-01:

1. **The field map in the research script is wrong** (the form has changed, or it
   was never verified). Actual mapping, read off the rendered labels:
       Sheet0$Input0$TextBox1  = Zip/Postal Code   (required)
       Sheet0$Input1$DropDown1 = Proximity miles   (10|25|50|100, required)
       Sheet0$Input2$TextBox1  = Company Name
       Sheet0$Input3$DropDown1 = Products Carried  (14 categories A-N, ''=Any)
   The research script set Input1=1 (a country code) and Input3=100 (a
   proximity) — neither is a valid value for the field it was written into.
   The 14 product categories live on Input3, and they are the `line_card[]`
   material this source exists for.

2. **The pager exposes a `ShowAll` control.** One extra postback returns every
   row for a query in a single response — no page walking, no result cap
   observed (98 rows returned for one query whose default view was 5 pages).

3. **VIEWSTATE chains.** A fresh search can be posted from the previous
   response's form fields, so the session needs one GET, not one per query.

Program: 15 passes (Any + 14 categories) x a 72-ZIP national grid at 100-mile
proximity = 1,080 searches. Every (zip, category) pair is its own provenance.

Expect heavy Grainger / Motion / BDI branch skew — that is the known shape of
PTDA membership. RAW ACQUISITION ONLY: capture everything, S2 suppresses.
"""
import csv
import gzip
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

from bs4 import BeautifulSoup

CAPTURED = "2026-08-01"
URL = ("https://www.ptda.org/PTDA/Members/Member-Lists/Locators/"
       "Find-a-Distributor.aspx")
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "data", "raw")
CACHE = os.path.join(RAW, "_cache", "ptda")
PROGRESS = os.path.join(CACHE, "_progress.jsonl")

DELAY = 3.0
BACKOFF = [15, 30, 60, 120, 240]
PROXIMITY = "100"

SHEET = ("ctl01$TemplateBody$WebPartManager1$gwpciNewQueryMenuCommon$"
         "ciNewQueryMenuCommon$ResultsGrid$Sheet0$")
PAGER = ("ctl01$TemplateBody$WebPartManager1$gwpciNewQueryMenuCommon$"
         "ciNewQueryMenuCommon$ResultsGrid$Grid1$ctl00$ctl03$ctl01$")

# The 14 "Products Carried" values, read off the form's own dropdown.
CATEGORIES = {
    "": "(Any)",
    "A": "ADJUSTABLE/VARIABLE SPEED DRIVES",
    "B": "BEARINGS",
    "C": "BELT & CHAIN DRIVES",
    "D": "CLUTCHES & BRAKES",
    "E": "MOTOR/MOTION CONTROL",
    "F": "CONVEYORS & MATERIAL HANDLING COMPONENTS",
    "G": "SHAFT COUPLINGS & U-JOINTS",
    "H": "HYDRAULICS & PNEUMATICS",
    "I": "GEARING (open/closed)",
    "J": "MOTORS",
    "K": "INDUSTRIAL SPECIALTY CHEMICALS",
    "L": "LINEAR MOTION",
    "M": "PUMPS",
    "N": "ACCESSORIES",
}

# 72-point national ZIP grid. At 100-mile proximity the circles overlap across
# the populated US; sparse-interior points are included so nothing is unreachable.
ZIPS = [
    ("02108", "Boston, MA"), ("06103", "Hartford, CT"), ("12207", "Albany, NY"),
    ("14202", "Buffalo, NY"), ("10001", "New York, NY"), ("19102", "Philadelphia, PA"),
    ("17101", "Harrisburg, PA"), ("15222", "Pittsburgh, PA"), ("04101", "Portland, ME"),
    ("21201", "Baltimore, MD"), ("23219", "Richmond, VA"), ("24011", "Roanoke, VA"),
    ("27601", "Raleigh, NC"), ("28202", "Charlotte, NC"), ("29201", "Columbia, SC"),
    ("30303", "Atlanta, GA"), ("31401", "Savannah, GA"), ("32202", "Jacksonville, FL"),
    ("32801", "Orlando, FL"), ("33602", "Tampa, FL"), ("33130", "Miami, FL"),
    ("32301", "Tallahassee, FL"), ("35203", "Birmingham, AL"), ("35801", "Huntsville, AL"),
    ("39201", "Jackson, MS"), ("37201", "Nashville, TN"), ("38103", "Memphis, TN"),
    ("37402", "Chattanooga, TN"), ("40202", "Louisville, KY"), ("40507", "Lexington, KY"),
    ("43215", "Columbus, OH"), ("44114", "Cleveland, OH"), ("45202", "Cincinnati, OH"),
    ("43604", "Toledo, OH"), ("48226", "Detroit, MI"), ("49503", "Grand Rapids, MI"),
    ("49855", "Marquette, MI"), ("46802", "Fort Wayne, IN"), ("46204", "Indianapolis, IN"),
    ("60602", "Chicago, IL"), ("61602", "Peoria, IL"), ("62701", "Springfield, IL"),
    ("53202", "Milwaukee, WI"), ("54301", "Green Bay, WI"), ("54481", "Stevens Point, WI"),
    ("55401", "Minneapolis, MN"), ("55802", "Duluth, MN"), ("50309", "Des Moines, IA"),
    ("52801", "Davenport, IA"), ("63101", "St. Louis, MO"), ("64106", "Kansas City, MO"),
    ("65806", "Springfield, MO"), ("68102", "Omaha, NE"), ("57104", "Sioux Falls, SD"),
    ("58102", "Fargo, ND"), ("67202", "Wichita, KS"), ("73102", "Oklahoma City, OK"),
    ("74103", "Tulsa, OK"), ("72201", "Little Rock, AR"), ("70112", "New Orleans, LA"),
    ("71101", "Shreveport, LA"), ("75201", "Dallas, TX"), ("77002", "Houston, TX"),
    ("78205", "San Antonio, TX"), ("79401", "Lubbock, TX"), ("79901", "El Paso, TX"),
    ("80202", "Denver, CO"), ("84101", "Salt Lake City, UT"), ("83702", "Boise, ID"),
    ("59101", "Billings, MT"), ("87102", "Albuquerque, NM"), ("85004", "Phoenix, AZ"),
    ("89101", "Las Vegas, NV"), ("89501", "Reno, NV"), ("90013", "Los Angeles, CA"),
    ("92101", "San Diego, CA"), ("93701", "Fresno, CA"), ("95814", "Sacramento, CA"),
    ("94105", "San Francisco, CA"), ("97204", "Portland, OR"), ("98104", "Seattle, WA"),
    ("99201", "Spokane, WA"), ("99501", "Anchorage, AK"), ("96813", "Honolulu, HI"),
]


class Blocked(Exception):
    """Host returned a hard access control. Stop this source, never bypass."""


def note(rec):
    with open(PROGRESS, "a") as f:
        f.write(json.dumps(rec) + "\n")


def form_fields(body):
    """Every non-button <input> on the page, so VIEWSTATE round-trips intact."""
    f = {}
    for m in re.finditer(r"<input\b[^>]*>", body, re.I):
        tag = m.group(0)
        n = re.search(r'name="([^"]+)"', tag)
        if not n:
            continue
        ty = re.search(r'type="([^"]+)"', tag)
        if ty and ty.group(1).lower() in ("submit", "button", "image",
                                          "checkbox", "radio"):
            continue
        v = re.search(r'value="([^"]*)"', tag)
        f[n.group(1)] = html.unescape(v.group(1)) if v else ""
    return f


class Session:
    def __init__(self):
        import http.cookiejar
        cj = http.cookiejar.CookieJar()
        self.op = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(cj))
        self.op.addheaders = [("User-Agent", UA), ("Accept", "text/html")]
        self.state = None
        self.origin_requests = 0

    def open_form(self):
        body = self._get()
        self.state = form_fields(body)
        return body

    def _get(self):
        for attempt in range(len(BACKOFF) + 1):
            try:
                self.origin_requests += 1
                return self.op.open(URL, timeout=90).read().decode("utf-8", "ignore")
            except urllib.error.HTTPError as e:
                if e.code == 403:
                    raise Blocked(f"403 on GET {URL} — stopping PTDA, no bypass")
                wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
                note({"op": "get", "status": e.code, "backoff_s": wait})
                time.sleep(wait)
            except Exception as e:
                wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
                note({"op": "get", "error": repr(e)[:200], "backoff_s": wait})
                time.sleep(wait)
        raise Blocked("PTDA GET gave up after full backoff ladder")

    def _post(self, fields):
        data = urllib.parse.urlencode(fields).encode()
        for attempt in range(len(BACKOFF) + 1):
            req = urllib.request.Request(URL, data=data, headers={
                "User-Agent": UA,
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": URL, "Accept": "text/html"})
            try:
                self.origin_requests += 1
                return self.op.open(req, timeout=120).read().decode("utf-8", "ignore")
            except urllib.error.HTTPError as e:
                if e.code == 403:
                    raise Blocked(f"403 on POST {URL} — stopping PTDA, no bypass")
                if e.code == 429:
                    wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
                    note({"op": "post", "status": 429, "backoff_s": wait})
                    print(f"  429 -> backoff {wait}s", flush=True)
                    time.sleep(wait)
                    continue
                if e.code in (500, 502, 503, 504):
                    wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
                    note({"op": "post", "status": e.code, "backoff_s": wait})
                    time.sleep(wait)
                    continue
                note({"op": "post", "status": e.code, "action": "skip"})
                return None
            except Exception as e:
                wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
                note({"op": "post", "error": repr(e)[:200], "backoff_s": wait})
                time.sleep(wait)
        return None

    def search(self, zip5, cat):
        f = dict(self.state or {})
        f.pop("__EVENTTARGET", None)
        f.pop("__EVENTARGUMENT", None)
        f.update({
            SHEET + "Input0$TextBox1": zip5,
            SHEET + "Input1$DropDown1": PROXIMITY,
            SHEET + "Input2$TextBox1": "",
            SHEET + "Input3$DropDown1": cat,
            SHEET + "SubmitButton": "Find",
            "IsControlPostBack": "1",
            "__EVENTTARGET": "",
            "__EVENTARGUMENT": "",
        })
        body = self._post(f)
        if body:
            self.state = form_fields(body)
        return body

    def show_all(self, zip5, cat):
        f = dict(self.state or {})
        f.update({
            SHEET + "Input0$TextBox1": zip5,
            SHEET + "Input1$DropDown1": PROXIMITY,
            SHEET + "Input2$TextBox1": "",
            SHEET + "Input3$DropDown1": cat,
            "IsControlPostBack": "1",
            "__EVENTTARGET": PAGER + "ShowAll",
            "__EVENTARGUMENT": "",
        })
        f.pop(SHEET + "SubmitButton", None)
        body = self._post(f)
        if body:
            self.state = form_fields(body)
        return body


ITEMS_RX = re.compile(r"([\d,]+)\s*items?\s*in\s*([\d,]+)\s*pages?", re.I)


def item_count(body):
    m = ITEMS_RX.search(re.sub(r"<[^>]+>", " ", body))
    if not m:
        return None, None
    return int(m.group(1).replace(",", "")), int(m.group(2).replace(",", ""))


ADDR_RX = re.compile(r"^(?P<city>.+?),\s*(?P<state>[A-Z]{2})\s+(?P<zip>[\d\-]+)\s*$")


def parse(body, zip5, cat, src_url):
    """Every rendered row becomes one raw record. Nothing is dropped."""
    soup = BeautifulSoup(body, "html.parser")
    out = []
    for i, tbl in enumerate(soup.select("table.manufacturer-tbl")):
        h4 = tbl.find("h4")
        name = h4.get_text(" ", strip=True) if h4 else None
        if not name:
            continue
        tds = tbl.find_all("td", recursive=False) or tbl.select("tbody > tr > td")
        # address cell: the one holding a <br> and matching "City, ST ZIP"
        addr_1 = city = state = zip_out = None
        for td in tbl.select("td"):
            if td.find("table"):
                continue
            parts = [p.strip() for p in
                     td.get_text("\n", strip=True).split("\n") if p.strip()]
            if len(parts) >= 2:
                m = ADDR_RX.match(parts[-1])
                if m:
                    addr_1 = " ".join(parts[:-1])
                    city, state = m.group("city"), m.group("state")
                    zip_out = m.group("zip")
                    break
        phones = {}
        for tr in tbl.select("table tr"):
            cells = tr.find_all("td")
            if len(cells) == 2:
                label = cells[0].get_text(" ", strip=True).rstrip(":").lower()
                val = cells[1].get_text(" ", strip=True)
                if label in ("phone", "toll free", "fax") and val:
                    phones[label.replace(" ", "_")] = val
        a = tbl.find("a", href=True)
        website = a["href"] if a and a["href"].startswith("http") else None
        # "Distance: 1.28 miles" sits in a sibling div after the table
        dist = None
        nxt = tbl.find_next("div")
        if nxt:
            dm = re.search(r"Distance:\s*([\d.]+)\s*miles", nxt.get_text(" ", strip=True))
            if dm:
                dist = float(dm.group(1))
        out.append({
            "company": name,
            "address_1": addr_1,
            "city": city,
            "state": state,
            "zip": zip_out,
            "phone_raw": phones.get("phone"),
            "toll_free_raw": phones.get("toll_free"),
            "fax_raw": phones.get("fax"),
            "website": website,
            "distance_mi": dist,
            "product_category_code": cat or None,
            "product_category": CATEGORIES.get(cat),
            "query_zip": zip5,
            "query_proximity_mi": int(PROXIMITY),
            "row_index": i,
            "source": "ptda",
            "source_url": src_url,
            "captured": CAPTURED,
        })
    return out


def cache_path(zip5, cat):
    return os.path.join(CACHE, f"{zip5}__{cat or 'ANY'}.html.gz")


def main():
    os.makedirs(CACHE, exist_ok=True)
    os.makedirs(RAW, exist_ok=True)
    sess = Session()
    sess.open_form()

    records, stats = [], []
    t0 = time.time()
    plan = [(z, label, c) for c in CATEGORIES for z, label in ZIPS]
    total = len(plan)
    n = 0
    try:
        for zip5, label, cat in plan:
            n += 1
            path = cache_path(zip5, cat)
            src_url = (f"{URL}?zip={zip5}&proximity={PROXIMITY}"
                       f"&products={urllib.parse.quote(cat)}")
            if os.path.exists(path):
                with gzip.open(path, "rt", encoding="utf-8", errors="ignore") as f:
                    body = f.read()
                cached = True
            else:
                cached = False
                body = sess.search(zip5, cat)
                if body is None:
                    stats.append({"zip": zip5, "metro": label, "category": cat,
                                  "rows": None, "status": "failed"})
                    time.sleep(DELAY)
                    continue
                items, pgs = item_count(body)
                time.sleep(DELAY)
                if pgs and pgs > 1:
                    full = sess.show_all(zip5, cat)
                    if full:
                        body = full
                    time.sleep(DELAY)
                with gzip.open(path, "wt", encoding="utf-8") as f:
                    f.write(body)
            items, pgs = item_count(body)
            recs = parse(body, zip5, cat, src_url)
            records.extend(recs)
            stats.append({"zip": zip5, "metro": label, "category": cat,
                          "category_name": CATEGORIES.get(cat),
                          "items_reported": items, "rows_parsed": len(recs),
                          "cached": cached})
            if n % 25 == 0 or n == total:
                print(f"[{n}/{total}] {zip5}/{cat or 'ANY'} rows={len(recs)} "
                      f"raw={len(records)} origin_reqs={sess.origin_requests} "
                      f"elapsed={time.time()-t0:.0f}s", flush=True)
    except Blocked as e:
        print(f"\nBLOCKED: {e}", file=sys.stderr)

    payload = {
        "source": "ptda",
        "source_name": "PTDA Find-a-Distributor (full category pull)",
        "captured": CAPTURED,
        "base_url": URL,
        "proximity_mi": int(PROXIMITY),
        "categories": CATEGORIES,
        "zips": [{"zip": z, "metro": m} for z, m in ZIPS],
        "queries_planned": total,
        "queries_completed": len(stats),
        "requests_to_origin": sess.origin_requests,
        "per_query": stats,
        "records": records,
    }
    with open(os.path.join(RAW, f"ptda-{CAPTURED}.json"), "w") as f:
        json.dump(payload, f, indent=1)
    cols = list(records[0].keys()) if records else []
    with open(os.path.join(RAW, f"ptda-{CAPTURED}.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(records)
    print(f"\nDONE raw_records={len(records)} queries={len(stats)} "
          f"origin_requests={sess.origin_requests} elapsed={time.time()-t0:.0f}s")


if __name__ == "__main__":
    main()
