#!/usr/bin/env python3
"""S1 raw acquisition — SERP dealer self-identification program (250 queries).

The blocked-brand recovery. Eight manufacturer locators sit behind Cloudflare
403s (Parker, Gates, ESAB, Norton, WEG, Regal Rexnord, Dixon, ifm) and are
excluded by policy, permanently. Their dealers advertise those authorizations on
their OWN public sites, so the network is recoverable from public Google SERP
without touching a single manufacturer server.

Validated in emails/research/04-self-identification-play.md: 14 queries -> 372
organic results -> 128 distinct US distributors, zero false positives.

QUERY-DESIGN RULE (structural finding from research/04, not a preference):
  state-scope the LINE-CARD phrase, never the brand phrase.
  brand-phrase x state  ->  6 net-new of 13   (a national authorization page
                                               re-ranks; the pool does not rotate)
  line-card x state     -> 12 net-new of 17   (every distributor has a line-card
                                               page AND states its geography on it)
So the permutation is weighted to Axis C, and brand-authorization phrases run
mostly unscoped.

Program shape (250 queries):
  A   44  brand x phrase variant, NATIONAL (incl. retail-program terms and
          printed-catalog boilerplate)
  B   36  brand x state — capped hard at the 3 strong brands x 12 dense states,
          because research/04 measured this axis at 0.54 unique/query
  Cn  10  line card x category, national
  Cs 160  line card x category x state — the workhorse

Extracted per organic result: dealer domain, page URL, SERP rank (free
qualification signal — a dealer at #40 for their own authorization phrase is
the pitch), the verbatim self-declaration text where the SERP exposes it, and
which brands the result names.

RAW ACQUISITION ONLY. Classification flags are recorded on every record; nothing
is dropped. S2 owns normalize/dedupe.
"""
import base64
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

CAPTURED = "2026-08-01"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "data", "raw")
CACHE = os.path.join(RAW, "_cache", "serp")
ENDPOINT = "https://api.dataforseo.com/v3/serp/google/organic/live/advanced"
WORKERS = 5          # API host, not a scraped origin. Modest concurrency.
LADDER = [(30, 3), (20, 2), (10, 1)]   # depth, max_crawl_pages — research/04
LADDER_DEEP = [(100, 7), (30, 3), (20, 2), (10, 1)]


# ---------------------------------------------------------------- credentials
def auth_header():
    env = {}
    with open(os.path.join(ROOT, "..", ".env.local")) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    u = env.get("DATAFORSEO_USERNAME") or env.get("DFS_LOGIN")
    p = env.get("DATAFORSEO_PASSWORD") or env.get("DFS_PASSWORD")
    if not u or not p:
        sys.exit("no DataForSEO credentials in .env.local")
    return "Basic " + base64.b64encode(f"{u}:{p}".encode()).decode()


AUTH = auth_header()


def balance():
    req = urllib.request.Request("https://api.dataforseo.com/v3/appendix/user_data",
                                 headers={"Authorization": AUTH})
    d = json.load(urllib.request.urlopen(req, timeout=60))
    return d["tasks"][0]["result"][0]["money"]["balance"]


# ------------------------------------------------------------------ the plan
BLOCKED_BRANDS = ["Parker", "Gates", "ESAB", "Norton", "WEG",
                  "Regal Rexnord", "Dixon", "ifm"]

