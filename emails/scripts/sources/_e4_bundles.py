#!/usr/bin/env python3
"""E4 Step 0 — static bundle sniff: name the data path WITHOUT rendering.

The gate in `e4-headless-locators/01-prompt.md` asks what robots.txt says about
"the specific path the render would hit". Cheapest honest way to learn that path
is to read the locator's own JS bundle, which we are already allowed to fetch
(it is the same public page's subresource). No render, no data request, one GET
per bundle at `_polite` pacing, everything cached.

Every candidate path found here is then evaluated against that host's robots.txt
by `_e4_evidence.robots_path_matches` in the write-up — this script only reports.
"""
import json
import os
import re
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402
from _polite import Blocked, Fetcher  # noqa: E402

_polite.CAPTURED = "2026-08-03"

# (key, [bundle URLs to read]) — all discovered in the cached locator shells.
BUNDLES = {
    "banner": [
        "https://www.bannerengineering.com/etc.clientlibs/designs/banner/clientlibs/wheretobuy.min.js",
    ],
    "festo": [
        "https://distributorlocator.festo.com/static/js/index.6a7664bb.js",
    ],
    "continental": [
        "https://www.continental-industry.com/scripts/scripts.js",
    ],
    "pepperlfuchs": [
        "https://www.pepperl-fuchs.com/_nuxt/CeWaRfrk.js",
    ],
    "waltersurface": [
        "https://www.walter.com/us/webruntime/view/ce4da24f261056d191d35c612ef19e92/prod/en-US/where_To_Buy_1_view",
    ],
}

# Endpoint-shaped strings. Deliberately broad; the write-up filters by hand.
PATH_RE = re.compile(
    r"""["'`](
        (?:https?://[A-Za-z0-9._-]+)?
        /(?:bin|api|apis|content|graphql|ws|services|service|rest|webapi|
            wp-json|ccstorex?|servlet|dxf|locator|search)
        [A-Za-z0-9_./{}$:-]*
    )["'`]""",
    re.IGNORECASE | re.VERBOSE,
)
KEYWORD_RE = re.compile(
    r"""["'`]([^"'`\s]{4,140}?(?:distributor|dealer|wheretobuy|where-to-buy|
        storelocator|store-locator|locator|partner)[^"'`\s]{0,140})["'`]""",
    re.IGNORECASE | re.VERBOSE,
)
CODEFIELD_RE = re.compile(
    r"""["'`]((?:[a-zA-Z]*(?:tier|category|categories|type|group|segment|class|
        level|role|certif|industr)[a-zA-Z]*))["'`]""",
    re.IGNORECASE | re.VERBOSE,
)


def sniff(key, urls):
    f = Fetcher(f"e4bundle-{key}", min_bytes=100)
    found = {"key": key, "captured": _polite.CAPTURED, "bundles": []}
    for i, url in enumerate(urls):
        entry = {"url": url}
        try:
            body, cached = f.get(url, f"bundle-{i}.js")
            entry["status"] = "200"
            entry["bytes"] = len(body)
            entry["cached"] = cached
            entry["endpoint_paths"] = sorted({m.group(1) for m in PATH_RE.finditer(body)})[:40]
            entry["keyword_strings"] = sorted({m.group(1) for m in KEYWORD_RE.finditer(body)})[:40]
            entry["code_field_names"] = sorted({m.group(1) for m in CODEFIELD_RE.finditer(body)})[:40]
        except Blocked as e:
            entry["status"] = str(e)
        except Exception as e:  # noqa: BLE001
            entry["status"] = f"ERR {e!r}"
        found["bundles"].append(entry)
        print(f"\n=== {key} {url}")
        print(f"  status={entry.get('status')} bytes={entry.get('bytes', '-')}")
        for p in entry.get("endpoint_paths", [])[:20]:
            print(f"    path: {p}")
        for s in entry.get("keyword_strings", [])[:20]:
            print(f"    kw:   {s}")
        if entry.get("code_field_names"):
            print(f"    codes: {entry['code_field_names'][:20]}")
    found["origin_requests"] = f.origin_requests
    return found


def main():
    keys = sys.argv[1:] or list(BUNDLES)
    out = [sniff(k, BUNDLES[k]) for k in keys if k in BUNDLES]
    path = os.path.join(_polite.RAW, f"e4-bundles-{_polite.CAPTURED}.json")
    prev = []
    if os.path.exists(path):
        with open(path, encoding="utf-8") as fh:
            prev = json.load(fh).get("targets", [])
    keep = [p for p in prev if p.get("key") not in {o["key"] for o in out}]
    with open(path, "w", encoding="utf-8") as fh:
        json.dump({"source": "e4-bundles", "captured": _polite.CAPTURED,
                   "targets": keep + out}, fh, indent=1)
    print(f"\nbundles -> {path}")


if __name__ == "__main__":
    main()
