// TEMP: promote career drafts to published (arg "up") or revert to draft-only ("down").
// Used only for the visual-review loop; content is identical either way.
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
  apiVersion: '2026-05-19', token: process.env.SANITY_API_WRITE_TOKEN, useCdn: false, perspective: 'raw',
})
const slugs = ['geo-specialist', 'citation-engineer']
const dir = process.argv[2]
const tx = client.transaction()
for (const s of slugs) {
  if (dir === 'up') {
    const d = await client.getDocument(`drafts.career-${s}`)
    if (!d) { console.log('no draft', s); continue }
    const pub = { ...d, _id: `career-${s}` }
    delete pub._rev; delete pub._createdAt; delete pub._updatedAt
    tx.createOrReplace(pub)
  } else {
    tx.delete(`career-${s}`)
  }
}
await tx.commit()
console.log(dir === 'up' ? 'temp-published' : 'reverted to draft-only')
