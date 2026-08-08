#!/usr/bin/env python3
"""equipment-dealers — Bobcat dealer locator (Coveo), three-metro probe.

GATES
-----
**ICP-EQ — SIGNED (Artur, 2026-08-04)**, strategy §9: ICP extended to franchised
single-line equipment dealers, **1–4-location tail only**, parts-counter angle.
Binding: the size-band filter is designed before the sweep (`_eq_sizeband.py`),
and everything at 5+ locations routes to `pool-above-ceiling`.

**Per-OEM robots gate — NO OVERRIDE NEEDED.** Measured 2026-08-04. Bobcat's
locator is Coveo Atomic/Headless, so **three** origins are involved and RFC 9309
governs each separately. All three were read before anything was requested:

  1. `www.bobcat.com` — the locator page `/dealer`. 15 `*` Disallow rules, all
     `…thank-you` confirmation pages plus `/*/*/search`. None matches `/dealer`.
     **Allowed.**
  2. `bobcat.api.bobcat.com` — the token minter, `/coveo/search/token?region=NA`.
     `robots.txt` returns **HTTP 404**: the host publishes no robots.txt, so
     there is no stated preference either way. Same posture the pack accepted
     for `api.festo.com` (2026-08-03), which needed no override.
  3. `bobcatproduction10bzen8ct.org.coveo.com` — the host that actually serves
     the dealer data at `/rest/search/v2`. Its robots.txt is a **longest-match
     case and reads backwards at a glance**:

         Allow: /rest/search
         Allow: /rest/organizations/*/commerce/v2/listing
         …
         Disallow: /

     RFC 9309 §2.2.2: the most specific match wins. `Allow: /rest/search`
     (12 chars) beats `Disallow: /` (1 char), so `/rest/search/v2` is
     **explicitly ALLOWED**. Coveo published that Allow deliberately. This is
     the same shape that produced a false alarm on Lincoln Electric and would
     have killed a clean source here too.

No `Disallow` covers any host on the data path → no robots-posture change →
the pack's standing policy already governs and no signature is required.

**Credential posture — assessed, and it is NOT a boundary.** The locator config
is published inline in the anonymous page (`orgId`, `tokenUri`,
`fieldsToInclude`, a Google Maps browser key, and an unused `coveoApiKey`), and
`2c89e81.modern.js` asserts the token URI is required. The token endpoint was
called anonymously with no login, no cookie and no prior session; it returned a
JWT whose claims are `searchHub: DL_NA_Search`, `organization: <orgId>`, and
`roles: ["queryExecutor"]` — an anonymous, read-only, query-only search token
minted for every visitor.

**It is not login-derived**, so it is not the Bimba/Enerpac credential-wall
shape that is permanently excluded. It is a step beyond the static
Banjo/Banner/Festo published-key shape though — the site mints a short-lived
bearer rather than publishing a literal — and that distinction is flagged for
Artur in the report rather than quietly decided here.

**No token value is recorded anywhere.** It is fetched, used, and left in the
disk cache the same as any other response body; it is never written into a
record, a raw file or a report.

METHOD
------
Three metros, then STOP: Houston TX, Chicago IL, Cleveland OH. One token GET,
then state-scoped search POSTs, filtered to the three 100 mi circles **offline**
so the geography costs no extra requests. Paced >=3s, cached, honest UA never
rotated. `MAX_ORIGIN_REQUESTS` is a hard stop enforced in code.

⚠ **TWO CORRECTIONS THIS FILE EARNED THE EXPENSIVE WAY — both worth carrying.**

1. **The first version sent a `context` object** (`{lat, lng, country, name,
   language}`) alongside `searchHub: DL_NA_Search`, mirroring what the page's
   own search box sets. Every metro came back `totalCount: 0` — a clean 200 with
   an empty result set, which reads exactly like "this network has no dealers
   here" and is the most dangerous possible failure mode: a **silent zero that
   looks like a measurement**. It is not. Dropping `context` returns
   `totalCount: 2701`. The Coveo pipeline `Dealer Locator NA Search` evidently
   carries a filter rule keyed on context values the page sets in a shape we
   were not reproducing. **A zero from a search API is a claim that needs its own
   test before it is written down**, and the test is one unfiltered query.

2. **`numberOfResults` is not ours to set.** The request asks for 1000 and the
   pipeline returns **15**, every time, at every offset. So a national census is
   2,701 / 15 = ~181 requests, not 3. That reshapes the cost of a sweep and it is
   the reason this probe scopes by state rather than pulling everything: the
   decision rule says a sweep is *earned*, and 181 requests is exactly the kind
   of spend that has to be earned rather than assumed.

⚠ **§5i, and it cuts the usual way.** The page declares three facet fields —
`bobc_accountindustry_dict`, `bobc_accountproduct_dict`,
`bobc_accountbusinessactivity_dict` — with default values printed right there in
the anonymous HTML (`Rentals / Parts / Services`, five industries, 29 products).
Two of the three are **empty on every record in the payload**. The real
per-record line card is `account_contract_code_names`, which the page never
mentions and which is populated 100%. Reading the page's facet list would have
produced a confident, wrong claim about the qualification signal — the same
mistake SKF's decoding table nearly caused on 2026-08-03.
"""
import json
import math
import os
import sys
import time
import urllib.error
import urllib.request

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _eq_sizeband as SB  # noqa: E402
import _polite  # noqa: E402
from _polite import Blocked, Fetcher, digits  # noqa: E402