# Axis A — national brand x phrase variant. Includes the two patterns
# research/04 ranked highest: manufacturer retail-program terms ("Parker Store"
# returned 32 dealers from ONE query) and printed-catalog boilerplate (which
# found all 6 Norton dealers, including one that self-declares nothing).
AXIS_A = [
    # Parker — the largest blocked network
    ('"authorized Parker distributor"', "Parker"),
    ('"Parker Store" hydraulic hose', "Parker"),
    ('"ParkerStore" locations hydraulic', "Parker"),
    ('"Parker Hannifin distributor" "line card"', "Parker"),
    ('"Your Local Authorized Parker Distributor"', "Parker"),
    ('"authorized Parker Hannifin distributor" fluid connectors', "Parker"),
    ('"Parker distributor" pneumatics seals "authorized"', "Parker"),
    ('"Parker Chomerics" OR "Parker O-Ring" authorized distributor', "Parker"),
    # Gates
    ('"Gates authorized distributor" hydraulic hose', "Gates"),
    ('"authorized Gates distributor" belts', "Gates"),
    ('"Gates Hydraulic Hose Center"', "Gates"),
    ('"Gates distributor" "line card" industrial', "Gates"),
    ('"authorized Gates dealer" power transmission', "Gates"),
    # ESAB
    ('"authorized ESAB distributor"', "ESAB"),
    ('"ESAB distributor" welding supply', "ESAB"),
    ('"ESAB welding distributor" "line card"', "ESAB"),
    ('"authorized ESAB dealer" welding gas', "ESAB"),
    # Norton
    ('"authorized Norton distributor" abrasives', "Norton"),
    ('"Norton Abrasives distributor" "line card"', "Norton"),
    ('"call your local authorized Norton distributor"', "Norton"),
    ('"authorized Norton Saint-Gobain distributor"', "Norton"),
    ('"Norton abrasives" authorized stocking distributor', "Norton"),
    # WEG
    ('"authorized WEG distributor"', "WEG"),
    ('"WEG motors distributor" "line card"', "WEG"),
    ('"WEG authorized distributor" motors drives', "WEG"),
    ('"authorized WEG dealer" electric motors', "WEG"),
    # Regal Rexnord (+ its brand family)
    ('"authorized Regal Rexnord distributor" OR "authorized Leeson distributor"',
     "Regal Rexnord"),
    ('"authorized Rexnord distributor" bearings conveyor', "Regal Rexnord"),
    ('"authorized Browning distributor" OR "authorized Sealmaster distributor"',
     "Regal Rexnord"),
    ('"Regal Rexnord" "line card" distributor power transmission', "Regal Rexnord"),
    ('"authorized Marathon Electric distributor" OR "authorized Lincoln Motors distributor"',
     "Regal Rexnord"),
    # Dixon — no public locator exists at all, so SERP is the only route
    ('"authorized Dixon Valve distributor"', "Dixon"),
    ('"Dixon Valve distributor" hose fittings couplings', "Dixon"),
    ('"Dixon" authorized distributor "line card" hose', "Dixon"),
    ('"Dixon Bayco" OR "Dixon Sanitary" authorized distributor', "Dixon"),
    # ifm — thinnest brand in the test (2 organic results)
    ('"authorized ifm efector distributor"', "ifm"),
    ('"ifm efector distributor" sensors automation', "ifm"),
    ('"ifm" authorized distributor "line card" sensors', "ifm"),
    # Cross-brand and boilerplate patterns
    ('"authorized stocking distributor" hydraulics pneumatics', None),
    ('"we are an authorized distributor" industrial hose fittings', None),
    ('"factory authorized distributor" bearings power transmission', None),
    ('"authorized distributor" "line card" fluid power', None),
    ('"master distributor" industrial "line card"', None),
    ('"your local authorized distributor" catalog industrial', None),
]

# Axis B — brand x state. Deliberately capped: research/04 measured 0.54 unique
# per query here, the worst rate in the program. Strong brands only.
STRONG_BRANDS = [
    ('"authorized Parker distributor"', "Parker"),
    ('"authorized WEG distributor"', "WEG"),
    ('"authorized Regal Rexnord distributor" OR "authorized Leeson distributor"',
     "Regal Rexnord"),
]
AXIS_B_STATES = ["Texas", "Ohio", "California", "Illinois", "Pennsylvania",
                 "Michigan", "Indiana", "North Carolina", "Georgia",
                 "Wisconsin", "Tennessee", "New York"]

# Axis C — the workhorse. Line card x category (x state).
CATEGORIES = [
    ("hydraulic", "hydraulics"),
    ("pneumatic", "pneumatics"),
    ("hose and fittings", "hose_fittings"),
    ("bearings power transmission", "bearings_pt"),
    ("welding supply", "welding_gas"),
    ("abrasives cutting tools", "abrasives"),
    ("automation sensors", "automation"),
    ("electric motors drives", "motors_drives"),
    ("pumps valves", "pumps_valves"),
    ("industrial supply MRO", "mro"),
]
AXIS_C_STATES = ["Ohio", "Texas", "Pennsylvania", "Illinois", "Michigan",
                 "Indiana", "California", "Wisconsin", "North Carolina",
                 "Georgia", "Tennessee", "New York", "Alabama", "Minnesota",
                 "Missouri", "Kentucky"]


