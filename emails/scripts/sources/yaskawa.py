#!/usr/bin/env python3
"""S1 wave-3 — Yaskawa America sales/distributor search (Liferay portlet).

  POST /support-training/support/sales-search
       ?p_p_id=com_yaskawa_search_web_SearchWebPortlet_INSTANCE_K9E4GDthRqpS
       &p_p_lifecycle=1&..._searchType=sales
       &..._zipCode=<zip>&..._proximityType=200&..._groupList=<D09|D13|D33|D02|D23>

⚠ §5e PRODUCT-CATEGORY CODE — THIS IS THE ONE THAT MATTERS HERE.
`groupList` is a REQUIRED filter with five source-native values, each with a
human label published in the form's own <select>:

    D09 = Industrial AC Drives      D13 = HVAC Drives
    D33 = Medium Voltage Drives     D02 = Servo and Motion Controllers
    D23 = iQpump Drives

This is the axis `research/06` flagged as "the same value as Miller's
`?product_name=`". It is a **market/vertical discriminator, not just a line
card**: D13 (HVAC Drives) and D23 (iQpump, water/wastewater pumping) select
mechanical/HVAC and municipal-water channels, while D09/D02/D33 select the
industrial-MRO channel this ICP actually wants. Per §5e we sweep ALL five,
tag every record with the code AND its label, and report the distribution —
we do not average over it and we do not pre-filter. S3 decides.

A second source-native code rides on every record: the distributor tier, which
Yaskawa publishes ONLY as a badge image filename (`premier-icon.gif`,
`elite-icon.gif`, `gold-icon.gif`, `silver-icon.gif`, `dist-service-icon.gif`,
`hvac-icon.gif`, `iqpump-icon.gif`, `motion-icon.gif`). Captured verbatim,
left unmapped (§3 watch: Adaptall's `premier` flag was inverted).

Two parameter traps, both cost a wasted pull if missed:
  1. The <select> is named `groupSelect` but the value is submitted as
     **`groupList`** — the page's JS renames it. Posting `groupSelect` returns
     "No Distributor Found" with `Group:` blank on EVERY query.
  2. A state-only search is rejected client-side (city AND state required);
     `zipCode` + `proximityType` is the only clean state-independent axis, so
     coverage is a ZIP grid, not a state sweep.
"""
import re
import sys
import urllib.parse

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _polite import (CAPTURED, US_STATES, Blocked, Fetcher,  # noqa: E402
                     digits, norm_company, report, write_raw)

SOURCE = "yaskawa"
P = "_com_yaskawa_search_web_SearchWebPortlet_INSTANCE_K9E4GDthRqpS_"
PAGE = "https://www.yaskawa.com/support-training/support/sales-search"
ACTION = (PAGE + "?p_p_id=com_yaskawa_search_web_SearchWebPortlet_INSTANCE_K9E4GDthRqpS"
          "&p_p_lifecycle=1&p_p_state=normal&p_p_mode=view&" + P + "searchType=sales")

PROXIMITY = "200"

# 40-ZIP grid at 200-mile radius. Chosen for national coverage, not precision —
# results are rolled up to distinct companies, so overlap is free and gaps are not.
ZIPS = [
    "02108", "10001", "19102", "14202", "06103", "21201", "23219", "15222",
    "28202", "30303", "32801", "33130", "37201", "38103", "35203", "40202",
    "43215", "44114", "48226", "46204", "60601", "53202", "55401", "63101",
    "64106", "68102", "58102", "70112", "72201", "73102", "75201", "77002",
    "78205", "80202", "84101", "83702", "87102", "89101", "85004", "90012",
    "94105", "97204", "98104", "99201", "99501", "96813",
]

# Verbatim from the form's own <select> — code -> published label.
GROUPS = [
    ("D09", "Industrial AC Drives"),
    ("D13", "HVAC Drives"),
    ("D33", "Medium Voltage Drives"),
    ("D02", "Servo and Motion Controllers"),
    ("D23", "iQpump Drives"),
]

TAG_RE = re.compile(r"(?s)<[^>]+>")
CARD_RE = re.compile(r'(?is)<div class="span3 partner add-block[^"]*"[^>]*>(.*?)</div>')
IMG_RE = re.compile(r"\.(gif|png|jpe?g|svg)$", re.I)


