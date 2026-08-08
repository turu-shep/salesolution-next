#!/usr/bin/env python3
"""S1 E4 wave — Banner Engineering "Where to Buy" (AEM + api2d `dist` search).

**The route was pinned before this file existed; nothing here re-researches it.**
`/etc.clientlibs/designs/banner/clientlibs/wheretobuy.min.js` is cached at
`data/raw/_cache/e4bundle-banner/bundle-0.js` and is read **from disk**. It is a
Backbone app whose `Collection.url()` composes exactly one route:

    GET https://api2d.bannerengineering.com/dist
        ?apikey=<site id>&sitename=us/en&q=<query>&return=json

`parse: function(e){return e.ALL}` — the collection reads `ALL` off the envelope.
The rest of the envelope is named by the success handler: `MatchData.matchedLat`
/ `matchedLong` / `matchedCity` (the geocode the search resolved to) and
`banner_error_code` (the bad-search signal). `sitename` comes from the page path
(`/us/en/where-to-buy.html` -> `us/en`) and its slash is **not** percent-encoded
by the browser, so it is not encoded here either.

`q` is free text handed to a geocoder. This is a **SEARCH** endpoint, not a
collection: results are query-scoped and there is no documented all-records call.
Whether an empty `q` returns the national set is a question, so it is asked once,
first, and the answer is recorded either way.

**Credential boundary.** `apikey` is read at run time out of the anonymous page's
own `window.bnrApiConfig` (cached at `data/raw/_cache/e4evidence-banner/
locator.html`, **not re-fetched**). It is a 13-character site identifier that the
page publishes to every visitor and reuses in `<img src=".../part/
loadimageforpart?apikey=...">` — the Banjo widget-uid shape, a public site
identifier and not a credential. It is deliberately never written into this file,
into the raw JSON, or into any printed line: `source_url` is redacted everywhere,
`sys.stdout`/`stderr` are wrapped in a scrubber for the whole run (the shared
`Fetcher` prints raw URLs on backoff and this file cannot edit it), and
`write_raw` is preceded by an assertion over the serialized payload. A value the
anonymous page did *not* publish would have stopped the source.

⚠ **ROBOTS — an override is in force, and its scope is narrow.**
`api2d.bannerengineering.com/robots.txt` (cached, verbatim) is two lines:

    User-agent: *
    Disallow: /

**Artur signed gate R-1 on 2026-08-04** (strategy `00-sourcing-strategy.md` §9):
override robots.txt **on this host only**, having been shown the counter-argument
verbatim — this firm sells AI-search-readiness and SEO, so being seen to ignore a
`Disallow` is an asymmetric reputational risk. What he bought is the
**qualification signal**, not volume: Banner is the only measured E4 locator that
publishes explicit authorization tiers. Everything else still binds and is
enforced below: >=3s/host, one worker, disk cache so a re-run makes zero origin
requests, the honest desktop UA never rotated, no stealth. **A 403 or 401 still
stops the source dead** — the override is about a stated preference, never about
defeating an access control. And because this is an override of a preference,
volume is deliberately small: the ladder is capped at `MAX_ORIGIN_REQUESTS` and
refuses to continue past it.

⚠ **This is a TERRITORY lookup, not a radius search — measured, not assumed.**
The payload carries `DISTANCE`, and it is miles: it matches a haversine from
`MatchData` to the record's own lat/lng to three decimals on every row. Houston
returned AWC INC's branches at 9, 52, 187, 234, 437, 722, 798 and **845 miles**.
So `q` resolves to the distributor(s) whose *territory* covers that point, and
the response is their **entire branch network** regardless of distance, plus a
fixed tail of national catalog accounts. Consequences, both handled below:
  - A "furthest returned record" radius is meaningless as a probe area — it
    reached 1,269 mi and swallowed 84% of `deduped-v7`. The probe area is
    therefore a **stated 50-mile circle** and only records with `DISTANCE <= 50`
    are projected from.
  - Even that is a **floor**: one query is one ZIP's territory, and a 50-mile
    circle holds hundreds of ZIPs whose territories may differ.

⚠ §5i SOURCE-NATIVE CODES, CAPTURED VERBATIM AND UNINTERPRETED. Five of them —
`ACCOUNT_NUMBER`, `TERR_GROUP`, `RESIDENTIAL_FLAG`, `ZIP_CODE`, `DISTANCE` — are
**not named anywhere in the bundle**; they only exist in the response, which is
why the shape probe runs before anything else. Captured: `CATEGORY_CODE` (the
bundle's switch names BANNER / DISTRIBUTOR / REPRESENTATIVE / "JOINT VENTURE"),
`SUBTYPE` (DIGITAL / NATIONAL), `PRIMARY_FLAG`, `TERR_GROUP`, `ACCOUNT_NUMBER`
(the dealer account every branch of a company shares — the source's own company
key), `RESIDENTIAL_FLAG`, `RECORD_ID`, `ZIP_CODE`, `COUNTRY`, `STATE`, `URL`,
plus an `x_*_raw` catch-all. `CLOSEST` and `DISTANCE` are captured but are
**properties of the query, not of the dealer**, so they are excluded from the
sorting verdict the same way Festo's `@search.score` was.

⚠ **A decoding table is not a code.** SKF, measured 2026-08-03, published a rich
DC001-DC028 tier vocabulary in its bundle while the payload field was a
**constant on every row**. So `code_sorts()` measures the distribution rather
than trusting the switch statement, and reports whether each code actually
discriminates. **Measured here: `CATEGORY_CODE` sorts across all rows into
DISTRIBUTOR / REPRESENTATIVE / BANNER — which is an *exclusion filter*, and it is
used as one — but across the 51 dealer rows it is the single value DISTRIBUTOR.
There is no authorization tier among distributors.** That distinction is the
whole verdict, so `code_sorts()` is run twice (all US rows, then dealers only)
and `decide()` reads the dealer pass. Nulls count as a level: `SUBTYPE` is null
on 55 of 60 rows and NATIONAL on 5, and "absent vs NATIONAL" is a real split, so
it is scored as one rather than dismissed as constant.

⚠⚠ **`CATEGORY_CODE == "BANNER"` NEVER APPEARS. Filtering on it seats the
manufacturer.** Measured on this probe: both Banner Engineering rows (Elmhurst IL
and Broadview Heights OH) come back as **`CATEGORY_CODE = REPRESENTATIVE`**, and
the value `BANNER` was not observed on a single row. The bundle hints at this —
its label override fires on `"BANNER ENGINEERING CORP" === PARTY_NAME &&
"REPRESENTATIVE" === CATEGORY_CODE` — but only the live payload proves it. So the
flag reads **the party name as well as the code**, and both rows were caught by
the name signal alone. The one payload field that does separate them is
`TERR_GROUP`: `ASM_SITES` for Banner's own sites vs `REP` for genuine rep
agencies, a distinction `CATEGORY_CODE` collapses. `TERR_GROUP` is not named
anywhere in the bundle. Rep agencies are not distributors either. Everything is
flagged and excluded from every dealer count, **never dropped** — §5l: nine
manufacturers reached the shortlist by accident.
"""
import csv
import io
import json
import math
import os
import re
import sys
import urllib.parse

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402

_polite.CAPTURED = "2026-08-04"

from _polite import (RAW, ROOT, US_STATES, Blocked, Fetcher, apex,  # noqa: E402
                     digits, norm_company, report, write_raw)

CAPTURED = _polite.CAPTURED

SOURCE = "banner"
API_ROOT = "https://api2d.bannerengineering.com"
COLLECTION = "dist"
SITENAME = "us/en"                     # getSitename() over /us/en/where-to-buy.html
PAGE = "https://www.bannerengineering.com/us/en/where-to-buy.html"

EVIDENCE = os.path.join(RAW, "_cache", "e4evidence-banner")
LOCATOR_HTML = os.path.join(EVIDENCE, "locator.html")
BUNDLE = os.path.join(RAW, "_cache", "e4bundle-banner", "bundle-0.js")
API_ROBOTS = os.path.join(RAW, "_cache", "e4apihost-api2d.bannerengineering.com",
                          "robots.txt")

POOL = os.path.join(ROOT, "lists", "deduped-v7.csv")

# Hard ceiling. The override is of a stated preference, so the request count is
# part of the compliance posture, not just a budget: the ladder refuses to make
# request N+1 rather than trusting itself to stop.
#
# TWO ceilings, because there are two runs. `--probe` (the default, and what ran
# first on 2026-08-04) is capped at 8. `--sweep` raises the cap to the batch
# limit BELOW, which is stated here, in code, before the first request — the pack
# convention for anything that spends. Nothing about this is billed; the budget
# being spent is requests against a host that said `Disallow: /`, which is why it
# is written down rather than left to judgement mid-run.
MAX_ORIGIN_REQUESTS = 8
SWEEP_CEILING = 600
CEILING = MAX_ORIGIN_REQUESTS          # set once at startup, never mid-run

