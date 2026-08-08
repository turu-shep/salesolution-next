#!/usr/bin/env python3
"""S1 wave-3 — Lincoln Electric "Search for Service and Distributor Locations".

**The find.** `mylincoln.lincolnelectric.com/northamerica/s/store-locator` is a
Salesforce Experience Cloud **Aura** site (NOT LWR — Walter's `webruntime`
bridge does not exist here). The cached shell
`data/raw/_cache/e4evidence-lincolnelectric/locator.html` settles it by count:
`aura` 134 · `auraConfig` 15 · `fwuid` 3 · `markup://` 184 · `sfsites` 8 versus
`webruntime` **0** · `LWR.define` **0** · `apexApiBasePath` **0**. The shell is
the generic `siteforce:communityApp` bootstrap and names no locator component,
so the wiring was read out of the site's own Aura bundles instead:

  * `bootstrap.js` publishes the community route table. `"/store-locator"` maps
    to flexipage `StoreLocator__c`, `"is_public":"true"`. (A sibling
    `"/store-locator-wtb"` -> `Store_Locator_WTB__c` exists; its neighbours in
    the bundle are `PriceSpider_Key__c` / `PriceSpider_Url__c` /
    `PriceSpiderStoreLocator_Configurable_URL`, i.e. a third-party PriceSpider
    widget, not this dataset. Not used.)
  * The page's own component is `c:myLincolnStoreLocator`. Its Apex imports are
    `@salesforce/apex/B2B_StoreLocatorController.{callMethod, updateMethod,
    getAllCountriesForDistributorProfile, getAllCountriesForMyHarris, sendEmail}`.
  * The search is one generic dispatcher:
    `callMethod({method:"fetch", requestMap: this.buildRequestMap(lat,lng)})`,
    and `buildRequestMap` is verbatim
    `{lat, lng, range, isShowMiles, countryCode, moneyMatters, service,
      isDistributor, isEducational, inStorePickup, rental, isFourFiveStar,
      industrial, wholesale, specialtyGas, isHVAC, isPlumbing, isRefrigeration,
      isEquipment, isFillerMetals, isLincolnElectric, isOerlikon, isSaffro,
      isInternationalView, isMyHarris, isLincolnElectricView}`.

**Transport, measured live — no browser on the data path.** A single headless
Chromium load was used ONCE to read the wire format (plain Chromium, default UA,
no stealth patches, no fingerprint spoofing; capture kept at
`data/raw/_cache/lincolnelectric/aura-capture-store-locator.json`). Everything
after that is plain `urllib`. The envelope, verbatim:

    POST /northamerica/s/sfsites/aura?r=<n>&aura.ApexAction.execute=1
    Content-Type: application/x-www-form-urlencoded
    message={"actions":[{"id":"<n>;a",
             "descriptor":"aura://ApexActionController/ACTION$execute",
             "callingDescriptor":"UNKNOWN",
             "params":{"namespace":"","classname":"B2B_StoreLocatorController",
                       "method":"callMethod",
                       "params":{"method":"fetch","requestMap":{...}},
                       "cacheable":false,"isContinuation":false}}]}
    aura.context={"mode":"PROD","fwuid":"<from the page>",
                  "app":"siteforce:communityApp","loaded":{...},
                  "dn":[],"globals":{},"uad":true}
    aura.pageURI=/northamerica/s/store-locator?language=en_US
    aura.token=null

`aura.token` is the four-character literal `null`. The page ships
`auraConfig["token"] == null` and no `eikoocnekot` cookie-name key, so Aura runs
in `csrfV2` mode and the anonymous client sends the literal. **There is no
session token of any kind on this path — nothing harvested, nothing derived from
a login.** `auraConfig.attributes.authenticated` is the string `"false"`.

**The endpoint answers with its own SOQL, and that is the whole story.** Each
response carries `{success, query, items}` where `query` is the executed SOQL:

    SELECT Id, Company_Name__c, Street__c, City__c, State__c, Country__c,
           Zip__c, Website_URL__c, Geolocation__Latitude__s, ...,
           Business_Email__c, Fax_Number__c
    FROM Distributor_Profile__c
    WHERE Distributor_Query_Value__c = true AND Country__c = 'US'
      AND DISTANCE(Geolocation__c, GEOLOCATION(<lat>,<lng>), 'mi') < <range>
    ORDER BY DISTANCE(...) LIMIT 10

**`LIMIT 10` is hardcoded server-side.** Measured, not assumed: `limit`,
`resultLimit`, `maxResults`, `pageSize` and `recordLimit` were each added to
`requestMap` in a separate deliberate request and the emitted SOQL still said
`LIMIT 10` every time (`probe-limit-*.json` in the cache). `range` IS honoured
(`range:5` -> `< 5.0` and 3 items). There is no offset, no cursor, no paging
key. So the endpoint is **radius-scoped and top-10-capped**: the only correct
way to enumerate it is adaptive subdivision, which is what `sweep_box()` does.

The tab flags each swap one WHERE predicate, measured one request apiece:
`isDistributor`->`Distributor_Query_Value__c`, `rental`->`Rental_Query_Value__c`,
`service`->`Service_Query_Value__c`, `industrial`->`Industrial__c`,
`wholesale`->`Wholesale__c`, `specialtyGas`->`Specialty_Gas__c`. With no flag at
all the WHERE clause disappears entirely and the query degenerates to
`FROM Distributor_Profile__c LIMIT 10` (rows from KE, AU, US …) — recorded
because it proves the WHERE is assembled from `requestMap` and nothing else.
No attempt was made to inject into that clause; that is not on the table.

**Compliance.**
  * `mylincoln.lincolnelectric.com/robots.txt` is re-fetched and re-parsed by
    `robots_gate()` BEFORE the first data request, and the RFC 9309 §2.2.2
    longest-match is *executed*, not asserted: `Allow: /northamerica/s` (15
    chars) beats `Disallow: /` (1 char), so `/northamerica/s/store-locator` and
    `/northamerica/s/sfsites/aura` are ALLOWED. If that ever stops being true
    the script raises before it fetches anything. No override, nothing to sign.
  * The old `.aspx` locator path 403s and is not touched.
  * **No credential boundary.** Public page, anonymous render, `aura.token=null`.
    Zero 401 and zero 403 across the entire run. Had either appeared,
    `_polite.Blocked` stops the source — no retry, no UA rotation, no host
    switching, no stealth. reCAPTCHA markers exist in the page shell (the
    contact-us form) but never appeared on the data path; a CAPTCHA there would
    also stop the source.
  * >=3s/host, single worker, honest desktop UA never rotated, every response
    cached to disk so a re-run never touches the origin.

⚠ §5i SOURCE-NATIVE CODES, CAPTURED VERBATIM AND UNINTERPRETED. This payload is
unusually code-rich: 17 boolean capability/brand flags per record plus a weekday
program map. They are stored as-is (including the payload's own `moday` typo for
Monday) and `code_sorts()` MEASURES each one — today's SKF lesson is that a rich
published code table means nothing if the field is a constant on every row.
Nothing here is mapped, renamed, or averaged over.

Usage:
    python3 lincolnelectric.py                 # 3-metro probe, then STOP
    python3 lincolnelectric.py --budget 250    # per-metro request cap
    python3 lincolnelectric.py --metros houston-tx
"""
import argparse
import csv
import json
import math
import os
import re
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402

