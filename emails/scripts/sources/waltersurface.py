#!/usr/bin/env python3
"""S1 wave-3 — Walter Surface Technologies "Where to Buy" distributor locator.

**The find.** `https://www.walter.com/us/where-to-buy` is a Salesforce Experience
Cloud **LWR** site (not Aura). Reading the cached view bundle
`data/raw/_cache/e4bundle-waltersurface/bundle-0.js` gives the whole wiring:

  * `c/walterENWhereToBuy` imports five Apex methods off one controller. Each is
    registered as `getApexInvoker("", "@udd/01pRP000001G9jV", "<method>", "false")`
    — namespace empty, classname the UDD alias of `WalterENWhereToBuyController`,
    `isContinuation` false.
  * `getAllDistributorMarkers` is called as `L.default({webStoreId: M.default})`
    where `M = @salesforce/webstore/Id`. That module is **not** in the view
    bundle; it is inlined in the page itself — `data/raw/_cache/
    e4evidence-waltersurface/locator.html` has
    `LWR.define('@salesforce/webstore/Id', [], function() { return
    "0ZERP0000005qVp4AI"; });`
  * The same page inlines `LWR.define('@app/apexApiBasePath', ... "/us/webruntime/api")`.

`getAllDistributorMarkers` takes no geography — it returns the **entire national
marker set in one response** (12,368 markers, 3.8 MB). No radius loop, no
pagination, no geocoding. One request is the whole pull.

**Transport (verified live, not inferred).** `force/ldsAdaptersApex` in the
bundle builds a luvio resource request at `baseUri "/lwr/apex/v67.0"`, but that
is the *internal* luvio route; the wire that actually leaves the browser is the
classic LWR apex bridge. Measured:

    POST /us/webruntime/api/lwr/apex/v67.0/<class>/<method>   -> 404 (SPA shell)
    POST /us/webruntime/api/apex/execute  {namespace,classname,method,params,
                                           cacheable}          -> 400
        {"returnValue":"JSONObject[\\"isContinuation\\"] not found."}
    POST /us/webruntime/api/apex/execute  + "isContinuation":false
                                                                -> 200, 3.8 MB

So the envelope this site wants is the six-key form:
`{namespace, classname, method, isContinuation, params, cacheable}` as a JSON
POST body. `?_body=` on GET is rejected ("JSONObject[\\"classname\\"] not found").
No `X-Chatter-Entity-Encoding` header is needed. **Plain `urllib` — no browser,
no Playwright.**

**Compliance.**
  * `https://www.walter.com/robots.txt` (cached at
    `data/raw/_cache/e4apihost-www.walter.com/robots.txt`) is the stock SFDC
    community file: `User-agent: *` / `Allow: /` / a single
    `Disallow: */secur/forgotpassword.jsp?*`. `/us/webruntime/api/...` is allowed.
  * **No credential boundary.** The page renders for anonymous visitors and the
    endpoint answers an unauthenticated request with no cookie, no bearer token
    and no guest session harvested from anywhere. Every call returned 200 or a
    400 that named a missing *body* key. **Zero 401/403 across the whole run.**
    Had one appeared, `_polite.Blocked` stops the source — same rule that keeps
    us off Bimba's keyed Bullseye API.
  * Cloudflare fronts the host (`server: cloudflare`) and never challenged us.
    Honest desktop UA, never rotated. >=3s/host, single worker, everything cached.

⚠ §5i SOURCE-NATIVE CODES, VERBATIM AND UNINTERPRETED.
`getAllDistributorMarkers` carries exactly one code: the Salesforce record id in
`value` (18 chars, key prefix `a3t` on every one of the 12,368 — a single custom
object). It carries **no** distributor type, tier, category, service flag or
product line. Walter does not publish a vertical code on this endpoint.
The sibling method `getStoreLocationsByCoordinates` DOES add `custNum`
(e.g. `200096-00`, `200116-21`, `200116-23`) and `faxPhone`. `custNum` is
captured verbatim; its shape is NOT decoded here.

Usage:
    python3 waltersurface.py                     # markers + logos + code sample
    python3 waltersurface.py --enrich-sample 0   # markers + logos only
    python3 waltersurface.py --enrich-full       # +447 radius calls, ~22 min
"""
import argparse
import json
import math
import os
import re
import sys
import time
import urllib.error
import urllib.request

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402