# ── the sweep, and the stopping rule, both fixed BEFORE the first request ─────
#
# The endpoint is territory-scoped, not radius-scoped: one query returns the
# distributor company assigned to that ZIP's territory **with every one of its
# branches**, plus the territory's rep agency, plus the NATIONAL rows. So the
# unit of exhaustion is the TERRITORY, and the sweep is a geographic grid.
#
# The grid is a maximin (farthest-point) sample over the ZIP centroids already
# on disk. Maximin gives two things a rectangular lattice does not: it spends no
# queries on ocean or empty desert, and its ORDER is coarse-to-fine, so the
# cumulative-new-companies curve is a real saturation curve rather than an
# artifact of alphabetical or population ordering.
GRID_POINTS = 320
# Second pass: density-weighted fill, because maximin spreads by AREA and so
# thins out exactly where distributors are thickest. Batch limit for the whole
# sweep is therefore GRID_POINTS + DENSITY_FILL_POINTS = 470 planned, against a
# hard ceiling of SWEEP_CEILING.
DENSITY_FILL_POINTS = 150
DENSITY_FILL_MIN_SEP_MI = 40.0
ZIP_CENTROIDS = os.path.join(ROOT, "data", "s3", "_zip-centroids-2026-08-03.json")
# Geographic centre of the contiguous US — the deterministic seed for the
# maximin walk, so the grid is reproducible rather than random.
GRID_SEED_LATLNG = (39.8283, -98.5795)
# STOP EARLY when this many consecutive queries have added ZERO new distinct
# companies. Declared here so the run cannot rationalise a different number
# after seeing the curve.
SATURATION_WINDOW = 60

# (label, ZIP form, city form, centroid lat, lng)
METROS = [
    ("houston-tx", "77002", "Houston, TX", 29.7604, -95.3698),
    ("chicago-il", "60601", "Chicago, IL", 41.8781, -87.6298),
    ("cleveland-oh", "44113", "Cleveland, OH", 41.4993, -81.6944),
]

# The probe area, STATED rather than read off the response. Matches the 50-mile
# half-side of the SKF probe boxes so the two sources' projections are on the
# same footing. See measure(): a radius taken from the furthest returned record
# is meaningless here because the endpoint is a territory lookup.
PROBE_RADIUS_MI = 50.0

# The bundle's own category vocabulary, quoted so the measured distribution can
# be compared against what the UI can render. NOT used to interpret anything.
BUNDLE_CATEGORY_CODES = ("BANNER", "DISTRIBUTOR", "REPRESENTATIVE", "JOINT VENTURE")
BUNDLE_SUBTYPES = ("DIGITAL", "NATIONAL")

DEALER_EXCLUDED_CATEGORIES = {"BANNER", "REPRESENTATIVE"}

US_COUNTRY_VALUES = {"US", "USA", "U.S.", "U.S.A.", "UNITED STATES",
                     "UNITED STATES OF AMERICA"}

# Reported separately per the brief. Never suppressed from the raw file.
CHAINS = {
    "Motion": r"^motion\b",
    "Applied": r"^applied (industrial|maintenance)\b",
    "Fastenal": r"^fastenal\b",
    "Grainger": r"\bgrainger\b",
    "MSC": r"^msc\b",
    "DXP": r"^dxp\b",
    "Kaman": r"^kaman\b",
    "BDI": r"^bdi\b|^bearing distributors\b",
    "Wesco": r"^wesco\b",
    "Rexel": r"^rexel\b",
    "Graybar": r"^graybar\b",
}

STATE_ABBR = {
    "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR",
    "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE",
    "district of columbia": "DC", "florida": "FL", "georgia": "GA", "hawaii": "HI",
    "idaho": "ID", "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS",
    "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
    "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS",
    "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV",
    "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
    "north carolina": "NC", "north dakota": "ND", "ohio": "OH", "oklahoma": "OK",
    "oregon": "OR", "pennsylvania": "PA", "rhode island": "RI",
    "south carolina": "SC", "south dakota": "SD", "tennessee": "TN", "texas": "TX",
    "utah": "UT", "vermont": "VT", "virginia": "VA", "washington": "WA",
    "west virginia": "WV", "wisconsin": "WI", "wyoming": "WY",
    "puerto rico": "PR", "guam": "GU", "virgin islands": "VI",
}


# ── the public site identifier, read from disk, never recorded ───────────────

def site_identifier():
    """Read `window.bnrApiConfig.apiKey` out of the ALREADY-CACHED locator page.

    Zero requests. The value is a public site id the anonymous page publishes to
    every visitor; it is loaded at run time on purpose so it never lands in this
    file, in git, or in any output.
    """
    with open(LOCATOR_HTML, encoding="utf-8", errors="ignore") as fh:
        html = fh.read()
    m = re.search(r'bnrApiConfig\s*=\s*JSON\.parse\("(.*?)"\);', html, re.S)
    if not m:
        raise SystemExit(
            f"no window.bnrApiConfig in {LOCATOR_HTML} — the page changed. Stop "
            f"and re-do the evidence capture rather than guessing a value.")
    # AEM emits \x22 for quotes and \/ for slashes. `\/` is not a Python escape,
    # so it is unwrapped first rather than letting unicode_escape warn on it.
    esc = m.group(1).replace("\\/", "/")
    cfg = json.loads(esc.encode().decode("unicode_escape"))
    key = (cfg.get("apiKey") or "").strip()
    root = (cfg.get("apiRoot") or "").strip().rstrip("/")
    if not key:
        raise SystemExit("bnrApiConfig carries no apiKey — stop, do not invent one.")
    if root != API_ROOT:
        raise SystemExit(
            f"the page now publishes apiRoot={root!r}, not {API_ROOT!r}. The "
            f"pinned host is stale — re-do the recon rather than probing it.")
    return key


class _Scrub(io.TextIOBase):
    """stdout/stderr wrapper that redacts the site identifier.

    `_polite.Fetcher` prints the full URL on backoff and puts it in `Blocked`
    messages, and this file is not allowed to edit `_polite.py`. Wrapping both
    streams for the whole run makes a leak structurally impossible rather than
    a thing to remember.
    """

    def __init__(self, wrapped, secret):
        self._w, self._s = wrapped, secret

    def write(self, s):
        return self._w.write(s.replace(self._s, "<apikey>") if self._s else s)

    def flush(self):
        self._w.flush()

    def isatty(self):
        return False


def public_url(url, key):
    return url.replace(key, "<apikey>") if key else url


# ── the route ────────────────────────────────────────────────────────────────

def dist_url(key, query):
    """Exactly what `Collection.url()` composes, in the same parameter order.

    `sitename=us/en` keeps its slash unencoded because the bundle concatenates
    it raw; `q` goes through the encodeURIComponent equivalent.
    """
    return (f"{API_ROOT}/{COLLECTION}?apikey={key}"
            f"&sitename={SITENAME}"
            f"&q={urllib.parse.quote(query, safe='')}"
            f"&return=json")


def fetch(f, key, query, cache_name):
    """One paced GET. Enforces the request ceiling BEFORE spending a request."""
    if f.origin_requests >= CEILING and not _cached(f, cache_name):
        raise SystemExit(
            f"request ceiling reached ({CEILING}). Refusing to make "
            f"another origin request on an override-only host. Report what is "
            f"already measured.")
    url = dist_url(key, query)
    payload, cached = f.json(url, cache_name, headers={
        "Referer": PAGE,
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "Origin": "https://www.bannerengineering.com",
    })
    return payload, cached, public_url(url, key)


def _cached(f, cache_name):
    path = os.path.join(f.cache, cache_name)
    return os.path.exists(path) and os.path.getsize(path) >= f.min_bytes


def unwrap(payload):
    """`parse: e.ALL`. Everything else on the envelope is reported, not read."""
    if isinstance(payload, list):          # defensive: a bare array is possible
        return payload, ["(bare array — no envelope)"], None, None
    rows = payload.get("ALL")
    rows = rows if isinstance(rows, list) else []
    match = payload.get("MatchData") if isinstance(payload, dict) else None
    return (rows, sorted(payload.keys()), match,
            payload.get("banner_error_code"))


# ── normalisation ────────────────────────────────────────────────────────────

def clean(v):
    if v is None:
        return None
    s = str(v).strip()
    return s or None


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def state_of(raw):
    s = (raw or "").strip()
    if not s:
        return None
    return s.upper() if s.upper() in US_STATES else STATE_ABBR.get(s.lower())


def phone_of(row):
    """The bundle's own getPhone(): area code in parens when it is non-empty."""
    area = clean(row.get("PHONE_AREA_CODE"))
    number = clean(row.get("PHONE_NUMBER"))
    if area and number:
        return f"({area}) {number}"
    return number or area


def split_url(raw):
    """`URL` is one field carrying either a website or an email address.

    The bundle proves the overload — `getWebsiteUrl()` prefixes "mailto:" when
    the value contains "@bannerengineering.com". Generalised here to any address
    shape so a rep's own mailbox is not counted as a website.
    """
    u = clean(raw)
    if not u:
        return None, None
    if "@" in u and "://" not in u and "/" not in u:
        return None, u.lstrip("mailto:") if u.lower().startswith("mailto:") else u
    if u.lower().startswith("mailto:"):
        return None, u[7:] or None
    return u, None


_HANDLED = {"PARTY_NAME", "ADDRESS1", "ADDRESS2", "CITY", "STATE", "POSTAL_CODE",
            "COUNTRY", "LATITUDE", "LONGITUDE", "PHONE_AREA_CODE", "PHONE_NUMBER",
            "URL", "CATEGORY_CODE", "SUBTYPE", "CLOSEST", "PRIMARY_FLAG",
            "RECORD_ID", "ACCOUNT_NUMBER", "TERR_GROUP", "RESIDENTIAL_FLAG",
            "ZIP_CODE", "DISTANCE"}


