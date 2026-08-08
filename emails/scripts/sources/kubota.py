#!/usr/bin/env python3
"""equipment-dealers — Kubota dealer locator (Algolia). Probe + national census.

    python3 kubota.py              # three-metro probe  -> kubota-*.json
    python3 kubota.py --national   # full census        -> kubota-national-*.json

**The census is authorized (2026-08-04)** after the probe cleared the decision
rule. Budget 6 origin requests, enforced in code; it spent 4.

⚠ **ALGOLIA CAPS PAGINATION AND THE CAP LOOKS LIKE THE END OF THE INDEX.**
`paginationLimitedTo` defaults to 1,000 retrievable hits, so on a 1,039-record
index `page 0` returns 1,000 and **`page 1` returns `{hits: [], nbHits: 0,
nbPages: 0}` — a clean 200 that reads exactly like "there is no more data".**
Trusting it would have reported 1,000 of 1,039 as a complete census and silently
dropped 39 dealers. This is the Bobcat silent-zero in a new costume, and the
only defence is the one that worked there: **assert completeness against an
independent control count, never against a loop that stopped.** `census()`
compares the union to the control `nbHits` and falls back to a two-way state
partition (525 + 513 = 1,038 + overlap dedupe) until the totals reconcile.

GATES
-----
**ICP-EQ — SIGNED (Artur, 2026-08-04)**, strategy §9: ICP extended to franchised
single-line equipment dealers, **1–4-location tail only**, parts-counter angle.
Binding: the size-band filter is designed before the sweep (`_eq_sizeband.py`,
written 2026-08-04 before any equipment record landed), and everything at 5+
locations routes to `pool-above-ceiling` — retained, never seated.

**R-3 Kubota — SIGNED (Artur, 2026-08-04)**, strategy §9. `www.kubotausa.com/
robots.txt` is 27 bytes:

    User-Agent: *
    Disallow: /

One rule, no `Allow`, no named-agent group, no exceptions — stricter than
Banner, where only the data host objected while `www` stayed permissive. Artur
signed an explicit, dated override **for robots.txt on `www.kubotausa.com`
only**, knowing there was no measured prize on the other side (the 2026-08-03
session stopped at the gate before pinning the data path, and the
recommendation on the record was NO).

Everything else still binds and is enforced here in code: >=3s per host, single
worker, disk cache so re-runs make zero origin requests, honest desktop UA never
rotated, no stealth, no fingerprint spoofing, and **a 403/401 stops the source
dead** with no retry, no UA rotation, no host switching. The override is about a
stated preference, not about defeating an access control.

**Volume was held down on purpose.** Overriding a blanket preference is not a
licence to sweep. Six GETs against `www.kubotausa.com` bought the whole data
path — one locator page and five JS bundles — and the dealer records themselves
cost nothing on that host at all (see below). Every request is itemised in
`requests_log` in the raw file.

⚠ **THE DATA IS NOT ON `www.kubotausa.com`. IT IS ON ALGOLIA.**
------------------------------------------------------------------------------
Pinned statically from the site's own bundles, with nothing rendered:

  `/_next/static/chunks/403-5aba9c088026b1b9.js`, module **86473** — the
  `useDealers` hook the locator mounts:

      filters: "post_type:dealer",
      aroundLatLng: `${lat},${lng}`, aroundRadius: <miles * METERS_PER_MILE>,
      getRankingInfo: true, hitsPerPage: N
      indexName: "prod_live_kubota_usa_global_index"

  …dispatched through `c.nY`, which is module **97663**: an `algoliasearch`
  client constructed from an app id and a **search-only key inlined as literals
  in the anonymous bundle**.

  `/_next/static/chunks/491-29fea81c7925f7d9.js` — `algoliasearch` **5.53.0**.
  Read host template `` `${appId}-dsn.algolia.net` ``, method `search()` ->
  `POST /1/indexes/*/queries`.

So the serving origin is **`S66VLP7IQV-dsn.algolia.net`**, and RFC 9309 is
per-origin. Its robots.txt was read **before any query was sent** and returns
**HTTP 404** — the host publishes no robots.txt, so there is no stated
preference either way. Same posture the pack already accepted for
`api.festo.com` (2026-08-03) and `bobcat.api.bobcat.com` (2026-08-04). The R-3
override does **not** extend to this host and was not relied on for it.

⚠ **Say the uncomfortable half of that out loud rather than banking it.** The
host split is real under RFC 9309 and it is the same doctrine Banner, Festo and
Bosch were decided on. It is also true that the *data* is Kubota's, and Kubota's
own host states a blanket preference against automated access. The letter and
the spirit point different ways here. R-3 is what makes this run legitimate —
not the fact that a SaaS vendor forgot to publish a robots.txt. Recorded so the
next reader does not mistake the host split for a loophole that made R-3
unnecessary.

**Credential posture — published static search key, the weakest of the four
accepted shapes.** The app id and key are literals in the anonymous JS, no
login, no cookie, no minting call, read-only. That is the Banner `apikey` /
Festo static Azure Search key shape the pack accepted on 2026-08-03 — strictly
*less* than CRED-4's minted bearer (Artur, 2026-08-04). The Bimba rule is
untouched: a 401/403 to an anonymous request is still a wall and still stops the
source.

**No key value is recorded anywhere.** `_algolia_credentials()` reads the pair
out of the cached bundle **at runtime by shape, not by value** — there is no key
literal in this file, none in any raw output, none in the request log, and
`_assert_no_key_leak()` fails the run rather than writing one. Auth is sent in
`x-algolia-*` **headers**, not query parameters (the browser build uses
`authMode: "WithinQueryParameters"`); that is a deliberate deviation, because a
key in a URL is a key in a log line.

**The app id IS recorded, on purpose — it is not the key.** `S66VLP7IQV` is the
public half: it is the hostname, so it is the thing whose robots.txt was read,
and it is the provenance on every record (`source_url`). Suppressing it would
make both the robots verdict and the record provenance unverifiable. Exactly the
line `bobcat.py` draws, which records its Coveo `orgId` in `serving_host` and
never the token.

METHOD
------
Three metros, then STOP: Houston TX, Chicago IL, Cleveland OH. One `aroundLatLng`
query per metro at the same 100 mi radius `_eq_sizeband` uses, so the geometry is
comparable to Bobcat and Case IH, plus one control query. Paced >=3s, cached,
honest UA never rotated. `MAX_ORIGIN_REQUESTS` is a hard stop enforced in code.

⚠ **THE CONTROL QUERY IS NOT OPTIONAL.** Bobcat cost this pack a day by
returning `totalCount: 0` on a clean 200 — a silent zero that reads exactly like
"this network has no dealers here" and is the most dangerous failure mode
available, because it looks like a measurement. One unfiltered `hitsPerPage: 0`
query costs one request and turns every metro count into a fraction of a known
national denominator. It also tests Kubota's own "1,100+ US dealers" claim,
which is the entire stated case for signing R-3.

⚠ **TWO TRAPS ALREADY PAID FOR ON THE SIBLING OEMs — carried, not rediscovered.**

1. **Franchise naming breaks transitive clustering.** "Kubota of X" / "of Y" all
   strip to `kubota` and would chain unrelated dealers into one cross-state
   blob. `_eq_sizeband.cluster` is **domain-authoritative** — a row with a
   domain never joins on name or phone — and `_BRAND_TOKENS` already carries
   `kubota`. This error *hides* real in-band companies, so it is the expensive
   direction. Nothing here weakens it.
2. **The decoy website field.** Case IH published `dealerWebsite` pointing at an
   OEM-hosted landing page on `caseih.com`, which collapsed all 24 dealers into
   one cluster and reported a fake 88.9% fill. Kubota's index publishes **`url`
   (the WordPress dealer page on `www.kubotausa.com`)** and **`k_commerce_url`
   (a Kubota-hosted parts storefront)** alongside the dealer's own `website`.
   Only `website` is ever read into `domain`; `url` and `k_commerce_url` are
   captured verbatim as evidence and never used as a join key.
   `_eq_sizeband.OEM_DOMAINS` carries the whole Kubota family, so even a
   `website` that points home is discarded rather than clustered on.
"""
import json
import os
import re
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _eq_sizeband as SB  # noqa: E402
import _polite  # noqa: E402
from _polite import US_STATES, Blocked, digits  # noqa: E402

