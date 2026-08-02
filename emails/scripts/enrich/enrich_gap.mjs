/**
 * Measure what enriching the never-looked-at pool did to the cut line.
 *
 * §5j's finding was that `shortlist-v1` was "partly a map of which domains we
 * happened to look at first". §5f step 6 closed that gap on the shortlist and
 * thereby *sharpened* it: enriching only the companies that already made the
 * cut raises them against a ranked-out pool nobody had fetched. The rerank
 * report bounded the damage with an expectation — **≈6,513 of the 13,716
 * unenriched ranked-out companies would clear the cut score of 30 if they were
 * fetched.** That number was a projection from a measured gain distribution.
 *
 * This script replaces the projection with a count. It re-scores every seated
 * company twice — once with the enrichment that existed when `shortlist-v2` was
 * cut, once with the new pass folded in — and reports how many of the newly
 * fetched companies actually clear 30.
 *
 * It **imports** `rankScore` and `sizeScore` rather than reimplementing them,
 * for the same reason `s4b-rerank.mjs` does: a score that changes must mean the
 * evidence changed, never that a second copy of the weights drifted.
 *
 * It writes no list and re-ranks nothing. The global re-rank is another agent's
 * job and happens after both passes land. This only measures.
 *
 * Usage: node emails/scripts/enrich/enrich_gap.mjs [--cut-score 30]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { fromCsv } from '../lib/contract.mjs'
import { rankScore } from '../lib/rank.mjs'
import { sizeScore } from '../lib/size.mjs'
import { loadEnrichment } from '../s4b-rerank.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..')
const argv = process.argv.slice(2)
const arg = (f, d = null) => {
  const i = argv.indexOf(f)
  return i >= 0 ? argv[i + 1] : d
}
const DATE = arg('--date', '2026-08-01')
const CUT_SCORE = Number(arg('--cut-score', '30'))
const E = (f) => resolve(ROOT, 'data', 'enrichment', f)

/** Buckets that match `catalog_report.py`, so the two files never disagree. */
const skuBucket = (n) =>
  n === null || n === undefined
    ? 'unknown'
    : n === 0
      ? '0'
      : n <= 49
        ? '1-49'
        : n <= 199
          ? '50-199'
          : n <= 999
            ? '200-999'
            : n <= 4999
              ? '1k-5k'
              : n <= 19999
                ? '5k-20k'
                : '20k+'

const brandBucket = (n) =>
  n === null || n === undefined
    ? 'unknown'
    : n === 0
      ? '0'
      : n <= 2
        ? '1-2'
        : n <= 5
          ? '3-5'
          : n <= 10
            ? '6-10'
            : n <= 20
              ? '11-20'
              : n <= 40
                ? '21-40'
                : n <= 64
                  ? '41-64'
                  : '65+'

const tally = (rows, keyOf) => {
  const m = new Map()
  for (const r of rows) m.set(keyOf(r), (m.get(keyOf(r)) ?? 0) + 1)
  return m
}

const quantile = (sorted, q) =>
  sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(q * (sorted.length - 1)))] : null

