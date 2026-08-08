#!/usr/bin/env python3
"""S1 wave-3 — Festo distributor locator (headless SPA, OData API).

**How the route was found (no re-fetch).** `distributorlocator.festo.com` is a
React SPA whose HTML shell is 1.6 KB and contains nothing but `<div id="root">`.
Its bundle was already cached at `data/raw/_cache/e4bundle-festo/bundle-0.js`
and is read **from disk**. It declares one axios client:

    baseURL "https://api.festo.com/it/apps/locators/v1"

with three routes: `locations` (OData collection), `locations/{id}` (detail),
`sastoken` (Azure Maps). The query builder in the bundle emits only OData
system params — `$filter`, `$orderby`, `$top`, `$skip`, `$count`, `$select` —
and the only three `$filter` clauses the UI can produce are

    services/any(s: s eq '<id>')
    geo.distance(geolocation, geography'POINT(<lng> <lat>)') le <radius_km>
    automation eq true      |      didactic eq true

`salespartner` in the bundle is **not** an API value: it is the i18n label
("Sales Partner") over the Automation/Didactic toggle. The store behind the
route is Azure AI Search (`@odata.count`, `$top` capped at 1000).

**Credential boundary.** The bundle publishes a static `Authorization` header
value to every anonymous visitor — no login, no session, no per-user issuance.
Under the standing rule that is a public widget identifier, not a credential, so
it is used; a value the anonymous page did *not* publish would have stopped the
source (the rule that keeps us off Bimba's keyed Bullseye API). The value is
**read out of the cached bundle at run time on purpose** so it never lands in
this file, in git, or in any output. If the origin ever answers 401/403 the
`Blocked` path fires and the source stops — no retry, no rotation.

**robots.** `https://api.festo.com/robots.txt` → HTTP 404: the API host
publishes no robots.txt at all, so there is no stated crawl preference and no
override is involved. `https://distributorlocator.festo.com/robots.txt` is
**byte-identical to the locator page shell** (md5 8c2d22a7…, cached) — the SPA
serves its index for every unknown path, so that host publishes no robots file
either. Nothing is disallowed because nothing is stated. Pacing still applies:
one worker, >=3s/host, every response cached so re-runs make zero requests.

⚠ §5i SOURCE-NATIVE CODES, captured verbatim and uninterpreted: `type`,
`group`, `structure`, `mainOffice`, `automation` / `didactic` (the two partner
programmes behind the "Sales Partner" toggle), `services[]` (Festo's own
competence taxonomy, ids like `a-1-1`), plus a catch-all for every other
payload scalar. Four of these are not visible in the bundle at all — they only
appear in the response — which is why the shape probe runs before the sweep.
Three prior sources (Timken, DataForSEO, Yaskawa) proved manufacturer locators
encode vertical in their own codes — Yaskawa's `groupList` alone made 29.7% of
its companies wrong-vertical — so nothing here is mapped, averaged over, or
seated on.

⚠ NO STATE FROM THIS SOURCE. `address.stateProvince` is present on the entity
and **null on 100% of rows**. `state` is therefore emitted as null rather than
reverse-derived from the ZIP or the city string; S2 owns that enrichment.
"""
import json
import os
import re
import sys
import urllib.parse

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402

_polite.CAPTURED = "2026-08-03"

from _polite import (RAW, US_STATES, Blocked, Fetcher, apex,  # noqa: E402
                     digits, report, write_raw)

CAPTURED = _polite.CAPTURED

SOURCE = "festo"
API = "https://api.festo.com/it/apps/locators/v1"
COLLECTION = "locations"
PAGE = "https://distributorlocator.festo.com/?locale=us-en"
BUNDLE = os.path.join(RAW, "_cache", "e4bundle-festo", "bundle-0.js")

# Azure AI Search hard-caps $top at 1000; the SPA itself pages 0 then 1000.
PAGE_SIZE = 1000

