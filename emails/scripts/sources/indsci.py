#!/usr/bin/env python3
"""E4 — Industrial Scientific where-to-buy, and the PriceSpider platform pattern.

The brand is the smaller half of this file. PriceSpider (rebranded **Wayvia**;
the widget footer still says "© Wayvia 2005-2026 … (Formerly PriceSpider)") is a
third-party where-to-buy SaaS, so pinning its data flow once generalises to every
brand mounting it — the way `storelocatorwidgets` generalised from Banjo and
`admin-ajax` from NTN/Quincy/Gast.

════════════════════════════════════════════════════════════════════════════════
1. THE PRICESPIDER PATTERN  (reusable — a new brand costs one config lookup)
════════════════════════════════════════════════════════════════════════════════

**How the brand page declares itself.** Three public `<meta>` tags plus one
async loader, all in the anonymous HTML:

    <meta name="ps-key"      content="<clientId>-<defaultConfigId>">
    <meta name="ps-country"  content="US">
    <meta name="ps-language" content="en">
    <script src="//cdn.pricespider.com/1/lib/ps-widget.js" async></script>

`ps-key` is **two identifiers joined by a hyphen**, and the loader proves it:
`ps-widget.js` does `parseInt(meta("ps-key"))`, which stops at the hyphen. So the
integer prefix is the **clientId** (7176 here) and the 24-hex suffix is the
**default configId**. Mount points are `<div class="ps-widget">`; a
`ps-config="<configId>"` attribute on a mount **overrides** the configId for that
widget only. Industrial Scientific ships two mounts, so two configIds, so
**two different datasets on one page** (§4 below — they are NOT the same list).

**The four-request chain, in order, all anonymous GETs:**

  1. `GET https://cdn.pricespider.com/1/<clientId>/config.js`
     → JSONP `PriceSpider.onload("config", {id, version, versions:{widget,
       recipe, wtb4, omni}})`. Names the library version (2.34.0 here).
  2. `GET https://cdn.pricespider.com/1/lib/<version>/ps-widget.js`
     → the real 444 KB library. (The 6 KB `lib/ps-widget.js` is only a loader.)
  3. `GET https://cdn.pricespider.com/1/<clientId>/<configId>/config.js`
     → JSONP `PriceSpider.onload("<configId>/config", { "wtb4": {"token": "…"},
       … })`. **This is where the `token` query parameter below comes from.**
     Also siblings `…/<configId>/widget.js`, `widget.css`, `res/en.js`.
  4. `GET https://omni.pricespider.com/?…`  ← **the data path.**

**The data path — full request shape.** JSONP over GET, no POST, no body:

    https://omni.pricespider.com/
      ?clientId=<int>              # ps-key prefix
      &configId=<24hex>            # ps-key suffix, or the mount's ps-config
      &countryCode=US              # ps-country meta
      &languageCode=en             # ps-language meta
      &lat=<float>&lon=<float>     # centre of the radius search
      &postalCode=<zip>            # sent alongside lat/lon, not instead of
      &token=<32hex>               # from step 3's config.js  (NEVER logged here)
      &include=stores,products     # present on user-initiated searches only
      &key=/<clientId>/<configId>[/include/<urlencoded include>]   # cache key,
                                   # a literal restatement of the params above
      &callback=PriceSpider.onload # JSONP wrapper name

  Response: `PriceSpider.onload("<key>", { … })` wrapping
  `{skus, products, families, stores, regionalPrices, lastMileDeliveryData}`
  (the `include=` form returns only `{products, stores}`).

**The record schema is COLUMNAR — struct-of-arrays, not array-of-structs.**
`stores` is a *list of blocks*, and each block is one object of parallel arrays:

    "stores": [ { "name": [...], "address1": [...], "city": [...], … } ]

Row *i* is assembled by taking index *i* of every column. 26 columns, measured:
`address1 address2 city countryCode hours id latitude longitude misc1 misc2 name
phone1 phone2 postalCode sellerId state storeId url urlLabel distance sellerName
sellerLogo stockUpdatable accountSeller configTypes lastMileDelivery`.

**Geocoder (separate host).** `https://locate.pricespider.com/?ip=0&callback=…`
resolves the visitor's IP on load; `?countryCode=US&postalCode=<zip>&callback=…`
resolves a typed ZIP to lat/lon. It is **avoidable** — supply your own ZIP
centroids and call `omni` directly, which is what this file does.

**Telemetry.** `wtbevents.pricespider.com` (mapRefresh / widgetRequests /
widgetStats) and `embeddedcloud.pricespider.com/seller_md/<sellerId>.png`
(seller logos). Neither carries dealer data; neither is ever requested here.

**Adding another PriceSpider brand = one row in `BRANDS` below.** Read the
brand's where-to-buy HTML, copy `ps-key` and any `ps-config` attributes, done.
No bundle reading, no per-brand reverse engineering.

**Credential assessment: NOT a credential.** `token` is served inside
`config.js` on a public CDN to every anonymous visitor, with no login, no
session, no cookie, no per-user issuance, and it is byte-identical across both
of this brand's configs. Same shape as Festo's static `Authorization` and the
Banjo/Banner public widget identifier. It is therefore read out of the cached
config.js **at run time** and is never written into this file, into git, or into
any output — the Bimba rule (a value the anonymous page did not publish stops
the source) is not triggered, but the no-record rule still applies.

════════════════════════════════════════════════════════════════════════════════
2. ⛔ GATE — `omni.pricespider.com` REFUSES robots.txt WITH HTTP 403
════════════════════════════════════════════════════════════════════════════════

    GET https://omni.pricespider.com/robots.txt   →  **HTTP 403**
    GET https://locate.pricespider.com/robots.txt →  200, body `{"status":"OK"}`
                                                     (API answers every path;
                                                      publishes no robots file)
    GET https://cdn.pricespider.com/robots.txt    →  HTTP 404 (no robots file)

Two standing rules point opposite ways and the conflict is **not this script's
to resolve**:

  - **RFC 9309 §2.3.1.3** puts 403 in the "Unavailable" band and says an
    unavailable robots.txt means unrestricted access. Read that way, the host
    states no rule, nothing is Disallowed, and the longest-match verdict on
    `/` is vacuously "allowed".
  - **`_polite.py`'s house rule** — "a hard 403 stops the source … never
    bypassed" — already fired: the robots fetch itself raised `Blocked`. The
    Zoeller and Matthews precedents in this pack both stopped on exactly this
    status, and per-site overrides are explicit, dated, founder-signed calls.

**Default is NO.** `GATE_SIGNED = False` below, and while it is False this
script makes **zero** requests to `omni.pricespider.com`. It instead normalises
the dealer rows the *sanctioned observation render* already produced — the
browser loading the page the way any visitor does, which is not a scripted
crawl of the API and is the one legitimate render in this tier.

Note the honest asymmetry: the 403 is on `/robots.txt`, a path this query-only
API plainly does not route, and the very same origin returned **200 four times**
to the observation render's `/?clientId=…` calls. That is a real argument that
the 403 is path-shaped rather than crawler-shaped. It is still an argument, not
a signature, so it is written down and left for Artur.

════════════════════════════════════════════════════════════════════════════════
3. ⚠ §5i SOURCE-NATIVE CODES — captured verbatim, and MEASURED for whether they
   actually sort (today's SKF lesson: DC001–DC028 had a published decoding table
   and a payload field that was CONSTANT on every row — a decoding table is not
   a code).
════════════════════════════════════════════════════════════════════════════════

Every payload column is carried through as `<field>_raw`. Measured distributions
are printed by `report()` and written into the raw file. Read them before
seating on any of them: `configTypes`, `lastMileDelivery`, `misc1`, `misc2`,
`phone2`, `address2`, `urlLabel` are **null on 100% of observed rows** — present
in the schema, absent from the data, exactly the SKF shape.

⚠ TWO DATASETS, NOT ONE. The `ps-config` mount (…9cd6f) returns rows that are
all `accountSeller=1` — Industrial Scientific's own managed dealer list, and
**`url` is null on 100% of them**. The `ps-key` mount (…9cd6a) returns a
superset that also includes PriceSpider-network sellers (`accountSeller=0`,
`sellerLogo=true`) carrying corporate URLs. `config_id_raw` keeps them apart;
they are never merged blindly.
"""
import json
import os
import re
import sys
import urllib.parse

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402

