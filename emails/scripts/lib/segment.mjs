/**
 * segment + tier — build-plan §5's S4 spec, the last thing the pipeline decides.
 *
 * §5 names four segments and five tiers and defines neither in code. This file
 * is that definition, and every weight in it traces to a field the build already
 * captured verbatim rather than to a judgement made here:
 *
 *   `line_card[]`        carries the SOURCE'S OWN taxonomy, three vocabularies
 *                        deep — `AD:BPT Bearings & Power Transmission`,
 *                        `PTDA:BELT & CHAIN DRIVES`, `DFS:bearing_supplier`.
 *                        §5e's standing rule ("capture source-native codes,
 *                        interpret them late") is what makes this possible: the
 *                        codes were never mapped, so they are still readable.
 *   `distributor_type`   the same taxonomy in English, comma-joined post-merge.
 *   `brand_authorized[]` a manufacturer is a segment statement — Enerpac is
 *                        fluid power, Timken is bearings. Locator-published or
 *                        harvested from the dealer's own line-card page.
 *   `source`             a locator only lists dealers of its own product class.
 *   the published name   weakest axis and deliberately last: "supply" appears in
 *                        424 seated names and tells you nothing (§5c).
 *
 * **C is the residual, not a class.** §4.3's "general MRO needs ≥1,000 SKUs" is
 * NOT applied — §5d measured the SKU estimator at precision 0.60 with 54%
 * unknown and errors biased toward dropping real prospects, and ruled it a
 * tiering input rather than a gate. A company that is neither decisively A nor
 * decisively B is C, at whatever SKU depth it has.
 *
 * **W is a disposition, not a score.** Segment W is `disposition: no-website`,
 * decided in S3 by four failed domain-resolution routes. It is parked, never
 * sent (GATE-L2), and it is set here only so the column is populated.
 *
 * Tests: emails/scripts/lib/segment.test.mjs
 */
import { split } from './contract.mjs'

/**
 * Per-axis caps. A record listing eleven `PTDA:` categories is not eleven times
 * more bearings-shaped than one listing two — it is a PTDA member. Capping each
 * axis stops one verbose source out-shouting four corroborating ones.
 */
export const AXIS_CAP = 6

/** The winner needs this on its own… */
export const SEGMENT_FLOOR = 4
/** …and this much more than the loser. Mirrors `category.mjs`'s FLOOR/MARGIN. */
export const SEGMENT_MARGIN = 2

/**
 * DFS `category_ids` codes, and the same strings `distributor_type` publishes in
 * English. Weight 3 = the code names the segment and essentially nothing else;
 * 2 = it belongs to the segment but is shared with the other one or with C.
 */
export const CODE_SEGMENT = {
  // ── A — fluid power, hydraulics, pneumatics, sealing, air, pumps ─────────
  hydraulic_equipment_supplier: ['A', 3],
  hydraulic_repair_service: ['A', 3],
  hydraulic_engineer: ['A', 3],
  pneumatic_tools_supplier: ['A', 3],
  hose_supplier: ['A', 3],
  seal_shop: ['A', 3],
  gasket_manufacturer: ['A', 2],
  air_compressor_supplier: ['A', 3],
  air_compressor_repair_service: ['A', 3],
  industrial_vacuum_equipment_supplier: ['A', 2],
  pump_supplier: ['A', 3],
  water_pump_supplier: ['A', 2],
  rubber_products_supplier: ['A', 2],
  oil_field_equipment_supplier: ['A', 1],
  // ── B — bearings, power transmission, drives, motors, conveyors ──────────
  bearing_supplier: ['B', 3],
  belt_shop: ['B', 3],
  conveyor_belt_supplier: ['B', 3],
  electric_motor_store: ['B', 3],
  electric_motor_repair_shop: ['B', 3],
  automation_company: ['B', 1],
  machinery_parts_manufacturer: ['B', 1],
}

/**
 * The association taxonomies, read as published. AD's divisions are §2a's; the
 * PTDA categories are the fourteen §5b measured at a mean of 8.4 per member.
 */
