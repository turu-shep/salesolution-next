#!/usr/bin/env python3
"""Curated industrial manufacturer-brand vocabulary + a precision-first matcher.

Why this file exists. S1c measured that a dealer's own line-card page names 2.17
brands (max 24) versus 0.35 in a SERP result excerpt. Harvesting that depth is
only worth anything if the extraction is clean, so this module is written for
PRECISION over recall. Every rule below exists because a specific false-positive
class was observed or is obviously waiting to happen:

  * substring hits        -- "SKF" inside "ASKFORD", "Gates" inside "Gatesville"
  * surname hits          -- "Gates", "Martin", "Miller", "Harris", "Donaldson"
  * place-name hits       -- "Milwaukee, WI", "Lincoln, NE", "Boston", "Norton"
  * street-address hits   -- "1835 Timken Rd", "Dodge St"
  * the dealer's own name -- martinsupply.com listing the token "Martin"
  * generic English       -- "banner", "sick", "apex", "alliance", "victor"

Three mechanisms handle those:

  1. Word-boundary regex on LETTERS only, so part numbers ("SKF 6205") still hit
     while "Gatesville" does not.
  2. Case-sensitive matching for short acronyms (SKF/NTN/FAG/ABB/SICK/...), where
     a case-insensitive match is nearly always a different word.
  3. Per-occurrence rejects (street suffix, ", ST" state follow, honorific) plus
     a page-level CONTEXT requirement for ambiguous names -- "Gates" only counts
     if the page also says belt/hose/hydraulic somewhere.

Surface forms collapse to a CANONICAL name so "Parker" and "Parker Hannifin" are
one brand, not two. Brand COUNTS are counts of canonicals; inflating them would
corrupt the size proxy S3 reads off line-card breadth.

Seeded from the 46 brands in research/01-dealer-locator-sources.md, the 59 in
research/06-adjacent-segments.md, the BRAND_VOCAB in scripts/acquire/serp_selfid.py,
and the majors named in the S1c line-card brief.
"""
import re

