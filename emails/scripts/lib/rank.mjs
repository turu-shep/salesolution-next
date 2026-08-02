/**
 * rank — build-plan §5f step 5: order the pool and cut it, before enrichment.
 *
 * §5f inverted the economics. The pipeline was built to qualify ~2,800 domains
 * and then rank them; at 17,472 domains a single catalog-depth pass is 14+ hours
 * and the binding constraint stopped being supply. So the cut happens **on
 * evidence already in hand**, and enrichment runs afterwards on the slice that
 * survives.
 *
 * Every weight below traces to something the build measured. None of them are
 * preferences, and the two that most look like preferences are the two that
 * measurement most sharply contradicts:
 *
 * **1. The catalog cohort, not the e-commerce score.** §5d found 226 domains
 * carrying a product catalog, an RFQ button and no cart at all — *"the offer's
 * thesis rendered as a query: they sell online, they just can't transact or be
 * found."* That cohort gets the single largest positive weight in this file. A
 * fully transactional site gets a NEGATIVE weight, because it does not have the
 * problem we sell against.
 *
 * **2. Brand breadth is not monotonic, and ranking on it naively is a trap.**
 * §5d's measured share of dealers with full e-commerce, by brand count:
 * 0 → 4.5% · 1–2 → 12.1% · 3–5 → 14.5% · **6–10 → 18.4%** · 11–20 → 15.0% ·
 * 21–40 → 20.0% · 41–64 → 36.4% · **65+ → 50.0%**. Half of the 65+ dealers are
 * already fully transactional — finditparts (113 brands), penntoolco (96),
 * mrosupply (65). *"Ranking on breadth would have surfaced precisely the dealers
 * who need nothing."* So the curve peaks at 6–10 and turns negative above 40.
 *
 * The rest: `evidence_depth` (§5a measured 98.3% at depth 1, so depth 2+ is rare
 * and real), a quotable `self_declaration` (§5b — the dealer's own words are
 * better copy than any database join, and page-verbatim beats a Google-truncated
 * snippet), NAP completeness (S5/S6 cannot work a record it cannot contact), and
 * the §4.5 size band, where the plan's own T1 definition is the $10–50M band.
 *
 * Two penalties, both honesty rather than judgement: `icp_uncertain` says the
 * classifier could not decide and §5d's rule is that such a record is tiered low
 * rather than deleted; `needs_identity_resolution` says we have a website and a
 * claim but no verified company — unrankable as a lead until S3 resolves it.
 *
 * **Nothing here sets a disposition.** `rankScore` orders; the caller cuts. A
 * record below the cut stays seated in `deduped-v5.csv` and is written to
 * `pool-ranked-out.csv`, because the no-delete rule covers losing a rank as much
 * as failing a filter.
 *
 * Tests: emails/scripts/lib/rank.test.mjs
 */
import { FLOOR as CATEGORY_FLOOR } from './category.mjs'
import { split } from './contract.mjs'

/**
 * §5d's e-commerce classes, weighted by how badly the company has the problem.
 * `catalog_rfq_no_cart` is the 226-domain cohort: `catalog_no_cart` AND a quote
 * signal AND zero cart signals.
 */
export const ECOM_WEIGHTS = {
  catalog_rfq_no_cart: 26,
  catalog_no_cart: 18,
  brochure: 8,
  unknown: 0,
  ecom_full: -10,
}

/** §5d's brand-count curve. `[min, points]`, walked top-down. NOT monotonic. */
export const BRAND_BANDS = [
  [65, -10],
  [41, -4],
  [21, 2],
  [11, 10],
  [6, 16],
  [3, 12],
  [1, 4],
  [0, 0],
]

/** §5a: 98.3% of companies sit at one source. Depth is scarce, so it is worth points. */
export const EVIDENCE_BANDS = [
  [4, 14],
  [3, 10],
  [2, 6],
  [1, 0],
]

/** §4.5's proxy bands → priority. The plan's T1 is the $10–50M band. */
export const SIZE_BAND_WEIGHTS = {
  'above-band': 6,
  '10-50M': 20,
  '5-10M': 12,
  '2-5M': 4,
  'sub-floor': -15,
}

/**
 * How strong the source's own category evidence is, from `category_core` — the
 * weighted core-code score after §5f's query-artifact discount.
 *
 * This is where thin evidence is priced. 80.2% of DFS records carry exactly one
 * core code, which scores 1.5 after the discount and means almost nothing; a
 * record carrying three corroborating industrial codes scores 6+ and means a
 * great deal. Records from the locator and SERP sources carry no codes at all
 * and score 0 here — they earn their place through `evidence_depth`, a published
 * declaration and brand authorization instead.
 */