def normalize(row, source_url, probe):
    country = clean(row.get("COUNTRY"))
    website, email = split_url(row.get("URL"))
    phone = phone_of(row)
    category = clean(row.get("CATEGORY_CODE"))
    company = clean(row.get("PARTY_NAME"))

    # Banner's own rows arrive under TWO codes: CATEGORY_CODE == "BANNER", and
    # (per the bundle's label override) PARTY_NAME "BANNER ENGINEERING CORP"
    # filed as REPRESENTATIVE. Both signals are computed and both are recorded.
    by_code = (category or "").upper() == "BANNER"
    by_name = norm_company(company).startswith("banner engineering")

    rec = {
        "company": company,
        "address_1": clean(row.get("ADDRESS1")),
        "address_2": clean(row.get("ADDRESS2")),
        "city": clean(row.get("CITY")),
        "state": state_of(row.get("STATE")),
        "zip_raw": clean(row.get("POSTAL_CODE")),
        "phone_raw": phone,
        "phone_10": digits(phone),
        "email": email,
        "website": website,
        "domain": apex(website),
        "lat": num(row.get("LATITUDE")),
        "lng": num(row.get("LONGITUDE")),
        # is_us is read off the record's own COUNTRY. Never inferred from the
        # ZIP, the query, the phone or the coordinates.
        "is_us": (country.upper() in US_COUNTRY_VALUES) if country else None,
        "source": SOURCE,
        "source_url": source_url,
        "captured": CAPTURED,
    }
    # ── §5i SOURCE-NATIVE CODES, VERBATIM AND UNINTERPRETED ──────────────────
    rec["category_code_raw"] = category
    rec["subtype_raw"] = clean(row.get("SUBTYPE"))
    rec["primary_flag_raw"] = clean(row.get("PRIMARY_FLAG"))
    rec["record_id_raw"] = clean(row.get("RECORD_ID"))
    rec["country_raw"] = country
    rec["state_raw"] = clean(row.get("STATE"))
    rec["url_raw"] = clean(row.get("URL"))
    # Not named anywhere in the bundle — they exist only in the response.
    # ACCOUNT_NUMBER is the source's OWN company key: every branch of a dealer
    # shares it (AWC INC's 12 Houston-territory branches are all 142130).
    rec["account_number_raw"] = clean(row.get("ACCOUNT_NUMBER"))
    rec["terr_group_raw"] = clean(row.get("TERR_GROUP"))
    rec["residential_flag_raw"] = clean(row.get("RESIDENTIAL_FLAG"))
    rec["zip_code_raw"] = clean(row.get("ZIP_CODE"))
    # CLOSEST and DISTANCE are properties of OUR query (the highlighted pin and
    # the range from our geocode), not of the dealer. Captured, but excluded
    # from the sorting verdict — the same treatment as Festo's @search.score.
    rec["closest_raw_query_scoped"] = clean(row.get("CLOSEST"))
    rec["distance_mi_query_scoped"] = num(row.get("DISTANCE"))
    # ── the two exclusion flags. Flagged, never deleted (§5l) ────────────────
    rec["manufacturer_own_record"] = bool(by_code or by_name)
    rec["manufacturer_flag_source"] = ("category_code+name" if by_code and by_name
                                       else "category_code" if by_code
                                       else "party_name" if by_name else None)
    rec["rep_agency"] = (category or "").upper() == "REPRESENTATIVE"
    rec["probe_query"] = probe
    for k, v in row.items():
        if k not in _HANDLED:
            rec[f"x_{k}_raw"] = ("|".join(str(x) for x in v)
                                 if isinstance(v, list) else v)
    return rec


def is_dealer(r):
    """A prospect row: US, not Banner itself, not a rep agency."""
    return bool(r["is_us"]) and not r["manufacturer_own_record"] and not r["rep_agency"]


# ── measurement ──────────────────────────────────────────────────────────────

EARTH_MI = 3958.7613


def haversine(lat1, lng1, lat2, lng2):
    p = math.pi / 180
    a = (math.sin((lat2 - lat1) * p / 2) ** 2
         + math.cos(lat1 * p) * math.cos(lat2 * p)
         * math.sin((lng2 - lng1) * p / 2) ** 2)
    return 2 * EARTH_MI * math.asin(min(1.0, math.sqrt(a)))


def load_pool():
    """lists/deduped-v7.csv, READ-ONLY. Owned by another stage; nothing writes."""
    domains, names, points, rows = set(), set(), [], 0
    with open(POOL, newline="", encoding="utf-8", errors="ignore") as fh:
        for row in csv.DictReader(fh):
            rows += 1
            d = apex(row.get("domain"))
            if d:
                domains.add(d)
            n = norm_company(row.get("company") or row.get("company_display"))
            if n:
                names.add(n)
            la, ln = num(row.get("lat")), num(row.get("lng"))
            if la is not None and ln is not None:
                points.append((la, ln))
    return {"rows": rows, "domains": domains, "names": names, "points": points}


def fill(records):
    n = len(records) or 1
    web = sum(1 for r in records if r["website"])
    dom = sum(1 for r in records if r["domain"])
    ph = sum(1 for r in records if r["phone_raw"])
    em = sum(1 for r in records if r["email"])
    return {
        "records": len(records),
        # website/domain first: the pipeline is domain-keyed end to end, and
        # 0% website is what made Walter (12,364 rows) and SKF's main feed
        # nearly unusable. This is the number that decides usability.
        "pct_website": round(100 * web / n, 1),
        "pct_domain": round(100 * dom / n, 1),
        "pct_phone": round(100 * ph / n, 1),
        "pct_email": round(100 * em / n, 1),
        "with_website": web, "with_domain": dom, "with_phone": ph, "with_email": em,
        "with_state": sum(1 for r in records if r["state"]),
        "with_zip": sum(1 for r in records if r["zip_raw"]),
        "with_latlng": sum(1 for r in records
                           if r["lat"] is not None and r["lng"] is not None),
    }


def code_sorts(records, fields):
    """§5i: a code is not trusted until it is MEASURED to discriminate.

    SKF's bundle published a DC001-DC028 decoding table over a field that was
    constant on every row. A decoding table is not a code. So: a field "sorts"
    only if it takes more than one LEVEL across these records, and it is
    reported as record-level vs company-level, because "every branch of a
    company carries the same value" is a weaker claim than a per-record code
    and the difference decides the second leg of the decision rule.

    Null counts as a level. `SUBTYPE` is absent on 55 of 60 rows and NATIONAL on
    5; "absent vs NATIONAL" is a real split of national catalog accounts from
    territory distributors, and scoring it as "1 distinct value, constant" would
    hide a signal that is actually there.
    """
    out = {}
    for field in fields:
        vals = [r.get(field) for r in records]
        distinct = {v for v in vals if v is not None}
        nulls = sum(1 for v in vals if v is None)
        levels = len(distinct) + (1 if nulls else 0)
        by_company = {}
        for r in records:
            by_company.setdefault(norm_company(r.get("company")), set()).add(
                r.get(field))
        varies = sum(1 for v in by_company.values() if len(v) > 1)
        dist = {}
        for v in vals:
            k = "(null)" if v is None else str(v)
            dist[k] = dist.get(k, 0) + 1
        out[field] = {
            "distinct_values": len(distinct),
            "levels_incl_null": levels,
            "null_records": nulls,
            "sorts": levels > 1,
            "sorts_only_by_presence": levels > 1 and len(distinct) <= 1,
            "varies_within_a_company": varies,
            "resolution": ("constant — does NOT sort" if levels <= 1
                           else "present/absent only" if len(distinct) <= 1
                           else "record-level" if varies
                           else "company-level only (identical on every branch)"),
            "distribution_verbatim": dict(sorted(dist.items(), key=lambda kv: -kv[1])),
        }
    print("\n── does each code actually sort? (measured, §5i) ──────────────")
    for field, v in out.items():
        print(f"{field}\n    {v['levels_incl_null']} levels "
              f"({v['distinct_values']} non-null) · {v['resolution']}"
              f" · {v['null_records']} null\n    {v['distribution_verbatim']}")
    return out


def chain_share(records):
    """National chains counted separately. Never suppressed from the raw file."""
    hits, matched = {}, {}
    for r in records:
        n = norm_company(r["company"])
        for label, rx in CHAINS.items():
            if re.search(rx, n):
                hits[label] = hits.get(label, 0) + 1
                matched.setdefault(label, set()).add(r["company"])
                break
    total = sum(hits.values())
    n = len(records) or 1
    out = {
        "chain_records": total,
        "pct_of_dealer_records": round(100 * total / n, 1),
        "by_chain": dict(sorted(hits.items(), key=lambda kv: -kv[1])),
        "matched_names_verbatim": {k: sorted(v) for k, v in matched.items()},
    }
    print(f"\nnational chains: {total} of {len(records)} dealer records "
          f"({out['pct_of_dealer_records']}%) — {out['by_chain']}")
    return out


def axes(records, pool):
    dom = {r["domain"] for r in records if r["domain"]}
    nam = {norm_company(r["company"]) for r in records if r["company"]}
    nam.discard("")
    return dom, nam, dom - pool["domains"], nam - pool["names"]


