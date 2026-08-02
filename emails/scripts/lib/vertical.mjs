/**
 * vertical — the ICP axis S3a never ran on the locator half (build-plan §5c.1).
 *
 * **Why this exists.** S3a's ICP filter (`scripts/s3/icp_classify.py`) classified
 * the 1,640 SERP-sourced domains and left every locator- and directory-sourced
 * record alone, on the stated ground that "the seven locator sources are
 * ICP-shaped by construction". Measured, that is false. Timken sells bearings
 * into the automotive and heavy-truck aftermarket as well as into industry, so
 * its dealer file carries 63 Parts Authority branches, 52 NAPA jobbers, 52 MHC
 * Kenworth stores and 49 Rush Truck Centers — all seated, none of them a Catalog
 * AI buyer at any size. Being in a manufacturer's dealer file proves the company
 * buys that manufacturer's parts; it does not prove which trade they sell into.
 *
 * **What it reads.** The published company name, the domain label, the source's
 * own `line_card`/`distributor_type` strings — everything already on the record,
 * no network. The homepage text axis stays where S3a put it, in the Python
 * classifier, and this module is combined with it by the S3c runner
 * ({@link mergeVerdicts}). S3a's rule that **the homepage is the evidence and the
 * SERP snippet is discounted** is preserved: a name verdict never overrides a
 * confident homepage verdict, only a thin one.
 *
 * **Bias, stated once, same as S3a's:** ambiguity keeps the record. A class only
 * wins when it beats the industrial score by {@link MARGIN} *and* clears
 * {@link FLOOR}. Everything else stays `industrial-distributor`, flagged
 * uncertain when the evidence is thin, because a wrong rejection is invisible
 * downstream and a wrong `uncertain` is not.
 *
 * Tests: emails/scripts/lib/vertical.test.mjs
 */

/**
 * The nine classes the S3c brief names, expressed in the `icp_class` vocabulary
 * the contract already carries. `auto-parts` is the brief's "automotive",
 * `general-retail` is its "consumer retail"; `truck-fleet` and `other-trade` are
 * new (see contract.mjs ICP_CLASSES).
 */
export const VERTICALS = [
  'industrial-distributor',
  'auto-parts',
  'truck-fleet',
  'general-retail',
  'other-trade',
  'manufacturer',
  'marketplace',
  'directory',
  'trade-press',
  'job-board',
  'promotional-products',
]

/**
 * Where each class routes. `null` = seated.
 *
 * `other-trade` gets `adjacent-trade`, not `not-a-distributor` — that is S3a's
 * own usage for AD's electrical/plumbing/HVAC divisions (§2a): a real B2B
 * distributor in a trade we do not sell to, parked rather than rejected.
 * Everything else that is not an industrial distributor is `not-a-distributor`.
 */
export const VERTICAL_DISPOSITION = {
  'industrial-distributor': null,
  'auto-parts': 'not-a-distributor',
  'truck-fleet': 'not-a-distributor',
  'general-retail': 'not-a-distributor',
  'other-trade': 'adjacent-trade',
  manufacturer: 'not-a-distributor',
  marketplace: 'not-a-distributor',
  directory: 'not-a-distributor',
  'trade-press': 'not-a-distributor',
  'job-board': 'not-a-distributor',
  'promotional-products': 'not-a-distributor',
}

export const KEEP = 'industrial-distributor'
/** A rejecting class must beat industrial by this much… */
export const MARGIN = 4
/** …and clear this on its own. Both mirror `icp_classify.py`. */
export const FLOOR = 5

/**
 * Weighted name patterns. Weight is how uniquely a phrase belongs to that trade,
 * not how often it occurs — the same rule `icp_classify.py` states for its text
 * signals. Generic distribution words ("supply", "parts", "sales", "center") are
 * deliberately absent from every class: 424 seated names contain "SUPPLY" and it
 * tells you nothing about the trade.
 *
 * The industrial set is not decoration. It is what stops "BRAKE" in "INDUSTRIAL
 * CLUTCH & BRAKE" and "TRANSMISSION" in "POWER TRANSMISSION" from dragging a
 * bearings house into the automotive pool — the margin test is symmetric, so a
 * strong industrial name has to be able to out-score a weak vehicle hit.
 */
