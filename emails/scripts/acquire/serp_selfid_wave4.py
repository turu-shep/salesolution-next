#!/usr/bin/env python3
"""S1 raw acquisition — SERP dealer self-identification, WAVE 4.

Same harness as `serp_selfid_wave3.py` (append-per-record JSONL partials, fsync
every 25 queries, resume by skipping completed keywords, `--finalize` rebuild).
New plan, new baseline (waves 1 UNION 2 UNION 3), new cache dir, new output.
Waves 1-3's files are never opened for writing.

Classification, declaration extraction and the negation flag are IMPORTED from
wave 3 rather than copied, so all four waves are byte-identically comparable and
cannot drift. Wave 3 did the same to wave 2 by hand; importing removes the hand.

WHY WAVE 4 EXISTS.
`01-build-plan.md` §5h rates "SERP wave 4+" as **diminishing — only for
replenishment**, on the grounds that §5f closed the supply gap and the binding
constraint is qualification throughput, not acquisition. That caveat stands and
is not repealed by this run. Artur overrode it on 2026-08-04 on volume grounds
with ~$3 approved, and the two honest justifications are:
  (a) REPLENISHMENT — D-01 retires zero-engagement contacts weekly, so the
      seated list drains and needs a feed;
  (b) the QUOTABLE-DECLARATION yield — the dealer's own sentence about the lines
      they carry, which no locator, listing or database row can produce.
Volume is the reason it is this big; the declaration is the reason it is worth
running at all. The report leads with both.

THE QUERY AXIS — BUILT ON §5k, THE SECOND CORRECTION.
The axis rule was corrected twice and only §5k survives:
  §5b  state-scope the LINE-CARD phrase.        -> wrong at scale.
  §5g  national brand-agnostic beats geographic
       4-5x.                                     -> confounded; it was depth.
  §5k  with explicit controls: holding depth constant the axis is worth
       1.24-1.44x; holding axis constant DEPTH is worth 1.87-2.17x, and
       geographic-deep beats national-standard outright.
       **Pull the ladder deep first, then prefer the national axis.**
So wave 4 runs the DEEP ladder on EVERY query — including all 100 geographic
ones, which wave 3 ran 120/150 shallow — and weights the axis national 5:1.
Depth is the bigger lever and it applies to both axes; there is no reason left
to buy a shallow query.

THE OPENING RUNG, TUNED (§5k's efficiency note, measured 2026-08-04).
§5k: 26% of wave-3 spend ($0.755 of $2.88) burned on failed ladder rungs,
because the deep ladder opens at depth=100 / max_crawl_pages=7 and only 48% of
deep queries were served there. "Tune the opening rung before any future wave."
A 10-query control run today re-issued wave-3 keywords that had FAILED the
(100,7) rung, at (50,5): **8 of 10 served.** It also showed the thing that
actually decides the ladder — **DataForSEO bills by pages actually crawled, not
pages requested**: 1 page $0.0020, 2 $0.0035, 4 $0.0065, 5 $0.0080, 7 $0.0090,
and a rung that errors costs a flat $0.0020.
So the remedy is NOT a shallower opening rung — over-asking is nearly free. The
remedy is a DENSER ladder: keep (100,7) on top, and catch the 3-to-7-page band
at (50,5) instead of dropping it straight to (30,3).
  wave 3   [(100,7),        (30,3),(20,2),(10,1)]  -> ~37 organic/deep query
  wave 4   [(100,7),(50,5), (30,3),(20,2),(10,1)]  -> ~40 organic/deep query
for about $0.002 more on the ~54% that miss the top rung.

PROGRAM SHAPE (600 planned, spend-capped — the guard, not the plan, decides
where it stops; zero keyword overlap with waves 1-3, asserted at run):
  NA-CAT 190  declaration language x 80 industrial categories waves 1-3 never
              paired with it. Wave 3's best family by both measures that matter:
              15.46 net-new/query AND 14.93 declaration-carrying domains/query.
  NA-DECL 110 declaration phrasings waves 1-3 never used (9.95 / 8.72).
  NA-STOCK 90 stocking + inventory language (11.26 / 6.15).
  NA-TRADE 80 trade-noun x authorization (12.00 / 6.80).
  NB      30  new sub-brands of the eight Cloudflare-blocked brands, to keep
              authorization evidence flowing (5.21 / 1.79 — thin, hence 30).
  GEO    100  declaration + stocking language x 28 unused states, 40 unused
              metros, 12 regions. ALL DEEP, per §5k.

DELIBERATELY ABSENT.
  - catalog-PDF boilerplate: §5k measured it at 2.20 net-new/query and 2 usable
    declarations — the weakest axis in wave 3. Killed.
  - line-card-page phrasings: 4.78 net-new/query but 0.43 declaration-carrying
    domains/query. It buys domains, not the sentence. Cut to zero.
  - Gates's retail-program term: §5b dead end (3 organic, 0 dealers).
  - any automotive / truck / fleet / aftermarket vocabulary (§5e). Detroit stays
    off the metro list for the same reason.
  - the standard ladder. §5k retired it.

WHAT THIS SCRIPT DOES NOT DO.
No fold-in. It does not write to `lists/` or `data/side-pools/` — another
session owns the domain-resolution run and would collide. Raw payload plus
measurement only. It reads `lists/deduped-v7.csv` read-only, to report net-new
against the live list alongside net-new against the SERP baseline.

RAW ACQUISITION ONLY. Classification is a tag on the record, never a delete.
Declaration text is stored BYTE-EXACT AS PUBLISHED — original casing,
non-breaking spaces, the lot. It is email copy, not a data field; cleaning it
destroys the only thing that makes it quotable. A NEGATED declaration ("is NOT
an authorized distributor") carries `declaration_is_negated` and is never
counted into the usable total.
"""
import csv
import json
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, FIRST_COMPLETED, wait

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import serp_selfid_wave3 as w3  # noqa: E402  classification + extraction, verbatim

CAPTURED = "2026-08-04"
WAVE = "wave4"
ROOT = w3.ROOT
RAW = w3.RAW
CACHE = os.path.join(RAW, "_cache", "serp-w4")
PRIOR_CACHES = [os.path.join(RAW, "_cache", d) for d in ("serp-w3", "serp-w2", "serp")]
WAVE1 = w3.WAVE1
WAVE2 = w3.WAVE2
WAVE3 = os.path.join(RAW, "serp-selfid-wave3-2026-08-01.json")
WAVE3_REC_PART = os.path.join(RAW, "serp-selfid-wave3-2026-08-01.records.partial.jsonl")
WAVE3_STAT_PART = os.path.join(RAW, "serp-selfid-wave3-2026-08-01.qstats.partial.jsonl")
DEDUPED_V7 = os.path.join(ROOT, "lists", "deduped-v7.csv")
ENDPOINT = w3.ENDPOINT
AUTH = w3.AUTH
# 10, not wave 3's 5. A 5-rung ladder makes each query slow, and at 5 workers
# the 594-query plan is a 77-minute run. The cost of more workers is a staler
# spend snapshot inside run_query — at most WORKERS x ~$0.012 = $0.12 of
# overshoot, against the $0.55 of headroom between the guard and the abort rail.
WORKERS = 10

# Denser than wave 3's, per today's rung control. See the module docstring.
LADDER_DEEP = [(100, 7), (50, 5), (30, 3), (20, 2), (10, 1)]

# HARD SPEND CAP $5.00 (Artur, 2026-08-04; ~$3 approved). Two rails:
#   SPEND_GUARD  stop ISSUING new queries. Up to WORKERS may still be in flight,
#                each able to walk a whole ladder, so the guard sits far enough
#                below the cap to absorb them.
#   SPEND_ABORT  hard stop, checked inside the ladder walk itself.
# SPEND_GUARD is overridable so the loop can be smoke-tested end to end for a
# few cents before the full run. Lowering it is always safe; raising it past the
# abort rail is not, and is clamped.
SPEND_GUARD = min(float(os.environ.get("W4_GUARD", "4.20")), 4.20)
SPEND_ABORT = 4.75
SPEND_CAP = 5.00

