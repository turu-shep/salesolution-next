#!/usr/bin/env python3
"""linecard-locators evidence pass — robots, re-validation, transport discovery.

Per `linecard-locators [NOT-STARTED]/01-prompt.md` step 1, first half: before
any query is submitted, each target gets (a) its robots.txt read per origin
with RFC 9309 longest-match — reusing `_e4_evidence.parse_robots` /
`robots_path_matches`, the exact code that caught the Lincoln Electric
false-alarm — (b) one honest re-validation GET of the locator page (§5i: a
fingerprint from yesterday has a shelf life), and (c) static transport
discovery: forms with their fields, every <select> with its options VERBATIM
(Samson's 16-option industry filter is a required capture), API-path hints,
data-* config attributes, and for JS-rendered suspects up to two same-host app
bundles grepped for endpoint strings — the `_e4_bundles` method: name the data
path without rendering anything.

NO probe query is submitted by this script. The one-query probes run
separately, informed by this file's output, and only against paths this
file's robots verdicts permit (log §1 rule; an unsigned per-site override
is a NO — Artur offline).

Request budget per host: robots (1) + locator page (1) + terms page if linked
(≤1) + bundles (≤2) = ≤5, paced ≥3s by `_polite.Fetcher`, all cached. 403/404
recorded as findings, never worked around.
"""
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from html.parser import HTMLParser

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402

_polite.CAPTURED = "2026-08-03"

from _polite import Blocked, Fetcher  # noqa: E402
from _e4_evidence import (API_HINT_RE, BUNDLE_RE, TERMS_LINK_RE,  # noqa: E402
                          parse_robots, robots_path_matches)

CAPTURED = _polite.CAPTURED

# (key, locator URL, segment, what the 2026-08-03 validation session recorded)
TARGETS = [
    ("flexco", "https://flexco.com/NA/EN/Flexco/Contact-Us/Distributors.htm",
     "belting / conveyor",
     "server-rendered search UI: postal + radius + ANY-DISTANCE option + "
     "distributor-name field"),
    ("samsonrope", "https://samsonrope.com/resources/find-a-distributor",
     "rope / rigging",
     "server-rendered form with a 16-option industry filter — capture it "
     "verbatim (§5i vertical-code rule)"),
    ("cmco", "https://www.cmco.com/en-us/how-to-buy/",
     "lifting / rigging",
     "JS-rendered, nav-only in raw HTML; carries 'CM Authorized Rigging "
     "Centers' tier; separate service-repair-centers locator to compare"),
    ("indsci", "https://www.indsci.com/en/where-to-buy",
     "gas detection / safety",
     "two empty list containers in the shell — test whether the full list "
     "arrives on render with no query"),
    # Optional pair — evidence only here; queries run only if the four above
    # finish fast (01-prompt.md step 1).
    ("chromalox", "https://www.chromalox.com/locate-a-rep",
     "heating (reps, discounted)",
     "skews manufacturer REPS, not distributors — a rep firm is not our buyer"),
    ("zoeller", "https://zoellerpumps.com/locations",
     "pumps (plumbing, discounted)",
     "easiest build here, but plumbing drifts off-ICP"),
]

# Vendor bundles that never hold the app's own endpoints — not worth a fetch.
BUNDLE_SKIP_RE = re.compile(
    r"jquery|vendor|polyfill|gtm|gtag|analytics|cookie|consent|recaptcha|"
    r"bootstrap|modernizr|swiper|slick|font", re.IGNORECASE)
BUNDLE_WANT_RE = re.compile(
    r"app|main|bundle|runtime|locator|where|dist|find|search|site|theme|"
    r"script", re.IGNORECASE)

ENDPOINT_RE = re.compile(
    r'["\'](?:(https?://[^"\'\s]{8,200})|(/[A-Za-z0-9_\-/\.]{2,120}?'
    r'(?:api|locator|dealer|distributor|stockist|store|where|search|ajax|'
    r'json|graphql|rest|service)[A-Za-z0-9_\-/\.]{0,80}))["\']',
    re.IGNORECASE)

