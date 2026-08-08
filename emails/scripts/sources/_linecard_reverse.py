#!/usr/bin/env python3
"""The linecard thesis, generalized: 406 distributor line-card pages read backwards.

`linecard-locators` exists because ONE distributor (United Central) publishes a
92-name supplier list, and a supplier list read backwards is a queue of
manufacturer dealer locators. That list is now exhausted — 6 probed, 47
skimmed, no second Flexco (dossier §3).

**The generalization costs zero network.** S1c already fetched 406 dealer
line-card pages and they are still on disk, gzipped, under
`data/raw/_cache/serp_pages/`. Read backwards, they are 406 supplier lists
instead of one — and because a manufacturer named by many independent
distributors necessarily runs a broad dealer network, **the frequency count is
itself the ranking signal the United Central list never had.**

Two extraction passes, and the difference between them is the point:

  1. **Vocabulary pass** — `brands_named_on_page` in
     `serp-selfid-pages-2026-08-01.json`, already computed by S1c. Precise, and
     **bounded by the extractor's own brand list (94 names)**: it can only
     re-find manufacturers the pipeline already knew. It cannot discover.
  2. **Free-form pass** — regex over the cached page text for authorization
     phrasing ("authorized X distributor", "we carry X, Y and Z"). Noisier,
     and it is the only one that can surface a manufacturer nobody has typed
     into a config yet.

Both are reported separately. Anything the free-form pass finds is a
CANDIDATE, never a source: it has to survive the same probe the six ranked
locators got.

Cross-referenced against everything already decided so the output is a queue
of genuinely unassessed names, not a re-list of settled ones.

Reads only. Writes one report: `data/raw/linecard-reverse-2026-08-04.json`.
"""
import glob
import gzip
import json
import os
import re
import sys
from collections import Counter, defaultdict

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import _polite  # noqa: E402
from _polite import RAW  # noqa: E402

CAPTURED = "2026-08-04"
PAGES_CACHE = os.path.join(RAW, "_cache", "serp_pages")
SELFID = os.path.join(RAW, "serp-selfid-pages-2026-08-01.json")

# ── everything already decided, so the queue holds only unassessed names ─────
SWEPT = {  # 21 live source tokens + the E4 builds + this lane's six
    "timken", "enerpac", "nord", "ntn", "spx flow", "spxflow", "yaskawa",
    "dorner", "lovejoy", "ballymore", "quincy", "kennametal", "banjo", "gast",
    "atlas copco", "chicago pneumatic", "interroll", "flexlink",
    "mk north america", "matthews", "adaptall", "festo", "walter", "sullair",
    "continental", "contitech", "skf", "banner", "pepperl+fuchs", "lincoln",
    "bosch rexroth", "samson", "samson rope", "columbus mckinnon", "cm",
    "flexco", "flexible steel lacing", "chromalox", "zoeller", "ocenco",
}
CLOSED = {  # dead / gated / off-ICP, per strategy §7.1 and the two dossiers
    "parker", "parker hannifin", "parkerstore", "gates", "esab", "norton",
    "weg", "regal rexnord", "dixon", "ifm", "aro", "miller", "ingersoll rand",
    "bimba", "hytrol", "victaulic", "donaldson", "danfoss", "crosby",
    "harrington", "brennan", "manuli", "jason", "kuriyama", "msa", "falk",
    "3m", "milwaukee", "stanley", "loctite", "bosch",
}
UNITED_CENTRAL_92 = set()   # filled from the skim file if present

STOP = {
    "the", "and", "for", "with", "our", "your", "all", "new", "used", "parts",
    "products", "service", "services", "supply", "company", "inc", "llc",
    "corp", "industrial", "industries", "equipment", "solutions", "systems",
    "authorized", "distributor", "distributors", "dealer", "dealers", "us",
    "we", "are", "an", "a", "of", "in", "is", "as", "to", "you", "more",
    "learn", "contact", "home", "about", "call", "shop", "view", "read",
    "customer", "customers", "quality", "brands", "brand", "product", "line",
    "lines", "card", "sales", "support", "repair", "america", "american",
    "national", "international", "group", "global", "full", "complete",
    # qualifiers that sit between "authorized" and "distributor" — these are
    # adjectives about the relationship, never manufacturer names
    "stocking", "factory", "master", "premier", "certified", "official",
    "exclusive", "local", "leading", "largest", "elite", "preferred",
    "value", "added", "direct", "online", "regional", "independent",
}

