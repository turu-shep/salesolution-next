/**
 * declaration-review — build (and later harvest) the human review queue for
 * `{{declaration}}` excerpts.
 *
 *   node emails/scripts/declaration-review.mjs            # write the review queue
 *   node emails/scripts/declaration-review.mjs --extract  # harvest approvals
 *
 * Default mode writes emails/data/declaration-review-<date>.csv: one row per
 * seated company with a self_declaration, first-send-200 first (priority 1,
 * rank order), then the rest by rank_score. Each row carries the mechanical
 * candidate excerpt + every flag the heuristics can raise. A HUMAN then fills
 * `approved_excerpt` (copying or editing the candidate — byte-exact substring
 * rule applies) and `reviewer_initials`.
 *
 * --extract reads the filled review file back, VALIDATES every approval
 * against the §1 shape rules (contiguous byte substring, 4–14 words, no
 * negation, no digits, no nav junk, no manufacturer brand), refuses the run
 * if any fails, and writes emails/data/declaration-approved.csv — the overlay
 * the S7 exporter consumes. Nothing merges into copy without passing here.
 *
 * The five excerpts the handoff itself cites as quotable (01-c1 §1) are
 * prefilled as candidates with the flag `handoff-cited` — still requiring
 * initials, because "a human eyeballs every one" is the rule.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv, toCsv } from '../../scripts/lib/csv.mjs'
import { brandTokens, candidateExcerpt, sourceFlags, validateApproved } from './lib/declaration.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const DATA = resolve(ROOT, 'emails/data')
const TODAY = new Date().toISOString().slice(0, 10)
const REVIEW = join(DATA, `declaration-review-${TODAY}.csv`)
const APPROVED = join(DATA, 'declaration-approved.csv')

// 01-c1 §1's "good ones already in the file, quotable as-is" — matched on
// company_display, candidate prefilled with the handoff's exact (brand-cut)
// text, verified at generation time to be a byte substring of the row.
const HANDOFF_CITED = [
  { match: /geiger pump/i, excerpt: 'a large, factory authorized distributor' },
  { match: /price engineering/i, excerpt: 'a leading distributor and fabricator of industrial hoses' },
  { match: /kerr pump/i, excerpt: 'the oldest pump distributor in Michigan' },
  { match: /hydraulic & pneumatic sales/i, excerpt: 'a stocking distributor' },
  { match: /great lakes industrial/i, excerpt: 'a full-service distributor of o-rings, seals, gaskets, hoses, fittings' },
]

const extract = process.argv.includes('--extract')

const v5 = parseCsv(readFileSync(resolve(ROOT, 'emails/lists/seated-v9.csv'), 'utf8'))
const fs200 = new Set(parseCsv(readFileSync(resolve(ROOT, 'emails/lists/first-send-200.csv'), 'utf8')).map((r) => r.domain))

if (extract) {
  if (!existsSync(REVIEW)) {
    console.error(`--extract: ${REVIEW} not found — generate and review it first`)
    process.exit(1)
  }
  const byDomain = new Map(v5.map((r) => [r.domain, r]))
  const filled = parseCsv(readFileSync(REVIEW, 'utf8')).filter(
    (r) => (r.approved_excerpt || '').trim() && (r.reviewer_initials || '').trim(),
  )
  const bad = []
  const out = []
  for (const r of filled) {
    const row = byDomain.get(r.domain)
    if (!row) { bad.push(`${r.domain}: not in seated-v9`); continue }
    const violations = validateApproved(r.approved_excerpt, row.self_declaration || '', brandTokens(row))
    if (violations.length) bad.push(`${r.domain}: ${violations.join('; ')}`)
    else out.push({ domain: r.domain, approved_excerpt: r.approved_excerpt.trim(), reviewer_initials: r.reviewer_initials.trim(), approved_date: r.approved_date || TODAY })
  }
  if (bad.length) {
    console.error(`REFUSED — ${bad.length} approval(s) violate the §1 shape rules:`)
    for (const b of bad) console.error(`  ✗ ${b}`)
    process.exit(1)
  }
  if (!out.length) {
    console.log('no filled approvals found (approved_excerpt + reviewer_initials both required). Nothing written.')
    process.exit(0)
  }
  writeFileSync(APPROVED, toCsv(out, ['domain', 'approved_excerpt', 'reviewer_initials', 'approved_date']))
  console.log(`declaration-approved.csv written: ${out.length} approval(s), all §1-valid. The S7 exporter now routes these rows to E1-A.`)
  process.exit(0)
}

// ── generate the queue ───────────────────────────────────────────────────────
const withDecl = v5.filter((r) => (r.self_declaration || '').trim())
const queue = withDecl
  .map((r) => {
    const tokens = brandTokens(r)
    const flags = sourceFlags(r.self_declaration, tokens)
    let candidate = candidateExcerpt(r.self_declaration, tokens) || ''
    const cited = HANDOFF_CITED.find((c) => c.match.test(r.company_display))
    if (cited) {
      if (r.self_declaration.includes(cited.excerpt)) {
        candidate = cited.excerpt
        flags.push('handoff-cited')
      } else {
        flags.push('handoff-cited-MISMATCH')
      }
    }
    return {
      priority: fs200.has(r.domain) ? '1-first-send-200' : '2-rest',
      rank_score: r.rank_score || '',
      domain: r.domain,
      company_display: r.company_display,
      verbatim: r.self_declaration_verbatim || '',
      url: r.self_declaration_url || '',
      flags: flags.join('|'),
      candidate_excerpt: candidate,
      self_declaration: r.self_declaration,
      approved_excerpt: '',
      reviewer_initials: '',
      approved_date: '',
    }
  })
  .sort((a, b) => a.priority.localeCompare(b.priority) || Number(b.rank_score || 0) - Number(a.rank_score || 0))

writeFileSync(
  REVIEW,
  toCsv(queue, ['priority', 'rank_score', 'domain', 'company_display', 'verbatim', 'url', 'flags', 'candidate_excerpt', 'self_declaration', 'approved_excerpt', 'reviewer_initials', 'approved_date']),
)

const n = (fn) => queue.filter(fn).length
console.log(`review queue written: ${queue.length} rows → ${REVIEW.replace(ROOT + '/', '')}`)
console.log(`  first-send-200 cohort: ${n((q) => q.priority.startsWith('1'))}`)
console.log(`  with a mechanical candidate: ${n((q) => q.candidate_excerpt)}`)
console.log(`  flagged negated: ${n((q) => q.flags.includes('negated'))} (never quotable)`)
console.log(`  flagged nav-junk: ${n((q) => q.flags.includes('nav-junk'))}`)
console.log(`  flagged brand: ${n((q) => q.flags.includes('brand:'))}`)
console.log(`  handoff-cited prefills: ${n((q) => q.flags.includes('handoff-cited') && !q.flags.includes('MISMATCH'))}`)
console.log('\nTo approve: fill approved_excerpt (byte-exact substring, 4–14 words) +')
console.log('reviewer_initials in the file, then run with --extract. Only extracted')
console.log('approvals reach the exporter; everything else keeps routing to E1-B.')