_polite.CAPTURED = "2026-08-03"

from _polite import (BACKOFF, UA, US_STATES, Blocked, Fetcher,  # noqa: E402
                     apex, digits, report, write_raw)

CAPTURED = _polite.CAPTURED
SOURCE = "waltersurface"

PAGE = "https://www.walter.com/us/where-to-buy"
ENDPOINT = "https://www.walter.com/us/webruntime/api/apex/execute"
NAMESPACE = ""                          # getApexInvoker("", ...)
APEX_CLASS = "@udd/01pRP000001G9jV"     # UDD alias of WalterENWhereToBuyController
WEBSTORE_ID = "0ZERP0000005qVp4AI"      # LWR.define('@salesforce/webstore/Id', ...)

# `<lightning-card><p ...>21 Tiffany Dr<br>Calvert City, 42029<br>KY, US<br>
#  Phone: 270-395-8098<br> Email: kycal@stores.fastenal.com</lightning-card>`
CARD_OPEN = re.compile(r'^\s*<lightning-card>\s*<p[^>]*>\s*')
CITY_ZIP = re.compile(r"^(?P<city>.+),\s*(?P<zip>[^,]+)$")
STATE_COUNTRY = re.compile(r"^(?P<state>[A-Za-z]{2}),\s*(?P<country>[A-Za-z]{2,3})$")

# Radius measured on the live `getStoreLocationData` probe: 322 hits around
# Houston, max `distance` 59 mi. 55 is the conservative cover radius.
COVER_RADIUS_MI = 55
EARTH_MI = 3958.8


class ApexFetcher(Fetcher):
    """`_polite.Fetcher` + a JSON-body POST.

    `Fetcher.get` form-encodes its `data=` dict, and `_polite.py` belongs to the
    shared wave-3 layer, so the JSON variant lives here. Everything else is the
    same contract: >=3s pacing, the same backoff ladder, 401/403/404 -> Blocked,
    every response cached to disk so a re-run never touches the origin.
    """

    def call(self, method, params, cache_name, timeout=300):
        path = os.path.join(self.cache, cache_name)
        if os.path.exists(path) and os.path.getsize(path) >= self.min_bytes:
            with open(path, encoding="utf-8", errors="ignore") as fh:
                return self._unwrap(json.loads(fh.read()), method), True

        body = json.dumps({
            "namespace": NAMESPACE,
            "classname": APEX_CLASS,
            "method": method,
            "isContinuation": False,
            "params": params,
            "cacheable": False,
        }).encode()
        hdrs = {
            "User-Agent": UA,
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9",
            "Content-Type": "application/json",
            "Referer": PAGE,
        }

        for attempt in range(len(BACKOFF) + 1):
            self._pace()
            req = urllib.request.Request(ENDPOINT, data=body, headers=hdrs,
                                         method="POST")
            try:
                with urllib.request.urlopen(req, timeout=timeout) as r:
                    raw = r.read().decode("utf-8", "ignore")
                self._last = time.time()
                self.origin_requests += 1
                doc = json.loads(raw)
                out = self._unwrap(doc, method)
                with open(path, "w", encoding="utf-8") as fh:
                    fh.write(raw)
                return out, False
            except urllib.error.HTTPError as e:
                self._last = time.time()
                detail = e.read()[:300].decode("utf-8", "ignore")
                if e.code in (401, 403):
                    raise Blocked(f"HTTP {e.code} on {method} — credential/blocked "
                                  f"wall, source stopped, no bypass: {detail}")
                if e.code == 404:
                    raise Blocked(f"HTTP 404 on {method}: {detail}")
                if e.code == 400:
                    raise Blocked(f"HTTP 400 on {method} — bad envelope, not a "
                                  f"transport retry: {detail}")
                wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
                print(f"  HTTP {e.code} on {method} -> backoff {wait}s", flush=True)
                time.sleep(wait)
            except Blocked:
                raise
            except Exception as e:  # noqa: BLE001 — transport errors are retryable
                self._last = time.time()
                wait = BACKOFF[min(attempt, len(BACKOFF) - 1)]
                print(f"  ERR {e!r} -> retry in {wait}s", flush=True)
                time.sleep(wait)
        raise Blocked(f"gave up on {method}")

    @staticmethod
    def _unwrap(doc, method):
        rv = doc.get("returnValue")
        if isinstance(rv, str):
            raise Blocked(f"apex error on {method}: {rv}")
        return rv


