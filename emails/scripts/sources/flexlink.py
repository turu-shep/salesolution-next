#!/usr/bin/env python3
"""S1 wave-3 — FlexLink partner list (Drupal, facet-filtered).

  GET /en/partners_list?field_ptn_country_target_id=85            (US slice)
  GET /en/partners_list?...&field_ptn_category_target_id=49|50    (tier decode)
  GET /en/partners/{slug}                                          (per partner)

§5e SOURCE-NATIVE CODES CAPTURED VERBATIM
- `partner_level_code` / `partner_level_label` — the `field_ptn_category_target_id`
  facet. **49 = AUTHORIZED PARTNER, 50 = BUSINESS PARTNER.** The list's own
  "Partner Level" column renders EMPTY for every row, so the only way to read
  the level is to re-run the US slice once per facet value and diff the
  membership. That is exactly the §5e lesson — the code was captured in the
  page, unreadable where you'd expect it, and had to be decoded deliberately.
- `country_code` / `country_label` — `field_ptn_country_target_id`; 85 = USA.

**No vertical/market code.** FlexLink is conveyors only; the facet vocabulary
carries a commercial tier and a country, nothing resembling Timken's
automotive/industrial split. Reported as a measured absence.

The unfiltered list is 83 partners and skews European; the US facet is 6.
There is a `Partner login` link into a SharePoint tenant — a credential wall,
out of scope and untouched (see `_polite` docstring).
"""
import re
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _polite import (CAPTURED, US_STATES, Blocked, Fetcher, apex,  # noqa: E402
                     digits, report, write_raw)

SOURCE = "flexlink"
HOST = "https://partners.flexlink.com"
LIST = HOST + "/en/partners_list"
US_COUNTRY = ("85", "USA")
LEVELS = [("49", "AUTHORIZED PARTNER"), ("50", "BUSINESS PARTNER")]

TAG_RE = re.compile(r"(?s)<[^>]+>")
ZIP_RE = re.compile(r"\b(\d{5})(?:-\d{4})?\b")


def text(fragment):
    s = TAG_RE.sub(" ", fragment or "")
    for a, b in (("&amp;", "&"), ("&nbsp;", " "), ("&#039;", "'"),
                 ("&quot;", '"'), ("&lt;", "<"), ("&gt;", ">"), ("\xa0", " ")):
        s = s.replace(a, b)
    return " ".join(s.split())


def parse_rows(html):
    """The list is one <table>: Name | Partner Level | Country | Description."""
    m = re.search(r"(?is)<table.*?</table>", html)
    if not m:
        return []
    out = []
    for tr in re.findall(r"(?is)<tr[^>]*>(.*?)</tr>", m.group(0)):
        cells = re.findall(r"(?is)<td[^>]*>(.*?)</td>", tr)
        if len(cells) < 3:
            continue
        href = re.search(r'href="([^"]+)"', cells[0])
        out.append({
            "company": text(cells[0]) or None,
            "partner_level_column": text(cells[1]) or None,   # verbatim; empty in practice
            "country_column": text(cells[2]) or None,
            "description": text(cells[3])[:1200] if len(cells) > 3 else None,
            "detail_path": href.group(1) if href else None,
        })
    return out


def parse_detail(html):
    body = re.sub(r"(?is)<(script|style|noscript|svg)[^>]*>.*?</\1>", " ", html)
    m = re.search(r'(?is)<(?:main|article)[^>]*>(.*?)</(?:main|article)>', body)
    seg = m.group(1) if m else body
    rec = {}
    ext = [u for u in re.findall(r'href="(https?://[^"]+)"', seg)
           if "flexlink" not in u and "sharepoint" not in u.lower()
           and not re.search(r"(facebook|twitter|linkedin|youtube|instagram|x\.com)", u, re.I)]
    rec["website"] = ext[0] if ext else None
    mail = re.findall(r"href=\"mailto:([^\"?]+)\"", seg)
    rec["email"] = mail[0].strip() if mail else None
    tel = re.findall(r"href=\"tel:([^\"]+)\"", seg)
    rec["phone_raw"] = tel[0].strip() if tel else None
    txt = text(seg)
    rec["detail_text"] = txt[:2000] or None
    z = ZIP_RE.search(txt)
    rec["zip_raw"] = z.group(1) if z else None
    st = re.search(r"\b([A-Z]{2})\s+\d{5}\b", txt)
    rec["state"] = st.group(1) if st and st.group(1) in US_STATES else None
    return rec


