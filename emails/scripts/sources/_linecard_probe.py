#!/usr/bin/env python3
"""linecard-locators one-query probes — measure the payload, decide nothing.

Per `linecard-locators [NOT-STARTED]/01-prompt.md` steps 1–2, second half.
The evidence pass (`_linecard_evidence.py`, same day) pinned each target's
transport; this script submits AT MOST ONE query per locator and measures the
payload shape: fields named exactly as the source names them, website coverage
against the 67.6% Timken benchmark, phone/street secondary, every source-native
code verbatim and uninterpreted (§5i), distinct companies, and a probe-level
chain count (the real chain rule is S2's).

Transport per target, from the evidence pass:

  flexco      — ZERO requests. The locator page embeds the ENTIRE worldwide
                network as one inline JSON array (2,500 records) in the page
                already cached at `_cache/linecard-flexco/locator.html`. The
                "any-distance" question is answered better than asked: every
                record ships on page load, no query exists to submit.
  samsonrope  — ONE GET to `/api/FindDistributor/GetDistributors` (the page's
                own `submitclicked()` route). `validateForm()` REQUIRES an
                industry + a ≥2-char place string, so the probe carries the
                most ICP-relevant industry (Crane) and one dense metro (77002
                Houston). robots: `Allow: /` on www.samsonrope.com.
  cmco        — the react mount declares `data-initial-mount-request-url=
                /en-us/how-to-buy/filters` and `data-request-url=
                /en-us/how-to-buy/results` (required inputs: location, brand).
                GET js-bottom.js (params), GET filters (taxonomy — is the
                "CM Authorized Rigging Centers" tier in it?), ONE results
                query, and one GET of /en-us/service-repair-centers/ to answer
                the second-network question. robots: no matching rule.
  indsci      — the two "empty list containers" are `.ps-widget` mounts filled
                by PriceSpider (third-party SaaS; account key + country are in
                the page's own meta tags, the Banjo/Banner public-identifier
                shape). The data host is PriceSpider's, so ITS robots governs
                (E4 per-origin lesson). robots on cdn host read first; ≤2
                bounded shape attempts; a 404 stops the route (`Blocked`), no
                guessing storm.
  chromalox   — optional; page names `/chxapi/getrepdata` outright. ONE bare
                GET. robots: `Allow: /`.
  zoeller     — DEAD today: locator page HTTP 403 on the evidence pass
                (robots.txt itself was fine). §5i shelf-life in action; no
                bypass, no retry, recorded. Nothing for this script to do.

Budget: ≤8 requests per host per the log §1; this script spends samson 1,
cmco 4, pricespider ≤4 on its cdn host, chromalox 1, flexco 0, zoeller 0.
Every response cached; a re-run makes zero origin requests.
"""
import json
import os
import re
import sys
import urllib.parse

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402

_polite.CAPTURED = "2026-08-03"

from _polite import RAW, Blocked, Fetcher, apex, norm_company  # noqa: E402

CAPTURED = _polite.CAPTURED

# Probe-level chain markers only — S2 owns the real rule. Names chosen from
# chains already suppressed in this program (§5c, §2b) that plausibly appear
# in belting/rigging/safety networks.
CHAINS = {
    "motion industries", "motion", "applied industrial technologies",
    "fastenal", "grainger", "w w grainger", "msc industrial",
    "kaman industrial technologies", "kaman", "bdi", "ibt industrial solutions",
    "purvis industries", "hydradyne", "vallen distribution", "vallen",
    "wesco", "rexel", "mcmaster carr", "united central industrial supply",
    "mi conveyance solutions", "sunsource", "singer industrial",
}


def dump(name, payload):
    path = os.path.join(RAW, f"{name}-{CAPTURED}.json")
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=1)
    print(f"raw -> {path}")
    return path


