#!/usr/bin/env python3
"""S1 wave-3 — mk North America "Sales & Support Near You" rep finder.

  GET /sales-and-support/?FormAction=Submit&territory=USA&Zip=<zip>&Category=<1|22>

(`default.aspx` 301-redirects to the directory path; hit the directory path.)

⚠ §5e SOURCE-NATIVE CODES CAPTURED VERBATIM
- `category_code` / `category_label` — the form's own product-group filter:
      **1 = Conveyor Systems, 22 = Extruded Aluminum Framing.**
  A line-card axis, swept in full and tagged per record, never pre-filtered.
- `rep_company_raw` / `rep_title_raw` — and this pair is the important one.
  `research/06` warned this source is "manufacturer's reps, not distributors."
  The page does not label that distinction with a code, but it publishes the
  employer on every row, so **`rep_company_raw == "mk North America"` is the
  in-house/independent discriminator** and `rep_title_raw` carries the role
  ("Regional Sales Manager - North Midwest" vs a distributor's own name).
  Both captured raw; `is_mk_employee` is a derived convenience flag that S3 may
  re-derive, not a filter — nothing is dropped here.
- `products_raw[]` — the per-rep product list rendered under "Products:".

**No market/vertical code.** mk sells conveyors and aluminium framing only;
there is no automotive/industrial axis of the §5e Timken kind. Measured
absence, not an assumption.
"""
import re
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _polite import (CAPTURED, US_STATES, Blocked, Fetcher, apex,  # noqa: E402
                     digits, norm_company, report, write_raw)

SOURCE = "mknorthamerica"
HOST = "https://www.mknorthamerica.com"
PAGE = HOST + "/sales-and-support/"

CATEGORIES = [("1", "Conveyor Systems"), ("22", "Extruded Aluminum Framing")]

# Same 46-ZIP national grid as the Yaskawa sweep. mk does not publish its search
# radius, so the grid is deliberately denser than the expected ~10-rep network.
ZIPS = [
    "02108", "10001", "19102", "14202", "06103", "21201", "23219", "15222",
    "28202", "30303", "32801", "33130", "37201", "38103", "35203", "40202",
    "43215", "44114", "48226", "46204", "60601", "53202", "55401", "63101",
    "64106", "68102", "58102", "70112", "72201", "73102", "75201", "77002",
    "78205", "80202", "84101", "83702", "87102", "89101", "85004", "90012",
    "94105", "97204", "98104", "99201", "99501", "96813",
]

TAG_RE = re.compile(r"(?s)<[^>]+>")
LI_RE = re.compile(r'(?is)<li[^>]*>\s*(?:<div class="rep-header">)(.*?)(?=<li[^>]*>\s*<div class="rep-header">|</ul>\s*</div>)')


def text(fragment):
    s = TAG_RE.sub("\n", fragment or "")
    for a, b in (("&amp;", "&"), ("&nbsp;", " "), ("&#039;", "'"),
                 ("&quot;", '"'), ("&lt;", "<"), ("&gt;", ">"), ("\xa0", " ")):
        s = s.replace(a, b)
    return [ln.strip() for ln in s.split("\n") if ln.strip()]


def span(frag, cls):
    m = re.search(r'(?is)<span class="%s">(.*?)</span>' % cls, frag)
    return " ".join(text(m.group(1))) if m else None


def parse_address(frag):
    """`rep-address` is free-form, `<br />`-separated:
         'Naperville IL' / 'United States'
         '8919 Southeastern Avenue' / 'Indianapolis IN 46239' / 'United States'
    Split on the breaks FIRST — flattening to one string glues the street to
    the city and every record lands with a street address in `city`."""
    m = re.search(r'(?is)<span class="rep-address">(.*?)</span>', frag)
    if not m:
        return {"rep_address_raw": None, "address_1": None, "city": None,
                "state": None, "zip_raw": None, "country_text": None}
    segs = [" ".join(text(s)) for s in re.split(r"(?i)<br\s*/?>", m.group(1))]
    segs = [s for s in segs if s]
    raw = " / ".join(segs)
    country = None
    if segs and re.fullmatch(r"(?i)united states|usa|u\.s\.a\.?", segs[-1].strip()):
        country = segs.pop().strip()
    loc = segs[-1] if segs else ""
    street = " ".join(segs[:-1]) or None
    city = state = zip_raw = None
    mm = re.search(r"^(.*?)[,\s]+([A-Z]{2})(?:\s+(\d{5})(?:-\d{4})?)?$", loc.strip())
    if mm and mm.group(2) in US_STATES:
        city = mm.group(1).strip(" ,") or None
        state = mm.group(2)
        zip_raw = mm.group(3)
    elif loc:
        city = loc.strip() or None
    return {"rep_address_raw": raw or None, "address_1": street, "city": city,
            "state": state, "zip_raw": zip_raw, "country_text": country}


