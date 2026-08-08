#!/usr/bin/env python3
"""E4 Step 0+1 evidence sweep — robots posture, terms, and one honest fingerprint GET.

Per `e4-headless-locators [NOT-BUILT]/01-prompt.md`:

  Step 0 — read each target's robots.txt and terms page (the way kennametal.py
  recorded its T&C check) and write down what they say about the specific path
  a render would hit. GATE:HUMAN per locator BEFORE building; this script only
  gathers the evidence the gate needs.
  Step 1 — a source fingerprint has a shelf life (Matthews went 200 → 403 in a
  day). One honest GET per target, record the status, confirm the stack.

Request budget per host: robots.txt + locator page + (terms page if linked)
= ≤3 requests, paced ≥3s by `_polite.Fetcher`. No renders happen here; no data
endpoints are probed. 403/404/429 are recorded as findings, never worked around.
"""
import json
import os
import re
import sys
import urllib.parse

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402
from _polite import Blocked, Fetcher  # noqa: E402

# Capture date. Overridable so a later session can re-sweep NEW targets without
# restamping the 2026-08-03 evidence file (the per-target disk cache is keyed by
# target, not by date, so a blind bump would relabel cached bodies with a date
# they were not captured on).
_polite.CAPTURED = os.environ.get("E4_CAPTURED", "2026-08-03")

TARGETS = [
    # (key, tier, locator URL, segment, stack note from research/01)
    ("banner", "E4", "https://www.bannerengineering.com/us/en/where-to-buy.html",
     "automation/sensors", "AEM + Google Maps; explicit dealer tiers; reCAPTCHA on forms not map"),
    ("skf", "E4", "https://www.skf.com/us/support/find-a-distributor",
     "bearings/PT", "Angular SPA, 810KB bundle, API path obfuscated"),
    ("festo", "E4", "https://distributorlocator.festo.com/?locale=us-en",
     "fluid power", "SPA on dedicated subdomain, 1.6KB shell"),
    ("lincolnelectric", "E4",
     "https://mylincoln.lincolnelectric.com/northamerica/s/store-locator?language=en_US",
     "welding", "Salesforce Experience Cloud, public no-login"),
    ("boschrexroth", "E4", "https://www.boschrexroth.com/en/us/contact/contact-locator/",
     "fluid power", "JS-rendered; mixes own sites with partners"),
    ("pepperlfuchs", "E4",
     "https://www.pepperl-fuchs.com/en-us/support/customer-service/where-to-buy-gp62134",
     "automation/sensors", "Nuxt SPA, 890KB bundle"),
    ("continental", "E4",
     "https://www.continental-industry.com/global/en/about-us/tools-services/distributor-locator",
     "hose & fittings", "JS + Google Maps, 5.8KB shell"),
    ("waltersurface", "E4", "https://www.walter.com/us/where-to-buy",
     "cutting/abrasives", "JS widget"),
    # Adjacent non-headless (cheaper-win list from the same handoff)
    ("sullair", "adjacent", "https://america.sullair.com/en/distributors",
     "compressors", "Drupal 10; page references distributor CSV files"),
    ("aro", "adjacent", "https://www.arozone.com/en/distributor-search/",
     "pumps & valves (fluid power)", "Vercel; 429 throttle = pace signal"),
    ("miller", "adjacent", "https://www.millerwelds.com/where-to-buy",
     "welding", "Vercel; 429 throttle; ?product_name= supported"),
    ("ingersollrand", "adjacent", "https://www.ingersollrand.com/en-us/distributor-search/",
     "compressors", "429 throttle; branch pages at locations.ingersollrand.com"),
    # ── equipment-dealers (ICP-EQ signed 2026-08-04; per-OEM robots gate still applies) ──
    # JLG is EXCLUDED — it already 403s and is deliberately absent from this map.
    ("bobcat", "E4-eq", "https://www.bobcat.com/dealer",
     "compact equipment dealers", "JS shell, zero names in raw HTML (2026-08-03)"),
    ("kubota", "E4-eq", "https://www.kubotausa.com/regional-dealers",
     "ag/compact equipment dealers", "JS shell, zero names; 1,100+ US dealers claimed"),
    ("caseih", "E4-eq", "https://www.caseih.com/en-us/unitedstates/dealer-locator",
     "ag equipment dealers", "JS shell, zero names (2026-08-03)"),
]

TERMS_LINK_RE = re.compile(
    r'href="([^"]*(?:terms|legal|conditions)[^"]*)"', re.IGNORECASE)
