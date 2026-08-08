#!/usr/bin/env python3
"""S1 wave-3 — Interroll "Rolling On Interroll" (ROI) US partner network.

  GET  /en/global-partner-network/explore/north-am/u-s-a.html          (page 1)
  GET  /en/global-partner-network/explore/north-am/u-s-a.html?start=9  (page 2)
  GET  /en/global-partner-network/explore/north-am/u-s-a/{slug}.html   (per partner)

Static Joomla. No anti-bot posture, no JSON API. `research/06` measured 13 US
partners; this pull measures 14 (9 on page 1, 5 on page 2).

§5e SOURCE-NATIVE CODES CAPTURED VERBATIM
- `approved_logo_raw` — the ROI partner tier, published only as an image
  filename (`/images/approved-logos/approved-accelerator.png`). The site's nav
  calls these "The ROI Partner categories". Captured as the raw basename and
  the token after `approved-`; NEVER mapped to a quality ranking (§3 watch:
  Adaptall's `premier` flag was inverted).
- `solutions_raw[]` — the "Interroll Solutions / Certified Know-how" block. A
  product/technology line card, NOT a brand list, so S2 must route it to
  `line_card[]` and leave `brand_authorized[]` as ['Interroll'] (§1).
- `breadcrumb_category` — the locator's own geography category ("U.S.A.").

**No vertical code is exposed by this source.** Interroll is conveyors only;
there is no automotive/industrial split of the kind that collapsed Timken.
Reported as a measured absence, not as an assumption.
"""
import json
import re
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from _polite import (CAPTURED, Blocked, Fetcher, apex, digits,  # noqa: E402
                     report, write_raw)

SOURCE = "interroll"
HOST = "https://www.rollingoninterroll.com"
INDEX = HOST + "/en/global-partner-network/explore/north-am/u-s-a.html"
INDEX_PAGES = [(INDEX, "index_p1.html"), (INDEX + "?start=9", "index_p2.html")]

LINK_RE = re.compile(r'href="(/en/global-partner-network/explore/north-am/u-s-a/[^"]+\.html)"')
TAG_RE = re.compile(r"(?s)<[^>]+>")


def text(fragment):
    s = TAG_RE.sub(" ", fragment or "")
    for a, b in (("&amp;", "&"), ("&nbsp;", " "), ("&#160;", " "),
                 ("&quot;", '"'), ("&#039;", "'"), ("&rsquo;", "’"),
                 ("&hellip;", "…"), ("&lt;", "<"), ("&gt;", ">")):
        s = s.replace(a, b)
    return " ".join(s.split())


def parse_detail(html, url, slug):
    """Fields live in `field-entry partner-*` divs plus the h1 headline."""
    rec = {"slug": slug}

    m = re.search(r'(?is)<h1[^>]*itemprop="headline"[^>]*>(.*?)</h1>', html)
    rec["company"] = text(m.group(1)) if m else None

    m = re.search(r'(?is)<div class="field-entry partner-phone">(.*?)</div>', html)
    rec["phone_raw"] = text(m.group(1)) or None if m else None

    m = re.search(r'(?is)<div class="field-entry partner-website">.*?href="([^"]+)"', html)
    rec["website"] = m.group(1).strip() if m else None

    m = re.search(r'(?is)<span class="category-name"[^>]*>(.*?)</span>', html)
    rec["breadcrumb_category"] = text(m.group(1)) if m else None

    # ── §5e tier code: published ONLY as an image filename ──────────────────
    m = re.search(r'(?is)<div class="col-md-8 approved-logo">\s*<img src="([^"]+)"', html)
    if m:
        rec["approved_logo_url"] = m.group(1)
        base = m.group(1).rsplit("/", 1)[-1]
        rec["approved_logo_raw"] = base
        t = re.sub(r"\.(png|gif|jpg|svg)$", "", base, flags=re.I)
        rec["partner_tier_token"] = t[len("approved-"):] if t.startswith("approved-") else t
    else:
        rec["approved_logo_url"] = rec["approved_logo_raw"] = None
        rec["partner_tier_token"] = None

    m = re.search(r'(?is)<img src="(/images/partners-logo/[^"]+)"', html)
    rec["partner_logo_url"] = m.group(1) if m else None

    # ── §5e line-card code: the "Interroll Solutions" / know-how block ──────
    sols = []
    m = re.search(r"(?is)Interroll Solutions(.*?)(?:How we cre|</main>|<footer)", html)
    if m:
        for h in re.findall(r"(?is)<h[34][^>]*>(.*?)</h[34]>", m.group(1)):
            v = text(h)
            if v and v.lower() not in ("certified know-how",) and len(v) < 160:
                sols.append(v)
    rec["solutions_raw"] = sols or None

    m = re.search(r'(?is)<div itemprop="articleBody">(.*?)</div>', html)
    body = text(m.group(1)) if m else None
    rec["description"] = body[:1200] if body else None

    st = re.search(r"(?is)<title>(.*?)</title>", html)
    rec["page_title"] = text(st.group(1)) if st else None
    return rec


