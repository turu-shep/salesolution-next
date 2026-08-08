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

Extended 2026-08-03 for the no-domain backlog (handoff:
`emails/handoff/industrial-contact-list/no-domain-backlog*/02-assessment.md`).
The federal cohort has no phone, no coordinates and often no zip/city, which
the shipped rules quietly mishandle. Four changes, none of which alters the
behavior of a phone-bearing row that carries coordinates:

  * route 2 geocodes a missing lat/lng from `--centroids` (ZIP medians built
    from our own raw DFS corpus), falls back to a ZIP-exact `filters` clause,
    and is SKIPPED outright when no corroboration arm could ever fire
    (no phone, no zip, no city) -- that call could never be accepted, so it
    would be pure spend.
  * for a row with NO phone, a zip5 match alone no longer corroborates: it must
    also carry a name-token overlap. Industrial parks share zips, and title
    search returns name-alikes by construction.
  * `--alt-names` (UEI-keyed DBAs from the federal source) widens the
    corroboration token set, and a full miss earns ONE route-3 retry with the
    best token-distinct alternate name.
  * `--captured` / `--out` / `--cohort` / `--max-cost` parameterize what was
    hardcoded. The 2026-08-01 output artifact is historical and is never
    rewritten: an existing --out refuses to be overwritten without --overwrite.
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
    # 2026-08-03: the pilot hand-read caught wrong domains riding these --
    # "Sunbelt Spring & Stamping" accepted southernspring.com on "spring".
    "spring", "springs", "stamping", "stampings", "repair", "repairs",
    "compressor", "compressors", "welder", "welders", "automation", "controls",
    "fabrication", "machining", "packaging", "plastics", "coatings",
    "filtration", "conveyor", "conveyors", "fire", "protection", "safety",
    "battery", "batteries", "transportation", "sure", "true", "best", "first",
}

# State code -> full name, for the geographic echo test and place-token
# exclusion. A domain named after the row's own city or state proves nothing
# ("bomninchevroletmanassas.com" matched MANASSAS Electric Motor on "manassas").
STATE_NAMES = {
    "AL": "alabama", "AK": "alaska", "AZ": "arizona", "AR": "arkansas",
    "CA": "california", "CO": "colorado", "CT": "connecticut", "DE": "delaware",
    "FL": "florida", "GA": "georgia", "HI": "hawaii", "ID": "idaho",
    "IL": "illinois", "IN": "indiana", "IA": "iowa", "KS": "kansas",
    "KY": "kentucky", "LA": "louisiana", "ME": "maine", "MD": "maryland",
    "MA": "massachusetts", "MI": "michigan", "MN": "minnesota",
    "MS": "mississippi", "MO": "missouri", "MT": "montana", "NE": "nebraska",
    "NV": "nevada", "NH": "hampshire", "NJ": "jersey", "NM": "mexico",
    "NY": "york", "NC": "carolina", "ND": "dakota", "OH": "ohio",
    "OK": "oklahoma", "OR": "oregon", "PA": "pennsylvania", "RI": "rhode",
    "SC": "carolina", "SD": "dakota", "TN": "tennessee", "TX": "texas",
    "UT": "utah", "VT": "vermont", "VA": "virginia", "WA": "washington",
    "WV": "virginia", "WI": "wisconsin", "WY": "wyoming", "DC": "columbia",
}

_lock = threading.Lock()
_cost = [0.0]
_calls = [0]
_max_cost = [0.0]        # 0 = no ceiling; set from --max-cost
_ceiling_hit = [False]


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
    # Spend ceiling: the prompt's rule is stop and re-report at >25% over the
    # stated number. Cache reads above stay free and unaffected.
    if _max_cost[0]:
        with _lock:
            if _cost[0] >= _max_cost[0]:
                _ceiling_hit[0] = True
                return {"_error": "cost-ceiling"}, False
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