# --------------------------------------------------------------------------
# Vocabulary.  (canonical, [surface forms, longest first], case_sensitive)
# case_sensitive=True is used for short acronyms and for names that are common
# English words in lower case.
# --------------------------------------------------------------------------
BRANDS = [
    # ---- fluid power / hydraulics / pneumatics
    ("Parker",          ["Parker Hannifin", "ParkerStore", "Parker Store", "Parker"], False),
    ("Bosch Rexroth",   ["Bosch Rexroth", "Rexroth"], False),
    ("Festo",           ["Festo"], False),
    ("SMC",             ["SMC Pneumatics", "SMC Corporation", "SMC"], True),
    ("Norgren",         ["Norgren"], False),
    ("Numatics",        ["Numatics"], False),
    ("Aventics",        ["Aventics"], False),
    ("Camozzi",         ["Camozzi"], False),
    ("Clippard",        ["Clippard"], False),
    ("Bimba",           ["Bimba"], False),
    ("Humphrey",        ["Humphrey Products", "Humphrey"], False),
    ("Enerpac",         ["Enerpac"], False),
    ("Hydac",           ["HYDAC", "Hydac"], False),
    ("Sun Hydraulics",  ["Sun Hydraulics"], False),
    ("Eaton",           ["Eaton Vickers", "Eaton"], False),
    ("Vickers",         ["Vickers"], False),
    ("Char-Lynn",       ["Char-Lynn", "Char Lynn"], False),
    ("Denison",         ["Denison Hydraulics", "Denison"], False),
    ("Danfoss",         ["Danfoss"], False),
    ("Sauer-Danfoss",   ["Sauer-Danfoss", "Sauer Danfoss"], False),
    ("Bailey",          ["Bailey Hydraulics"], False),
    ("Prince",          ["Prince Manufacturing", "Prince Hydraulics"], False),
    ("Stauff",          ["STAUFF", "Stauff"], False),
    ("Adaptall",        ["Adaptall"], False),
    ("Stucchi",         ["Stucchi"], False),
    ("Brennan",         ["Brennan Industries"], False),
    ("Alfagomma",       ["Alfagomma", "Alfa Gomma"], False),
    ("Ryco",            ["RYCO Hydraulics", "RYCO"], True),
    ("Aeroquip",        ["Aeroquip"], False),
    ("Weatherhead",     ["Weatherhead"], False),
    ("Swagelok",        ["Swagelok"], False),
    ("Ham-Let",         ["Ham-Let"], False),

    # ---- hose, fittings, couplings
    ("Gates",           ["Gates Mectrol", "Gates Corporation", "Gates"], False),
    ("Dixon",           ["Dixon Valve", "Dixon Bayco", "Dixon Sanitary", "Dixon"], False),
    ("Continental",     ["ContiTech", "Continental ContiTech", "Continental"], False),
    ("Kuriyama",        ["Kuriyama"], False),
    ("Campbell",        ["Campbell Chain", "Campbell Fittings"], False),
    ("Banjo",           ["Banjo Corporation", "Banjo Fittings"], False),
    ("Goodyear",        ["Goodyear Rubber", "Goodyear Engineered Products"], False),

    # ---- bearings & power transmission
    ("Timken",          ["Timken"], False),
    ("SKF",             ["SKF"], True),
    ("NTN",             ["NTN Bearing", "NTN"], True),
    ("NSK",             ["NSK"], True),
    ("FAG",             ["FAG"], True),
    ("INA",             ["INA"], True),
    ("Schaeffler",      ["Schaeffler"], False),
    ("Koyo",            ["JTEKT Koyo", "Koyo"], False),
    ("Nachi",           ["Nachi"], False),
    ("IKO",             ["IKO"], True),
    ("THK",             ["THK"], True),
    ("RBC Bearings",    ["RBC Bearings"], False),
    ("Rexnord",         ["Regal Rexnord", "Rexnord"], False),
    ("Dodge",           ["Dodge"], False),
    ("Baldor",          ["Baldor"], False),
    ("Browning",        ["Browning"], False),
    ("Sealmaster",      ["Sealmaster", "Seal Master"], False),
    ("Leeson",          ["Leeson"], False),
    ("Lovejoy",         ["Lovejoy"], False),
    ("Martin",          ["Martin Sprocket", "Martin Sprocket & Gear", "Martin"], False),
    ("Boston Gear",     ["Boston Gear"], False),
    ("Morse",           ["Morse"], False),
    ("Fenner",          ["Fenner Drives", "Fenner"], False),
    ("Optibelt",        ["Optibelt"], False),
    ("Bando",           ["Bando"], False),
    ("Carlisle",        ["Carlisle Belts", "Carlisle Power Transmission"], False),
    ("Tsubaki",         ["Tsubaki", "U.S. Tsubaki"], False),
    ("Diamond Chain",   ["Diamond Chain"], False),
    ("Renold",          ["Renold"], False),
    ("Ramsey",          ["Ramsey Products"], False),
    ("Garlock",         ["Garlock"], False),
    ("Chesterton",      ["Chesterton"], False),
    ("Falk",            ["Falk"], False),
    ("Nord",            ["NORD Drivesystems", "NORD Gear"], False),
    ("SEW-Eurodrive",   ["SEW-Eurodrive", "SEW Eurodrive"], False),
    ("Sumitomo",        ["Sumitomo Drive", "Sumitomo"], False),
    ("Bonfiglioli",     ["Bonfiglioli"], False),
    ("Nook",            ["Nook Industries"], False),
    ("Thomson",         ["Thomson Linear", "Thomson Industries"], False),

    # ---- motors, drives, electrical
    ("WEG",             ["WEG"], True),
    ("ABB",             ["ABB"], True),
    ("Siemens",         ["Siemens"], False),
    ("Marathon",        ["Marathon Electric", "Marathon Motors"], False),
    ("Nidec",           ["Nidec", "U.S. Motors", "US Motors"], False),
    ("TECO-Westinghouse", ["TECO-Westinghouse", "TECO Westinghouse"], False),
    ("Lenze",           ["Lenze"], False),
    ("Yaskawa",         ["Yaskawa"], False),
    ("Allen-Bradley",   ["Allen-Bradley", "Allen Bradley"], False),
    ("Rockwell",        ["Rockwell Automation"], False),
    ("Schneider",       ["Schneider Electric", "Square D"], False),
    ("Hammond",         ["Hammond Power Solutions", "Hammond Manufacturing"], False),
    ("Littelfuse",      ["Littelfuse"], False),
    ("Mersen",          ["Mersen"], False),
    ("Phoenix Contact", ["Phoenix Contact"], False),
    ("WAGO",            ["WAGO"], True),
    ("Hubbell",         ["Hubbell"], False),
    ("Appleton",        ["Appleton Electric"], False),
    ("Killark",         ["Killark"], False),

    # ---- automation, sensors, instruments
    ("Banner",          ["Banner Engineering"], False),
    ("Turck",           ["Turck"], False),
    ("Balluff",         ["Balluff"], False),
    ("Pepperl+Fuchs",   ["Pepperl+Fuchs", "Pepperl & Fuchs"], False),
    ("SICK",            ["SICK Sensor", "SICK"], True),
    ("Keyence",         ["Keyence"], False),
    ("Omron",           ["Omron"], False),
    ("ifm",             ["ifm efector", "IFM Efector"], False),
    ("Wika",            ["WIKA", "Wika"], False),
    ("Ashcroft",        ["Ashcroft"], False),
    ("Dwyer",           ["Dwyer Instruments", "Dwyer"], False),
    ("Noshok",          ["NOSHOK"], True),
    ("Endress+Hauser",  ["Endress+Hauser", "Endress & Hauser"], False),
    ("Mitutoyo",        ["Mitutoyo"], False),
    ("Starrett",        ["Starrett"], False),

    # ---- pumps, valves, process
    ("Grundfos",        ["Grundfos"], False),
    ("Goulds",          ["Goulds Pumps", "Goulds"], False),
    ("Xylem",           ["Xylem"], False),
    ("Viking",          ["Viking Pump"], False),
    ("Gorman-Rupp",     ["Gorman-Rupp", "Gorman Rupp"], False),
    ("Flowserve",       ["Flowserve"], False),
    ("Roper",           ["Roper Pump"], False),
    ("Blackmer",        ["Blackmer"], False),
    ("Wilden",          ["Wilden"], False),
    ("Warren Rupp",     ["Warren Rupp", "SandPIPER"], False),
    ("ARO",             ["ARO Pump", "ARO Fluid", "ARO"], True),
    ("Graco",           ["Graco"], False),
    ("Lincoln Lubrication", ["Lincoln Lubrication"], False),
    ("SPX FLOW",        ["SPX FLOW", "SPX Flow"], False),
    ("Alfa Laval",      ["Alfa Laval"], False),
    ("Pentair",         ["Pentair"], False),
    ("Watts",           ["Watts Water", "Watts Regulator"], False),
    ("Apollo Valves",   ["Apollo Valves"], False),
    ("Asahi",           ["Asahi/America", "Asahi America"], False),
    ("Bray",            ["Bray Controls", "Bray International"], False),
    ("Keystone",        ["Keystone Valve"], False),
    ("Crane",           ["Crane Valve", "Crane Co."], False),
    ("Val-Matic",       ["Val-Matic"], False),
    ("Donaldson",       ["Donaldson"], False),
    ("Camfil",          ["Camfil"], False),
    ("Nordson",         ["Nordson"], False),

    # ---- compressors, vacuum, air
    ("Atlas Copco",     ["Atlas Copco"], False),
    ("Ingersoll Rand",  ["Ingersoll Rand", "Ingersoll-Rand"], False),
    ("Sullair",         ["Sullair"], False),
    ("Kaeser",          ["Kaeser"], False),
    ("Quincy",          ["Quincy Compressor"], False),
    ("Gardner Denver",  ["Gardner Denver"], False),
    ("Chicago Pneumatic", ["Chicago Pneumatic"], False),
    ("Busch",           ["Busch Vacuum"], False),
    ("Becker",          ["Becker Pumps"], False),
    ("Gast",            ["Gast Manufacturing", "Gast"], False),

    # ---- welding & gas
    ("Lincoln Electric", ["Lincoln Electric"], False),
    ("Miller",          ["Miller Electric", "Miller Welding", "Millermatic"], False),
    ("ESAB",            ["ESAB"], True),
    ("Hypertherm",      ["Hypertherm"], False),
    ("Victor",          ["Victor Technologies", "Victor Thermal", "Victor"], False),
    ("Harris",          ["Harris Products", "Harris Calorific"], False),
    ("Thermadyne",      ["Thermadyne"], False),
    ("Tweco",           ["Tweco"], False),
    ("Bernard",         ["Bernard Welding", "Bernard MIG"], False),
    ("Fronius",         ["Fronius"], False),
    ("Hobart",          ["Hobart Brothers", "Hobart Welding"], False),

    # ---- cutting tools & abrasives
    ("Norton",          ["Norton Abrasives", "Norton Saint-Gobain", "Norton"], False),
    ("3M",              ["3M"], True),
    ("Kennametal",      ["Kennametal"], False),
    ("Sandvik",         ["Sandvik Coromant", "Sandvik"], False),
    ("Iscar",           ["ISCAR", "Iscar"], False),
    ("Walter",          ["Walter Surface", "Walter Tools", "Walter USA"], False),
    ("Osborn",          ["Osborn"], False),
    ("Weiler",          ["Weiler Abrasives", "Weiler Brush", "Weiler"], False),
    ("Greenfield",      ["Greenfield Industries"], False),
    ("Cleveland",       ["Cleveland Twist Drill"], False),
    ("Guhring",         ["Guhring"], False),
    ("OSG",             ["OSG Tap", "OSG"], True),
    ("Vermont American", ["Vermont American"], False),
    ("CGW",             ["CGW Abrasives"], True),
    ("Pferd",           ["PFERD", "Pferd"], False),
    ("United Abrasives", ["United Abrasives"], False),

    # ---- adhesives, sealants, lubricants, chemicals
    ("Loctite",         ["Loctite"], False),
    ("Henkel",          ["Henkel"], False),
    ("Devcon",          ["Devcon"], False),
    ("WD-40",           ["WD-40"], False),
    ("CRC",             ["CRC Industries", "CRC"], True),
    ("LPS",             ["LPS Laboratories"], True),
    ("Mobil",           ["Mobil SHC", "Mobil Industrial"], False),
    ("Shell",           ["Shell Lubricants"], False),
    ("Chevron",         ["Chevron Lubricants"], False),

    # ---- material handling, conveyors, lifting
    ("Dorner",          ["Dorner"], False),
    ("Hytrol",          ["Hytrol"], False),
    ("Interroll",       ["Interroll"], False),
    ("FlexLink",        ["FlexLink"], False),
    ("Vestil",          ["Vestil"], False),
    ("Ballymore",       ["Ballymore"], False),
    ("Toyota Forklift", ["Toyota Material Handling", "Toyota Forklift"], False),
    ("Crown",           ["Crown Equipment", "Crown Forklift"], False),
    ("Hyster",          ["Hyster"], False),
    ("Yale",            ["Yale Hoist", "Yale Lift", "Yale Materials"], False),
    ("CM",              ["Columbus McKinnon", "CM Hoist"], False),
    ("Coffing",         ["Coffing"], False),
    ("Harrington",      ["Harrington Hoists", "Harrington Hoist"], False),
    ("Gorbel",          ["Gorbel"], False),
    ("Little Giant",    ["Little Giant"], False),

    # ---- fasteners, hand & power tools, safety
    ("Simpson",         ["Simpson Strong-Tie"], False),
    ("PennEngineering", ["PennEngineering", "PEM Fastener"], False),
    ("Bossard",         ["Bossard"], False),
    ("Nord-Lock",       ["Nord-Lock"], False),
    ("SPIROL",          ["SPIROL"], True),
    ("Bosch",           ["Bosch Power Tools", "Robert Bosch"], False),
    ("DeWalt",          ["DEWALT", "DeWalt"], False),
    ("Milwaukee",       ["Milwaukee Tool", "Milwaukee Electric Tool"], False),
    ("Makita",          ["Makita"], False),
    ("Stanley",         ["Stanley Tools", "Stanley Black & Decker", "Proto"], False),
    ("Greenlee",        ["Greenlee"], False),
    ("Klein",           ["Klein Tools"], False),
    ("Ridgid",          ["RIDGID", "Ridgid"], False),
    ("Snap-on",         ["Snap-on"], False),
    ("Apex",            ["Apex Tool", "Apex Fastener"], False),
    ("MSA",             ["MSA Safety", "MSA"], True),
    ("Honeywell",       ["Honeywell"], False),
    ("Ansell",          ["Ansell"], False),
    ("Jackson Safety",  ["Jackson Safety"], False),
    ("Justrite",        ["Justrite"], False),
]

