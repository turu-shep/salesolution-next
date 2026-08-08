#!/usr/bin/env python3
"""S1 wave-3 — Pepperl+Fuchs "Subsidiaries + Distributors" (E4, GATE R-2).

**Gate posture — read this before running.** `www.pepperl-fuchs.com/robots.txt`
publishes `Disallow: /api/` under `User-agent: *`, and this source's data path is
`/api/protected/distributorsData`. GATE **R-2 is SIGNED YES (Artur, 2026-08-04)**
and the signature covers **the robots directive only, on this path, on this
host** — see `handoff/strategy/00-sourcing-strategy.md` §9 and
`handoff/industrial-contact-list/e4-headless-locators [*]/02-robots-posture-2026-08-03.md`
§6 R-2.

**The credential carve-out survives the signature and is not Artur's to waive.**
If the endpoint answers **401 or 403** to an anonymous request it is an
authentication boundary, the pack excludes those by policy, and this script
stops — `_polite.Fetcher` raises `Blocked` on those codes and `main()` records
the finding and writes an empty payload. **No credential hunting, no token
extraction, no session replay, no UA rotation, no header spoofing.** That is why
`access_check()` runs first and alone: the very first origin request this source
ever makes is the one that decides whether it may make a second.

**How the route was found — read out of the vendor's own JS, not guessed.**
`https://www.pepperl-fuchs.com/en-us/contact-us/view-all-subsidiaries-distributors-gp27595`
is a Nuxt page. Its bundle (1.8 MB, already cached at
`data/raw/_cache/e4bundle-pepperlfuchs/bundle-0.js`, **read from disk, never
re-fetched**) contains the `SubsidiariesAndDistributors` component, which makes
exactly one data call:

    va("/api/protected/distributorsData", {server:!0, headers:{locale: i.graphLocale}}, "$EXiarO_Psv")

`va` is Nuxt's `useFetch`. The locale map in the same bundle resolves the US
site:

    "en-us":{caasLocale:"en_US", graphLocale:"en-US", solrLocale:"en-US", ...}

so the one request header this script sends beyond an honest UA is
`locale: en-US`. **That header is a content selector, not a credential** — it is
the site's own public locale string, published in the anonymous page's JS, and
it carries no identity. No cookie, no bearer token, no `credentials` option
appears anywhere in the call site.

**MEASURED OUTCOME — the gate turned out not to matter, twice over.**

1. **The endpoint 403s anonymously.** One honest, paced, un-rotated GET →
   **HTTP 403**. Under pack policy that is an authentication boundary and the
   source stops. The R-2 signature covers robots and does not reach it. The
   refusal is recorded in `data/raw/_cache/pepperlfuchs/_refused.json` and
   `access_check()` short-circuits on that marker so a re-run never re-probes a
   path that already refused us.
2. **And the data was public anyway.** `server: true` means Nuxt fetches this
   during SSR and serialises the result into the page. It does — as
   `window.__NUXT__=(function(a,b,c…){…}(…))`, a 904 KB IIFE inside the public,
   robots-allowed page, not the Nuxt 3 `__NUXT_DATA__` block a first pass looks
   for. **The complete global payload is public HTML.** `ssr_check()` therefore
   runs FIRST and the gated `/api/` path is never needed.

**And then the payload turned out to carry no US distributors at all.** 214
records across 185 countries, of which the **United States bucket holds 5 rows /
2 companies / 1 domain — and that domain is `pepperl-fuchs.com`, the
manufacturer's own.** Four rows are P+F Inc.'s own offices; the fifth is VMT
Vision Systems, a P+F group company, with no website. **Net-new US distributor
domains: zero.** This is a subsidiaries-and-worldwide-offices list, not a US
dealer locator. The US where-to-buy tool is a different system entirely — see
§4 of the dossier.

**One request buys the whole world**, and it is a page fetch, not an API call.
The component ships every country at once and filters client-side, so there is
no sweep, no paging, and no metro grid.

⚠ §5i SOURCE-NATIVE CODES, captured verbatim and uninterpreted:
`company.type[].name` (the partner-type taxonomy — the field that decides
whether a row is a P+F subsidiary or an independent distributor),
`contacts[].type` (`GENERAL` / `FA` / `PA` — factory vs process automation),
`sortOrder`, the country node's `code`, plus a catch-all `x_*_raw` for every
other payload scalar. **Nothing here is mapped or seated on until it is shown to
sort.** SKF published a DC001–DC028 decoding table in its bundle and shipped a
single constant string on all 82 US rows; the rule is capture-then-test, and the
distributions this script prints are measured from the payload, never read off a
schema.

⚠ TWO RECORD SHAPES, both carried. The payload nests dealers two ways:
`countries[].addresses[]` (a location, with `company[0]` hanging off it) and
`countries[].responsibleCompanies[]` (a company, with `address[0]` hanging off
it, listed under the country it *covers* rather than the one it sits in). A
responsible company for the Bahamas may be physically in Texas, so `is_us` is
taken from the row's own address country and never from the country bucket it
was found under. `record_shape` records which branch produced each row.
"""
import csv
import json
import os
import re
import subprocess
import sys
import tempfile

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402

