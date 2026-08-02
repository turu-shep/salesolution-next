#!/usr/bin/env python3
"""S1 wave-3 — Gast Manufacturing (IDEX) distributor finder.

WordPress `admin-ajax.php`, action `load_distributors`, the same family as NTN
and Quincy. The client contract is readable in the theme's unminified
`assets/js/distributor.js`: when a country is chosen with no postcode it calls
`loadDistributors("", "", "", country)`, and the server returns the **whole
country list** as rendered HTML (no lat/lng, no radius, no pagination).

  POST /wp-admin/admin-ajax.php
       action=load_distributors&nonce=<page nonce>&user_lat=&user_long=&zipcode=&country=US

The nonce is printed in the page as `gastData.nonce`; it is a WordPress CSRF
token on a public read path, not a credential. reCAPTCHA sits on the Contact
Form 7 form, not on this route.

MEASURED, and it corrects `research/06`: Gast's US network is **21 distributors**,
not the 150–350 that segment estimate implied. Verified by a second query — a
Los-Angeles-ZIP search returns a strict subset (1 record) of the same 21.

Source-native codes: **none.** Gast publishes no type, tier or category on the
record. The `#disCountry` select is the only facet and it is geography.
"""
import html
import json
import re
import sys
import urllib.parse

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _polite import (CAPTURED, Blocked, Fetcher, digits, report,  # noqa: E402
                     write_raw)

SOURCE = "gast"
AJAX = "https://gastmfg.com/wp-admin/admin-ajax.php"
PAGE = "https://www.gastmfg.com/find-distributor/"

SLIDE_RE = re.compile(r'<div class="swiper-slide"(?P<attrs>[^>]*)>(?P<body>.*?)'
                      r'(?=<div class="swiper-slide"|\Z)', re.S)
NAME_RE = re.compile(r"<h5>(.*?)</h5>", re.S)
ADDR_RE = re.compile(r'maps/search/\?api=1&query=(?P<q>[^"&]+)')
TEL_RE = re.compile(r'href="tel:([^"]+)"')
EMAIL_RE = re.compile(r'data-email-address="([^"]+)"')
ATTR_RE = re.compile(r'data-(?P<k>[a-z\-]+)="(?P<v>[^"]*)"')


def txt(s):
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", s or "")).split()) or None


def page_nonce(fetcher):
    body, _ = fetcher.get(PAGE, "find-distributor.html",
                          headers={"Accept": "text/html,*/*;q=0.8"})
    m = re.search(r'"nonce"\s*:\s*"([a-z0-9]+)"', body)
    if not m:
        raise Blocked("gastData.nonce not found on the page")
    return m.group(1)


def main():
    f = Fetcher(SOURCE, min_bytes=2000)
    try:
        nonce = page_nonce(f)
        body, cached = f.get(AJAX, "load-distributors-us.json",
                             data={"action": "load_distributors", "nonce": nonce,
                                   "user_lat": "", "user_long": "", "zipcode": "",
                                   "country": "US"},
                             headers={"Referer": PAGE})
    except Blocked as e:
        print(f"BLOCKED: {e}")
        write_raw(SOURCE, {"source_url": AJAX, "blocked": str(e)}, [])
        return

    payload = json.loads(body)
    markup = ((payload.get("data") or {}).get("html")) or ""
    print(f"fetched {len(markup)} bytes of rendered HTML "
          f"({'cached' if cached else 'live'})")

    records = []
    for m in SLIDE_RE.finditer(markup):
        blk = m.group("body")
        attrs = dict(ATTR_RE.findall(m.group("attrs")))
        name = txt(NAME_RE.search(blk).group(1)) if NAME_RE.search(blk) else None
        if not name:
            continue
        addr = None
        am = ADDR_RE.search(blk)
        if am:
            addr = " ".join(urllib.parse.unquote_plus(am.group("q")).split())
        tel = TEL_RE.search(blk)
        em = EMAIL_RE.search(blk)
        records.append({
            "company": name,
            "address_raw": addr,
            "zip_raw": attrs.get("zip-code"),
            "phone_raw": tel.group(1).strip() if tel else None,
            "phone_10": digits(tel.group(1) if tel else None),
            "email": em.group(1).strip() if em else None,
            # Gast's card carries no website link.
            "website": None,
            "domain": None,
            "lat": attrs.get("lat"),
            "lng": attrs.get("lng"),
            "is_us": True,  # country=US is the query
            "source": SOURCE,
            "source_url": AJAX,
            "captured": CAPTURED,
        })

    stats = report(SOURCE, records)
    write_raw(SOURCE, {
        "source_name": "Gast Manufacturing (IDEX) find-a-distributor",
        "source_url": AJAX,
        "locator_page": PAGE,
        "method": "one POST, action=load_distributors, country=US, whole US list "
                  "as rendered HTML (contract read from the theme's distributor.js)",
        "request_params": {"action": "load_distributors", "country": "US",
                           "nonce": "read from gastData.nonce on the page"},
        "codes_captured_verbatim": [],
        "no_codes": "Gast publishes no type / tier / category on the record; the "
                    "only facet is country.",
        "correction_to_research_06": "US network measured at 21 distributors, not "
                                     "the segment estimate of 150-350. A "
                                     "Los-Angeles-ZIP query returns a strict "
                                     "subset of the same list.",
        "origin_requests": f.origin_requests,
        "stats": stats,
    }, records)


if __name__ == "__main__":
    main()
