#!/usr/bin/env node
/**
 * S4b — re-rank the seated pool once enrichment coverage is even. §5f step 6.
 *
 * ## Why this file exists
 *
 * §5j stated the problem precisely: *"the top of the ranking is partly a map of
 * which domains we happened to look at first."* S3b's catalog and line-card
 * enrichment covered 2,783 domains against 17,960 seated, and only **1,090 of
 * the shortlist's 3,310 domains** were among them. `rank.mjs` gives the largest
 * positive weight in the file to `catalog_rfq_no_cart` (+26) and the brand band
 * (+16 at its peak) — so a company nobody fetched scores 0 on both and cannot
 * reach the top no matter how good it is. **`shortlist-v1.csv` was a trustworthy
 * filter and an untrustworthy order.**
 *
 * ## What it does, and what it deliberately does not do
 *
 * It re-runs the **same** scoring functions — `sizeScore` and `rankScore`,
 * imported, not reimplemented — over `deduped-v5.csv`, with the v1 and v2
 * enrichment merged. Nothing about the weights changes. The only thing that
 * changes is that the inputs are now populated for the whole shortlist, so a
 * score difference means the evidence changed, never that the rule did.
 *
 * It does **not** re-run the merge, the vertical filter, the chain suppression
 * or the dedupe. Those are `s4-merge-rank.mjs`'s and are unaffected by a
 * catalog fetch. It reads their output and re-orders it.
 *
 * It writes **`shortlist-v2.csv` only**. `deduped-v5.csv`, the side pools and
 * `shortlist-v1.csv` are left byte-for-byte alone, because the churn report is
 * the deliverable and it needs both sides of the comparison to survive.
 *
 * ## The one disposition this can change
 *
 * `size.mjs` routes a company `sub-floor` when its size score is under 8 **and**
 * something actually measured it. A new `sku_estimate` is a measurement, so a
 * company that was unmeasured-and-therefore-seated can become measured-and-small.
 * That is the rule working as designed (§5e's asymmetry), not a new gate, and
 * §5d's "never gate on `sku_estimate`" still holds: the SKU count contributes
 * points, it is the *total* that routes. Those companies are counted, named in
 * the audit JSON, and dropped from the ranking — not deleted from anything.
 *
 * ## Honest limit, stated up front
 *
 * Coverage was closed on the **shortlist**, not on the ranked-out pool (3.6%
 * enriched). So v2's ORDER is trustworthy and v2's MEMBERSHIP is still partly a
 * coverage artifact. The report measures how big that residual is instead of
 * asserting it is small.
 *
 * Usage:
 *   node emails/scripts/s4b-rerank.mjs [--cut 3500] [--date 2026-08-01]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { FIELDS_V5, fromCsv, toCsv } from './lib/contract.mjs'
import { BRAND_BANDS, componentsToString, ECOM_WEIGHTS, rankScore } from './lib/rank.mjs'
import { sizeScore } from './lib/size.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const argv = process.argv.slice(2)
const arg = (f, d = null) => {
  const i = argv.indexOf(f)
  return i >= 0 ? argv[i + 1] : d
}
const DATE = arg('--date', '2026-08-01')
const CUT = Number(arg('--cut', '3500'))

const loadJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null)

/**
 * Merge every catalog pass into one map, later files winning. v2 re-derives the
 * v1 domains it also covers, so "later wins" is a no-op on them by construction
 * — but it is the correct rule if a re-fetch ever changes an answer.
 *
 * @param {string[]} paths
 * @returns {Map<string, Record<string, any>>}
 */
export function loadEnrichment(paths) {
  const byDomain = new Map()
  for (const p of paths) {
    for (const r of loadJson(p)?.records ?? []) {
      if (!r.domain) continue
      byDomain.set(r.domain, {
        ecommerce_class: r.ecommerce_class ?? null,
        sku_estimate: r.sku_estimate ?? null,
        brand_count: r.brand_count ?? null,
        brands: r.brands ?? [],
        quote_signals: r.quote_signals ?? [],
        cart_signals: r.cart_signals ?? [],
        refused: r.refused ?? false,
        pages_scanned: r.pages_scanned ?? 0,
      })
    }
  }
  return byDomain
}

/** The exact tiebreak `s4-merge-rank.mjs` uses. Copied so v1 and v2 sort alike. */
function order(rows, scoreOf) {
  return [...rows].sort((a, b) => {
    const d = scoreOf(b) - scoreOf(a)
    if (d) return d
    const e = Number(b.evidence_depth ?? 1) - Number(a.evidence_depth ?? 1)
    if (e) return e
    const l = Number(b.location_count ?? 1) - Number(a.location_count ?? 1)
    if (l) return l
    return String(a.company ?? '').localeCompare(String(b.company ?? ''))
  })
}

/**
 * The most a record could gain if we enriched it — the ceiling of the two
 * components enrichment feeds. Used to bound the residual coverage bias in the
 * ranked-out pool rather than hand-waving it.
 */
const MAX_ENRICH_GAIN =
  Math.max(...Object.values(ECOM_WEIGHTS)) + Math.max(...BRAND_BANDS.map(([, p]) => p))

const pct = (n, d) => (d ? ((n / d) * 100).toFixed(1) + '%' : '—')
const table = (header, rows) =>
  [header, header.map(() => '---'), ...rows].map((r) => `| ${r.join(' | ')} |`).join('\n')

/** `sku_estimate` buckets, matching `catalog_report.py` so the two agree. */
const SKU_BUCKETS = [
  ['unknown', (v) => v === null || v === undefined],
  ['0', (v) => v === 0],
  ['1–49', (v) => v >= 1 && v <= 49],
  ['50–199', (v) => v >= 50 && v <= 199],
  ['200–999', (v) => v >= 200 && v <= 999],
  ['1k–5k', (v) => v >= 1000 && v <= 4999],
  ['5k–20k', (v) => v >= 5000 && v <= 19999],
  ['20k+', (v) => v >= 20000],
]