_polite.CAPTURED = "2026-08-04"

from _polite import (US_STATES, Blocked, Fetcher, apex,  # noqa: E402
                     digits, norm_company, report, write_raw)

CAPTURED = _polite.CAPTURED

SOURCE = "pepperlfuchs"
HOST = "https://www.pepperl-fuchs.com"
DATA_URL = f"{HOST}/api/protected/distributorsData"
ROBOTS_URL = f"{HOST}/robots.txt"
PAGE = f"{HOST}/en-us/contact-us/view-all-subsidiaries-distributors-gp27595"
# From the bundle's own urlLocaleMapping: "en-us" -> graphLocale "en-US".
LOCALE = "en-US"

# The country node's own name for the US, as the payload spells it. Verified
# against the measured value in `probe()` rather than assumed — see main().
US_COUNTRY_NAMES = {"united states", "united states of america", "usa", "us"}


def usps(value):
    """Only a bare, real 2-letter USPS code. Never guessed from a city string."""
    v = (value or "").strip().upper()
    return v if v in US_STATES else None


def flatten(obj, prefix=""):
    """Every scalar, path-keyed. Nothing dropped, nothing interpreted."""
    out = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            out.update(flatten(v, f"{prefix}{k}."))
    elif isinstance(obj, list):
        if all(not isinstance(x, (dict, list)) for x in obj):
            out[prefix[:-1]] = "|".join("" if x is None else str(x) for x in obj)
        else:
            for i, v in enumerate(obj):
                out.update(flatten(v, f"{prefix}{i}."))
    else:
        out[prefix[:-1]] = obj
    return out


def _names(nodes):
    """`[{name: 'X'}, …]` -> 'X|Y'. The payload's own values, unmapped."""
    if not isinstance(nodes, list):
        return None
    vals = [str(n.get("name")).strip() for n in nodes
            if isinstance(n, dict) and n.get("name")]
    return "|".join(vals) or None


def _contacts(company):
    """`contacts[]` -> per-type dicts. Types are GENERAL / FA / PA (bundle)."""
    out = {}
    for c in (company.get("contacts") or []):
        if not isinstance(c, dict):
            continue
        out[str(c.get("type") or "UNKNOWN").upper()] = {
            "email": (c.get("email") or "").strip() or None,
            "phone": (c.get("phone") or "").strip() or None,
            "fax": (c.get("fax") or "").strip() or None,
        }
    return out


_COMPANY_HANDLED = {"name", "type", "website", "contacts", "address", "id",
                    "sortOrder"}
_ADDR_HANDLED = {"street1", "street2", "zipCode", "city1", "city2", "state",
                 "company", "country"}