# Three-metro probe. ZIP centroids for the metros named in the brief; the
# radius is 320 km == the 200 mi maximum the locator's own radius control
# offers a US visitor (the UI passes km even in imperial locales).
METROS = [
    ("houston-tx-77002", 29.7561, -95.3648),
    ("chicago-il-60601", 41.8858, -87.6229),
    ("cleveland-oh-44113", 41.4841, -81.7027),
]
PROBE_RADIUS_KM = 320

# `address.country` is ISO-3166-1 alpha-2, LOWERCASE, in the payload ("us",
# "ca", "de"). Azure AI Search string filters are case-sensitive, so the
# literals below are lowercase on purpose.
US_COUNTRY = "us"
# US territories carry their own ISO codes and would fall outside `eq 'us'`.
# One count-only request closes that coverage question with a measured number
# instead of an assumption.
US_TERRITORIES = ("pr", "vi", "gu", "as", "mp")


def widget_token():
    """The static header value the SPA hands every anonymous visitor.

    Read from the already-cached bundle at run time, deliberately: the value is
    never written into this file, the raw JSON, or any report.
    """
    with open(BUNDLE, encoding="utf-8", errors="ignore") as fh:
        js = fh.read()
    m = re.search(r'baseURL:"' + re.escape(API) + r'".{0,300}?Authorization:"([^"]+)"',
                  js)
    if not m:
        raise SystemExit(f"no widget identifier in {BUNDLE} — bundle changed, stop")
    return m.group(1)


def qs(**params):
    """OData query string. Spaces must be %20, not '+', for Azure AI Search."""
    parts = [(k.replace("_", "$", 1), v) for k, v in params.items() if v is not None]
    return "?" + urllib.parse.urlencode(parts, quote_via=urllib.parse.quote,
                                        safe="(),'/:")


def geo_filter(lat, lng, radius_km):
    return (f"geo.distance(geolocation, geography'POINT({lng} {lat})') "
            f"le {radius_km}")


def get(f, token, query, cache_name):
    return f.json(f"{API}/{COLLECTION}{query}", cache_name, headers={
        "Authorization": token,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Origin": "https://distributorlocator.festo.com",
        "Referer": PAGE,
    })


# ── normalisation ────────────────────────────────────────────────────────────

# Some feeds put "Houston, TX" or "TX" in a region-ish field; only a bare,
# real 2-letter USPS code is accepted, never a guess from the city string.
def usps(value):
    v = (value or "").strip().upper()
    return v if v in US_STATES else None


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


# Handled explicitly below; `@search.score` is a property of *our* query, not of
# the dealer, so it is not carried as a source-native code.
_HANDLED = {"@search.score", "company", "address", "geolocation", "crd", "phone",
            "mail", "website", "fax", "id", "type", "group", "structure",
            "mainOffice", "automation", "didactic", "services"}


def normalize(r, source_url):
    addr = r.get("address") or {}
    street = " ".join(str(x).strip() for x in
                      (addr.get("streetName"), addr.get("streetNumber")) if x)
    geo = (r.get("geolocation") or {}).get("coordinates") or r.get("crd") or []
    lng, lat = (list(geo) + [None, None])[:2]

    country = addr.get("country")
    country = str(country).strip().lower() or None if country else None

    rec = {
        "company": (r.get("company") or "").strip() or None,
        "address_1": street or None,
        "address_2": (addr.get("additional") or "").strip() or None,
        "city": (addr.get("city") or "").strip() or None,
        # `stateProvince` is null on 100% of rows. Emitted as-is, never
        # reverse-derived from the ZIP — that would be an inference.
        "state": usps(addr.get("stateProvince")),
        "zip_raw": (str(addr.get("postalCode")).strip()
                    if addr.get("postalCode") not in (None, "") else None),
        "phone_raw": (r.get("phone") or "").strip() or None,
        "phone_10": digits(r.get("phone")),
        "email": (r.get("mail") or "").strip() or None,
        "website": (r.get("website") or "").strip() or None,
        "domain": apex(r.get("website")),
        "lat": lat,
        "lng": lng,
        # is_us comes from the country the API returns. Never inferred.
        "is_us": country == US_COUNTRY if country else None,
        "source": SOURCE,
        "source_url": source_url,
        "captured": CAPTURED,
    }
    # ── §5i: every source-native code, VERBATIM AND UNINTERPRETED ────────────
    rec["country_raw"] = country
    rec["type_raw"] = r.get("type")
    rec["group_raw"] = r.get("group")
    rec["structure_raw"] = r.get("structure")
    rec["main_office_raw"] = r.get("mainOffice")
    rec["automation_raw"] = r.get("automation")
    rec["didactic_raw"] = r.get("didactic")
    rec["services_raw"] = "|".join(r.get("services") or []) or None
    rec["fax_raw"] = (r.get("fax") or "").strip() or None
    rec["festo_id_raw"] = r.get("id")
    for k, v in flatten({k: v for k, v in r.items()
                         if k not in _HANDLED}).items():
        rec[f"x_{k.replace('.', '_')}_raw"] = v
    return rec


