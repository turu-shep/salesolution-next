#!/usr/bin/env python3
"""S1 raw acquisition — SERP dealer self-identification, WAVE 2 (+500 queries).

Wave 1 (`serp_selfid.py`, 250 queries, $1.36) returned 1,474 dealer domains,
~1,120 genuine, and DID NOT SATURATE. Build plan §5e needs 700-1,200 more
identified industrial companies; this is the cheapest of the three routes left.

WHAT WAVE 1 MEASURED, AND HOW IT SHAPES THIS FILE (§5b):

  1. BRAND-AGNOSTIC BEAT BRAND-SPECIFIC.  `"master distributor" industrial
     "line card"` returned 58 domains; `"Parker Store"` returned 43. Wave 2 is
     therefore ~100% brand-agnostic. No axis A/B brand permutation at all —
     wave 1 already exhausted the eight blocked brands (Parker 188, Regal
     Rexnord 64, Dixon 62, WEG 45, ESAB 33, Gates 30, ifm 26, Norton 20).
  2. STATE-SCOPE THE LINE-CARD PHRASE, NOT THE BRAND PHRASE.  12 net-new of 17
     vs 6 net-new of 13. Every geographic permutation here hangs off the
     line-card axis.
  3. GATES'S RETAIL-PROGRAM TERM IS A DEAD END (3 organic, 0 dealers). Absent.
  4. §5e — THE TIMKEN LESSON.  Timken's locator was ~two-thirds automotive and
     said so in a category code we captured but never read; decoding it
     collapsed seated Timken from 1,187 to 15. Consequences here, both applied:
       (a) every query carries an INDUSTRIAL QUALIFIER (industrial, MRO, power
           transmission, hydraulic, pneumatic, bearings, fluid power, mill
           supply, plant maintenance) and none carries automotive/truck/fleet/
           aftermarket vocabulary;
       (b) every source-native field the SERP exposes is stored VERBATIM
           (breadcrumb, website_name, about_this_result, related_result,
           rank_group/rank_absolute, xpath), plus a non-destructive
           `auto_truck_signal` flag with the matched terms recorded. NOTHING is
           dropped on a vertical signal — S3 decides, this stage records.

PROGRAM SHAPE (500 queries, zero overlap with wave 1 — asserted at runtime):
  A2   50  new brand-agnostic self-declaration phrases x industrial qualifier,
           national. The pattern family that outperformed everything.
  B2  170  line card x category x the 34 states wave 1 never touched, weighted
           by industrial density (12 dense x 8 cats, 10 mid x 5, 12 thin x 2).
  C2  200  line card x category x METRO — a permutation axis wave 1 never used.
           The mechanism that made state-scoping work (a dealer states its
           geography on its own line-card page) applies harder at metro level.
  D2   80  line card x TEN NEW CATEGORIES wave 1 omitted (material handling,
           seals/gaskets, fasteners, compressed air, process instrumentation,
           industrial rubber, lubricants, safety supply, mill supply, cutting
           tools), national + the 7 densest wave-1 states.

RAW ACQUISITION ONLY. Classification is a tag on the record, never a delete.
"""
import base64
import json
import os
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

CAPTURED = "2026-08-01"
WAVE = "wave2"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "data", "raw")
CACHE = os.path.join(RAW, "_cache", "serp-w2")
WAVE1 = os.path.join(RAW, "serp-selfid-2026-08-01.json")
ENDPOINT = "https://api.dataforseo.com/v3/serp/google/organic/live/advanced"
WORKERS = 5
LADDER = [(30, 3), (20, 2), (10, 1)]
LADDER_DEEP = [(100, 7), (30, 3), (20, 2), (10, 1)]


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


# ============================================================== THE QUERY PLAN

