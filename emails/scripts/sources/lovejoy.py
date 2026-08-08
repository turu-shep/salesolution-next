#!/usr/bin/env python3
"""S1 wave-3 — Lovejoy distributor/sales-rep locator (Agile Store Locator).

One unauthenticated GET returns the whole network:
  GET /wp-admin/admin-ajax.php?action=asl_load_stores&load_all=1&layout=1

`research/05` measured 1,553 records / 1,147 US and warned the list is
chain-dominated (97 distinct US names). Captured anyway — suppression is S2's
job, not S1's, and the value here is line-card depth on PT/bearings dealers we
already hold, not new names.

Source-native codes captured VERBATIM (§5e):
  `categories`  ASL category ids. `research/05` measured this as dead weight
                (1,133/1,147 carry the identical `18,19,20`) — captured anyway
                so the next stage can confirm rather than trust this note.
  `brand`, `special`, `customer_no`, `logo_id`, `marker_id`, `ordr`.
"""
import html
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _polite import (CAPTURED, Blocked, Fetcher, apex, digits, report,  # noqa: E402
                     write_raw)

SOURCE = "lovejoy"
ENDPOINT = ("https://www.lovejoy-inc.com/wp-admin/admin-ajax.php"
            "?action=asl_load_stores&load_all=1&layout=1")
PAGE = "https://www.lovejoy-inc.com/distributor-sales-rep-search/"


def clean(s):
    if s is None:
        return None
    v = html.unescape(str(s)).strip()
    return v or None


def main():
    f = Fetcher(SOURCE, min_bytes=10000)
    try:
        data, cached = f.json(ENDPOINT, "asl-load-stores.json",
                              headers={"Referer": PAGE})
    except Blocked as e:
        print(f"BLOCKED: {e}")
        write_raw(SOURCE, {"source_url": ENDPOINT, "blocked": str(e)}, [])
        return

    rows = data if isinstance(data, list) else (data.get("data") or [])
    print(f"fetched {len(rows)} records ({'cached' if cached else 'live'})")

    records = []
    for r in rows:
        country = clean(r.get("country")) or ""
        records.append({
            "asl_id": r.get("id"),
            "company": clean(r.get("title")),
            "address_1": clean(r.get("street")),
            "city": clean(r.get("city")),
            "state": clean(r.get("state")),
            "zip_raw": clean(r.get("postal_code")),
            "country": country,
            "phone_raw": clean(r.get("phone")),
            "phone_10": digits(r.get("phone")),
            "fax": clean(r.get("fax")),
            "email": clean(r.get("email")),
            "website": clean(r.get("website")),
            "domain": apex(clean(r.get("website"))),
            "lat": r.get("lat"),
            "lng": r.get("lng"),
            # ── source-native codes, VERBATIM AND UNINTERPRETED ──────────────
            "categories_raw": clean(r.get("categories")),
            "brand_raw": clean(r.get("brand")),
            "special_raw": clean(r.get("special")),
            "customer_no": clean(r.get("customer_no")),
            "marker_id": clean(r.get("marker_id")),
            "logo_id": clean(r.get("logo_id")),
            "description": clean(r.get("description")),
            "is_us": country.lower() in ("united states", "usa", "us",
                                         "united states of america"),
            "source": SOURCE,
            "source_url": ENDPOINT,
            "captured": CAPTURED,
        })

    stats = report(SOURCE, records, code_fields=("categories_raw", "special_raw",
                                                 "marker_id"))
    write_raw(SOURCE, {
        "source_name": "Lovejoy distributor & sales-rep search (Agile Store Locator)",
        "source_url": ENDPOINT,
        "locator_page": PAGE,
        "method": "one unauthenticated GET, ASL bulk-load action, no nonce",
        "codes_captured_verbatim": ["categories_raw", "brand_raw", "special_raw",
                                    "customer_no", "marker_id", "logo_id"],
        "note": "chain-dominated per research/05; suppression is S2's stage, not S1's",
        "origin_requests": f.origin_requests,
        "stats": stats,
    }, records)


if __name__ == "__main__":
    main()