def measure(records, website_key, name_key, phone_key, street_key, code_keys,
            us_pred=None):
    """Payload-shape numbers. Verbatim keys in, percentages out."""
    rows = [r for r in records if us_pred is None or us_pred(r)]
    n = len(rows) or 1
    filled = lambda k: sum(  # noqa: E731
        1 for r in rows if str(r.get(k) or "").strip())
    names = {norm_company(r.get(name_key)) for r in rows}
    names.discard("")
    chains = sorted({norm_company(r.get(name_key)) for r in rows} & CHAINS)
    out = {
        "rows_measured": len(rows),
        "distinct_companies_rough": len(names),
        "pct_website": round(filled(website_key) / n * 100, 1),
        "pct_phone": round(filled(phone_key) / n * 100, 1) if phone_key else None,
        "pct_street": round(filled(street_key) / n * 100, 1) if street_key else None,
        "chain_names_matched": chains,
        "codes_verbatim": {},
    }
    for ck in code_keys:
        dist = {}
        for r in rows:
            v = r.get(ck)
            v = "|".join(map(str, v)) if isinstance(v, list) else (
                "(null)" if v in (None, "") else str(v))
            dist[v] = dist.get(v, 0) + 1
        top = dict(sorted(dist.items(), key=lambda kv: -kv[1])[:15])
        out["codes_verbatim"][ck] = top
    return out


# ── flexco — zero-request measurement off the cached page ────────────────────

def probe_flexco():
    print("\n════ flexco (0 requests — inline payload already cached)")
    path = os.path.join(RAW, "_cache", "linecard-flexco", "locator.html")
    html = open(path, encoding="utf-8", errors="ignore").read()
    i = html.find('{"id":"')
    start = html.rfind("[", 0, i)
    depth, j, in_str, esc = 0, start, False, False
    while j < len(html):
        c = html[j]
        if in_str:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == '"':
                in_str = False
        else:
            if c == '"':
                in_str = True
            elif c == "[":
                depth += 1
            elif c == "]":
                depth -= 1
                if depth == 0:
                    break
        j += 1
    arr = json.loads(html[start:j + 1])
    url = "https://www.flexco.com/NA/EN/Flexco/Contact-Us/Distributors.htm"
    for r in arr:
        r["source"] = "linecard-flexco"
        r["source_url"] = url
        r["captured"] = CAPTURED
    us = lambda r: r.get("country") == "UNITED STATES OF AMERICA"  # noqa: E731
    stats = measure(arr, "weburl", "name", "phone", "address",
                    ["flexfirst", "country"], us_pred=us)
    stats["records_total_worldwide"] = len(arr)
    web_rows = [r for r in arr if us(r) and str(r.get("weburl") or "").strip()]
    stats["us_rows_with_weburl"] = len(web_rows)
    stats["us_distinct_companies_with_weburl"] = len(
        {norm_company(r["name"]) for r in web_rows} - {""})
    stats["us_distinct_domains"] = len(
        {apex(r.get("weburl")) for r in web_rows} - {None})
    print(json.dumps(stats, indent=1)[:1400])
    dump("linecard-flexco", {
        "source": "linecard-flexco",
        "source_name": "Flexco distributor locator (inline page payload)",
        "source_url": url,
        "captured": CAPTURED,
        "transport": "static HTML — the ENTIRE worldwide network is one inline "
                     "JSON array in the locator page itself; every record "
                     "ships on page load before any query. The radius/sort "
                     "selects (incl. 'Any Distance', value='') only filter "
                     "client-side.",
        "fields_verbatim": sorted(arr[0].keys() - {"source", "source_url",
                                                   "captured"}),
        "robots_check": "flexco.com and www.flexco.com: no rule matches "
                        "/NA/EN/Flexco/Contact-Us/Distributors.htm — allowed. "
                        "Verdicts in linecard-evidence-2026-08-03.json.",
        "vertical_code_note": "flexfirst is Flexco's own partner-programme "
                              "flag (18 US rows carry '1'). Name suffixes like "
                              "'-(COAL)'/'-(IND'L)' encode segment splits on "
                              "the same street address — captured verbatim in "
                              "name, uninterpreted (§5i).",
        "origin_requests_this_probe": 0,
        "stats": stats,
        "records": arr,
    })
    return stats


