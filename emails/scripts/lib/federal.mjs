/**
 * federal — USAspending.gov prime-award evidence, folded onto companies we
 * already hold. Build-plan §5p.
 *
 * ## Why this is an ENRICHMENT module and not a source mapper
 *
 * USAspending publishes **no website, no email and no phone** — 0.0% on all
 * three, measured over 3,975 companies. Every net-new company from it would need
 * full identity and domain resolution, which is the most expensive step in the
 * pipeline, and `seated-v1.csv` is already complete at 3,000 rows. So the source
 * folds in as a signal layer on companies the pool already has, and the
 * remainder is parked as an identity-resolution backlog.
 *
 * That decision also fixes the join key. There is no domain and no phone on the
 * USAspending side, so §3.4's primary key (phone) and the domain key are both
 * unavailable. **Normalized name + ZIP5 is the only key either side shares**,
 * and it is measurably weaker than phone — hence {@link matchKeys} emits a
 * *tiered* key set and the caller records which tier fired, rather than
 * flattening a strong and a weak match into one boolean.
 *
 * ## The three caveats the acquiring agent measured, encoded here
 *
 * 1. **The award proxy is a CEILING, never a floor.** Small-business median
 *    federal spend is $266K against $616K for other-than-small — 2.3×
 *    separation with heavy overlap — and **Jamaica Bearings carries $149M in
 *    awards while still flagged `small_business`**, because the SBA wholesale
 *    standard is employee-based. {@link ceilingSignal} therefore only ever
 *    returns an EXCLUSION or `null`. There is deliberately no function in this
 *    file that turns award value into evidence a company clears $2M.
 * 2. **NAICS alone must not route.** 62.2% of the pool sits under a
 *    manufacturing NAICS but **44.2% of those are not flagged
 *    `manufacturer_of_goods`** — the buying agency codes by the part, not by the
 *    seller. {@link manufacturerRead} returns the two signals separately and
 *    names the disagreement instead of resolving it.
 * 3. **PSC is free vertical evidence.** The Product/Service Code says what was
 *    actually bought, independent of who sold it, and it lands dead on the
 *    pack's segments — pumps 460, bearings 776, power transmission 101.
 *    {@link pscSegment} reads it on the SAME floor/margin shape as
 *    `segment.mjs`, so a PSC verdict and a line-card verdict are comparable.
 *
 * Every function here is pure — same input, same output, no I/O, no clock.
 *
 * Tests: emails/scripts/lib/federal.test.mjs (`node --test emails/scripts/lib/`).
 */
import { normalizeCompany, normalizeState, normalizeZip5 } from './normalize.mjs'

// ─────────────────────────────────────────────────────────────────────────────
// The join key
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Match tiers, strongest first. The caller stores the tier on the match so a
 * downstream reader can weight the two differently — which matters, because
 * they have different false-positive rates and the report measures both.
 *
 *   `name+zip5`   both sides agree on the normalized name AND the 5-digit ZIP.
 *                 The brief's key.
 *   `name+state`  the names agree and the states agree but the ZIPs do not.
 *                 This is the HQ-versus-branch case and it is the dominant
 *                 miss: the pool carries a rolled-up branch address (§3.3) and
 *                 USAspending carries the address on the federal registration.
 *                 **Admitted only when the name is unambiguous pool-side**, so
 *                 a generic name cannot sweep several companies into one match.
 */
export const MATCH_TIERS = ['name+zip5', 'name+state']

/**
 * The normalizer settings this join uses, named once so the fold-in and its
 * tests cannot drift apart.
 *
 * `dashMode: 'adjacent-space'` is not a default worth overriding: splitting on a
 * bare dash collapses "Tri-State Bearing", "Tri-County Electrical Supply" and
 * "Tri-State Industrial" onto the join key `tri`, and the measured cost across
 * AD + Timken was 63 keys swallowing 2+ genuinely different companies. Stripping
 * branch qualifiers is §2b's decision and moves distinct-company counts 32%.
 */
export const NORMALIZER_OPTS = Object.freeze({ stripBranch: true, dashMode: 'adjacent-space' })

/** Normalized join name, using the shipped normalizer at the shipped settings. */
export function joinName(raw) {
  return normalizeCompany(raw, NORMALIZER_OPTS)
}