# API-ish namespaces worth flagging when a robots Disallow could cover a data path
API_HINT_RE = re.compile(
    r'["\'](/(?:api|bin|ws|wp-json|ccstorex?|graphql|services|webapi|rest|ajax|admin-ajax)[^"\']*)["\']',
    re.IGNORECASE)
BUNDLE_RE = re.compile(r'(?:src|href)="([^"]+\.(?:js|mjs))(?:\?[^"]*)?"', re.IGNORECASE)


def host_of(url):
    return urllib.parse.urlparse(url).netloc


def parse_robots(text):
    """Return [(agent, [(kind, path), ...])] blocks."""
    blocks, agent, rules = [], None, []
    for raw in text.splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line:
            continue
        m = re.match(r"(?i)user-agent\s*:\s*(.+)", line)
        if m:
            if agent is not None and rules:
                blocks.append((agent, rules))
                agent, rules = m.group(1).strip(), []
            elif agent is None:
                agent = m.group(1).strip()
            else:  # consecutive user-agent lines share the coming rule block
                agent = agent + ", " + m.group(1).strip()
            continue
        m = re.match(r"(?i)(dis)?allow\s*:\s*(.*)", line)
        if m:
            if agent is None:
                continue
            rules.append(("Disallow" if m.group(1) else "Allow", m.group(2).strip()))
            continue
        if re.match(r"(?i)(sitemap|crawl-delay)\s*:", line) and agent is not None:
            rules.append(("Meta", line))
    if agent is not None and rules:
        blocks.append((agent, rules))
    return blocks


def robots_path_matches(rule_path, url_path):
    """RFC 9309 prefix match, with * wildcard and $ anchor."""
    if not rule_path:
        return False
    pat = re.escape(rule_path).replace(r"\*", ".*")
    if pat.endswith(r"\$"):
        pat = pat[:-2] + "$"
    return re.match(pat, url_path) is not None


