#!/usr/bin/env python3
"""E4 Step 0 (part 2) — static bundle sniff for the two remaining headless targets.

`_e4_bundles.py` pinned the data path for five of the eight E4 locators by
reading their own JS. Two were left open:

  - **SKF** — Angular SPA behind Akamai. `research/01` recorded "endpoint not
    found in bundle scan; API path obfuscated". Shell is `<base href="/">` with
    `main.js` / `polyfills.js` / `chunk-*.js` at the origin root.
  - **Continental / ContiTech** — Adobe AEM Edge Delivery (Franklin). 5.8 KB
    shell, block `distributor-locator`, block code lives at
    `/blocks/<name>/<name>.js`.

Posture, unchanged from `_e4_bundles.py` and `_polite.py`:

  - Fetch **JS / CSS / robots.txt only**. Never a distributor-data endpoint,
    never a search query, never a form POST. This script names paths; it does
    not call them.
  - One worker, >=3s per host, everything cached to disk.
  - **A 403 stops that target.** No retry, no UA rotation, no host switching.
    The 403 *is* the finding.

Usage:
    python3 _e4_bundles2.py                      # run the seeded targets
    python3 _e4_bundles2.py skf <url> [<url>..]  # follow a chunk you just found
"""
import gzip
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import zlib

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402
from _polite import Blocked, Fetcher  # noqa: E402

_polite.CAPTURED = "2026-08-03"

# Ask for uncompressed bytes. Note: www.continental-industry.com serves gzip
# ANYWAY, so we also have to decode it — `_polite.Fetcher` decodes straight to
# utf-8 with errors ignored and caches the mangled text, which is what destroyed
# the first continental scripts.js capture (1,353 bytes of unreadable garbage).
IDENTITY = {"Accept-Encoding": "identity"}


