#!/usr/bin/env python3
"""S1 adjacent wave — Sullair (Hitachi Global Air Power) distributor locator.

**Static-file source, no API.** `america.sullair.com/en/distributors` is Drupal 10
and its locator is a jQuery page that `jQuery.ajax`-GETs plain CSV files out of
the public files directory. The base path is not guessed — it is declared in the
page's own inline script:

    public_path = "/sites/default/files/";

so the four US-relevant files are ordinary static assets. No endpoint discovery,
no render, no session. Four GETs total, paced by `_polite.Fetcher`.

**robots.txt** (`america.sullair.com/robots.txt`, read before any fetch) is the
stock Drupal file. Its Disallow set is: `/core/`, `/profiles/`, the README /
`web.config` files (incl. `/sites/README.txt`, `/themes/README.txt`), and the
clean-URL paths `/admin/`, `/comment/reply/`, `/filter/tips`, `/node/add/`,
`/search/`, `/user/register`, `/user/password`, `/user/login`, `/user/logout`,
`/media/oembed`, `/*/media/oembed` — each repeated under `/index.php/`.
**`/sites/default/files/` is NOT among them**, and neither is
`/themes/custom/`. Only `/sites/README.txt` (a single file) is blocked, not the
files directory. No robots override is involved in this source.

**How the two file families relate (measured, not assumed).**
`*_distributor_list.csv` is the company table — 20 columns, one row per dealer
*branch* (name, street, city, state, ZIP, country, phone, fax, contact email +
first/last name, website, lat/lng, keyed on `id_no` = account_branch).
`stationary_usMap.csv` is a **two-column join table — `ZIP,id_no` — with no
company fields at all**: 49,815 ZIP→dealer territory rows over 115 distinct
dealers. It is a coverage index, not a second list of companies. The page's
`usSearch()` proves the direction: it filters `stationary_data` by ZIP, then
looks the id_no up in `stationary_lookup_sheet` and returns *that* record. So
the merge is lookup + territory join, not a union of two record sets — every
company comes from the two `_distributor_list.csv` files.

Consequences, all recorded rather than worked around:
  - `/themes/custom/Sullair/library/data/usMap.csv` returns **HTTP 404**. It is
    also commented out in the live page JS, so the portable US path never loads
    it; portable US search filters `lookup_sheet` on `country === "USA"` and
    radius directly off the lat/lng in the list. Nothing is lost.
  - The canada / mexico / international map files are deliberately not fetched.
    They are the same shape of join table (`internationalSearch()` maps their
    rows back onto the same lookup sheets by `id_no`) and carry no company
    fields, and the two distributor lists are already global rather than
    US-only. No US record is reachable only through them.
  - 7 `id_no` values in `stationary_usMap.csv` have ZIP territory but no row in
    `stationary_distributor_list.csv` — dangling references to dealers the
    source does not publish. They cannot be recovered (the map has no company
    data). Counted in `stats.map_join`, not invented.

⚠ §5i SOURCE-NATIVE CODES, CAPTURED VERBATIM AND UNINTERPRETED:
  - `product_line_raw` — Sullair's own split, taken from *which file* the row
    came from: `portable` (towable/rental air — construction, rental fleets,
    road work) vs `stationary` (plant air — the industrial-MRO ICP) vs
    `portable|stationary` where the same branch is in both. 79 branches overlap.
    This is the vertical code for this source. Never averaged over.
  - `main_office_raw` — HQ-vs-branch marker, dirty as published: `X`, `x`, `?`,
    `X?`, blank.
  - `no_map_raw` — the source's suppress-from-map flag (`X` / blank).
  - `search_notes_raw` — present in the schema, empty on 100% of rows.
  - `id_no_raw` — dealer account number; the `_NNN` suffix is the branch index.

⚠ The `000000_*` rows are **Hitachi Global Air Power itself** (1 Sullair Way,
Michigan City IN — the manufacturer, Sullair's parent), not dealers.
`000000_000` is the fallback the JS returns when a radius search finds nothing.
Flagged `manufacturer_own_record` and reported separately so it never counts as
a prospect.
"""
import csv
import io
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402
from _polite import (US_STATES, Blocked, Fetcher, apex, digits,  # noqa: E402
                     norm_company, report, write_raw)

_polite.CAPTURED = "2026-08-03"
CAPTURED = _polite.CAPTURED

SOURCE = "sullair"
PAGE = "https://america.sullair.com/en/distributors"
# Declared by the page itself: public_path = "/sites/default/files/";
PUBLIC = "https://america.sullair.com/sites/default/files/data/"
THEMES = "https://america.sullair.com/themes/custom/Sullair/library/data/"

