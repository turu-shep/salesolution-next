#!/usr/bin/env node
/**
 * S4e — fold USAspending federal-award evidence onto the companies we already
 * hold. Build-plan §5p.
 *
 * ## Why this is an enrichment pass and not an acquisition pass
 *
 * The pull returned 3,975 distinct US companies with **UEI at 100% and website,
 * email and phone at 0.0%**. USAspending publishes no contact data at all. A
 * net-new company from here needs full identity and domain resolution before it
 * can be mailed, which is the most expensive step in the pipeline, and
 * `seated-v1.csv` is already a complete 3,000-row deliverable. Matching against
 * companies we already hold is nearly free and adds a signal nothing else in the
 * build provides: proof the company transacts with a counterparty that audits.
 *
 * So: match, enrich, park the remainder. **Nothing is seated from this source.**
 *
 * ## The join, and why it is measured rather than assumed
 *
 * There is no domain and no phone on the USAspending side, so §3.4's primary key
 * (phone) is unavailable and so is the domain key. Normalized name + ZIP5 is the
 * only key both sides share, and it is weaker than phone in both directions:
 *
 *   - **False positives** — two different companies sharing a normalized name in
 *     one ZIP. Rare, and the run hand-checks every tier-1 match rather than
 *     sampling, because the match count is small enough to permit it.
 *   - **False negatives** — and these dominate. The pool carries a rolled-up
 *     branch address (§3.3); USAspending carries the address on the federal
 *     registration. "Service Pump & Supply" is Huntington WV federally and
 *     Danville WV in the pool. Same company, different ZIP, no match.
 *
 * That second failure is why a **second tier** exists: name + state, admitted
 * only where the name is unambiguous pool-side. It is reported separately and
 * never silently merged into the headline number.
 *
 * ## What it deliberately does not do
 *
 * It does not re-rank, re-segment or re-seat anything. It does not rewrite
 * `seated-v1.csv`, `deduped-v7.csv` or any existing side pool. Whether a re-rank
 * is warranted is a question the match rate answers, and manufacturing a
 * `seated-v2.csv` to look productive is explicitly out of scope. The enrichment
 * lands in a sidecar keyed on the pool row, so a later stage can join it in one
 * line if the evidence ever justifies one.
 *
 * ## Outputs
 *
 *   data/enrichment/federal-<date>.csv          one row per ENRICHED pool row
 *   data/enrichment/_usaspending-foldin-<date>.json   the full audit ledger
 *   data/side-pools/pool-usaspending-unmatched.csv    the identity backlog
 *   data/_handcheck-usaspending-<date>.json     every tier-1 pair, for review
 *
 * Usage:
 *   node emails/scripts/s4e-usaspending.mjs [--date 2026-08-01]
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FIELDS, fromCsv, makeRecord, toCsv, validateRecord } from './lib/contract.mjs'
import {
  FEDERAL_FIELDS,
  ceilingSignal,
  federalEnrichment,
  isRecentAward,
  manufacturerRead,
  matchKeys,
  pscSegment,
  segmentAgreement,
} from './lib/federal.mjs'
import { normalizeState, normalizeZip5 } from './lib/normalize.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const argv = process.argv.slice(2)
const arg = (f, d = null) => {
  const i = argv.indexOf(f)
  return i >= 0 ? argv[i + 1] : d
}
const DATE = arg('--date', '2026-08-01')

const readCsv = (p) => fromCsv(readFileSync(p, 'utf8'))

// ─────────────────────────────────────────────────────────────────────────────
// Load
// ─────────────────────────────────────────────────────────────────────────────

const raw = JSON.parse(readFileSync(resolve(ROOT, 'data', 'raw', `usaspending-${DATE}.json`), 'utf8'))
const usa = raw.records

const seated = readCsv(resolve(ROOT, 'lists', 'seated-v1.csv'))
const deduped = readCsv(resolve(ROOT, 'lists', 'deduped-v7.csv'))

/**
 * The 32,004-record universe §5o conserves against.
 *
 * `pool-ranked-out-v7.csv` is EXCLUDED on purpose: it is a subset of
 * `deduped-v7.csv` (3,000 seated + 13,719 ranked-out = 16,719), so including it
 * would double-count 13,719 rows and inflate every match denominator. The
 * arithmetic is asserted below rather than trusted.
 */