# ================================================================== THE PLAN
#
# NA-CAT. Wave 3's `declaration_x_category` was its best family on BOTH numbers
# that matter (15.46 net-new/query, 14.93 declaration-carrying domains/query),
# and it was only 28 queries of 400. These are 80 industrial categories waves 1-3
# never paired with declaration language. Every one carries an industrial
# qualifier; none carries automotive/truck/fleet/aftermarket vocabulary (§5e).
NEW_CATEGORIES = [
    ("industrial gearmotors speed reducers", "motors_drives"),
    ("industrial shaft couplings power transmission", "bearings_pt"),
    ("industrial linear actuators motion control", "automation"),
    ("industrial mounted bearings pillow block", "bearings_pt"),
    ("industrial roller chain drive sprockets", "bearings_pt"),
    ("industrial timing belts synchronous pulleys", "bearings_pt"),
    ("industrial clutches brakes power transmission", "bearings_pt"),
    ("industrial ball screws linear guides", "automation"),
    ("industrial hydraulic power units reservoirs", "hydraulics"),
    ("industrial hydraulic valves manifolds", "hydraulics"),
    ("industrial hydraulic accumulators", "hydraulics"),
    ("industrial hydraulic seals rod wipers", "seals_gaskets"),
    ("industrial hose crimpers assembly equipment", "hose_fittings"),
    ("industrial flexible metal hose expansion joints", "hose_fittings"),
    ("industrial ducting hose material handling", "hose_fittings"),
    ("industrial tube fittings compression instrumentation", "instrumentation"),
    ("industrial ball valves process piping", "pumps_valves"),
    ("industrial butterfly valves process piping", "pumps_valves"),
    ("industrial check valves relief valves", "pumps_valves"),
    ("industrial solenoid valves process", "pumps_valves"),
    ("industrial valve actuators pneumatic electric", "pumps_valves"),
    ("industrial steam traps condensate", "pumps_valves"),
    ("industrial strainers process piping filters", "mro"),
    ("industrial air operated diaphragm pumps", "pumps_valves"),
    ("industrial peristaltic hose pumps", "pumps_valves"),
    ("industrial gear pumps positive displacement", "pumps_valves"),
    ("industrial centrifugal process pumps", "pumps_valves"),
    ("industrial mechanical seals pump repair", "seals_gaskets"),
    ("industrial compression packing braided", "seals_gaskets"),
    ("industrial gasket sheet material cut gaskets", "seals_gaskets"),
    ("industrial o-ring kits seals", "seals_gaskets"),
    ("industrial compressed air dryers filtration", "compressed_air"),
    ("industrial nitrogen generators compressed air", "compressed_air"),
    ("industrial vacuum pumps generators", "pumps_valves"),
    ("industrial blowers ventilation fans", "pumps_valves"),
    ("industrial dust collection filter bags", "mro"),
    ("industrial air tools pneumatic plant", "pneumatics"),
    ("industrial pneumatic grippers end effectors", "automation"),
    ("industrial machine guarding safety fencing", "safety_supply"),
    ("industrial safety light curtains interlocks", "safety_supply"),
    ("industrial gas detection monitors plant", "safety_supply"),
    ("industrial fall protection harnesses plant", "safety_supply"),
    ("industrial pressure gauges transmitters process", "instrumentation"),
    ("industrial thermocouples RTD temperature sensors", "instrumentation"),
    ("industrial flow meters process measurement", "instrumentation"),
    ("industrial level transmitters process sensors", "instrumentation"),
    ("industrial calibration test instruments", "instrumentation"),
    ("industrial control panels NEMA enclosures", "automation"),
    ("industrial wire cable plant electrical", "automation"),
    ("industrial cable carriers energy chain", "automation"),
    ("industrial cordsets sensor connectors", "automation"),
    ("industrial PLC HMI automation controls", "automation"),
    ("industrial servo motors motion control", "automation"),
    ("industrial vibration monitoring analysis", "instrumentation"),
    ("industrial automatic lubrication systems", "lubricants"),
    ("industrial metalworking fluids coolants", "lubricants"),
    ("industrial degreasers solvents plant cleaning", "mro"),
    ("industrial spray finishing paint equipment", "mro"),
    ("industrial abrasive blast media equipment", "abrasives"),
    ("industrial bandsaw blades metal cutting", "cutting_tools"),
    ("industrial drills taps end mills", "cutting_tools"),
    ("industrial toolholders collets workholding", "cutting_tools"),
    ("industrial machine shop vises fixtures", "cutting_tools"),
    ("industrial wire rope slings rigging hardware", "material_handling"),
    ("industrial chain hoists trolleys lifting", "material_handling"),
    ("industrial jib cranes workstation lifting", "material_handling"),
    ("industrial dock levelers loading equipment", "material_handling"),
    ("industrial pallet rack shelving storage", "material_handling"),
    ("industrial casters carts wheels", "material_handling"),
    ("industrial conveyor rollers idlers pulleys", "material_handling"),
    ("industrial conveyor belt cleaners lagging", "material_handling"),
    ("industrial screw conveyors bucket elevators", "material_handling"),
    ("industrial vibratory feeders bulk handling", "material_handling"),
    ("industrial strut channel pipe hangers supports", "mro"),
    ("industrial concrete anchors fasteners", "fasteners"),
    ("industrial threaded rod studs nuts", "fasteners"),
    ("industrial blind rivets fastening", "fasteners"),
    ("industrial precision shims washers", "fasteners"),
    ("industrial heat tracing process insulation", "instrumentation"),
    ("industrial combustion burners boiler", "instrumentation"),
]
# Three declaration verbs, applied in TEMPLATE-MAJOR order so a spend-capped stop
# still covers every category once before any category gets a second phrasing.
DECL_TEMPLATES = ['"authorized distributor" {c}',
                  '"authorized distributor of" {c}',
                  '"authorized distributor for" {c}']

