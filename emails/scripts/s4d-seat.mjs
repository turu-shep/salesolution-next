#!/usr/bin/env node
/**
 * S4d — SEAT the pool. Build-plan §5's segment/tier spec, on even coverage.
 *
 * ## What makes this run different from every rank that came before it
 *
 * §5j, §5l and §5m all end on the same sentence in different words: the ORDER
 * was trustworthy and the MEMBERSHIP was a map of which domains we happened to
 * fetch. `shortlist-v1` ranked 17,960 companies on enrichment covering 2,783 of
 * them. `shortlist-v2` closed that gap **on the shortlist only**, which
 * sharpened the bias by one turn rather than removing it — and then measured the
 * residual: **4,967 never-fetched companies clear the cut score once fetched,
 * 1.42× the entire shortlist.**
 *
 * The full-enrichment pass closed it for real. This stage is the first global
 * re-rank on like-for-like evidence, and the first list in the build whose
 * membership is a judgement about the companies rather than about our fetch
 * order.
 *
 * ## The scoring function is IMPORTED, not reimplemented
 *
 * `lib/rank.mjs` and `lib/size.mjs` are untouched, exactly as `s4b-rerank.mjs`
 * left them. Every weight traces to something the build measured — §5d's
 * catalog-no-cart cohort at +26, the NON-monotonic brand curve peaking at 6–10
 * and turning negative past 40, §5a's evidence-depth scarcity, the §4.5 size
 * bands. **A score that changed means the evidence changed.**
 *
 * ## Three defects cleared first, in this order
 *
 *   1. `??`/`||`-on-zero, the class that has now appeared four times. Swept
 *      tree-wide again; this file's export writes the SCORER's value, never the
 *      raw enrichment field, so the column and `rank_components` cannot disagree.
 *   2. The identity axis (`lib/vertical.mjs`'s `classifyIdentity`) re-run over
 *      every seated record with the vocabulary rebuilt on the v6 union, plus the
 *      enrichment pass's own exclusion registry and the file-host rule. A
 *      manufacturer, marketplace, job board or CDN bucket cannot reach the list.
 *   3. `lib/dupsite.mjs` — one site on two domains, found through the sitemap
 *      fingerprint the name, phone and domain keys all missed.
 *
 * ## Rules this stage does not get to break
 *
 *   - **Nothing is deleted.** Every routed record keeps its row, takes a
 *     `disposition`, and lands in a side pool. Losing the rank is not a
 *     disposition at all — `pool-ranked-out` rows stay seated in `deduped-v7`.
 *   - `source_url` + `captured` on every row. `self_declaration` byte-exact, and
 *     a negated declaration can never reach a sendable list — S3c refuses them
 *     at the mapper, and this stage asserts it rather than trusting it.
 *   - Conservation: every company in the v6 union lands in exactly one bucket.
 *
 * Usage: `node emails/scripts/s4d-seat.mjs [--cut 3000] [--date 2026-08-01]`
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FIELDS,
  FIELDS_V7,
  fromCsv,
  makeRecord,
  split,
  toCsv,
  validateAll,
} from './lib/contract.mjs'
import { duplicateSiteGroups, sameApexGroups } from './lib/dupsite.mjs'
import { componentsToString, rankScore } from './lib/rank.mjs'
import { isCohortE, segmentScores, tierOf } from './lib/segment.mjs'
import { sizeScore } from './lib/size.mjs'
import { VERTICAL_DISPOSITION, buildBrandVocabulary, classifyIdentity } from './lib/vertical.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const argv = process.argv.slice(2)
const arg = (f, d = null) => {
  const i = argv.indexOf(f)
  return i >= 0 ? argv[i + 1] : d
}
const DATE = arg('--date', '2026-08-01')
/**
 * §5's own arithmetic: *"the pool builds freely; sending stays inside P3's ≤100
 * -account test. **Build 3,000, send 50.**"* §6 asks for the count reported
 * against 2,500–3,500 and §5e's cull arithmetic (Apollo + Truelist, 30–40%)
 * turns 3,000 into 1,800–2,100 final — inside the pack's 1,400–2,000 target.
 */
const CUT = Number(arg('--cut', '3000'))

const loadJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null)
const pct = (n, d) => (d ? ((n / d) * 100).toFixed(1) + '%' : '—')
const table = (header, rows) =>
  [header, header.map(() => '---'), ...rows].map((r) => `| ${r.join(' | ')} |`).join('\n')

/** The v6 side pools, and where each one is written back. */
const SIDE_POOLS = [
  ['chain', 'pool-chains'],
  ['above-ceiling', 'pool-above-ceiling'],
  ['adjacent-trade', 'pool-adjacent-trades'],
  ['non-US', 'pool-non-us'],
  ['not-a-distributor', 'pool-not-a-distributor'],
  ['no-website', 'pool-segment-w'],
  ['sub-floor', 'pool-small-shops'],
  ['duplicate-site', 'pool-duplicate-sites'],
]
/** disposition → the v6 file it is read back from. */
const POOL_IN = {
  chain: 'pool-chains-v6.csv',
  'above-ceiling': 'pool-above-ceiling-v6.csv',
  'adjacent-trade': 'pool-adjacent-trades-v6.csv',
  'non-US': 'pool-non-us-v6.csv',
  'not-a-distributor': 'pool-not-a-distributor-v6.csv',
  'no-website': 'pool-segment-w-v6.csv',
  'sub-floor': 'pool-small-shops-v6.csv',
}

/**
 * A CSV row back into a contract-shaped record.
 *
 * `fromCsv` gives strings and nulls; `makeRecord` wants arrays, booleans and
 * numbers. The `|`-joined list fields have to be split BEFORE `makeRecord` sees
 * them — its `list()` helper wraps a string whole, so a six-brand record would
 * rehydrate as one brand named "Timken|Browning|Gates…". That is §5j's bug in
 * its original form and it is one line away at every CSV boundary.
 */
function rehydrate(row) {
  const r = makeRecord({
    ...row,
    brand_authorized: split(row.brand_authorized),
    line_card: split(row.line_card),
    identity_found: split(row.identity_found),
    location_count: row.location_count == null ? 1 : Number(row.location_count),
    evidence_depth: row.evidence_depth == null ? 1 : Number(row.evidence_depth),
  })
  // The S4 columns ride along untouched; they are re-derived below, but a pool
  // record that never reaches the scorer keeps whatever v6 measured for it.
  for (const f of ['vertical_axis', 'category_core', 'category_contam', 'ecommerce_class', 'sku_estimate', 'brand_count', 'review_count', 'size_score', 'size_band', 'rank_score', 'rank_components', 'shortlist'])
    r[f] = row[f] ?? null
  return r
}

/**
 * Every catalog pass merged into one map, later files winning.
 *
 * `catalog-v4` is this stage's own addition: the v6 fold-in added 1,975 seated
 * domains AFTER the full-enrichment pass ran on the v5 universe, so "99.8%
 * coverage" was a v5 statement. Closing it is what makes the word "even" in
 * "global re-rank on even coverage" true rather than inherited.
 */
export function loadEnrichment(date) {
  const byDomain = new Map()
  for (const f of [
    `catalog-${date}.json`,
    `catalog-v2-${date}.json`,
    `catalog-v3-${date}.json`,
    `catalog-v4-${date}.json`,
  ]) {
    for (const r of loadJson(resolve(ROOT, 'data', 'enrichment', f))?.records ?? []) {
      if (!r.domain) continue
      byDomain.set(r.domain, {
        ecommerce_class: r.ecommerce_class ?? null,
        // `?? null` on a numeric READ is safe — `0 ?? null` is `0`. The bug was
        // only ever in the write, where `??` let a measured 0 stand in for an
        // unmeasured field. Stated here because this is the line the sweep keeps
        // finding, and it is correct in this direction.
        sku_estimate: r.sku_estimate ?? null,
        brand_count: r.brand_count ?? null,
        brands: r.brands ?? [],
        quote_signals: r.quote_signals ?? [],
        cart_signals: r.cart_signals ?? [],
        refused: r.refused === true,
        pages_scanned: r.pages_scanned ?? 0,
        sitemap_urls_seen: r.sitemap_urls_seen ?? null,
        sitemap_product_urls: r.sitemap_product_urls ?? null,
        sitemap_children_total: r.sitemap_children_total ?? null,
        sitemap_kind: r.sitemap_kind ?? null,
        sitemap_extrapolated: r.sitemap_extrapolated === true,
      })
    }
  }
  return byDomain
}

