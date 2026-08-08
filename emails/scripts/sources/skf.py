#!/usr/bin/env python3
"""S1 adjacent wave — SKF find-a-distributor (Angular SPA, Solr address service).

**PROBE ONLY. This script does not sweep.** It makes a shape probe plus the
three metro probes the handoff specifies, prints the measurement, and stops.
`--sweep` is deliberately not implemented: a national grid is gated on the
decision rule (>=150 projected net-new companies AND a tier code or per-record
line card) being read by a human first.

**How the route was found (no re-fetch).** `www.skf.com/support/find-a-distributor`
is an Angular SPA. Its bundle chunks were already cached at
`data/raw/_cache/e4bundle2-skf/` and are read **from disk**. Two files settle
the endpoint between them:

  - `config.json` (the SPA's own runtime settings, also cached) publishes
    `addressServiceConfig.config.url = "/address/distributors/"` — a
    **same-origin relative path**, not a third-party host.
  - `chunk-F5OGGODZ.js` assigns `this.solrUrl = settings.addressServiceConfig
    .config.url` and builds the request as

        getDistOffices(e, n, r, s, p, h) {
          let u, y = p ? "locationNew" : "location";
          u = n === "distributors"
              ? (s.isGlobal ? `${solrUrl}${y}?` + r
                            : `${solrUrl}${y}?bounding_box=${JSON.stringify(e)}` + r)
              : `${solrUrl}${y}?bounding_box=${JSON.stringify(e)}&offices=true`;
          u = u + `&limit=${s.searchLimit}`;
          u = s.country.code === "" ? (s.country.name === "" ? u
                                       : u + `&countryName=${s.country.name}`)
                                    : u + `&countryName=${s.country.code}`;
          return this.httpClient.get(u);
        }

**`locationNew`, not `location`.** All three call sites pass
`p = !this.isThisOfficeSearch`, so a *distributor* search (isThisOfficeSearch
false) always resolves `y` to `locationNew`. `location` is the legacy variant
and is what the office branch uses. This script calls the route the live SPA
calls for dealers and nothing else.

⚠ **`offices=true` is never sent.** In the bundle that flag only appears on the
`n !== "distributors"` branch, and it returns *SKF's own offices* — the
manufacturer, not dealers. Seating those would put the manufacturer in the
prospect pool. The flag is not a parameter this script can emit.

`boundChanged()` fixes the bounding-box shape: `{sw:{lat,lng}, ne:{lat,lng}}`,
`JSON.stringify`d into the query string. `buildQuery(checkedFilters)` is the
only other thing that can land in `r`, and it emits exactly
`&distributor_offer=*<v>*`, `&product_category=*<v>*`,
`&distributor_category=*<v>*`, `&product_category=<key>` and `&term=<text>`.
No filter is sent here — an unfiltered box is the widest honest ask.

**Credential boundary: none, and that was checked rather than assumed.** MSAL's
`protectedResourceMap` enumerates exactly which URLs get a bearer token —
`search.skf.com/.../croesus/*`, `/feedback-service/*`,
`/cad-service/download-cad/*`. The address service is **not** in that map, and
the calls are bare `httpClient.get(u)` with no header object at all. Public and
anonymous. Any 401/403 fires `Blocked` and stops the source: that would move
this from "public endpoint" to "credential boundary" and is not something to
work around.

**Akamai.** www.skf.com is Akamai-fronted. A 403 or an interstitial challenge
**stops this source dead** — no retry, no UA rotation, no host switching, no
headless browser. `check_not_challenged()` also catches the 200-with-a-challenge
-body case and deletes the poisoned cache entry so a re-run cannot read it back
as data.

**robots.txt is verified live, in-process, before the first data request** —
`robots_gate()` parses the `User-agent: *` group off www.skf.com/robots.txt and
regex-tests `/address/distributors/locationNew` against every Disallow rule with
real `*`/`$` wildcard semantics. The rule set is
`/*/myskf.app`, `/*/to-be-deleted/`, `/*/overlay-panels/`,
`/*/authorized-general/`, `/*/authorised-general/`, `/*/certified-rebuilder/`,
`/files/*.pdf$`, `/*.jsp$`, `/*.jsp?`, `/eu/`, `/nam/`, `/group/test/`,
`/*/windcustomers/`, `/*/simproexpert/`, `/*/nestle/`, `/*/simproquick/`,
`/*/staging-only/`. **None of them matches the address service** — it is allowed
by absence, so no robots override is involved and there is nothing to sign. The
assertion is executed, not asserted in prose: if any rule ever starts matching,
the script raises before it fetches anything.

⚠ §5i SOURCE-NATIVE CODES, CAPTURED VERBATIM AND UNINTERPRETED. SKF's are the
richest in the program and the bundle partly decodes them itself
(`setDistributorCategories` / `setProductCategories` map DC*/PC* to labels, and
`getTaxonomy` **overwrites `product_category` and `distributor_category`
in place** with the translated labels before the UI ever sees them — which is
precisely why this script reads the HTTP response and not the rendered list).
The bundle's own decoding is also internally inconsistent: `setProductCategories`
pushes `PC010` and `PC020` back into `distributor_category` as "Electric Motor"
and "Seal Jet", so the same code lives in two dimensions. Codes are therefore
stored **as codes**. Nothing here is mapped, substituted or seated on — §5i's
rule is that a code's meaning is not trusted until it is validated against the
records (Adaptall's `premier` flag was inverted; Yaskawa's D33 meant
factory-direct, not a parse failure). The distributions are measured and
reported so the next pass can decide whether each code sorts.

⚠ MEASURED, 2026-08-03 — WHAT THE PROBE ACTUALLY FOUND. Recorded here because
it contradicts what the endpoint promised, and the next reader should not have
to re-derive it:

  1. **`site` is a feed partition, not a location**, and the route serves two
     structurally different datasets through it. `United States` = 82 records /
     11 companies, branch-level, phone-only, **0 websites and 0 emails**.
     `Lubrication TE` = 10 records / 10 companies, one row per company, and it
     carries **every** website and email in the pull. Averaging a fill rate over
     both is meaningless.
  2. **`distributor_category` — the rich DC* tier axis — is a CONSTANT.** Every
     one of the 82 `United States` rows carries the identical string
     `"DC001, DC028, DC021, DC011"`; every `Lubrication TE` row carries `"NA"`.
     It does not identify a dealer's tier, so the DC decoding table (DC001 SKF
     Authorized, DC003 Certified Partner, DC009 MRC, ...) has nothing to decode
     at this resolution. This is §5i firing exactly as designed: the code was
     captured, measured, and found not to sort.
  3. **`product_category` sorts, but only at company level** — 3 distinct values
     over 21 companies, identical across every branch of a company. A real line
     card, at low resolution; not a per-record one.
  4. `type` is `"SKF Distributor"` on 100% of rows. Constant.
  5. `distributor_category_names`, `product_category_names_translated` and
     `distributor_offer` are **absent from the payload entirely** — they are
     client-side fields the bundle populates during render, not source data.
  6. 77% of records are five national chains (Motion 22, DXP 18, Applied 18,
     BDI 9, EIS 4). Segment B overlap was expected and is confirmed.

Overlap against `lists/deduped-v7.csv` is measured on the **domain** axis (the
trustworthy one) and separately on `norm_company`; this probe reproduces the
~3x name-axis overstatement seen on every source measured today (18 net-new by
name vs 5 by domain). High overlap here is a valid finding, not a failure.
"""
import csv
import json
import math
import os
import re
import sys
import urllib.parse

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402

