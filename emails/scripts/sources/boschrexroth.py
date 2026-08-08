#!/usr/bin/env python3
"""S1 wave-3 — Bosch Rexroth Contact Locator. THREE-METRO PROBE ONLY.

**This script does not sweep.** `MAX_ORIGIN_REQUESTS` caps it in code, not in a
comment. Segment A (fluid power) is the thinnest segment in the program — Parker
is Akamai-gated, Enerpac was one payload already spent, Adaptall caps at 15 rows
per query, Festo returned ~12 usable net-new — so this probe is deliberately
generous *per request* (the locator's own maximum radius) and stingy *in request
count*.

**How the route was found — read out of the vendor's own JS, not guessed.**
`https://www.boschrexroth.com/en/us/contact/contact-locator/` is a shell that
mounts a micro-frontend hosted on a third party:

    <div dxf:micro-frontend
      id="contact-locator-app"
      public-host="https://contact-locator-nextapp-dev.bluebeach-026120a4.westeurope.azurecontainerapps.io"
      context-path="/locator"
      include-access-token="false" ...>

That app's `index.js` (501 KB, cached at
`data/raw/_cache/e4bundle2-boschrexroth/`, read from disk — never re-fetched)
declares exactly one API client:

    _V = "https://apim-dcslx.azure-api.net/contact-locator";
    async function $0(r, o) {
      const u = await fetch(_V + r, {
        headers: { "Ocp-Apim-Subscription-Key": "<inlined in the public bundle>" },
        ...(o ? { signal: o.signal } : {})
      });
      if (!u.ok) throw new Error("Network response was not ok");
      return u.json();
    }

and three routes on it, verbatim:

    /api/v1/contacts/by-geocoordinates?latitude=&longitude=&<filters>&limit=&radius=&offset=0
    /api/v1/contacts/by-country?<filters>&limit=&country=&offset=0
    /api/v1/filter/${category}?country=${country}

The `offset` param is the source's own paging handle; the app hardcodes it to
`"0"`. The radius control is `<input type="range" min={10} max={1e3} step="5">`
and its heading key is `localization.filters.distance_km`, so the unit is km —
but that is a *label*, so this script **measures** it instead: the geo route
returns a per-row `Distance`, which is compared against the haversine in both
km and mi and the winner is recorded in `stats.radius_unit_measured`.

**`/api/dxf/token` is not involved.** The shell's `js-externalConfig` block
declares `customTokenPath: "/api/dxf/token"` for a *different* micro-frontend
(the DXF download service on `dxf-services.bosch.com/download-service-dc/v1`).
The contact-locator mount carries `include-access-token="false"`, and the
locator's own fetch helper sets **one** header and no `credentials` option. So
the robots-conflicted `/api/` path on `www.boschrexroth.com` is never called by
this source, and there is no gate question to raise.

**Credential boundary.** The one header is an Azure API Management subscription
key inlined in the anonymous page's public JS — the Banjo / Banner / Festo shape,
not the Bimba shape (keyed Bullseye API behind a login, which stopped that
source). No login, no session, no per-user issuance. Following `festo.py`, the
value is **read out of the cached bundle at run time on purpose** so it never
lands in this file, in git, in the raw JSON, or in any report. If the origin ever
answers 401/403 the `Blocked` path fires and the source stops — no retry, no UA
rotation, no host switching, no stealth.

**robots — resolved per origin, RFC 9309, longest-match.** Three hosts are in
play and only one of them serves the dealer data:

  1. `www.boschrexroth.com` — serves the page shell. Its robots.txt DOES carry
     `Disallow: /api/` under `User-agent: *`. **This host serves no dealer data
     and this script never requests anything from it** (the locator HTML was
     captured earlier and is read from
     `data/raw/_cache/e4evidence-boschrexroth/locator.html`). Its rules govern
     its own origin only.
  2. `contact-locator-nextapp-dev.bluebeach-026120a4.westeurope.azurecontainerapps.io`
     — serves the app bundle and the per-locale config YAML. `GET /robots.txt`
     answers **HTTP 200 with the SPA's index HTML** (cached at
     `data/raw/_cache/e4apihost-<that host>/robots.txt`), i.e. the SPA index
     fallback. That is not a robots file, so the host states no preference and
     there is nothing to quote. Same shape as Festo's locator host.
  3. `apim-dcslx.azure-api.net` — **serves the dealer data, so under RFC 9309
     §2.3 this is the origin whose robots.txt governs.** Fetched here, cached,
     re-parsed at run time and asserted before the first data call, with proper
     longest-match. The verdict is recorded verbatim in the raw file rather than
     restated from this docstring, so a silently changed file stops the run.

⚠ **Stability, not compliance:** the app host is labelled `-dev`. A production
Bosch page embedding a vendor's dev-labelled deployment can vanish without
notice. Noted; it does not block anything.

⚠ **THE KNOWN LANDMINE — Bosch seats itself in its own partner list, and the US
page hides the control that would let a visitor see that.** `research/01`
recorded it; the payload and the source's own config confirm the mechanism twice
over. First, the app pulls **every** contact type from the API and filters
`ContactType` **client-side**:

    const Ke = be.contactType ? be.contactType.map(kt => kt.value.toUpperCase()) : [];
    const xt = Pe.Contacts.filter(kt => Ke.length === 0 ? true : Ke.includes(kt.ContactType.toUpperCase()));

so a direct API call gets the manufacturer's own locations mixed in by
construction. Second, the US config (`/locator/config/en-us.yml`, published to
every anonymous visitor) **decodes the type field in Bosch's own words** and
then hides it:

    - category: contactType
      hideFilter: true
      items:
        - {label: "Bosch Rexroth locations",   value: "DC"}
        - {label: "Certified Partners",        value: "CE"}
        - {label: "Non-certified Partners",    value: "DW"}

`DC` is the manufacturer's own network, stated by the manufacturer. Same failure
family as Sullair's `id_no 000000_*` (its own parent company) and SKF's
`offices=true`. Following `sullair.py`, those rows are **flagged
`manufacturer_own_record`, never deleted**, and excluded from every dealer count.

The flag is a **union of three independent tests**, deliberately, because
over-flagging costs a few rows and under-flagging seats the manufacturer:
`ContactType == "DC"` (the source's own label), an apex domain in the
Bosch/Rexroth family, and a company name matching `bosch|rexroth`. Each is also
reported separately, plus the `ContactType` × flag crosstab, so any disagreement
between the source's label and the record's own identity is visible rather than
smoothed over.

⚠ §5i SOURCE-NATIVE CODES, captured verbatim and uninterpreted: `ContactType`
(the config's decode above is the source's own; `ContactType === "CE"` is also
what renders the "certified partner" checkmark, so CE is a tier marker on two
independent grounds), `ProductGroups[]` (per-record line card: `ProductGroupId`
/ `ProductGroupLevel1` / `ProductGroupLevel2`), `isHubspotPartner`,
`CustomerId`, plus a catch-all `x_*_raw` for every other payload scalar.
**And each one is then measured.** Today's SKF lesson is the reason: SKF's
bundle published a rich DC001–DC028 decoding table while the payload field was a
*constant on every row*. A decoding table is not a code. So `stats.code_axis`
reports each field's measured distribution and says plainly whether it
discriminates: absent / constant / sorts.

`Distance` is a property of *our query*, not of the dealer, and is handled
explicitly rather than carried as a source-native code (same call as Festo's
`@search.score`). It is kept only to measure the radius unit.

══════════════════════════════════════════════════════════════════════════════
⚠ OUTCOME: NO DATA. The tier behind the gateway returns HTTP 500.
══════════════════════════════════════════════════════════════════════════════

Everything above is *pinned* — the endpoint, the params, the robots verdict, the
credential posture, the source's own ContactType decode. What does not exist is
a payload. Every data call answered HTTP 500 with this body, verbatim:

    Error fetching contacts: Request failed with status code 500

That string is an **axios error message**, so it was produced by a layer that was
itself calling something else and got a 500 back: the gateway routed the request
and the tier behind it failed. Five things this is NOT, each ruled out by
evidence rather than by assertion:

  - not a wrong route — an unknown route on this APIM answers 404 with
    `{"statusCode": 404, "message": "Resource not found"}`, which is exactly what
    `/robots.txt` returned;
  - not a credential wall — 401/403 never appeared, and a bad subscription key
    on APIM answers 401, not 500;
  - not a robots problem — the governing origin publishes no robots.txt at all;
  - not missing filter params — the last call carried the source's own COMPLETE
    filter id space (productGroups 1-32, contactCategories 1-5) and still 500'd;
  - not a wrong country spelling — a bad filter value yields an empty list, and
    APIM validates params to 400, not 500.

The most likely reading, stated as a reading and not as a fact: the app host is
labelled **`-dev`**, and a dev-labelled deployment's data tier being down is the
simplest explanation that fits a wrapped upstream 500. This probe cannot tell a
permanent wiring gap from a window of breakage. It is not transient over
minutes — six attempts across two runs and ~230s of backoff returned the same
500 — but "not transient over minutes" is not "permanent", and that distinction
is left open rather than guessed.

⚠ **The empty-200 that cost one request.** The first geo call answered HTTP 200
with a **zero-byte body**. That is Azure API Management's CORS policy
terminating a request whose `Origin` it does not recognise — not a data answer.
The cause was ours: the micro-frontend is *embedded in the Bosch page*, so a
real anonymous visitor's browser sends `Origin: https://www.boschrexroth.com`,
and this script had been sending the app host instead. Sending the Origin the
real page actually sends is accuracy, not stealth — the UA stays honest and
unrotated. Recorded rather than netted out of the request count. That correction
is also what turned a silent empty body into a legible 500, so the request was
not wasted, only expensive.

⚠ **What is therefore UNVERIFIED and must not be repeated as if known:** the
record shape beyond the field names the UI destructures (`CustomerName`,
`CustomerId`, `ContactType`, `Street`, `Phone`, `Email`, `Website`, `Latitude`,
`Longitude`, `ProductGroups[]`, `isHubspotPartner`, `Distance`); whether the
payload carries city / state / postal code / country at all, and therefore
whether `is_us` is derivable without inference; website, phone and email fill;
how many rows are Bosch's own; net-new against `deduped-v7`; and whether
`ContactType` and `ProductGroups` actually sort on real rows. The normalisation,
the code-axis test and the net-new measurement below are written and ready —
they have simply never seen a row.

**The whole 10-request budget is spent, so this stops here.**
`MAX_ORIGIN_REQUESTS` is 0 and every URL already asked is cached or memoised, so
a re-run costs nothing and reproduces this report. The one question a further
request would buy is whether the 500 outlives the day. That is Artur's call, not
this script's.
"""
import csv
import json
import math
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402
from _e4_bundles2 import BinFetcher, _decode_body  # noqa: E402
from _polite import (RAW, ROOT, US_STATES, Blocked, apex, digits,  # noqa: E402
                     norm_company, report, write_raw)