_polite.CAPTURED = "2026-08-04"

SOURCE = "bobcat"
PAGE = "https://www.bobcat.com/dealer"
TOKEN_URL = "https://bobcat.api.bobcat.com/coveo/search/token?region=NA"
ORG = "bobcatproduction10bzen8ct"
SEARCH_URL = f"https://{ORG}.org.coveo.com/rest/search/v2"
SEARCH_HUB = "DL_NA_Search"

# Verbatim from the locator page's own componentProps.fieldsToInclude …
FIELDS = ("bobc_latitude,bobc_longitude,bobc_uri,sfmailing_label__c,bobc_address,"
          "sfphone,sfwebsite,sfmaps_latitude__c,sfmaps_longitude__c,distance,"
          "distanceinmiles,distanceinkm,index,sfmdm_id__c").split(",")
# … plus the Salesforce Account fields the index actually carries, read off a
# real result rather than off the page's field list. The page names 14 fields;
# the index publishes ~60, including the company name and the whole billing
# address, neither of which is in the page's list.
FIELDS += ["sfname", "sfid", "sfarnumber__c", "sfbillingstreet", "sfbillingcity",
           "sfbillingstate", "sfbillingpostalcode", "sfbillingcountry",
           "sfshippingcity", "sfshippingstate", "sfshippingpostalcode",
           "account_contract_code_names",
           "sfmap_account_contract_codes__rcontract_code__c",
           "sfmap_account_contract_codes__rname"]

# §5i codes, captured verbatim and uninterpreted.
#   The first three are the page's own declared facet fields. TWO OF THEM ARE
#   EMPTY ON EVERY RECORD — kept in the list precisely so the report can state
#   the absence rather than leave the page's claim unchallenged.
#   `account_contract_code_names` is the per-record LINE CARD that actually
#   exists: a list of Bobcat product programs the dealer is contracted for
#   ("Compact Track Loaders", "Attachments", "Telehandlers", …), 100% filled.
CODE_FIELDS_SRC = ("bobc_accountindustry_dict", "bobc_accountproduct_dict",
                   "bobc_accountbusinessactivity_dict",
                   "account_contract_code_names")

# Probe states: the ones the three 100 mi circles fall inside. Rows are filtered
# to the circles OFFLINE afterwards, exactly as caseih.py does, so the geometry
# is comparable across the two sources and costs no extra requests.
PROBE_STATES = ["TX", "IL", "OH"]
PAGE_SIZE = 15          # what the pipeline returns regardless of what we ask
MAX_ORIGIN_REQUESTS = 60  # hard stop: token + paging. A sweep is a separate run.

ROBOTS_VERDICT = (
    "3 origins, all read before any request. www.bobcat.com: allowed (no rule "
    "matches /dealer). bobcat.api.bobcat.com: robots.txt HTTP 404, no stated "
    "preference. bobcatproduction10bzen8ct.org.coveo.com: `Allow: /rest/search` "
    "beats `Disallow: /` under RFC 9309 §2.2.2 longest-match — EXPLICITLY "
    "ALLOWED. No override needed on any host."
)


