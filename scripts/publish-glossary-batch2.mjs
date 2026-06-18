/**
 * Publish the batch-2 glossary drafts (the next 30) — promote drafts → published.
 *
 * The drafts are already complete (humanized prose + In-practice). This does NOT
 * re-apply content; it promotes each `drafts.glossary-<slug>` to `glossary-<slug>`
 * (drop _rev/_createdAt/_updatedAt, set publishedAt) and deletes the draft, in one
 * transaction. Safe to re-run: a missing draft (already published) is skipped.
 *
 *   node scripts/publish-glossary-batch2.mjs
 */
import { readFileSync } from 'node:fs'
import { createClient } from 'next-sanity'

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

const PUBLISHED_AT = '2026-06-18T00:00:00Z'

const SLUGS = [
  'ai-citation-tracking', 'ai-visibility-tracking', 'spec-sheet-content', 'normalized-attributes',
  'distributor-content-parity', 'prompt-shaped-demand', 'ai-ready-product-catalog', 'ai-search-specialist',
  'cited-domain-analysis', 'ai-impression-share', 'benchmark-prompts', 'mention-rate-vs-citation-rate',
  'hallucinated-attribution', 'brand-hallucination', 'crawlability-for-ai-bots', 'content-chunking-for-retrieval',
  'entity-seo', 'product-schema-for-industrial-skus', 'punchout-catalog', 'product-data-syndication',
  'long-tail-sku-demand', 'category-page-architecture', 'etim-classification', 'generative-engine',
  'ai-mode', 'zero-click-search', 'knowledge-graph', 'structured-data-for-ai', 'llm-seeding', 'searchandising',
]

const tx = client.transaction()
const summary = []

for (const slug of SLUGS) {
  const draftId = `drafts.glossary-${slug}`
  const publishedId = `glossary-${slug}`
  const draft = await client.getDocument(draftId)
  if (!draft) {
    summary.push(`SKIP ${slug} (no draft — already published?)`)
    continue
  }
  const published = { ...draft, _id: publishedId, publishedAt: draft.publishedAt ?? PUBLISHED_AT }
  delete published._rev
  delete published._createdAt
  delete published._updatedAt
  tx.createOrReplace(published)
  tx.delete(draftId)
  summary.push(`PUBLISH ${slug}`)
}

const res = await tx.commit()
console.log(summary.join('\n'))
console.log(`\nCommitted. Documents touched: ${res.results?.length ?? '?'}`)