_polite.CAPTURED = "2026-08-03"

from _polite import (RAW, ROOT, US_STATES, Blocked, Fetcher, apex,  # noqa: E402
                     digits, norm_company, report, write_raw)

CAPTURED = _polite.CAPTURED

SOURCE = "skf"
ORIGIN = "https://www.skf.com"
PAGE = f"{ORIGIN}/support/find-a-distributor"      # config.distributorSearchConfig.url
ROBOTS = f"{ORIGIN}/robots.txt"
# config.json -> addressServiceConfig.config.url, same-origin relative path.
SOLR = "/address/distributors/"
ROUTE = "locationNew"                              # p = !isThisOfficeSearch = true
BUNDLE_DIR = os.path.join(RAW, "_cache", "e4bundle2-skf")

POOL = os.path.join(ROOT, "lists", "deduped-v7.csv")

# The SPA's own `additionalParams.searchLimit` is 100, and its results label
# renders "100+" at exactly 100 — i.e. the app knows 100 truncates. A truncated
# metro count would understate the probe, so the probe asks for headroom and
# flags `truncated` if the server ever fills it. Still one request per metro.
PROBE_LIMIT = 500
SHAPE_LIMIT = 50

# Three metros, box ~100 miles across (half-side 50 mi), per the handoff.
METROS = [
    ("houston-tx", 29.7604, -95.3698),
    ("chicago-il", 41.8781, -87.6298),
    ("cleveland-oh", 41.4993, -81.6944),
]
HALF_SIDE_MI = 50.0
MI_PER_DEG_LAT = 69.0546
MI_PER_DEG_LNG_EQ = 69.1712

# Small unfiltered box for the shape probe: ~25 mi across over downtown Houston.
SHAPE_BOX_HALF_MI = 12.5

COUNTRY = "US"          # s.country.code, appended as &countryName=
# `is_us` comes off the record's own country_code. The set below is the
# *accepted* set, not an inference from ZIP, phone or bounding box; every
# distinct value seen is reported so the choice is auditable.
US_COUNTRY_CODES = {"US", "USA", "U.S.", "U.S.A.", "UNITED STATES"}