# --- A2: brand-agnostic self-declaration phrases, national. -------------------
# Every one pairs a declaration phrase with an INDUSTRIAL qualifier. None of the
# six wave-1 cross-brand phrases is repeated.
AXIS_A2 = [
    ('"master distributor" "line card" power transmission', "bearings_pt"),
    ('"master distributor" hydraulic hose fittings industrial', "hose_fittings"),
    ('"master distributor" pneumatics fluid power', "pneumatics"),
    ('"master distributor" bearings MRO supply', "bearings_pt"),
    ('"master distributor" industrial supply plant maintenance', "mro"),
    ('"authorized stocking distributor" bearings power transmission', "bearings_pt"),
    ('"authorized stocking distributor" industrial MRO supply', "mro"),
    ('"authorized stocking distributor" welding supply industrial gas', "welding_gas"),
    ('"authorized stocking distributor" abrasives cutting tools', "abrasives"),
    ('"authorized stocking distributor" seals gaskets industrial', "seals_gaskets"),
    ('"we are an authorized distributor" bearings power transmission', "bearings_pt"),
    ('"we are an authorized distributor" pneumatics automation', "automation"),
    ('"we are an authorized distributor" industrial MRO supply', "mro"),
    ('"factory authorized distributor" hydraulics fluid power', "hydraulics"),
    ('"factory authorized distributor" industrial automation sensors', "automation"),
    ('"factory authorized distributor" pumps valves industrial', "pumps_valves"),
    ('"authorized distributor" "line card" mill supply', "mill_supply"),
    ('"authorized distributor" "line card" plant maintenance', "mro"),
    ('"authorized distributor" "line card" MRO industrial', "mro"),
    ('"our line card" industrial distributor', "mro"),
    ('"our line card" hydraulic pneumatic distributor', "hydraulics"),
    ('"our line card" bearings power transmission distributor', "bearings_pt"),
    ('"view our line card" industrial supply distributor', "mro"),
    ('"download our line card" industrial distributor', "mro"),
    ('"line card" "industrial distributor" MRO', "mro"),
    ('"line card" "mill supply" distributor', "mill_supply"),
    ('"line card" "plant maintenance" industrial distributor', "mro"),
    ('"line card" "fluid power" stocking distributor', "hydraulics"),
    ('"line card" "power transmission" distributor bearings belts', "bearings_pt"),
    ('"stocking distributor" "line card" industrial supply', "mro"),
    ('"independent distributor" industrial MRO "line card"', "mro"),
    ('"full line distributor" industrial supply "line card"', "mro"),
    ('"full line distributor" hydraulic pneumatic fluid power', "hydraulics"),
    ('"industrial distributor since" hydraulics pneumatics', "hydraulics"),
    ('"family owned" industrial distributor "line card" MRO', "mro"),
    ('"employee owned" industrial distributor "line card"', "mro"),
    ('"we stock" bearings "power transmission" distributor "line card"', "bearings_pt"),
    ('"request a quote" "line card" industrial distributor hydraulic', "hydraulics"),
    ('"authorized dealer" "line card" industrial MRO', "mro"),
    ('"value added distributor" industrial fluid power', "hydraulics"),
    ('"MRO distributor" "line card" industrial', "mro"),
    ('"fluid power distributor" "line card" hydraulic pneumatic', "hydraulics"),
    ('"power transmission distributor" "line card" bearings', "bearings_pt"),
    ('"welding distributor" "line card" industrial gas', "welding_gas"),
    ('"hose and fittings" distributor "line card" industrial', "hose_fittings"),
    ('"conveyor" distributor "line card" material handling industrial', "material_handling"),
    ('"pumps and valves" distributor "line card" industrial', "pumps_valves"),
    ('"abrasives" distributor "line card" industrial cutting tools', "abrasives"),
    ('"seals and gaskets" distributor "line card" industrial', "seals_gaskets"),
    ('"compressed air" distributor "line card" industrial pneumatic', "compressed_air"),
]

# --- Wave-1 categories, reused ONLY against states wave 1 never queried. ------
CATS_W1 = [
    ("hydraulic", "hydraulics"),
    ("pneumatic", "pneumatics"),
    ("hose and fittings", "hose_fittings"),
    ("bearings power transmission", "bearings_pt"),
    ("industrial supply MRO", "mro"),
    ("welding supply", "welding_gas"),
    ("pumps valves", "pumps_valves"),
    ("electric motors drives", "motors_drives"),
]

# The 34 states wave 1's Axis Cs never touched, tiered by industrial density.
STATES_NEW_DENSE = ["Florida", "New Jersey", "Virginia", "Washington", "Colorado",
                    "Arizona", "Louisiana", "Oklahoma", "Massachusetts",
                    "Maryland", "South Carolina", "Iowa"]
STATES_NEW_MID = ["Kansas", "Arkansas", "Connecticut", "Mississippi", "Utah",
                  "Oregon", "Nebraska", "Nevada", "West Virginia", "New Mexico"]
