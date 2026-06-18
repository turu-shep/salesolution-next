/**
 * Glossary term queue — check + enqueue, deterministically.
 *
 * Part of EVERY content-generation task (article, page copy, career path,
 * glossary term, etc.). After writing content, the agent lists the domain terms
 * it used and runs this. The script checks each term against:
 *   1. the live glossary in Sanity (published terms + their aliases/slugs),
 *   2. existing Sanity DRAFTS (terms already being authored),
 *   3. the queue file (docs/strategy/glossary-queue.json),
 * and adds only the genuinely new ones to the queue. Idempotent.
 *
 * Usage:
 *   node scripts/glossary-queue.mjs check "faceted navigation" "PIM"
 *   node scripts/glossary-queue.mjs add "crawl budget" "canonical tag" --source career-path:technical-seo-specialist
 *   node scripts/glossary-queue.mjs add --file /tmp/terms.txt --source post:my-article
 *   node scripts/glossary-queue.mjs list
 *
 * Term extraction is the agent's job (it just wrote the content). This script
 * only does the dedupe + enqueue, so the "do we already have it?" check is exact.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createClient } from 'next-sanity'

const ROOT = new URL('..', import.meta.url)
const QUEUE_PATH = new URL('docs/strategy/glossary-queue.json', ROOT)

// ── env ──────────────────────────────────────────────────────────────────────
const env = readFileSync(new URL('.env.local', ROOT), 'utf8')
for (const line of env.split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
}
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-05-19',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  perspective: 'raw', // see drafts too
})

const norm = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

// ── args ─────────────────────────────────────────────────────────────────────
const [cmd, ...rest] = process.argv.slice(2)
let source = 'unknown'
const terms = []
for (let i = 0; i < rest.length; i++) {
  if (rest[i] === '--source') { source = rest[++i] ?? source; continue }
  if (rest[i] === '--file') {
    const f = rest[++i]
    if (f && existsSync(f)) {
      for (const ln of readFileSync(f, 'utf8').split('\n')) {
        const t = ln.trim()
        if (t) terms.push(t)
      }
    }
    continue
  }
  terms.push(rest[i])
}

// ── load DB + queue ──────────────────────────────────────────────────────────
async function loadDb() {
  const docs = await client.fetch(
    `*[_type == "glossaryTerm" && defined(slug.current)]{ _id, term, "slug": slug.current, aliases }`,
  )
  const published = new Map()
  const drafts = new Map()
  for (const d of docs) {
    const isDraft = d._id.startsWith('drafts.')
    const target = isDraft ? drafts : published
    for (const key of [d.term, d.slug, ...(d.aliases ?? [])]) {
      if (key) target.set(norm(key), d.slug)
    }
  }
  return { published, drafts }
}

function loadQueue() {
  if (!existsSync(QUEUE_PATH)) return { terms: [] }
  try { return JSON.parse(readFileSync(QUEUE_PATH, 'utf8')) } catch { return { terms: [] } }
}
function saveQueue(q) {
  writeFileSync(QUEUE_PATH, JSON.stringify(q, null, 2) + '\n')
}

// ── run ──────────────────────────────────────────────────────────────────────
const queue = loadQueue()

if (cmd === 'list') {
  console.log(`Queue (${queue.terms.length}):`)
  for (const t of queue.terms) console.log(`  - ${t.term}  [${t.status}]  (${t.source ?? '?'})`)
  process.exit(0)
}

if (cmd !== 'check' && cmd !== 'add') {
  console.error('Usage: node scripts/glossary-queue.mjs <check|add|list> "term"... [--source X] [--file f]')
  process.exit(1)
}
if (terms.length === 0) {
  console.error('No terms given.')
  process.exit(1)
}

const { published, drafts } = await loadDb()
const queued = new Set(queue.terms.map((t) => t.normalized))

const result = { published: [], draft: [], queued: [], added: [] }
const stamp = new Date().toISOString().slice(0, 10)

for (const raw of terms) {
  const n = norm(raw)
  if (!n) continue
  if (published.has(n)) { result.published.push(`${raw} → /glossary/${published.get(n)}/`); continue }
  if (drafts.has(n)) { result.draft.push(raw); continue }
  if (queued.has(n)) { result.queued.push(raw); continue }
  // genuinely new
  result.added.push(raw)
  if (cmd === 'add') {
    queue.terms.push({ term: raw, normalized: n, status: 'new', source, addedAt: stamp })
    queued.add(n)
  }
}

if (cmd === 'add' && result.added.length) saveQueue(queue)

const line = (label, arr) => arr.length && console.log(`\n${label} (${arr.length}):\n  ${arr.join('\n  ')}`)
console.log(`Checked ${terms.length} term(s) against ${published.size} published keys, ${drafts.size} draft keys, ${queue.terms.length - (cmd === 'add' ? result.added.length : 0)} queued.`)
line('✓ Already published (cross-link these now)', result.published)
line('◑ In Sanity drafts (being authored)', result.draft)
line('• Already in queue', result.queued)
line(cmd === 'add' ? '＋ ADDED to queue' : '＋ NEW (would add)', result.added)
if (cmd === 'add' && result.added.length) console.log(`\nQueue now: ${queue.terms.length} terms → docs/strategy/glossary-queue.json`)
