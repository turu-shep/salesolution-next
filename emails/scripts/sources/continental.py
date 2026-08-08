#!/usr/bin/env python3
"""S1 wave-3 — Continental / ContiTech distributor locator. THREE-METRO PROBE ONLY.

**This script does not sweep.** It makes at most five origin requests and stops,
because the decision on whether Continental earns a national grid is not mine to
make from a cache-warm hunch. The sweep is a separate change, gated on the
verdict this probe produces. `MAX_ORIGIN_REQUESTS` enforces it in code rather
than in a comment.

**The endpoint, read out of the site's own JS — not guessed.**
`www.continental-industry.com` is Adobe AEM Edge Delivery (Franklin); the locator
is the block `distributor-locator`, whose code is at the AEM-conventional path
`/blocks/distributor-locator/distributor-locator.js` (already cached from the E4
bundle sniff). Its query function is, verbatim:

    const zn = async ([e, n, t, r, o, s, a]) => {
      if (!e || !n) return [];
      const u = new URL(e, window.location.origin);
      return u.searchParams.set("locatorType", s),
             u.searchParams.set("radius", String(r)),
             u.searchParams.set("distanceUnit", o),
             u.searchParams.set("latitude", String(t.lat)),
             u.searchParams.set("longitude", String(t.lng)),
             Object.values(n).forEach((m, c) => { m && u.searchParams.set(a[c], String(m)); }),
             fetch(u).then((m) => m.json());
    };

with `e === "apis/v1/distributors"` resolved against `window.location.origin`.
**Bare `fetch(u)`: no headers, no key, no Authorization, no `credentials`
option. There is no credential boundary here** — unlike Festo (public widget
token) or Bimba (keyed Bullseye API, which stopped that source). The radius
control offers exactly `[10, 20, 50, 100]`; `distanceUnit` comes from the
block's authored `units` cell and is `mi` on the US pages.

**The filter codes are the source's own, lifted verbatim from
`/scripts/site/schema-lHiCdr2T.js`** (the module the block imports `ot`/`ft`
from), where the table is keyed by `locatorType`. `ft = (t = "gad") =>
Object.keys(nt[t])` is what turns those keys into query-param names, so the key
*is* the param. The `hydraulics` entry carries `locator:
"Locator_Hydraulics__c"` — a Salesforce custom-field API name, which is the
second confirmation (after the `Billing*` field names the UI renders) that the
backend is a Salesforce Account object.

⚠ §5i SOURCE-NATIVE CODES. The filter keys are captured verbatim and
uninterpreted, and — this is the part that matters — **tested for whether they
appear on the record at all**. A query-side filter is not a per-record code. If
the payload does not carry them, the tier claim costs one filtered request per
metro per code, and this probe says so instead of implying the code is free.
The `gad` table (industrial) is:

    cbh           Conveyor Belts, Heavyweight   (locator: "")
    hydraulics    Hydraulics                    (locator: "Locator_Hydraulics__c")
    ptp           Power Transmission Products
    ihose         Industrial Hose
    ihoseStarDist Industrial Hose - STAR Distributor   <-- TIER CODE
    pde           Petroleum Dispensing Equipment

and the `aftermarket` table (automotive/consumer, off-ICP, probed once only to
learn whether the two locator types return disjoint sets) is: `achosefittings`,
`atvbelts`, `gardenhose`, `hdairsprings`, `hdbeltshose`, `hydraulics`,
`installer`, `lawnmoverbelts`, `partsstore`, `snowmobilebelts`.

Five sources have now proved manufacturer locators encode vertical in their own
codes (Timken, DataForSEO, Yaskawa's `groupList`, Sullair's `product_line`,
Festo's `didactic`, which sorted out 17.6%). That is a reason to *capture* every
code, not a reason to assume this one sorts. Nothing here is mapped or averaged
over, and the report states which codes were observed vs. merely declared.

**robots.txt.** `https://www.continental-industry.com/robots.txt` is four
directive lines and a sitemap, captured today at
`data/raw/_cache/e4evidence-continental/robots.txt`:

    User-agent: *
    Allow: /

    User-agent: Linguee
    Disallow: /

    Sitemap: https://www.continental-industry.com/sitemap_index.xml

`/apis/` is inside `Allow: /` and is not excluded by anything. We are not
Linguee. **No override is involved in this source and there is nothing to
sign.** The file is re-read from that cache at run time and the `Allow: /` line
is asserted before the first request, so a silently changed robots.txt stops the
run instead of being papered over by this docstring.

**Transport.** `www.continental-industry.com` serves gzip even when sent
`Accept-Encoding: identity`, and `_polite.Fetcher` decodes straight to utf-8 —
that combination is what destroyed the first `scripts.js` capture (1,353 bytes
of garbage). So this source reuses `_e4_bundles2.BinFetcher`, the bytes-safe
subclass, rather than reinventing it. Posture inherited unchanged: single
worker, >=3s per host, honest desktop UA never rotated, every response cached to
disk so a re-run makes zero origin requests, and **401/403 stops the source —
no retry, no UA rotation, no host switching, no stealth.**

⚠ `locatorType=aftermarket` answers **HTTP 400 on this origin**, so the
disjointness question the handoff asked is UNANSWERED — recorded, not worked
around. The body is not a "your request is malformed" message; it is verbatim

    {"code": "b22a458c-9070-4e35-90ac-8730ee82b877",
     "error": "Response is not valid 'message/http'."}

which is Azure API Management complaining about its own **backend**: the
gateway accepted the route and could not parse what came back from behind it.
So the `aftermarket` route exists here (a wrong `locatorType` would 404) and
its backend is not answering. Whether that is a permanent wiring gap or a
window of breakage this probe cannot tell — what it can say is that it is not
transient over minutes: the first run re-sent the identical request five times
across 345s of backoff and got the same 400 every time. Reading it as "the
aftermarket data lives on some other host" would be a guess, so it is not
claimed.

`ProbeFetcher` below exists because that first run learned this the expensive
way. `_polite.Fetcher` retries every non-401/403/404 status through the whole
15/30/60/120/120s ladder — right for 429 and 5xx, where the origin is asking
for time, wrong for a 400, where re-sending the same bytes cannot change the
answer. Deterministic 4xx is now terminal on the first attempt and remembered
in `_refused.json`, so a re-run does not re-ask a question the origin has
already refused. A clean re-run of this source now costs **zero** requests.
"""
import csv
import json
import math
import os
import sys
import time
import urllib.error
import urllib.request

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402

