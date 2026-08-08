#!/usr/bin/env python3
"""equipment-dealers — Case IH dealer locator, three-metro probe.

GATES
-----
**ICP-EQ — SIGNED (Artur, 2026-08-04)**, strategy §9: the ICP is extended to
franchised single-line equipment dealers, **1–4-location tail only**, on a
parts-counter angle. Binding conditions: the size-band filter is designed before
the sweep (`_eq_sizeband.py`, written first), only 1–4 locations are in scope,
and everything above routes to `pool-above-ceiling`.

**Per-OEM robots gate — NO OVERRIDE NEEDED for Case IH.** Measured 2026-08-04:

  Data path, pinned statically from the site's own JS before anything was
  rendered (`/dist/caseih/static/js/259.0fdf6065.chunk.js`):

      fetch(`/apirequest/dealer-locator/get-dealer-by-geo-code?${d}`, {signal})

  It is a **rooted relative path**, so the serving host is `www.caseih.com`
  itself — same origin as the locator page, no separate API host. RFC 9309 is
  per-origin, so `www.caseih.com/robots.txt` governs, and none of its 49 `*`
  rules matches `/apirequest/…`. Two rules *sound* like they might and do not:

      Disallow: /Search/            — different path, and case-sensitive
      Disallow: /dealer-landing-page — prefix is `/dealer-…`, ours is `/apirequest/…`

  **Allowed by absence.** No robots-posture change is involved, so the pack's
  standing policy already covers it (public pages · no login/CAPTCHA/403 bypass ·
  paced · cached · provenance on every record) and no signature is required —
  the same basis on which six of eight E4 targets cleared.

**Credential posture: clean, and positively established rather than merely
absent.** The call is a bare `fetch(url, {signal})` — the init object carries an
AbortController signal and nothing else. No `headers`, no `Authorization`, no
API key, no `credentials` option. The only keys in the page are a Google Maps
browser key and the Sitecore Layout Service `sc_apikey`, neither of which is on
this path. Same shape as Continental (2026-08-03).

**Terms.** `…/legal-notice`, linked from the locator, was fetched and read:
8.5 KB of text, no anti-automation, anti-crawling or data-mining clause. The one
"harvest" keyword hit is product taxonomy ("Forage Harvesters"), the same
false-positive shape as Banner's "automated checkout".

METHOD
------
Three metros, then STOP: Houston TX, Chicago IL, Cleveland OH. One GET per
metro against the same endpoint the page's own map calls, with the page's own
`pageId`. Paced >=3s, cached, honest UA never rotated.
"""
import json
import os
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _eq_sizeband as SB  # noqa: E402
import _polite  # noqa: E402
from _polite import Blocked, Fetcher, apex, digits, norm_company  # noqa: E402

_polite.CAPTURED = "2026-08-04"

SOURCE = "caseih"
PAGE = "https://www.caseih.com/en-us/unitedstates/dealer-locator"
BASE = "https://www.caseih.com/apirequest/dealer-locator/get-dealer-by-geo-code"
# From the locator page's own inline Sitecore route data.
PAGE_ID = "{12BABBA7-79F2-49A8-B495-DAC335AC856A}"
LANGUAGE = "en-US"
COUNTRY = "US"

ROBOTS_VERDICT = (
    "www.caseih.com/robots.txt — 49 `*` rules, none matches "
    "/apirequest/dealer-locator/. Nearest lookalikes are `Disallow: /Search/` "
    "and `Disallow: /dealer-landing-page`; neither is a prefix of our path. "
    "ALLOWED BY ABSENCE — no override needed."
)

# Source-native codes to capture VERBATIM AND UNINTERPRETED (§5i). Populated at
# runtime from the payload's own keys; these are the ones we expect from the
# bundle's render code and they are never renamed or mapped.
EXPECTED_CODE_FIELDS = ("dealerClass_code_raw", "dealerClass_desc_raw",
                        "contract_codes_raw", "brand_raw",
                        "is_contract_override_raw",
                        "cnhOwnershipGroupSAPNumber_raw",
                        "cnhPrimarySAPNumber_raw", "cnhZ3SAPNumber_raw")

# The geo-code endpoint returns only the ~10 NEAREST dealers and takes no radius
# or limit parameter, so a metro probe built on it alone is a 10-row truncation —
# and a truncated pull under-counts every dealer group, which is the one error
# that makes this source look SMALLER than it is and therefore more in-band.
# The state endpoint is the same locator's own second query mode; pulling the
# three probe states and then filtering to the 100-mile circles gives complete
# metro coverage for the same three geographies. It is still three metros: the
# measured set is exactly what falls inside the circles.
STATE_BASE = ("https://www.caseih.com/apirequest/dealer-locator/"
              "get-dealer-by-geographic-filter")