def measure(dealers, circles, national_actual):
    """Net-new on both axes, with the domain axis as the one that decides.

    Name joins overstated net-new by ~3x on every source measured 2026-08-03
    (SKF 3.6x, Continental 3.0x), so `norm_company` is reported for reference
    and `domain` is the test.

    **The projection area is stated, not measured off the response.** A first
    pass took each circle's radius from its furthest returned record; that gave
    1,269 mi for Houston and swallowed 84% of `deduped-v7`, because this is a
    territory lookup that returns a dealer's whole branch network (AWC INC's
    branches came back at 9 through 845 miles from a downtown Houston ZIP). So
    the probe area is a stated `PROBE_RADIUS_MI` circle per metro and only
    records the endpoint itself placed inside it (`DISTANCE <= R`) are projected
    from. The far branches stay in the file and in the observed net-new; they
    are just not evidence that their own regions were swept.

    The result is a **floor**: one query resolves one ZIP's territory, and a
    50-mile circle holds hundreds of ZIPs whose territories may differ.
    """
    pool = load_pool()
    dom, nam, new_dom, new_nam = axes(dealers, pool)

    in_area = [r for r in dealers
               if r["distance_mi_query_scoped"] is not None
               and r["distance_mi_query_scoped"] <= PROBE_RADIUS_MI]
    a_dom, a_nam, a_new_dom, a_new_nam = axes(in_area, pool)

    geocoded = len(pool["points"])
    inside = sum(1 for la, ln in pool["points"]
                 if any(haversine(la, ln, c["lat"], c["lng"]) <= PROBE_RADIUS_MI
                        for c in circles))
    share = inside / geocoded if geocoded else 0.0

    m = {
        "pool_file": os.path.relpath(POOL, ROOT),
        "pool_rows": pool["rows"],
        "pool_distinct_domains": len(pool["domains"]),
        "pool_distinct_norm_company": len(pool["names"]),
        "pool_geocoded_rows": geocoded,
        # ── everything the three queries returned ────────────────────────────
        "probe_dealer_records": len(dealers),
        "probe_distinct_domains": len(dom),
        "probe_distinct_norm_company": len(nam),
        "probe_distinct_account_numbers": len(
            {r["account_number_raw"] for r in dealers if r["account_number_raw"]}),
        "probe_records_without_domain": sum(1 for r in dealers if not r["domain"]),
        "net_new_by_domain": len(new_dom),
        "net_new_by_norm_company": len(new_nam),
        "overlap_pct_by_domain": (round(100 * (1 - len(new_dom) / len(dom)), 1)
                                  if dom else None),
        "overlap_pct_by_norm_company": (round(100 * (1 - len(new_nam) / len(nam)), 1)
                                        if nam else None),
        "name_axis_overstatement": (round(len(new_nam) / len(new_dom), 2)
                                    if new_dom else None),
        # ── only what the endpoint placed inside the stated circles ──────────
        "probe_radius_mi": PROBE_RADIUS_MI,
        "in_area_dealer_records": len(in_area),
        "in_area_distinct_domains": len(a_dom),
        "in_area_distinct_norm_company": len(a_nam),
        "in_area_net_new_by_domain": len(a_new_dom),
        "in_area_net_new_by_norm_company": len(a_new_nam),
        "records_outside_the_circles": len(dealers) - len(in_area),
        "max_returned_distance_mi": round(max(
            (r["distance_mi_query_scoped"] for r in dealers
             if r["distance_mi_query_scoped"] is not None), default=0.0), 1),
        "probe_circles": circles,
        "pool_rows_inside_probe_circles": inside,
        "probe_share_of_pool": round(share, 5),
        "net_new_domains_sample": sorted(new_dom)[:40],
    }
    if national_actual is not None:
        m["projection"] = "NOT NEEDED — one query returned the national set; " \
                          "the counts above are actuals, not a projection."
        m["projected_national_net_new_by_domain"] = len(new_dom)
        m["projected_national_net_new_by_norm_company"] = len(new_nam)
    elif share:
        m["projected_national_companies"] = round(len(a_nam) / share)
        m["projected_national_net_new_by_domain"] = round(len(a_new_dom) / share)
        m["projected_national_net_new_by_norm_company"] = round(len(a_new_nam) / share)
        m["projection_method"] = (
            f"scaler = {inside}/{geocoded} geocoded deduped-v7 rows inside the "
            f"three {PROBE_RADIUS_MI}-mile circles = {share:.5f}. National ~= "
            f"in-area / scaler: {len(a_new_dom)}/{share:.5f} = "
            f"{round(len(a_new_dom) / share)} net-new by domain. Uses "
            f"deduped-v7's own geographic distribution of industrial "
            f"distribution as the density model rather than land area or "
            f"population. It is a FLOOR: each query resolves ONE ZIP's "
            f"territory, so the {PROBE_RADIUS_MI}-mile circle around it is only "
            f"partially swept. It also assumes Banner's dealer density tracks "
            f"the pool's; if the pool over-weights these metros it understates "
            f"further.")
    else:
        m["projection"] = "IMPOSSIBLE — the pool has no geocoded rows."

    m["domain_axis_caveat"] = (
        f"{m['probe_records_without_domain']} of {len(dealers)} dealer records "
        f"carry no website. {len(dom)} distinct domains across "
        f"{len(nam)} distinct company names — the domains outnumber the names "
        f"because some dealers publish a different site per branch or brand, so "
        f"the domain axis can double-count one company. Net-new by domain "
        f"remains the test because the pipeline is domain-keyed."
        if len(dom) > len(nam) else
        f"{m['probe_records_without_domain']} of {len(dealers)} dealer records "
        f"carry no website, so the domain axis speaks for {len(dom)} of "
        f"{len(nam)} companies. Net-new by domain is a floor, not a total.")

    print("\n── overlap vs lists/deduped-v7.csv (read-only) ────────────────")
    for k, v in m.items():
        if k in ("net_new_domains_sample", "probe_circles"):
            continue
        print(f"{k:>42}: {v}")
    return m


def decide(dealer_fill, measured, codes_all, codes_dealers):
    """The gate, computed rather than argued.

    >=150 projected net-new companies on the DOMAIN axis, AND a tier code or a
    per-record line card. Banner was funded for the second leg specifically —
    it is the only measured E4 locator claiming explicit authorization tiers —
    so the code leg is the one that says whether the signed override bought
    anything at all.

    The tier leg is read off the DEALER pass, and the trap there is circularity:
    `CATEGORY_CODE` is the field the dealer filter is built from, so of course
    it is single-valued afterwards. Both passes are therefore reported. The
    question the gate actually asks is narrower than "does the code vary" — it
    is **does anything separate one distributor from another distributor**, and
    only the dealer pass can answer that.
    """
    dom = measured.get("projected_national_net_new_by_domain")
    nam = measured.get("projected_national_net_new_by_norm_company")
    cat_all = codes_all["category_code_raw"]
    cat, sub, prim = (codes_dealers["category_code_raw"],
                      codes_dealers["subtype_raw"],
                      codes_dealers["primary_flag_raw"])

    # "Does the field vary" is too loose a test and would pass on PRIMARY_FLAG,
    # which is an HQ/branch marker. The gate asks for a TIER: something that
    # grades one distributor against another. So a field only passes if it takes
    # more than one real value among dealers — present-vs-absent does not count,
    # because that is a membership flag, not a grade. Judged on the two fields
    # gate R-1 was signed for by name.
    def grades(c):
        return c["sorts"] and not c["sorts_only_by_presence"]

    tier_ok = grades(cat) or grades(sub)
    volume_ok = bool(dom and dom >= 150)
    verdict = {
        "threshold": ">=150 projected net-new companies (domain axis) AND "
                     "(a tier code OR a per-record line card)",
        "volume_leg_domain_axis": f"{dom} projected net-new by domain -> "
                                  f"{'PASS' if volume_ok else 'FAIL'}",
        "volume_leg_name_axis_for_reference":
            f"{nam} by norm_company — the axis that overstates ~3x, not the test",
        "category_code_across_all_us_rows":
            f"{cat_all['distribution_verbatim']} — {cat_all['resolution']}. This "
            f"is an EXCLUSION FILTER (manufacturer / rep agency / distributor) "
            f"and it is used as one. It is not a tier.",
        "tier_leg_category_code": f"among DISTRIBUTOR rows CATEGORY_CODE is "
                                  f"{cat['resolution']} "
                                  f"({cat['levels_incl_null']} levels) -> "
                                  f"{'PASS' if grades(cat) else 'FAIL'} "
                                  f"— this field defines the dealer filter, so a "
                                  f"single value here is expected; the real "
                                  f"reading is that nothing grades one "
                                  f"distributor against another.",
        "tier_leg_subtype": f"among dealers SUBTYPE is {sub['resolution']} "
                            f"({sub['levels_incl_null']} levels, "
                            f"{sub['null_records']} null) -> "
                            f"{'PASS' if grades(sub) else 'FAIL'}"
                            + (" — it varies, but only as present-vs-absent: it "
                               "marks the national catalog accounts appended to "
                               "every query. A membership flag, not a grade."
                               if sub["sorts_only_by_presence"] else ""),
        "codes_that_vary_but_are_not_tiers": {
            "PRIMARY_FLAG": f"{prim['resolution']} — HQ/branch marker. Useful "
                            f"for picking one row per company; not a grade.",
            "TERR_GROUP": "DIST / REP / ASM_SITES — the same exclusion axis as "
                          "CATEGORY_CODE, and strictly better at it (see "
                          "manufacturer_own_records). Not a grade either.",
            "RESIDENTIAL_FLAG": "address-quality marker (is this a home "
                                "address). Not a grade.",
        },
        "line_card_leg": "NONE — this payload carries no product, brand or "
                         "line-card field at all; the key union is the proof.",
        "code_leg": "PASS" if tier_ok else "FAIL",
        "website_fill_pct": dealer_fill["pct_website"],
        "sweep_earned": bool(volume_ok and tier_ok),
    }
    if not tier_ok:
        verdict["override_verdict"] = (
            "CRITICAL — the qualification signal is the ONLY thing gate R-1 was "
            "signed for. Measured: there is no tier among distributors. Every "
            "dealer row carries the single value CATEGORY_CODE=DISTRIBUTOR. "
            "SUBTYPE varies only as present-vs-absent and marks the five "
            "national catalog accounts (DigiKey, Mouser, Newark, RS, Motion "
            "Industries) that are appended to every query; DIGITAL, the other "
            "value in the bundle's vocabulary, never appeared. What the payload "
            "does carry is an EXCLUSION axis (distributor vs rep agency vs "
            "Banner's own sites), which is genuinely worth having under §5l but "
            "is not the authorization tier the override was signed for. Say so "
            "plainly; do not soften it.")
    print("\n── decision rule (computed) ───────────────────────────────────")
    for k, v in verdict.items():
        print(f"  {k}: {v}")
    print(f"  => national sweep "
          f"{'EARNED' if verdict['sweep_earned'] else 'NOT earned'}")
    return verdict


