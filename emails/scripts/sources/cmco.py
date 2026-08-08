#!/usr/bin/env python3
"""S1 — Columbus McKinnon how-to-buy + service-repair-centers locators, full take.

**Authorization.** Probed 2026-08-03 under `linecard-locators [PROBED]/`; the
build was GATE:HUMAN R-L2, default NO; **signed by Artur 2026-08-04** —
"Continue, build anything needed to get as much as possible" (log header).
robots: `www.cmco.com` publishes no rule matching `/en-us/how-to-buy/` or
`/en-us/service-repair-centers/` — allowed, no override involved.

**Route (measured).** The react mounts declare same-host routes:
`/en-us/how-to-buy/{filters,results}` and
`/en-us/service-repair-centers/{filters,results}`. `submitSearch` in the
site's own bundle sends EXACTLY: `lat, lng, distance, product, brand, units,
country=<long name>, onlyCountry, state=<2-letter>, onlyState`. Response is
`{"mapNodes": [...]}`. Live Houston measurement (2026-08-04): 50 rows — a
round number read as a **page cap**; the sweep half-steps the radius
(150→75→25) wherever a query clips at 50. `brand=""` is accepted (the
"required" is UI-level), so no per-brand loop is needed — each record carries
its own `brand` line card.

**The 5xx lesson from the probe, applied:** `_polite.Fetcher`'s backoff
ladder retries 5xx, which turned one malformed query into 5 origin hits.
This harvester fetches **single-attempt**: a 5xx/4xx is recorded and the
sweep moves on; 403 still stops the source dead. Pacing ≥3s and disk cache
are kept identical to the shared fetcher.

**Budget, stated before the run:** 61 metro centers × 2 locators + ≤40
half-step re-queries + slack = **ceiling 200 origin requests.**

⚠ §5i SOURCE-NATIVE CODES, verbatim and uninterpreted: `distributorLevel`
(Platinum/Gold/'1'/null observed live), `certifications` ("Rigging Service
Center", "U.S. Hoist Technician Certified", …), `preferred` /
`preferredFacility`, `brand` (comma line card), `productCategory`,
`brandsOffered`. The Houston probe returned preferred=true on all 50 rows —
unexplained; captured, not interpreted.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402

_polite.CAPTURED = "2026-08-04"

from _polite import RAW, UA, apex, digits, norm_company, report, \
    write_raw  # noqa: E402

CAPTURED = _polite.CAPTURED
SOURCE = "cmco"
HOST = "https://www.cmco.com"
LOCATORS = {
    "how-to-buy": "/en-us/how-to-buy/results",
    "service-repair": "/en-us/service-repair-centers/results",
}
PAGE_CAP = 50          # observed; a result of exactly 50 is treated as clipped
RADII = ("150", "75", "25")

# 61 CONUS + AK/HI metro centers, 150-mile circles. Coverage-first spread;
# overlap is fine (dedupe is company+street+city).
METROS = [
    ("boston-ma", 42.3601, -71.0589), ("new-york-ny", 40.7128, -74.0060),
    ("philadelphia-pa", 39.9526, -75.1652), ("pittsburgh-pa", 40.4406, -79.9959),
    ("buffalo-ny", 42.8864, -78.8784), ("baltimore-md", 39.2904, -76.6122),
    ("richmond-va", 37.5407, -77.4360), ("norfolk-va", 36.8508, -76.2859),
    ("charlotte-nc", 35.2271, -80.8431), ("atlanta-ga", 33.7490, -84.3880),
    ("jacksonville-fl", 30.3322, -81.6557), ("miami-fl", 25.7617, -80.1918),
    ("tampa-fl", 27.9506, -82.4572), ("birmingham-al", 33.5186, -86.8104),
    ("nashville-tn", 36.1627, -86.7816), ("memphis-tn", 35.1495, -90.0490),
    ("knoxville-tn", 35.9606, -83.9207), ("charleston-wv", 38.3498, -81.6326),
    ("new-orleans-la", 29.9511, -90.0715), ("jackson-ms", 32.2988, -90.1848),
    ("chicago-il", 41.8781, -87.6298), ("detroit-mi", 42.3314, -83.0458),
    ("cleveland-oh", 41.4993, -81.6944), ("columbus-oh", 39.9612, -82.9988),
    ("cincinnati-oh", 39.1031, -84.5120), ("indianapolis-in", 39.7684, -86.1581),
    ("milwaukee-wi", 43.0389, -87.9065), ("minneapolis-mn", 44.9778, -93.2650),
    ("st-louis-mo", 38.6270, -90.1994), ("kansas-city-mo", 39.0997, -94.5786),
    ("omaha-ne", 41.2565, -95.9345), ("des-moines-ia", 41.5868, -93.6250),
    ("duluth-mn", 46.7867, -92.1005), ("fargo-nd", 46.8772, -96.7898),
    ("sioux-falls-sd", 43.5446, -96.7311), ("houston-tx", 29.7561, -95.3648),
    ("dallas-tx", 32.7767, -96.7970), ("san-antonio-tx", 29.4241, -98.4936),
    ("austin-tx", 30.2672, -97.7431), ("el-paso-tx", 31.7619, -106.4850),
    ("oklahoma-city-ok", 35.4676, -97.5164), ("tulsa-ok", 36.1540, -95.9928),
    ("little-rock-ar", 34.7465, -92.2896), ("denver-co", 39.7392, -104.9903),
    ("salt-lake-city-ut", 40.7608, -111.8910), ("phoenix-az", 33.4484, -112.0740),
    ("albuquerque-nm", 35.0844, -106.6504), ("boise-id", 43.6150, -116.2023),
    ("billings-mt", 45.7833, -108.5007), ("casper-wy", 42.8501, -106.3252),
    ("las-vegas-nv", 36.1699, -115.1398), ("reno-nv", 39.5296, -119.8138),
    ("los-angeles-ca", 34.0522, -118.2437), ("san-diego-ca", 32.7157, -117.1611),
    ("san-francisco-ca", 37.7749, -122.4194), ("sacramento-ca", 38.5816, -121.4944),
    ("portland-or", 45.5152, -122.6784), ("seattle-wa", 47.6062, -122.3321),
    ("spokane-wa", 47.6588, -117.4260), ("anchorage-ak", 61.2181, -149.9003),
    ("honolulu-hi", 21.3069, -157.8583),
]

CACHE = os.path.join(RAW, "_cache", SOURCE)
os.makedirs(CACHE, exist_ok=True)


class Stop(Exception):
    """403 — the source stops dead, no bypass."""


_last = [0.0]


def one_shot(url, cache_name):
    """Single attempt, paced ≥3s, cached. 5xx/4xx recorded, never retried."""
    path = os.path.join(CACHE, cache_name)
    if os.path.exists(path) and os.path.getsize(path) > 2:
        return open(path, encoding="utf-8", errors="ignore").read(), "cache"
    wait = 3.0 - (time.time() - _last[0])
    if wait > 0:
        time.sleep(wait)
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Accept": "application/json, */*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": f"{HOST}/en-us/how-to-buy/"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            body = r.read().decode("utf-8", "ignore")
        _last[0] = time.time()
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(body)
        return body, "200"
    except urllib.error.HTTPError as e:
        _last[0] = time.time()
        if e.code in (401, 403):
            raise Stop(f"HTTP {e.code} on {url}")
        return None, f"HTTP {e.code}"
    except Exception as e:  # noqa: BLE001
        _last[0] = time.time()
        return None, f"ERR {type(e).__name__}"


def results_url(route, lat, lng, distance):
    qs = urllib.parse.urlencode({
        "lat": lat, "lng": lng, "distance": distance, "product": "",
        "brand": "", "units": "miles", "country": "United States",
        "onlyCountry": "false", "state": "", "onlyState": "false"})
    return f"{HOST}{route}?{qs}"


def parse_rows(body):
    try:
        data = json.loads(body)
    except ValueError:
        return None
    if isinstance(data, dict):
        return data.get("mapNodes") or []
    return data if isinstance(data, list) else []


def key_of(r):
    return (norm_company(r.get("company")),
            str(r.get("street") or "").strip().lower(),
            str(r.get("city") or "").strip().lower())


def sweep(loc_key, route):
    seen = {}
    log = []
    origin_hits = 0
    clipped = 0
    for name, lat, lng in METROS:
        for radius in RADII:
            tag = f"{loc_key}-{name}-{radius}.json"
            body, status = one_shot(results_url(route, lat, lng, radius), tag)
            if status != "cache":
                origin_hits += 1
            if body is None:
                log.append({"metro": name, "radius": radius, "status": status})
                break                      # errors: move to next metro
            rows = parse_rows(body)
            if rows is None:
                log.append({"metro": name, "radius": radius,
                            "status": "non-json"})
                break
            fresh = 0
            for r in rows:
                k = key_of(r)
                if k not in seen:
                    r["metros_seen_in"] = []
                    seen[k] = r
                    fresh += 1
                seen[k]["metros_seen_in"].append(f"{name}@{radius}")
            log.append({"metro": name, "radius": radius, "rows": len(rows),
                        "fresh": fresh})
            print(f"  {loc_key:14s} {name:20s} r={radius:>3s} "
                  f"rows={len(rows)} fresh={fresh}", flush=True)
            if len(rows) < PAGE_CAP:
                break                      # not clipped — no half-step needed
            clipped += 1
    return seen, log, origin_hits, clipped


def main():
    all_records = []
    meta = {}
    total_origin = 0
    try:
        for loc_key, route in LOCATORS.items():
            print(f"\n══ sweep: {loc_key}", flush=True)
            seen, log, hits, clipped = sweep(loc_key, route)
            total_origin += hits
            meta[loc_key] = {"locations": len(seen), "origin_hits": hits,
                             "clipped_queries_half_stepped": clipped,
                             "query_log": log}
            for k, r in sorted(seen.items()):
                rec = dict(r)
                rec["locator"] = loc_key
                rec["source"] = SOURCE
                rec["source_url"] = f"{HOST}{route}"
                rec["captured"] = CAPTURED
                rec["company"] = (r.get("company") or "").strip() or None
                rec["website"] = (r.get("website") or "").strip() or None
                rec["domain"] = apex(rec["website"])
                rec["email"] = (r.get("email") or "").strip() or None
                rec["phone_raw"] = (r.get("phone1") or "").strip() or None
                rec["phone_10"] = digits(r.get("phone1"))
                rec["is_us"] = (str(r.get("country") or "").strip()
                                in ("United States", "US", "USA"))
                rec["metros_seen_in"] = "|".join(r.get("metros_seen_in", []))
                all_records.append(rec)
    except Stop as e:
        print(f"BLOCKED: {e} — source stopped, writing what exists")
        meta["blocked"] = str(e)

    stats = report(SOURCE, all_records,
                   code_fields=("distributorLevel", "certifications",
                                "preferred", "preferredFacility",
                                "productCategory", "locator"))
    comp = {}
    for r in all_records:
        k = norm_company(r.get("company"))
        if k:
            comp.setdefault(k, []).append(r)
    stats["locations_total"] = len(all_records)
    stats["distinct_companies"] = len(comp)
    stats["companies_with_domain"] = len(
        {k for k, rs in comp.items() if any(x["domain"] for x in rs)})
    stats["companies_with_email"] = len(
        {k for k, rs in comp.items() if any(x["email"] for x in rs)})
    both = {k for k, rs in comp.items()
            if any(x["locator"] == "how-to-buy" for x in rs)
            and any(x["locator"] == "service-repair" for x in rs)}
    stats["companies_in_both_locators"] = len(both)
    print(f"\nlocations={len(all_records)} companies={len(comp)} "
          f"with_domain={stats['companies_with_domain']} "
          f"with_email={stats['companies_with_email']} "
          f"in_both={len(both)}")

    import csv
    master = os.path.join(_polite.ROOT, "data", "deduped-v7.csv")
    if os.path.exists(master):
        have = set()
        with open(master, newline="", encoding="utf-8", errors="ignore") as fh:
            for row in csv.DictReader(fh):
                d = apex(row.get("domain") or row.get("website") or "")
                if d:
                    have.add(d)
        mine = {r["domain"] for r in all_records if r["domain"]}
        stats["net_new_domains_vs_deduped_v7"] = len(mine - have)
        print(f"net-new domains vs deduped-v7: "
              f"{stats['net_new_domains_vs_deduped_v7']} of {len(mine)}")
    else:
        stats["net_new_domains_vs_deduped_v7"] = "deduped-v7.csv not found"

    write_raw(SOURCE, {
        "source_name": "Columbus McKinnon locators (how-to-buy + "
                       "service-repair-centers)",
        "source_url": f"{HOST}/en-us/how-to-buy/",
        "method": "61-metro grid × 150-mile circles against the widget's own "
                  "results routes with the exact submitSearch contract "
                  "(brand='' accepted); a query returning exactly 50 rows is "
                  "treated as page-capped and half-stepped 150→75→25; "
                  "single-attempt fetches (no 5xx retry ladder), ≥3s pace, "
                  "disk cache; dedupe on (company, street, city).",
        "authorization": "GATE R-L2 signed by Artur 2026-08-04 — 'Continue, "
                         "build anything needed to get as much as possible' "
                         "(linecard-locators log). robots: no matching rule — "
                         "no override involved.",
        "robots_check": "www.cmco.com robots.txt: no rule matches either "
                        "locator route (linecard-evidence-2026-08-03.json).",
        "vertical_code_note": "distributorLevel / certifications / preferred "
                              "/ brand line card / productCategory captured "
                              "verbatim, unmapped. Houston probe oddity "
                              "carried forward: preferred=true on all rows.",
        "page_cap_note": f"PAGE_CAP={PAGE_CAP} (observed round number); "
                         "half-step protocol bounds clipping, does not "
                         "eliminate it — residual clipping possible where "
                         "25-mile circles still hold >50 rows.",
        "per_locator": {k: {kk: vv for kk, vv in v.items()
                            if kk != "query_log"} for k, v in meta.items()
                        if isinstance(v, dict)},
        "query_log": {k: v.get("query_log", []) for k, v in meta.items()
                      if isinstance(v, dict)},
        "origin_requests": total_origin,
        "stats": stats,
    }, all_records)


if __name__ == "__main__":
    main()