export const LINE_CARD_SEGMENT = [
  [/^AD:BPT\b/i, 'B', 3],
  [/^AD:PVF\b/i, 'A', 2],
  [/^PTDA:(BEARINGS|BELT & CHAIN DRIVES|GEARING|MOTORS|SHAFT COUPLINGS|CLUTCHES & BRAKES|ADJUSTABLE\/VARIABLE SPEED DRIVES|MOTOR\/MOTION CONTROL|LINEAR MOTION|CONVEYORS)/i, 'B', 2],
  [/^PTDA:(HYDRAULICS & PNEUMATICS|PUMPS)/i, 'A', 2],
  // The locators' own product families, published per dealer (§1: `line_card`
  // is NOT `brand_authorized` and never counts as a brand).
  [/^Industrial Tools$|^Workholding Tools$|^Cylinders?$|^Pumps?$/i, 'A', 1],
  [/^Conveyors?$|^Chain$|^Couplings$/i, 'B', 1],
]

/**
 * A manufacturer names its own segment. Two-word brands are matched whole, so
 * "Gates" (belts AND hose) is deliberately absent from both sets — it would
 * vote in whichever direction it was placed and it belongs in neither.
 */
export const BRAND_SEGMENT = new Map(
  [
    ['A', [
      'enerpac', 'parker', 'spx flow', 'graco', 'gast', 'bimba', 'norgren', 'wika', 'alfagomma',
      'kuriyama', 'dixon', 'aeroquip', 'char-lynn', 'brennan', 'adaptall', 'sun hydraulics',
      'vickers', 'denison', 'hydac', 'bosch rexroth', 'atlas copco', 'ingersoll rand',
      'gardner denver', 'sullair', 'kaeser', 'chicago pneumatic', 'quincy', 'grundfos', 'goulds',
      'gorman-rupp', 'viking', 'warren rupp', 'xylem', 'pentair', 'val-matic', 'flowserve',
      'banjo', 'garlock', 'swagelok', 'smc', 'festo', 'numatics', 'nordson', 'alfa laval',
    ]],
    ['B', [
      'timken', 'skf', 'nsk', 'ntn', 'dodge', 'baldor', 'browning', 'martin', 'regal rexnord',
      'rexnord', 'sealmaster', 'leeson', 'bando', 'boston gear', 'lovejoy', 'nord', 'sumitomo',
      'weg', 'yaskawa', 'dorner', 'interroll', 'habasit', 'optibelt', 'fenner', "tb wood's",
      'morse', 'ramsey', 'koyo', 'fag', 'ina', 'schaeffler', 'moog', 'shuster', 'flexlink',
      'gates unitta', 'grainger bearing',
    ]],
  ].flatMap(([seg, names]) => names.map((n) => [n, seg])),
)

/**
 * Name tokens. Last axis and weakest by design — §5c measured that a published
 * name is the one axis a wrong-vertical record most easily fakes.
 */
export const NAME_SEGMENT = [
  [/\bhydraulic/i, 'A', 3],
  [/\bfluid power\b/i, 'A', 3],
  [/\bpneumatic/i, 'A', 3],
  [/\bhose\b/i, 'A', 2],
  [/\bseal(s|ing)?\b/i, 'A', 2],
  [/\bgasket/i, 'A', 2],
  [/\bcompress(or|ed air)/i, 'A', 2],
  [/\bpump/i, 'A', 2],
  [/\bvalve/i, 'A', 1],
  [/\bcylinder/i, 'A', 1],
  [/\bbearing/i, 'B', 3],
  [/\bpower transmission\b/i, 'B', 3],
  [/\bsprocket|\bgear(ing|box)?\b/i, 'B', 2],
  [/\bconveyor/i, 'B', 2],
  [/\belectric motor|\bmotor (service|repair|shop)/i, 'B', 2],
  [/\bdrives?\b/i, 'B', 1],
  [/\bbelt(ing|s)?\b/i, 'B', 1],
]