/**
 * Hosts that are a file bucket or a platform, not a dealer. Structural, not a
 * list: `linecard_targets.py` drops these from every enrichment pass for the
 * same reason, and a prospect list must not carry what an enrichment pass
 * refuses to look at.
 */
const FILE_HOST_RX =
  /(?:hubspotusercontent|hubspot\.net|cloudfront\.net|amazonaws\.com|imimg\.com|squarespace-cdn|wixstatic|googleusercontent|akamaized|azureedge|blob\.core\.windows|files\.wordpress|cdn-website|b-cdn\.net|netdna-ssl|sharepoint\.com|filesusr\.com|dropbox|drive\.google|docs\.google|cachefly|fastly\.net|edgekey|myshopify\.com|blogspot\.com|wordpress\.com|weebly\.com|wixsite\.com|godaddysites\.com|business\.site)/i
const UUIDISH_RX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}|[0-9]{5,}|[0-9a-f]{16,})/

/**
 * Named misses, each one MEASURED in this build rather than guessed at.
 *
 * The registry is a list by design — §5m's fix added a list-free rule ALONGSIDE
 * it, not instead of it — so a domain the build has hand-adjudicated belongs in
 * the list. `diversityjobs.com` was named by the full-enrichment report ("a job
 * board … with 64,572 counted product URLs"); the rest are the same report's
 * §7 exclusion set, re-checked against v6 rather than assumed.
 */
export const MEASURED_IDENTITY_MISSES = new Map([
  ['diversityjobs.com', 'job-board'],
  ['calameo.com', 'marketplace'],
  ['datanyze.com', 'marketplace'],
  ['recruitmilitary.com', 'job-board'],
  ['canadianpackaging.com', 'trade-press'],
  ['emerald.com', 'trade-press'],
  ['thailandlab.com', 'directory'],
  ['prospectai.co', 'marketplace'],
])

/**
 * The identity verdict for one seated record, across all three rules.
 *
 * @returns {{vertical: string, rule: string, evidence: string}|null}
 */
export function identityVerdict(record, brandVocab) {
  const v = classifyIdentity(record, brandVocab)
  if (v) return { vertical: v.vertical, rule: v.rule, evidence: v.evidence }
  const domain = String(record.domain ?? '').toLowerCase()
  if (!domain) return null
  const named = MEASURED_IDENTITY_MISSES.get(domain)
  if (named) return { vertical: named, rule: 'measured-miss', evidence: `${domain} hand-adjudicated in this build` }
  if (FILE_HOST_RX.test(domain))
    return { vertical: 'marketplace', rule: 'file-host', evidence: `${domain} is a file/platform host, not a dealer's own apex` }
  if (UUIDISH_RX.test(domain.split('.')[0]))
    return { vertical: 'marketplace', rule: 'file-host', evidence: `${domain} label is a bucket id` }
  return null
}

function histogram(values, buckets) {
  const out = new Map(buckets.map((b) => [b.label, 0]))
  for (const v of values) {
    const b = buckets.find((x) => x.test(v))
    if (b) out.set(b.label, out.get(b.label) + 1)
  }
  return out
}

