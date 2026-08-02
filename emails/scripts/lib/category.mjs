/**
 * category — the DataForSEO `category_ids` vertical axis (build-plan §5f).
 *
 * §5e's lesson, applied to a second source: **capture source-native codes and
 * interpret them late.** Timken's locator carried its own automotive-versus-
 * industrial code the whole time; reading it three stages later decided 2,165
 * markers that neither the published name nor the homepage could read. DFS ships
 * the same kind of evidence at 4.33 codes per record across 1,694 distinct
 * codes, and it is the cheapest filter in the program: it runs offline, over the
 * whole 17,472-domain haul, before anything per-domain is fetched.
 *
 * ## The rule that makes this different from a keyword match
 *
 * §5f: **never seat on a single category code.** Two measured facts force it:
 *
 *   1. The sweep queried 30 industrial categories, so **every returned record
 *      carries at least one core industrial code BY CONSTRUCTION.** That first
 *      code is a query artifact, not evidence. 80.2% of records carry only one.
 *   2. Codes co-occur across verticals. "Brighton Spring Services" matches
 *      `spring_supplier` AND `truck_parts_supplier`; a plumber matches
 *      `pump_supplier`. Presence of a core code proves nothing on its own.
 *
 * So the scorer **discounts the strongest core code by half** and then weighs
 * what is left against the contamination clusters. One `welding_supply_store`
 * and nothing else scores 1.5 — kept, but flagged uncertain and tiered low. A
 * record carrying `pump_supplier` plus `plumber`, `bathroom_remodeler` and
 * `drainage_service` scores 1.5 core against 8 other-trade and routes out.
 *
 * Adjudication mirrors `vertical.mjs` exactly — a rejecting class must clear
 * FLOOR on its own AND beat the core score by MARGIN — so the pipeline has one
 * adjudication rule, not two.
 *
 * ## What the weights mean
 *
 * Weight is how uniquely a code belongs to that trade, never how often it
 * occurs. `hydraulic_equipment_supplier` is worth 3 because nothing else is
 * called that; `industrial_equipment_supplier` is worth 2 because Google hangs
 * it on 9,174 records including rental yards; `wholesaler` is worth 1 because it
 * means nothing at all. The same scale runs on both sides, so a contamination
 * cluster cannot win on volume alone.
 *
 * Codes not listed here score zero. That is 1,600-odd of the 1,694 and it is
 * correct: an unlisted code is not evidence in either direction, and inventing a
 * verdict for it would be exactly the coin-flip disposition §5d refused.
 *
 * Tests: emails/scripts/lib/category.test.mjs
 */

/** A rejecting cluster must clear this on its own — same as `vertical.mjs`. */
export const FLOOR = 5
/**
 * …and beat the core score by this much. **2, not `vertical.mjs`'s 4, and the
 * difference is measured rather than preferred.**
 *
 * The two sides of this comparison are not symmetric. Every DFS record carries a
 * queried core code by construction, so the core side is systematically
 * inflated; the contamination side is not. A margin tuned for name keywords is
 * therefore too permissive here.
 *
 * Measured on the 45,554-row sweep: at MARGIN 4 the axis rejects **5,288** rows;
 * at MARGIN 2, **6,911** (15.2%). A 25-record random sample of the 1,623 rows in
 * the difference read **25/25 correct rejections** — garage-door services
 * carrying `spring_supplier`, well drillers and plumbers carrying
 * `pump_supplier`, crane-rental yards, janitorial houses, farm-equipment dealers
 * and electrical wholesalers. `spring_supplier` on a garage-door company and
 * `pump_supplier` on a plumber are precisely the co-occurrence §5f warned about,
 * and MARGIN 4 was keeping all of them.
 *
 * The other direction was sampled too: what stays kept at margin 0–1.9 with a
 * contamination score ≥6 is Fastenal branches (already caught by the chain
 * blocklist), forklift dealers, and bearing houses that also serve agriculture —
 * genuine borderline cases, kept and flagged `icp_uncertain`, which is the
 * disposition §5d's rule asks for.
 */
export const MARGIN = 2
/**
 * How much of the strongest core code counts. 0.5 = half.
 *
 * §5f's "never seat on a single category code" as arithmetic. At 1.0 a lone
 * queried code would out-score a two-code contamination cluster and seat a
 * plumber; at 0.0 a genuine single-category bearings house would score zero core
 * and lose to any noise at all. Half keeps both failure modes off the table.
 */
