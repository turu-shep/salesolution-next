#!/usr/bin/env python3
"""S3 Task 3 -- ICP-filter the SERP population. Zero network requests.

Why. The seven locator sources are ICP-shaped by construction: a manufacturer's
dealer locator only lists that manufacturer's dealers, and AD's non-ICP
divisions were filtered at S2 (§2a). The SERP half never went through any such
gate. It was built from 250 line-card queries, and what came back includes
consumer auto-parts jobbers, promotional-products shops, manufacturers' own
sites, marketplaces, directories, trade press and job boards alongside the
industrial distributors we want.

Evidence, all of it already on disk:
  * the dealer's homepage text -- the line-card run cached 2,185 of these, and
    the S3 identity pass cached the rest
  * the SERP titles, snippets and self-declarations the acquirer captured
  * the manufacturer brands the line-card run extracted per domain
  * the acquisition-time classification (`dealer_candidate`, `manufacturer`, ...)

Bias, stated once: **ambiguity keeps the record.** The build plan's rule is that
nothing is deleted; the S3 brief's rule is that a genuinely ambiguous domain is
kept and flagged `icp_uncertain` so S4 can tier it low. A classifier that is
willing to guess deletes prospects, and a wrong `not-a-distributor` is invisible
downstream in a way a wrong `icp_uncertain` is not. So a class only wins when it
beats the industrial score by a clear margin AND clears a floor.
"""
import argparse
import csv
import gzip
import hashlib
import json
import os
import re
import sys
from collections import Counter

CAPTURED = "2026-08-01"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
S3_DIR = os.path.join(ROOT, "data", "s3")
CACHES = [os.path.join(S3_DIR, "_cache"),
          os.path.join(ROOT, "data", "enrichment", "_cache")]

# ---------------------------------------------------------------- known hosts
# A domain on this list is what it is regardless of what its text says; these
# are the population's own returns, not a guess.
KNOWN = {
    "job-board": {
        "indeed.com", "ziprecruiter.com", "linkedin.com", "glassdoor.com",
        "monster.com", "simplyhired.com", "careerbuilder.com", "snagajob.com",
        "jobcase.com", "lensa.com", "talent.com", "dice.com", "myworkdayjobs.com",
        "recruiting.paylocity.com", "jobs.net", "salary.com", "builtin.com",
    },
    "directory": {
        "manta.com", "yelp.com", "bbb.org", "thomasnet.com", "yellowpages.com",
        "dnb.com", "buzzfile.com", "zoominfo.com", "crunchbase.com",
        "mapquest.com", "chamberofcommerce.com", "bizapedia.com",
        "opencorporates.com", "apollo.io", "rocketreach.co", "leadiq.com",
        "globalspec.com", "kompass.com", "europages.com", "tradeindia.com",
        "indiamart.com", "exportersindia.com", "bloomberg.com", "wikipedia.org",
        "facebook.com", "instagram.com", "youtube.com", "twitter.com", "x.com",
        "pinterest.com", "reddit.com", "tiktok.com", "yellowpagesdirectory.com",
        "superpages.com", "cylex.us.com", "hotfrog.com", "merchantcircle.com",
        "citysearch.com", "alignable.com",
    },
    "marketplace": {
        "amazon.com", "ebay.com", "alibaba.com", "aliexpress.com", "walmart.com",
        "etsy.com", "made-in-china.com", "wayfair.com", "temu.com", "wish.com",
        "shopify.com", "mercadolibre.com", "target.com", "costco.com",
        "samsclub.com", "overstock.com",
    },
    "general-retail": {
        "homedepot.com", "lowes.com", "acehardware.com", "truevalue.com",
        "menards.com", "harborfreight.com", "tractorsupply.com", "basspro.com",
        "cabelas.com", "northerntool.com", "sears.com",
    },
    "trade-press": {
        "industrialdistribution.com", "mdm.com", "supplyht.com",
        "plantengineering.com", "powertransmission.com", "machinedesign.com",
        "hydraulicspneumatics.com", "designworldonline.com", "thefabricator.com",
        "assemblymag.com", "manufacturing.net", "forbes.com", "reuters.com",
        "prnewswire.com", "businesswire.com", "globenewswire.com",
        "modernpumpingtoday.com", "processingmagazine.com", "flowcontrolnetwork.com",
        "impomag.com", "newequipment.com", "ien.com", "bearing-news.com",
    },
}