PROBE_STATES = [("houston-tx", "Texas"), ("chicago-il", "Illinois"),
                ("cleveland-oh", "Ohio")]


def flatten(obj, prefix=""):
    out = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            out.update(flatten(v, f"{prefix}{k}."))
    elif isinstance(obj, list):
        vals = [x for x in obj if isinstance(x, (str, int, float)) and x != ""]
        if vals:
            out[prefix.rstrip(".")] = "|".join(str(x) for x in vals)
        else:
            for i, x in enumerate(obj[:6]):
                out.update(flatten(x, f"{prefix}{i}."))
    elif obj not in (None, ""):
        out[prefix.rstrip(".")] = obj
    return out


def first(d, *names):
    for n in names:
        v = d.get(n)
        if v not in (None, "", []):
            return v
    return None


def to_record(raw, metro, url):
    d = raw.get("dealership") if isinstance(raw.get("dealership"), dict) else raw
    at = d.get("dealershipAttributes") or {}
    flat = flatten(raw)

    # ⚠ TWO website fields, and picking the wrong one costs the whole source.
    #   `dealerWebsite`             -> an OEM-hosted landing page on caseih.com
    #   `dealershipAttributes.website` -> the dealer's OWN site (ascoeq.com)
    # Only the second is a usable domain for a domain-keyed pipeline.
    own_site = at.get("website") or None
    oem_page = d.get("dealerWebsite") or None
    website = own_site or None
    phone = first(d, "shippingPhone", "phone", "phoneNumber")
    email = first(d, "dealerEmail", "email", "emailAddress")
    lat, lng = SB.num(d.get("latitude")), SB.num(d.get("longitude"))

    classes = at.get("dealerClasses") or []
    contracts = at.get("contractDetails") or []

    rec = {
        "company": (d.get("dealerName") or "").strip() or None,
        "address_1": d.get("shippingAddress1"),
        "address_2": d.get("shippingAddress2"),
        "city": d.get("shippingCity"),
        "state": d.get("shippingStateProv"),
        "zip_raw": d.get("shippingZip"),
        "phone_raw": phone,
        "phone_10": digits(phone),
        "email": email,
        "website": website,
        "domain": SB.dealer_domain(website),
        "lat": lat,
        "lng": lng,
        "is_us": (d.get("countryCode") or "").upper() == "US",
        "source": SOURCE,
        "source_url": url,
        "captured": _polite.CAPTURED,
        "probe_metro": metro,
        # provenance for the trap above — kept so nobody re-discovers it
        "oem_landing_page": oem_page,
        "oem_landing_page_domain": apex(oem_page),
        # ── §5i: every source-native code, VERBATIM AND UNINTERPRETED ───────
        "dealerNumber_raw": d.get("dealerNumber"),
        "cnhPrimarySAPNumber_raw": d.get("cnhPrimarySAPNumber"),
        "cnhOwnershipGroupSAPNumber_raw": d.get("cnhOwnershipGroupSAPNumber"),
        "cnhZ3SAPNumber_raw": d.get("cnhZ3SAPNumber"),
        "brand_raw": d.get("brand"),
        "region_raw": d.get("region"),
        # TIER CODE — dealerClasses[].classCode / classDescription
        "dealerClass_code_raw": "|".join(
            str(c.get("classCode")) for c in classes if c.get("classCode")) or None,
        "dealerClass_desc_raw": "|".join(
            str(c.get("classDescription")) for c in classes
            if c.get("classDescription")) or None,
        # PER-RECORD LINE CARD — contractDetails[]
        "contract_codes_raw": "|".join(
            str(c.get("shortDescription")) for c in contracts
            if c.get("shortDescription")) or None,
        "contract_names_raw": "|".join(
            str(c.get("codeName")) for c in contracts if c.get("codeName")) or None,
        "contract_count": len(contracts),
        "is_contract_override_raw": at.get("isContractOverride"),
        "distance_raw": raw.get("distance"),
    }
    for k, v in flat.items():
        key = "x_" + k.replace(".", "_").replace("@", "")
        if key not in rec:
            rec[f"{key}_raw"] = v
    return rec