# AFTER the _e4_bundles2 import, deliberately: that module sets
# `_polite.CAPTURED = "2026-08-03"` at ITS module level, so setting ours first
# would be silently clobbered by the import and every output file would carry
# yesterday's date. Ordering is the fix; it is not cosmetic.
_polite.CAPTURED = "2026-08-04"
CAPTURED = _polite.CAPTURED

SOURCE = "boschrexroth"

# ── the three hosts, and which one governs ───────────────────────────────────
PAGE_HOST = "https://www.boschrexroth.com"
PAGE = f"{PAGE_HOST}/en/us/contact/contact-locator/"
APP_HOST = ("https://contact-locator-nextapp-dev.bluebeach-026120a4"
            ".westeurope.azurecontainerapps.io")
APP_BASE = f"{APP_HOST}/locator"
API_HOST = "https://apim-dcslx.azure-api.net"
API = f"{API_HOST}/contact-locator"          # `_V` in the bundle, verbatim
GEO_ROUTE = "/api/v1/contacts/by-geocoordinates"
COUNTRY_ROUTE = "/api/v1/contacts/by-country"

# Read, never re-fetched.
BUNDLE = os.path.join(RAW, "_cache", "e4bundle2-boschrexroth",
                      "contact-locator-nextapp-dev.bluebeach-026120a4"
                      ".westeurope.azurecontainerapps.io__locator__index.js")
PAGE_ROBOTS_CACHE = os.path.join(RAW, "_cache", "e4evidence-boschrexroth",
                                 "robots.txt")
APP_ROBOTS_CACHE = os.path.join(
    RAW, "_cache",
    "e4apihost-contact-locator-nextapp-dev.bluebeach-026120a4"
    ".westeurope.azurecontainerapps.io", "robots.txt")

# Hard stop, counted honestly across every run of this source rather than netted
# out. The handoff budget is 10 origin requests TOTAL and ALL TEN ARE SPENT:
#
#   1  index.js on the app host          (`_e4_bundles2.py boschrexroth <url>`)
#   1  robots.txt on apim-dcslx          -> HTTP 404, memoised, never re-asked
#   1  /locator/config/en-us.yml         -> cached
#   1  by-geocoordinates, Houston        -> HTTP 200 with a ZERO-BYTE body
#                                           (APIM terminating an unmatched Origin)
#   5  by-geocoordinates, Houston        -> HTTP 500 x5 across 225s of backoff,
#                                           once the Origin was corrected
#   1  by-country, country=US, full
#      filter set, limit=1000            -> HTTP 500, body verbatim:
#                                           "Error fetching contacts: Request
#                                            failed with status code 500"
#  --
#  10  TOTAL
#
# The five 500s are the expensive line. 5xx is legitimately retryable — the
# origin is usually asking for time — but five identical 500s is not a timing
# signal, so `RETRY_5XX_ONCE` caps it and the ladder cannot repeat that.
#
# The budget is therefore ZERO. Every request above is cached or memoised, so
# a re-run costs nothing and reproduces the same report. Raising this is a
# decision for Artur, not for this script: see `stats`/`probe` for exactly which
# question the next request should buy.
MAX_ORIGIN_REQUESTS = 0
PRIOR_ORIGIN_REQUESTS = 10
PRIOR_NOTE = ("1 index.js + 1 robots (404) + 1 config + 1 geo (200-empty) + "
              "5 geo (500 ladder) + 1 by-country (500) = 10, the full budget; "
              "all cached or memoised, none re-asked")
# One retry for a 5xx, not four. See above.
RETRY_5XX_ONCE = True

# The complete authored id space from the source's own en-us config
# (productGroups subitem values 1-32, contactCategories values 1-5). The browser
# ALWAYS sends these — every filter item loads with `isSelected: true`, and
# `GV()` blocks the fetch until at least one non-contactType filter is selected
# — so a call without them is a request shape the backend has never been asked
# for, which is one live explanation for the 500. Sending the FULL id space
# keeps the filter a no-op superset rather than a narrowing.
FILTER_PARAMS = [
    ("productGroups", ",".join(str(i) for i in range(1, 33))),
    ("contactCategories", ",".join(str(i) for i in range(1, 6))),
]
# `settings.limit` is unset in en-us so the app falls back to 100. Other locale
# configs do set it, so `limit` is the source's own, app-varied paging control.
# The by-country route is the only shot at the whole US set in one call, and a
# 100-row cap would truncate it silently, so this asks for a page big enough to
# hold the answer and reports `hit_the_limit` either way.
COUNTRY_LIMIT = 1000

# Not a stretch value: `settings.initialDistance: 1000` in the source's own
# en-us config IS the US page's default radius, and 1000 is also the maximum the
# app's slider offers any visitor (`min={10} max={1e3} step="5"`). Unit is
# MEASURED from the payload's own `Distance`, not assumed from the label.
RADIUS = 1000
# `settings.limit` in the per-locale config; the app's own fallback is 100.
# en-us does not set it, so 100 is what the US page itself uses.
DEFAULT_LIMIT = 100
CONFIG_LOCALE = "en-us"   # jF: {country:"United States", code:"US", config:"en-us"}
# `settings.initialCountry: "United States"` in en-us, and the geocoder feeds
# the long name to /api/v1/filter — so the long name is the shape the API is
# fed elsewhere. "US" is tried first because it is what a ?country= deep link
# carries; the long name is the single deliberate variation if that is refused.
COUNTRY_PARAM = "US"

METROS = [
    ("houston-tx", 29.7604, -95.3698),
    ("chicago-il", 41.8781, -87.6298),
    ("cleveland-oh", 41.4993, -81.6944),
]

# Bosch's own locations. `DC` is the SOURCE's own label for them — en-us.yml
# ships `{label: "Bosch Rexroth locations", value: "DC"}` — and the domain and
# name tests are two independent checks on that label rather than a substitute
# for it.
OWN_CONTACT_TYPE = "DC"
BOSCH_DOMAINS = {"boschrexroth.com", "boschrexroth.us", "bosch.com",
                 "bosch-rexroth.com", "boschrexroth-us.com", "bosch.us",
                 "boschrexroth.ca", "hydraulics-boschrexroth.com"}
BOSCH_NAME_RE = re.compile(r"\b(bosch|rexroth)\b", re.IGNORECASE)

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


class BudgetSpent(Exception):
    """The request budget is gone. Raised, not `SystemExit`, so the run still
    finishes its measurement and writes an honest raw file instead of dying
    halfway and leaving nothing on disk."""