def normalize(company, addr, bucket_country, shape):
    """One dealer row. `bucket_country` is the country it was LISTED under."""
    con = _contacts(company)
    general = con.get("GENERAL") or {}
    fa = con.get("FA") or {}
    pa = con.get("PA") or {}
    # Prefer the general contact; fall back to FA then PA so a row that only
    # publishes a divisional contact is not silently emitted as contactless.
    phone = general.get("phone") or fa.get("phone") or pa.get("phone")
    email = general.get("email") or fa.get("email") or pa.get("email")

    addr = addr or {}
    country_name = _names(addr.get("country")) or bucket_country
    street = (addr.get("street1") or "").strip() or None
    website = (company.get("website") or "").strip() or None

    rec = {
        "company": (company.get("name") or "").strip() or None,
        "address_1": street,
        "address_2": (addr.get("street2") or "").strip() or None,
        "city": (addr.get("city1") or "").strip() or None,
        "city_2": (addr.get("city2") or "").strip() or None,
        "state": usps(addr.get("state")),
        "zip_raw": (str(addr.get("zipCode")).strip()
                    if addr.get("zipCode") not in (None, "") else None),
        "phone_raw": phone,
        "phone_10": digits(phone),
        "email": email,
        "website": website,
        "domain": apex(website),
        # is_us comes from THIS ROW's own address country, never from the
        # country bucket it was listed under — a responsible company for the
        # Bahamas can sit in Texas and vice versa.
        "is_us": (country_name or "").strip().lower() in US_COUNTRY_NAMES,
        "source": SOURCE,
        "source_url": DATA_URL,
        "captured": CAPTURED,
    }
    # ── §5i: source-native codes, VERBATIM AND UNINTERPRETED ────────────────
    rec["country_raw"] = country_name
    rec["listed_under_country_raw"] = bucket_country
    rec["state_raw"] = addr.get("state")
    rec["type_raw"] = _names(company.get("type"))
    rec["contact_types_raw"] = "|".join(sorted(con)) or None
    rec["sort_order_raw"] = company.get("sortOrder")
    rec["pf_id_raw"] = company.get("id")
    rec["record_shape"] = shape
    rec["general_email_raw"] = general.get("email")
    rec["general_phone_raw"] = general.get("phone")
    rec["general_fax_raw"] = general.get("fax")
    rec["fa_email_raw"] = fa.get("email")
    rec["fa_phone_raw"] = fa.get("phone")
    rec["pa_email_raw"] = pa.get("email")
    rec["pa_phone_raw"] = pa.get("phone")
    for k, v in flatten({k: v for k, v in company.items()
                         if k not in _COMPANY_HANDLED}).items():
        rec[f"x_{k.replace('.', '_')}_raw"] = v
    for k, v in flatten({k: v for k, v in addr.items()
                         if k not in _ADDR_HANDLED}).items():
        rec[f"xa_{k.replace('.', '_')}_raw"] = v
    return rec


# ── phases ───────────────────────────────────────────────────────────────────

def robots_check(f):
    """Re-fetch robots.txt TODAY and record it verbatim. Never inferred."""
    body, cached = f.get(ROBOTS_URL, "robots.txt", timeout=60)
    print(f"\n── robots.txt ({'cached' if cached else 'live'}) — VERBATIM ──")
    print(body)
    return body


def access_check(f):
    """THE gate request. One anonymous GET. 401/403 -> Blocked -> stop.

    Short-circuits on the `_refused.json` marker. A path that has already
    answered with a deterministic 4xx must not be re-requested on a re-run —
    that is the same defect `_polite.py` was fixed for on 2026-08-03, and it
    matters more here because the refusal in question is an auth boundary.
    """
    marker = os.path.join(f.cache, "_refused.json")
    if os.path.exists(marker):
        with open(marker, encoding="utf-8") as fh:
            prior = json.load(fh).get(DATA_URL) or {}
        if prior.get("status") in (401, 403):
            raise Blocked(
                f"HTTP {prior['status']} on {DATA_URL} recorded "
                f"{prior.get('captured')} — not re-requested")

    print(f"\n── anonymous access check on {DATA_URL} ──")
    print("   headers: honest desktop UA + `locale: en-US` (the site's own "
          "public locale string). No cookie, no token, no auth header.")
    body, cached = f.json(DATA_URL, "distributorsData.json",
                          headers={"locale": LOCALE,
                                   "Accept": "application/json",
                                   "Referer": PAGE})
    print(f"   HTTP 200 — anonymous access GRANTED ({'cached' if cached else 'live'})")
    return body


def _devalue(flat):
    """Resolve Nuxt's `__NUXT_DATA__` (devalue) array into plain JSON.

    devalue emits a flat array where every non-primitive is an INDEX into that
    array; index 0 is the root. Cycles are possible, so resolved nodes are
    memoised and a node currently being resolved returns None rather than
    recursing forever.
    """
    memo, busy = {}, set()

    def res(i):
        if not isinstance(i, int) or not (0 <= i < len(flat)):
            return i
        if i in memo:
            return memo[i]
        if i in busy:
            return None
        busy.add(i)
        v = flat[i]
        if isinstance(v, list):
            out = [res(x) for x in v]
        elif isinstance(v, dict):
            out = {k: res(x) for k, x in v.items()}
        else:
            out = v
        busy.discard(i)
        memo[i] = out
        return out

    return res(0)


