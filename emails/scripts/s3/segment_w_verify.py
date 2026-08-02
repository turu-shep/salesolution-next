#!/usr/bin/env python3
"""S3 Task 4 -- verify Segment W before parking anyone in it (build-plan §4.1/4.2).

Why. 674 seated companies carry no website. The locator did not publish one --
that is NOT the same as not having one, and §4.2 is explicit: a record only
becomes `disposition: no-website` / `segment: W` **after** domain resolution has
failed on every route. A company with a working email domain has a web presence
the locator simply did not record, and parking it unsent would be a measurement
error dressed up as a decision.

Three routes, in the order §4.1 sets them:

  1. **manufacturer-published email address.** Five sources publish one. The
     apex of a company email IS that company's domain -- unless it is a consumer
     mailbox or an ISP, which proves nothing, so those are rejected by name and
     the residual risk is reported rather than hidden.
  2. **DFS listing lookup.** Google Business Profile data via DataForSEO
     `business_data/business_listings/search`, keyed on the published company
     name inside a 50km circle around the company's own coordinates. A hit only
     counts when it CORROBORATES: same phone, or same ZIP, or same city plus a
     name-token overlap. A listing that merely sounds similar is not this company.
  3. **name + city organic search.** The last route, and the loosest, so it runs
     only where 1 and 2 both failed. The top organic result counts only when its
     domain is not a directory / marketplace / social host AND its title or
     snippet corroborates the company name.

Only after all three fail does a record become `no-website` / segment W.

Cost is real and is measured, not estimated: every response records the API's
own reported cost, and the run prints the total.

Pacing. Routes 2 and 3 hit a paid API that is built for concurrency, so the
3s-per-host rule that governs scraping small businesses' own servers does not
apply to it -- but every response is still cached on disk, so a re-run costs
nothing and no query is ever paid for twice.
"""
import argparse
import base64
import csv
import gzip
import hashlib
import json
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor

CAPTURED = "2026-08-01"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
REPO = os.path.abspath(os.path.join(ROOT, ".."))
S3_DIR = os.path.join(ROOT, "data", "s3")
CACHE = os.path.join(S3_DIR, "_dfs-cache")
csv.field_size_limit(10_000_000)

DFS = "https://api.dataforseo.com/v3"

# Mailbox hosts that prove nothing about a company's own web presence.
GENERIC_MAIL = {
    "gmail.com", "googlemail.com", "yahoo.com", "ymail.com", "hotmail.com",
    "outlook.com", "live.com", "msn.com", "aol.com", "icloud.com", "me.com",
    "mac.com", "protonmail.com", "proton.me", "gmx.com", "gmx.net", "mail.com",
    "yandex.com", "qq.com", "163.com", "zoho.com", "fastmail.com",
    # US consumer ISPs -- a company mailbox on one is not a company website
    "comcast.net", "sbcglobal.net", "bellsouth.net", "att.net", "verizon.net",
    "cox.net", "charter.net", "earthlink.net", "roadrunner.com", "rr.com",
    "windstream.net", "frontier.com", "frontiernet.net", "embarqmail.com",
    "juno.com", "netzero.net", "optonline.net", "sbcglobal.com", "swbell.net",
    "prodigy.net", "centurylink.net", "centurytel.net", "cableone.net",
    "mchsi.com", "insightbb.com", "suddenlink.net", "wowway.com", "ptd.net",
    "citlink.net", "nctv.com", "hughes.net", "peoplepc.com", "aim.com",
    "sympatico.ca", "shaw.ca", "telus.net", "bell.net", "rogers.com",
}
# Hosts that are never the company's own site.
NOT_OWN_SITE = {
    "facebook.com", "linkedin.com", "instagram.com", "twitter.com", "x.com",
    "youtube.com", "yelp.com", "manta.com", "bbb.org", "thomasnet.com",
    "yellowpages.com", "dnb.com", "zoominfo.com", "crunchbase.com",
    "bizapedia.com", "buzzfile.com", "mapquest.com", "indeed.com",
    "ziprecruiter.com", "glassdoor.com", "amazon.com", "ebay.com",
    "chamberofcommerce.com", "opencorporates.com", "apollo.io", "wikipedia.org",
    "google.com", "goo.gl", "sites.google.com", "business.site", "wix.com",
    "squarespace.com", "godaddysites.com", "weebly.com", "tripadvisor.com",
    "superpages.com", "hotfrog.com", "merchantcircle.com", "cylex.us.com",
    "alignable.com", "rocketreach.co", "signalhire.com", "leadiq.com",
    "trustpilot.com", "birdeye.com", "expertise.com", "porch.com", "angi.com",
    "thebluebook.com", "waze.com", "dandb.com", "corporationwiki.com",
    "buildzoom.com", "homeadvisor.com", "houzz.com", "bizprofile.net",
    "causeiq.com", "everybodywiki.com", "mapcarta.com", "loopnet.com",
    "crexi.com", "zillow.com", "realtor.com", "nextdoor.com", "foursquare.com",
    "yellowbook.com", "usdirectory.com", "local.com", "citysquares.com",
    "brownbook.net", "tuugo.us", "elocal.com", "ezlocal.com", "showmelocal.com",
    "n49.com", "iglobal.co", "wheretoapp.com", "pitchbook.com", "owler.com",
    "globaldata.com", "leadar.com", "clutch.co", "goodfirms.co", "salary.com",
    "trueup.io", "levels.fyi", "wellfound.com", "themuse.com", "jobs.com",
}