/** A locator lists dealers of its own product class, and nothing else. */
export const SOURCE_SEGMENT = {
  enerpac: ['A', 3],
  spxflow: ['A', 3],
  quincy: ['A', 3],
  gast: ['A', 3],
  banjo: ['A', 3],
  atlascopco: ['A', 2],
  timken: ['B', 3],
  ptda: ['B', 3],
  ntn: ['B', 3],
  lovejoy: ['B', 3],
  nord: ['B', 3],
  dorner: ['B', 2],
  interroll: ['B', 2],
  flexlink: ['B', 2],
  mknorthamerica: ['B', 2],
  yaskawa: ['B', 2],
  // `ad`, `dfs`, `serp`, `ballymore` (ladders) and `kennametal` (cutting tools)
  // carry no segment of their own — `ad` votes through its division token.
}

/** `Hydraulic equipment supplier` → `hydraulic_equipment_supplier`. */
export function typeToCode(s) {
  return String(s ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function bump(scores, seg, points, cap, used) {
  const spent = used.get(seg) ?? 0
  if (spent >= cap) return
  const give = Math.min(points, cap - spent)
  scores[seg] += give
  used.set(seg, spent + give)
}

/**
 * Score one company into §5's A / B / C.
 *
 * @param {Record<string, any>} record a merged contract record
 * @returns {{segment: 'A'|'B'|'C', scores: {A: number, B: number}, evidence: string[]}}
 */
export function segmentScores(record) {
  const scores = { A: 0, B: 0 }
  const evidence = []

  // 1. line_card — the source's own taxonomy, three vocabularies deep.
  {
    const used = new Map()
    for (const token of split(record.line_card)) {
      if (token.startsWith('DFS:')) {
        const hit = CODE_SEGMENT[token.slice(4)]
        if (hit) {
          bump(scores, hit[0], hit[1], AXIS_CAP, used)
          evidence.push(`${token}→${hit[0]}+${hit[1]}`)
        }
        continue
      }
      for (const [rx, seg, pts] of LINE_CARD_SEGMENT) {
        if (!rx.test(token)) continue
        bump(scores, seg, pts, AXIS_CAP, used)
        evidence.push(`${token}→${seg}+${pts}`)
        break
      }
    }
  }

  // 2. distributor_type — the same taxonomy in English, comma-joined post-merge.
  {
    const used = new Map()
    for (const part of String(record.distributor_type ?? '').split(',')) {
      const hit = CODE_SEGMENT[typeToCode(part)]
      if (!hit) continue
      bump(scores, hit[0], hit[1], AXIS_CAP, used)
      evidence.push(`type:${part.trim()}→${hit[0]}+${hit[1]}`)
    }
  }

  // 3. brand_authorized — a manufacturer names its own segment.
  {
    const used = new Map()
    for (const b of split(record.brand_authorized)) {
      const seg = BRAND_SEGMENT.get(b.toLowerCase().trim())
      if (!seg) continue
      bump(scores, seg, 2, AXIS_CAP, used)
      evidence.push(`brand:${b}→${seg}+2`)
    }
  }

  // 4. source priors.
  {
    const used = new Map()
    for (const s of String(record.source ?? '').split('|')) {
      const hit = SOURCE_SEGMENT[s]
      if (!hit) continue
      bump(scores, hit[0], hit[1], AXIS_CAP, used)
      evidence.push(`src:${s}→${hit[0]}+${hit[1]}`)
    }
  }

  // 5. the published name — last and weakest.
  {
    const used = new Map()
    const name = `${record.company_display ?? ''} ${record.company ?? ''}`
    for (const [rx, seg, pts] of NAME_SEGMENT) {
      if (!rx.test(name)) continue
      bump(scores, seg, pts, AXIS_CAP, used)
      evidence.push(`name:${rx.source}→${seg}+${pts}`)
    }
  }

  const [hi, lo] = scores.A >= scores.B ? ['A', 'B'] : ['B', 'A']
  const segment = scores[hi] >= SEGMENT_FLOOR && scores[hi] - scores[lo] >= SEGMENT_MARGIN ? hi : 'C'
  return { segment, scores, evidence }
}

/**
 * The segment column. `W` is the disposition talking, not the scorer — a record
 * with no website has no product evidence to read and is parked either way.
 *
 * @param {Record<string, any>} record
 * @returns {'A'|'B'|'C'|'W'}
 */
export function segmentOf(record) {
  if (record.disposition === 'no-website') return 'W'
  return segmentScores(record).segment
}

// ─────────────────────────────────────────────────────────────────────────────
// Tiers — §5's priority table
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The email sources that are a MANUFACTURER publishing its dealer's address,
 * not the dealer publishing its own. §7.2 isolates these: nobody gave us that
 * address, the locator did, and its bounce risk is unmeasured against a 2% kill
 * line. `dfs` is excluded on purpose — a Google Business listing is the
 * business's own published contact.
 */
export const MANUFACTURER_EMAIL_SOURCES = new Set([
  'enerpac', 'spxflow', 'dorner', 'nord', 'ballymore', 'kennametal', 'quincy',
  'banjo', 'lovejoy', 'flexlink', 'mknorthamerica', 'interroll', 'gast', 'ntn',
  'atlascopco', 'yaskawa', 'timken',
])

/**
 * Cohort E: every email we hold for this company came from a manufacturer.
 *
 * **This is a SENDING cohort, not a priority tier**, and §5's table shape is
 * where that gets confusing — it lists E as a fifth row alongside T1–T4, which
 * reads as mutually exclusive. Implemented that way it costs real T1 leads:
 * five of the ten highest-scoring companies in the pool (`ewprocess.com`,
 * `priceeng.com`, `campbellsalesandservice.com`, `goldenindustrial.com`,
 * `airenergy.com`) hold a manufacturer-published address and would have been
 * demoted out of the founder-manual tier by a fact about their *email
 * provenance*, which is not a fact about the company at all.
 *
 * §7.2's actual requirement is that these addresses ride in their own
 * micro-campaign with their own bounce reporting, because their bounce risk is
 * unmeasured against a 2% kill line. That is satisfied by a flag and a separate
 * file. So the tier stays a statement about the company and the cohort stays a
 * statement about the address.
 */
export function isCohortE(record) {
  if (!record.email) return false
  const sources = split(record.email_source).filter(Boolean)
  if (!sources.length) return false
  return sources.every((s) => MANUFACTURER_EMAIL_SOURCES.has(s))
}

/**
 * Owner-identifiable, in the only terms this pipeline can measure: we know who
 * the company is (identity resolution did not leave it open), and we hold every
 * field a human needs to walk in the door. Track 1 is a founder working fifty
 * accounts by hand — a record he cannot place is not a T1 lead.
 */
export function isOwnerIdentifiable(record) {
  if (record.needs_identity_resolution === true || record.needs_identity_resolution === 'true')
    return false
  return Boolean(
    record.company_display && record.domain && record.phone_e164 && record.address_1 && record.zip5,
  )
}

/**
 * §5's tier table. `ecom` is `rankScore`'s promoted class, so the RFQ cohort
 * counts as catalog-no-cart here rather than being a separate thing to test.
 *
 * `T0` is not in §5 and is named rather than hidden: `size.mjs`'s `above-band`
 * is a proxy ABOVE the $10–50M target band on a company §3.3's ≥20-address rule
 * did not route `above-ceiling`. Folding it into T2 would claim a size band the
 * proxies contradict.
 *
 * Cohort E is deliberately NOT a branch here — see {@link isCohortE}. It rides
 * as its own column so a company can be both T1 and E, which several of the
 * highest-scoring companies in the pool are.
 *
 * @param {Record<string, any>} record
 * @param {{band: string}} size
 * @param {string} ecom a key of `rank.mjs`'s ECOM_WEIGHTS
 * @returns {'T1'|'T2'|'T3'|'T4'|'T0'}
 */
export function tierOf(record, size, ecom) {
  const band = size?.band
  if (band === 'above-band') return 'T0'
  if (band === '10-50M') {
    const hot =
      Number(record.evidence_depth ?? 1) >= 3 &&
      (ecom === 'catalog_no_cart' || ecom === 'catalog_rfq_no_cart') &&
      isOwnerIdentifiable(record)
    return hot ? 'T1' : 'T2'
  }
  if (band === '5-10M') return 'T3'
  return 'T4'
}