STATES_NEW_THIN = ["Idaho", "Maine", "Montana", "New Hampshire", "North Dakota",
                   "Rhode Island", "South Dakota", "Vermont", "Wyoming",
                   "Delaware", "Alaska", "Hawaii"]

# --- C2: the new axis — METRO scoping of the line-card phrase. ----------------
# Industrial metros. Detroit is deliberately omitted: it is the single most
# automotive-contaminated metro in the country and §5e says bias away from it.
METROS = ["Houston", "Chicago", "Cleveland", "Dallas", "Atlanta", "Philadelphia",
          "Charlotte", "Cincinnati", "Pittsburgh", "Milwaukee", "St. Louis",
          "Kansas City", "Minneapolis", "Indianapolis", "Columbus Ohio",
          "Nashville", "Birmingham Alabama", "Memphis", "Louisville", "Tulsa",
          "Denver", "Portland Oregon", "Seattle", "Salt Lake City",
          "Baton Rouge"]
CATS_METRO = [
    ("hydraulic", "hydraulics"),
    ("pneumatic", "pneumatics"),
    ("hose and fittings", "hose_fittings"),
    ("bearings power transmission", "bearings_pt"),
    ("industrial supply MRO", "mro"),
    ("welding supply", "welding_gas"),
    ("pumps valves", "pumps_valves"),
    ("material handling conveyor", "material_handling"),
]

# --- D2: ten categories wave 1 omitted entirely. ------------------------------
CATS_NEW = [
    ("material handling conveyor", "material_handling"),
    ("seals and gaskets", "seals_gaskets"),
    ("industrial fasteners", "fasteners"),
    ("compressed air", "compressed_air"),
    ("process instrumentation", "instrumentation"),
    ("industrial rubber", "industrial_rubber"),
    ("industrial lubricants", "lubricants"),
    ("industrial safety supply", "safety_supply"),
    ("mill supply", "mill_supply"),
    ("cutting tools tooling", "cutting_tools"),
]
STATES_W1_DENSE = ["Ohio", "Texas", "Pennsylvania", "Illinois", "Michigan",
                   "California", "Georgia"]


def build_plan():
    plan = []
    for kw, cat in AXIS_A2:
        plan.append({"keyword": kw, "axis": "A2",
                     "axis_desc": "brand-agnostic self-declaration x industrial qualifier, national",
                     "state": None, "metro": None, "category": cat, "ladder": "deep"})
    for states, ncats in ((STATES_NEW_DENSE, 8), (STATES_NEW_MID, 5),
                          (STATES_NEW_THIN, 2)):
        for st in states:
            for cat, slug in CATS_W1[:ncats]:
                plan.append({"keyword": f'"line card" {cat} distributor {st}',
                             "axis": "B2",
                             "axis_desc": "line card x category x state (states wave 1 never queried)",
                             "state": st, "metro": None, "category": slug,
                             "ladder": "std"})
    for metro in METROS:
        for cat, slug in CATS_METRO:
            plan.append({"keyword": f'"line card" {cat} distributor {metro}',
                         "axis": "C2",
                         "axis_desc": "line card x category x METRO (new permutation axis)",
                         "state": None, "metro": metro, "category": slug,
                         "ladder": "std"})
    for cat, slug in CATS_NEW:
        plan.append({"keyword": f'"line card" {cat} distributor', "axis": "D2n",
                     "axis_desc": "line card x NEW category, national",
                     "state": None, "metro": None, "category": slug,
                     "ladder": "std"})
        for st in STATES_W1_DENSE:
            plan.append({"keyword": f'"line card" {cat} distributor {st}',
                         "axis": "D2s",
                         "axis_desc": "line card x NEW category x dense state",
                         "state": st, "metro": None, "category": slug,
                         "ladder": "std"})
    return plan