_polite.CAPTURED = "2026-08-04"

from _polite import (RAW, US_STATES, Blocked, Fetcher, apex,  # noqa: E402
                     digits, norm_company, report, write_raw)

CAPTURED = _polite.CAPTURED

SOURCE = "indsci"
PAGE = "https://www.indsci.com/en/where-to-buy"

CDN = "https://cdn.pricespider.com/1"
OMNI = "https://omni.pricespider.com/"

# ── the reusable brand table ────────────────────────────────────────────────
# Adding a PriceSpider brand is ONE row: read its where-to-buy HTML, copy the
# `ps-key` meta and any `ps-config` attributes off the `.ps-widget` mounts.
BRANDS = {
    "indsci": {
        "page": PAGE,
        # "<clientId>-<defaultConfigId>" exactly as the ps-key meta ships it.
        "ps_key": "7176-65f83edb7cea636071b9cd6a",
        # extra mounts carrying their own ps-config attribute
        "ps_configs": ["65f845cc7cea636071b9cd6f"],
        "country": "US",
        "language": "en",
    },
}

# ⛔ See §2. Default NO. Flipping this to True is a founder call, not a code
# change made in passing — it authorises scripted requests to an origin that
# answered 403 to a robots.txt fetch.
GATE_SIGNED = False