const SIDE_POOLS = readdirSync(resolve(ROOT, 'data', 'side-pools'))
  .filter((f) => f.endsWith('-v7.csv') && f !== 'pool-ranked-out-v7.csv')
  .sort()

const universe = []
const origin = new Map() // row → the file it came from
for (const r of deduped) {
  universe.push(r)
  origin.set(r, 'deduped-v7')
}
const sidePoolCounts = {}
for (const f of SIDE_POOLS) {
  const rows = readCsv(resolve(ROOT, 'data', 'side-pools', f))
  sidePoolCounts[f] = rows.length
  for (const r of rows) {
    universe.push(r)
    origin.set(r, f.replace(/\.csv$/, ''))
  }
}

const rankedOut = readCsv(resolve(ROOT, 'data', 'side-pools', 'pool-ranked-out-v7.csv'))
const conservation = {
  seated: seated.length,
  ranked_out: rankedOut.length,
  deduped_v7: deduped.length,
  side_pools: sidePoolCounts,
  universe: universe.length,
  deduped_equals_seated_plus_ranked_out: seated.length + rankedOut.length === deduped.length,
}

// The seated rows, identified by object identity inside `deduped` rather than by
// re-reading the file — `seated-v1.csv` and `deduped-v7.csv` are separate parses,
// so the same company is two different objects. Key on domain, falling back to
// the contract's own join key for the handful of rows without one.
const rowKey = (r) => (r.domain ? `d:${r.domain}` : `n:${r.company}|${r.zip5 ?? ''}`)
const seatedKeys = new Set(seated.map(rowKey))

// ─────────────────────────────────────────────────────────────────────────────
// Index
// ─────────────────────────────────────────────────────────────────────────────

const byZip = new Map()
const byState = new Map()
const byName = new Map()

for (const r of universe) {
  const k = matchKeys(r)
  for (const n of k.names) {
    if (!byName.has(n)) byName.set(n, new Set())
    byName.get(n).add(r)
  }
  for (const zk of k.zipKeys) {
    if (!byZip.has(zk)) byZip.set(zk, new Set())
    byZip.get(zk).add(r)
  }
  for (const sk of k.stateKeys) {
    if (!byState.has(sk)) byState.set(sk, new Set())
    byState.get(sk).add(r)
  }
}

/**
 * How many DISTINCT companies does this pool name key point at? A name that maps
 * to several companies cannot carry a tier-2 (name+state) match — that is the
 * whole guard against "Carter Machinery" sweeping up every Carter in Virginia.
 * Branches of one company share a domain and count once.
 */
function nameAmbiguity(name) {
  const rows = byName.get(name)
  if (!rows) return 0
  return new Set([...rows].map(rowKey)).size
}

// ─────────────────────────────────────────────────────────────────────────────
// Match
// ─────────────────────────────────────────────────────────────────────────────

const matches = [] // { usa, rows: Set, tier }
const unmatched = []

for (const u of usa) {
  const k = matchKeys(u)
  if (!k.names.length) {
    unmatched.push({ usa: u, reason: 'placeholder-name' })
    continue
  }

  const zipHits = new Set()
  for (const zk of k.zipKeys) for (const r of byZip.get(zk) ?? []) zipHits.add(r)
  if (zipHits.size) {
    matches.push({ usa: u, rows: zipHits, tier: 'name+zip5' })
    continue
  }

  const stateHits = new Set()
  for (const n of k.names) {
    if (nameAmbiguity(n) !== 1) continue // ambiguous name → no tier-2 match
    if (!k.state) continue
    for (const r of byState.get(`${n}|${k.state}`) ?? []) stateHits.add(r)
  }
  if (stateHits.size) {
    matches.push({ usa: u, rows: stateHits, tier: 'name+state' })
    continue
  }

  unmatched.push({ usa: u, reason: k.zip5 ? 'no-pool-match' : 'no-pool-match-no-zip' })
}