class BinFetcher(Fetcher):
    """`_polite.Fetcher` with a bytes-safe body + Content-Encoding decode.

    Same posture, inherited unchanged: >=3s pacing, single worker, honest UA
    never rotated, disk cache, and 401/403 -> Blocked with no bypass.
    """

    def get(self, url, cache_name, data=None, headers=None, timeout=180):  # noqa: A002
        path = os.path.join(self.cache, cache_name)
        if os.path.exists(path) and os.path.getsize(path) >= self.min_bytes:
            with open(path, "rb") as fh:
                return fh.read().decode("utf-8", "replace"), True

        hdrs = {
            "User-Agent": _polite.UA,
            "Accept": "application/javascript, text/javascript, text/css, text/plain, */*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }
        hdrs.update(headers or {})

        for attempt in range(len(_polite.BACKOFF) + 1):
            self._pace()
            req = urllib.request.Request(url, headers=hdrs)
            try:
                with urllib.request.urlopen(req, timeout=timeout) as r:
                    raw = r.read()
                    enc = (r.headers.get("Content-Encoding") or "").lower()
                self._last = time.time()
                self.origin_requests += 1
                raw = _decode_body(raw, enc)
                with open(path, "wb") as fh:
                    fh.write(raw)
                return raw.decode("utf-8", "replace"), False
            except urllib.error.HTTPError as e:
                self._last = time.time()
                if e.code in (401, 403):
                    raise Blocked(f"HTTP {e.code} on {url} — target stopped, no bypass")
                if e.code == 404:
                    raise Blocked(f"HTTP 404 on {url}")
                wait = _polite.BACKOFF[min(attempt, len(_polite.BACKOFF) - 1)]
                print(f"  HTTP {e.code} on {url} -> backoff {wait}s", flush=True)
                time.sleep(wait)
            except Exception as e:  # noqa: BLE001
                self._last = time.time()
                wait = _polite.BACKOFF[min(attempt, len(_polite.BACKOFF) - 1)]
                print(f"  ERR {e!r} -> retry in {wait}s", flush=True)
                time.sleep(wait)
        raise Blocked(f"gave up on {url}")


def _decode_body(raw, enc):
    """Undo gzip/deflate, and sniff the magic bytes when the header lies."""
    try:
        if enc == "gzip" or raw[:2] == b"\x1f\x8b":
            return gzip.GzipFile(fileobj=io.BytesIO(raw)).read()
        if enc == "deflate":
            try:
                return zlib.decompress(raw)
            except zlib.error:
                return zlib.decompress(raw, -zlib.MAX_WBITS)
        if enc == "br":
            import brotli  # noqa: PLC0415 — optional, only if a host forces br
            return brotli.decompress(raw)
    except Exception as e:  # noqa: BLE001
        print(f"  ! decode({enc or 'sniff'}) failed: {e!r} — keeping raw bytes")
    return raw

SEEDS = {
    # SKF — Angular root bundle. `<base href="/">` in the cached shell, so the
    # shell's `src="main.js"` resolves against the origin root.
    "skf": [
        "https://www.skf.com/main.js",
    ],
    # Continental — AEM Edge Delivery block convention: /blocks/<name>/<name>.js.
    # The cached shell's block wrapper is <div class="distributor-locator">.
    "continental": [
        "https://www.continental-industry.com/blocks/distributor-locator/distributor-locator.js",
    ],
}

# ── extraction ──────────────────────────────────────────────────────────────

# Absolute URLs and rooted paths that look like a service call.
PATH_RE = re.compile(
    r"""["'`](
        (?:https?://[A-Za-z0-9._-]+(?::\d+)?)?
        /(?:bin|api|apis|apps|content|graphql|gql|ws|services|service|rest|webapi|
            v\d|query-index|locator|locations|search|store|stores|dealer|dealers|
            distributor|distributors|partner|partners|find|geo|maps|data)
        [A-Za-z0-9_./{}$%:?&=-]*
    )["'`]""",
    re.IGNORECASE | re.VERBOSE,
)

# Any absolute URL at all — catches api. subdomains and third-party gateways.
ABS_URL_RE = re.compile(r"""["'`](https?://[A-Za-z0-9._-]+(?::\d+)?[A-Za-z0-9_./~%?&=+{}$:-]*)["'`]""")

# Bare hostnames referenced without a scheme (`"api.example.com"`).
HOST_RE = re.compile(r"""["'`((]([a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+){1,4}\.(?:com|net|io|dev|org|co|cloud|app|azurewebsites\.net))["'`,)]""",
                     re.IGNORECASE)

KEYWORD_RE = re.compile(
    r"""["'`]([^"'`\s]{3,160}?(?:distributor|dealer|wheretobuy|where-to-buy|
        storelocator|store-locator|locator|partner|plain\.html|query-index)
        [^"'`\s]{0,160})["'`]""",
    re.IGNORECASE | re.VERBOSE,
)

# fetch()/axios/HttpClient call sites — shows the concatenation, not just the literal.
CALL_RE = re.compile(
    r"""(?:fetch|axios(?:\.[a-z]+)?|\.(?:get|post)|http\.(?:get|post)|
        XMLHttpRequest\(\)[^;]{0,80}\.open)\s*\(\s*([^;]{0,220})""",
    re.IGNORECASE | re.VERBOSE,
)

# Template literals that build a URL from fragments.
TEMPLATE_RE = re.compile(r"`([^`\n]{0,200}(?:https?://|/)[^`\n]{0,200}\$\{[^`\n]{0,200})`")

# Credential-shaped identifiers. We record the FIELD NAME ONLY, never a value.
CRED_RE = re.compile(
    r"""["'`]?((?:[A-Za-z-]*(?:api[-_]?key|apikey|subscription[-_]?key|
        access[-_]?token|bearer|authorization|auth[-_]?token|x-[a-z-]*key|
        client[-_]?secret|ocp-apim)[A-Za-z-]*))["'`]?\s*[:=]""",
    re.IGNORECASE | re.VERBOSE,
)

CODEFIELD_RE = re.compile(
    r"""["'`]((?:[a-zA-Z]*(?:tier|category|categories|type|types|group|segment|
        class|classification|level|role|certif|industr|product[Ll]ine|
        productline|brand|specialt|capabilit|service)[a-zA-Z]*))["'`]\s*[:,\]}]""",
    re.IGNORECASE | re.VERBOSE,
)

# Static ES-module imports so we can walk one hop without guessing.
IMPORT_RE = re.compile(r"""(?:^|[\s;}])(?:import|export)[^;'"]{0,200}?from\s*['"]([^'"]+)['"]""",
                       re.MULTILINE)
DYNIMPORT_RE = re.compile(r"""import\s*\(\s*['"]([^'"]+)['"]""")


def cache_name(url):
    u = urllib.parse.urlparse(url)
    stem = (u.path or "/").strip("/").replace("/", "__") or "root"
    return f"{u.netloc}__{stem}"[:120]


def sniff(key, urls):
    f = BinFetcher(f"e4bundle2-{key}", min_bytes=1)
    found = {"key": key, "captured": _polite.CAPTURED, "bundles": []}
    for url in urls:
        entry = {"url": url, "host": urllib.parse.urlparse(url).netloc}
        try:
            body, cached = f.get(url, cache_name(url), headers=dict(IDENTITY))
            entry["status"] = "200"
            entry["bytes"] = len(body)
            entry["cached"] = cached
            entry["looks_binary"] = sum(1 for c in body[:2000] if ord(c) < 9) > 20
            entry["endpoint_paths"] = sorted({m.group(1) for m in PATH_RE.finditer(body)})[:60]
            entry["absolute_urls"] = sorted({m.group(1) for m in ABS_URL_RE.finditer(body)})[:60]
            entry["bare_hosts"] = sorted({m.group(1).lower() for m in HOST_RE.finditer(body)})[:40]
            entry["keyword_strings"] = sorted({m.group(1) for m in KEYWORD_RE.finditer(body)})[:60]
            entry["call_sites"] = sorted({" ".join(m.group(1).split())
                                          for m in CALL_RE.finditer(body)})[:40]
            entry["url_templates"] = sorted({m.group(1) for m in TEMPLATE_RE.finditer(body)})[:40]
            entry["credential_field_names"] = sorted({m.group(1).lower()
                                                      for m in CRED_RE.finditer(body)})[:30]
            entry["code_field_names"] = sorted({m.group(1) for m in CODEFIELD_RE.finditer(body)})[:60]
            entry["imports"] = sorted({m.group(1) for m in IMPORT_RE.finditer(body)})[:40]
            entry["dynamic_imports"] = sorted({m.group(1) for m in DYNIMPORT_RE.finditer(body)})[:40]
        except Blocked as e:
            entry["status"] = str(e)
            entry["STOP"] = "blocked — recorded, not worked around"
        except Exception as e:  # noqa: BLE001
            entry["status"] = f"ERR {e!r}"
        found["bundles"].append(entry)

        print(f"\n=== {key} {url}")
        print(f"  status={entry.get('status')} bytes={entry.get('bytes', '-')} "
              f"cached={entry.get('cached')} binary={entry.get('looks_binary')}")
        for label in ("endpoint_paths", "absolute_urls", "bare_hosts", "keyword_strings",
                      "url_templates", "call_sites", "credential_field_names",
                      "imports", "dynamic_imports"):
            vals = entry.get(label) or []
            if vals:
                print(f"  -- {label} ({len(vals)}):")
                for v in vals[:30]:
                    print(f"     {v[:180]}")
        if entry.get("code_field_names"):
            print(f"  -- code_field_names: {entry['code_field_names'][:40]}")
    found["origin_requests"] = f.origin_requests
    print(f"\n[{key}] origin requests this run: {f.origin_requests}")
    return found


def main():
    args = sys.argv[1:]
    if len(args) >= 2:
        jobs = {args[0]: args[1:]}
    elif len(args) == 1:
        jobs = {args[0]: SEEDS[args[0]]}
    else:
        jobs = SEEDS

    out = [sniff(k, urls) for k, urls in jobs.items()]
    path = os.path.join(_polite.RAW, f"e4-bundles2-{_polite.CAPTURED}.json")
    prev = []
    if os.path.exists(path):
        with open(path, encoding="utf-8") as fh:
            prev = json.load(fh).get("targets", [])
    with open(path, "w", encoding="utf-8") as fh:
        json.dump({"source": "e4-bundles2", "captured": _polite.CAPTURED,
                   "targets": prev + out}, fh, indent=1)
    print(f"\nbundles2 -> {path}")


if __name__ == "__main__":
    main()