# --------------------------------------------------------------------------
# Ambiguity guards. A canonical listed here is only accepted if the page ALSO
# contains one of these context terms somewhere. This is deliberately a
# page-level test, not a per-occurrence one: on a real line card the brands are
# bare tokens in a grid, so an occurrence-level window would reject them all.
# --------------------------------------------------------------------------
CONTEXT_REQUIRED = {
    "Gates":        r"belt|hose|hydraulic|v-belt|power transmission|mectrol|sheave|drive|coupling",
    "Martin":       r"sprocket|conveyor|chain|pulley|bushing|belt|power transmission|sheave|gear",
    "Miller":       r"weld|mig|tig|arc|plasma|torch|electrode",
    "Norton":       r"abrasive|grind|wheel|sandpaper|saint-gobain|cut-?off|sanding|blast",
    "Victor":       r"torch|cutting|weld|regulator|gas apparatus|oxy",
    "Harris":       r"torch|weld|gas|regulator|braz|solder",
    "Walter":       r"abrasive|surface|cutting|grind|carbide|tool|milling",
    "Morse":        r"chain|cutting|band ?saw|sprocket|drive|hole saw",
    "Apex":         r"fastener|bit|socket|tool|driver",
    "Stanley":      r"tool|hydraulic|hand tool|assembly|proto|fastening",
    "Klein":        r"tool|plier|electrician|hand tool|wire",
    "Browning":     r"belt|sheave|bushing|bearing|pulley|power transmission|gear",
    "Dodge":        r"bearing|mount|sleeve|reducer|conveyor|power transmission|baldor|sheave|taper",
    "Continental":  r"belt|hose|contitech|conveyor|rubber|drive",
    "Bando":        r"belt|drive|sync|rubber",
    "Nord":         r"gear|drive|motor|reducer|drivesystem",
    "Graco":        r"pump|spray|lubricat|finish|coating|dispens|sealant",
    "Viking":       r"pump|rotary|gear pump",
    "Eaton":        r"hydraulic|valve|filter|electrical|char-lynn|vickers|breaker|hose|aeroquip|pump",
    "Fenner":       r"belt|drive|pulley|power transmission|conveyor",
    "Goulds":       r"pump|water|centrifug|impeller",
    "Dwyer":        r"instrument|gauge|gage|pressure|flow|switch|manometer",
    "Ashcroft":     r"gauge|gage|pressure|instrument|transducer|thermometer",
    "Donaldson":    r"filter|filtration|element|hydraulic|compressed air|dust",
    "Osborn":       r"brush|abrasive|finish|deburr|bearing",
    "Weiler":       r"brush|abrasive|deburr|finish|grind|cut-?off",
    "Crane":        r"valve|pump|flow|fitting|actuat",
    "Watts":        r"valve|water|regulat|backflow|plumb",
    "Keystone":     r"valve|butterfly|actuat",
    "Yale":         r"hoist|lift|crane|trolley|forklift|chain",
    "Crown":        r"forklift|lift truck|material handling|pallet",
    "Hobart":       r"weld|electrode|wire|filler",
    "Bernard":      r"weld|mig|gun|torch|nozzle",
    "Cleveland":    r"drill|twist|tap|cutting tool|end mill",
    "Greenfield":   r"drill|tap|cutting tool|end mill|carbide",
    "Shell":        r"lubricant|oil|grease|omala|tellus",
    "Mobil":        r"lubricant|oil|grease|shc",
    "Chevron":      r"lubricant|oil|grease",
    "Bosch":        r"tool|rexroth|hydraulic|sensor|power tool|pneumatic",
    "Milwaukee":    r"tool|cordless|m18|m12|power tool|packout|sawzall",
    "Prince":       r"hydraulic|cylinder|valve|pump",
    "Bailey":       r"hydraulic|cylinder|pump|valve",
    "Campbell":     r"chain|fitting|hook|rigging|sling|coupling",
    "Thomson":      r"linear|bearing|actuator|ball screw|shaft",
    "Ramsey":       r"chain|conveyor|scale|winch",
    "Simpson":      r"strong-tie|anchor|connector|fasten",
    "Falk":         r"coupling|gear|reducer|drive|grid",
    "Banjo":        r"fitting|valve|pump|poly|coupling|agricultur",
    "Goodyear":     r"hose|belt|rubber|conveyor|engineered",
    "Carlisle":     r"belt|power transmission|drive|sheave",
    "Honeywell":    r"safety|glove|respirat|sensor|gas detect|north|uvex|fall protect",
    "MSA":          r"safety|helmet|respirat|gas detect|fall protect|hard hat",
    "Pentair":      r"pump|filtrat|valve|water|hydro",
    "Xylem":        r"pump|water|flygt|goulds|treat",
    "Roper":        r"pump|gear pump",
    "Hubbell":      r"electrical|wiring|connector|enclosure|grounding|lighting",
    "Marathon":     r"motor|electric|drive",
    "Nidec":        r"motor|drive|us motors|emerson",
    "Rockwell":     r"automation|allen|plc|drive|control",
    "Schneider":    r"electric|square d|breaker|plc|drive|control",
    "Siemens":      r"motor|drive|plc|control|automation|breaker|electric",
    "Renold":       r"chain|coupling|gear|sprocket",
    "Gast":         r"pump|vacuum|air motor|compressor|blower",
    "Becker":       r"pump|vacuum|blower",
    "Busch":        r"pump|vacuum|blower",
    "Asahi":        r"valve|pipe|thermoplastic|actuat",
    "Bray":         r"valve|butterfly|actuat|control",
}

