/**
 * READ-ONLY prep for the humanizer pass.
 * Fetches the live PUBLISHED careerPath + glossaryTerm docs, extracts editable
 * prose slots, and writes one file per doc to /tmp/humanize/slots/<docId>.json
 * plus a manifest. Workflow rewrite agents Read these files.
 *   node scripts/_humanize-prep.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createClient } from 'next-sanity'
import { extractSlots } from './_humanize-slots.mjs'

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
for (const line of env.split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
}
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-05-19',
  token: process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
  perspective: 'published',
})

const docs = await client.fetch(`*[_type in ["careerPath","glossaryTerm"]] | order(_type, _id) {
  ..., body, buyerSection
}`)

const DIR = '/tmp/humanize'
mkdirSync(`${DIR}/slots`, { recursive: true })
mkdirSync(`${DIR}/out`, { recursive: true })

const manifest = []
for (const doc of docs) {
  const { docId, type, label, slots } = extractSlots(doc)
  writeFileSync(`${DIR}/slots/${docId}.json`, JSON.stringify({ docId, type, label, slots }, null, 2))
  manifest.push({ docId, type, label, slotCount: slots.length })
}
writeFileSync(`${DIR}/manifest.json`, JSON.stringify(manifest, null, 2))

console.log(`Wrote ${manifest.length} slot files to ${DIR}/slots/`)
const totalSlots = manifest.reduce((n, m) => n + m.slotCount, 0)
console.log(`Total editable slots: ${totalSlots}`)
console.table(manifest.map((m) => ({ doc: m.docId.replace(/^(career|glossary)-/, ''), type: m.type.replace('careerPath','path').replace('glossaryTerm','term'), slots: m.slotCount })))