# ============================================================== CLASSIFICATION
# Reused verbatim from wave 1 so the two waves are directly comparable.
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
    "parker.com", "parkerstore.com", "phstore.parker.com", "promo.parker.com",
    "gates.com", "gatescorp.com", "esab.com", "esabna.com", "esab.us",
    "nortonabrasives.com", "saint-gobain.com", "sgabrasives.com", "weg.net",
    "regalrexnord.com", "rexnord.com", "leeson.com", "browningpt.com",
    "sealmaster.com", "marathonelectric.com", "dixonvalve.com", "dixonbayco.com",
    "ifm.com", "efector.com",
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
    # additions surfaced by wave 1 / wave 2 category expansion
    "dodgeindustrial.com", "martinsprocket.com", "sew-eurodrive.com",
    "gatesmectrol.com", "trelleborg.com", "garlock.com", "johncrane.com",
    "freudenberg.com", "sunbeltrentals.com", "hilti.com", "sandvikcoromant.com",
    "seco-tools.com", "widia.com", "osgtool.com", "guhring.com", "harveytool.com",
    "flexco.com", "hyster.com", "toyotaforklift.com", "crown.com", "raymondcorp.com",
    "columbusmckinnon.com", "vulcanthreadedproducts.com", "wurthindustry.com",
    "chevron.com", "shell.com", "exxonmobil.com", "mobil.com", "castrol.com",
    "fuchs.com", "klueber.com", "honeywellsafety.com", "msasafety.com",
    "ansell.com", "kimberly-clark.com", "3mcanada.com", "dupontsafety.com",
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
    "mhlnews.com", "materialhandling247.com", "logisticsmgmt.com",
    "moderndistribution.com", "sdcexec.com", "ehstoday.com", "safetyandhealthmagazine.com",
    "lubesngreases.com", "machinerylubrication.com", "reliableplant.com",
    "ctemag.com", "mmsonline.com", "productionmachining.com", "moldmakingtechnology.com",
}

EXCLUDED = MANUFACTURERS | MARKETPLACE_DIRECTORY | SOCIAL_JOBS_FORUM | TRADE_PRESS

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
    # wave-2 category expansion
    "Garlock", "John Crane", "Trelleborg", "Freudenberg", "Chicago Rawhide",
    "Flexco", "Hytrol", "Interroll", "Columbus McKinnon", "Crosby", "Gorbel",
    "Wurth", "Hillman", "Nucor", "Elco", "Simpson", "Sandvik Coromant",
    "Seco", "Widia", "OSG", "Guhring", "Harvey Tool", "Niagara Cutter",
    "Mobil", "Shell", "Chevron", "Castrol", "Fuchs", "Kluber", "Lubriplate",
    "MSA", "Ansell", "Honeywell Safety", "Jackson Safety", "Bullard",
    "Endress+Hauser", "Rosemount", "Yokogawa", "Krohne", "Anderson-Negele",
    "Gates Sonic", "Kuriyama", "Campbell Fittings", "Jason Industrial",
    "Goodyear", "Alfagomma", "Semperit", "Novaflex", "Salem Republic",
]
BRAND_RX = [(b, re.compile(r"(?<![A-Za-z])" + re.escape(b) + r"(?![A-Za-z])", re.I))
            for b in BRAND_VOCAB]

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
    r"(?:master|exclusive|sole|stocking|full[- ]line|value[- ]added)\s+distributor"
    r"|Parker\s?Store"
    r")", re.I)

BOILERPLATE_RX = re.compile(
    r"(your\s+local\s+authorized|call\s+your\s+local|contact\s+your\s+local|"
    r"see\s+your\s+local|ask\s+your\s+local|available\s+from\s+your\s+local)", re.I)

# §5e vertical guard. NON-DESTRUCTIVE: sets a flag and records the matched terms
# verbatim. Timken's automotive contamination was invisible to name and homepage
# and only a source-native code caught it — so we record the signal and let S3
# adjudicate, exactly as `tier_raw` was preserved unmapped.
AUTO_TRUCK_RX = re.compile(
    r"(?<![A-Za-z])("
    r"automotive|auto\s+parts|autoparts|aftermarket|truck\s+parts|"
    r"heavy\s+duty\s+truck|fleet\s+(?:service|supply|parts|maintenance)|"
    r"semi[- ]truck|trailer\s+parts|brake\s+(?:parts|shop)|"
    r"transmission\s+shop|collision|body\s+shop|tire\s+(?:shop|center)|"
    r"napa|carquest|o'?reilly|autozone|advance\s+auto|parts\s+authority|"
    r"rush\s+truck|freightliner|peterbilt|kenworth|mack\s+truck|"
    r"engine\s+rebuild|radiator\s+shop|muffler|car\s+care|quick\s+lube"
    r")(?![A-Za-z])", re.I)

INDUSTRIAL_RX = re.compile(
    r"(?<![A-Za-z])("
    r"industrial|MRO|power\s+transmission|hydraulic|pneumatic|bearing|"
    r"fluid\s+power|mill\s+supply|plant\s+maintenance|manufacturing|"
    r"conveyor|material\s+handling|machine\s+shop|process\s+equipment|"
    r"welding|abrasive|fastener|instrumentation|automation|OEM"
    r")(?![A-Za-z])", re.I)