# NA-DECL. Declaration phrasings waves 1-3 never used. The sentence is the
# deliverable, so these are chosen for how quotable the matched sentence is.
NA_DECL = [
    ('"is an authorized distributor of" industrial MRO supply', "mro"),
    ('"is an authorized distributor of" hydraulic pneumatic', "hydraulics"),
    ('"is an authorized distributor of" bearings power transmission', "bearings_pt"),
    ('"is an authorized distributor of" welding supply industrial gas', "welding_gas"),
    ('"is an authorized distributor of" industrial automation controls', "automation"),
    ('"is an authorized distributor of" pumps valves industrial', "pumps_valves"),
    ('"has been an authorized distributor" industrial supply', "mro"),
    ('"has been an authorized distributor" hydraulic pneumatic', "hydraulics"),
    ('"has been an authorized distributor" bearings power transmission', "bearings_pt"),
    ('"we are proud to represent" industrial distributor MRO', "mro"),
    ('"we are proud to represent" hydraulic pneumatic distributor', "hydraulics"),
    ('"we are proud to represent" bearings power transmission distributor', "bearings_pt"),
    ('"proud distributor of" industrial MRO supply', "mro"),
    ('"proud distributor of" hydraulic pneumatic fluid power', "hydraulics"),
    ('"proud distributor of" bearings power transmission industrial', "bearings_pt"),
    ('"proud distributor of" welding supplies industrial gas', "welding_gas"),
    ('"authorized dealer and distributor" industrial supply', "mro"),
    ('"authorized dealer and distributor" hydraulic pneumatic', "hydraulics"),
    ('"authorized dealer and distributor" welding industrial gas', "welding_gas"),
    ('"an authorized dealer for" industrial MRO supply', "mro"),
    ('"an authorized dealer for" hydraulic pneumatic industrial', "hydraulics"),
    ('"an authorized dealer for" bearings power transmission', "bearings_pt"),
    ('"we are an authorized dealer of" industrial supply', "mro"),
    ('"we are an authorized dealer of" hydraulic pneumatic', "hydraulics"),
    ('"authorized industrial distributor" MRO plant maintenance', "mro"),
    ('"authorized industrial distributor" hydraulic pneumatic', "hydraulics"),
    ('"authorized industrial distributor" bearings power transmission', "bearings_pt"),
    ('"authorized industrial distributor" welding supply gas', "welding_gas"),
    ('"authorized industrial dealer" MRO supply', "mro"),
    ('"authorized industrial dealer" hydraulic pneumatic', "hydraulics"),
    ('"authorized distributor and service center" industrial', "mro"),
    ('"authorized distributor and service center" hydraulic', "hydraulics"),
    ('"authorized distributor and service center" pneumatic industrial', "pneumatics"),
    ('"authorized sales and service" distributor industrial hydraulic', "hydraulics"),
    ('"authorized sales and service" distributor industrial pneumatic', "pneumatics"),
    ('"authorized sales and service" distributor industrial electric motors', "motors_drives"),
    ('"authorized distributor since" industrial MRO supply', "mro"),
    ('"authorized distributor since" hydraulic pneumatic industrial', "hydraulics"),
    ('"your authorized distributor for" industrial MRO supply', "mro"),
    ('"your authorized distributor for" hydraulic hose fittings', "hose_fittings"),
    ('"your authorized distributor for" bearings power transmission', "bearings_pt"),
    ('"the authorized distributor for" industrial MRO supply', "mro"),
    ('"the authorized distributor for" hydraulic pneumatic industrial', "hydraulics"),
    ('"premier distributor" industrial MRO supply', "mro"),
    ('"premier distributor" hydraulic pneumatic fluid power', "hydraulics"),
    ('"premier distributor" bearings power transmission industrial', "bearings_pt"),
    ('"premier distributor" welding supply industrial gas', "welding_gas"),
    ('"platinum distributor" industrial automation', "automation"),
    ('"platinum distributor" industrial hydraulic pneumatic', "hydraulics"),
    ('"gold level distributor" industrial supply', "mro"),
    ('"elite distributor" industrial MRO supply', "mro"),
    ('"certified partner" industrial distributor automation', "automation"),
    ('"certified partner" industrial distributor hydraulic pneumatic', "hydraulics"),
    ('"authorized channel partner" industrial distributor automation', "automation"),
    ('"value added distributor" industrial MRO supply', "mro"),
    ('"value added distributor" industrial automation controls', "automation"),
    ('"value added distributor" industrial hydraulic pneumatic', "hydraulics"),
    ('"value-added reseller" industrial automation distributor', "automation"),
    ('"full line distributor" industrial MRO supply', "mro"),
    ('"full line distributor" hydraulic pneumatic fluid power', "hydraulics"),
    ('"full line distributor" bearings power transmission industrial', "bearings_pt"),
    ('"full line distributor" welding supply industrial gas', "welding_gas"),
    ('"full line distributor" abrasives cutting tools industrial', "abrasives"),
    ('"full service distributor" industrial MRO supply', "mro"),
    ('"full service distributor" hydraulic pneumatic industrial', "hydraulics"),
    ('"full line stocking distributor" industrial supply', "mro"),
    ('"full line stocking distributor" hydraulic pneumatic', "hydraulics"),
    ('"full line stocking distributor" bearings power transmission', "bearings_pt"),
    ('"authorized full line distributor" industrial supply', "mro"),
    ('"distributor and integrator" industrial automation controls', "automation"),
    ('"authorized systems integrator" industrial distributor automation', "automation"),
    ('"authorized OEM distributor" industrial supply', "mro"),
    ('"we distribute products from" industrial MRO', "mro"),
    ('"we distribute products from" hydraulic pneumatic industrial', "hydraulics"),
    ('"we carry products from" industrial distributor MRO', "mro"),
    ('"we are the authorized" distributor industrial hydraulic', "hydraulics"),
    ('"we are the authorized" distributor industrial bearings belts', "bearings_pt"),
    ('"proudly distributes" industrial MRO products', "mro"),
    ('"proudly distributes" hydraulic pneumatic products industrial', "hydraulics"),
    ('"official distributor of" industrial MRO supply', "mro"),
    ('"official distributor of" hydraulic pneumatic industrial', "hydraulics"),
    ('"authorized reseller" industrial automation sensors', "automation"),
    ('"authorized reseller" industrial MRO supply distributor', "mro"),
    ('"designated distributor" industrial MRO supply', "mro"),
    ('"appointed distributor" industrial supply MRO', "mro"),
    ('"franchised distributor" industrial MRO supply', "mro"),
    ('"franchised distributor" industrial automation electrical', "automation"),
    ('"authorized warehouse distributor" industrial supply', "mro"),
    ('"we have been an authorized distributor" industrial', "mro"),
    ('"an authorized stocking distributor" industrial MRO', "mro"),
    ('"an authorized stocking distributor" hydraulic pneumatic', "hydraulics"),
    ('"an authorized stocking distributor" bearings power transmission', "bearings_pt"),
    ('"authorized distributor in the" industrial MRO supply', "mro"),
    ('"one of the largest authorized distributors" industrial', "mro"),
    ('"largest authorized distributor" industrial MRO supply', "mro"),
    ('"leading authorized distributor" industrial hydraulic pneumatic', "hydraulics"),
    ('"leading distributor of" industrial MRO supply', "mro"),
    ('"leading distributor of" hydraulic pneumatic fluid power', "hydraulics"),
    ('"leading distributor of" bearings power transmission industrial', "bearings_pt"),
    ('"oldest authorized distributor" industrial supply', "mro"),
    ('"only authorized distributor" industrial MRO supply', "mro"),
    ('"authorized distributor network" industrial MRO member', "mro"),
    ('"authorized distributor and integrator" industrial automation', "automation"),
    ('"certified distributor" hydraulic pneumatic fluid power', "hydraulics"),
    ('"certified distributor" bearings power transmission industrial', "bearings_pt"),
    ('"certified distributor" welding supply industrial gas', "welding_gas"),
    ('"approved distributor" industrial MRO supply plant', "mro"),
    ('"approved distributor" bearings power transmission industrial', "bearings_pt"),
    ('"authorized repair and distribution center" industrial', "mro"),
    ('"authorized service provider" industrial distributor hydraulic', "hydraulics"),
]