# The 16 options exactly as the page carries them (label + GUID), captured on
# the evidence pass from the cached locator page. 'towing' is lowercase in the
# source; that is not a typo here.
SAMSON_FILTER_VERBATIM = [
    {"label": "Arborist", "id": "5e24da57-1d34-40e9-9aff-7d5b86f50585"},
    {"label": "Commercial Fishing", "id": "af804f52-c17f-4b77-962f-51cc1ff9438c"},
    {"label": "Crane", "id": "7b46eaf6-6d7c-43be-ae24-370fbbb17098"},
    {"label": "Defense", "id": "7f57a017-3679-4559-b12f-486ae094c947"},
    {"label": "Energy", "id": "6152e8d7-8929-4897-839b-9ce728ee9639"},
    {"label": "Entertainment", "id": "aa927769-d89f-40d2-8fbe-3024b7af21d2"},
    {"label": "General Cordage", "id": "ab4c6c5f-6f91-4dea-8f5e-dba469aceb3a"},
    {"label": "Inland River", "id": "eb76740f-ba34-4284-891a-af6f7e888e29"},
    {"label": "Mining", "id": "0146b60a-7da2-4b5a-bcb0-59ada8339725"},
    {"label": "Mooring", "id": "0c13b663-7c42-4915-94f2-390d476394eb"},
    {"label": "Other", "id": "32da0cc4-9972-41f7-9493-83c193bc083d"},
    {"label": "Recreational Marine", "id": "70e174c0-85da-4be6-a96d-f7bdb3a813b8"},
    {"label": "Safety / Rescue", "id": "276f586c-5677-4df4-a43a-92f5f4270b2c"},
    {"label": "towing", "id": "a719c406-a9b2-4803-a17b-169dff6da642"},
    {"label": "Tug", "id": "3cc301b6-2d33-4c57-86d2-c5ef7e86674a"},
    {"label": "Utility", "id": "29792bf7-ed8e-4484-abd4-8749f4b6c507"},
]

# ── samsonrope — one GET against the page's own API route ────────────────────

SAMSON_INDUSTRY = ("Crane", "7b46eaf6-6d7c-43be-ae24-370fbbb17098")
SAMSON_PLACE = "77002"   # dense metro, same Houston anchor the pack uses


def probe_samsonrope():
    print("\n════ samsonrope (1 request)")
    f = Fetcher("linecard-samsonrope", min_bytes=2)
    cat, guid = SAMSON_INDUSTRY
    q = urllib.parse.urlencode(
        {"category": cat, "SearchString": SAMSON_PLACE, "Id": guid})
    url = f"https://www.samsonrope.com/api/FindDistributor/GetDistributors?{q}"
    try:
        body, cached = f.get(url, f"probe-{cat.lower()}-{SAMSON_PLACE}.json",
                             headers={"Accept": "application/json",
                                      "X-Requested-With": "XMLHttpRequest",
                                      "Referer": "https://www.samsonrope.com/"
                                                 "resources/find-a-distributor"})
    except Blocked as e:
        print(f"BLOCKED: {e}")
        dump("linecard-samsonrope", {
            "source": "linecard-samsonrope", "source_url": url,
            "captured": CAPTURED, "blocked": str(e), "records": []})
        return {"blocked": str(e)}
    data = json.loads(body)
    rows = data if isinstance(data, list) else data.get("value") or []
    for r in rows:
        r["source"] = "linecard-samsonrope"
        r["source_url"] = url
        r["captured"] = CAPTURED
    stats = measure(rows, "Website", "AccountName", "Phone1", "Address1",
                    ["Industries", "Country", "State"])
    stats["returned_rows"] = len(rows)
    stats["from_cache"] = cached
    print(json.dumps(stats, indent=1)[:1600])
    dump("linecard-samsonrope", {
        "source": "linecard-samsonrope",
        "source_name": "Samson Rope find-a-distributor API",
        "source_url": url,
        "captured": CAPTURED,
        "transport": "JSON endpoint — GET /api/FindDistributor/GetDistributors"
                     "?category=&SearchString=&Id= (the page's own "
                     "submitclicked() route). validateForm() REQUIRES an "
                     "industry selection AND a ≥2-char place string — there is "
                     "no unfiltered query.",
        "probe_query": {"category": cat, "SearchString": SAMSON_PLACE,
                        "Id": guid},
        "industry_filter_verbatim": SAMSON_FILTER_VERBATIM,
        "robots_check": "www.samsonrope.com robots.txt: `Allow: /` — the API "
                        "path is allowed. Verdict in "
                        "linecard-evidence-2026-08-03.json.",
        "vertical_code_note": "The 16-option industry filter is the source's "
                              "own vertical code (§5i) — captured verbatim "
                              "above, uninterpreted, untested for sort.",
        "origin_requests_this_probe": f.origin_requests,
        "stats": stats,
        "records": rows,
    })
    return stats