class JsonPostFetcher(Fetcher):
    """`_polite.Fetcher` with a JSON body. Posture inherited unchanged.

    >=3s pacing, single worker, honest UA never rotated, disk cache, and
    401/403 -> Blocked with no bypass. Every 4xx except 408/429 is a
    deterministic refusal and is not retried.
    """

    def post_json(self, url, cache_name, payload, headers=None, timeout=180):
        path = os.path.join(self.cache, cache_name)
        if os.path.exists(path) and os.path.getsize(path) >= self.min_bytes:
            with open(path, encoding="utf-8") as fh:
                return json.load(fh), True
        body = json.dumps(payload).encode()
        hdrs = {"User-Agent": _polite.UA, "Content-Type": "application/json",
                "Accept": "application/json", "Accept-Language": "en-US,en;q=0.9"}
        hdrs.update(headers or {})
        for attempt in range(len(_polite.BACKOFF) + 1):
            self._pace()
            req = urllib.request.Request(url, data=body, headers=hdrs, method="POST")
            try:
                with urllib.request.urlopen(req, timeout=timeout) as r:
                    raw = r.read().decode("utf-8", "ignore")
                self._last = time.time()
                self.origin_requests += 1
                with open(path, "w", encoding="utf-8") as fh:
                    fh.write(raw)
                return json.loads(raw), False
            except urllib.error.HTTPError as e:
                self._last = time.time()
                detail = ""
                try:
                    detail = e.read().decode("utf-8", "ignore")[:400]
                except Exception:  # noqa: BLE001
                    pass
                if e.code in (401, 403):
                    raise Blocked(f"HTTP {e.code} on {url} — stopped, no bypass. {detail}")
                if 400 <= e.code < 500 and e.code not in (408, 429):
                    raise Blocked(f"HTTP {e.code} on {url} — deterministic "
                                  f"refusal, not retried. {detail}")
                wait = _polite.BACKOFF[min(attempt, len(_polite.BACKOFF) - 1)]
                print(f"  HTTP {e.code} -> backoff {wait}s", flush=True)
                time.sleep(wait)
            except Exception as e:  # noqa: BLE001
                self._last = time.time()
                wait = _polite.BACKOFF[min(attempt, len(_polite.BACKOFF) - 1)]
                print(f"  ERR {e!r} -> retry {wait}s", flush=True)
                time.sleep(wait)
        raise Blocked(f"gave up on {url}")


def get_token(f):
    body, cached = f.get(TOKEN_URL, "token.json",
                         headers={"Referer": PAGE, "Accept": "application/json"})
    return json.loads(body)["token"], cached


def to_record(res, metro, url):
    raw = res.get("raw") or {}
    website = raw.get("sfwebsite") or None
    phone = raw.get("sfphone") or None
    # `sfname` is a branch LABEL ("Bobcat of Albany, Albany, GA"); the clean
    # company name is `sfmailing_label__c` ("Bobcat of Albany"). Using the label
    # would inflate the distinct-company count, which is the branch-label trap
    # that made name joins overstate net-new ~3x across every source.
    name = (raw.get("sfmailing_label__c") or raw.get("sfname")
            or res.get("title") or "")
    lat = SB.num(raw.get("bobc_latitude") or raw.get("sfmaps_latitude__c"))
    lng = SB.num(raw.get("bobc_longitude") or raw.get("sfmaps_longitude__c"))
    rec = {
        "company": (name or "").strip() or None,
        "company_label_raw": raw.get("sfname"),
        "address_1": raw.get("sfbillingstreet") or raw.get("bobc_address") or None,
        "address_2": None,
        "city": raw.get("sfbillingcity") or raw.get("sfshippingcity"),
        "state": raw.get("sfbillingstate") or raw.get("sfshippingstate"),
        "zip_raw": raw.get("sfbillingpostalcode") or raw.get("sfshippingpostalcode"),
        "phone_raw": phone,
        "phone_10": digits(phone),
        "email": None,  # the Coveo dealer index publishes no email field
        "website": website,
        "domain": SB.dealer_domain(website),
        "lat": lat, "lng": lng,
        "is_us": (raw.get("sfbillingcountry") or "").upper() in ("US", "USA", ""),
        "source": SOURCE,
        "source_url": url,
        "captured": _polite.CAPTURED,
        "probe_metro": metro,
        "dealer_uri_raw": raw.get("bobc_uri"),
        "sfmdm_id_raw": raw.get("sfmdm_id__c"),
        "sfid_raw": raw.get("sfid"),
        "bobc_address_raw": raw.get("bobc_address"),
        # PER-RECORD LINE CARD + contract codes, VERBATIM AND UNINTERPRETED
        "account_contract_code_names_raw": _join(raw.get("account_contract_code_names")),
        "contract_code_raw": _join(
            raw.get("sfmap_account_contract_codes__rcontract_code__c")),
    }
    for f_ in CODE_FIELDS_SRC:
        rec[f"{f_}_raw"] = _join(raw.get(f_))
    rec["product_line_count"] = len(raw.get("bobc_accountproduct_dict") or [])
    for k, v in raw.items():
        key = f"x_{k}_raw"
        if key not in rec and not isinstance(v, (dict, list)):
            rec[key] = v
    return rec