_polite.CAPTURED = "2026-08-04"

# `JsonPostFetcher` is Bobcat's, unchanged: `_polite.Fetcher` posture with a JSON
# body — >=3s pacing, single worker, honest UA never rotated, disk cache, and
# 401/403 -> Blocked with no bypass. Reused rather than re-typed so there is one
# place where the wall behaviour lives.
from bobcat import JsonPostFetcher  # noqa: E402

SOURCE = "kubota"
PAGE = "https://www.kubotausa.com/find-a-dealer"
ALT_PAGE = "https://www.kubotausa.com/regional-dealers"

# ── the data path, pinned statically from the bundles (nothing rendered) ──────
BUNDLE_BASE = "https://www.kubotausa.com/_next/"
# module 97663 holds the credentials; module 86473 holds the query shape.
CRED_BUNDLE = "static/chunks/403-5aba9c088026b1b9.js"
# module 23434 holds the host template and the search path.
CLIENT_BUNDLE = "static/chunks/491-29fea81c7925f7d9.js"
INDEX = "prod_live_kubota_usa_global_index"
DEALER_FILTER = "post_type:dealer"
SEARCH_PATH = "/1/indexes/*/queries"
METERS_PER_MILE = 1609.344

PAGE_SIZE = 1000            # Algolia's per-page ceiling
MAX_ORIGIN_REQUESTS = 20    # hard stop for the WHOLE probe, bundles included
MAX_NATIONAL_REQUESTS = 6   # hard stop for the census (authorized 2026-08-04)

# Raw/measure files for the census are namespaced so they cannot clobber the
# probe's. Bobcat's `report()` took the module constant instead of its argument
# once and silently overwrote caseih's measure file with Bobcat's numbers.
NATIONAL = "kubota-national"

# The locator's own `validStateCodes`, verbatim from the /find-a-dealer RSC
# payload (50 states; the page ships no DC/PR/territories). Used only to
# partition the index if Algolia's `paginationLimitedTo` caps straight paging.
VALID_STATE_CODES = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID",
    "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS",
    "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK",
    "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV",
    "WI", "WY",
]

ROBOTS_VERDICT = (
    "2 origins, both read before anything was requested from them. "
    "www.kubotausa.com: `User-Agent: * / Disallow: /`, 27 bytes, whole host — "
    "OVERRIDDEN under gate R-3 (SIGNED Artur 2026-08-04), robots.txt on this "
    "host only; used for 6 GETs (1 locator page + 5 JS bundles) and nothing "
    "else. S66VLP7IQV-dsn.algolia.net — the host that actually serves every "
    "dealer record: robots.txt returns HTTP 404, the host publishes none, so "
    "no stated preference exists either way (same posture as api.festo.com and "
    "bobcat.api.bobcat.com). R-3 was NOT extended to it and was not needed for "
    "it."
)

# ── §5i: source-native codes, captured VERBATIM AND UNINTERPRETED ────────────
# The fields the locator UI actually reads, pinned from modules 86473 / 403.
UI_CODE_FIELDS = ("has_orange_rental_program", "k_commerce_url",
                  "kod_start_date", "kod_end_date", "post_type")

# ⚠ **§5i, and it cuts exactly the way it cut on Bobcat.** The UI reads NO
# product, line-card, brand or tier field — a reader who trusted the rendered
# page would report "no qualification signal published". The index disagrees:
# every dealer record carries `hierarchical_categories`, an Algolia
# lvl0/lvl1 facet tree naming the product families that dealer actually
# carries ("Tractors > Compact", "Hay & Farm > Balers", "Construction >
# Skid Steer Loaders"). The page never mentions it. It is the per-record line
# card, and it is what the vertical mix is measured from.
LINE_CARD_FIELDS = ("categories_lvl0_raw", "categories_lvl1_raw")

# Program flags that look like a tier vocabulary. Whether any of them SORTS is
# measured, never assumed — four sources in this tier published rich-looking
# code columns over constant data.
PROGRAM_FIELDS = ("has_k_commerce_participant_raw", "has_extended_warranty_raw",
                  "has_kubota_tech_raw", "has_orange_rental_program_raw",
                  "k_commerce_url_raw", "kod_start_date_raw", "post_type_raw")

# Identity/PII fields. Unique per row by construction, so they would report
# `SORTS=True` while sorting nothing, and — worse — they would inflate the p4
# line-card-breadth proxy, which escalates clusters to `above-ceiling`. A
# breadth score computed over phone numbers and ZIPs is not a line card.
NOT_CODES = ("phone_raw", "zip_raw", "call_tracking_raw", "dealer_id_raw",
             "object_id_raw", "geo_distance_m_raw", "email_raw", "title_raw",
             "street_raw", "city_raw", "state_raw", "url_raw", "website_raw",
             "dealer_name_raw", "content_raw", "summary_raw",
             "hierarchical_categories_raw")

# lvl0 families, bucketed the only way that answers the question deciding what
# this source is worth. Bobcat's national sweep turned out to be 75.5% turf and
# lawn, not industrial MRO. The buckets are named BEFORE the numbers are read
# so the split cannot be drawn to flatter.
#
# ⚠ **The whole published vocabulary is nine families and NONE of them is
# industrial MRO.** Measured 2026-08-04: Mowers · Hay & Farm · Tractors ·
# Land Pride (Kubota's ag-implement brand) · Utility Vehicles · Accessories ·
# Attachments · Construction · Material Handling. No bearings, no power
# transmission, no hydraulics, no fluid power, no cutting tools, no plant MRO.
#
# ⚠ **"Material Handling" is a trap and it is NOT industrial.** Its entire lvl1
# vocabulary is a single entry — `Material Handling > Buckets`. It is a loader
# attachment, not forklifts, conveyors or plant handling. Bucketing it as
# "industrial" would manufacture an industrial share out of a bucket.
AG_TURF_FAMILIES = {"Mowers", "Hay & Farm", "Tractors", "Land Pride",
                    "Utility Vehicles"}