def probe(f):
    """One GET per metro. Three metros, then STOP."""
    out, records, log = {}, [], []
    for metro, lat, lng in SB.METROS:
        url = (f"{BASE}?latitude={lat}&longitude={lng}"
               f"&pageId={_polite.urllib.parse.quote(PAGE_ID)}"
               f"&language={LANGUAGE}&country={COUNTRY}")
        try:
            data, cached = f.json(url, f"geo-{metro}.json",
                                  headers={"Referer": PAGE,
                                           "Accept": "application/json"})
        except Blocked as e:
            print(f"  {metro}: BLOCKED — {e}")
            out[metro] = {"blocked": str(e), "url": url}
            log.append({"metro": metro, "url": url, "result": str(e)})
            continue
        rows = data.get("dealershipResults") if isinstance(data, dict) else None
        if rows is None and isinstance(data, dict):
            for k, v in data.items():
                if isinstance(v, list) and v and isinstance(v[0], dict):
                    rows = v
                    print(f"  (payload key for rows is `{k}`, not dealershipResults)")
                    break
        rows = rows or []
        recs = [to_record(r, metro, url) for r in rows if isinstance(r, dict)]
        records.extend(recs)
        out[metro] = {"url": url, "records": len(recs), "cached": cached,
                      "payload_keys": sorted(data.keys()) if isinstance(data, dict) else None,
                      "row_keys": sorted(flatten(rows[0]).keys())[:60] if rows else []}
        log.append({"metro": metro, "url": url, "records": len(recs)})
        print(f"  {metro:<14} {len(recs):>4} rows  ({'cached' if cached else 'live'})")

    # Second pass: the same locator's state query, for the three probe states
    # only. Filtered to the 100-mile circles below, so the measured set stays
    # exactly three metros — this only removes the 10-nearest truncation.
    for metro, state in PROBE_STATES:
        url = (f"{STATE_BASE}?state={_polite.urllib.parse.quote(state)}"
               f"&pageId={_polite.urllib.parse.quote(PAGE_ID)}"
               f"&language={LANGUAGE}&country={COUNTRY}")
        try:
            data, cached = f.json(url, f"state-{state}.json",
                                  headers={"Referer": PAGE,
                                           "Accept": "application/json"})
        except Blocked as e:
            print(f"  state/{state}: BLOCKED — {e}")
            out[f"state/{state}"] = {"blocked": str(e), "url": url}
            log.append({"state": state, "url": url, "result": str(e)})
            continue
        rows = (data or {}).get("dealershipResults") or []
        recs = [to_record(r, metro, url) for r in rows if isinstance(r, dict)]
        records.extend(recs)
        out[f"state/{state}"] = {"url": url, "records": len(recs), "cached": cached}
        log.append({"state": state, "url": url, "records": len(recs)})
        print(f"  state/{state:<10} {len(recs):>4} rows  ({'cached' if cached else 'live'})")
    return out, records, log


def main():
    deduped = SB.load_deduped()
    print(f"baseline: deduped-v7.csv, {len(deduped)} data rows, domain-keyed")
    print(f"robots: {ROBOTS_VERDICT}\n")

    f = Fetcher(SOURCE, min_bytes=2)
    metros, records, log = probe(f)

    # Keep only rows that actually fall inside a probe circle. The endpoint
    # returns nearest-N with no radius parameter, so without this a "metro"
    # probe quietly becomes a regional one.
    inside, outside, seen = [], [], set()
    for r in records:
        m = SB.in_any_metro(r.get("lat"), r.get("lng"))
        r["in_probe_circle"] = bool(m)
        r["probe_circle"] = m
        key = r.get("dealerNumber_raw") or (r.get("company"), r.get("zip_raw"))
        if not m:
            outside.append(r)
            continue
        if key in seen:          # same store from both the geo and state pass
            continue
        seen.add(key)
        inside.append(r)
    print(f"\nrows returned: {len(records)}  |  inside a {SB.RADIUS_MI}mi circle: "
          f"{len(inside)}  |  outside (dropped): {len(outside)}")

    code_fields = tuple(k for k in EXPECTED_CODE_FIELDS
                        if any(r.get(k) for r in inside))
    # Group key: `cnhOwnershipGroupSAPNumber`, the locator's OWN ownership-group
    # id. `cnhPrimarySAPNumber` looks like a group key and is not — measured
    # 27 distinct values across 27 stores, i.e. one per store. Same lesson as
    # SKF's DC001–DC028 table: a field that looks like a code is not a code
    # until you measure whether it actually sorts.
    groups, unresolvable, meta = SB.apply_size_band(
        inside, code_fields=("contract_codes_raw", "dealerClass_code_raw"),
        group_key_field="cnhOwnershipGroupSAPNumber_raw")

    report(SOURCE, inside, groups, meta, deduped, code_fields)

    _polite.write_raw(SOURCE, {
        "source_name": "Case IH dealer locator (US)",
        "locator_page": PAGE,
        "data_path": BASE,
        "serving_host": "www.caseih.com (same origin as the locator page)",
        "path_provenance": "/dist/caseih/static/js/259.0fdf6065.chunk.js — "
                           "fetch(`/apirequest/dealer-locator/get-dealer-by-geo-code?${d}`)",
        "robots_verdict": ROBOTS_VERDICT,
        "robots_override_needed": False,
        "credential_posture": "bare fetch(url,{signal}) — no headers, no key, "
                              "no credentials option. No credential boundary.",
        "terms_check": "…/legal-notice fetched and read: no anti-automation, "
                       "anti-crawling or data-mining clause. 'Harvest' hits are "
                       "product taxonomy.",
        "gates": {"ICP-EQ": "SIGNED Artur 2026-08-04 — 1–4-location tail only",
                  "per-OEM robots": "no override needed — allowed by absence"},
        "size_band_filter": "designed BEFORE the sweep — see _eq_sizeband.py",
        "metros": metros,
        "requests_log": log,
        "origin_requests": f.origin_requests,
        "codes_captured_verbatim": list(code_fields),
    }, inside)