# Three-metro probe, per the brief. ZIP centroids are hardcoded so the
# `locate.pricespider.com` geocoder is never called.
METROS = [
    ("houston-tx-77002", "77002", 29.7568447, -95.3656519),
    ("chicago-il-60601", "60601", 41.8858, -87.6229),
    ("cleveland-oh-44113", "44113", 41.4841, -81.7027),
]

# The observation render's output (see §2). Written by the E4 render, read here.
OBSERVE = os.path.join(RAW, "e4-observe-indsci-ps-2026-08-04.json")

# National chains / e-tailers. PriceSpider is primarily a RETAIL where-to-buy
# widget, so these are expected and are NOT the ICP. Counted separately and
# flagged — never dropped from the raw file.
ETAILER_PAT = re.compile(
    r"\b(amazon|grainger|zoro|global industrial|fastenal|msc industrial|"
    r"mcmaster|walmart|home depot|lowe'?s|northern tool|uline|w\.?w\.? grainger|"
    r"hd supply|supplyhouse|ebay|staples|office depot|motion industries|"
    r"mi conveyance)\b", re.I)


def parse_jsonp(body):
    """`PriceSpider.onload("<key>", {...})` / `jsonp({...})` -> dict."""
    m = re.match(r'^\s*[\w.$]+\(\s*(?:"[^"]*"\s*,\s*)?(.*?)\s*\)\s*;?\s*$',
                 body, re.S)
    if not m:
        raise ValueError(f"not JSONP: {body[:120]!r}")
    return json.loads(m.group(1))


def widget_token(f, client_id, config_id):
    """The public widget identifier, read at run time, never recorded.

    Lives in the anonymous `<clientId>/<configId>/config.js` on the public CDN.
    Fetched through the cache so a re-run costs nothing.
    """
    url = f"{CDN}/{client_id}/{config_id}/config.js"
    body, _ = f.get(url, f"config-{config_id}.js")
    m = re.search(r'"wtb4"\s*:\s*\{[^}]*?"token"\s*:\s*"([^"]+)"', body)
    if not m:
        raise SystemExit(f"no wtb4 token in {url} — PriceSpider changed, stop")
    return m.group(1)