DATA_ATTR_RE = re.compile(
    r'\sdata-[a-z0-9\-]*(?:url|endpoint|api|src|action|service)[a-z0-9\-]*'
    r'\s*=\s*["\'][^"\']{4,200}["\']', re.IGNORECASE)

REDIRECTS = {}


class _RecordingRedirect(urllib.request.HTTPRedirectHandler):
    """Same behaviour as the default handler; also records each hop so the
    final host is known and its robots can be read too (per-origin rule)."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        REDIRECTS.setdefault(req.full_url, []).append((code, newurl))
        return super().redirect_request(req, fp, code, msg, headers, newurl)


urllib.request.install_opener(
    urllib.request.build_opener(_RecordingRedirect))


class FormParser(HTMLParser):
    """Every <form> with its fields; every <select> with its options VERBATIM
    (value + label), inside a form or not. Lenient by construction."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.forms = []
        self.selects = []          # selects seen anywhere, incl. outside forms
        self._form = None
        self._select = None
        self._option = None        # (value, label-chars)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "form":
            self._form = {"action": a.get("action"),
                          "method": (a.get("method") or "GET").upper(),
                          "id": a.get("id"), "name": a.get("name"),
                          "fields": []}
        elif tag in ("input", "button", "textarea"):
            field = {"tag": tag, "type": a.get("type"), "name": a.get("name"),
                     "id": a.get("id"), "value": a.get("value"),
                     "placeholder": a.get("placeholder")}
            if self._form is not None:
                self._form["fields"].append(field)
        elif tag == "select":
            self._select = {"name": a.get("name"), "id": a.get("id"),
                            "multiple": "multiple" in a, "options": []}
        elif tag == "option" and self._select is not None:
            self._option = [a.get("value"), ""]

    def handle_data(self, data):
        if self._option is not None:
            self._option[1] += data

    def handle_endtag(self, tag):
        if tag == "option" and self._select is not None and self._option:
            value, label = self._option
            self._select["options"].append(
                {"value": value, "label": " ".join(label.split())})
            self._option = None
        elif tag == "select" and self._select is not None:
            self.selects.append(self._select)
            if self._form is not None:
                self._form["fields"].append(
                    {"tag": "select", **self._select})
            self._select = None
        elif tag == "form" and self._form is not None:
            self.forms.append(self._form)
            self._form = None


def origin_of(url):
    p = urllib.parse.urlparse(url)
    return f"{p.scheme}://{p.netloc}"


def robots_verdict(f, origin, url_path, out, prefix=""):
    """Read an origin's robots.txt; verdict for url_path under longest match."""
    key = f"{prefix}robots"
    try:
        body, _ = f.get(origin + "/robots.txt", f"{prefix}robots.txt")
        out[f"{key}_status"] = "200"
        out[f"{key}_bytes"] = len(body)
        blocks = parse_robots(body)
        star = [(a, r) for a, r in blocks if "*" in a]
        out[f"{key}_star_rules"] = [
            f"{kind}: {p}" for _a, rules in star for kind, p in rules][:60]
        best = None
        for _a, rules in star:
            for kind, p in rules:
                if kind not in ("Allow", "Disallow"):
                    continue
                if robots_path_matches(p, url_path):
                    if best is None or len(p) > len(best[1]):
                        best = (kind, p)
        out[f"{key}_verdict_on_path"] = (
            "allowed — no matching rule" if best is None
            else f"{best[0]} by `{best[1]}`")
        out[f"{key}_path_disallowed"] = bool(best and best[0] == "Disallow")
        out[f"{key}_api_suspect_disallows"] = [
            f"{p}" for _a, rules in star for kind, p in rules
            if kind == "Disallow" and re.search(
                r"(?i)api|/bin|ws/|json|ajax|graphql|service|search|locator|"
                r"store|dealer|distributor|find|where", p)][:15]
    except Blocked as e:
        out[f"{key}_status"] = str(e)
        out[f"{key}_path_disallowed"] = False   # no stated preference
    except Exception as e:  # noqa: BLE001
        out[f"{key}_status"] = f"ERR {e!r}"
        out[f"{key}_path_disallowed"] = False