STATE_ABBR = {
    "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR",
    "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE",
    "district of columbia": "DC", "florida": "FL", "georgia": "GA", "hawaii": "HI",
    "idaho": "ID", "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS",
    "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
    "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS",
    "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV",
    "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
    "north carolina": "NC", "north dakota": "ND", "ohio": "OH", "oklahoma": "OK",
    "oregon": "OR", "pennsylvania": "PA", "rhode island": "RI",
    "south carolina": "SC", "south dakota": "SD", "tennessee": "TN", "texas": "TX",
    "utah": "UT", "vermont": "VT", "virginia": "VA", "washington": "WA",
    "west virginia": "WV", "wisconsin": "WI", "wyoming": "WY",
    "puerto rico": "PR", "guam": "GU", "virgin islands": "VI",
}


# ── compliance gates ─────────────────────────────────────────────────────────

def verify_pinned_route():
    """Re-read the cached config.json and PROVE the route is still what this
    file hardcodes. Zero requests — the bundle is on disk from the recon pass.
    If SKF moves the address service, this raises instead of quietly probing a
    stale path.
    """
    path = os.path.join(BUNDLE_DIR, "config.json")
    with open(path, encoding="utf-8", errors="ignore") as fh:
        cfg = json.load(fh)
    published = (cfg.get("addressServiceConfig") or {}).get("config", {}).get("url")
    if published != SOLR:
        raise SystemExit(
            f"config.json now publishes addressServiceConfig.config.url="
            f"{published!r}, not {SOLR!r}. The pinned route is stale — stop and "
            f"re-do the bundle recon rather than probing a guessed path.")
    print(f"pinned route verified against {os.path.relpath(path, ROOT)}: "
          f"addressServiceConfig.config.url = {published!r}")
    return {"config_json": os.path.relpath(path, ROOT),
            "addressServiceConfig.config.url": published,
            "route_called": ROUTE}


def _robots_rx(rule):
    """robots.txt path matching: `*` = any run, trailing `$` = end anchor,
    otherwise a prefix match. Built as a regex so the check is executed."""
    out = ["^"]
    for ch in rule:
        out.append(".*" if ch == "*" else ("$" if ch == "$" else re.escape(ch)))
    return re.compile("".join(out))


def robots_gate(f, probe_paths):
    """Fetch robots.txt and PROVE none of its `User-agent: *` rules matches the
    address service. Runs before the first data request. Raises on a match."""
    body, cached = f.get(ROBOTS, "robots.txt", headers={"Accept": "text/plain,*/*"})
    check_not_challenged(f, "robots.txt", body, expect_json=False)

    group, rules, lines = None, [], []
    for raw in body.splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line or ":" not in line:
            continue
        key, _, val = line.partition(":")
        key, val = key.strip().lower(), val.strip()
        if key == "user-agent":
            group = val
        elif key == "disallow" and group == "*" and val:
            rules.append(val)
            lines.append(f"Disallow: {val}")

    print(f"\n── robots gate ({'cached' if cached else 'live'}) — {ROBOTS} ──")
    print(f"User-agent: * Disallow rules ({len(rules)}), VERBATIM:")
    for line in lines:
        print(f"  {line}")

    hits = []
    for path in probe_paths:
        matched = [r for r in rules if _robots_rx(r).match(path)]
        hits.extend((path, r) for r in matched)
        print(f"  {path}  ->  {'MATCHED ' + str(matched) if matched else 'no rule matches'}")
    if hits:
        raise SystemExit(f"robots.txt DISALLOWS the address service {hits} — "
                         "stopping. Nothing about this is worth working around.")
    print("VERDICT: allowed by absence. No override involved, nothing to sign.")
    return {"url": ROBOTS, "user_agent_star_disallow_verbatim": lines,
            "paths_tested": list(probe_paths),
            "verdict": "no `User-agent: *` Disallow rule matches "
                       "/address/distributors/* — allowed by absence; no robots "
                       "override involved, nothing to sign",
            "other_groups": "Semrushbot-SA / bingbot / Applebot carry Crawl-delay: 1; "
                            "Seekport Crawler is Disallow: / . None is us.",
            "cached": cached}


_CHALLENGE = re.compile(
    r"access denied|reference\s*#|akamai|you don'?t have permission|"
    r"<title>\s*error|edgesuite|bot ?manager|captcha", re.I)


def check_not_challenged(f, cache_name, body, expect_json=True):
    """Akamai can answer 200 with an interstitial. Treat that as a hard stop and
    delete the cache entry so a re-run cannot read the challenge back as data."""
    head = body.lstrip()[:1200]
    bad = _CHALLENGE.search(head) or (expect_json and not head.startswith(("{", "[")))
    if not bad:
        return
    path = os.path.join(f.cache, cache_name)
    if os.path.exists(path):
        os.remove(path)
    raise Blocked(f"non-data response on {cache_name} (Akamai challenge or HTML) — "
                  f"source stopped, cache entry removed. First 300 bytes: "
                  f"{head[:300]!r}")