export const NAME_SIGNALS = {
  'industrial-distributor': [
    [6, /\bindustrial (?:supply|supplies|distribut|solutions?|products?|sales|technolog|rubber|hose|belting|automation)/],
    // The ampersand form is a real gap: `power transmission` cannot see "Power &
    // Transmission". Worth recording how the one candidate it surfaced turned
    // out — hand-checking the 1,106 Timken category-4 markers the name axis
    // could not read produced exactly one apparent industrial distributor,
    // `powerandtransmission.com`, and its homepage then read "Heavy-Duty Truck
    // Parts; Semi-Truck; trailer parts". The pattern gap was real; the example
    // was not, and the homepage axis is what caught it.
    [6, /\bpower (?:transmission|(?:&|and) transmission)\b/],
    [6, /\bfluid power\b/],
    [6, /\bbearing (?:&|and) drive\b|\bbearings? (?:&|and) (?:power|transmission|supply|industrial)/],
    [5, /\bbearings?\b/],
    [5, /\bhydraulics?\b|\bpneumatics?\b/],
    [5, /\bconveyors?\b|\bmaterial handling\b/],
    [5, /\bsprockets?\b|\bspeed reducers?\b|\bgear (?:box|drive|reducer|works|head)/],
    [4, /\bhose (?:&|and) (?:fitting|supply|rubber|gasket)|\bhose (?:supply|center|tech)\b/],
    [4, /\bseals? (?:&|and) |\bo-?rings?\b|\bgaskets?\b/],
    [4, /\bmro\b|\bmill supply\b|\bmill (?:&|and) (?:mine|industrial)/],
    [4, /\bautomation\b|\bmotion control\b|\bcontrols? (?:&|and) automation\b/],
    [4, /\bprocess (?:equipment|solutions?|systems?)\b/],
    [3, /\bindustrial\b|\bindustries\b/],
    [3, /\bpumps?\b|\bvalves?\b|\bpipe,? valve/],
    [3, /\bcompressors?\b|\bcompressed air\b/],
    [3, /\babrasives?\b|\bcutting tools?\b|\bworkholding\b|\btooling\b/],
    [3, /\bwelding (?:supply|supplies|products?|gas|(?:&|and) )/],
    [3, /\bfasteners?\b|\bbolt (?:&|and) nut\b/],
    [3, /\bmachinery\b|\bmachine works\b|\bmachine (?:&|and) (?:tool|supply)/],
    [2, /\brubber (?:&|and) |\bbelting\b|\bpower (?:&|and) (?:process|fluid)/],
    [2, /\belectric motors?\b|\bmotors? (?:&|and) (?:drives?|controls?)\b/],
  ],

  // ── the two verticals §5c named, and the reason this module exists ─────────
  'auto-parts': [
    [8, /\bauto ?parts\b|\bautomotive parts\b|\bcar parts\b/],
    [8, /\bparts plus\b|\bcarquest\b|\bcar ?quest\b|\bbumper to bumper\b|\bautovalue\b|\bauto value\b/],
    [8, /\bnapa\b|\bautozone\b|\bauto zone\b|\bo'?reilly\b|\badvance auto\b|\bpep boys\b/],
    [8, /\bparts authority\b|\bfederated auto\b|\bpronto\b/],
    [6, /\bauto (?:supply|supplies|electric|clinic|care|cent(?:er|re)s?|works|services?)\b/],
    [6, /\bundercar\b|\bmuffler\b|\bradiators?\b|\bcollision (?:parts|center)\b|\bbody shop\b/],
    [6, /\bautomotive\b/],
    [5, /\bpowersports?\b|\bmotorcycles?\b|\batv\b|\butv\b|\bsnowmobile\b/],
    [5, /\bspeed shop\b|\bperformance parts\b|\bspeed (?:&|and) custom\b/],
    // Bare `auto`, verified by hand: 34 seated names carry it without any of the
    // stronger phrases above, and all 34 are automotive (AUTO SPRING CO, MID
    // NITE AUTO SALES, Tasco Auto Color, AUTO WHEEL & RIM …). It is word-bounded,
    // so it never fires on "automation".
    [5, /\bauto\b/],
    [4, /\btires?\b|\btire (?:&|and) (?:auto|service|wheel)\b/],
    [3, /\bimport parts\b|\bforeign (?:car|auto)\b|\bengine parts\b/],
  ],
  'truck-fleet': [
    [8, /\btruck (?:cent(?:er|re)s?|parts|services?|sales|equipment|supply|supplies|repairs?|(?:&|and) (?:trailer|equipment))\b/],
    [8, /\bkenworth\b|\bpeterbilt\b|\bfreightliner\b|\bwestern star\b|\bmack truck\b|\bhino\b|\bisuzu truck\b/],
    [8, /\btruckpro\b|\bfleetpride\b|\binternational (?:truck|trucks)\b/],
    [7, /\btrailer (?:sales|service|parts|center|centre|repair|supply|(?:&|and) )/],
    [6, /\bheavy duty\b|\bheavy-duty\b|\bhd (?:truck|parts)\b/],
    [6, /\bdiesel (?:service|repair|parts|injection|power|performance|(?:&|and) )/],
    [6, /\btruck (?:transmission|springs?|brake|body|bodies|wash|tire)/],
    [5, /\btrucks?\b/],
    [5, /\btrailers?\b/],
    // All 17 seated names carrying `diesel` are truck/diesel shops (COASTAL
    // DIESEL SERVICE, DISCOUNT DIESEL TRUCK PARTS, DIESEL DEPOT …). Checked by
    // hand, none is an industrial distributor.
    [5, /\bdiesel\b/],
    [4, /\bfleet (?:service|services|parts|supply|supplies|solutions?|maintenance)\b/],
    [4, /\bspring (?:service|brake|(?:&|and) (?:brake|alignment|axle))\b|\baxles?\b/],
    [3, /\bbus (?:parts|sales|service)\b|\bmotor coach\b/],
    [3, /\bbrake (?:&|and) clutch\b|\bclutch (?:&|and) brake\b/],
  ],

  // ── the rest, so above-ceiling and the SERP residue can be split honestly ──
  'general-retail': [
    [8, /\bbass pro\b|\bcabela'?s\b|\bfleet farm\b|\bfarm (?:&|and) fleet\b|\brural king\b/],
    [8, /\btractor supply\b|\bharbor freight\b|\bnorthern tool\b|\bmenards\b|\bhome depot\b/],
    [7, /\bace hardware\b|\btrue value\b|\bdo it best\b|\bhardware (?:store|hank)\b/],
    [6, /\bsporting goods\b|\bhunting (?:&|and) fishing\b|\boutfitters?\b|\bgun (?:shop|store)\b/],
    [5, /\bhome (?:improvement|cent(?:er|re))\b|\bgarden cent(?:er|re)\b|\bnursery\b/],
    [5, /\bpharmac(?:y|ies)\b|\bgrocer(?:y|ies)\b|\bfurniture\b|\bmattress\b/],
    [4, /\bpet (?:supply|supplies|store)\b|\btoys?\b|\bapparel\b|\bfootwear\b|\bjewelry\b/],
  ],
  'other-trade': [
    [8, /\belectric(?:al)? (?:supply|supplies|distribut|wholesal)/],
    [8, /\bplumbing (?:supply|supplies|specialt|(?:&|and) heating)/],
    [8, /\bwaterworks\b|\bgypsum\b|\bdrywall\b|\broofing supply\b|\bsiding supply\b/],
    [7, /\bhvac\b|\bheating (?:&|and) (?:cooling|air)\b|\bheating suppl(?:y|ies)\b|\brefrigeration supply\b/],
    [7, /\blumber\b|\bbuilding (?:suppl|material|product)|\bmillwork\b|\bstucco\b|\bmasonry\b|\binsulation suppl/],
    [7, /\bjanitorial\b|\bsanitary supply\b|\bpaper (?:&|and) (?:packaging|sanitary)\b/],
    [7, /\brestaurant (?:suppl|equipment)|\bfood ?service (?:suppl|equipment)/],
    [7, /\bmedical (?:supply|supplies)\b|\bdental (?:supply|supplies)\b|\bveterinary supply\b/],
    [7, /\bpool (?:supply|supplies|(?:&|and) spa)\b|\blandscape supply\b|\birrigation supply\b/],
    [6, /\bpaint (?:&|and) (?:sundries|wallcover)|\bfloor covering\b|\btile (?:&|and) stone\b/],
    [4, /\belectric supply\b|\bsupply (?:&|and) (?:heating|plumbing|lighting)\b/],
    [4, /\bagricultur(?:e|al)\b|\bagri-?business\b|\bseed (?:&|and) |\bfertilizer\b/],
  ],
  // Deliberately scored BELOW the floor on the name alone. "Mfg. Co." is common
  // in wholesalers' legal names (Rundle-Spence Mfg. Co. is a plumbing
  // wholesaler), and "Manufacturers Representative" is a rep firm, not a
  // manufacturer. S3a's homepage classifier is what decides this class — its
  // whole snippet-discount finding was about manufacturers reading as
  // distributors, and the name is even thinner evidence than a snippet.
  manufacturer: [
    [4, /\bfoundry\b|\bforge\b|\bcastings?\b|\bextrusions?\b|\bstampings?\b/],
    [3, /\bmanufacturing\b|\bmfg\.?\b|\bmanufactur(?:er|ers)\b|\bfabricat(?:ion|ors?)\b/],
  ],
  marketplace: [[6, /\bmarketplace\b|\bauctions?\b|\bliquidat(?:ion|ors?)\b/]],
  directory: [[6, /\bdirector(?:y|ies)\b|\bchamber of commerce\b|\byellow ?pages\b|\bbusiness listings?\b/]],
  'trade-press': [[6, /\bmagazine\b|\bpublishing\b|\bjournal\b|\bgazette\b|\bnews(?:paper|wire)\b/]],
  'job-board': [[6, /\bjob (?:board|search)\b|\bstaffing\b|\brecruit(?:ing|ment)\b|\bcareers?\b/]],
  'promotional-products': [
    [8, /\bpromotional products?\b|\bcorporate gifts?\b|\bswag\b/],
    [6, /\bscreen printing\b|\bembroider(?:y|ed)\b|\bimprinted\b/],
  ],
}

/**
 * Domain-label patterns, weighted lower than a name hit. A label is chosen by
 * the company and is good evidence, but it is one token and it collides
 * (`traction.com` reads as physics, not as NAPA's heavy-duty banner) — so it
 * scores, it does not decide.
 */
export const LABEL_SIGNALS = {
  'auto-parts': [
    // A squashed label has no word boundaries, so every pattern here is anchored
    // or suffixed. Measured on the 4,676-company union, the unanchored versions
    // were wrong three ways: bare `napa` matched `bue-napa-rklibrary`, bare
    // `lumber` matched `p-lumber-ssupplyco` (Plumbers Supply), and a bare `^auto`
    // matched every automationreps / automaticvalve / automationdirect — which
    // are industrial automation houses, the opposite of the intended class.
    [6, /autoparts|^napa|napa$|carquest|oreillyauto|autozone|partsplus|prontonetwork|federatedauto|partsauthority/],
    [4, /^auto(?!mat)|auto$|automotive|undercar|^tire|tire$|tirecenter/],
  ],
  'truck-fleet': [
    [6, /trucks?center|trucksales|truckparts|truckservice|truckpro|freightliner|peterbilt|kenworth|trucks?$/],
    // 5, not 4, and measured: all 176 labels in the union containing `truck` are
    // truck businesses, with no false positive. At 4 the label could never decide
    // alone, and `thetruckpeople.com` (Worldwide Equipment, a truck dealer)
    // stayed seated because its NAME says only "WORLDWIDE EQUIPMENT INC".
    [5, /truck|trailer|diesel|fleet/],
  ],
  'general-retail': [[6, /basspro|cabelas|fleetfarm|tractorsupply|harborfreight|northerntool|acehardware|menards/]],
  'other-trade': [[4, /electricsupply|plumbingsupply|pipesupply|^lumber|lumber$|hvac|gypsum|waterworks|drywall/]],
  'industrial-distributor': [[3, /bearing|hydraulic|pneumatic|industrial|fluidpower|powertransmission|conveyor|mro/]],
}

/**
 * **The source classified its own dealers, and S1 kept the code without reading
 * it.** Every Timken marker carries a `category`, and `mapTimken` already stores
 * it in `tier_raw` — correctly refusing to interpret it, since §1 says a source's
 * tier string stays unmapped until it is validated per source. This is that
 * validation, measured on Timken's 5,002 US markers against the name axis alone:
 *
 * | category | US markers | decided auto/truck | decided industrial |
 * |---|---|---|---|
 * | 4 | 3,184 | **2,056 (95.2% of decided)** | 21 |
 * | 5 | 1,813 | 2 | **745 (98.8% of decided)** |
 * | 6 | 5 | 0 | 2 (aerospace: Wencor, Leki Aviation, Jamaica Bearings) |
 *
 * Category 4 is Timken's automotive and heavy-duty vehicle aftermarket (NAPA
 * AUTO PARTS, FLEETPRIDE, TRACTION, SMYTH AUTOMOTIVE); category 5 is its
 * industrial channel (Applied Industrial, McMaster-Carr, ERIKS, DEXIS). It also
 * decides **2,165 markers the name axis cannot read at all** — "TRACTION-AUGUSTA"
 * and "POLAR SERVICE CENTER" carry no vehicle word and no cached homepage.
 *
 * Within category 4 the split is 1,318 truck to 738 auto among the decided, so an
 * unreadable name in that category is scored toward `truck-fleet`. The name still
 * outranks the prior whenever it says anything at all.
 *
 * Read off the record rather than re-mapped at S1 on purpose: `tier_raw` is
 * carried unmapped by contract, and changing what S1 emits would change every
 * downstream artifact for a field that already holds the answer.
 */
export const SOURCE_VERTICAL_PRIORS = [
  { source: 'timken', code: '4', scores: { 'truck-fleet': 5, 'auto-parts': 4 } },
  { source: 'timken', code: '5', scores: { 'industrial-distributor': 6 } },
  { source: 'timken', code: '6', scores: { 'industrial-distributor': 6 } },
  // S4 (§5f): three of the nine new locators publish the same kind of code, and
  // §5e's instruction was explicit — "carry the Timken lesson into all of them:
  // check whether a source-native code encodes vertical before assuming a source
  // is industrial-only". Each of these was read off the acquired payload, not
  // guessed: NTN 1,852 Industrial vs 614 HD Truck; Banjo 182 Agricultural vs 145
  // Industrial; Kennametal 221 metalworking vs 152 road/grader/snowplow.
  {
    source: 'ntn',
    code: 'categories_raw=HD Truck / Automotive Distributor',
    scores: { 'truck-fleet': 6, 'auto-parts': 4 },
  },
  { source: 'ntn', code: 'categories_raw=Industrial Distributor', scores: { 'industrial-distributor': 6 } },
  { source: 'banjo', code: 'filters_raw=Agricultural', scores: { 'other-trade': 5 } },
  { source: 'banjo', code: 'filters_raw=Industrial', scores: { 'industrial-distributor': 6 } },
  { source: 'kennametal', code: 'industries_raw=metalworking', scores: { 'industrial-distributor': 6 } },
  { source: 'kennametal', code: 'industries_raw=waterjet cutting', scores: { 'industrial-distributor': 6 } },
  { source: 'kennametal', code: 'industries_raw=road rehabilitation', scores: { 'other-trade': 5 } },
  { source: 'kennametal', code: 'industries_raw=grader blades', scores: { 'other-trade': 5 } },
  { source: 'kennametal', code: 'industries_raw=snowplow blades', scores: { 'other-trade': 5 } },
  {
    source: 'kennametal',
    code: 'industries_raw=trenching foundation drilling',
    scores: { 'other-trade': 5 },
  },
  // ── Yaskawa (§5i, the third confirmation) ────────────────────────────────
  // The locator's `groupList` parameter, stored per record as
  // `product_group_code`. Yaskawa's own vocabulary, read off the payload and
  // measured before anything was seated: D09 Industrial AC Drives 139 · D13
  // HVAC Drives 62 · D02 Servo and Motion Controllers 42 · D23 iQpump Drives 19
  // · D33 Medium Voltage Drives 0. **69 of 232 distinct companies (29.7%) are
  // reachable only through D13/D23** — "air distribution enterprises",
  // "automated building concepts", "building controls & services", "gardiner
  // service": building controls and municipal water, not MRO. 151 are ICP-only
  // and 12 carry both, and a company carrying both is KEPT, because
  // `sourcePrior` sums and the industrial weight outranks the adjacent one.
  //
  // `other-trade` (→ `adjacent-trade`), not `not-a-distributor`: these are real
  // B2B distributors in a trade we do not sell to, which is exactly what §2a
  // parks for AD's HVAC and plumbing divisions.
  { source: 'yaskawa', code: 'product_group_code=D09', scores: { 'industrial-distributor': 6 } },
  { source: 'yaskawa', code: 'product_group_code=D02', scores: { 'industrial-distributor': 6 } },
  { source: 'yaskawa', code: 'product_group_code=D33', scores: { 'industrial-distributor': 6 } },
  { source: 'yaskawa', code: 'product_group_code=D13', scores: { 'other-trade': 5 } },
  { source: 'yaskawa', code: 'product_group_code=D23', scores: { 'other-trade': 5 } },
  // mk North America publishes its OWN field staff in the same locator as its
  // reps, flagged. `distinct_companies: 4` on 76 rows is almost entirely mk's
  // own people; the flag is the source telling us so.
  { source: 'mknorthamerica', code: 'is_mk_employee=true', scores: { manufacturer: 6 } },
  // NORD's own type code. `production` is a manufacturing plant, not a dealer.
  { source: 'nord', code: 'type_raw=production', scores: { manufacturer: 5 } },
  { source: 'nord', code: 'type_raw=distribution', scores: { 'industrial-distributor': 4 } },
  { source: 'nord', code: 'type_raw=sales', scores: { 'industrial-distributor': 4 } },
]

// ─────────────────────────────────────────────────────────────────────────────
// The identity axis — whose site is this? (§5c's failure mode, generalized)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * **The gap this closes.** §5c caught SERP snippets rating Swagelok and ESAB as
 * distributors: a maker's own site is *full* of the sentence "authorized
 * distributor", because it is the page listing ITS distributors. The SERP
 * acquirer was given a domain registry to stop that at ingestion
 * (`acquire/serp_selfid*.py`) — and **only the SERP source was ever checked
 * against it.** DFS, the locators, AD and PTDA all publish the manufacturer's
 * own Google-Maps listings, its plants and its district offices, and nothing in
 * S2/S3/S4 looked. That is how nine brand owners reached `shortlist-v1`
 * (`flowserve.com`, `grundfos.com`, `nsk.com`, `smcusa.com`, `atlascopco.com`,
 * `brennaninc.com`, `dornerconveyors.com`, `linde.com`, `rexelusa.com`) — the
 * same error as §5c, arriving by a different road.
 *
 * The fix is an axis, not nine exclusions, and it has TWO rules:
 *
 *   1. {@link DOMAIN_IDENTITY} — the acquirer's own registry, ported verbatim
 *      and applied to every source instead of one. Same evidence, same classes,
 *      no new judgement.
 *   2. {@link brandOwnerDomain} — **list-free.** Every brand in the program's
 *      own `brand_authorized` vocabulary is by definition a manufacturer. A
 *      record whose apex label *is* one of those brands is that manufacturer's
 *      own site. Measured on the 17,960-company seated pool this fires on 51
 *      rows / 39 domains and every one is a maker's own host — and it catches
 *      brand owners that are on no list at all (`gorbel.com`, `garlock.com`,
 *      `walter.com`, `alfagomma.com`, `kuriyama.com`, `sealmaster.net`).
 *
 * Rule 2 is the one that generalizes: it needs no maintenance and it grows
 * automatically as the line-card harvest names more manufacturers.
 */

export const BRAND_OWNER_DOMAINS = [
  '3m.com', '3mcanada.com', 'ab.com', 'abb.com', 'adaptall.com', 'ansell.com', 'arcair.com', 'aro.com',
  'asco.com', 'atlascopco.com', 'baldor.com', 'balluff.com', 'ballymore.com', 'banjocorp.com',
  'bannerengineering.com', 'bimba.com', 'boschrexroth-us.com', 'boschrexroth.com', 'bostongear.com',
  'brennaninc.com', 'browningpt.com', 'castrol.com', 'chesterton.com', 'chevron.com', 'chicagopneumatic.com',
  'clippard.com', 'columbusmckinnon.com', 'conedrive.com', 'continental.com', 'contitech.com', 'crown.com',
  'danfoss.com', 'dixonbayco.com', 'dixonsanitary.com', 'dixonvalve.com', 'dodgeindustrial.com',
  'donaldson.com', 'dornerconveyors.com', 'dupont.com', 'dupontsafety.com', 'eaton.com', 'efector.com',
  'emerson.com', 'enerpac.com', 'esab.com', 'esab.us', 'esabna.com', 'exxonmobil.com', 'falkcorp.com',
  'festo.com', 'flexco.com', 'flexlink.com', 'flowserve.com', 'freudenberg.com', 'fuchs.com', 'garlock.com',
  'gastmfg.com', 'gates.com', 'gates.eu', 'gatescorp.com', 'gatesindustrial.com', 'gatesmectrol.com',
  'gorman-rupp.com', 'graco.com', 'grundfos.com', 'guhring.com', 'harveytool.com', 'henkel.com', 'hilti.com',
  'honeywell.com', 'honeywellsafety.com', 'hydac.com', 'hypertherm.com', 'hyster.com', 'hytrol.com',
  'ifm.com', 'imi-precision.com', 'ingersollrand.com', 'interroll.com', 'iscar.com', 'johncrane.com',
  'kaman.com', 'kamandirect.com', 'kennametal.com', 'keyence.com', 'kimberly-clark.com', 'klueber.com',
  'kopflex.com', 'ksb.com', 'leeson.com', 'legris.com', 'lincolnelectric.com', 'linkbelt.com', 'loctite.com',
  'lovejoy-inc.com', 'marathonelectric.com', 'martinsprocket.com', 'mcgillbearings.com', 'meritabrasives.com',
  'millerwelds.com', 'mitutoyo.com', 'mobil.com', 'msasafety.com', 'new.siemens.com', 'nidec.com', 'nord.com',
  'norgren.com', 'nortonabrasives.com', 'nortonclipper.com', 'nsk.com', 'ntnamericas.com', 'numatics.com',
  'omron.com', 'osgtool.com', 'parker.co.uk', 'parker.com', 'parkerhannifin.com', 'parkerstore.com',
  'pepperl-fuchs.com', 'phoenixcontact.com', 'phstore.parker.com', 'ppg.com', 'promo.parker.com',
  'quincycompressor.com', 'racor.com', 'raymondcorp.com', 'regalrexnord.com', 'rexnord.com',
  'rexnordflattop.com', 'rockwellautomation.com', 'saint-gobain.com', 'sandvik.com', 'sandvikcoromant.com',
  'schaeffler.com', 'schneider-electric.com', 'se.com', 'sealmaster.com', 'seco-tools.com',
  'sew-eurodrive.com', 'sgabrasives.com', 'shell.com', 'sick.com', 'siemens.com', 'skf.com', 'smcusa.com',
  'spxflow.com', 'starrett.com', 'stoody.com', 'stucchi.com', 'sullair.com', 'sunbeltrentals.com',
  'sunsource.com', 'swagelok.com', 'thermal-dynamics.com', 'thomsonlinear.com', 'timken.com',
  'toyotaforklift.com', 'trelleborg.com', 'turck.com', 'tweco.com', 'unitta.com', 'victortechnologies.com',
  'victortechnologies.us', 'viking-pump.com', 'vulcanthreadedproducts.com', 'wago.com', 'walter-tools.com',
  'weg.net', 'wegelectric.com', 'widia.com', 'wika.com', 'wurthindustry.com', 'yaskawa.com',
]

export const MARKETPLACE_DOMAINS = [
  'airgas.com', 'alibaba.com', 'aliexpress.com', 'alignable.com', 'amazon.com', 'angi.com', 'apollo.io',
  'applied.com', 'automationdirect.com', 'bbb.org', 'bdiexpress.com', 'birdeye.com', 'bizapedia.com',
  'bloomberg.com', 'brownbook.net', 'buzzfile.com', 'cementex.com', 'chamberofcommerce.com', 'citysearch.com',
  'corporationwiki.com', 'crunchbase.com', 'cylex.us.com', 'digikey.com', 'dnb.com', 'dxpe.com', 'ebay.com',
  'etsy.com', 'europages.com', 'expertise.com', 'exportersindia.com', 'fastenal.com', 'ferguson.com',
  'fleetpride.com', 'globalindustrial.com', 'globalsources.com', 'globalspec.com', 'grabcad.com',
  'grainger.com', 'homedepot.com', 'hoovers.com', 'hotfrog.com', 'houzz.com', 'indiamart.com',
  'industrynet.com', 'iqsdirectory.com', 'kompass.com', 'leadiq.com', 'linde.com', 'local.com', 'lowes.com',
  'lusha.com', 'macraesbluebook.com', 'made-in-china.com', 'manta.com', 'mapquest.com', 'mcmaster.com',
  'merchantcircle.com', 'motionindustries.com', 'mouser.com', 'mscdirect.com', 'newark.com', 'nextdoor.com',
  'octopart.com', 'opencorporates.com', 'porch.com', 'praxair.com', 'rexelusa.com', 'rocketreach.co',
  'rsdelivers.com', 'signalhire.com', 'storeboard.com', 'superpages.com', 'temu.com', 'thomasnet.com',
  'traceparts.com', 'tradeindia.com', 'trustpilot.com', 'tupalo.com', 'uline.com', 'walmart.com', 'wesco.com',
  'yellowpages.com', 'yelp.com', 'zoominfo.com', 'zoro.com',
]

export const SOCIAL_JOB_DOMAINS = [
  'academia.edu', 'archive.org', 'blogspot.com', 'careerbuilder.com', 'chegg.com', 'coursehero.com',
  'docplayer.net', 'facebook.com', 'garagejournal.com', 'glassdoor.com', 'heavyequipmentforums.com',
  'indeed.com', 'instagram.com', 'issuu.com', 'jobcase.com', 'linkedin.com', 'medium.com', 'monster.com',
  'pdfcoffee.com', 'pinterest.com', 'pirate4x4.com', 'practicalmachinist.com', 'quora.com', 'reddit.com',
  'researchgate.net', 'scribd.com', 'simplyhired.com', 'slideshare.net', 'snagajob.com', 'studylib.net',
  'thefabricator.com', 'tiktok.com', 'tumblr.com', 'twitter.com', 'vimeo.com', 'weldingweb.com',
  'wikipedia.org', 'wordpress.com', 'x.com', 'youtube.com', 'yumpu.com', 'ziprecruiter.com',
]

export const TRADE_PRESS_DOMAINS = [
  '24-7pressrelease.com', 'aednet.org', 'assemblymag.com', 'automationworld.com', 'bing.com',
  'businesswire.com', 'controleng.com', 'ctemag.com', 'designworldonline.com', 'ehstoday.com',
  'einpresswire.com', 'empoweringpumps.com', 'flowcontrolnetwork.com', 'fluidpowerjournal.com',
  'fluidpowerworld.com', 'globenewswire.com', 'google.com', 'hydraulicspneumatics.com', 'ien.com',
  'industrialdistribution.com', 'isapartners.org', 'ishn.com', 'logisticsmgmt.com', 'lubesngreases.com',
  'machinedesign.com', 'machinerylubrication.com', 'manufacturingtomorrow.com', 'materialhandling247.com',
  'mdm.com', 'mhedaonline.org', 'mhlnews.com', 'mmsonline.com', 'moderndistribution.com',
  'modernpumpingtoday.com', 'moldmakingtechnology.com', 'msn.com', 'nahad.org', 'newequipment.com',
  'plantengineering.com', 'powertransmission.com', 'prnewswire.com', 'processingmagazine.com',
  'productionmachining.com', 'prweb.com', 'ptda.org', 'pumpsandsystems.com', 'reliableplant.com',
  'roboticsbusinessreview.com', 'safetyandhealthmagazine.com', 'sdcexec.com', 'supplyht.com',
  'thomaspublishing.com', 'weldingdesign.com', 'yahoo.com',
]

/** apex domain → vertical class. Built once; the four arrays never overlap. */
export const DOMAIN_IDENTITY = new Map([
  ...BRAND_OWNER_DOMAINS.map((d) => [d, 'manufacturer']),
  ...MARKETPLACE_DOMAINS.map((d) => [d, 'marketplace']),
  ...SOCIAL_JOB_DOMAINS.map((d) => [d, 'job-board']),
  ...TRADE_PRESS_DOMAINS.map((d) => [d, 'trade-press']),
])

/**
 * Corporate suffixes a brand owner bolts onto its own label. Stripped ONLY when
 * what remains is an exact brand match, so `smcusa.com` → `smc` resolves and
 * `gatesindustrialsupply.com` never does.
 */
const OWNER_SUFFIXES = [
  'corporation', 'americas', 'america', 'company', 'holdings',
  'group', 'corp', 'usa', 'inc', 'llc', 'ltd', 'na', 'us', 'co',
]
// `industries` was in this list on the first pass and was REMOVED after
// measurement: it is a word distributors use about themselves, not a legal
// suffix a brand owner bolts on. It took `continental-industries.com`
// ("Continental Industries Group") and `allianceindustries.us` off the seated
// list on a stem match against the brands "Continental" and "Alliance". Two
// false positives out of 13 brand-owner hits is not a rate this axis gets to
// carry, and no true positive depended on it.

/**
 * Every manufacturer brand the program has already proven exists, squashed.
 *
 * Built from the records themselves — `brand_authorized[]` is populated by the
 * locators (one brand each, the locator's own) and by the line-card harvest, so
 * this is the union of everything any source told us is a manufacturer. 133
 * distinct brands on the v5 pool. §1 keeps `line_card` OUT of it on purpose:
 * product families are not brands and would poison the vocabulary with
 * "Hydraulics".
 *
 * @param {{record?: Record<string, any>}[]|Record<string, any>[]} rows
 * @returns {Set<string>}
 */
export function buildBrandVocabulary(rows) {
  const vocab = new Set()
  for (const row of rows) {
    const r = row?.record ?? row
    const raw = r?.brand_authorized
    const parts = Array.isArray(raw) ? raw : String(raw ?? '').split('|')
    for (const b of parts) {
      const s = squashLabel(b)
      // Two characters is a coincidence, not a brand — `3M` would match any
      // domain label `3m*`. Three is where the measured false-positive rate
      // went to zero on the v5 pool.
      if (s.length >= 3) vocab.add(s)
    }
  }
  return vocab
}

const squashLabel = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')

/**
 * Is this record sitting on a manufacturer's OWN apex domain?
 *
 * @param {Record<string, any>} record
 * @param {Set<string>} brandVocab from {@link buildBrandVocabulary}
 * @returns {string|null} the brand matched, or null
 */
export function brandOwnerDomain(record, brandVocab) {
  if (!brandVocab || !brandVocab.size) return null
  const label = squashLabel(String(record?.domain ?? '').split('.')[0])
  if (label.length < 3) return null
  if (brandVocab.has(label)) return label
  for (const suf of OWNER_SUFFIXES) {
    if (!label.endsWith(suf)) continue
    const stem = label.slice(0, -suf.length)
    if (stem.length >= 3 && brandVocab.has(stem)) return stem
  }
  return null
}

/**
 * The identity verdict for one record. Silent (`null`) unless the domain is
 * positively identified, so a record with no domain — every Segment W row — is
 * untouched.
 *
 * @param {Record<string, any>} record
 * @param {Set<string>} [brandVocab]
 * @returns {{vertical: string, decisive: true, evidence: string, rule: string}|null}
 */
export function classifyIdentity(record, brandVocab = null) {
  const domain = String(record?.domain ?? '').toLowerCase()
  if (!domain) return null
  const listed = DOMAIN_IDENTITY.get(domain)
  if (listed) return { vertical: listed, decisive: true, evidence: `${domain} is a known ${listed} host`, rule: 'registry' }
  const brand = brandOwnerDomain(record, brandVocab)
  if (brand)
    return {
      vertical: 'manufacturer',
      decisive: true,
      evidence: `apex label matches the manufacturer brand "${brand}"`,
      rule: 'brand-owner',
    }
  return null
}

/**
 * The vertical the SOURCE itself declared for this record, as per-class points.
 *
 * @param {Record<string, any>} record
 * @returns {{scores: Record<string, number>, hits: string[]}}
 */
export function sourcePrior(record) {
  const sources = new Set(String(record.source ?? '').split('|'))
  // `;` joins the nine locators' `field=value` code tokens; `|` and `,` are what
  // the earlier sources and the cross-source merge use. Splitting on all three
  // is what lets a code arrive as a token rather than glued to its neighbours.
  const codes = new Set(
    String(record.tier_raw ?? '')
      .split(/[|,;]/)
      .map((s) => s.trim()),
  )
  const scores = {}
  const hits = []
  for (const p of SOURCE_VERTICAL_PRIORS) {
    if (!sources.has(p.source) || !codes.has(p.code)) continue
    hits.push(`${p.source} category ${p.code}`)
    for (const [k, v] of Object.entries(p.scores)) scores[k] = (scores[k] ?? 0) + v
  }
  return { scores, hits }
}

const RE_WS = /\s+/g

/** Lowercased, punctuation-normalized name — `&` kept, it is a real token here. */
export function nameText(record) {
  return [record.company_display, record.company]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9&'\s-]/g, ' ')
    .replace(RE_WS, ' ')
    .trim()
}

/** The domain's first label, squashed — `rush-truck.com` → `rushtruck`. */
export function domainLabel(domain) {
  if (!domain) return ''
  return String(domain).toLowerCase().split('.')[0].replace(/[^a-z0-9]/g, '')
}

/**
 * Score one record's own text (name + domain label + the source's line-card and
 * type strings) against every class.
 *
 * @param {Record<string, any>} record
 * @returns {{scores: Record<string, number>, hits: Record<string, string[]>}}
 */
export function scoreRecord(record) {
  const name = nameText(record)
  const label = domainLabel(record.domain)
  // The source's own category strings are secondary evidence — Enerpac's product
  // families, SPX's segments, Dorner's markets.
  //
  // **AD's divisions are excluded on purpose.** 464 seated rows carry an `AD:`
  // line card, and §2a already spent those: `classifyAd` seats a company when any
  // of its divisions is ICP-shaped and parks it `adjacent-trade` when none is.
  // Reading `AD:PLBG Plumbing` again here would re-decide that on the same data —
  // and `AD:GSD Gypsum Supply` is a division the plan deliberately leaves
  // UNDECIDED, so routing on it would be a plan change, not a measurement.
  //
  // **DFS category codes are excluded for the same reason**, plus a sharper one:
  // they are scored properly by `category.mjs`, which weighs core codes against
  // contamination clusters and discounts the query artifact. Letting them also
  // leak into this aux string would count the same evidence twice, on a rule
  // (substring match at 0.4×) that ignores everything §5f measured.
  const aux = [record.line_card, record.distributor_type, record.tier_raw]
    .flatMap((v) => (Array.isArray(v) ? v : String(v ?? '').split('|')))
    .filter((v) => v && !String(v).startsWith('AD:') && !String(v).startsWith('DFS:'))
    .join(' ')
    .toLowerCase()

  const prior = sourcePrior(record)
  const scores = {}
  const hits = {}
  for (const cls of VERTICALS) {
    let total = prior.scores[cls] ?? 0
    const h = prior.scores[cls] ? [...prior.hits] : []
    for (const [w, rx] of NAME_SIGNALS[cls] ?? []) {
      const m = rx.exec(name)
      if (m) {
        total += w
        h.push(m[0])
        continue
      }
      // The line card is a category string, not a claim about the business, so
      // it is discounted the way S3a discounts the SERP snippet.
      const a = rx.exec(aux)
      if (a) {
        total += w * 0.4
        h.push(a[0])
      }
    }
    for (const [w, rx] of LABEL_SIGNALS[cls] ?? []) {
      const m = rx.exec(label)
      if (m) {
        total += w
        h.push(m[0])
      }
    }
    scores[cls] = Math.round(total * 10) / 10
    hits[cls] = h
  }
  return { scores, hits }
}

/**
 * The verdict from a record's own text. Same shape and same conservatism as
 * `icp_classify.classify` — a rival wins only on FLOOR + MARGIN.
 *
 * @param {Record<string, any>} record
 * @returns {{vertical: string, uncertain: boolean, decisive: boolean, scores: Record<string, number>, evidence: string}}
 */
export function classifyName(record) {
  const { scores, hits } = scoreRecord(record)
  const keep = scores[KEEP] ?? 0
  let topK = null
  let topV = -1
  for (const [k, v] of Object.entries(scores)) {
    if (k === KEEP) continue
    if (v > topV) {
      topV = v
      topK = k
    }
  }
  if (topV >= FLOOR && topV - keep >= MARGIN) {
    return {
      vertical: topK,
      uncertain: false,
      decisive: true,
      scores,
      evidence: hits[topK].slice(0, 4).join('; '),
    }
  }
  const uncertain = keep < 3 || (topV >= FLOOR && topV - keep >= 1)
  return {
    vertical: KEEP,
    uncertain,
    decisive: keep >= FLOOR && keep - topV >= MARGIN,
    scores,
    evidence: hits[KEEP].slice(0, 4).join('; '),
  }
}

/**
 * The domain's verdict, voted by everyone sitting on it.
 *
 * **Why a vote and not a blocklist.** §5c's problem is domains carrying dozens of
 * differently-named rows. Hard-coding `napaonline.com` would fix that one domain
 * and teach the pipeline nothing; counting what its 52 occupants call themselves
 * ("GILBERT AUTO PARTS", "NAPA SOLON SPRINGS", "MARSHALL AUTO PARTS") is the same
 * answer, measured, and it generalizes to the next locator. It also carries the
 * uninformative rows: "H & H HEAVY DUTY" is unreadable alone and obvious once you
 * see the fifteen "PARTS PLUS" stores it shares `acipartsplus.com` with.
 *
 * Only decisive per-record verdicts vote. A domain needs an outright majority of
 * the votes cast and at least two of them, so one mislabelled row can never
 * relabel a domain.
 *
 * @param {Record<string, any>[]} records every record on one domain
 * @returns {{vertical: string, votes: number, cast: number, of: number}|null}
 */
export function voteDomain(records) {
  const tally = new Map()
  let cast = 0
  for (const r of records) {
    const v = classifyName(r)
    if (!v.decisive || v.vertical === KEEP) continue
    tally.set(v.vertical, (tally.get(v.vertical) ?? 0) + 1)
    cast++
  }
  if (cast < 2) return null
  const [vertical, votes] = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]
  if (votes * 2 <= cast) return null
  return { vertical, votes, cast, of: records.length }
}

/**
 * Combine the three axes into one verdict per record.
 *
 *   1. the record's own decisive name verdict, for a rejecting class
 *   2. a confident homepage verdict (the Python classifier, `uncertain: false`)
 *   3. the domain's vote, for rows whose own name says nothing
 *   4. a thin homepage verdict, flagged uncertain
 *   5. otherwise keep, flagged uncertain when nothing scored
 *
 * **Why the name outranks the homepage here, when S3a made the homepage the
 * evidence.** S3a was classifying one company per domain, so "the site" and "the
 * company" were the same thing. §5c's population is the opposite case: 63 Parts
 * Authority branches share one homepage, and 49 Rush Truck Centers share
 * another. The homepage is per-DOMAIN evidence; the published name is per-RECORD
 * evidence, and it is the record that gets a disposition. S3a's actual finding —
 * that our own query language contaminated the SERP snippet — is preserved: the
 * snippet is still discounted 0.4× inside the Python classifier, and a homepage
 * verdict still beats a name that says nothing.
 *
 * **S4 adds a fourth axis, and it goes first: the source's own category codes.**
 * §5e's finding was that a source-native vertical code decided 2,165 Timken
 * markers that neither the name nor the homepage could read, and that the only
 * reason it could be read at all was that S2 carried it unmapped. DFS ships the
 * same kind of evidence — 4.33 codes per record, weighed in `category.mjs` with
 * §5f's single-code rule built in — so when it is decisive it outranks a name.
 * It is silent (`null`) for every record that carries no DFS codes, which is
 * every locator- and SERP-sourced record, so S3c's behaviour is unchanged.
 *
 * **S4's fold-in adds a fifth axis, and it goes FIRST: whose site is this.**
 * A record sitting on `flowserve.com` is Flowserve, whatever the DFS listing
 * calls it and whatever category codes it carries — the domain is the thing we
 * would mail, so the domain settles it. See {@link classifyIdentity}. This is
 * §5c's snippet finding applied to every source instead of only the SERP one.
 *
 * @param {{name: ReturnType<typeof classifyName>, text?: {icp_class: string, icp_uncertain: boolean, evidence?: string}|null, domain?: {vertical: string, votes: number, cast: number}|null, category?: {vertical: string|null, decisive: boolean, uncertain: boolean, evidence: string}|null, identity?: ReturnType<typeof classifyIdentity>}} axes
 * @returns {{vertical: string, uncertain: boolean, axis: string, evidence: string}}
 */
export function mergeVerdicts({ name, text = null, domain = null, category = null, identity = null }) {
  const t = text && VERTICALS.includes(text.icp_class) ? text : null
  if (identity && identity.vertical !== KEEP)
    return { vertical: identity.vertical, uncertain: false, axis: 'identity', evidence: identity.evidence }
  if (category && category.decisive && category.vertical && category.vertical !== KEEP)
    return { vertical: category.vertical, uncertain: false, axis: 'category', evidence: category.evidence }
  if (name.decisive && name.vertical !== KEEP)
    return { vertical: name.vertical, uncertain: false, axis: 'name', evidence: name.evidence }
  if (t && !t.icp_uncertain && t.icp_class !== KEEP)
    return { vertical: t.icp_class, uncertain: false, axis: 'homepage', evidence: t.evidence ?? '' }
  if (domain && domain.vertical !== KEEP)
    return {
      vertical: domain.vertical,
      uncertain: false,
      axis: 'domain-vote',
      evidence: `${domain.votes}/${domain.cast} rows on this domain`,
    }
  if (t && t.icp_class !== KEEP)
    return { vertical: t.icp_class, uncertain: true, axis: 'homepage-thin', evidence: t.evidence ?? '' }
  // `uncertain` means NO AXIS COULD DECIDE. A confident category verdict clears
  // it the same way a confident homepage does: "Acme Supply Co." tells the name
  // axis nothing, and a bland name is not a reason to doubt a record whose
  // source published three corroborating industrial codes.
  const uncertain =
    (name.uncertain || Boolean(category?.uncertain)) && !(t && !t.icp_uncertain) && !category?.confident
  if (category && !name.decisive && category.core > 0)
    return { vertical: KEEP, uncertain, axis: 'category', evidence: category.evidence }
  return { vertical: KEEP, uncertain, axis: name.decisive ? 'name' : 'default', evidence: name.evidence }
}