# Several high-frequency names roll up to a parent already decided elsewhere.
# A dealer network is run by the PARENT, so a name whose parent is closed is
# closed — recording the roll-up rather than letting the child look fresh.
PARENTS = {
    "baldor": "ABB (acquired 2011) — ABB itself is unassessed",
    "dodge": "RBC Bearings (from ABB, 2021)",
    "browning": "Regal Rexnord — CLOSED (Cloudflare 403)",
    "morse": "Regal Rexnord — CLOSED (Cloudflare 403)",
    "boston gear": "Regal Rexnord — CLOSED (Cloudflare 403)",
    "leeson": "Regal Rexnord — CLOSED (Cloudflare 403)",
    "marathon": "Regal Rexnord — CLOSED (Cloudflare 403)",
    "aventics": "Bosch Rexroth — already an E4 target",
    "numatics": "Emerson",
    "victor": "ESAB — CLOSED (Cloudflare 403)",
    "harris": "Lincoln Electric — already an E4 target",
    "ridgid": "Emerson (Ridge Tool) — on the United Central 92, retail-skewed",
    "greenlee": "Emerson",
    "martin": "ambiguous — Martin Sprocket & Gear vs Martin Engineering; "
              "resolve the entity before probing",
    "alliance": "ambiguous — generic word, likely a false positive",
    "apex": "ambiguous — Apex Tool Group vs Apex Fasteners",
    "viking": "ambiguous — Viking Pump (IDEX) vs Viking Life-Saving",
}

# "authorized <Brand> distributor" and friends — the phrasing S1c's own SERP
# play was built on, applied to the page body instead of the snippet.
AUTH_RE = re.compile(
    r"(?i)\bauthoriz(?:ed|ation)\s+((?:[A-Z][A-Za-z0-9&.\-]*\s+){1,3}?)"
    r"(?:distributor|dealer|reseller|integrator|service\s+center)")
CARRY_RE = re.compile(
    r"(?i)\b(?:we\s+(?:carry|stock|distribute|represent)|"
    r"proud\s+(?:distributor|dealer)\s+of|"
    r"factory\s+authorized\s+for)\s+"
    r"((?:[A-Z][A-Za-z0-9&.\-]*(?:,\s*|\s+and\s+|\s+)){1,8})")


def strip_html(html):
    html = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", html)
    html = re.sub(r"(?s)<[^>]+>", " ", html)
    html = re.sub(r"&nbsp;?", " ", html)
    html = re.sub(r"&amp;?", "&", html)
    return re.sub(r"\s+", " ", html)


def norm_brand(s):
    s = re.sub(r"[^A-Za-z0-9&.\- ]", " ", s or "")
    return re.sub(r"\s+", " ", s).strip()


def is_plausible_brand(name):
    low = name.lower().strip()
    if len(low) < 3 or len(low) > 34:
        return False
    toks = low.split()
    if not toks or all(t in STOP for t in toks):
        return False
    if toks[0] in STOP:
        return False
    if sum(c.isdigit() for c in low) > 3:
        return False
    return True


