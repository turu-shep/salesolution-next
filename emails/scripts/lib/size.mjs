/**
 * size — the §4.5 size proxies, scored rather than gated (§5e).
 *
 * The plan set a $2M revenue floor. **We cannot measure revenue**, and §5e says
 * so plainly: *"a floor you cannot measure is fiction."* §5d then measured what
 * happens when you gate on a proxy anyway — the SKU estimator ran at precision
 * 0.60 with errors biased toward *dropping real prospects*, so the hard floor
 * was replaced by a tiering input. This module is the same decision applied to
 * size: every signal contributes points, nothing disqualifies, and only a record
 * with **positive measured evidence of being small** is routed `sub-floor`.
 *
 * That asymmetry is the whole design. An unmeasured company is not a small
 * company. `review_count: null` means DFS never listed it; `sku_estimate: null`
 * means the S3b crawl never reached it. Both score zero and neither routes
 * anywhere, because the alternative — treating absence of evidence as evidence
 * of absence — is exactly the error §5c caught in Segment W, where 76% of the
 * "no website" pool turned out to have websites.
 *
 * ## What is actually in hand
 *
 * §5f's revised order forbids per-domain fetching before the cut, so this runs
 * on signals already paid for:
 *
 *   `location_count`     from the S2 rollup — distinct addresses, union across
 *                        sources. Capped at 19 by construction: §3.3 routes ≥20
 *                        to `above-ceiling` before this module ever sees it.
 *   `review_count`       DFS `rating.votes_count`, parsed out of `tier_raw`.
 *                        36,761 of 45,554 listings carry one, mean 31.6.
 *   AD / PTDA membership a distributor that pays association dues is not a
 *                        two-person shop. §2a and §5b both treat it as real.
 *   brand breadth        the dealer's own published line card where S3b read one
 *                        (`brand_count`), else `brand_authorized[]`.
 *   `sku_estimate`       §5d's estimator, used the way §5d concluded it must be:
 *                        as an input that orders the list, never as a gate.
 *   NAP completeness     a business publishing street, ZIP, phone and website is
 *                        more established than one publishing a phone. Weak, and
 *                        weighted accordingly.
 *   `evidence_depth`     appearing in several independent files is itself size
 *                        evidence — §5a measured 98.3% of companies at depth 1.
 *
 * ## The bands are proxies and are named as proxies
 *
 * `10-50M` does not mean we measured $10–50M of revenue. It means the stack of
 * proxies puts a company in the band the plan calls T1/T2. Nothing downstream
 * may treat it as a revenue figure.
 *
 * Tests: emails/scripts/lib/size.test.mjs
 */
import { split } from './contract.mjs'

/** Points per signal. Every one is additive; none can disqualify. */
export const WEIGHTS = {
  locations: [
    [20, 0], // ≥20 never reaches here — §3.3 routed it `above-ceiling`
    [10, 30],
    [5, 24],
    [3, 16],
    [2, 8],
    [1, 0],
  ],
  reviews: [
    [150, 24],
    [50, 20],
    [15, 14],
    [5, 8],
    [1, 3],
    [0, 0],
  ],
  brands: [
    [21, 14],
    [11, 12],
    [6, 10],
    [3, 6],
    [0, 0],
  ],
  skus: [
    [20000, 16],
    [5000, 14],
    [1000, 10],
    [200, 6],
    [0, 0],
  ],
  evidence: [
    [4, 10],
    [3, 7],
    [2, 4],
    [1, 0],
  ],
  /** Association membership. Both is worth more than one, not twice one. */
  ad: 10,
  ptda: 10,
  bothAssociations: 16,
  /** NAP: one point short of trivial, per field published. */
  napEach: 1.5,
}

/** Score → band. Measured boundaries; see `_merge-rank-report` for the shape. */
export const BAND_CUTS = [
  [45, 'above-band'],
  [26, '10-50M'],
  [14, '5-10M'],
  [8, '2-5M'],
]

/** First threshold a value clears, walking the table top-down. */
function step(table, value) {
  if (value === null || value === undefined) return 0
  for (const [min, points] of table) if (value >= min) return points
  return 0
}

/**
 * DFS ships review counts inside `tier_raw` as `claimed=true;votes=37;rating=4.6`
 * — carried verbatim and unmapped per §3, so this is the one place that reads
 * them. After a cross-source merge `tier_raw` holds a comma-joined list of every
 * contributing source's string; the LARGEST vote count wins, because a company
 * with two listings has two listings' worth of reviews and the bigger one is the
 * main location.
 *
 * @param {Record<string, any>} record
 * @returns {number|null} null when no source published a vote count at all
 */
export function reviewCount(record) {
  const raw = String(record?.tier_raw ?? '')
  let best = null
  for (const m of raw.matchAll(/votes=(\d+)/g)) {
    const n = Number(m[1])
    if (Number.isFinite(n) && (best === null || n > best)) best = n
  }
  return best
}

/** Distinct source names on a record, post-merge. */
function sourcesOf(record) {
  return new Set(String(record?.source ?? '').split('|').filter(Boolean))
}

/**
 * Score one company's size stack.
 *
 * @param {Record<string, any>} record  a merged contract record
 * @param {{brand_count?: number|null, sku_estimate?: number|null}} [enrich]
 *   the S3b enrichment for this domain, where it exists. Never fetched here.
 * @returns {{score: number, band: string, measurable: boolean, components: Record<string, number>, review_count: number|null, brand_count: number|null}}
 */
export function sizeScore(record, enrich = {}) {
  const sources = sourcesOf(record)
  const reviews = reviewCount(record)
  const brandCount =
    enrich.brand_count != null && enrich.brand_count > 0
      ? enrich.brand_count
      : (record.brand_authorized ? split(record.brand_authorized).length : 0)
  const skus = enrich.sku_estimate ?? null

  const nap = [record.address_1, record.zip5, record.phone_e164, record.domain].filter(Boolean).length

  const components = {
    locations: step(WEIGHTS.locations, Number(record.location_count ?? 1)),
    reviews: step(WEIGHTS.reviews, reviews),
    brands: step(WEIGHTS.brands, brandCount),
    skus: step(WEIGHTS.skus, skus),
    evidence: step(WEIGHTS.evidence, Number(record.evidence_depth ?? 1)),
    association:
      sources.has('ad') && sources.has('ptda')
        ? WEIGHTS.bothAssociations
        : sources.has('ad')
          ? WEIGHTS.ad
          : sources.has('ptda')
            ? WEIGHTS.ptda
            : 0,
    nap: Math.round(nap * WEIGHTS.napEach * 10) / 10,
  }

  const score = Math.round(Object.values(components).reduce((a, b) => a + b, 0) * 10) / 10

  // The asymmetry: only a company we actually MEASURED can be called small.
  // Reviews and SKUs are the two direct measurements; everything else is
  // structural and silent when a source simply didn't publish it.
  const measurable = reviews !== null || skus !== null

  let band = '2-5M'
  for (const [cut, name] of BAND_CUTS) {
    if (score >= cut) {
      band = name
      break
    }
  }
  if (score < BAND_CUTS[BAND_CUTS.length - 1][0]) band = measurable ? 'sub-floor' : '2-5M'

  // `brandCount`, not `brandCount || null`: `||` collapses a measured zero into
  // the same value an unmeasured company gets, and this field is exported as a
  // CSV column. Zero means "no source named a brand"; null meant the same thing
  // and also meant "we never looked". Same bug class as the `??` in
  // `s4-merge-rank.mjs` — a falsy-but-legitimate 0 being treated as absence.
  return { score, band, measurable, components, review_count: reviews, brand_count: brandCount }
}