export const FIRST_CORE_DISCOUNT = 0.5

/**
 * CORE — industrial distribution. Weight 3 = the code names our trade and
 * essentially nothing else. 2 = industrial but shared with rental yards and
 * contractors. 1 = generic distribution vocabulary.
 */
export const CORE_CODES = {
  // 3 — unambiguous
  hydraulic_equipment_supplier: 3,
  hydraulic_repair_service: 3,
  hydraulic_engineer: 3,
  hose_supplier: 3,
  pneumatic_tools_supplier: 3,
  seal_shop: 3,
  gasket_manufacturer: 3,
  air_compressor_supplier: 3,
  air_compressor_repair_service: 3,
  industrial_vacuum_equipment_supplier: 3,
  spring_supplier: 3,
  bearing_supplier: 3,
  electric_motor_store: 3,
  electric_motor_repair_shop: 3,
  abrasives_supplier: 3,
  tool_wholesaler: 3,
  measuring_instruments_supplier: 3,
  toolroom: 3,
  machine_tool_supplier: 3,
  industrial_spares_and_products_wholesaler: 3,
  welding_supply_store: 3,
  welding_gas_supplier: 3,
  industrial_gas_supplier: 3,
  fastener_supplier: 3,
  screw_supplier: 3,
  industrial_chemicals_wholesaler: 3,
  metal_industry_suppliers: 3,
  industrial_supermarket: 3,
  scale_supplier: 3,
  scale_repair_service: 3,
  material_handling_equipment_supplier: 3,
  pump_supplier: 3,
  water_pump_supplier: 3,
  rubber_products_supplier: 3,
  gas_cylinders_supplier: 3,
  oxygen_equipment_supplier: 3,
  helium_gas_supplier: 3,
  dry_ice_supplier: 3,
  conveyor_belt_supplier: 3,
  automation_company: 3,
  factory_equipment_supplier: 3,
  machinery_parts_manufacturer: 3,
  tool_repair_shop: 3,
  wire_and_cable_supplier: 3,
  air_filter_supplier: 3,
  industrial_engineer: 3,
  bolt_supplier: 3,
  belt_shop: 3,
  // 2 — industrial, but shared
  industrial_equipment_supplier: 2,
  equipment_supplier: 2,
  machine_shop: 2,
  machine_repair_service: 2,
  machine_maintenance: 2,
  metal_fabricator: 2,
  metal_supplier: 2,
  steel_distributor: 2,
  steel_fabricator: 2,
  aluminium_supplier: 2,
  pipe_supplier: 2,
  chemical_wholesaler: 2,
  oil_field_equipment_supplier: 2,
  crane_dealer: 2,
  forklift_dealer: 2,
  generator_shop: 2,
  tool_manufacturer: 2,
  welder: 2,
  engineering_consultant: 2,
  crane_service: 2,
  // 1 — generic distribution vocabulary
  distribution_service: 1,
  wholesaler: 1,
  tool_store: 1,
  warehouse: 1,
  business_to_business_service: 1,
  safety_equipment_supplier: 1,
  vending_machine_supplier: 1,
  repair_service: 1,
  store: 0,
}

/**
 * CONTAMINATION — the four clusters §5f measured, plus the trades §2a already
 * parks. `cluster` is what the report counts; `vertical` is where it routes,
 * in `vertical.mjs`'s vocabulary so `VERTICAL_DISPOSITION` resolves it.
 */
export const CLUSTERS = {
  construction: { vertical: 'other-trade', share: '20.5%' },
  rental: { vertical: 'other-trade', share: '8.3%' },
  propane_hvac: { vertical: 'other-trade', share: '7.2%' },
  auto_truck: { vertical: 'auto-parts', share: '3.8%' },
  electrical: { vertical: 'other-trade', share: null },
  facility_retail: { vertical: 'general-retail', share: null },
  ag: { vertical: 'other-trade', share: null },
  logistics: { vertical: 'other-trade', share: null },
}