def omni_url(client_id, config_id, lat, lon, postal, token, country="US",
             language="en", include="stores,products"):
    key = f"/{client_id}/{config_id}"
    if include:
        key += "/include/" + urllib.parse.quote(include, safe="")
    params = [
        ("clientId", client_id), ("configId", config_id),
        ("countryCode", country), ("languageCode", language),
        ("lat", lat), ("lon", lon), ("postalCode", postal),
        ("token", token),
    ]
    if include:
        params.append(("include", include))
    params += [("key", key), ("callback", "PriceSpider.onload")]
    return OMNI + "?" + urllib.parse.urlencode(params)


# ── normalisation ───────────────────────────────────────────────────────────

def usps(value):
    v = (value or "").strip().upper()
    return v if v in US_STATES else None


def rows_from_payload(payload, config_id, source_url):
    """Columnar -> row records. `stores` is a LIST OF BLOCKS of parallel arrays."""
    out = []
    for block in payload.get("stores") or []:
        cols = {k: v for k, v in block.items() if isinstance(v, list)}
        if not cols:
            continue
        n = max(len(v) for v in cols.values())

        def col(name, i):
            v = cols.get(name)
            return v[i] if isinstance(v, list) and i < len(v) else None

        for i in range(n):
            url = col("url", i)
            name = col("name", i)
            cc = col("countryCode", i)
            zip_raw = col("postalCode", i)
            rec = {
                "company": (str(name).strip() if name else None) or None,
                "address_1": (str(col("address_1", i) or col("address1", i) or "").strip()
                              or None),
                "address_2": (str(col("address2", i) or "").strip() or None),
                "city": (str(col("city", i) or "").strip() or None),
                "state": usps(col("state", i)),
                "zip_raw": (str(zip_raw).strip() if zip_raw not in (None, "") else None),
                "phone_raw": (str(col("phone1", i) or "").strip() or None),
                "phone_10": digits(col("phone1", i)),
                # No email field exists anywhere in the PriceSpider store schema.
                "email": None,
                "website": (str(url).strip() if url else None) or None,
                "domain": apex(url),
                "lat": col("latitude", i),
                "lng": col("longitude", i),
                # From the payload's own countryCode. Never inferred.
                "is_us": (str(cc).upper() == "US") if cc else None,
                "source": SOURCE,
                "source_url": source_url,
                "captured": CAPTURED,
            }
            # ── §5i every source-native code, VERBATIM AND UNINTERPRETED ────
            rec["config_id_raw"] = config_id
            rec["country_code_raw"] = cc
            rec["ps_store_id_raw"] = col("id", i)
            rec["store_id_raw"] = col("storeId", i)
            rec["seller_id_raw"] = col("sellerId", i)
            rec["seller_name_raw"] = col("sellerName", i)
            rec["account_seller_raw"] = col("accountSeller", i)
            rec["seller_logo_raw"] = col("sellerLogo", i)
            rec["stock_updatable_raw"] = col("stockUpdatable", i)
            rec["config_types_raw"] = col("configTypes", i)
            rec["last_mile_delivery_raw"] = col("lastMileDelivery", i)
            rec["hours_raw"] = col("hours", i)
            rec["misc1_raw"] = col("misc1", i)
            rec["misc2_raw"] = col("misc2", i)
            rec["phone2_raw"] = col("phone2", i)
            rec["url_label_raw"] = col("urlLabel", i)
            rec["distance_raw"] = col("distance", i)
            # OUR classification, clearly named as ours — not source-native.
            rec["x_national_chain_or_etailer"] = bool(
                ETAILER_PAT.search(name or "")
                or ETAILER_PAT.search(str(col("sellerName", i) or "")))
            out.append(rec)
    return out


# ── the two paths ───────────────────────────────────────────────────────────