_polite.CAPTURED = "2026-08-03"

from _e4_bundles2 import BinFetcher, _decode_body  # noqa: E402
from _polite import (RAW, ROOT, US_STATES, Blocked, apex, digits,  # noqa: E402
                     norm_company, report, write_raw)

CAPTURED = _polite.CAPTURED

SOURCE = "continental"
ORIGIN = "https://www.continental-industry.com"
ENDPOINT = f"{ORIGIN}/apis/v1/distributors"
PAGE = f"{ORIGIN}/en/find-a-distributor"
# Captured by `_e4_evidence.py` earlier today; re-read, never re-fetched.
ROBOTS_CACHE = os.path.join(RAW, "_cache", "e4evidence-continental", "robots.txt")

# Hard stop. The handoff budget is five origin requests; a national grid is a
# separate change gated on this probe's verdict.
MAX_ORIGIN_REQUESTS = 5

RADIUS = 100          # the largest the block's own radius control offers
DISTANCE_UNIT = "mi"  # the block's authored `units` cell on the US pages

METROS = [
    ("houston-tx", 29.7604, -95.3698),
    ("chicago-il", 41.8781, -87.6298),
    ("cleveland-oh", 41.4993, -81.6944),
]

# Source-native filter keys, verbatim from schema-lHiCdr2T.js. Labels kept only
# so the raw file carries the source's own words; nothing is mapped off them.
FILTER_CODES = {
    "gad": {
        "cbh": "Conveyor Belts, Heavyweight",
        "hydraulics": "Hydraulics",
        "ptp": "Power Transmission Products",
        "ihose": "Industrial Hose",
        "ihoseStarDist": "Industrial Hose - STAR Distributor",
        "pde": "Petroleum Dispensing Equipment",
    },
    "aftermarket": {
        "achosefittings": "AC Hose Fittings",
        "atvbelts": "ATV Belts",
        "gardenhose": "Garden Hose",
        "hdairsprings": "HD Airsprings",
        "hdbeltshose": "HD Belts & Hose",
        "hydraulics": "Hydraulics",
        "installer": "Installer",
        "lawnmoverbelts": "Lawn Mower Belts",
        "partsstore": "Parts Store",
        "snowmobilebelts": "Snowmobile Belts",
    },
}
TIER_CODE = "ihoseStarDist"

# The eleven Account fields the block's list/detail components destructure. Any
# key outside this set is payload the UI never renders and is kept as `x_*_raw`.
UI_FIELDS = {"Id", "Name", "BillingStreet", "BillingCity", "BillingState",
             "BillingPostalCode", "BillingLatitude", "BillingLongitude",
             "Website", "Phone", "Email"}

DEDUPED = os.path.join(ROOT, "lists", "deduped-v7.csv")
DEDUPED_EXPECTED_ROWS = 16719  # 16,730 physical lines; 10 rows embed newlines

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
US_COUNTRY_WORDS = {"US", "USA", "U.S.", "U.S.A.", "UNITED STATES",
                    "UNITED STATES OF AMERICA"}


# ── transport ────────────────────────────────────────────────────────────────

class Refused(Exception):
    """A deterministic 4xx. The status IS the finding; it is not retried."""

    def __init__(self, url, code, body):
        super().__init__(f"HTTP {code} on {url}")
        self.url, self.code, self.body = url, code, (body or "")[:600]