def apex(domain):
    d = (domain or "").lower().strip().lstrip(".")
    return d[4:] if d.startswith("www.") else d


def registrable(domain):
    parts = apex(domain).split(".")
    if len(parts) >= 3 and parts[-2] in ("co", "com", "net", "org", "gov", "edu", "ac"):
        return ".".join(parts[-3:])
    return ".".join(parts[-2:]) if len(parts) >= 2 else apex(domain)


def classify(domain):
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
    """The verbatim sentence containing the match — casing and punctuation as
    published, because this string goes straight into email copy."""
    s, e = m.start(), m.end()
    left = max((text.rfind(x, 0, s) for x in (". ", "! ", "? ", " | ", " – ", " — ")),
               default=-1)
    left = 0 if left < 0 else left + 1
    right = min([x for x in (text.find(". ", e), text.find(" | ", e),
                             text.find(" – ", e), text.find(" — ", e))
                 if x != -1] or [len(text)])
    return text[left:right].strip(" .|–— ")


def extract_declaration(title, desc, pre, ext):
    for field, txt in (("serp_title", title), ("serp_snippet", desc),
                       ("serp_pre_snippet", pre), ("serp_extended_snippet", ext)):
        if not txt:
            continue
        m = DECL_RX.search(txt)
        if m:
            sent = sentence_around(txt, m)
            if len(sent) < 8:
                continue
            return {"declaration": sent, "declaration_field": field,
                    "declaration_match": m.group(0),
                    "declaration_is_boilerplate": bool(BOILERPLATE_RX.search(sent))}
    return {"declaration": None, "declaration_field": None,
            "declaration_match": None, "declaration_is_boilerplate": False}


def brands_named(*texts):
    blob = " ".join(t for t in texts if t)
    return sorted({b for b, rx in BRAND_RX if rx.search(blob)})


def vertical_signals(*texts):
    """§5e. Record the terms verbatim; never act on them here."""
    blob = " ".join(t for t in texts if t)
    auto = sorted({m.group(0) for m in AUTO_TRUCK_RX.finditer(blob)})
    ind = sorted({m.group(0) for m in INDUSTRIAL_RX.finditer(blob)})
    return {"auto_truck_signal": bool(auto), "auto_truck_terms": auto,
            "industrial_signal": bool(ind), "industrial_terms": ind}