# ── cmco — filters taxonomy, one results query, repair-centers comparison ────

CMCO_HOUSTON = (29.7561, -95.3648)


def probe_cmco():
    print("\n════ cmco (≤4 requests)")
    f = Fetcher("linecard-cmco", min_bytes=2)
    out = {"source": "linecard-cmco",
           "source_name": "Columbus McKinnon how-to-buy locator",
           "source_url": "https://www.cmco.com/en-us/how-to-buy/",
           "captured": CAPTURED,
           "transport": "react mount, but the data path is same-host server "
                        "routes declared in the mount div: "
                        "/en-us/how-to-buy/filters (taxonomy) and "
                        "/en-us/how-to-buy/results (query). NOT headless-only.",
           "robots_check": "www.cmco.com robots.txt: no rule matches "
                           "/en-us/how-to-buy/ or its subpaths — allowed. "
                           "Verdict in linecard-evidence-2026-08-03.json.",
           "records": []}

    # params live in the site bundle; one GET, cached
    params_found = []
    try:
        js, _ = f.get("https://www.cmco.com/js-bottom.js", "js-bottom.js")
        seg_hits = [m.start() for m in re.finditer(r"how-to-buy|locator|results",
                                                   js)]
        for h in seg_hits[:6]:
            seg = js[max(0, h - 300):h + 500]
            params_found += re.findall(r'["\']([A-Za-z]{2,24})["\']\s*[:=]', seg)
        out["bundle_param_hints"] = sorted(set(params_found))[:40]
    except Blocked as e:
        out["bundle_param_hints"] = [f"blocked: {e}"]
    except Exception as e:  # noqa: BLE001
        out["bundle_param_hints"] = [f"unavailable: {e!r}"]

    # 1) the taxonomy — establishes whether the tier is a first-class code
    try:
        body, _ = f.get("https://www.cmco.com/en-us/how-to-buy/filters",
                        "filters.json",
                        headers={"Accept": "application/json, */*;q=0.8",
                                 "Referer": out["source_url"]})
        try:
            out["filters_payload"] = json.loads(body)
        except ValueError:
            out["filters_payload_raw_first_2k"] = body[:2000]
    except Blocked as e:
        out["filters_status"] = str(e)

    # 2) ONE results query — Houston centroid. Attempted once; a 4xx is a
    #    finding, not a retry loop.
    lat, lng = CMCO_HOUSTON
    qs = {"latitude": lat, "longitude": lng}
    out["results_query_sent"] = None
    try:
        q = urllib.parse.urlencode(qs)
        url = f"https://www.cmco.com/en-us/how-to-buy/results?{q}"
        out["results_query_sent"] = url
        body, _ = f.get(url, "results-houston.json",
                        headers={"Accept": "application/json, */*;q=0.8",
                                 "Referer": out["source_url"]})
        try:
            out["results_payload"] = json.loads(body)
        except ValueError:
            out["results_payload_raw_first_3k"] = body[:3000]
    except Blocked as e:
        out["results_status"] = str(e)

    # 3) the second locator — same mount? same routes?
    try:
        body, _ = f.get("https://www.cmco.com/en-us/service-repair-centers/",
                        "service-repair-centers.html")
        m = re.search(r'<div[^>]+id="react-locator-mount"[^>]*>', body)
        out["service_repair_mount"] = m.group(0) if m else "no react mount found"
    except Blocked as e:
        out["service_repair_status"] = str(e)

    out["origin_requests_this_probe"] = f.origin_requests
    dump("linecard-cmco", out)
    print(json.dumps({k: v for k, v in out.items()
                      if k not in ("records", "filters_payload",
                                   "results_payload")}, indent=1)[:1200])
    return out


