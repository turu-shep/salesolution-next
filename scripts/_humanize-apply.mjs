/**
 * Apply the verified humanizer changes as Sanity DRAFTS (never publishes).
 *
 *   node scripts/_humanize-apply.mjs <changes.json>          # dry run: print diffs
 *   node scripts/_humanize-apply.mjs <changes.json> --write  # write drafts.<id>
 *
 * changes.json = the workflow's returned `docs` array:
 *   [{ docId, type, label, finalChanges:[{id,new,note}], rejected:[...] }]
 *
 * For each doc with finalChanges, fetches the live PUBLISHED doc, swaps only the
 * prose at the named slot ids (asserting current text still matches), and writes
 * the full result to drafts.<docId>. Structural fields, _keys, markDefs, Source
 * lines and links are untouched. Idempotent (createOrReplace on the draft id).
 */
import { readFileSync } from 'node:fs'
import { createClient } from 'next-sanity'
import { applyChanges } from './_humanize-slots.mjs'

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

const changesPath = process.argv[2]
const WRITE = process.argv.includes('--write')
if (!changesPath) {
  console.error('usage: node scripts/_humanize-apply.mjs <changes.json> [--write]')
  process.exit(1)
}
let payload = JSON.parse(readFileSync(changesPath, 'utf8'))
const docs = Array.isArray(payload) ? payload : payload.docs ?? payload.result?.docs
if (!Array.isArray(docs)) {
  console.error('Could not find docs[] in', changesPath)
  process.exit(1)
}

const C = { dim: '\x1b[2m', red: '\x1b[31m', grn: '\x1b[32m', cyn: '\x1b[36m', bold: '\x1b[1m', rst: '\x1b[0m' }
const SYSTEM = new Set(['_rev', '_createdAt', '_updatedAt'])

const tx = client.transaction()
let docCount = 0
let slotCount = 0
const skipped = []

for (const d of docs) {
  const changes = d.finalChanges ?? []
  if (changes.length === 0) {
    skipped.push(`${d.docId} (no changes)`)
    continue
  }
  const live = await client.fetch(`*[_id == $id][0]`, { id: d.docId })
  if (!live) {
    skipped.push(`${d.docId} (NOT FOUND live)`)
    continue
  }

  let result
  try {
    result = applyChanges(live, changes)
  } catch (e) {
    skipped.push(`${d.docId} (apply error: ${e.message})`)
    continue
  }
  const { out, applied } = result
  if (applied.length === 0) {
    skipped.push(`${d.docId} (all changes were no-ops)`)
    continue
  }

  const draft = { ...out, _id: `drafts.${d.docId}` }
  for (const k of SYSTEM) delete draft[k]

  console.log(`\n${C.bold}${C.cyn}━━ ${d.label}${C.rst}  ${C.dim}(${applied.length} slots)${C.rst}`)
  for (const a of applied) {
    console.log(`  ${C.dim}[${a.id}]${C.rst}`)
    console.log(`    ${C.red}- ${a.before}${C.rst}`)
    console.log(`    ${C.grn}+ ${a.after}${C.rst}`)
  }
  if (d.rejected?.length) {
    console.log(`  ${C.dim}rejected by fact-check: ${d.rejected.map((r) => r.id).join(', ')}${C.rst}`)
  }

  tx.createOrReplace(draft)
  docCount++
  slotCount += applied.length
}

console.log(`\n${C.bold}${'═'.repeat(60)}${C.rst}`)
console.log(`${C.bold}${docCount} drafts${C.rst} would change ${C.bold}${slotCount} slots${C.rst}`)
if (skipped.length) console.log(`${C.dim}skipped: ${skipped.join(' · ')}${C.rst}`)

if (!WRITE) {
  console.log(`\n${C.dim}Dry run. Re-run with --write to create drafts.${C.rst}`)
  process.exit(0)
}
if (docCount === 0) {
  console.log('\nNothing to write.')
  process.exit(0)
}
const res = await tx.commit()
console.log(`\n${C.grn}✓ Wrote ${res.results.length} drafts.${C.rst} Review + publish in Studio: /studio/structure`)