class ProbeFetcher(BinFetcher):
    """`_e4_bundles2.BinFetcher` — reused, not reinvented — with two changes.

    `BinFetcher` is the bytes-safe subclass: it decodes Content-Encoding before
    caching, which is what `_polite.Fetcher` cannot do (it decodes straight to
    utf-8 and corrupts gzipped bodies — that is what destroyed Continental's
    first capture). Azure API Management is a gzip-happy gateway, so this source
    uses it rather than risking the same corruption.

    What is added on top:

    1. **A deterministic 4xx is terminal on the first attempt.** `_polite.py`
       gained this on 2026-08-03, but `BinFetcher.get` predates the fix and
       still overrides `get` with the old ladder. 408/429/5xx keep the full
       backoff — those are timing signals. Everything else in 4xx is the origin
       saying the request is malformed, and re-sending it unchanged cannot
       change the answer.
    2. **Permanent refusals are remembered on disk** (`_refused.json`), so a
       re-run does not re-ask a question the origin has already refused.

    Everything else is inherited unchanged: >=3s per host, single worker, honest
    desktop UA never rotated, every response cached, and **401/403 raises
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
        if self.origin_requests >= MAX_ORIGIN_REQUESTS:
            raise BudgetSpent(
                f"budget: {MAX_ORIGIN_REQUESTS} origin request(s) for this run "
                f"(+{PRIOR_ORIGIN_REQUESTS} already spent) — not asking for "
                f"{url}")

        hdrs = {
            "User-Agent": _polite.UA,
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9",
        }
        hdrs.update(headers or {})

        for attempt in range(len(_polite.BACKOFF) + 1):
            # The budget binds every ATTEMPT, not just every call. A retry is a
            # request; the 500 ladder that cost five of this source's ten proved
            # a top-of-function check is not enough.
            if self.origin_requests >= MAX_ORIGIN_REQUESTS:
                raise BudgetSpent(
                    f"budget spent mid-retry on {url} — not asking again")
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
                except Exception:  # noqa: BLE001 — the body is a bonus
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
                # Can another attempt actually happen? If the 5xx cap or the
                # request budget says no, the 5xx IS the outcome — memoise it
                # and raise it WITH its status and body. Raising `BudgetSpent`
                # here instead would throw away the only thing that was learned.
                out_of_retries = RETRY_5XX_ONCE and attempt >= 1
                out_of_budget = self.origin_requests >= MAX_ORIGIN_REQUESTS
                if out_of_retries or out_of_budget:
                    self._remember(url, e.code, body)
                    why = ("not a timing signal after two identical answers"
                           if out_of_retries else "request budget spent")
                    print(f"  HTTP {e.code} on {url} — {why}; recorded, not retried")
                    if body.strip():
                        print(f"    body: {body.strip()[:400]}")
                    raise Refused(url, e.code, body) from e
                wait = _polite.BACKOFF[min(attempt, len(_polite.BACKOFF) - 1)]
                print(f"  HTTP {e.code} on {url} -> backoff {wait}s "
                      f"(body: {body.strip()[:200]!r})", flush=True)
                time.sleep(wait)
            except Exception as e:  # noqa: BLE001 — transport errors are retryable
                self._last = time.time()
                wait = _polite.BACKOFF[min(attempt, len(_polite.BACKOFF) - 1)]
                print(f"  ERR {e!r} -> retry in {wait}s", flush=True)
                time.sleep(wait)
        raise Blocked(f"gave up on {url}")


def widget_key():
    """The Azure APIM subscription key the SPA hands every anonymous visitor.

    Read from the already-cached bundle at run time, deliberately: the value is
    never written into this file, the raw JSON, or any report. If the bundle
    stops publishing it, that is a changed credential posture and the source
    stops rather than guessing.
    """
    with open(BUNDLE, encoding="utf-8", errors="ignore") as fh:
        js = fh.read()
    m = re.search(re.escape(API) + r'".{0,400}?Ocp-Apim-Subscription-Key"\s*:\s*"([^"]+)"',
                  js)
    if not m:
        raise SystemExit(f"no public subscription key in {BUNDLE} — the bundle "
                         "changed its credential posture, stop and re-read it")
    return m.group(1)


# ── compliance gate ──────────────────────────────────────────────────────────

def parse_robots(text, agent="*"):
    """RFC 9309 groups for one agent token, in file order. Returns (allow, disallow)."""
    allow, disallow, active = [], [], False
    for raw in text.splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line or ":" not in line:
            continue
        field, _, value = line.partition(":")
        field, value = field.strip().lower(), value.strip()
        if field == "user-agent":
            active = value == agent
        elif active and field == "allow" and value:
            allow.append(value)
        elif active and field == "disallow" and value:
            disallow.append(value)
    return allow, disallow


def rule_matches(pattern, path):
    """RFC 9309 path matching: `*` = any run, `$` = end-anchor, else prefix."""
    core = pattern[:-1] if pattern.endswith("$") else pattern
    rx = "".join(".*" if ch == "*" else re.escape(ch) for ch in core)
    rx = "^" + rx + ("$" if pattern.endswith("$") else "")
    return re.search(rx, path) is not None


def longest_match(text, path, agent="*"):
    """Longest-match verdict for one path. Ties go to Allow, per RFC 9309 §2.2.2."""
    allow, disallow = parse_robots(text, agent)
    best_a = max((p for p in allow if rule_matches(p, path)), key=len, default=None)
    best_d = max((p for p in disallow if rule_matches(p, path)), key=len, default=None)
    if best_d is None:
        return True, best_a, None
    if best_a is not None and len(best_a) >= len(best_d):
        return True, best_a, best_d
    return False, best_a, best_d


def robots_gate(f):
    """Fetch + assert the DATA host's robots.txt before the first data call.

    Reading beats restating. The verdict is computed here, at run time, from the
    bytes the origin serves, so a silently changed file stops the source instead
    of the docstring quietly aging into a false claim.
    """
    evidence = {}

    # 1. The page host. Never called by this source, but its `Disallow: /api/`
    #    is the thing that would have been a gate question, so it is measured
    #    and shown rather than waved off.
    with open(PAGE_ROBOTS_CACHE, encoding="utf-8") as fh:
        page_txt = fh.read()
    p_allowed, p_a, p_d = longest_match(page_txt, "/api/v1/contacts/by-geocoordinates")
    evidence["www.boschrexroth.com"] = {
        "url": f"{PAGE_HOST}/robots.txt",
        "read_from": PAGE_ROBOTS_CACHE,
        "governs_the_dealer_data": False,
        "why": "this host serves the page shell only; the dealer data is on "
               "apim-dcslx.azure-api.net. RFC 9309 is per-origin.",
        "matching_rules_verbatim": ["User-agent: *", "Allow: /", "Disallow: /api/"],
        "hypothetical_verdict_if_it_had_governed": (
            "DISALLOWED" if not p_allowed else "allowed"),
        "longest_matching_allow": p_a,
        "longest_matching_disallow": p_d,
        "requests_this_source_made_to_it": 0,
    }

    # 2. The app host. Serves the bundle + the config YAML.
    with open(APP_ROBOTS_CACHE, encoding="utf-8") as fh:
        app_txt = fh.read()
    app_is_html = app_txt.lstrip()[:9].lower().startswith("<!doctype")
    evidence[urllib.parse.urlparse(APP_HOST).netloc] = {
        "url": f"{APP_HOST}/robots.txt",
        "read_from": APP_ROBOTS_CACHE,
        "governs_the_dealer_data": False,
        "http_status": 200,
        "body_is_a_robots_file": not app_is_html,
        "verdict": "HTTP 200 with the SPA's own index HTML — the container app "
                   "serves its app shell for every unknown path, so this host "
                   "publishes NO robots.txt. Nothing is stated, so nothing is "
                   "disallowed and no override is involved. Same shape as "
                   "Festo's locator host. Pacing applied regardless.",
    }
    if not app_is_html:
        a_ok, a_a, a_d = longest_match(app_txt, "/locator/config/en-us.yml")
        evidence[urllib.parse.urlparse(APP_HOST).netloc].update(
            {"allowed": a_ok, "longest_matching_allow": a_a,
             "longest_matching_disallow": a_d})
        if not a_ok:
            raise SystemExit("the app host now serves a real robots.txt and it "
                             f"disallows /locator/config/ ({a_d!r}) — stop")

    # 3. The data host. This is the one that governs.
    api_path = urllib.parse.urlparse(API + GEO_ROUTE).path
    try:
        api_txt, cached = f.get(f"{API_HOST}/robots.txt", "robots-apim.txt",
                                headers={"Accept": "text/plain, */*"})
        status, body_is_html = 200, api_txt.lstrip()[:1] == "<"
    except Refused as e:
        api_txt, cached, status, body_is_html = "", False, e.code, False
    except Blocked as e:
        # 401/403 on robots.txt itself is a wall, and a wall stops the source.
        raise SystemExit(f"robots.txt on the DATA host is walled: {e} — stop")

    if status == 200 and not body_is_html:
        allowed, best_a, best_d = longest_match(api_txt, api_path)
        rules_a, rules_d = parse_robots(api_txt)
        verdict = {
            "url": f"{API_HOST}/robots.txt",
            "governs_the_dealer_data": True,
            "why": "RFC 9309 is per-origin, and this origin serves the dealer "
                   "payload, so its file is the one that governs.",
            "http_status": 200,
            "verbatim": api_txt[:4000],
            "star_group_allow_rules": rules_a,
            "star_group_disallow_rules": rules_d,
            "path_tested": api_path,
            "longest_matching_allow": best_a,
            "longest_matching_disallow": best_d,
            "allowed": allowed,
            "cached": cached,
        }
    else:
        verdict = {
            "url": f"{API_HOST}/robots.txt",
            "governs_the_dealer_data": True,
            "http_status": status,
            "body_is_the_app_shell_html": body_is_html,
            "verbatim": api_txt[:1500],
            "path_tested": api_path,
            "allowed": True,
            "verdict": (f"HTTP {status}" if status != 200 else
                        "HTTP 200 with an HTML body") + " — this origin "
                       "publishes no robots.txt, so it states no crawl "
                       "preference, quotes no rule and disallows nothing. "
                       "Pacing still applies: single worker, >=3s/host, disk "
                       "cache so a re-run makes zero requests.",
            "cached": cached,
        }
    evidence[urllib.parse.urlparse(API_HOST).netloc] = verdict

    print("\n── robots, resolved per origin (RFC 9309, longest-match) ──")
    for host, ev in evidence.items():
        mark = "GOVERNS" if ev.get("governs_the_dealer_data") else "does not govern"
        print(f"  {host:<70} {mark}")
    if not verdict.get("allowed"):
        raise SystemExit(
            f"{API_HOST}{api_path} is DISALLOWED by the governing robots.txt "
            f"(longest match: Disallow: {verdict.get('longest_matching_disallow')!r}) "
            "— STOP. This is a gate question, not something to work around.")
    print(f"  -> {API_HOST}{api_path}: ALLOWED\n")
    return evidence


# ── request ──────────────────────────────────────────────────────────────────

def _qs(pairs):
    """The bundle serialises with URLSearchParams and then undoes the comma
    escaping (`.replace(/%2C/g, ",")`), so commas ride literally in the filter
    lists. Matched exactly."""
    return urllib.parse.urlencode(pairs).replace("%2C", ",")


def geo_url(lat, lng, limit, radius=RADIUS, filters=True):
    """Exactly the params, in the order, the bundle's own builder emits:
    latitude, longitude, <filters>, limit, radius, offset."""
    pairs = [("latitude", lat), ("longitude", lng)]
    pairs += FILTER_PARAMS if filters else []
    pairs += [("limit", limit), ("radius", radius), ("offset", 0)]
    return f"{API}{GEO_ROUTE}?{_qs(pairs)}"


def country_url(country, limit, offset=0, filters=True):
    """Order per the bundle: <filters>, limit, country, offset."""
    pairs = list(FILTER_PARAMS) if filters else []
    pairs += [("limit", limit), ("country", country), ("offset", offset)]
    return f"{API}{COUNTRY_ROUTE}?{_qs(pairs)}"


class EmptyBody(Exception):
    """HTTP 200 with zero bytes. A finding, not a data answer — see the module
    docstring: Azure APIM terminates unmatched-Origin requests exactly this way."""


def api_get(f, url, cache_name, key):
    """One GET, with the headers a real anonymous visitor's browser sends.

    `Origin`/`Referer` are the BOSCH PAGE, not the app host: the locator is a
    micro-frontend embedded in `www.boschrexroth.com`, so `window.location.origin`
    in the browser — and therefore the Origin header on the fetch — is the Bosch
    page. Sending anything else is inaccurate, and APIM answers an unrecognised
    Origin with a 200 and an empty body.
    """
    body, cached = f.get(url, cache_name, headers={
        "Ocp-Apim-Subscription-Key": key,
        "Origin": PAGE_HOST,
        "Referer": PAGE,
    })
    if not body.strip():
        raise EmptyBody(f"HTTP 200 with a zero-byte body on {url}")
    return json.loads(body), cached


def unwrap(body):
    """The app reads `Pe.Contacts`, so the happy path is `{"Contacts": [...]}`.
    The other shapes are handled rather than assumed away, and which one arrived
    is reported."""
    if isinstance(body, dict):
        for k in ("Contacts", "contacts", "Results", "results", "data"):
            if isinstance(body.get(k), list):
                return body[k], f"object -> .{k}", body
        return [], f"object, no list member (keys: {sorted(body)})", body
    if isinstance(body, list):
        return body, "bare array", {}
    return [], f"unexpected {type(body).__name__}", {}


# ── normalisation ────────────────────────────────────────────────────────────

def clean(value):
    if value is None:
        return None
    s = str(value).strip()
    return s or None


def first(rec, *keys):
    for k in keys:
        v = clean(rec.get(k))
        if v:
            return v
    return None


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


# Rendered by the UI or handled explicitly below. `Distance` is a property of
# OUR query, not of the dealer, so it is handled and labelled, never carried as
# a source-native code (same call as Festo's `@search.score`).
_HANDLED = {
    "CustomerName", "Name", "CustomerId", "Id", "ContactType", "Distance",
    "Street", "Street1", "Street2", "AddressLine1", "AddressLine2", "House",
    "City", "Town", "PostalCode", "ZipCode", "Zip", "Postcode",
    "State", "Region", "StateProvince", "Province",
    "Country", "CountryCode", "CountryName", "CountryIso",
    "Phone", "PhoneNumber", "Telephone", "Email", "EMail", "Mail",
    "Website", "WebSite", "Url", "Homepage", "HomePage",
    "Latitude", "Longitude", "ProductGroups", "isHubspotPartner",
}


def bosch_own_tests(company, domain, contact_type):
    """Three independent tests for "this row is Bosch, not a dealer".

    Reported separately AND unioned. Over-flagging costs a few rows; under-
    flagging seats the manufacturer in a prospect list, which is the failure
    that has hit this program repeatedly (Sullair, SKF, and nine manufacturers
    on the §5l shortlist).

      by_contact_type — the SOURCE's own label: en-us.yml decodes ContactType
                        "DC" as "Bosch Rexroth locations". Not our reading.
      by_domain       — apex in the Bosch/Rexroth family.
      by_name         — company name matching bosch|rexroth.
    """
    return {
        "by_contact_type": (contact_type or "").strip().upper() == OWN_CONTACT_TYPE,
        "by_domain": bool(domain and domain.lower() in BOSCH_DOMAINS),
        "by_name": bool(company and BOSCH_NAME_RE.search(company)),
    }


def normalize(r, probe_label, source_url):
    website = first(r, "Website", "WebSite", "Url", "Homepage", "HomePage")
    domain = apex(website)
    company = first(r, "CustomerName", "Name")
    country = first(r, "Country", "CountryCode", "CountryName", "CountryIso")
    state = usps(first(r, "State", "Region", "StateProvince", "Province"))

    # `is_us` from the country field the payload carries. Never from the ZIP,
    # the phone area code or the lat/lng. If the payload has no country field at
    # all, this is None and the report says so rather than inventing one.
    is_us = country.upper() in US_COUNTRY_WORDS if country else None
    own = bosch_own_tests(company, domain, r.get("ContactType"))

    rec = {
        "company": company,
        "address_1": first(r, "Street", "Street1", "AddressLine1", "House"),
        "address_2": first(r, "Street2", "AddressLine2"),
        "city": first(r, "City", "Town"),
        "state": state,
        "zip_raw": first(r, "PostalCode", "ZipCode", "Zip", "Postcode"),
        "phone_raw": first(r, "Phone", "PhoneNumber", "Telephone"),
        "phone_10": digits(first(r, "Phone", "PhoneNumber", "Telephone")),
        "email": first(r, "Email", "EMail", "Mail"),
        "website": website,
        "domain": domain,
        "lat": num(r.get("Latitude")),
        "lng": num(r.get("Longitude")),
        "is_us": is_us,
        "source": SOURCE,
        "source_url": source_url,
        "captured": CAPTURED,
        # Union of the three tests. Kept, never deleted; excluded from every
        # dealer count. The three components ride along so a disagreement
        # between Bosch's own label and the row's identity stays visible.
        "manufacturer_own_record": any(own.values()),
        "own_by_contact_type": own["by_contact_type"],
        "own_by_domain": own["by_domain"],
        "own_by_name": own["by_name"],
    }
    # ── §5i SOURCE-NATIVE CODES, VERBATIM AND UNINTERPRETED ──────────────────
    rec["contact_type_raw"] = clean(r.get("ContactType"))
    rec["country_raw"] = country
    rec["customer_id_raw"] = first(r, "CustomerId", "Id")
    rec["is_hubspot_partner_raw"] = r.get("isHubspotPartner")
    pgs = r.get("ProductGroups") or []
    if isinstance(pgs, list):
        l1 = [clean(p.get("ProductGroupLevel1")) for p in pgs if isinstance(p, dict)]
        l2 = [clean(p.get("ProductGroupLevel2")) for p in pgs if isinstance(p, dict)]
        ids = [clean(p.get("ProductGroupId")) for p in pgs if isinstance(p, dict)]
        rec["product_groups_count"] = len(pgs)
        rec["product_group_l1_raw"] = "|".join(sorted({x for x in l1 if x})) or None
        rec["product_group_l2_raw"] = "|".join(sorted({x for x in l2 if x})) or None
        rec["product_group_ids_raw"] = "|".join(sorted({x for x in ids if x})) or None
    else:
        rec["product_groups_count"] = 0
        rec["product_group_l1_raw"] = None
        rec["product_group_l2_raw"] = None
        rec["product_group_ids_raw"] = None
    # Query-relative, not a dealer property. Kept only to measure the unit.
    rec["query_distance_raw"] = num(r.get("Distance"))
    rec["probe_label_raw"] = probe_label
    for k, v in flatten({k: v for k, v in r.items() if k not in _HANDLED}).items():
        rec[f"x_{k.replace('.', '_').replace('@', '')}_raw"] = v
    return rec


# ── measurement ──────────────────────────────────────────────────────────────

R_KM, R_MI = 6371.0088, 3958.7613


def haversine(lat1, lng1, lat2, lng2, radius):
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * radius * math.asin(math.sqrt(a))


def measure_radius_unit(records):
    """Is the `radius` param km or miles? MEASURE it, don't read the label.

    The geo route returns a per-row `Distance`. Compare it against the haversine
    from the query centre in both units and report which one fits. The bundle's
    heading key says `distance_km`, but a heading is a label and this is a fact.
    """
    residuals = {"km": [], "mi": []}
    for r in records:
        centre = r.get("_probe_centre")
        d = r.get("query_distance_raw")
        if not centre or d is None or r.get("lat") is None or r.get("lng") is None:
            continue
        for unit, radius in (("km", R_KM), ("mi", R_MI)):
            calc = haversine(centre[0], centre[1], r["lat"], r["lng"], radius)
            residuals[unit].append(abs(calc - d) / max(d, 1e-6))
    out = {}
    for unit, vals in residuals.items():
        out[unit] = {"n": len(vals),
                     "median_relative_error": (
                         round(sorted(vals)[len(vals) // 2], 4) if vals else None)}
    fits = [u for u, v in out.items()
            if v["median_relative_error"] is not None
            and v["median_relative_error"] < 0.02]
    out["verdict"] = (fits[0] if len(fits) == 1 else
                      "UNRESOLVED — neither unit fits within 2%, or both do")
    return out


def code_distribution(records, field):
    """Distribution + a plain verdict on whether the field actually sorts.

    Today's SKF lesson: its bundle published a rich DC001-DC028 decoding table
    while the payload field was a CONSTANT on every row. A decoding table is not
    a code. So this classifies rather than just counting.
    """
    dist = {}
    for r in records:
        v = r.get(field)
        v = "|".join(v) if isinstance(v, list) else ("(null)" if v is None else str(v))
        dist[v] = dist.get(v, 0) + 1
    real = {k: v for k, v in dist.items() if k not in ("(null)", "")}
    if not real:
        verdict = "ABSENT — null/empty on every row; sorts nothing"
    elif len(real) == 1 and len(dist) == 1:
        verdict = (f"CONSTANT — the single value {next(iter(real))!r} on all "
                   f"{len(records)} rows; sorts nothing")
    elif len(real) == 1:
        verdict = (f"NEAR-CONSTANT — one non-null value {next(iter(real))!r}, "
                   f"the rest null; sorts only present-vs-absent")
    else:
        verdict = f"SORTS — {len(real)} distinct non-null values"
    return {"distribution": dict(sorted(dist.items(), key=lambda kv: -kv[1])),
            "distinct_non_null": len(real),
            "sorts": len(real) > 1,
            "verdict": verdict}


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

    Domain is the trustworthy one. Name joins overstated net-new by ~3x on every
    source measured 2026-08-03, because locators publish branch labels
    ("Motion — Houston South") as company names, so a name absent from the list
    usually means a new *label*, not a new *company*.
    """
    have_dom = {(r.get("domain") or "").strip().lower()
                for r in deduped if (r.get("domain") or "").strip()}
    have_name = {norm_company(r.get("company")) for r in deduped}
    have_name.discard("")

    doms = {r["domain"].lower() for r in records if r.get("domain")}
    names = {norm_company(r.get("company")) for r in records}
    names.discard("")
    named_with_dom = {norm_company(r.get("company")) for r in records if r.get("domain")}
    named_with_dom.discard("")
    blind = sorted(names - named_with_dom)

    new_doms = sorted(doms - have_dom)
    new_names = sorted(names - have_name)
    return {
        "records": len(records),
        "records_with_domain": sum(1 for r in records if r.get("domain")),
        "records_without_domain": sum(1 for r in records if not r.get("domain")),
        "distinct_domains": len(doms),
        "distinct_domains_net_new": len(new_doms),
        "distinct_norm_companies": len(names),
        "distinct_norm_companies_net_new": len(new_names),
        "branch_label_inflation_name_over_domain": (
            round(len(names) / len(doms), 2) if doms else None),
        "companies_with_no_website_on_any_branch": len(blind),
        "companies_with_no_website_list": blind[:60],
        "baseline_domains": len(have_dom),
        "baseline_norm_companies": len(have_name),
        "net_new_domains": new_doms,
        "net_new_norm_companies_sample": new_names[:60],
    }