function main() {
  const seated = fromCsv(readFileSync(resolve(ROOT, 'lists', 'deduped-v5.csv'), 'utf8'))

  // "Before" is exactly the evidence `shortlist-v2` was cut on. "After" adds
  // this pass. Loading them as two separate maps is what makes "newly enriched"
  // a fact about coverage rather than about file order.
  const before = loadEnrichment([E(`catalog-${DATE}.json`), E(`catalog-v2-${DATE}.json`)])
  const v3Paths = [E(`catalog-v3-${DATE}.json`)].filter(existsSync)
  const after = loadEnrichment([E(`catalog-${DATE}.json`), E(`catalog-v2-${DATE}.json`), ...v3Paths])

  const scoreWith = (r, map) => {
    const e = r.domain ? (map.get(r.domain) ?? null) : null
    const s = sizeScore(r, e ?? {})
    return { e, size: s, rank: rankScore(r, { size: s, enrich: e }) }
  }

  const rows = seated.map((r) => {
    const b = scoreWith(r, before)
    const a = scoreWith(r, after)
    return {
      r,
      b,
      a,
      // A company is "newly enriched" when this pass is the first time anyone
      // fetched its domain. Rows sharing a domain all flip together, which is
      // correct: the evidence is a property of the site, not of the record.
      newly: Boolean(r.domain) && after.has(r.domain) && !before.has(r.domain),
      wasEnriched: Boolean(r.domain) && before.has(r.domain),
    }
  })

  const newly = rows.filter((x) => x.newly)
  // Only a company that stays in the ranking can take a seat. `size.mjs` routes
  // sub-floor companies out entirely, and a first SKU count is exactly the kind
  // of measurement that can trigger it — so enrichment can COST a seat, and
  // that has to be counted separately rather than folded into the win.
  const rankable = (x) => x.a.size.band !== 'sub-floor'
  const clears = newly.filter((x) => rankable(x) && x.a.rank.score >= CUT_SCORE)
  const clearedBefore = newly.filter(
    (x) => x.b.size.band !== 'sub-floor' && x.b.rank.score >= CUT_SCORE,
  )
  const newlySubFloor = newly.filter((x) => x.a.size.band === 'sub-floor' && x.b.size.band !== 'sub-floor')

  const gains = newly.map((x) => Math.round((x.a.rank.score - x.b.rank.score) * 10) / 10).sort((p, q) => p - q)
  const promoted = newly.filter(
    (x) => rankable(x) && x.b.rank.score < CUT_SCORE && x.a.rank.score >= CUT_SCORE,
  )

  const enrichOf = (x) => x.a.e ?? {}
  const out = {
    stage: 's3-enrichment-gap',
    captured: DATE,
    cut_score: CUT_SCORE,
    note:
      'Measures only. No list is written and nothing is re-ranked; the global ' +
      're-rank runs after the list-side agent lands.',
    seated_rows: rows.length,
    seated_domains: new Set(rows.map((x) => x.r.domain).filter(Boolean)).size,
    enriched_domains_before: before.size,
    enriched_domains_after: after.size,
    newly_enriched_domains: after.size - before.size,
    newly_enriched_rows: newly.length,
    rows_still_unenriched: rows.filter((x) => !x.newly && !x.wasEnriched).length,

    // THE number: how badly the membership was mis-selected.
    newly_enriched_clearing_cut: clears.length,
    newly_enriched_clearing_cut_before: clearedBefore.length,
    newly_enriched_promoted_over_cut: promoted.length,
    newly_enriched_routed_sub_floor: newlySubFloor.length,

    gain_median: quantile(gains, 0.5),
    gain_p90: quantile(gains, 0.9),
    gain_max: gains.length ? gains[gains.length - 1] : null,
    gain_negative: gains.filter((g) => g < 0).length,

    ecommerce_class: Object.fromEntries(tally(newly, (x) => enrichOf(x).ecommerce_class ?? 'not enriched')),
    sku_bucket: Object.fromEntries(tally(newly, (x) => skuBucket(enrichOf(x).sku_estimate ?? null))),

    // Two brand distributions, deliberately. `brand_bucket_fetched` is what the
    // line card said; a 0 there means "we read the page and it names no brand we
    // recognise", which is a finding. `brand_bucket_scored` is what `rank.mjs`
    // actually ranked on, which falls back to the locators' `brand_authorized[]`
    // when the fetch found none. §5j's live bug was publishing the first where
    // the second was used — 394 rows shipped `brand_count=0` while being ranked
    // on their true count. Reporting one without the other is how that happens.
    brand_bucket_fetched: Object.fromEntries(tally(newly, (x) => brandBucket(enrichOf(x).brand_count ?? null))),
    brand_bucket_scored: Object.fromEntries(tally(newly, (x) => brandBucket(x.a.rank.brand_count))),
    // The exact masking case, counted: line card found zero, locators had more.
    fetched_zero_masking_real_count: newly.filter(
      (x) => (enrichOf(x).brand_count ?? null) === 0 && x.a.rank.brand_count > 0,
    ).length,
    fetched_zero_masking_sample: newly
      .filter((x) => (enrichOf(x).brand_count ?? null) === 0 && x.a.rank.brand_count >= 3)
      .slice(0, 8)
      .map((x) => ({ domain: x.r.domain, fetched: 0, scored: x.a.rank.brand_count })),
    score_bands: Object.fromEntries(
      tally(newly.filter(rankable), (x) => {
        const s = x.a.rank.score
        return s >= 70 ? '70+' : s >= 60 ? '60-69' : s >= 50 ? '50-59' : s >= 40 ? '40-49' : s >= 30 ? '30-39' : '0-29'
      }),
    ),
    top_newly_enriched: newly
      .filter(rankable)
      .sort((p, q) => q.a.rank.score - p.a.rank.score)
      .slice(0, 20)
      .map((x) => ({
        company_display: x.r.company_display,
        domain: x.r.domain,
        score_before: x.b.rank.score,
        score_after: x.a.rank.score,
        ecommerce_class: enrichOf(x).ecommerce_class ?? null,
        sku_estimate: enrichOf(x).sku_estimate ?? null,
        brand_count: x.a.rank.brand_count,
      })),
  }

  writeFileSync(E(`_enrich-gap-${DATE}.json`), JSON.stringify(out, null, 1))
  console.log(JSON.stringify({ ...out, top_newly_enriched: out.top_newly_enriched.slice(0, 5) }, null, 1))
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
export { main }