LISTS = [  # (product_line code, url)
    ("portable", PUBLIC + "portable_distributor_list.csv"),
    ("stationary", PUBLIC + "stationary_distributor_list.csv"),
]
MAPS = [  # ZIP -> id_no territory join tables
    ("stationary_usMap.csv", PUBLIC + "stationary_usMap.csv"),
    ("usMap.csv", THEMES + "usMap.csv"),  # commented out in the page JS
]

STATE_ABBR = {
    "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR",
    "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE",
    "district of columbia": "DC", "florida": "FL", "georgia": "GA", "hawaii": "HI",
    "idaho": "ID", "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS",
    "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
    "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS",
    "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV",
    "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
    "north carolina": "NC", "north dakota": "ND", "ohio": "OH", "oklahoma": "OK",
    "oregon": "OR", "pennsylvania": "PA", "rhode island": "RI",
    "south carolina": "SC", "south dakota": "SD", "tennessee": "TN", "texas": "TX",
    "utah": "UT", "vermont": "VT", "virginia": "VA", "washington": "WA",
    "west virginia": "WV", "wisconsin": "WI", "wyoming": "WY",
    "puerto rico": "PR", "guam": "GU", "virgin islands": "VI",
}


def clean(row, key):
    return (row.get(key) or "").strip() or None


def state_of(raw):
    s = (raw or "").strip()
    if not s:
        return None
    return s.upper() if s.upper() in US_STATES else STATE_ABBR.get(s.lower())


def parse_csv(body):
    """The files are UTF-8 with a BOM and CRLF; header goes back verbatim."""
    text = body.lstrip("﻿")
    header = text.split("\n", 1)[0].rstrip("\r")
    rows = list(csv.DictReader(io.StringIO(text)))
    return header, rows


def addr_key(row):
    """Second merge tier. The two files run SEPARATE id_no namespaces for the
    same physical branch — Ring Power's Pompano Beach yard is 605274_004 in the
    portable list and 602574_003 in the stationary one — so id_no alone
    under-merges. Only used when there is a real street address to key on."""
    if not (row["address_1"] and row["city"]):
        return None
    street = "".join(c for c in row["address_1"].lower() if c.isalnum() or c == " ")
    return ("ad", norm_company(row["company"]), " ".join(street.split()),
            row["city"].lower().strip(), row["state"])


def absorb(prev, rec, url, line):
    """Fold `rec` into `prev`: accumulate the codes, fill the blanks."""
    prev["product_line_raw"] = "|".join(
        sorted(set(prev["product_line_raw"].split("|") + [line])))
    prev["source_url"] = "|".join(
        dict.fromkeys(prev["source_url"].split("|") + [url]))
    if rec["id_no_raw"]:  # both account numbers kept — neither is discarded
        prev["id_no_raw"] = "|".join(
            dict.fromkeys((prev["id_no_raw"] or "").split("|") + [rec["id_no_raw"]]))
    for fld, val in rec.items():
        if val and not prev.get(fld):
            prev[fld] = val


