#!/usr/bin/env python3
"""equipment-dealers Step 2 + Step 3 — bundle sniff and PER-HOST robots verdicts.

The ICP gate (**ICP-EQ**) is signed: franchised single-line equipment dealers are
in scope, **1–4-location tail only**, parts-counter angle
(`00-sourcing-strategy.md` §9, Artur, 2026-08-04). **That signature is not a
robots decision.** `01-prompt.md` Step 3 still asks the robots question per OEM,
and this file is the evidence that answers it.

Method inherited verbatim from `_e4_bundles2.py` / `02-robots-posture-2026-08-03.md`:

  1. **robots.txt is per-origin (RFC 9309).** The rules that govern a request are
     the rules published by *the host being requested* — and E4 proved the data
     host is frequently NOT the www host (Banner, Festo, Bosch Rexroth). Anyone
     who reads only `www.*/robots.txt` gets those targets backwards.
  2. **Longest match wins (RFC 9309 §2.2.2).** A bare `Disallow: /` beside an
     `Allow: /x` does not disallow `/x/...`. This rule caught a false alarm on
     Lincoln Electric on 2026-08-03 and is applied here too.
  3. **Find the data path statically, before rendering anything.** Reading the
     page's own JS costs one GET and pre-empts the hazard §7.1 named: a render
     whose *page* is permitted while its XHR hits a disallowed path.

Posture, unchanged: one worker, >=3s per host, honest desktop UA never rotated,
every response cached to disk, **401/403 stops that target — no retry, no UA
rotation, no host switching, no stealth.** JLG is not in this file at all: it
403s and that is a decision, not an obstacle.

**Kubota is deliberately absent from the fetch plan.** `www.kubotausa.com/robots.txt`
is 27 bytes — `User-Agent: * / Disallow: /` — a whole-host disallow of exactly the
Banner shape. Its `/_next/static/chunks/*` bundles are inside that disallow, so
there is no compliant way to read its bundle, and the target stops at the gate
(GATE R-EQ-1). What we know about Kubota comes from the locator HTML captured
before the robots file was read, re-read here **from cache, with zero new
requests**, so the finding is recorded rather than re-earned.
"""
import json
import os
import re
import sys
import urllib.parse

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402
from _polite import RAW, Blocked  # noqa: E402

_polite.CAPTURED = "2026-08-04"
CAPTURED = _polite.CAPTURED

from _e4_bundles2 import BinFetcher  # noqa: E402

OUT = os.path.join(RAW, f"eq-evidence-{CAPTURED}.json")

# ── the fetch plan ───────────────────────────────────────────────────────────
# Bundles first (they name the data host), then that host's robots.txt. Every
# host we intend to touch appears here with its own robots read; nothing is
# fetched from a host whose robots file we have not read on that host.
BUNDLES = {
    "bobcat": [
        # Nuxt modern build; the dealer widget is a "Coveo Search" section whose
        # public search key is inlined in the anonymous page.
        "https://dxp-static.bobcat.com/30d0e62.modern.js",
        "https://dxp-static.bobcat.com/3ee1b44.modern.js",
        "https://dxp-static.bobcat.com/4ffcf0a.modern.js",
        "https://dxp-static.bobcat.com/3cb7be2.modern.js",
        "https://dxp-static.bobcat.com/49a833e.modern.js",
        "https://dxp-static.bobcat.com/46cee97.modern.js",
        "https://dxp-static.bobcat.com/f128744.modern.js",
        "https://dxp-static.bobcat.com/2c89e81.modern.js",
        "https://dxp-static.bobcat.com/edb016e.modern.js",
        "https://dxp-static.bobcat.com/553a95e.modern.js",
    ],
    "caseih": [
        # Sitecore JSS + Apollo. main.js is a webpack runtime; the initial chunk
        # set it awaits is [20, 416, 51, 259] with hashes from its own t.u map.
        "https://www.caseih.com/dist/caseih/static/js/20.1196c007.chunk.js",
        "https://www.caseih.com/dist/caseih/static/js/416.0a3a6b8b.chunk.js",
        "https://www.caseih.com/dist/caseih/static/js/51.e39490d3.chunk.js",
        "https://www.caseih.com/dist/caseih/static/js/259.0fdf6065.chunk.js",
    ],
}