def from_observation_render():
    """GATE CLOSED path: normalise what the sanctioned browser render captured.

    Zero requests to any origin. The render loaded the public page once, then
    made ONE minimal interaction (typing ZIP 77002), exactly as the brief
    allows; every `omni` response it recorded is replayed from disk here.
    """
    if not os.path.exists(OBSERVE):
        raise SystemExit(f"missing observation render {OBSERVE} — "
                         "run the E4 render first")
    obs = json.load(open(OBSERVE, encoding="utf-8"))
    records, seen, urls = [], set(), []
    for r in obs.get("pricespider_requests") or []:
        if "omni.pricespider.com" not in r.get("url", ""):
            continue
        body = r.get("body_head") or ""
        if not body.startswith("PriceSpider.onload"):
            continue
        q = dict(urllib.parse.parse_qsl(urllib.parse.urlparse(r["url"]).query))
        cfg = q.get("configId")
        # source_url with the public widget token stripped — never recorded.
        safe = re.sub(r"token=[^&]*", "token=<PUBLIC_WIDGET_TOKEN>", r["url"])
        urls.append({"phase": r.get("phase"), "config_id": cfg,
                     "postal": q.get("postalCode"), "url": safe})
        for rec in rows_from_payload(parse_jsonp(body), cfg, safe):
            k = (rec["config_id_raw"], rec["ps_store_id_raw"], rec["store_id_raw"])
            if k in seen:
                continue
            seen.add(k)
            records.append(rec)
    return records, urls, obs


def from_omni(f):
    """GATE OPEN path. Three metros x each configId, then STOP. No national sweep."""
    brand = BRANDS["indsci"]
    client_id, default_cfg = brand["ps_key"].split("-", 1)
    configs = [default_cfg] + list(brand["ps_configs"])
    token = widget_token(f, client_id, default_cfg)

    records, seen, urls = [], set(), []
    for label, postal, lat, lon in METROS:
        for cfg in configs:
            url = omni_url(client_id, cfg, lat, lon, postal, token,
                           brand["country"], brand["language"])
            body, cached = f.get(url, f"omni-{cfg}-{postal}.js",
                                 headers={"Referer": PAGE,
                                          "Origin": "https://www.indsci.com"})
            safe = re.sub(r"token=[^&]*", "token=<PUBLIC_WIDGET_TOKEN>", url)
            urls.append({"metro": label, "config_id": cfg, "url": safe})
            rows = rows_from_payload(parse_jsonp(body), cfg, safe)
            print(f"  {label:>20} cfg={cfg[-6:]} -> {len(rows)} rows "
                  f"({'cached' if cached else 'live'})")
            for rec in rows:
                k = (rec["config_id_raw"], rec["ps_store_id_raw"],
                     rec["store_id_raw"])
                if k in seen:
                    continue
                seen.add(k)
                records.append(rec)
    return records, urls


# ── measurement ─────────────────────────────────────────────────────────────

DEDUPED = os.path.join(os.path.dirname(RAW), "..", "lists", "deduped-v7.csv")


def net_new(records):
    """Net-new against deduped-v7, BY DOMAIN first (the only trustworthy axis)
    and separately by norm_company (which overstates ~3x — measured 2026-08-03).
    """
    import csv
    path = os.path.abspath(DEDUPED)
    if not os.path.exists(path):
        return {"error": f"missing {path}"}
    have_dom, have_name = set(), set()
    with open(path, encoding="utf-8") as fh:
        n_rows = 0
        for row in csv.DictReader(fh):
            n_rows += 1
            d = (row.get("domain") or "").strip().lower()
            if d:
                have_dom.add(d)
            nm = norm_company(row.get("company") or row.get("company_display"))
            if nm:
                have_name.add(nm)

    us = [r for r in records if r.get("is_us")]
    src_dom = {r["domain"].lower() for r in us if r.get("domain")}
    src_name = {norm_company(r.get("company")) for r in us}
    src_name.discard("")
    return {
        "baseline_rows": n_rows,
        "baseline_domains": len(have_dom),
        "baseline_norm_names": len(have_name),
        "source_distinct_domains": len(src_dom),
        "source_distinct_norm_names": len(src_name),
        "net_new_by_domain": len(src_dom - have_dom),
        "net_new_by_domain_list": sorted(src_dom - have_dom),
        "net_new_by_norm_company": len(src_name - have_name),
        "overlap_by_domain": len(src_dom & have_dom),
        "overlap_by_norm_company": len(src_name & have_name),
    }