/** code → {cluster, weight}. Same 1–3 scale as CORE_CODES. */
export const CONTAM_CODES = {
  // ── construction & building materials — §5f's 20.5%, the largest ──────────
  building_materials_supplier: ['construction', 3],
  building_materials_store: ['construction', 3],
  construction_material_wholesaler: ['construction', 3],
  lumber_store: ['construction', 3],
  roofing_supply_store: ['construction', 3],
  roofing_contractor: ['construction', 3],
  dry_wall_supply_store: ['construction', 3],
  drywall_contractor: ['construction', 3],
  insulation_materials_store: ['construction', 3],
  insulation_contractor: ['construction', 3],
  masonry_supply_store: ['construction', 3],
  masonry_contractor: ['construction', 3],
  millwork_shop: ['construction', 3],
  molding_supplier: ['construction', 3],
  door_supplier: ['construction', 3],
  garage_door_supplier: ['construction', 3],
  window_supplier: ['construction', 3],
  fence_contractor: ['construction', 3],
  flooring_store: ['construction', 3],
  flooring_contractor: ['construction', 3],
  tile_store: ['construction', 3],
  countertop_store: ['construction', 3],
  cabinet_store: ['construction', 3],
  concrete_contractor: ['construction', 3],
  concrete_product_supplier: ['construction', 3],
  sand_and_gravel_supplier: ['construction', 3],
  stone_supplier: ['construction', 3],
  gravel_plant: ['construction', 3],
  siding_contractor: ['construction', 3],
  paving_contractor: ['construction', 3],
  general_contractor: ['construction', 3],
  home_builder: ['construction', 3],
  garage_builder: ['construction', 3],
  deck_builder: ['construction', 3],
  landscaper: ['construction', 3],
  bathroom_remodeler: ['construction', 3],
  kitchen_remodeler: ['construction', 3],
  contractor: ['construction', 2],
  construction_company: ['construction', 2],
  construction_equipment_supplier: ['construction', 2],
  construction_machine_dealer: ['construction', 2],
  finishing_materials_supplier: ['construction', 2],
  home_improvement_store: ['construction', 2],
  paint_store: ['construction', 2],
  glass_and_mirror_shop: ['construction', 2],
  scaffolding_service: ['construction', 2],
  // ── equipment rental — §5f's 8.3% ────────────────────────────────────────
  equipment_rental_agency: ['rental', 3],
  construction_machine_rental_service: ['rental', 3],
  tool_rental_service: ['rental', 3],
  forklift_rental_service: ['rental', 3],
  lawn_equipment_rental_service: ['rental', 3],
  trailer_rental_service: ['rental', 3],
  truck_rental_agency: ['rental', 3],
  crane_rental_agency: ['rental', 3],
  party_equipment_rental_service: ['rental', 3],
  portable_toilet_supplier: ['rental', 3],
  van_rental_agency: ['rental', 3],
  car_rental_agency: ['rental', 3],
  // ── propane / HVAC / plumbing / water — §5f's 7.2% ────────────────────────
  propane_supplier: ['propane_hvac', 3],
  gas_company: ['propane_hvac', 3],
  heating_oil_supplier: ['propane_hvac', 3],
  oil_company: ['propane_hvac', 3],
  heating_equipment_supplier: ['propane_hvac', 3],
  heating_contractor: ['propane_hvac', 3],
  air_conditioning_system_supplier: ['propane_hvac', 3],
  air_conditioning_contractor: ['propane_hvac', 3],
  air_conditioning_repair_service: ['propane_hvac', 3],
  hvac_contractor: ['propane_hvac', 3],
  furnace_repair_service: ['propane_hvac', 3],
  plumbing_supply_store: ['propane_hvac', 3],
  plumber: ['propane_hvac', 3],
  septic_system_service: ['propane_hvac', 3],
  well_drilling_contractor: ['propane_hvac', 3],
  water_treatment_supplier: ['propane_hvac', 2],
  water_filter_supplier: ['propane_hvac', 2],
  water_softening_equipment_supplier: ['propane_hvac', 2],
  water_works_equipment_supplier: ['propane_hvac', 2],
  drainage_service: ['propane_hvac', 2],
  // ── automotive & heavy truck — §5f's 3.8%, §5e's 21.5% in the locator pool ─
  auto_parts_store: ['auto_truck', 3],
  auto_body_parts_supplier: ['auto_truck', 3],
  car_parts_wholesaler: ['auto_truck', 3],
  auto_repair_shop: ['auto_truck', 3],
  auto_body_shop: ['auto_truck', 3],
  auto_machine_shop: ['auto_truck', 3],
  auto_electrical_service: ['auto_truck', 3],
  auto_glass_shop: ['auto_truck', 3],
  auto_spring_shop: ['auto_truck', 3],
  auto_tune_up_service: ['auto_truck', 3],
  auto_accessories_wholesaler: ['auto_truck', 3],
  car_repair_and_maintenance_service: ['auto_truck', 3],
  car_dealer: ['auto_truck', 3],
  used_car_dealer: ['auto_truck', 3],
  car_battery_store: ['auto_truck', 3],
  tire_shop: ['auto_truck', 3],
  brake_shop: ['auto_truck', 3],
  muffler_shop: ['auto_truck', 3],
  radiator_shop: ['auto_truck', 3],
  transmission_shop: ['auto_truck', 3],
  oil_change_service: ['auto_truck', 3],
  wheel_alignment_service: ['auto_truck', 3],
  motorcycle_parts_store: ['auto_truck', 3],
  motorcycle_dealer: ['auto_truck', 3],
  atv_dealer: ['auto_truck', 3],
  rv_dealer: ['auto_truck', 3],
  boat_dealer: ['auto_truck', 3],
  truck_parts_supplier: ['auto_truck', 3],
  truck_repair_shop: ['auto_truck', 3],
  truck_dealer: ['auto_truck', 3],
  truck_accessories_store: ['auto_truck', 3],
  truck_topper_supplier: ['auto_truck', 3],
  camper_shell_supplier: ['auto_truck', 3],
  trailer_dealer: ['auto_truck', 3],
  trailer_supply_store: ['auto_truck', 3],
  trailer_repair_shop: ['auto_truck', 3],
  diesel_engine_repair_service: ['auto_truck', 3],
  small_engine_repair_service: ['auto_truck', 2],
  lawn_mower_repair_service: ['auto_truck', 2],
  // ── electrical & lighting — §2a's ESD division, arriving without a code ───
  electrical_supply_store: ['electrical', 3],
  electrical_wholesaler: ['electrical', 3],
  electrician: ['electrical', 3],
  electrical_installation_service: ['electrical', 3],
  lighting_store: ['electrical', 3],
  lighting_wholesaler: ['electrical', 3],
  lighting_consultant: ['electrical', 3],
  light_bulb_supplier: ['electrical', 3],
  electrical_equipment_supplier: ['electrical', 2],
  // ── facility, jan-san, medical, food service, consumer retail ────────────
  janitorial_equipment_supplier: ['facility_retail', 3],
  cleaning_products_supplier: ['facility_retail', 3],
  vacuum_cleaner_store: ['facility_retail', 3],
  vacuum_cleaning_system_supplier: ['facility_retail', 3],
  restaurant_supply_store: ['facility_retail', 3],
  medical_supply_store: ['facility_retail', 3],
  medical_equipment_supplier: ['facility_retail', 3],
  office_supply_store: ['facility_retail', 3],
  furniture_store: ['facility_retail', 3],
  appliance_store: ['facility_retail', 3],
  sporting_goods_store: ['facility_retail', 3],
  gun_shop: ['facility_retail', 3],
  pawn_shop: ['facility_retail', 3],
  grocery_store: ['facility_retail', 3],
  garden_center: ['facility_retail', 3],
  pet_supply_store: ['facility_retail', 3],
  discount_store: ['facility_retail', 3],
  department_store: ['facility_retail', 3],
  hardware_store: ['facility_retail', 2],
  // ── agriculture ──────────────────────────────────────────────────────────
  farm_equipment_supplier: ['ag', 3],
  farm_equipment_repair_service: ['ag', 3],
  tractor_dealer: ['ag', 3],
  agricultural_service: ['ag', 3],
  irrigation_equipment_supplier: ['ag', 2],
  // ── logistics — a real trade, and the wrong buyer ────────────────────────
  logistics_service: ['logistics', 1],
  trucking_company: ['logistics', 2],
  freight_forwarding_service: ['logistics', 2],
  moving_company: ['logistics', 2],
  courier_service: ['logistics', 2],
}