# ── marker parsing ───────────────────────────────────────────────────────────

def card_lines(description):
    """Split the `<lightning-card>` blob into its `<br>`-separated lines."""
    body = CARD_OPEN.sub("", description or "")
    body = body.replace("</lightning-card>", "").replace("</p>", "")
    return [p.strip() for p in body.split("<br>") if p.strip()]


def parse_marker(m):
    lines = card_lines(m.get("description"))
    phone = email = None
    core = []
    for ln in lines:
        if ln.startswith("Phone:"):
            phone = ln[len("Phone:"):].strip() or None
        elif ln.startswith("Email:"):
            email = ln[len("Email:"):].strip() or None
        else:
            core.append(ln)

    state_country = core[-1] if core else None
    city_zip = core[-2] if len(core) >= 2 else None
    street = core[:-2] if len(core) >= 2 else []

    state = country = None
    if state_country:
        sc = STATE_COUNTRY.match(state_country)
        if sc:
            state = sc.group("state").upper()
            country = sc.group("country").upper()
        else:
            country = state_country.upper()

    city = zip_raw = None
    if city_zip:
        cz = CITY_ZIP.match(city_zip)
        if cz:
            city = cz.group("city").strip() or None
            zip_raw = cz.group("zip").strip() or None
        else:
            city = city_zip

    loc = m.get("location") or {}
    return {
        "street": street, "city": city, "zip_raw": zip_raw, "state": state,
        "country": country, "phone": phone, "email": email,
        "city_zip_raw": city_zip, "state_country_raw": state_country,
        "lat": loc.get("Latitude"), "lng": loc.get("Longitude"),
    }


def to_record(m):
    p = parse_marker(m)
    street = p["street"]
    return {
        "company": (m.get("title") or "").strip() or None,
        "address_1": street[0] if street else None,
        "address_2": street[1] if len(street) > 1 else None,
        "city": p["city"],
        "state": p["state"],
        "zip_raw": p["zip_raw"],
        "phone_raw": p["phone"],
        "phone_10": digits(p["phone"]),
        "email": p["email"],
        # Neither getAllDistributorMarkers nor getStoreLocationsByCoordinates
        # returns a distributor website. Left null rather than guessed.
        "website": None,
        "domain": None,
        "lat": p["lat"],
        "lng": p["lng"],
        # ── §5i SOURCE-NATIVE CODES, VERBATIM AND UNINTERPRETED ──────────────
        "sf_record_id_raw": m.get("value"),
        "sf_key_prefix_raw": (m.get("value") or "")[:3] or None,
        "country_raw": p["country"],
        "state_country_raw": p["state_country_raw"],
        "city_postal_raw": p["city_zip_raw"],
        "marker_title_raw": m.get("title"),
        "description_raw": m.get("description"),
        # filled only by --enrich-full
        "cust_num_raw": None,
        "fax_raw": None,
        # ────────────────────────────────────────────────────────────────────
        "is_us": bool(p["country"] in ("US", "PR") and p["state"] in US_STATES),
        "source": SOURCE,
        "source_url": ENDPOINT,
        "captured": CAPTURED,
    }


