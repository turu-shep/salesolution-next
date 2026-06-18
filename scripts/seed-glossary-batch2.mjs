/**
 * Seed batch-2 glossary terms (the next 30) as Sanity DRAFTS.
 *
 * Pattern mirrors scripts/seed-glossary.mjs: creates `drafts.glossary-<slug>`
 * via the write token; nothing is published. Idempotent (createOrReplace).
 *
 *   node scripts/seed-glossary-batch2.mjs
 *
 * Structured metadata (term, cluster, opportunity, aliases, related) is canonical
 * and lives here, so cross-link refs can't drift. The humanized prose
 * (shortDefinition, body, seo) is read from scripts/_batch2-prose.json — produced
 * by the glossary-draft-30 workflow with the humanizer rules applied.
 *
 * Term selection + research: docs/strategy/career-path/05-glossary.md +
 * prompts/glossary/_generated/author-<slug>.md.
 */
import { readFileSync } from 'node:fs'
import { createClient } from 'next-sanity'

// ── Minimal .env.local loader ────────────────────────────────────────────────
try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
} catch {
  /* fall back to ambient env */
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_WRITE_TOKEN
if (!projectId || !dataset || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID / _DATASET / SANITY_API_WRITE_TOKEN')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-05-19',
  token,
  useCdn: false,
})

// ── Portable-text + ref helpers ──────────────────────────────────────────────
let _k = 0
const key = () => `k${(_k++).toString(36)}`
const block = (b) => ({
  _type: 'block',
  _key: key(),
  style: b.style ?? 'normal',
  ...(b.listItem ? { listItem: b.listItem, level: b.level ?? 1 } : {}),
  markDefs: [],
  children: [{ _type: 'span', _key: key(), text: b.text, marks: [] }],
})
// Weak refs: targets are sibling drafts / will publish later. _ref points at the
// published id (`glossary-<slug>`); weak so integrity isn't enforced pre-publish.
const ref = (slug) => ({ _type: 'reference', _key: key(), _ref: `glossary-${slug}`, _weak: true })

const REVIEWED = '2026-06-16'

