#!/usr/bin/env node
/**
 * S4 — merge the full acquisition haul, filter it, and RANK it. Build-plan §5f.
 *
 * §5f inverted the pipeline. The plan's order was "qualify everything, then
 * rank"; at 17,472 domains a single catalog-depth pass is 14+ hours, so the
 * order is now:
 *
 *   1. merge + normalize      every source, offline, through S2's own pipeline
 *   2. vertical filter        `category_ids` first — the cheapest, biggest cut
 *   3. chain suppression      + within-source then cross-source dedupe
 *   4. size proxies           from signals already in hand, SCORED not gated
 *   5. rank and cut           to a shortlist of ~3,000–4,000
 *   6. …enrich, later         NOT here. Nothing in this file touches a network.
 *
 * **This stage extends S2/S3 rather than replacing them.** Steps 1–3 are
 * `runS3c()`, which is `runS3a()`, which is `runPipeline()` — the same code that
 * produced v2, v3 and v4, called with `sources: SOURCES_V5` and `serpWave2:
 * true` instead of the defaults. Called bare those stages still reproduce their
 * own files byte-for-byte; the new haul is an argument, not a fork.
 *
 * ## What is new here
 *
 *   - `lib/category.mjs`  the DFS `category_ids` axis (§5f's contamination
 *                         clusters, with the single-code rule built in)
 *   - `lib/size.mjs`      §4.5's proxy stack, scored — §5e: "a floor you cannot
 *                         measure is fiction"
 *   - `lib/rank.mjs`      §5f step 5, with §5d's two measured findings encoded:
 *                         the 226-domain catalog-no-cart cohort ranks highest,
 *                         and brand breadth is NOT monotonic
 *
 * ## Rules this stage does not get to break
 *
 *   - **Nothing is deleted.** Failing the size floor sets `disposition:
 *     sub-floor` and routes to `pool-small-shops.csv`; failing the RANK sets no
 *     disposition at all and routes to `pool-ranked-out.csv`, still seated in
 *     `deduped-v5.csv`. A rank is an ordering, not a verdict.
 *   - `source_url` + `captured` on every row; `self_declaration` byte-exact.
 *   - Conservation: every deduped input row lands in exactly one bucket.
 *
 * Usage: `node emails/scripts/s4-merge-rank.mjs [--cut 3500] [--date 2026-08-01]`
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { classifyCategories } from './lib/category.mjs'
import { FIELDS, FIELDS_V5, capturedToday, split, toCsv, validateAll } from './lib/contract.mjs'
import { componentsToString, rankScore } from './lib/rank.mjs'
import { sizeScore } from './lib/size.mjs'
import {
  VERTICAL_DISPOSITION,
  buildBrandVocabulary,
  classifyIdentity,
  classifyName,
  mergeVerdicts,
} from './lib/vertical.mjs'
import { SOURCES_V5 } from './s2-dedupe.mjs'
import { runS3c } from './s3c-classify.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const argv = process.argv.slice(2)
const arg = (f, d = null) => {
  const i = argv.indexOf(f)
  return i >= 0 ? argv[i + 1] : d
}
const DATE = arg('--date', capturedToday())
/** §5f: "rank and cut to ~3,000–4,000". The midpoint, overridable. */
const CUT = Number(arg('--cut', '3500'))
/**
 * Output generation. Bare, this stage writes `deduped-v5.csv` /
 * `shortlist-v1.csv` and the untagged side pools, exactly as it always has.
 * `--tag v6` writes `deduped-v6.csv` and `pool-*-v6.csv` instead, so a fold-in
 * can be measured against v5 without overwriting the artifact it is compared to.
 *
 * **A tagged run deliberately writes NO shortlist.** The fold-in lands on
 * uneven enrichment coverage (the shortlist is 100% enriched, the ranked-out
 * pool 4.5%), so a cut taken now would encode who we happened to fetch. §5f
 * step 6 re-ranks globally once coverage is even; until then the ORDER in a
 * tagged file is provisional and the MEMBERSHIP is the deliverable.
 */
const TAG = arg('--tag', null)
const tagged = (base, ext = '.csv') => (TAG ? `${base}-${TAG}${ext}` : `${base}${ext}`)

/** Side pools, in report order. `sub-floor` is the one S4 adds. */
const SIDE_POOLS = [
  ['chain', 'pool-chains.csv'],
  ['above-ceiling', 'pool-above-ceiling.csv'],
  ['adjacent-trade', 'pool-adjacent-trades.csv'],
  ['non-US', 'pool-non-us.csv'],
  ['not-a-distributor', 'pool-not-a-distributor.csv'],
  ['no-website', 'pool-segment-w.csv'],
  ['sub-floor', 'pool-small-shops.csv'],
]

const pct = (n, d) => (d ? ((n / d) * 100).toFixed(1) + '%' : '—')
const table = (header, rows) =>
  [header, header.map(() => '---'), ...rows].map((r) => `| ${r.join(' | ')} |`).join('\n')
const loadJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null)

/**
 * The S3b enrichment, by domain. **Read, never fetched** — §5f forbids
 * per-domain work before the cut, and this file was already paid for on 2,783
 * domains. Every domain outside it scores `unknown`, which is zero points, not a
 * penalty: absence of detection has never been proof of absence in this program
 * (§4.4, and §5c's Segment W, where 76% of "no website" had one).
 */