def build_plan():
    plan = []
    for kw, brand in AXIS_A:
        plan.append({"keyword": kw, "axis": "A", "axis_desc": "brand x variant, national",
                     "brand_hint": brand, "state": None, "category": None,
                     "ladder": "deep"})
    for kw, brand in STRONG_BRANDS:
        for st in AXIS_B_STATES:
            plan.append({"keyword": f"{kw} {st}", "axis": "B",
                         "axis_desc": "brand x state (capped)", "brand_hint": brand,
                         "state": st, "category": None, "ladder": "std"})
    for cat, slug in CATEGORIES:
        plan.append({"keyword": f'"line card" {cat} distributor', "axis": "Cn",
                     "axis_desc": "line card x category, national", "brand_hint": None,
                     "state": None, "category": slug, "ladder": "std"})
    for cat, slug in CATEGORIES:
        for st in AXIS_C_STATES:
            plan.append({"keyword": f'"line card" {cat} distributor {st}',
                         "axis": "Cs", "axis_desc": "line card x category x state",
                         "brand_hint": None, "state": st, "category": slug,
                         "ladder": "std"})
    return plan


# --------------------------------------------------------------- classifiers
# A .com TLD is not a US signal (research/04). Foreign ccTLDs, hard-excluded.
FOREIGN_TLDS = {
    "ca", "uk", "au", "in", "cn", "de", "fr", "es", "br", "mx", "nz", "za", "ae",
    "sg", "my", "ph", "id", "th", "vn", "ng", "gr", "it", "nl", "se", "pl", "tr",
    "ru", "ie", "dk", "no", "fi", "pt", "cl", "ar", "pe", "pk", "bd", "lk", "eg",
    "sa", "qa", "kw", "il", "jp", "kr", "tw", "hk", "ch", "at", "be", "cz", "hu",
    "ro", "ua", "kz", "bg", "hr", "sk", "si", "lt", "lv", "ee", "rs", "by", "ma",
    "ke", "tz", "gh", "cm", "ec", "uy", "py", "bo", "ve", "cr", "pa", "do", "gt",
    "np", "mm", "kh", "la", "bn", "om", "bh", "jo", "lb", "iq", "ir", "af", "uz",
}

MANUFACTURERS = {
    # the 8 blocked brands and their properties
    "parker.com", "parkerstore.com", "phstore.parker.com", "promo.parker.com",
    "gates.com", "gatescorp.com", "esab.com", "esabna.com", "esab.us",
    "nortonabrasives.com", "saint-gobain.com", "sgabrasives.com", "weg.net",
    "regalrexnord.com", "rexnord.com", "leeson.com", "browningpt.com",
    "sealmaster.com", "marathonelectric.com", "dixonvalve.com", "dixonbayco.com",
    "ifm.com", "efector.com",
    # other manufacturers that recur on these phrases
    "timken.com", "skf.com", "ntnamericas.com", "nsk.com", "schaeffler.com",
    "danfoss.com", "eaton.com", "boschrexroth.com", "boschrexroth-us.com",
    "festo.com", "smcusa.com", "emerson.com", "asco.com", "numatics.com",
    "honeywell.com", "3m.com", "lincolnelectric.com", "millerwelds.com",
    "hypertherm.com", "victortechnologies.com", "enerpac.com", "dornerconveyors.com",
    "spxflow.com", "nord.com", "baldor.com", "abb.com", "siemens.com",
    "new.siemens.com", "wika.com", "swagelok.com", "graco.com", "nidec.com",
    "sunsource.com", "kaman.com", "kamandirect.com", "interroll.com",
    "flexlink.com", "atlascopco.com", "ingersollrand.com", "quincycompressor.com",
    "kennametal.com", "sandvik.com", "walter-tools.com", "iscar.com",
    "mitutoyo.com", "starrett.com", "banjocorp.com", "gastmfg.com", "yaskawa.com",
    "pepperl-fuchs.com", "bannerengineering.com", "turck.com", "balluff.com",
    "sick.com", "keyence.com", "omron.com", "phoenixcontact.com", "wago.com",
    "rockwellautomation.com", "ab.com", "schneider-electric.com", "se.com",
    "hydac.com", "bimba.com", "clippard.com", "norgren.com", "imi-precision.com",
    "aro.com", "sullair.com", "chicagopneumatic.com", "grundfos.com", "flowserve.com",
    "ksb.com", "gorman-rupp.com", "viking-pump.com", "lovejoy-inc.com",
    "ballymore.com", "hytrol.com", "adaptall.com", "brennaninc.com", "stucchi.com",
    "donaldson.com", "parkerhannifin.com", "continental.com", "contitech.com",
    "chesterton.com", "loctite.com", "henkel.com", "dupont.com", "ppg.com",
}