def main():
    f = Fetcher(SOURCE, min_bytes=5000)
    facets = {"country_options": {}, "level_options": {}}
    try:
        base, _ = f.get(LIST, "list_p0.html")
        for name, store in (("field_ptn_country_target_id", "country_options"),
                            ("field_ptn_category_target_id", "level_options")):
            m = re.search(r'(?is)<select[^>]*name="%s"[^>]*>(.*?)</select>' % name, base)
            if m:
                facets[store] = {v: text(t) for v, t in
                                 re.findall(r'(?is)<option[^>]*value="([^"]*)"[^>]*>(.*?)</option>',
                                            m.group(1))}
        us_url = f"{LIST}?field_ptn_country_target_id={US_COUNTRY[0]}"
        body, cached = f.get(us_url, "list_us.html")
        rows = parse_rows(body)
        print(f"US slice: {len(rows)} rows ({'cached' if cached else 'live'})")

        # ── decode the empty "Partner Level" column via the facet itself ────
        level_of = {}
        level_counts = {}
        for code, label in LEVELS:
            u = f"{us_url}&field_ptn_category_target_id={code}"
            b2, c2 = f.get(u, f"list_us_level{code}.html")
            names = [r["company"] for r in parse_rows(b2)]
            level_counts[f"{code}={label}"] = len(names)
            print(f"  level {code} ({label}): {len(names)} US rows")
            for n in names:
                level_of[n] = (code, label, u)
    except Blocked as e:
        print(f"BLOCKED: {e}")
        write_raw(SOURCE, {"source_url": LIST, "blocked": str(e)}, [])
        return

    records, refused = [], []
    for r in rows:
        code, label, level_url = level_of.get(r["company"], (None, None, None))
        detail = {}
        durl = None
        if r["detail_path"]:
            durl = HOST + r["detail_path"] if r["detail_path"].startswith("/") else r["detail_path"]
            slug = durl.rstrip("/").rsplit("/", 1)[-1]
            try:
                db, dc = f.get(durl, f"detail_{slug}.html", timeout=120)
                detail = parse_detail(db)
            except Blocked as e:
                print(f"  refused {slug}: {e}")
                refused.append({"url": durl, "reason": str(e)})
        rec = {
            "company": r["company"],
            "detail_url": durl,
            "description": r["description"],
            "address_1": None,
            "city": None,
            "state": detail.get("state"),
            "zip_raw": detail.get("zip_raw"),
            "country_text": r["country_column"],
            "phone_raw": detail.get("phone_raw"),
            "phone_10": digits(detail.get("phone_raw")),
            "email": detail.get("email"),
            "website": detail.get("website"),
            "domain": apex(detail.get("website")),
            "detail_text": detail.get("detail_text"),
            # ── §5e codes, verbatim and unmapped ────────────────────────────
            "country_code": US_COUNTRY[0],
            "country_label": US_COUNTRY[1],
            "partner_level_code": code,
            "partner_level_label": label,
            "partner_level_column": r["partner_level_column"],
            "partner_level_source_url": level_url,
            "is_us": (r["country_column"] or "").strip().upper() in ("USA", "US", "UNITED STATES"),
            "source": SOURCE,
            "source_url": f"{LIST}?field_ptn_country_target_id={US_COUNTRY[0]}",
            "captured": CAPTURED,
        }
        records.append(rec)
        print(f"  {rec['company']!r} level={label!r} web={rec['domain']}")

    stats = report(SOURCE, records,
                   code_fields=("partner_level_code", "partner_level_label",
                                "partner_level_column", "country_label"))
    write_raw(SOURCE, {
        "source_name": "FlexLink partner list (Drupal facet-filtered)",
        "source_url": f"{LIST}?field_ptn_country_target_id={US_COUNTRY[0]}",
        "list_page": LIST,
        "method": ("one GET for the US country facet, one GET per partner-level "
                   "facet to decode the empty Partner Level column, one GET per "
                   "partner detail page"),
        "facet_vocabulary_verbatim": facets,
        "partner_level_counts_us": level_counts,
        "codes_captured_verbatim": ["partner_level_code", "partner_level_label",
                                    "partner_level_column", "country_code",
                                    "country_label"],
        "vertical_code": None,
        "vertical_code_note": (
            "MEASURED ABSENCE. FlexLink's only facets are country and a "
            "commercial partner level (AUTHORIZED vs BUSINESS). No market or "
            "vertical axis exists, so the §5e Timken failure mode cannot occur "
            "here. The partner level IS captured verbatim and left unmapped — "
            "per §3 it must not be read as a quality signal until validated."),
        "credential_wall_untouched": "partners.flexlink.com links a SharePoint 'Partner login'; not attempted",
        "refused": refused,
        "origin_requests": f.origin_requests,
        "stats": stats,
    }, records)


if __name__ == "__main__":
    main()