function loadEnrichment() {
  const catalog = loadJson(resolve(ROOT, 'data', 'enrichment', `catalog-${DATE}.json`))
  const byDomain = new Map()
  for (const r of catalog?.records ?? []) {
    if (!r.domain) continue
    byDomain.set(r.domain, {
      ecommerce_class: r.ecommerce_class ?? null,
      sku_estimate: r.sku_estimate ?? null,
      brand_count: r.brand_count ?? null,
      quote_signals: r.quote_signals ?? [],
      cart_signals: r.cart_signals ?? [],
    })
  }
  return byDomain
}

/** Bucketed counts, printed as a table row set. */
function histogram(values, buckets) {
  const out = new Map(buckets.map((b) => [b.label, 0]))
  for (const v of values) {
    const b = buckets.find((x) => x.test(v))
    if (b) out.set(b.label, out.get(b.label) + 1)
  }
  return out
}

function main() {
  console.log(`S4 — merge + rank · ${DATE} · sources: ${SOURCES_V5.join(', ')}`)

  // ── steps 1–3: S2/S3's own pipeline, over the extended source list ────────
  const s3c = runS3c({ sources: SOURCES_V5, serpWave2: true, serpWave3: true })
  const pools = { ...s3c.pools, 'sub-floor': [] }
  let seated = s3c.seated

  // ── re-label the vertical axes on the FINAL, post-merge records ───────────
  //
  // Task 5's re-dedupe re-merges clusters through `makeRecord`, which drops any
  // field the contract does not declare — so the axis labels written during the
  // classify pass do not survive it. Recomputed here on exactly the inputs S3c
  // used (its own `votes` map, the same cached homepage verdicts), so this is a
  // relabel, not a second opinion.
  const vertical = loadJson(resolve(ROOT, 'data', 's3', `vertical-${DATE}.json`))
  const textByDomain = new Map()
  for (const r of vertical?.records ?? []) textByDomain.set(r.domain, r)
  const votes = s3c.votes

  const axisCounts = new Map()
  const clusterCounts = new Map()
  const categoryDecisive = new Map()
  // Same vocabulary S3c built, over the same union — so the relabel agrees with
  // the routing decision instead of second-guessing it.
  const brandVocab = buildBrandVocabulary([...seated, ...Object.values(pools).flat()].map((m) => m.record))
  const label = (m) => {
    const r = m.record
    const cat = classifyCategories(r)
    const v = mergeVerdicts({
      name: classifyName(r),
      text: r.domain ? (textByDomain.get(r.domain) ?? null) : null,
      domain: r.domain ? (votes.get(r.domain) ?? null) : null,
      category: cat,
      identity: classifyIdentity(r, brandVocab),
    })
    r.vertical_axis = v.axis
    r.category_core = cat ? cat.core : null
    r.category_contam = cat?.top ? `${cat.top}=${cat.topScore}` : null
    return { cat, v }
  }
  // The identity axis is the ONE axis whose evidence can change during the
  // cross-source merge: S3c classifies a record before task 5 re-merges it, and
  // a cluster can acquire a domain it did not have when the vertical filter ran.
  // "Linde Gas & Equipment Inc." reached the seated pool that way — labelled
  // `identity` by the relabel below and routed by nothing, because the routing
  // had already happened on a record with no domain. So the relabel routes too.
  const identityRouted = []
  for (const m of seated) {
    const { cat, v } = label(m)
    axisCounts.set(v.axis, (axisCounts.get(v.axis) ?? 0) + 1)
    if (cat?.top) clusterCounts.set(cat.top, (clusterCounts.get(cat.top) ?? 0) + 1)
    if (v.axis !== 'identity') continue
    const disp = VERTICAL_DISPOSITION[v.vertical]
    if (disp == null || !pools[disp]) continue
    m.record.disposition = disp
    m.record.icp_class = v.vertical
    identityRouted.push([m, disp])
  }
  if (identityRouted.length) {
    const moved = new Set(identityRouted.map(([m]) => m))
    seated = seated.filter((m) => !moved.has(m))
    for (const [m, disp] of identityRouted) pools[disp].push(m)
    // `axisCounts` is the SEATED tally; the routed rows are no longer seated.
    axisCounts.set('identity', (axisCounts.get('identity') ?? 0) - identityRouted.length)
  }
  for (const [pool, rows] of Object.entries(pools)) {
    for (const m of rows) {
      const { cat } = label(m)
      if (cat?.decisive && cat.vertical)
        categoryDecisive.set(`${pool}##${cat.top}`, (categoryDecisive.get(`${pool}##${cat.top}`) ?? 0) + 1)
    }
  }

  // ── step 4: size proxies. SCORED, never gated (§5e). ─────────────────────
  const enrich = loadEnrichment()
  const sizes = new Map()
  for (const m of seated) {
    const r = m.record
    const e = r.domain ? (enrich.get(r.domain) ?? null) : null
    const s = sizeScore(r, e ?? {})
    sizes.set(m, s)
    r.size_score = s.score
    r.size_band = s.band
    r.review_count = s.review_count
    // Export the count the SCORER used, not the enrichment's raw field.
    //
    // This line read `e?.brand_count ?? s.brand_count`, and `??` falls through
    // only on `null`/`undefined`. A line-card fetch that legitimately returns
    // **0** — the dealer's own site names no brand we recognise — therefore
    // overwrote a real `brand_authorized[]` count harvested from the
    // manufacturer locators. 394 shortlist-v1 rows were RANKED on their true
    // brand count and PUBLISHED as zero; `campbellsalesandservice.com` ranked
    // 5th on sixteen brands and shipped as `brand_count=0`.
    //
    // `sizeScore` and `rankScore` already implement the correct precedence
    // (`enrich.brand_count` only when it is > 0, else the locator array), so
    // reading `s.brand_count` makes the column and the `brands=N` term in
    // `rank_components` incapable of disagreeing. §5j's bug class — a clean
    // zero standing in for a populated array — living in the EXPORT rather
    // than the scorer.
    r.brand_count = s.brand_count
    r.ecommerce_class = e?.ecommerce_class ?? null
    r.sku_estimate = e?.sku_estimate ?? null
  }

  // Route the measured-small. §5e's asymmetry: an UNMEASURED company is never
  // called small, so `sub-floor` only ever carries records where a review count
  // or a SKU estimate actually came back and came back low.
  const subFloor = seated.filter((m) => sizes.get(m).band === 'sub-floor')
  for (const m of subFloor) m.record.disposition = 'sub-floor'
  seated = seated.filter((m) => sizes.get(m).band !== 'sub-floor')
  pools['sub-floor'] = subFloor

  // ── step 5: rank, then cut ───────────────────────────────────────────────
  const ranks = new Map()
  for (const m of seated) {
    const r = m.record
    const e = r.domain ? (enrich.get(r.domain) ?? null) : null
    const rk = rankScore(r, { size: sizes.get(m), enrich: e })
    ranks.set(m, rk)
    r.rank_score = rk.score
    r.rank_components = componentsToString(rk.components)
  }

  // Deterministic order: score, then evidence depth, then locations, then the
  // normalized name — so two runs produce the same shortlist and a diff means a
  // rule changed, not that the sort was unstable.
  const ordered = [...seated].sort((a, b) => {
    const d = ranks.get(b).score - ranks.get(a).score
    if (d) return d
    const e = Number(b.record.evidence_depth ?? 1) - Number(a.record.evidence_depth ?? 1)
    if (e) return e
    const l = Number(b.record.location_count ?? 1) - Number(a.record.location_count ?? 1)
    if (l) return l
    return String(a.record.company ?? '').localeCompare(String(b.record.company ?? ''))
  })

  const shortlist = ordered.slice(0, CUT)
  const rankedOut = ordered.slice(CUT)
  for (const m of shortlist) m.record.shortlist = true
  for (const m of rankedOut) m.record.shortlist = false
  const cutScore = shortlist.length ? ranks.get(shortlist[shortlist.length - 1]).score : null

  // ── conservation ─────────────────────────────────────────────────────────
  const members = (rows) => rows.reduce((n, m) => n + m.members.length, 0)
  const poolMembers = Object.fromEntries(Object.entries(pools).map(([k, v]) => [k, members(v)]))
  const seatedMembers = members(seated)
  const totalOut = seatedMembers + Object.values(poolMembers).reduce((a, b) => a + b, 0)
  const dedupedRows = s3c.counts.dedupedRows
  const conserved = totalOut === dedupedRows
  // The company-level statement §6 asks for: union == shortlist + ranked-out + pools.
  const unionCompanies =
    shortlist.length + rankedOut.length + Object.values(pools).reduce((n, v) => n + v.length, 0)

  const invalid = validateAll(seated.map((m) => m.record)).invalid

  // ── write ────────────────────────────────────────────────────────────────
  mkdirSync(resolve(ROOT, 'lists'), { recursive: true })
  mkdirSync(resolve(ROOT, 'data', 'side-pools'), { recursive: true })
  const rec = (rows) => rows.map((m) => m.record)
  const dedupedFile = TAG ? `deduped-${TAG}.csv` : 'deduped-v5.csv'
  if (!TAG) writeFileSync(resolve(ROOT, 'lists', 'shortlist-v1.csv'), toCsv(rec(shortlist), FIELDS_V5))
  writeFileSync(resolve(ROOT, 'lists', dedupedFile), toCsv(rec(ordered), FIELDS_V5))
  writeFileSync(resolve(ROOT, 'data', 'side-pools', tagged('pool-ranked-out')), toCsv(rec(rankedOut), FIELDS_V5))
  // The disclaimer sentences, named rather than dropped. Never copy, never a
  // `self_declaration`, and now impossible to re-derive by accident.
  const negated = s3c.s3a.run.negatedSink ?? []
  writeFileSync(
    resolve(ROOT, 'data', `_negated-declarations-${DATE}.json`),
    JSON.stringify(
      {
        why: 'Domains whose ONLY published declaration is the INVERSE sentence — "is NOT an authorized distributor". §5k. Quoting one of these back at a prospect would be a catastrophe. Text is byte-exact as published.',
        captured: DATE,
        count: negated.length,
        records: negated,
      },
      null,
      1,
    ) + '\n',
  )
  for (const [disp, file] of SIDE_POOLS)
    // `sub-floor` is S4's own pool and the only one whose members carry a size
    // score, so it keeps the ranking columns; the rest keep the S1–S3 shape the
    // earlier stages write, so a diff against v4 stays readable.
    writeFileSync(
      resolve(ROOT, 'data', 'side-pools', tagged(file.replace(/\.csv$/, ''))),
      toCsv(rec(pools[disp] ?? []), disp === 'sub-floor' ? FIELDS_V5 : FIELDS),
    )

  const ctx = {
    s3c,
    seated,
    ordered,
    shortlist,
    rankedOut,
    pools,
    sizes,
    ranks,
    enrich,
    axisCounts,
    clusterCounts,
    categoryDecisive,
    cutScore,
    invalid,
    counts: { dedupedRows, seatedMembers, poolMembers, totalOut, conserved, unionCompanies },
  }
  const report = buildReport(ctx)
  const reportFile = TAG ? `_merge-rank-report-${TAG}-${DATE}.md` : `_merge-rank-report-${DATE}.md`
  writeFileSync(resolve(ROOT, 'data', reportFile), report)
  console.log(report)
  if (!TAG) console.log(`\nwrote emails/lists/shortlist-v1.csv (${shortlist.length})`)
  console.log(`wrote emails/lists/${dedupedFile} (${ordered.length})`)
  console.log(`wrote emails/data/side-pools/${tagged('pool-ranked-out')} (${rankedOut.length})`)
  for (const [disp, file] of SIDE_POOLS)
    console.log(`wrote emails/data/side-pools/${tagged(file.replace(/\.csv$/, ''))} (${pools[disp].length})`)
  console.log(`wrote emails/data/_negated-declarations-${DATE}.json (${negated.length})`)
  console.log(`wrote emails/data/${reportFile}`)
  if (!conserved || invalid.length) process.exitCode = 1
}