# ── radius enrichment (opt-in) ───────────────────────────────────────────────

def haversine_mi(a_lat, a_lng, b_lat, b_lng):
    p1, p2 = math.radians(a_lat), math.radians(b_lat)
    dp = p2 - p1
    dl = math.radians(b_lng - a_lng)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * EARTH_MI * math.asin(math.sqrt(h))


def cover_seeds(records, radius_mi=COVER_RADIUS_MI):
    """Greedy cover: every record ends up within `radius_mi` of some seed."""
    pts = [(i, r["lat"], r["lng"]) for i, r in enumerate(records)
           if r["lat"] is not None and r["lng"] is not None]
    grid = {}
    for i, la, lo in pts:
        grid.setdefault((round(la), round(lo)), []).append((i, la, lo))
    covered = set()
    seeds = []
    span = int(radius_mi / 50) + 2
    for i, la, lo in pts:
        if i in covered:
            continue
        seeds.append((la, lo))
        for dla in range(-span, span + 1):
            for dlo in range(-span - 1, span + 2):
                for j, jla, jlo in grid.get((round(la) + dla, round(lo) + dlo), ()):
                    if j not in covered and haversine_mi(la, lo, jla, jlo) <= radius_mi:
                        covered.add(j)
    return seeds


def sample_seeds(records, n):
    """`n` seeds spread across the country — every `len/n`-th greedy seed."""
    seeds = cover_seeds(records)
    if n <= 0 or not seeds:
        return []
    if n >= len(seeds):
        return seeds
    step = len(seeds) / n
    return [seeds[int(k * step)] for k in range(n)]


