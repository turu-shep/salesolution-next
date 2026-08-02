#!/usr/bin/env python3
"""S1 wave-3 — Banjo Corp distributor locator (storelocatorwidgets.com SaaS).

  GET cdn.storelocatorwidgets.com/json/<uid>   → JSONP, whole network, one call

⚠ §5e VERTICAL CODE — THIS IS THE ONE THAT MATTERS HERE.
`filters` carries **Agricultural vs Industrial** per record. Measured on this
pull: Agricultural 272, Industrial 158, blank 7. That is the same shape as the
Timken category that collapsed 1,187 seated records to 15 — a locator that
mixes an off-ICP vertical with the ICP one and says so in a code. Both the code
and the widget's own filter label are captured verbatim.

Banjo publishes no country field on most records (measured: 260 of 437 blank),
so US detection reads the tail of the combined `address` string.
"""
import json
import re
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _polite import (CAPTURED, US_STATES, Blocked, Fetcher, apex,  # noqa: E402
                     digits, report, write_raw)

SOURCE = "banjo"
UID = "031d52ed314a7bfeeb56430dc0cd5850"
ENDPOINT = f"https://cdn.storelocatorwidgets.com/json/{UID}"
PAGE = "https://www.banjocorp.com/banjo/distributors"

ZIP_RE = re.compile(r"\b(\d{5})(?:-\d{4})?\b")


def split_address(addr):
    """Banjo ships `address` as
    '513 North Hwy 29, Benson, Minnesota, 56215, United States'."""
    out = {"address_1": None, "city": None, "state": None, "zip_raw": None,
           "country_text": None}
    if not addr:
        return out
    parts = [p.strip() for p in str(addr).split(",") if p.strip()]
    if not parts:
        return out
    out["address_1"] = parts[0]
    if len(parts) >= 2:
        out["country_text"] = parts[-1]
    for p in parts:
        m = ZIP_RE.fullmatch(p.strip())
        if m:
            out["zip_raw"] = m.group(1)
    if len(parts) >= 3:
        out["city"] = parts[1]
        out["state"] = parts[2]
    return out


US_NAMES = {"united states", "usa", "us", "united states of america"}


def main():
    f = Fetcher(SOURCE, min_bytes=10000)
    try:
        body, cached = f.get(ENDPOINT, "stores.jsonp", headers={"Referer": PAGE})
    except Blocked as e:
        print(f"BLOCKED: {e}")
        write_raw(SOURCE, {"source_url": ENDPOINT, "blocked": str(e)}, [])
        return

    # NB: `markers` is the widget's *icon* table. The dealer rows are `stores`.
    # NB2: the same payload carries the tenant's mapbox / maptiler / expressmaps
    # API keys. They are not read, not used and never written to the raw file.
    data = json.loads(body[body.index("(") + 1: body.rindex(")")])
    rows = data.get("stores") or []
    widget_filters = data.get("filters")
    print(f"fetched {len(rows)} records ({'cached' if cached else 'live'})")
    print(f"widget filter definition (verbatim): {json.dumps(widget_filters)[:300]}")

    records = []
    for r in rows:
        d = r.get("data") or {}
        parsed = split_address(d.get("address"))
        ctext = (parsed["country_text"] or "").strip()
        state = (parsed["state"] or "").strip()
        # Some rows are only "<street>, <CITY> <ST> <ZIP>" with no country part.
        tail = ctext.replace(",", " ").split()
        tail_state = tail[-2].upper() if len(tail) >= 2 and tail[-1].isdigit() else ""
        is_us = (str(r.get("country") or "").upper() == "US"
                 or ctext.lower() in US_NAMES
                 or state.upper() in US_STATES
                 or tail_state in US_STATES)
        records.append({
            "store_id": r.get("storeid"),
            "company": (r.get("name") or "").strip() or None,
            "address_raw": d.get("address"),
            "address_1": parsed["address_1"],
            "city": parsed["city"],
            "state": parsed["state"],
            "zip_raw": parsed["zip_raw"],
            "country_field": r.get("country") or None,
            "country_text": parsed["country_text"],
            "phone_raw": d.get("phone"),
            "phone_10": digits(d.get("phone")),
            "fax": d.get("fax"),
            "email": (d.get("email") or "").strip() or None,
            "website": (d.get("website") or "").strip() or None,
            "domain": apex(d.get("website")),
            "lat": d.get("map_lat"),
            "lng": d.get("map_lng"),
            # ── §5e VERTICAL CODE, VERBATIM AND UNINTERPRETED ────────────────
            "filters_raw": "|".join(r.get("filters") or []) or None,
            "filters_bitwise": r.get("filters_bitwise"),
            "visibility": d.get("visibility"),
            "marker_id": d.get("markerid"),
            "is_us": is_us,
            "source": SOURCE,
            "source_url": ENDPOINT,
            "captured": CAPTURED,
        })

    stats = report(SOURCE, records, code_fields=("filters_raw", "filters_bitwise"))
    write_raw(SOURCE, {
        "source_name": "Banjo Corp distributor locator (storelocatorwidgets.com)",
        "source_url": ENDPOINT,
        "locator_page": PAGE,
        "method": "one unauthenticated GET, JSONP, whole network in one call",
        "widget_filter_definition": widget_filters,
        "codes_captured_verbatim": ["filters_raw", "filters_bitwise", "visibility",
                                    "marker_id"],
        "vertical_code": "filters_raw — Agricultural vs Industrial. This is the "
                         "§5e code for this source: an explicit off-ICP vertical "
                         "the locator publishes and we must not average over.",
        "origin_requests": f.origin_requests,
        "stats": stats,
    }, records)


if __name__ == "__main__":
    main()
