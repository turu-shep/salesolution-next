/**
 * declaration — candidate extraction + flags for the declaration review pass.
 *
 * `{{declaration}}` is an APPROVED EXCERPT, never the raw column (01-c1 §1).
 * This module does the mechanical half of the review: propose a candidate
 * excerpt per row and flag everything a reviewer must see. It approves
 * nothing — approval is a human writing initials next to an excerpt. The
 * shape being hunted (01-c1 §1 rules 3–4):
 *
 *   a contiguous substring of self_declaration, byte-exact, 4–14 words, a noun
 *   phrase that completes "calls itself ___", no navigation text, no phone
 *   numbers, no negation, no manufacturer brand name. Stripping leading words
 *   is the only edit permitted.
 */

// Global manufacturer screen (same registry as the campaign parser) — a brand
// in an excerpt is a G3 violation even when the dealer names it themselves.
export const BRAND_BAN = [
  'enerpac', 'spx', 'dorner', 'kennametal', 'ballymore', 'quincy', 'nord',
  'banjo', 'lovejoy', 'timken', 'parker', 'gates', 'dixon', 'weg', 'esab',
  'norton', 'regal rexnord', 'ifm', 'john crane', 'adaptall',
]

const NAV_JUNK = /skip to content|open menu|close menu|\[endif\]|contact us|toggle navigation|»|::/i
const NAV_WORDS = /\b(home|about(?: us)?|products|contact|careers|employment|services|gallery|testimonials)\b/gi
const HOURS_PHONE = /\b(?:mon|tues?|wed(?:nes)?|thur?s?|fri|sat(?:ur)?|sun)(?:day)?s?\b|closed|24 hour|\(\d{3}\)|\d{3}[-.\s]\d{4}/i
const NEGATED = /\b(?:not|non)[-\s]?(?:an?\s+)?(?:authorized|factory[-\s]authorized|oem)|non-authorized/i

const words = (s) => s.trim().split(/\s+/).filter(Boolean)

/** Brand tokens for one row: its own locator-proven brands + the global ban. */
export function brandTokens(row) {
  const own = String(row?.brand_authorized || '')
    .split('|')
    .map((b) => b.trim().toLowerCase())
    .filter((b) => b.length >= 3)
  return [...new Set([...own, ...BRAND_BAN])]
}

const brandHit = (text, tokens) => {
  const lower = ` ${text.toLowerCase()} `
  return tokens.find((b) => new RegExp(`(^|[^a-z0-9])${b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i').test(lower))
}

/**
 * Source-level flags a reviewer needs to see regardless of the candidate.
 */
export function sourceFlags(declaration, tokens) {
  const flags = []
  if (NEGATED.test(declaration)) flags.push('negated')
  if (NAV_JUNK.test(declaration) || (declaration.match(NAV_WORDS) || []).length >= 3) flags.push('nav-junk')
  if (HOURS_PHONE.test(declaration)) flags.push('hours-or-phone')
  const letters = declaration.replace(/[^a-zA-Z]/g, '')
  if (letters.length >= 20 && letters.replace(/[^A-Z]/g, '').length / letters.length > 0.7) flags.push('all-caps')
  const brand = brandHit(declaration, tokens)
  if (brand) flags.push(`brand:${brand}`)
  return flags
}

/**
 * Propose a candidate excerpt: the first "…is/are a|an|the|one of …" noun
 * phrase in the declaration, clamped to 14 words at a word boundary. Returns
 * null when nothing safe can be proposed (negated sources never yield one).
 * Every candidate is a contiguous byte substring of the source.
 */
export function candidateExcerpt(declaration, tokens) {
  if (NEGATED.test(declaration)) return null
  const m = declaration.match(/\b(?:is|are|been|remains?)\s+((?:a|an|the|one of)\b[^.?!\n]{8,200})/i)
  if (!m) return null
  let cand = m[1]
  // Clamp to 14 words on a word boundary, byte-exact from the source.
  const w = words(cand)
  if (w.length > 14) {
    let cut = 0
    for (let i = 0; i < 14; i++) cut = cand.indexOf(w[i], cut) + w[i].length
    cand = cand.slice(0, cut)
  }
  cand = cand.trim().replace(/[,;:\s]+$/, '')
  if (words(cand).length < 4) return null
  if (/[0-9]/.test(cand)) return null
  if (NAV_JUNK.test(cand) || HOURS_PHONE.test(cand)) return null
  if (brandHit(cand, tokens)) return null
  if (!declaration.includes(cand)) return null // byte-exact contiguity, by construction but asserted
  return cand
}

/**
 * Validate a HUMAN-approved excerpt against the §1 shape rules. Returns a list
 * of violations; empty list = acceptable to merge.
 */
export function validateApproved(excerpt, declaration, tokens) {
  const bad = []
  const e = excerpt.trim()
  if (!declaration.includes(e)) bad.push('not a contiguous byte-exact substring of self_declaration')
  const n = words(e).length
  if (n < 4 || n > 14) bad.push(`must be 4–14 words (got ${n})`)
  if (NEGATED.test(e)) bad.push('negated')
  if (/[0-9]/.test(e)) bad.push('contains digits')
  if (NAV_JUNK.test(e) || HOURS_PHONE.test(e)) bad.push('navigation/hours/phone text')
  const brand = brandHit(e, tokens)
  if (brand) bad.push(`manufacturer brand "${brand}"`)
  return bad
}