/**
 * Every source-native category code on a record, however it was carried.
 *
 * `mapDfs` stores them in `line_card[]` prefixed `DFS:` — the same convention
 * `mapAd` uses for divisions — so `vertical.mjs`'s aux-text scorer can skip them
 * (it already skips `AD:`) and this axis can read them cleanly. Post-merge a
 * record can carry codes from several DFS listings; all of them count once.
 *
 * @param {Record<string, any>} record
 * @returns {string[]} distinct codes, lowercase, order preserved
 */
export function categoryCodes(record) {
  const raw = Array.isArray(record?.line_card)
    ? record.line_card
    : String(record?.line_card ?? '').split('|')
  const out = []
  const seen = new Set()
  for (const v of raw) {
    const s = String(v ?? '').trim()
    if (!s.startsWith('DFS:')) continue
    const code = s.slice(4).toLowerCase()
    if (!code || seen.has(code)) continue
    seen.add(code)
    out.push(code)
  }
  return out
}

/**
 * Weigh a record's category codes: core industrial against every contamination
 * cluster.
 *
 * @param {Record<string, any>} record
 * @returns {{
 *   codes: string[], core: number, coreRaw: number, coreCodes: string[],
 *   clusters: Record<string, number>, top: string|null, topScore: number,
 *   vertical: string|null, uncertain: boolean, decisive: boolean, evidence: string
 * }|null} null when the record carries no DFS codes at all — the axis is silent,
 *   not neutral, and `mergeVerdicts` must be able to tell the two apart.
 */