_NODE_EVAL = r"""
const fs = require("fs"), vm = require("vm");
const src = fs.readFileSync(process.argv[2], "utf8");
// Empty, prototype-less sandbox: no require, no process, no fs, no globals.
const ctx = vm.createContext(Object.create(null));
const out = vm.runInContext("(" + src + ")", ctx, { timeout: 30000 });
process.stdout.write(JSON.stringify(out));
"""


def _eval_nuxt_iife(expr):
    """Evaluate `window.__NUXT__`'s IIFE in a sandboxed Node vm -> dict.

    The payload is a JS expression (a function applied to a long argument
    list used as a string table), so it cannot be JSON-parsed. Node is used
    because it is the only interpreter present that can read it; the sandbox
    has no Node globals and a 30s cap.
    """
    with tempfile.TemporaryDirectory() as td:
        js, runner = os.path.join(td, "p.js"), os.path.join(td, "run.js")
        with open(js, "w", encoding="utf-8") as fh:
            fh.write(expr)
        with open(runner, "w", encoding="utf-8") as fh:
            fh.write(_NODE_EVAL)
        p = subprocess.run(["node", runner, js], capture_output=True,
                           text=True, timeout=120)
    if p.returncode != 0:
        raise SystemExit(f"node failed to read the inlined payload: "
                         f"{p.stderr[:400]}")
    return json.loads(p.stdout)


def ssr_check(f):
    """Read the PUBLIC page and look for an SSR-inlined copy of the payload.

    This is the cheap, un-gated route and it is tried FIRST. The call site is
    `server: true`, so Nuxt fetches the distributor data during SSR and
    normally serialises the result into a `__NUXT_DATA__` block that every
    anonymous visitor receives. If it is there, the data is already public
    HTML: no `/api/` request, no robots override in play, no auth boundary
    touched.

    The page path is `/en-us/contact-us/...`, which no rule in
    `www.pepperl-fuchs.com/robots.txt` matches — the Disallow list covers
    `/api/`, four query-string patterns, `/cgi-bin/` and `/russia/`.
    """
    print(f"\n── SSR check on the public page (robots-allowed, no /api/) ──")
    print(f"   {PAGE}")
    html, cached = f.get(PAGE, "subsidiaries-page.html", timeout=120)
    print(f"   {len(html)} bytes ({'cached' if cached else 'live'})")

    found = {"page_bytes": len(html)}
    root = None

    # Shape A — Nuxt 3: <script id="__NUXT_DATA__"> holding a devalue array.
    m = re.search(
        r'<script[^>]+id="__NUXT_DATA__"[^>]*>(.*?)</script>', html, re.S)
    if m:
        found["payload_shape"] = "__NUXT_DATA__ (devalue)"
        try:
            flat = json.loads(m.group(1))
            found["devalue_nodes"] = len(flat)
            root = _devalue(flat)
        except ValueError as e:
            found["parse_error"] = str(e)

    # Shape B — the one this site actually ships: `window.__NUXT__=(function(
    # a,b,c…){…}(…))`, a self-executing JS expression, not JSON. It is
    # evaluated in a locked-down Node `vm` context with an empty prototype-less
    # sandbox and a timeout — no `require`, no `process`, no filesystem. This
    # is the same evaluation any visiting browser performs on a page we were
    # served; it is not a bypass of anything.
    if root is None:
        m = re.search(r'<script[^>]*>\s*window\.__NUXT__=(.*?)</script>',
                      html, re.S)
        if not m:
            print("   no inlined Nuxt payload of either shape")
            found["payload_shape"] = None
            return None, found
        found["payload_shape"] = "window.__NUXT__ (IIFE)"
        found["payload_bytes"] = len(m.group(1))
        root = _eval_nuxt_iife(m.group(1).strip().rstrip(";"))

    # Walk the resolved tree for the one node that carries `countries`.
    stack, seen, hit = [root], set(), None
    while stack:
        node = stack.pop()
        if id(node) in seen:
            continue
        seen.add(id(node))
        if isinstance(node, dict):
            if isinstance(node.get("countries"), list):
                hit = node
                break
            stack.extend(node.values())
        elif isinstance(node, list):
            stack.extend(node)

    if hit is None:
        print("   __NUXT_DATA__ parsed but carries no `countries` node — the "
              "SSR result was not serialised to the client")
        found["countries_node"] = False
        return None, found

    print(f"   FOUND inlined payload: {len(hit['countries'])} country nodes")
    found["countries_node"] = True
    return {"data": hit}, found