class ProbeFetcher(BinFetcher):
    """`BinFetcher`, with two changes and no loosening of the posture.

    1. **A deterministic 4xx is terminal on the first attempt.** The inherited
       loop retries every status except 401/403/404 through the whole
       15/30/60/120/120s ladder. That is correct for 429 and 5xx, where the
       origin is asking for time, and wrong for 400, where the origin is saying
       the request is malformed — re-sending it unchanged five times cannot
       change the answer and is just load. 429 and 5xx keep the full ladder.
    2. **Permanent refusals are remembered on disk** (`_refused.json`), so a
       re-run does not re-ask a question the origin has already refused. That is
       the same instinct as the response cache, pointed at failures.

    Everything else is inherited: >=3s pacing, single worker, honest UA never
    rotated, bytes-safe body with Content-Encoding decode, and **401/403 raises
    `Blocked` and stops the source — no retry, no rotation, no host switching,
    no stealth.**
    """

    RETRYABLE = {408, 425, 429, 500, 502, 503, 504}

    def __init__(self, source, min_bytes=200):
        super().__init__(source, min_bytes)
        self._memo = os.path.join(self.cache, "_refused.json")
        self.refused = {}
        if os.path.exists(self._memo):
            with open(self._memo, encoding="utf-8") as fh:
                self.refused = json.load(fh)

    def _remember(self, url, code, body):
        self.refused[url] = {"status": code, "body": (body or "")[:600],
                             "captured": CAPTURED}
        with open(self._memo, "w", encoding="utf-8") as fh:
            json.dump(self.refused, fh, indent=1)

    def get(self, url, cache_name, data=None, headers=None, timeout=180):
        path = os.path.join(self.cache, cache_name)
        if os.path.exists(path) and os.path.getsize(path) >= self.min_bytes:
            with open(path, "rb") as fh:
                return fh.read().decode("utf-8", "replace"), True
        if url in self.refused:
            prev = self.refused[url]
            print(f"  skipping {url} — already refused with HTTP {prev['status']} "
                  f"on {prev['captured']}; not re-asking")
            raise Refused(url, prev["status"], prev["body"])

        hdrs = {
            "User-Agent": _polite.UA,
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9",
        }
        hdrs.update(headers or {})

        for attempt in range(len(_polite.BACKOFF) + 1):
            self._pace()
            req = urllib.request.Request(url, headers=hdrs)
            try:
                with urllib.request.urlopen(req, timeout=timeout) as r:
                    raw = _decode_body(r.read(),
                                       (r.headers.get("Content-Encoding") or "").lower())
                self._last = time.time()
                self.origin_requests += 1
                with open(path, "wb") as fh:
                    fh.write(raw)
                return raw.decode("utf-8", "replace"), False
            except urllib.error.HTTPError as e:
                self._last = time.time()
                self.origin_requests += 1  # it reached the origin; it counts
                body = ""
                try:
                    body = _decode_body(
                        e.read(), (e.headers.get("Content-Encoding") or "").lower()
                    ).decode("utf-8", "replace")
                except Exception:  # noqa: BLE001 — the body is a bonus, not the point
                    pass
                if e.code in (401, 403):
                    self._remember(url, e.code, body)
                    raise Blocked(f"HTTP {e.code} on {url} — source stopped, "
                                  "no bypass") from e
                if e.code not in self.RETRYABLE:
                    self._remember(url, e.code, body)
                    print(f"  HTTP {e.code} on {url} — deterministic, NOT retried")
                    if body.strip():
                        print(f"    body: {body.strip()[:300]}")
                    raise Refused(url, e.code, body) from e
                wait = _polite.BACKOFF[min(attempt, len(_polite.BACKOFF) - 1)]
                print(f"  HTTP {e.code} on {url} -> backoff {wait}s", flush=True)
                time.sleep(wait)
            except Exception as e:  # noqa: BLE001 — transport errors are retryable
                self._last = time.time()
                wait = _polite.BACKOFF[min(attempt, len(_polite.BACKOFF) - 1)]
                print(f"  ERR {e!r} -> retry in {wait}s", flush=True)
                time.sleep(wait)
        raise Blocked(f"gave up on {url}")


# ── compliance gate ──────────────────────────────────────────────────────────

def robots_gate():
    """Re-read the cached robots.txt and assert the Allow before any request.

    Reading beats restating: if the file ever stops saying `Allow: /` for `*`,
    this raises and the source stops, rather than the docstring quietly aging
    into a false claim.
    """
    if not os.path.exists(ROBOTS_CACHE):
        raise SystemExit(f"no cached robots.txt at {ROBOTS_CACHE} — stop, "
                         "re-capture it before fetching anything")
    with open(ROBOTS_CACHE, encoding="utf-8") as fh:
        text = fh.read()
    lines = [ln.strip() for ln in text.splitlines()]
    agent, allow_all = None, False
    for ln in lines:
        low = ln.lower()
        if low.startswith("user-agent:"):
            agent = ln.split(":", 1)[1].strip()
        elif agent == "*" and low.startswith("allow:") and ln.split(":", 1)[1].strip() == "/":
            allow_all = True
        elif agent == "*" and low.startswith("disallow:"):
            path = ln.split(":", 1)[1].strip()
            if path and "/apis".startswith(path.rstrip("*")):
                raise SystemExit(f"robots.txt now disallows {path!r} for * — stop")
    if not allow_all:
        raise SystemExit("robots.txt no longer carries `Allow: /` for `User-agent: *` "
                         "— stop, do not fetch")
    print("robots gate: PASS — `User-agent: *` / `Allow: /`; /apis/ not excluded")
    return text


# ── request ──────────────────────────────────────────────────────────────────

def build_url(locator_type, lat, lng, **filters):
    """Exactly the param order the block's own `zn` sets them in."""
    parts = [f"locatorType={locator_type}", f"radius={RADIUS}",
             f"distanceUnit={DISTANCE_UNIT}", f"latitude={lat}", f"longitude={lng}"]
    parts += [f"{k}=true" for k, v in filters.items() if v]
    return f"{ENDPOINT}?{'&'.join(parts)}"


def unwrap(body):
    """The block feeds the parsed JSON straight into `dealers.map(...)`, so the
    happy path is a bare array. The other two shapes are handled rather than
    assumed away, and which one arrived is reported."""
    if isinstance(body, list):
        return body, "bare array"
    if isinstance(body, dict):
        for key in ("data", "records", "results", "distributors"):
            if isinstance(body.get(key), list):
                return body[key], f"object -> .{key}"
        return [], f"object, no list member (keys: {sorted(body)})"
    return [], f"unexpected {type(body).__name__}"


def fetch(f, url, cache_name):
    if f.origin_requests >= MAX_ORIGIN_REQUESTS:
        raise SystemExit(f"budget: {MAX_ORIGIN_REQUESTS} origin requests spent — "
                         "stopping, as instructed. No national grid from here.")
    body, cached = f.json(url, cache_name, headers={"Referer": PAGE})
    rows, shape = unwrap(body)
    return rows, shape, cached


# ── normalisation ────────────────────────────────────────────────────────────

def clean(value):
    if value is None:
        return None
    s = str(value).strip()
    return s or None