def metro_coverage(deduped, radius_km):
    """What share of the geocoded baseline sits inside the probe circles.

    A measured share of an existing list, not a guess at the national universe.
    Two things it is not: (a) it is not Bosch Rexroth's own geography, and (b)
    deduped-v7 is itself a biased sample — it is what our sources happened to
    find. Both are stated in the report rather than buried here.
    """
    geo = []
    for r in deduped:
        lat, lng = num(r.get("lat")), num(r.get("lng"))
        if lat is not None and lng is not None:
            geo.append((lat, lng))
    inside = sum(1 for lat, lng in geo
                 if any(haversine(lat, lng, mlat, mlng, R_KM) <= radius_km
                        for _, mlat, mlng in METROS))
    return {
        "baseline_rows": len(deduped),
        "baseline_rows_with_latlng": len(geo),
        "radius_km_used": radius_km,
        "baseline_rows_inside_the_probe_circles": inside,
        "share_of_geocoded_baseline": round(inside / len(geo), 5) if geo else None,
        "note": "the three circles OVERLAP at this radius, so this is the share "
                "inside their UNION, and records are deduped by CustomerId "
                "before counting — no double counting on either side.",
    }


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    key = widget_key()
    f = ProbeFetcher(SOURCE, min_bytes=2)
    robots = robots_gate(f)

    deduped = load_deduped()
    print(f"baseline: deduped-v7.csv, {len(deduped)} data rows, domain-keyed")

    probe = {"radius_param": RADIUS, "metros": {}}
    requests_log = []
    raw_rows, records, seen = [], [], {}
    key_union = {}

    # ── 0. the source's own config (limit + declared filter categories) ──────
    cfg, cfg_note = {}, None
    cfg_url = f"{APP_BASE}/config/{CONFIG_LOCALE}.yml"
    try:
        import yaml  # noqa: PLC0415 — only needed for the source's own config
        body, cached = f.get(cfg_url, f"config-{CONFIG_LOCALE}.yml",
                             headers={"Accept": "text/yaml, text/plain, */*"})
        cfg = yaml.safe_load(body) or {}
        requests_log.append({"url": cfg_url, "cached": cached})
    except (Refused, Blocked) as e:
        cfg_note = f"config not readable: {e}"
        print(f"  config: {cfg_note}")
    except Exception as e:  # noqa: BLE001 — a missing parser is not a wall
        cfg_note = f"config not parsed: {e!r}"
        print(f"  config: {cfg_note}")

    settings = (cfg.get("settings") or {}) if isinstance(cfg, dict) else {}
    limit = settings.get("limit") or DEFAULT_LIMIT
    filter_blocks = [x for x in (settings.get("filters") or []) if isinstance(x, dict)]
    declared_filters = [x.get("category") for x in filter_blocks]
    ct_block = next((x for x in filter_blocks if x.get("category") == "contactType"), {})
    # The source's own decode table for the type field, verbatim. This is what
    # turns "DC" from a guess into Bosch's own words.
    ct_decode = {i.get("value"): i.get("label") for i in (ct_block.get("items") or [])
                 if isinstance(i, dict)}
    probe["config"] = {
        "url": cfg_url,
        "limit": limit,
        "limit_source": "settings.limit" if settings.get("limit") else
                        f"app fallback ({DEFAULT_LIMIT}); en-us does not set one",
        "initial_distance": settings.get("initialDistance"),
        "initial_country": settings.get("initialCountry"),
        "declared_filter_categories": declared_filters,
        "contact_type_decode_verbatim": ct_decode,
        "contact_type_filter_hidden_on_the_us_page": ct_block.get("hideFilter"),
        "distance_unit_label": (((cfg.get("localization") or {}).get("filters") or {})
                                .get("distance_unit") if isinstance(cfg, dict) else None),
        "note": cfg_note,
    }
    print(f"config: limit={limit} ({probe['config']['limit_source']}), "
          f"initialDistance={settings.get('initialDistance')}, "
          f"filters={declared_filters}, "
          f"distance_unit label={probe['config']['distance_unit_label']!r}")
    print(f"  ContactType decode, THE SOURCE'S OWN WORDS: {ct_decode}")
    print(f"  contactType filter hidden on the US page: {ct_block.get('hideFilter')}")
    if ct_decode and OWN_CONTACT_TYPE not in ct_decode:
        print(f"  ! WARNING: {OWN_CONTACT_TYPE!r} is no longer in the source's "
              "contactType table — the manufacturer-own flag's first test is stale")

    def ingest(rows, label, url, centre):
        added = 0
        for r in rows:
            if not isinstance(r, dict):
                continue
            for k in r:
                key_union[k] = key_union.get(k, 0) + 1
            ident = r.get("CustomerId") or r.get("Id") or json.dumps(r, sort_keys=True)
            if ident in seen:
                continue
            rec = normalize(r, label, url)
            rec["_probe_centre"] = centre
            seen[ident] = rec
            records.append(rec)
            raw_rows.append(r)
            added += 1
        return added

    # ── 1. the ONE remaining request: the whole US set, if it exists ────────
    # Ordered first on purpose. Nine of the ten budgeted requests are gone, so
    # this run gets one call and it goes to the highest-payoff route: the brief
    # says that if the endpoint hands over the whole US set in one call, take
    # it. `by-country` is the app's own route. If it works it supersedes the
    # three-metro probe entirely; if it fails, the metro calls would have failed
    # the same way — same backend, same shape — so nothing is lost by ordering
    # it here, and a metro that never fires costs nothing.
    country_probe = {}
    for candidate in (COUNTRY_PARAM, "United States"):
        curl = country_url(candidate, COUNTRY_LIMIT)
        try:
            body, cached = api_get(f, curl, f"country-{candidate.replace(' ', '_')}.json",
                                   key)
        except (Refused, EmptyBody) as e:
            code = getattr(e, "code", "200-empty")
            country_probe[candidate] = {"url": curl,
                                        "error": {"status": code, "body": str(e)}}
            print(f"by-country {candidate!r}: refused with {code} — the next "
                  "spelling would be a deliberate variation, not a retry")
            continue
        except BudgetSpent as e:
            country_probe[candidate] = {"url": curl, "skipped": str(e)}
            print(f"by-country {candidate!r}: {e}")
            break
        except Blocked as e:
            country_probe[candidate] = {"url": curl, "error": str(e)}
            print(f"by-country {candidate!r}: BLOCKED {e}")
            break
        rows, shape, envelope = unwrap(body)
        added = ingest(rows, f"country/{candidate}", curl, None)
        country_probe[candidate] = {
            "url": curl, "records": len(rows), "new_ids_this_call": added,
            "response_shape": shape,
            "envelope_scalars": {k: v for k, v in envelope.items()
                                 if not isinstance(v, (list, dict))},
            "limit_requested": COUNTRY_LIMIT,
            "hit_the_limit": len(rows) >= COUNTRY_LIMIT,
        }
        requests_log.append({"url": curl, "cached": cached, "records": len(rows)})
        print(f"by-country {candidate!r}: {len(rows)} records (+{added} new)  "
              f"({'cached' if cached else 'live'})  shape={shape}")
        break
    probe["by_country"] = country_probe

    # ── 2. the three metros — only if the budget survived ───────────────────
    for metro, lat, lng in METROS:
        url = geo_url(lat, lng, limit)
        try:
            body, cached = api_get(f, url, f"geo-{metro}.json", key)
        except BudgetSpent as e:
            probe["metros"][metro] = {"url": url, "skipped": str(e)}
            print(f"geo/{metro}: NOT ASKED — {e}")
            continue
        except Blocked as e:
            probe["metros"][metro] = {"url": url, "error": f"BLOCKED {e}"}
            print(f"BLOCKED {metro}: {e} — source stops, no bypass")
            break
        except Refused as e:
            probe["metros"][metro] = {"url": url, "error": {"status": e.code,
                                                            "body": e.body}}
            print(f"REFUSED {metro}: HTTP {e.code}")
            continue
        except EmptyBody as e:
            probe["metros"][metro] = {"url": url, "error": {"status": "200-empty",
                                                            "body": str(e)}}
            print(f"EMPTY 200 {metro}: {e} — recorded, not retried")
            continue
        rows, shape, envelope = unwrap(body)
        added = ingest(rows, f"geo/{metro}", url, (lat, lng))
        probe["metros"][metro] = {
            "url": url, "records": len(rows), "new_ids_this_call": added,
            "response_shape": shape,
            "envelope_keys": sorted(k for k in envelope if k != "Contacts"),
            "envelope_scalars": {k: v for k, v in envelope.items()
                                 if not isinstance(v, (list, dict))},
            "hit_the_limit": len(rows) >= limit,
        }
        requests_log.append({"url": url, "cached": cached, "records": len(rows)})
        print(f"geo/{metro:<14} r={RADIUS} limit={limit}  {len(rows)} records "
              f"(+{added} new)  ({'cached' if cached else 'live'})  shape={shape}")

    if records:
        keys = sorted(key_union)
        probe["record_key_union_verbatim"] = keys
        print(f"\nRECORD KEY UNION VERBATIM ({len(keys)}): {keys}")
        print("sample record:")
        print(json.dumps(raw_rows[0], indent=1)[:1800])
    else:
        # No payload, so there is nothing to measure and nothing to claim. Write
        # what WAS established — the endpoint, the robots verdict, the credential
        # posture, the source's own ContactType decode, and the exact failures —
        # and stop. A source that produced no rows is a finding, not a gap to
        # paper over with an estimate.
        print("\nNO RECORDS. The endpoint is pinned and the compliance question "
              "is answered, but the backend returned no usable payload.")
        write_raw(SOURCE, {
            "source_name": "Bosch Rexroth Contact Locator",
            "source_url": f"{API}{GEO_ROUTE}",
            "locator_page": PAGE,
            "app_host": APP_HOST,
            "api_host": API_HOST,
            "outcome": "NO DATA — endpoint pinned, robots resolved, credential "
                       "posture cleared, but every data call answered HTTP 500. "
                       "See `probe` for each request and its exact status.",
            "failure": {
                "status": 500,
                "body_verbatim": "Error fetching contacts: Request failed with "
                                 "status code 500",
                "reading": "An axios error string, i.e. produced by a layer that "
                           "was itself calling something else and got a 500 "
                           "back. The gateway routed the request; the tier "
                           "behind it failed.",
                "ruled_out_by_evidence": [
                    "wrong route — an unknown route on this APIM answers 404 "
                    "with {\"statusCode\":404,\"message\":\"Resource not "
                    "found\"}, which is what /robots.txt returned",
                    "credential wall — 401/403 never appeared; a bad APIM "
                    "subscription key answers 401, not 500",
                    "robots — the governing origin publishes no robots.txt",
                    "missing filter params — the final call carried the "
                    "source's COMPLETE filter id space (productGroups 1-32, "
                    "contactCategories 1-5) and still 500'd",
                    "wrong country spelling — a bad filter value yields an "
                    "empty list, and APIM validates params to 400, not 500",
                ],
                "most_likely_reading": "the app host is labelled `-dev`; a "
                    "dev-labelled deployment's data tier being down is the "
                    "simplest explanation that fits a wrapped upstream 500. "
                    "Stated as a reading, not a fact.",
                "persistence": "six attempts across two runs and ~230s of "
                               "backoff, same 500 every time. Not transient "
                               "over minutes — which is NOT the same as "
                               "permanent, and this probe does not resolve it.",
                "empty_200_note": "Before the Origin was corrected, the same "
                    "route answered HTTP 200 with a ZERO-BYTE body — Azure API "
                    "Management terminating a request whose Origin it did not "
                    "recognise. The locator is a micro-frontend embedded in "
                    "www.boschrexroth.com, so a real anonymous visitor's "
                    "browser sends that page as the Origin; sending the app "
                    "host instead was our inaccuracy. Cost 1 request, and is "
                    "what turned a silent empty body into a legible 500.",
            },
            "unverified": [
                "the record shape beyond the field names the UI destructures",
                "whether the payload carries city / state / postal code / "
                "country at all, and therefore whether is_us is derivable "
                "without inference",
                "website, phone and email fill rates",
                "how many rows are Bosch's own locations",
                "net-new against deduped-v7 on either axis",
                "whether ContactType and ProductGroups actually sort on real "
                "rows (the decode table is published; a decode table is not a "
                "code — see the SKF DC001-DC028 lesson)",
            ],
            "decision_rule_status": "BOTH LEGS UNRESOLVED. Leg 1 (>=150 "
                "projected net-new) cannot be computed without rows. Leg 2 is "
                "PROMISING but unproven: the source publishes a tier code "
                "(ContactType, decoded by Bosch itself as DC=Bosch Rexroth "
                "locations / CE=Certified Partners / DW=Non-certified "
                "Partners) AND a per-record line card (ProductGroups[] with "
                "Level1/Level2), which is more than most sources in this "
                "program offer — but neither has been seen on a real row.",
            "robots": robots,
            "probe": probe,
            "requests": requests_log,
            "refused_urls": f.refused,
            "origin_requests": f.origin_requests,
            "origin_request_budget": MAX_ORIGIN_REQUESTS,
            "origin_requests_prior_to_this_run": PRIOR_ORIGIN_REQUESTS,
            "origin_requests_prior_note": PRIOR_NOTE,
        }, [])
        return

    # ── 3. the radius unit, measured ────────────────────────────────────────
    unit = measure_radius_unit([r for r in records if r.get("_probe_centre")])
    probe["radius_unit_measured"] = unit
    print(f"\nradius unit, MEASURED from the payload's own Distance: {unit['verdict']}"
          f"  (km err {unit['km']['median_relative_error']}, "
          f"mi err {unit['mi']['median_relative_error']})")
    radius_km = RADIUS if unit["verdict"] == "km" else (
        RADIUS * 1.609344 if unit["verdict"] == "mi" else RADIUS)

    for r in records:
        r.pop("_probe_centre", None)

    # ── 4. the landmine: Bosch's own locations ──────────────────────────────
    own = [r for r in records if r["manufacturer_own_record"]]
    us_all = [r for r in records if r.get("is_us")]
    dealers = [r for r in us_all if not r["manufacturer_own_record"]]
    crosstab = {}
    for r in records:
        ct = r.get("contact_type_raw") or "(null)"
        b = crosstab.setdefault(ct, {"bosch_own": 0, "dealer": 0})
        b["bosch_own" if r["manufacturer_own_record"] else "dealer"] += 1
    clean_proxy = sorted(ct for ct, b in crosstab.items()
                         if b["bosch_own"] and not b["dealer"])
    # Where the source's own label and the row's own identity disagree. Either
    # direction is worth seeing: a DC row that looks like a dealer, or a
    # Bosch-named row the source did not label DC.
    agreement = {
        "own_by_contact_type": sum(1 for r in records if r["own_by_contact_type"]),
        "own_by_domain": sum(1 for r in records if r["own_by_domain"]),
        "own_by_name": sum(1 for r in records if r["own_by_name"]),
        "union_flagged": len(own),
        "labelled_DC_but_identity_says_dealer": sorted(
            {r["company"] for r in records if r["own_by_contact_type"]
             and not (r["own_by_domain"] or r["own_by_name"]) and r["company"]})[:40],
        "identity_says_bosch_but_not_labelled_DC": sorted(
            {r["company"] for r in records if not r["own_by_contact_type"]
             and (r["own_by_domain"] or r["own_by_name"]) and r["company"]})[:40],
    }
    print(f"\nBosch's OWN locations flagged: {len(own)} of {len(records)} records "
          f"(kept, never deleted; excluded from every dealer count below)")
    print(f"  by ContactType=={OWN_CONTACT_TYPE}: {agreement['own_by_contact_type']}"
          f" · by domain: {agreement['own_by_domain']}"
          f" · by name: {agreement['own_by_name']}")
    print(f"ContactType x manufacturer_own crosstab: {crosstab}")
    print(f"ContactType values that are a CLEAN proxy for Bosch's own rows: "
          f"{clean_proxy or 'NONE'}")
    if agreement["identity_says_bosch_but_not_labelled_DC"]:
        print("  ! rows whose identity says Bosch but the source did NOT label DC: "
              f"{agreement['identity_says_bosch_but_not_labelled_DC']}")

    # ── 5. the codes, and whether each ACTUALLY sorts ───────────────────────
    code_fields = ("contact_type_raw", "country_raw", "is_hubspot_partner_raw",
                   "product_group_l1_raw", "product_group_l2_raw",
                   "product_group_ids_raw", "product_groups_count")
    x_fields = tuple(sorted({k for r in records for k in r
                             if k.startswith("x_") and k.endswith("_raw")}))
    code_axis = {fld: code_distribution(dealers, fld)
                 for fld in code_fields + x_fields}
    print("\n── §5i code axis, measured on DEALER rows only ──")
    for fld, res in code_axis.items():
        print(f"  {fld:<34} {res['verdict']}")

    line_card = code_axis["product_group_l1_raw"]["sorts"]
    tier_code = code_axis["contact_type_raw"]["sorts"]

    # ── 6. net-new, both axes, domain first ─────────────────────────────────
    measure = net_new(dealers, deduped)
    measure_incl_own = net_new(us_all, deduped)
    coverage = metro_coverage(deduped, radius_km)
    share = coverage["share_of_geocoded_baseline"]

    got_whole_us = any(v.get("records") and not v.get("hit_the_limit")
                       for v in country_probe.values() if isinstance(v, dict))
    projection = {
        "method": ("MEASURED-BASELINE-SHARE. Count what share of the GEOCODED "
                   "deduped-v7 rows fall inside the union of the probe circles, "
                   "then divide the observed net-new by that share. The "
                   "denominator is a measured share of an existing list, not an "
                   "estimate of the national universe."),
        "observed_net_new_domains": measure["distinct_domains_net_new"],
        "baseline_share_inside_the_circles": share,
        "arithmetic": (
            f"{measure['distinct_domains_net_new']} net-new domains / {share} "
            f"share = {measure['distinct_domains_net_new'] / share:.0f}"
            if share else "share is 0 — cannot project"),
        "projected_national_net_new_domains": (
            round(measure["distinct_domains_net_new"] / share) if share else None),
        "name_axis_projection_for_contrast": (
            round(measure["distinct_norm_companies_net_new"] / share)
            if share else None),
        "superseded_by_a_census": got_whole_us,
        "this_is_a_floor_not_a_point_estimate": (
            f"{measure['companies_with_no_website_on_any_branch']} of the "
            f"{measure['distinct_norm_companies']} distinct dealer names in the "
            "probe carry no website on any row, so they cannot be domain-joined "
            "in either direction and are invisible to this axis. The true figure "
            "sits at or above the domain projection and at or below the name "
            "projection; this probe does not resolve where."),
        "sensitivity": {
            "share_at_which_leg_1_would_pass": (
                round(measure["distinct_domains_net_new"] / 150, 4)),
            "reading": (
                f"leg 1 needs >=150. At {measure['distinct_domains_net_new']} "
                "observed net-new domains, that requires the probe circles to "
                "cover <="
                f"{measure['distinct_domains_net_new'] / 150 * 100:.1f}% of US "
                f"industrial distribution; they measurably cover "
                f"{(share or 0) * 100:.1f}% of the geocoded baseline."),
        },
        "assumptions_that_could_be_wrong": [
            "Bosch Rexroth's partner density is assumed to track deduped-v7's "
            "geography. Bosch Rexroth is hydraulics / linear motion / drives; if "
            "its network is thicker or thinner in the Gulf and the Rust Belt "
            "than our list is, the projection is wrong in that direction.",
            f"{coverage['baseline_rows'] - coverage['baseline_rows_with_latlng']} "
            "baseline rows have no lat/lng and are excluded from the denominator.",
            "Website fill on the probe caps how much net-new is even measurable.",
            "A `limit` cap the response hits silently truncates the answer; "
            "`probe.metros.*.hit_the_limit` says whether it did.",
        ],
    }

    verdict = {
        "rule": "a full national sweep requires >=150 projected net-new companies "
                "AND (a tier code OR a per-record line card)",
        "leg_1_projected_net_new_ge_150": (
            (projection["projected_national_net_new_domains"] or 0) >= 150),
        "leg_2_tier_code_or_line_card": bool(tier_code or line_card),
        "leg_2_detail": {
            "tier_code_contact_type": code_axis["contact_type_raw"]["verdict"],
            "per_record_line_card_product_groups":
                code_axis["product_group_l1_raw"]["verdict"],
        },
    }
    verdict["clears_both_legs"] = bool(verdict["leg_1_projected_net_new_ge_150"]
                                       and verdict["leg_2_tier_code_or_line_card"])

    stats = report(SOURCE, records, code_fields=code_fields)
    stats["dealers_only"] = measure
    stats["us_records_including_bosch_own"] = measure_incl_own
    stats["manufacturer_own_rows"] = len(own)
    stats["manufacturer_own_companies"] = sorted(
        {r["company"] for r in own if r["company"]})
    stats["contact_type_x_manufacturer_own"] = crosstab
    stats["contact_type_values_that_are_a_clean_proxy"] = clean_proxy
    stats["contact_type_decode_verbatim"] = probe["config"]["contact_type_decode_verbatim"]
    stats["manufacturer_own_test_agreement"] = agreement
    stats["us_dealer_records_excl_manufacturer"] = len(dealers)
    stats["us_dealer_companies_excl_manufacturer"] = measure["distinct_norm_companies"]
    stats["pct_website_dealers"] = round(
        100 * measure["records_with_domain"] / max(len(dealers), 1), 1)
    stats["pct_phone_dealers"] = round(
        100 * sum(1 for r in dealers if r.get("phone_raw")) / max(len(dealers), 1), 1)
    stats["pct_email_dealers"] = round(
        100 * sum(1 for r in dealers if r.get("email")) / max(len(dealers), 1), 1)
    stats["baseline_coverage"] = coverage
    stats["projection"] = projection
    stats["verdict"] = verdict
    stats["code_axis"] = code_axis
    stats["radius_unit_measured"] = unit

    print("\n── net-new vs emails/lists/deduped-v7.csv (DEALERS ONLY) ────────")
    print(f"US dealer records:            {len(dealers)}")
    print(f"  WEBSITE FILL:               {stats['pct_website_dealers']}%")
    print(f"  phone fill:                 {stats['pct_phone_dealers']}%")
    print(f"  email fill:                 {stats['pct_email_dealers']}%")
    print(f"  distinct domains:           {measure['distinct_domains']}")
    print(f"  NET-NEW BY DOMAIN:          {measure['distinct_domains_net_new']}")
    print(f"  distinct norm_company:      {measure['distinct_norm_companies']}")
    print(f"  net-new by norm_company:    "
          f"{measure['distinct_norm_companies_net_new']}  (inflated axis)")
    print(f"  name/domain inflation:      "
          f"{measure['branch_label_inflation_name_over_domain']}x")
    print(f"baseline inside the circles:  "
          f"{coverage['baseline_rows_inside_the_probe_circles']} of "
          f"{coverage['baseline_rows_with_latlng']} geocoded = {share}")
    print(f"projection: {projection['arithmetic']}")
    print(f"\nVERDICT  leg1 (>=150 projected net-new): "
          f"{verdict['leg_1_projected_net_new_ge_150']}")
    print(f"         leg2 (tier code or line card):  "
          f"{verdict['leg_2_tier_code_or_line_card']}")
    print(f"         CLEARS BOTH LEGS:               {verdict['clears_both_legs']}")
    print(f"\norigin requests this script: {f.origin_requests} of "
          f"{MAX_ORIGIN_REQUESTS} (+{PRIOR_ORIGIN_REQUESTS} prior: {PRIOR_NOTE})")

    write_raw(SOURCE, {
        "source_name": "Bosch Rexroth Contact Locator",
        "source_url": f"{API}{GEO_ROUTE}",
        "locator_page": PAGE,
        "app_host": APP_HOST,
        "api_host": API_HOST,
        "method": ("THREE-METRO PROBE, NOT A SWEEP. The page shell mounts a "
                   "micro-frontend hosted on an Azure Container App; that app's "
                   "index.js declares one API client on "
                   f"{API} with routes {GEO_ROUTE}, {COUNTRY_ROUTE} and "
                   "/api/v1/filter/{category}. Params are exactly the ones the "
                   "bundle's own builders emit: latitude, longitude, limit, "
                   f"radius, offset. radius={RADIUS} is the maximum the app's "
                   "own slider offers (min 10, max 1000, step 5) and the value "
                   "the app itself uses for a ?country= deep link; the UNIT is "
                   "measured from the payload's own Distance, not read off the "
                   "label. limit comes from the source's own en-us config. A "
                   "national sweep is a separate change gated on this probe's "
                   f"verdict and is enforced by MAX_ORIGIN_REQUESTS="
                   f"{MAX_ORIGIN_REQUESTS}."),
        "robots": robots,
        "robots_verdict_short": (
            "The dealer data is served by apim-dcslx.azure-api.net, so under RFC "
            "9309 that origin's robots.txt governs — NOT www.boschrexroth.com's, "
            "whose `Disallow: /api/` applies to its own origin only and is never "
            "hit by this source. See `robots` for each host's file, the rules "
            "quoted verbatim, and the longest-match computation done at run time."),
        "credential_note": (
            "One header: an Azure API Management subscription key inlined in the "
            "anonymous page's public JS bundle. No login, no session, no "
            "per-user issuance — the Banjo/Banner/Festo shape, not the Bimba "
            "shape. Read out of the cached bundle at run time so the value never "
            "lands in this repo. /api/dxf/token belongs to a DIFFERENT "
            "micro-frontend (the DXF download service); the contact-locator "
            "mount carries include-access-token=\"false\" and this source never "
            "calls it, so there is no gate question."),
        "stability_caveat": (
            "The app host is labelled `-dev` "
            "(contact-locator-nextapp-DEV.bluebeach-...). A production page "
            "embedding a vendor's dev-labelled deployment can disappear without "
            "notice. Stability risk, not a compliance one."),
        "manufacturer_own_records": (
            "Bosch Rexroth seats its own locations in its own partner list, and "
            "the app hides them CLIENT-SIDE: it pulls every ContactType from the "
            "API and filters `Pe.Contacts.filter(kt => Ke.includes(kt.ContactType"
            ".toUpperCase()))` in the browser. A direct API call therefore gets "
            "them by construction. Flagged `manufacturer_own_record` and kept "
            "(never deleted), excluded from every dealer count. The flag is "
            "derived from the record (Bosch-family apex domain, or a company "
            "name matching bosch|rexroth), NOT from ContactType — see "
            "stats.contact_type_x_manufacturer_own for whether a ContactType "
            "value turns out to be a clean proxy."),
        "codes_captured_verbatim": list(code_fields) + list(x_fields) + [
            "customer_id_raw", "probe_label_raw"],
        "code_axis_note": (
            "Every code is MEASURED, not just captured. SKF published a rich "
            "DC001-DC028 decoding table today while the payload field was a "
            "constant on every row — a decoding table is not a code. "
            "stats.code_axis gives each field's distribution and says plainly "
            "whether it sorts."),
        "query_relative_fields": (
            "`Distance` is a property of OUR query, not of the dealer. Carried "
            "as query_distance_raw and used only to measure the radius unit; it "
            "is not a source-native code."),
        "measurement": (
            f"Net-new measured against emails/lists/deduped-v7.csv "
            f"({DEDUPED_EXPECTED_ROWS} data rows, asserted at load). Reported on "
            "two axes and never averaged: DOMAIN is the trustworthy one; "
            "norm_company sits beside it because name joins overstated net-new "
            "by ~3x on every source measured 2026-08-03."),
        "probe": probe,
        "requests": requests_log,
        "origin_requests": f.origin_requests,
        "origin_request_budget": MAX_ORIGIN_REQUESTS,
        "origin_requests_prior_to_this_script": PRIOR_ORIGIN_REQUESTS,
        "origin_requests_prior_note": PRIOR_NOTE,
        "origin_requests_cold": len([n for n in os.listdir(f.cache)
                                     if n != "_refused.json"]),
        "refused_urls": f.refused,
        "stats": stats,
    }, records)

    print(json.dumps({"verdict": verdict,
                      "projection": {k: projection[k] for k in
                                     ("arithmetic",
                                      "projected_national_net_new_domains",
                                      "superseded_by_a_census")}}, indent=1))


if __name__ == "__main__":
    main()
