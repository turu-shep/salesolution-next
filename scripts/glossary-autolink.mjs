/**
 * M3 — auto-link inline glossary termLinks across published Sanity bodies.
 *
 * Builds a match table from every PUBLISHED glossary term + its aliases, then for
 * each target document wraps the FIRST occurrence of each term/alias in a
 * `glossaryRef` (rendered as a real link + hovercard). Conservative by design:
 *   - links only to PUBLISHED terms (so refs resolve and the preview shows now),
 *   - one link per target per document; caps per block + per doc,
 *   - never self-links a glossary term to itself,
 *   - skips headings, code, blockquotes, and any span already inside a link,
 *   - acronyms (GEO, AEO, PIM, RAG…) match case-SENSITIVELY with word boundaries,
 *     normal phrases match case-insensitively, longest phrase first.
 *
 *   node scripts/glossary-autolink.mjs                       # dry run (glossaryTerm,careerPath)
 *   node scripts/glossary-autolink.mjs --write               # commit
 *   node scripts/glossary-autolink.mjs --types=guide,post    # widen corpus
 *
 * Re-run after publishing new terms (e.g. the batch-2 30) to light up their links.
 */
import { readFileSync } from 'node:fs'
import { createClient } from 'next-sanity'

try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
} catch {}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-05-19',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: 'published',
})

const WRITE = process.argv.includes('--write')
const typesArg = process.argv.find((a) => a.startsWith('--types='))
const TYPES = (typesArg ? typesArg.split('=')[1] : 'glossaryTerm,careerPath').split(',')

const PER_DOC_CAP = 12
const PER_BLOCK_CAP = 3
const MIN_PHRASE_LEN = 4 // for normal phrases; acronyms handled separately
// Phrases too generic to auto-link even though they're term/alias strings —
// they collide with unrelated meanings in general copy (e.g. "content
// syndication" = article distribution, not industrial product-data syndication).
const DENYLIST = new Set(['ai', 'seo', 'geo', 'data', 'content', 'content syndication'])

const TYPE_QUERIES = {
  glossaryTerm: `*[_type=="glossaryTerm" && defined(slug.current)]{_id,"slug":slug.current,"label":term, aliases, body}`,
  careerPath: `*[_type=="careerPath" && defined(slug.current)]{_id,"slug":slug.current,"label":title, body}`,
  guide: `*[_type=="guide" && defined(slug.current)]{_id,"slug":slug.current,"label":title, body}`,
  post: `*[_type=="post" && defined(slug.current)]{_id,"slug":slug.current,"label":title, body}`,
}

// ── Build the candidate match table from published terms ─────────────────────
const terms = await client.fetch(
  `*[_type=="glossaryTerm" && defined(slug.current)]{ "slug": slug.current, term, aliases }`,
)

const isAcronym = (s) => /^[A-Z][A-Za-z0-9.]{1,5}$/.test(s) && s === s.toUpperCase()
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// candidate: { phrase, slug, re }
const candidates = []
for (const t of terms) {
  const core = (t.term || '').replace(/\s*\([^)]*\)\s*$/, '').trim() // drop trailing "(AEO)"
  const phrases = new Set([core, ...(t.aliases ?? [])].map((p) => (p || '').trim()).filter(Boolean))
  for (const phrase of phrases) {
    if (DENYLIST.has(phrase.toLowerCase())) continue
    const acro = isAcronym(phrase)
    if (!acro && phrase.length < MIN_PHRASE_LEN) continue
    if (acro && phrase.replace(/\./g, '').length < 2) continue
    // Word-boundary lookarounds; case-sensitive for acronyms.
    const re = new RegExp(`(?<![\\w])${escapeRe(phrase)}(?![\\w])`, acro ? '' : 'i')
    candidates.push({ phrase, slug: t.slug, re, len: phrase.length })
  }
}
candidates.sort((a, b) => b.len - a.len) // longest first

// ── Span-split helpers ───────────────────────────────────────────────────────
let _k = 0
const mkKey = () => `al${(_k++).toString(36)}${Date.now().toString(36).slice(-3)}`