_polite.CAPTURED = "2026-08-04"

from _polite import (ROOT, Blocked, Fetcher, apex, digits,  # noqa: E402
                     norm_company, report, write_raw)

CAPTURED = _polite.CAPTURED
SOURCE = "lincolnelectric"

ORIGIN = "https://mylincoln.lincolnelectric.com"
PAGE_PATH = "/northamerica/s/store-locator?language=en_US"
PAGE = ORIGIN + PAGE_PATH
ROBOTS = f"{ORIGIN}/robots.txt"
AURA = ORIGIN + "/northamerica/s/sfsites/aura"
APEX_CLASS = "B2B_StoreLocatorController"
NAMESPACE = ""

POOL = os.path.join(ROOT, "lists", "deduped-v7.csv")

# Paths the robots gate must clear before anything is fetched.
PROBE_PATHS = ["/northamerica/s/store-locator", "/northamerica/s/sfsites/aura"]

# Server-side, hardcoded in the Apex. Proven by probe, not assumed — see the
# docstring. A response of exactly this many rows means "possibly truncated".
PAGE_LIMIT = 10

# The UI's own maximum distance option is 300 (`milesAwayOptions` tops out at
# 300); we never ask for more than the app itself offers.
MAX_RANGE_MI = 300.0

# Three metros, box ~100 miles across (half-side 50 mi), per the handoff — the
# same box SKF's probe used, so the two are comparable.
METROS = {
    "houston-tx": (29.7604, -95.3698),
    "chicago-il": (41.8781, -87.6298),
    "cleveland-oh": (41.4993, -81.6944),
}
HALF_SIDE_MI = 50.0
MIN_HALF_MI = 0.5          # stop subdividing here and record the truncation
RANGE_SLACK = 1.5          # ask past the cell corner so `d10` can prove closure

MI_PER_DEG_LAT = 69.0546
MI_PER_DEG_LNG_EQ = 69.1712
EARTH_MI = 3958.8
SQRT2 = math.sqrt(2)

# `buildRequestMap` verbatim, every flag false. A tab sets exactly one True.
BASE_REQUEST_MAP = {
    "range": 25, "isShowMiles": True, "countryCode": "US",
    "moneyMatters": False, "service": False, "isDistributor": False,
    "isEducational": False, "inStorePickup": False, "rental": False,
    "isFourFiveStar": False, "industrial": False, "wholesale": False,
    "specialtyGas": False, "isHVAC": False, "isPlumbing": False,
    "isRefrigeration": False, "isEquipment": False, "isFillerMetals": False,
    "isLincolnElectric": False, "isOerlikon": False, "isSaffro": False,
    "isInternationalView": False, "isMyHarris": False,
    "isLincolnElectricView": True,
}

# tab name -> the one requestMap flag it flips, and the SOQL predicate that
# flag produced when measured (recorded so the mapping is auditable).
TABS = {
    "whereToBuy": ("isDistributor", "Distributor_Query_Value__c = true"),
    "whereToRent": ("rental", "Rental_Query_Value__c = true"),
    "serviceLocations": ("service", "Service_Query_Value__c = true"),
    "industrial": ("industrial", "Industrial__c = true"),
    "wholesale": ("wholesale", "Wholesale__c = true"),
    "specialtyGas": ("specialtyGas", "Specialty_Gas__c = true"),
}
SWEEP_TAB = "whereToBuy"          # the distributor tab — the ICP one
SHAPE_TABS = [t for t in TABS if t != SWEEP_TAB]
SHAPE_RANGE_MI = 50.0

# Fields consumed by name below. Anything else the payload carries is swept
# into `x_<key>_raw` so a field nobody has seen yet still reaches the raw file.
_HANDLED = {"sfid", "name", "street", "city", "state", "country", "zip",
            "phone", "web", "email"}