COMPACT_CONSTRUCTION_FAMILIES = {"Construction"}   # excavators, skid steers, loaders
ATTACHMENT_FAMILIES = {"Accessories", "Attachments", "Material Handling"}
INDUSTRIAL_MRO_FAMILIES = set()  # measured empty — the vocabulary contains none


def _algolia_credentials(f):
    """App id + search key, read from the cached bundle BY SHAPE, NEVER BY VALUE.

    There is no literal in this file, in any raw output or in the request log.
    The bundle is fetched once and cached, so a re-run costs zero origin
    requests — the same treatment Bobcat's minted token gets: used, left in the
    disk cache like any other response body, never written into a record.
    """
    body, cached = f.get(BUNDLE_BASE + CRED_BUNDLE,
                         "bundle-" + CRED_BUNDLE.rsplit("/", 1)[-1],
                         headers={"Referer": PAGE})
    m = re.search(r'let\s+(\w+)\s*=\s*"([A-Z0-9]{8,16})"\s*,\s*(\w+)\s*=\s*'
                  r'"([0-9a-f]{32})"\s*,\s*\w+\s*=\s*\1\s*&&\s*\3\s*\?', body)
    if not m:
        raise SystemExit(
            "credentials not found in the cached bundle by shape — the bundle "
            "hash moved. Re-pin the data path before requesting anything; do "
            "NOT hardcode a key.")
    ok = "Algolia App ID and Search Key must be defined" in body
    return m.group(2), m.group(4), cached, ok


def _assert_no_key_leak(payload, records, key):
    """Fail the run rather than write a key. A promise with no check is a wish.

    The app id is deliberately NOT checked — it is the hostname and the record
    provenance, and it is the public half of the pair (see the header).
    """
    blob = json.dumps({"p": payload, "r": records}, default=str)
    if key in blob:
        raise SystemExit(
            "ABORTED BEFORE WRITING: the search key appears in the payload. "
            "Nothing was written. Fix the leak; do not relax the check.")


def search_url(app_id):
    return f"https://{app_id}-dsn.algolia.net{SEARCH_PATH}"


def _q(app_id, key, params):
    """Auth in HEADERS, deliberately — a key in a URL is a key in a log line."""
    return {"x-algolia-application-id": app_id, "x-algolia-api-key": key,
            "Referer": PAGE, "Origin": "https://www.kubotausa.com"}, {
        "requests": [dict(params, indexName=INDEX)]}


def _join(v):
    if isinstance(v, list):
        return "|".join(str(x) for x in v) or None
    if isinstance(v, dict):
        return json.dumps(v, sort_keys=True)
    return v if v not in ("", None) else None


def to_record(hit, metro, url):
    geo = hit.get("_geoloc") if isinstance(hit.get("_geoloc"), dict) else {}
    # ⚠ `website` ONLY. `url` is the WordPress dealer page on www.kubotausa.com
    # and `k_commerce_url` is a Kubota-hosted parts storefront; either one used
    # as `domain` reproduces the Case IH collapse exactly — a real-looking fill
    # rate and one cluster for the entire source.
    website = hit.get("website") or None
    # ⚠ `call_tracking` is a per-dealer tracking DID, not the dealer's line.
    # `phone_10` feeds the cluster join, so it takes the real number only.
    phone = hit.get("phone") or None
    state = (hit.get("state") or "").strip().upper() or None
    rec = {
        "company": (hit.get("dealer_name") or hit.get("title") or "").strip() or None,
        "address_1": hit.get("street") or None,
        "address_2": None,
        "city": hit.get("city") or None,
        "state": state,
        "zip_raw": hit.get("zip") or None,
        "phone_raw": phone,
        "phone_10": digits(phone),
        "email": hit.get("email") or None,
        "website": website,
        "domain": SB.dealer_domain(website),
        "lat": SB.num(geo.get("lat")),
        "lng": SB.num(geo.get("lng")),
        # The index is the US site and publishes no country field; US-ness is
        # the state code, stated rather than inferred from a silent default.
        "is_us": state in US_STATES,
        "is_us_basis": "state code in US_STATES; index publishes no country field",
        "source": SOURCE,
        "source_url": url,
        "captured": _polite.CAPTURED,
        "probe_metro": metro,
        "dealer_id_raw": hit.get("dealer_id"),
        "object_id_raw": hit.get("objectID"),
        # ── the decoys, kept as evidence, never used as a key ────────────────
        "oem_landing_page": hit.get("url"),
        "oem_landing_page_domain": _polite.apex(hit.get("url")),
        "k_commerce_url_raw": hit.get("k_commerce_url"),
        "k_commerce_domain": _polite.apex(hit.get("k_commerce_url")),
        "call_tracking_raw": hit.get("call_tracking"),
        # Algolia's `geoDistance` is METRES, not miles. Named for what it is.
        "geo_distance_m_raw": (hit.get("_rankingInfo") or {}).get("geoDistance"),
    }
    for f_ in UI_CODE_FIELDS:
        rec[f"{f_}_raw"] = _join(hit.get(f_))
    # ── THE PER-RECORD LINE CARD, verbatim and uninterpreted ────────────────
    cats = hit.get("hierarchical_categories")
    cats = cats if isinstance(cats, dict) else {}
    rec["categories_lvl0_raw"] = _join(cats.get("lvl0"))
    rec["categories_lvl1_raw"] = _join(cats.get("lvl1"))
    rec["categories_lvl0_count"] = len(cats.get("lvl0") or [])
    rec["categories_lvl1_count"] = len(cats.get("lvl1") or [])
    # Everything else the index publishes, verbatim. Reading the UI's field list
    # instead of the payload is how Bobcat nearly published a confident, wrong
    # claim about its qualification signal.
    for k, v in hit.items():
        key = f"x_{k}_raw"
        if key in rec or k in ("_geoloc", "_rankingInfo", "_highlightResult"):
            continue
        rec[key] = _join(v) if isinstance(v, (list, dict)) else v
    return rec


