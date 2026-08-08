#!/usr/bin/env python3
"""E4 Step 0 — robots posture of the API HOSTS the locators actually call.

Three of the eight E4 targets serve dealer data from a different host than the
locator page (Banner → api2d.bannerengineering.com, Festo → api.festo.com,
Bosch Rexroth → an Azure container app). RFC 9309 is per-origin, so the
governing robots.txt for the data path is the API host's, not www's. This
script reads each API host's robots.txt and returns the verdict for the exact
path the locator would call.

One GET per host, `_polite` paced and cached. No data request is made here.
"""
import json
import os
import sys
import urllib.parse

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402
from _e4_evidence import parse_robots, robots_path_matches  # noqa: E402
from _polite import Blocked, Fetcher  # noqa: E402

_polite.CAPTURED = "2026-08-03"

# (key, data-path URL the locator's own JS constructs, what named it)
DATA_PATHS = [
    ("banner", "https://api2d.bannerengineering.com/dist?apikey=<site-id>&sitename=us/en&q=<query>&return=json",
     "wheretobuy.min.js — Backbone Collection.url()"),
    ("festo", "https://api.festo.com/it/apps/locators/v1",
     "index.6a7664bb.js — locator API base"),
    ("boschrexroth", "https://contact-locator-nextapp-dev.bluebeach-026120a4.westeurope.azurecontainerapps.io/locator/index.js",
     "contact-locator page shell — app is hosted off-site"),
    ("pepperlfuchs", "https://www.pepperl-fuchs.com/api/protected/distributorsData",
     "_nuxt/CeWaRfrk.js"),
    ("waltersurface", "https://www.walter.com/us/webruntime/api/apex/execute",
     "where_To_Buy_1_view — @salesforce/apex/WalterENWhereToBuyController.getAllDistributorMarkers"),
    # ── equipment-dealers (ICP-EQ signed 2026-08-04) ────────────────────────
    # Bobcat's locator is Coveo Atomic/Headless. TWO hosts govern the data path:
    # the token minter on Bobcat's own API host, and the Coveo platform host that
    # answers /rest/search/v2. Both are checked; the strictest verdict binds.
    ("bobcat-token", "https://bobcat.api.bobcat.com/coveo/search/token?region=NA",
     "www.bobcat.com/dealer inline Nuxt payload — componentProps.tokenUri; "
     "2c89e81.modern.js asserts it is REQUIRED ('Token Generation URI')"),
    ("bobcat-coveo-org", "https://bobcatproduction10bzen8ct.org.coveo.com/rest/search/v2",
     "Coveo Headless default platformUrl for componentProps.orgId"),
    ("bobcat-coveo-platform", "https://platform.cloud.coveo.com/rest/search/v2",
     "Coveo legacy platform host — checked because the host was not pinned statically"),
    ("caseih", "https://www.caseih.com/apirequest/dealer-locator/get-dealer-by-geo-code",
     "259.0fdf6065.chunk.js — bare fetch(`/apirequest/dealer-locator/…`), same origin"),
]


def check(key, data_url, provenance):
    u = urllib.parse.urlparse(data_url)
    origin = f"{u.scheme}://{u.netloc}"
    f = Fetcher(f"e4apihost-{u.netloc}", min_bytes=1)
    out = {"key": key, "data_url": data_url, "path_provenance": provenance,
           "api_host": u.netloc, "captured": _polite.CAPTURED}
    try:
        body, _ = f.get(origin + "/robots.txt", "robots.txt")
        out["robots_status"] = "200"
        out["robots_body"] = body if len(body) < 4000 else body[:4000] + "…[truncated]"
        # An SPA host answers /robots.txt with its app shell. HTTP 200 + HTML is
        # NOT a robots file, and reporting it as "no matching rule" would read as
        # permission. Festo's locator host and Bosch's Azure app both do this.
        if body.lstrip()[:9].lower().startswith(("<!doctype", "<html")):
            out["robots_status"] = "200 but body is HTML — host serves no robots.txt"
            out["star_rules"] = []
            out["verdict"] = ("NO robots.txt on this host (app shell served for "
                              "/robots.txt) — no stated preference either way")
            return out
        blocks = parse_robots(body)
        star = [(a, r) for a, r in blocks if "*" in a]
        out["star_rules"] = [f"{k}: {p}" for _, rules in star for k, p in rules]
        best = None
        for _, rules in star:
            for kind, p in rules:
                if kind in ("Allow", "Disallow") and robots_path_matches(p, u.path or "/"):
                    if best is None or len(p) > len(best[1]):
                        best = (kind, p)
        out["verdict"] = ("allowed — no matching rule" if best is None
                          else f"{best[0]} by `{best[1]}`")
    except Blocked as e:
        out["robots_status"] = str(e)
        out["verdict"] = "robots.txt unreadable — treat as unknown, not as permission"
    except Exception as e:  # noqa: BLE001
        out["robots_status"] = f"ERR {e!r}"
        out["verdict"] = "robots.txt unreadable — treat as unknown, not as permission"
    return out


def main():
    keys = set(sys.argv[1:])
    results = []
    for key, url, prov in DATA_PATHS:
        if keys and key not in keys:
            continue
        r = check(key, url, prov)
        print(f"\n=== {key} → {r['api_host']}")
        print(f"  robots: {r['robots_status'][:80]}")
        print(f"  data path: {urllib.parse.urlparse(r['data_url']).path}")
        print(f"  VERDICT: {r['verdict']}")
        if r.get("star_rules"):
            print(f"  star rules: {r['star_rules'][:12]}")
        results.append(r)
    path = os.path.join(_polite.RAW, f"e4-apihosts-{_polite.CAPTURED}.json")
    with open(path, "w", encoding="utf-8") as fh:
        json.dump({"source": "e4-apihosts", "captured": _polite.CAPTURED,
                   "targets": results}, fh, indent=1)
    print(f"\napi-host robots -> {path}")


if __name__ == "__main__":
    main()