# ── phases ───────────────────────────────────────────────────────────────────

def probe(f, token):
    """Shape probe + three-metro geo probe. Prints; changes nothing."""
    findings = {}

    body, cached = get(f, token, qs(_top=1, _count="true"), "probe-shape.json")
    total = body.get("@odata.count")
    sample = (body.get("value") or [{}])[0]
    findings["global_count"] = total
    findings["entity_keys"] = sorted(sample.keys())
    findings["address_keys"] = sorted((sample.get("address") or {}).keys())
    print(f"\n── shape probe ({'cached' if cached else 'live'}) ──")
    print(f"worldwide @odata.count : {total}")
    print(f"entity keys            : {findings['entity_keys']}")
    print(f"address keys           : {findings['address_keys']}")
    print("sample record          :")
    print(json.dumps(sample, indent=1)[:2000])

    findings["metros"] = {}
    for name, lat, lng in METROS:
        q = qs(_filter=geo_filter(lat, lng, PROBE_RADIUS_KM),
               _top=PAGE_SIZE, _count="true")
        body, cached = get(f, token, q, f"probe-{name}.json")
        rows = body.get("value") or []
        findings["metros"][name] = {
            "count": body.get("@odata.count"),
            "returned": len(rows),
            "radius_km": PROBE_RADIUS_KM,
            "center": [lng, lat],
        }
        print(f"{name:>20} r={PROBE_RADIUS_KM}km  count={body.get('@odata.count')} "
              f"returned={len(rows)}  ({'cached' if cached else 'live'})")
    print(f"\norigin requests so far: {f.origin_requests}")
    return findings


def sweep(f, token, odata_filter, label):
    """Page a filtered collection to exhaustion. Returns (rows, urls)."""
    rows, urls, skip = [], [], 0
    while True:
        q = qs(_filter=odata_filter, _top=PAGE_SIZE, _skip=skip or None,
               _count="true" if skip == 0 else None)
        body, cached = get(f, token, q, f"{label}-{skip}.json")
        page = body.get("value") or []
        if skip == 0:
            print(f"{label}: @odata.count={body.get('@odata.count')}")
        print(f"  skip={skip} -> {len(page)} rows ({'cached' if cached else 'live'})")
        urls.append(f"{API}/{COLLECTION}{q}")
        rows.extend(page)
        if len(page) < PAGE_SIZE:
            break
        skip += PAGE_SIZE
    return rows, urls