def run_radius(f, seeds, label):
    """Fan a coordinate query over `seeds`; returns {sf_record_id: raw item}."""
    by_id, blocked = {}, None
    for k, (la, lo) in enumerate(seeds, 1):
        name = f"{label}-{k:04d}-{la:.4f}_{lo:.4f}.json"
        params = {"currentCoordinates": json.dumps({"Latitude": la, "Longitude": lo}),
                  "webStoreId": WEBSTORE_ID}
        try:
            rv, cached = f.call("getStoreLocationsByCoordinates", params, name)
        except Blocked as e:
            blocked = str(e)
            print(f"  BLOCKED at seed {k}/{len(seeds)}: {e}")
            break
        for it in (rv or {}).get("addressWPList") or []:
            if it.get("id"):
                by_id[it["id"]] = it
        if k % 25 == 0 or k == len(seeds):
            print(f"  {label} {k}/{len(seeds)} seeds -> {len(by_id)} ids"
                  f" ({'cached' if cached else 'live'})", flush=True)
    return by_id, blocked


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--enrich-sample", type=int, default=8,
                    help="coordinate probes used only to MEASURE the custNum "
                         "code (kept out of `records`); 0 to skip")
    ap.add_argument("--enrich-full", action="store_true",
                    help="cover every marker with radius calls and merge "
                         "cust_num_raw / fax_raw into the records "
                         "(~447 origin requests, ~22 min)")
    args = ap.parse_args()

    f = ApexFetcher(SOURCE, min_bytes=200)
    notes = []

    # 1 ── the whole national marker set, one request, no geography argument.
    try:
        rv, cached = f.call("getAllDistributorMarkers",
                            {"webStoreId": WEBSTORE_ID},
                            "getAllDistributorMarkers.json")
    except Blocked as e:
        print(f"BLOCKED: {e}")
        write_raw(SOURCE, {"source_url": ENDPOINT, "locator_page": PAGE,
                           "blocked": str(e)}, [])
        return

    markers = (rv or {}).get("markerList") or []
    print(f"getAllDistributorMarkers -> {len(markers)} markers "
          f"({'cached' if cached else 'live'})")
    records = [to_record(m) for m in markers]

    # 2 ── the "shop online" dealer strip. Websites but no addresses, so these
    #      are NOT records; they are kept beside them, uncounted.
    online = []
    try:
        rv2, _ = f.call("getDistributorCompanyLogo", {},
                        "getDistributorCompanyLogo.json")
        for it in rv2 or []:
            url = (it.get("companyWebsiteUrl") or "").strip() or None
            online.append({"website": url, "domain": apex(url),
                           "company_logo_url_raw": it.get("companyLogoURL"),
                           "source": SOURCE, "source_url": ENDPOINT,
                           "captured": CAPTURED})
        print(f"getDistributorCompanyLogo -> {len(online)} online dealers")
    except Blocked as e:
        notes.append(f"getDistributorCompanyLogo blocked: {e}")
        print(f"  online dealers unavailable: {e}")

    # 3 ── the sibling radius method, which is the only place `custNum` lives.
    enrich_probe = None
    if args.enrich_full:
        seeds = cover_seeds(records)
        print(f"--enrich-full: {len(seeds)} seeds at {COVER_RADIUS_MI} mi")
        by_id, blocked = run_radius(f, seeds, "cover")
        hit = 0
        for r in records:
            it = by_id.get(r["sf_record_id_raw"])
            if it:
                hit += 1
                r["cust_num_raw"] = it.get("custNum")
                r["fax_raw"] = it.get("faxPhone")
        enrich_probe = {"mode": "full", "seeds": len(seeds),
                        "radius_mi": COVER_RADIUS_MI, "ids_seen": len(by_id),
                        "records_enriched": hit, "blocked": blocked}
        print(f"  merged custNum/fax onto {hit}/{len(records)} records")
    elif args.enrich_sample > 0:
        seeds = sample_seeds(records, args.enrich_sample)
        print(f"--enrich-sample: {len(seeds)} spread probes (code measurement only)")
        by_id, blocked = run_radius(f, seeds, "sample")
        items = list(by_id.values())
        cust = [it.get("custNum") for it in items if it.get("custNum")]
        enrich_probe = {
            "mode": "sample",
            "purpose": "measure the custNum / faxPhone codes that "
                       "getStoreLocationsByCoordinates adds; NOT merged into "
                       "`records`, which stay uniform marker-derived",
            "seeds": len(seeds), "radius_mi": COVER_RADIUS_MI,
            "distinct_ids": len(items),
            "pct_with_custNum": round(len(cust) / (len(items) or 1) * 100, 1),
            "pct_with_faxPhone": round(
                sum(1 for it in items if it.get("faxPhone")) / (len(items) or 1) * 100, 1),
            "custNum_sample_verbatim": cust[:25],
            "item_keys": sorted({k for it in items for k in it}),
            "full_cover_would_cost_seeds": len(cover_seeds(records)),
            "blocked": blocked,
        }
        print(f"  sample -> {len(items)} distinct ids, "
              f"custNum on {enrich_probe['pct_with_custNum']}%")

    code_fields = ("sf_key_prefix_raw", "country_raw", "state_country_raw",
                   "cust_num_raw")
    stats = report(SOURCE, records, code_fields=code_fields)

    robots = ("www.walter.com/robots.txt (stock SFDC community file), verbatim: "
              "`User-agent: *  # applies to all robots` / `Allow: /  # allow all` "
              "/ `Disallow: */secur/forgotpassword.jsp?*`. The only Disallow is "
              "the forgot-password JSP; /us/webruntime/api/apex/execute is "
              "explicitly allowed. No override involved.")

    write_raw(SOURCE, {
        "source_name": "Walter Surface Technologies — Where to Buy",
        "source_url": ENDPOINT,
        "locator_page": PAGE,
        "method": (
            "Salesforce Experience Cloud **LWR** site. One JSON POST to the LWR "
            "apex bridge `POST https://www.walter.com/us/webruntime/api/apex/"
            "execute` with body {\"namespace\":\"\",\"classname\":\"@udd/"
            "01pRP000001G9jV\",\"method\":\"getAllDistributorMarkers\","
            "\"isContinuation\":false,\"params\":{\"webStoreId\":"
            "\"0ZERP0000005qVp4AI\"},\"cacheable\":false} and Content-Type "
            "application/json. Returns the entire national marker set — no "
            "radius, no paging, no geocode. Plain urllib; NO browser, NO "
            "Playwright, no headless anything. `/lwr/apex/v67.0/<class>/"
            "<method>` (the luvio baseUri in the bundle) 404s; `?_body=` on GET "
            "is rejected. The six-key JSON body is the working envelope."
        ),
        "transport_evidence": {
            "bundle": "data/raw/_cache/e4bundle-waltersurface/bundle-0.js",
            "page": "data/raw/_cache/e4evidence-waltersurface/locator.html",
            "invoker": 'getApexInvoker("", "@udd/01pRP000001G9jV", '
                       '"getAllDistributorMarkers", "false")',
            "webstore_id_origin": "LWR.define('@salesforce/webstore/Id', [], "
                                  'function() { return "0ZERP0000005qVp4AI"; });'
                                  " — inlined in locator.html, not in the bundle",
            "apex_api_base_path": "LWR.define('@app/apexApiBasePath', [], "
                                  'function() { return "/us/webruntime/api"; });',
            "rejected_variants": [
                "GET /us/webruntime/api/lwr/apex/v67.0/@udd/01pRP000001G9jV/"
                "getAllDistributorMarkers?methodParams={...} -> 404 SPA shell",
                "GET .../apex/execute?_body={...} -> 400 "
                'JSONObject["classname"] not found',
                "POST .../apex/execute without isContinuation -> 400 "
                'JSONObject["isContinuation"] not found',
            ],
        },
        "robots_check": robots,
        "credential_check": (
            "PUBLIC, NO LOGIN. The where-to-buy page renders for anonymous "
            "visitors and the endpoint answered with no cookie, no bearer token "
            "and no harvested guest session. Zero 401 and zero 403 across the "
            "entire run; Cloudflare fronts the host and never challenged. Had "
            "either appeared the source would have stopped — no bypass, no UA "
            "rotation, no stealth."
        ),
        "codes_captured_verbatim": [
            "sf_record_id_raw", "sf_key_prefix_raw", "country_raw",
            "state_country_raw", "city_postal_raw", "marker_title_raw",
            "description_raw", "cust_num_raw", "fax_raw",
        ],
        "vertical_code": (
            "NONE. getAllDistributorMarkers publishes no distributor type, tier, "
            "category, service flag or product line — the only code on the "
            "endpoint is the Salesforce record id (`value`), key prefix `a3t` on "
            "every marker. The sibling getStoreLocationsByCoordinates adds "
            "`custNum` (e.g. 200096-00 / 200116-21) and `faxPhone`; custNum is "
            "stored verbatim and NOT decoded here."
        ),
        "enrichment": enrich_probe,
        "online_dealers": online,
        "online_dealers_note": (
            "getDistributorCompanyLogo — Walter's 'shop online dealers' strip. "
            "Website + logo only, no address or contact, so these are kept "
            "beside `records` and are NOT counted in `stats`."
        ),
        "notes": notes,
        # `origin_requests` is this run only — 0 on a cache replay, which is the
        # point. `cached_responses` is how many distinct origin responses back
        # the file in total.
        "origin_requests": f.origin_requests,
        "cached_responses": len(os.listdir(f.cache)),
        "stats": stats,
    }, records)


if __name__ == "__main__":
    main()