// ─────────────────────────────────────────────────────────────────────────────
// Report — measured, never estimated
// ─────────────────────────────────────────────────────────────────────────────

function buildReport(ctx) {
  const { s3c, ordered, shortlist, rankedOut, pools, ranks, counts, cutScore, invalid } = ctx
  const L = []
  const p = (s = '') => L.push(s)
  const run = s3c.s3a.run

  p(`# S4 merge + rank report — the full haul, cut to a shortlist`)
  p()
  p(`**Date:** ${DATE} · **Stage:** build-plan §5f's revised order, steps 1–5`)
  p(`**Input:** every raw payload in \`emails/data/raw/\` for the ${SOURCES_V5.length} sources below`)
  p(`**Output:** \`emails/lists/shortlist-v1.csv\` · \`emails/lists/deduped-v5.csv\` · side pools`)
  p(`**Not run here:** enrichment. §5f: catalog depth, e-commerce class and the line-card fetch`)
  p(`run on the slice that survives this cut, not before it. Zero network calls were made.`)
  p()

  // ── 1. the union ─────────────────────────────────────────────────────────
  p(`## 1. The union`)
  p()
  const rows = run.sources.map((s) => [
    s,
    run.perSource[s].raw.toLocaleString(),
    run.perSource[s].mapped.toLocaleString(),
    run.deduped[s].out.toLocaleString(),
    pct(run.deduped[s].out, run.deduped[s].in),
  ])
  p(table(['Source', 'Raw rows', 'Mapped', 'After within-source dedupe', 'Survival'], rows))
  p()
  p(
    `Sum of per-source deduped rows: **${counts.dedupedRows.toLocaleString()}**. ` +
      `Union after cross-source dedupe: **${counts.unionCompanies.toLocaleString()} companies.**`,
  )
  p()
  const merged = run.stats
  p(
    `Cross-source merges on the seated class: phone **${merged.phoneMerges.toLocaleString()}** · ` +
      `name+zip5 **${merged.secondaryMerges.toLocaleString()}** · domain **${merged.domainMerges.toLocaleString()}**. ` +
      `Secondary-key collision rate **${(merged.collisionRate * 100).toFixed(2)}%** ` +
      `(${merged.conflicting} conflicting of ${merged.candidatePairs} candidate pairs) — ` +
      `${merged.collisionRate > 0.05 ? 'ABOVE' : 'under'} §3.5's 5% tightening threshold.`,
  )
  p()
  p(
    `Domain-only entities (SERP, both waves): **${merged.domainOnly.toLocaleString()}** — ` +
      `${merged.domainMatched.toLocaleString()} anchored to an identified company, ` +
      `${merged.domainAmbiguous.toLocaleString()} of those ambiguous, ` +
      `**${merged.domainNetNew.toLocaleString()} net-new domains with no other identity.**`,
  )
  p()

  // ── 2. the vertical filter ───────────────────────────────────────────────
  p(`## 2. The vertical filter — the highest-leverage step`)
  p()
  const v1 = s3c.v1
  p(
    `${v1.classified.toLocaleString()} records classified across four axes. ` +
      `**${v1.routed.toLocaleString()} routed out of a candidate pool.** ` +
      `${v1.uncertain.toLocaleString()} flagged \`icp_uncertain\` and KEPT — §5d's rule: ` +
      `an ambiguous record is tiered low, never deleted on a guess.`,
  )
  p()
  p(`By class:`)
  p()
  p(
    table(
      ['Vertical', 'Companies', 'Share'],
      [...v1.byClass.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([k, n]) => [`\`${k}\``, n.toLocaleString(), pct(n, v1.classified)]),
    ),
  )
  p()
  p(`Which axis decided, for records that MOVED pool:`)
  p()
  p(
    table(
      ['Pool → axis', 'Companies'],
      [...v1.byAxis.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 14)
        .map(([k, n]) => [k.replace('##', ' · '), n.toLocaleString()]),
    ),
  )
  p()
  p(`Where records went:`)
  p()
  p(
    table(
      ['Move', 'Companies'],
      [...v1.movedFrom.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => [k, n.toLocaleString()]),
    ),
  )
  p()
  p(`### The DFS \`category_ids\` axis — §5f's contamination clusters, measured`)
  p()
  p(
    `Records carrying at least one \`DFS:\` code: **${[...v1.byCategory.values()]
      .reduce((a, b) => a + b, 0)
      .toLocaleString()}**. ` +
      `Decisive rejections by cluster, and where they were sitting:`,
  )
  p()
  const clusterRows = [...ctx.categoryDecisive.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => [k.split('##')[0], `\`${k.split('##')[1]}\``, n.toLocaleString()])
  p(clusterRows.length ? table(['Pool', 'Cluster', 'Companies'], clusterRows) : '_No cluster was decisive._')
  p()
  p(`Every cluster the axis SAW on a still-seated record (seen, not necessarily decisive):`)
  p()
  p(
    table(
      ['Cluster', 'Seated records touching it'],
      [...ctx.clusterCounts.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => [`\`${k}\``, n.toLocaleString()]),
    ),
  )
  p()
  p(
    `**§5f's rule holds by construction:** the strongest core code on every record is discounted 0.5×, ` +
      `because the sweep queried 30 industrial categories and every returned record carries at least one ` +
      `of them whether or not it is an industrial distributor. A cluster still has to clear 5 on its own ` +
      `AND beat what is left of the core score by 2. The FLOOR is \`vertical.mjs\`'s; the MARGIN is half of ` +
      `it, because the two sides are not symmetric — the core side is inflated by the query and the ` +
      `contamination side is not. At MARGIN 4 the axis rejected 5,288 raw rows, at MARGIN 2 it rejects ` +
      `6,911, and a 25-record random sample of the difference read 25/25 correct: garage-door services ` +
      `carrying \`spring_supplier\`, well drillers and plumbers carrying \`pump_supplier\`.`,
  )
  p()
  p(`Axis that decided each SEATED record:`)
  p()
  p(
    table(
      ['Axis', 'Seated companies'],
      [...ctx.axisCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([k, n]) => [`\`${k}\``, `${n.toLocaleString()} (${pct(n, ordered.length)})`]),
    ),
  )
  p()

  // ── 3. chains + dedupe ───────────────────────────────────────────────────
  p(`## 3. Chain suppression and dedupe`)
  p()
  p(
    `Order per §3, unchanged: within-source dedupe → chain suppression → branch rollup → cross-source ` +
      `merge. Counting locations before deduping would halve the ≥20-address threshold and sweep ` +
      `mid-size independents into \`chain\`.`,
  )
  p()
  p(
    table(
      ['Rule', 'Companies caught'],
      [
        ['name blocklist → `chain`', run.chains.byName.size.toLocaleString()],
        ['domain blocklist → `chain`', run.chains.byDomain.size.toLocaleString()],
        ['≥20 distinct addresses → `above-ceiling`', run.chains.bySize.size.toLocaleString()],
      ],
    ),
  )
  p()
  p(
    `The lead-token guard still holds: a naive containment sweep on \`motion\` would take Evolution ` +
      `Motion Solutions, Systems in Motion and Power Motion with it. Nothing in this run relaxed it.`,
  )
  p()

  // ── 4. size proxies ──────────────────────────────────────────────────────
  p(`## 4. Size proxies — scored, not gated`)
  p()
  const bandRows = new Map()
  for (const m of [...ordered, ...pools['sub-floor']]) {
    const b = m.record.size_band ?? 'unscored'
    bandRows.set(b, (bandRows.get(b) ?? 0) + 1)
  }
  p(
    table(
      ['Size band (PROXY, not revenue)', 'Companies', 'Share'],
      ['above-band', '10-50M', '5-10M', '2-5M', 'sub-floor']
        .filter((b) => bandRows.has(b))
        .map((b) => [b, (bandRows.get(b) ?? 0).toLocaleString(), pct(bandRows.get(b) ?? 0, ordered.length + pools['sub-floor'].length)]),
    ),
  )
  p()
  p(
    `**${pools['sub-floor'].length.toLocaleString()} routed \`sub-floor\` → \`pool-small-shops.csv\`.** ` +
      `§5e's asymmetry is enforced: a company is only called small when a review count or a SKU estimate ` +
      `actually came back and came back low. An unmeasured company scores zero and stays seated — ` +
      `treating absence of evidence as evidence of absence is the error §5c caught in Segment W, where ` +
      `76% of the "no website" pool turned out to have one.`,
  )
  p()
  const measured = [...ordered, ...pools['sub-floor']].filter((m) => m.record.review_count != null).length
  p(
    `Review counts available on **${measured.toLocaleString()}** of ` +
      `${(ordered.length + pools['sub-floor'].length).toLocaleString()} companies ` +
      `(${pct(measured, ordered.length + pools['sub-floor'].length)}) — DFS is the only source that ships them.`,
  )
  p()

  // ── 5. the rank ──────────────────────────────────────────────────────────
  p(`## 5. The rank, and the cut`)
  p()
  p(
    `**Shortlist: ${shortlist.length.toLocaleString()}** of ${ordered.length.toLocaleString()} seated. ` +
      `Cut at \`rank_score\` **${cutScore}**. ${rankedOut.length.toLocaleString()} seated companies ` +
      `fall below it — they keep \`disposition: null\`, stay in \`deduped-v5.csv\`, and are written to ` +
      `\`pool-ranked-out.csv\`. **A rank is an ordering, not a verdict.**`,
  )
  p()
  const scores = ordered.map((m) => ranks.get(m).score)
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
  p(table(['rank_score', 'Companies', 'Share'], [...hist.entries()].map(([k, n]) => [k, n.toLocaleString(), pct(n, ordered.length)])))
  p()
  const sorted = [...scores].sort((a, b) => a - b)
  const q = (f) => sorted[Math.floor(sorted.length * f)] ?? 0
  p(
    `Median **${q(0.5)}** · p75 **${q(0.75)}** · p90 **${q(0.9)}** · p99 **${q(0.99)}** · ` +
      `max **${sorted[sorted.length - 1]}** · min **${sorted[0]}**.`,
  )
  p()
  p(`### What the top 100 look like`)
  p()
  const top = ordered.slice(0, 100)
  const feature = (test) => `${top.filter(test).length}/100`
  p(
    table(
      ['Feature', 'Top 100', 'Shortlist', 'All seated'],
      [
        [
          '`catalog_no_cart` (any)',
          feature((m) => m.record.ecommerce_class === 'catalog_no_cart'),
          pct(shortlist.filter((m) => m.record.ecommerce_class === 'catalog_no_cart').length, shortlist.length),
          pct(ordered.filter((m) => m.record.ecommerce_class === 'catalog_no_cart').length, ordered.length),
        ],
        [
          '…of which the 226-domain RFQ cohort',
          feature((m) => ranks.get(m).ecom === 'catalog_rfq_no_cart'),
          pct(shortlist.filter((m) => ranks.get(m).ecom === 'catalog_rfq_no_cart').length, shortlist.length),
          pct(ordered.filter((m) => ranks.get(m).ecom === 'catalog_rfq_no_cart').length, ordered.length),
        ],
        [
          'brand count in the 3–20 band',
          feature((m) => ranks.get(m).brand_count >= 3 && ranks.get(m).brand_count <= 20),
          pct(
            shortlist.filter((m) => ranks.get(m).brand_count >= 3 && ranks.get(m).brand_count <= 20).length,
            shortlist.length,
          ),
          pct(
            ordered.filter((m) => ranks.get(m).brand_count >= 3 && ranks.get(m).brand_count <= 20).length,
            ordered.length,
          ),
        ],
        [
          '`evidence_depth` ≥2',
          feature((m) => Number(m.record.evidence_depth ?? 1) >= 2),
          pct(shortlist.filter((m) => Number(m.record.evidence_depth ?? 1) >= 2).length, shortlist.length),
          pct(ordered.filter((m) => Number(m.record.evidence_depth ?? 1) >= 2).length, ordered.length),
        ],
        [
          'quotable `self_declaration`',
          feature((m) => Boolean(m.record.self_declaration)),
          pct(shortlist.filter((m) => Boolean(m.record.self_declaration)).length, shortlist.length),
          pct(ordered.filter((m) => Boolean(m.record.self_declaration)).length, ordered.length),
        ],
        [
          'size band `10-50M`',
          feature((m) => m.record.size_band === '10-50M'),
          pct(shortlist.filter((m) => m.record.size_band === '10-50M').length, shortlist.length),
          pct(ordered.filter((m) => m.record.size_band === '10-50M').length, ordered.length),
        ],
        [
          'full NAP (name+domain+phone+street+ZIP)',
          feature((m) =>
            Boolean(
              m.record.company_display && m.record.domain && m.record.phone_e164 && m.record.address_1 && m.record.zip5,
            ),
          ),
          pct(
            shortlist.filter(
              (m) =>
                m.record.company_display && m.record.domain && m.record.phone_e164 && m.record.address_1 && m.record.zip5,
            ).length,
            shortlist.length,
          ),
          pct(
            ordered.filter(
              (m) =>
                m.record.company_display && m.record.domain && m.record.phone_e164 && m.record.address_1 && m.record.zip5,
            ).length,
            ordered.length,
          ),
        ],
        [
          '`needs_identity_resolution`',
          feature((m) => m.record.needs_identity_resolution === true),
          pct(shortlist.filter((m) => m.record.needs_identity_resolution === true).length, shortlist.length),
          pct(ordered.filter((m) => m.record.needs_identity_resolution === true).length, ordered.length),
        ],
      ],
    ),
  )
  p()
  p(`The first 20, with their scores and what earned them:`)
  p()
  p(
    table(
      ['#', 'Published as', 'Domain', 'Score', 'Components'],
      top.slice(0, 20).map((m, i) => [
        String(i + 1),
        (m.record.company_display ?? '').slice(0, 40),
        m.record.domain ?? '—',
        String(ranks.get(m).score),
        `\`${m.record.rank_components}\``,
      ]),
    ),
  )
  p()

  // ── 6. fill rates ────────────────────────────────────────────────────────
  p(`## 6. Fill rates`)
  p()
  const fillOf = (rows, f) => rows.filter((m) => m.record[f]).length
  const cols = [
    ['Union', [...ordered, ...Object.values(pools).flat()]],
    ['Seated', ordered],
    ['Shortlist', shortlist],
  ]
  p(
    table(
      ['Field', ...cols.map(([n, r]) => `${n} (${r.length.toLocaleString()})`)],
      ['domain', 'phone_e164', 'address_1', 'city', 'state', 'zip5', 'email', 'self_declaration', 'company_display'].map(
        (f) => [`\`${f}\``, ...cols.map(([, r]) => `${fillOf(r, f).toLocaleString()}  ${pct(fillOf(r, f), r.length)}`)],
      ),
    ),
  )
  p()
  const depth = new Map()
  for (const m of ordered) {
    const d = Number(m.record.evidence_depth ?? 1)
    const k = d >= 4 ? '4+' : String(d)
    depth.set(k, (depth.get(k) ?? 0) + 1)
  }
  p(`\`evidence_depth\` on the seated pool:`)
  p()
  p(
    table(
      ['Sources', 'Companies', 'Share'],
      ['1', '2', '3', '4+'].filter((k) => depth.has(k)).map((k) => [k, depth.get(k).toLocaleString(), pct(depth.get(k), ordered.length)]),
    ),
  )
  p()
  const brands2 = ordered.filter((m) => split(m.record.brand_authorized).length >= 2).length
  p(
    `\`brand_authorized\` ≥2: **${brands2.toLocaleString()}** seated companies (${pct(brands2, ordered.length)}). ` +
      `§5a measured 8 (0.3%) at five sources and concluded the line-card graph does not materialize by joining ` +
      `locators; §5b's answer was to read the dealer's own line-card page instead. Both still hold.`,
  )
  p()

  // ── 7. side pools + conservation ─────────────────────────────────────────
  p(`## 7. Side pools and conservation`)
  p()
  p(
    table(
      ['Disposition', 'Companies', 'Deduped rows under them', 'File'],
      [
        ...SIDE_POOLS.map(([disp, file]) => [
          `\`${disp}\``,
          (pools[disp] ?? []).length.toLocaleString(),
          (counts.poolMembers[disp] ?? 0).toLocaleString(),
          `\`emails/data/side-pools/${file}\``,
        ]),
        [
          '(seated, below the cut)',
          rankedOut.length.toLocaleString(),
          rankedOut.reduce((n, m) => n + m.members.length, 0).toLocaleString(),
          '`emails/data/side-pools/pool-ranked-out.csv`',
        ],
        [
          '**(shortlist)**',
          `**${shortlist.length.toLocaleString()}**`,
          shortlist.reduce((n, m) => n + m.members.length, 0).toLocaleString(),
          '`emails/lists/shortlist-v1.csv`',
        ],
      ],
    ),
  )
  p()
  p(`**Total union: ${counts.unionCompanies.toLocaleString()} companies.**`)
  p()
  p(
    table(
      ['Conservation (rows)', 'Records'],
      [
        ['Deduped rows in', counts.dedupedRows.toLocaleString()],
        ['→ seated (shortlist + ranked-out)', counts.seatedMembers.toLocaleString()],
        ...SIDE_POOLS.map(([disp]) => [`→ ${disp}`, (counts.poolMembers[disp] ?? 0).toLocaleString()]),
        ['**Sum**', `**${counts.totalOut.toLocaleString()}**`],
      ],
    ),
  )
  p()
  p(
    counts.conserved
      ? `**PASS — ${counts.dedupedRows.toLocaleString()} in = ${counts.totalOut.toLocaleString()} out.** Nothing was deleted; every record carries a \`disposition\` or a rank.`
      : `**CONSERVATION FAILED — ${counts.dedupedRows.toLocaleString()} in, ${counts.totalOut.toLocaleString()} out. Investigate before anything reads this list.**`,
  )
  p()
  p(`Contract validation on the seated list: **${invalid.length} invalid rows.** Every row carries \`source_url\` + \`captured\`.`)
  p()

  p(`## 8. What contradicts the plan`)
  p()
  for (const line of contradictions(ctx)) p(`- ${line}`)
  p()
  return L.join('\n') + '\n'
}