def text(fragment):
    s = TAG_RE.sub("\n", fragment or "")
    for a, b in (("&amp;", "&"), ("&nbsp;", " "), ("&#039;", "'"),
                 ("&quot;", '"'), ("&lt;", "<"), ("&gt;", ">")):
        s = s.replace(a, b)
    return [ln.strip() for ln in s.split("\n") if ln.strip()]


def parse_cards(html, group_code, group_label, zipcode, url):
    """Each distributor is a `span3 partner add-block` div:
       <h5>name</h5> street / 'City, ST' / country / zip / Phone: / Miles: / badges
    """
    out = []
    for frag in CARD_RE.findall(html):
        m = re.search(r"(?is)<h5[^>]*>(.*?)</h5>", frag)
        if not m:
            continue
        company = " ".join(text(m.group(1)))
        if not company:
            continue
        # The desktop block repeats as a mobile block; read the desktop one.
        desktop = re.findall(r'(?is)<p class="hide-mob-div-wtb">(.*?)</p>', frag)
        parts = [" ".join(text(d)) for d in desktop]
        street = parts[0] if len(parts) > 0 else None
        citystate = parts[1] if len(parts) > 1 else ""
        country = parts[2] if len(parts) > 2 else None
        zip_raw = parts[3] if len(parts) > 3 else None

        city = state = None
        if citystate:
            cs = [x.strip() for x in citystate.split(",")]
            city = cs[0] or None
            if len(cs) > 1:
                tok = cs[1].strip().upper()
                state = tok if tok in US_STATES else (cs[1].strip() or None)

        ph = re.search(r"(?is)<p>\s*Phone:\s*(.*?)</p>", frag)
        phone = " ".join(text(ph.group(1))) if ph else None
        mi = re.search(r"(?is)<p>\s*Miles:\s*(.*?)</p>", frag)
        miles = " ".join(text(mi.group(1))) if mi else None

        # ── §5e tier code: published only as badge image filenames ──────────
        # Liferay document URLs are /documents/<g>/<f>/<filename>.gif/<uuid> —
        # the filename is MID-path, so rsplit('/') yields the UUID, not the tier.
        badges = re.findall(r'<img class="set-image" src="([^"]+)"', frag)
        badge_files = []
        for b in badges:
            segs = [s for s in b.split("/") if IMG_RE.search(s)]
            name = segs[-1] if segs else b.rsplit("/", 1)[-1]
            if name:
                badge_files.append(name)
        tokens = [re.sub(r"[-_]?icon$", "",
                         IMG_RE.sub("", b), flags=re.I) for b in badge_files]

        out.append({
            "company": company,
            "address_1": street,
            "city": city,
            "state": state,
            "zip_raw": zip_raw,
            "country_text": country,
            "phone_raw": phone,
            "phone_10": digits(phone),
            "email": None,
            "website": None,
            "domain": None,
            "miles_from_query": miles,
            # ── §5e codes, VERBATIM AND UNINTERPRETED ───────────────────────
            "product_group_code": group_code,
            "product_group_label": group_label,
            "tier_badges_raw": "|".join(badge_files) or None,
            "tier_tokens_raw": "|".join(tokens) or None,
            "query_zip": zipcode,
            "query_proximity_miles": PROXIMITY,
            "is_us": (country or "").strip().upper() in ("US", "USA", "UNITED STATES"),
            "source": SOURCE,
            "source_url": url,
            "captured": CAPTURED,
        })
    return out