MARKETPLACE_DIRECTORY = {
    "amazon.com", "ebay.com", "alibaba.com", "aliexpress.com", "walmart.com",
    "homedepot.com", "lowes.com", "etsy.com", "temu.com", "made-in-china.com",
    "indiamart.com", "tradeindia.com", "exportersindia.com", "globalsources.com",
    "thomasnet.com", "globalspec.com", "iqsdirectory.com", "manta.com",
    "yellowpages.com", "yelp.com", "bbb.org", "mapquest.com", "dnb.com",
    "zoominfo.com", "buzzfile.com", "crunchbase.com", "bloomberg.com",
    "apollo.io", "rocketreach.co", "leadiq.com", "lusha.com", "signalhire.com",
    "opencorporates.com", "bizapedia.com", "corporationwiki.com", "hoovers.com",
    "kompass.com", "europages.com", "macraesbluebook.com", "industrynet.com",
    "chamberofcommerce.com", "cylex.us.com", "citysearch.com", "superpages.com",
    "local.com", "merchantcircle.com", "hotfrog.com", "brownbook.net",
    "tupalo.com", "storeboard.com", "expertise.com", "birdeye.com", "nextdoor.com",
    "alignable.com", "trustpilot.com", "angi.com", "houzz.com", "porch.com",
    # national chains / catalog houses that swamp these phrases
    "grainger.com", "mcmaster.com", "mscdirect.com", "zoro.com", "fastenal.com",
    "motionindustries.com", "applied.com", "wesco.com", "rexelusa.com",
    "ferguson.com", "rsdelivers.com", "digikey.com", "mouser.com", "newark.com",
    "automationdirect.com", "globalindustrial.com", "uline.com", "fleetpride.com",
    "dxpe.com", "bdiexpress.com", "airgas.com", "praxair.com", "linde.com",
    "cementex.com", "traceparts.com", "grabcad.com", "octopart.com",
}

SOCIAL_JOBS_FORUM = {
    "linkedin.com", "facebook.com", "instagram.com", "youtube.com", "twitter.com",
    "x.com", "tiktok.com", "pinterest.com", "reddit.com", "quora.com",
    "indeed.com", "glassdoor.com", "ziprecruiter.com", "monster.com",
    "careerbuilder.com", "simplyhired.com", "jobcase.com", "snagajob.com",
    "medium.com", "wordpress.com", "blogspot.com", "tumblr.com", "vimeo.com",
    "issuu.com", "scribd.com", "yumpu.com", "slideshare.net", "docplayer.net",
    "studylib.net", "archive.org", "wikipedia.org", "pdfcoffee.com",
    "coursehero.com", "chegg.com", "academia.edu", "researchgate.net",
    "practicalmachinist.com", "weldingweb.com", "garagejournal.com",
    "pirate4x4.com", "heavyequipmentforums.com", "thefabricator.com",
}

TRADE_PRESS = {
    "fluidpowerworld.com", "fluidpowerjournal.com", "hydraulicspneumatics.com",
    "mdm.com", "industrialdistribution.com", "supplyht.com", "weldingdesign.com",
    "powertransmission.com", "designworldonline.com", "machinedesign.com",
    "plantengineering.com", "controleng.com", "assemblymag.com", "ien.com",
    "newequipment.com", "ishn.com", "modernpumpingtoday.com", "pumpsandsystems.com",
    "processingmagazine.com", "flowcontrolnetwork.com", "empoweringpumps.com",
    "manufacturingtomorrow.com", "automationworld.com", "roboticsbusinessreview.com",
    "thomaspublishing.com", "ptda.org", "nahad.org", "isapartners.org",
    "mhedaonline.org", "aednet.org", "prnewswire.com", "businesswire.com",
    "globenewswire.com", "einpresswire.com", "24-7pressrelease.com",
    "prweb.com", "yahoo.com", "msn.com", "google.com", "bing.com",
}