def main():
    f = Fetcher(SOURCE, min_bytes=5000)
    slugs, pages_seen = [], []
    try:
        for url, name in INDEX_PAGES:
            body, cached = f.get(url, name)
            pages_seen.append({"url": url, "cached": cached, "bytes": len(body)})
            found = [h for h in dict.fromkeys(LINK_RE.findall(body))]
            print(f"{name}: {len(found)} partner links ({'cached' if cached else 'live'})")
            slugs.extend(found)
    except Blocked as e:
        print(f"BLOCKED: {e}")
        write_raw(SOURCE, {"source_url": INDEX, "blocked": str(e)}, [])
        return

    slugs = list(dict.fromkeys(slugs))
    print(f"{len(slugs)} distinct partner detail pages")

    records, refused = [], []
    for path in slugs:
        slug = path.rsplit("/", 1)[-1].replace(".html", "")
        url = HOST + path
        try:
            body, cached = f.get(url, f"detail_{slug}.html")
        except Blocked as e:
            print(f"  refused {slug}: {e}")
            refused.append({"url": url, "reason": str(e)})
            continue
        rec = parse_detail(body, url, slug)
        rec.update({
            "phone_10": digits(rec.get("phone_raw")),
            "domain": apex(rec.get("website")),
            "email": None,           # not published on this source
            "address_1": None, "city": None, "state": None, "zip_raw": None,
            "country_text": rec.get("breadcrumb_category"),
            "is_us": True,           # the whole crawl is scoped to the U.S.A. branch
            "source": SOURCE,
            "source_url": url,
            "captured": CAPTURED,
        })
        records.append(rec)
        print(f"  {rec['company']!r} tier={rec['partner_tier_token']!r} "
              f"web={rec['domain']} ({'cached' if cached else 'live'})")

    stats = report(SOURCE, records,
                   code_fields=("partner_tier_token", "approved_logo_raw",
                                "breadcrumb_category", "solutions_raw"))
    write_raw(SOURCE, {
        "source_name": "Interroll — Rolling On Interroll (ROI) global partner network, U.S.A.",
        "source_url": INDEX,
        "index_pages": pages_seen,
        "method": "static Joomla HTML; 2 index pages + 1 detail page per partner",
        "codes_captured_verbatim": ["partner_tier_token", "approved_logo_raw",
                                    "approved_logo_url", "breadcrumb_category",
                                    "solutions_raw", "partner_logo_url"],
        "vertical_code": None,
        "vertical_code_note": (
            "MEASURED ABSENCE. Interroll's locator exposes no market/vertical "
            "split — no automotive/industrial axis of the kind §5e decoded on "
            "Timken. The only source-native codes are a partner tier "
            "(approved-*) and a product-solution line card. Both captured "
            "verbatim and left unmapped."),
        "refused": refused,
        "origin_requests": f.origin_requests,
        "stats": stats,
    }, records)
    print(json.dumps({"records": len(records), "refused": len(refused)}))


if __name__ == "__main__":
    main()