export const CATEGORY_CORE_BANDS = [
  [8, 10],
  [5, 8],
  [3, 4],
  [0, 0],
]

/** A contamination cluster that cleared FLOOR and lost on MARGIN alone. */
export const PENALTY_CONTESTED_CATEGORY = -6

export const DECLARATION_VERBATIM = 12
export const DECLARATION_SNIPPET = 7
/** Five contactable fields, two points each. */
export const NAP_EACH = 2
export const PENALTY_ICP_UNCERTAIN = -8
export const PENALTY_UNRESOLVED_IDENTITY = -10
export const BONUS_PUBLISHED_EMAIL = 3

function step(table, value) {
  if (value === null || value === undefined) return 0
  for (const [min, points] of table) if (value >= min) return points
  return 0
}

/**
 * The e-commerce class for ranking, promoting §5d's sharp cohort out of the
 * broad `catalog_no_cart` bucket.
 *
 * @param {{ecommerce_class?: string|null, quote_signals?: unknown[], cart_signals?: unknown[]}|null} e
 * @returns {string} a key of ECOM_WEIGHTS
 */
export function ecomClass(e) {
  if (!e || !e.ecommerce_class) return 'unknown'
  const cls = String(e.ecommerce_class)
  if (cls !== 'catalog_no_cart') return cls in ECOM_WEIGHTS ? cls : 'unknown'
  const quotes = (e.quote_signals ?? []).length
  const carts = (e.cart_signals ?? []).length
  return quotes > 0 && carts === 0 ? 'catalog_rfq_no_cart' : 'catalog_no_cart'
}

/**
 * Score one company for the shortlist cut.
 *
 * @param {Record<string, any>} record  a merged, vertical-filtered contract record
 * @param {{size: {band: string}, enrich?: {ecommerce_class?: string, quote_signals?: unknown[], cart_signals?: unknown[], brand_count?: number|null}|null}} ctx
 * @returns {{score: number, components: Record<string, number>, ecom: string, brand_count: number}}
 */
export function rankScore(record, ctx) {
  const enrich = ctx?.enrich ?? null
  const ecom = ecomClass(enrich)
  const brandCount =
    enrich?.brand_count != null && enrich.brand_count > 0
      ? enrich.brand_count
      : (record.brand_authorized ? split(record.brand_authorized).length : 0)

  const nap = [record.company_display, record.domain, record.phone_e164, record.address_1, record.zip5].filter(
    Boolean,
  ).length

  // `category_contam` is written as `cluster=score` by S4; a contested record is
  // one where that score cleared the axis FLOOR and still lost the record.
  const contamScore = Number(String(record.category_contam ?? '').split('=')[1] ?? 0)

  const components = {
    ecommerce: ECOM_WEIGHTS[ecom] ?? 0,
    category: step(CATEGORY_CORE_BANDS, record.category_core == null ? null : Number(record.category_core)),
    contested: contamScore >= CATEGORY_FLOOR ? PENALTY_CONTESTED_CATEGORY : 0,
    brands: step(BRAND_BANDS, brandCount),
    evidence: step(EVIDENCE_BANDS, Number(record.evidence_depth ?? 1)),
    declaration: record.self_declaration
      ? record.self_declaration_verbatim === true || record.self_declaration_verbatim === 'true'
        ? DECLARATION_VERBATIM
        : DECLARATION_SNIPPET
      : 0,
    nap: nap * NAP_EACH,
    size: SIZE_BAND_WEIGHTS[ctx?.size?.band] ?? 0,
    email: record.email ? BONUS_PUBLISHED_EMAIL : 0,
    icp_uncertain:
      record.icp_uncertain === true || record.icp_uncertain === 'true' ? PENALTY_ICP_UNCERTAIN : 0,
    identity:
      record.needs_identity_resolution === true || record.needs_identity_resolution === 'true'
        ? PENALTY_UNRESOLVED_IDENTITY
        : 0,
  }

  const raw = Object.values(components).reduce((a, b) => a + b, 0)
  return {
    score: Math.round(Math.max(0, Math.min(100, raw)) * 10) / 10,
    components,
    ecom,
    brand_count: brandCount,
  }
}

/** `k=v;k=v`, in a stable order, so the CSV column is diffable. */
export function componentsToString(components) {
  return Object.keys(components)
    .sort()
    .filter((k) => components[k] !== 0)
    .map((k) => `${k}=${components[k]}`)
    .join(';')
}