EXCLUDED = MANUFACTURERS | MARKETPLACE_DIRECTORY | SOCIAL_JOBS_FORUM | TRADE_PRESS

# Brand vocabulary — what a page NAMES. Used against title+url+snippet.
BRAND_VOCAB = [
    "Parker", "Parker Hannifin", "ParkerStore", "Gates", "ESAB", "Norton",
    "WEG", "Regal Rexnord", "Rexnord", "Leeson", "Browning", "Sealmaster",
    "Dixon", "ifm", "ifm efector", "Timken", "SKF", "NTN", "NSK", "Danfoss",
    "Eaton", "Bosch Rexroth", "Festo", "SMC", "Enerpac", "Lincoln Electric",
    "Miller", "Hypertherm", "Victor", "Harris", "3M", "Baldor", "ABB",
    "Siemens", "Yaskawa", "Allen-Bradley", "Banner", "Turck", "Balluff",
    "Pepperl+Fuchs", "Sick", "Keyence", "Omron", "Swagelok", "Graco", "Hydac",
    "Clippard", "Norgren", "Bimba", "Numatics", "Aro", "Sullair", "Atlas Copco",
    "Ingersoll Rand", "Kennametal", "Sandvik", "Walter", "Iscar", "Donaldson",
    "Continental", "ContiTech", "Chesterton", "Loctite", "Grundfos", "Flowserve",
    "Gorman-Rupp", "Viking", "Lovejoy", "Martin", "Dodge", "Boston Gear",
    "Morse", "Nord", "SEW-Eurodrive", "Sumitomo", "Fenner", "Gates Mectrol",
    "Alliance", "Weiler", "Walter Surface", "Osborn", "Camozzi", "Aventics",
    "Wika", "Ashcroft", "Dwyer", "Bosch", "Stanley", "DeWalt", "Milwaukee",
    "Makita", "Greenlee", "Klein", "Ridgid", "Snap-on", "Apex",
]
BRAND_RX = [(b, re.compile(r"(?<![A-Za-z])" + re.escape(b) + r"(?![A-Za-z])", re.I))
            for b in BRAND_VOCAB]

# Self-declaration patterns. First group = declarations the DEALER makes about
# THEMSELVES (quotable in email copy). Second = manufacturer catalog boilerplate
# printed on a PDF the dealer merely hosts — finds the account, but the words
# are the manufacturer's, so it is NOT quotable.
DECL_RX = re.compile(
    r"("
    r"(?:authorized|authorised|factory[- ]authorized|certified|approved|official)"
    r"\s+(?:\w+[\s\-]+){0,4}?"
    r"(?:stocking\s+)?(?:distributor|dealer|reseller|partner|integrator|"
    r"repair\s+center|service\s+center|master\s+distributor)"
    r"|"
    r"(?:distributor|dealer|reseller|partner)\s+(?:of|for)\s+[A-Z][\w\-]+"
    r"|"
    r"(?:largest|leading|premier|exclusive|only|oldest|#\s?1)\s+"
    r"(?:\w+[\s\-]+){0,4}?(?:distributor|dealer|supplier)"
    r"|"
    r"(?:master|exclusive|sole|stocking)\s+distributor"
    r"|Parker\s?Store"
    r")", re.I)

BOILERPLATE_RX = re.compile(
    r"(your\s+local\s+authorized|call\s+your\s+local|contact\s+your\s+local|"
    r"see\s+your\s+local|ask\s+your\s+local|available\s+from\s+your\s+local)", re.I)


def apex(domain):
    d = (domain or "").lower().strip().lstrip(".")
    if d.startswith("www."):
        d = d[4:]
    return d


def registrable(domain):
    """Crude apex for exclusion matching — last two labels, or three for co.uk."""
    parts = apex(domain).split(".")
    if len(parts) >= 3 and parts[-2] in ("co", "com", "net", "org", "gov", "edu", "ac"):
        return ".".join(parts[-3:])
    return ".".join(parts[-2:]) if len(parts) >= 2 else apex(domain)