# Hosts whose robots.txt must be on record before anything else on them is hit.
ROBOTS_HOSTS = [
    "https://dxp-static.bobcat.com",
    "https://bobcat.api.bobcat.com",
    "https://www.caseih.com",
]

# Strings worth surfacing out of a bundle. Nothing here is interpreted; the
# script prints what it found and the human reads it.
ENDPOINT_PAT = re.compile(
    r'["\'`]((?:https?://|/)[A-Za-z0-9_@\-./{}$:%]{4,180})["\'`]')
INTEREST = re.compile(
    r'dealer|locator|coveo|organizationId|searchHub|graphql|/api/|rest/|'
    r'platform\.cloud|firebase|solr|distributor', re.I)


def robots_rules(text):
    """Parse into {agent: [(kind, path)]}. Blank-line-separated groups, the
    conventional reading; a `User-agent` line starts or extends a group."""
    groups, agents, rules = [], [], []
    prev_agent_line = False
    for raw in text.splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line:
            continue
        if ":" not in line:
            continue
        field, value = line.split(":", 1)
        field, value = field.strip().lower(), value.strip()
        if field == "user-agent":
            if rules and not prev_agent_line:
                groups.append((agents, rules))
                agents, rules = [], []
            agents.append(value)
            prev_agent_line = True
            continue
        prev_agent_line = False
        if field in ("allow", "disallow"):
            rules.append((field, value))
    if agents or rules:
        groups.append((agents, rules))
    out = {}
    for ags, rls in groups:
        for a in ags:
            out.setdefault(a, []).extend(rls)
    return out


def _match_len(pattern, path):
    """RFC 9309 path matching with `*` and `$`. Returns the matched pattern
    length (for longest-match arbitration) or None."""
    if pattern == "":
        return None
    anchored = pattern.endswith("$")
    pat = pattern[:-1] if anchored else pattern
    rx = "".join(".*" if ch == "*" else re.escape(ch) for ch in pat)
    rx = "^" + rx + ("$" if anchored else "")
    return len(pattern) if re.search(rx, path) else None


def verdict(rules, path):
    """RFC 9309 §2.2.2 longest match wins; Allow breaks a tie."""
    best = (None, -1, None)  # kind, length, pattern
    for kind, pattern in rules:
        n = _match_len(pattern, path)
        if n is None:
            continue
        if n > best[1] or (n == best[1] and kind == "allow"):
            best = (kind, n, pattern)
    if best[0] is None:
        return "ALLOWED — no rule matches", None
    if best[0] == "allow":
        return f"ALLOWED — longest match is `Allow: {best[2]}`", best[2]
    return f"DISALLOWED by `Disallow: {best[2]}`", best[2]


def fetch_robots(f, origin):
    host = urllib.parse.urlparse(origin).netloc
    url = f"{origin}/robots.txt"
    rec = {"host": host, "url": url}
    try:
        body, cached = f.get(url, f"robots-{host}.txt")
    except Blocked as e:
        rec.update(status=str(e), verbatim=None, rules=None)
        print(f"  robots {host}: {e}")
        return rec
    rec["cached"] = cached
    rec["verbatim"] = body
    rules = robots_rules(body)
    star = rules.get("*", [])
    rec["star_rules"] = [f"{k.title()}: {v}" for k, v in star]
    rec["named_agents"] = [a for a in rules if a != "*"]
    print(f"  robots {host}: {len(star)} `*` rules, "
          f"named agents {rec['named_agents'] or 'none'}")
    return rec


def sniff(text):
    hits = {}
    for m in ENDPOINT_PAT.finditer(text):
        s = m.group(1)
        if INTEREST.search(s):
            hits[s] = hits.get(s, 0) + 1
    return hits