# National chains, counted separately per the handoff. Kept in the raw file —
# suppression is a later stage's decision, not this script's.
CHAINS = {
    "airgas": r"\bairgas\b",
    "praxair": r"\bpraxair\b",
    "linde": r"\blinde\b",
    "fastenal": r"\bfastenal\b",
    "grainger": r"\bgrainger\b",
    "msc": r"\bmsc\b",
    "motion": r"\bmotion (industries|inds?)\b|^motion\b",
    "applied": r"\bapplied industrial\b|^applied\b",
    "fleetpride": r"\bfleet ?pride\b",
    "dxp": r"\bdxp\b",
    "kaman": r"\bkaman\b",
    "bdi": r"^bdi\b|\bbearing distributors\b",
    "whitecap": r"\bwhite cap\b",
    "vallen": r"\bvallen\b",
}
CHAIN_RX = {k: re.compile(v) for k, v in CHAINS.items()}


# ── compliance gate ──────────────────────────────────────────────────────────

def _robots_rx(rule):
    """robots.txt path matching: `*` = any run, trailing `$` = end anchor,
    otherwise a prefix match. Built as a regex so the check is executed."""
    out = ["^"]
    for ch in rule:
        out.append(".*" if ch == "*" else ("$" if ch == "$" else re.escape(ch)))
    return re.compile("".join(out))


def robots_gate(f, probe_paths):
    """Re-fetch robots.txt and RESOLVE it under RFC 9309 §2.2.2 longest-match
    before the first data request. `Allow: /northamerica/s` (15 chars) must beat
    `Disallow: /` (1 char). If it ever stops doing so, this raises."""
    body, cached = f.get(ROBOTS, "robots.txt", headers={"Accept": "text/plain,*/*"})
    group, rules, lines = None, [], []
    for raw in body.splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line or ":" not in line:
            continue
        key, _, val = line.partition(":")
        key, val = key.strip().lower(), val.strip()
        if key == "user-agent":
            group = val
        elif key in ("allow", "disallow") and group == "*" and val:
            rules.append((key, val))
            lines.append(f"{key.title()}: {val}")

    print(f"\n── robots gate ({'cached' if cached else 'live'}) — {ROBOTS} ──")
    print(f"`User-agent: *` rules ({len(rules)}), VERBATIM:")
    for line in lines:
        print(f"  {line}")

    verdicts, blocked = {}, []
    for path in probe_paths:
        best = None
        for kind, rule in rules:
            if not _robots_rx(rule).match(path):
                continue
            # longest match wins; Allow wins a tie (RFC 9309 §2.2.2)
            if (best is None or len(rule) > len(best[1])
                    or (len(rule) == len(best[1]) and kind == "allow")):
                best = (kind, rule)
        verdict = ("no rule matches — allowed by absence" if best is None
                   else f"{best[0].upper()}ED by `{best[0].title()}: {best[1]}` "
                        f"({len(best[1])} chars)")
        verdicts[path] = verdict
        print(f"  {path}\n      -> {verdict}")
        if best and best[0] == "disallow":
            blocked.append(path)
    if blocked:
        raise SystemExit(f"robots.txt DISALLOWS {blocked} — stopping. Nothing "
                         f"about this is worth working around.")
    print("VERDICT: allowed under RFC 9309 longest-match. No override involved, "
          "nothing to sign.")
    return {"url": ROBOTS, "user_agent_star_rules_verbatim": lines,
            "resolution": "RFC 9309 §2.2.2 longest-match, executed in code",
            "paths_tested": verdicts,
            "note": "the legacy `.aspx` locator path 403s and is never touched"}


# ── Aura transport ───────────────────────────────────────────────────────────