# ---------------------------------------------------------------- signal sets
# Weight reflects how uniquely a phrase belongs to that class, not how often it
# occurs. Generic words ("parts", "supply") are deliberately absent.
SIGNALS = {
    "industrial-distributor": [
        (6, r"\bauthorized (?:distributor|dealer|reseller)\b"),
        (6, r"\bline[\s-]?card\b"),
        (5, r"\bmaster distributor\b"),
        (4, r"\bindustrial (?:distributor|supply|supplier|distribution)\b"),
        (4, r"\bpower transmission\b"),
        (4, r"\bfluid power\b"),
        (3, r"\bmro\b|\bmaintenance,? repair\b"),
        (3, r"\b(?:hydraulic|pneumatic)s?\b"),
        (3, r"\bbearings?\b"),
        (3, r"\bgearbox(?:es)?\b|\bspeed reducers?\b|\bgear reducers?\b"),
        (3, r"\bconveyors?\b"),
        (2, r"\bhose (?:and|&) fittings?\b|\bhose assembl"),
        (2, r"\bseals? (?:and|&) (?:o-?rings?|gaskets?)\b"),
        (2, r"\bvalves? (?:and|&) (?:fittings?|actuators?)\b"),
        (2, r"\bstocking distributor\b"),
        (2, r"\bwe (?:stock|distribute|represent)\b"),
        (2, r"\bindustrial (?:hose|belting|automation)\b"),
        (2, r"\bfasteners?\b"),
        (2, r"\bcompressed air\b|\bair compressors?\b"),
        (2, r"\bcutting tools?\b|\babrasives?\b"),
        (1, r"\brepair (?:and|&) (?:service|rebuild)\b"),
        (1, r"\bwill[\s-]?call\b|\bcounter sales\b"),
    ],
    "auto-parts": [
        (7, r"\b(?:shop|search) by vehicle\b|\byear[\s,/]+make[\s,/]+model\b"),
        (6, r"\bauto parts (?:store|stores)\b"),
        (5, r"\bbrake pads?\b|\bspark plugs?\b|\boil filters?\b"),
        (4, r"\bcar parts\b|\bautomotive (?:parts|aftermarket)\b"),
        (4, r"\byour vehicle\b|\bfits your (?:car|truck|vehicle)\b"),
        (3, r"\bstruts?\b|\bshocks? (?:and|&) struts?\b|\balternators?\b"),
        (3, r"\bradiators?\b|\bmufflers?\b|\bcatalytic converters?\b"),
        (3, r"\bmotorcycle\b|\batv\b|\butv\b|\bpowersports?\b"),
        (2, r"\bwiper blades?\b|\bheadlights?\b|\bbatteries for your\b"),
        (2, r"\boem (?:and|&) aftermarket (?:auto|car)\b"),
        (2, r"\bcollision (?:parts|repair)\b|\bbody shop\b"),
    ],
    # S3c (§5c.1). The SERP-only run never needed these: measured, the whole SERP
    # population held ONE auto-parts domain. The locator half is a different
    # population -- Timken's dealer file carries 63 Parts Authority branches, 52
    # NAPA jobbers, 52 MHC Kenworth stores and 49 Rush Truck Centers.
    "truck-fleet": [
        (7, r"\bheavy[\s-]?duty truck (?:parts|service)\b|\bclass 8\b"),
        (7, r"\bkenworth\b|\bpeterbilt\b|\bfreightliner\b|\bwestern star\b|\bmack trucks?\b"),
        (6, r"\btruck (?:center|centers|dealership)\b|\btruck (?:and|&) trailer\b"),
        (5, r"\bsemi[\s-]?trucks?\b|\btractor[\s-]?trailers?\b|\bbig rigs?\b"),
        (5, r"\bfleet (?:maintenance|services?|managers?)\b|\bvocational trucks?\b"),
        (4, r"\bdiesel (?:engines?|injection|technicians?)\b|\bdpf\b|\baftertreatment\b"),
        (4, r"\bdrivelines?\b|\bfifth wheels?\b|\bair brakes?\b|\btrailer (?:parts|axles?)\b"),
        (3, r"\bmedium[\s-]?duty\b|\bcommercial vehicles?\b|\bused trucks? for sale\b"),
    ],
    # A real B2B distributor in a trade we do not sell to. §2a already parks AD's
    # electrical / plumbing / HVAC / waterworks divisions this way; the same
    # businesses arrive through the other sources without a division code.
    # Calibrated so that no SINGLE category word can route a record. Measured on
    # the first build: one "HVAC" on the page sent Pumps of Oklahoma to
    # `adjacent-trade`, and one "HVACR" sent Trent Metals. Broadline industrial
    # distributors mention every adjacent trade they sell into; the class needs
    # two independent signals, or one that is unambiguous on its own
    # (`electrical supply`, `plumbing supply`, `gypsum`, `drywall`).
    "other-trade": [
        (7, r"\belectrical (?:distributor|supply|wholesale)\b|\bplumbing (?:supply|supplies|wholesale)\b"),
        (6, r"\bgypsum\b|\bdrywall\b|\blumber ?yard\b|\bbuilding suppl(?:y|ies)\b"),
        (5, r"\bhvac ?r? (?:supply|distributor|wholesale|equipment|parts)\b|\brefrigeration supply\b"),
        (4, r"\bwaterworks\b|\bbuilding materials?\b|\bheating,? ventilation\b"),
        (4, r"\bjanitorial\b|\bfoodservice equipment\b|\brestaurant supply\b"),
        (4, r"\bmedical supplies\b|\bdental supplies\b|\bveterinary supplies\b"),
        (3, r"\bswitchgear\b|\bwire (?:and|&) cable\b|\blighting (?:fixtures?|solutions?)\b"),
        (3, r"\bhvacr?\b|\bpvc pipe\b|\bwater meters?\b|\bfire sprinklers?\b|\bseptic\b"),
    ],
    "promotional-products": [
        (8, r"\bpromotional products?\b"),
        (6, r"\bcustom (?:imprint|imprinted|branded merchandise)\b"),
        (5, r"\bscreen printing\b|\bembroider(?:y|ed)\b"),
        (5, r"\bcorporate gifts?\b|\bswag\b"),
        (4, r"\bcustom t-?shirts?\b|\bbranded apparel\b|\blogo(?:ed)? apparel\b"),
        (4, r"\bppai\b|\basi member\b|\bsage member\b"),
        (3, r"\btrade[\s-]?show giveaways?\b|\bimprinted (?:pens|mugs|bags)\b"),
        (3, r"\bdecorat(?:ion|ed) methods?\b"),
    ],
    "general-retail": [
        (5, r"\bsporting goods\b|\bhunting (?:and|&) fishing\b"),
        (5, r"\bhardware store\b|\bhome improvement\b"),
        (4, r"\bfurniture\b|\bmattress(?:es)?\b|\bappliances? store\b"),
        (4, r"\bgrocer(?:y|ies)\b|\bpharmacy\b|\btoys?\b"),
        (3, r"\bgift shop\b|\bapparel\b|\bfootwear\b|\bjewelry\b"),
        (3, r"\bgarden cent(?:er|re)\b|\bnursery\b|\bpet suppl"),
    ],
    "manufacturer": [
        (7, r"\bwe (?:design and )?manufacture\b|\bour manufacturing (?:facility|plant)\b"),
        (6, r"\bmanufactured (?:in|at) our\b|\bmade in our\b"),
        (5, r"\boriginal equipment manufacturer\b|\bwe are (?:a|the) manufacturer\b"),
        (4, r"\bcustom manufactur(?:er|ing)\b|\bcontract manufactur"),
        (4, r"\bour (?:products?|engineers?) are (?:designed|manufactured)\b"),
        (3, r"\bfind (?:a|your) (?:distributor|dealer)\b|\bdistributor locator\b"),
        (3, r"\bbecome a (?:distributor|dealer)\b|\bauthorized distributors? of our\b"),
        (3, r"\bpatent(?:ed|s)\b|\biso 9001[: ]?(?:20\d\d)? (?:certified )?manufactur"),
        (2, r"\bfactory tour\b|\bour factory\b|\bproduction line\b"),
    ],
    "marketplace": [
        (6, r"\bsell(?:er)?s? on our (?:site|platform|marketplace)\b|\bmarketplace\b"),
        (5, r"\bsold (?:and|&) shipped by\b|\bthird[\s-]?party sellers?\b"),
        (4, r"\bcompare prices? (?:from|across)\b|\bmillions of (?:products|items)\b"),
        (3, r"\bstore front\b|\bauction\b|\bbidding\b"),
    ],
    "directory": [
        (6, r"\bbusiness director(?:y|ies)\b|\bcompany profiles?\b"),
        (5, r"\bfind (?:companies|suppliers|businesses) (?:near|in)\b"),
        (4, r"\bwrite a review\b|\bclaim (?:this|your) (?:listing|business)\b"),
        (4, r"\bd&b\b|\bduns number\b|\bnaics code\b|\bsic code\b"),
        (3, r"\bverified suppliers?\b|\bsupplier director"),
    ],
    "trade-press": [
        (6, r"\bsubscribe to (?:our )?(?:newsletter|magazine)\b.{0,80}\bissue\b"),
        (5, r"\beditorial (?:staff|calendar)\b|\bmedia kit\b|\badvertise with us\b"),
        (5, r"\bcurrent issue\b|\bback issues?\b|\bdigital edition\b"),
        (4, r"\bpress releases?\b.{0,60}\bindustry news\b"),
        (3, r"\bwebinars?\b.{0,60}\bwhite ?papers?\b"),
    ],
    "job-board": [
        (7, r"\bapply now\b.{0,80}\bjob\b|\bjob (?:description|openings?|listings?)\b"),
        (5, r"\bfull[\s-]?time\b.{0,40}\bsalary\b|\bhourly (?:pay|wage)\b"),
        (4, r"\bcreate (?:a|your) (?:job alert|resume)\b|\bupload your resume\b"),
        (4, r"\bemployer (?:reviews|profile)\b|\bcompany reviews\b"),
    ],
}
csv.field_size_limit(10_000_000)

