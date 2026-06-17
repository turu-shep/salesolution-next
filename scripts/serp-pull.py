#!/usr/bin/env python3
"""serp-pull — the engine's Phase 0.5 SERP brief, WITH a real competitor-page
fetcher injected.

The engine (.engine, a pinned submodule) ships `_fetch_competitor_page` as a
NotImplementedError placeholder, so DataForSEO returns the ranking URLs but the
brief's `ranking_pages`, `mandatory_h2s`, and `target_word_count` stay empty
(every page lands in `skipped_pages` as "fetch_failed"). We can't edit the
vendored submodule (it's version-pinned and would be wiped on the next bump), so
this wrapper monkeypatches a real urllib + BeautifulSoup fetcher into
`pull_brief` at runtime and delegates to its unchanged `main()`. All the
engine's downstream synthesis (filtering, heading frequency, word-count targets)
runs as-is.

Usage — same args as the engine's pull_brief.py; needs DataForSEO creds in env:

    source scripts/engine-env.sh
    .venv/bin/python scripts/serp-pull.py \\
        --keyword "geo agency" --liori-id SAL-404 \\
        --folder analysis/briefs/SAL-404_geo-agency --liori-root . \\
        --provider dataforseo

Static HTML only: JS-rendered SPAs may parse thin and get skipped — that's the
engine's existing behavior, not a regression.
"""
import gzip
import json
import re
import ssl
import sys
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

from bs4 import BeautifulSoup

# Make the engine's serp-research scripts importable.
ENGINE_SCRIPTS = (
    Path(__file__).resolve().parent.parent
    / ".engine" / "skills" / "serp-research" / "scripts"
)
sys.path.insert(0, str(ENGINE_SCRIPTS))

import pull_brief  # noqa: E402  (engine module, imported after sys.path tweak)

_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)
_TIMEOUT = 20

# Verified TLS via certifi when available (the system Python 3.9 often lacks
# root certs). Falls back to the default context.
try:
    import certifi
    _CTX = ssl.create_default_context(cafile=certifi.where())
except Exception:
    _CTX = ssl.create_default_context()


def _get_html(url: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": _UA,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, identity",
        },
    )
    try:
        resp = urllib.request.urlopen(req, timeout=_TIMEOUT, context=_CTX)
    except ssl.SSLCertVerificationError:
        # Last resort for a broken local cert store — public pages, no secrets sent.
        resp = urllib.request.urlopen(
            req, timeout=_TIMEOUT, context=ssl._create_unverified_context()
        )
    with resp:
        ctype = (resp.headers.get("Content-Type") or "").lower()
        if ctype and "html" not in ctype:
            raise ValueError(f"non-html content-type: {ctype}")
        raw = resp.read()
    if raw[:2] == b"\x1f\x8b":  # gzip magic
        raw = gzip.decompress(raw)
    return raw


def real_fetch(url: str) -> dict:
    """Real `_fetch_competitor_page`: fetch + parse static HTML into the dict the
    engine's classify_page / synthesis expect. Raises on hard failures so the
    engine records the page in skipped_pages (its existing contract)."""
    raw = _get_html(url)
    soup = BeautifulSoup(raw, "html.parser")
    host = urlparse(url).netloc.replace("www.", "")

    # JSON-LD (schema types + FAQ) — read BEFORE stripping <script>.
    schema_types: list[str] = []
    faq_questions: list[str] = []
    for s in soup.find_all("script", attrs={"type": "application/ld+json"}):
        try:
            data = json.loads(s.string or s.get_text() or "")
        except Exception:
            continue
        nodes = data.get("@graph", data) if isinstance(data, dict) else data
        if isinstance(nodes, dict):
            nodes = [nodes]
        for node in nodes if isinstance(nodes, list) else []:
            if not isinstance(node, dict):
                continue
            t = node.get("@type")
            if isinstance(t, list):
                schema_types.extend(str(x) for x in t)
            elif t:
                schema_types.append(str(t))
            if node.get("@type") == "FAQPage" and isinstance(node.get("mainEntity"), list):
                for q in node["mainEntity"]:
                    name = (q or {}).get("name") if isinstance(q, dict) else None
                    if name:
                        faq_questions.append(re.sub(r"\s+", " ", str(name)).strip())

    has_video = bool(
        soup.find("video")
        or soup.find("iframe", src=re.compile(r"youtube|youtu\.be|vimeo|wistia", re.I))
    )
    internal_link_count = sum(
        1
        for a in soup.find_all("a", href=True)
        if (urlparse(a["href"]).netloc.replace("www.", "") or host) == host
    )

    title = soup.title.get_text(strip=True) if soup.title else ""
    if not title and soup.h1:
        title = soup.h1.get_text(strip=True)

    # Strip chrome before headings + word count so nav/footer don't pollute them.
    for tag in soup(
        ["script", "style", "noscript", "template", "nav", "header", "footer", "aside", "form"]
    ):
        tag.decompose()
    main = soup.find("article") or soup.find("main") or soup.body or soup

    h2_headings = [h.get_text(" ", strip=True) for h in main.find_all("h2") if h.get_text(strip=True)]
    h3_headings = [h.get_text(" ", strip=True) for h in main.find_all("h3") if h.get_text(strip=True)]

    text = main.get_text(" ", strip=True)
    word_count = len(re.findall(r"\b\w[\w'-]*\b", text))

    has_faq = bool(faq_questions) or any(
        re.search(r"\bfaq\b|frequently asked", h, re.I) for h in h2_headings + h3_headings
    )
    if not faq_questions:
        faq_questions = [h for h in h2_headings + h3_headings if h.rstrip().endswith("?")]

    return {
        "title": title,
        "word_count": word_count,
        "h2_headings": h2_headings,
        "h3_headings": h3_headings,
        "has_faq": has_faq,
        "faq_questions": faq_questions,
        "has_video": has_video,
        "schema_types": sorted(set(schema_types)),
        "internal_link_count": internal_link_count,
    }


# Inject the real fetcher (synthesize_brief looks it up as a module global at
# call time, so replacing the attribute is enough).
pull_brief._fetch_competitor_page = real_fetch

if __name__ == "__main__":
    sys.exit(pull_brief.main())