# ── indsci — PriceSpider widget; bounded shape attempts on ITS hosts ─────────

PS_KEY = "7176-65f83edb7cea636071b9cd6a"     # published in indsci's own meta
PS_CONFIG = "65f845cc7cea636071b9cd6f"       # ps-config on the second widget


def probe_indsci():
    print("\n════ indsci (PriceSpider route, ≤4 requests on PS cdn host)")
    out = {"source": "linecard-indsci",
           "source_name": "Industrial Scientific where-to-buy (PriceSpider)",
           "source_url": "https://www.indsci.com/en/where-to-buy",
           "captured": CAPTURED,
           "transport": "JS-only on the page; the two 'empty list containers' "
                        "are .ps-widget mounts filled by PriceSpider "
                        "(third-party SaaS). Account key + country ship in "
                        "indsci's own meta tags (public site identifier — the "
                        "Banjo/Banner shape). Data host is PriceSpider's, so "
                        "PriceSpider's robots governs (E4 per-origin lesson).",
           "ps_key_public": PS_KEY, "ps_config_public": PS_CONFIG,
           "records": []}

    fc = Fetcher("linecard-indsci-ps", min_bytes=2)
    # robots on the CDN host first — per-origin rule
    try:
        rb, _ = fc.get("https://cdn.pricespider.com/robots.txt", "robots-cdn.txt")
        out["ps_cdn_robots_first_1k"] = rb[:1000]
    except Blocked as e:
        out["ps_cdn_robots"] = str(e)
    # the widget lib names its endpoints statically
    try:
        js, _ = fc.get("https://cdn.pricespider.com/1/lib/ps-widget.js",
                       "ps-widget.js")
        hosts = sorted(set(re.findall(
            r'https?://[a-z0-9\.\-]*pricespider[a-z0-9\.\-]*[^"\'\s\\]*',
            js)))[:20]
        out["ps_endpoints_in_lib"] = hosts
        m = re.search(r'["\']((?:https?:)?//cdn\.pricespider\.com/[^"\']*'
                      r'(?:config|conf)[^"\']*)["\']', js)
        out["ps_config_url_template"] = m.group(1) if m else None
    except Blocked as e:
        out["ps_lib"] = str(e)

    # ≤2 bounded shape attempts, exact URLs recorded; 404 => Blocked => stop.
    attempts = []
    acct = PS_KEY.split("-", 1)[0]
    for label, url in [
        ("config-by-account",
         f"https://cdn.pricespider.com/1/{acct}/config.js"),
        ("config-by-key",
         f"https://cdn.pricespider.com/1/{PS_KEY}/config.js"),
    ]:
        try:
            body, _ = fc.get(url, f"try-{label}.txt")
            attempts.append({"attempt": label, "url": url, "status": "200",
                            "first_400": body[:400]})
            break   # one success is all the shape question needs
        except Blocked as e:
            attempts.append({"attempt": label, "url": url, "status": str(e)})
        except Exception as e:  # noqa: BLE001
            attempts.append({"attempt": label, "url": url,
                             "status": f"ERR {e!r}"})
    out["shape_attempts"] = attempts
    out["origin_requests_this_probe"] = fc.origin_requests
    dump("linecard-indsci", out)
    print(json.dumps({k: v for k, v in out.items() if k != "records"},
                     indent=1)[:1500])
    return out