# Occurrence-level rejects.
STREET_SUFFIX = (r"(?:\s+(?:Rd|Road|St|Street|Ave|Avenue|Dr|Drive|Blvd|Boulevard|"
                 r"Ln|Lane|Way|Ct|Court|Pkwy|Parkway|Hwy|Highway|Cir|Circle|Pl|"
                 r"Place|Ter|Terrace|Trail|Tpke)\b\.?)")
STREET_RX = re.compile(STREET_SUFFIX, re.I)
# "Milwaukee, WI" / "Lincoln, NE 68502" -- a city, not a brand.
STATE_FOLLOW_RX = re.compile(
    r"\s*,\s*(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|"
    r"MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|"
    r"VA|WA|WV|WI|WY)\b")
HONORIFIC_RX = re.compile(r"(?:Mr|Mrs|Ms|Dr|Prof)\.?\s+$", re.I)
# "Saint Martin" / "St. Charles" -- measured on a1truckparts.net, where a
# country dropdown produced a Martin Sprocket hit.
# Only place-FORMING prefixes; "New"/"North"/"West" are dropped on purpose --
# they are ordinary adjectives ("New Parker pumps") and would cost real hits.
PLACE_PREFIX_RX = re.compile(r"\b(?:Saint|St|Ste|Mount|Mt|Fort|Ft|Lake|Port)\.?\s+$")
# A capitalised token right before the brand is a surname tell ("Bill Gates").
FIRSTNAME_RX = re.compile(
    r"\b(?:John|Bill|William|Mike|Michael|Jim|James|Tom|Thomas|Bob|Robert|Dave|"
    r"David|Steve|Steven|Dan|Daniel|Chris|Mark|Paul|Rick|Richard|Joe|Joseph|"
    r"Ken|Kevin|Larry|Gary|Jeff|Scott|Brian|Greg|Ryan|Matt|Matthew|Eric|Sam|"
    r"Tony|Tim|Timothy|Andy|Andrew|Ed|Edward|Frank|Charles|Charlie|George|"
    r"Jack|Jerry|Ron|Ronald|Terry|Wayne|Doug|Craig|Todd|Brad|Chad|Nick|"
    r"Melinda|Sarah|Susan|Karen|Nancy|Linda|Mary|Lisa|Jennifer)\s+$")

