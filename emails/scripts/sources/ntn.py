#!/usr/bin/env python3
"""S1 wave-3 — NTN Americas distributor locator (WordPress admin-ajax).

`research/01` rated this `medium` on the assumption the WP AJAX pattern needed
param discovery. It does not: `wordpress-store-locator-public.js` exposes a
`getAllStores` action that takes only lat/lng and returns **the whole national
list in one POST**, no nonce, no radius.

  POST /wp-admin/admin-ajax.php  action=get_all_stores&lat=&lng=&contactform=0

⚠ §5e VERTICAL CODE — THE SHARPEST ONE IN THE WAVE.
The page's category filter is literally `91 = Industrial Distributor` /
`92 = HD Truck / Automotive Distributor`, and **every record carries its label
in `ca`**. This is the exact shape of the Timken failure — a bearings locator
mixing industrial MRO with the automotive/truck aftermarket — except NTN ships
the decoded label, so it costs nothing to read. Measured on this pull:
Industrial Distributor 1,852 · HD Truck / Automotive Distributor 614.

Field map read off the plugin's own result template:
  na name · st street · ct city · rg region/state · zp zip · co country
  we website · gu the store's WordPress permalink · ic icon · de description
  ca category labels · lat/lng
Note: NTN publishes no phone and no email in this payload.
"""
import collections
import html
import json
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _polite import (CAPTURED, Blocked, Fetcher, apex, report,  # noqa: E402
                     write_raw)

SOURCE = "ntn"
AJAX = "https://ntnamericas.com/wp-admin/admin-ajax.php"
PAGE = "https://www.ntnamericas.com/distributor-locator/"

# Read off the page's <select id="store_locator_filter_categories">.
CATEGORY_LEGEND = {"91": "Industrial Distributor",
                   "92": "HD Truck / Automotive Distributor"}


def clean(s):
    if s is None:
        return None
    v = html.unescape(str(s)).strip()
    return v or None


def main():
    f = Fetcher(SOURCE, min_bytes=10000)
    try:
        body, cached = f.get(AJAX, "get-all-stores.json",
                             data={"action": "get_all_stores", "lat": "39.8",
                                   "lng": "-98.6", "contactform": "0"},
                             headers={"Referer": PAGE})
    except Blocked as e:
        print(f"BLOCKED: {e}")
        write_raw(SOURCE, {"source_url": AJAX, "blocked": str(e)}, [])
        return

    data = json.loads(body)
    rows = list(data.values()) if isinstance(data, dict) else data
    print(f"fetched {len(rows)} records ({'cached' if cached else 'live'})")

    records = []
    for r in rows:
        ca = r.get("ca") or {}
        cats = list(ca.values()) if isinstance(ca, dict) else list(ca)
        country = clean(r.get("co")) or ""
        records.append({
            "ntn_id": r.get("ID"),
            "company": clean(r.get("na")),
            "address_1": clean(r.get("st")),
            "city": clean(r.get("ct")),
            "state": clean(r.get("rg")),
            "zip_raw": clean(r.get("zp")),
            "country": country,
            # NTN publishes no phone / email on this payload.
            "phone_raw": None,
            "email": None,
            "website": clean(r.get("we")),
            "domain": apex(clean(r.get("we"))),
            "lat": r.get("lat"),
            "lng": r.get("lng"),
            "store_permalink": clean(r.get("gu")),
            "description": clean(r.get("de")),
            # ── §5e VERTICAL CODE, VERBATIM AND UNINTERPRETED ────────────────
            "categories_raw": "|".join(cats) or None,
            "icon_raw": clean(r.get("ic")),
            "is_us": country.upper() in ("US", "USA", "UNITED STATES"),
            "source": SOURCE,
            "source_url": AJAX,
            "captured": CAPTURED,
        })

    stats = report(SOURCE, records, code_fields=("categories_raw",))
    both = collections.Counter(r["categories_raw"] for r in records
                               if r["categories_raw"] and "|" in r["categories_raw"])
    print(f"records carrying BOTH verticals: {sum(both.values())}")

    write_raw(SOURCE, {
        "source_name": "NTN Americas distributor locator",
        "source_url": AJAX,
        "locator_page": PAGE,
        "method": "one POST, action=get_all_stores (WP store-locator plugin bulk "
                  "action), no nonce, whole national list",
        "request_params": {"action": "get_all_stores", "lat": "39.8",
                           "lng": "-98.6", "contactform": "0"},
        "category_legend": CATEGORY_LEGEND,
        "codes_captured_verbatim": ["categories_raw", "icon_raw"],
        "vertical_code": "categories_raw — an EXPLICIT industrial-vs-automotive "
                         "filter, labels shipped decoded. This is the §5e code "
                         "Timken had and we failed to read.",
        "no_contact_fields": "NTN publishes neither phone nor email in this payload",
        "origin_requests": f.origin_requests,
        "stats": stats,
    }, records)


if __name__ == "__main__":
    main()