# NA-STOCK. Stocking + inventory language (wave 3: 11.26 net-new/query).
NA_STOCK = [
    ('"authorized stocking distributor" industrial MRO supply', "mro"),
    ('"authorized stocking distributor" hydraulic hose fittings', "hose_fittings"),
    ('"authorized stocking distributor" bearings power transmission', "bearings_pt"),
    ('"authorized stocking distributor" welding supply industrial gas', "welding_gas"),
    ('"authorized stocking distributor" pneumatic automation industrial', "pneumatics"),
    ('"authorized stocking distributor" seals gaskets industrial', "seals_gaskets"),
    ('"authorized stocking distributor" abrasives cutting tools', "abrasives"),
    ('"authorized stocking distributor" electric motors drives industrial', "motors_drives"),
    ('"local stocking distributor" industrial MRO supply', "mro"),
    ('"local stocking distributor" hydraulic pneumatic industrial', "hydraulics"),
    ('"stocking distributor" industrial gearboxes speed reducers', "motors_drives"),
    ('"stocking distributor" industrial conveyor components rollers', "material_handling"),
    ('"stocking distributor" industrial valves actuators process', "pumps_valves"),
    ('"stocking distributor" industrial sensors automation controls', "automation"),
    ('"stocking distributor" industrial cutting tools carbide', "cutting_tools"),
    ('"stocking distributor" industrial rigging wire rope slings', "material_handling"),
    ('"stocking distributor" industrial chain sprockets drive', "bearings_pt"),
    ('"stocking distributor" industrial couplings shaft', "bearings_pt"),
    ('"stocking distributor" industrial filtration filters plant', "mro"),
    ('"stocking distributor" industrial pipe valves fittings', "pumps_valves"),
    ('"stocking distributor" industrial hoists cranes lifting', "material_handling"),
    ('"stocking distributor" industrial adhesives sealants MRO', "mro"),
    ('"stocking distributor" industrial batteries chargers material handling', "material_handling"),
    ('"stocking distributor" industrial gas detection safety', "safety_supply"),
    ('"we stock" industrial gearboxes speed reducers distributor', "motors_drives"),
    ('"we stock" industrial couplings shaft distributor', "bearings_pt"),
    ('"we stock" industrial valves actuators distributor process', "pumps_valves"),
    ('"we stock" industrial sensors automation distributor', "automation"),
    ('"we stock" industrial rigging slings hardware distributor', "material_handling"),
    ('"we stock" industrial hose reels couplings distributor', "hose_fittings"),
    ('"we stock" industrial filtration filters distributor plant', "mro"),
    ('"we stock" industrial lubricants greases distributor plant', "lubricants"),
    ('"we stock" industrial safety supplies PPE distributor', "safety_supply"),
    ('"we stock" industrial mechanical seals packing distributor', "seals_gaskets"),
    ('"we stock" industrial chain sprockets distributor drive', "bearings_pt"),
    ('"we stock" industrial compressed air equipment distributor', "compressed_air"),
    ('"we stock over" industrial distributor MRO supply', "mro"),
    ('"we stock thousands" industrial distributor parts MRO', "mro"),
    ('"in stock and ready to ship" industrial distributor MRO', "mro"),
    ('"in stock and ready to ship" hydraulic pneumatic distributor', "hydraulics"),
    ('"in stock and ready to ship" bearings power transmission distributor', "bearings_pt"),
    ('"same day shipping" industrial distributor MRO supply', "mro"),
    ('"same day shipping" hydraulic hose fittings distributor', "hose_fittings"),
    ('"large inventory" industrial distributor MRO plant maintenance', "mro"),
    ('"large inventory" hydraulic pneumatic distributor industrial', "hydraulics"),
    ('"extensive inventory" industrial distributor MRO supply', "mro"),
    ('"extensive inventory" bearings power transmission distributor', "bearings_pt"),
    ('"huge inventory" industrial distributor MRO supply', "mro"),
    ('"our warehouse" industrial distributor MRO stocked supply', "mro"),
    ('"we maintain an inventory" industrial distributor MRO', "mro"),
    ('"maintain a large inventory" industrial distributor supply', "mro"),
    ('"millions in inventory" industrial distributor MRO supply', "mro"),
    ('"square feet of warehouse" industrial distributor MRO supply', "mro"),
    ('"square foot warehouse" industrial distributor hydraulic pneumatic', "hydraulics"),
    ('"ready to ship from stock" industrial distributor MRO', "mro"),
    ('"off the shelf" industrial distributor MRO stocking supply', "mro"),
    ('"deep inventory" industrial distributor MRO supply', "mro"),
    ('"immediate availability" industrial distributor MRO parts', "mro"),
    ('"we inventory" industrial distributor MRO plant maintenance', "mro"),
    ('"inventory on hand" industrial distributor MRO supply', "mro"),
    ('"stocking locations" industrial distributor MRO supply', "mro"),
    ('"stocking locations" hydraulic pneumatic distributor industrial', "hydraulics"),
    ('"branch locations" industrial distributor MRO supply stocking', "mro"),
    ('"distribution centers" industrial distributor MRO stocking supply', "mro"),
    ('"we stock a complete line" industrial distributor', "mro"),
    ('"complete line of" industrial distributor authorized MRO', "mro"),
    ('"complete inventory" industrial distributor hydraulic pneumatic', "hydraulics"),
    ('"stock and distribute" industrial MRO supply', "mro"),
    ('"stock a full line" industrial distributor MRO supply', "mro"),
    ('"largest inventory" industrial distributor MRO supply', "mro"),
    ('"largest inventory" hydraulic hose fittings distributor', "hose_fittings"),
    ('"largest stocking distributor" hydraulic pneumatic fluid power', "hydraulics"),
    ('"largest stocking distributor" bearings power transmission', "bearings_pt"),
    ('"largest stocking distributor" welding supply industrial gas', "welding_gas"),
    ('"one of the largest distributors" industrial MRO supply', "mro"),
    ('"one of the largest distributors" hydraulic pneumatic industrial', "hydraulics"),
    ('"we ship same day" industrial distributor MRO supply', "mro"),
    ('"emergency service" industrial distributor MRO stocking supply', "mro"),
    ('"24 hour service" industrial distributor MRO plant maintenance', "mro"),
    ('"vendor managed inventory" industrial distributor MRO supply', "mro"),
    ('"vendor managed inventory" bearings power transmission distributor', "bearings_pt"),
    ('"integrated supply" industrial distributor MRO plant', "mro"),
    ('"crib management" industrial distributor MRO tool', "mro"),
    ('"kitting and assembly" industrial distributor MRO supply', "mro"),
    ('"hose assembly" industrial distributor stocking hydraulic', "hose_fittings"),
    ('"custom hose assemblies" industrial distributor hydraulic', "hose_fittings"),
    ('"in house machine shop" industrial distributor MRO supply', "mro"),
    ('"repair and rebuild" industrial distributor hydraulic cylinder', "hydraulics"),
    ('"pump repair" industrial distributor stocking process', "pumps_valves"),
    ('"motor repair" industrial distributor stocking electric', "motors_drives"),
]

# NA-TRADE. Trade noun x authorization (wave 3: 12.00 net-new/query). New nouns.
NA_TRADE = [
    ('"gasket distributor" authorized industrial sealing', "seals_gaskets"),
    ('"rigging distributor" authorized industrial lifting', "material_handling"),
    ('"compressor distributor" authorized industrial compressed air', "compressed_air"),
    ('"valve distributor" authorized industrial process piping', "pumps_valves"),
    ('"instrument distributor" authorized industrial process', "instrumentation"),
    ('"electrical distributor" authorized industrial MRO plant', "automation"),
    ('"safety distributor" authorized industrial PPE supply', "safety_supply"),
    ('"lubricant distributor" authorized industrial plant maintenance', "lubricants"),
    ('"filtration distributor" authorized industrial plant', "mro"),
    ('"hydraulic distributor" authorized industrial fluid power', "hydraulics"),
    ('"pneumatic distributor" authorized industrial automation', "pneumatics"),
    ('"bearing and power transmission distributor" authorized industrial', "bearings_pt"),
    ('"mill supply distributor" authorized industrial MRO', "mill_supply"),
    ('"industrial rubber distributor" authorized hose belting', "industrial_rubber"),
    ('"belting distributor" authorized industrial conveyor', "material_handling"),
    ('"chain distributor" authorized industrial roller drive', "bearings_pt"),
    ('"coupling distributor" authorized industrial power transmission', "bearings_pt"),
    ('"gearbox distributor" authorized industrial speed reducer', "motors_drives"),
    ('"hoist distributor" authorized industrial crane lifting', "material_handling"),
    ('"crane distributor" authorized industrial hoist lifting', "material_handling"),
    ('"material handling distributor" authorized industrial conveyor', "material_handling"),
    ('"packaging distributor" authorized industrial equipment supply', "material_handling"),
    ('"welding distributor" authorized industrial gas supply', "welding_gas"),
    ('"cutting tool distributor" authorized industrial carbide', "cutting_tools"),
    ('"metalworking distributor" authorized industrial machine shop', "cutting_tools"),
    ('"machine tool distributor" authorized industrial tooling', "cutting_tools"),
    ('"tooling distributor" authorized industrial machine shop', "cutting_tools"),
    ('"fluid handling distributor" authorized industrial pumps', "pumps_valves"),
    ('"process equipment distributor" authorized industrial', "instrumentation"),
    ('"controls distributor" authorized industrial automation', "automation"),
    ('"sensor distributor" authorized industrial automation', "automation"),
    ('"motion control distributor" authorized industrial automation', "automation"),
    ('"robotics distributor" authorized industrial automation integrator', "automation"),
    ('"pump and valve distributor" authorized industrial process', "pumps_valves"),
    ('"hose and fitting distributor" authorized industrial hydraulic', "hose_fittings"),
    ('"seal distributor" authorized industrial mechanical packing', "seals_gaskets"),
    ('"abrasives distributor" authorized industrial grinding cutting', "abrasives"),
    ('"fastener distributor" authorized industrial anchors', "fasteners"),
    ('"conveyor belting distributor" authorized industrial', "material_handling"),
    ('"industrial hose distributor" authorized fittings couplings', "hose_fittings"),
    ('"industrial bearing distributor" authorized power transmission', "bearings_pt"),
    ('"industrial motor distributor" authorized drives electric', "motors_drives"),
    ('"industrial pump distributor" authorized process valves', "pumps_valves"),
    ('"industrial valve distributor" authorized process actuators', "pumps_valves"),
    ('"industrial automation distributor" authorized sensors controls', "automation"),
    ('"industrial fastener distributor" authorized mill supply', "fasteners"),
    ('"industrial abrasive distributor" authorized grinding', "abrasives"),
    ('"industrial safety distributor" authorized PPE supply', "safety_supply"),
    ('"industrial lubricant distributor" authorized plant maintenance', "lubricants"),
    ('"industrial filtration distributor" authorized plant', "mro"),
    ('"industrial tool distributor" authorized cutting MRO', "cutting_tools"),
    ('"industrial supply distributor" authorized MRO plant maintenance', "mro"),
    ('"industrial parts distributor" authorized MRO plant', "mro"),
    ('"industrial equipment distributor" authorized plant maintenance', "mro"),
    ('"industrial products distributor" authorized MRO supply', "mro"),
    ('"industrial components distributor" authorized MRO', "mro"),
    ('"plant maintenance distributor" authorized industrial supply', "mro"),
    ('"maintenance repair operations distributor" authorized industrial', "mro"),
    ('"fluid power distributor" authorized pneumatic hydraulic stocking', "hydraulics"),
    ('"power transmission distributor" authorized gearbox coupling', "bearings_pt"),
    ('"welding supply distributor" authorized industrial consumables', "welding_gas"),
    ('"gas and welding supply distributor" authorized industrial', "welding_gas"),
    ('"pipe valve fitting distributor" authorized industrial PVF', "pumps_valves"),
    ('"PVF distributor" authorized industrial pipe valves fittings', "pumps_valves"),
    ('"electrical and automation distributor" authorized industrial', "automation"),
    ('"motor and drive distributor" authorized industrial electric', "motors_drives"),
    ('"compressed air distributor" authorized industrial dryers', "compressed_air"),
    ('"vacuum distributor" authorized industrial pumps generators', "pumps_valves"),
    ('"instrumentation distributor" authorized industrial process control', "instrumentation"),
    ('"test and measurement distributor" authorized industrial', "instrumentation"),
    ('"rubber and plastics distributor" authorized industrial sheet', "industrial_rubber"),
    ('"industrial rubber and gasket distributor" authorized', "seals_gaskets"),
    ('"sealing distributor" authorized industrial gaskets packing', "seals_gaskets"),
    ('"lifting and rigging distributor" authorized industrial', "material_handling"),
    ('"storage and handling distributor" authorized industrial rack', "material_handling"),
    ('"conveyor distributor" authorized industrial rollers idlers', "material_handling"),
    ('"industrial distributor" authorized "we represent" MRO plant', "mro"),
    ('"industrial distributor" authorized stocking plant maintenance supply', "mro"),
    ('"industrial wholesaler" authorized distributor MRO supply', "mro"),
    ('"industrial supplier" authorized distributor plant maintenance MRO', "mro"),
]