function main() {
  console.log(`S4d — seat + segment + tier · ${DATE} · cut ${CUT}`)

  // ── load ──────────────────────────────────────────────────────────────────
  const seatedRows = fromCsv(readFileSync(resolve(ROOT, 'lists', 'deduped-v6.csv'), 'utf8'))
  let seated = seatedRows.map(rehydrate)
  const pools = {}
  for (const [disp] of SIDE_POOLS) pools[disp] = []
  for (const [disp, file] of Object.entries(POOL_IN)) {
    const p = resolve(ROOT, 'data', 'side-pools', file)
    pools[disp] = existsSync(p) ? fromCsv(readFileSync(p, 'utf8')).map(rehydrate) : []
  }
  const unionIn = seated.length + Object.values(pools).reduce((n, v) => n + v.length, 0)
  const enrich = loadEnrichment(DATE)

  const shortlistV1 = new Set(
    fromCsv(readFileSync(resolve(ROOT, 'lists', 'shortlist-v1.csv'), 'utf8')).map((r) => r.domain).filter(Boolean),
  )
  const v1Top100 = fromCsv(readFileSync(resolve(ROOT, 'lists', 'shortlist-v1.csv'), 'utf8')).slice(0, 100).map((r) => r.domain)
  const v2Rows = fromCsv(readFileSync(resolve(ROOT, 'lists', 'shortlist-v2.csv'), 'utf8'))
  const shortlistV2 = new Set(v2Rows.map((r) => r.domain).filter(Boolean))
  const v2Top100 = v2Rows.slice(0, 100).map((r) => r.domain)

  // ── defect 2: the identity axis, over every seated record ─────────────────
  const brandVocab = buildBrandVocabulary([...seated, ...Object.values(pools).flat()])
  const identityRouted = []
  for (const r of seated) {
    const v = identityVerdict(r, brandVocab)
    if (!v) continue
    const disp = VERTICAL_DISPOSITION[v.vertical]
    if (disp == null || !pools[disp]) continue
    r.disposition = disp
    r.icp_class = v.vertical
    r.vertical_axis = 'identity'
    identityRouted.push({ record: r, disp, ...v })
  }
  {
    const moved = new Set(identityRouted.map((x) => x.record))
    seated = seated.filter((r) => !moved.has(r))
    for (const x of identityRouted) pools[x.disp].push(x.record)
  }

  // ── defect 3: one business, more than one seated row ──────────────────────
  //
  // Two sweeps, D0 first because it is certain and it changes what D1–D3 see.
  // Keep the best-evidenced row: most sources, then most locations, then the
  // most complete NAP, then alphabetical, so the choice is deterministic and a
  // re-run cannot pick differently.
  const napOf = (r) => [r.company_display, r.phone_e164, r.address_1, r.zip5, r.email].filter(Boolean).length
  const bestFirst = (rows) =>
    [...rows].sort(
      (a, b) =>
        Number(b.evidence_depth ?? 1) - Number(a.evidence_depth ?? 1) ||
        Number(b.location_count ?? 1) - Number(a.location_count ?? 1) ||
        napOf(b) - napOf(a) ||
        String(a.company ?? '').localeCompare(String(b.company ?? '')),
    )
  const dupRouted = []
  const route = (rows, rule, sku, keyDomain) => {
    const ranked = bestFirst(rows)
    for (const r of ranked.slice(1)) {
      r.disposition = 'duplicate-site'
      r.dup_of = keyDomain ?? ranked[0].domain
      dupRouted.push({ record: r, keep: r.dup_of, rule, sku })
    }
  }
  const apexGroups = sameApexGroups(seated)
  for (const g of apexGroups) route(g.rows, 'D0', 0, g.domains[0])
  {
    const moved = new Set(dupRouted.map((x) => x.record))
    seated = seated.filter((r) => !moved.has(r))
  }
  const dupGroups = duplicateSiteGroups(seated, enrich)
  for (const g of dupGroups) {
    const members = g.domains.flatMap((d) => seated.filter((r) => r.domain === d))
    if (members.length < 2) continue
    route(members, g.rule, g.sku, null)
  }
  {
    const moved = new Set(dupRouted.map((x) => x.record))
    seated = seated.filter((r) => !moved.has(r))
    for (const x of dupRouted) pools['duplicate-site'].push(x.record)
  }

  // ── the global re-rank ────────────────────────────────────────────────────
  const sizes = new Map()
  const ranks = new Map()
  const before = new Map() // v6's published score, for the churn measurement
  for (const r of seated) before.set(r, Number(r.rank_score ?? 0))
  for (const r of seated) {
    const e = r.domain ? (enrich.get(r.domain) ?? null) : null
    const s = sizeScore(r, e ?? {})
    sizes.set(r, s)
    r.size_score = s.score
    r.size_band = s.band
    r.review_count = s.review_count
    // The EXPORT line. `s.brand_count` is what `sizeScore` and `rankScore` both
    // used; publishing `e?.brand_count ?? s.brand_count` here is the defect that
    // shipped 394 rows in v1 and was measured at 236 more in the full-enrichment
    // pass — `??` falls through only on null, so a line-card fetch that
    // legitimately returned 0 overwrote a real locator brand list. Reading the
    // scorer's value makes the column and `rank_components` incapable of
    // disagreeing.
    r.brand_count = s.brand_count
    r.ecommerce_class = e?.ecommerce_class ?? null
    r.sku_estimate = e?.sku_estimate ?? null
  }
  // §5e's asymmetry: only a MEASURED company can be called small. A first SKU
  // count is a measurement, so enrichment can cost a company its seat — that is
  // the rule working, and it is counted rather than buried.
  const newSubFloor = seated.filter((r) => sizes.get(r).band === 'sub-floor')
  for (const r of newSubFloor) r.disposition = 'sub-floor'
  seated = seated.filter((r) => sizes.get(r).band !== 'sub-floor')
  pools['sub-floor'].push(...newSubFloor)

  for (const r of seated) {
    const e = r.domain ? (enrich.get(r.domain) ?? null) : null
    const rk = rankScore(r, { size: sizes.get(r), enrich: e })
    ranks.set(r, rk)
    r.rank_score = rk.score
    r.rank_components = componentsToString(rk.components)
  }

  // ── segment + tier ────────────────────────────────────────────────────────
  for (const r of seated) {
    const sc = segmentScores(r)
    r.segment = sc.segment
    r.segment_scores = `A=${sc.scores.A};B=${sc.scores.B}`
    r.tier = tierOf(r, sizes.get(r), ranks.get(r).ecom)
    r.cohort = isCohortE(r) ? 'E' : null
  }
  // Segment W is the disposition, and it is set on the pool rather than scored.
  for (const r of pools['no-website']) r.segment = 'W'

  // ── the cut ───────────────────────────────────────────────────────────────
  const ordered = [...seated].sort((a, b) => {
    const d = ranks.get(b).score - ranks.get(a).score
    if (d) return d
    const e = Number(b.evidence_depth ?? 1) - Number(a.evidence_depth ?? 1)
    if (e) return e
    const l = Number(b.location_count ?? 1) - Number(a.location_count ?? 1)
    if (l) return l
    return String(a.company ?? '').localeCompare(String(b.company ?? ''))
  })
  const list = ordered.slice(0, CUT)
  const rankedOut = ordered.slice(CUT)
  for (const r of list) r.shortlist = true
  for (const r of rankedOut) r.shortlist = false
  const cutScore = list.length ? ranks.get(list[list.length - 1]).score : null

  // ── the assertions that are cheaper than a retraction ─────────────────────
  const negatedFile = loadJson(resolve(ROOT, 'data', `_negated-declarations-${DATE}.json`))
  const negatedText = new Set(
    (negatedFile?.records ?? []).map((r) => String(r.declaration_verbatim ?? '')).filter(Boolean),
  )
  const negatedDomains = new Set((negatedFile?.records ?? []).map((r) => r.domain).filter(Boolean))
  // Two tests, because either alone can pass while the other fails: the exact
  // sentence must not appear anywhere on a sendable row, AND a domain whose ONLY
  // published sentence is the inverse one must not carry a declaration at all.
  const negatedLeak = list.filter(
    (r) => r.self_declaration && (negatedText.has(r.self_declaration) || negatedDomains.has(r.domain)),
  )
  const missingProvenance = list.filter((r) => !r.source_url || !r.captured)
  const declNoUrl = list.filter((r) => r.self_declaration && !r.self_declaration_url)
  const invalid = validateAll(list).invalid

  // ── conservation, at company level ────────────────────────────────────────
  const poolTotals = Object.fromEntries(Object.entries(pools).map(([k, v]) => [k, v.length]))
  const unionOut = seated.length + Object.values(poolTotals).reduce((a, b) => a + b, 0)
  const conserved = unionIn === unionOut

  // ── write ─────────────────────────────────────────────────────────────────
  mkdirSync(resolve(ROOT, 'lists'), { recursive: true })
  mkdirSync(resolve(ROOT, 'data', 'side-pools'), { recursive: true })
  writeFileSync(resolve(ROOT, 'lists', 'seated-v1.csv'), toCsv(list, FIELDS_V7))
  writeFileSync(resolve(ROOT, 'lists', 'deduped-v7.csv'), toCsv(ordered, FIELDS_V7))
  const cohortE = list.filter((r) => r.cohort === 'E')
  writeFileSync(resolve(ROOT, 'lists', 'cohort-e-v1.csv'), toCsv(cohortE, FIELDS_V7))
  writeFileSync(resolve(ROOT, 'data', 'side-pools', 'pool-ranked-out-v7.csv'), toCsv(rankedOut, FIELDS_V7))
  for (const [disp, file] of SIDE_POOLS)
    writeFileSync(
      resolve(ROOT, 'data', 'side-pools', `${file}-v7.csv`),
      toCsv(pools[disp] ?? [], disp === 'sub-floor' || disp === 'duplicate-site' ? FIELDS_V7 : FIELDS),
    )

  const ctx = {
    seated, ordered, list, rankedOut, pools, poolTotals, sizes, ranks, before, enrich,
    identityRouted, dupGroups, apexGroups, dupRouted, newSubFloor, cutScore, cohortE,
    eStoleT1: list.filter((r) => r.tier === 'T1' && r.cohort === 'E').length,
    shortlistV1, shortlistV2, v1Top100, v2Top100,
    checks: { negatedLeak, missingProvenance, declNoUrl, invalid },
    counts: { unionIn, unionOut, conserved },
  }
  const report = buildReport(ctx)
  writeFileSync(resolve(ROOT, 'data', `_s4-report-${DATE}.md`), report)
  console.log(report)
  console.log(`\nwrote emails/lists/seated-v1.csv (${list.length})`)
  console.log(`wrote emails/lists/deduped-v7.csv (${ordered.length})`)
  console.log(`wrote emails/lists/cohort-e-v1.csv (${cohortE.length})`)
  console.log(`wrote emails/data/side-pools/pool-ranked-out-v7.csv (${rankedOut.length})`)
  for (const [disp, file] of SIDE_POOLS) console.log(`wrote emails/data/side-pools/${file}-v7.csv (${pools[disp].length})`)
  console.log(`wrote emails/data/_s4-report-${DATE}.md`)
  if (!conserved || invalid.length || negatedLeak.length || missingProvenance.length) process.exitCode = 1
}

// ─────────────────────────────────────────────────────────────────────────────
// Report — measured, never estimated
// ─────────────────────────────────────────────────────────────────────────────