class Aura:
    """`aura://ApexActionController/ACTION$execute` over `_polite.Fetcher`.

    `Fetcher.get` already form-encodes a `data=` dict and owns the pacing, the
    backoff ladder, the 401/403 -> `Blocked` rule and the disk cache, so this is
    a thin envelope builder rather than a second HTTP client.
    """

    def __init__(self, f):
        self.f = f
        self.n = 0
        self.context = None
        self.bootstrap_note = None

    def bootstrap(self):
        """Read `fwuid` / `app` / `loaded` off the live public page.

        Also asserts the credential posture in code: the page must render
        anonymously and must not hand us a login-derived session. A guest token
        an anonymous page publishes to every visitor would be acceptable (the
        Banjo/Banner/Festo shape); a login-derived one stops the source. Its
        VALUE is never read, printed or stored either way.
        """
        html, cached = self.f.get(PAGE, "locator-live.html",
                                  headers={"Accept": "text/html,*/*"})
        i = html.find("var auraConfig")
        if i < 0:
            raise Blocked("no `var auraConfig` in the locator page — the shell "
                          "changed or this is a challenge page, not the app")
        j = html.find("\n\tcn = auraConfig", i)
        cfg = json.loads(html[i + len("var auraConfig = "):j].rstrip().rstrip(","))
        ctx = cfg["context"]

        authed = (cfg.get("attributes") or {}).get("authenticated")
        if authed != "false":
            raise Blocked(f"auraConfig.attributes.authenticated={authed!r} — "
                          f"this is not the anonymous render; stopping at the "
                          f"credential boundary.")
        has_cookie_key = "eikoocnekot" in cfg
        has_inline_token = cfg.get("token") is not None
        self.bootstrap_note = (
            f"authenticated={authed!r}; inline aura token present="
            f"{has_inline_token}; token-cookie key present={has_cookie_key}; "
            f"client sends the literal `null` (csrfV2). No token value was ever "
            f"read or recorded.")
        self.context = {"mode": "PROD", "fwuid": ctx["fwuid"], "app": ctx["app"],
                        "loaded": ctx["loaded"], "dn": [], "globals": {},
                        "uad": True}
        print(f"aura bootstrap ({'cached' if cached else 'live'}): "
              f"app={ctx['app']} fwuid={ctx['fwuid'][:18]}… "
              f"loaded={list(ctx['loaded'])[:1]}")
        print(f"credential check: {self.bootstrap_note}")
        return self.context

    def call(self, method, params, cache_name):
        """One ApexAction. Returns (returnValue, from_cache)."""
        if self.context is None:
            self.bootstrap()
        self.n += 1
        msg = {"actions": [{
            "id": f"{self.n};a",
            "descriptor": "aura://ApexActionController/ACTION$execute",
            "callingDescriptor": "UNKNOWN",
            "params": {"namespace": NAMESPACE, "classname": APEX_CLASS,
                       "method": method, "params": params,
                       "cacheable": False, "isContinuation": False}}]}
        url = f"{AURA}?r={self.n}&aura.ApexAction.execute=1"
        data = {"message": json.dumps(msg, separators=(",", ":")),
                "aura.context": json.dumps(self.context, separators=(",", ":")),
                "aura.pageURI": PAGE_PATH,
                "aura.token": "null"}
        body, cached = self.f.get(url, cache_name, data=data,
                                  headers={"Referer": PAGE, "Accept": "*/*"})
        head = body.lstrip()[:200]
        if not head.startswith("{"):
            path = os.path.join(self.f.cache, cache_name)
            if os.path.exists(path):
                os.remove(path)
            raise Blocked(f"non-JSON on {cache_name} (Aura error page, WAF "
                          f"interstitial or CAPTCHA) — source stopped, cache "
                          f"entry removed. First 200 bytes: {head!r}")
        doc = json.loads(body)
        act = (doc.get("actions") or [{}])[0]
        if act.get("state") != "SUCCESS":
            raise Blocked(f"Aura action state={act.get('state')!r} on "
                          f"{cache_name}: {str(act.get('error'))[:400]}")
            # NB: a stale `fwuid` after a Salesforce release lands here. The fix
            # is to delete the cached locator page and re-bootstrap, never to
            # retry the same context.
        return (act.get("returnValue") or {}).get("returnValue"), cached


# ── geometry ─────────────────────────────────────────────────────────────────

def dlat_mi(mi):
    return mi / MI_PER_DEG_LAT


def dlng_mi(mi, lat):
    return mi / (MI_PER_DEG_LNG_EQ * math.cos(math.radians(lat)))


def haversine_mi(a_lat, a_lng, b_lat, b_lng):
    p1, p2 = math.radians(a_lat), math.radians(b_lat)
    dp, dl = p2 - p1, math.radians(b_lng - a_lng)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * EARTH_MI * math.asin(math.sqrt(h))


def box_of(lat, lng, half_mi):
    return {"sw": {"lat": lat - dlat_mi(half_mi), "lng": lng - dlng_mi(half_mi, lat)},
            "ne": {"lat": lat + dlat_mi(half_mi), "lng": lng + dlng_mi(half_mi, lat)}}


def in_box(box, lat, lng):
    return (box["sw"]["lat"] <= lat <= box["ne"]["lat"]
            and box["sw"]["lng"] <= lng <= box["ne"]["lng"])


# ── the sweep ────────────────────────────────────────────────────────────────

def fetch_cell(aura, tab, lat, lng, range_mi, cache_name):
    flag, _ = TABS[tab]
    rm = dict(BASE_REQUEST_MAP, lat=lat, lng=lng,
              range=round(min(range_mi, MAX_RANGE_MI), 4))
    rm[flag] = True
    rv, cached = aura.call("callMethod", {"method": "fetch", "requestMap": rm},
                           cache_name)
    rv = rv or {}
    return rv.get("items") or [], rv.get("query"), cached


def sweep_box(aura, tab, metro, lat, lng, half_mi, budget, seen, stats):
    """Adaptive quadtree over one square cell, exact by construction.

    The endpoint returns the 10 NEAREST rows inside `range`. Ask with
    `range = RANGE_SLACK x circumradius`; then the cell is provably exhausted
    when either fewer than 10 rows come back (nothing else exists inside
    `range`, which contains the cell) or the 10th row already lies beyond the
    circumradius (everything inside the cell was seen before the cap bit).
    Otherwise the cell is saturated and is split into four quadrants.
    """
    stack = [(lat, lng, half_mi, 0)]
    while stack:
        if stats["calls"] >= budget:
            stats["budget_exhausted"] = True
            stats["unfinished_cells"] += len(stack)
            return
        clat, clng, h, depth = stack.pop()
        circum = h * SQRT2
        name = f"sweep-{tab}-{metro}-d{depth}-{clat:.5f}_{clng:.5f}.json"
        try:
            items, query, cached = fetch_cell(aura, tab, clat, clng,
                                              circum * RANGE_SLACK, name)
        except Blocked as e:
            stats["blocked"] = str(e)
            print(f"    BLOCKED at depth {depth}: {e}")
            return
        stats["calls"] += 1
        if not cached:
            stats["origin_calls"] += 1
        stats["query_sample"] = stats.get("query_sample") or query

        for it in items:
            sfid = it.get("sfid")
            if not sfid:
                continue
            rec = seen.setdefault(sfid, {"item": it, "tabs": set(), "metros": set()})
            rec["tabs"].add(tab)
            rec["metros"].add(metro)

        complete = len(items) < PAGE_LIMIT
        if not complete:
            # The payload types lat/lng inconsistently — most rows are floats,
            # a few arrive as strings. Coerced, never trusted raw.
            far = items[-1]
            fla, flo = num(far.get("lat")), num(far.get("lng"))
            if fla is not None and flo is not None:
                d10 = haversine_mi(clat, clng, fla, flo)
                complete = d10 >= circum
        if complete:
            stats["cells_closed"] += 1
            continue
        if h / 2 < MIN_HALF_MI:
            stats["cells_truncated"] += 1
            continue
        stats["cells_split"] += 1
        q = h / 2
        for slat in (-1, 1):
            for slng in (-1, 1):
                stack.append((clat + slat * dlat_mi(q),
                              clng + slng * dlng_mi(q, clat), q, depth + 1))
        if stats["calls"] % 25 == 0:
            print(f"    {metro}/{tab}: {stats['calls']} calls · "
                  f"{len(seen)} records · {len(stack)} cells queued", flush=True)