# NB. The eight Cloudflare-blocked brands, new sub-brands only. Thin family
# (5.21 net-new/query), so it gets 30 queries, not wave 3's 90.
NB_BRAND = [
    ('"authorized Parker distributor" industrial process filtration', "Parker", "mro"),
    ('"authorized Parker distributor" industrial sealing o-rings', "Parker", "seals_gaskets"),
    ('"authorized Parker Chelsea distributor" OR "authorized Parker Denison distributor"', "Parker", "hydraulics"),
    ('"authorized Parker Gold Ring distributor" hydraulic hose', "Parker", "hose_fittings"),
    ('"Parker" "Technology Center" authorized distributor industrial', "Parker", "hydraulics"),
    ('"authorized Gates distributor" industrial fluid power hydraulics', "Gates", "hydraulics"),
    ('"authorized Gates distributor" industrial belts drives sheaves', "Gates", "bearings_pt"),
    ('"Gates" "PowerGrip" OR "Micro-V" authorized distributor industrial', "Gates", "bearings_pt"),
    ('"authorized ESAB distributor" industrial plasma cutting automation', "ESAB", "welding_gas"),
    ('"authorized ESAB distributor" welding filler metals industrial', "ESAB", "welding_gas"),
    ('"ESAB" "Ohio Medical" OR "GCE" authorized distributor industrial gas', "ESAB", "welding_gas"),
    ('"authorized Norton distributor" industrial cut-off wheels flap discs', "Norton", "abrasives"),
    ('"authorized Norton distributor" industrial coated abrasives belts', "Norton", "abrasives"),
    ('"Norton" "Blaze" OR "Rapid Blend" authorized distributor industrial', "Norton", "abrasives"),
    ('"authorized WEG distributor" industrial soft starters panels', "WEG", "automation"),
    ('"authorized WEG distributor" industrial severe duty motors', "WEG", "motors_drives"),
    ('"WEG" "W22" authorized distributor industrial motors', "WEG", "motors_drives"),
    ('"authorized Regal Rexnord distributor" industrial conveyor components', "Regal Rexnord", "material_handling"),
    ('"authorized Rexnord distributor" industrial gear drives bearings', "Regal Rexnord", "bearings_pt"),
    ('"authorized Marathon Electric distributor" OR "authorized Leeson distributor" motors', "Regal Rexnord", "motors_drives"),
    ('"authorized Browning distributor" OR "authorized Sealmaster distributor" power transmission', "Regal Rexnord", "bearings_pt"),
    ('"authorized Dixon distributor" industrial sanitary process fittings', "Dixon", "pumps_valves"),
    ('"authorized Dixon distributor" industrial hose clamps ferrules', "Dixon", "hose_fittings"),
    ('"Dixon" "Bayco" OR "Dixon Norris" authorized distributor industrial', "Dixon", "hose_fittings"),
    ('"authorized ifm distributor" industrial flow level sensors', "ifm", "automation"),
    ('"authorized ifm distributor" industrial vibration monitoring condition', "ifm", "instrumentation"),
    ('"ifm" "moneo" OR "IO-Link" authorized distributor industrial', "ifm", "automation"),
    ('"authorized distributor" Parker Gates ESAB industrial "line card"', "Parker", "mro"),
    ('"authorized distributor" WEG Regal Rexnord industrial motors bearings', "WEG", "motors_drives"),
    ('"authorized distributor" Dixon Norton industrial hose abrasives', "Dixon", "mro"),
]

# GEO. §5k: geographic-DEEP beats national-standard outright, so all 100 run the
# deep ladder. 28 states, 40 metros and 12 regions waves 1-3 never scoped with
# these phrases. Detroit stays off the list (§5e — the most automotive-
# contaminated metro in the country).
GEO_STATES_NEW = [
    "Arizona", "Arkansas", "Colorado", "Connecticut", "Delaware", "Idaho",
    "Iowa", "Kansas", "Louisiana", "Maine", "Maryland", "Massachusetts",
    "Mississippi", "Montana", "Nebraska", "Nevada", "New Hampshire",
    "New Mexico", "North Dakota", "Oklahoma", "Oregon", "Rhode Island",
    "South Dakota", "Utah", "Vermont", "Washington", "West Virginia", "Wyoming",
]
GEO_STATES_REDO = [
    "Ohio", "Texas", "Pennsylvania", "Illinois", "Michigan", "California",
    "Georgia", "Indiana", "Wisconsin", "North Carolina", "Tennessee",
    "New York", "Alabama", "Minnesota", "Missouri", "Kentucky", "Florida",
    "New Jersey", "Virginia", "South Carolina",
]
GEO_METROS_NEW = [
    "Pittsburgh", "Cleveland", "Columbus Ohio", "Cincinnati", "Indianapolis",
    "Milwaukee", "Kansas City", "St. Louis", "Nashville", "Memphis",
    "Birmingham Alabama", "Atlanta", "Charlotte", "Greensboro", "Raleigh",
    "Louisville", "Baton Rouge", "New Orleans", "Houston", "Dallas",
    "Fort Worth", "Denver", "Salt Lake City", "Portland Oregon", "Seattle",
    "Las Vegas", "Tulsa", "Shreveport", "Corpus Christi", "Beaumont Texas",
    "Lafayette Louisiana", "Peoria Illinois", "Davenport Iowa", "Green Bay",
    "Appleton Wisconsin", "Erie Pennsylvania", "Allentown", "Scranton",
    "Syracuse", "Chicago",
]
GEO_REGIONS_NEW = [
    "Piedmont", "Front Range", "Central Valley California", "High Plains",
    "Permian Basin", "Appalachia", "Coastal Bend Texas", "Puget Sound",
    "Mississippi Delta", "Shenandoah Valley", "Mohawk Valley", "Wasatch Front",
]