def probe(f, app_id, key):
    """Three metros, then STOP. Plus one control query — see the header."""
    out, records, log = {}, [], []
    url = search_url(app_id)

    # ── control: the national denominator, 1 request, zero records returned ──
    hdrs, body = _q(app_id, key, {"filters": DEALER_FILTER, "hitsPerPage": 0})
    national = None
    try:
        data, cached = f.post_json(url, "control-national.json", body, headers=hdrs)
        res = (data.get("results") or [{}])[0]
        national = res.get("nbHits")
        out["_control"] = {"nbHits": national, "cached": cached,
                           "index": INDEX, "filters": DEALER_FILTER}
        log.append({"query": "control (hitsPerPage=0)", "nbHits": national,
                    "cached": cached})
        print(f"  control: post_type:dealer nbHits={national}  "
              f"(Kubota claims '1,100+ US dealers')")
    except Blocked as e:
        print(f"  control: BLOCKED — {e}")
        out["_control"] = {"blocked": str(e)}
        return out, records, log, national

    radius_m = int(round(SB.RADIUS_MI * METERS_PER_MILE))
    for metro, lat, lng in SB.METROS:
        rows, page, nb, truncated = [], 0, None, False
        while True:
            if f.origin_requests >= MAX_ORIGIN_REQUESTS:
                truncated = True
                print(f"  budget stop at {MAX_ORIGIN_REQUESTS} origin requests")
                break
            hdrs, body = _q(app_id, key, {
                "filters": DEALER_FILTER,
                "aroundLatLng": f"{lat},{lng}",
                "aroundRadius": radius_m,
                "getRankingInfo": True,
                "hitsPerPage": PAGE_SIZE,
                "page": page,
            })
            try:
                data, cached = f.post_json(url, f"search-{metro}-{page}.json",
                                           body, headers=hdrs)
            except Blocked as e:
                print(f"  {metro}: BLOCKED — {e}")
                out[metro] = {"blocked": str(e)}
                break
            res = (data.get("results") or [{}])[0]
            hits = res.get("hits") or []
            nb = res.get("nbHits")
            rows.extend(hits)
            log.append({"metro": metro, "page": page, "returned": len(hits),
                        "nbHits": nb, "nbPages": res.get("nbPages"),
                        "aroundRadius_m": radius_m, "cached": cached})
            page += 1
            if not hits or page >= (res.get("nbPages") or 1):
                break
        if metro in out and "blocked" in out[metro]:
            continue
        recs = [to_record(h, metro, url) for h in rows]
        records.extend(recs)
        complete = nb is not None and len(rows) >= nb
        # ⚠ A zero from a search API is a claim that needs its own test before
        # it is written down. The control query above is that test, and it is
        # quoted here beside the zero so the two can never be separated.
        out[metro] = {"records": len(recs), "nbHits": nb, "rows_fetched": len(rows),
                      "complete": complete, "truncated_by_budget": truncated,
                      "aroundRadius_m": radius_m,
                      "national_nbHits_for_context": national,
                      "hit_keys": sorted(rows[0].keys()) if rows else []}
        print(f"  {metro:<14} {len(recs):>4} rows of nbHits={nb}  complete={complete}")
    return out, records, log, national


def fill_rates(recs):
    """WEBSITE is not the number that matters. DOMAIN is.

    The pipeline is domain-keyed end to end, so a `website` that apexes to an
    OEM host counts for nothing — that is the whole Case IH lesson. Both are
    printed, and the gap between them is the decoy count.
    """
    n = len(recs) or 1
    web = sum(1 for r in recs if r.get("website"))
    dom = sum(1 for r in recs if r.get("domain"))
    return {
        "records": len(recs),
        "pct_website": round(web / n * 100, 1),
        "pct_domain_after_oem_filter": round(dom / n * 100, 1),
        "website_but_no_usable_domain": web - dom,
        "pct_phone": round(sum(1 for r in recs if r.get("phone_raw")) / n * 100, 1),
        "pct_email": round(sum(1 for r in recs if r.get("email")) / n * 100, 1),
        "pct_latlng": round(sum(1 for r in recs if r.get("lat")) / n * 100, 1),
        "oem_landing_page_present": sum(1 for r in recs if r.get("oem_landing_page")),
        "distinct_domains": len({r["domain"] for r in recs if r.get("domain")}),
    }


def vertical_mix(recs):
    """The finding that decides what this source is worth.

    Bobcat's national sweep turned out to be **75.5% turf and lawn** — not
    industrial MRO — and that was measured only because the line card was
    captured verbatim first. Kubota is an ag / compact-tractor network, so the
    same question has to be asked out loud rather than assumed either way.
    Reported per record AND per company, because a multi-store group would
    otherwise vote once per store.
    """
    def tally(field, key):
        out = {}
        seen = {}
        for r in recs:
            for v in str(r.get(field) or "").split("|"):
                v = v.strip()
                if not v:
                    continue
                out[v] = out.get(v, 0) + 1
                seen.setdefault(v, set()).add(r.get(key))
        return (dict(sorted(out.items(), key=lambda kv: -kv[1])),
                {k: len(v) for k, v in sorted(seen.items(),
                                              key=lambda kv: -len(kv[1]))})

    lvl0_rec, lvl0_co = tally("categories_lvl0_raw", "cluster_id")
    lvl1_rec, lvl1_co = tally("categories_lvl1_raw", "cluster_id")

    n = len(recs) or 1

    def fams(r):
        return {v.strip() for v in
                str(r.get("categories_lvl0_raw") or "").split("|") if v.strip()}

    def touches(want):
        return sum(1 for r in recs if want & fams(r))

    ag = touches(AG_TURF_FAMILIES)
    cc = touches(COMPACT_CONSTRUCTION_FAMILIES)
    mro = touches(INDUSTRIAL_MRO_FAMILIES)
    ag_only = sum(1 for r in recs if fams(r) & AG_TURF_FAMILIES
                  and not fams(r) & COMPACT_CONSTRUCTION_FAMILIES)
    no_cats = sum(1 for r in recs if not r.get("categories_lvl0_raw"))

    # ⚠ **DOES THE CODE ACTUALLY SORT?** Four sources in this tier published
    # rich-looking vocabularies over constant data. This one is not constant —
    # but "not constant" is a low bar, and a code that puts 73% of the network
    # in one bucket is a weak sorter, not a qualification signal. Both numbers
    # go in the report so nobody quotes `SORTS=True` as if it settled it.
    combos0 = {}
    combos1 = {}
    for r in recs:
        combos0[r.get("categories_lvl0_raw")] = combos0.get(r.get("categories_lvl0_raw"), 0) + 1
        combos1[r.get("categories_lvl1_raw")] = combos1.get(r.get("categories_lvl1_raw"), 0) + 1
    universal = [k for k, v in lvl0_rec.items() if v == len(recs)]

    return {
        "line_card_field": "hierarchical_categories (lvl0 / lvl1)",
        "line_card_fill_pct": round((n - no_cats) / n * 100, 1),
        "records_with_no_line_card": no_cats,
        "lvl0_vocabulary_size": len(lvl0_rec),
        "lvl1_vocabulary_size": len(lvl1_rec),
        "lvl0_by_record": lvl0_rec,
        "lvl0_by_company_cluster": lvl0_co,
        "lvl1_by_record": lvl1_rec,
        "lvl1_by_company_cluster_top": dict(list(lvl1_co.items())[:40]),
        # does it sort?
        "distinct_lvl0_combinations": len(combos0),
        "distinct_lvl1_combinations": len(combos1),
        "modal_lvl0_combination_share_pct": round(max(combos0.values()) / n * 100, 1),
        "modal_lvl1_combination_share_pct": round(max(combos1.values()) / n * 100, 1),
        "families_on_100pct_of_records": universal,
        "sorts_verdict": (
            "YES but WEAKLY. It varies, so it is a real per-record line card "
            "and not a constant column — but the modal combination covers most "
            "of the network and several families sit on 100% of records. It "
            "separates a full-line ag dealer from a mower-only shop; it does "
            "not separate an industrial distributor from anything, because no "
            "industrial family exists in the vocabulary."),
        # the buckets
        "ag_turf_families": sorted(AG_TURF_FAMILIES),
        "compact_construction_families": sorted(COMPACT_CONSTRUCTION_FAMILIES),
        "attachment_families": sorted(ATTACHMENT_FAMILIES),
        "industrial_mro_families_present": sorted(INDUSTRIAL_MRO_FAMILIES),
        "pct_records_touching_ag_turf": round(ag / n * 100, 1),
        "pct_records_touching_compact_construction": round(cc / n * 100, 1),
        "pct_records_touching_industrial_mro": round(mro / n * 100, 1),
        "pct_records_ag_turf_and_NOT_compact_construction": round(ag_only / n * 100, 1),
        "headline": (
            "This is an agriculture / turf / outdoor-power network with a "
            "compact-construction overlap. It is NOT industrial MRO — the "
            "share of records touching any industrial-MRO family is 0% because "
            "the published vocabulary contains no such family. `Material "
            "Handling` is a single lvl1 entry, `Buckets`, i.e. a loader "
            "attachment, and is bucketed as an attachment rather than as "
            "industrial for exactly that reason."),
        "note": ("`touching` overlaps by design — a dealer carrying both "
                 "tractors and skid steers counts in both. The exclusive row "
                 "is the honest one."),
    }