def sweep(key, url, segment, note):
    f = Fetcher(f"linecard-{key}", min_bytes=1)
    origin = origin_of(url)
    path = urllib.parse.urlparse(url).path or "/"
    out = {"key": key, "segment": segment, "locator_url": url,
           "validation_note_2026_08_03": note, "captured": CAPTURED,
           "origin": origin}

    # 1) robots.txt on the origin as addressed
    robots_verdict(f, origin, path, out)

    # 2) the locator page — one honest re-validation GET
    try:
        body, cached = f.get(url, "locator.html")
        out["locator_status"] = "200"
        out["locator_bytes"] = len(body)
        out["locator_cached"] = cached
        hops = REDIRECTS.get(url, [])
        out["redirect_hops"] = [f"{c} -> {u}" for c, u in hops]
        final_url = hops[-1][1] if hops else url
        out["final_url"] = final_url
        final_origin = origin_of(final_url)
        # per-origin rule: if the page landed on another host, read that
        # host's robots too — its rules govern the requests we'd make there.
        if final_origin != origin:
            robots_verdict(f, final_origin,
                           urllib.parse.urlparse(final_url).path or "/",
                           out, prefix="final_")

        low = body.lower()
        markers = []
        for sig, label in [
            ("wp-content", "WordPress"), ("wpgmza", "WPGMZA"),
            ("drupal", "Drupal"), ("/etc.clientlibs", "AEM clientlibs"),
            ("nuxt", "Nuxt"), ("ng-version", "Angular"),
            ("data-reactroot", "React"), ("__next", "Next.js"),
            ("sitecore", "Sitecore"), ("salesforce", "Salesforce"),
            ("aura", "SF Aura"), ("webruntime", "SF LWR"),
            ("kentico", "Kentico"), ("sitefinity", "Sitefinity"),
            ("umbraco", "Umbraco"), ("__viewstate", "ASP.NET WebForms"),
            ("hs-scripts", "HubSpot"), ("shopify", "Shopify"),
            ("recaptcha", "reCAPTCHA"), ("cloudflare", "Cloudflare"),
            ("akamai", "Akamai"), ("maps.googleapis", "Google Maps"),
            ("leaflet", "Leaflet"), ("storelocatorwidgets", "SLW SaaS"),
            ("metalocator", "MetaLocator"), ("bullseye", "Bullseye"),
            ("storemapper", "Storemapper"), ("storepoint", "Storepoint"),
            ("stockist", "Stockist"),
        ]:
            if sig in low:
                markers.append(label)
        out["stack_markers"] = markers

        fp = FormParser()
        try:
            fp.feed(body)
        except Exception as e:  # noqa: BLE001 — keep whatever parsed
            out["form_parse_note"] = f"parser stopped early: {e!r}"
        out["forms"] = fp.forms
        out["selects_verbatim"] = fp.selects
        out["api_hints_in_shell"] = sorted(set(
            API_HINT_RE.findall(body)))[:30]
        out["data_attr_hints"] = sorted(set(
            m.strip() for m in DATA_ATTR_RE.findall(body)))[:30]
        out["script_bundles"] = BUNDLE_RE.findall(body)[:25]

        terms = [t for t in TERMS_LINK_RE.findall(body)
                 if not t.lower().endswith((".css", ".js"))]
        out["terms_links_found"] = list(dict.fromkeys(terms))[:6]

        # 3) bundle sniff — JS-rendered suspects only, ≤2 same-host app bundles
        endpoints = set()
        if key in ("cmco", "indsci") or not (fp.forms or fp.selects):
            picked = []
            for b in out["script_bundles"]:
                bu = urllib.parse.urljoin(final_url, b)
                if urllib.parse.urlparse(bu).netloc != \
                        urllib.parse.urlparse(final_origin).netloc:
                    continue
                if BUNDLE_SKIP_RE.search(bu):
                    continue
                if BUNDLE_WANT_RE.search(bu):
                    picked.append(bu)
                if len(picked) == 2:
                    break
            out["bundles_fetched"] = picked
            for i, bu in enumerate(picked):
                try:
                    js, _ = f.get(bu, f"bundle-{i}.js")
                    for m in ENDPOINT_RE.finditer(js):
                        endpoints.add(m.group(1) or m.group(2))
                except Blocked as e:
                    out.setdefault("bundle_errors", []).append(str(e))
                except Exception as e:  # noqa: BLE001
                    out.setdefault("bundle_errors", []).append(repr(e))
        # inline scripts get the same grep — free, no extra request
        for m in ENDPOINT_RE.finditer(body):
            endpoints.add(m.group(1) or m.group(2))
        noise = re.compile(
            r"(?i)google|gstatic|facebook|linkedin|twitter|youtube|vimeo|"
            r"cookie|consent|gtm|analytics|doubleclick|schema\.org|w3\.org|"
            r"typekit|fonts|cdn-cgi|hotjar|hubspot|marketo|pardot")
        out["endpoint_hints"] = sorted(
            e for e in endpoints if e and not noise.search(e))[:40]

        # 4) terms page — first same-site link, one fetch
        turl = None
        for t in out["terms_links_found"]:
            cand = urllib.parse.urljoin(final_url, t)
            if cand.startswith("http"):
                turl = cand
                break
        if turl:
            out["terms_url"] = turl
            try:
                tbody, _ = f.get(turl, "terms.html")
                tlow = re.sub(r"<[^>]+>", " ", tbody).lower()
                clauses = []
                for pat, label in [
                    (r"(?:automated|robot\b|spider|crawl\w*|scrap\w*)",
                     "automation/scraping language"),
                    (r"data\s*min\w+", "data mining language"),
                ]:
                    m = re.search(pat, tlow)
                    if m:
                        i = max(0, m.start() - 160)
                        clauses.append({"label": label, "context": " ".join(
                            tlow[i:m.end() + 240].split())[:400]})
                out["terms_status"] = "200"
                out["terms_clauses"] = clauses
            except Blocked as e:
                out["terms_status"] = str(e)
            except Exception as e:  # noqa: BLE001
                out["terms_status"] = f"ERR {e!r}"
        else:
            out["terms_status"] = "no terms link discovered on locator page"

    except Blocked as e:
        out["locator_status"] = str(e)   # 403 = the target stops here, recorded
    except Exception as e:  # noqa: BLE001
        out["locator_status"] = f"ERR {e!r}"

    out["origin_requests"] = f.origin_requests
    return out


