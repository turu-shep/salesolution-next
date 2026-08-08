/**
 * s4k-rollup-retag-2 — second roll-up pass: the SunSource deal-listed names
 * confirmed on 2026-08-04 (rollup-rosters workstream, deep pass).
 *
 * s4j retagged everything the 2026-08-03 rosters confirmed. Going deeper on
 * the open follow-ups confirmed four more SunSource acquisitions with domains
 * (GHX Industrial 2018 · K+S Services 2021-07-30 · Vytl Controls Group
 * 2026-01-30 incl. its four divisions · Dover Hydraulics 2026-05-01) and the
 * sweep found three of those domains in CURRENT artifacts:
 *
 *   lists/seated-v6.csv        ghxinc.com        "ghxinc / GHX Industrial (Gooding Rubber Co)"
 *   pool-ranked-out-v8.csv     k-and-s.com       "k and s"
 *   pool-small-shops-v8.csv    vytlcontrols.com  "vytlcontrols" (sub-floor)
 *
 * The GHX row was missed by the step-3 matcher because its `company` field is
 * the bare join key "ghxinc" — the real name only lives in company_display.
 * (The matcher is fixed; this stage moves the row.)
 *
 * Same discipline as s4j: the routing decision lives in lib/dedupe.mjs
 * (CHAIN_DOMAIN_BLOCKLIST now carries the new apexes); this script only moves
 * rows. Movers change exactly one field (disposition → 'chain'); readback and
 * conservation asserted; post-condition: zero chain-domain rows remain.
 *
 *   lists/seated-v6.csv                 → lists/seated-v7.csv
 *   data/side-pools/pool-ranked-out-v8  → pool-ranked-out-v9
 *   data/side-pools/pool-small-shops-v8 → pool-small-shops-v9
 *   data/side-pools/pool-chains-v8      → pool-chains-v9  (+ movers)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv, toCsv } from '../../scripts/lib/csv.mjs'
import { chainDomainMatch } from './lib/dedupe.mjs'
import { apexDomain } from './lib/normalize.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const EMAILS = resolve(HERE, '..')
const TODAY = new Date().toISOString().slice(0, 10)
const APPLY = process.argv.includes('--apply')

const PARENT = () => 'SunSource' // every 2026-08-04 confirm is SunSource-side

const FILES = [
  { from: 'lists/seated-v6.csv', to: 'lists/seated-v7.csv', label: 'seated' },
  { from: 'data/side-pools/pool-ranked-out-v8.csv', to: 'data/side-pools/pool-ranked-out-v9.csv', label: 'ranked-out' },
  { from: 'data/side-pools/pool-small-shops-v8.csv', to: 'data/side-pools/pool-small-shops-v9.csv', label: 'small-shops' },
]
const CHAINS_FROM = 'data/side-pools/pool-chains-v8.csv'
const CHAINS_TO = 'data/side-pools/pool-chains-v9.csv'

const readRows = (rel) => {
  const text = readFileSync(join(EMAILS, rel), 'utf8')
  const rows = parseCsv(text)
  const header = text.slice(0, text.indexOf('\n')).replace(/\r$/, '').split(',')
  return { rows, header }
}

const seatedHeader = readRows('lists/seated-v6.csv').header

const audit = { date: TODAY, applied: APPLY, moved: [], counts: {}, postconditions: {} }
const movers = []
const outputs = []

for (const f of FILES) {
  const { rows, header } = readRows(f.from)
  const stay = []
  const moved = []
  for (const row of rows) {
    const apex = apexDomain(row.domain || '')
    const hit = apex ? chainDomainMatch(apex) : null
    if (hit) {
      const retagged = { ...row, disposition: 'chain' }
      moved.push({ row, retagged })
      movers.push(retagged)
      audit.moved.push({
        from: f.from,
        company: row.company || row.company_display || '',
        domain: apex,
        matched: hit,
        parent: PARENT(hit),
        prior_disposition: row.disposition || '',
      })
    } else {
      stay.push(row)
    }
  }
  audit.counts[f.label] = { in: rows.length, stayed: stay.length, moved: moved.length }
  outputs.push({ rel: f.to, rows: stay, header, movedPairs: moved, fromRel: f.from })
  console.log(`${f.label}: ${rows.length} in → ${stay.length} stay + ${moved.length} moved`)
}

const chains = readRows(CHAINS_FROM)
for (const c of chains.header)
  if (!seatedHeader.includes(c)) throw new Error(`pool-chains-v8 column ${c} missing from seated header`)
for (const o of outputs)
  for (const c of o.header)
    if (!seatedHeader.includes(c)) throw new Error(`${o.fromRel} column ${c} missing from seated header`)
const chainsOut = [...chains.rows, ...movers]
audit.counts.chains = { in: chains.rows.length, added: movers.length, out: chainsOut.length }
console.log(`chains: ${chains.rows.length} in + ${movers.length} added → ${chainsOut.length}`)

const totalIn = Object.values(audit.counts).reduce((a, c) => a + (c.in ?? 0), 0)
const totalOut = outputs.reduce((a, o) => a + o.rows.length, 0) + chainsOut.length
if (totalIn !== totalOut) throw new Error(`conservation FAIL: ${totalIn} in ≠ ${totalOut} out`)
console.log(`conservation: ${totalIn} in = ${outputs.reduce((a, o) => a + o.rows.length, 0)} stayed + ${chainsOut.length} chains-v9 — PASS`)

if (!APPLY) {
  console.log('\nDRY RUN — nothing written. Re-run with --apply.')
  for (const m of audit.moved) console.log(`  ${m.from.split('/').pop()}: ${m.company} (${m.domain}) → chain [${m.parent}]`)
  process.exit(0)
}

const diffRow = (a, b, cols) => cols.filter((c) => String(a[c] ?? '') !== String(b[c] ?? ''))

for (const o of outputs) {
  writeFileSync(join(EMAILS, o.rel), toCsv(o.rows, o.header))
  const reread = parseCsv(readFileSync(join(EMAILS, o.rel), 'utf8'))
  if (reread.length !== o.rows.length) throw new Error(`readback ${o.rel}: ${reread.length} ≠ ${o.rows.length}`)
  o.rows.forEach((row, i) => {
    const bad = diffRow(row, reread[i], o.header)
    if (bad.length) throw new Error(`readback ${o.rel} row ${i}: ${bad.join(',')}`)
  })
  for (const { row, retagged } of o.movedPairs) {
    const bad = diffRow(row, retagged, o.header.filter((c) => c !== 'disposition'))
    if (bad.length) throw new Error(`mover from ${o.fromRel} (${row.domain}): unexpected changes: ${bad.join(',')}`)
    if (retagged.disposition !== 'chain') throw new Error(`mover from ${o.fromRel} (${row.domain}): disposition not chain`)
  }
  console.log(`readback ${o.rel}: ${o.rows.length} rows × ${o.header.length} cols — 0 diffs`)
}

writeFileSync(join(EMAILS, CHAINS_TO), toCsv(chainsOut, seatedHeader))
const rereadChains = parseCsv(readFileSync(join(EMAILS, CHAINS_TO), 'utf8'))
if (rereadChains.length !== chainsOut.length) throw new Error(`readback ${CHAINS_TO}: ${rereadChains.length} ≠ ${chainsOut.length}`)
chainsOut.forEach((row, i) => {
  const bad = diffRow(row, rereadChains[i], seatedHeader)
  if (bad.length) throw new Error(`readback ${CHAINS_TO} row ${i}: ${bad.join(',')}`)
})
console.log(`readback ${CHAINS_TO}: ${chainsOut.length} rows × ${seatedHeader.length} cols — 0 diffs`)

for (const o of outputs) {
  const left = o.rows.filter((r) => chainDomainMatch(apexDomain(r.domain || '')))
  audit.postconditions[o.rel] = left.length
  if (left.length) throw new Error(`post-condition FAIL: ${o.rel} still holds ${left.length} chain-domain rows`)
}
console.log('post-condition: zero chain-domain rows remain in seated-v7 / ranked-out-v9 / small-shops-v9')

writeFileSync(join(EMAILS, `data/_rollup-retag2-${TODAY}.json`), JSON.stringify(audit, null, 2))
console.log(`audit → emails/data/_rollup-retag2-${TODAY}.json`)