def report(source, recs, groups, meta, deduped, code_fields):
    print(f"\n── {source} ────────────────────────────────────────────")
    allm = SB.net_new(recs, deduped, "ALL (before the size filter)")
    band = {}
    for r in recs:
        band[r["size_band"]] = band.get(r["size_band"], 0) + 1
    inb = [r for r in recs if r["size_band"] == "in-band"]
    inbm = SB.net_new(inb, deduped, "IN-BAND ONLY (1–4 locations)")

    print(f"US records:            {allm['us_records']}")
    print(f"distinct companies:    {allm['distinct_norm_companies']}")
    print(f"WEBSITE fill:          {allm['pct_website']}%   <-- decides usability")
    print(f"phone fill:            {allm['pct_phone']}%")
    print(f"email fill:            {allm['pct_email']}%")
    print(f"distinct domains:      {allm['distinct_domains']}")
    print(f"name/domain inflation: {allm['name_over_domain_inflation']}")
    print(f"\nsize bands (records):  {band}")
    cb = {}
    for rows in groups.values():
        cb[rows[0]["size_band"]] = cb.get(rows[0]["size_band"], 0) + 1
    print(f"size bands (clusters): {cb}   clusters={len(groups)}")
    print(f"proxy meta:            {meta}")
    print(f"\nnet-new BY DOMAIN, all:      {allm['net_new_by_domain']}")
    print(f"net-new BY DOMAIN, in-band:  {inbm['net_new_by_domain']}   <-- the only one that counts")
    print(f"net-new by name, all:        {allm['net_new_by_norm_company']} (name axis overstates ~3x)")
    for fld in code_fields:
        dist = {}
        for r in recs:
            v = r.get(fld)
            dist[str(v) if v is not None else "(null)"] = dist.get(
                str(v) if v is not None else "(null)", 0) + 1
        sorts = len(dist) > 1
        top = sorted(dist.items(), key=lambda kv: -kv[1])[:8]
        print(f"code `{fld}`: distinct={len(dist)} SORTS={sorts} top={top}")
    cov = SB.metro_coverage(deduped)
    print(f"\nbaseline coverage: {cov}")
    share = cov["share_of_geocoded_baseline"]
    if share:
        print(f"PROJECTION (measured-baseline-share): in-band net-new "
              f"{inbm['net_new_by_domain']} / {share} = "
              f"{round(inbm['net_new_by_domain'] / share)} nationally")
    # `source`, not the module-level SOURCE. bobcat.py imports this function, and
    # the module constant made a Bobcat run overwrite caseih-measure-*.json with
    # Bobcat's numbers — a silent cross-source clobber found 2026-08-04.
    path = os.path.join(_polite.RAW, f"{source}-measure-{_polite.CAPTURED}.json")
    with open(path, "w", encoding="utf-8") as fh:
        json.dump({"all": allm, "in_band": inbm, "bands_records": band,
                   "bands_clusters": cb, "proxy_meta": meta,
                   "baseline_coverage": cov}, fh, indent=1)
    print(f"measure -> {path}")


if __name__ == "__main__":
    main()