export function classifyCategories(record) {
  const codes = categoryCodes(record)
  if (codes.length === 0) return null

  const coreCodes = []
  const coreWeights = []
  const clusters = {}
  const hits = {}
  for (const c of codes) {
    const w = CORE_CODES[c]
    if (w) {
      coreCodes.push(c)
      coreWeights.push(w)
      continue
    }
    const contam = CONTAM_CODES[c]
    if (!contam) continue
    const [cluster, weight] = contam
    clusters[cluster] = (clusters[cluster] ?? 0) + weight
    ;(hits[cluster] ??= []).push(c)
  }

  const coreRaw = coreWeights.reduce((a, b) => a + b, 0)
  // §5f: the strongest core code is a query artifact, so it counts half.
  const strongest = coreWeights.length ? Math.max(...coreWeights) : 0
  const core = Math.round((coreRaw - strongest * FIRST_CORE_DISCOUNT) * 10) / 10

  let top = null
  let topScore = 0
  for (const [k, v] of Object.entries(clusters)) {
    if (v > topScore) {
      topScore = v
      top = k
    }
  }

  const decisive = Boolean(top) && topScore >= FLOOR && topScore - core >= MARGIN
  return {
    codes,
    core,
    coreRaw,
    coreCodes,
    clusters,
    top,
    topScore,
    vertical: decisive ? CLUSTERS[top].vertical : null,
    /**
     * **Uncertain means the classifier could not decide, not that the evidence
     * is thin.** Those are different facts and conflating them destroys the
     * field: 80.2% of DFS records carry a single core code, so "thin core" would
     * flag 84% of the seated pool and `icp_uncertain` would stop meaning
     * anything. It fires when a contamination cluster cleared FLOOR and lost on
     * MARGIN alone — a genuine coin-flip — or when the record carries category
     * codes and no core evidence at all.
     *
     * Thin-but-unambiguous evidence is handled where it belongs: `core` is a
     * ranking input in `rank.mjs`, so a one-code record sorts low instead of
     * being labelled ambiguous.
     */
    uncertain: !decisive && ((Boolean(top) && topScore >= FLOOR) || core === 0),
    /**
     * The axis positively decided KEEP: corroborating core codes clearing FLOOR,
     * and nothing contesting them. This is what lets a bland published name stop
     * counting against a record — "Acme Supply Co." tells the name axis nothing,
     * but `bearing_supplier` + `hydraulic_equipment_supplier` +
     * `industrial_equipment_supplier` is evidence, and `icp_uncertain` should
     * mean "no axis could decide", not "the name was boring".
     */
    confident: !decisive && core >= FLOOR && !(Boolean(top) && topScore >= FLOOR),
    decisive,
    evidence: top ? `${top}=${topScore} vs core=${core} [${(hits[top] ?? []).slice(0, 4).join(', ')}]` : `core=${core}`,
  }
}