def main():
    f = Fetcher(SOURCE, min_bytes=50)
    fetched, headers, dropped_blank = [], {}, 0
    records, by_id, by_addr = [], {}, {}
    merged_on_id = merged_on_addr = 0

    for line, url in LISTS:
        try:
            body, cached = f.get(url, url.rsplit("/", 1)[1], headers={
                "Referer": PAGE, "Accept": "text/csv,text/plain,*/*"})
        except Blocked as e:
            print(f"BLOCKED: {url} — {e}")
            fetched.append({"url": url, "status": "blocked", "detail": str(e)})
            continue
        header, rows = parse_csv(body)
        headers[url.rsplit("/", 1)[1]] = header
        fetched.append({"url": url, "status": "ok", "bytes": len(body),
                        "rows": len(rows), "cached": cached, "header": header})
        print(f"{url.rsplit('/', 1)[1]}: {len(rows)} rows "
              f"({'cached' if cached else 'live'})")
        print(f"  HEADER VERBATIM: {header}")

        for r in rows:
            company = clean(r, "name")
            id_no = clean(r, "id_no")
            if not company and not id_no:
                dropped_blank += 1  # trailing empty lines in the file
                continue
            country = (r.get("country") or "").strip()
            st = state_of(r.get("state"))
            website = clean(r, "website")
            rec = {
                "company": company,
                "address_1": clean(r, "st_address1"),
                "address_2": clean(r, "st_address2"),
                "po_address": clean(r, "po_address"),
                "city": clean(r, "city"),
                "state": st,
                "zip_raw": clean(r, "zip_code"),
                "country_raw": country or None,
                "phone_raw": clean(r, "telephone"),
                "phone_10": digits(r.get("telephone")),
                "fax_raw": clean(r, "fax"),
                "email": clean(r, "email address"),
                "website": website,
                "domain": apex(website),
                "contact_first_name": clean(r, "first_name"),
                "contact_last_name": clean(r, "last_name"),
                "lat": clean(r, "latitude"),
                "lng": clean(r, "longitude"),
                # ── §5i SOURCE-NATIVE CODES, VERBATIM AND UNINTERPRETED ──────
                "id_no_raw": id_no,
                "product_line_raw": line,
                "main_office_raw": clean(r, "main office"),
                "no_map_raw": clean(r, "no_map"),
                "search_notes_raw": clean(r, "search_notes"),
                "stationary_zip_territories": 0,  # filled from the map join
                "manufacturer_own_record": bool(id_no and id_no.startswith("000000_")),
                "is_us": country.upper() == "USA" and st in US_STATES,
                "source": SOURCE,
                "source_url": url,
                "captured": CAPTURED,
            }
            ak = addr_key(rec)
            prev = by_id.get(id_no) if id_no else None
            if prev is not None:
                merged_on_id += 1
            elif ak is not None and ak in by_addr:
                prev = by_addr[ak]
                merged_on_addr += 1
            if prev is not None:  # same branch published in both product lines
                absorb(prev, rec, url, line)
                if id_no:
                    by_id.setdefault(id_no, prev)
                continue
            records.append(rec)
            if id_no:
                by_id[id_no] = rec
            if ak is not None:
                by_addr.setdefault(ak, rec)

    # ── the ZIP -> id_no territory join (coverage index, not a record source) ─
    map_stats = {}
    for name, url in MAPS:
        try:
            body, cached = f.get(url, name, headers={
                "Referer": PAGE, "Accept": "text/csv,text/plain,*/*"})
        except Blocked as e:
            print(f"BLOCKED: {url} — {e}")
            fetched.append({"url": url, "status": "blocked", "detail": str(e)})
            map_stats[name] = {"status": "blocked", "detail": str(e)}
            continue
        header, rows = parse_csv(body)
        headers[name] = header
        fetched.append({"url": url, "status": "ok", "bytes": len(body),
                        "rows": len(rows), "cached": cached, "header": header})
        print(f"{name}: {len(rows)} rows ({'cached' if cached else 'live'})")
        print(f"  HEADER VERBATIM: {header}")

        counts = {}
        for r in rows:
            ident = (r.get("id_no") or "").strip()
            if ident:
                counts[ident] = counts.get(ident, 0) + 1
        known = set()
        for rec in records:  # id_no_raw is pipe-joined after a cross-list merge
            ids = [i for i in (rec["id_no_raw"] or "").split("|") if i]
            known.update(ids)
            rec["stationary_zip_territories"] += sum(counts.get(i, 0) for i in ids)
        dangling = sorted(set(counts) - known)
        map_stats[name] = {
            "status": "ok", "zip_rows": len(rows),
            "distinct_dealers": len(counts),
            "dangling_id_no_not_in_any_list": dangling,
            "note": "two-column ZIP,id_no join table — no company fields",
        }
        print(f"  {len(counts)} distinct dealers, {len(dangling)} dangling id_no")

    own = [r for r in records if r["manufacturer_own_record"]]
    stats = report(SOURCE, records, code_fields=("product_line_raw",
                                                 "main_office_raw",
                                                 "no_map_raw",
                                                 "search_notes_raw"))
    us = [r for r in records if r["is_us"]]
    dealer_names = {norm_company(r["company"]) for r in us
                    if not r["manufacturer_own_record"]}
    dealer_names.discard("")
    stats["us_dealer_companies_excl_manufacturer"] = len(dealer_names)
    stats["manufacturer_own_rows"] = len(own)
    stats["dropped_blank_rows"] = dropped_blank
    stats["merged_branches_on_id_no"] = merged_on_id
    stats["merged_branches_on_name_address"] = merged_on_addr
    stats["map_join"] = map_stats
    print(f"cross-list merges: {merged_on_id} on id_no, "
          f"{merged_on_addr} on name+address")
    print(f"US companies excluding the manufacturer's own rows: {len(dealer_names)}")
    print(f"manufacturer's own rows (Hitachi Global Air Power): {len(own)}")
    print(f"blank trailing rows dropped: {dropped_blank}")

    write_raw(SOURCE, {
        "source_name": "Sullair (Hitachi Global Air Power) distributor locator",
        "source_url": [u for _, u in LISTS] + [u for _, u in MAPS],
        "locator_page": PAGE,
        "method": "static CSV files GET straight out of the Drupal public files "
                  "directory; the base path is declared by the locator page's own "
                  "inline script (public_path = \"/sites/default/files/\"). No "
                  "render, no session, no API. Files parsed with the stdlib csv "
                  "module exactly as the page parses them with jQuery.csv.",
        "robots_check": {
            "url": "https://america.sullair.com/robots.txt",
            "verdict": "/sites/default/files/ is NOT disallowed, and neither is "
                       "/themes/custom/. The stock-Drupal Disallow set is "
                       "directories /core/ and /profiles/, the README and "
                       "web.config files, and the clean-URL paths below (each "
                       "repeated under /index.php/). Only /sites/README.txt — a "
                       "single file — sits under /sites/, not the files dir.",
            "disallow_lines_verbatim": [
                "Disallow: /core/", "Disallow: /profiles/",
                "Disallow: /README.md",
                "Disallow: /composer/Metapackage/README.txt",
                "Disallow: /composer/Plugin/ProjectMessage/README.md",
                "Disallow: /composer/Plugin/Scaffold/README.md",
                "Disallow: /composer/Plugin/VendorHardening/README.txt",
                "Disallow: /composer/Template/README.txt",
                "Disallow: /modules/README.txt", "Disallow: /sites/README.txt",
                "Disallow: /themes/README.txt", "Disallow: /web.config",
                "Disallow: /admin/", "Disallow: /comment/reply/",
                "Disallow: /filter/tips", "Disallow: /node/add/",
                "Disallow: /search/", "Disallow: /user/register",
                "Disallow: /user/password", "Disallow: /user/login",
                "Disallow: /user/logout", "Disallow: /media/oembed",
                "Disallow: /*/media/oembed",
                "Disallow: /index.php/admin/",
                "Disallow: /index.php/comment/reply/",
                "Disallow: /index.php/filter/tips",
                "Disallow: /index.php/node/add/",
                "Disallow: /index.php/search/",
                "Disallow: /index.php/user/password",
                "Disallow: /index.php/user/register",
                "Disallow: /index.php/user/login",
                "Disallow: /index.php/user/logout",
                "Disallow: /index.php/media/oembed",
                "Disallow: /index.php/*/media/oembed",
            ],
            "override_used": "none — no robots override is involved in this source",
        },
        "csv_headers_verbatim": headers,
        "merge_model": "lookup + territory join, NOT a union. The two "
                       "*_distributor_list.csv files are the only company tables "
                       "(20 columns, one row per dealer branch, keyed on id_no). "
                       "*Map.csv is a two-column ZIP,id_no coverage index with no "
                       "company fields; the page's usSearch() filters it by ZIP "
                       "then returns the matching lookup-sheet record. Branches "
                       "present in both product lines are merged and carry "
                       "product_line_raw='portable|stationary'. Two merge tiers: "
                       "id_no first, then name+street+city+state — the files run "
                       "SEPARATE id_no namespaces for the same physical US branch "
                       "(Ring Power Pompano Beach is 605274_004 portable and "
                       "602574_003 stationary), so id_no alone under-merges. "
                       "Both account numbers are kept, pipe-joined in id_no_raw.",
        "codes_captured_verbatim": ["product_line_raw", "main_office_raw",
                                    "no_map_raw", "search_notes_raw", "id_no_raw"],
        "vertical_code": "product_line_raw — the source's own split. `stationary` "
                         "is plant air (industrial-MRO ICP); `portable` is "
                         "towable/rental air and skews to construction, rental "
                         "fleets and road work. Derived from which file the row "
                         "came from, since the split is the file split. Not "
                         "interpreted further, not averaged over.",
        "manufacturer_own_records": "id_no 000000_* = Hitachi Global Air Power "
                                    "itself (1 Sullair Way, Michigan City IN), "
                                    "the parent manufacturer, not a dealer. "
                                    "000000_000 is the JS no-results fallback. "
                                    "Flagged, never counted as a prospect.",
        "not_fetched": {
            "portable_canadaMap.csv / portable_internationalMap.csv / "
            "portable_mexicoMap.csv / stationary_canadaMap.csv / "
            "stationary_internationalMap.csv / stationary_mexicoMap.csv":
                "same shape of join table — internationalSearch() maps their rows "
                "back onto the same lookup sheets by id_no and they carry no "
                "company fields. Both distributor lists are global, not US-only, "
                "so no US record is reachable only through them.",
        },
        "origin_requests": f.origin_requests,
        "stats": stats,
    }, records)


if __name__ == "__main__":
    main()