def build_plan():
    """Groups first, then interleaved round-robin into plan order.

    Interleaving matters more here than it did in wave 3, because wave 4 is
    spend-capped rather than plan-capped: the guard can stop it anywhere. With
    round-robin order, a stop at any point still leaves every axis sampled in
    proportion, so the axis metrics stay readable no matter where it lands.
    """
    cat, decl, stock, trade, nb, geo = [], [], [], [], [], []

    def add(sink, kw, axis, group, desc, cat_slug, state=None, metro=None,
            region=None, brand=None, family=None):
        sink.append({"keyword": kw, "axis": axis, "axis_desc": desc,
                     "axis_group": group, "ladder": "deep",
                     "category": cat_slug, "state": state, "metro": metro,
                     "region": region, "brand_hint": brand,
                     "phrase_family": family})

    # Template-major: every category gets phrasing 1 before any gets phrasing 2.
    for t_i, tpl in enumerate(DECL_TEMPLATES):
        take = NEW_CATEGORIES if t_i < 2 else NEW_CATEGORIES[:30]
        for c, slug in take:
            add(cat, tpl.format(c=c), "NA-CAT", "NA",
                "national: declaration language x industrial category",
                slug, family="declaration_x_category")
    for kw, slug in NA_DECL:
        add(decl, kw, "NA-DECL", "NA",
            "national: declaration phrasings unused in waves 1-3",
            slug, family="declaration")
    for kw, slug in NA_STOCK:
        add(stock, kw, "NA-STOCK", "NA",
            "national: stocking and inventory language", slug, family="stocking")
    for kw, slug in NA_TRADE:
        add(trade, kw, "NA-TRADE", "NA",
            "national: trade noun x authorization language",
            slug, family="trade_noun_declaration")
    for kw, brand, slug in NB_BRAND:
        add(nb, kw, "NB", "NB",
            "national, blocked-brand-specific: new sub-brands only",
            slug, brand=brand, family="brand_declaration")

    for st in GEO_STATES_NEW:
        add(geo, f'"authorized distributor" industrial plant maintenance {st}',
            "GEO-deep", "GEO", "geographic: declaration language x unused state",
            "mro", state=st, family="declaration")
    for st in GEO_STATES_REDO:
        add(geo, f'"we are an authorized distributor" industrial supply {st}',
            "GEO-deep", "GEO",
            "geographic: new declaration phrasing x already-scoped state",
            "mro", state=st, family="declaration")
    for m in GEO_METROS_NEW:
        add(geo, f'"authorized distributor" industrial supply MRO {m}',
            "GEO-deep", "GEO", "geographic: declaration language x unused metro",
            "mro", metro=m, family="declaration")
    for rg in GEO_REGIONS_NEW:
        add(geo, f'"stocking distributor" industrial MRO supply {rg}',
            "GEO-deep", "GEO", "geographic: stocking language x unused region",
            "mro", region=rg, family="stocking")

    groups = [cat, decl, stock, trade, nb, geo]
    total = sum(len(g) for g in groups)
    smallest = min(len(g) for g in groups if g)
    plan, idx = [], [0] * len(groups)
    while len(plan) < total:
        for gi, g in enumerate(groups):
            for _ in range(max(1, round(len(g) / smallest))):
                if idx[gi] < len(g):
                    plan.append(g[idx[gi]])
                    idx[gi] += 1
    return plan


# ==================================================================== FETCHING
def cache_path(kw):
    """Wave 4's cache first, then waves 3, 2 and 1's. A paid response is a paid
    response; re-buying one is the mistake this program made twice on 08-01."""
    key = w3.cache_key(kw)
    p4 = os.path.join(CACHE, key + ".json")
    if os.path.exists(p4):
        return p4, True
    for d in PRIOR_CACHES:
        p = os.path.join(d, key + ".json")
        if os.path.exists(p):
            return p, True
    return p4, False


def run_query(q, spend_so_far):
    """Walk the ladder. `spend_so_far` is a snapshot used only to hard-abort
    mid-ladder; the authoritative running total lives in the caller."""
    path, hit = cache_path(q["keyword"])
    if hit:
        with open(path) as f:
            return q, json.load(f), 0.0, True, None
    spent, last_err = 0.0, None
    for depth, pages in LADDER_DEEP:
        if spend_so_far + spent >= SPEND_ABORT:
            return q, None, spent, False, "SPEND_ABORT before rung"
        payload = {"keyword": q["keyword"], "location_name": "United States",
                   "language_code": "en", "depth": depth,
                   "max_crawl_pages": pages, "device": "desktop"}
        try:
            d = w3.post(payload)
        except Exception as e:
            last_err = f"transport {e!r}"
            time.sleep(5)
            continue
        spent += d.get("cost") or 0.0
        task = (d.get("tasks") or [{}])[0]
        if task.get("status_code") == 20000 and task.get("result"):
            body = {"keyword": q["keyword"], "depth": depth, "pages": pages,
                    "cost": d.get("cost") or 0.0, "rung_spend": round(spent, 5),
                    "task": task}
            with open(os.path.join(CACHE, w3.cache_key(q["keyword"]) + ".json"), "w") as f:
                json.dump(body, f)
            return q, body, spent, False, None
        last_err = f"{task.get('status_code')} {task.get('status_message')}"
        time.sleep(1)
    return q, None, spent, False, last_err


def process_body(q, body, baseline):
    recs, stat = w3.process_body(q, body, baseline)
    for r in recs:
        r["source_wave"] = WAVE
        r["captured"] = CAPTURED
    stat["rung_spend"] = body.get("rung_spend", body.get("cost"))
    return recs, stat


# ================================================================ CHECKPOINTING
CHECKPOINT_EVERY = 25
PART_REC = os.path.join(RAW, f"serp-selfid-wave4-{CAPTURED}.records.partial.jsonl")
PART_STAT = os.path.join(RAW, f"serp-selfid-wave4-{CAPTURED}.qstats.partial.jsonl")
OUT = os.path.join(RAW, f"serp-selfid-wave4-{CAPTURED}.json")


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


def _absorb(path, part_rec, part_stat, kw, doms, dealer):
    """Union one prior wave's keywords and domains in, from its finalized JSON
    AND its partials — §5g's lesson is that a stalled process can leave a
    truncated file over a good one, so reconcile both rather than trusting one."""
    recs = []
    if os.path.exists(path):
        with open(path) as f:
            d = json.load(f)
        kw |= {q["keyword"] for q in d.get("per_query", [])}
        recs += d.get("records", [])
    for p, is_rec in ((part_rec, True), (part_stat, False)):
        if not p or not os.path.exists(p):
            continue
        with open(p) as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    o = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if is_rec:
                    recs.append(o)
                elif o.get("keyword"):
                    kw.add(o["keyword"])
    doms |= {r["domain"] for r in recs if r.get("domain")}
    dealer |= {r["domain"] for r in recs
               if r.get("domain") and r.get("classification") == "dealer_candidate"}


def prior_baseline():
    """Waves 1 + 2 + 3."""
    kw, doms, dealer = set(), set(), set()
    _absorb(WAVE1, None, None, kw, doms, dealer)
    _absorb(WAVE2, w3.WAVE2_REC_PART, w3.WAVE2_STAT_PART, kw, doms, dealer)
    _absorb(WAVE3, WAVE3_REC_PART, WAVE3_STAT_PART, kw, doms, dealer)
    return kw, doms, dealer


def deduped_v7_domains():
    """READ-ONLY. The live list, for the net-new-against-the-list measure. This
    script never writes to `lists/` — another session owns the resolution run."""
    out = set()
    if not os.path.exists(DEDUPED_V7):
        return out
    with open(DEDUPED_V7, newline="", encoding="utf-8", errors="replace") as f:
        for row in csv.DictReader(f):
            d = w3.apex((row.get("domain") or "").strip())
            if d:
                out.add(d)
    return out