def walk(payload):
    """Payload -> (records, shape_findings). Reports what is measured."""
    data = (payload or {}).get("data") or payload or {}
    countries = data.get("countries")
    if countries is None:
        raise SystemExit(
            "no `countries` key in the payload — the shape changed since the "
            f"bundle was read. Top-level keys: {sorted(data)[:40]}. Stopping "
            "rather than guessing.")

    records, seen = [], set()
    findings = {
        "top_level_keys": sorted((payload or {}).keys()),
        "data_keys": sorted(data.keys()),
        "country_count": len(countries),
        "country_node_keys": sorted(countries[0].keys()) if countries else [],
        "countries_with_rows": 0,
        "us_country_nodes": [],
    }
    for c in countries:
        bucket = (c.get("name") or "").strip() or None
        addrs = c.get("addresses") or []
        resp = c.get("responsibleCompanies") or []
        if addrs or resp:
            findings["countries_with_rows"] += 1
        if (bucket or "").lower() in US_COUNTRY_NAMES:
            findings["us_country_nodes"].append({
                "name": bucket, "code": c.get("code"),
                "addresses": len(addrs), "responsibleCompanies": len(resp)})
            if addrs and not findings.get("us_address_keys"):
                findings["us_address_keys"] = sorted(addrs[0].keys())
                comp = (addrs[0].get("company") or [{}])[0]
                findings["us_company_keys"] = sorted(comp.keys())

        for a in addrs:
            comps = a.get("company") or []
            for comp in comps:
                rec = normalize(comp, a, bucket, "addresses")
                key = (rec.get("pf_id_raw"), norm_company(rec.get("company")),
                       rec.get("address_1"), rec.get("zip_raw"))
                if key in seen:
                    continue
                seen.add(key)
                records.append(rec)
        for comp in resp:
            a = (comp.get("address") or [{}])
            a = a[0] if a else {}
            rec = normalize(comp, a, bucket, "responsibleCompanies")
            key = (rec.get("pf_id_raw"), norm_company(rec.get("company")),
                   rec.get("address_1"), rec.get("zip_raw"))
            if key in seen:
                continue
            seen.add(key)
            records.append(rec)
    return records, findings