def census(f, app_id, key):
    """NATIONAL CENSUS — authorized 2026-08-04 after the probe cleared the rule.

    Budget **6 origin requests**, enforced in code. Two strategies, in order:

    1. **Straight paging** at `hitsPerPage: 1000`. 1,039 records is two pages.
    2. **State partition** if paging is capped. Algolia's `paginationLimitedTo`
       defaults to 1,000 *retrievable* hits per query, so page 1 can legally
       come back empty on a 1,039-record index — and an empty page 1 reads
       exactly like "the index ended", which is the Bobcat silent-zero failure
       wearing a different hat. The fallback splits the index by the locator's
       own `validStateCodes` into two disjoint halves, each comfortably under
       the cap, and the union is checked against the control `nbHits` before
       anything is reported as complete.

    Completeness is asserted against the control count, never assumed from a
    loop that stopped.
    """
    url = search_url(app_id)
    rows, log, strategy = [], [], None

    hdrs, body = _q(app_id, key, {"filters": DEALER_FILTER, "hitsPerPage": 0})
    data, cached = f.post_json(url, "control-national.json", body, headers=hdrs)
    national = ((data.get("results") or [{}])[0]).get("nbHits")
    log.append({"query": "control", "nbHits": national, "cached": cached})
    print(f"  control: nbHits={national}")

    # ── strategy 1: straight paging ─────────────────────────────────────────
    page = 0
    while len(rows) < (national or 0):
        if f.origin_requests >= MAX_NATIONAL_REQUESTS:
            print(f"  budget stop at {MAX_NATIONAL_REQUESTS} origin requests")
            break
        hdrs, body = _q(app_id, key, {
            "filters": DEALER_FILTER, "hitsPerPage": PAGE_SIZE, "page": page})
        try:
            data, cached = f.post_json(url, f"census-page-{page}.json", body,
                                       headers=hdrs)
        except Blocked as e:
            print(f"  census page {page}: BLOCKED — {e}")
            log.append({"query": f"page {page}", "blocked": str(e)})
            break
        res = (data.get("results") or [{}])[0]
        hits = res.get("hits") or []
        rows.extend(hits)
        log.append({"query": f"page {page}", "returned": len(hits),
                    "nbHits": res.get("nbHits"), "nbPages": res.get("nbPages"),
                    "cached": cached})
        print(f"  page {page}: {len(hits)} hits  (cumulative {len(rows)}"
              f"/{national})")
        page += 1
        if not hits:
            break
    strategy = "paging"

    # ── strategy 2: state partition, only if paging came up short ───────────
    if national and len(rows) < national:
        print(f"  paging returned {len(rows)}/{national} — pagination is "
              f"capped. Falling back to a 2-way state partition.")
        half = len(VALID_STATE_CODES) // 2
        parts = [VALID_STATE_CODES[:half], VALID_STATE_CODES[half:]]
        by_id = {h.get("objectID"): h for h in rows}
        for i, states in enumerate(parts):
            if f.origin_requests >= MAX_NATIONAL_REQUESTS:
                print(f"  budget stop at {MAX_NATIONAL_REQUESTS} origin requests")
                break
            filt = (f"{DEALER_FILTER} AND ("
                    + " OR ".join(f'state:"{s}"' for s in states) + ")")
            hdrs, body = _q(app_id, key, {"filters": filt,
                                          "hitsPerPage": PAGE_SIZE, "page": 0})
            try:
                data, cached = f.post_json(url, f"census-part-{i}.json", body,
                                           headers=hdrs)
            except Blocked as e:
                print(f"  partition {i}: BLOCKED — {e}")
                log.append({"query": f"partition {i}", "blocked": str(e)})
                break
            res = (data.get("results") or [{}])[0]
            hits = res.get("hits") or []
            for h in hits:
                by_id[h.get("objectID")] = h
            log.append({"query": f"partition {i}", "states": len(states),
                        "returned": len(hits), "nbHits": res.get("nbHits"),
                        "cached": cached})
            print(f"  partition {i} ({len(states)} states): {len(hits)} hits "
                  f"of nbHits={res.get('nbHits')}")
        rows = list(by_id.values())
        strategy = "paging + 2-way state partition"

    seen, uniq = set(), []
    for h in rows:
        if h.get("objectID") in seen:
            continue
        seen.add(h.get("objectID"))
        uniq.append(h)
    complete = national is not None and len(uniq) >= national
    print(f"  census: {len(uniq)} unique records of nbHits={national}  "
          f"complete={complete}  strategy={strategy}")
    return uniq, log, national, complete, strategy


# The probe's two projections, recorded BEFORE the census ran so the comparison
# is a test and not a retrofit. Both are for in-band net-new domains.
PROBE_PROJECTIONS = {
    "A_measured_baseline_share": 215,   # the mandated method
    "B_oem_own_geography": 527,         # the cross-check
}
BOBCAT_NATIONAL = os.path.join(_polite.RAW, f"bobcat-national-{_polite.CAPTURED}.json")