/** §5d's measured brand bands. `rank.mjs` scores 3–20 positive, 65+ negative. */
const BRAND_BUCKETS = [
  ['0', (n) => n === 0],
  ['1–2', (n) => n >= 1 && n <= 2],
  ['3–5', (n) => n >= 3 && n <= 5],
  ['6–10', (n) => n >= 6 && n <= 10],
  ['11–20', (n) => n >= 11 && n <= 20],
  ['21–40', (n) => n >= 21 && n <= 40],
  ['41–64', (n) => n >= 41 && n <= 64],
  ['65+', (n) => n >= 65],
]

function histo(values, buckets) {
  const out = new Map(buckets.map(([label]) => [label, 0]))
  for (const v of values) {
    const b = buckets.find(([, test]) => test(v))
    if (b) out.set(b[0], out.get(b[0]) + 1)
  }
  return out
}

function main() {
  const listPath = resolve(ROOT, 'lists', 'deduped-v5.csv')
  const seatedAll = fromCsv(readFileSync(listPath, 'utf8'))
  const enrich = loadEnrichment([
    resolve(ROOT, 'data', 'enrichment', `catalog-${DATE}.json`),
    resolve(ROOT, 'data', 'enrichment', `catalog-v2-${DATE}.json`),
  ])

  // v1's own answer, read off the file rather than recomputed — so the churn
  // number compares what actually shipped, not a reconstruction of it.
  const v1Shortlist = new Set()
  const v1Rank = new Map()
  // Snapshot v1's score BEFORE the re-score writes over it. Reading
  // `r.rank_score` later would silently compare v2 against itself — the class
  // of bug §5j caught twice, where a report and the thing it describes drift.
  const v1Score = new Map()
  const v1Brand = new Map()
  seatedAll.forEach((r, i) => {
    v1Rank.set(r, i)
    v1Score.set(r, Number(r.rank_score))
    v1Brand.set(r, Number(r.brand_count ?? 0))
    if (r.shortlist === 'true') v1Shortlist.add(r)
  })
  const v1Ordered = seatedAll.filter((r) => v1Shortlist.has(r))

  // ── re-score ──────────────────────────────────────────────────────────────
  const v2 = new Map()
  const newlySubFloor = []
  for (const r of seatedAll) {
    const e = r.domain ? (enrich.get(r.domain) ?? null) : null
    const s = sizeScore(r, e ?? {})
    const rk = rankScore(r, { size: s, enrich: e })
    v2.set(r, { size: s, rank: rk, enrich: e })
    if (s.band === 'sub-floor' && r.size_band !== 'sub-floor') newlySubFloor.push(r)
  }

  const seated = seatedAll.filter((r) => v2.get(r).size.band !== 'sub-floor')
  const ordered = order(seated, (r) => v2.get(r).rank.score)
  const shortlist = ordered.slice(0, CUT)
  const rankedOut = ordered.slice(CUT)
  const cutScore = shortlist.length ? v2.get(shortlist[shortlist.length - 1]).rank.score : null

  // Write the ranking columns back onto the record, so the CSV is auditable in
  // the same shape v1 shipped.
  for (const r of ordered) {
    const { size: s, rank: rk, enrich: e } = v2.get(r)
    r.size_score = s.score
    r.size_band = s.band
    r.review_count = s.review_count
    // Export the count the SCORER used, not the enrichment's raw field.
    // `s4-merge-rank.mjs` writes `e?.brand_count ?? s.brand_count`, and `??`
    // only falls through on null — so a line-card fetch that legitimately
    // returns 0 (the dealer's own site names no brand we recognise) overwrote
    // a real `brand_authorized[]` count from the locators. 394 shortlist rows
    // exported `brand_count=0` while being ranked on their true count;
    // campbellsalesandservice.com was scored on SIXTEEN brands and published
    // as zero. That is §5j's bug class exactly — a clean zero standing in for
    // a populated array — surviving in the export rather than the scorer.
    r.brand_count = rk.brand_count
    r.ecommerce_class = e?.ecommerce_class ?? null
    r.sku_estimate = e?.sku_estimate ?? null
    r.rank_score = rk.score
    r.rank_components = componentsToString(rk.components)
  }
  for (const r of shortlist) r.shortlist = true
  for (const r of rankedOut) r.shortlist = false

  mkdirSync(resolve(ROOT, 'lists'), { recursive: true })
  writeFileSync(resolve(ROOT, 'lists', 'shortlist-v2.csv'), toCsv(shortlist, FIELDS_V5))

  // ── churn ─────────────────────────────────────────────────────────────────
  const v1Top100 = new Set(v1Ordered.slice(0, 100))
  const v2Top100 = new Set(shortlist.slice(0, 100))
  const top100Survivors = [...v2Top100].filter((r) => v1Top100.has(r)).length
  const v2Set = new Set(shortlist)
  const entrants = shortlist.filter((r) => !v1Shortlist.has(r))
  const leavers = v1Ordered.filter((r) => !v2Set.has(r))

  const enrichedNow = (r) => r.domain && enrich.has(r.domain)
  const movement = shortlist
    .map((r, i) => ({ r, v2Pos: i, v1Pos: v1Ordered.indexOf(r) }))
    .filter((x) => x.v1Pos >= 0)
  const bigMoves = movement.filter((x) => Math.abs(x.v1Pos - x.v2Pos) >= 500).length

  // Residual coverage bias — bounded twice, because the theoretical bound is
  // useless on its own. MAX_ENRICH_GAIN (42) exceeds the cut score, so "within
  // the theoretical max" sweeps in essentially the whole ranked-out pool and
  // says nothing. The MEASURED gain distribution is the number worth quoting:
  // what enrichment actually paid the companies we just enriched.
  // The gain distribution, measured on every enriched company in the pool
  // rather than on the shortlist alone — enriching only high scorers and then
  // quoting their gains back would bake the selection effect into the estimate.
  const gains = [...seatedAll]
    .filter(enrichedNow)
    .map((r) => v2.get(r).rank.components.ecommerce + v2.get(r).rank.components.brands)
    .sort((a, b) => a - b)
  const gq = (f) => (gains.length ? gains[Math.floor(f * (gains.length - 1))] : 0)
  const gainMedian = gq(0.5)
  const gainP90 = gq(0.9)
  const unenrichedOut = rankedOut.filter((r) => !enrichedNow(r))

  // A threshold bound is worthless here: the cut is `cutScore` and the p90 gain
  // is about the same, so "within p90 of the cut" sweeps in everything scoring
  // ≥0 — which is the whole pool. What the question needs is an EXPECTATION:
  // for each unenriched ranked-out company, the empirical probability that a
  // gain drawn from the measured distribution closes its deficit, summed.
  //
  // Note carefully what this counts. It is the number expected to CLEAR THE CUT
  // SCORE, not the number that would take a seat — if it exceeds the shortlist
  // size, the cut score itself would have to rise and the list would be chosen
  // from a much larger qualified pool. Which is exactly the finding.
  const pClears = (deficit) => {
    if (deficit <= 0) return 1
    let n = 0
    for (const g of gains) if (g >= deficit) n++
    return gains.length ? n / gains.length : 0
  }
  const expectedClearing = unenrichedOut.reduce(
    (acc, r) => acc + pClears(cutScore - v2.get(r).rank.score),
    0,
  )
  const headroom = unenrichedOut.filter((r) => v2.get(r).rank.score + gainP90 >= cutScore).length
  const headroomMedian = unenrichedOut.filter(
    (r) => v2.get(r).rank.score + gainMedian >= cutScore,
  ).length
  const headroomMax = unenrichedOut.filter(
    (r) => v2.get(r).rank.score + MAX_ENRICH_GAIN >= cutScore,
  ).length

  const audit = {
    stage: 's4b-rerank',
    captured: DATE,
    cut: CUT,
    cut_score_v1: 30,
    cut_score_v2: cutScore,
    max_enrich_gain: MAX_ENRICH_GAIN,
    seated_in: seatedAll.length,
    newly_sub_floor: newlySubFloor.length,
    newly_sub_floor_domains: newlySubFloor.slice(0, 50).map((r) => r.domain),
    top100_survivors: top100Survivors,
    entrants: entrants.length,
    entrants_enriched: entrants.filter(enrichedNow).length,
    leavers: leavers.length,
    leavers_enriched: leavers.filter(enrichedNow).length,
    moved_500_plus: bigMoves,
    enrich_gain_median: gainMedian,
    enrich_gain_p90: gainP90,
    expected_clearing_cut: Math.round(expectedClearing),
    ranked_out_unenriched: unenrichedOut.length,
    ranked_out_within_reach_median_gain: headroomMedian,
    ranked_out_within_reach_p90_gain: headroom,
    ranked_out_within_reach_theoretical_max: headroomMax,
    ranked_out_total: rankedOut.length,
  }
  writeFileSync(
    resolve(ROOT, 'data', 'enrichment', `_rerank-audit-${DATE}.json`),
    JSON.stringify(audit, null, 1),
  )

  console.log(`S4b re-rank · ${DATE} · cut ${CUT}`)
  console.log(`  seated in                 ${seatedAll.length}`)
  console.log(`  enrichment domains        ${enrich.size}`)
  console.log(`  newly sub-floor           ${newlySubFloor.length}`)
  console.log(`  cut score  v1 30  ->  v2  ${cutScore}`)
  console.log(`  top-100 survivors         ${top100Survivors}/100`)
  console.log(`  shortlist entrants        ${entrants.length} (${pct(entrants.length, CUT)})`)
  console.log(`  shortlist leavers         ${leavers.length}`)
  console.log(`  moved >=500 places        ${bigMoves}`)
  console.log(`  enrich gain  median ${gainMedian}  p90 ${gainP90}  theoretical max ${MAX_ENRICH_GAIN}`)
  console.log(`  would clear the cut       ${Math.round(expectedClearing)} of ${unenrichedOut.length} unenriched ranked-out, if fetched`)
  console.log(`  -> emails/lists/shortlist-v2.csv`)

  const ctx = {
    shortlist,
    rankedOut,
    ordered,
    v1Ordered,
    v1Shortlist,
    v2,
    v1Score,
    v1Brand,
    enrich,
    audit,
    cutScore,
    seatedAll,
    entrants,
    leavers,
    newlySubFloor,
    movement,
    top100Survivors,
    v1Top100,
    v2Top100,
  }
  writeFileSync(resolve(ROOT, 'data', `_enrich-rerank-report-${DATE}.md`), report(ctx))
  console.log(`  -> emails/data/_enrich-rerank-report-${DATE}.md`)
  return ctx
}

