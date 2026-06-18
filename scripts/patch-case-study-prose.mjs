/**
 * Humanizer pass — patch ONLY the narrative prose fields of each case study
 * from the canonical seed (summary, situation, constraint, mechanism,
 * resultsNarrative). Non-destructive `set`; every number, stat, chart,
 * methodology line, and disclosure is left untouched. Use this to push prose
 * edits without a full (destructive) re-seed.
 * Run: node scripts/patch-case-study-prose.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { studies } from './seed-case-studies.mjs'

const env = {}
for (const line of readFileSync(resolve(process.cwd(), '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
const pid = env.NEXT_PUBLIC_SANITY_PROJECT_ID
const ds = env.NEXT_PUBLIC_SANITY_DATASET
const tok = env.SANITY_API_WRITE_TOKEN
const ver = env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-05-19'

const FIELDS = ['summary', 'situation', 'constraint', 'mechanism', 'resultsNarrative']

const mutations = studies.map((s) => {
  const set = {}
  for (const f of FIELDS) if (s[f] !== undefined) set[f] = s[f]
  return { patch: { id: s._id, set } }
})

const res = await fetch(`https://${pid}.api.sanity.io/v${ver}/data/mutate/${ds}?returnIds=true`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
  body: JSON.stringify({ mutations }),
})
const json = await res.json()
if (!res.ok) {
  console.error('patch failed:', JSON.stringify(json, null, 2))
  process.exit(1)
}
console.log('humanized prose patched from seed:')
for (const r of json.results ?? []) console.log(`  ${r.operation} ${r.id}`)