# Canonicals that are also plausible personal surnames -- these get the
# FIRSTNAME / honorific test as well as the address tests.
SURNAME_RISK = {
    "Gates", "Martin", "Miller", "Harris", "Walter", "Morse", "Donaldson",
    "Dwyer", "Goulds", "Klein", "Browning", "Fenner", "Osborn", "Weiler",
    "Bernard", "Crane", "Watts", "Bailey", "Prince", "Campbell", "Thomson",
    "Ramsey", "Simpson", "Falk", "Becker", "Busch", "Hobart", "Victor",
    "Nord", "Roper", "Bosch", "Marathon",
}


def _boundary(form, case_sensitive):
    """Word-boundary regex on LETTERS.

    Trailing guard is letters-only so a part number ("SKF 6205", "3M 7100")
    still matches while "Gatesville" and "ASKF" do not. Forms that start with a
    digit ("3M") also need a digit guard in front, or "13M" would match.
    """
    lead = r"(?<![A-Za-z0-9])" if form[0].isdigit() else r"(?<![A-Za-z])"
    trail = r"(?![A-Za-z])"
    flags = 0 if case_sensitive else re.I
    return re.compile(lead + re.escape(form) + trail, flags)


# (canonical, form, compiled) sorted so longer surface forms are tried first.
MATCHERS = []
for _canon, _forms, _cs in BRANDS:
    for _f in sorted(_forms, key=len, reverse=True):
        MATCHERS.append((_canon, _f, _boundary(_f, _cs)))