def slice_stats(records, key_fn, labels):
    """Fill rates cut by an arbitrary key. Website fill first — it decides usability."""
    us = [r for r in records if r.get("is_us")]
    out = {}
    for k in sorted({key_fn(r) for r in us}):
        s = [r for r in us if key_fn(r) == k]
        web = sum(1 for r in s if r.get("website"))
        names = {norm_company(r.get("company")) for r in s}
        names.discard("")
        out[str(k)] = {
            "label": labels.get(str(k), ""),
            "rows": len(s),
            "distinct_companies": len(names),
            "distinct_domains": len({r["domain"] for r in s if r.get("domain")}),
            "pct_website": round(web / (len(s) or 1) * 100, 1),
            "pct_phone": round(sum(1 for r in s if r.get("phone_raw"))
                               / (len(s) or 1) * 100, 1),
            "pct_email": 0.0,
            "pct_chain_or_etailer": round(
                sum(1 for r in s if r["x_national_chain_or_etailer"])
                / (len(s) or 1) * 100, 1),
        }
    return out


def code_distributions(records, fields):
    """Does each code ACTUALLY sort? Distribution + a plain verdict per field."""
    us = [r for r in records if r.get("is_us")] or records
    out = {}
    for fld in fields:
        dist = {}
        for r in us:
            v = r.get(fld)
            v = "(null)" if v in (None, "") else str(v)
            dist[v] = dist.get(v, 0) + 1
        nonnull = sum(c for k, c in dist.items() if k != "(null)")
        distinct = len([k for k in dist if k != "(null)"])
        if nonnull == 0:
            verdict = "DOES NOT SORT — null on 100% of rows (schema only)"
        elif distinct == 1 and nonnull == len(us):
            verdict = "DOES NOT SORT — constant on every row (the SKF DC001 trap)"
        elif distinct == 1:
            verdict = f"DOES NOT SORT — one value, present on {nonnull}/{len(us)}"
        else:
            verdict = f"SORTS — {distinct} distinct values over {nonnull}/{len(us)} rows"
        out[fld] = {"verdict": verdict,
                    "top": sorted(dist.items(), key=lambda kv: -kv[1])[:12]}
    return out


CODE_FIELDS = ("config_id_raw", "account_seller_raw", "seller_name_raw",
               "seller_logo_raw", "stock_updatable_raw", "config_types_raw",
               "last_mile_delivery_raw", "hours_raw", "misc1_raw", "misc2_raw",
               "url_label_raw", "phone2_raw", "country_code_raw")