/**
 * Placeholder names that must never become a join key. "MISCELLANEOUS FOREIGN
 * AWARDEES" is a GSA synthetic recipient, not a company (14 further category
 * rows collapse into it); the rest are the usual redaction strings federal
 * extracts carry. A join key built from one of these would attach federal
 * awards to whichever pool row happened to share the string.
 */
export const NON_COMPANY_NAMES = new Set([
  'miscellaneous foreign awardees',
  'miscellaneous foreign awardee',
  'redacted due to pii',
  'multiple recipients',
  'individual recipient',
  'unknown',
  'n a',
  'none',
])

/** Is this name a placeholder rather than a company? */
export function isPlaceholderName(raw) {
  const n = joinName(raw)
  return n === null || NON_COMPANY_NAMES.has(n)
}

/**
 * Every name a record can legitimately join under: the published name, the
 * pre-normalized `company` column where a record carries one, and any
 * `alternate_names` the source published. Deduped, placeholders dropped.
 *
 * Running the normalizer over an ALREADY-normalized `company` column is safe and
 * intentional: normalized names carry no punctuation, so the branch-strip is a
 * no-op on them, and the pool's identity-resolved rows store a domain-derived
 * key ("scottindustrialsystems") that the display name would never produce.
 *
 * @param {Record<string, any>} record
 * @returns {string[]}
 */
export function joinNames(record) {
  const out = new Set()
  const raw = [record.company_display, record.company]
  if (Array.isArray(record.alternate_names)) raw.push(...record.alternate_names)
  for (const n of raw) {
    if (n === undefined || n === null || n === '') continue
    if (isPlaceholderName(n)) continue
    const k = joinName(n)
    if (k) out.add(k)
  }
  return [...out]
}

/**
 * The tiered key set for one record.
 *
 * @param {Record<string, any>} record
 * @returns {{names: string[], zip5: string|null, state: string|null,
 *            zipKeys: string[], stateKeys: string[]}}
 */