def _join(v):
    if isinstance(v, list):
        return "|".join(str(x) for x in v) or None
    return v or None


def probe(f, token):
    """Three metros, then STOP — via a per-metro bounding box on `aq`.

    ⚠ **Why not the page's own `context: {lat, lng}`?** Measured 2026-08-04:
    supplying ANY `context` object makes the "Dealer Locator NA Search" pipeline
    return `totalCount: 0` — with no error, a resolved pipeline and a live index.
    Six variants were tried (context floats, context strings, with/without
    `fieldsToInclude`, with/without `searchHub`, `q` set to the location text,
    `aq=@bobc_uri`); every one carrying a context returned 0, and every one
    without a context returned the full 2,701-dealer index. The pipeline clearly
    applies a context-keyed rule we cannot reconstruct without running the
    browser's Atomic initialisation, which is out of scope for a probe.

    So the metro constraint is applied **in the query** instead, as a numeric
    bounding box on the index's own lat/lng fields. That is narrower than the
    page's own default query, not wider: it asks for three metros and nothing
    else, and it never paginates the national index.
    """
    out, records, log = {}, [], []
    hdrs = {"Authorization": f"Bearer {token}", "Referer": PAGE}
    for metro, lat, lng in SB.METROS:
        dlat = SB.RADIUS_MI / 69.0
        dlng = SB.RADIUS_MI / (69.0 * max(0.2, math.cos(math.radians(lat))))
        aq = (f"@bobc_latitude=={lat - dlat:.4f}..{lat + dlat:.4f} "
              f"@bobc_longitude=={lng - dlng:.4f}..{lng + dlng:.4f}")
        # PAGE THE METRO OUT. The pipeline returns PAGE_SIZE rows whatever
        # `numberOfResults` asks for, so a single call reads 15 of a metro that
        # holds 120 — a 6× under-count that would have been reported as a
        # measurement. Page until `totalCount` is exhausted or the budget stops
        # us, and record `complete` either way so a truncated metro can never be
        # mistaken for a small one.
        rows, first, total, truncated = [], 0, None, False
        blocked = None
        while True:
            payload = {"q": "", "aq": aq, "searchHub": SEARCH_HUB,
                       "numberOfResults": PAGE_SIZE, "firstResult": first}
            if f.origin_requests >= MAX_ORIGIN_REQUESTS:
                truncated = True
                print(f"  budget stop at {MAX_ORIGIN_REQUESTS} origin requests")
                break
            try:
                # Cache key carries the query shape AND the offset. The earlier
                # `context`-carrying query is still on disk as
                # `search-{metro}.json` with its `totalCount: 0` body — kept, not
                # deleted, because that zero is the evidence for the correction
                # recorded in this file's header.
                data, cached = f.post_json(
                    SEARCH_URL, f"search-{metro}-bbox-{first}.json",
                    payload, headers=hdrs)
            except Blocked as e:
                print(f"  {metro}: BLOCKED — {e}")
                blocked = str(e)
                break
            page = data.get("results") or []
            total = data.get("totalCount")
            rows.extend(page)
            log.append({"metro": metro, "aq": aq, "firstResult": first,
                        "returned": len(page), "totalCount": total,
                        "cached": cached})
            first += len(page)
            if not page or (total is not None and first >= total):
                break
        if blocked:
            out[metro] = {"blocked": blocked}
            continue
        recs = [to_record(r, metro, SEARCH_URL) for r in rows]
        records.extend(recs)
        complete = (total is not None and len(rows) >= total)
        out[metro] = {"records": len(recs), "totalCount": total,
                      "rows_fetched": len(rows), "complete": complete,
                      "truncated_by_budget": truncated, "aq": aq,
                      "page_size_returned_by_pipeline": PAGE_SIZE,
                      "raw_keys": sorted((rows[0].get("raw") or {}).keys())[:60]
                      if rows else []}
        print(f"  {metro:<14} {len(recs):>4} rows of totalCount={total}  "
              f"complete={complete}")
    return out, records, log


