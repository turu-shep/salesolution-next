#!/usr/bin/env python3
"""S1 wave-3 — NORD Drivesystems location finder.

`research/06` classified this `medium` and flagged the XHR as unresolved. It is
resolved: the iframe at `shop.nord.com/nordlocations/iframe` boots a jQuery
plugin whose `initGMaps` calls `$.buildUrl("/stores/finder/locations")`, and
`buildUrl` appends `?country=<c>&lang=<l>`. That one unauthenticated GET returns
**the entire global network** — no radius, no pagination, no key.

Source-native codes captured VERBATIM (§5e — the Timken lesson):
  `type`   the locator's own legend: distribution / service / sales / agent /
           headquarter / production. NORD's page labels them
           "Distribution" / "Service" / "NORD Sales Office" / "Reseller".
           NOT a vertical code — NORD is drives-only — but it separates NORD's
           own offices (sales/headquarter/production) from third parties.
  `showEmail` / `showWebsite` / `showInLocator`  the record's own publish flags.

RAW ACQUISITION ONLY. No dedupe, no filtering, nothing deleted.
"""
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _polite import (CAPTURED, Blocked, Fetcher, apex, digits, report,  # noqa: E402
                     write_raw)

SOURCE = "nord"
IFRAME = "https://shop.nord.com/nordlocations/iframe?lang=us&country=US"
ENDPOINT = "https://shop.nord.com/stores/finder/locations?country=US&lang=en"

# Measured 2026-08-01 from the payload itself: countryId 184 carries every +1
# phone number and every US ZIP in the set. NORD does not ship a country name.
US_COUNTRY_ID = 184


def main():
    f = Fetcher(SOURCE, min_bytes=10000)
    try:
        data, cached = f.json(ENDPOINT, "locations-all.json",
                              headers={"Referer": IFRAME})
    except Blocked as e:
        print(f"BLOCKED: {e}")
        write_raw(SOURCE, {"source_url": ENDPOINT, "blocked": str(e)}, [])
        return

    print(f"fetched {len(data)} global records ({'cached' if cached else 'live'})")

    records = []
    for r in data:
        store = r.get("store") or {}
        ma = store.get("mainAddress") or {}
        text = store.get("text") or {}
        pos = r.get("position") or {}
        is_us = ma.get("countryId") == US_COUNTRY_ID
        records.append({
            "nord_id": store.get("id"),
            "company": ma.get("company") or text.get("name"),
            "address_1": ma.get("street"),
            "address_2": ma.get("street2"),
            "city": ma.get("location"),
            "zip_raw": (ma.get("zip") or "").strip() or None,
            "country_id": ma.get("countryId"),
            "phone_raw": ma.get("phone"),
            "phone_10": digits(ma.get("phone")),
            "fax": ma.get("fax"),
            "email": ma.get("email") or None,
            "website": ma.get("website") or None,
            "domain": apex(ma.get("website")),
            "contact_person": ma.get("contactPerson"),
            "lat": ma.get("lat") or pos.get("lat"),
            "lng": ma.get("lng") or pos.get("lng"),
            # ── source-native codes, VERBATIM AND UNINTERPRETED ──────────────
            "type_raw": r.get("type"),
            "show_in_locator": store.get("showInLocator"),
            "show_email": store.get("showEmail"),
            "show_website": store.get("showWebsite"),
            "active": store.get("active"),
            "vcard_url": f"https://shop.nord.com/nordstores/vcard/{store.get('id')}",
            "is_us": is_us,
            "source": SOURCE,
            "source_url": ENDPOINT,
            "captured": CAPTURED,
        })

    stats = report(SOURCE, records, code_fields=("type_raw",))
    write_raw(SOURCE, {
        "source_name": "NORD Drivesystems location finder",
        "source_url": ENDPOINT,
        "locator_page": "https://www.nord.com/us/global/locator-tool.jsp",
        "method": "one unauthenticated GET; $.buildUrl('/stores/finder/locations') "
                  "returns the whole global network inline",
        "us_selector": f"mainAddress.countryId == {US_COUNTRY_ID} (measured, NORD "
                       "ships no country name)",
        "type_legend": {
            "distribution": "Distribution", "service": "Service",
            "sales": "NORD Sales Office", "agent": "Reseller",
            "headquarter": "NORD headquarter", "production": "NORD plant",
        },
        "codes_captured_verbatim": ["type_raw", "show_in_locator", "show_email",
                                    "show_website", "active"],
        "origin_requests": f.origin_requests,
        "stats": stats,
    }, records)


if __name__ == "__main__":
    main()
