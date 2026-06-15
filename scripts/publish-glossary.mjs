/**
 * Apply verified definitions + usage examples to the glossary drafts, then PUBLISH.
 *
 * Reads the verification workflow output (slug → finalDefinition, finalExample),
 * for each draft: updates shortDefinition, appends an "In practice" section to
 * the body, then publishes (writes the published doc, deletes the draft) — all
 * in one atomic transaction.
 *
 *   node scripts/publish-glossary.mjs <path-to-workflow-output.json>
 *
 * One-off. After this, the terms are live and should be edited in Studio, not
 * re-seeded.
 */
import { readFileSync } from 'node:fs'
import { createClient } from 'next-sanity'

// ── env ──────────────────────────────────────────────────────────────────────
const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
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
  perspective: 'raw',
})

// ── load verification results ────────────────────────────────────────────────
const outPath =
  process.argv[2] ??
  '/private/tmp/claude-501/-Users-artur-Documents-Projects-Salesolution-new/dae431fc-239f-4c33-ac66-4740287e293e/tasks/wlpzo6xel.output'
let parsed = JSON.parse(readFileSync(outPath, 'utf8'))
let result = parsed.result ?? parsed
if (typeof result === 'string') result = JSON.parse(result)
const results = result.results
if (!Array.isArray(results)) {
  console.error('Could not find results[] in', outPath)
  process.exit(1)
}

// ── portable-text helpers ────────────────────────────────────────────────────
let _k = 0
const key = () => `ex${(_k++).toString(36)}`
const p = (text, style = 'normal') => ({
  _type: 'block',
  _key: key(),
  style,
  markDefs: [],
  children: [{ _type: 'span', _key: key(), text, marks: [] }],
})
const sourceBlock = (url) => {
  const lk = key()
  let host = url
  try { host = new URL(url).hostname.replace(/^www\./, '') } catch { /* keep raw */ }
  return {
    _type: 'block',
    _key: key(),
    style: 'normal',
    markDefs: [{ _key: lk, _type: 'link', href: url, newTab: true }],
    children: [
      { _type: 'span', _key: key(), text: 'Source: ', marks: [] },
      { _type: 'span', _key: key(), text: host, marks: [lk] },
    ],
  }
}
const firstUrl = (s) => (typeof s === 'string' ? (s.match(/https?:\/\/[^\s)]+/) ?? [null])[0] : null)

// ── build + publish ──────────────────────────────────────────────────────────
const tx = client.transaction()
const summary = []

for (const r of results) {
  const slug = r.slug
  const draftId = `drafts.glossary-${slug}`
  const publishedId = `glossary-${slug}`

  const draft = await client.getDocument(draftId)
  if (!draft) {
    summary.push(`SKIP ${slug} (draft not found)`)
    continue
  }

  const example = r.finalExample ?? {}
  const exBlocks = [p('In practice', 'h3')]
  if (example.text) exBlocks.push(p(example.text))
  const url = example.source && example.source !== 'n/a' ? firstUrl(example.source) : null
  if (url) exBlocks.push(sourceBlock(url))

  const body = [...(Array.isArray(draft.body) ? draft.body : []), ...exBlocks]

  const published = {
    ...draft,
    _id: publishedId,
    shortDefinition: r.finalDefinition ?? draft.shortDefinition,
    body,
    publishedAt: draft.publishedAt ?? '2026-06-14T00:00:00Z',
  }
  delete published._rev
  delete published._createdAt
  delete published._updatedAt

  tx.createOrReplace(published)
  tx.delete(draftId)
  summary.push(`PUBLISH ${slug} (${example.type ?? '?'} example${url ? ' + source' : ''})`)
}

const res = await tx.commit()
console.log(summary.join('\n'))
console.log(`\nCommitted. Documents touched: ${res.results?.length ?? '?'}`)