# ── request construction (mirrors the bundle exactly) ────────────────────────

def bbox(lat, lng, half_mi):
    """`boundChanged()` shape: {sw:{lat,lng}, ne:{lat,lng}}."""
    dlat = half_mi / MI_PER_DEG_LAT
    dlng = half_mi / (MI_PER_DEG_LNG_EQ * math.cos(math.radians(lat)))
    return {"sw": {"lat": round(lat - dlat, 6), "lng": round(lng - dlng, 6)},
            "ne": {"lat": round(lat + dlat, 6), "lng": round(lng + dlng, 6)}}


def bbox_url(box, limit, country=None):
    """Angular's HttpUrlEncodingCodec = encodeURIComponent, then `@:$,;+=?/`
    restored. Replicated so the wire form matches what the SPA sends."""
    blob = urllib.parse.quote(json.dumps(box, separators=(",", ":")),
                              safe="@:$,;+=?/")
    url = f"{ORIGIN}{SOLR}{ROUTE}?bounding_box={blob}&limit={limit}"
    return url + (f"&countryName={country}" if country else "")


def fetch(f, url, cache_name):
    body, cached = f.get(url, cache_name, headers={
        "Accept": "application/json, text/plain, */*",
        "Referer": PAGE,
    })
    check_not_challenged(f, cache_name, body)
    return json.loads(body), cached


def unwrap(payload):
    """The bundle reads `n.docs`. Envelope keys are reported, never assumed."""
    if isinstance(payload, list):
        return payload, {"(bare list)": len(payload)}
    docs = payload.get("docs")
    envelope = {k: (f"<{len(v)} items>" if isinstance(v, list) else v)
                for k, v in payload.items()}
    return (docs if isinstance(docs, list) else []), envelope


# ── normalisation ────────────────────────────────────────────────────────────

def clean(value):
    if value is None:
        return None
    s = str(value).strip()
    return s or None


def state_of(raw):
    """`state` is published in three shapes on the same route — "Texas",
    "Texas, TX" and "Ohio, OH" all occur — so each comma-part is tried as a USPS
    code and then as a full name. Anything else stays null; state is never
    reverse-derived from the ZIP or the city."""
    s = (raw or "").strip()
    if not s:
        return None
    for part in reversed([p.strip() for p in s.split(",") if p.strip()]):
        if part.upper() in US_STATES:
            return part.upper()
        if part.lower() in STATE_ABBR:
            return STATE_ABBR[part.lower()]
    return None