def main():
    deduped = SB.load_deduped()
    print(f"baseline: deduped-v7.csv, {len(deduped)} data rows, domain-keyed")
    print(f"robots: {ROBOTS_VERDICT}\n")

    f = JsonPostFetcher(SOURCE, min_bytes=2)
    try:
        token, cached = get_token(f)
    except Blocked as e:
        print(f"TOKEN BLOCKED — {e}")
        _polite.write_raw(SOURCE, {"blocked": str(e), "token_url": TOKEN_URL}, [])
        return
    print(f"token: obtained anonymously ({'cached' if cached else 'live'}); "
          "value NOT recorded anywhere\n")

    metros, records, log = probe(f, token)
    if not records:
        _polite.write_raw(SOURCE, {"metros": metros, "requests_log": log,
                                   "origin_requests": f.origin_requests,
                                   "robots_verdict": ROBOTS_VERDICT}, [])
        return

    inside, outside, seen = [], [], set()
    for r in records:
        m = SB.in_any_metro(r.get("lat"), r.get("lng"))
        r["in_probe_circle"] = bool(m)
        r["probe_circle"] = m
        key = r.get("dealer_uri_raw") or r.get("sfmdm_id_raw") or (
            r.get("company"), r.get("address_1"))
        if not m:
            outside.append(r)
            continue
        if key in seen:
            continue
        seen.add(key)
        inside.append(r)
    print(f"\nrows returned: {len(records)}  |  inside a {SB.RADIUS_MI}mi circle: "
          f"{len(inside)}  |  outside (dropped): {len(outside)}")

    code_fields = tuple(f"{c}_raw" for c in CODE_FIELDS_SRC)
    groups, unresolvable, meta = SB.apply_size_band(
        inside, code_fields=code_fields, group_key_field=None)

    from caseih import report  # same measured report, same definitions
    report(SOURCE, inside, groups, meta, deduped, code_fields)

    _polite.write_raw(SOURCE, {
        "source_name": "Bobcat dealer locator (Coveo, NA)",
        "locator_page": PAGE,
        "data_path": SEARCH_URL,
        "serving_host": f"{ORG}.org.coveo.com",
        "token_host": "bobcat.api.bobcat.com",
        "path_provenance": "www.bobcat.com/dealer inline Nuxt payload "
                           "(componentProps.orgId / .tokenUri / .fieldsToInclude) "
                           "+ dxp-static.bobcat.com/2c89e81.modern.js",
        "robots_verdict": ROBOTS_VERDICT,
        "robots_override_needed": False,
        "credential_posture": "anonymous Coveo search token, roles=[queryExecutor], "
                              "no login. Not a credential boundary. Value never recorded.",
        "gates": {"ICP-EQ": "SIGNED Artur 2026-08-04 — 1–4-location tail only",
                  "per-OEM robots": "no override needed on any of the 3 hosts"},
        "size_band_filter": "designed BEFORE the sweep — see _eq_sizeband.py",
        "metros": metros,
        "requests_log": log,
        "origin_requests": f.origin_requests,
        "codes_captured_verbatim": list(code_fields),
    }, inside)


if __name__ == "__main__":
    main()