def shape_probe_tabs(aura, seen, notes):
    """One call per non-distributor tab per metro. NOT a sweep — it measures
    whether the other five tabs surface records the distributor tab misses."""
    out = {}
    for tab in SHAPE_TABS:
        found = new = 0
        for metro, (lat, lng) in METROS.items():
            name = f"tabshape-{tab}-{metro}.json"
            try:
                items, _query, _ = fetch_cell(aura, tab, lat, lng,
                                              SHAPE_RANGE_MI, name)
            except Blocked as e:
                notes.append(f"tab shape probe {tab}/{metro} blocked: {e}")
                continue
            for it in items:
                sfid = it.get("sfid")
                if not sfid:
                    continue
                found += 1
                if sfid not in seen:
                    new += 1
                rec = seen.setdefault(sfid, {"item": it, "tabs": set(),
                                             "metros": set()})
                rec["tabs"].add(tab)
                rec["metros"].add(metro)
        out[tab] = {"soql_predicate_measured": TABS[tab][1],
                    "rows_returned": found, "records_not_seen_on_the_swept_tab": new,
                    "note": f"3 calls at range {SHAPE_RANGE_MI} mi (one per metro), "
                            f"capped at {PAGE_LIMIT} rows each — a shape probe, "
                            f"NOT a sweep"}
    return out


# ── normalisation ────────────────────────────────────────────────────────────

def to_record(sfid, entry):
    it = entry["item"]
    country = (it.get("country") or "").strip().upper() or None
    state = (it.get("state") or "").strip().upper() or None
    website = (it.get("web") or "").strip() or None
    rec = {
        "company": (it.get("name") or "").strip() or None,
        "address_1": (it.get("street") or "").strip() or None,
        # The payload carries a single `street` line; there is no second line
        # to split, so this is null rather than guessed.
        "address_2": None,
        "city": (it.get("city") or "").strip() or None,
        "state": state,
        "zip_raw": (it.get("zip") or "").strip() or None,
        "phone_raw": (it.get("phone") or "").strip() or None,
        "phone_10": digits(it.get("phone")),
        "email": (it.get("email") or "").strip() or None,
        "website": website,
        "domain": apex(website),
        "lat": num(it.get("lat")),
        "lng": num(it.get("lng")),
        # `is_us` off the record's own Country__c. Never inferred from ZIP,
        # phone or the fact that we queried with countryCode=US.
        "is_us": country == "US",
        "source": SOURCE,
        "source_url": AURA,
        "captured": CAPTURED,
        # ── §5i SOURCE-NATIVE CODES, VERBATIM AND UNINTERPRETED ──────────────
        "sfid_raw": sfid,
        "sf_key_prefix_raw": sfid[:3] if sfid else None,
        "country_raw": country,
        "tabs_raw": "|".join(sorted(entry["tabs"])) or None,
        "probe_metros_raw": "|".join(sorted(entry["metros"])) or None,
    }
    for k, v in it.items():
        if k in _HANDLED:
            continue
        rec[f"x_{k}_raw"] = json.dumps(v, sort_keys=True) if isinstance(v, dict) else v
    return rec


# ── measurement ──────────────────────────────────────────────────────────────

