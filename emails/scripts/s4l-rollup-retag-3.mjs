/**
 * s4l-rollup-retag-3 — third roll-up pass: McCarty Equipment.
 *
 * Discovered 2026-08-04 during the first-send backfill verification reads:
 * mccartyequipment.com (Abilene TX, 17 locations, hose distributor/fabricator,
 * seated at rank 74 / T0) carries a SunSource link in its own footer, and
 * Boxwood's 2019-02 Stuart Hose release names McCarty Equipment Company in the
 * GHX Industrial (SunSource) family. It appears on NO third-party family list
 * — the roster method cannot see subsidiaries the parent never lists, which is
 * why every individual verification read must check the footer (this is the
 * catch that proves the rule).
 *
 * Sweep 2026-08-04: exactly one current-artifact row (seated-v7). The other
 * GHX-family names from the same release (National Mine Service, Gooding
 * Rubber) are not in our data / already inside the chain-tagged ghxinc.com row.
 *
 *   lists/seated-v7.csv            → lists/seated-v8.csv
 *   data/side-pools/pool-chains-v9 → pool-chains-v10  (+ the mover)
 *
 * Same discipline as s4j/s4k: routing decision in lib/dedupe.mjs
 * (mccartyequipment.com added to CHAIN_DOMAIN_BLOCKLIST); movers change only
 * disposition → 'chain'; readback + conservation asserted.
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

const FROM = 'lists/seated-v7.csv'
const TO = 'lists/seated-v8.csv'
const CHAINS_FROM = 'data/side-pools/pool-chains-v9.csv'
const CHAINS_TO = 'data/side-pools/pool-chains-v10.csv'

const readRows = (rel) => {
  const text = readFileSync(join(EMAILS, rel), 'utf8')
  return { rows: parseCsv(text), header: text.slice(0, text.indexOf('\n')).replace(/\r$/, '').split(',') }
}

const { rows, header } = readRows(FROM)
const stay = []
const movedPairs = []
const audit = { date: TODAY, applied: APPLY, moved: [], counts: {} }
for (const row of rows) {
  const apex = apexDomain(row.domain || '')
  const hit = apex ? chainDomainMatch(apex) : null
  if (hit) {
    const retagged = { ...row, disposition: 'chain' }
    movedPairs.push({ row, retagged })
    audit.moved.push({ from: FROM, company: row.company || '', domain: apex, matched: hit, parent: 'SunSource (via GHX Industrial)', prior_disposition: row.disposition || '' })
  } else stay.push(row)
}
const chains = readRows(CHAINS_FROM)
for (const c of chains.header) if (!header.includes(c)) throw new Error(`chains column ${c} missing from seated header`)
const chainsOut = [...chains.rows, ...movedPairs.map((m) => m.retagged)]
audit.counts = { seated: { in: rows.length, stayed: stay.length, moved: movedPairs.length }, chains: { in: chains.rows.length, out: chainsOut.length } }
console.log(`seated: ${rows.length} in → ${stay.length} stay + ${movedPairs.length} moved`)
console.log(`chains: ${chains.rows.length} in + ${movedPairs.length} added → ${chainsOut.length}`)
if (rows.length + chains.rows.length !== stay.length + chainsOut.length) throw new Error('conservation FAIL')
console.log(`conservation: ${rows.length + chains.rows.length} in = ${stay.length} + ${chainsOut.length} — PASS`)

if (!APPLY) {
  console.log('\nDRY RUN — nothing written. Re-run with --apply.')
  for (const m of audit.moved) console.log(`  ${m.company} (${m.domain}) → chain [${m.parent}]`)
  process.exit(0)
}

const diffRow = (a, b, cols) => cols.filter((c) => String(a[c] ?? '') !== String(b[c] ?? ''))
writeFileSync(join(EMAILS, TO), toCsv(stay, header))
const reread = parseCsv(readFileSync(join(EMAILS, TO), 'utf8'))
if (reread.length !== stay.length) throw new Error(`readback ${TO}: ${reread.length} ≠ ${stay.length}`)
stay.forEach((row, i) => {
  const bad = diffRow(row, reread[i], header)
  if (bad.length) throw new Error(`readback ${TO} row ${i}: ${bad.join(',')}`)
})
for (const { row, retagged } of movedPairs) {
  const bad = diffRow(row, retagged, header.filter((c) => c !== 'disposition'))
  if (bad.length) throw new Error(`mover ${row.domain}: unexpected changes: ${bad.join(',')}`)
}
writeFileSync(join(EMAILS, CHAINS_TO), toCsv(chainsOut, header))
const rereadC = parseCsv(readFileSync(join(EMAILS, CHAINS_TO), 'utf8'))
if (rereadC.length !== chainsOut.length) throw new Error(`readback ${CHAINS_TO}: ${rereadC.length} ≠ ${chainsOut.length}`)
chainsOut.forEach((row, i) => {
  const bad = diffRow(row, rereadC[i], header)
  if (bad.length) throw new Error(`readback ${CHAINS_TO} row ${i}: ${bad.join(',')}`)
})
const left = stay.filter((r) => chainDomainMatch(apexDomain(r.domain || '')))
if (left.length) throw new Error(`post-condition FAIL: ${left.length} chain-domain rows remain`)
console.log(`readback ${TO} + ${CHAINS_TO}: 0 diffs · post-condition: zero chain-domain rows remain`)
writeFileSync(join(EMAILS, `data/_rollup-retag3-${TODAY}.json`), JSON.stringify(audit, null, 2))
console.log(`audit → emails/data/_rollup-retag3-${TODAY}.json`)