def main():
    # ── pass 1: the vocabulary pass (precise, bounded, already computed) ─────
    vocab_freq = Counter()
    vocab_domains = defaultdict(set)
    pages_in_selfid = 0
    if os.path.exists(SELFID):
        doc = json.load(open(SELFID, encoding="utf-8"))
        pages_in_selfid = len(doc.get("records", []))
        for r in doc.get("records", []):
            for b in r.get("brands_named_on_page") or []:
                vocab_freq[b] += 1
                vocab_domains[b].add(r.get("domain"))
    print(f"vocabulary pass: {len(vocab_freq)} distinct brands across "
          f"{pages_in_selfid} pages")

    # ── pass 2: free-form over the cached page bodies (the discovery half) ───
    files = sorted(glob.glob(os.path.join(PAGES_CACHE, "*.html.gz")))
    print(f"free-form pass: {len(files)} cached pages")
    free_freq = Counter()
    free_domains = defaultdict(set)
    unreadable = 0
    for path in files:
        dom = os.path.basename(path).replace(".html.gz", "")
        try:
            with gzip.open(path, "rb") as fh:
                html = fh.read().decode("utf-8", "ignore")
        except Exception:  # noqa: BLE001 — an unreadable cache entry is a skip
            unreadable += 1
            continue
        text = strip_html(html)
        found = set()
        for m in AUTH_RE.finditer(text):
            b = norm_brand(m.group(1))
            if is_plausible_brand(b):
                found.add(b)
        for m in CARRY_RE.finditer(text):
            for part in re.split(r",|\band\b", m.group(1)):
                b = norm_brand(part)
                if is_plausible_brand(b):
                    found.add(b)
        for b in found:
            free_freq[b] += 1
            free_domains[b].add(dom)

    # ── cross-reference ─────────────────────────────────────────────────────
    skim = os.path.join(RAW, "linecard-skim-2026-08-03.json")
    if os.path.exists(skim):
        sk = json.load(open(skim, encoding="utf-8"))
        for row in sk.get("rows", []):
            UNITED_CENTRAL_92.add(row["manufacturer"].lower())
        for row in sk.get("consumer_marked", []) + sk.get("disposed", []):
            UNITED_CENTRAL_92.add(row["manufacturer"].lower())

    def status_of(brand):
        low = brand.lower()
        for s in SWEPT:
            if s in low or low in s:
                return "swept"
        for c in CLOSED:
            if low == c or low.startswith(c + " "):
                return "closed"
        for n in UNITED_CENTRAL_92:
            if low in n or n in low:
                return "on the United Central 92 (already dispositioned)"
        return "UNASSESSED"

    rows = []
    for b in set(vocab_freq) | set(free_freq):
        rows.append({
            "brand": b,
            "distributor_pages_vocab": vocab_freq.get(b, 0),
            "distributor_pages_freeform": free_freq.get(b, 0),
            "distributors_naming_it": sorted(
                vocab_domains.get(b, set()) | free_domains.get(b, set()))[:12],
            "status": status_of(b),
            "parent_note": PARENTS.get(b.lower()),
        })
    rows.sort(key=lambda r: -(r["distributor_pages_vocab"]
                              + r["distributor_pages_freeform"]))
    queue = [r for r in rows if r["status"] == "UNASSESSED"]

    print(f"\ncross-reference: {len(rows)} brands, {len(queue)} UNASSESSED\n")
    print(f"{'brand':32s} {'vocab':>6s} {'free':>5s}  distributors naming it")
    for r in queue[:40]:
        print(f"{r['brand'][:32]:32s} {r['distributor_pages_vocab']:6d} "
              f"{r['distributor_pages_freeform']:5d}  "
              f"{r['parent_note'] or ', '.join(r['distributors_naming_it'][:3])}")

    out = {
        "source": "linecard-reverse",
        "captured": CAPTURED,
        "thesis": "A distributor's published supplier list, read backwards, is "
                  "a queue of manufacturer dealer locators. United Central "
                  "gave 92 names and is exhausted; these 406 cached dealer "
                  "line-card pages give the same thing at scale, with a "
                  "frequency count the single list never had.",
        "method": {
            "vocabulary_pass": "brands_named_on_page from "
                               "serp-selfid-pages-2026-08-01.json — precise but "
                               "BOUNDED BY THE EXTRACTOR'S OWN brand list; it "
                               "cannot discover a manufacturer nobody has "
                               "configured.",
            "freeform_pass": "regex for authorization phrasing over the cached "
                             "page bodies in data/raw/_cache/serp_pages/ — "
                             "noisy, and the only half that can surface an "
                             "unknown name.",
            "network_cost": "ZERO. Every page was fetched by S1c on "
                            "2026-08-01 and is still cached.",
        },
        "caveats": [
            "Frequency counts DISTRIBUTOR PAGES, not dealers, and the 406 "
            "pages are themselves a SERP-selected sample skewed to brands the "
            "self-identification play already queried — Parker is top because "
            "we searched for Parker. Read the ranking as relative interest "
            "within an already-biased sample, never as market share.",
            "A free-form hit is a CANDIDATE, not a source. It has to survive "
            "the same probe the six ranked locators got: does a locator exist, "
            "does its payload carry a website field, does it clear 55%.",
            "No name here has been checked for a locator. That is the next "
            "session's work, and it is the cheapest queue in the pack.",
        ],
        "counts": {
            "pages_read": len(files),
            "pages_unreadable": unreadable,
            "brands_total": len(rows),
            "brands_unassessed": len(queue),
        },
        "queue_unassessed": queue,
        "all_brands": rows,
    }
    p = os.path.join(RAW, f"linecard-reverse-{CAPTURED}.json")
    json.dump(out, open(p, "w"), indent=1)
    print(f"\nraw -> {p}")


if __name__ == "__main__":
    main()