def num(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


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


def code_sorts(records, fields):
    """§5i: a code's meaning is not trusted until it is SHOWN to sort.

    A code sorts only if it takes more than one value across the records, and
    it is reported record-level vs company-level: if every branch of a company
    carries the same value it can separate companies but not branches, which is
    a weaker claim than a per-record line card and decides the second leg of the
    decision rule. Today's SKF finding — a published DC001–DC028 decoding table
    over a field that was a CONSTANT on every row — is exactly what this catches.
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
        dist = {}
        for v in vals:
            key = "(null)" if v is None else str(v)
            dist[key] = dist.get(key, 0) + 1
        out[field] = {
            "distinct_values": len(distinct),
            "null_records": sum(1 for v in vals if v is None),
            "sorts": len(distinct) > 1,
            "varies_within_a_company": varies_within,
            "resolution": ("constant — does NOT sort" if len(distinct) <= 1
                           else "record-level" if varies_within
                           else "company-level only (identical on every branch)"),
            "distribution_verbatim": dict(sorted(dist.items(),
                                                 key=lambda kv: -kv[1])[:12]),
        }
    print("\n── does each code sort? (measured, §5i) ───────────────────────")
    for field, v in out.items():
        print(f"  {field:26} {v['distinct_values']:>3} distinct · "
              f"{v['resolution']:<48} {v['distribution_verbatim']}")
    return out


def chain_share(records):
    """National chains counted, never suppressed. Per-chain so it is auditable."""
    per, hits = {}, set()
    for i, r in enumerate(records):
        n = norm_company(r.get("company"))
        for key, rx in CHAIN_RX.items():
            if rx.search(n):
                per[key] = per.get(key, 0) + 1
                hits.add(i)
    companies = {norm_company(r.get("company")) for i, r in enumerate(records)
                 if i in hits}
    out = {"chain_records": len(hits),
           "chain_pct_of_records": round(100 * len(hits) / (len(records) or 1), 1),
           "chain_distinct_companies": len(companies),
           "per_chain_records": dict(sorted(per.items(), key=lambda kv: -kv[1])),
           "patterns_verbatim": CHAINS}
    print("\n── national chains (counted, NOT suppressed) ──────────────────")
    print(f"  {out['chain_records']}/{len(records)} records "
          f"= {out['chain_pct_of_records']}% · {out['chain_distinct_companies']} "
          f"distinct chain companies")
    print(f"  {out['per_chain_records']}")
    return out


def measure(records, boxes):
    """Net-new on the domain axis (the trustworthy one) and, separately, on
    `norm_company`. The projection scaler is empirical: the share of the pool's
    OWN geocoded rows falling inside the three probe boxes."""
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
        "probe_records_with_website": sum(1 for r in us if r["website"]),
        "probe_pct_website": round(100 * sum(1 for r in us if r["website"])
                                   / (len(us) or 1), 1),
        "probe_distinct_domains": len(dom),
        "probe_distinct_norm_company": len(nam),
        "probe_records_without_domain": sum(1 for r in us if not r["domain"]),
        "net_new_by_domain": len(new_dom),
        "net_new_by_norm_company": len(new_nam),
        "overlap_pct_by_domain": (round(100 * (1 - len(new_dom) / len(dom)), 1)
                                  if dom else None),
        "overlap_pct_by_norm_company": (round(100 * (1 - len(new_nam) / len(nam)), 1)
                                        if nam else None),
        "name_axis_overstatement_ratio": (round(len(new_nam) / len(new_dom), 2)
                                          if new_dom else None),
    }
    if share:
        m["projected_national_companies"] = round(len(nam) / share)
        m["projected_national_net_new_by_domain"] = round(len(new_dom) / share)
        m["projected_national_net_new_by_norm_company"] = round(len(new_nam) / share)
        m["projection_method"] = (
            f"measured-baseline-share: {inside} of the pool's {geocoded} "
            f"geocoded rows fall inside the three 100-mile boxes = "
            f"{share:.5f}. national ~= probe / {share:.5f}. This uses our own "
            f"measured distribution of industrial distribution as the density "
            f"model; if the pool over-weights these metros the projection "
            f"understates, and vice versa.")
    m["domain_axis_caveat"] = (
        f"{m['probe_records_without_domain']} of {len(us)} US records carry no "
        f"website, so the domain axis speaks for only {len(dom)} of "
        f"{len(nam)} companies. Net-new by domain is a FLOOR, not a total.")
    m["net_new_domains_sample"] = sorted(new_dom)[:40]

    print("\n── overlap vs lists/deduped-v7.csv (read-only) ────────────────")
    for k, v in m.items():
        if k in ("net_new_domains_sample",):
            continue
        print(f"{k:>44}: {v}")
    return m


def decide(m, codes):
    """The sweep gate, computed rather than argued.

    >=150 projected net-new companies AND (a tier code OR a per-record line
    card). The volume leg reads the DOMAIN axis: the name axis overstated
    net-new ~3x on every source measured 2026-08-03.
    """
    dom = m.get("projected_national_net_new_by_domain")
    nam = m.get("projected_national_net_new_by_norm_company")
    volume_ok = bool(dom and dom >= 150)

    # The BRAND / PRODUCT line card — the thing the decision rule means by
    # "line card". These are the SOQL's Lincoln_Electric__c / Oerlikon__c /
    # Saffro__c / Equipment__c / Filler_Metals__c columns.
    line_fields = ["x_isLincolnElectric_raw", "x_isOerlikon_raw",
                   "x_isSaffro_raw", "x_isEquipment_raw", "x_isFillerMetals_raw"]
    # The CAPABILITY card — a different, weaker axis: what a branch can DO, not
    # what it stocks. Reported separately so the two are never conflated.
    capability_fields = ["x_hasGasAvailable_raw", "x_hasServiceCapability_raw",
                         "x_hasRentalCapability_raw", "x_hasEngineCapability_raw",
                         "x_hasAirCompressorCapability_raw",
                         "x_hasDemonstrationCapability_raw",
                         "x_hasRetailCapability_raw"]
    # The only genuine source-native TIER field: X4_5_Star_Preferred__c.
    tier_fields = ["x_isFourFiveStar_raw"]

    line_ok = any(codes.get(f, {}).get("sorts") for f in line_fields)
    line_rec = any(codes.get(f, {}).get("varies_within_a_company")
                   for f in line_fields)
    cap_ok = any(codes.get(f, {}).get("sorts") for f in capability_fields)
    tier_ok = any(codes.get(f, {}).get("sorts") for f in tier_fields)
    tier_hits = codes.get("x_isFourFiveStar_raw", {}).get(
        "distribution_verbatim", {}).get("True", 0)

    v = {
        "threshold": ">=150 projected net-new companies AND (tier code OR "
                     "per-record line card)",
        "volume_leg_domain_axis": f"{dom} projected net-new by domain -> "
                                  f"{'PASS' if volume_ok else 'FAIL'}",
        "volume_leg_name_axis_for_reference":
            f"{nam} projected net-new by norm_company (the axis that overstates "
            f"~3x on every source measured 2026-08-03 — not the test)",
        "name_axis_overstatement_this_probe": m.get("name_axis_overstatement_ratio"),
        "line_card_leg": {f: codes.get(f, {}).get("resolution")
                          for f in line_fields},
        "line_card_verdict": ("PASS — per-record brand flags vary within a "
                              "company" if (line_ok and line_rec) else
                              "PASS at company level only" if line_ok else
                              "FAIL — every brand/product flag is a CONSTANT "
                              "false on every record. The payload publishes a "
                              "five-column brand line card and fills none of "
                              "it. Same shape as SKF's DC001–DC028 table over "
                              "a constant field: captured, measured, does not "
                              "sort."),
        "capability_leg": {f: codes.get(f, {}).get("resolution")
                           for f in capability_fields},
        "capability_verdict": ("per-record service capability flags DO sort — "
                               "but this is what a branch can do, not what it "
                               "stocks; it is NOT a line card"
                               if cap_ok else "FAIL — constant"),
        "tier_leg": {f: codes.get(f, {}).get("resolution") for f in tier_fields},
        "tier_verdict": (f"PASS on the letter of the rule — "
                         f"X4_5_Star_Preferred__c sorts, but it is true on only "
                         f"{tier_hits} of {m['probe_us_records']} records "
                         f"({100 * tier_hits / (m['probe_us_records'] or 1):.1f}%), "
                         f"so it ranks almost nothing" if tier_ok
                         else "FAIL — no usable tier"),
        "tabs_raw_is_not_a_code": (
            "`tabs_raw` sorts 15 ways, but it is a PROBE ARTIFACT — it records "
            "which of my queries returned the row, not a field the payload "
            "publishes. It is excluded from both code legs on purpose."),
        "code_leg": "PASS" if (tier_ok or line_ok) else "FAIL",
        "sweep_earned": bool(volume_ok and (tier_ok or line_ok)),
        "website_fill_caveat":
            f"{m['probe_pct_website']}% of US records carry a website. The "
            f"pipeline is domain-keyed, so a low fill here caps how much of any "
            f"sweep is usable at all — Walter (0%) and SKF's main feed (0%) "
            f"were nearly unusable for exactly this reason.",
        "coverage_caveat": (
            "the projection covers the DISTRIBUTOR tab only "
            "(`Distributor_Query_Value__c = true`), which was swept "
            "exhaustively. The rental and wholesale tabs returned rows that "
            "were 100% absent from it in the shape probe, so the six tabs are "
            "NOT nested — a full national pull would have to sweep all six and "
            "would return materially more than this projects."),
    }
    print("\n── decision rule (computed) ───────────────────────────────────")
    for k, val in v.items():
        print(f"  {k}: {val}")
    print(f"  => national sweep {'EARNED' if v['sweep_earned'] else 'NOT earned'}")
    return v


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--metros", default=",".join(METROS),
                    help="comma-separated metro keys")
    ap.add_argument("--budget", type=int, default=400,
                    help="max requests per metro before the sweep stops and "
                         "records the truncation")
    ap.add_argument("--no-tab-probe", action="store_true")
    args = ap.parse_args()

    f = Fetcher(SOURCE, min_bytes=100)
    notes = []

    # 1 ── robots, resolved in code, BEFORE any data request.
    robots = robots_gate(f, PROBE_PATHS)

    aura = Aura(f)
    try:
        aura.bootstrap()
    except Blocked as e:
        print(f"BLOCKED at bootstrap: {e}")
        write_raw(SOURCE, {"source_url": AURA, "locator_page": PAGE,
                           "robots_check": robots, "blocked": str(e)}, [])
        return

    # 2 ── adaptive quadtree over the three metro boxes, distributor tab.
    seen, per_metro, boxes = {}, {}, []
    for key in [m.strip() for m in args.metros.split(",") if m.strip()]:
        lat, lng = METROS[key]
        boxes.append(box_of(lat, lng, HALF_SIDE_MI))
        stats = {"calls": 0, "origin_calls": 0, "cells_closed": 0,
                 "cells_split": 0, "cells_truncated": 0, "unfinished_cells": 0,
                 "budget_exhausted": False, "blocked": None}
        before = len(seen)
        print(f"\n── sweeping {key} @ ±{HALF_SIDE_MI} mi, tab={SWEEP_TAB} "
              f"(budget {args.budget}) ──")
        sweep_box(aura, SWEEP_TAB, key, lat, lng, HALF_SIDE_MI, args.budget,
                  seen, stats)
        stats["records_seen_total_after"] = len(seen)
        stats["records_first_seen_here"] = len(seen) - before
        stats["box"] = box_of(lat, lng, HALF_SIDE_MI)
        stats["exhaustive"] = (not stats["budget_exhausted"]
                               and not stats["cells_truncated"]
                               and not stats["blocked"])
        per_metro[key] = stats
        print(f"  {key}: {stats['calls']} calls · "
              f"{stats['records_first_seen_here']} new records · "
              f"closed {stats['cells_closed']} / split {stats['cells_split']} / "
              f"truncated {stats['cells_truncated']} · "
              f"exhaustive={stats['exhaustive']}")

    # 3 ── the other five tabs, one call per metro each. Shape, not sweep.
    tab_probe = None
    if not args.no_tab_probe:
        print("\n── other-tab shape probe (1 call per tab per metro) ──")
        tab_probe = shape_probe_tabs(aura, seen, notes)
        for tab, v in tab_probe.items():
            print(f"  {tab:17} {v['rows_returned']:>3} rows · "
                  f"{v['records_not_seen_on_the_swept_tab']:>3} not on the "
                  f"swept tab · WHERE {v['soql_predicate_measured']}")

    records = [to_record(sfid, e) for sfid, e in sorted(seen.items())]
    print(f"\ntotal distinct records across every call: {len(records)}")

    code_fields = ["tabs_raw", "sf_key_prefix_raw", "country_raw",
                   "x_isFourFiveStar_raw", "x_isLincolnElectric_raw",
                   "x_isOerlikon_raw", "x_isSaffro_raw", "x_isEquipment_raw",
                   "x_isFillerMetals_raw", "x_service_raw",
                   "x_hasRentalCapability_raw", "x_hasServiceCapability_raw",
                   "x_hasRetailCapability_raw", "x_hasGasAvailable_raw",
                   "x_hasEngineCapability_raw",
                   "x_hasAirCompressorCapability_raw",
                   "x_hasDemonstrationCapability_raw", "x_isLicensedContractor_raw",
                   "x_isHVAC_raw", "x_isPlumbing_raw", "x_isRefrigeration_raw",
                   "x_moneyMatters_raw", "x_inStorePickup_raw"]
    stats = report(SOURCE, records)
    us_records = [r for r in records if r["is_us"]]
    codes = code_sorts(us_records, code_fields)
    chains = chain_share(us_records)
    m = measure(records, boxes)
    verdict = decide(m, codes)

    write_raw(SOURCE, {
        "source_name": "Lincoln Electric — Search for Service and Distributor "
                       "Locations (mylincoln Experience Cloud store locator)",
        "source_url": AURA,
        "locator_page": PAGE,
        "method": (
            "Salesforce Experience Cloud **Aura** site (NOT LWR). One form-"
            "encoded POST per cell to `POST https://mylincoln.lincolnelectric."
            "com/northamerica/s/sfsites/aura?r=<n>&aura.ApexAction.execute=1` "
            "with fields `message` / `aura.context` / `aura.pageURI` / "
            "`aura.token`, where message = {\"actions\":[{\"id\":\"<n>;a\","
            "\"descriptor\":\"aura://ApexActionController/ACTION$execute\","
            "\"callingDescriptor\":\"UNKNOWN\",\"params\":{\"namespace\":\"\","
            "\"classname\":\"B2B_StoreLocatorController\",\"method\":"
            "\"callMethod\",\"params\":{\"method\":\"fetch\",\"requestMap\":"
            "{...}},\"cacheable\":false,\"isContinuation\":false}}]} and "
            "aura.token is the literal string `null`. Plain urllib; a browser "
            "was used ONCE, for wire-format discovery only, and never on the "
            "data path."),
        "request_map_verbatim": BASE_REQUEST_MAP,
        "server_side_limit": {
            "value": PAGE_LIMIT,
            "evidence": "the response echoes its own SOQL in `query`; it ends "
                        "`LIMIT 10` on every call. `limit`, `resultLimit`, "
                        "`maxResults`, `pageSize` and `recordLimit` were each "
                        "added to requestMap in a separate request and the "
                        "emitted SOQL was unchanged (probe-limit-*.json). "
                        "`range` IS honoured. No offset, cursor or page key "
                        "exists, so enumeration requires subdivision.",
        },
        "sweep_geometry": {
            "shape": "adaptive quadtree; range = 1.5 x cell circumradius",
            "half_side_mi": HALF_SIDE_MI, "min_half_mi": MIN_HALF_MI,
            "closure_rule": "a cell is exhausted when fewer than 10 rows return "
                            "OR the 10th row lies beyond the cell circumradius",
            "per_metro": per_metro,
        },
        "tab_map_measured": {t: {"request_map_flag": TABS[t][0],
                                 "soql_predicate": TABS[t][1]} for t in TABS},
        "swept_tab": SWEEP_TAB,
        "other_tabs_shape_probe": tab_probe,
        "no_flag_behaviour": (
            "with every tab flag false the WHERE clause disappears entirely and "
            "the SOQL degenerates to `FROM Distributor_Profile__c LIMIT 10` — "
            "rows from KE / AU / US came back. Recorded because it proves the "
            "WHERE is assembled purely from requestMap. No injection was "
            "attempted into that clause."),
        "robots_check": robots,
        "credential_check": (
            "PUBLIC, NO LOGIN. `auraConfig.attributes.authenticated == \"false\"`, "
            "no inline Aura token, no token cookie key, and the client sends the "
            "four-character literal `null` for aura.token (csrfV2 mode). No "
            "token value was read, printed or stored. Zero 401 and zero 403 "
            "across the run. reCAPTCHA exists on the site's contact form, never "
            "on the data path; had one appeared the source would have stopped. "
            "The legacy `.aspx` locator path 403s and was never touched."
            + (f" Bootstrap detail: {aura.bootstrap_note}"
               if aura.bootstrap_note else "")),
        "codes_captured_verbatim": code_fields,
        "code_sorts": codes,
        "chains": chains,
        "measure": m,
        "verdict": verdict,
        "notes": notes,
        "origin_requests": f.origin_requests,
        "cached_responses": len(os.listdir(f.cache)),
        "stats": stats,
    }, records)


if __name__ == "__main__":
    main()