def finalize(plan, counts, baseline, prior_dealer, api_cost, bal0, bal1, probe_cost=0.0):
    records, qstats = load_partials()
    for r in records:
        if "declaration_is_negated" not in r:
            r["declaration_is_negated"] = w3.declaration_is_negated(
                r.get("declaration"), r.get("declaration_match"))
    w4_dealer = {r["domain"] for r in records
                 if r["classification"] == "dealer_candidate" and r["domain"]}
    w4_all = {r["domain"] for r in records if r["domain"]}
    net_new = w4_dealer - baseline

    live = deduped_v7_domains()
    net_new_vs_list = w4_dealer - live
    net_new_vs_both = net_new - live

    by_q = {}
    for r in records:
        if r["classification"] == "dealer_candidate" and r["domain"]:
            by_q.setdefault(r["query"], set()).add(r["domain"])
    ran = {s["keyword"] for s in qstats if not s.get("error")}
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

    axes = w3.axis_metrics(plan, records, qstats, baseline)

    decl = [r for r in records if r["declaration"]]
    decl_alt = [r for r in records if r["declaration_alt"]]
    decl_neg = [r for r in decl if r["declaration_is_negated"]]
    decl_doms = {r["domain"] for r in decl
                 if r["classification"] == "dealer_candidate" and r["domain"]}
    decl_doms_nonboiler = {r["domain"] for r in decl
                           if r["classification"] == "dealer_candidate"
                           and r["domain"] and not r["declaration_is_boilerplate"]}
    decl_doms_positive = {r["domain"] for r in decl
                          if r["classification"] == "dealer_candidate"
                          and r["domain"] and not r["declaration_is_negated"]}
    decl_doms_only_negated = decl_doms - decl_doms_positive
    alt_doms = {r["domain"] for r in decl_alt
                if r["classification"] == "dealer_candidate" and r["domain"]}
    any_decl_doms = decl_doms | alt_doms
    usable_decl_doms = decl_doms_positive | alt_doms

    # Which SERP field the sentence came from. Every one of these is
    # SNIPPET-derived: wave 4 ran no page-fetch pass, so page-verbatim is 0 by
    # construction, not by measurement. The upgrade path exists and is unspent —
    # `serp_page_verify.py` took 493 wave-1 domains to 285 page-verbatim
    # declarations and lifted brands-per-page from 0.35 to 2.17 (6.2x).
    by_field = {}
    for r in decl:
        by_field[r["declaration_field"]] = by_field.get(r["declaration_field"], 0) + 1

    nbsp = sum(1 for r in decl if " " in (r["declaration"] or ""))
    allcaps = sum(1 for r in decl
                  if (r["declaration"] or "").strip()
                  and (r["declaration"] or "").upper() == r["declaration"]
                  and len((r["declaration"] or "")) > 12)

    brand_cov = {}
    for fam in w3.BLOCKED_BRAND_FAMILIES:
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

    rungs = {}
    for s in qstats:
        k = f"{s.get('depth')}/{s.get('pages')}" if s.get("depth") else "failed"
        rungs[k] = rungs.get(k, 0) + 1
    auto = sum(1 for r in records if r["auto_truck_signal"])
    served_cost = round(sum(s.get("cost") or 0.0 for s in qstats), 4)
    walk_cost = round(sum(s.get("rung_spend") or 0.0 for s in qstats), 4)

    payload = {
        "source": "serp",
        "source_name": "Dealer self-identification SERP program — WAVE 4 (DataForSEO Google organic)",
        "captured": CAPTURED,
        "wave": WAVE,
        "prior_wave_files": [os.path.basename(p) for p in (WAVE1, WAVE2, WAVE3)],
        "why_this_wave": (
            "REPLENISHMENT + the quotable declaration. §5h rates SERP wave 4+ as "
            "'diminishing; only for replenishment' and that caveat STANDS — the "
            "binding constraint remains qualification throughput, not "
            "acquisition. Artur overrode it on volume grounds 2026-08-04 with "
            "~$3 approved. The defensible yield is the dealer's own quotable "
            "sentence plus a replenishment feed for D-01's weekly retirement of "
            "zero-engagement contacts."),
        "program": {
            "queries_planned": len(plan),
            "queries_issued": len(qstats),
            "queries_completed": sum(1 for s in qstats if not s.get("error")),
            "queries_failed": sum(1 for s in qstats if s.get("error")),
            "axis_counts": counts,
            "ladder": [list(x) for x in LADDER_DEEP],
            "ladder_rung_served": rungs,
            "design_rules_applied": [
                "§5k (the SECOND correction, and the only surviving one): ladder deep FIRST, then prefer the national axis — depth 1.87-2.17x, axis 1.24-1.44x",
                "every query runs the DEEP ladder, geographic included — §5k retired the standard ladder",
                "axis mix national 5:1 over geographic (500/100)",
                "opening rung tuned per §5k's efficiency note: (50,5) inserted between (100,7) and (30,3) after a 10-query control measured 8/10 served at (50,5) on keywords that had FAILED (100,7), and measured DFS billing as per-page-crawled with a flat $0.002 on an errored rung",
                "declaration_x_category weighted heaviest — wave 3's best family on BOTH net-new/query (15.46) and declaration-carrying domains/query (14.93)",
                "catalog-PDF axis KILLED (§5k: 2.20/query, 2 usable declarations — weakest axis in wave 3)",
                "line-card-page phrasings CUT to zero (4.78 net-new/query but 0.43 declaration domains/query — buys domains, not the sentence)",
                "blocked-brand block cut 90 -> 30, new sub-brands only",
                "Gates retail-program term excluded — confirmed dead end (§5b)",
                "every query carries an industrial qualifier; no automotive/truck/fleet/aftermarket vocabulary; Detroit off the metro list (§5e)",
                "declaration text stored BYTE-EXACT as published; declaration_is_negated flagged and never counted into the usable total",
                "axes interleaved round-robin so a spend-capped stop still samples every axis in proportion",
                "NO FOLD-IN: nothing written to lists/ or data/side-pools/",
            ],
            "states_new": GEO_STATES_NEW,
            "metros_new": GEO_METROS_NEW,
            "regions_new": GEO_REGIONS_NEW,
            "blocked_brands": list(w3.BLOCKED_BRAND_FAMILIES),
        },
        "measured": {
            "raw_organic_results": len(records),
            "wave4_dealer_domains_distinct": len(w4_dealer),
            "wave4_all_domains_distinct": len(w4_all),
            "prior_waves_all_domains_distinct": len(baseline),
            "prior_waves_dealer_domains_distinct": len(prior_dealer),
            "net_new_dealer_domains_vs_prior_serp": len(net_new),
            "net_new_rate_vs_prior_serp": round(len(net_new) / max(1, len(w4_dealer)), 4),
            "deduped_v7_domains": len(live),
            "net_new_dealer_domains_vs_deduped_v7": len(net_new_vs_list),
            "net_new_dealer_domains_vs_serp_and_list": len(net_new_vs_both),
            "dealer_domains_per_query": round(len(w4_dealer) / max(1, len(qstats)), 3),
            "net_new_per_query": round(len(net_new) / max(1, len(qstats)), 3),
            "net_new_vs_list_per_query": round(len(net_new_vs_list) / max(1, len(qstats)), 3),
            "union_dealer_domains_all_four_waves": len(prior_dealer | w4_dealer),
            "organic_per_query": round(len(records) / max(1, len(qstats)), 2),
            "saturation_curve_per_50_queries": blocks,
            "axis_metrics": axes,
            "records_with_declaration": len(decl),
            "records_with_declaration_alt": len(decl_alt),
            "records_with_negated_declaration": len(decl_neg),
            "negated_declaration_rate": round(len(decl_neg) / max(1, len(decl)), 4),
            "declaration_source_field": by_field,
            "declaration_page_verbatim": 0,
            "declaration_page_verbatim_note": (
                "0 BY CONSTRUCTION, not by measurement — wave 4 ran no page-fetch "
                "pass. Every declaration here is snippet-derived (see "
                "declaration_source_field). serp_page_verify.py is the unspent "
                "upgrade: on wave 1 it took 493 domains to 285 page-verbatim "
                "declarations and lifted brands-per-page 0.35 -> 2.17."),
            "declarations_containing_nbsp": nbsp,
            "declarations_all_caps": allcaps,
            "dealer_domains_with_declaration": len(decl_doms),
            "dealer_domains_with_declaration_nonboilerplate": len(decl_doms_nonboiler),
            "dealer_domains_with_positive_declaration": len(decl_doms_positive),
            "dealer_domains_only_negated_declaration": len(decl_doms_only_negated),
            "dealer_domains_with_any_declaration": len(any_decl_doms),
            "dealer_domains_with_usable_declaration": len(usable_decl_doms),
            "net_new_domains_with_declaration": len(decl_doms & net_new),
            "net_new_domains_with_declaration_nonboilerplate": len(decl_doms_nonboiler & net_new),
            "net_new_domains_with_positive_declaration": len(decl_doms_positive & net_new),
            "net_new_domains_only_negated_declaration": len(decl_doms_only_negated & net_new),
            "net_new_domains_with_any_declaration": len(any_decl_doms & net_new),
            "net_new_domains_with_usable_declaration": len(usable_decl_doms & net_new),
            "net_new_vs_list_with_usable_declaration": len(usable_decl_doms & net_new_vs_list),
            "blocked_brand_coverage": brand_cov,
            "records_auto_truck_flagged": auto,
            "records_auto_truck_rate": round(auto / max(1, len(records)), 4),
            "dealer_domains_auto_truck_flagged": len(
                {r["domain"] for r in records if r["auto_truck_signal"]
                 and r["classification"] == "dealer_candidate" and r["domain"]}),
        },
        "precision_caveat": (
            "THIS IS A DOMAIN COUNT, NOT A COMPANY COUNT. §5m hand-measured raw "
            "wave-3 SERP precision at 56% across the whole population and 96% "
            "restricted to rank >=30 on the shortlist ranker, with 81.8% of "
            "domains below that cut. The RANKING, not the classifier, is what "
            "keeps aggregators out. Re-run the ICP classifier and the ranker "
            "before treating any of these as prospects."),
        "spend": {
            "hard_cap_usd": SPEND_CAP,
            "issue_guard_usd": SPEND_GUARD,
            "abort_usd": SPEND_ABORT,
            "api_cost_this_session": round(api_cost, 4),
            "rung_calibration_probe": round(probe_cost, 4),
            "session_total_including_probe": round(api_cost + probe_cost, 4),
            "served_rung_cost_only": served_cost,
            "full_ladder_walk_cost": walk_cost,
            "failed_rung_cost": round(walk_cost - served_cost, 4),
            "failed_rung_share": round((walk_cost - served_cost) / max(1e-9, walk_cost), 4),
            "queries_served_from_cache": sum(1 for s in qstats if s.get("cached")),
            "balance_before": bal0,
            "balance_after": bal1,
            "balance_delta": round((bal0 - bal1), 4) if (bal0 and bal1) else None,
        },
        "per_query": qstats,
        "records": records,
    }
    with open(OUT, "w") as f:
        json.dump(payload, f, indent=1)
    m = payload["measured"]
    print(f"\nDONE queries={len(qstats)} organic={m['raw_organic_results']} "
          f"dealer_domains={m['wave4_dealer_domains_distinct']} "
          f"net_new_vs_serp={m['net_new_dealer_domains_vs_prior_serp']} "
          f"net_new_vs_deduped_v7={m['net_new_dealer_domains_vs_deduped_v7']} "
          f"usable_decl_domains={m['dealer_domains_with_usable_declaration']} "
          f"negated={m['records_with_negated_declaration']} "
          f"cost=${api_cost:.4f} -> {OUT}")
    return payload


