/**
 * census — non-company classifiers for the client-pool quality reprocess
 * (emails/handoff/industrial-contact-list/quality-reprocess/, 2026-08-10).
 *
 * The serp harvest mints rows from whatever ranks: directories, trade press,
 * associations, city governments. `01webdirectory.com` reached the client
 * dashboard because its row carries a snippet describing a DIFFERENT company
 * (UsedRack.com) — the misattribution signature. These classifiers find that
 * class loudly and change nothing: the census script reports, the founder
 * signs, the retag lands in the next generation via the pipeline.
 *
 * Three classes, per the package:
 *   non-company-domain     domain pattern / inspected exact list — the only
 *                          class eligible for auto-approve
 *   misattributed-snippet  self_declaration names a foreign domain — founder-
 *                          reviewed, because a dealer quoting a sister site or
 *                          a manufacturer URL is legitimate
 *   hollow                 address + phone + brands + line card all empty —
 *                          candidate ONLY; many real small shops are sparse
 *
 * Every pattern below was seeded from rows in the 2026-08-10 generation —
 * extended by inspection, not imagination. The false-positive guards are live
 * rows too: hosexpress.com ends in "press", newsouthsupply.com contains
 * "news", air-filters.org is .org — all real businesses, all must stay clean.
 */
import { split } from './contract.mjs'
import { apexDomain } from './normalize.mjs'

/** The contract's own non-company icp_class values (S3c verdicts). */
export const ICP_NON_COMPANY = new Set(['marketplace', 'directory', 'trade-press', 'job-board'])

/**
 * Second-level-label endings that mark a publication, not a business.
 * `press` is deliberately ABSENT: hosexpress.com / hipress.com.br / yespress.io
 * are operating companies; trade press is caught by icp_class instead.
 */
const PUBLICATION_ENDINGS = ['news', 'journal', 'blog', 'forum', 'magazine', 'herald', 'tribune', 'gazette']

/**
 * Exact apexes confirmed non-companies by inspection of the current
 * generation's serp rows (associations, government bodies, a casino resort,
 * a contact-scraping marketplace). Additions require the same standard: name
 * the row, read it, be sure. `.org` alone is never evidence.
 */
const EXACT = new Map([
  ['411s.ca', 'directory'],
  ['rocketreach.co', 'marketplace'],
  ['sema.org', 'association'],
  ['aopa.org', 'association'],
  ['copper.org', 'association'],
  ['ahtd.org', 'association'],
  ['aalso.org', 'association'],
  ['bcgwa.org', 'association'],
  ['aviationsuppliers.org', 'association'],
  ['fastenermanufacturers.org', 'association'],
  ['efda-fastenerdistributors.org', 'association'],
  ['emdrglobal.org', 'association'],
  ['floridasbdc.org', 'government'],
  ['suffolkida.org', 'government'],
  ['tamarac.org', 'government'],
  ['epwater.org', 'government'],
  ['coushatta.org', 'non-icp-business'],
  ['digitalnc.org', 'institution'],
  // Round 2 (same day): surfaced by the misattribution tell, confirmed by name —
  // pnj.com is the Pensacola News Journal carrying Century Fasteners' snippet.
  ['pnj.com', 'publication'],
])

/**
 * Classify a domain as non-company, or null.
 *
 * Patterns run on the second-level label (the part left of the public suffix,
 * `www` already gone) so "news" can only match as an ENDING — that is what
 * keeps newsouthsupply.com clean while wiringharnessnews.com hits.
 *
 * @param {string|null} domain
 * @returns {{label: string, rule: string}|null} label = junk family,
 *   rule = which test fired (for the report's evidence column)
 */
export function nonCompanyDomain(domain) {
  const apex = apexDomain(domain ? `https://${domain}` : null) ?? (domain ? String(domain).toLowerCase() : null)
  if (!apex) return null

  const exact = EXACT.get(apex)
  if (exact) return { label: exact, rule: `exact:${apex}` }

  const sld = apex.split('.')[0]
  if (sld.includes('directory')) return { label: 'directory', rule: 'sld-contains:directory' }
  if (sld.includes('yellowpages')) return { label: 'directory', rule: 'sld-contains:yellowpages' }
  for (const ending of PUBLICATION_ENDINGS) {
    if (sld.length > ending.length && sld.endsWith(ending))
      return { label: 'publication', rule: `sld-ends:${ending}` }
  }
  if (/(^|-)cityof/.test(sld)) return { label: 'government', rule: 'sld:cityof' }
  if (sld.includes('sheriff')) return { label: 'government', rule: 'sld-contains:sheriff' }
  if (/hospital(?!ity)/.test(sld)) return { label: 'institution', rule: 'sld-contains:hospital' }
  return null
}

/** True when `serp` is one of the row's source tokens (pipe chain, never substring). */
export function isSerpSourced(row) {
  return split(row?.source).includes('serp')
}

/**
 * Domains named inside a snippet that are NOT the row's own domain — the
 * 01webdirectory tell. Sorted, deduped, apex-normalized.
 *
 * @param {string|null} text  the row's self_declaration
 * @param {string|null} ownDomain
 * @returns {string[]}
 */
export function foreignDomainMentions(text, ownDomain) {
  if (!text) return []
  const own = ownDomain ? (apexDomain(`https://${ownDomain}`) ?? String(ownDomain).toLowerCase()) : null
  const found = new Set()
  const DOMAIN = /\b((?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:com|net|org|io|co|ca|us|biz|info|edu|gov))\b/gi
  for (const match of String(text).matchAll(DOMAIN)) {
    const apex = apexDomain(`https://${match[1].toLowerCase()}`)
    if (apex && apex !== own) found.add(apex)
  }
  return [...found].sort()
}

/** All four contact/identity fields empty. Candidate only — never auto-culled. */
export function isHollow(row) {
  return (
    !str(row?.address_1) &&
    !str(row?.phone_e164) &&
    split(row?.brand_authorized).length === 0 &&
    split(row?.line_card).length === 0
  )
}

function str(v) {
  if (v === undefined || v === null) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

/**
 * The verdict the census script records per serp-sourced row.
 *
 * confidence: high  = domain says non-company, or the pipeline's own icp_class
 *                     already did (ICP_NON_COMPANY)
 *             medium = only the snippet points elsewhere
 *             low    = only hollow
 * autoApprove: non-company-domain hits ONLY — the founder default
 *              ("domain-pattern certainties; owner reviews the rest").
 *
 * @param {Record<string, any>} row
 * @returns {{classes: string[], confidence: 'high'|'medium'|'low'|null,
 *   autoApprove: boolean, evidence: {domainRule: string|null, domainLabel: string|null,
 *   foreignDomains: string[], icpNonCompany: boolean}}}
 */
export function classifyRow(row) {
  const domainHit = nonCompanyDomain(row?.domain)
  const foreignDomains = foreignDomainMentions(row?.self_declaration, row?.domain)
  const hollow = isHollow(row)
  const icpNonCompany = ICP_NON_COMPANY.has(row?.icp_class)

  const classes = []
  if (domainHit) classes.push('non-company-domain')
  if (foreignDomains.length) classes.push('misattributed-snippet')
  if (hollow) classes.push('hollow')

  let confidence = null
  if (domainHit || icpNonCompany) confidence = 'high'
  else if (foreignDomains.length) confidence = 'medium'
  else if (hollow) confidence = 'low'

  return {
    classes,
    confidence,
    autoApprove: Boolean(domainHit),
    evidence: {
      domainRule: domainHit?.rule ?? null,
      domainLabel: domainHit?.label ?? null,
      foreignDomains,
      icpNonCompany,
    },
  }
}