def classify(domain, url):
    d = apex(domain)
    reg = registrable(d)
    tld = d.rsplit(".", 1)[-1] if "." in d else ""
    if not d:
        return "no_domain"
    if tld in FOREIGN_TLDS:
        return "foreign_tld"
    if tld in ("gov", "mil", "edu") or d.endswith(".gov") or d.endswith(".edu"):
        return "gov_edu"
    if reg in MANUFACTURERS or d in MANUFACTURERS:
        return "manufacturer"
    if reg in MARKETPLACE_DIRECTORY or d in MARKETPLACE_DIRECTORY:
        return "marketplace_directory"
    if reg in SOCIAL_JOBS_FORUM or d in SOCIAL_JOBS_FORUM:
        return "social_jobs_forum"
    if reg in TRADE_PRESS or d in TRADE_PRESS:
        return "trade_press"
    return "dealer_candidate"


def sentence_around(text, m):
    """Return the verbatim sentence containing the match, uncut and untouched."""
    s, e = m.start(), m.end()
    left = max((text.rfind(x, 0, s) for x in (". ", "! ", "? ", " | ", " – ", " — ")),
               default=-1)
    left = 0 if left < 0 else left + 1
    right = min([x for x in (text.find(". ", e), text.find(" | ", e),
                             text.find(" – ", e), text.find(" — ", e))
                 if x != -1] or [len(text)])
    return text[left:right].strip(" .|–— ")


def extract_declaration(title, desc, pre, ext):
    """Verbatim self-declaration from the SERP payload, exactly as published."""
    for field, txt in (("serp_title", title), ("serp_snippet", desc),
                       ("serp_pre_snippet", pre), ("serp_extended_snippet", ext)):
        if not txt:
            continue
        m = DECL_RX.search(txt)
        if m:
            sent = sentence_around(txt, m)
            if len(sent) < 8:
                continue
            return {
                "declaration": sent,
                "declaration_field": field,
                "declaration_match": m.group(0),
                "declaration_is_boilerplate": bool(BOILERPLATE_RX.search(sent)),
            }
    return {"declaration": None, "declaration_field": None,
            "declaration_match": None, "declaration_is_boilerplate": False}


def brands_named(*texts):
    blob = " ".join(t for t in texts if t)
    out = []
    for b, rx in BRAND_RX:
        if rx.search(blob):
            out.append(b)
    # collapse "Parker" when "Parker Hannifin" already matched, etc.
    return sorted(set(out))