def main():
    f = Fetcher(SOURCE, min_bytes=20)
    mode = "omni-live" if GATE_SIGNED else "observation-render (GATE CLOSED)"
    print(f"mode: {mode}")

    obs = None
    if GATE_SIGNED:
        try:
            records, urls = from_omni(f)
        except Blocked as e:
            print(f"BLOCKED: {e}")
            write_raw(SOURCE, {"source_url": OMNI, "blocked": str(e)}, [])
            return
    else:
        records, urls, obs = from_observation_render()

    stats = report(SOURCE, records, code_fields=("config_id_raw",
                                                 "account_seller_raw",
                                                 "seller_name_raw"))
    codes = code_distributions(records, CODE_FIELDS)
    print("\n── does each code actually sort? ──────────────────────────")
    for fld, info in codes.items():
        print(f"  {fld:24s} {info['verdict']}")

    us = [r for r in records if r.get("is_us")]
    et = [r for r in us if r["x_national_chain_or_etailer"]]
    et_names = sorted({r["company"] for r in et})
    print(f"\nnational-chain / e-tailer rows: {len(et)}/{len(us)} "
          f"({len(et) / (len(us) or 1) * 100:.1f}%)  — kept in the raw file")

    by_config = slice_stats(records, lambda r: r["config_id_raw"], {
        "65f845cc7cea636071b9cd6f": "ps-config mount — IndSci's OWN managed dealers",
        "65f83edb7cea636071b9cd6a": "ps-key mount — superset incl. PriceSpider network",
    })
    by_seller = slice_stats(records, lambda r: r["account_seller_raw"], {
        "1": "accountSeller=1 — brand-managed dealer (the ICP)",
        "0": "accountSeller=0 — PriceSpider-network seller (chain/e-tailer)",
    })
    print("\n── website fill, cut by the code that sorts ───────────────")
    for k, v in by_seller.items():
        print(f"  accountSeller={k} ({v['label']}): {v['rows']} rows, "
              f"website {v['pct_website']}%, chains {v['pct_chain_or_etailer']}%")
    for k, v in by_config.items():
        print(f"  config {k[-6:]} ({v['label']}): {v['rows']} rows, "
              f"website {v['pct_website']}%")

    nn = net_new(records)
    print("\n── net-new vs deduped-v7 ──────────────────────────────────")
    for k in ("baseline_rows", "source_distinct_domains", "net_new_by_domain",
              "source_distinct_norm_names", "net_new_by_norm_company"):
        print(f"  {k:30s} {nn.get(k)}")

    payload = {
        "source_name": "Industrial Scientific where-to-buy (PriceSpider / Wayvia)",
        "source_url": OMNI,
        "locator_page": PAGE,
        "platform": "PriceSpider (rebranded Wayvia) third-party where-to-buy widget",
        "mode": mode,
        "method": (
            "ps-key meta = '<clientId>-<defaultConfigId>'; each .ps-widget mount "
            "may override configId via a ps-config attribute. Chain: "
            "cdn/1/<clientId>/config.js -> cdn/1/lib/<ver>/ps-widget.js -> "
            "cdn/1/<clientId>/<configId>/config.js (carries the public wtb4 "
            "token) -> omni.pricespider.com/?clientId&configId&countryCode&"
            "languageCode&lat&lon&postalCode&token&include=stores,products&key&"
            "callback (JSONP). Payload `stores` is COLUMNAR: a list of blocks, "
            "each block one object of parallel arrays; row i = index i of every "
            "column."),
        "request_template": (
            "https://omni.pricespider.com/?clientId={clientId}&configId={configId}"
            "&countryCode={cc}&languageCode={lang}&lat={lat}&lon={lon}"
            "&postalCode={zip}&token=<PUBLIC_WIDGET_TOKEN>&include=stores,products"
            "&key=/{clientId}/{configId}/include/stores%2Cproducts"
            "&callback=PriceSpider.onload"),
        "adding_another_brand": (
            "One row in BRANDS: read the brand's where-to-buy HTML, copy the "
            "ps-key meta and any ps-config attributes off the .ps-widget mounts. "
            "Everything else — token discovery, request shape, columnar "
            "decoding — is brand-independent."),
        "robots_check": {
            "omni.pricespider.com (DATA HOST)": "HTTP 403 on /robots.txt — GATE. "
                "RFC 9309 §2.3.1.3 puts 403 in the 'Unavailable' band (= "
                "unrestricted, nothing Disallowed, longest-match on '/' is "
                "vacuously allowed), but _polite.py's house rule treats a hard "
                "403 as a stop and it already fired. Unsigned conflict -> "
                "DEFAULT NO. Zero scripted requests were made to this host.",
            "locate.pricespider.com": "HTTP 200 but the body is {\"status\":\"OK\"} "
                "— the API answers every path; it publishes no robots file. "
                "Avoided anyway: ZIP centroids are hardcoded.",
            "cdn.pricespider.com": "HTTP 404 — no robots file, no stated "
                "preference (re-confirms the 2026-08-03 linecard probe).",
            "www.indsci.com": "Allow by omission — /en/where-to-buy matches no "
                "Disallow line (the file blocks /sample-*, HubSpot preview "
                "paths and two localised pages).",
        },
        "credential_note": (
            "`token` ships in an anonymous config.js on a public CDN — no login, "
            "no session, no per-user issuance, byte-identical across both "
            "configs. Public widget identifier, not a credential (Festo / "
            "Banjo / Banner shape; the Bimba rule is not triggered). Read at "
            "run time, never written to disk or into any report."),
        "two_datasets": (
            "configId 65f83edb…9cd6a (ps-key default, 'FIND ONLINE / FIND "
            "NEARBY' mount) returns a superset including PriceSpider-network "
            "sellers (accountSeller=0, sellerLogo=true) that carry corporate "
            "URLs. configId 65f845cc…9cd6f (ps-config mount, 'FIND NEARBY') "
            "returns only Industrial Scientific's managed dealers "
            "(accountSeller=1) and url is null on 100% of them. Kept apart by "
            "config_id_raw; never merged blindly."),
        "row_cap_observed": (
            "Every omni response observed returned at most 20 store rows "
            "(Orlando returned 14 for the account config = fewer inside the "
            "radius). No paging parameter appears anywhere in the request. "
            "Treat 20 as a hard per-query cap: national coverage would need a "
            "ZIP grid, which is NOT authorised and was NOT run."),
        "no_email_field": ("The PriceSpider store schema has no email column at "
                           "all — email is structurally 0%, not merely unfilled."),
        "codes_captured_verbatim": list(CODE_FIELDS) + [
            "ps_store_id_raw", "store_id_raw", "seller_id_raw", "distance_raw"],
        "code_sorting_verdicts": codes,
        "etailer_share": {
            "us_rows": len(us),
            "national_chain_or_etailer_rows": len(et),
            "pct": round(len(et) / (len(us) or 1) * 100, 1),
            "names": et_names,
            "note": ("OUR classification (x_national_chain_or_etailer), not a "
                     "source-native code. Rows are flagged, never suppressed."),
        },
        # ── the finding that decides this source ────────────────────────────
        "website_fill_is_anticorrelated_with_icp": {
            "by_config_id": by_config,
            "by_account_seller": by_seller,
            "finding": (
                "accountSeller sorts PERFECTLY and sorts the wrong way: every "
                "accountSeller=1 row (Industrial Scientific's own managed "
                "dealer — the ICP) has a NULL url, and every accountSeller=0 "
                "row (PriceSpider-network seller) has a url 100% of the time. "
                "So 100% of the rows carrying a website are national chains, "
                "and 100% of the ICP rows carry none. This is structural — the "
                "account feed's url column is empty, not sparsely filled — so a "
                "wider sweep raises the row count without raising usable "
                "domain coverage. Same shape as Walter (12,364 rows / 0% "
                "websites) and SKF's main feed."),
        },
        "net_new": nn,
        "net_new_caveat": (
            "All 5 net-new domains are national chains (airgas.com, "
            "fastenal.com, grainger.com, motion.com, motionindustries.com), and "
            "none of the 11 probed chain domains (those plus mscdirect, zoro, "
            "amazon, globalindustrial, uline, mcmaster) appears anywhere in "
            "deduped-v7 — consistent with the pipeline excluding big-box/"
            "e-tailers on purpose. Usable net-new ICP domains: 0. The "
            "by-name figure (22 of 23) is inflated exactly as the ~3x warning "
            "predicts: 'Vallen' counts as net-new by name while vallen.com is "
            "already in the baseline under a different company string."),
        "requests": urls,
        "origin_requests": f.origin_requests,
        "origin_requests_cold": len(os.listdir(f.cache)),
        "stats": stats,
    }
    if obs is not None:
        payload["observation_render"] = {
            "file": os.path.basename(OBSERVE),
            "page_status": obs.get("page_status"),
            "total_browser_requests": obs.get("total_requests"),
            "phases": "one load with zero interaction, then ONE typed ZIP (77002)",
            "metros_covered": "Orlando FL 32896 (datacenter IP default) + "
                              "Houston TX 77002 (the one typed ZIP)",
            "not_covered": "Chicago 60601 and Cleveland 44113 — the three-metro "
                           "probe needs scripted omni calls, which the gate blocks",
        }
    write_raw(SOURCE, payload, records)


if __name__ == "__main__":
    main()