def parse_reps(html, code, label, zipcode, url):
    # Bound on the results container, NOT on `</ul>\s*</div>`: each rep's
    # "Products:" block is a nested <ul> that closes with exactly that shape, so
    # the naive boundary truncates the block mid-record and loses products_raw.
    m = re.search(r'(?is)<div class="distributor-results">(.*?)<!--\s*/distributor-results',
                  html)
    if not m:
        m = re.search(r'(?is)<ul class="rep-list">(.*)', html)
        if not m:
            return []
    block = m.group(1)
    out = []
    # Split on the rep-header boundary, NOT on <li> — the per-rep <li> contains a
    # nested <ul><li>product</li></ul>, so an <li> split truncates every record
    # right before its "Products:" block and silently loses products_raw.
    for frag in re.split(r'(?is)(?=<div class="rep-header">)', block):
        if "rep-name" not in frag:
            continue
        name = span(frag, "rep-name")
        company = span(frag, "rep-company")
        addr = parse_address(frag)
        tel = re.search(r'href="tel:([^"]+)"', frag)
        mail = re.search(r'href="mailto:([^"?]+)"', frag)
        site = re.search(r'href="(https?://(?!www\.mknorthamerica)[^"]+)"', frag)
        prods = []
        pm = re.search(r'(?is)<div class="rep-products">(.*?)</div>', frag)
        if pm:
            prods = [" ".join(text(li)) for li in
                     re.findall(r"(?is)<li[^>]*>(.*?)</li>", pm.group(1))]
            prods = [p for p in prods if p]
        out.append({
            "company": (company or name or "").strip() or None,
            "rep_name_raw": name,
            "rep_company_raw": company,
            "rep_title_raw": span(frag, "rep-title"),
            "rep_address_raw": addr["rep_address_raw"],
            "address_1": addr["address_1"],
            "city": addr["city"],
            "state": addr["state"],
            "zip_raw": addr["zip_raw"],
            "country_text": addr["country_text"],
            "phone_raw": tel.group(1).strip() if tel else None,
            "phone_10": digits(tel.group(1)) if tel else None,
            "email": mail.group(1).strip() if mail else None,
            "website": site.group(1) if site else None,
            "domain": apex(site.group(1)) if site else None,
            # ── §5e codes, verbatim and unmapped ────────────────────────────
            "category_code": code,
            "category_label": label,
            "products_raw": prods or None,
            "is_mk_employee": norm_company(company or "") == norm_company("mk North America"),
            "query_zip": zipcode,
            "is_us": True,
            "source": SOURCE,
            "source_url": url,
            "captured": CAPTURED,
        })
    return out


def main():
    f = Fetcher(SOURCE, min_bytes=3000)
    try:
        base, _ = f.get(PAGE, "index.html")
    except Blocked as e:
        print(f"BLOCKED: {e}")
        write_raw(SOURCE, {"source_url": PAGE, "blocked": str(e)}, [])
        return

    form_vocab = {}
    for name, sel in re.findall(r'(?is)<select[^>]*name="([^"]*)"[^>]*>(.*?)</select>', base):
        form_vocab[name] = {v: " ".join(text(t)) for v, t in
                            re.findall(r'(?is)<option[^>]*value="([^"]*)"[^>]*>(.*?)</option>', sel)}

    records, refused, queries = [], [], []
    for code, label in CATEGORIES:
        for z in ZIPS:
            url = f"{PAGE}?FormAction=Submit&territory=USA&Zip={z}&Category={code}"
            try:
                body, cached = f.get(url, f"q_c{code}_{z}.html")
            except Blocked as e:
                print(f"  refused c{code}/{z}: {e}")
                refused.append({"category": code, "zip": z, "reason": str(e)})
                continue
            got = parse_reps(body, code, label, z, url)
            queries.append({"category_code": code, "category_label": label,
                            "zip": z, "records": len(got), "cached": cached,
                            "source_url": url})
            records.extend(got)
            print(f"  c{code} {label[:26]:<26} zip {z}: {len(got):>3}"
                  f"{'  (cached)' if cached else ''}", flush=True)

    stats = report(SOURCE, records,
                   code_fields=("category_code", "category_label",
                                "rep_company_raw", "rep_title_raw", "is_mk_employee"))

    independents = {norm_company(r["company"]) for r in records if not r["is_mk_employee"]}
    independents.discard("")
    inhouse = {norm_company(r["rep_name_raw"] or "") for r in records if r["is_mk_employee"]}
    inhouse.discard("")
    print(f"\ndistinct non-mk companies (independent reps/distributors): {len(independents)}")
    print(f"distinct mk employees (in-house sales, NOT prospects):     {len(inhouse)}")

    write_raw(SOURCE, {
        "source_name": "mk North America — Sales & Support Near You (rep finder)",
        "source_url": PAGE,
        "method": "GET per (product category x ZIP); territory=USA; ASP.NET, no auth",
        "category_vocabulary_verbatim": dict(CATEGORIES),
        "form_vocabulary_verbatim": form_vocab,
        "zip_grid": ZIPS,
        "codes_captured_verbatim": ["category_code", "category_label",
                                    "rep_company_raw", "rep_title_raw",
                                    "products_raw", "query_zip"],
        "vertical_code": None,
        "vertical_code_note": (
            "MEASURED ABSENCE of a market/vertical code. The consequential "
            "split on this source is EMPLOYER, not vertical: rep_company_raw "
            "separates mk's own regional sales managers from independent reps "
            "and distributors. Captured raw; nothing dropped here."),
        "distinct_non_mk_companies": len(independents),
        "distinct_mk_employees": len(inhouse),
        "queries": queries,
        "refused": refused,
        "origin_requests": f.origin_requests,
        "stats": stats,
    }, records)


if __name__ == "__main__":
    main()
