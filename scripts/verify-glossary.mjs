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

const all = await client.fetch(
  `*[_type == "glossaryTerm"]{ _id, term, cluster } | order(_id asc)`,
)
const drafts = all.filter((d) => d._id.startsWith('drafts.'))
const published = all.filter((d) => !d._id.startsWith('drafts.'))

console.log(`drafts: ${drafts.length} | published: ${published.length}`)
const byCluster = {}
for (const d of drafts) byCluster[d.cluster] = (byCluster[d.cluster] ?? 0) + 1
console.log('drafts by cluster:', byCluster)