COMPILED = {k: [(w, re.compile(p, re.I)) for w, p in v] for k, v in SIGNALS.items()}

# The curated manufacturer vocabulary the line-card run already uses. A domain
# whose own label IS a brand is that manufacturer's site, not a dealer's --
# swagelok.com, esab.com, eaton.com and parker.com all scored as strong
# "industrial distributors" on text alone.
def _brand_labels():
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "brands", os.path.join(HERE, "..", "enrich", "brands.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    out = set()
    for canonical, surfaces, _cs in mod.BRANDS:
        for name in [canonical] + list(surfaces):
            sq = re.sub(r"[^a-z0-9]", "", name.lower())
            if len(sq) >= 4:
                out.add(sq)
    return out


BRAND_LABELS = _brand_labels()
# Label shapes that are a site type, not a company.
SITE_TYPE = [
    ("directory", re.compile(r"chamber|directory|bizidex|listing|yellow|localbiz")),
    # A domain label is squashed alphanumerics with no word boundaries, so every
    # one of these is anchored. S3c measured two that were not: bare `press$`
    # classified `specialtyhosexpress.com` (United Electric Supply) as trade
    # press, and bare `^news` classified `newstreaming.com` (Newstream
    # Enterprises) the same way.
    ("trade-press", re.compile(r"magazine|^themag|mag$|news$|^news(?:paper|wire|week)"
                               r"|journal|gazette|(?<!ex)press$|today$")),
    ("job-board", re.compile(r"^jobs|jobs$|careers?$|hiring")),
    ("directory", re.compile(r"forum$|^forum|wiki|reddit|blogspot|blog$|^blog|hobby")),
]
KEEP = "industrial-distributor"
MARGIN = 4     # a rejecting class must beat industrial by this much
FLOOR = 5      # ...and clear this on its own


def cache_name(url):
    return hashlib.sha1(url.encode()).hexdigest() + ".gz"


def cached_text(url):
    name = cache_name(url)
    for d in CACHES:
        p = os.path.join(d, name)
        if os.path.exists(p):
            try:
                with gzip.open(p, "rb") as f:
                    blob = json.loads(f.read().decode("utf-8", "ignore"))
                if blob.get("status") == 200 and blob.get("text"):
                    return blob["text"]
            except (OSError, ValueError):
                return None
    return None


def homepage_text(apex):
    for url in ("https://%s/" % apex, "https://www.%s/" % apex,
                "http://%s/" % apex):
        t = cached_text(url)
        if t:
            return t, url
    return None, None


def load_json(path):
    with open(path) as f:
        return json.load(f)


def classify(apex, text, serp_bits, brands, acq_class, linecard_url, serp_only=True):
    """Return (class, uncertain, scores, why)."""
    if not serp_only:
        # A manufacturer's dealer locator listed this company. That is direct
        # evidence of what they are, and it outranks anything read off the page.
        return KEEP, False, {}, "listed by a manufacturer dealer locator"
    if apex in KNOWN.get("job-board", ()):
        return "job-board", False, {}, "known-host"
    for cls, hosts in KNOWN.items():
        if apex in hosts:
            return cls, False, {}, "known-host"

    home = re.sub(r"\s+", " ", text or "")[:400_000]
    # The SERP snippet echoes the query WE ran ("line card", "authorized
    # distributor"), so scoring it at full weight measures our own query design
    # rather than the site. Discount it; the homepage is the evidence.
    serp_text = re.sub(r"\s+", " ", " ".join(x for x in serp_bits if x))[:60_000]
    corpus = (home + " " + serp_text).strip()
    if not corpus.strip():
        # Nothing to read. The acquirer's own classification is the only
        # evidence there is, and it already set a disposition where it was sure.
        cls = {"manufacturer": "manufacturer", "trade_press": "trade-press",
               "marketplace_directory": "marketplace",
               "social_jobs_forum": "job-board"}.get(acq_class)
        if cls:
            return cls, False, {}, "acquisition-classification (no text on disk)"
        return KEEP, True, {}, "no text on disk"

    label = re.sub(r"[^a-z0-9]", "", apex.split(".")[0].lower())
    if label in BRAND_LABELS or re.sub(r"store$", "", label) in BRAND_LABELS:
        return "manufacturer", False, {}, "domain label is a manufacturer brand"
    for cls, rx in SITE_TYPE:
        if rx.search(label):
            return cls, True, {}, "domain label is a %s, not a company" % cls

    scores = {}
    hits = {}
    for cls, pats in COMPILED.items():
        total, h = 0.0, []
        for w, rx in pats:
            m = rx.search(home)
            if m:
                total += w
                h.append(m.group(0)[:40])
                continue
            m = rx.search(serp_text)
            if m:
                total += w * 0.4
                h.append(m.group(0)[:40])
        scores[cls] = round(total, 1)
        hits[cls] = h

    # A line-card page is near-conclusive evidence of a distributor, and 2+
    # manufacturer brands on the site is the S1c line-card finding itself.
    if linecard_url:
        scores[KEEP] += 4
    if len(brands) >= 2:
        scores[KEEP] += 3
    elif len(brands) == 1:
        scores[KEEP] += 1
    if acq_class == "manufacturer":
        scores["manufacturer"] += 3
    if acq_class == "trade_press":
        scores["trade-press"] += 3
    if acq_class == "marketplace_directory":
        scores["marketplace"] += 2
        scores["directory"] += 2
    if acq_class == "social_jobs_forum":
        scores["job-board"] += 2

    keep = scores[KEEP]
    rivals = sorted(((v, k) for k, v in scores.items() if k != KEEP), reverse=True)
    top_v, top_k = rivals[0]
    if top_v >= FLOOR and top_v - keep >= MARGIN:
        return top_k, False, scores, "; ".join(hits[top_k][:4])
    # Kept. Flag it when the evidence is thin or the rival was close.
    uncertain = keep < 3 or (top_v >= FLOOR and top_v - keep >= 1)
    return KEEP, uncertain, scores, "; ".join(hits[KEEP][:4])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", default=os.path.join(ROOT, "lists", "deduped-v2.csv"))
    # S3c. `serp` is S3a's behaviour and stays the default so re-running S3a is
    # byte-identical. `all` is §5c.1: classify EVERY domain in the union, not just
    # the SERP half. The `serp_only` short-circuit inside classify() -- "a
    # manufacturer's dealer locator listed this company, that outranks the page"
    # -- is what §5c.1 says is wrong, so scope=all switches it off and judges the
    # locator domains on the same evidence as everything else.
    ap.add_argument("--scope", choices=("serp", "all"), default="serp")
    ap.add_argument("--seated", default=os.path.join(ROOT, "lists", "deduped-v3.csv"),
                    help="the seated list scope=all reads alongside the side pools")
    ap.add_argument("--out", default=None)
    args = ap.parse_args()
    scope_all = args.scope == "all"

    serp = load_json(os.path.join(ROOT, "data", "raw", "serp-selfid-%s.json" % CAPTURED))
    pages = load_json(os.path.join(ROOT, "data", "raw", "serp-selfid-pages-%s.json" % CAPTURED))
    lc_path = os.path.join(ROOT, "data", "enrichment", "linecards-%s.json" % CAPTURED)
    linecards = load_json(lc_path)["records"] if os.path.exists(lc_path) else []

    by_domain_serp = {}
    for r in serp["records"]:
        by_domain_serp.setdefault(r["domain"], []).append(r)
    by_domain_page = {}
    for r in pages["records"]:
        by_domain_page.setdefault(r["domain"], []).append(r)
    by_domain_lc = {r["domain"]: r for r in linecards}

    # Every domain in the union, whatever pool it currently sits in. At
    # `--scope serp` only the SERP-sourced ones are targeted (S3a); at
    # `--scope all` every one is.
    pools = ["data/side-pools/pool-chains.csv",
             "data/side-pools/pool-above-ceiling.csv",
             "data/side-pools/pool-adjacent-trades.csv",
             "data/side-pools/pool-non-us.csv",
             "data/side-pools/pool-not-a-distributor.csv"]
    if scope_all:
        seated_rel = os.path.relpath(args.seated, ROOT)
        sources = [seated_rel] + pools + ["data/side-pools/pool-segment-w.csv"]
    else:
        sources = ["lists/deduped-v2.csv"] + pools

    targets = []
    seen = set()
    for name in sources:
        p = os.path.join(ROOT, name)
        if not os.path.exists(p):
            continue
        with open(p, newline="") as f:
            for row in csv.DictReader(f):
                srcs = (row.get("source") or "").split("|")
                if not scope_all and "serp" not in srcs:
                    continue
                d = row.get("domain")
                if not d or d in seen:
                    continue
                seen.add(d)
                targets.append({"domain": d, "pool": name,
                                "disposition": row.get("disposition") or None,
                                "company_display": row.get("company_display"),
                                # At scope=all nothing gets the dealer-locator
                                # free pass -- that assumption is what §5c.1
                                # falsified. Every domain is judged on its page.
                                "serp_only": True if scope_all
                                else (row.get("source") or "") == "serp"})

    out = []
    for t in targets:
        apex = t["domain"]
        text, text_url = homepage_text(apex)
        rows = by_domain_serp.get(apex, [])
        bits = []
        for r in rows[:12]:
            bits += [r.get("title"), r.get("snippet"), r.get("declaration")]
        for r in by_domain_page.get(apex, []):
            bits += [r.get("page_title")]
            for d in r.get("page_declarations") or []:
                bits.append(d.get("text"))
        bits = [b for b in bits if b]

        lc = by_domain_lc.get(apex) or {}
        brands = lc.get("brands") or []
        if not brands:
            brands = sorted({b for r in rows for b in (r.get("brands_named") or [])})
        acq = None
        for r in rows:
            if r.get("classification") == "dealer_candidate":
                acq = "dealer_candidate"
                break
            acq = acq or r.get("classification")

        cls, uncertain, scores, why = classify(
            apex, text, bits, brands, acq, lc.get("linecard_url"),
            serp_only=t["serp_only"])
        out.append({
            "domain": apex,
            "company_display": t["company_display"],
            "current_disposition": t["disposition"],
            "icp_class": cls,
            "icp_uncertain": bool(uncertain),
            "evidence": why,
            "scores": {k: v for k, v in sorted(scores.items(), key=lambda kv: -kv[1])[:4]},
            "text_source": text_url,
            "text_chars": len(text or ""),
            "serp_results": len(rows),
            "brands": brands[:12],
            "brand_count": len(brands),
            "linecard_url": lc.get("linecard_url"),
            "acquisition_class": acq,
            "serp_only": t["serp_only"],
            "captured": CAPTURED,
        })

    path = args.out or os.path.join(
        S3_DIR, ("vertical-%s.json" if scope_all else "icp-%s.json") % CAPTURED)
    os.makedirs(S3_DIR, exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w") as f:
        json.dump({"source": "icp", "captured": CAPTURED,
                   "scope": args.scope,
                   "network_requests": 0,
                   "policy": {"ambiguous": "kept and flagged icp_uncertain",
                              "margin": MARGIN, "floor": FLOOR},
                   "target_count": len(targets), "records": out}, f, indent=1)
    os.replace(tmp, path)

    print("classified %d domains (scope=%s) -> %s" % (len(out), args.scope, path))
    print(Counter(r["icp_class"] for r in out).most_common())
    print("uncertain:", sum(1 for r in out if r["icp_uncertain"]))
    print("no text on disk:", sum(1 for r in out if not r["text_chars"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