def main():
    f = Fetcher(SOURCE, min_bytes=20)

    robots = robots_check(f)

    # Cheapest route first: a public, robots-allowed HTML page. Only if it
    # yields nothing do we spend the gated /api/ request.
    payload, ssr = ssr_check(f)
    try:
        if payload is None:
            payload = access_check(f)
    except Blocked as e:
        # 401/403 => authentication boundary. The R-2 signature covers robots
        # and nothing else, and this is not Artur's to waive. Stop here.
        print(f"\nBLOCKED: {e}")
        print("STOPPING. A robots override is not a credentials override.")
        write_raw(SOURCE, {
            "source_name": "Pepperl+Fuchs Subsidiaries + Distributors",
            "source_url": DATA_URL,
            "locator_page": PAGE,
            "blocked": str(e),
            "blocked_interpretation":
                "401/403 to an anonymous, honestly-identified, paced request is "
                "an authentication boundary. The pack excludes those by policy "
                "and GATE R-2's signature explicitly does not reach it. No "
                "bypass attempted: no credential hunting, no token extraction, "
                "no session replay, no UA rotation, no header spoofing.",
            "robots_verbatim": robots,
            "ssr_check": ssr,
            # `Fetcher.origin_requests` only increments on a 2xx, so the
            # refused request is invisible to it. Reported PHYSICALLY — the
            # request happened, and a count that hides it is the same class of
            # error as netting Continental's five retried 400s down to one.
            "origin_requests": f.origin_requests,
            "origin_requests_physical": f.origin_requests + 1,
            "origin_requests_note":
                "2 physical requests total: robots.txt (200) and one access "
                "check (403). The 403 was not retried — _polite.py raises "
                "Blocked on a deterministic 4xx at the first attempt.",
        }, [])
        return

    records, findings = walk(payload)
    print(f"\n── shape (MEASURED from the payload, not from the bundle) ──")
    print(json.dumps(findings, indent=1)[:3000])

    code_fields = ("type_raw", "record_shape", "contact_types_raw",
                   "country_raw", "listed_under_country_raw")
    stats = report(SOURCE, records, code_fields=code_fields)

    us = [r for r in records if r.get("is_us")]
    stats["global_records"] = len(records)
    stats["countries_in_payload"] = findings["country_count"]
    stats["countries_with_rows"] = findings["countries_with_rows"]
    stats["us_distinct_domains"] = len({r["domain"] for r in us if r.get("domain")})

    write_raw(SOURCE, {
        "source_name": "Pepperl+Fuchs — Subsidiaries + Distributors "
                       "(/api/protected/distributorsData)",
        "source_url": DATA_URL,
        "locator_page": PAGE,
        "method": "The page is Nuxt; its cached 1.8 MB bundle names exactly one "
                  "data call in the SubsidiariesAndDistributors component — "
                  "useFetch('/api/protected/distributorsData', {server:true, "
                  "headers:{locale: graphLocale}}). The bundle's own locale map "
                  "resolves the US site to graphLocale 'en-US'. The component "
                  "loads every country in one response and filters client-side, "
                  "so the complete global pull is ONE GET. No paging, no metro "
                  "grid, no browser.",
        "robots_check":
            "NO OVERRIDE WAS USED, and none was needed. The data came from "
            "https://www.pepperl-fuchs.com/en-us/contact-us/view-all-"
            "subsidiaries-distributors-gp27595, a public HTML page. "
            "www.pepperl-fuchs.com/robots.txt disallows /api/, four "
            "query-string patterns, /cgi-bin/ and /russia/ — no rule matches a "
            "/en-us/contact-us/ path. Re-fetched and recorded verbatim on the "
            "day of the pull. GATE R-2 (SIGNED YES, Artur 2026-08-04) was "
            "available and went UNUSED: the gated /api/ path answered 403 and "
            "the un-gated page carried the same payload.",
        "robots_verbatim": robots,
        "credential_check":
            "THE ANONYMOUS ACCESS CHECK FAILED: HTTP 403 on "
            "/api/protected/distributorsData, to an honest, paced, un-rotated "
            "request. Under pack policy that is an authentication boundary, so "
            "the API route was abandoned — no credential hunting, no token "
            "extraction, no session replay, no UA rotation, no header spoofing, "
            "and no retry (the 403 raised Blocked at the first attempt). The "
            "R-2 signature covers the robots directive only and is not Artur's "
            "to extend to an auth wall. Consistent with `server: true`: this "
            "route is called by P+F's own SSR process, not by visiting "
            "browsers, so an external client is not an intended caller of it. "
            "The records in this payload came from the public page instead, "
            "which crosses no boundary at all.",
        "ssr_note":
            "`server: true` means Nuxt fetches during SSR and serialises the "
            "result to the client. It does — as `window.__NUXT__=(function(a,b,"
            "c…){…}(…))`, a 904 KB self-executing JS expression in the public "
            "page, NOT the Nuxt 3 `__NUXT_DATA__` devalue block a first pass "
            "looks for. A check for only the Nuxt 3 shape reports 'not inlined' "
            "and is wrong. Evaluated in a sandboxed Node vm (empty "
            "prototype-less context, no require/process, 30s cap) — the same "
            "evaluation any visiting browser performs.",
        "codes_captured_verbatim": list(code_fields) + [
            "sort_order_raw", "pf_id_raw", "state_raw",
            "general/fa/pa email+phone+fax", "x_*_raw and xa_*_raw "
            "(every other payload scalar)"],
        "record_shape_note":
            "Two nesting shapes, both carried and labelled in `record_shape`: "
            "countries[].addresses[] (a location with company[0] attached) and "
            "countries[].responsibleCompanies[] (a company with address[0] "
            "attached, listed under the country it COVERS). `is_us` is taken "
            "from each row's own address country, never from the bucket.",
        "probe": findings,
        "ssr_check": ssr,
        "origin_requests": f.origin_requests,
        "origin_requests_cold": len(os.listdir(f.cache)),
        "stats": stats,
    }, records)
    write_csv(records)


def write_csv(records):
    """Sibling .csv in the shape the other locator payloads use."""
    path = os.path.join(_polite.RAW, f"{SOURCE}-{CAPTURED}.csv")
    cols = []
    for r in records:
        for k in r:
            if k not in cols:
                cols.append(k)
    with open(path, "w", newline="", encoding="utf-8") as fh:
        wr = csv.DictWriter(fh, fieldnames=cols, extrasaction="ignore")
        wr.writeheader()
        wr.writerows(records)
    print(f"csv -> {path}  ({len(records)} records, {len(cols)} columns)")
    return path


if __name__ == "__main__":
    main()
