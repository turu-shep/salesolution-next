#!/usr/bin/env python3
"""S1 wave-3 — Quincy Compressor sales & service locator.

WordPress `admin-ajax.php`, action `fx_get_locations`, contract read from the
theme's `main.js` (`FX.SalesService.onFormSubmit`). A country search returns
`total_results` for the country but only the first 50 rows, so the sweep runs
**state by state** (the same `postData` shape, `sales-service-state`), one
request per state at >=3s.

⚠ CREDENTIAL BOUNDARY — READ BEFORE TOUCHING THIS FILE.
Quincy's own server is a thin proxy in front of **Bullseye**, and its JSON
response echoes the upstream request URL **including Quincy's Bullseye ApiKey**.
That key is not ours. `research/05` stopped at Bimba's Bullseye 401 precisely
because hunting a tenant's API key is credential acquisition, and Artur's
robots override did not move that line. So:

  - we call **Quincy's own public endpoint only**, never `ws.bullseyelocations.com`;
  - the echoed `url` field is **redacted before anything is written to disk** —
    the raw file keeps the endpoint we called and a key-stripped copy of the
    upstream URL, never the key itself.

Source-native codes captured VERBATIM: `IsLeadManager`, `IsStoreLocator`,
`country`. There is no vertical code here — Quincy is compressors only — and
`IsLeadManager` is a routing flag, not a quality tier (§3's Adaptall warning).
"""
import os
import re
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _polite import (CAPTURED, Blocked, Fetcher, apex, digits, report,  # noqa: E402
                     write_raw)

SOURCE = "quincy"
AJAX = "https://www.quincycompressor.com/wp-admin/admin-ajax.php"
PAGE = "https://www.quincycompressor.com/sales-service-locator/"
US_COUNTRY = "country:1"  # from the page's <select name="sales-service-country">

STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI",
          "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN",
          "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH",
          "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA",
          "WV", "WI", "WY", "PR"]

KEY_RE = re.compile(r"(ApiKey=)[^&]*", re.I)


def redact(url):
    """Never write another tenant's API key to disk."""
    return KEY_RE.sub(r"\1[REDACTED]", url or "")


def page_nonce(fetcher):
    body, _ = fetcher.get(PAGE, "sales-service-locator.html",
                          headers={"Accept": "text/html,*/*;q=0.8"})
    m = re.search(r'name="sales-service-nonce"\s+value="([a-z0-9]+)"', body)
    if not m:
        raise Blocked("sales-service-nonce not found on the page")
    return m.group(1)


def main():
    f = Fetcher(SOURCE, min_bytes=200)
    try:
        nonce = page_nonce(f)
    except Blocked as e:
        print(f"BLOCKED: {e}")
        write_raw(SOURCE, {"source_url": AJAX, "blocked": str(e)}, [])
        return

    seen, records, per_state, totals = set(), [], {}, {}

    def pull(cache_name, post):
        data, cached = f.json(AJAX, cache_name,
                              data={"action": "fx_get_locations",
                                    "security": nonce, **post},
                              headers={"Referer": PAGE})
        # Redact the echoed ApiKey in the on-disk cache too, immediately.
        path = os.path.join(f.cache, cache_name)
        if os.path.exists(path):
            with open(path, encoding="utf-8", errors="ignore") as fh:
                body = fh.read()
            scrubbed = redact(body)
            if scrubbed != body:
                with open(path, "w", encoding="utf-8") as fh:
                    fh.write(scrubbed)
        data.pop("url", None)
        return data, cached

    # Country pass first (gives the authoritative total_results), then states.
    passes = [("country-us.json", {"postData[sales-service-country]": US_COUNTRY},
               "US")]
    passes += [(f"state-{s}.json",
                {"postData[sales-service-country]": US_COUNTRY,
                 "postData[sales-service-state]": s}, s) for s in STATES]

    for cache_name, post, label in passes:
        try:
            data, _ = pull(cache_name, post)
        except Blocked as e:
            print(f"  {label}: BLOCKED — {e}")
            f.notes.append(f"{label}: {e}")
            break
        rows = data.get("locations") or []
        totals[label] = data.get("total_results")
        new = 0
        for r in rows:
            rid = r.get("Id")
            if rid in seen:
                continue
            seen.add(rid)
            new += 1
            records.append({
                "bullseye_id": rid,
                "company": (r.get("Name") or "").strip() or None,
                "address_1": (r.get("Address1") or "").strip() or None,
                "address_2": (r.get("Address2") or "").strip() or None,
                "city": (r.get("City") or "").strip() or None,
                "state": (r.get("State") or "").strip() or None,
                "zip_raw": (r.get("PostCode") or "").strip() or None,
                "phone_raw": (r.get("PhoneNumber") or "").strip() or None,
                "phone_10": digits(r.get("PhoneNumber")),
                "email": (r.get("EmailAddress") or "").strip() or None,
                "contact_name": (r.get("ContactName") or "").strip() or None,
                "website": (r.get("URL") or "").strip() or None,
                "domain": apex(r.get("URL")),
                "lat": r.get("Latitude"),
                "lng": r.get("Longitude"),
                # ── source-native codes, VERBATIM AND UNINTERPRETED ──────────
                "is_lead_manager": r.get("IsLeadManager"),
                "is_store_locator": r.get("IsStoreLocator"),
                "country_code_raw": r.get("country"),
                "found_via": label,
                "is_us": True,
                "source": SOURCE,
                "source_url": AJAX,
                "captured": CAPTURED,
            })
        per_state[label] = {"returned": len(rows), "new": new,
                            "total_results": data.get("total_results")}
        print(f"  {label}: {len(rows)} returned, {new} new "
              f"(server total_results={data.get('total_results')})")

    stats = report(SOURCE, records,
                   code_fields=("is_lead_manager", "is_store_locator"))
    print(f"server-reported US total_results: {totals.get('US')}  |  collected: "
          f"{len(records)}")

    write_raw(SOURCE, {
        "source_name": "Quincy Compressor sales & service locator",
        "source_url": AJAX,
        "locator_page": PAGE,
        "method": "POST action=fx_get_locations; country pass then a 52-state "
                  "sweep because the country response caps at 50 rows",
        "upstream": "Quincy's server proxies Bullseye. The echoed upstream URL "
                    "carries Quincy's OWN ApiKey; it is redacted here and "
                    "ws.bullseyelocations.com was never called directly.",
        "codes_captured_verbatim": ["is_lead_manager", "is_store_locator",
                                    "country_code_raw"],
        "no_vertical_code": "compressors only; IsLeadManager is a routing flag, "
                            "not a quality tier",
        "per_query": per_state,
        "server_total_results_us": totals.get("US"),
        "origin_requests": f.origin_requests,
        "notes": f.notes,
        "stats": stats,
    }, records)


if __name__ == "__main__":
    main()