# ── chromalox — optional; the API is named in the page ───────────────────────

def probe_chromalox():
    print("\n════ chromalox (1 request)")
    f = Fetcher("linecard-chromalox", min_bytes=2)
    url = "https://www.chromalox.com/chxapi/getrepdata"
    try:
        body, cached = f.get(url, "getrepdata.json",
                             headers={"Accept": "application/json, */*;q=0.8",
                                      "Referer": "https://www.chromalox.com/"
                                                 "locate-a-rep"})
    except Blocked as e:
        print(f"BLOCKED: {e}")
        dump("linecard-chromalox", {
            "source": "linecard-chromalox", "source_url": url,
            "captured": CAPTURED, "blocked": str(e), "records": []})
        return {"blocked": str(e)}
    try:
        data = json.loads(body)
    except ValueError:
        dump("linecard-chromalox", {
            "source": "linecard-chromalox", "source_url": url,
            "captured": CAPTURED, "non_json_first_2k": body[:2000],
            "records": []})
        return {"non_json": True}
    rows = data if isinstance(data, list) else \
        next((v for v in data.values() if isinstance(v, list)), [])
    for r in rows:
        if isinstance(r, dict):
            r["source"] = "linecard-chromalox"
            r["source_url"] = url
            r["captured"] = CAPTURED
    keys = sorted(rows[0].keys()) if rows and isinstance(rows[0], dict) else []
    web_key = next((k for k in keys if re.search(
        r"(?i)web|url|site|domain", k)), None)
    name_key = next((k for k in keys if re.search(
        r"(?i)name|company|account", k)), None) or (keys[0] if keys else None)
    phone_key = next((k for k in keys if re.search(r"(?i)phone|tel", k)), None)
    code_keys = [k for k in keys if re.search(
        r"(?i)type|tier|categor|group|region|territor|product|division", k)][:6]
    stats = (measure(rows, web_key or "", name_key or "", phone_key,
                     None, code_keys) if rows else {})
    stats["returned_rows"] = len(rows)
    stats["fields_verbatim"] = keys
    stats["website_key_detected"] = web_key
    print(json.dumps(stats, indent=1)[:1400])
    dump("linecard-chromalox", {
        "source": "linecard-chromalox",
        "source_name": "Chromalox locate-a-rep API",
        "source_url": url,
        "captured": CAPTURED,
        "transport": "JSON endpoint — /chxapi/getrepdata, named in the page "
                     "source; bare GET.",
        "robots_check": "www.chromalox.com robots.txt: `Allow: /` — allowed. "
                        "Verdict in linecard-evidence-2026-08-03.json.",
        "discount_standing": "Skews manufacturer REPS, not distributors — a "
                             "rep firm is not our buyer (00-README.md rank 5).",
        "origin_requests_this_probe": f.origin_requests,
        "stats": stats,
        "records": rows,
    })
    return stats


def main():
    only = set(sys.argv[1:])
    ran = {}
    for key, fn in [("flexco", probe_flexco), ("samsonrope", probe_samsonrope),
                    ("cmco", probe_cmco), ("indsci", probe_indsci),
                    ("chromalox", probe_chromalox)]:
        if only and key not in only:
            continue
        try:
            ran[key] = fn()
        except Exception as e:  # noqa: BLE001 — a probe failure is a finding
            print(f"!! {key} probe raised {e!r}")
            ran[key] = {"error": repr(e)}
    print("\nprobes complete:", list(ran))


if __name__ == "__main__":
    main()
