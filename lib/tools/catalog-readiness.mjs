/**
 * Pure logic + item data for the "Is your catalog AI-ready?" scorecard (M6).
 * No React/DOM — imported by the component AND unit-tested with `node --test`.
 * Items are grounded in the glossary's industrial-ecommerce + technical terms.
 *
 * @typedef {Object} ReadinessItem
 * @property {string} id
 * @property {string} label
 * @property {number} weight
 * @property {string} category
 * @property {string} fix
 *
 * @typedef {Object} ReadinessResult
 * @property {number} score        // 0..100 (integer)
 * @property {string} band
 * @property {ReadinessItem[]} topFixes
 */

/** @type {ReadinessItem[]} */
export const READINESS_ITEMS = [
  {
    id: 'crawlers-allowed',
    label: 'AI crawlers (GPTBot, ClaudeBot, PerplexityBot) are allowed in robots.txt',
    weight: 3,
    category: 'Crawlability',
    fix: "Allow the AI crawler user-agents. A blocked bot can't cite you at all.",
  },
  {
    id: 'ssr',
    label: 'Product pages render their content server-side, not JavaScript-only',
    weight: 3,
    category: 'Crawlability',
    fix: "Server-render the catalog. Most AI crawlers don't run JS, so an SPA shows them an empty shell.",
  },
  {
    id: 'html-specs',
    label: 'Specs live in HTML tables on the page, not trapped in PDFs',
    weight: 3,
    category: 'Content',
    fix: 'Mirror datasheet specs as on-page HTML so the numbers are quotable.',
  },
  {
    id: 'crossref',
    label: 'Cross-reference / interchange data is published as crawlable tables',
    weight: 3,
    category: 'Content',
    fix: 'Publish interchange charts as HTML tables. The single most AI-citable asset you own.',
  },
  {
    id: 'normalized',
    label: 'Product attributes are normalized (one unit, one value format)',
    weight: 2,
    category: 'Data',
    fix: 'Normalize units and formats so an engine can compare and answer reliably.',
  },
  {
    id: 'product-schema',
    label: 'SKUs carry Product schema with mpn / gtin',
    weight: 2,
    category: 'Schema',
    fix: 'Add schema.org/Product with mpn and gtin so parts are machine-legible.',
  },
  {
    id: 'partnum-text',
    label: 'Part numbers and OEM equivalents are on-page text, not images',
    weight: 2,
    category: 'Content',
    fix: 'Render part numbers as text. Image-only part numbers are invisible to crawlers.',
  },
  {
    id: 'public-catalog',
    label: 'The catalog is on a public, crawlable URL (not only behind punchout)',
    weight: 2,
    category: 'Crawlability',
    fix: 'Expose a public catalog. Punchout-only catalogs are dark to search and AI.',
  },
  {
    id: 'pim-complete',
    label: 'PIM data is complete and consistent (few missing specs)',
    weight: 2,
    category: 'Data',
    fix: 'Fill the PIM gaps. Missing specs become missing or hallucinated AI answers.',
  },
  {
    id: 'category-content',
    label: 'Category pages carry real selection content, not just filters',
    weight: 1,
    category: 'Content',
    fix: "Give category pages a selection guide so they're retrievable, not thin filter shells.",
  },
]

const MAX_SCORE = READINESS_ITEMS.reduce((sum, i) => sum + i.weight, 0)

/**
 * @param {number} score 0..100
 * @returns {string}
 */
export function bandFor(score) {
  if (score >= 85) return 'AI-ready'
  if (score >= 65) return 'Competitive'
  if (score >= 40) return 'Partly there'
  return 'Largely invisible to AI'
}

/**
 * Score a catalog from the set of checked item ids. Unknown ids are ignored.
 * topFixes = the unchecked items, heaviest first (the highest-leverage gaps).
 *
 * @param {string[]} checkedIds
 * @returns {ReadinessResult}
 */
export function scoreCatalog(checkedIds) {
  const checked = new Set(checkedIds)
  const got = READINESS_ITEMS.filter((i) => checked.has(i.id)).reduce(
    (sum, i) => sum + i.weight,
    0,
  )
  const score = MAX_SCORE ? Math.round((got / MAX_SCORE) * 100) : 0
  const topFixes = READINESS_ITEMS.filter((i) => !checked.has(i.id))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
  return { score, band: bandFor(score), topFixes }
}