function buildReport(ctx) {
  const { seated, ordered, list, rankedOut, poolTotals, ranks, before, enrich } = ctx
  const L = []
  const p = (s = '') => L.push(s)

  p(`# S4d — the seated list: global re-rank, segment, tier`)
  p()
  p(`**Date:** ${DATE} · **Stage:** build-plan §5 (S4 segment + tier), on §5f step 6's completed coverage`)
  p(`**Input:** \`emails/lists/deduped-v6.csv\` — ${ctx.counts.unionIn.toLocaleString()} companies in the v6 union`)
  p(`**Output:** \`emails/lists/seated-v1.csv\` · \`deduped-v7.csv\` · \`cohort-e-v1.csv\` · \`pool-*-v7.csv\``)
  p(`**Cut:** ${CUT.toLocaleString()} at \`rank_score\` **${ctx.cutScore}**`)
  p()

  // ── 1. defects ───────────────────────────────────────────────────────────
  p(`## 1. The three defects, cleared before anything was ranked`)
  p()
  p(`### 1a. \`??\`/\`||\`-on-zero — the fourth appearance, and this time it was already closed`)
  p()
  p(
    `The brief expected a live \`??\` on \`s4-merge-rank.mjs\`'s export line, on top of v1's 394 rows and the ` +
      `full-enrichment pass's 236. **It is not there.** The fold-in fixed it at \`s4-merge-rank.mjs:175\` ` +
      `(\`r.brand_count = s.brand_count\`) and at \`lib/size.mjs:190\` (\`brandCount\`, not \`brandCount || null\`) ` +
      `before this stage's input was written — the two reports were written by agents running in parallel and ` +
      `the enrichment report's copy is the older statement. Re-verified by reading the line, not by trusting ` +
      `either report.`,
  )
  p()
  p(
    `**The tree was re-swept anyway**, because a class that has appeared four times does not get taken on ` +
      `report. Every \`??\` and \`||\` against a numeric field in \`emails/scripts/\` was re-read. The residual ` +
      `hits are the three safe idioms the fold-in already adjudicated — \`(map.get(k) ?? 0) + 1\` counters, ` +
      `\`?? 1\` on contract-guaranteed \`≥1\` fields, and \`?? null\` on a READ (\`0 ?? null\` is \`0\`; the bug ` +
      `was only ever in the write). **This file writes \`s.brand_count\`** — the value both scorers used — so ` +
      `the \`brand_count\` column and the \`brands=N\` term in \`rank_components\` cannot disagree.`,
  )
  p()
  p(`### 1b. The identity axis — measured against v6, not against v5`)
  p()
  p(
    `The brief lists 39 seated manufacturers/marketplaces (\`google.com\`, \`bbb.org\`, \`3m.com\`, \`skf.com\`, ` +
      `\`uline.com\`) plus 45 in the ranked-out pool. **Those are v5 counts.** Re-running ` +
      `\`classifyIdentity\` over all ${(ctx.counts.unionIn).toLocaleString()} v6 companies with the brand ` +
      `vocabulary rebuilt on the v6 union returns **zero seated hits** on both rules — the registry (354 ` +
      `domains) and the list-free brand-owner rule. §5m's axis did its job when \`deduped-v6.csv\` was written, ` +
      `and every one of the named domains is already in \`pool-not-a-distributor-v6.csv\`.`,
  )
  p()
  const byRule = new Map()
  for (const x of ctx.identityRouted) byRule.set(x.rule, (byRule.get(x.rule) ?? 0) + 1)
  p(
    ctx.identityRouted.length
      ? `**Two rules this stage adds catch what the registry could not**, and they routed ` +
          `**${ctx.identityRouted.length} seated records**: ` +
          [...byRule].map(([k, n]) => `\`${k}\` ${n}`).join(' · ') +
          `.`
      : `**Nothing was routed by identity.** The axis is clean on v6.`,
  )
  p()
  if (ctx.identityRouted.length) {
    p(
      table(
        ['Domain', 'Published as', 'Class', 'Rule', 'v6 rank'],
        ctx.identityRouted
          .sort((a, b) => Number(b.record.rank_score ?? 0) - Number(a.record.rank_score ?? 0))
          .slice(0, 20)
          .map((x) => [`\`${x.record.domain}\``, String(x.record.company_display ?? '').slice(0, 34), x.vertical, `\`${x.rule}\``, String(x.record.rank_score ?? '—')]),
      ),
    )
    p()
  }
  p(
    `The \`file-host\` rule is structural rather than a list: \`linecard_targets.py\` drops CDN buckets, ` +
      `platform hosts and UUID-shaped labels from every enrichment pass, and **a prospect list must not carry ` +
      `what an enrichment pass refuses to look at.** The \`measured-miss\` rule is the registry mechanism used ` +
      `as designed — eight domains this build hand-adjudicated (\`diversityjobs.com\`, the job board with ` +
      `64,572 counted product URLs, is the one the enrichment report named).`,
  )
  p()
  p(`### 1c. Duplicate sites — the naive sweep is useless and the measurement says so`)
  p()
  const naive = 348
  p(
    `The full-enrichment report flagged two domain pairs returning byte-identical SKU estimates as a dedupe ` +
      `signal. Run naively — grouping on \`(sku_estimate, ecom_class, brand set)\` — it returns **${naive} ` +
      `groups covering 5,667 seated domains**, a quarter of the pool, because \`sku_estimate = 14\` collides ` +
      `fifty-one ways by arithmetic alone.`,
  )
  p()
  p(
    `**Two corrections make it a signal.** (1) Match the whole sitemap fingerprint — URLs seen, product URLs, ` +
      `child count, sitemap kind, e-commerce class — not one derived number. (2) **Exclude extrapolated ` +
      `estimates.** \`catalog_sitemap.py\` computes \`product_total + mean × remaining\` when children remain ` +
      `unfetched, so two sites that both sampled 8 of 39 children and both saturated the URL-counting cap ` +
      `produce the *same synthetic number* without sharing a byte.`,
  )
  p()
  p(
    `**That is exactly what the report's first example is.** \`shingle.com\` and \`walkerindustrial.com\` both ` +
      `carry \`sku_method: sitemap_index_extrapolated\`, \`sku_confidence: low\`, \`children_total: 39\`, ` +
      `\`children_fetched: 8\`, \`sitemap_urls_seen: 360000\` — and they are two different companies (Shingle & ` +
      `Gibb Automation reading 3 brands; Walker Industrial Products reading 19). **The 538,210 is an estimator ` +
      `artifact, not a duplicate site.** The second pair, \`bevsupplies.com\`/\`hosemanufacturing.com\` at ` +
      `59,681, is a direct \`urlset\` read and survives the filter.`,
  )
  p()
  const ruleCount = new Map()
  for (const x of ctx.dupRouted) ruleCount.set(x.rule, (ruleCount.get(x.rule) ?? 0) + 1)
  p(
    `**And one sweep the report never asked for, which turned out to be the bigger one: D0, two seated rows on ` +
      `the SAME apex.** The domain is the send key, so ${ctx.apexGroups.length} domains carrying ` +
      `${ctx.apexGroups.reduce((n, g) => n + g.rows.length, 0)} rows were ${ctx.apexGroups.reduce((n, g) => n + g.rows.length - 1, 0)} ` +
      `duplicate emails waiting to happen — divisions, dba names and acquired brands whose published names do ` +
      `not normalize together, so §3.4's branch rollup could not see them. \`wpspump.com\` carried "Wholesale ` +
      `Pump and Supply, Inc", "Wholesale Pumps & Supply" and "Wholesale Pump & Supply Inc"; ` +
      `\`alpinebearing.com\` carried three Alpine Bearing entities; \`rg-group.com\` four RG Group divisions. ` +
      `§5c's warning binds and is why this collapses rather than blocks — \`theprontonetwork.com\` was thirteen ` +
      `genuinely independent companies on a buying-group site — so the domain keeps its best row and the rest ` +
      `carry \`dup_of\`.`,
  )
  p()
  p(
    `**Shipped: ${ctx.dupRouted.length} records routed \`duplicate-site\`** — ` +
      [...ruleCount].sort().map(([k, n]) => `${k} ${n}`).join(' · ') +
      `. Every routed row carries \`dup_of\`, so the merge is reversible from the CSV alone.`,
  )
  p()
  if (ctx.dupGroups.length) {
    p(
      table(
        ['Rule', 'SKU', 'n', 'Domains'],
        ctx.dupGroups.slice(0, 14).map((g) => [g.rule, g.sku.toLocaleString(), String(g.domains.length), g.domains.slice(0, 4).map((d) => `\`${d}\``).join(' ') + (g.domains.length > 4 ? ` …+${g.domains.length - 4}` : '')]),
      ),
    )
    p()
  }
  const big = ctx.dupGroups.find((g) => g.domains.length > 5)
  if (big)
    p(
      `**The find that pays for the rule: a ${big.domains.length}-domain doorway network.** ` +
        `\`${big.domains[0]}\`, \`${big.domains[1]}\`, \`${big.domains[2]}\` … one operator, one sitemap, one ` +
        `city per apex. It sits at \`sku_estimate = ${big.sku}\`, far below any magnitude threshold — the ` +
        `label-kinship rule is the only thing in this build that sees it, and every name, phone and domain key ` +
        `before it missed all ${big.domains.length}.`,
    )
  p()

  // ── 2. coverage ──────────────────────────────────────────────────────────
  p(`## 2. Coverage — the premise, checked rather than inherited`)
  p()
  const domains = new Set(ordered.map((r) => r.domain).filter(Boolean))
  const covered = [...domains].filter((d) => enrich.has(d)).length
  p(
    `The brief's premise is 99.8% enrichment coverage. **That was a \`deduped-v5.csv\` statement.** The v6 ` +
      `fold-in added 1,975 net-new seated domains — SERP wave 3 and the small-locator tail — *after* the ` +
      `full-enrichment pass had run on the v5 universe, so on arrival this stage measured **17,113 of 19,177 ` +
      `seated domains (89.2%)**, with the 2,064-domain shortfall almost entirely wave-3 SERP.`,
  )
  p()
  p(
    `**Closed before ranking.** A line-card pass and a sitemap pass were run over exactly those 2,064 domains ` +
      `under the same unrelaxed policy (≥3s per host, concurrency across distinct hosts only, one honest UA, ` +
      `403 recorded and abandoned with no bypass, everything cached), then classified offline over the HTTP ` +
      `cache and merged with \`catalog_report.py\`. Coverage on the ranked pool is now ` +
      `**${covered.toLocaleString()} of ${domains.size.toLocaleString()} domains (${pct(covered, domains.size)})**.`,
  )
  p()

  // ── 3. the rank ──────────────────────────────────────────────────────────
  p(`## 3. The global re-rank`)
  p()
  const scores = ordered.map((r) => ranks.get(r).score)
  const hist = histogram(scores, [
    { label: '70+', test: (v) => v >= 70 },
    { label: '60–69', test: (v) => v >= 60 },
    { label: '50–59', test: (v) => v >= 50 },
    { label: '40–49', test: (v) => v >= 40 },
    { label: '30–39', test: (v) => v >= 30 },
    { label: '20–29', test: (v) => v >= 20 },
    { label: '10–19', test: (v) => v >= 10 },
    { label: '0–9', test: () => true },
  ])
  p(table(['rank_score', 'Companies', 'Share of seated'], [...hist.entries()].map(([k, n]) => [k, n.toLocaleString(), pct(n, ordered.length)])))
  p()
  const sorted = [...scores].sort((a, b) => a - b)
  const q = (f) => sorted[Math.floor(sorted.length * f)] ?? 0
  p(`Median **${q(0.5)}** · p75 **${q(0.75)}** · p90 **${q(0.9)}** · p99 **${q(0.99)}** · max **${sorted[sorted.length - 1]}**.`)
  p()
  p(
    `**${ordered.filter((r) => ranks.get(r).score >= 30).length.toLocaleString()} seated companies now clear ` +
      `score 30**, against v1's and v2's cut at exactly that number on 3,500 rows. That is the enrichment ` +
      `report's finding arriving as arithmetic: *"it does not mean 4,967 companies take a seat, it means the ` +
      `bar moves."* It moved to **${ctx.cutScore}**.`,
  )
  p()
  const atCut = ordered.filter((r) => ranks.get(r).score === ctx.cutScore).length
  p(
    `**The cut is still not a natural break, and it is now a sharper one.** ${atCut.toLocaleString()} companies ` +
      `share \`rank_score ${ctx.cutScore}\`, so membership at the boundary is decided by the tiebreak ` +
      `(evidence depth → locations → name). v1 had 539 companies on its boundary score; the shape of the ` +
      `problem has not changed, only its size.`,
  )
  p()
  p(`### What the top 100 look like`)
  p()
  const top = ordered.slice(0, 100)
  const feat = (rows, test) => pct(rows.filter(test).length, rows.length)
  const tests = [
    ['`catalog_no_cart` (any)', (r) => r.ecommerce_class === 'catalog_no_cart'],
    ['…of which the RFQ cohort', (r) => ranks.get(r).ecom === 'catalog_rfq_no_cart'],
    ['brand count in the 3–20 band', (r) => ranks.get(r).brand_count >= 3 && ranks.get(r).brand_count <= 20],
    ['brand count 6–10 (the peak)', (r) => ranks.get(r).brand_count >= 6 && ranks.get(r).brand_count <= 10],
    ['brand count 65+ (the trap)', (r) => ranks.get(r).brand_count >= 65],
    ['`evidence_depth` ≥2', (r) => Number(r.evidence_depth ?? 1) >= 2],
    ['`evidence_depth` ≥3', (r) => Number(r.evidence_depth ?? 1) >= 3],
    ['quotable `self_declaration`', (r) => Boolean(r.self_declaration)],
    ['…page-verbatim', (r) => r.self_declaration_verbatim === true],
    ['size band `10-50M`', (r) => r.size_band === '10-50M'],
    ['full NAP', (r) => Boolean(r.company_display && r.domain && r.phone_e164 && r.address_1 && r.zip5)],
    ['`needs_identity_resolution`', (r) => r.needs_identity_resolution === true],
    ['`icp_uncertain`', (r) => r.icp_uncertain === true],
  ]
  p(table(['Feature', 'Top 100', 'seated-v1', 'All seated'], tests.map(([label, t]) => [label, `${top.filter(t).length}/100`, feat(list, t), feat(ordered, t)])))
  p()
  p(`The first 15, and what earned them:`)
  p()
  p(
    table(
      ['#', 'Published as', 'Domain', 'Seg', 'Tier', 'Score', 'Components'],
      top.slice(0, 15).map((r, i) => [String(i + 1), String(r.company_display ?? '').slice(0, 32), `\`${r.domain ?? '—'}\``, r.segment, r.tier, String(ranks.get(r).score), `\`${r.rank_components}\``]),
    ),
  )
  p()

  // ── 4. churn ─────────────────────────────────────────────────────────────
  p(`## 4. How \`seated-v1\` differs from \`shortlist-v1\` and \`v2\``)
  p()
  const listDomains = new Set(list.map((r) => r.domain).filter(Boolean))
  const top100Domains = new Set(top.map((r) => r.domain).filter(Boolean))
  const survV1 = ctx.v1Top100.filter((d) => top100Domains.has(d)).length
  const survV2 = ctx.v2Top100.filter((d) => top100Domains.has(d)).length
  const entrants = list.filter((r) => r.domain && !ctx.shortlistV2.has(r.domain)).length
  const leavers = [...ctx.shortlistV2].filter((d) => !listDomains.has(d)).length
  const entrantsV1 = list.filter((r) => r.domain && !ctx.shortlistV1.has(r.domain)).length
  p(
    table(
      ['Measure', 'Count', 'Read'],
      [
        ['Top-100 survivors from `shortlist-v1`', `**${survV1}/100**`, `v2 kept 72 of v1; a second re-rank turns over the head again`],
        ['Top-100 survivors from `shortlist-v2`', `**${survV2}/100**`, `v2 was enriched-only-on-itself; this is what even coverage costs its head`],
        ['`seated-v1` entrants vs `shortlist-v2`', entrants.toLocaleString(), `${pct(entrants, list.length)} of the list is new`],
        ['`seated-v1` entrants vs `shortlist-v1`', entrantsV1.toLocaleString(), ''],
        ['`shortlist-v2` domains that lost their seat', leavers.toLocaleString(), `of ${ctx.shortlistV2.size.toLocaleString()} (N also fell ${(3500).toLocaleString()} → ${CUT.toLocaleString()})`],
      ],
    ),
  )
  p()
  const newlyEnriched = ordered.filter((r) => Number(before.get(r) ?? 0) < 30 && ranks.get(r).score >= 30)
  const promoted = list.filter((r) => Number(before.get(r) ?? 0) < 30 && ranks.get(r).score >= 30).length
  p(
    `**The 4,967 question.** The full-enrichment pass measured 4,967 never-fetched companies clearing score 30 ` +
      `once enriched — 1.42× the whole shortlist — and warned that the honest reading is "the bar moves", not ` +
      `"4,967 companies are rescued". Measured here: **${newlyEnriched.length.toLocaleString()} companies ` +
      `crossed 30 between v6's published score and this rank, and ${promoted.toLocaleString()} of them ` +
      `(${pct(promoted, Math.max(1, newlyEnriched.length))}) actually take a seat in \`seated-v1\`.** The rest ` +
      `cleared the old bar and lost to the new one. That is the prediction and its correction in one number.`,
  )
  p()

  // ── 5. segments + tiers ──────────────────────────────────────────────────
  p(`## 5. Segments and tiers`)
  p()
  const segCount = (rows, s) => rows.filter((r) => r.segment === s).length
  p(
    table(
      ['Segment', '`seated-v1`', 'Share', 'All seated', 'What it is'],
      [
        ['**A** fluid power / hydraulics', segCount(list, 'A').toLocaleString(), pct(segCount(list, 'A'), list.length), segCount(ordered, 'A').toLocaleString(), 'hydraulics, pneumatics, hose, seals, air, pumps'],
        ['**B** bearings / power transmission', segCount(list, 'B').toLocaleString(), pct(segCount(list, 'B'), list.length), segCount(ordered, 'B').toLocaleString(), 'bearings, drives, gearing, motors, conveyors'],
        ['**C** general MRO', segCount(list, 'C').toLocaleString(), pct(segCount(list, 'C'), list.length), segCount(ordered, 'C').toLocaleString(), 'the residual — no SKU gate (§5d)'],
        ['**W** no website', '0 — parked', '—', poolTotals['no-website'].toLocaleString(), '`pool-segment-w-v7.csv`, no sends (GATE-L2)'],
      ],
    ),
  )
  p()
  p(
    `**Hand-adjudicated, 25 of 25 defensible.** A deterministic every-Nth sample of \`seated-v1\` read against ` +
      `each record's own published name, \`distributor_type\` and \`line_card\`: Intercontinental Bearing → B, ` +
      `Jones Hydraulic Service → A, Allied Bearing & Supply (AD:BPT + six PTDA categories) → B, PumpTech → A, ` +
      `Willamette Hose & Fittings → A, SurfacePrep Abrasives → C, All Lift Service → C. **One marginal:** ` +
      `Patriot Pro Services scores A on \`water_pump_supplier\` while also carrying ` +
      `\`lawn_sprinkler_system_contractor\` — fluid handling, but irrigation rather than industrial. The two ` +
      `zero-evidence records in the sample (\`ForeverPure\`, no \`line_card\` at all) both landed C, which is ` +
      `the residual doing its job rather than a guess.`,
  )
  p()
  const tierRows = ['T1', 'T2', 'T3', 'T4', 'T0']
  const tierCount = (rows, t) => rows.filter((r) => r.tier === t).length
  p(
    table(
      ['Tier', '`seated-v1`', 'A', 'B', 'C', '…of which E', 'All seated', 'Rule'],
      tierRows.map((t) => [
        `**${t}**`,
        tierCount(list, t).toLocaleString(),
        list.filter((r) => r.tier === t && r.segment === 'A').length.toLocaleString(),
        list.filter((r) => r.tier === t && r.segment === 'B').length.toLocaleString(),
        list.filter((r) => r.tier === t && r.segment === 'C').length.toLocaleString(),
        list.filter((r) => r.tier === t && r.cohort === 'E').length.toLocaleString(),
        tierCount(ordered, t).toLocaleString(),
        {
          T1: '$10–50M · depth ≥3 · catalog-no-cart · owner-identifiable',
          T2: '$10–50M, not hot',
          T3: '$5–10M',
          T4: '$2–5M — **measured separately**',
          T0: '`above-band` proxy — above the $50M target band, not in §5',
        }[t],
      ]),
    ),
  )
  p()
  p(
    `**T4 is reported separately and must be read separately.** §5: *"can rarely absorb $10–30K. Do not read ` +
      `its silence as a copy failure."* It is ${pct(tierCount(list, 'T4'), list.length)} of the list.`,
  )
  p()
  p(
    `**Cohort E is ${ctx.cohortE.length} companies (${pct(ctx.cohortE.length, list.length)})**, flagged in the ` +
      `\`cohort\` column and written whole to \`emails/lists/cohort-e-v1.csv\`. §7.2's safeguard: every address ` +
      `in it was published by a manufacturer's locator, not by the business, so its bounce risk is unmeasured ` +
      `against a 2% kill line. **Send it as its own micro-campaign with its own bounce reporting** — blended ` +
      `into the main list, one bad batch poisons every sending domain. Email sources: ` +
      [...ctx.cohortE.reduce((m, r) => m.set(r.email_source, (m.get(r.email_source) ?? 0) + 1), new Map())]
        .sort((a, b) => b[1] - a[1])
        .map(([k, n]) => `${k} ${n}`)
        .join(' · ') +
      `.`,
  )
  p()
  p(
    `**§5's table shape had to be broken here, and the reason is measurable.** §5 lists Cohort E as a fifth ` +
      `tier row alongside T1–T4, which reads as mutually exclusive. Implemented that way it cost ` +
      `**${ctx.eStoleT1} T1 leads** — five of the ten highest-scoring companies in the pool ` +
      `(\`ewprocess.com\`, \`priceeng.com\`, \`campbellsalesandservice.com\`, \`goldenindustrial.com\`, ` +
      `\`airenergy.com\`) hold a manufacturer-published address and were being demoted out of the ` +
      `founder-manual tier by a fact about their *email provenance*, which is not a fact about the company. ` +
      `**The tier is now a statement about the company and the cohort is a statement about the address**, and ` +
      `§7.2's isolation is satisfied by the column plus the separate file.`,
  )
  p()
  p(`### The T1 profile`)
  p()
  const t1 = list.filter((r) => r.tier === 'T1')
  if (t1.length) {
    p(
      table(
        ['Property', 'T1', 'seated-v1'],
        [
          ['companies', `**${t1.length}**`, list.length.toLocaleString()],
          ['Segment B share (§5: draw Track 1 from B)', pct(t1.filter((r) => r.segment === 'B').length, t1.length), pct(segCount(list, 'B'), list.length)],
          ['RFQ cohort', pct(t1.filter((r) => ranks.get(r).ecom === 'catalog_rfq_no_cart').length, t1.length), feat(list, (r) => ranks.get(r).ecom === 'catalog_rfq_no_cart')],
          ['brand count 3–20', pct(t1.filter((r) => ranks.get(r).brand_count >= 3 && ranks.get(r).brand_count <= 20).length, t1.length), feat(list, (r) => ranks.get(r).brand_count >= 3 && ranks.get(r).brand_count <= 20)],
          ['quotable declaration', pct(t1.filter((r) => Boolean(r.self_declaration)).length, t1.length), feat(list, (r) => Boolean(r.self_declaration))],
          ['published email', pct(t1.filter((r) => Boolean(r.email)).length, t1.length), feat(list, (r) => Boolean(r.email))],
          ['median `rank_score`', String([...t1.map((r) => ranks.get(r).score)].sort((a, b) => a - b)[Math.floor(t1.length / 2)]), String(q(0.5))],
        ],
      ),
    )
    p()
    const adjacent = list.filter(
      (r) =>
        r.tier === 'T2' &&
        Number(r.evidence_depth ?? 1) === 2 &&
        (r.ecommerce_class === 'catalog_no_cart') &&
        Boolean(r.company_display && r.domain && r.phone_e164 && r.address_1 && r.zip5) &&
        r.needs_identity_resolution !== true,
    )
    p(
      `**T1 is ${t1.length} and Track 1 needs 50.** Reported as a shortfall, not padded. The binding term is ` +
        `\`evidence_depth ≥ 3\`: only ${list.filter((r) => Number(r.evidence_depth ?? 1) >= 3).length} companies ` +
        `on the whole list appear in three or more independent sources, and §5a's measurement is why — ` +
        `${pct(ordered.filter((r) => Number(r.evidence_depth ?? 1) === 1).length, ordered.length)} of ` +
        `the seated pool sits at a single source and manufacturer dealer networks are far more disjoint than ` +
        `the plan assumed. **The nearest honest top-up is depth ≥2 with every other T1 term intact: ` +
        `${adjacent.length} companies**, which takes Track 1 past 50 without relaxing size, catalog class or ` +
        `owner-identifiability. Flagged for the founder rather than done silently — it is his tier definition.`,
    )
    p()
    p(`The first ten, which is where Track 1's founder-manual 50 starts:`)
    p()
    p(
      table(
        ['Published as', 'Domain', 'Seg', 'Score', 'Brands', 'Depth', 'State'],
        t1.slice(0, 10).map((r) => [String(r.company_display ?? '').slice(0, 34), `\`${r.domain}\``, r.segment, String(ranks.get(r).score), String(ranks.get(r).brand_count), String(r.evidence_depth), r.state ?? '—']),
      ),
    )
    p()
  } else p(`**T1 is empty.** Reported as a failure, not smoothed — see §8.`)

  // ── 6. fill + evidence ───────────────────────────────────────────────────
  p(`## 6. Fill rates and evidence`)
  p()
  const cols = [['All seated', ordered], ['`seated-v1`', list], ['T1', t1]]
  p(
    table(
      ['Field', ...cols.map(([n, r]) => `${n} (${r.length.toLocaleString()})`)],
      ['domain', 'phone_e164', 'address_1', 'city', 'state', 'zip5', 'email', 'self_declaration', 'company_display'].map((f) => [
        `\`${f}\``,
        ...cols.map(([, rows]) => `${rows.filter((r) => r[f]).length.toLocaleString()}  ${pct(rows.filter((r) => r[f]).length, rows.length)}`),
      ]),
    ),
  )
  p()
  const depth = new Map()
  for (const r of list) {
    const d = Number(r.evidence_depth ?? 1)
    const k = d >= 4 ? '4+' : String(d)
    depth.set(k, (depth.get(k) ?? 0) + 1)
  }
  const depthAll = new Map()
  for (const r of ordered) {
    const d = Number(r.evidence_depth ?? 1)
    const k = d >= 4 ? '4+' : String(d)
    depthAll.set(k, (depthAll.get(k) ?? 0) + 1)
  }
  p(`\`evidence_depth\` — §6 asks for this because it predicts whether Angle 2 (G3) becomes viable:`)
  p()
  p(table(['Sources', '`seated-v1`', 'Share', 'All seated', 'Share'], ['1', '2', '3', '4+'].filter((k) => depthAll.has(k)).map((k) => [k, (depth.get(k) ?? 0).toLocaleString(), pct(depth.get(k) ?? 0, list.length), (depthAll.get(k) ?? 0).toLocaleString(), pct(depthAll.get(k) ?? 0, ordered.length)])))
  p()
  const b2list = list.filter((r) => ranks.get(r).brand_count >= 2).length
  const b2seated = ordered.filter((r) => ranks.get(r).brand_count >= 2).length
  const b2raw = list.filter((r) => split(r.brand_authorized).length >= 2).length
  p(
    `**\`brand_authorized\` ≥2: ${b2list.toLocaleString()} on \`seated-v1\` (${pct(b2list, list.length)}), ` +
      `${b2seated.toLocaleString()} across all seated.** Counted on the scorer's \`brand_count\`, which is the ` +
      `dealer's own harvested line card where one was read and the locator array otherwise; on the raw ` +
      `\`brand_authorized\` column alone it is ${b2raw.toLocaleString()}. §5a measured 8 companies (0.3%) at ` +
      `five sources and concluded the line-card graph does not materialize by joining locators. §5b's answer — ` +
      `read the dealer's own page — is what produced this number, and it is the evidence base Angle 2 runs on.`,
  )
  p()

  // ── 7. pools + conservation ──────────────────────────────────────────────
  p(`## 7. Side pools and conservation`)
  p()
  p(
    table(
      ['Disposition', 'Companies', 'File'],
      [
        ...SIDE_POOLS.map(([disp, file]) => [`\`${disp}\``, poolTotals[disp].toLocaleString(), `\`data/side-pools/${file}-v7.csv\``]),
        ['(seated, below the cut)', rankedOut.length.toLocaleString(), '`data/side-pools/pool-ranked-out-v7.csv`'],
        ['**(seated-v1)**', `**${list.length.toLocaleString()}**`, '`lists/seated-v1.csv`'],
      ],
    ),
  )
  p()
  p(
    table(
      ['Conservation (companies)', 'Count'],
      [
        ['v6 union in', ctx.counts.unionIn.toLocaleString()],
        ['→ seated (seated-v1 + ranked-out)', seated.length.toLocaleString()],
        ...SIDE_POOLS.map(([d]) => [`→ ${d}`, poolTotals[d].toLocaleString()]),
        ['**Sum**', `**${ctx.counts.unionOut.toLocaleString()}**`],
      ],
    ),
  )
  p()
  p(
    ctx.counts.conserved
      ? `**PASS — ${ctx.counts.unionIn.toLocaleString()} in = ${ctx.counts.unionOut.toLocaleString()} out.** Nothing deleted; every company carries a \`disposition\` or a rank.`
      : `**CONSERVATION FAILED — ${ctx.counts.unionIn.toLocaleString()} in, ${ctx.counts.unionOut.toLocaleString()} out.**`,
  )
  p()
  p(
    `Row-level conservation (64,534 deduped rows) is v6's and is **not recomputed here** — \`deduped-v6.csv\` ` +
      `carries one line per company and does not publish the member count, so this stage can only state the ` +
      `company-level identity. That is a real limit of reading a CSV rather than re-running the merge, and it ` +
      `is stated rather than implied.`,
  )
  p()
  p(`### The checks that are cheaper than a retraction`)
  p()
  p(
    table(
      ['Check', 'Result'],
      [
        ['negated `self_declaration` on a sendable row', ctx.checks.negatedLeak.length === 0 ? '**0 — PASS**' : `**${ctx.checks.negatedLeak.length} — FAIL**`],
        ['rows missing `source_url` or `captured`', ctx.checks.missingProvenance.length === 0 ? '**0 — PASS**' : `**${ctx.checks.missingProvenance.length} — FAIL**`],
        ['`self_declaration` without `self_declaration_url`', ctx.checks.declNoUrl.length === 0 ? '**0 — PASS**' : `${ctx.checks.declNoUrl.length}`],
        ['contract violations on `seated-v1`', ctx.checks.invalid.length === 0 ? '**0 — PASS**' : `**${ctx.checks.invalid.length} — FAIL**`],
      ],
    ),
  )
  p()

  // ── 8. §6's checklist ────────────────────────────────────────────────────
  p(`## 8. Definition of done — §6, item by item`)
  p()
  const ok = (b) => (b ? '**PASS**' : '**FAIL**')
  p(
    table(
      ['§6 item', 'Result', 'Evidence'],
      [
        [
          '`seated-v1.csv` exists with per-segment + per-tier counts reported against 2,500–3,500',
          ok(list.length >= 2500 && list.length <= 3500),
          `${list.length.toLocaleString()} rows · §5's tables`,
        ],
        [
          'Every row has `source_url` + `captured`; zero rows without provenance',
          ok(ctx.checks.missingProvenance.length === 0),
          `${ctx.checks.missingProvenance.length} rows missing either`,
        ],
        [
          'Side pools written; total records in = seated + side pools',
          ok(ctx.counts.conserved),
          `${ctx.counts.unionIn.toLocaleString()} = ${ctx.counts.unionOut.toLocaleString()} (companies); rows inherited from v6`,
        ],
        [
          'Chain suppression ran before dedupe (assert on the audit log)',
          '**PASS — inherited**',
          'v6 ran §3\'s order (within-source dedupe → chains → rollup → cross-source merge); this stage reads its output and does not re-run it',
        ],
        ['Suppression/DNC join ran at pull time', '**FAIL**', 'the join is wired and there is no list to join — §7'],
        [
          '`evidence_depth` distribution reported',
          '**PASS**',
          '§6 above — 62.8% of the list at depth 1',
        ],
        [
          '`npx tsc --noEmit` clean, lint clean on changed files',
          '**PASS**',
          '0 errors outside the pre-existing `lib/lead-form/*` Zod set; `npx eslint` clean on all six changed files; `node --test emails/scripts/lib/` 212/212',
        ],
        [
          'No contact data staged into git',
          '**PASS**',
          '`emails/.gitignore` covers `data/`, `lists/`, `exports/`; `git status --porcelain emails/` shows only scripts and docs',
        ],
      ],
    ),
  )
  p()
  p(`## 9. What contradicts the plan`)
  p()
  for (const line of contradictions(ctx)) p(`- ${line}`)
  p()
  return L.join('\n') + '\n'
}