def main():
    only_probe = "--probe" in sys.argv
    f = Fetcher(SOURCE, min_bytes=20)
    token = widget_token()

    try:
        findings = probe(f, token)
    except Blocked as e:
        print(f"BLOCKED: {e}")
        write_raw(SOURCE, {"source_url": f"{API}/{COLLECTION}", "blocked": str(e)}, [])
        return
    if only_probe:
        print("\n--probe: stopping before any wider sweep, as instructed.")
        return

    # US coverage. The entity carries `address.country`, so ask the API for it
    # rather than inferring US from a ZIP, a bounding box or a phone area code.
    if "country" not in findings["address_keys"]:
        raise SystemExit(
            "no country field on the entity — a country-scoped call is not "
            "possible and is_us cannot be set without inference. Stopping; "
            "run with --probe and report the geo-probe numbers instead.")

    odata_filter = f"address/country eq '{US_COUNTRY}'"
    rows, urls = sweep(f, token, odata_filter, "us")

    # One count-only request so "US territories aren't in here" is a measured
    # number rather than an assumption.
    terr_filter = " or ".join(f"address/country eq '{c}'" for c in US_TERRITORIES)
    terr, _ = get(f, token, qs(_filter=terr_filter, _top=0, _count="true"),
                  "us-territories-count.json")
    terr_count = terr.get("@odata.count")
    print(f"US territories ({'/'.join(US_TERRITORIES)}): {terr_count} locations")

    seen, records = set(), []
    for r in rows:
        if r.get("id") in seen:
            continue
        seen.add(r.get("id"))
        records.append(normalize(r, urls[0]))

    code_fields = ("type_raw", "group_raw", "structure_raw", "main_office_raw",
                   "automation_raw", "didactic_raw", "services_raw", "country_raw")
    stats = report(SOURCE, records, code_fields=code_fields)
    stats["worldwide_locations"] = findings["global_count"]
    stats["us_territory_locations"] = terr_count
    write_raw(SOURCE, {
        "source_name": "Festo Distributor Locator (salespartner/locations API)",
        "source_url": f"{API}/{COLLECTION}{qs(_filter=odata_filter, _top=PAGE_SIZE)}",
        "locator_page": PAGE,
        "method": "The locator is a React SPA; its cached bundle names one axios "
                  "client on https://api.festo.com/it/apps/locators/v1 with an "
                  "OData `locations` collection ($filter/$orderby/$top/$skip/"
                  "$count/$select). Paged $top=1000 with a single "
                  f"`{odata_filter}` filter. A static Authorization value the "
                  "SPA publishes to every anonymous visitor is read out of the "
                  "cached bundle at run time and is never written to disk.",
        "robots_check": "api.festo.com serves HTTP 404 for /robots.txt — the API "
                        "host publishes no robots.txt at all, so there is no "
                        "stated crawl preference and no override is involved. "
                        "distributorlocator.festo.com/robots.txt is "
                        "byte-identical to the locator page shell (SPA index "
                        "fallback, md5 8c2d22a78534a0bb424c2195cfa7c13b) — that "
                        "host publishes no robots file either, so it states no "
                        "rule to quote and disallows nothing. Pacing applied "
                        "regardless: single worker, >=3s/host, disk cache.",
        "credential_note": "Static Authorization header published in the public "
                           "JS bundle to every anonymous visitor; treated as a "
                           "public widget identifier, value never recorded.",
        "codes_captured_verbatim": list(code_fields) + [
            "fax_raw", "festo_id_raw", "x_*_raw (every other payload scalar)"],
        "vertical_code": "automation_raw / didactic_raw are Festo's two partner "
                         "programmes (the 'Sales Partner' toggle); services_raw "
                         "is Festo's own competence taxonomy (ids like a-1-1); "
                         "type_raw is the partner grade; group_raw is the parent "
                         "banner a branch rolls up to; structure_raw and "
                         "main_office_raw describe the branch's place in it. "
                         "Captured verbatim, unmapped, untested — do not seat on "
                         "them until they are shown to sort.",
        "state_note": "address.stateProvince exists on the entity and is null on "
                      "100% of rows; `state` is emitted null, never derived from "
                      "the ZIP. S2 owns that enrichment.",
        "probe": findings,
        # `origin_requests` is this run only — the disk cache makes a re-run 0.
        # `origin_requests_cold` is one per cached response, i.e. every request
        # this source has ever made to the origin.
        "origin_requests": f.origin_requests,
        "origin_requests_cold": len(os.listdir(f.cache)),
        "stats": stats,
    }, records)


if __name__ == "__main__":
    main()