# Label shapes that are an organisation ABOUT businesses, not a business.
NOT_A_COMPANY_LABEL = re.compile(
    r"chamber|association|directory|yellowpage|wiki|localnews|gazette|"
    r"cityof|countyof|\.gov$|govoffice")
# Trade words too common to prove a domain belongs to a given company:
# "acehardware.com" shares "hardware" with half the pool.
COMMON_TRADE = {
    "hardware", "plumbing", "pipe", "bearing", "bearings", "hydraulic",
    "hydraulics", "pneumatic", "pneumatics", "electric", "electrical", "tool",
    "tools", "machine", "machinery", "equipment", "parts", "power", "steel",
    "rubber", "valve", "valves", "pump", "pumps", "hose", "belting", "motor",
    "motors", "fastener", "fasteners", "welding", "gas", "air", "fluid",
    "distributors", "distributing", "distribution", "wholesale", "sales",
    "products", "solutions", "systems", "technologies", "group", "national",
    "american", "united", "general", "quality", "premier", "advanced", "supplies",
}

_lock = threading.Lock()
_cost = [0.0]
_calls = [0]


def env():
    """Credentials from .env.local. Never printed, never written to disk."""
    user = os.environ.get("DATAFORSEO_USERNAME")
    pw = os.environ.get("DATAFORSEO_PASSWORD")
    if user and pw:
        return user, pw
    path = os.path.join(REPO, ".env.local")
    if os.path.exists(path):
        with open(path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("DATAFORSEO_USERNAME="):
                    user = line.split("=", 1)[1].strip().strip("\"'")
                elif line.startswith("DATAFORSEO_PASSWORD="):
                    pw = line.split("=", 1)[1].strip().strip("\"'")
    return user, pw


def cache_key(path, payload):
    blob = json.dumps([path, payload], sort_keys=True)
    return hashlib.sha1(blob.encode()).hexdigest() + ".gz"


def dfs_post(path, payload, auth, dry=False):
    """One DataForSEO call, cache-first. Returns the first task's result."""
    cp = os.path.join(CACHE, cache_key(path, payload))
    if os.path.exists(cp):
        try:
            with gzip.open(cp, "rb") as f:
                return json.loads(f.read().decode("utf-8", "ignore")), True
        except (OSError, ValueError):
            pass
    if dry:
        return None, False
    req = urllib.request.Request(
        DFS + path, data=json.dumps([payload]).encode(),
        headers={"Authorization": "Basic " + auth,
                 "Content-Type": "application/json"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                body = json.loads(r.read().decode("utf-8", "ignore"))
            break
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 3:
                time.sleep(4 * (attempt + 1))
                continue
            return {"_error": "HTTP %d" % e.code}, False
        except Exception as e:  # noqa: BLE001
            if attempt < 3:
                time.sleep(2 * (attempt + 1))
                continue
            return {"_error": repr(e)[:120]}, False
    else:
        return {"_error": "retries-exhausted"}, False

    with _lock:
        _cost[0] += float(body.get("cost") or 0)
        _calls[0] += 1
    os.makedirs(CACHE, exist_ok=True)
    with gzip.open(cp, "wb") as f:
        f.write(json.dumps(body).encode())
    return body, False


def apex(host):
    if not host:
        return None
    h = str(host).strip().lower()
    h = re.sub(r"^https?://", "", h).split("/")[0].split(":")[0]
    h = re.sub(r"^www\d*\.", "", h).rstrip(".")
    if not re.match(r"^[a-z0-9-]+(\.[a-z0-9-]+)+$", h):
        return None
    labels = h.split(".")
    two = {"co.uk", "com.au", "co.nz", "com.br", "com.mx", "co.jp", "co.in"}
    take = 3 if len(labels) > 2 and ".".join(labels[-2:]) in two else 2
    return ".".join(labels[-take:])


def tokens(name):
    stop = {"inc", "llc", "corp", "co", "company", "ltd", "the", "and", "of",
            "supply", "industrial", "industries", "service", "services"}
    return {t for t in re.split(r"[^a-z0-9]+", str(name or "").lower())
            if len(t) > 2 and t not in stop}


def digits(s):
    d = re.sub(r"\D", "", str(s or ""))
    if len(d) == 11 and d[0] == "1":
        d = d[1:]
    return d if len(d) == 10 else ""


# ------------------------------------------------------------------ route 1


def from_email(row):
    if not row.get("email"):
        return None, None
    host = apex(row["email"].split("@")[-1])
    if not host or host in GENERIC_MAIL:
        return None, "generic-mailbox" if host else None
    return host, None


# ------------------------------------------------------------------ route 2


def from_dfs_listing(row, auth, dry):
    name = row.get("company_display") or row.get("company")
    if not name:
        return None, "no-name", None
    payload = {"title": re.sub(r"\s+", " ", name)[:120], "limit": 10}
    if row.get("lat") and row.get("lng"):
        payload["location_coordinate"] = "%s,%s,50" % (row["lat"], row["lng"])
    body, cached = dfs_post("/business_data/business_listings/search/live",
                            payload, auth, dry)
    if not body or body.get("_error"):
        return None, (body or {}).get("_error", "not-run"), None
    tasks = body.get("tasks") or []
    if not tasks or not (tasks[0].get("result") or []):
        return None, "no-result", None
    items = (tasks[0]["result"][0] or {}).get("items") or []
    want = tokens(name)
    phone = digits(row.get("phone_e164"))
    for it in items:
        host = apex(it.get("domain") or it.get("url"))
        if not host or host in NOT_OWN_SITE:
            continue
        ai = it.get("address_info") or {}
        # Corroboration, in descending strength. A listing that only sounds
        # like the company is not the company.
        if phone and digits(it.get("phone")) == phone:
            return host, None, "phone"
        if row.get("zip5") and str(ai.get("zip") or "")[:5] == row["zip5"]:
            return host, None, "zip5"
        got = tokens(it.get("title"))
        same_city = (row.get("city") or "").lower() == str(ai.get("city") or "").lower()
        if same_city and want and len(want & got) >= max(1, len(want) // 2):
            return host, None, "city+name"
    return None, "no-corroborated-listing", None


# ------------------------------------------------------------------ route 3


def from_search(row, auth, dry):
    name = row.get("company_display") or row.get("company")
    if not name:
        return None, "no-name", None
    q = '%s %s %s' % (re.sub(r"\s+", " ", name)[:70],
                      row.get("city") or "", row.get("state") or "")
    payload = {"keyword": q.strip(), "language_code": "en",
               "location_code": 2840, "depth": 10}
    body, cached = dfs_post("/serp/google/organic/live/advanced", payload, auth, dry)
    if not body or body.get("_error"):
        return None, (body or {}).get("_error", "not-run"), None
    tasks = body.get("tasks") or []
    if not tasks or not (tasks[0].get("result") or []):
        return None, "no-result", None
    items = (tasks[0]["result"][0] or {}).get("items") or []
    want = tokens(name)
    for it in items:
        if it.get("type") != "organic":
            continue
        host = apex(it.get("domain") or it.get("url"))
        if not host or host in NOT_OWN_SITE:
            continue
        # Precision first, exactly as the rest of the pipeline is built. The
        # ONLY accepted proof here is that the domain is named after the
        # company: a shared distinctive token between the company name and the
        # host label. A title/snippet match alone put waze.com and
        # thebluebook.com on the list in the smoke test -- a directory page
        # about a company is not that company's website.
        label = re.sub(r"[^a-z0-9]", "", host.split(".")[0])
        if not want or not label or NOT_A_COMPANY_LABEL.search(label):
            continue
        matched = [t for t in want
                   if len(re.sub(r"[^a-z0-9]", "", t)) >= 4
                   and re.sub(r"[^a-z0-9]", "", t) in label]
        distinctive = [t for t in matched if t not in COMMON_TRADE]
        if distinctive or len(matched) >= 2:
            return host, None, "organic-top10-name-in-domain"
    return None, "no-corroborated-result", None


# ------------------------------------------------------------------ run


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", default=os.path.join(ROOT, "lists", "deduped-v2.csv"))
    ap.add_argument("--workers", type=int, default=8)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--no-search", action="store_true",
                    help="skip route 3 (the paid organic fallback)")
    ap.add_argument("--dry", action="store_true",
                    help="cache-only; make no paid calls")
    args = ap.parse_args()

    user, pw = env()
    if not user or not pw:
        print("DATAFORSEO_USERNAME/PASSWORD not found in env or .env.local",
              file=sys.stderr)
        return 2
    auth = base64.b64encode(("%s:%s" % (user, pw)).encode()).decode()
    os.makedirs(CACHE, exist_ok=True)

    rows = [r for r in csv.DictReader(open(args.csv, newline=""))
            if not r.get("domain")]
    if args.limit:
        rows = rows[:args.limit]
    print("W candidates (seated, no domain): %d" % len(rows), flush=True)

    out, lock = [], threading.Lock()
    n = [0]

    def work(row):
        rec = {"company": row.get("company"),
               "company_display": row.get("company_display"),
               "city": row.get("city"), "state": row.get("state"),
               "zip5": row.get("zip5"), "phone_e164": row.get("phone_e164"),
               "source": row.get("source"),
               "recovered_domain": None, "route": None, "corroboration": None,
               "notes": [], "captured": CAPTURED}

        d, note = from_email(row)
        if note:
            rec["notes"].append("email:" + note)
        if d:
            rec["recovered_domain"], rec["route"] = d, "email-domain"
            rec["corroboration"] = "published email address"
        else:
            d, note, corr = from_dfs_listing(row, auth, args.dry)
            if note:
                rec["notes"].append("dfs:" + note)
            if d:
                rec["recovered_domain"], rec["route"] = d, "dfs-listing"
                rec["corroboration"] = corr
            elif not args.no_search:
                d, note, corr = from_search(row, auth, args.dry)
                if note:
                    rec["notes"].append("search:" + note)
                if d:
                    rec["recovered_domain"], rec["route"] = d, "name-city-search"
                    rec["corroboration"] = corr
        with lock:
            out.append(rec)
            n[0] += 1
            if n[0] % 50 == 0:
                got = sum(1 for r in out if r["recovered_domain"])
                print("  %d/%d | rescued %d | api calls %d | cost $%.2f"
                      % (n[0], len(rows), got, _calls[0], _cost[0]), flush=True)
        return None

    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        list(ex.map(work, rows))

    got = sum(1 for r in out if r["recovered_domain"])
    payload = {
        "source": "segment-w-verify", "captured": CAPTURED,
        "routes": ["email-domain", "dfs-listing", "name-city-search"],
        "candidates": len(rows), "rescued": got, "no_website": len(rows) - got,
        "api_calls": _calls[0], "api_cost_measured": round(_cost[0], 4),
        "records": sorted(out, key=lambda r: r.get("company") or ""),
    }
    path = os.path.join(S3_DIR, "segment-w-%s.json" % CAPTURED)
    tmp = path + ".tmp"
    with open(tmp, "w") as f:
        json.dump(payload, f, indent=1)
    os.replace(tmp, path)
    print("\ncandidates %d | rescued %d | no-website %d | calls %d | cost $%.4f"
          % (len(rows), got, len(rows) - got, _calls[0], _cost[0]))
    print(Counter(r["route"] for r in out).most_common())
    print("-> %s" % path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
