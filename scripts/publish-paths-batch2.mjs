/**
 * Publish career-path batch 2 (voiced drafts -> published), atomically.
 * Promotes each draft AS-IS (prose was already voiced + humanized in the
 * voice-draft-*.mjs pass); only sets _id (drop drafts.), status=published,
 * publishedAt, and deletes the draft. Structured fields untouched.
 *   node scripts/publish-paths-batch2.mjs
 */
import { readFileSync } from 'node:fs'
import { createClient } from 'next-sanity'
const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
for (const line of env.split('\n')) { const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^['"]|['"]$/g,'') }
const client = createClient({ projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET, apiVersion:'2026-05-19', token:process.env.SANITY_API_WRITE_TOKEN, useCdn:false, perspective:'raw' })

const PUBLISHED_AT = '2026-06-16T12:00:00Z'
const slugs = ['ai-search-specialist','aeo-specialist','ai-visibility-analyst','seo-specialist','technical-seo-specialist']

const tx = client.transaction()
const log = []
for (const slug of slugs) {
  const draft = await client.getDocument(`drafts.career-${slug}`)
  if (!draft) { log.push(`SKIP ${slug} (no draft)`); continue }
  const published = { ...draft, _id: `career-${slug}`, status: 'published', publishedAt: draft.publishedAt ?? PUBLISHED_AT }
  delete published._rev; delete published._createdAt; delete published._updatedAt
  tx.createOrReplace(published)
  tx.delete(`drafts.career-${slug}`)
  log.push(`PUBLISH ${slug}`)
}
await tx.commit()
console.log(log.join('\n'))
console.log('done')