# ── probes ───────────────────────────────────────────────────────────────────

def run_query(f, key, label, query, out):
    """One query -> (rows, envelope facts). Blocked is recorded, never retried."""
    try:
        payload, cached, url = fetch(f, key, query, f"q-{label}.json")
    except Blocked as e:
        msg = public_url(str(e), key)
        print(f"  {label:>22}  BLOCKED: {msg}")
        out[label] = {"query_verbatim": query, "status": "blocked", "detail": msg}
        return None, out[label]
    rows, envelope, match, err = unwrap(payload)
    info = {
        "query_verbatim": query,
        "status": "ok",
        "url": url,
        "envelope_keys_verbatim": envelope,
        "records": len(rows),
        "banner_error_code": err,
        "match_data": match,
        "cached": cached,
        # A search endpoint that answers with a round number is probably
        # truncating. Flagged rather than assumed away.
        "suspicious_round_count": len(rows) in (10, 20, 25, 50, 100, 200, 250,
                                                500, 1000),
    }
    out[label] = info
    print(f"  {label:>22}  q={query!r:24} records={len(rows):<5} "
          f"err={err!r} ({'cached' if cached else 'live'})")
    return rows, info


def key_union(rows):
    union, types = {}, {}
    for r in rows:
        for k, v in r.items():
            union[k] = union.get(k, 0) + 1
            types.setdefault(k, set()).add(type(v).__name__)
    return {
        "keys_verbatim": sorted(union),
        "key_count": len(union),
        "present_on_n_records": dict(sorted(union.items())),
        "types": {k: sorted(v) for k, v in sorted(types.items())},
    }


# ── the national sweep ───────────────────────────────────────────────────────

def build_grid(n_points):
    """A maximin (farthest-point) walk over the ZIP centroids already on disk.

    Why a walk and not a lattice: the unit of exhaustion here is the TERRITORY,
    and territories follow where distributors are, not where the map is. A
    lattice spends queries on the Mojave; a maximin walk over real ZIP centroids
    does not. It also orders the grid coarse-to-fine, which is what makes the
    cumulative-new-companies curve below a genuine saturation curve.

    **Stated limitation, not papered over:** the centroid file is the ZIP set our
    own pipeline already knows (10,716 ZIPs, 872 of the ~900 ZIP3 prefixes,
    Alaska and Hawaii included), not the full ~41k USPS universe. Since a Banner
    territory spans states, that is ample; but it means a territory whose only
    ZIPs are ones our pool has never seen could be missed, and the saturation
    curve is evidence of exhaustion rather than proof of it.
    """
    with open(ZIP_CENTROIDS, encoding="utf-8") as fh:
        raw = json.load(fh)
    pool = [(z, la, ln) for z, (la, ln) in raw.items()
            if isinstance(la, (int, float)) and isinstance(ln, (int, float))]
    if not pool:
        raise SystemExit(f"no usable ZIP centroids in {ZIP_CENTROIDS}")

    slat, slng = GRID_SEED_LATLNG
    start = min(pool, key=lambda p: haversine(slat, slng, p[1], p[2]))
    picked = [start]
    # Distance from every candidate to the nearest already-picked point.
    dist = [haversine(start[1], start[2], p[1], p[2]) for p in pool]
    while len(picked) < min(n_points, len(pool)):
        i = max(range(len(pool)), key=lambda j: dist[j])
        if dist[i] <= 0:
            break
        picked.append(pool[i])
        for j, p in enumerate(pool):
            d = haversine(pool[i][1], pool[i][2], p[1], p[2])
            if d < dist[j]:
                dist[j] = d
    return picked


def build_density_fill(picked, n_points, min_sep_mi=40.0):
    """Second pass: fill the industrially dense regions the maximin grid thins.

    Maximin spreads by AREA, so it under-samples exactly where distributors are
    thickest — the first 320 points put 58 in ZIP-8 (the Mountain West) and 10
    in ZIP-0 (New England). Territories are smaller where dealers are denser, so
    an area-uniform grid is most likely to miss a territory in the Northeast and
    the industrial Midwest.

    The density model is `deduped-v7`'s own geocoded rows — the geography of
    industrial distribution as this program has already measured it, not
    population and not land area. Candidates are ranked by how many pool rows
    sit in their 0.5-degree neighbourhood and kept only if they are at least
    `min_sep_mi` from every point already queried, so the pass adds coverage
    rather than re-asking the same territory.
    """
    pool = load_pool()
    cells = {}
    for la, ln in pool["points"]:
        cells[(round(la * 2), round(ln * 2))] = cells.get(
            (round(la * 2), round(ln * 2)), 0) + 1

    with open(ZIP_CENTROIDS, encoding="utf-8") as fh:
        raw = json.load(fh)
    cands = []
    for z, (la, ln) in raw.items():
        if not isinstance(la, (int, float)) or not isinstance(ln, (int, float)):
            continue
        a, b = round(la * 2), round(ln * 2)
        density = sum(cells.get((a + i, b + j), 0)
                      for i in (-1, 0, 1) for j in (-1, 0, 1))
        if density:
            cands.append((density, z, la, ln))
    cands.sort(key=lambda c: -c[0])

    chosen, anchors = [], [(p[1], p[2]) for p in picked]
    for density, z, la, ln in cands:
        if len(chosen) >= n_points:
            break
        if any(haversine(la, ln, a, b) < min_sep_mi for a, b in anchors):
            continue
        chosen.append((z, la, ln))
        anchors.append((la, ln))
    return chosen


def company_key(row):
    """The source's OWN company key. `ACCOUNT_NUMBER` is shared by every branch.

    Falls back to the normalised name only when the account is absent, and the
    fallback is counted separately so the report never hides how often it fired.
    """
    acct = clean(row.get("ACCOUNT_NUMBER"))
    return ("acct", acct) if acct else ("name", norm_company(row.get("PARTY_NAME")))


def sweep(f, key, grid, probes, already, phase="grid"):
    """Query the grid in maximin order until the stopping rule fires.

    `already` is the set of company keys the metro probe already saw, so the
    saturation curve starts from the true state of knowledge rather than zero.
    The rule is the one declared at the top of this file and is not re-decided
    here: stop when SATURATION_WINDOW consecutive queries add no new company.
    """
    seen = set(already)
    curve, rows_by_query, dry = [], {}, 0
    print(f"\n── sweep phase '{phase}': {len(grid)} queries, ceiling {CEILING} "
          f"origin requests, stop after {SATURATION_WINDOW} dry in a row ──")
    for n, (zipcode, lat, lng) in enumerate(grid, 1):
        label = f"{phase}-{n:03d}-{zipcode}"
        try:
            rows, info = run_query(f, key, label, zipcode, probes)
        except SystemExit as e:
            print(f"  ladder stopped at grid query {n}: {e}")
            break
        # A 403/401 stops the source dead. `run_query` records it and returns
        # None; the sweep must not keep walking the grid past a wall. This is
        # the one rule the signed override explicitly does not touch.
        if info.get("status") == "blocked":
            print(f"  BLOCKED at grid query {n} — stopping the source. No "
                  f"retry, no UA change, no other host.")
            break
        rows = rows or []
        rows_by_query[label] = (rows, info, zipcode, lat, lng)
        new = {company_key(r) for r in rows} - seen
        seen |= new
        dry = 0 if new else dry + 1
        curve.append({"phase": phase, "n": n, "zip_query": zipcode,
                      "records": len(rows), "new_companies": len(new),
                      "cumulative_companies": len(seen), "dry_streak": dry})
        if n % 20 == 0 or new:
            print(f"  [{n:>3}/{len(grid)}] q={zipcode} rows={len(rows):<3} "
                  f"new={len(new):<2} cumulative={len(seen):<4} dry={dry}")
        if dry >= SATURATION_WINDOW:
            print(f"\n  STOPPING RULE FIRED: {SATURATION_WINDOW} consecutive "
                  f"queries added no new company. Queries run: {n} of "
                  f"{len(grid)}. Cumulative companies: {len(seen)}.")
            break
    else:
        print(f"\n  grid exhausted ({len(grid)} queries) without the stopping "
              f"rule firing — saturation is inferred from the curve, not proven.")
    return rows_by_query, curve