def main():
    targets = sys.argv[1:] or ["bobcat", "caseih"]
    f = BinFetcher("eq-evidence", min_bytes=20)
    out = {
        "source": "eq-evidence",
        "captured": CAPTURED,
        "gate": "ICP-EQ SIGNED (Artur, 2026-08-04). Step 3 per-OEM robots gate "
                "is separate and is what this file answers.",
        "kubota": {
            "origin": "https://www.kubotausa.com",
            "robots_verbatim": "User-Agent: *\nDisallow: /\n",
            "robots_bytes": 27,
            "verdict": "DISALLOWED — whole host. `Disallow: /` with no Allow "
                       "anywhere and no named-agent group. This covers the "
                       "locator page, /find-a-dealer, and every "
                       "/_next/static/chunks/* bundle, so there is no compliant "
                       "way to even READ the bundle, let alone call the data "
                       "path. TARGET STOPPED — GATE R-EQ-1, default NO.",
            "note_on_the_request_already_spent": (
                "The locator page and robots.txt were fetched together by the "
                "Step-2 fingerprint sweep before the robots file had been read "
                "— 2 origin requests, both on 2026-08-04, both cached at "
                "data/raw/_cache/e4evidence-kubota/. That ordering is a real "
                "flaw in the sweep and is recorded rather than hidden. Nothing "
                "further has been requested from the host since, and the "
                "offline read below re-uses the cached bytes only."),
            "offline_read_of_the_cached_page": {
                "hosts_referenced": ["assets.kubotacore.com", "kit.fontawesome.com",
                                     "kubotausa.wpenginepowered.com",
                                     "shop.kubotausa.com",
                                     "start.buildmykubota.com",
                                     "www.kubotacreditusa.com",
                                     "www.ktacinsuranceagency.com",
                                     "www.kubotausa.com"],
                "api_strings_found": 0,
                "finding": "/regional-dealers is a Next.js marketing page that "
                           "links to /find-a-dealer; the actual locator is on "
                           "the same disallowed origin. `kubotausa.wpenginepowered.com` "
                           "is the WP Engine backing origin for the SAME site — "
                           "using it to reach data that www disallows would be "
                           "host switching, which the posture forbids outright. "
                           "No third-party data host exists to check.",
            },
        },
        "robots": {},
        "bundles": {},
    }

    for origin in ROBOTS_HOSTS:
        out["robots"][urllib.parse.urlparse(origin).netloc] = fetch_robots(f, origin)

    for key in targets:
        print(f"\n── {key} bundles ──────────────────────────────")
        recs = []
        for url in BUNDLES[key]:
            host = urllib.parse.urlparse(url).netloc
            rules = (out["robots"].get(host) or {}).get("star_rules")
            if rules is not None:
                parsed = [(r.split(":", 1)[0].strip().lower(),
                           r.split(":", 1)[1].strip()) for r in rules]
                v, _ = verdict(parsed, urllib.parse.urlparse(url).path)
                if v.startswith("DISALLOWED"):
                    print(f"  SKIP {url} — {v}")
                    recs.append({"url": url, "skipped": v})
                    continue
            name = url.split("/")[-1]
            try:
                body, cached = f.get(url, f"{key}-{name}")
            except Blocked as e:
                print(f"  BLOCKED {url}: {e}")
                recs.append({"url": url, "blocked": str(e)})
                if "403" in str(e) or "401" in str(e):
                    print("  403/401 → STOPPING this target, no bypass.")
                    break
                continue
            hits = sniff(body)
            recs.append({"url": url, "bytes": len(body), "cached": cached,
                         "interesting_strings": dict(sorted(
                             hits.items(), key=lambda kv: -kv[1])[:60])})
            print(f"  {name}  {len(body):>9,} B  "
                  f"({'cached' if cached else 'live'})  {len(hits)} hits")
            for s in list(sorted(hits, key=lambda k: -hits[k]))[:15]:
                print(f"      {s[:150]}")
        out["bundles"][key] = recs

    out["origin_requests"] = f.origin_requests
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=1)
    print(f"\nevidence -> {OUT}   origin requests this run: {f.origin_requests}")


if __name__ == "__main__":
    main()