def main():
    os.makedirs(CACHE, exist_ok=True)
    plan = build_plan()
    finalize_only = "--finalize" in sys.argv
    plan_only = "--plan" in sys.argv
    probe_cost = 0.0
    for a in sys.argv:
        if a.startswith("--probe-cost="):
            probe_cost = float(a.split("=", 1)[1])

    prior_kw, baseline, prior_dealer = prior_baseline()

    # Zero overlap with waves 1-3 is what keeps the net-new arithmetic honest.
    # A collision is DROPPED with a warning rather than aborting the wave, but a
    # plan careless enough to collide on >5% of its keywords is a design bug and
    # does abort.
    dupes = [p["keyword"] for p in plan if p["keyword"] in prior_kw]
    if dupes:
        print(f"WARN — dropping {len(dupes)} keywords that duplicate waves 1-3:")
        for k in dupes[:10]:
            print(f"   {k}")
        if len(dupes) / max(1, len(plan)) > 0.05:
            sys.exit(f"ABORT — {len(dupes)}/{len(plan)} collide with prior waves; fix the plan")
        plan = [p for p in plan if p["keyword"] not in prior_kw]
    seen, internal = set(), []
    for p in plan:
        if p["keyword"] in seen:
            internal.append(p["keyword"])
        seen.add(p["keyword"])
    if internal:
        sys.exit(f"ABORT — duplicate keywords inside the wave-4 plan: {internal[:5]}")

    counts = {}
    for p in plan:
        counts[p["axis"]] = counts.get(p["axis"], 0) + 1

    if plan_only:
        groups = {}
        for p in plan:
            groups[p["axis_group"]] = groups.get(p["axis_group"], 0) + 1
        print(f"plan={len(plan)} axes={counts} groups={groups} ladder=deep-only")
        print(f"baseline: {len(prior_kw)} prior queries, {len(baseline)} prior "
              f"domains, {len(prior_dealer)} prior dealer domains")
        print(f"deduped-v7 domains: {len(deduped_v7_domains())}")
        cached = sum(1 for p in plan if cache_path(p["keyword"])[1])
        print(f"already cached (free): {cached}")
        for p in plan[:8]:
            print(f"   [{p['axis']}] {p['keyword']}")
        return

    if finalize_only:
        finalize(plan, counts, baseline, prior_dealer, 0.0, None, None, probe_cost)
        return

    _, done_stats = load_partials()
    already = {s["keyword"] for s in done_stats}
    todo = [p for p in plan if p["keyword"] not in already]

    print(f"wave 4 program: {len(plan)} queries {counts}", flush=True)
    print(f"baseline (waves 1+2+3): {len(prior_kw)} queries, {len(prior_dealer)} "
          f"dealer domains, {len(baseline)} total domains", flush=True)
    print(f"resume: {len(already)} already checkpointed, {len(todo)} to run", flush=True)
    print(f"SPEND: guard ${SPEND_GUARD:.2f} (stop issuing) / abort "
          f"${SPEND_ABORT:.2f} / hard cap ${SPEND_CAP:.2f}", flush=True)
    if not todo:
        finalize(plan, counts, baseline, prior_dealer, 0.0, None, None, probe_cost)
        return

    bal0 = w3.balance()
    print(f"balance before: {bal0}", flush=True)

    frec = open(PART_REC, "a")
    fstat = open(PART_STAT, "a")
    api_cost, done, t0 = 0.0, 0, time.time()
    seen_dealer, stopped, last_ckpt = set(), None, 0
    it = iter(todo)
    inflight = set()

    def record(fut):
        nonlocal api_cost, done
        q, body, spent, cached, err = fut.result()
        done += 1
        api_cost += spent
        if body is None:
            stat = {k: q[k] for k in ("keyword", "axis", "axis_group", "state",
                                      "metro", "region", "category",
                                      "brand_hint", "phrase_family", "ladder")}
            stat.update({"depth": None, "pages": None, "cost": 0.0,
                         "rung_spend": round(spent, 5), "organic": 0,
                         "dealer_candidates": 0, "net_new_vs_prior": 0,
                         "error": err})
            fstat.write(json.dumps(stat) + "\n")
            print(f"  [{done}/{len(todo)}] ERR {q['keyword'][:58]} :: {err}", flush=True)
        else:
            recs, stat = process_body(q, body, baseline)
            stat["cached"] = cached
            for r in recs:
                frec.write(json.dumps(r) + "\n")
                if r["classification"] == "dealer_candidate" and r["domain"]:
                    seen_dealer.add(r["domain"])
            fstat.write(json.dumps(stat) + "\n")

    try:
        with ThreadPoolExecutor(max_workers=WORKERS) as pool:
            while True:
                # `it is not None` must be tested FIRST: once the plan is
                # exhausted the iterator is retired, and next(None) raises
                # TypeError rather than the StopIteration this would catch.
                while it is not None and len(inflight) < WORKERS and api_cost < SPEND_GUARD:
                    try:
                        inflight.add(pool.submit(run_query, next(it), api_cost))
                    except StopIteration:
                        it = None
                        break
                if not inflight:
                    break
                got, inflight = wait(inflight, return_when=FIRST_COMPLETED)
                for fut in got:
                    record(fut)
                # `wait` returns a BATCH, so `done` can step over any given
                # multiple of 25; checkpoint on elapsed count, not on modulo.
                if done - last_ckpt >= CHECKPOINT_EVERY or (it is None and not inflight):
                    last_ckpt = done
                    frec.flush(); os.fsync(frec.fileno())
                    fstat.flush(); os.fsync(fstat.fileno())
                    print(f"  [ckpt {done}/{len(todo)}] dealer_domains={len(seen_dealer)} "
                          f"net_new={len(seen_dealer - baseline)} "
                          f"SPEND=${api_cost:.4f}/{SPEND_GUARD:.2f} "
                          f"t={time.time()-t0:.0f}s", flush=True)
                if api_cost >= SPEND_GUARD and not stopped:
                    stopped = done
                    print(f"  *** SPEND GUARD ${SPEND_GUARD:.2f} REACHED at "
                          f"${api_cost:.4f} after {done} queries — issuing no more; "
                          f"draining {len(inflight)} in flight", flush=True)
                if it is None and not inflight:
                    break
    finally:
        frec.flush(); os.fsync(frec.fileno()); frec.close()
        fstat.flush(); os.fsync(fstat.fileno()); fstat.close()

    bal1 = w3.balance()
    print(f"balance after: {bal1}  (session API cost ${api_cost:.4f}, "
          f"probe ${probe_cost:.4f}, cap ${SPEND_CAP:.2f})", flush=True)
    if api_cost + probe_cost > SPEND_CAP:
        print("!!! CAP BREACHED — report this prominently", flush=True)
    finalize(plan, counts, baseline, prior_dealer, api_cost, bal0, bal1, probe_cost)


if __name__ == "__main__":
    main()