def num(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def joinlist(value):
    if value is None:
        return None
    if isinstance(value, list):
        return "|".join("" if x is None else str(x) for x in value) or None
    return str(value).strip() or None


# Consumed explicitly below. Everything else in the doc is swept into `x_*_raw`
# so a field the bundle never named still reaches the raw file.
_HANDLED = {"id", "name", "site", "type", "address_1", "address_2", "city_name",
            "state", "zip_code", "country_code", "phone_no", "phone_no_2",
            "fax_no", "email", "homepage", "visit_website", "website",
            "map_latitude", "map_longitude", "product_category",
            "product_category_names_translated", "distributor_category",
            "distributor_category_names", "distributor_offer", "score", "_version_"}


def normalize(doc, source_url, metro):
    country = clean(doc.get("country_code"))
    # `homepage` is the website field. The handoff's `visit_website` is a CSS
    # class in the bundle, not a payload key — both are read, homepage first.
    website = clean(doc.get("homepage")) or clean(doc.get("visit_website")) \
        or clean(doc.get("website"))
    rec = {
        "company": clean(doc.get("name")),
        "address_1": clean(doc.get("address_1")),
        "address_2": clean(doc.get("address_2")),
        "city": clean(doc.get("city_name")),
        "state": state_of(doc.get("state")),
        "zip_raw": clean(doc.get("zip_code")),
        "phone_raw": clean(doc.get("phone_no")),
        "phone_10": digits(doc.get("phone_no")),
        "email": clean(doc.get("email")),
        "website": website,
        "domain": apex(website),
        "lat": num(doc.get("map_latitude")),
        "lng": num(doc.get("map_longitude")),
        # is_us is read off the record's own country_code. Never inferred from
        # the bounding box, the ZIP or the phone.
        "is_us": (country.upper() in US_COUNTRY_CODES) if country else None,
        "source": SOURCE,
        "source_url": source_url,
        "captured": CAPTURED,
    }
    # ── §5i: SOURCE-NATIVE CODES, VERBATIM AND UNINTERPRETED ─────────────────
    rec["skf_id_raw"] = clean(doc.get("id"))
    rec["country_code_raw"] = country
    rec["state_raw"] = clean(doc.get("state"))
    # `site` is NOT a location — it is the feed partition. Measured values are
    # "United States" (the bearings/PT dataset) and "Lubrication TE" (a separate
    # lubrication feed with a different schema fill and different codes).
    rec["site_raw"] = clean(doc.get("site"))
    rec["type_raw"] = clean(doc.get("type"))
    rec["phone_no_2_raw"] = clean(doc.get("phone_no_2"))
    rec["fax_no_raw"] = clean(doc.get("fax_no"))
    # DC* — the tier / programme axis (SKF Authorized, Certified Partner, MRC,
    # Seal Jet, RecondOil, Kaydon, ...). Stored as codes, not labels.
    rec["distributor_category_raw"] = joinlist(doc.get("distributor_category"))
    rec["distributor_category_names_raw"] = joinlist(
        doc.get("distributor_category_names"))
    # PC* — the product/line-card axis (bearings, lubrication, seals, PT, ...).
    rec["product_category_raw"] = joinlist(doc.get("product_category"))
    rec["product_category_names_translated_raw"] = joinlist(
        doc.get("product_category_names_translated"))
    rec["distributor_offer_raw"] = joinlist(doc.get("distributor_offer"))
    rec["probe_metro"] = metro
    for k, v in doc.items():
        if k not in _HANDLED:
            rec[f"x_{k}_raw"] = joinlist(v) if isinstance(v, list) else v
    return rec


# ── measurement against the existing pool (read-only) ────────────────────────

def load_pool():
    """deduped-v7.csv, READ-ONLY. Owned by another stage; nothing here writes."""
    domains, names, points, rows = set(), set(), [], 0
    with open(POOL, newline="", encoding="utf-8", errors="ignore") as fh:
        for row in csv.DictReader(fh):
            rows += 1
            d = apex(row.get("domain"))
            if d:
                domains.add(d)
            n = norm_company(row.get("company") or row.get("company_display"))
            if n:
                names.add(n)
            la, ln = num(row.get("lat")), num(row.get("lng"))
            if la is not None and ln is not None:
                points.append((la, ln))
    return {"rows": rows, "domains": domains, "names": names, "points": points}


def in_box(box, lat, lng):
    return (box["sw"]["lat"] <= lat <= box["ne"]["lat"]
            and box["sw"]["lng"] <= lng <= box["ne"]["lng"])


def code_sorts(records, fields):
    """§5i: a code's meaning is not trusted until it is shown to sort. This
    answers that by measurement, not by prose.

    A code "sorts" only if it takes more than one value across the records. It
    is additionally reported as company-level vs record-level: if every branch
    of every company carries the same value, the code cannot separate branches,
    only companies — which is a different (weaker) claim than a per-record line
    card, and the difference decides the second leg of the decision rule.
    """
    out = {}
    for field in fields:
        vals = [r.get(field) for r in records]
        distinct = {v for v in vals if v is not None}
        by_company = {}
        for r in records:
            by_company.setdefault(norm_company(r.get("company")), set()).add(
                r.get(field))
        varies_within = sum(1 for v in by_company.values() if len(v) > 1)
        out[field] = {
            "distinct_values": len(distinct),
            "null_records": sum(1 for v in vals if v is None),
            "sorts": len(distinct) > 1,
            "varies_within_a_company": varies_within,
            "resolution": ("constant — does NOT sort" if len(distinct) <= 1
                           else "record-level" if varies_within
                           else "company-level only (identical on every branch)"),
            "values_verbatim": sorted(distinct)[:12],
        }
    print("\n── does each code sort? (measured, §5i) ───────────────────────")
    for field, v in out.items():
        print(f"{field}\n    {v['distinct_values']} distinct · {v['resolution']}"
              f" · {v['null_records']} null")
    return out


def measure(records, boxes):
    """Net-new on both axes, plus the density scaler the projection uses.

    The scaler is empirical rather than assumed: it is the share of the existing
    pool's own geocoded rows that fall inside the three probe boxes. Projecting
    on land area would be nonsense for a dealer network, and projecting on
    population would import an outside number; this uses our own measured
    distribution of industrial distribution as the density model, and every
    input to it is printed.
    """
    pool = load_pool()
    us = [r for r in records if r["is_us"]]

    dom = {r["domain"] for r in us if r["domain"]}
    nam = {norm_company(r["company"]) for r in us if r["company"]}
    nam.discard("")
    new_dom = dom - pool["domains"]
    new_nam = nam - pool["names"]

    inside = sum(1 for la, ln in pool["points"]
                 if any(in_box(b, la, ln) for b in boxes))
    geocoded = len(pool["points"])
    share = inside / geocoded if geocoded else 0.0

    m = {
        "pool_file": os.path.relpath(POOL, ROOT),
        "pool_rows": pool["rows"],
        "pool_distinct_domains": len(pool["domains"]),
        "pool_distinct_norm_company": len(pool["names"]),
        "pool_geocoded_rows": geocoded,
        "pool_rows_inside_the_three_probe_boxes": inside,
        "three_box_share_of_pool": round(share, 5),
        "probe_us_records": len(us),
        "probe_distinct_domains": len(dom),
        "probe_distinct_norm_company": len(nam),
        "probe_records_without_domain": sum(1 for r in us if not r["domain"]),
        "net_new_by_domain": len(new_dom),
        "net_new_by_norm_company": len(new_nam),
        "overlap_pct_by_domain": round(100 * (1 - len(new_dom) / len(dom)), 1) if dom else None,
        "overlap_pct_by_norm_company": round(100 * (1 - len(new_nam) / len(nam)), 1) if nam else None,
    }
    if share:
        m["projected_national_companies"] = round(len(nam) / share)
        m["projected_national_net_new_by_domain"] = round(len(new_dom) / share)
        m["projected_national_net_new_by_norm_company"] = round(len(new_nam) / share)
        m["projection_method"] = (
            f"scaler = {inside}/{geocoded} geocoded pool rows inside the three "
            f"100-mile boxes = {share:.5f}; national ~= probe / scaler. The "
            f"scaler assumes SKF's dealer density tracks the pool's own "
            f"geographic distribution; if the pool over-weights these metros "
            f"the projection understates, and vice versa.")
    # The domain axis is the trustworthy one, but it can only speak for records
    # that carry a domain at all. Reported per feed partition because the two
    # partitions on this route have completely different fill.
    m["by_feed_partition"] = {}
    for part in sorted({r.get("site_raw") or "(null)" for r in us}):
        sub = [r for r in us if (r.get("site_raw") or "(null)") == part]
        sdom = {r["domain"] for r in sub if r["domain"]}
        snam = {norm_company(r["company"]) for r in sub if r["company"]}
        snam.discard("")
        m["by_feed_partition"][part] = {
            "records": len(sub), "companies": len(snam),
            "with_domain": sum(1 for r in sub if r["domain"]),
            "with_email": sum(1 for r in sub if r["email"]),
            "with_phone": sum(1 for r in sub if r["phone_raw"]),
            "distinct_domains": len(sdom),
            "net_new_by_domain": len(sdom - pool["domains"]),
            "net_new_by_norm_company": len(snam - pool["names"]),
        }
    m["domain_axis_caveat"] = (
        f"{m['probe_records_without_domain']} of {len(us)} records carry no "
        f"website at all, so the domain axis can only speak for "
        f"{len(dom)} of {len(nam)} companies. Net-new by domain is a floor, not "
        f"a total; closing the gap needs a domain-enrichment step this source "
        f"does not provide.")
    m["net_new_domains_sample"] = sorted(new_dom)[:40]

    print("\n── overlap vs lists/deduped-v7.csv (read-only) ────────────────")
    for k, v in m.items():
        if k in ("net_new_domains_sample", "by_feed_partition"):
            continue
        print(f"{k:>44}: {v}")
    print("per feed partition (`site`):")
    for part, v in m["by_feed_partition"].items():
        print(f"  {part:>16}: {v}")
    return m


def decide(stats):
    """Evaluate the sweep gate in code so the verdict is a computed result.

    A locator earns a national sweep only if the three-metro probe projects
    >=150 net-new companies AND it carries a tier code or a per-record line
    card. Both legs are read off the measurements above, and the volume leg is
    read off the DOMAIN axis: on every source measured today the name axis
    overstated net-new by ~3x, and this probe reproduces that ratio.
    """
    m, cs = stats["measure"], stats["code_sorts"]
    dom = m.get("projected_national_net_new_by_domain")
    nam = m.get("projected_national_net_new_by_norm_company")

    tier = cs["distributor_category_raw"]
    line = cs["product_category_raw"]
    tier_ok = tier["sorts"] and tier["varies_within_a_company"] > 0
    line_ok = line["sorts"]

    volume_ok = bool(dom and dom >= 150)
    verdict = {
        "threshold": ">=150 projected net-new companies AND (tier code OR "
                     "per-record line card)",
        "volume_leg_domain_axis": f"{dom} projected net-new by domain -> "
                                  f"{'PASS' if volume_ok else 'FAIL'}",
        "volume_leg_name_axis_for_reference": f"{nam} projected net-new by "
                                              f"norm_company (the axis that "
                                              f"overstates ~3x — not the test)",
        "name_axis_overstatement_this_probe": (
            round(m["net_new_by_norm_company"] / m["net_new_by_domain"], 2)
            if m.get("net_new_by_domain") else None),
        "tier_code_leg": f"distributor_category is {tier['resolution']} "
                         f"({tier['distinct_values']} distinct: "
                         f"{tier['values_verbatim']}) -> "
                         f"{'PASS' if tier_ok else 'FAIL — no usable tier'}",
        "line_card_leg": "product_category is {} ({} distinct) -> {}".format(
            line["resolution"], line["distinct_values"],
            ("PASS at company level, FAIL as a per-record line card"
             if line_ok else "FAIL — constant")),
        "code_leg": "PASS" if (tier_ok or line_ok) else "FAIL",
        "sweep_earned": bool(volume_ok and (tier_ok or line_ok)),
    }
    print("\n── decision rule (computed) ───────────────────────────────────")
    for k, v in verdict.items():
        print(f"  {k}: {v}")
    print(f"  => national sweep {'EARNED' if verdict['sweep_earned'] else 'NOT earned'}")
    return verdict


# ── phases ───────────────────────────────────────────────────────────────────

def shape_probe(f):
    """One small unfiltered box. Learns the envelope + the real key union."""
    box = bbox(29.7604, -95.3698, SHAPE_BOX_HALF_MI)
    url = bbox_url(box, SHAPE_LIMIT)          # no countryName: see the raw codes
    payload, cached = fetch(f, url, "probe-shape.json")
    docs, envelope = unwrap(payload)

    union = sorted({k for d in docs for k in d})
    types = {}
    for d in docs:
        for k, v in d.items():
            types.setdefault(k, set()).add(type(v).__name__)

    print(f"\n── shape probe ({'cached' if cached else 'live'}) ──")
    print(f"url          : {url}")
    print(f"envelope keys: {envelope}")
    print(f"docs         : {len(docs)}")
    print(f"KEY UNION ({len(union)}) VERBATIM:")
    for k in union:
        print(f"  {k}  <{'/'.join(sorted(types[k]))}>")
    if docs:
        print("sample doc:")
        print(json.dumps(docs[0], indent=1)[:1800])
    return {"url": url, "bounding_box": box, "limit": SHAPE_LIMIT,
            "envelope_keys": envelope, "docs_returned": len(docs),
            "key_union_verbatim": union,
            "key_types": {k: sorted(v) for k, v in types.items()},
            "sample_doc": docs[0] if docs else None}


def metro_probes(f):
    """Exactly three boxes, ~100 miles across, countryName=US. One GET each."""
    out, records, boxes = {}, [], []
    for name, lat, lng in METROS:
        box = bbox(lat, lng, HALF_SIDE_MI)
        boxes.append(box)
        url = bbox_url(box, PROBE_LIMIT, COUNTRY)
        payload, cached = fetch(f, url, f"probe-{name}.json")
        docs, envelope = unwrap(payload)
        for d in docs:
            records.append(normalize(d, url, name))
        out[name] = {
            "center": [lat, lng], "bounding_box": box,
            "box_miles_across": round(2 * HALF_SIDE_MI),
            "url": url, "limit": PROBE_LIMIT, "envelope_keys": envelope,
            "records": len(docs), "truncated_at_limit": len(docs) >= PROBE_LIMIT,
            "cached": cached,
        }
        print(f"{name:>14}  box~{2 * HALF_SIDE_MI:.0f}mi  records={len(docs)}"
              f"{'  ⚠TRUNCATED' if len(docs) >= PROBE_LIMIT else ''}"
              f"  ({'cached' if cached else 'live'})")
    return out, records, boxes


def main():
    if "--sweep" in sys.argv:
        raise SystemExit(
            "Refusing. This source is probe-only until a human reads the "
            "three-metro numbers against the decision rule (>=150 projected "
            "net-new companies AND a tier code or per-record line card). "
            "A national grid is not implemented here on purpose.")

    f = Fetcher(SOURCE, min_bytes=2)

    # Gate 0: the hardcoded route still matches what the SPA publishes.
    pinned = verify_pinned_route()

    # Gate 1: robots, live, before any data request.
    try:
        robots = robots_gate(f, [f"{SOLR}{ROUTE}", f"{SOLR}location",
                                 f"{SOLR}addressSearch"])
    except Blocked as e:
        print(f"BLOCKED on robots.txt: {e}")
        write_raw(SOURCE, {"source_url": ROBOTS, "blocked": str(e)}, [])
        return

    # Gate 2 + the probe itself.
    try:
        shape = shape_probe(f)
        metros, records, boxes = metro_probes(f)
    except Blocked as e:
        print(f"\nBLOCKED: {e}")
        print("Akamai/credential wall. Recording the finding and stopping — no "
              "retry, no UA rotation, no host switch, no headless.")
        write_raw(SOURCE, {"source_name": "SKF find-a-distributor",
                           "source_url": f"{ORIGIN}{SOLR}{ROUTE}",
                           "locator_page": PAGE, "robots_check": robots,
                           "blocked": str(e),
                           "origin_requests": f.origin_requests}, [])
        return

    seen, deduped = set(), []
    for r in records:
        key = r["skf_id_raw"] or (r["company"], r["address_1"], r["zip_raw"])
        if key in seen:
            continue
        seen.add(key)
        deduped.append(r)

    code_fields = ("distributor_category_raw", "distributor_category_names_raw",
                   "product_category_raw", "product_category_names_translated_raw",
                   "distributor_offer_raw", "country_code_raw", "site_raw",
                   "type_raw")
    stats = report(SOURCE, deduped, code_fields=code_fields)
    stats["records_before_cross_metro_dedupe"] = len(records)
    stats["per_metro"] = {k: v["records"] for k, v in metros.items()}
    stats["with_state"] = sum(1 for r in deduped if r["state"])
    stats["with_zip"] = sum(1 for r in deduped if r["zip_raw"])
    stats["with_latlng"] = sum(1 for r in deduped
                               if r["lat"] is not None and r["lng"] is not None)
    stats["code_sorts"] = code_sorts(deduped, code_fields)
    stats["measure"] = measure(deduped, boxes)
    stats["decision_rule"] = decide(stats)

    write_raw(SOURCE, {
        "source_name": "SKF find-a-distributor (address/distributors Solr service)",
        "source_url": f"{ORIGIN}{SOLR}{ROUTE}",
        "locator_page": PAGE,
        "scope": "THREE-METRO PROBE ONLY — no national sweep was run. The sweep "
                 "is gated on a human reading these numbers against the "
                 "decision rule.",
        "method":
            "The locator is an Angular SPA. Its cached config.json publishes "
            "addressServiceConfig.config.url = \"/address/distributors/\" (a "
            "same-origin relative path) and cached chunk-F5OGGODZ.js builds "
            "`${solrUrl}${p?'locationNew':'location'}?bounding_box="
            "${JSON.stringify({sw:{lat,lng},ne:{lat,lng}})}` + filters + "
            "`&limit=` + `&countryName=`. All three distributor call sites pass "
            "p=!isThisOfficeSearch=true, so the live dealer route is "
            "`locationNew`; that is the only route called here. Four GETs "
            "total: robots.txt, one small unfiltered shape box, and three "
            "~100-mile metro boxes with countryName=US. No filter parameter is "
            "sent. Bundles read from disk, never re-fetched.",
        "offices_flag_note":
            "`offices=true` is NEVER sent. In the bundle it only appears on the "
            "non-distributor branch and returns SKF's OWN offices — the "
            "manufacturer, not dealers. Seating those would poison the pool.",
        "credential_note":
            "None. MSAL's protectedResourceMap enumerates exactly which URLs "
            "get a bearer token (search.skf.com/.../croesus/*, "
            "/feedback-service/*, /cad-service/download-cad/*); the address "
            "service is not in it and the bundle's calls are bare "
            "httpClient.get(u) with no headers. Public and anonymous. Any "
            "401/403 raises Blocked and stops the source.",
        "akamai_note":
            "www.skf.com is Akamai-fronted. A 403 or a 200-with-challenge stops "
            "this source dead and deletes the poisoned cache entry. No retry, "
            "no UA rotation, no host switching, no headless browser.",
        "robots_check": robots,
        "pinned_route_verified": pinned,
        "limit_note":
            f"The SPA's own searchLimit is 100 and its label renders '100+' at "
            f"exactly 100, i.e. the app knows 100 truncates. The probe asks "
            f"limit={PROBE_LIMIT} so a metro count is not silently truncated; "
            f"`truncated_at_limit` per metro records whether the ceiling was hit.",
        "codes_captured_verbatim": list(code_fields) + [
            "skf_id_raw", "state_raw", "phone_no_2_raw", "fax_no_raw",
            "x_*_raw (every other payload key)"],
        "feed_partition_note":
            "`site` is NOT a location field — it is the feed partition, and the "
            "two partitions are structurally different sources sharing one "
            "route. 'United States' is the bearings/PT dataset: branch-level, "
            "phone-only, ZERO websites and ZERO emails. 'Lubrication TE' is a "
            "separate lubrication feed: one row per company, and it carries "
            "every website and every email in the pull. Any fill rate averaged "
            "over both partitions is meaningless — read them apart.",
        "code_interpretation":
            "NONE APPLIED. distributor_category is the DC* tier/programme axis "
            "and product_category the PC* line-card axis; the bundle decodes "
            "both to labels (and getTaxonomy overwrites the code fields in "
            "place before render, which is why this reads the HTTP response, "
            "not the rendered list). The bundle's own decoding is inconsistent "
            "— setProductCategories pushes PC010 and PC020 back into "
            "distributor_category as 'Electric Motor' and 'Seal Jet' — so codes "
            "are stored as codes. Distributions are measured, not trusted.",
        "state_note":
            "`state` is emitted only when the source's own `state` value is a "
            "real USPS code or a full state name; it is never reverse-derived "
            "from the ZIP or the city. `state_raw` keeps the source value.",
        "shape_probe": shape,
        "metro_probes": metros,
        "origin_requests": f.origin_requests,
        "origin_requests_cold": len(os.listdir(f.cache)),
        "stats": stats,
    }, deduped)

    print(f"\norigin requests this run: {f.origin_requests} "
          f"(cold total: {len(os.listdir(f.cache))})")
    print("STOPPED after the three-metro probe, as instructed. No national sweep.")


if __name__ == "__main__":
    main()
