#!/usr/bin/env python3
"""S1 wave-3 — Kennametal distributor finder.

**Sanctioned-export note (research/01 §9: "sanctioned exports first").**
The page's "Export the List" button does NOT hit a server export route. Reading
`distributor-finder-map-common.min.js`: `exportToCSVListener` builds the CSV
**client-side** from `distributorFinderMap.distributors`, which is exactly the
payload of

    GET /ws/v2/kmt/find-distributors?county=&stateOrProvince=&country=US

So the sanctioned export and this endpoint are the same data; calling the
endpoint once *is* the export, minus the browser. Terms checked before use:
`/us/en/about-us/terms-and-conditions.html` is Kennametal's General Terms and
Conditions **of Sale** — a purchase contract. It contains no site-use, crawling
or data-reuse clause. No other terms-of-use page is linked from the locator.
robots.txt blocks named SEO crawlers (AhrefsBot, MJ12bot, dotbot …) and is not
an automatic exclusion under Artur's 2026-08-01 override.

⚠ §5e VERTICAL CODE: `industries[]`. Measured on this pull —
metalworking 221 · road rehabilitation 77 · grader blades 68 · snowplow blades 56
· trenching/foundation drilling 26 · waterjet 6 · underground mining 3. Only the
metalworking slice is the industrial-MRO ICP; the blade/road lines are
construction and municipal fleet. Captured verbatim, never averaged over.
"""
import re
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _polite import (CAPTURED, US_STATES, Blocked, Fetcher, apex,  # noqa: E402
                     digits, report, write_raw)

SOURCE = "kennametal"
BASESITE = "kmt"  # from <div class="sap-commerce-config" data-basesite="kmt">
ENDPOINT = (f"https://www.kennametal.com/ws/v2/{BASESITE}/find-distributors"
            "?county=&stateOrProvince=&country=US")
PAGE = "https://www.kennametal.com/us/en/resources/find-a-distributor.html"

# "SPANAWAY, Washington 98387"
POSTAL_RE = re.compile(r"^(?P<city>.*?),\s*(?P<state>[A-Za-z .]+?)\s+(?P<zip>\d{5})")

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
    "puerto rico": "PR",
}


def main():
    f = Fetcher(SOURCE, min_bytes=1000)
    try:
        data, cached = f.json(ENDPOINT, "find-distributors-us.json",
                              headers={"Referer": PAGE, "Accept": "application/json"})
    except Blocked as e:
        print(f"BLOCKED: {e}")
        write_raw(SOURCE, {"source_url": ENDPOINT, "blocked": str(e)}, [])
        return

    rows = data.get("distributors") or []
    print(f"fetched {len(rows)} records ({'cached' if cached else 'live'})")

    records = []
    for r in rows:
        line = (r.get("countryPostalLine") or "").strip()
        m = POSTAL_RE.match(line)
        state = zip5 = city = None
        if m:
            city = m.group("city").strip() or None
            raw_state = m.group("state").strip()
            state = (raw_state.upper() if raw_state.upper() in US_STATES
                     else STATE_ABBR.get(raw_state.lower()))
            zip5 = m.group("zip")
        records.append({
            "company": (r.get("name") or "").strip() or None,
            "address_1": (r.get("addressLine1") or "").strip() or None,
            "address_2": (r.get("addressLine2") or "").strip() or None,
            "country_postal_line": line or None,
            "city": city,
            "state": state,
            "zip_raw": zip5,
            "phone_raw": (r.get("phone") or "").strip() or None,
            "phone_10": digits(r.get("phone")),
            "email": (r.get("email") or "").strip() or None,
            "website": (r.get("website") or "").strip() or None,
            "domain": apex(r.get("website")),
            "lat": r.get("latitude"),
            "lng": r.get("longitude"),
            # ── §5e VERTICAL CODE + tier, VERBATIM AND UNINTERPRETED ─────────
            "industries_raw": "|".join(r.get("industries") or []) or None,
            "location_type_raw": r.get("locationType"),
            "certified_partner": r.get("certifiedPartner"),
            "distributor_branch_url": (r.get("distributorBranch") or "").strip() or None,
            "is_us": True,  # country=US is the query, not an inference
            "source": SOURCE,
            "source_url": ENDPOINT,
            "captured": CAPTURED,
        })

    stats = report(SOURCE, records, code_fields=("industries_raw",
                                                 "location_type_raw",
                                                 "certified_partner"))
    write_raw(SOURCE, {
        "source_name": "Kennametal find-a-distributor",
        "source_url": ENDPOINT,
        "locator_page": PAGE,
        "method": "one GET against the same endpoint the page's official "
                  "'Export the List' button reads; the CSV is generated "
                  "client-side from this payload",
        "terms_check": "T&C page is General Terms and Conditions OF SALE — no "
                       "site-use / crawling / data-reuse clause; no other terms "
                       "page linked from the locator. robots.txt blocks named "
                       "SEO crawlers only (not an automatic exclusion under the "
                       "2026-08-01 override).",
        "codes_captured_verbatim": ["industries_raw", "location_type_raw",
                                    "certified_partner"],
        "vertical_code": "industries_raw — metalworking is the ICP slice; road "
                         "rehabilitation / grader blades / snowplow blades / "
                         "trenching are construction and municipal fleet.",
        "origin_requests": f.origin_requests,
        "stats": stats,
    }, records)


if __name__ == "__main__":
    main()