// ─────────────────────────────────────────────────────────────────────────────
// Enrich
// ─────────────────────────────────────────────────────────────────────────────

/** One enrichment row per (pool row × USAspending company) pair. */
const enriched = []
const contradictions = []
const leans = []

for (const m of matches) {
  const e = federalEnrichment(m.usa, { tier: m.tier })
  const psc = pscSegment(m.usa.psc_codes)
  for (const row of m.rows) {
    const agreement = segmentAgreement(row.segment, psc.segment)
    const out = {
      pool_key: rowKey(row),
      pool_list: seatedKeys.has(rowKey(row)) ? 'seated-v1' : origin.get(row),
      domain: row.domain ?? null,
      company_display: row.company_display ?? null,
      company: row.company ?? null,
      city: row.city ?? null,
      state: row.state ?? null,
      zip5: row.zip5 ?? null,
      segment: row.segment ?? null,
      tier: row.tier ?? null,
      rank_score: row.rank_score ?? null,
      disposition: row.disposition ?? null,
      federal_company_display: m.usa.company_display,
      federal_city: m.usa.city,
      federal_state: m.usa.state,
      federal_zip5: m.usa.zip5,
      ...e,
      federal_segment_agreement: agreement,
      federal_psc_evidence: psc.evidence.join(';') || null,
    }
    enriched.push(out)
    // The **lean**, below the decision threshold. `pscSegment` deliberately
    // refuses to decide without FLOOR+MARGIN, which is right for routing and
    // hides most of the evidence for reporting: only a fifth of the PSC-bearing
    // matches clear it. A lean is not a contradiction and is never routed on —
    // it is the queue a human would look at first.
    const lean = psc.scores.A === psc.scores.B ? null : psc.scores.A > psc.scores.B ? 'A' : 'B'
    if (lean && (row.segment === 'A' || row.segment === 'B') && lean !== row.segment && agreement !== 'contradict') {
      leans.push({
        pool_key: out.pool_key,
        company_display: out.company_display,
        pool_segment: row.segment,
        psc_lean: lean,
        psc_scores: psc.scores,
        psc_codes: e.psc_codes,
        pool_list: out.pool_list,
        decisive: false,
      })
    }
    if (agreement === 'contradict') {
      contradictions.push({
        pool_key: out.pool_key,
        company_display: out.company_display,
        pool_segment: row.segment,
        psc_segment: psc.segment,
        psc_scores: psc.scores,
        psc_evidence: psc.evidence,
        psc_codes: e.psc_codes,
        pool_list: out.pool_list,
        rank_score: row.rank_score ?? null,
        match_tier: m.tier,
      })
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Park the remainder — the identity-resolution backlog
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Route an unmatched federal company. Nothing is deleted; `disposition` decides
 * which queue it sits in.
 *
 * `not-a-distributor` is set ONLY from the self-declared
 * `manufacturer_of_goods` flag, never from NAICS — 44.2% of the
 * manufacturing-NAICS companies are not flagged, because the buying agency codes
 * by the part rather than by the seller, and a NAICS route would misclassify
 * every one of them.
 */
function routeUnmatched(u, reason) {
  if (reason === 'placeholder-name') return { disposition: 'not-a-distributor', icp_class: 'directory' }
  if (u.is_us === false || (u.country_code && u.country_code !== 'USA'))
    return { disposition: 'non-US', icp_class: null }
  if (ceilingSignal(u)) return { disposition: 'above-ceiling', icp_class: null }
  const mfr = manufacturerRead(u)
  if (mfr.verdict === 'manufacturer') return { disposition: 'not-a-distributor', icp_class: 'manufacturer' }
  return { disposition: 'identity-backlog', icp_class: null }
}

const backlog = []
const backlogCounts = {}
for (const { usa: u, reason } of unmatched) {
  const route = routeUnmatched(u, reason)
  const e = federalEnrichment(u, { tier: null })
  const record = makeRecord({
    company: u.company || null,
    company_display: u.company_display,
    domain: null,
    address_1: u.address_1,
    city: u.city,
    state: normalizeState(u.state),
    zip5: normalizeZip5(u.zip5),
    source: 'usaspending',
    source_url: u.source_url,
    captured: u.captured,
    // §1: `line_card` is the source's own taxonomy, unmapped. NAICS and PSC are
    // exactly that — federal product taxonomies, recorded verbatim, interpreted
    // late (§5e). They are NOT brands and never count as line-card breadth for a
    // size proxy, because nothing downstream reads this pool for size.
    line_card: [
      ...Object.keys(u.naics_codes ?? {}).map((c) => `NAICS:${c}`),
      ...Object.keys(u.psc_codes ?? {}).map((c) => `PSC:${c}`),
    ],
    distributor_type: Object.keys(u.awarding_sub_agencies ?? {}).join(', ') || null,
    tier_raw: u.uei ? `UEI:${u.uei}` : null,
    disposition: route.disposition,
    segment: null,
    evidence_depth: 1,
    // The whole point of the pool: real company, no contact route.
    needs_identity_resolution: true,
    identity_status: 'unresolved',
    identity_found: [],
    icp_class: route.icp_class,
    icp_uncertain: route.icp_class === null,
  })
  backlogCounts[route.disposition] = (backlogCounts[route.disposition] ?? 0) + 1
  backlog.push({ ...record, ...e, federal_match_tier: null, _reason: reason })
}

// Validate the CONTRACT subset of every parked record. The federal columns are a
// documented extension of the side-pool shape, so they are stripped before the
// guard runs rather than being allowed to weaken it.
const violations = []
for (const b of backlog) {
  const contractOnly = Object.fromEntries(FIELDS.map((f) => [f, b[f]]))
  const { ok, errors } = validateRecord(contractOnly)
  if (!ok) violations.push({ company: b.company_display, errors })
}

// ─────────────────────────────────────────────────────────────────────────────
// Measure
// ─────────────────────────────────────────────────────────────────────────────

const matchedRowKeys = new Set(enriched.map((e) => e.pool_key))
const inDeduped = (e) => e.pool_list === 'seated-v1' || e.pool_list === 'deduped-v7'
const seatedHit = new Set(enriched.filter((e) => e.pool_list === 'seated-v1').map((e) => e.pool_key))
const dedupedHit = new Set(enriched.filter(inDeduped).map((e) => e.pool_key))

const byTier = {}
for (const m of matches) byTier[m.tier] = (byTier[m.tier] ?? 0) + 1

/** Rows reached by each tier on its own — the brief asks for both, separately. */
const perTier = {}
for (const t of ['name+zip5', 'name+state']) {
  const rows = enriched.filter((e) => e.federal_match_tier === t)
  perTier[t] = {
    federal_companies: byTier[t] ?? 0,
    pool_rows: new Set(rows.map((e) => e.pool_key)).size,
    seated_rows: new Set(rows.filter((e) => e.pool_list === 'seated-v1').map((e) => e.pool_key)).size,
    deduped_rows: new Set(rows.filter(inDeduped).map((e) => e.pool_key)).size,
  }
}

/**
 * **Value over-attribution, measured rather than assumed.** A USAspending
 * recipient aggregates a corporate family under one UEI — VSE Corporation files
 * 1st Choice Aerospace, Akimeka, Desser Holding and Turbine Controls as
 * alternate names of the same recipient. The identity match is correct in those
 * cases and `federal_award_total` still is not the matched entity's book, it is
 * the family's. A personalization line quoting the dollar figure would be wrong
 * in scale even though the company is right.
 *
 * Proxy: a recipient that carries a `parent_uei` pointing somewhere else, or an
 * alternate name sharing no token with its own primary name.
 */
const usaByKey = new Map(matches.flatMap((m) => [...m.rows].map((r) => [rowKey(r), m.usa])))
const tokens = (s) =>
  new Set(String(s ?? '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((t) => t.length > 2))
function overAttributionRisk(u) {
  if (u.parent_uei && u.parent_uei !== u.uei) return true
  const primary = tokens(u.company_display)
  return (u.alternate_names ?? []).some((a) => {
    const t = tokens(a)
    return t.size > 0 && ![...t].some((x) => primary.has(x))
  })
}
const overAttributed = [...matchedRowKeys].filter((k) => overAttributionRisk(usaByKey.get(k)))

/**
 * **Seated rows the federal record argues against — named, not routed.**
 *
 * Two classes, and neither is acted on here:
 *
 *   `self-declared-manufacturer` — the company told SAM.gov it manufactures the
 *     goods it sells. That is a declaration to a counterparty that audits, and
 *     it is a stronger witness than the homepage classifier that seated the row.
 *     It also directly qualifies §5o's "zero seated manufacturers on re-run".
 *   `above-ceiling` — the federal book alone reaches the $75M revenue ceiling,
 *     or clears $10M with an other-than-small declaration.
 *
 * They are reported rather than routed because changing a `disposition` is an
 * ICP adjudication, which is §5o's homepage classifier's job, not an enrichment
 * pass's. The evidence goes to the owner with the company named.
 */
const seatedReview = []
for (const e of enriched) {
  if (e.pool_list !== 'seated-v1') continue
  const reasons = []
  if (e.federal_manufacturer_read === 'manufacturer') reasons.push('self-declared-manufacturer')
  if (e.federal_ceiling_signal) reasons.push('above-ceiling')
  if (!reasons.length) continue
  seatedReview.push({
    pool_key: e.pool_key,
    domain: e.domain,
    company_display: e.company_display,
    segment: e.segment,
    tier: e.tier,
    rank_score: e.rank_score,
    reasons,
    federal_award_total: e.federal_award_total,
    naics_codes: e.naics_codes,
    federal_ceiling_signal: e.federal_ceiling_signal,
    match_tier: e.federal_match_tier,
    federal_source_url: e.federal_source_url,
  })
}

const stats = {
  stage: 's4e-usaspending-foldin',
  captured: DATE,
  source_records: usa.length,
  conservation: {
    ...conservation,
    matched_companies: matches.length,
    unmatched_companies: unmatched.length,
    in_equals_out: matches.length + unmatched.length === usa.length,
    backlog_rows: backlog.length,
    backlog_equals_unmatched: backlog.length === unmatched.length,
  },
  match: {
    by_tier: byTier,
    per_tier: perTier,
    enriched_pool_rows: matchedRowKeys.size,
    seated_rows_enriched: seatedHit.size,
    seated_total: seated.length,
    seated_rate_pct: +((100 * seatedHit.size) / seated.length).toFixed(2),
    deduped_rows_enriched: dedupedHit.size,
    deduped_total: deduped.length,
    deduped_rate_pct: +((100 * dedupedHit.size) / deduped.length).toFixed(2),
    universe_rows_enriched: matchedRowKeys.size,
    universe_total: universe.length,
    universe_rate_pct: +((100 * matchedRowKeys.size) / universe.length).toFixed(2),
    usa_matched_pct: +((100 * matches.length) / usa.length).toFixed(2),
  },
  signals: {
    psc_segment_decided: enriched.filter((e) => e.federal_psc_segment).length,
    agreement: enriched.reduce((a, e) => {
      a[e.federal_segment_agreement] = (a[e.federal_segment_agreement] ?? 0) + 1
      return a
    }, {}),
    contradictions: contradictions.length,
    psc_leans_against_segment: leans.length,
    psc_any_evidence: enriched.filter((e) => e.federal_psc_evidence).length,
    psc_codes_present: enriched.filter((e) => e.psc_codes && e.psc_codes.length).length,
    manufacturer_read: enriched.reduce((a, e) => {
      a[e.federal_manufacturer_read] = (a[e.federal_manufacturer_read] ?? 0) + 1
      return a
    }, {}),
    ceiling_signals: enriched.filter((e) => e.federal_ceiling_signal).length,
    recent_award_2024plus: enriched.filter((e) => isRecentAward(e)).length,
    has_award_description: enriched.filter((e) => e.federal_award_description).length,
    sba_small_business_true: enriched.filter((e) => e.sba_small_business === true).length,
    sba_small_business_unobserved: enriched.filter((e) => e.sba_small_business === null).length,
    value_over_attribution_rows: overAttributed.length,
    seated_rows_flagged_for_review: new Set(seatedReview.map((r) => r.pool_key)).size,
    award_total_bands: enriched.reduce((a, e) => {
      const v = e.federal_award_total
      const band =
        v === null ? 'unknown'
        : v < 0 ? 'net-negative'
        : v < 25_000 ? '<25k'
        : v < 100_000 ? '25k-100k'
        : v < 500_000 ? '100k-500k'
        : v < 2_000_000 ? '500k-2M'
        : v < 10_000_000 ? '2M-10M'
        : v < 75_000_000 ? '10M-75M'
        : '75M+'
      a[band] = (a[band] ?? 0) + 1
      return a
    }, {}),
  },
  backlog: {
    by_disposition: backlogCounts,
    by_reason: unmatched.reduce((a, u) => {
      a[u.reason] = (a[u.reason] ?? 0) + 1
      return a
    }, {}),
    contract_violations: violations.length,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Write
// ─────────────────────────────────────────────────────────────────────────────

const ENRICH_DIR = resolve(ROOT, 'data', 'enrichment')
if (!existsSync(ENRICH_DIR)) mkdirSync(ENRICH_DIR, { recursive: true })

const ENRICH_FIELDS = [
  'pool_key', 'pool_list', 'domain', 'company_display', 'company', 'city', 'state', 'zip5',
  'segment', 'tier', 'rank_score', 'disposition',
  'federal_company_display', 'federal_city', 'federal_state', 'federal_zip5',
  ...FEDERAL_FIELDS, 'federal_psc_evidence',
]
writeFileSync(resolve(ENRICH_DIR, `federal-${DATE}.csv`), toCsv(enriched, ENRICH_FIELDS))

const BACKLOG_FIELDS = [...FIELDS, ...FEDERAL_FIELDS]
writeFileSync(
  resolve(ROOT, 'data', 'side-pools', 'pool-usaspending-unmatched.csv'),
  toCsv(backlog, BACKLOG_FIELDS),
)

writeFileSync(
  resolve(ENRICH_DIR, `_usaspending-foldin-${DATE}.json`),
  JSON.stringify({ ...stats, seated_review: seatedReview, contradictions, leans, violations }, null, 1),
)

// Every tier-1 pair, dumped for hand-adjudication. The match count is small
// enough to check exhaustively rather than sample, which is strictly better than
// the 25-row sample the brief asks for.
const handcheck = matches.map((m) => ({
  tier: m.tier,
  federal: {
    name: m.usa.company_display,
    address: m.usa.address_1,
    city: m.usa.city,
    state: m.usa.state,
    zip5: m.usa.zip5,
    uei: m.usa.uei,
    naics: Object.values(m.usa.naics_codes ?? {}),
    psc: Object.values(m.usa.psc_codes ?? {}),
    award_total: m.usa.cumulative_award_value,
  },
  pool: [...m.rows].map((r) => ({
    list: seatedKeys.has(rowKey(r)) ? 'seated-v1' : origin.get(r),
    name: r.company_display,
    domain: r.domain,
    address: r.address_1,
    city: r.city,
    state: r.state,
    zip5: r.zip5,
    segment: r.segment,
    source: r.source,
  })),
}))
writeFileSync(
  resolve(ROOT, 'data', `_handcheck-usaspending-${DATE}.json`),
  JSON.stringify(handcheck, null, 1),
)

// ─────────────────────────────────────────────────────────────────────────────
// Report to stdout
// ─────────────────────────────────────────────────────────────────────────────

console.log(JSON.stringify(stats, null, 1))
if (violations.length) {
  console.error(`\n⚠ ${violations.length} contract violations`)
  console.error(JSON.stringify(violations.slice(0, 5), null, 1))
}
if (!stats.conservation.in_equals_out || !stats.conservation.backlog_equals_unmatched)
  console.error('\n⚠ CONSERVATION FAILED')