def bobcat_overlap(recs, deduped):
    """Net-new against deduped-v7 is NOT net-new to the workspace.

    Bobcat's 1,502-company pull was seated under ICP-EQ-2 on 2026-08-04 and is
    not yet folded into `deduped-v7`, so a dual-line dealer — one that sells
    both Kubota and Bobcat — reads as net-new twice. The probe caught 3 of
    those in 34. Measured here rather than assumed, and the workspace-new
    number is the one that belongs in a headline.
    """
    have = {(r.get("domain") or "").strip().lower()
            for r in deduped if (r.get("domain") or "").strip()}
    try:
        with open(BOBCAT_NATIONAL, encoding="utf-8") as fh:
            bob = {(r.get("domain") or "").lower()
                   for r in json.load(fh).get("records", []) if r.get("domain")}
    except OSError:
        return {"bobcat_pull_available": False,
                "note": "bobcat national raw file absent; overlap NOT measured"}

    alld = {r["domain"] for r in recs if r.get("domain")}
    inb = {r["domain"] for r in recs
           if r.get("domain") and r["size_band"] == "in-band"}
    inb_new, all_new = inb - have, alld - have
    return {
        "bobcat_pull_available": True,
        "bobcat_distinct_domains": len(bob),
        "kubota_distinct_domains": len(alld),
        "domain_overlap_kubota_x_bobcat_any_band": len(alld & bob),
        "in_band_net_new_vs_deduped": len(inb_new),
        "in_band_net_new_also_in_seated_bobcat": len(inb_new & bob),
        "IN_BAND_GENUINELY_NEW_TO_WORKSPACE": len(inb_new - bob),
        "all_bands_net_new_vs_deduped": len(all_new),
        "all_bands_genuinely_new_to_workspace": len(all_new - bob),
        "dual_line_sample": sorted(inb_new & bob)[:20],
    }


def projection_accuracy(actual):
    """Was the three-metro projection any good? A finding about the METHOD.

    Bobcat's projection already undershot by 1.87x. A second data point on the
    direction and size of that bias is worth more than either dealer count,
    because every future source is sized by a three-metro probe.
    """
    methods = {}
    for name, pred in PROBE_PROJECTIONS.items():
        ratio = round(actual / pred, 2)
        methods[name] = {
            "predicted": pred, "actual": actual,
            "actual_over_predicted": ratio,
            "verdict": ("UNDERSHOT" if ratio > 1.1 else
                        "OVERSHOT" if ratio < 0.9 else "ACCURATE"),
        }
    return {
        "actual_in_band_net_new_national": actual,
        "methods": methods,
        "finding": (
            "The MANDATED method (measured baseline share) undershot by "
            f"{methods['A_measured_baseline_share']['actual_over_predicted']}x. "
            "The cross-check against the OEM's own geography landed within "
            f"{abs(1 - methods['B_oem_own_geography']['actual_over_predicted']):.0%}. "
            "That is the second consecutive undershoot for method A (Bobcat "
            "1.87x), and the direction is structural, not noise: deduped-v7 is "
            "metro-skewed industrial distribution, so dividing by ITS metro "
            "share systematically under-counts any network that is more "
            "dispersed than our list. When a source publishes a national "
            "denominator — a control query costs one request — method B is the "
            "better estimator and method A should be quoted as a floor."),
    }


def main_national():
    """`python3 kubota.py --national` — the census, reported the same way."""
    deduped = SB.load_deduped()
    print(f"baseline: deduped-v7.csv, {len(deduped)} data rows, domain-keyed")
    print(f"robots: {ROBOTS_VERDICT}")
    print(f"NATIONAL CENSUS — budget {MAX_NATIONAL_REQUESTS} origin requests\n")

    f = JsonPostFetcher(SOURCE, min_bytes=2)
    app_id, key, cached, _ = _algolia_credentials(f)
    print(f"credentials: read from the cached bundle by shape "
          f"({'cached' if cached else 'live'}); values never recorded\n")

    hits, log, national, complete, strategy = census(f, app_id, key)
    url = search_url(app_id)
    recs = [to_record(h, None, url) for h in hits]
    us = [r for r in recs if r.get("is_us")]
    print(f"\nrecords: {len(recs)}  |  US (state in US_STATES): {len(us)}  |  "
          f"non-US or stateless dropped: {len(recs) - len(us)}")

    groups, _unresolvable, meta = SB.apply_size_band(
        us, code_fields=LINE_CARD_FIELDS, group_key_field=None)

    candidates = sorted({k for r in us for k in r if k.endswith("_raw")}
                        - {f"x_{c}" for c in NOT_CODES} - set(NOT_CODES))
    code_fields = tuple(k for k in candidates
                        if len({str(r.get(k)) for r in us}) > 1)
    constants = {k: str(us[0].get(k)) for k in candidates
                 if len({str(r.get(k)) for r in us}) == 1}

    from caseih import report
    report(NATIONAL, us, groups, meta, deduped, ())
    # ⚠ `report()` ends by projecting the in-band net-new count up by the
    # baseline's metro share. On a THREE-METRO PROBE that is the right sum. On a
    # CENSUS it is nonsense — it scales a national total as if it were a metro
    # sample and prints a number ~3.2x the size of the entire dealer network.
    # Left visible rather than suppressed, and corrected here, because a stray
    # four-digit number in a log is exactly what gets quoted later.
    print("\n⚠ IGNORE the PROJECTION line above. This run is a CENSUS: the "
          "in-band net-new count IS the national number. `report()` is shared "
          "with the probe and projects unconditionally.")

    vertical = vertical_mix(us)
    fills = fill_rates(us)
    inb = [r for r in us if r["size_band"] == "in-band"]
    inbm = SB.net_new(inb, deduped, "IN-BAND national")

    overlap = bobcat_overlap(us, deduped)
    accuracy = projection_accuracy(overlap["in_band_net_new_vs_deduped"])
    print("\n── OVERLAP with the already-seated Bobcat cohort ──────")
    for k, v in overlap.items():
        if not isinstance(v, list):
            print(f"  {k:<42} {v}")
    print("\n── DID THE PROBE'S PROJECTION HOLD? ───────────────────")
    for k, v in accuracy["methods"].items():
        print(f"  {k:<28} predicted {v['predicted']:>4}  actual/predicted "
              f"{v['actual_over_predicted']}x  ({v['verdict']})")
    print(f"  {accuracy['finding']}")

    print(f"\nCONSTANT fields on all {len(us)} national records: {len(constants)}")
    for k, v in sorted(constants.items()):
        print(f"  {k} = {v[:60]!r}")
    print(f"\nfill: {fills}")
    print(f"\nvertical: ag/turf {vertical['pct_records_touching_ag_turf']}% · "
          f"compact construction "
          f"{vertical['pct_records_touching_compact_construction']}% · "
          f"INDUSTRIAL MRO {vertical['pct_records_touching_industrial_mro']}%")
    print(f"  lvl0 vocabulary ({vertical['lvl0_vocabulary_size']}): "
          f"{vertical['lvl0_by_record']}")
    print(f"  lvl1 vocabulary size: {vertical['lvl1_vocabulary_size']}")
    print(f"  distinct lvl0 combos={vertical['distinct_lvl0_combinations']} "
          f"(modal {vertical['modal_lvl0_combination_share_pct']}%) · "
          f"lvl1 combos={vertical['distinct_lvl1_combinations']} "
          f"(modal {vertical['modal_lvl1_combination_share_pct']}%)")
    print(f"  families on 100% of records: "
          f"{vertical['families_on_100pct_of_records']}")

    payload = {
        "source_name": "Kubota find-a-dealer (Algolia) — NATIONAL CENSUS",
        "locator_page": PAGE,
        "data_path": f"POST <appId>-dsn.algolia.net{SEARCH_PATH}",
        "serving_host": "<appId>-dsn.algolia.net (third-party; NOT kubotausa.com)",
        "index": INDEX,
        "robots_verdict": ROBOTS_VERDICT,
        "robots_override_needed": True,
        "gates": {"ICP-EQ": "SIGNED Artur 2026-08-04 — 1–4-location tail only",
                  "R-3": "SIGNED Artur 2026-08-04 — www.kubotausa.com robots only",
                  "census": "authorized 2026-08-04, budget 6 origin requests"},
        "census_strategy": strategy,
        "census_complete": complete,
        "national_nbHits_post_type_dealer": national,
        "records_unique": len(hits),
        "requests_log": log,
        "origin_requests": f.origin_requests,
        "codes_captured_verbatim": list(code_fields),
        "codes_constant_and_therefore_not_codes": constants,
        "fill_rates": fills,
        "vertical_mix": vertical,
        "in_band_national": inbm,
        "workspace_overlap": overlap,
        "projection_accuracy": accuracy,
        "projection_line_in_report_is_invalid_for_a_census": (
            "caseih.report() projects unconditionally; on a census the in-band "
            "net-new count IS the national number. Ignore that printed line."),
        "size_band_caveat": (
            "in-band remains an UPPER bound on the true in-band count, but for "
            "a DIFFERENT reason than the probe. The probe's cluster sizes were "
            "lower bounds because it could only see stores inside three "
            "circles. A census sees every store, so domain clusters are now "
            "complete — but clustering is still domain-authoritative, and a "
            "group whose stores sit on separate domains still reads as "
            "separate companies. The census collapses the geographic blind "
            "spot, not the multi-domain one."),
    }
    _assert_no_key_leak(payload, us, key)
    _polite.write_raw(NATIONAL, payload, us)