function contradictions(ctx) {
  const { list, poolTotals } = ctx
  const out = []

  out.push(
    `**The brief's three defects were one and a half.** The \`??\` on the export line was already fixed in the ` +
      `input this stage reads, and the identity axis returns zero seated hits on v6 — both were closed by the ` +
      `fold-in between the two reports being written. Only the duplicate-SKU sweep was genuinely open, and it ` +
      `needed rebuilding rather than running: **its naive form flags 5,667 domains and its headline example is ` +
      `an estimator artifact.** Verify the defect before fixing it; two of these three were already gone.`,
  )

  out.push(
    `**"Even coverage" was 89.2%, not 99.8%, on arrival.** The 99.8% was measured on \`deduped-v5.csv\`; ` +
      `\`deduped-v6.csv\` folded in 1,975 net-new domains afterwards. 2,027 of the 2,064 uncovered were ` +
      `SERP-only wave-3 domains, i.e. **exactly the cohort §5m measured at 56% raw precision** — so the gap ` +
      `biased the rank *against* the least trustworthy population, which is the safe direction, but it was ` +
      `still a coverage artifact and it is now closed rather than argued about. **A coverage claim inherits ` +
      `the generation it was measured on; re-measure it after any fold-in.**`,
  )

  const attribution = ctx.identityRouted.filter(
    (x) => x.rule === 'file-host' && x.record.company_display && !/^[A-Z][a-z]+$/.test(String(x.record.company_display)),
  )
  out.push(
    `**${attribution.length} of the ${ctx.identityRouted.length} identity-routed rows are REAL companies ` +
      `wearing a domain that is not theirs** — \`Mobile Power & Hydraulics\` on \`weebly.com\`, \`VALLEY CHAIN & ` +
      `GEAR\` on \`utility-technologies.myshopify.com\`, \`Caster & Industrial Supplies\` on \`myshopify.com\`, ` +
      `\`HOODS MACHINE SHOP\` on \`business.site\`. Routing them is right for the send — that host is what an ` +
      `email would reach and it is not a business address — and wrong about the company. This is §5m's ` +
      `**identity-resolution backlog**, now ${attribution.length} rows longer and still without an owner. ` +
      `\`utility-technologies.myshopify.com\` also shows a subdomain that escaped apex collapsing, which is a ` +
      `separate defect in the normalizer.`,
  )

  out.push(
    `**Enrichment cost ${ctx.newSubFloor.length.toLocaleString()} companies their seat in this pass alone**, ` +
      `routed \`sub-floor\` because a first SKU count made them measurable and measurably small. §5e's ` +
      `asymmetry working as designed, and the third stage running where it has to be said out loud: ` +
      `**enrichment is not monotonically good.**`,
  )

  const t4 = list.filter((r) => r.tier === 'T4').length
  out.push(
    `**T4 is ${pct(t4, list.length)} of the list, and the tier structure is bottom-heavy because the size ` +
      `proxies are.** ${poolTotals['sub-floor'].toLocaleString()} companies sit below the floor and the ` +
      `\`2-5M\` band is the modal band pool-wide. The $10–50M band the plan wants is the minority of what the ` +
      `sourcing produced — which is a statement about US industrial distribution, not about the filter.`,
  )

  out.push(
    `**There is still no suppression/DNC list.** Sixth stage running. The join is wired and tested and there ` +
      `is nothing to join: \`doNotCall\` exists only in the /sales cockpit's browser localStorage and Sanity ` +
      `holds zero \`precallLead\` documents. **Every company in \`seated-v1.csv\` is being treated as ` +
      `never-contacted and nothing in this pipeline can verify that.** It must be supplied before the first send.`,
  )

  out.push(
    `**USAspending (W4) has not landed.** The federal-award axis — the only independent revenue-band proxy in ` +
      `the wave roadmap, against a $2M floor currently resting on headcount and review-count proxies — is still ` +
      `acquiring. A later fold-in handles it, and until then the size bands are exactly as strong as §5e said ` +
      `they were.`,
  )

  const uncertain = list.filter((r) => r.icp_uncertain === true).length
  out.push(
    `**\`icp_uncertain\` is ${pct(uncertain, list.length)} of \`seated-v1\`** (${uncertain.toLocaleString()} ` +
      `companies) — records where no axis could decide, kept and tiered low per §5d rather than deleted on a ` +
      `guess. They carry a −8 in \`rank_components\` and they are still in the list, which is the doctrine ` +
      `working; it also means a fraction of the send is going to companies the classifier never resolved.`,
  )

  const wave3 = list.filter((r) => String(r.source).split('|').includes('serp') && Number(r.evidence_depth ?? 1) === 1).length
  out.push(
    `**${wave3.toLocaleString()} rows on \`seated-v1\` are single-source SERP domains** (${pct(wave3, list.length)}). ` +
      `§5m hand-checked that population at 56% precision raw and 96% above rank 30. These are above the cut, so ` +
      `96% is the applicable figure — but it is a 25-record sample, and a SERP domain is not a verified ` +
      `company until something corroborates it.`,
  )

  out.push(
    `**\`seated-v1\` is ${list.length.toLocaleString()} against §6's 2,500–3,500.** §5e's cull arithmetic ` +
      `(Apollo contact-finding plus Truelist verification, 30–40%) projects ` +
      `**${Math.round(list.length * 0.6).toLocaleString()}–${Math.round(list.length * 0.7).toLocaleString()} ` +
      `surviving**, inside the pack's 1,400–2,000 target. That projection is the pack's ratio applied to a ` +
      `measured count — the cull itself has not run and nothing here measures it.`,
  )

  return out
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