function linkedMarkKeys(block) {
  const keys = new Set()
  for (const md of block.markDefs ?? []) {
    if (md._type === 'glossaryRef' || md._type === 'link') keys.add(md._key)
  }
  return keys
}

// Try to link `cand` in `block`. Returns true if a link was added.
function tryLinkInBlock(block, cand) {
  block.markDefs = block.markDefs ?? []
  const refId = `glossary-${cand.slug}`
  if (block.markDefs.some((m) => m._type === 'glossaryRef' && m._ref === refId)) return false
  const linked = linkedMarkKeys(block)
  for (let i = 0; i < (block.children ?? []).length; i++) {
    const span = block.children[i]
    if (span._type !== 'span' || typeof span.text !== 'string') continue
    if ((span.marks ?? []).some((m) => linked.has(m))) continue // already inside a link
    const match = cand.re.exec(span.text)
    if (!match) continue
    const at = match.index
    const matched = match[0]
    const before = span.text.slice(0, at)
    const after = span.text.slice(at + matched.length)
    const markKey = mkKey()
    const base = span.marks ?? []
    const repl = []
    if (before) repl.push({ _type: 'span', _key: mkKey(), text: before, marks: [...base] })
    repl.push({ _type: 'span', _key: mkKey(), text: matched, marks: [...base, markKey] })
    if (after) repl.push({ _type: 'span', _key: mkKey(), text: after, marks: [...base] })
    block.children.splice(i, 1, ...repl)
    block.markDefs.push({ _key: markKey, _type: 'glossaryRef', _ref: refId })
    return true
  }
  return false
}

// ── Walk the corpus ──────────────────────────────────────────────────────────
let totalLinks = 0
let totalDocs = 0

for (const type of TYPES) {
  const q = TYPE_QUERIES[type]
  if (!q) {
    console.error(`! unknown type: ${type}`)
    continue
  }
  const docs = await client.fetch(q)
  console.log(`\n──────── ${type} (${docs.length} published) ────────`)
  for (const doc of docs) {
    const body = doc.body
    if (!Array.isArray(body) || !body.length) continue
    const ownSlug = type === 'glossaryTerm' ? doc.slug : null
    // A term must not hand its OWN name/alias to a different term (shared aliases
    // like "AI SEO specialist" otherwise link a page to a sibling, not itself).
    const ownPhrases = new Set()
    if (type === 'glossaryTerm') {
      const core = (doc.label || '').replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase()
      if (core) ownPhrases.add(core)
      for (const a of doc.aliases ?? []) ownPhrases.add((a || '').trim().toLowerCase())
    }
    const linkedSlugs = new Set()
    const perBlock = new Map()
    const proposals = []

    for (const cand of candidates) {
      if (cand.slug === ownSlug) continue // no self-link
      if (ownPhrases.has(cand.phrase.toLowerCase())) continue // don't link our own alias elsewhere
      if (linkedSlugs.has(cand.slug)) continue // one per target per doc
      if (linkedSlugs.size >= PER_DOC_CAP) break
      for (const block of body) {
        if (block._type !== 'block' || block.style !== 'normal') continue
        const used = perBlock.get(block._key) ?? 0
        if (used >= PER_BLOCK_CAP) continue
        if (tryLinkInBlock(block, cand)) {
          linkedSlugs.add(cand.slug)
          perBlock.set(block._key, used + 1)
          proposals.push(`${cand.phrase} → ${cand.slug}`)
          break
        }
      }
    }

    if (!proposals.length) continue
    totalDocs++
    totalLinks += proposals.length
    console.log(`  ${doc.slug}  (${proposals.length}): ${proposals.join(' · ')}`)
    if (WRITE) {
      await client.patch(doc._id).set({ body }).commit()
    }
  }
}

console.log(
  `\n${WRITE ? 'WROTE' : 'DRY RUN'}: ${totalLinks} links across ${totalDocs} docs` +
    (WRITE ? '' : '  (re-run with --write to commit)'),
)
