/**
 * M4 — populate `relatedResources` (the outbound funnel) on the role / measurement
 * / catalog glossary terms, so authority circulates out to the career paths and
 * service pages instead of pooling in the glossary.
 *
 * Patches PUBLISHED terms (idempotent — set replaces the field). All hrefs are
 * internal and verified to resolve. Career paths are Sanity docs; services are
 * static pages; both linked the same way for one consistent rail.
 *
 *   node scripts/glossary-related-resources.mjs           # dry run
 *   node scripts/glossary-related-resources.mjs --write   # commit
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
  perspective: 'published',
})

const WRITE = process.argv.includes('--write')

const path = (label, href, blurb) => ({ label, href, kind: 'career-path', blurb })
const svc = (label, href, blurb) => ({ label, href, kind: 'service', blurb })

const AI_SEO = (blurb) => svc('AI SEO (GEO)', '/services/ai-seo/', blurb)
const VIS_ANALYST = (blurb) => path('AI visibility analyst', '/career-paths/ai-visibility-analyst/', blurb)

// term slug → relatedResources[]
const MAP = {
  // ── Roles ──
  'geo-specialist': [
    path('GEO specialist', '/career-paths/geo-specialist/', 'The role in full: scope, seniority ladder, hire-vs-agency.'),
    AI_SEO('What we actually do: get your catalog retrieved and cited in AI answers.'),
  ],
  'ai-search-specialist': [
    path('AI search specialist', '/career-paths/ai-search-specialist/', 'The canonical role, end to end.'),
    AI_SEO('The work this role owns, delivered as a service.'),
  ],
  'citation-engineer': [
    path('Citation engineer', '/career-paths/citation-engineer/', 'The role: earning AI citations as the outcome.'),
    svc('Editorial authority', '/services/editorial-authority/', 'How we build the citable reference content engines quote.'),
  ],
  // ── Measurement ──
  'ai-share-of-voice': [
    AI_SEO('We track and grow your share of AI answers in your category.'),
    VIS_ANALYST('The role that measures AI visibility.'),
  ],
  'ai-visibility-tracking': [
    AI_SEO('We monitor how often, and how favorably, AI answers name you.'),
    VIS_ANALYST('The role that owns AI-visibility monitoring.'),
  ],
  'ai-impression-share': [
    AI_SEO('We grow your share of the AI answers buyers see.'),
    VIS_ANALYST('The role that tracks AI impression share.'),
  ],
  'ai-citation-tracking': [
    svc('Editorial authority', '/services/editorial-authority/', 'We earn the citations, then track them over time.'),
    VIS_ANALYST('The role that runs citation tracking.'),
  ],
  'cited-domain-analysis': [
    AI_SEO('We map who AI cites in your category, then go displace them.'),
    VIS_ANALYST('The role that runs cited-domain analysis.'),
  ],
  // ── Industrial / catalog ──
  'ai-ready-product-catalog': [
    svc('Catalog AI', '/services/catalog-ai/', 'We make your SKU catalog retrievable and citable by AI engines.'),
  ],
}

const summary = []
for (const [slug, resources] of Object.entries(MAP)) {
  const id = `glossary-${slug}`
  const doc = await client.getDocument(id)
  if (!doc) {
    summary.push(`SKIP ${slug} (not published)`)
    continue
  }
  summary.push(`SET  ${slug} → ${resources.map((r) => r.label).join(' · ')}`)
  if (WRITE) await client.patch(id).set({ relatedResources: resources }).commit()
}

console.log(summary.join('\n'))
console.log(`\n${WRITE ? 'WROTE' : 'DRY RUN'}: ${Object.keys(MAP).length} terms` + (WRITE ? '' : '  (--write to commit)'))