def write_csv(records):
    """Union-of-keys CSV beside the JSON, same convention as the acquire scripts."""
    cols, seen_cols = [], set()
    for r in records:
        for k in r:
            if k not in seen_cols:
                seen_cols.add(k)
                cols.append(k)
    path = os.path.join(RAW, f"{SOURCE}-{CAPTURED}.csv")
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(records)
    print(f"csv -> {path}  ({len(records)} records, {len(cols)} columns)")
    return path


def main():
    global CEILING
    do_sweep = "--sweep" in sys.argv
    # The sweep machinery below is built and reproducible, but it stays behind a
    # human. The 2026-08-04 probe computed the gate and it FAILED both legs: 55
    # projected net-new companies on the domain axis against a >=150 threshold,
    # and no tier among distributors (every dealer row is CATEGORY_CODE=
    # DISTRIBUTOR). Spending up to SWEEP_CEILING requests on a host that
    # publishes `Disallow: /`, on a source its own decision rule says has not
    # earned it, is not a call this script gets to make on its own — the whole
    # point of gate R-1's narrow scope is that volume stays deliberate. Same
    # refusal shape as skf.py.
    if do_sweep and "--i-have-read-the-probe" not in sys.argv:
        raise SystemExit(
            "Refusing --sweep.\n"
            "  The three-metro probe scored the gate and it FAILED:\n"
            "    volume  : 55 projected net-new by domain (threshold >=150)\n"
            "    tier code: none — all 51 dealer rows are CATEGORY_CODE="
            "DISTRIBUTOR\n"
            "    line card: none — the payload has no product/brand field\n"
            f"  A sweep would spend up to {SWEEP_CEILING} origin requests "
            f"against a host\n  that publishes `Disallow: /`. Read "
            f"data/raw/{SOURCE}-{CAPTURED}.json first, then re-run with\n"
            "  --sweep --i-have-read-the-probe if you still want it.")
    CEILING = SWEEP_CEILING if do_sweep else MAX_ORIGIN_REQUESTS

    key = site_identifier()
    sys.stdout = _Scrub(sys.stdout, key)
    sys.stderr = _Scrub(sys.stderr, key)

    with open(API_ROBOTS, encoding="utf-8", errors="ignore") as fh:
        robots_verbatim = fh.read().strip()
    print("── gate R-1 (signed by Artur 2026-08-04, robots.txt on THIS HOST "
          "ONLY) ──")
    print(f"  {API_ROOT}/robots.txt, cached, verbatim:")
    for line in robots_verbatim.splitlines():
        print(f"    {line}")
    print("  Proceeding under the signed override. Everything else still binds:")
    print(f"  >=3s/host · one worker · disk cache · honest UA, never rotated · "
          f"403/401 stops the source · ceiling {CEILING} requests.")
    print(f"  mode: {'NATIONAL SWEEP' if do_sweep else 'PROBE ONLY'} "
          f"(batch limit stated before the first request: {CEILING} origin "
          f"requests, {GRID_POINTS}-point grid, stop after {SATURATION_WINDOW} "
          f"dry queries)")

    f = Fetcher(SOURCE, min_bytes=2)
    probes, records, shape = {}, [], None

    # ── request 1: does ONE query return the national set? ───────────────────
    # Asked first and once. If an empty `q` is a wildcard, everything after this
    # is unnecessary and the answer is a finding either way.
    print("\n── national test: is an empty q a wildcard? (1 request) ────────")
    national_rows, national_info = run_query(f, key, "national-empty-q", "", probes)
    national_actual = None
    if national_rows:
        shape = key_union(national_rows)
        if len(national_rows) > 2000:
            national_actual = len(national_rows)
            print(f"  ⚠ FINDING: empty q returned {len(national_rows)} records — "
                  f"this looks like the national set from ONE request.")

    # ── requests 2-3: Houston in both query forms ────────────────────────────
    # The endpoint geocodes free text, so ZIP and city are different questions,
    # not synonyms. Measuring the difference ONCE (on one metro) decides the
    # form for the other two instead of paying for both forms three times.
    print("\n── metro probe: query form, measured on Houston (2 requests) ───")
    name, zip_q, city_q, lat, lng = METROS[0]
    zip_rows, zip_info = run_query(f, key, f"{name}-zip", zip_q, probes)
    city_rows, city_info = run_query(f, key, f"{name}-city", city_q, probes)

    def score(rows):
        return -1 if rows is None else len(rows)

    form = "zip" if score(zip_rows) >= score(city_rows) else "city"
    print(f"  form chosen for the remaining metros: {form} "
          f"(zip={score(zip_rows)} vs city={score(city_rows)} records)")

    # This request has to pay for itself: whether the two forms return the SAME
    # record set decides whether a future sweep can key on ZIPs alone.
    def ids(rows):
        return {r.get("RECORD_ID") for r in rows or []}

    form_test = {
        "zip_query": zip_q, "city_query": city_q,
        "zip_records": score(zip_rows), "city_records": score(city_rows),
        "identical_record_sets": ids(zip_rows) == ids(city_rows),
        "only_in_zip": len(ids(zip_rows) - ids(city_rows)),
        "only_in_city": len(ids(city_rows) - ids(zip_rows)),
        "zip_matched": (zip_info or {}).get("match_data"),
        "city_matched": (city_info or {}).get("match_data"),
        "form_used_for_other_metros": form,
    }
    print(f"  ZIP vs city return the same RECORD_ID set: "
          f"{form_test['identical_record_sets']} "
          f"(only-in-zip {form_test['only_in_zip']}, "
          f"only-in-city {form_test['only_in_city']})")

    metro_rows = {name: (zip_rows if form == "zip" else city_rows,
                         zip_info if form == "zip" else city_info,
                         zip_q if form == "zip" else city_q, lat, lng)}
    if shape is None:
        for rows in (zip_rows, city_rows):
            if rows:
                shape = key_union(rows)
                break

    # ── requests 4-5: the other two metros in the winning form ───────────────
    print("\n── metro probe: Chicago + Cleveland (2 requests) ───────────────")
    for name, zip_q, city_q, lat, lng in METROS[1:]:
        q = zip_q if form == "zip" else city_q
        rows, info = run_query(f, key, f"{name}-{form}", q, probes)
        # A single deliberate fallback, not a retry: if the chosen form returns
        # nothing for a metro, the OTHER form is a different question and is
        # worth one request. The ladder never re-sends the same query.
        if not rows:
            alt = city_q if form == "zip" else zip_q
            other = "city" if form == "zip" else "zip"
            print(f"  {name}: {form} form empty — trying the {other} form once")
            rows, info = run_query(f, key, f"{name}-{other}", alt, probes)
            q = alt
        metro_rows[name] = (rows, info, q, lat, lng)

    # ── the national sweep, only when explicitly asked for ───────────────────
    # The probe above answers "what shape is this and does the code sort in
    # three territories". It cannot answer "does the code sort nationally",
    # because three territories cannot exercise a four-value vocabulary. That
    # is the question gate R-1 was signed to buy, so the sweep exists to settle
    # it — not to chase volume, which was never Banner's argument.
    sweep_rows, curve, grid = {}, [], []
    if do_sweep:
        already = set()
        for rows, *_ in metro_rows.values():
            already |= {company_key(r) for r in rows or []}
        for r in national_rows or []:
            already.add(company_key(r))
        base = build_grid(GRID_POINTS)
        fill_pts = build_density_fill(base, DENSITY_FILL_POINTS,
                                      DENSITY_FILL_MIN_SEP_MI)
        grid = base + fill_pts
        print(f"  grid built: {len(base)} maximin points from {base[0][0]} "
              f"(nearest the CONUS centroid) + {len(fill_pts)} density-fill "
              f"points >= {DENSITY_FILL_MIN_SEP_MI:.0f} mi apart = {len(grid)} "
              f"queries planned, ceiling {CEILING}")
        # Two phases with SEPARATE stopping rules, deliberately. A single rule
        # over the concatenated list would let saturation in the sparse West
        # cancel the pass that exists to cover the dense Northeast — which is
        # the region most likely to hold a territory the coarse grid missed.
        sweep_rows, curve = sweep(f, key, base, probes, already, phase="grid")
        already_after = set(already)
        for rows, *_ in sweep_rows.values():
            already_after |= {company_key(r) for r in rows or []}
        fill_rows, fill_curve = sweep(f, key, fill_pts, probes, already_after,
                                      phase="fill")
        sweep_rows.update(fill_rows)
        curve = curve + fill_curve

    if shape is None:
        print("\nNo response carried any records. Nothing to normalise.")
        write_raw(SOURCE, {
            "source_name": "Banner Engineering Where to Buy (api2d /dist)",
            "source_url": public_url(dist_url(key, "<query>"), key),
            "locator_page": PAGE,
            "robots_check": {"url": f"{API_ROOT}/robots.txt",
                             "verbatim": robots_verbatim,
                             "override": "gate R-1, signed Artur 2026-08-04, "
                                         "robots.txt on this host only"},
            "probes": probes,
            "finding": "every query returned zero records or was refused",
            "origin_requests": f.origin_requests,
        }, [])
        return

    print(f"\n── SHAPE PROBE: full key union of the first response ({shape['key_count']}"
          f" keys) ──")
    for k in shape["keys_verbatim"]:
        print(f"  {k}  <{'/'.join(shape['types'][k])}>  "
              f"present on {shape['present_on_n_records'][k]} records")

    # ── normalise + cross-metro dedupe ───────────────────────────────────────
    seen = {}
    if national_rows:
        for row in national_rows:
            records.append(normalize(row, national_info["url"], "national-empty-q"))
    circles = []
    for name, (rows, info, q, lat, lng) in metro_rows.items():
        for row in rows or []:
            records.append(normalize(row, info["url"], f"{name}:{q}"))
        # Centre = the geocode the endpoint says it resolved to. The RADIUS is
        # the stated PROBE_RADIUS_MI, not the distance to the furthest returned
        # record: this is a territory lookup and the furthest record was 845 mi
        # from downtown Houston. Both numbers are recorded so the choice is
        # auditable — `furthest_returned_mi` is the finding, not the area.
        md = (info or {}).get("match_data") or {}
        clat = num(md.get("matchedLat")) if md else None
        clng = num(md.get("matchedLong")) if md else None
        clat = lat if clat is None else clat
        clng = lng if clng is None else clng
        dists = [num(r.get("DISTANCE")) for r in rows or []]
        dists = [d for d in dists if d is not None]
        in_area = [d for d in dists if d <= PROBE_RADIUS_MI]
        circles.append({
            "metro": name, "query_verbatim": q, "lat": clat, "lng": clng,
            "radius_mi": PROBE_RADIUS_MI,
            "records_returned": len(rows or []),
            "records_with_distance": len(dists),
            "records_inside_the_circle": len(in_area),
            "furthest_returned_mi": round(max(dists), 1) if dists else None,
            "nearest_returned_mi": round(min(dists), 1) if dists else None,
            "records_without_distance": len(rows or []) - len(dists),
            "centre_source": "MatchData" if md else "metro centroid",
        })

    # The sweep's rows join the same record stream. They deliberately do NOT
    # become probe circles: the three metro circles are the stated projection
    # area, and once a national sweep has run there is nothing left to project.
    for label, (rows, info, q, lat, lng) in sweep_rows.items():
        for row in rows or []:
            records.append(normalize(row, info["url"], f"{label}:{q}"))
        print(f"  {name:>14}  returned={len(rows or []):<4} "
              f"inside {PROBE_RADIUS_MI:.0f}mi={len(in_area):<3} "
              f"furthest={round(max(dists), 1) if dists else None}mi "
              f"no-DISTANCE={len(rows or []) - len(dists)}")

    deduped = []
    for r in records:
        k = r["record_id_raw"] or (norm_company(r["company"]), r["address_1"],
                                   r["zip_raw"])
        if k in seen:
            continue
        seen[k] = True
        deduped.append(r)
    print(f"\nrecords: {len(records)} raw -> {len(deduped)} after cross-query "
          f"dedupe (RECORD_ID, else name+address+zip)")

    # ── counts. Dealer counts EXCLUDE Banner's own rows and rep agencies ─────
    code_fields = ("category_code_raw", "subtype_raw", "terr_group_raw",
                   "primary_flag_raw", "residential_flag_raw", "country_raw",
                   "closest_raw_query_scoped")
    stats = report(SOURCE, deduped, code_fields=code_fields)

    us = [r for r in deduped if r["is_us"]]
    own = [r for r in deduped if r["manufacturer_own_record"]]
    reps = [r for r in deduped if r["rep_agency"] and not r["manufacturer_own_record"]]
    dealers = [r for r in deduped if is_dealer(r)]
    dealer_names = {norm_company(r["company"]) for r in dealers}
    dealer_names.discard("")

    stats["records_before_dedupe"] = len(records)
    # Per-metro counts come from the RAW responses, not the deduped set: the
    # cross-query dedupe assigns a shared row to whichever metro saw it first,
    # which would make the later metros look emptier than they are.
    stats["per_metro_records_returned"] = {
        c["metro"]: c["records_returned"] for c in circles}
    stats["per_metro_records_inside_50mi"] = {
        c["metro"]: c["records_inside_the_circle"] for c in circles}
    stats["query_form_test"] = form_test
    stats["us_records"] = len(us)
    stats["manufacturer_own_rows"] = len(own)
    stats["manufacturer_own_names_verbatim"] = sorted(
        {r["company"] for r in own if r["company"]})
    stats["rep_agency_rows"] = len(reps)
    stats["dealer_records_excl_manufacturer_and_reps"] = len(dealers)
    stats["dealer_distinct_companies"] = len(dealer_names)
    stats["fill_all_us_records"] = fill(us)
    stats["fill_dealers_only"] = fill(dealers)
    stats["distinct_country_values_verbatim"] = sorted(
        {r["country_raw"] for r in deduped if r["country_raw"]})
    stats["records_with_null_country"] = sum(1 for r in deduped
                                             if r["country_raw"] is None)

    print(f"\n── dealer counts (Banner's own rows and rep agencies EXCLUDED) ─")
    print(f"US records                : {len(us)}")
    print(f"  Banner's own rows       : {len(own)}  {stats['manufacturer_own_names_verbatim']}")
    print(f"  rep-agency rows         : {len(reps)}")
    print(f"dealer records            : {len(dealers)}")
    print(f"dealer distinct companies : {len(dealer_names)}")
    df = stats["fill_dealers_only"]
    print(f"website fill              : {df['with_website']}  {df['pct_website']}%"
          f"   <- decides usability")
    print(f"domain fill               : {df['with_domain']}  {df['pct_domain']}%")
    print(f"phone fill                : {df['with_phone']}  {df['pct_phone']}%")
    print(f"email fill                : {df['with_email']}  {df['pct_email']}%")

    stats["dealer_distinct_account_numbers"] = len(
        {r["account_number_raw"] for r in dealers if r["account_number_raw"]})
    print(f"dealer distinct ACCOUNT_NUMBER (the source's own company key): "
          f"{stats['dealer_distinct_account_numbers']}")

    # Judged twice on purpose. The all-rows pass shows CATEGORY_CODE separating
    # manufacturer / rep / distributor — an exclusion filter, and it is used as
    # one. The dealer pass answers the question the gate actually asks: does
    # anything grade one distributor against another? That pass is the verdict.
    stats["code_sorts_all_us_rows"] = code_sorts(us, code_fields)
    print("\n(the same codes, restricted to DEALER rows — this is the verdict)")
    stats["code_sorts_dealers_only"] = code_sorts(
        dealers, ("category_code_raw", "subtype_raw", "terr_group_raw",
                  "primary_flag_raw", "residential_flag_raw"))
    seen_cat = {r["category_code_raw"] for r in deduped if r["category_code_raw"]}
    seen_sub = {r["subtype_raw"] for r in deduped if r["subtype_raw"]}
    stats["bundle_vocabulary_for_comparison"] = {
        "CATEGORY_CODE_in_bundle": list(BUNDLE_CATEGORY_CODES),
        "CATEGORY_CODE_observed": sorted(seen_cat),
        "CATEGORY_CODE_never_observed": sorted(set(BUNDLE_CATEGORY_CODES) - seen_cat),
        "SUBTYPE_in_bundle": list(BUNDLE_SUBTYPES),
        "SUBTYPE_observed": sorted(seen_sub),
        "SUBTYPE_never_observed": sorted(set(BUNDLE_SUBTYPES) - seen_sub),
        "note": "what the bundle's switch can RENDER vs what the payload "
                "actually exercised. A vocabulary the payload does not exercise "
                "is a decoding table, not a code (SKF, 2026-08-03).",
    }
    print(f"\nbundle vocabulary vs payload: CATEGORY_CODE never observed "
          f"{stats['bundle_vocabulary_for_comparison']['CATEGORY_CODE_never_observed']}"
          f" · SUBTYPE never observed "
          f"{stats['bundle_vocabulary_for_comparison']['SUBTYPE_never_observed']}")
    stats["chains"] = chain_share(dealers)
    # A completed national sweep replaces the projection with actuals. The flag
    # is the sweep, not the empty-q wildcard the probe tested for — `measure()`
    # takes either, and the wording is corrected below so nobody reads "one
    # query returned the national set" off a 300-query grid.
    stats["measure"] = measure(dealers, circles,
                               len(deduped) if do_sweep else national_actual)
    if do_sweep:
        stats["measure"]["projection"] = (
            f"NOT NEEDED — a national grid sweep ran ({len(curve)} of "
            f"{len(grid)} planned queries). The counts above are ACTUALS over "
            f"the swept grid, not a projection. They remain a floor in one "
            f"specific way: a territory whose ZIPs are all absent from the "
            f"grid would not be reached, which is what the saturation curve is "
            f"evidence about.")
    stats["decision_rule"] = decide(stats["fill_dealers_only"], stats["measure"],
                                    stats["code_sorts_all_us_rows"],
                                    stats["code_sorts_dealers_only"])

    if do_sweep:
        dry_tail = 0
        for point in reversed(curve):
            if point["new_companies"]:
                break
            dry_tail += 1
        stats["sweep"] = {
            "grid_points_planned": len(grid),
            "grid_queries_run": len(curve),
            "grid_first_query": grid[0][0] if grid else None,
            "stopping_rule": f"stop after {SATURATION_WINDOW} consecutive "
                             f"queries adding zero new companies — declared in "
                             f"code before the first request",
            "stopping_rule_fired": dry_tail >= SATURATION_WINDOW,
            "trailing_dry_queries": dry_tail,
            "phases": {
                ph: {
                    "queries_planned": len(base) if ph == "grid" else len(fill_pts),
                    "queries_run": sum(1 for p in curve if p["phase"] == ph),
                    "new_companies": sum(p["new_companies"] for p in curve
                                         if p["phase"] == ph),
                    "what_it_is": ("area-uniform maximin walk — coarse to fine"
                                   if ph == "grid" else
                                   "density-weighted fill over deduped-v7's own "
                                   "geocoded rows, >=40 mi from any earlier point"),
                }
                for ph in ("grid", "fill")
            },
            "queries_that_added_a_company": sum(1 for p in curve
                                                if p["new_companies"]),
            "queries_returning_zero_records": sum(1 for p in curve
                                                  if not p["records"]),
            "company_key": "ACCOUNT_NUMBER (the source's own key, shared by "
                           "every branch); normalised name only where absent",
            "cumulative_companies_final": curve[-1]["cumulative_companies"]
                                          if curve else 0,
            "saturation_curve": curve,
            "grid_note": "maximin farthest-point walk over "
                         "data/s3/_zip-centroids-2026-08-03.json (10,716 ZIPs, "
                         "872 of ~900 ZIP3 prefixes, AK/HI included). That file "
                         "is the ZIP set our own pipeline knows, not the full "
                         "USPS universe — stated because it bounds the "
                         "exhaustion claim.",
        }
        print(f"\n── sweep summary ──────────────────────────────────────────")
        print(f"grid queries run          : {len(curve)} of {len(grid)} planned")
        print(f"queries adding a company  : "
              f"{stats['sweep']['queries_that_added_a_company']}")
        print(f"trailing dry queries      : {dry_tail} "
              f"(rule fires at {SATURATION_WINDOW})")
        print(f"cumulative companies      : "
              f"{stats['sweep']['cumulative_companies_final']}")

    payload = {
        "source_name": "Banner Engineering Where to Buy (api2d /dist search)",
        "source_url": public_url(dist_url(key, "<query>"), key),
        "locator_page": PAGE,
        "scope": (
            f"NATIONAL GRID SWEEP. The three-metro probe (5 requests, run "
            f"first) plus a {GRID_POINTS}-point maximin ZIP grid swept to the "
            f"declared stopping rule. One response per query — the endpoint "
            f"does not paginate. No state iteration is possible: `q` is free "
            f"text, and a state name resolves to a point, not a region."
            if do_sweep else
            "THREE-METRO PROBE ONLY. No national sweep, no state iteration, "
            "no pagination beyond one response per query. The sweep is "
            "gated on a human reading these numbers."),
        "method":
            "The locator is an AEM page running a Backbone app. Its cached "
            "bundle (data/raw/_cache/e4bundle-banner/bundle-0.js, read from "
            "disk) composes one route in Collection.url(): GET {apiRoot}/dist"
            "?apikey=&sitename=us/en&q=&return=json, parsed as `e.ALL`. `q` is "
            "free text handed to a geocoder, so results are query-scoped. One "
            "empty-q national test, then Houston in both ZIP and city form to "
            "measure which the geocoder prefers, then Chicago and Cleveland in "
            "the winning form. Every response cached; a re-run makes zero "
            "origin requests."
            + (" Then the sweep: because the response is a TERRITORY lookup "
               "returning a company's whole branch network, the unit of "
               "exhaustion is the territory, so the grid is a maximin "
               "farthest-point walk over known ZIP centroids — coarse-to-fine, "
               "which makes the cumulative-new-companies curve a real "
               "saturation curve. Companies are counted on the source's own "
               "ACCOUNT_NUMBER, not on a name join." if do_sweep else ""),
        "robots_check": {
            "url": f"{API_ROOT}/robots.txt",
            "verbatim": robots_verbatim,
            "verdict": "the whole host is Disallow: / for User-agent: *",
            "override": "GATE R-1 — SIGNED BY ARTUR 2026-08-04 "
                        "(00-sourcing-strategy.md §9). Scope: robots.txt on "
                        "api2d.bannerengineering.com ONLY. It does not touch "
                        "the credential rule, the 403/401 stop rule, pacing, "
                        "caching or UA honesty, all of which were applied. "
                        "Volume was held deliberately low because this is an "
                        "override of a stated preference: the ladder is capped "
                        f"at {CEILING} origin requests in code, and the run stops\n                        the moment it is reached.",
            "counter_argument_on_the_record": "Sale Solution sells "
                "AI-search-readiness and SEO, so being seen to ignore a "
                "Disallow is an asymmetric reputational risk for this firm "
                "specifically. Artur owns that risk and signed anyway.",
        },
        "credential_note": "apikey is a 13-character site identifier published "
                           "in the anonymous page's own window.bnrApiConfig and "
                           "reused in <img> part-image URLs served to every "
                           "visitor — a public site id, not a credential. Read "
                           "from the cached page at run time; never written to "
                           "this file, to this JSON, or to stdout (both streams "
                           "are scrubbed and the payload is asserted clean).",
        "terms_check": "NOT VERIFIED. The cached terms.html is Banner's Terms "
                       "and Conditions HUB page — nav chrome plus 'Learn More' "
                       "links to three separate documents (Terms of Use, "
                       "Conditions of Sale, Conditions of Purchase). None of "
                       "those bodies was captured, so this run cannot say "
                       "whether a site-use or automated-access clause exists. "
                       "Recorded as an open question rather than spending "
                       "budget or claiming a clearance that was not obtained.",
        "shape_probe_key_union": shape,
        "probes": probes,
        "probe_circles_measured": circles,
        "codes_captured_verbatim": list(code_fields) + [
            "account_number_raw", "record_id_raw", "state_raw", "zip_code_raw",
            "url_raw", "distance_mi_query_scoped",
            "x_*_raw (every other payload key)"],
        "codes_not_named_anywhere_in_the_bundle": [
            "ACCOUNT_NUMBER", "TERR_GROUP", "RESIDENTIAL_FLAG", "ZIP_CODE",
            "DISTANCE"],
        "vertical_code": "NONE. The key union carries no product, brand or "
                         "line-card field — CATEGORY_CODE is an authorization "
                         "class and SUBTYPE a channel flag. Nothing in this "
                         "payload says what a dealer sells beyond Banner.",
        "endpoint_model": "TERRITORY LOOKUP, not a radius search — measured, "
                          "not assumed. DISTANCE is miles and reproduces a "
                          "haversine from MatchData to the record's own lat/lng "
                          "to 3dp. `q` resolves to the distributor(s) whose "
                          "territory covers the point, and the response is "
                          "their ENTIRE branch network at any distance (AWC "
                          "INC's branches came back 9 to 845 miles from a "
                          "downtown Houston ZIP), plus a fixed tail of national "
                          "catalog accounts carrying SUBTYPE=NATIONAL and no "
                          "DISTANCE. So: per-metro record counts are NOT metro "
                          "dealer counts, and the projection uses a stated "
                          f"{PROBE_RADIUS_MI:.0f}-mile circle with only "
                          "DISTANCE<=R records inside it.",
        "manufacturer_own_records":
            "⚠ CATEGORY_CODE == 'BANNER' NEVER APPEARED. Both Banner "
            "Engineering rows (Elmhurst IL, Broadview Heights OH) came back as "
            "CATEGORY_CODE = REPRESENTATIVE, and every one was caught by the "
            "PARTY_NAME signal, not the code — filtering on the code alone "
            "would have seated the manufacturer. The field that does separate "
            "them is TERR_GROUP (ASM_SITES = Banner's own sites, REP = genuine "
            "rep agencies), which the bundle never names. Rep agencies are not "
            "distributors either. All flagged, all KEPT in this file, all "
            "excluded from every dealer count (§5l).",
        "national_catalog_accounts":
            "Five rows carry SUBTYPE=NATIONAL and no DISTANCE, and they are "
            "appended to EVERY query regardless of geography: DigiKey, Mouser "
            "Electronics, Newark Electronics, RS (us.rs-online.com / "
            "alliedelec.com) and Motion Industries. They are counted as dealers "
            "here because the source calls them DISTRIBUTOR, but they are "
            "national catalog houses, not metro dealers, and three of them are "
            "far above the $75M ICP ceiling. Anything downstream should drop "
            "them on SUBTYPE.",
        "origin_requests": f.origin_requests,
        "origin_requests_cold": len(os.listdir(f.cache)),
        "request_ceiling": CEILING,
        "request_ceiling_probe_mode": MAX_ORIGIN_REQUESTS,
        "request_ceiling_sweep_mode": SWEEP_CEILING,
        "stats": stats,
    }

    # Hard guarantee, not a habit: the site identifier is not in the output.
    blob = json.dumps(payload) + json.dumps(deduped)
    if key in blob:
        raise SystemExit("REFUSING to write: the site identifier leaked into the "
                         "payload. Fix the redaction before writing anything.")
    write_raw(SOURCE, payload, deduped)
    write_csv(deduped)
    print(f"origin requests this run: {f.origin_requests} "
          f"(ceiling {CEILING})")


if __name__ == "__main__":
    main()