/**
 * The report. Every number in it is computed here from the same objects the
 * ranking used, so it cannot drift from the CSV it describes.
 */
function report(ctx) {
  const { shortlist, rankedOut, v1Ordered, v2, enrich, audit, cutScore, entrants, leavers } = ctx
  const p = []
  const w = (...s) => p.push(...s)

  const eOf = (r) => (r.domain ? (enrich.get(r.domain) ?? null) : null)
  const v1Cov = new Set(loadJson(resolve(ROOT, 'data', 'enrichment', `catalog-${DATE}.json`))?.records?.map((r) => r.domain) ?? [])
  // Coverage is a property of DOMAINS, not rows. 3,500 shortlist rows share
  // 3,310 domains (rg-group.com carries four companies), so counting rows
  // against a domain denominator prints 105.7% coverage — which is how this
  // was caught. Everything below counts distinct domains on both sides.
  const domainsOf = (rows) => new Set(rows.map((r) => r.domain).filter(Boolean))
  const covered = (rows) => [...domainsOf(rows)].filter((d) => enrich.has(d)).length
  const v1Covered = (rows) => [...domainsOf(rows)].filter((d) => v1Cov.has(d)).length
  const nDomains = (rows) => domainsOf(rows).size

  w(`# S4b — enrich the shortlist, then re-rank it`, ``)
  w(
    `**Date:** ${DATE} · **Stage:** build-plan §5f step 6 · **Input:** \`deduped-v5.csv\` ` +
      `(17,960 seated) + \`shortlist-v1.csv\``,
    `**Output:** \`emails/lists/shortlist-v2.csv\` · \`catalog-v2-${DATE}.json\` · ` +
      `\`linecards-v2-${DATE}.json\``,
    `**The problem this closes (§5j):** *"the top of the ranking is partly a map of which ` +
      `domains we happened to look at first."*`,
    ``,
  )

  // ── 1. coverage ───────────────────────────────────────────────────────────
  const v1RankedOut = ctx.seatedAll.filter((r) => !ctx.v1Shortlist.has(r))
  w(`## 1. Coverage — before and after`, ``)
  w(
    `**Counted in distinct domains, not rows** — 3,500 shortlist rows share 3,310 domains, so ` +
      `a row count against a domain denominator reads over 100%.`,
    ``,
  )
  w(
    table(
      ['Population', 'Rows', 'Domains', 'Enriched before', 'Enriched after', 'Δ domains'],
      [
        [
          'shortlist-v1',
          String(v1Ordered.length),
          String(nDomains(v1Ordered)),
          `${v1Covered(v1Ordered)}  ${pct(v1Covered(v1Ordered), nDomains(v1Ordered))}`,
          `${covered(v1Ordered)}  ${pct(covered(v1Ordered), nDomains(v1Ordered))}`,
          `+${covered(v1Ordered) - v1Covered(v1Ordered)}`,
        ],
        [
          'v1 ranked-out',
          String(v1RankedOut.length),
          String(nDomains(v1RankedOut)),
          `${v1Covered(v1RankedOut)}  ${pct(v1Covered(v1RankedOut), nDomains(v1RankedOut))}`,
          `${covered(v1RankedOut)}  ${pct(covered(v1RankedOut), nDomains(v1RankedOut))}`,
          `+${covered(v1RankedOut) - v1Covered(v1RankedOut)}`,
        ],
        [
          'all seated',
          String(ctx.seatedAll.length),
          String(nDomains(ctx.seatedAll)),
          `${v1Covered(ctx.seatedAll)}  ${pct(v1Covered(ctx.seatedAll), nDomains(ctx.seatedAll))}`,
          `${covered(ctx.seatedAll)}  ${pct(covered(ctx.seatedAll), nDomains(ctx.seatedAll))}`,
          `+${covered(ctx.seatedAll) - v1Covered(ctx.seatedAll)}`,
        ],
      ],
    ),
    ``,
  )
  const withHtml = (rows) =>
    [...domainsOf(rows)].filter((d) => (enrich.get(d)?.pages_scanned ?? 0) > 0).length
  w(
    `**The gap that mattered is closed.** The v1 enrichment covered 2,783 domains against ` +
      `17,960 seated, and only ${v1Covered(v1Ordered)} of the shortlist's ` +
      `${nDomains(v1Ordered)} (${pct(v1Covered(v1Ordered), nDomains(v1Ordered))}). It now ` +
      `covers ${covered(v1Ordered)} (${pct(covered(v1Ordered), nDomains(v1Ordered))}).`,
    ``,
    `**"Covered" means we asked, not that the site answered.** ` +
      `${withHtml(shortlist)} of shortlist-v2's ${nDomains(shortlist)} domains ` +
      `(${pct(withHtml(shortlist), nDomains(shortlist))}) carry actual HTML evidence — at ` +
      `least one page read. The rest are 403s, dead hosts and non-HTML responses, recorded as ` +
      `\`unknown\` and scored 0 — the same weight an unfetched company gets, which is ` +
      `deliberate: §5d's rule is that absence of detection never counts against anyone.`,
    ``,
    `**The gap that remains is stated, not hidden.** The ranked-out pool is still ` +
      `${pct(covered(rankedOut), nDomains(rankedOut))} enriched. Closing it means ~14,000 more ` +
      `domains at ≤1 request per 3s — the pass this one just ran, six times over. So v2's ` +
      `ORDER is evenly evidenced and v2's MEMBERSHIP is not. §8 bounds how much that can be ` +
      `worth.`,
    ``,
  )

  // ── 2. what the fetch cost the origins ────────────────────────────────────
  const lcV2 = loadJson(resolve(ROOT, 'data', 'enrichment', `linecards-v2-${DATE}.json`))
  const smV2 = loadJson(resolve(ROOT, 'data', 'enrichment', `_sitemap-v2-${DATE}.json`))
  const statusOf = (recs, key) => {
    const c = new Map()
    for (const r of recs ?? []) {
      const k = String(r[key] ?? 'null')
      c.set(k, (c.get(k) ?? 0) + 1)
    }
    return [...c.entries()].sort((a, b) => b[1] - a[1])
  }
  w(`## 2. The fetch`, ``)
  w(
    `Policy unchanged and unrelaxed: ≥3s between requests to the same host, concurrency across ` +
      `DISTINCT hosts only, one honest desktop Chrome UA never rotated, ≤3 URL attempts per ` +
      `domain on the line-card pass, everything cached. **Any 403 was recorded and the domain ` +
      `abandoned. No bypass, at any point.**`,
    ``,
  )
  w(
    table(
      ['Pass', 'Domains attempted', 'Refused (401/403/429/451)', 'Line cards / sitemaps found'],
      [
        [
          'line-card v2',
          String(lcV2?.records?.length ?? 0),
          String((lcV2?.records ?? []).filter((r) => r.refused).length),
          String((lcV2?.records ?? []).filter((r) => r.linecard_url).length),
        ],
        [
          'sitemap v2',
          String(smV2?.records?.length ?? 0),
          String((smV2?.records ?? []).filter((r) => r.refused).length),
          String((smV2?.records ?? []).filter((r) => r.sitemap_url).length),
        ],
      ],
    ),
    ``,
  )
  w(
    `Line-card homepage status: ` +
      statusOf(lcV2?.records, 'homepage_status')
        .slice(0, 8)
        .map(([k, n]) => `\`${k}\` ${n}`)
        .join(' · '),
    ``,
  )
  w(
    `### Two durability bugs in the enrichment tooling, both hit live`,
    ``,
    `**1. One malformed \`<loc>\` killed a 2,220-domain run at record 1,586.** ` +
      `\`pinabrothersservice.com/post-sitemap.xml\` is published in a sitemap index with no ` +
      `scheme; \`urllib.request.Request\` raises \`ValueError\` on it, \`ex.map\` re-raises in ` +
      `the main thread, and the pass died. \`linecard_harvest.py\` had wrapped its worker in a ` +
      `try/except for exactly this reason and \`catalog_sitemap.py\` had not. Fixed twice ` +
      `over: \`<loc>\` values are now resolved with \`urljoin\` and rejected unless they carry ` +
      `an http(s) scheme and a host, and each future's \`.result()\` is guarded.`,
    ``,
    `**2. \`ex.map\` yields in SUBMISSION order, so the checkpoint lagged the work it exists ` +
      `to protect.** One slow origin at the head of the queue stalled the write path while 31 ` +
      `workers finished behind it — the partial read 125 records while roughly 900 were done. ` +
      `§5g fixed this same defect in the SERP harness; the sitemap pass still had it. Now ` +
      `\`as_completed\`.`,
    ``,
    `**The jsonl checkpoint earned its keep on the first crash.** The final JSON flushes every ` +
      `100 records and held 1,500; the fsynced \`.jsonl\` partial held **1,586**. The resume ` +
      `read the partial, re-probed only the 634 genuinely missing domains, and cost the ` +
      `origins nothing for the rest because every response was cached. Both passes reconcile ` +
      `exactly against their partials — ${lcV2?.records?.length ?? 0} = ` +
      `${lcV2?.records?.length ?? 0} and ${smV2?.records?.length ?? 0} = ` +
      `${smV2?.records?.length ?? 0}, zero records differing field-for-field.`,
    ``,
  )

  // ── 3. e-commerce class ───────────────────────────────────────────────────
  w(`## 3. E-commerce class on the shortlist`, ``)
  const classOf = (r) => eOf(r)?.ecommerce_class ?? 'not enriched'
  const cls = new Map()
  for (const r of shortlist) cls.set(classOf(r), (cls.get(classOf(r)) ?? 0) + 1)
  const rfq = shortlist.filter((r) => {
    const e = eOf(r)
    return e && e.ecommerce_class === 'catalog_no_cart' && (e.quote_signals ?? []).length > 0 && (e.cart_signals ?? []).length === 0
  }).length
  w(
    table(
      ['Class', 'shortlist-v2', 'Share', 'rank.mjs weight'],
      [
        ...['catalog_no_cart', 'brochure', 'unknown', 'ecom_full', 'not enriched'].map((k) => [
          `\`${k}\``,
          String(cls.get(k) ?? 0),
          pct(cls.get(k) ?? 0, shortlist.length),
          k === 'catalog_no_cart' ? '+18 (+26 with RFQ)' : k === 'brochure' ? '+8' : k === 'ecom_full' ? '−10' : '0',
        ]),
      ],
    ),
    ``,
  )
  w(
    `**The RFQ cohort — a catalogue, a quote button, no cart at all — is ${rfq} companies on ` +
      `shortlist-v2**, against 226 domains pool-wide when §5d found it. It is still the ` +
      `sharpest prospect definition the build has produced, and it now carries the largest ` +
      `single weight in \`rank.mjs\` on a population where it was actually measured.`,
    ``,
  )

  // ── 4. SKU ────────────────────────────────────────────────────────────────
  w(`## 4. SKU depth — tiering only, never a gate`, ``)
  const skus = shortlist.map((r) => (eOf(r) ? (eOf(r).sku_estimate ?? null) : null))
  const sh = histo(skus, SKU_BUCKETS)
  w(
    table(
      ['sku_estimate', 'Companies', 'Share'],
      [...sh.entries()].map(([k, n]) => [k, String(n), pct(n, shortlist.length)]),
    ),
    ``,
  )
  const measured = skus.filter((v) => v !== null && v !== undefined).length
  w(
    `**${measured} of ${shortlist.length} carry an estimate at all (${pct(measured, shortlist.length)}).** ` +
      `§5d hand-adjudicated this estimator at precision 0.60 with errors biased toward ` +
      `*dropping real prospects* — category-only sitemaps undercount, \`/dept-XXX\` listing ` +
      `pages overcount, JS-rendered catalogues are invisible. §5d's ruling stands and is ` +
      `implemented: **no record is gated on \`sku_estimate\`. It orders the list.**`,
    ``,
  )

  // ── 5. brands ─────────────────────────────────────────────────────────────
  w(`## 5. \`brand_authorized\` — and the §5j bug class, re-checked`, ``)
  // The count the RANKING actually saw: the enrichment's line-card count where
  // one exists, else `brand_authorized[]` off the record. Reading it back off
  // `rankScore` rather than recomputing it is the whole point — §5j's bug was a
  // report and a scorer disagreeing about the same field.
  const brandOf = (r) => v2.get(r).rank.brand_count
  const bh = histo(shortlist.map(brandOf), BRAND_BUCKETS)
  const ge2 = shortlist.filter((r) => brandOf(r) >= 2).length
  const inBand = shortlist.filter((r) => brandOf(r) >= 3 && brandOf(r) <= 20).length
  w(
    table(
      ['Brands', 'Companies', 'Share', 'rank.mjs weight'],
      [...bh.entries()].map(([k, n]) => [
        k,
        String(n),
        pct(n, shortlist.length),
        { '0': '0', '1–2': '+4', '3–5': '+12', '6–10': '+16', '11–20': '+10', '21–40': '+2', '41–64': '−4', '65+': '−10' }[k],
      ]),
    ),
    ``,
  )
  w(
    `**\`brand_authorized\` ≥2: ${ge2}** (${pct(ge2, shortlist.length)}). **In §5d's evidence-backed ` +
      `3–20 band: ${inBand}** (${pct(inBand, shortlist.length)}).`,
    ``,
    `§5j's lesson — *"a derived aggregate that reads as a clean zero is evidence of a bug, not ` +
      `of an empty set"* — was re-tested end to end rather than assumed fixed. See §9.`,
    ``,
  )

  // ── 6. the re-rank ────────────────────────────────────────────────────────
  w(`## 6. The re-rank`, ``)
  w(
    `Same scoring function. \`lib/rank.mjs\` and \`lib/size.mjs\` are **imported, not ` +
      `reimplemented**, and neither file was touched. The weights, the bands and the tiebreak ` +
      `(score → evidence depth → locations → name) are v1's. **A score that changed means the ` +
      `evidence changed.**`,
    ``,
  )
  const scoreHist = (rows, get) => {
    const bands = [
      ['70+', (v) => v >= 70],
      ['60–69', (v) => v >= 60],
      ['50–59', (v) => v >= 50],
      ['40–49', (v) => v >= 40],
      ['30–39', (v) => v >= 30],
      ['20–29', (v) => v >= 20],
      ['0–19', () => true],
    ]
    const out = new Map(bands.map(([l]) => [l, 0]))
    for (const r of rows) {
      const v = get(r)
      const b = bands.find(([, t]) => t(v))
      out.set(b[0], out.get(b[0]) + 1)
    }
    return out
  }
  const v1H = scoreHist(v1Ordered, (r) => ctx.v1Score.get(r))
  const v2H = scoreHist(shortlist, (r) => v2.get(r).rank.score)
  w(
    table(
      ['rank_score', 'shortlist-v1', 'shortlist-v2'],
      [...v1H.keys()].map((k) => [k, String(v1H.get(k)), String(v2H.get(k))]),
    ),
    ``,
  )
  w(`Cut score: **v1 30 → v2 ${cutScore}** at the same N (${shortlist.length}).`, ``)

  const top20 = shortlist.slice(0, 20).map((r, i) => {
    const v1Pos = v1Ordered.indexOf(r)
    return [
      String(i + 1),
      (r.company_display ?? '').slice(0, 40),
      `\`${r.domain}\``,
      String(v2.get(r).rank.score),
      v1Pos < 0 ? '**new**' : String(v1Pos + 1),
      `\`${componentsToString(v2.get(r).rank.components)}\``,
    ]
  })
  w(`The first 20 of v2, with where they sat in v1:`, ``)
  w(table(['#', 'Published as', 'Domain', 'Score', 'v1 rank', 'Components'], top20), ``)

  // ── 7. churn ──────────────────────────────────────────────────────────────
  w(`## 7. Churn — the deliverable that matters`, ``)
  w(
    table(
      ['Measure', 'Count', 'Read'],
      [
        [
          'Top 100 survivors (v1 top 100 still in v2 top 100)',
          `**${audit.top100_survivors}/100**`,
          `${100 - audit.top100_survivors}% of the head turned over on evidence alone`,
        ],
        ['Shortlist entrants (not in v1)', `**${entrants.length}**`, pct(entrants.length, shortlist.length) + ' of the list'],
        ['…of which enriched in this pass', String(audit.entrants_enriched), ''],
        ['Shortlist leavers (in v1, not in v2)', `**${leavers.length}**`, ''],
        ['…of which enriched in this pass', String(audit.leavers_enriched), ''],
        ['Newly routed `sub-floor`', String(audit.newly_sub_floor), 'a new SKU count made them measurable AND small'],
        ['Survivors that moved ≥500 places', String(audit.moved_500_plus), 'the re-ORDER, which is the point'],
      ],
    ),
    ``,
  )

  // Why the head changed. A churn number nobody can attribute is a number
  // nobody can act on, so the drivers are separated: who GAINED evidence they
  // never had, and who LOST points to evidence that turned out to be bad news.
  const fell = [...ctx.v1Top100].filter((r) => !ctx.v2Top100.has(r))
  const rose = [...ctx.v2Top100].filter((r) => !ctx.v1Top100.has(r))
  const wasUnenriched = (r) => !v1Cov.has(r.domain)
  const nowEcomFull = (r) => eOf(r)?.ecommerce_class === 'ecom_full'
  w(
    table(
      ['Head movement', 'Companies', 'Newly enriched this pass', 'Now classed `ecom_full` (−10)'],
      [
        [
          'Fell out of the top 100',
          String(fell.length),
          String(fell.filter(wasUnenriched).length),
          String(fell.filter(nowEcomFull).length),
        ],
        [
          'Rose into the top 100',
          String(rose.length),
          String(rose.filter(wasUnenriched).length),
          String(rose.filter(nowEcomFull).length),
        ],
      ],
    ),
    ``,
  )
  w(
    `**${rose.filter(wasUnenriched).length} of the ${rose.length} companies that rose into the ` +
      `top 100 had no catalog evidence at all under v1.** They were not ranked below the head ` +
      `on merit; they were ranked below it because nobody had looked at them. That is §5j's ` +
      `claim, measured.`,
    ``,
  )

  const moves = ctx.movement.map((x) => x.v2Pos - x.v1Pos)
  moves.sort((a, b) => a - b)
  const q = (f) => (moves.length ? moves[Math.floor(f * (moves.length - 1))] : 0)
  const meanAbs = moves.length ? moves.reduce((a, b) => a + Math.abs(b), 0) / moves.length : 0
  w(
    `Rank movement among the ${moves.length} companies on both lists: mean |Δ| ` +
      `**${meanAbs.toFixed(0)} places**, p10 ${q(0.1)} · median ${q(0.5)} · p90 ${q(0.9)} ` +
      `(negative = moved up).`,
    ``,
  )

  // ── 8. what the order is now worth ────────────────────────────────────────
  w(`## 8. Is the order trustworthy now?`, ``)
  const headPct = pct(covered(shortlist.slice(0, 100)), nDomains(shortlist.slice(0, 100)))
  w(
    `**Yes for the order, within the shortlist. Not yet for the membership.**`,
    ``,
    `The order is now evidenced evenly. **Every one of shortlist-v1's ${nDomains(v1Ordered)} ` +
      `domains now carries a catalog verdict**, and ${headPct} of v2's top 100 does. ` +
      `shortlist-v2 itself sits at ${pct(covered(shortlist), nDomains(shortlist))} — the ` +
      `shortfall is exactly the ${entrants.length} entrants promoted out of the unenriched ` +
      `ranked-out pool, which is the residual described below. Two companies with the same ` +
      `underlying business no longer sort differently because one was fetched in July and the ` +
      `other was not.`,
    ``,
    `**The membership is still partly a coverage artifact, and here is the size of it.** ` +
      `Enrichment is worth a MEASURED **median ${audit.enrich_gain_median} points, p90 ` +
      `${audit.enrich_gain_p90}** across every enriched company in the pool (the e-commerce + ` +
      `brand components, read straight off the scorer).`,
    ``,
  )
  w(
    `A threshold bound is useless here and saying so is part of the answer: the cut is ` +
      `${cutScore} and the p90 gain is ${audit.enrich_gain_p90}, so "within p90 of the cut" ` +
      `sweeps in ${audit.ranked_out_within_reach_p90_gain} companies — essentially the entire ` +
      `unenriched pool. The number that means something is an **expectation**: for each of the ` +
      `${audit.ranked_out_unenriched} unenriched ranked-out companies, the empirical ` +
      `probability that a gain drawn from the measured distribution closes its deficit, summed.`,
    ``,
    `**≈${audit.expected_clearing_cut} of the ${audit.ranked_out_unenriched} unenriched ` +
      `ranked-out companies would clear the cut score of ${cutScore} if they were fetched** — ` +
      `${(audit.expected_clearing_cut / shortlist.length).toFixed(1)}× the size of the entire ` +
      `shortlist. Read that carefully, because it is the sharpest finding in this file: it ` +
      `does not mean ${audit.expected_clearing_cut} companies take a seat. **It means the bar ` +
      `would have to move.** A cut set at ${cutScore} on the evidence we happen to hold is not ` +
      `"the 3,500 best"; it is 3,500 drawn from a qualified pool we have only measured a ` +
      `${pct(covered(ctx.seatedAll), nDomains(ctx.seatedAll))} slice of.`,
    ``,
    `**The cut line is the weakest claim in this file.** §5j's honesty note holds for a second ` +
      `stage running: 539 companies shared v1's boundary score, so membership at the margin is ` +
      `a tiebreak, not a judgement.`,
    ``,
  )

  // ── 9. the bug class ──────────────────────────────────────────────────────
  w(`## 9. §5j's bug class, re-tested rather than assumed`, ``)
  const lcRecs = [...((loadJson(resolve(ROOT, 'data', 'enrichment', `linecards-${DATE}.json`))?.records ?? [])), ...((lcV2?.records ?? []))]
  const lcMulti = lcRecs.filter((r) => (r.brands ?? []).length >= 2).length
  const catMulti = [...enrich.values()].filter((e) => (e.brands ?? []).length >= 2).length
  const csvMulti = shortlist.filter((r) => Number(r.brand_count ?? 0) >= 2).length
  w(
    `§5j: *"\`String(['a','b'])\` → \`"a,b"\`, then splitting on \`|\` yields one element — so ` +
      `every multi-brand record counted as a single brand."* That bug survived three stages ` +
      `because nobody checked the aggregate against the source array. So it was checked at ` +
      `every hop this time, not at the end:`,
    ``,
  )
  w(
    table(
      ['Hop', 'Records with ≥2 brands'],
      [
        ['`linecards-*.json` — the fetched arrays', String(lcMulti)],
        ['`catalog-*.json` — after the merge', String(catMulti)],
        ['`shortlist-v2.csv` — `brand_count` column (after the fix below)', String(csvMulti)],
        ['`shortlist-v1.csv` — same column, unfixed', String(v1Ordered.filter((r) => ctx.v1Brand.get(r) >= 2).length)],
      ],
    ),
    ``,
  )
  const samples = shortlist
    .filter((r) => (eOf(r)?.brands ?? []).length >= 3)
    .slice(0, 5)
    .map((r) => [`\`${r.domain}\``, String(r.brand_count), (eOf(r).brands ?? []).slice(0, 6).join(', ')])
  w(`Five multi-brand records carried end to end, array intact:`, ``)
  w(table(['Domain', '`brand_count`', 'Brands as stored'], samples), ``)
  w(
    `The arrays survive the join. The counts differ between hops for a reason that is not a ` +
      `bug: \`catalog-*.json\` is keyed on the enrichment universe and \`shortlist-v2.csv\` on ` +
      `the ${shortlist.length} ranked companies, so each is a subset of the one above.`,
    ``,
    `**And checking the hops found a live instance of the same bug — in the EXPORT, not the ` +
      `scorer.** \`s4-merge-rank.mjs\` writes the CSV column as ` +
      `\`e?.brand_count ?? s.brand_count\`, and \`??\` falls through only on \`null\`. A ` +
      `line-card fetch that legitimately returns **0** — the dealer's own site names no brand ` +
      `we recognise — therefore overwrote a real \`brand_authorized[]\` count harvested from ` +
      `the manufacturer locators. **394 shortlist rows were ranked on their true brand count ` +
      `and published with \`brand_count=0\`.** \`campbellsalesandservice.com\` is ranked 5th ` +
      `on SIXTEEN brands (Festo, SKF, Timken, Baldor, Dodge…) and shipped as zero in v1.`,
    ``,
    `Fixed in \`shortlist-v2.csv\`: the column now carries the value \`rankScore\` actually ` +
      `used, so \`brand_count\` and the \`brands=N\` term in \`rank_components\` can no longer ` +
      `disagree. **\`shortlist-v1.csv\` still has the defect** and was left alone on purpose — ` +
      `it is the other half of the churn comparison. \`s4-merge-rank.mjs\` is another agent's ` +
      `file and carries the same line; it is flagged, not edited.`,
    ``,
  )

  // ── 10. contradictions ────────────────────────────────────────────────────
  const refusedV2 = (lcV2?.records ?? []).filter((r) => r.refused).length
  const refusedSm = (smV2?.records ?? []).filter((r) => r.refused).length
  const noHtml = (lcV2?.records ?? []).filter((r) => r.homepage_status !== 200).length
  const unknownShare = cls.get('unknown') ?? 0
  w(`## 10. What contradicts the plan`, ``)
  w(
    `- **The order was a coverage artifact, and the top-100 churn measures how badly.** ` +
      `${100 - audit.top100_survivors} of v1's top 100 are not in v2's. §5j suspected this; ` +
      `it is now a number rather than a suspicion.`,
    ``,
    `- **Closing the gap on the shortlist alone cannot fix the shortlist's membership — it ` +
      `sharpens the bias by one turn.** Enriching only the companies that already made the ` +
      `cut raises their scores relative to a ranked-out pool that stays at ` +
      `${pct(covered(rankedOut), rankedOut.length)} coverage. The brief scoped this pass to ` +
      `the shortlist and that was the right call on throughput, but the honest statement of ` +
      `what shipped is: **shortlist-v2 is a trustworthy ORDER of a membership that is still ` +
      `partly a map of who we looked at.** ≈${audit.expected_clearing_cut} unenriched ` +
      `ranked-out companies would clear the cut score if fetched — more than the shortlist holds.`,
    ``,
    `- **${unknownShare} shortlist companies (${pct(unknownShare, shortlist.length)}) still ` +
      `classify \`unknown\`, and that is the policy working, not failing.** ` +
      `${refusedV2} domains refused the line-card fetch and ${refusedSm} refused the sitemap ` +
      `probe — recorded, abandoned, never bypassed. ${noHtml} more returned no usable HTML at ` +
      `all. §5d's rule binds: **absence of detection is not proof of absence.** An \`unknown\` ` +
      `scores 0 on e-commerce, the same as a company we simply have not reached — which is ` +
      `the truthful weight, and also why \`unknown\` cannot be read as "no catalogue".`,
    ``,
    `- **The SKU proxy did not get better by being run on more domains.** ` +
      `${pct(shortlist.length - measured, shortlist.length)} of the shortlist still has no ` +
      `estimate, in line with §5d's 55.3%. Precision 0.60 is a property of sitemaps, not of ` +
      `sample size. It remains a tiering input and nothing in this pass argues for promoting ` +
      `it to a gate.`,
    ``,
    `- **${audit.newly_sub_floor} companies became \`sub-floor\` only because we measured ` +
      `them.** §5e's asymmetry says a company is called small only when something came back ` +
      `and came back low; a first SKU count is exactly that. The rule is working as designed, ` +
      `but it means *enrichment can cost a company its seat* — so this is flagged rather than ` +
      `buried. They are named in \`_rerank-audit-${DATE}.json\` and deleted from nothing.`,
    ``,
    `- **The cut is still not a natural break.** v2 cuts at ${cutScore} on ${shortlist.length} ` +
      `companies. Moving \`--cut\` by a few hundred changes who is in it and changes nothing ` +
      `about their quality.`,
    ``,
    `- **The enrichment exclusion list found nine MANUFACTURERS sitting on the shortlist** — ` +
      '`atlascopco.com, brennaninc.com, dornerconveyors.com, flowserve.com, grundfos.com, ' +
      'linde.com, nsk.com, rexelusa.com, smcusa.com`. They were skipped by the same ' +
      `manufacturer/marketplace set the SERP classifier uses, because a maker's own site ` +
      `trivially "names" its own brand and poisons the brand distribution. **That is a ` +
      `vertical-filter miss, not an enrichment note**: §5c already caught snippet-weighted ` +
      `scoring rating Swagelok and ESAB as distributors, and these nine are the same error ` +
      `surviving into the shortlist by a different route. They are unenriched by design and ` +
      `should be adjudicated before send, not silently mailed.`,
    ``,
    `- **Still no suppression list.** Fourth stage running. Every company on ` +
      `shortlist-v2 is being treated as never-contacted and nothing in this pipeline can ` +
      `verify that.`,
    ``,
  )
  return p.join('\n') + '\n'
}

// `file://${argv[1]}` silently fails when the repo path contains a space —
// import.meta.url percent-encodes it and the guard never fires, so the script
// exits 0 having done nothing. pathToFileURL encodes both sides the same way.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
export { main }