def sweep(key, tier, url, segment, stack_note):
    f = Fetcher(f"e4evidence-{key}", min_bytes=1)
    origin = f"{urllib.parse.urlparse(url).scheme}://{host_of(url)}"
    out = {
        "key": key, "tier": tier, "segment": segment, "locator_url": url,
        "stack_note_2026_08_01": stack_note, "captured": _polite.CAPTURED,
        "origin": origin,
    }

    # 1) robots.txt
    try:
        body, cached = f.get(origin + "/robots.txt", "robots.txt")
        out["robots_status"] = "200"
        out["robots_bytes"] = len(body)
        blocks = parse_robots(body)
        star = [(a, r) for a, r in blocks if "*" in a]
        out["robots_star_rules"] = [
            f"{kind}: {p}" for a, rules in star for kind, p in rules]
        out["robots_named_agents"] = sorted({a for a, _ in blocks if "*" not in a})
        loc_path = urllib.parse.urlparse(url).path or "/"
        q = urllib.parse.urlparse(url).query
        loc_full = loc_path + ("?" + q if q else "")
        # RFC 9309 §2.2.2: the MOST SPECIFIC (longest) matching rule wins. A bare
        # `Disallow: /` beside `Allow: /northamerica/s` does NOT disallow
        # /northamerica/s/… — Lincoln Electric is exactly that shape, and a
        # naive "any Disallow matches" check reads it backwards.
        best = None
        for _a, rules in star:
            for kind, p in rules:
                if kind not in ("Allow", "Disallow"):
                    continue
                if robots_path_matches(p, loc_path) or robots_path_matches(p, loc_full):
                    if best is None or len(p) > len(best[1]):
                        best = (kind, p)
        out["robots_locator_page_verdict"] = (
            "allowed — no matching rule" if best is None else f"{best[0]} by `{best[1]}`")
        out["robots_locator_page_disallowed_by"] = (
            [f"{best[0]}: {best[1]}"] if best and best[0] == "Disallow" else [])
        out["robots_all_matching_rules"] = [
            f"{kind}: {p}" for _a, rules in star for kind, p in rules
            if kind in ("Allow", "Disallow") and
            (robots_path_matches(p, loc_path) or robots_path_matches(p, loc_full))]
        api_flags = [f"{kind}: {p}" for a, rules in star for kind, p in rules
                     if kind == "Disallow" and re.search(
                         r"(?i)api|/bin|ws/|json|ajax|graphql|ccstore|service|search|locator|store|dealer|distributor|find",
                         p)]
        out["robots_api_suspect_disallows"] = api_flags
    except Blocked as e:
        out["robots_status"] = str(e)
    except Exception as e:  # noqa: BLE001
        out["robots_status"] = f"ERR {e!r}"

    # 2) locator page — the one honest fingerprint GET (Step 1)
    try:
        body, cached = f.get(url, "locator.html")
        out["locator_status"] = "200"
        out["locator_bytes"] = len(body)
        out["locator_cached"] = cached
        low = body.lower()
        markers = []
        for sig, label in [
            ("wp-content", "WordPress"), ("wpgmza", "WPGMZA"),
            ("drupal", "Drupal"), ("/etc.clientlibs", "AEM clientlibs"),
            ("nuxt", "Nuxt"), ("ng-version", "Angular"), ("data-reactroot", "React"),
            ("sitecore", "Sitecore"), ("salesforce", "Salesforce"),
            ("aura", "SF Aura"), ("webruntime", "SF LWR"),
            ("oracle-cc", "Oracle CC"), ("recaptcha", "reCAPTCHA"),
            ("cloudflare", "Cloudflare"), ("akamai", "Akamai"),
            ("maps.googleapis", "Google Maps"), ("leaflet", "Leaflet"),
            ("storelocatorwidgets", "SLW SaaS"), ("metalocator", "MetaLocator"),
            ("bullseye", "Bullseye"),
        ]:
            if sig in low:
                markers.append(label)
        out["stack_markers"] = markers
        out["api_hints_in_shell"] = sorted(set(API_HINT_RE.findall(body)))[:25]
        out["script_bundles"] = BUNDLE_RE.findall(body)[:15]
        terms = [t for t in TERMS_LINK_RE.findall(body)
                 if not t.lower().endswith((".css", ".js"))]
        seen, uniq = set(), []
        for t in terms:
            if t not in seen:
                seen.add(t)
                uniq.append(t)
        out["terms_links_found"] = uniq[:8]
    except Blocked as e:
        out["locator_status"] = str(e)
    except Exception as e:  # noqa: BLE001
        out["locator_status"] = f"ERR {e!r}"

    # 3) terms page — first discovered link, one fetch
    terms_url = None
    for t in out.get("terms_links_found", []):
        tu = urllib.parse.urljoin(url, t)
        if tu.startswith("http"):
            terms_url = tu
            break
    if terms_url:
        out["terms_url"] = terms_url
        try:
            tbody, _ = f.get(terms_url, "terms.html")
            out["terms_status"] = "200"
            tlow = re.sub(r"<[^>]+>", " ", tbody).lower()
            clauses = []
            for pat, label in [
                (r"(?:automated|robot\b|spider|crawl\w*|scrap\w*)", "automation/scraping language"),
                (r"data\s*min\w+", "data mining language"),
                (r"terms\s+(?:and\s+conditions\s+)?of\s+sale", "terms OF SALE"),
                (r"terms\s+of\s+use|website\s+terms|site\s+use", "site-use terms"),
            ]:
                m = re.search(pat, tlow)
                if m:
                    i = max(0, m.start() - 160)
                    snippet = " ".join(tlow[i:m.end() + 240].split())
                    clauses.append({"label": label, "context": snippet[:400]})
            out["terms_clauses"] = clauses
        except Blocked as e:
            out["terms_status"] = str(e)
        except Exception as e:  # noqa: BLE001
            out["terms_status"] = f"ERR {e!r}"
    else:
        out["terms_url"] = None
        out["terms_status"] = "no terms link discovered on locator page"

    out["origin_requests"] = f.origin_requests
    return out


def main():
    only = set(sys.argv[1:])
    results = []
    for key, tier, url, segment, note in TARGETS:
        if only and key not in only:
            continue
        print(f"\n=== {key} ({tier}) — {url}", flush=True)
        r = sweep(key, tier, url, segment, note)
        print(f"  robots: {str(r.get('robots_status', '?'))[:120]}")
        print(f"  locator: {str(r.get('locator_status', '?'))[:120]} "
              f"bytes={r.get('locator_bytes', '-')} markers={r.get('stack_markers', [])}")
        print(f"  locator-page disallowed by: {r.get('robots_locator_page_disallowed_by', [])}")
        print(f"  api-suspect disallows: {r.get('robots_api_suspect_disallows', [])[:8]}")
        print(f"  terms: {str(r.get('terms_status', '?'))[:120]}")
        results.append(r)

    out_path = os.path.join(_polite.RAW, f"e4-evidence-{_polite.CAPTURED}.json")
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump({"source": "e4-evidence", "captured": _polite.CAPTURED,
                   "targets": results}, fh, indent=1)
    print(f"\nevidence -> {out_path}")


if __name__ == "__main__":
    main()