def main():
    only = set(sys.argv[1:])
    results = []
    for key, url, segment, note in TARGETS:
        if only and key not in only:
            continue
        print(f"\n=== {key} — {url}", flush=True)
        r = sweep(key, url, segment, note)
        print(f"  robots on path : "
              f"{r.get('robots_verdict_on_path', r.get('robots_status', '?'))}")
        if "final_robots_verdict_on_path" in r:
            print(f"  final-host robots: {r['final_robots_verdict_on_path']}")
        print(f"  page           : {str(r.get('locator_status', '?'))[:100]} "
              f"bytes={r.get('locator_bytes', '-')} "
              f"redirects={r.get('redirect_hops', [])}")
        print(f"  stack          : {r.get('stack_markers', [])}")
        print(f"  forms          : {len(r.get('forms', []))} "
              f"selects={len(r.get('selects_verbatim', []))}")
        print(f"  endpoint hints : {r.get('endpoint_hints', [])[:12]}")
        print(f"  terms          : {str(r.get('terms_status', '?'))[:80]}")
        results.append(r)

    out_path = os.path.join(_polite.RAW, f"linecard-evidence-{CAPTURED}.json")
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump({"source": "linecard-evidence", "captured": CAPTURED,
                   "session": "linecard-locators 01-prompt.md step 1 "
                              "(evidence half — no queries submitted)",
                   "targets": results}, fh, indent=1)
    print(f"\nevidence -> {out_path}")


if __name__ == "__main__":
    main()