// ── Canonical metadata (the next 30) ─────────────────────────────────────────
const META = [
  { slug: 'ai-citation-tracking', term: 'AI citation tracking', cluster: 'measurement', opportunity: 'own',
    aliases: ['AI citation monitoring', 'LLM citation tracking'],
    related: ['llm-citation', 'ai-share-of-voice', 'ai-visibility', 'cited-domain-analysis', 'mention-rate-vs-citation-rate'] },
  { slug: 'ai-visibility-tracking', term: 'AI visibility tracking', cluster: 'measurement', opportunity: 'own',
    aliases: ['AI visibility monitoring', 'LLM visibility tracking'],
    related: ['ai-visibility', 'ai-share-of-voice', 'ai-citation-tracking', 'ai-impression-share'] },
  { slug: 'spec-sheet-content', term: 'Spec-sheet content (datasheet SEO)', cluster: 'industrial-ecommerce', opportunity: 'own',
    aliases: ['datasheet SEO', 'spec sheet SEO', 'datasheet content'],
    related: ['part-number-seo', 'normalized-attributes', 'ai-ready-product-catalog', 'content-chunking-for-retrieval'] },
  { slug: 'normalized-attributes', term: 'Normalized attributes', cluster: 'industrial-ecommerce', opportunity: 'own',
    aliases: ['attribute normalization', 'normalized product data'],
    related: ['pim', 'spec-sheet-content', 'ai-ready-product-catalog', 'part-number-cross-reference', 'etim-classification'] },
  { slug: 'distributor-content-parity', term: 'Distributor content parity problem', cluster: 'industrial-ecommerce', opportunity: 'own',
    aliases: ['content parity problem', 'duplicate OEM content'],
    related: ['part-number-cross-reference', 'product-data-syndication', 'llm-citation', 'part-number-seo'] },
  { slug: 'prompt-shaped-demand', term: 'Prompt-shaped demand', cluster: 'ai-search-core', opportunity: 'own',
    aliases: ['prompt demand', 'conversational demand'],
    related: ['query-fan-out', 'long-tail-sku-demand', 'ai-share-of-voice', 'answer-engine-optimization'] },
  { slug: 'ai-ready-product-catalog', term: 'AI-ready product catalog', cluster: 'industrial-ecommerce', opportunity: 'own',
    aliases: ['AI-ready catalog', 'machine-readable catalog'],
    related: ['pim', 'normalized-attributes', 'spec-sheet-content', 'part-number-seo', 'punchout-catalog'] },
  { slug: 'ai-search-specialist', term: 'AI search specialist', cluster: 'roles', opportunity: 'own',
    aliases: ['AI SEO specialist', 'AEO specialist', 'AI visibility analyst'],
    related: ['geo-specialist', 'citation-engineer', 'answer-engine-optimization', 'generative-engine-optimization'] },
  { slug: 'cited-domain-analysis', term: 'Cited-domain analysis', cluster: 'measurement', opportunity: 'own',
    aliases: ['citation source analysis', 'cited sources analysis'],
    related: ['llm-citation', 'ai-share-of-voice', 'ai-citation-tracking', 'ai-visibility-tracking'] },
  { slug: 'ai-impression-share', term: 'AI impression share', cluster: 'measurement', opportunity: 'own',
    aliases: ['share of AI impressions', 'AI answer impression share'],
    related: ['ai-share-of-voice', 'ai-visibility', 'ai-visibility-tracking', 'ai-citation-tracking'] },
  { slug: 'benchmark-prompts', term: 'Benchmark prompts (prompt set)', cluster: 'measurement', opportunity: 'own',
    aliases: ['prompt set', 'evaluation prompts', 'prompt panel'],
    related: ['ai-share-of-voice', 'prompt-shaped-demand', 'ai-visibility-tracking', 'mention-rate-vs-citation-rate'] },
  { slug: 'mention-rate-vs-citation-rate', term: 'Mention rate vs citation rate', cluster: 'measurement', opportunity: 'own',
    aliases: ['mention vs citation', 'brand mention rate', 'citation rate'],
    related: ['llm-citation', 'ai-share-of-voice', 'ai-citation-tracking', 'cited-domain-analysis'] },
  { slug: 'hallucinated-attribution', term: 'Hallucinated attribution', cluster: 'ai-search-core', opportunity: 'own',
    aliases: ['false attribution', 'misattributed source'],
    related: ['llm-citation', 'brand-hallucination', 'grounding', 'citation-engineering'] },
  { slug: 'brand-hallucination', term: 'Brand hallucination', cluster: 'ai-search-core', opportunity: 'contest',
    aliases: ['brand hallucinations'],
    related: ['hallucinated-attribution', 'grounding', 'llm-citation', 'ai-visibility'] },
  { slug: 'crawlability-for-ai-bots', term: 'Crawlability for AI bots', cluster: 'technical', opportunity: 'own',
    aliases: ['AI crawlability', 'AI bot crawlability'],
    related: ['ai-crawler', 'content-chunking-for-retrieval', 'llms-txt', 'retrieval-augmented-generation'] },
  { slug: 'content-chunking-for-retrieval', term: 'Content chunking for retrieval', cluster: 'technical', opportunity: 'contest',
    aliases: ['chunking', 'retrieval chunking'],
    related: ['retrieval-augmented-generation', 'spec-sheet-content', 'crawlability-for-ai-bots', 'llm-citation'] },
  { slug: 'entity-seo', term: 'Entity SEO', cluster: 'technical', opportunity: 'contest',
    aliases: ['entity-based SEO', 'entity optimization'],
    related: ['knowledge-graph', 'llm-citation', 'ai-visibility', 'generative-engine-optimization'] },
  { slug: 'product-schema-for-industrial-skus', term: 'Product schema for industrial SKUs', cluster: 'technical', opportunity: 'contest',
    aliases: ['industrial Product schema', 'industrial product structured data'],
    related: ['structured-data-for-ai', 'normalized-attributes', 'spec-sheet-content', 'part-number-seo'] },
  { slug: 'punchout-catalog', term: 'Punchout catalog', cluster: 'industrial-ecommerce', opportunity: 'reference-only',
    aliases: ['PunchOut', 'cXML punchout', 'OCI catalog'],
    related: ['pim', 'product-data-syndication', 'ai-ready-product-catalog', 'crawlability-for-ai-bots'] },
  { slug: 'product-data-syndication', term: 'Product data syndication', cluster: 'industrial-ecommerce', opportunity: 'reference-only',
    aliases: ['content syndication', 'product content syndication'],
    related: ['pim', 'distributor-content-parity', 'part-number-cross-reference', 'normalized-attributes'] },
  { slug: 'long-tail-sku-demand', term: 'Long-tail SKU demand', cluster: 'industrial-ecommerce', opportunity: 'own',
    aliases: ['zero-volume part queries', 'long-tail part demand'],
    related: ['prompt-shaped-demand', 'part-number-seo', 'query-fan-out', 'part-number-cross-reference'] },
  { slug: 'category-page-architecture', term: 'Category page architecture', cluster: 'industrial-ecommerce', opportunity: 'contest',
    aliases: ['category page structure', 'taxonomy architecture'],
    related: ['part-number-seo', 'ai-ready-product-catalog', 'content-chunking-for-retrieval', 'spec-sheet-content'] },
  { slug: 'etim-classification', term: 'ETIM classification', cluster: 'industrial-ecommerce', opportunity: 'reference-only',
    aliases: ['ETIM', 'ETIM model'],
    related: ['normalized-attributes', 'pim', 'product-data-syndication', 'structured-data-for-ai'] },
  { slug: 'generative-engine', term: 'Generative engine', cluster: 'ai-search-core', opportunity: 'reference-only',
    aliases: ['generative search engine'],
    related: ['generative-engine-optimization', 'answer-engine', 'retrieval-augmented-generation', 'llm-citation'] },
  { slug: 'ai-mode', term: 'AI Mode', cluster: 'ai-search-core', opportunity: 'reference-only',
    aliases: ['Google AI Mode'],
    related: ['ai-overviews', 'answer-engine', 'query-fan-out', 'generative-engine-optimization'] },
  { slug: 'zero-click-search', term: 'Zero-click search', cluster: 'measurement', opportunity: 'reference-only',
    aliases: ['zero-click searches', 'no-click search'],
    related: ['ai-overviews', 'ai-visibility', 'answer-engine', 'ai-share-of-voice'] },
  { slug: 'knowledge-graph', term: 'Knowledge graph', cluster: 'technical', opportunity: 'reference-only',
    aliases: ['knowledge graphs'],
    related: ['entity-seo', 'grounding', 'structured-data-for-ai', 'llm-citation'] },
  { slug: 'structured-data-for-ai', term: 'Structured data for AI', cluster: 'technical', opportunity: 'reference-only',
    aliases: ['schema for AI', 'structured data for LLMs'],
    related: ['product-schema-for-industrial-skus', 'normalized-attributes', 'ai-crawler', 'grounding'] },
  { slug: 'llm-seeding', term: 'LLM seeding', cluster: 'technical', opportunity: 'reference-only',
    aliases: ['AI seeding', 'model seeding'],
    related: ['llm-citation', 'citation-engineering', 'ai-share-of-voice', 'distributor-content-parity'] },
  { slug: 'searchandising', term: 'Searchandising', cluster: 'industrial-ecommerce', opportunity: 'reference-only',
    aliases: ['search merchandising'],
    related: ['category-page-architecture', 'ai-ready-product-catalog', 'part-number-seo', 'pim'] },
]