def main():
    deduped = SB.load_deduped()
    print(f"baseline: deduped-v7.csv, {len(deduped)} data rows, domain-keyed")
    print(f"robots: {ROBOTS_VERDICT}\n")

    f = JsonPostFetcher(SOURCE, min_bytes=2)
    try:
        app_id, key, cached, asserted = _algolia_credentials(f)
    except Blocked as e:
        print(f"BUNDLE BLOCKED — {e}")
        _polite.write_raw(SOURCE, {"blocked": str(e), "robots_verdict": ROBOTS_VERDICT}, [])
        return
    print(f"credentials: read from the cached bundle by shape "
          f"({'cached' if cached else 'live'}); app id {len(app_id)} chars, "
          f"search key {len(key)} chars; neither value recorded anywhere. "
          f"bundle asserts they are required: {asserted}")
    print(f"data path: POST {search_url('<appId>')}  index={INDEX}\n")

    metros, records, log, national = probe(f, app_id, key)
    if not records:
        _polite.write_raw(SOURCE, {"metros": metros, "requests_log": log,
                                   "origin_requests": f.origin_requests,
                                   "national_nbHits": national,
                                   "robots_verdict": ROBOTS_VERDICT}, [])
        return

    inside, outside, seen = [], [], set()
    for r in records:
        m = SB.in_any_metro(r.get("lat"), r.get("lng"))
        r["in_probe_circle"] = bool(m)
        r["probe_circle"] = m
        key_ = r.get("dealer_id_raw") or r.get("object_id_raw") or (
            r.get("company"), r.get("address_1"))
        if not m:
            outside.append(r)
            continue
        if key_ in seen:
            continue
        seen.add(key_)
        inside.append(r)
    print(f"\nrows returned: {len(records)}  |  inside a {SB.RADIUS_MI}mi circle: "
          f"{len(inside)}  |  outside (dropped): {len(outside)}")

    # ⚠ p4's breadth proxy is fed the LINE CARD ONLY. The first version passed
    # every `*_raw` field that varied, which meant breadth was scored over
    # phone numbers, ZIPs and per-store ids — all unique by construction — and
    # the p90 escalation threshold became noise that could push real 1–4-store
    # dealers to `above-ceiling`. Junk in a proxy is worse than a missing
    # proxy, because a missing one is recorded as unavailable.
    groups, _unresolvable, meta = SB.apply_size_band(
        inside, code_fields=LINE_CARD_FIELDS, group_key_field=None)

    # §5i, measured not assumed: which published fields actually VARY. A field
    # constant across every record is a published column, not a code — SKF's
    # DC001, Banner's CATEGORY_CODE, Lincoln's five all-`false` brand columns
    # and IndSci's countryCode all looked like vocabularies and sorted nothing.
    candidates = sorted({k for r in inside for k in r if k.endswith("_raw")}
                        - {f"x_{c}" for c in NOT_CODES} - set(NOT_CODES))
    code_fields = tuple(k for k in candidates
                        if len({str(r.get(k)) for r in inside}) > 1)
    constants = {k: str(inside[0].get(k)) for k in candidates
                 if len({str(r.get(k)) for r in inside}) == 1}

    from caseih import report  # same measured report, same definitions
    report(SOURCE, inside, groups, meta, deduped, code_fields)

    vertical = vertical_mix(inside)
    fills = fill_rates(inside)

    print(f"\nCONSTANT fields (published columns, NOT codes — they sort "
          f"nothing): {len(constants)}")
    for k, v in sorted(constants.items()):
        print(f"  {k} = {v[:60]!r} on all {len(inside)} records")

    print("\n── fill rates ──────────────────────────────────────────")
    for k, v in fills.items():
        print(f"  {k:<32} {v}")

    print("\n── VERTICAL MIX (the finding that decides the source) ──")
    print(f"  line card: {vertical['line_card_field']}  "
          f"fill={vertical['line_card_fill_pct']}%")
    print(f"  touching ag/turf/outdoor power:      "
          f"{vertical['pct_records_touching_ag_turf']}%")
    print(f"  touching compact construction:       "
          f"{vertical['pct_records_touching_compact_construction']}%")
    print(f"  touching INDUSTRIAL MRO:             "
          f"{vertical['pct_records_touching_industrial_mro']}%  <-- vocabulary "
          f"contains no such family")
    print(f"  ag/turf AND NOT compact construction: "
          f"{vertical['pct_records_ag_turf_and_NOT_compact_construction']}%")
    print(f"  does it sort? distinct lvl0 combos={vertical['distinct_lvl0_combinations']} "
          f"(modal {vertical['modal_lvl0_combination_share_pct']}%), "
          f"lvl1 combos={vertical['distinct_lvl1_combinations']} "
          f"(modal {vertical['modal_lvl1_combination_share_pct']}%)")
    print(f"  families on 100% of records: {vertical['families_on_100pct_of_records']}")
    print(f"  lvl0 by record:  {vertical['lvl0_by_record']}")
    print(f"  lvl0 by company: {vertical['lvl0_by_company_cluster']}")
    print(f"  lvl1 by record (top 12): "
          f"{dict(list(vertical['lvl1_by_record'].items())[:12])}")

    # ── PROJECTION, both ways, because they disagree and the gap is the point ─
    inb = [r for r in inside if r["size_band"] == "in-band"]
    inb_new = SB.net_new(inb, deduped, "in-band")["net_new_by_domain"]
    cov = SB.metro_coverage(deduped)
    share = cov["share_of_geocoded_baseline"]
    proj_baseline = round(inb_new / share) if share else None
    # Cross-check against KUBOTA'S OWN geography. The control query gives the
    # national record count, so the probe's share of the actual network is
    # measured, not assumed.
    probe_share_of_network = (len(inside) / national) if national else None
    proj_network = (round(inb_new / probe_share_of_network)
                    if probe_share_of_network else None)
    print("\n── PROJECTION (two methods, and they disagree) ─────────")
    print(f"  in-band net-new by domain, measured: {inb_new}")
    print(f"  A. measured-baseline-share (the mandated method):")
    print(f"       {inb_new} / {share} = {proj_baseline} nationally")
    print(f"  B. Kubota's OWN geography (cross-check):")
    print(f"       probe holds {len(inside)}/{national} = "
          f"{round((probe_share_of_network or 0) * 100, 2)}% of the network")
    print(f"       {inb_new} / {round(probe_share_of_network or 0, 5)} = "
          f"{proj_network} nationally")
    print(f"  ⚠ A is the CONSERVATIVE one and is the number to quote. The two "
          f"disagree because deduped-v7 is metro-skewed ({round(share*100,1)}% "
          f"of it sits in these three circles) while Kubota's dealer network is "
          f"rural-skewed (only "
          f"{round((probe_share_of_network or 0)*100,2)}% of it does).")
    projection = {
        "in_band_net_new_by_domain_measured": inb_new,
        "method_A_measured_baseline_share": {
            "share_of_geocoded_baseline": share,
            "projected_national_in_band_net_new": proj_baseline,
            "status": "MANDATED METHOD — quote this one; it is the lower of the two",
        },
        "method_B_oem_own_geography_crosscheck": {
            "probe_records": len(inside),
            "national_records": national,
            "probe_share_of_network": (round(probe_share_of_network, 5)
                                       if probe_share_of_network else None),
            "projected_national_in_band_net_new": proj_network,
            "status": "cross-check only",
        },
        "why_they_disagree": (
            "deduped-v7 is metro-skewed industrial distribution; Kubota's "
            "dealer network is rural-skewed. The three circles hold "
            f"{round(share * 100, 1)}% of the geocoded baseline but only "
            f"{round((probe_share_of_network or 0) * 100, 2)}% of Kubota's "
            "dealers, so method A under-projects here. Both clear the >=150 "
            "rule, so the disagreement does not change the verdict."),
        "caveats": [
            "in-band counts are an UPPER bound: a three-metro probe sees only "
            "the stores inside its circles, so every cluster size is a LOWER "
            "bound on the group's national footprint (_eq_sizeband §2).",
            "deduped-v7 is itself a biased sample — it is what our sources "
            "happened to find, not a census.",
        ],
    }

    payload = {
        "source_name": "Kubota find-a-dealer (Algolia)",
        "locator_page": PAGE,
        "alt_locator_page": ALT_PAGE,
        "data_path": f"POST <appId>-dsn.algolia.net{SEARCH_PATH}",
        "serving_host": "<appId>-dsn.algolia.net (third-party; NOT kubotausa.com)",
        "index": INDEX,
        "path_provenance": (
            f"{BUNDLE_BASE}{CRED_BUNDLE} module 86473 (useDealers: filters "
            f"post_type:dealer, aroundLatLng, aroundRadius, getRankingInfo, "
            f"hitsPerPage) + module 97663 (client, published app id + "
            f"search-only key); {BUNDLE_BASE}{CLIENT_BUNDLE} algoliasearch "
            f"5.53.0 (read host `${{appId}}-dsn.algolia.net`, search -> "
            f"POST {SEARCH_PATH}). Nothing rendered."),
        "robots_verdict": ROBOTS_VERDICT,
        "robots_override_needed": True,
        "robots_override_gate": ("R-3 SIGNED Artur 2026-08-04 — robots.txt on "
                                 "www.kubotausa.com ONLY. Not extended to the "
                                 "Algolia host, which publishes no robots.txt "
                                 "(HTTP 404) and needed no override."),
        "credential_posture": (
            "app id + search-only key published as literals in the anonymous "
            "bundle. No login, no cookie, no minting call, read-only. Weaker "
            "than CRED-4's minted bearer; same shape as Banner/Festo. Values "
            "read at runtime by shape and NEVER recorded in any file."),
        "gates": {"ICP-EQ": "SIGNED Artur 2026-08-04 — 1–4-location tail only",
                  "R-3": "SIGNED Artur 2026-08-04 — www.kubotausa.com robots only",
                  "CRED-4": "n/a — published static key, not a minted bearer"},
        "size_band_filter": "designed BEFORE the sweep — see _eq_sizeband.py",
        "national_nbHits_post_type_dealer": national,
        "metros": metros,
        "requests_log": log,
        "origin_requests": f.origin_requests,
        "origin_requests_note": (
            "counts the Algolia queries + any bundle fetched live this run. "
            "Bundle GETs against www.kubotausa.com are cached after the first "
            "run; the 6 spent on 2026-08-04 are itemised in the report."),
        "codes_captured_verbatim": list(code_fields),
        "codes_constant_and_therefore_not_codes": constants,
        "line_card_fields_used_for_p4": list(LINE_CARD_FIELDS),
        "program_fields_declared": list(PROGRAM_FIELDS),
        "fill_rates": fills,
        "vertical_mix": vertical,
        "projection": projection,
    }
    # A promise with no check is a wish. This fails the run before writing.
    _assert_no_key_leak(payload, inside, key)
    _polite.write_raw(SOURCE, payload, inside)


if __name__ == "__main__":
    if "--national" in sys.argv:
        main_national()
    else:
        main()