# ------------------------------------------------------------------- fetching
def post(payload, timeout=300):
    req = urllib.request.Request(
        ENDPOINT, data=json.dumps([payload]).encode(),
        headers={"Authorization": AUTH, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def cache_key(kw):
    return re.sub(r"[^a-z0-9]+", "_", kw.lower())[:150]


def run_query(q):
    """Retry ladder 100/7 -> 30/3 -> 20/2 -> 10/1 for the documented 40101
    'Internal SE Server Error' that fires when depth exceeds available results."""
    path = os.path.join(CACHE, cache_key(q["keyword"]) + ".json")
    if os.path.exists(path):
        with open(path) as f:
            body = json.load(f)
        return q, body, 0.0, True, None

    ladder = LADDER_DEEP if q["ladder"] == "deep" else LADDER
    spent, last_err = 0.0, None
    for depth, pages in ladder:
        payload = {"keyword": q["keyword"], "location_name": "United States",
                   "language_code": "en", "depth": depth,
                   "max_crawl_pages": pages, "device": "desktop"}
        try:
            d = post(payload)
        except Exception as e:                       # transport-level
            last_err = f"transport {e!r}"
            time.sleep(5)
            continue
        spent += d.get("cost") or 0.0
        task = (d.get("tasks") or [{}])[0]
        if task.get("status_code") == 20000 and task.get("result"):
            body = {"keyword": q["keyword"], "depth": depth, "pages": pages,
                    "cost": d.get("cost") or 0.0, "task": task}
            with open(path, "w") as f:
                json.dump(body, f)
            return q, body, spent, False, None
        last_err = f"{task.get('status_code')} {task.get('status_message')}"
        time.sleep(1)
    return q, None, spent, False, last_err


def main():
    os.makedirs(CACHE, exist_ok=True)
    plan = build_plan()
    print(f"program: {len(plan)} queries "
          f"(A={sum(1 for p in plan if p['axis']=='A')} "
          f"B={sum(1 for p in plan if p['axis']=='B')} "
          f"Cn={sum(1 for p in plan if p['axis']=='Cn')} "
          f"Cs={sum(1 for p in plan if p['axis']=='Cs')})", flush=True)
    bal0 = balance()
    print(f"balance before: {bal0}", flush=True)

    records, qstats = [], []
    api_cost = 0.0
    t0 = time.time()
    done = 0

    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        for q, body, spent, cached, err in pool.map(run_query, plan):
            done += 1
            api_cost += spent
            if body is None:
                qstats.append({**{k: q[k] for k in
                                  ("keyword", "axis", "state", "category", "brand_hint")},
                               "organic": 0, "dealer_candidates": 0,
                               "error": err, "cached": False})
                print(f"  [{done}/{len(plan)}] ERR {q['keyword'][:60]} :: {err}",
                      flush=True)
                continue
            task = body["task"]
            res = (task.get("result") or [{}])[0]
            items = res.get("items") or []
            organic = [i for i in items if i.get("type") == "organic"]
            cand = 0
            for it in organic:
                dom = apex(it.get("domain"))
                url = it.get("url") or ""
                title = it.get("title") or ""
                desc = it.get("description") or ""
                pre = it.get("pre_snippet") or ""
                ext = it.get("extended_snippet") or ""
                cls = classify(dom, url)
                if cls == "dealer_candidate":
                    cand += 1
                decl = extract_declaration(title, desc, pre, ext)
                records.append({
                    "domain": dom,
                    "page_url": url,
                    "title": title,
                    "snippet": desc,
                    "pre_snippet": pre or None,
                    "extended_snippet": ext or None,
                    "rank_group": it.get("rank_group"),
                    "rank_absolute": it.get("rank_absolute"),
                    "serp_page": it.get("page"),
                    "is_featured_snippet": it.get("is_featured_snippet"),
                    "is_pdf": url.lower().endswith(".pdf"),
                    "classification": cls,
                    **decl,
                    "brands_named": brands_named(title, desc, pre, ext, url),
                    "brand_hint": q["brand_hint"],
                    "query": q["keyword"],
                    "query_axis": q["axis"],
                    "query_axis_desc": q["axis_desc"],
                    "query_state": q["state"],
                    "query_category": q["category"],
                    "serp_check_url": res.get("check_url"),
                    "serp_datetime": res.get("datetime"),
                    "source": "serp",
                    "source_url": url,
                    "captured": CAPTURED,
                })
            qstats.append({**{k: q[k] for k in
                              ("keyword", "axis", "state", "category", "brand_hint")},
                           "depth": body["depth"], "pages": body["pages"],
                           "cost": body["cost"], "organic": len(organic),
                           "dealer_candidates": cand, "cached": cached, "error": None})
            if done % 25 == 0 or done == len(plan):
                print(f"  [{done}/{len(plan)}] raw={len(records)} "
                      f"cost=${api_cost:.4f} elapsed={time.time()-t0:.0f}s", flush=True)

    bal1 = balance()
    payload = {
        "source": "serp",
        "source_name": "Dealer self-identification SERP program (DataForSEO Google organic)",
        "captured": CAPTURED,
        "program": {
            "queries_planned": len(plan),
            "queries_completed": sum(1 for s in qstats if not s.get("error")),
            "queries_failed": sum(1 for s in qstats if s.get("error")),
            "axis_A_brand_variant_national": sum(1 for p in plan if p["axis"] == "A"),
            "axis_B_brand_x_state": sum(1 for p in plan if p["axis"] == "B"),
            "axis_Cn_linecard_national": sum(1 for p in plan if p["axis"] == "Cn"),
            "axis_Cs_linecard_x_state": sum(1 for p in plan if p["axis"] == "Cs"),
            "blocked_brands_targeted": BLOCKED_BRANDS,
            "categories": [c[1] for c in CATEGORIES],
            "axis_b_states": AXIS_B_STATES,
            "axis_c_states": AXIS_C_STATES,
        },
        "api_cost_measured": round(api_cost, 4),
        "balance_before": bal0,
        "balance_after": bal1,
        "balance_delta": round(bal0 - bal1, 4),
        "per_query": qstats,
        "records": records,
    }
    with open(os.path.join(RAW, f"serp-selfid-{CAPTURED}.json"), "w") as f:
        json.dump(payload, f, indent=1)
    print(f"\nDONE raw_results={len(records)} queries={len(qstats)} "
          f"api_cost=${api_cost:.4f} balance_delta=${bal0-bal1:.4f} "
          f"elapsed={time.time()-t0:.0f}s")


if __name__ == "__main__":
    main()