/** Measured facts that disagree with what the plan assumed. Reported, not smoothed. */
function contradictions(ctx) {
  const { ordered, shortlist, pools, ranks, counts, cutScore } = ctx
  const out = []

  const catAxis = ctx.axisCounts.get('category') ?? 0
  if (catAxis)
    out.push(
      `**The DFS category axis is the single largest decider on the seated pool** — ${catAxis.toLocaleString()} ` +
        `of ${ordered.length.toLocaleString()} seated companies (${pct(catAxis, ordered.length)}) were labelled by it. ` +
        `§5e's rule ("capture source-native codes; interpret them late") now has a second, larger confirmation.`,
    )

  const uncertainShare = ordered.filter((m) => m.record.icp_uncertain === true).length
  const thin = ordered.filter((m) => m.record.category_core != null && Number(m.record.category_core) < 5).length
  out.push(
    `**\`icp_uncertain\` is ${pct(uncertainShare, ordered.length)} of the seated pool** ` +
      `(${uncertainShare.toLocaleString()} companies), and it took two corrections to mean anything. ` +
      `Scoring "thin evidence" as uncertain flagged 84% of the pool; thin and ambiguous are different facts, so ` +
      `\`icp_uncertain\` now fires only when a contamination cluster cleared the axis floor and lost on margin ` +
      `alone. Then it still read 68.6%, because the NAME axis flags any record whose published name carries no ` +
      `industrial signal — and DFS is full of "Acme Supply Co.". A confident category verdict now clears that ` +
      `the way a confident homepage already did. Thin-but-unambiguous evidence is priced in \`rank_score\` ` +
      `instead: **${thin.toLocaleString()} seated companies (${pct(thin, ordered.length)}) score below 5 on ` +
      `\`category_core\`** and sort accordingly.`,
  )

  const noRank = ordered.filter((m) => ranks.get(m).score === 0).length
  if (noRank)
    out.push(
      `**${noRank.toLocaleString()} seated companies score 0** — the penalties (unresolved identity, ` +
        `\`icp_uncertain\`, sub-floor size) cancel everything they earn. They are seated and unrankable, ` +
        `which is a truer statement than a low positive score would be.`,
    )

  if (cutScore != null)
    out.push(
      `**The cut lands at rank_score ${cutScore}, not at a natural break.** ` +
        `${ordered.filter((m) => ranks.get(m).score === cutScore).length.toLocaleString()} companies share that exact ` +
        `score, so the boundary is decided by the tiebreak (evidence depth, then locations, then name), not by the ` +
        `signal. Moving \`--cut\` by a few hundred changes who is in it and changes nothing about their quality.`,
    )

  const sub = pools['sub-floor'].length
  out.push(
    `**The $2M floor routed ${sub.toLocaleString()} companies, and it could only ever have routed the measured ones.** ` +
      `§4.5 asks for a floor; §5e says a floor we cannot measure is fiction. What shipped is a floor that applies ` +
      `ONLY where a review count or a SKU estimate exists — so \`pool-small-shops.csv\` is a list of companies ` +
      `measured small, never a list of companies assumed small. The rest of the sub-floor population is in the ` +
      `seated pool with a low rank, and no amount of scoring will find it without buying employee data.`,
  )

  const w = pools['no-website'].length
  out.push(
    `**Segment W is ${w.toLocaleString()} companies, not §5c's ~160.** §5f predicted this: locators only list ` +
      `dealers who already have a web presence, and DFS surfaces businesses they never listed. These are ` +
      `CANDIDATES — the ${'§5e'} verification pass measured a 76% rescue rate on the last cohort and has not been ` +
      `run on this one. Do not read the number as "companies with no website".`,
  )

  out.push(
    `**Two bugs this stage found in code three stages older than it.** (1) \`split()\` stringified arrays, so ` +
      `\`String(['Enerpac','Timken'])\` became \`"Enerpac,Timken"\` and split on \`|\` to ONE element — every ` +
      `multi-brand record counted as a single brand. The first S4 run reported \`brand_authorized ≥2 = 0\`; ` +
      `fixed, it is ${ordered.filter((m) => split(m.record.brand_authorized).length >= 2).length.toLocaleString()}. ` +
      `(2) \`decodeEntities\` handled \`&amp;\` and not \`&mdash;\`, so three companies reached the seated list ` +
      `published as "Products &mdash; Campbell Sales and Service, Inc." — \`company_display\` is email copy. ` +
      `Both fixes change \`deduped-v4.csv\`: it still holds 2,110 companies, and three of their names are now right.`,
  )

  out.push(
    `**There is still no suppression list.** §4.6's join ran and matched nothing, for the third stage running. ` +
      `Every one of the ${shortlist.length.toLocaleString()} shortlisted companies is being treated as ` +
      `never-contacted and nothing in this pipeline can verify that.`,
  )

  out.push(
    `**Enrichment coverage is the binding limit on the rank, not the volume.** The S3b enrichment covers 2,783 ` +
      `domains; the seated pool is ${ordered.length.toLocaleString()}. Every company outside it scores zero on the ` +
      `two sharpest signals the build found (\`catalog_no_cart\` and brand breadth), so the top of this ranking is ` +
      `partly a map of what we have already looked at. §5f's step 6 is what fixes that, and it has to run on the ` +
      `shortlist before the shortlist can be trusted as an ORDER rather than a filter.`,
  )

  if (!counts.conserved)
    out.push(`**CONSERVATION FAILED.** ${counts.dedupedRows} rows in, ${counts.totalOut} out. Nothing downstream may read these files.`)

  return out
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