def main():
    f = Fetcher(SOURCE, min_bytes=50000)
    try:
        base, _ = f.get(PAGE, "index.html")
    except Blocked as e:
        print(f"BLOCKED on the locator page: {e}")
        write_raw(SOURCE, {"source_url": PAGE, "blocked": str(e)}, [])
        return

    form_date = re.search(r'name="%sformDate"[^>]*value="(\d+)"' % P, base).group(1)
    legend = {}
    for name, sel in re.findall(
            r'(?is)<select[^>]*(?:name|id)="([^"]*(?:groupSelect|proximityType|stateList))"[^>]*>(.*?)</select>',
            base):
        legend[name.replace(P, "")] = {
            v: " ".join(text(t)) for v, t in
            re.findall(r'(?is)<option[^>]*value="([^"]*)"[^>]*>(.*?)</option>', sel)}

    records, refused, queries = [], [], []
    for code, label in GROUPS:
        for z in ZIPS:
            q = {P + "proximityType": PROXIMITY, P + "cityName": "",
                 P + "groupList": code, P + "zipCode": z,
                 P + "stateList": "", P + "formDate": form_date}
            url = ACTION + "&" + urllib.parse.urlencode(q)
            try:
                body, cached = f.get(url, f"q_{code}_{z}.html", data={},
                                     headers={"Referer": PAGE})
            except Blocked as e:
                print(f"  refused {code}/{z}: {e}")
                refused.append({"group": code, "zip": z, "reason": str(e)})
                continue
            got = parse_cards(body, code, label, z, url)
            no_hit = "No Distributor Found" in body
            queries.append({"group_code": code, "group_label": label, "zip": z,
                            "records": len(got), "no_distributor_found": no_hit,
                            "cached": cached, "source_url": url})
            records.extend(got)
            print(f"  {code} {label[:22]:<22} zip {z}: {len(got):>3} "
                  f"{'(cached)' if cached else ''}", flush=True)

    stats = report(SOURCE, records,
                   code_fields=("product_group_code", "product_group_label",
                                "tier_tokens_raw", "state"))

    # Vertical read-out: distinct companies per product group — the §5e check.
    per_group = {}
    for code, label in GROUPS:
        names = {norm_company(r["company"]) for r in records
                 if r["product_group_code"] == code and r.get("is_us")}
        names.discard("")
        per_group[f"{code} — {label}"] = len(names)
    print("\ndistinct US companies per product-group code (§5e):")
    for k, v in per_group.items():
        print(f"   {k:<40} {v}")

    # ── The decisive §5e test ───────────────────────────────────────────────
    # Does this code actually SORT companies, or do the same dealers carry every
    # group? Only the first case makes it a vertical discriminator. Measure the
    # cohort reachable ONLY through the off-ICP groups (D13 HVAC, D23 iQpump).
    ICP_GROUPS = {"D09", "D02", "D33"}
    OFF_GROUPS = {"D13", "D23"}
    by_name = {}
    for r in records:
        if not r.get("is_us"):
            continue
        n = norm_company(r["company"])
        if n:
            by_name.setdefault(n, set()).add(r["product_group_code"])
    only_off = {n for n, g in by_name.items() if g and not (g & ICP_GROUPS)}
    only_icp = {n for n, g in by_name.items() if g and not (g & OFF_GROUPS)}
    both = {n for n, g in by_name.items() if (g & ICP_GROUPS) and (g & OFF_GROUPS)}
    vertical_split = {
        "distinct_us_companies": len(by_name),
        "reachable_only_via_D13_D23_offICP": len(only_off),
        "reachable_only_via_D09_D02_D33_ICP": len(only_icp),
        "carry_both": len(both),
        "sample_off_icp_only": sorted(only_off)[:25],
    }
    print(f"\n§5e vertical test — distinct US companies {len(by_name)}: "
          f"ICP-groups only {len(only_icp)} · off-ICP (HVAC/iQpump) only "
          f"{len(only_off)} · both {len(both)}")

    write_raw(SOURCE, {
        "source_name": "Yaskawa America sales-search (Liferay portlet, SAP-backed)",
        "source_url": PAGE,
        "method": ("POST per (product group x ZIP); zipCode + proximityType=200mi; "
                   "state-only search is rejected client-side"),
        "product_group_vocabulary_verbatim": dict(GROUPS),
        "form_vocabulary_verbatim": legend,
        "zip_grid": ZIPS,
        "proximity_miles": PROXIMITY,
        "codes_captured_verbatim": ["product_group_code", "product_group_label",
                                    "tier_badges_raw", "tier_tokens_raw",
                                    "query_zip", "query_proximity_miles",
                                    "miles_from_query"],
        "vertical_code": ("product_group_code — D09/D13/D33/D02/D23. This is the "
                          "§5e code for this source. D13 (HVAC Drives) and D23 "
                          "(iQpump, water/wastewater) select mechanical/HVAC and "
                          "municipal channels; D09/D02/D33 select industrial MRO. "
                          "Swept in full, tagged per record, NOT pre-filtered."),
        "distinct_us_companies_per_group": per_group,
        "vertical_split_measured": vertical_split,
        "queries": queries,
        "refused": refused,
        "origin_requests": f.origin_requests,
        "stats": stats,
    }, records)


if __name__ == "__main__":
    main()