// ── Merge canonical metadata + humanized prose ───────────────────────────────
const prose = JSON.parse(readFileSync(new URL('./_batch2-prose.json', import.meta.url), 'utf8'))
const proseBySlug = Object.fromEntries(prose.map((p) => [p.slug, p]))

const missing = META.filter((m) => !proseBySlug[m.slug]).map((m) => m.slug)
if (missing.length) {
  console.error(`Missing prose for: ${missing.join(', ')}`)
  process.exit(1)
}

const docs = META.map((m) => {
  const pr = proseBySlug[m.slug]
  return {
    _id: `drafts.glossary-${m.slug}`,
    _type: 'glossaryTerm',
    term: m.term,
    slug: { _type: 'slug', current: m.slug },
    shortDefinition: pr.shortDefinition,
    cluster: m.cluster,
    opportunity: m.opportunity,
    ...(m.aliases?.length ? { aliases: m.aliases } : {}),
    body: pr.body.map(block),
    ...(m.related?.length ? { relatedTerms: m.related.map(ref) } : {}),
    lastReviewed: REVIEWED,
    ...(pr.seo
      ? { seo: { _type: 'seo', metaTitle: pr.seo.metaTitle, metaDescription: pr.seo.metaDescription } }
      : {}),
  }
})

const tx = docs.reduce((t, doc) => t.createOrReplace(doc), client.transaction())

tx.commit()
  .then(() => {
    console.log(`Seeded ${docs.length} glossary drafts (batch 2):`)
    for (const d of docs) console.log(`  - ${d._id}`)
    console.log('\nReview + publish each in Studio at /studio. Nothing is live until published.')
  })
  .catch((err) => {
    console.error('Seed failed:', err.message)
    process.exit(1)
  })
