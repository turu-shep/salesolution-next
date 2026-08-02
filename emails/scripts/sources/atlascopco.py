#!/usr/bin/env python3
"""S1 wave-3 — Atlas Copco Compressors authorized partners (static HTML).

Not a searchable locator: a plain server-rendered page of `<h2>State</h2>`
headings followed by one `paragraph-with-image` block per partner carrying
`<b>name</b>`, a `tel:` link and a website link. One GET, no JS.

MEASURED, and it corrects `research/01`'s "static state-by-state (~hundreds)":
the page lists a **partial** set of states (24 headings, four of them Caribbean
and Latin American territories) and roughly three dozen partner blocks. It is a
small enrichment source, not a volume one.

Source-native codes: **none.** The only axis is the state heading, which is
geography. Captured as `state_heading` because it is the source's own grouping.
"""
import html
import re
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _polite import (CAPTURED, US_STATES, Blocked, Fetcher, apex,  # noqa: E402
                     digits, report, write_raw)

SOURCE = "atlascopco"
PAGE = ("https://www.atlascopco.com/en-us/compressors/contact-number/"
        "authorized-partners")

HEAD_RE = re.compile(r'<h2[^>]*class="u-h3[^"]*"[^>]*>(?P<name>.*?)</h2>', re.S)
BLOCK_RE = re.compile(r'<div class="paragraph-with-image[^"]*"[^>]*>(?P<body>.*?)'
                      r'(?=<div class="(?:subtitle|paragraph-with-image)|\Z)', re.S)
NAME_RE = re.compile(r"<b>(?P<n>.*?)</b>", re.S)
TEL_RE = re.compile(r'href="tel:([^"]+)"')
SITE_RE = re.compile(r'href="(https?://(?!www\.atlascopco\.com)[^"]+)"[^>]*'
                     r'target="_blank"')

# Non-US headings on this page; kept as records, flagged is_us=false (no deletes).
NON_US = {"dominican republic", "jamaica", "trinidad & tobago", "trinidad and tobago",
          "puerto rico"}

STATE_NAMES = {
    "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR",
    "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE",
    "florida": "FL", "georgia": "GA", "hawaii": "HI", "idaho": "ID",
    "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS",
    "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
    "massachusetts": "MA", "michigan": "MI", "minnesota": "MN",
    "mississippi": "MS", "missouri": "MO", "montana": "MT", "nebraska": "NE",
    "nevada": "NV", "new hampshire": "NH", "new jersey": "NJ",
    "new mexico": "NM", "new york": "NY", "north carolina": "NC",
    "north dakota": "ND", "ohio": "OH", "oklahoma": "OK", "oregon": "OR",
    "pennsylvania": "PA", "rhode island": "RI", "south carolina": "SC",
    "south dakota": "SD", "tennessee": "TN", "texas": "TX", "utah": "UT",
    "vermont": "VT", "virginia": "VA", "washington": "WA",
    "west virginia": "WV", "wisconsin": "WI", "wyoming": "WY",
    "puerto rico": "PR",
}


def txt(s):
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", s or "")).split()) or None


def state_code(heading):
    """'Indiana, Eastern' / 'Kentucky, Western' → IN / KY."""
    base = heading.split(",")[0].strip().lower()
    return STATE_NAMES.get(base)


def main():
    f = Fetcher(SOURCE, min_bytes=10000)
    try:
        body, cached = f.get(PAGE, "authorized-partners.html",
                             headers={"Accept": "text/html,*/*;q=0.8"})
    except Blocked as e:
        print(f"BLOCKED: {e}")
        write_raw(SOURCE, {"source_url": PAGE, "blocked": str(e)}, [])
        return
    print(f"fetched {len(body)} bytes ({'cached' if cached else 'live'})")

    # Walk the document in order so each partner block inherits the last heading.
    marks = [(m.start(), "head", txt(m.group("name"))) for m in HEAD_RE.finditer(body)]
    marks += [(m.start(), "block", m.group("body")) for m in BLOCK_RE.finditer(body)]
    marks.sort(key=lambda t: t[0])

    records, heading = [], None
    for _, kind, payload in marks:
        if kind == "head":
            heading = payload
            continue
        if not heading:
            continue
        name = txt(NAME_RE.search(payload).group("n")) if NAME_RE.search(payload) else None
        if not name:
            continue
        tel = TEL_RE.search(payload)
        site = SITE_RE.search(payload)
        st = state_code(heading)
        records.append({
            "company": name,
            "state_heading": heading,          # the source's own grouping, verbatim
            "state": st,
            "phone_raw": txt(tel.group(1)) if tel else None,
            "phone_10": digits(tel.group(1) if tel else None),
            "website": site.group(1) if site else None,
            "domain": apex(site.group(1) if site else None),
            "email": None,
            "address_1": None,
            "is_us": bool(st and st in US_STATES) and heading.lower() not in NON_US,
            "source": SOURCE,
            "source_url": PAGE,
            "captured": CAPTURED,
        })

    stats = report(SOURCE, records, code_fields=("state_heading",))
    write_raw(SOURCE, {
        "source_name": "Atlas Copco Compressors authorized partners",
        "source_url": PAGE,
        "method": "one GET, static server-rendered state-by-state list, no JS",
        "codes_captured_verbatim": ["state_heading"],
        "no_codes": "no type / tier / vertical facet on this page",
        "correction_to_research_01": "'static state-by-state (~hundreds)' "
                                     "overstates it — measured at a partial set "
                                     "of state headings and a few dozen partner "
                                     "blocks, several of them Caribbean / LatAm.",
        "origin_requests": f.origin_requests,
        "stats": stats,
    }, records)


if __name__ == "__main__":
    main()
