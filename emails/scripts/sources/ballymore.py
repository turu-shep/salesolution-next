#!/usr/bin/env python3
"""S1 wave-3 — Ballymore dealer locator (Storemapper, JSONP).

  GET storemapper.co/api/users/<tenant>/stores.js?callback=SMcallback2

The only source in the whole inventory carrying a dealer email on ~99.8% of
records. `research/05` measured 1,250 records, all US, and the same chain
problem as Lovejoy (122 distinct names, top five are Fastenal / Kaman / Indoff /
Motion / Applied). Captured anyway; suppression is a later stage.

⚠ GATE:HUMAN before any send against locator-published email (research/06
§Compliance). A public directory is not consent — CAN-SPAM still applies.

Source-native codes captured VERBATIM (§5e):
  `tier`                 present, mostly unpopulated (null 1,222 / "2" 27 / "1" 1)
  `store_category_tags`  two ids in this tenant: 22459 and 22458. The labels are
                         NOT published anywhere on the page or in the payload —
                         captured undecoded, exactly as Timken's category was.
  `store_products`, `tag_ids`, `custom_field_1..3`, `description`.

Known defect (`research/05`): `address` is one combined string
("153 Acme Road, Lawrence, MA") — no separate city/state/zip. A best-effort
split is carried ALONGSIDE the verbatim string, never instead of it.
"""
import json
import re
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _polite import (CAPTURED, US_STATES, Blocked, Fetcher, apex,  # noqa: E402
                     digits, report, write_raw)

SOURCE = "ballymore"
TENANT = "28644-Q2sEj6KXH5Gfx7UU"
ENDPOINT = f"https://www.storemapper.co/api/users/{TENANT}/stores.js?callback=SMcallback2"
PAGE = "https://www.ballymore.com/dealer-locator/"

ZIP_RE = re.compile(r"\b(\d{5})(?:-\d{4})?\b")


def split_address(addr):
    """Best-effort split of Storemapper's single combined address string.

    Returned as *extra* fields; `address_raw` always keeps the original.
    """
    out = {"address_1": None, "city": None, "state": None, "zip_raw": None}
    if not addr:
        return out
    parts = [p.strip() for p in str(addr).split(",") if p.strip()]
    if not parts:
        return out
    tail = parts[-1]
    m = ZIP_RE.search(tail)
    if m:
        out["zip_raw"] = m.group(1)
        tail = ZIP_RE.sub("", tail).strip()
    tok = tail.replace(".", "").split()
    if tok and tok[-1].upper() in US_STATES:
        out["state"] = tok[-1].upper()
        rest = " ".join(tok[:-1]).strip()
        if rest:
            parts[-1] = rest
        else:
            parts = parts[:-1]
    elif not m:
        parts = parts
    if len(parts) >= 2:
        out["address_1"] = parts[0]
        out["city"] = parts[-1] if out["state"] else parts[-1]
    elif parts:
        out["address_1"] = parts[0]
    if out["state"] and out["city"] == out["address_1"]:
        out["city"] = None
    return out


def main():
    f = Fetcher(SOURCE, min_bytes=10000)
    try:
        body, cached = f.get(ENDPOINT, "stores.jsonp", headers={"Referer": PAGE})
    except Blocked as e:
        print(f"BLOCKED: {e}")
        write_raw(SOURCE, {"source_url": ENDPOINT, "blocked": str(e)}, [])
        return

    data = json.loads(body[body.index("(") + 1: body.rindex(")")])
    rows = data.get("stores") or []
    print(f"fetched {len(rows)} records ({'cached' if cached else 'live'})")

    records = []
    for r in rows:
        parsed = split_address(r.get("address"))
        tags = [t.get("category_tag_id") for t in (r.get("store_category_tags") or [])]
        state = parsed["state"]
        records.append({
            "storemapper_id": r.get("id"),
            "company": (r.get("name") or "").strip() or None,
            "address_raw": r.get("address"),
            "address_1": parsed["address_1"],
            "city": parsed["city"],
            "state": state,
            "zip_raw": parsed["zip_raw"],
            "phone_raw": r.get("phone"),
            "phone_10": digits(r.get("phone")),
            "email": (r.get("email") or "").strip() or None,
            "website": (r.get("url") or "").strip() or None,
            "domain": apex(r.get("url")),
            "lat": r.get("latitude"),
            "lng": r.get("longitude"),
            # ── source-native codes, VERBATIM AND UNINTERPRETED ──────────────
            "tier_raw": r.get("tier"),
            "category_tag_ids": "|".join(str(t) for t in tags) or None,
            "tag_ids": r.get("tag_ids"),
            "store_products": r.get("store_products") or None,
            "custom_field_1": r.get("custom_field_1"),
            "custom_field_2": r.get("custom_field_2"),
            "custom_field_3": r.get("custom_field_3"),
            "description": (r.get("description") or "").strip() or None,
            "image_url": r.get("image_url") or None,
            # Storemapper carries no country field on this tenant; research/05
            # measured all 1,250 as US. Trust the parse, flag what fails it.
            "is_us": bool(state) or bool(parsed["zip_raw"]),
            "source": SOURCE,
            "source_url": ENDPOINT,
            "captured": CAPTURED,
        })

    stats = report(SOURCE, records,
                   code_fields=("tier_raw", "category_tag_ids"))
    unparsed = [r for r in records if not r["is_us"]]
    print(f"address strings that did not yield a state or ZIP: {len(unparsed)} "
          "(kept, flagged is_us=false — nothing deleted)")

    write_raw(SOURCE, {
        "source_name": "Ballymore dealer locator (Storemapper)",
        "source_url": ENDPOINT,
        "locator_page": PAGE,
        "method": "one unauthenticated GET, JSONP, whole network in one call",
        "codes_captured_verbatim": ["tier_raw", "category_tag_ids", "tag_ids",
                                    "store_products", "custom_field_1..3"],
        "category_tag_legend": "UNDECODED — ids 22459 / 22458 appear on the "
                               "records; no label is published on the page or "
                               "in the payload. Captured verbatim per §5e.",
        "known_defect": "address is a single combined string; address_1/city/"
                        "state/zip_raw are a best-effort split, address_raw is "
                        "authoritative",
        "compliance": "GATE:HUMAN before any send against locator-published email",
        "origin_requests": f.origin_requests,
        "stats": stats,
    }, records)


if __name__ == "__main__":
    main()
