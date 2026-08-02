#!/usr/bin/env python3
"""S1 raw acquisition — SERP dealer self-identification, WAVE 3 (+400 queries).

Same harness as `serp_selfid_wave2.py` (append-per-record JSONL partials, fsync
every 25 queries, resume by skipping completed keywords, `--finalize` rebuild,
`as_completed` so one slow query cannot block the write path). New plan, new
baseline (wave 1 UNION wave 2), new cache dir, new output. Wave 2's files are
never opened for writing.

WHY WAVE 3 EXISTS — AND IT IS NOT VOLUME.
§5f closed the supply gap: 25,332 DFS companies against a need of ~3,000. Raw
domain count is now worthless. SERP is being run because it is the only source
of two assets nothing else provides:
  (1) the dealer's OWN quotable sentence about the lines they carry — email copy
      in their voice;
  (2) brand-authorization evidence for the eight Cloudflare-blocked brands
      (Parker, Gates, ESAB, Norton, WEG, Regal Rexnord, Dixon, ifm), which we
      can reach no other way.
The plan is therefore weighted toward DECLARATION LANGUAGE (which produces the
sentence) and toward the eight blocked brands (which produce the authorization
evidence), not toward whatever maximises distinct domains.

THE CORRECTED AXIS RULE (§5g supersedes §5b).
Wave 2 measured: national brand-agnostic phrasings returned 11.76 net-new per
query; geographic scoping returned 2.45-2.59. Wave 2 spent only 60 of 500
queries on the national axis. Wave 3 inverts the mix: 250 national, 150
geographic.

TWO CONFOUNDS IN §5g THAT THIS WAVE IS BUILT TO BREAK.
  (a) POSITION. Wave 2's A2 block ran FIRST in plan order, so it collected the
      whole windfall of a fresh baseline; every later axis was measured against
      a corpus A2 had already picked over. Wave 3 INTERLEAVES the axes
      round-robin in plan order, and additionally reports two order-independent
      measures per axis (gross-new-per-query, and axis-distinct-new measured in
      isolation against the frozen wave-1+2 baseline).
  (b) DEPTH. A2 ran the deep ladder (100/7, 63.8 organic per query); the
      geographic axes ran the standard ladder (30/3, 29.2 organic per query).
      "National beats geographic 4-5x" may be partly "deep beats shallow". Wave 3
      carries two control blocks — 30 national queries on the STANDARD ladder and
      30 geographic queries on the DEEP ladder — so axis and depth can be read
      apart.

PROGRAM SHAPE (400 queries, zero overlap with waves 1 and 2 — asserted at run):
  NA  160  national brand-agnostic. Declaration language first (the sentence is
           the product), then stocking language, line-card page phrasings,
           firmographic self-description, and declaration x category.
           130 deep + 30 standard (the depth control).
  NB   90  national, BLOCKED-BRAND-specific. New phrasings and sub-brands for
           all eight, plus the catalog-PDF boilerplate pattern research/04
           flagged as an unbuilt open item. This is the wave's unique job.
  GEO 150  geographic mop-up on axes waves 1-2 never used: declaration language
           x state, 35 NEW metros, and region words. 120 standard + 30 deep.

§5b dead ends respected: Gates's retail-program term is absent. §5e respected:
every query carries an industrial qualifier, none carries automotive/truck/
fleet/aftermarket vocabulary, and every vertical signal is a recorded flag,
never a delete.

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
WAVE = "wave3"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "data", "raw")
CACHE = os.path.join(RAW, "_cache", "serp-w3")
WAVE1 = os.path.join(RAW, "serp-selfid-2026-08-01.json")
WAVE2 = os.path.join(RAW, "serp-selfid-wave2-2026-08-01.json")
WAVE2_REC_PART = os.path.join(RAW, "serp-selfid-wave2-2026-08-01.records.partial.jsonl")
WAVE2_STAT_PART = os.path.join(RAW, "serp-selfid-wave2-2026-08-01.qstats.partial.jsonl")
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
#
# NA — national, brand-agnostic. Ordered by what the wave is FOR: declaration
# language first, because the extracted sentence is the deliverable.

NA_DECLARATION = [
    ('"proud to be an authorized distributor" industrial', "mro"),
    ('"we are proud to be an authorized distributor" hydraulic pneumatic', "hydraulics"),
    ('"an authorized distributor for" industrial MRO supply', "mro"),
    ('"authorized distributor for" bearings power transmission', "bearings_pt"),
    ('"authorized distributor for" hydraulic pneumatic fluid power', "hydraulics"),
    ('"authorized distributor for" welding supply industrial gas', "welding_gas"),
    ('"authorized distributor for" pumps valves industrial', "pumps_valves"),
    ('"authorized distributor for" industrial automation sensors', "automation"),
    ('"authorized distributor for" abrasives cutting tools', "abrasives"),
    ('"authorized distributor for" material handling conveyor', "material_handling"),
    ('"authorized distributor for" seals gaskets industrial', "seals_gaskets"),
    ('"authorized distributor for" industrial fasteners', "fasteners"),
    ('"authorized distributor for" compressed air pneumatic', "compressed_air"),
    ('"authorized distributor for" industrial hose fittings', "hose_fittings"),
    ('"authorized distributor for" electric motors drives industrial', "motors_drives"),
    ('"authorized distributor of" bearings power transmission', "bearings_pt"),
    ('"authorized distributor of" hydraulic hose fittings', "hose_fittings"),
    ('"authorized distributor of" industrial MRO supplies', "mro"),
    ('"authorized distributor of" welding supplies industrial gas', "welding_gas"),
    ('"authorized distributor of" pumps valves industrial', "pumps_valves"),
    ('"authorized distributor of" industrial automation controls', "automation"),
    ('"authorized distributor of" abrasives cutting tools', "abrasives"),
    ('"authorized distributor of" material handling equipment industrial', "material_handling"),
    ('"authorized distributor of" seals gaskets industrial', "seals_gaskets"),
    ('"authorized distributor of" compressed air equipment industrial', "compressed_air"),
    ('"as an authorized distributor" industrial hydraulic pneumatic', "hydraulics"),
    ('"as an authorized distributor" bearings power transmission', "bearings_pt"),
    ('"as an authorized distributor" welding supply industrial', "welding_gas"),
    ('"as an authorized distributor" industrial MRO supply', "mro"),
    ('"as an authorized distributor" pumps valves industrial', "pumps_valves"),
    ('"we are a factory authorized distributor" industrial', "mro"),
    ('"factory authorized" distributor bearings mill supply', "bearings_pt"),
    ('"factory authorized" distributor welding supply industrial gas', "welding_gas"),
    ('"factory authorized" distributor material handling conveyor', "material_handling"),
    ('"factory authorized" distributor seals gaskets industrial', "seals_gaskets"),
    ('"factory authorized" distributor abrasives cutting tools', "abrasives"),
    ('"factory authorized" distributor compressed air pneumatic', "compressed_air"),
    ('"factory authorized" distributor process instrumentation industrial', "instrumentation"),
    ('"factory authorized" distributor electric motors drives', "motors_drives"),
    ('"factory authorized" distributor industrial fasteners', "fasteners"),
    ('"factory authorized service center" hydraulic industrial distributor', "hydraulics"),
    ('"authorized service center" hydraulic pump repair industrial distributor', "hydraulics"),
    ('"authorized repair center" hydraulic cylinder industrial distributor', "hydraulics"),
    ('"authorized warranty repair" industrial pneumatic distributor', "pneumatics"),
    ('"certified distributor" industrial MRO supply', "mro"),
    ('"approved distributor" industrial hydraulic pneumatic', "hydraulics"),
    ('"exclusive distributor" industrial power transmission bearings', "bearings_pt"),
    ('"sole distributor" industrial MRO supply', "mro"),
    ('"we are the exclusive distributor" industrial plant maintenance', "mro"),
    ('"exclusive distributor for" industrial hydraulic pneumatic', "hydraulics"),
]

NA_STOCKING = [
    ('"we stock" hydraulic hose fittings distributor industrial', "hose_fittings"),
    ('"we stock" pneumatic cylinders valves distributor industrial', "pneumatics"),
    ('"we stock" bearings belts sheaves distributor industrial', "bearings_pt"),
    ('"we stock" welding wire electrodes distributor industrial gas', "welding_gas"),
    ('"we stock" abrasives cutting tools distributor industrial', "abrasives"),
    ('"we stock" seals o-rings gaskets distributor industrial', "seals_gaskets"),
    ('"we stock" conveyor belting components distributor industrial', "material_handling"),
    ('"we stock" industrial fasteners distributor mill supply', "fasteners"),
    ('"we stock" pumps valves fittings distributor industrial', "pumps_valves"),
    ('"we stock" electric motors gearboxes distributor industrial', "motors_drives"),
    ('"stocking distributor" hydraulic hose fittings industrial', "hose_fittings"),
    ('"stocking distributor" pneumatics automation industrial', "pneumatics"),
    ('"stocking distributor" bearings belts power transmission', "bearings_pt"),
    ('"stocking distributor" welding supply industrial gas', "welding_gas"),
    ('"stocking distributor" abrasives cutting tools industrial', "abrasives"),
    ('"stocking distributor" seals gaskets industrial', "seals_gaskets"),
    ('"stocking distributor" material handling conveyor industrial', "material_handling"),
    ('"stocking distributor" industrial fasteners mill supply', "fasteners"),
    ('"stocking distributor" pumps valves industrial', "pumps_valves"),
    ('"stocking distributor" electric motors drives industrial', "motors_drives"),
    ('"stocking distributor" process instrumentation industrial', "instrumentation"),
    ('"stocking distributor" compressed air pneumatic industrial', "compressed_air"),
    ('"stocking distributor" industrial rubber hose', "industrial_rubber"),
    ('"stocking distributor" industrial lubricants plant maintenance', "lubricants"),
    ('"stocking distributor" industrial safety supply MRO', "safety_supply"),
    ('"largest stocking distributor" industrial MRO', "mro"),
]

NA_LINECARD = [
    ('"manufacturers we represent" industrial distributor', "mro"),
    ('"manufacturers we represent" hydraulic pneumatic fluid power', "hydraulics"),
    ('"manufacturers we represent" bearings power transmission', "bearings_pt"),
    ('"manufacturers we represent" welding supply industrial', "welding_gas"),
    ('"manufacturers we represent" pumps valves industrial', "pumps_valves"),
    ('"manufacturers we represent" material handling conveyor', "material_handling"),
    ('"brands we carry" industrial distributor MRO', "mro"),
    ('"brands we carry" hydraulic pneumatic distributor', "hydraulics"),
    ('"brands we carry" bearings power transmission distributor', "bearings_pt"),
    ('"brands we distribute" industrial MRO supply', "mro"),
    ('"lines we carry" industrial distributor hydraulic', "hydraulics"),
    ('"lines we represent" industrial distributor power transmission', "bearings_pt"),
    ('"our product lines" industrial distributor MRO hydraulic', "mro"),
    ('"our manufacturers" industrial distributor line card MRO', "mro"),
    ('"line cards" industrial distributor hydraulic pneumatic', "hydraulics"),
    ('"line card" pdf industrial distributor MRO', "mro"),
]

NA_IDENTITY = [
    ('"family owned and operated" industrial distributor hydraulic pneumatic', "hydraulics"),
    ('"employee owned" industrial supply distributor MRO bearings', "mro"),
    ('"woman owned" industrial distributor MRO supply', "mro"),
    ('"veteran owned" industrial distributor MRO supply', "mro"),
    ('"independently owned" industrial distributor MRO supply', "mro"),
    ('"locally owned" industrial supply distributor plant maintenance', "mro"),
    ('"third generation" family industrial distributor MRO', "mro"),
    ('"in business since 19" industrial distributor MRO supply', "mro"),
    ('"ISO 9001" industrial distributor "line card" MRO', "mro"),
    ('"industrial distributor" "our line card" fluid power bearings', "bearings_pt"),
]

# Declaration language x categories waves 1-2 never paired with it.
NA_CATEGORY = [
    ('"authorized distributor" industrial gearboxes speed reducers', "motors_drives"),
    ('"authorized distributor" industrial chain sprockets', "bearings_pt"),
    ('"authorized distributor" industrial belts sheaves bushings', "bearings_pt"),
    ('"authorized distributor" hydraulic cylinders pumps motors', "hydraulics"),
    ('"authorized distributor" pneumatic cylinders air preparation', "pneumatics"),
    ('"authorized distributor" industrial hose reels couplings', "hose_fittings"),
    ('"authorized distributor" quick disconnect couplings hydraulic industrial', "hose_fittings"),
    ('"authorized distributor" industrial filtration filters plant maintenance', "mro"),
    ('"authorized distributor" industrial valves actuators process', "pumps_valves"),
    ('"authorized distributor" industrial sensors encoders automation', "automation"),
    ('"authorized distributor" variable frequency drives industrial motors', "motors_drives"),
    ('"authorized distributor" industrial safety products PPE MRO', "safety_supply"),
    ('"authorized distributor" industrial lubricants greases plant maintenance', "lubricants"),
    ('"authorized distributor" industrial adhesives sealants MRO', "mro"),
    ('"authorized distributor" casters wheels material handling industrial', "material_handling"),
    ('"authorized distributor" hoists cranes rigging industrial', "material_handling"),
    ('"authorized distributor" industrial pipe valves fittings PVF', "pumps_valves"),
    ('"authorized distributor" cutting tools carbide inserts machine shop', "cutting_tools"),
    ('"authorized distributor" industrial air compressors plant maintenance', "compressed_air"),
    ('"authorized distributor" industrial blowers vacuum pumps', "pumps_valves"),
    ('"authorized distributor" industrial mixers agitators process', "pumps_valves"),
    ('"authorized distributor" industrial heat exchangers process equipment', "instrumentation"),
    ('"authorized distributor" industrial gaskets packing sealing', "seals_gaskets"),
    ('"authorized distributor" industrial batteries chargers material handling', "material_handling"),
    ('"authorized distributor" industrial scales weighing plant', "instrumentation"),
    ('"authorized distributor" mill supply cutting tools abrasives', "mill_supply"),
    ('"authorized distributor" industrial fluid sealing products', "seals_gaskets"),
    ('"authorized distributor" industrial conveyor belting components', "material_handling"),
]

# Trade-noun + authorization language. Distributors describe themselves by trade
# ("bearing distributor", "hose distributor") far more often than by the word
# "industrial", and waves 1-2 only ever paired those nouns with "line card".
NA_TRADE_NOUN = [
    ('"authorized distributor" "since 19" industrial supply MRO', "mro"),
    ('"we represent" manufacturers industrial distributor hydraulic pneumatic', "hydraulics"),
    ('"we are a distributor for" industrial MRO supply', "mro"),
    ('"distributor for" bearings power transmission industrial "line card"', "bearings_pt"),
    ('"authorized distributor" industrial supply "request a quote" MRO', "mro"),
    ('"we are an authorized" distributor industrial plant maintenance MRO', "mro"),
    ('"master distributor" seals gaskets industrial', "seals_gaskets"),
    ('"master distributor" abrasives cutting tools industrial', "abrasives"),
    ('"master distributor" material handling conveyor industrial', "material_handling"),
    ('"master distributor" welding supply industrial gas', "welding_gas"),
    ('"master distributor" fasteners industrial mill supply', "fasteners"),
    ('"master distributor" industrial lubricants plant maintenance', "lubricants"),
    ('"authorized master distributor" industrial MRO', "mro"),
    ('"national distributor" industrial MRO supply "line card"', "mro"),
    ('"regional distributor" industrial MRO supply "line card"', "mro"),
    ('"industrial supply company" "line card" authorized distributor', "mro"),
    ('"industrial supply" distributor "our brands" plant maintenance', "mro"),
    ('"industrial distributor" authorized hydraulic pneumatic bearings belts', "bearings_pt"),
    ('"fluid power distributor" authorized hydraulic pneumatic', "hydraulics"),
    ('"power transmission distributor" authorized bearings belts chain', "bearings_pt"),
    ('"bearing distributor" authorized industrial power transmission', "bearings_pt"),
    ('"hose distributor" authorized industrial hydraulic fittings', "hose_fittings"),
    ('"welding supply distributor" authorized industrial gas cylinders', "welding_gas"),
    ('"abrasive distributor" authorized industrial grinding cutting', "abrasives"),
    ('"automation distributor" authorized industrial sensors controls', "automation"),
    ('"pump distributor" authorized industrial process valves', "pumps_valves"),
    ('"motor distributor" authorized industrial electric drives', "motors_drives"),
    ('"conveyor distributor" authorized industrial material handling', "material_handling"),
    ('"fastener distributor" authorized industrial mill supply', "fasteners"),
    ('"seal distributor" authorized industrial gaskets packing', "seals_gaskets"),
]

# NB — the eight Cloudflare-blocked brands. This is the wave's unique job:
# authorization evidence reachable no other way. New phrasings only.
NB_BRAND = [
    # Parker
    ('"we are an authorized Parker distributor"', "Parker", "hydraulics"),
    ('"authorized Parker distributor" hydraulic hose fittings', "Parker", "hose_fittings"),
    ('"Parker" authorized distributor "line card" pneumatics automation', "Parker", "pneumatics"),
    ('"Parker Racor" authorized distributor filtration', "Parker", "mro"),
    ('"Parker Legris" authorized distributor pneumatic fittings', "Parker", "pneumatics"),
    ('"Parker Hannifin" "authorized distributor" seals o-rings', "Parker", "seals_gaskets"),
    ('"Parker Hannifin" distributor "manufacturers we represent"', "Parker", "hydraulics"),
    ('"ParkerStore" industrial hose center locations', "Parker", "hose_fittings"),
    ('"Parker" "Premier Distributor" industrial fluid power', "Parker", "hydraulics"),
    ('"stocking Parker distributor" hydraulic pneumatic', "Parker", "hydraulics"),
    ('"Parker Hannifin" authorized distributor instrumentation tubing fittings', "Parker", "instrumentation"),
    ('"Parker" authorized distributor filtration hydraulic industrial', "Parker", "hydraulics"),
    # Gates (retail-program term deliberately absent — §5b dead end)
    ('"we are an authorized Gates distributor"', "Gates", "bearings_pt"),
    ('"Gates" authorized distributor belts hose power transmission industrial', "Gates", "bearings_pt"),
    ('"authorized Gates distributor" hydraulic hose crimping industrial', "Gates", "hose_fittings"),
    ('"Gates" "line card" distributor belts sheaves industrial', "Gates", "bearings_pt"),
    ('"Gates Corporation" authorized distributor industrial hose', "Gates", "hose_fittings"),
    ('"authorized Gates dealer" belts hose industrial MRO', "Gates", "bearings_pt"),
    ('"Gates" distributor "manufacturers we represent" power transmission', "Gates", "bearings_pt"),
    ('"Gates industrial" authorized distributor fluid power', "Gates", "hydraulics"),
    ('"stocking Gates distributor" hose belts industrial', "Gates", "hose_fittings"),
    ('"Gates Mectrol" OR "Gates Unitta" authorized distributor industrial', "Gates", "bearings_pt"),
    # ESAB
    ('"we are an authorized ESAB distributor"', "ESAB", "welding_gas"),
    ('"ESAB" authorized distributor "line card" welding', "ESAB", "welding_gas"),
    ('"ESAB" "Victor" authorized distributor welding gas', "ESAB", "welding_gas"),
    ('"authorized Victor Technologies distributor" welding cutting', "ESAB", "welding_gas"),
    ('"authorized Thermal Dynamics distributor" plasma cutting', "ESAB", "welding_gas"),
    ('"authorized Tweco distributor" welding', "ESAB", "welding_gas"),
    ('"authorized Arcair distributor" OR "authorized Stoody distributor" welding', "ESAB", "welding_gas"),
    ('"ESAB" welding distributor "manufacturers we represent"', "ESAB", "welding_gas"),
    ('"stocking ESAB distributor" welding supply industrial gas', "ESAB", "welding_gas"),
    ('"ESAB" authorized distributor welding consumables industrial gas supply', "ESAB", "welding_gas"),
    # Norton
    ('"we are an authorized Norton distributor" abrasives', "Norton", "abrasives"),
    ('"Norton" authorized distributor abrasives "line card"', "Norton", "abrasives"),
    ('"authorized Norton Clipper distributor" OR "authorized Norton Winter distributor"', "Norton", "abrasives"),
    ('"Saint-Gobain Abrasives" authorized distributor industrial', "Norton", "abrasives"),
    ('"authorized Merit Abrasives distributor" OR "authorized Bear-Tex distributor"', "Norton", "abrasives"),
    ('"Norton abrasives" distributor "manufacturers we represent"', "Norton", "abrasives"),
    ('"stocking Norton abrasives distributor" industrial grinding', "Norton", "abrasives"),
    ('"Norton" authorized distributor grinding wheels industrial', "Norton", "abrasives"),
    ('"your local authorized Norton distributor" abrasives catalog', "Norton", "abrasives"),
    ('"Norton" "Saint-Gobain" authorized distributor cutting grinding industrial', "Norton", "abrasives"),
    # WEG
    ('"we are an authorized WEG distributor"', "WEG", "motors_drives"),
    ('"WEG" authorized distributor "line card" motors', "WEG", "motors_drives"),
    ('"WEG Electric" authorized distributor motors drives industrial', "WEG", "motors_drives"),
    ('"authorized WEG distributor" gearboxes reducers industrial', "WEG", "motors_drives"),
    ('"authorized WEG distributor" variable frequency drives', "WEG", "motors_drives"),
    ('"WEG" distributor "manufacturers we represent" motors', "WEG", "motors_drives"),
    ('"stocking WEG distributor" electric motors industrial', "WEG", "motors_drives"),
    ('"WEG" authorized distributor industrial automation control panels', "WEG", "automation"),
    ('"authorized WEG Automation distributor" OR "authorized WEG Transformers distributor"', "WEG", "automation"),
    ('"WEG" authorized distributor motors "power transmission" industrial', "WEG", "motors_drives"),
    # Regal Rexnord
    ('"we are an authorized Regal Rexnord distributor"', "Regal Rexnord", "bearings_pt"),
    ('"authorized Falk distributor" gear drives couplings', "Regal Rexnord", "bearings_pt"),
    ('"authorized Kop-Flex distributor" OR "authorized Thomas coupling distributor" industrial', "Regal Rexnord", "bearings_pt"),
    ('"authorized Boston Gear distributor" OR "authorized Morse distributor" power transmission', "Regal Rexnord", "bearings_pt"),
    ('"authorized McGill distributor" OR "authorized Link-Belt bearing distributor"', "Regal Rexnord", "bearings_pt"),
    ('"authorized Thomson distributor" linear motion industrial', "Regal Rexnord", "automation"),
    ('"authorized Cone Drive distributor" OR "authorized Durst distributor" gearing', "Regal Rexnord", "motors_drives"),
    ('"Regal Rexnord" authorized distributor bearings couplings "line card"', "Regal Rexnord", "bearings_pt"),
    ('"stocking Regal Rexnord distributor" power transmission bearings', "Regal Rexnord", "bearings_pt"),
    ('"authorized Rexnord distributor" chain conveyor industrial', "Regal Rexnord", "material_handling"),
    # Dixon
    ('"we are an authorized Dixon distributor" hose couplings', "Dixon", "hose_fittings"),
    ('"authorized Dixon distributor" industrial hose fittings', "Dixon", "hose_fittings"),
    ('"Dixon Valve" distributor "manufacturers we represent" hose', "Dixon", "hose_fittings"),
    ('"authorized Dixon Powhatan distributor" OR "authorized Boss-Lock distributor"', "Dixon", "hose_fittings"),
    ('"authorized Holedall distributor" OR "authorized Dixon Sanitary distributor" fittings', "Dixon", "hose_fittings"),
    ('"Dixon" authorized distributor camlock couplings industrial', "Dixon", "hose_fittings"),
    ('"stocking Dixon Valve distributor" industrial hose fittings', "Dixon", "hose_fittings"),
    ('"Dixon" authorized distributor sanitary fittings process industrial', "Dixon", "pumps_valves"),
    ('"Dixon Valve & Coupling" authorized distributor industrial', "Dixon", "hose_fittings"),
    ('"Dixon" distributor "line card" industrial hose couplings', "Dixon", "hose_fittings"),
    # ifm
    ('"we are an authorized ifm distributor" sensors', "ifm", "automation"),
    ('"ifm efector" authorized distributor "line card" automation', "ifm", "automation"),
    ('"ifm" authorized distributor sensors industrial automation controls', "ifm", "automation"),
    ('"authorized ifm efector dealer" sensors industrial', "ifm", "automation"),
    ('"ifm efector" distributor "manufacturers we represent" sensors', "ifm", "automation"),
    ('"stocking ifm distributor" sensors industrial automation', "ifm", "automation"),
    ('"ifm" sensors distributor "line card" industrial', "ifm", "automation"),
    ('"ifm efector" authorized distributor position sensors industrial', "ifm", "automation"),
]

# The catalog-PDF boilerplate pattern. research/04 measured it (all 6 Norton
# dealers, 6 of 13 Texas Parker candidates came from it) and listed "build this
# as its own query set" as an unbuilt open item. It finds the HOST of a printed
# catalog — a strong authorization proxy — but yields the manufacturer's words,
# not the dealer's, so DECL_RX's `declaration_is_boilerplate` flag matters here.
NB_CATALOG_PDF = [
    ('"Your Local Authorized Parker Distributor" catalog pdf', "Parker", "hydraulics"),
    ('"contact your local authorized Parker distributor"', "Parker", "hydraulics"),
    ('"see your authorized Gates distributor" catalog', "Gates", "bearings_pt"),
    ('"contact your local Gates distributor" catalog hose belts', "Gates", "hose_fittings"),
    ('"contact your local ESAB distributor" catalog welding', "ESAB", "welding_gas"),
    ('"contact your local Norton distributor" catalog abrasives', "Norton", "abrasives"),
    ('"contact your local WEG distributor" motors catalog', "WEG", "motors_drives"),
    ('"contact your authorized Dixon distributor" catalog hose', "Dixon", "hose_fittings"),
    ('"contact your local Regal Rexnord distributor" catalog', "Regal Rexnord", "bearings_pt"),
    ('"contact your local ifm distributor" catalog sensors', "ifm", "automation"),
]

# GEO — mop-up only, on axes waves 1-2 never used.
GEO_STATES_DECL = ["Ohio", "Texas", "Pennsylvania", "Illinois", "Michigan",
                   "California", "Georgia", "Indiana", "Wisconsin",
                   "North Carolina", "Tennessee", "New York", "Alabama",
                   "Minnesota", "Missouri", "Kentucky", "Florida", "New Jersey",
                   "Virginia", "South Carolina"]

GEO_STATES_STOCK = [
    ("Ohio", "hydraulic hose", "hose_fittings"),
    ("Texas", "hydraulic hose", "hose_fittings"),
    ("Pennsylvania", "bearings power transmission", "bearings_pt"),
    ("Illinois", "bearings power transmission", "bearings_pt"),
    ("Michigan", "pneumatic automation", "pneumatics"),
    ("California", "pneumatic automation", "pneumatics"),
    ("Georgia", "welding supply", "welding_gas"),
    ("Indiana", "welding supply", "welding_gas"),
    ("Wisconsin", "material handling conveyor", "material_handling"),
    ("North Carolina", "material handling conveyor", "material_handling"),
    ("Tennessee", "pumps valves", "pumps_valves"),
    ("New York", "pumps valves", "pumps_valves"),
    ("Alabama", "seals gaskets", "seals_gaskets"),
    ("Minnesota", "seals gaskets", "seals_gaskets"),
    ("Missouri", "electric motors drives", "motors_drives"),
    ("Kentucky", "electric motors drives", "motors_drives"),
    ("Florida", "abrasives cutting tools", "abrasives"),
    ("New Jersey", "abrasives cutting tools", "abrasives"),
    ("Virginia", "mill supply MRO", "mill_supply"),
    ("South Carolina", "mill supply MRO", "mill_supply"),
]

GEO_STATES_WESTOCK = [
    ("Ohio", "industrial hose fittings", "hose_fittings"),
    ("Texas", "industrial bearings belts", "bearings_pt"),
    ("Pennsylvania", "industrial pneumatic valves", "pneumatics"),
    ("Illinois", "industrial welding supplies", "welding_gas"),
    ("Michigan", "industrial seals gaskets", "seals_gaskets"),
    ("California", "industrial pumps valves", "pumps_valves"),
    ("Georgia", "industrial abrasives", "abrasives"),
    ("Indiana", "industrial fasteners", "fasteners"),
    ("Wisconsin", "industrial conveyor components", "material_handling"),
    ("North Carolina", "industrial electric motors", "motors_drives"),
    ("Tennessee", "industrial lubricants", "lubricants"),
    ("Missouri", "industrial safety supply", "safety_supply"),
    ("Alabama", "industrial cutting tools", "cutting_tools"),
    ("Louisiana", "industrial hydraulic components", "hydraulics"),
    ("Oklahoma", "industrial compressed air", "compressed_air"),
]

# 35 metros wave 2's list never touched. Detroit stays omitted — §5e says bias
# away from the most automotive-contaminated metro in the country.
GEO_METROS_NEW = [
    "Buffalo", "Rochester New York", "Hartford", "Providence",
    "Richmond Virginia", "Greenville South Carolina",
    "Charleston South Carolina", "Jacksonville", "Tampa", "Orlando",
    "Mobile Alabama", "Little Rock", "Wichita", "Omaha", "Des Moines",
    "Grand Rapids", "Toledo", "Akron", "Dayton", "Fort Wayne",
    "Rockford Illinois", "Springfield Missouri", "Oklahoma City",
    "San Antonio", "Austin", "El Paso", "Albuquerque", "Boise", "Spokane",
    "Fresno", "Sacramento", "Phoenix", "Knoxville", "Chattanooga",
    "Huntsville Alabama",
]
GEO_METRO_CATS = [("hydraulic", "hydraulics"),
                  ("industrial supply MRO", "mro")]

GEO_REGIONS = ["Gulf Coast", "Midwest", "Pacific Northwest", "Southeast",
               "Northeast", "Mid-Atlantic", "Southwest", "Rocky Mountain",
               "Great Lakes", "New England", "Ohio Valley", "Tennessee Valley",
               "Delaware Valley", "Central Texas", "Upper Midwest"]
GEO_REGIONS_DECL = GEO_REGIONS[:10]


def build_plan():
    """Groups first, then INTERLEAVED into plan order.

    Interleaving is the point: wave 2's A2 block ran first and banked the whole
    windfall of a fresh baseline, which is why 11.76 cannot be compared against
    axes that ran after it. Round-robin makes the in-plan-order marginal curve
    comparable across axes, and the order-independent measures in finalize()
    do not depend on it at all.
    """
    na, nb, geo = [], [], []

    def add(sink, kw, axis, group, desc, ladder, cat, state=None, metro=None,
            region=None, brand=None, family=None):
        sink.append({"keyword": kw, "axis": axis, "axis_desc": desc,
                     "axis_group": group, "ladder": ladder,
                     "category": cat, "state": state, "metro": metro,
                     "region": region, "brand_hint": brand,
                     "phrase_family": family})

    na_src = ([(k, c, "declaration") for k, c in NA_DECLARATION]
              + [(k, c, "stocking") for k, c in NA_STOCKING]
              + [(k, c, "line_card_page") for k, c in NA_LINECARD]
              + [(k, c, "firmographic") for k, c in NA_IDENTITY]
              + [(k, c, "declaration_x_category") for k, c in NA_CATEGORY]
              + [(k, c, "trade_noun_declaration") for k, c in NA_TRADE_NOUN])
    # Exactly 30 of the 160 run the STANDARD ladder — the depth control. Evenly
    # spaced so the control spans all six phrase families instead of sitting
    # inside one; if it clustered, "national on a shallow ladder" would be
    # measuring one phrase family rather than the depth variable.
    n_std = 30
    std_idx = {round(i * len(na_src) / n_std) for i in range(n_std)}
    for i, (kw, cat, fam) in enumerate(na_src):
        std = i in std_idx
        add(na, kw, "NA-std" if std else "NA-deep", "NA",
            "national brand-agnostic self-declaration (standard ladder — depth control)"
            if std else "national brand-agnostic self-declaration",
            "std" if std else "deep", cat, family=fam)

    for kw, brand, cat in NB_BRAND:
        # The eight brands vary ~35x in SERP volume (research/04 finding C).
        # Deep ladder for the brands measured wide in wave 1, standard for the
        # thin ones, where 100/7 only buys a 40101 round-trip.
        deep = brand in ("Parker", "ESAB", "WEG", "Regal Rexnord", "Dixon")
        add(nb, kw, "NB-deep" if deep else "NB-std", "NB",
            "national, blocked-brand-specific authorization phrasing",
            "deep" if deep else "std", cat, brand=brand, family="brand_declaration")
    for kw, brand, cat in NB_CATALOG_PDF:
        add(nb, kw, "NBpdf", "NB",
            "catalog-PDF boilerplate — finds the HOSTING dealer (research/04 open item)",
            "std", cat, brand=brand, family="catalog_pdf_boilerplate")

    for st in GEO_STATES_DECL:
        add(geo, f'"authorized distributor" industrial MRO supply {st}', "GEO-std",
            "GEO", "geographic mop-up: declaration language x state", "std", "mro",
            state=st, family="declaration")
    for st, cat, slug in GEO_STATES_STOCK:
        add(geo, f'"stocking distributor" {cat} {st}', "GEO-std", "GEO",
            "geographic mop-up: stocking language x state", "std", slug,
            state=st, family="stocking")
    for st, cat, slug in GEO_STATES_WESTOCK:
        add(geo, f'"we stock" {cat} distributor {st}', "GEO-std", "GEO",
            "geographic mop-up: we-stock language x state", "std", slug,
            state=st, family="stocking")
    for metro in GEO_METROS_NEW:
        for cat, slug in GEO_METRO_CATS:
            add(geo, f'"line card" {cat} distributor {metro}', "GEO-std", "GEO",
                "geographic mop-up: line card x category x NEW metro", "std",
                slug, metro=metro, family="line_card_page")
    for rg in GEO_REGIONS:
        add(geo, f'"line card" industrial distributor {rg}', "GEO-std", "GEO",
            "geographic mop-up: line card x region", "std", "mro", region=rg,
            family="line_card_page")
    for rg in GEO_REGIONS_DECL:
        add(geo, f'"authorized distributor" industrial MRO {rg}', "GEO-std", "GEO",
            "geographic mop-up: declaration language x region", "std", "mro",
            region=rg, family="declaration")

    # Exactly 30 geographic queries promoted to the DEEP ladder — the other half
    # of the depth control. Evenly spread across state / metro / region so the
    # control is not a property of one sub-axis.
    deep_idx = {round(i * len(geo) / 30) for i in range(30)}
    for i, q in enumerate(geo):
        if i in deep_idx:
            q["ladder"] = "deep"
            q["axis"] = "GEO-deep"
            q["axis_desc"] += " (deep ladder — depth control)"

    # Round-robin interleave, proportional to group size.
    groups = [na, nb, geo]
    total = sum(len(g) for g in groups)
    plan, idx = [], [0, 0, 0]
    while len(plan) < total:
        for gi, g in enumerate(groups):
            take = max(1, round(len(g) / min(len(x) for x in groups if x)))
            for _ in range(take):
                if idx[gi] < len(g):
                    plan.append(g[idx[gi]])
                    idx[gi] += 1
    return plan


# ============================================================== CLASSIFICATION
# Reused VERBATIM from wave 2 (which reused it from wave 1) so all three waves
# are directly comparable. Anything new is ADDITIVE, in its own fields.
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
    "dodgeindustrial.com", "martinsprocket.com", "sew-eurodrive.com",
    "gatesmectrol.com", "trelleborg.com", "garlock.com", "johncrane.com",
    "freudenberg.com", "sunbeltrentals.com", "hilti.com", "sandvikcoromant.com",
    "seco-tools.com", "widia.com", "osgtool.com", "guhring.com", "harveytool.com",
    "flexco.com", "hyster.com", "toyotaforklift.com", "crown.com", "raymondcorp.com",
    "columbusmckinnon.com", "vulcanthreadedproducts.com", "wurthindustry.com",
    "chevron.com", "shell.com", "exxonmobil.com", "mobil.com", "castrol.com",
    "fuchs.com", "klueber.com", "honeywellsafety.com", "msasafety.com",
    "ansell.com", "kimberly-clark.com", "3mcanada.com", "dupontsafety.com",
    # additions surfaced by the wave-3 sub-brand and catalog-PDF axes
    "racor.com", "legris.com", "tweco.com", "thermal-dynamics.com",
    "victortechnologies.us", "stoody.com", "arcair.com", "nortonclipper.com",
    "meritabrasives.com", "wegelectric.com", "falkcorp.com", "kopflex.com",
    "bostongear.com", "mcgillbearings.com", "thomsonlinear.com", "conedrive.com",
    "dixonsanitary.com", "linkbelt.com", "rexnordflattop.com", "unitta.com",
    "parker.co.uk", "gates.eu", "gatesindustrial.com",
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

# ADDITIVE, and the reason this wave exists. `brands_named` above stays byte-for-
# byte comparable with waves 1-2; this maps the eight Cloudflare-blocked brands
# to their sub-brands and writes a SEPARATE field. Snippet-level evidence, so a
# floor on coverage, not a measurement (§5c's contamination trap cuts both ways).
BLOCKED_BRAND_FAMILIES = {
    "Parker": ["Parker", "Parker Hannifin", "ParkerStore", "Parker Store",
               "Racor", "Legris", "Chomerics", "Chelsea", "Denison", "Gold Ring"],
    "Gates": ["Gates", "Gates Mectrol", "Gates Unitta", "Gates Sonic",
              "Gates Industrial"],
    "ESAB": ["ESAB", "Victor", "Tweco", "Thermal Dynamics", "Thermal Arc",
             "Stoody", "Arcair", "Victor Technologies", "Alcotec"],
    "Norton": ["Norton", "Norton Abrasives", "Saint-Gobain", "Norton Clipper",
               "Norton Winter", "Merit Abrasives", "Bear-Tex", "Blaze",
               "Metalite", "Gemini"],
    "WEG": ["WEG", "WEG Electric", "WEG Automation", "Cestari"],
    "Regal Rexnord": ["Regal Rexnord", "Rexnord", "Leeson", "Browning",
                      "Sealmaster", "Falk", "Kop-Flex", "Boston Gear", "Morse",
                      "McGill", "Link-Belt", "Thomson", "Cone Drive", "Durst",
                      "Marathon Electric", "Jaure", "System Plast"],
    "Dixon": ["Dixon", "Dixon Valve", "Dixon Bayco", "Dixon Sanitary",
              "Dixon Powhatan", "Boss-Lock", "Holedall", "Bayco"],
    "ifm": ["ifm", "ifm efector", "efector"],
}
BLOCKED_RX = {fam: [(t, re.compile(r"(?<![A-Za-z])" + re.escape(t) + r"(?![A-Za-z])", re.I))
                    for t in terms]
              for fam, terms in BLOCKED_BRAND_FAMILIES.items()}

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

# ADDITIVE second pass, written to `declaration_alt*`. DECL_RX is left untouched
# so the wave-over-wave declaration numbers stay comparable; this only catches
# quotable sentences DECL_RX structurally cannot see — inventory claims and
# line-card lead-ins, which the wave-3 plan deliberately went hunting for.
DECL_ALT_RX = re.compile(
    r"("
    r"we\s+(?:stock|carry|represent|distribute|supply)\s+[^.|]{6,120}"
    r"|"
    r"(?:manufacturers|brands|lines|product\s+lines)\s+we\s+"
    r"(?:represent|carry|distribute)"
    r"|"
    r"(?:proud|pleased|honored)\s+to\s+(?:be|represent)\s+[^.|]{6,120}"
    r"|"
    r"(?:serving|servicing)\s+[^.|]{4,80}\s+since\s+(?:19|20)\d{2}"
    r"|"
    r"(?:family|employee|veteran|woman|minority|locally|independently)[- ]owned"
    r"\s+[^.|]{0,80}(?:distributor|supplier|supply)"
    r")", re.I)

BOILERPLATE_RX = re.compile(
    r"(your\s+local\s+authorized|call\s+your\s+local|contact\s+your\s+local|"
    r"see\s+your\s+local|ask\s+your\s+local|available\s+from\s+your\s+local)", re.I)

# NEGATED declarations — surfaced by wave 3 and worth its own flag.
# Broker, surplus and grey-market resellers publish the exact inverse sentence:
# "X is not an authorized distributor or representative for the listed
# manufacturers". research/04 saw this once (the ifm query returned a competitor
# DISCLAIMING authorization) at a scale where it did not matter; the wave-3
# bare-"authorized distributor" phrasings surface it in bulk. DECL_RX cannot see
# the negation because it starts matching at the word "authorized".
# This is the one field where a false positive is worse than a miss: quoting
# "we are not an authorized distributor" back at a prospect would be a disaster.
# Flagged, never dropped — S3 decides.
NEGATION_RX = re.compile(
    r"\b(not|never|no|non|unauthorized|un-authorized|neither|nor|without)\b", re.I)


def declaration_is_negated(sentence, match):
    """True when a negation word precedes the matched declaration inside the
    same verbatim sentence. Scoped to the text BEFORE the match so that a
    trailing 'no minimum order' does not flip a genuine claim."""
    if not sentence or not match:
        return False
    i = sentence.lower().find(match.lower())
    head = sentence[:i] if i >= 0 else sentence
    return bool(NEGATION_RX.search(head))

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
    """The verbatim sentence containing the match — casing, punctuation and
    whitespace exactly as published, non-breaking spaces included, because this
    string goes straight into email copy. Identical to waves 1-2."""
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
                    "declaration_is_boilerplate": bool(BOILERPLATE_RX.search(sent)),
                    "declaration_is_negated": declaration_is_negated(sent, m.group(0))}
    return {"declaration": None, "declaration_field": None,
            "declaration_match": None, "declaration_is_boilerplate": False,
            "declaration_is_negated": False}


def extract_declaration_alt(title, desc, pre, ext):
    for field, txt in (("serp_title", title), ("serp_snippet", desc),
                       ("serp_pre_snippet", pre), ("serp_extended_snippet", ext)):
        if not txt:
            continue
        m = DECL_ALT_RX.search(txt)
        if m:
            sent = sentence_around(txt, m)
            if len(sent) < 12:
                continue
            return {"declaration_alt": sent, "declaration_alt_field": field,
                    "declaration_alt_match": m.group(0)}
    return {"declaration_alt": None, "declaration_alt_field": None,
            "declaration_alt_match": None}


def brands_named(*texts):
    blob = " ".join(t for t in texts if t)
    return sorted({b for b, rx in BRAND_RX if rx.search(blob)})


def blocked_brands_named(*texts):
    blob = " ".join(t for t in texts if t)
    hits = {}
    for fam, pairs in BLOCKED_RX.items():
        terms = sorted({t for t, rx in pairs if rx.search(blob)})
        if terms:
            hits[fam] = terms
    return hits


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


def cache_path(kw):
    """Wave 3's own cache first, then wave 2's — a paid response is a paid
    response, and re-buying one is the mistake this program made twice today."""
    p3 = os.path.join(CACHE, cache_key(kw) + ".json")
    if os.path.exists(p3):
        return p3, True
    p2 = os.path.join(RAW, "_cache", "serp-w2", cache_key(kw) + ".json")
    if os.path.exists(p2):
        return p2, True
    return p3, False


def run_query(q):
    path, hit = cache_path(q["keyword"])
    if hit:
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
            with open(os.path.join(CACHE, cache_key(q["keyword"]) + ".json"), "w") as f:
                json.dump(body, f)
            return q, body, spent, False, None
        last_err = f"{task.get('status_code')} {task.get('status_message')}"
        time.sleep(1)
    return q, None, spent, False, last_err


def process_body(q, body, baseline):
    """One SERP payload -> records + one qstat row. Pure, no I/O."""
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
            if dom and dom not in baseline:
                qnew.add(dom)
        recs.append({
            "domain": dom,
            "page_url": url,
            "title": title,
            "snippet": desc,
            "pre_snippet": pre or None,
            "extended_snippet": ext or None,
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
            **extract_declaration_alt(title, desc, pre, ext),
            "brands_named": brands_named(title, desc, pre, ext, bc, url),
            "blocked_brands_named": blocked_brands_named(title, desc, pre, ext, bc, url),
            **vertical_signals(title, desc, pre, ext, bc, url),
            "seen_in_prior_waves": bool(dom) and dom in baseline,
            "query": q["keyword"],
            "query_axis": q["axis"],
            "query_axis_group": q["axis_group"],
            "query_axis_desc": q["axis_desc"],
            "query_state": q["state"],
            "query_metro": q["metro"],
            "query_region": q["region"],
            "query_category": q["category"],
            "query_brand_hint": q["brand_hint"],
            "query_phrase_family": q["phrase_family"],
            "query_ladder": q["ladder"],
            "serp_check_url": res.get("check_url"),
            "serp_datetime": res.get("datetime"),
            "source": "serp",
            "source_wave": WAVE,
            "source_url": url,
            "captured": CAPTURED,
        })
    stat = {k: q[k] for k in ("keyword", "axis", "axis_group", "state", "metro",
                              "region", "category", "brand_hint",
                              "phrase_family", "ladder")}
    stat.update({"depth": body["depth"], "pages": body["pages"],
                 "cost": body["cost"], "organic": len(organic),
                 "dealer_candidates": cand, "net_new_vs_prior": len(qnew),
                 "error": None})
    return recs, stat


# ================================================================ CHECKPOINTING
CHECKPOINT_EVERY = 25
PART_REC = os.path.join(RAW, f"serp-selfid-wave3-{CAPTURED}.records.partial.jsonl")
PART_STAT = os.path.join(RAW, f"serp-selfid-wave3-{CAPTURED}.qstats.partial.jsonl")
OUT = os.path.join(RAW, f"serp-selfid-wave3-{CAPTURED}.json")


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


def prior_baseline():
    """Wave 1 + wave 2. Wave 2 is read from its finalized JSON if present, and
    from its partials otherwise — §5g's lesson was that a stalled process can
    leave a truncated file over a good one, so reconcile both and take the union."""
    with open(WAVE1) as f:
        w1 = json.load(f)
    kw = {q["keyword"] for q in w1["per_query"]}
    doms = {r["domain"] for r in w1["records"] if r.get("domain")}
    dealer = {r["domain"] for r in w1["records"]
              if r.get("domain") and r["classification"] == "dealer_candidate"}
    w1_n, w2_recs = len(doms), []
    if os.path.exists(WAVE2):
        with open(WAVE2) as f:
            w2 = json.load(f)
        kw |= {q["keyword"] for q in w2["per_query"]}
        w2_recs = w2["records"]
    if os.path.exists(WAVE2_REC_PART):
        with open(WAVE2_REC_PART) as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        w2_recs.append(json.loads(line))
                    except json.JSONDecodeError:
                        pass
    if os.path.exists(WAVE2_STAT_PART):
        with open(WAVE2_STAT_PART) as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        kw.add(json.loads(line)["keyword"])
                    except (json.JSONDecodeError, KeyError):
                        pass
    doms |= {r["domain"] for r in w2_recs if r.get("domain")}
    dealer |= {r["domain"] for r in w2_recs
               if r.get("domain") and r["classification"] == "dealer_candidate"}
    return kw, doms, dealer, w1_n


def axis_metrics(plan, records, qstats, baseline):
    """Three views of the same axes, because §5g's single view was confounded.

    marginal_in_plan_order — wave 2's measure, kept for continuity. Depends on
      order; wave 3 interleaves so no axis banks the whole windfall.
    gross_new_per_query — order-independent. Mean over the axis's queries of the
      count of dealer domains in that query absent from the frozen prior-wave
      baseline. Counts a domain once per query that found it.
    axis_distinct_new_per_query — order-independent. The axis measured alone
      against the same frozen baseline: distinct new domains / queries. This is
      the fair head-to-head, and the one to read against §5g's 11.76 vs 2.45.
    exclusive_new — new domains NO other axis found. Irreplaceability.
    """
    by_q_new, by_q_all = {}, {}
    for r in records:
        if r["classification"] == "dealer_candidate" and r["domain"]:
            by_q_all.setdefault(r["query"], set()).add(r["domain"])
            if r["domain"] not in baseline:
                by_q_new.setdefault(r["query"], set()).add(r["domain"])
    ran = {s["keyword"] for s in qstats if not s.get("error")}
    axis_of = {p["keyword"]: p["axis"] for p in plan}
    group_of = {p["keyword"]: p["axis_group"] for p in plan}
    ladder_of = {p["keyword"]: p["ladder"] for p in plan}

    def build(keyfn):
        out = {}
        seen = set(baseline)
        for p in plan:                                   # marginal, plan order
            if p["keyword"] not in ran:
                continue
            k = keyfn(p["keyword"])
            before = len(seen)
            seen |= by_q_new.get(p["keyword"], set())
            a = out.setdefault(k, {"queries": 0, "marginal_net_new": 0,
                                   "gross_new": 0, "_dom": set(), "organic": 0})
            a["queries"] += 1
            a["marginal_net_new"] += len(seen) - before
            a["gross_new"] += len(by_q_new.get(p["keyword"], set()))
            a["_dom"] |= by_q_new.get(p["keyword"], set())
        for s in qstats:
            if s["keyword"] in ran and keyfn(s["keyword"]) in out:
                out[keyfn(s["keyword"])]["organic"] += s.get("organic") or 0
        # Exclusives must be computed against every other axis's domain set
        # BEFORE any of those sets is discarded — hence two passes, not one.
        excl = {k: len(a["_dom"] - set().union(*[a2["_dom"] for k2, a2 in out.items()
                                                 if k2 != k] or [set()]))
                for k, a in out.items()}
        for k, a in out.items():
            a["axis_distinct_new"] = len(a["_dom"])
            a["exclusive_new"] = excl[k]
            n = max(1, a["queries"])
            a["marginal_net_new_per_query"] = round(a["marginal_net_new"] / n, 3)
            a["gross_new_per_query"] = round(a["gross_new"] / n, 3)
            a["axis_distinct_new_per_query"] = round(a["axis_distinct_new"] / n, 3)
            a["organic_per_query"] = round(a["organic"] / n, 2)
            del a["_dom"]
        return out

    return {
        "by_axis": build(lambda k: axis_of.get(k, "?")),
        "by_group_national_vs_geographic": build(
            lambda k: "geographic" if group_of.get(k) == "GEO" else "national"),
        "by_ladder": build(lambda k: ladder_of.get(k, "?")),
        "by_group_x_ladder": build(
            lambda k: ("geographic" if group_of.get(k) == "GEO" else "national")
            + "/" + ladder_of.get(k, "?")),
    }


def finalize(plan, counts, prior_kw, baseline, prior_dealer, api_cost, bal0, bal1):
    records, qstats = load_partials()
    # Backfill the negation flag onto partials written before it existed, so a
    # `--finalize` rebuild is enough and nothing has to be re-bought.
    for r in records:
        if "declaration_is_negated" not in r:
            r["declaration_is_negated"] = declaration_is_negated(
                r.get("declaration"), r.get("declaration_match"))
    w3_dealer = {r["domain"] for r in records
                 if r["classification"] == "dealer_candidate" and r["domain"]}
    w3_all = {r["domain"] for r in records if r["domain"]}
    net_new = w3_dealer - baseline

    by_q = {}
    for r in records:
        if r["classification"] == "dealer_candidate" and r["domain"]:
            by_q.setdefault(r["query"], set()).add(r["domain"])
    ran = {s["keyword"] for s in qstats}
    seen, curve = set(baseline), []
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

    axes = axis_metrics(plan, records, qstats, baseline)

    decl = [r for r in records if r["declaration"]]
    decl_alt = [r for r in records if r["declaration_alt"]]
    decl_neg = [r for r in decl if r["declaration_is_negated"]]
    decl_doms = {r["domain"] for r in decl
                 if r["classification"] == "dealer_candidate" and r["domain"]}
    decl_doms_nonboiler = {r["domain"] for r in decl
                           if r["classification"] == "dealer_candidate"
                           and r["domain"] and not r["declaration_is_boilerplate"]}
    # The number that should drive email copy: a domain with at least one
    # POSITIVE declaration. A domain whose only sentence is a disclaimer is
    # counted separately, never folded into the usable total.
    decl_doms_positive = {r["domain"] for r in decl
                          if r["classification"] == "dealer_candidate"
                          and r["domain"] and not r["declaration_is_negated"]}
    decl_doms_only_negated = decl_doms - decl_doms_positive
    any_decl_doms = decl_doms | {r["domain"] for r in decl_alt
                                 if r["classification"] == "dealer_candidate"
                                 and r["domain"]}
    usable_decl_doms = decl_doms_positive | {
        r["domain"] for r in decl_alt
        if r["classification"] == "dealer_candidate" and r["domain"]}

    # Brand coverage across the eight blocked brands — the wave's stated job.
    brand_cov = {}
    for fam in BLOCKED_BRAND_FAMILIES:
        doms = {r["domain"] for r in records
                if r["classification"] == "dealer_candidate" and r["domain"]
                and fam in (r.get("blocked_brands_named") or {})}
        with_decl = {r["domain"] for r in records
                     if r["classification"] == "dealer_candidate" and r["domain"]
                     and fam in (r.get("blocked_brands_named") or {})
                     and ((r["declaration"] and not r["declaration_is_negated"])
                          or r["declaration_alt"])}
        brand_cov[fam] = {
            "dealer_domains": len(doms),
            "net_new_dealer_domains": len(doms & net_new),
            "net_new_with_positive_declaration": len(with_decl & net_new),
        }

    auto = sum(1 for r in records if r["auto_truck_signal"])
    payload = {
        "source": "serp",
        "source_name": "Dealer self-identification SERP program — WAVE 3 (DataForSEO Google organic)",
        "captured": CAPTURED,
        "wave": WAVE,
        "prior_wave_files": [os.path.basename(WAVE1), os.path.basename(WAVE2)],
        "why_this_wave": (
            "Not volume — §5f closed the supply gap (25,332 DFS companies vs a "
            "need of ~3,000). This wave buys two assets nothing else supplies: "
            "the dealer's own quotable sentence, and brand-authorization "
            "evidence for the eight Cloudflare-blocked brands."),
        "program": {
            "queries_planned": len(plan),
            "queries_completed": sum(1 for s in qstats if not s.get("error")),
            "queries_failed": sum(1 for s in qstats if s.get("error")),
            "axis_counts": counts,
            "design_rules_applied": [
                "§5g corrected axis rule: ~250 national, ~150 geographic (wave 2 ran 60/440)",
                "declaration language weighted first — the sentence is the deliverable",
                "all eight blocked brands re-queried with NEW phrasings and sub-brands",
                "catalog-PDF boilerplate built as its own axis (research/04 open item)",
                "Gates retail-program term excluded — confirmed dead end (3 organic, 0 dealers)",
                "every query carries an industrial qualifier; no automotive/truck/fleet/aftermarket vocabulary",
                "§5e: source-native fields captured verbatim; vertical signals flagged, never filtered",
                "axes INTERLEAVED in plan order to break wave 2's position confound",
                "depth controls: 30 national queries on the standard ladder, 30 geographic on the deep ladder",
            ],
            "states_declaration": GEO_STATES_DECL,
            "metros_new": GEO_METROS_NEW,
            "regions": GEO_REGIONS,
            "blocked_brands": list(BLOCKED_BRAND_FAMILIES),
        },
        "measured": {
            "raw_organic_results": len(records),
            "wave3_dealer_domains_distinct": len(w3_dealer),
            "wave3_all_domains_distinct": len(w3_all),
            "prior_waves_all_domains_distinct": len(baseline),
            "prior_waves_dealer_domains_distinct": len(prior_dealer),
            "net_new_dealer_domains_vs_prior": len(net_new),
            "net_new_rate": round(len(net_new) / max(1, len(w3_dealer)), 4),
            "dealer_domains_per_query": round(len(w3_dealer) / max(1, len(qstats)), 3),
            "net_new_per_query": round(len(net_new) / max(1, len(qstats)), 3),
            "union_dealer_domains_all_three_waves": len(prior_dealer | w3_dealer),
            "saturation_curve_per_50_queries": blocks,
            "axis_metrics": axes,
            "records_with_declaration": len(decl),
            "records_with_declaration_alt": len(decl_alt),
            "records_with_negated_declaration": len(decl_neg),
            "negated_declaration_rate": round(len(decl_neg) / max(1, len(decl)), 4),
            "dealer_domains_with_declaration": len(decl_doms),
            "dealer_domains_with_declaration_nonboilerplate": len(decl_doms_nonboiler),
            "dealer_domains_with_positive_declaration": len(decl_doms_positive),
            "dealer_domains_only_negated_declaration": len(decl_doms_only_negated),
            "dealer_domains_with_any_declaration": len(any_decl_doms),
            "dealer_domains_with_usable_declaration": len(usable_decl_doms),
            "net_new_domains_with_declaration": len(decl_doms & net_new),
            "net_new_domains_with_declaration_nonboilerplate": len(
                decl_doms_nonboiler & net_new),
            "net_new_domains_with_positive_declaration": len(decl_doms_positive & net_new),
            "net_new_domains_only_negated_declaration": len(
                decl_doms_only_negated & net_new),
            "net_new_domains_with_any_declaration": len(any_decl_doms & net_new),
            "net_new_domains_with_usable_declaration": len(usable_decl_doms & net_new),
            "blocked_brand_coverage": brand_cov,
            "records_auto_truck_flagged": auto,
            "records_auto_truck_rate": round(auto / max(1, len(records)), 4),
            "dealer_domains_auto_truck_flagged": len(
                {r["domain"] for r in records if r["auto_truck_signal"]
                 and r["classification"] == "dealer_candidate" and r["domain"]}),
        },
        "api_cost_program_total": round(sum(s.get("cost") or 0.0 for s in qstats), 4),
        "api_cost_this_session": round(api_cost, 4),
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
          f"w3_dealer_domains={len(w3_dealer)} net_new_vs_prior={len(net_new)} "
          f"net_new_rate={len(net_new)/max(1,len(w3_dealer)):.1%} "
          f"usable_decl_net_new={len(usable_decl_doms & net_new)} "
          f"(only_negated={len(decl_doms_only_negated & net_new)}) "
          f"auto_flag={auto/max(1,len(records)):.1%} "
          f"cost=${api_cost:.4f} -> {OUT}")
    return payload


def main():
    os.makedirs(CACHE, exist_ok=True)
    plan = build_plan()
    finalize_only = "--finalize" in sys.argv
    plan_only = "--plan" in sys.argv

    prior_kw, baseline, prior_dealer, w1_n = prior_baseline()
    dupes = sorted({p["keyword"] for p in plan} & prior_kw)
    if dupes:
        sys.exit(f"ABORT — {len(dupes)} queries duplicate waves 1-2: {dupes[:5]}")
    if len({p["keyword"] for p in plan}) != len(plan):
        seen, dd = set(), []
        for p in plan:
            if p["keyword"] in seen:
                dd.append(p["keyword"])
            seen.add(p["keyword"])
        sys.exit(f"ABORT — duplicate keywords inside the wave-3 plan: {dd[:5]}")

    counts = {}
    for p in plan:
        counts[p["axis"]] = counts.get(p["axis"], 0) + 1

    if plan_only:
        groups = {}
        for p in plan:
            groups[p["axis_group"]] = groups.get(p["axis_group"], 0) + 1
        ladders = {}
        for p in plan:
            ladders[p["ladder"]] = ladders.get(p["ladder"], 0) + 1
        print(f"plan={len(plan)} axes={counts} groups={groups} ladders={ladders}")
        print(f"baseline: {len(prior_kw)} prior queries, {len(baseline)} prior domains, "
              f"{len(prior_dealer)} prior dealer domains")
        cached = sum(1 for p in plan if cache_path(p["keyword"])[1])
        print(f"already cached (free): {cached}")
        return

    if finalize_only:
        finalize(plan, counts, prior_kw, baseline, prior_dealer, 0.0, None, None)
        return

    _, done_stats = load_partials()
    already = {s["keyword"] for s in done_stats}
    todo = [p for p in plan if p["keyword"] not in already]

    print(f"wave 3 program: {len(plan)} queries {counts}", flush=True)
    print(f"baseline (waves 1+2): {len(prior_kw)} queries, {len(prior_dealer)} "
          f"dealer domains, {len(baseline)} total domains", flush=True)
    print(f"resume: {len(already)} already checkpointed, {len(todo)} to run",
          flush=True)
    cached_n = sum(1 for p in todo if cache_path(p["keyword"])[1])
    print(f"  of those, {cached_n} are cached (free) and {len(todo)-cached_n} hit the API",
          flush=True)
    if not todo:
        finalize(plan, counts, prior_kw, baseline, prior_dealer, 0.0, None, None)
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
                    stat = {k: q[k] for k in ("keyword", "axis", "axis_group",
                                              "state", "metro", "region",
                                              "category", "brand_hint",
                                              "phrase_family", "ladder")}
                    stat.update({"depth": None, "pages": None, "cost": 0.0,
                                 "organic": 0, "dealer_candidates": 0,
                                 "net_new_vs_prior": 0, "error": err})
                    fstat.write(json.dumps(stat) + "\n")
                    print(f"  [{done}/{len(todo)}] ERR {q['keyword'][:60]} :: {err}",
                          flush=True)
                else:
                    recs, stat = process_body(q, body, baseline)
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
                          f"net_new={len(seen_dealer - baseline)} "
                          f"spend=${api_cost:.4f} t={time.time()-t0:.0f}s", flush=True)
    finally:
        frec.flush(); os.fsync(frec.fileno()); frec.close()
        fstat.flush(); os.fsync(fstat.fileno()); fstat.close()

    bal1 = balance()
    finalize(plan, counts, prior_kw, baseline, prior_dealer, api_cost, bal0, bal1)


if __name__ == "__main__":
    main()