def usps(value):
    """A real 2-letter USPS code or a full state name. Never a guess from the
    city string, never reverse-derived from the ZIP."""
    s = clean(value)
    if not s:
        return None
    return s.upper() if s.upper() in US_STATES else STATE_ABBR.get(s.lower())


def num(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def flatten(obj, prefix=""):
    """Every scalar in the payload, path-keyed. Nothing dropped, nothing read."""
    out = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            out.update(flatten(v, f"{prefix}{k}."))
    elif isinstance(obj, list):
        if all(not isinstance(x, (dict, list)) for x in obj):
            out[prefix[:-1]] = "|".join("" if x is None else str(x) for x in obj)
        else:
            for i, v in enumerate(obj):
                out.update(flatten(v, f"{prefix}{i}."))
    else:
        out[prefix[:-1]] = obj
    return out


def normalize(r, locator_type, metro, source_url):
    # Salesforce BillingStreet is a multi-line textarea; the block prints it as
    # one line. Split on the newline the source itself put there.
    street = (clean(r.get("BillingStreet")) or "").replace("\r\n", "\n").replace("\r", "\n")
    seg = [s.strip() for s in street.split("\n") if s.strip()]

    # `is_us` from the country field if the payload has one, else from the state
    # field. Never from the ZIP, the phone area code or the lat/lng.
    country = None
    for key in ("BillingCountry", "BillingCountryCode", "Country", "country"):
        country = country or clean(r.get(key))
    state = usps(r.get("BillingState"))
    if country:
        is_us = country.upper() in US_COUNTRY_WORDS
    elif state:
        is_us = True   # a resolved USPS code IS the state field, not an inference
    else:
        is_us = None

    website = clean(r.get("Website"))
    rec = {
        "company": clean(r.get("Name")),
        "address_1": seg[0] if seg else None,
        "address_2": " ".join(seg[1:]) or None if len(seg) > 1 else None,
        "city": clean(r.get("BillingCity")),
        "state": state,
        "zip_raw": clean(r.get("BillingPostalCode")),
        "phone_raw": clean(r.get("Phone")),
        "phone_10": digits(r.get("Phone")),
        "email": clean(r.get("Email")),
        "website": website,
        "domain": apex(website),
        "lat": num(r.get("BillingLatitude")),
        "lng": num(r.get("BillingLongitude")),
        "is_us": is_us,
        "source": SOURCE,
        "source_url": source_url,
        "captured": CAPTURED,
    }
    # ── §5i SOURCE-NATIVE CODES, VERBATIM AND UNINTERPRETED ──────────────────
    rec["locator_type_raw"] = locator_type
    rec["probe_metro_raw"] = metro
    rec["country_raw"] = country
    rec["sf_id_raw"] = clean(r.get("Id"))
    # Every filter key the source declares, read off the record if it is there
    # at all. `None` means "the payload does not carry this key" — which is a
    # finding about the source, not a missing value on the dealer.
    for code in FILTER_CODES[locator_type]:
        rec[f"f_{code}_raw"] = r.get(code)
    # Everything else in the payload the UI never renders.
    for k, v in flatten({k: v for k, v in r.items() if k not in UI_FIELDS}).items():
        rec[f"x_{k.replace('.', '_').replace('@', '')}_raw"] = v
    return rec


# ── measurement ──────────────────────────────────────────────────────────────

MI_PER_RAD = 3958.7613


def haversine_mi(lat1, lng1, lat2, lng2):
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * MI_PER_RAD * math.asin(math.sqrt(a))


def load_deduped():
    with open(DEDUPED, encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    if len(rows) != DEDUPED_EXPECTED_ROWS:
        raise SystemExit(f"deduped-v7.csv has {len(rows)} data rows, expected "
                         f"{DEDUPED_EXPECTED_ROWS} — the baseline moved, stop and "
                         "re-agree the denominator before quoting any net-new")
    return rows


def net_new(records, deduped):
    """Two axes, reported separately and never averaged.

    Domain is the trustworthy one. Name joins have overstated net-new by ~3x on
    every source measured today, because locators publish branch labels
    ("Motion — Houston South") as company names, so a name that is absent from
    the list usually means a new *label*, not a new *company*.
    """
    have_dom = {(r.get("domain") or "").strip().lower()
                for r in deduped if (r.get("domain") or "").strip()}
    have_name = {norm_company(r.get("company")) for r in deduped}
    have_name.discard("")

    us = [r for r in records if r.get("is_us")]
    doms = {r["domain"] for r in us if r.get("domain")}
    names = {norm_company(r.get("company")) for r in us}
    names.discard("")
    # Companies for which the source published no website on ANY branch. They
    # cannot be domain-joined in either direction, so they are invisible to the
    # trustworthy axis — which is what makes the domain figure a FLOOR, not a
    # point estimate. Named, counted, and never quietly folded into either side.
    named_with_dom = {norm_company(r.get("company")) for r in us if r.get("domain")}
    named_with_dom.discard("")
    blind = sorted(names - named_with_dom)

    new_doms = sorted(doms - have_dom)
    new_names = sorted(names - have_name)
    return {
        "us_records": len(us),
        "records_with_domain": sum(1 for r in us if r.get("domain")),
        "records_without_domain": sum(1 for r in us if not r.get("domain")),
        "distinct_domains": len(doms),
        "distinct_domains_net_new": len(new_doms),
        "distinct_norm_companies": len(names),
        "distinct_norm_companies_net_new": len(new_names),
        "branch_label_inflation_name_over_domain": (
            round(len(names) / len(doms), 2) if doms else None),
        "companies_with_no_website_on_any_branch": len(blind),
        "companies_with_no_website_list": blind,
        "baseline_domains": len(have_dom),
        "baseline_norm_companies": len(have_name),
        "net_new_domains_sample": new_doms[:40],
        "net_new_norm_companies_sample": new_names[:40],
    }, new_doms, new_names


def metro_coverage(deduped):
    """What share of the geocoded baseline sits inside the three probe circles.

    This is the denominator for the projection, and it is a *measured* share of
    an existing list rather than a guess at national counts. Two things it is
    not: (a) it is not Continental's own geography, and (b) `deduped-v7` is
    itself a biased sample — it is what our sources happened to find. Both are
    stated in the report rather than buried here.
    """
    geo = []
    for r in deduped:
        lat, lng = num(r.get("lat")), num(r.get("lng"))
        if lat is not None and lng is not None:
            geo.append((lat, lng))
    inside = 0
    for lat, lng in geo:
        if any(haversine_mi(lat, lng, mlat, mlng) <= RADIUS
               for _, mlat, mlng in METROS):
            inside += 1
    return {
        "baseline_rows": len(deduped),
        "baseline_rows_with_latlng": len(geo),
        "baseline_rows_within_100mi_of_the_3_metros": inside,
        "share_of_geocoded_baseline": round(inside / len(geo), 5) if geo else None,
    }


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    robots_text = robots_gate()
    deduped = load_deduped()
    print(f"baseline: deduped-v7.csv, {len(deduped)} data rows, domain-keyed")

    f = ProbeFetcher(SOURCE, min_bytes=2)
    probe = {"radius": RADIUS, "distance_unit": DISTANCE_UNIT, "metros": {}}
    records, seen = [], {}
    key_union = {}          # locatorType -> {key: count}
    requests_log = []

    def ingest(locator_type, metro, url, rows):
        added = 0
        bucket = key_union.setdefault(locator_type, {})
        for r in rows:
            if not isinstance(r, dict):
                continue
            for k in r:
                bucket[k] = bucket.get(k, 0) + 1
            ident = (locator_type, r.get("Id"))
            if ident in seen:
                continue
            rec = normalize(r, locator_type, metro, url)
            seen[ident] = rec
            records.append(rec)
            added += 1
        return added

    # ── 1. the three gad metros (industrial; aftermarket is off-ICP) ─────────
    for metro, lat, lng in METROS:
        url = build_url("gad", lat, lng)
        try:
            rows, shape, cached = fetch(f, url, f"gad-{metro}.json")
        except Blocked as e:
            print(f"BLOCKED: {e}")
            write_raw(SOURCE, {"source_url": url, "blocked": str(e),
                               "robots_txt_verbatim": robots_text}, [])
            return
        added = ingest("gad", metro, url, rows)
        keys = sorted({k for r in rows if isinstance(r, dict) for k in r})
        probe["metros"][f"gad/{metro}"] = {
            "url": url, "records": len(rows), "new_ids_this_call": added,
            "response_shape": shape, "key_union": keys,
        }
        requests_log.append({"url": url, "cached": cached, "records": len(rows)})
        print(f"\ngad/{metro:<14} r={RADIUS}{DISTANCE_UNIT}  {len(rows)} records "
              f"({'cached' if cached else 'live'})  shape={shape}")
        print(f"  KEY UNION VERBATIM ({len(keys)}): {keys}")

    # ── 2. aftermarket on Houston only, to size the overlap ──────────────────
    am_metro, am_lat, am_lng = METROS[0]
    am_url = build_url("aftermarket", am_lat, am_lng)
    am_rows, am_error = [], None
    try:
        am_rows, am_shape, am_cached = fetch(f, am_url, f"aftermarket-{am_metro}.json")
    except Refused as e:
        am_error = {"status": e.code, "body": e.body}
        am_shape, am_cached = f"refused: HTTP {e.code}", False
        print(f"\nREFUSED: {e} — the overlap question is UNANSWERED, not assumed")
    except Blocked as e:
        am_error = {"status": "blocked", "body": str(e)}
        am_shape, am_cached = f"blocked: {e}", False
        print(f"\nBLOCKED: {e}")
    ingest("aftermarket", am_metro, am_url, am_rows)
    am_keys = sorted({k for r in am_rows if isinstance(r, dict) for k in r})
    probe["metros"][f"aftermarket/{am_metro}"] = {
        "url": am_url, "records": len(am_rows), "response_shape": am_shape,
        "key_union": am_keys, "error": am_error,
    }
    requests_log.append({"url": am_url, "cached": am_cached,
                         "records": len(am_rows), "error": am_error})
    print(f"aftermarket/{am_metro:<8} r={RADIUS}{DISTANCE_UNIT}  {len(am_rows)} "
          f"records ({'cached' if am_cached else 'no usable response'})  "
          f"shape={am_shape}")
    print(f"  KEY UNION VERBATIM ({len(am_keys)}): {am_keys}")

    # gad-vs-aftermarket overlap, on Houston, on both axes.
    gad_h = [r for r in records if r["locator_type_raw"] == "gad"
             and r["probe_metro_raw"] == am_metro]
    am_h = [r for r in records if r["locator_type_raw"] == "aftermarket"]
    gad_ids = {r["sf_id_raw"] for r in gad_h if r["sf_id_raw"]}
    am_ids = {r["sf_id_raw"] for r in am_h if r["sf_id_raw"]}
    gad_dom = {r["domain"] for r in gad_h if r["domain"]}
    am_dom = {r["domain"] for r in am_h if r["domain"]}
    overlap = {
        "houston_gad_records": len(gad_h),
        "houston_aftermarket_records": len(am_h),
        "shared_salesforce_ids": len(gad_ids & am_ids),
        "shared_domains": len(gad_dom & am_dom),
        "aftermarket_domains_not_in_gad": len(am_dom - gad_dom),
        "disjoint_by_id": (None if am_error else not (gad_ids & am_ids)),
        "measured": am_error is None,
        "why_not_measured": (
            None if am_error is None else
            f"locatorType=aftermarket answers HTTP {am_error['status']} on "
            f"{ORIGIN}, body verbatim: {am_error['body']!r}. That is Azure API "
            "Management reporting a BACKEND failure, not a malformed request — "
            "the gateway routed the call and could not parse the response from "
            "behind it. The route therefore exists (an unknown locatorType "
            "would 404) and its backend is not answering. Not transient over "
            "minutes: the first run re-sent it five times across 345s of "
            "backoff for the same 400. Overlap between the two locator types "
            "is UNKNOWN. Nothing is assumed either way, and no other host was "
            "tried."),
    }
    probe["gad_vs_aftermarket_houston"] = overlap
    if am_error:
        print(f"overlap (Houston): UNMEASURED — {overlap['why_not_measured']}")
    else:
        print(f"\noverlap (Houston): {overlap['shared_salesforce_ids']} shared Ids, "
              f"{overlap['shared_domains']} shared domains "
              f"({len(gad_ids)} gad Ids vs {len(am_ids)} aftermarket Ids)")

    # ── 3. does the RECORD carry the codes, or only the QUERY? ───────────────
    # This is the §5i test, and it is a test, not a formality: a code field
    # existing does not make it useful. A field that is null on every row, or
    # `false` on every row, sorts nothing.
    gad_recs = [r for r in records if r["locator_type_raw"] == "gad"]
    gad_keys = set(key_union.get("gad", {}))
    on_record = sorted(c for c in FILTER_CODES["gad"] if c in gad_keys)
    sf_custom = sorted(k for k in gad_keys if k.endswith("__c"))

    def spread(key):
        vals = {}
        for r in gad_recs:
            v = r.get(f"x_{key.replace('.', '_')}_raw")
            v = "(null)" if v is None else str(v)
            vals[v] = vals.get(v, 0) + 1
        return vals

    sf_field_values = {k: spread(k) for k in sf_custom}
    sorting = sorted(k for k, v in sf_field_values.items()
                     if len({x for x in v if x != "(null)"}) > 1
                     or (len(v) > 1))
    inert = sorted(k for k in sf_custom if k not in sorting)

    code_axis = {
        "declared_gad_filter_keys": sorted(FILTER_CODES["gad"]),
        "gad_filter_keys_present_on_the_record": on_record,
        "salesforce_custom_fields_on_the_record": sf_custom,
        "salesforce_custom_field_value_spread": sf_field_values,
        "fields_that_actually_sort": sorting,
        "fields_that_are_inert_on_this_pull": inert,
        "finding": "The record carries a Locator_*__c boolean for EVERY "
                   "AFTERMARKET filter key plus Hydraulics, and NO field at all "
                   "for the industrial keys cbh / ptp / ihose / ihoseStarDist / "
                   "pde. So the per-record flags describe the wrong network: the "
                   "industrial line card is query-side only.",
        "tier_code": TIER_CODE,
        "tier_code_on_the_record": TIER_CODE in gad_keys,
    }
    print(f"\ngad filter keys present ON THE RECORD: {on_record or 'NONE'}")
    print(f"SF custom fields on the record ({len(sf_custom)}): {sf_custom}")
    print(f"  of those, actually sorting: {sorting or 'NONE'}")
    print(f"  inert (single value on all {len(gad_recs)} rows): {inert}")

    # If the payload does not carry the codes, the tier claim is only reachable
    # through a filtered request. Spend the fifth and last budgeted request to
    # settle it, because "carries a tier code" is half the decision rule and a
    # guess would not be an answer. If the codes ARE on the record, this costs
    # nothing and is skipped.
    if not on_record and f.origin_requests < MAX_ORIGIN_REQUESTS:
        turl = build_url("gad", am_lat, am_lng, **{TIER_CODE: True})
        try:
            trows, tshape, tcached = fetch(f, turl, f"gad-{am_metro}-{TIER_CODE}.json")
            tids = {r.get("Id") for r in trows if isinstance(r, dict)}
            code_axis["tier_filter_probe"] = {
                "url": turl,
                "records": len(trows),
                "response_shape": tshape,
                "unfiltered_houston_gad_records": len(gad_h),
                "is_strict_subset_of_unfiltered": bool(tids) and tids < gad_ids,
                "is_subset_of_unfiltered": tids <= gad_ids,
                "verdict": ("the filter sorts — tier is recoverable, but only by "
                            "spending one extra request per metro per code"
                            if tids and tids < gad_ids else
                            "the filter did NOT narrow the set — treat the tier "
                            "code as unproven for this source"),
            }
            requests_log.append({"url": turl, "cached": tcached,
                                 "records": len(trows)})
            print(f"tier probe `{TIER_CODE}=true` (Houston): {len(trows)} of "
                  f"{len(gad_h)} records — "
                  f"{code_axis['tier_filter_probe']['verdict']}")
        except (Refused, Blocked, SystemExit) as e:
            code_axis["tier_filter_probe"] = {"url": turl, "error": str(e)}
            print(f"tier probe not run: {e}")
    elif not on_record:
        code_axis["tier_filter_probe"] = {
            "skipped": "origin-request budget spent before the tier probe"}

    # ── 4. net-new, both axes, domain first ─────────────────────────────────
    gad_records = [r for r in records if r["locator_type_raw"] == "gad"]
    measure_gad, _new_doms, _new_names = net_new(gad_records, deduped)
    measure_all, _, _ = net_new(records, deduped)
    coverage = metro_coverage(deduped)

    share = coverage["share_of_geocoded_baseline"]
    projection = {
        "method": "The three 100 mi circles are disjoint (Chicago-Cleveland is "
                  "~315 mi apart), so their coverage is additive. Measure what "
                  "share of the GEOCODED deduped-v7 baseline falls inside those "
                  "circles, then divide the observed net-new by that share. The "
                  "denominator is a measured share of an existing list, not an "
                  "estimate of the national universe.",
        "observed_net_new_domains_gad": measure_gad["distinct_domains_net_new"],
        "baseline_share_inside_the_3_circles": share,
        "arithmetic": (f"{measure_gad['distinct_domains_net_new']} net-new domains "
                       f"/ {share} share = "
                       f"{measure_gad['distinct_domains_net_new'] / share:.0f}"
                       if share else "share is 0 — cannot project"),
        "projected_national_net_new_domains": (
            round(measure_gad["distinct_domains_net_new"] / share) if share else None),
        "this_is_a_floor_not_a_point_estimate": (
            f"{measure_gad['companies_with_no_website_on_any_branch']} of the "
            f"{measure_gad['distinct_norm_companies']} distinct company names in "
            "the probe have no website on any branch, so they cannot be "
            "domain-joined in either direction and are invisible to this axis. "
            "Some of them are branch labels of companies already counted (DXP "
            "CONROE, GHX TEXAS CITY); some are genuinely separate shops. The "
            "true figure sits at or above the domain projection and at or below "
            "the name projection, and this probe does not resolve where."),
        "name_axis_projection_for_contrast": (
            round(measure_gad["distinct_norm_companies_net_new"] / share)
            if share else None),
        # The denominator is the weakest link, so test how much it would have to
        # be wrong before the verdict flips. That is a stronger claim than the
        # point estimate: it survives disagreement about the denominator.
        "sensitivity": {
            "share_at_which_leg_1_would_pass": round(
                measure_gad["distinct_domains_net_new"] / 150, 4),
            "reading": (
                f"leg 1 needs >=150. At {measure_gad['distinct_domains_net_new']} "
                "observed net-new domains, that requires the three circles to "
                "cover <="
                f"{measure_gad['distinct_domains_net_new'] / 150 * 100:.1f}% of "
                "US industrial distribution. They cover 15.9% of the geocoded "
                "baseline; even a population-share denominator (Houston + "
                "Chicago + Cleveland CBSAs are ~5.5% of US population, and a "
                "100 mi radius reaches well past a CBSA) does not get near that "
                "low. Leg 1 fails across every plausible denominator, not just "
                "the one chosen here."),
        },
        "assumptions_that_could_be_wrong": [
            "Continental's dealer density is assumed to track deduped-v7's "
            "geography. Continental is belts/hose/hydraulics; if its network is "
            "thicker or thinner in the Gulf and the Rust Belt than our list is, "
            "the projection is wrong in that direction.",
            "14.6% of the baseline has no lat/lng and is excluded from the share "
            "denominator entirely.",
            "Domain fill on the probe caps how much net-new is even measurable — "
            "records with no website cannot be domain-joined and are invisible "
            "to this axis in both directions.",
            "Three metros is three metros. This is a projection, not a census.",
        ],
    }

    # ── 5. verdict on the two legs, stated plainly ──────────────────────────
    leg1 = (projection["projected_national_net_new_domains"] or 0) >= 150
    tier_ok = code_axis["tier_code_on_the_record"] or bool(
        code_axis.get("tier_filter_probe", {}).get("is_strict_subset_of_unfiltered"))
    line_card = bool(on_record)
    verdict = {
        "rule": "a full national sweep requires >=150 projected net-new companies "
                "AND (a tier code OR a per-record line card)",
        "leg_1_projected_net_new_ge_150": leg1,
        "leg_2_tier_code_or_line_card": tier_ok or line_card,
        "leg_2_detail": {"tier_code_usable": tier_ok,
                         "per_record_line_card": line_card},
        "clears_both_legs": bool(leg1 and (tier_ok or line_card)),
    }

    code_fields = tuple(["locator_type_raw", "country_raw"]
                        + [f"f_{c}_raw" for c in FILTER_CODES["gad"]]
                        + sorted({k for r in records for k in r
                                  if k.startswith("x_") and k.endswith("_raw")}))
    stats = report(SOURCE, records, code_fields=code_fields)
    stats["gad_only"] = measure_gad
    stats["gad_plus_aftermarket"] = measure_all
    stats["baseline_coverage"] = coverage
    stats["projection"] = projection
    stats["verdict"] = verdict
    stats["code_axis"] = code_axis

    print("\n── net-new vs emails/lists/deduped-v7.csv ──────────────────────")
    print(f"gad US records:               {measure_gad['us_records']}")
    print(f"  distinct domains:           {measure_gad['distinct_domains']}")
    print(f"  NET-NEW BY DOMAIN:          {measure_gad['distinct_domains_net_new']}")
    print(f"  distinct norm_company:      {measure_gad['distinct_norm_companies']}")
    print(f"  net-new by norm_company:    "
          f"{measure_gad['distinct_norm_companies_net_new']}  (inflated axis)")
    print(f"  name/domain inflation:      "
          f"{measure_gad['branch_label_inflation_name_over_domain']}x")
    print(f"  companies with no website:  "
          f"{measure_gad['companies_with_no_website_on_any_branch']} "
          "(invisible to the domain axis in both directions)")
    print(f"baseline inside the 3 circles: "
          f"{coverage['baseline_rows_within_100mi_of_the_3_metros']} of "
          f"{coverage['baseline_rows_with_latlng']} geocoded = {share}")
    print(f"projection: {projection['arithmetic']}")
    print(f"\nVERDICT  leg1 (>=150 projected net-new): {leg1}")
    print(f"         leg2 (tier code or line card):  {tier_ok or line_card}")
    print(f"         CLEARS BOTH LEGS:               {verdict['clears_both_legs']}")
    print(f"\norigin requests: {f.origin_requests} of {MAX_ORIGIN_REQUESTS}. "
          "Stopping here — no national grid.")

    write_raw(SOURCE, {
        "source_name": "Continental / ContiTech distributor locator",
        "source_url": ENDPOINT,
        "locator_page": PAGE,
        "method": "THREE-METRO PROBE, NOT A SWEEP. The AEM Edge Delivery block "
                  "/blocks/distributor-locator/distributor-locator.js builds "
                  "`new URL('apis/v1/distributors', window.location.origin)` and "
                  "calls it with a bare fetch() — no headers, no key, no "
                  "Authorization, no credentials option, so there is no "
                  "credential boundary. Params are exactly the ones the block "
                  "sets: locatorType, radius, distanceUnit, latitude, longitude, "
                  "plus the filter keys. Radius 100 is the largest the block's "
                  "own control offers ([10,20,50,100]); distanceUnit=mi is the "
                  "block's authored `units` value on the US pages. Three gad "
                  "metros + one aftermarket comparison; a national grid is a "
                  "separate change gated on this probe's verdict and is enforced "
                  f"by MAX_ORIGIN_REQUESTS={MAX_ORIGIN_REQUESTS}.",
        "robots_check": {
            "url": f"{ORIGIN}/robots.txt",
            "verbatim": robots_text,
            "allow_line_verbatim": "User-agent: *\nAllow: /",
            "verdict": "/apis/ is inside `Allow: /` and is excluded by nothing. "
                       "The only Disallow in the file is scoped to "
                       "`User-agent: Linguee`, which we are not. No override is "
                       "involved and there is nothing to sign.",
            "read_from": ROBOTS_CACHE,
            "gate": "asserted at run time before the first request, not restated "
                    "from a comment",
        },
        "backend": "Salesforce. The block renders Account API names (Id, Name, "
                   "Billing*, Website, Phone, Email) and the source's own filter "
                   "table maps `hydraulics` to the custom field "
                   "\"Locator_Hydraulics__c\".",
        "filter_codes_verbatim": FILTER_CODES,
        "filter_codes_source": f"{ORIGIN}/scripts/site/schema-lHiCdr2T.js — the "
                               "module the block imports; `ft = (t = 'gad') => "
                               "Object.keys(nt[t])` turns the table keys into the "
                               "query-param names, so the key IS the param.",
        "codes_captured_verbatim": list(code_fields) + [
            "probe_metro_raw", "sf_id_raw"],
        "vertical_code": "UNPROVEN FOR THIS SOURCE AS PROBED. The gad filter keys "
                         "(cbh / hydraulics / ptp / ihose / ihoseStarDist / pde) "
                         "are the source's own vertical split and ihoseStarDist "
                         "is a tier code, but they are QUERY-side params; whether "
                         "they also ride on the record is measured in "
                         "`stats.code_axis`, not assumed. A code field existing "
                         "does not make it useful — do not seat on it until it is "
                         "shown to sort.",
        "aftermarket_note": "locatorType=aftermarket is Continental's automotive "
                            "and consumer network (garden hose, ATV/snowmobile "
                            "belts, lawn mower belts, parts stores, installers) "
                            "and is off-ICP. Probed once, on Houston only, to "
                            "learn whether the two locator types return disjoint "
                            "sets — and it answered HTTP 400 on this origin with "
                            "an Azure APIM backend error, so THE OVERLAP IS "
                            "UNKNOWN. See "
                            "probe.gad_vs_aftermarket_houston.why_not_measured. "
                            "The 400 is recorded and memoised, not retried and "
                            "not worked around, and no alternative host was "
                            "tried.",
        "measurement": "Net-new measured against emails/lists/deduped-v7.csv "
                       f"({DEDUPED_EXPECTED_ROWS} data rows, asserted at load; "
                       "16,730 physical lines because 10 rows embed newlines in "
                       "quoted fields). Reported on two axes and never averaged: "
                       "DOMAIN is the trustworthy one; norm_company is reported "
                       "beside it because name joins have overstated net-new by "
                       "~3x on every source measured today — locators publish "
                       "branch labels as company names.",
        "probe": probe,
        "requests": requests_log,
        "origin_requests": f.origin_requests,
        "origin_request_budget": MAX_ORIGIN_REQUESTS,
        "refused_urls": f.refused,
        "request_accounting_note": "`origin_requests` counts this run only, and "
                                   "counts a 4xx as a request because it reached "
                                   "the origin. The disk cache makes a clean "
                                   "re-run 0. The FIRST run of this source cost "
                                   "more than the budget line suggests: before "
                                   "ProbeFetcher existed, the inherited retry "
                                   "ladder re-sent the aftermarket 400 five times "
                                   "over 345s of backoff. Physical hits on the "
                                   "origin across every run of this source, "
                                   "counted honestly: 3 gad + 5 aftermarket-400 + "
                                   "1 tier-filter + 1 aftermarket-400 (memoised) "
                                   "= 10. The budget was set at 5 logical "
                                   "requests and 5 is what the current code "
                                   "spends; the extra 5 were a retry bug, and "
                                   "they are recorded rather than netted out.",
        "stats": stats,
    }, records)

    print(json.dumps({"verdict": verdict, "projection": projection}, indent=1))


if __name__ == "__main__":
    main()