export function matchKeys(record) {
  const names = joinNames(record)
  const zip5 = normalizeZip5(record.zip5)
  const state = normalizeState(record.state)
  return {
    names,
    zip5,
    state,
    zipKeys: zip5 ? names.map((n) => `${n}|${zip5}`) : [],
    stateKeys: state ? names.map((n) => `${n}|${state}`) : [],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PSC → segment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Federal Supply Classification groups, mapped onto §5's segments at the same
 * weight scale `segment.mjs` uses (3 = the code names the segment and
 * essentially nothing else; 2 = it belongs to the segment but is shared; 1 = it
 * leans that way and no more).
 *
 * Scope discipline: only codes that genuinely name a segment are listed.
 * Electrical hardware (5975), commercial hardware (5340) and the marine and
 * aircraft groups are deliberately absent — they are MRO breadth, which is
 * Segment C, and C is the residual rather than a class you score into.
 */
export const PSC_SEGMENT = {
  // ── A — fluid power, pumps, air, sealing, valves ──────────────────────────
  4320: ['A', 3], // POWER AND HAND PUMPS
  4310: ['A', 3], // COMPRESSORS AND VACUUM PUMPS
  4820: ['A', 2], // VALVES, NONPOWERED
  4810: ['A', 2], // VALVES, POWERED
  4730: ['A', 2], // HOSE, PIPE, TUBE, LUBRICATION, AND RAILING FITTINGS
  4720: ['A', 2], // HOSE AND FLEXIBLE TUBING
  5330: ['A', 2], // PACKING AND GASKET MATERIALS
  4330: ['A', 1], // CENTRIFUGALS, SEPARATORS, PRESSURE AND VACUUM FILTERS
  1650: ['A', 1], // AIRCRAFT HYDRAULIC, VACUUM AND DE-ICING COMPONENTS
  // ── B — bearings, power transmission, drives, motors, conveyors ───────────
  3110: ['B', 3], // BEARINGS, ANTIFRICTION, UNMOUNTED
  3120: ['B', 3], // BEARINGS, PLAIN, UNMOUNTED
  3130: ['B', 3], // BEARINGS, MOUNTED
  3040: ['B', 3], // MISCELLANEOUS POWER TRANSMISSION EQUIPMENT
  3020: ['B', 3], // GEARS, PULLEYS, SPROCKETS, TRANSMISSION CHAIN
  3030: ['B', 3], // BELTING, DRIVE BELTS, FAN BELTS AND ACCESSORIES
  3910: ['B', 3], // CONVEYORS
  3010: ['B', 2], // TORQUE CONVERTERS AND SPEED CHANGERS
  6105: ['B', 2], // MOTORS, ELECTRICAL
  3990: ['B', 1], // MISCELLANEOUS MATERIALS HANDLING EQUIPMENT
}

/** Mirrors `segment.mjs` so a PSC verdict and a line-card verdict are comparable. */
export const PSC_AXIS_CAP = 6
export const PSC_FLOOR = 4
export const PSC_MARGIN = 2

/**
 * Read the segment a company's federal purchase orders describe.
 *
 * Presence-weighted, not volume-weighted: `psc_codes` is published as
 * code → description with no per-code award count, so a company that sold one
 * pump and a company that sold four hundred both score 4320 once. That is a
 * real limit and it is why this corroborates a segment rather than setting one.
 *
 * Returns `null` for `segment` when the evidence does not clear FLOOR+MARGIN —
 * "the PSC codes do not decide" is a legitimate answer and by far the most
 * common one.
 *
 * @param {Record<string, string>|string[]|null|undefined} psc
 * @returns {{segment: 'A'|'B'|null, scores: {A: number, B: number}, evidence: string[]}}
 */
export function pscSegment(psc) {
  const scores = { A: 0, B: 0 }
  const evidence = []
  const used = new Map()
  const codes = Array.isArray(psc) ? psc : Object.keys(psc ?? {})

  for (const raw of codes) {
    const code = String(raw ?? '').trim()
    const hit = PSC_SEGMENT[code]
    if (!hit) continue
    const [seg, pts] = hit
    const spent = used.get(seg) ?? 0
    if (spent >= PSC_AXIS_CAP) continue
    const give = Math.min(pts, PSC_AXIS_CAP - spent)
    scores[seg] += give
    used.set(seg, spent + give)
    evidence.push(`psc:${code}→${seg}+${give}`)
  }

  const [hi, lo] = scores.A >= scores.B ? ['A', 'B'] : ['B', 'A']
  const segment = scores[hi] >= PSC_FLOOR && scores[hi] - scores[lo] >= PSC_MARGIN ? hi : null
  return { segment, scores, evidence }
}

/**
 * Does the federal purchase record contradict the segment the pipeline assigned?
 *
 * Only a DECISIVE PSC verdict against a DECISIVE pipeline verdict counts. A
 * company sitting in C (the residual) is not contradicted by PSC evidence — it
 * is *informed* by it, and that is reported as `corroborate-c`, not as a
 * conflict. Symmetrically, PSC silence never contradicts anything.
 *
 * @param {'A'|'B'|'C'|'W'|null|undefined} segment the pipeline's assignment
 * @param {'A'|'B'|null} pscVerdict {@link pscSegment}'s
 * @returns {'contradict'|'corroborate'|'corroborate-c'|'none'}
 */
export function segmentAgreement(segment, pscVerdict) {
  if (!pscVerdict) return 'none'
  if (segment === 'A' || segment === 'B') return segment === pscVerdict ? 'corroborate' : 'contradict'
  if (segment === 'C') return 'corroborate-c'
  return 'none'
}

// ─────────────────────────────────────────────────────────────────────────────
// NAICS — the signal that must NOT route on its own
// ─────────────────────────────────────────────────────────────────────────────

/** The three manufacturing NAICS in the pull. 62.2% of the source sits here. */
export const MANUFACTURING_NAICS = new Set(['332991', '333996', '333995'])

/**
 * Was this company profiled by the phase-C `recipient/{id}` call?
 *
 * **This is the observation gate and it has to be read from `has_detail`, not
 * from the shape of `business_flags`.** The acquisition writes `business_flags`
 * as a fixed 19-key map on ALL 3,975 records, every value `false` where no
 * profile call was made — so "the map is populated" is true for records nobody
 * ever looked at. A reader that infers observation from key count silently
 * reports 1,742 unprofiled companies as *negative* on every flag.
 *
 * Measured: `has_detail` is true on 2,233 records; at least one flag is true on
 * 2,230 of them. The three-record gap is real profiles that came back all-false.
 */
export function hasDetail(usaRecord) {
  return usaRecord?.has_detail === true
}

/**
 * The self-declared business types, as published. **`manufacturer_of_goods`
 * lives HERE, in the `business_types` array — it is not a key of
 * `business_flags`.**
 *
 * This cost a bug worth recording. The first cut of this module read
 * `business_flags.manufacturer_of_goods`, which is `undefined` on every record
 * in the file, coerced to `false`, and reported **zero manufacturers across a
 * source where 994 companies declare themselves one**. It failed silently and in
 * the safe-looking direction — every agency-coded record would have been read as
 * a distributor. The two structures are the same vocabulary published twice at
 * different depths, and only one of them carries this key.
 */
export function businessTypes(usaRecord) {
  const t = usaRecord?.business_types
  return Array.isArray(t) ? t.map((s) => String(s)) : []
}

/**
 * The two manufacturer signals, side by side and deliberately unresolved.
 *
 * `naics` says a buying agency filed the award under a manufacturing code.
 * `declared` says the company told SAM.gov it manufactures the goods it sells.
 * They disagree for **44.2% of the manufacturing-NAICS companies**, and when
 * they do the declaration is the better witness — the agency codes by what was
 * in the box, the company codes itself. `verdict: 'agency-coded'` is that case,
 * and it is the one a naive NAICS route would misclassify as a manufacturer.
 *
 * @param {Record<string, any>} usaRecord
 * @returns {{naicsManufacturing: boolean, declaredManufacturer: boolean|null,
 *            verdict: 'manufacturer'|'agency-coded'|'distributor'|'unknown'}}
 */
export function manufacturerRead(usaRecord) {
  const codes = Object.keys(usaRecord?.naics_codes ?? {})
  const naicsManufacturing = codes.some((c) => MANUFACTURING_NAICS.has(String(c)))
  // No profile call was made below the $25k floor — 1,742 records. `null` means
  // "not observed", which is a different claim from `false`.
  const declared = hasDetail(usaRecord) ? businessTypes(usaRecord).includes('manufacturer_of_goods') : null

  let verdict = 'unknown'
  if (declared === true) verdict = 'manufacturer'
  else if (declared === false) verdict = naicsManufacturing ? 'agency-coded' : 'distributor'
  return { naicsManufacturing, declaredManufacturer: declared, verdict }
}

// ─────────────────────────────────────────────────────────────────────────────
// Award value — a ceiling tool, and nothing else
// ─────────────────────────────────────────────────────────────────────────────

/**
 * **Hard exclusion.** Federal awards ALONE reach the pack's $75M revenue
 * ceiling. That comparison is deliberately unfair to the company — the awards
 * accumulate over a 5.6-year window and the ceiling is annual — and it is
 * unfair in the only safe direction: a distributor that has booked $75M of
 * federal prime awards is a national, whatever else is true of it. 7 companies
 * (0.2%) clear it.
 */
export const CEILING_AWARD_HARD_USD = 75_000_000

/**
 * **Soft signal.** Large federal book AND self-declared other-than-small. A
 * candidate for review, not a route: 46 companies sit in the $10–75M band and
 * some of them are genuinely in-band distributors with one big base contract.
 */
export const CEILING_AWARD_SOFT_USD = 10_000_000

/**
 * A national-exclusion signal, or `null`. **There is no floor counterpart and
 * there must not be one** — §5p: "use it to exclude nationals at the top; never
 * treat it as evidence a company clears $2M." Nothing in this file turns award
 * value into evidence of minimum size.
 *
 * **The `small_business` flag is not a veto here, and that is the point of the
 * Jamaica Bearings case.** It carries $149M of federal awards and is still
 * flagged `small_business`, because the SBA wholesale standard counts employees
 * rather than revenue. Letting the flag block the exclusion would keep a
 * $149M-a-book national in a list capped at $75M of revenue. The flag is
 * therefore read as corroboration on the soft tier and ignored on the hard one.
 *
 * @param {Record<string, any>} usaRecord
 * @returns {{signal: 'above-ceiling'|'above-ceiling-candidate', why: string}|null}
 */
export function ceilingSignal(usaRecord) {
  const value = Number(usaRecord?.cumulative_award_value)
  if (!Number.isFinite(value)) return null
  const rounded = Math.round(value)
  if (value >= CEILING_AWARD_HARD_USD)
    return { signal: 'above-ceiling', why: `cumulative_award_value=${rounded} ≥ ${CEILING_AWARD_HARD_USD}` }
  if (value >= CEILING_AWARD_SOFT_USD && usaRecord?.business_flags?.other_than_small_business)
    return {
      signal: 'above-ceiling-candidate',
      why: `cumulative_award_value=${rounded} + other_than_small_business`,
    }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// The enrichment payload
// ─────────────────────────────────────────────────────────────────────────────

/** The columns a matched pool row gains. Also the CSV order of the sidecar. */
export const FEDERAL_FIELDS = [
  'federal_award_total',
  'federal_award_count',
  'federal_first_award',
  'federal_last_award',
  'psc_codes',
  'naics_codes',
  'sba_small_business',
  'federal_uei',
  'federal_agencies',
  'federal_psc_segment',
  'federal_segment_agreement',
  'federal_manufacturer_read',
  'federal_ceiling_signal',
  'federal_award_description',
  'federal_match_tier',
  'federal_source_url',
  'federal_captured',
]

/** ISO date, or null. Guards against the `''`/`'null'` strings federal extracts carry. */
function isoDate(v) {
  const s = String(v ?? '').trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null
}

/**
 * A number, or null. **Not `?? 0`** — §5l flagged `??`-on-zero as a recurring
 * bug class in this pipeline, and the inverse matters just as much here: 200
 * companies are net-NEGATIVE on cumulative value (deobligations exceed awards),
 * so a real `-1013371` must survive and a missing value must not become `0`.
 */
function num(v) {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/**
 * Fold one USAspending record into the enrichment columns a pool row gains.
 *
 * `award_descriptions` are stored byte-exact by S1 and arrive with a DLA
 * requisition prefix, truncated mid-word ("8511045970!BUILDING,SPECIAL PU").
 * The longest description is carried through as-is: §1's rule is that trimming
 * a fragment is S7's copy decision, not a data decision, so this picks a
 * candidate and does not clean it.
 *
 * @param {Record<string, any>} usaRecord
 * @param {{tier?: string}} [opts]
 * @returns {Record<string, any>}
 */
export function federalEnrichment(usaRecord, { tier = null } = {}) {
  const psc = usaRecord.psc_codes ?? {}
  const naics = usaRecord.naics_codes ?? {}
  const verdict = pscSegment(psc)
  const ceiling = ceilingSignal(usaRecord)
  const mfr = manufacturerRead(usaRecord)
  const descriptions = Array.isArray(usaRecord.award_descriptions) ? usaRecord.award_descriptions : []
  const longest = descriptions.reduce((a, b) => (String(b).length > String(a).length ? b : a), '')

  return {
    federal_award_total: num(usaRecord.cumulative_award_value),
    federal_award_count: num(usaRecord.award_count_over_floor),
    federal_first_award: isoDate(usaRecord.first_award_date),
    federal_last_award: isoDate(usaRecord.last_award_date),
    psc_codes: Object.keys(psc),
    naics_codes: Object.keys(naics),
    // `null`, not `false`, below the detail floor — 1,742 records were never
    // profiled, and "not observed" is not "not small". Gated on `has_detail`
    // rather than on the flag map, which is written full-of-`false` regardless.
    sba_small_business: hasDetail(usaRecord)
      ? Boolean(usaRecord.business_flags?.small_business)
      : null,
    federal_uei: usaRecord.uei ?? null,
    federal_agencies: Object.keys(usaRecord.awarding_sub_agencies ?? {}),
    federal_psc_segment: verdict.segment,
    federal_segment_agreement: null, // set by the caller, which knows the pool segment
    federal_manufacturer_read: mfr.verdict,
    federal_ceiling_signal: ceiling ? ceiling.why : null,
    federal_award_description: longest || null,
    federal_match_tier: tier,
    federal_source_url: usaRecord.source_url ?? null,
    federal_captured: usaRecord.captured ?? null,
  }
}

/**
 * Is this award relationship live, rather than a 2021 artifact? 63.0% of the
 * PSC-bearing population clears this. Used for reporting only — it gates
 * nothing, because an expired contract is still proof the company transacts.
 *
 * @param {Record<string, any>} enrichment output of {@link federalEnrichment}
 * @param {string} [since]
 */
export function isRecentAward(enrichment, since = '2024-01-01') {
  const last = enrichment?.federal_last_award
  return Boolean(last && last >= since)
}