# ==================================================================== FETCHING
def post(payload, timeout=180):
    req = urllib.request.Request(
        ENDPOINT, data=json.dumps([payload]).encode(),
        headers={"Authorization": AUTH, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def cache_key(kw):
    return re.sub(r"[^a-z0-9]+", "_", kw.lower())[:150]


def run_query(q):
    path = os.path.join(CACHE, cache_key(q["keyword"]) + ".json")
    if os.path.exists(path):
        with open(path) as f:
            return q, json.load(f), 0.0, True, None
    ladder = LADDER_DEEP if q["ladder"] == "deep" else LADDER
    spent, last_err = 0.0, None
    for depth, pages in ladder:
        payload = {"keyword": q["keyword"], "location_name": "United States",
                   "language_code": "en", "depth": depth,
                   "max_crawl_pages": pages, "device": "desktop"}
        try:
            d = post(payload)
        except Exception as e:
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


def process_body(q, body, w1_domains):
    """Turn one SERP payload into records + one qstat row. Pure, no I/O."""
    task = body["task"]
    res = (task.get("result") or [{}])[0]
    items = res.get("items") or []
    organic = [i for i in items if i.get("type") == "organic"]
    recs, cand, qnew = [], 0, set()
    for it in organic:
        dom = apex(it.get("domain"))
        url = it.get("url") or ""
        title = it.get("title") or ""
        desc = it.get("description") or ""
        pre = it.get("pre_snippet") or ""
        ext = it.get("extended_snippet") or ""
        bc = it.get("breadcrumb") or ""
        cls = classify(dom)
        if cls == "dealer_candidate":
            cand += 1
            if dom and dom not in w1_domains:
                qnew.add(dom)
        recs.append({
            "domain": dom,
            "page_url": url,
            "title": title,
            "snippet": desc,
            "pre_snippet": pre or None,
            "extended_snippet": ext or None,
            # source-native fields, verbatim (§5e: capture, interpret late)
            "breadcrumb": bc or None,
            "website_name": it.get("website_name"),
            "about_this_result": it.get("about_this_result"),
            "related_result": it.get("related_result"),
            "serp_item_xpath": it.get("xpath"),
            "rank_group": it.get("rank_group"),
            "rank_absolute": it.get("rank_absolute"),
            "serp_page": it.get("page"),
            "is_featured_snippet": it.get("is_featured_snippet"),
            "is_pdf": url.lower().endswith(".pdf"),
            "classification": cls,
            **extract_declaration(title, desc, pre, ext),
            "brands_named": brands_named(title, desc, pre, ext, bc, url),
            **vertical_signals(title, desc, pre, ext, bc, url),
            "seen_in_wave1": bool(dom) and dom in w1_domains,
            "query": q["keyword"],
            "query_axis": q["axis"],
            "query_axis_desc": q["axis_desc"],
            "query_state": q["state"],
            "query_metro": q["metro"],
            "query_category": q["category"],
            "serp_check_url": res.get("check_url"),
            "serp_datetime": res.get("datetime"),
            "source": "serp",
            "source_wave": WAVE,
            "source_url": url,
            "captured": CAPTURED,
        })
    stat = {k: q[k] for k in ("keyword", "axis", "state", "metro", "category")}
    stat.update({"depth": body["depth"], "pages": body["pages"],
                 "cost": body["cost"], "organic": len(organic),
                 "dealer_candidates": cand, "net_new_vs_w1": len(qnew),
                 "error": None})
    return recs, stat


# ================================================================ CHECKPOINTING
# A prior wave-2 run stalled after paying for 415 queries and wrote NOTHING,
# because every record lived in memory until a single json.dump at the end.
# Records and query stats are now appended to JSONL after every completed query
# and fsync'd every CHECKPOINT_EVERY queries. A stall now costs the queries in
# flight, not the run. `--finalize` rebuilds the JSON from the partials alone.
CHECKPOINT_EVERY = 25
PART_REC = os.path.join(RAW, f"serp-selfid-wave2-{CAPTURED}.records.partial.jsonl")
PART_STAT = os.path.join(RAW, f"serp-selfid-wave2-{CAPTURED}.qstats.partial.jsonl")
OUT = os.path.join(RAW, f"serp-selfid-wave2-{CAPTURED}.json")


def load_partials():
    recs, stats = [], []
    for path, sink in ((PART_REC, recs), (PART_STAT, stats)):
        if not os.path.exists(path):
            continue
        with open(path) as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    sink.append(json.loads(line))
                except json.JSONDecodeError:
                    pass  # torn last line from a hard kill; drop it, keep the rest
    return recs, stats


def wave1_baseline():
    with open(WAVE1) as f:
        w1 = json.load(f)
    return (
        {q["keyword"] for q in w1["per_query"]},
        {r["domain"] for r in w1["records"] if r.get("domain")},
        {r["domain"] for r in w1["records"]
         if r.get("domain") and r["classification"] == "dealer_candidate"},
    )


def finalize(plan, counts, w1_kw, w1_domains, w1_dealer, api_cost, bal0, bal1):
    records, qstats = load_partials()
    w2_dealer = {r["domain"] for r in records
                 if r["classification"] == "dealer_candidate" and r["domain"]}
    w2_all = {r["domain"] for r in records if r["domain"]}
    net_new = w2_dealer - w1_domains

    # Saturation curve: distinct net-new dealer domains contributed by each
    # successive block of 50 queries, walked in PLAN order — not completion
    # order, which is an artifact of which queries happened to be cached.
    # This is the number that decides whether a wave 3 is worth running.
    by_q = {}
    for r in records:
        if r["classification"] == "dealer_candidate" and r["domain"]:
            by_q.setdefault(r["query"], set()).add(r["domain"])
    ran = {s["keyword"] for s in qstats}
    seen, curve = set(w1_domains), []
    for p in plan:
        if p["keyword"] not in ran:
            continue
        before = len(seen)
        seen |= by_q.get(p["keyword"], set())
        curve.append(len(seen) - before)
    blocks = [{"queries": f"{i+1}-{min(i+50, len(curve))}",
               "net_new_dealer_domains": sum(curve[i:i + 50]),
               "per_query": round(sum(curve[i:i + 50]) / len(curve[i:i + 50]), 3)}
              for i in range(0, len(curve), 50)]

    # Marginal yield by axis, in plan order — which query family is still paying.
    axis_curve = {}
    seen_a = set(w1_domains)
    for p in plan:
        if p["keyword"] not in ran:
            continue
        before = len(seen_a)
        seen_a |= by_q.get(p["keyword"], set())
        a = axis_curve.setdefault(p["axis"], {"queries": 0, "net_new": 0})
        a["queries"] += 1
        a["net_new"] += len(seen_a) - before
    for a in axis_curve.values():
        a["net_new_per_query"] = round(a["net_new"] / max(1, a["queries"]), 3)

    auto = sum(1 for r in records if r["auto_truck_signal"])
    decl = [r for r in records if r["declaration"]]
    payload = {
        "source": "serp",
        "source_name": "Dealer self-identification SERP program — WAVE 2 (DataForSEO Google organic)",
        "captured": CAPTURED,
        "wave": WAVE,
        "wave1_file": os.path.basename(WAVE1),
        "program": {
            "queries_planned": len(plan),
            "queries_completed": sum(1 for s in qstats if not s.get("error")),
            "queries_failed": sum(1 for s in qstats if s.get("error")),
            "axis_counts": counts,
            "design_rules_applied": [
                "brand-agnostic only — wave 1 measured them ahead of brand-specific (58 vs 43 domains)",
                "geography permutes the LINE-CARD phrase, never a brand phrase (12/17 vs 6/13 net-new)",
                "Gates retail-program term excluded — confirmed dead end (3 organic, 0 dealers)",
                "every query carries an industrial qualifier; no automotive/truck/fleet/aftermarket vocabulary",
                "§5e: source-native fields captured verbatim; vertical signals flagged, never filtered",
            ],
            "categories_wave1_reused": [c[1] for c in CATS_W1],
            "categories_new": [c[1] for c in CATS_NEW],
            "states_new_dense": STATES_NEW_DENSE,
            "states_new_mid": STATES_NEW_MID,
            "states_new_thin": STATES_NEW_THIN,
            "metros": METROS,
        },
        "measured": {
            "raw_organic_results": len(records),
            "wave2_dealer_domains_distinct": len(w2_dealer),
            "wave2_all_domains_distinct": len(w2_all),
            "wave1_all_domains_distinct": len(w1_domains),
            "wave1_dealer_domains_distinct": len(w1_dealer),
            "net_new_dealer_domains_vs_wave1": len(net_new),
            "net_new_rate": round(len(net_new) / max(1, len(w2_dealer)), 4),
            "dealer_domains_per_query": round(len(w2_dealer) / max(1, len(qstats)), 3),
            "net_new_per_query": round(len(net_new) / max(1, len(qstats)), 3),
            "wave1_dealer_domains_per_query": round(len(w1_dealer) / 246, 3),
            "saturation_curve_per_50_queries": blocks,
            "net_new_by_axis": axis_curve,
            "records_with_declaration": len(decl),
            "dealer_domains_with_declaration": len(
                {r["domain"] for r in decl
                 if r["classification"] == "dealer_candidate" and r["domain"]}),
            "net_new_domains_with_declaration": len(
                {r["domain"] for r in decl
                 if r["classification"] == "dealer_candidate" and r["domain"]}
                & net_new),
            "records_auto_truck_flagged": auto,
            "records_auto_truck_rate": round(auto / max(1, len(records)), 4),
            "dealer_domains_auto_truck_flagged": len(
                {r["domain"] for r in records if r["auto_truck_signal"]
                 and r["classification"] == "dealer_candidate" and r["domain"]}),
        },
        # Two different numbers, and conflating them would misreport the program.
        # `api_cost_program_total` is what all 500 queries cost DataForSEO, summed
        # from each task's own recorded cost — including the 415 paid for by the
        # run that stalled before it wrote anything. `api_cost_this_session` is
        # only what this invocation spent; cache replays are free.
        "api_cost_program_total": round(sum(s.get("cost") or 0.0 for s in qstats), 4),
        "api_cost_this_session": round(api_cost, 4),
        "api_cost_measured": round(sum(s.get("cost") or 0.0 for s in qstats), 4),
        "queries_served_from_cache": sum(1 for s in qstats if s.get("cached")),
        "balance_before": bal0,
        "balance_after": bal1,
        "balance_delta": round((bal0 - bal1) if (bal0 and bal1) else 0.0, 4),
        "per_query": qstats,
        "records": records,
    }
    with open(OUT, "w") as f:
        json.dump(payload, f, indent=1)
    print(f"\nDONE queries={len(qstats)} raw={len(records)} "
          f"w2_dealer_domains={len(w2_dealer)} net_new_vs_w1={len(net_new)} "
          f"net_new_rate={len(net_new)/max(1,len(w2_dealer)):.1%} "
          f"auto_flag={auto/max(1,len(records)):.1%} "
          f"cost=${api_cost:.4f} -> {OUT}")
    return payload


def main():
    os.makedirs(CACHE, exist_ok=True)
    plan = build_plan()
    finalize_only = "--finalize" in sys.argv

    w1_kw, w1_domains, w1_dealer = wave1_baseline()
    dupes = sorted({p["keyword"] for p in plan} & w1_kw)
    if dupes:
        sys.exit(f"ABORT — {len(dupes)} queries duplicate wave 1: {dupes[:5]}")
    if len({p["keyword"] for p in plan}) != len(plan):
        sys.exit("ABORT — duplicate keywords inside the wave-2 plan")

    counts = {}
    for p in plan:
        counts[p["axis"]] = counts.get(p["axis"], 0) + 1

    if finalize_only:
        finalize(plan, counts, w1_kw, w1_domains, w1_dealer, 0.0, None, None)
        return

    # Resume: skip anything already checkpointed.
    _, done_stats = load_partials()
    already = {s["keyword"] for s in done_stats}
    todo = [p for p in plan if p["keyword"] not in already]

    print(f"wave 2 program: {len(plan)} queries {counts}", flush=True)
    print(f"wave 1 baseline: {len(w1_kw)} queries, {len(w1_dealer)} dealer domains, "
          f"{len(w1_domains)} total domains", flush=True)
    print(f"resume: {len(already)} already checkpointed, {len(todo)} to run",
          flush=True)
    cached_n = sum(1 for p in todo
                   if os.path.exists(os.path.join(CACHE, cache_key(p["keyword"]) + ".json")))
    print(f"  of those, {cached_n} are cached (free) and {len(todo)-cached_n} hit the API",
          flush=True)
    if not todo:
        finalize(plan, counts, w1_kw, w1_domains, w1_dealer, 0.0, None, None)
        return

    bal0 = balance()
    print(f"balance before: {bal0}", flush=True)

    frec = open(PART_REC, "a")
    fstat = open(PART_STAT, "a")
    api_cost, done, t0 = 0.0, 0, time.time()
    seen_dealer = set()

    try:
        with ThreadPoolExecutor(max_workers=WORKERS) as pool:
            futures = [pool.submit(run_query, p) for p in todo]
            for fut in as_completed(futures):
                q, body, spent, cached, err = fut.result()
                done += 1
                api_cost += spent
                if body is None:
                    stat = {k: q[k] for k in ("keyword", "axis", "state", "metro",
                                              "category")}
                    stat.update({"depth": None, "pages": None, "cost": 0.0,
                                 "organic": 0, "dealer_candidates": 0,
                                 "net_new_vs_w1": 0, "error": err})
                    fstat.write(json.dumps(stat) + "\n")
                    print(f"  [{done}/{len(todo)}] ERR {q['keyword'][:60]} :: {err}",
                          flush=True)
                else:
                    recs, stat = process_body(q, body, w1_domains)
                    stat["cached"] = cached
                    for r in recs:
                        frec.write(json.dumps(r) + "\n")
                        if r["classification"] == "dealer_candidate" and r["domain"]:
                            seen_dealer.add(r["domain"])
                    fstat.write(json.dumps(stat) + "\n")
                if done % CHECKPOINT_EVERY == 0 or done == len(todo):
                    frec.flush(); os.fsync(frec.fileno())
                    fstat.flush(); os.fsync(fstat.fileno())
                    print(f"  [ckpt {done}/{len(todo)}] dealer_domains={len(seen_dealer)} "
                          f"net_new={len(seen_dealer - w1_domains)} "
                          f"spend=${api_cost:.4f} t={time.time()-t0:.0f}s", flush=True)
    finally:
        frec.flush(); os.fsync(frec.fileno()); frec.close()
        fstat.flush(); os.fsync(fstat.fileno()); fstat.close()

    bal1 = balance()
    finalize(plan, counts, w1_kw, w1_domains, w1_dealer, api_cost, bal0, bal1)


if __name__ == "__main__":
    main()