def from_dfs_listing(row, auth, dry, ext=None):
    ext = ext or {}
    name = row.get("company_display") or row.get("company")
    if not name:
        return None, "no-name", None
    phone = digits(row.get("phone_e164"))
    zip5 = str(row.get("zip5") or "").strip()[:5]
    city = (row.get("city") or "").strip()
    # No phone, no zip, no city: no corroboration arm could ever accept a hit,
    # so the call would be pure spend. Route 3's name-in-domain test is the
    # only rule that can decide these rows.
    if not phone and not zip5 and not city:
        return None, "skipped-uncorroboratable", None
    lat, lng = row.get("lat"), row.get("lng")
    if not (lat and lng) and zip5:
        cent = (ext.get("centroids") or {}).get(zip5)
        if cent:
            lat, lng = cent[0], cent[1]
    payload = {"title": re.sub(r"\s+", " ", name)[:120], "limit": 10}
    if lat and lng:
        payload["location_coordinate"] = "%s,%s,50" % (lat, lng)
    elif zip5:
        # No coordinates anywhere: scope the search to the zip itself. Same
        # filter family the DFS harvest already uses on country_code.
        payload["filters"] = [["address_info.zip", "=", zip5]]
    body, cached = dfs_post("/business_data/business_listings/search/live",
                            payload, auth, dry)
    if not body or body.get("_error"):
        return None, (body or {}).get("_error", "not-run"), None
    tasks = body.get("tasks") or []
    if not tasks or not (tasks[0].get("result") or []):
        return None, "no-result", None
    items = (tasks[0]["result"][0] or {}).get("items") or []
    want = tokens(name) | (ext.get("alt_tokens") or set())
    for it in items:
        host = apex(it.get("domain") or it.get("url"))
        if not host or host in NOT_OWN_SITE:
            continue
        ai = it.get("address_info") or {}
        got = tokens(it.get("title"))
        overlap = bool(want) and len(want & got) >= max(1, len(want) // 2)
        # Corroboration, in descending strength. A listing that only sounds
        # like the company is not the company.
        if phone and digits(it.get("phone")) == phone:
            return host, None, "phone"
        if zip5 and str(ai.get("zip") or "")[:5] == zip5:
            # A phone-bearing row keeps the shipped rule (zip alone). A row
            # with no phone lost its strong arm, so zip must also carry a
            # name-token overlap -- industrial parks share zips.
            if phone:
                return host, None, "zip5"
            if overlap:
                return host, None, "zip5+name"
            continue
        same_city = city.lower() == str(ai.get("city") or "").lower()
        if same_city and overlap:
            return host, None, "city+name"
    return None, "no-corroborated-listing", None


# ------------------------------------------------------------------ route 3


def from_search(row, auth, dry, ext=None, name_override=None):
    ext = ext or {}
    name = name_override or row.get("company_display") or row.get("company")
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
    want = tokens(name) | (ext.get("alt_tokens") or set())
    # The row's own place tokens prove nothing when they appear in a domain --
    # every business in Manassas can own a "manassas" domain.
    city = (row.get("city") or "").strip()
    state = str(row.get("state") or "").strip().upper()
    place = tokens(city) | ({STATE_NAMES[state]} if state in STATE_NAMES else set())
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
        # The whole name, concatenated in order, IS the domain label:
        # "Klamath Falls Electric Motor" at klamathfallselectricmotor.com.
        # Place and trade tokens prove nothing individually, but the full
        # ordered name is not an accident.
        ordered = [t for t in re.split(r"[^a-z0-9]+", str(name).lower())
                   if len(t) > 2 and t in want]
        fullname = re.sub(r"[^a-z0-9]", "", "".join(ordered))
        if fullname and len(fullname) >= 8 and label == fullname:
            return host, None, "exact-name-domain"
        matched = [t for t in want
                   if len(re.sub(r"[^a-z0-9]", "", t)) >= 4
                   and re.sub(r"[^a-z0-9]", "", t) in label]
        distinctive = [t for t in matched
                       if t not in COMMON_TRADE and t not in place]
        if not distinctive:
            continue
        # 2026-08-03, from the pilot hand-read: a name-token in the domain is
        # NOT enough on its own -- southernspring.com is not Sunbelt Spring,
        # and a Malaysian alliancebearings.net is not a Chino Hills bearing
        # house. Two ways to accept:
        #   * two DISTINCTIVE name tokens (two shared trade words --
        #     "alliance"+"bearings" -- still prove nothing), or
        #   * one distinctive token PLUS a geographic echo: the result's own
        #     title/snippet names the row's city or state. A local business's
        #     homepage result almost always carries its geography; a stranger
        #     sharing one name word almost never carries the RIGHT geography.
        # Rows with no geography at all (a slice of the federal residue) fall
        # back to requiring a longer, coined-looking distinctive token.
        blob = "%s %s %s" % (it.get("title") or "", it.get("description") or "",
                             it.get("breadcrumb") or "")
        if city or state:
            # Geographic echo is mandatory for every geo-bearing row -- the
            # fresh v4 hand-read caught two-token acceptances landing on
            # strangers (alliedhightech.com for a Woburn MA "Allied Tech";
            # a lake association for "Platte Lake Steel"). A row that HAS a
            # city must be echoed at city grain: a state echo is one word
            # shared with every business in California.
            if city:
                echo = city.lower() in blob.lower()
            else:
                echo = bool(re.search(r"\b%s\b" % re.escape(state), blob)) or (
                    state in STATE_NAMES and STATE_NAMES[state] in blob.lower())
            if echo:
                return host, None, ("name-in-domain+geo" if len(distinctive) < 2
                                    else "name2-in-domain+geo")
        elif len(distinctive) >= 2 or any(
                len(re.sub(r"[^a-z0-9]", "", t)) >= 5 for t in distinctive):
            return host, None, "name-in-domain(no-geo-row)"
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
    ap.add_argument("--captured", default=CAPTURED,
                    help="capture date stamped on records and the default out path")
    ap.add_argument("--out", default=None,
                    help="output JSON (default data/s3/segment-w-<captured>.json)")
    ap.add_argument("--cohort", default="",
                    help="label stamped on every record and the summary")
    ap.add_argument("--centroids", default=None,
                    help="JSON {zip5: [lat, lng]} used when a row has no coordinates")
    ap.add_argument("--alt-names", default=None,
                    help="JSON {federal_uei: [alternate names]} widening corroboration")
    ap.add_argument("--max-cost", type=float, default=0.0,
                    help="stop making NEW paid calls once measured cost reaches this")
    ap.add_argument("--overwrite", action="store_true",
                    help="allow writing over an existing --out file")
    args = ap.parse_args()

    user, pw = env()
    if not user or not pw:
        print("DATAFORSEO_USERNAME/PASSWORD not found in env or .env.local",
              file=sys.stderr)
        return 2
    auth = base64.b64encode(("%s:%s" % (user, pw)).encode()).decode()
    os.makedirs(CACHE, exist_ok=True)

    out_path = args.out or os.path.join(S3_DIR, "segment-w-%s.json" % args.captured)
    if os.path.exists(out_path) and not args.overwrite:
        print("refusing to overwrite %s (pass --overwrite)" % out_path,
              file=sys.stderr)
        return 2
    _max_cost[0] = args.max_cost

    centroids = {}
    if args.centroids and os.path.exists(args.centroids):
        centroids = json.load(open(args.centroids))
    alt_names = {}
    if args.alt_names and os.path.exists(args.alt_names):
        alt_names = json.load(open(args.alt_names))

    rows = [r for r in csv.DictReader(open(args.csv, newline=""))
            if not r.get("domain")]
    if args.limit:
        rows = rows[:args.limit]
    print("W candidates (seated, no domain): %d" % len(rows), flush=True)

    out, lock = [], threading.Lock()
    n = [0]

    def alt_retry_name(row):
        """The best token-DISTINCT alternate, or None. Punctuation variants
        normalize to the same token set and earn no second query."""
        alts = alt_names.get(str(row.get("federal_uei") or "")) or []
        primary = tokens(row.get("company_display") or row.get("company"))
        best, best_new = None, 0
        for a in sorted(alts):
            new = len(tokens(a) - primary)
            if new > best_new:
                best, best_new = a, new
        return best

    def work(row):
        ext = {"centroids": centroids}
        alts = alt_names.get(str(row.get("federal_uei") or "")) or []
        if alts:
            ext["alt_tokens"] = set().union(*(tokens(a) for a in alts))
        rec = {"company": row.get("company"),
               "company_display": row.get("company_display"),
               "city": row.get("city"), "state": row.get("state"),
               "zip5": row.get("zip5"), "phone_e164": row.get("phone_e164"),
               "source": row.get("source"),
               "federal_uei": row.get("federal_uei") or None,
               "cohort": args.cohort or None,
               "recovered_domain": None, "route": None, "corroboration": None,
               "notes": [], "captured": args.captured}

        d, note = from_email(row)
        if note:
            rec["notes"].append("email:" + note)
        if d:
            rec["recovered_domain"], rec["route"] = d, "email-domain"
            rec["corroboration"] = "published email address"
        else:
            d, note, corr = from_dfs_listing(row, auth, args.dry, ext)
            if note:
                rec["notes"].append("dfs:" + note)
            if d:
                rec["recovered_domain"], rec["route"] = d, "dfs-listing"
                rec["corroboration"] = corr
            elif not args.no_search:
                d, note, corr = from_search(row, auth, args.dry, ext)
                if note:
                    rec["notes"].append("search:" + note)
                if d:
                    rec["recovered_domain"], rec["route"] = d, "name-city-search"
                    rec["corroboration"] = corr
                else:
                    alt = alt_retry_name(row)
                    if alt:
                        d, note, corr = from_search(row, auth, args.dry, ext,
                                                    name_override=alt)
                        if note:
                            rec["notes"].append("search-alt:" + note)
                        if d:
                            rec["recovered_domain"] = d
                            rec["route"] = "name-city-search"
                            rec["corroboration"] = "%s(alt:%s)" % (corr, alt)
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
        "source": "segment-w-verify", "captured": args.captured,
        "cohort": args.cohort or None,
        "routes": ["email-domain", "dfs-listing", "name-city-search"],
        "candidates": len(rows), "rescued": got, "no_website": len(rows) - got,
        "api_calls": _calls[0], "api_cost_measured": round(_cost[0], 4),
        "cost_ceiling": args.max_cost or None, "ceiling_hit": _ceiling_hit[0],
        "route_yields": dict(Counter(r["route"] for r in out if r["route"])),
        "corroboration_yields": dict(
            Counter(r["corroboration"] for r in out if r["corroboration"])),
        "records": sorted(out, key=lambda r: r.get("company") or ""),
    }
    tmp = out_path + ".tmp"
    with open(tmp, "w") as f:
        json.dump(payload, f, indent=1)
    os.replace(tmp, out_path)
    print("\ncandidates %d | rescued %d | no-website %d | calls %d | cost $%.4f%s"
          % (len(rows), got, len(rows) - got, _calls[0], _cost[0],
             " | COST CEILING HIT" if _ceiling_hit[0] else ""))
    print(Counter(r["route"] for r in out).most_common())
    print("-> %s" % out_path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