CANONICALS = sorted({c for c, f, _ in MATCHERS})
CONTEXT_RX = {k: re.compile(v, re.I) for k, v in CONTEXT_REQUIRED.items()}


def _occurrence_ok(canon, text, start, end):
    """Per-occurrence rejects: street address, city+state, person's name."""
    after = text[end:end + 24]
    before = text[max(0, start - 24):start]
    if STREET_RX.match(after):
        return False
    if STATE_FOLLOW_RX.match(after):
        return False
    if (canon in SURNAME_RISK or canon in CONTEXT_REQUIRED) \
            and PLACE_PREFIX_RX.search(before):
        return False
    if canon in SURNAME_RISK:
        if HONORIFIC_RX.search(before) or FIRSTNAME_RX.search(before):
            return False
    return True


def extract(text, apex=None, return_evidence=False):
    """Return the canonical brands named in `text`.

    `apex` is the dealer's own apex domain. If an ambiguous brand token is also
    part of the dealer's own domain label ("martinsupply.com" -> "Martin"),
    it is rejected: that is the dealer's name, not a line-card entry.
    """
    hits, evidence = {}, {}
    label = ""
    if apex:
        label = re.sub(r"[^a-z0-9]", "", apex.split(".")[0].lower())

    for canon, form, rx in MATCHERS:
        for m in rx.finditer(text):
            if not _occurrence_ok(canon, text, m.start(), m.end()):
                continue
            hits.setdefault(canon, 0)
            hits[canon] += 1
            if canon not in evidence:
                lo, hi = max(0, m.start() - 70), min(len(text), m.end() + 70)
                evidence[canon] = {
                    "form": form,
                    "match": m.group(0),
                    "context": re.sub(r"\s+", " ", text[lo:hi]).strip(),
                }
            break  # one confirmed occurrence per surface form is enough

    out = []
    for canon in hits:
        crx = CONTEXT_RX.get(canon)
        if crx and not crx.search(text):
            continue
        if canon in CONTEXT_REQUIRED and label:
            token = re.sub(r"[^a-z0-9]", "", canon.lower())
            if token and token in label:
                continue  # the dealer's own name
        out.append(canon)

    out.sort()
    if return_evidence:
        return out, {k: evidence[k] for k in out if k in evidence}
    return out


if __name__ == "__main__":
    print(f"{len(BRANDS)} brand entries, {len(CANONICALS)} canonicals, "
          f"{len(MATCHERS)} surface forms")
    probes = [
        ("We stock SKF, Timken and NTN bearings.", ["NTN", "SKF", "Timken"]),
        ("Located at 1835 Timken Rd, Canton OH", []),
        ("Bill Gates visited", []),
        ("Gates belts and hose, Browning sheaves", ["Browning", "Gates"]),
        ("Serving Milwaukee, WI since 1954", []),
        ("Milwaukee Tool cordless drills in stock", ["Milwaukee"]),
        ("ASKFORD parts", []),
        ("He is sick today", []),
        ("SICK sensors and Banner Engineering photoelectric", ["Banner", "SICK"]),
    ]
    bad = 0
    for txt, want in probes:
        got = extract(txt)
        flag = "ok " if got == want else "FAIL"
        bad += got != want
        print(f"  {flag} {txt[:52]!r:56} -> {got}")
    raise SystemExit(1 if bad else 0)
