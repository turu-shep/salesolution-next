/**
 * s4o-quality-cull — apply the founder-signed quality-reprocess dispositions
 * (2026-08-10): non-company serp rows out of the client pools, into the
 * not-a-distributor bin. Culled ≠ deleted — every row survives, re-binned.
 *
 *   node emails/scripts/s4o-quality-cull.mjs           # dry run
 *   node emails/scripts/s4o-quality-cull.mjs --apply
 *
 * The signed list, from emails/data/quality-census-2026-08-10.csv:
 *   - every auto-approve row (lib/census.mjs nonCompanyDomain — directories,
 *     publications, associations, city governments; 39 rows: 35 small-shops +
 *     4 non-us), founder: "not a distributor and nor the contractor, yes"
 *   - two founder-reviewed misattributed rows, founder: "if it's some
 *     bullshit - remove it": bluemeteor.com (PIM SaaS, not a distributor) and
 *     rickrudolphassociates.com (manufacturers' rep agency, stocks nothing)
 *   - founder-KEPT after the same review: grovesindustrial.com,
 *     centuryfasteners.com (both seated), galco.com, itpgrp.com, accutech.net
 *     — real distributors whose snippets quote manufacturer partners
 *
 * Movers are recomputed from lib/census.mjs at run time, never hand-copied, so
 * this script and the census cannot disagree. Expected mover set is asserted
 * (41 exactly) — a generation drift that changes it fails loudly here.
 *
 *   data/side-pools/pool-small-shops-v9  → pool-small-shops-v10        (−37)
 *   data/side-pools/pool-non-us-v9      → pool-non-us-v10             (−4)
 *   data/side-pools/pool-not-a-distributor-v10 → v11                  (+41)
 *
 * Movers change only `disposition` → 'not-a-distributor'; conservation and
 * readback asserted like every retag since s4j. Seated is untouched.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { classifyRow, isSerpSourced } from './lib/census.mjs'
import { fromCsv, parseCsv, toCsv } from './lib/contract.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const EMAILS = resolve(HERE, '..')
const TODAY = new Date().toISOString().slice(0, 10)
const APPLY = process.argv.includes('--apply')

/** Founder-reviewed additions beyond auto-approve (decision 2026-08-10). */
const FOUNDER_CULL = new Set(['bluemeteor.com', 'rickrudolphassociates.com'])

const MOVES = [
  { from: 'data/side-pools/pool-small-shops-v9.csv', to: 'data/side-pools/pool-small-shops-v10.csv', expect: 37 },
  { from: 'data/side-pools/pool-non-us-v9.csv', to: 'data/side-pools/pool-non-us-v10.csv', expect: 4 },
]
const BIN_FROM = 'data/side-pools/pool-not-a-distributor-v10.csv'
const BIN_TO = 'data/side-pools/pool-not-a-distributor-v11.csv'

const readPool = (rel) => {
  const text = readFileSync(join(EMAILS, rel), 'utf8')
  const header = text.slice(0, text.indexOf('\n')).replace(/\r$/, '').split(',')
  return { rows: fromCsv(text), header, physical: parseCsv(text).length - 1 }
}

const audit = { date: TODAY, applied: APPLY, package: 'quality-reprocess', moved: [], counts: {} }
const outputs = []
const movers = []
let header0 = null

for (const move of MOVES) {
  const { rows, header, physical } = readPool(move.from)
  if (physical !== rows.length) throw new Error(`${move.from}: ${physical - rows.length} malformed rows dropped by the parser`)
  if (!header0) header0 = header
  else if (header.join(',') !== header0.join(',')) throw new Error(`${move.from}: header differs from ${MOVES[0].from}`)

  const stay = []
  for (const row of rows) {
    const cullByCensus = isSerpSourced(row) && classifyRow(row).autoApprove
    const cullByFounder = FOUNDER_CULL.has(row.domain)
    if (cullByCensus || cullByFounder) {
      movers.push({ ...row, disposition: 'not-a-distributor' })
      audit.moved.push({
        from: move.from,
        company: row.company || '',
        domain: row.domain || '',
        why: cullByCensus ? classifyRow(row).evidence.domainRule : 'founder-reviewed misattributed-snippet',
        prior_disposition: row.disposition || '',
      })
    } else stay.push(row)
  }
  const movedHere = rows.length - stay.length
  if (movedHere !== move.expect)
    throw new Error(`${move.from}: expected ${move.expect} movers, found ${movedHere} — generation drifted, re-run the census and re-sign`)
  audit.counts[move.from] = { in: rows.length, stayed: stay.length, moved: movedHere }
  outputs.push({ rel: move.to, rows: stay, header })
  console.log(`${move.from}: ${rows.length} in → ${stay.length} stay + ${movedHere} moved`)
}

const bin = readPool(BIN_FROM)
for (const c of bin.header) if (!header0.includes(c)) throw new Error(`bin column ${c} missing from pool header`)
const binOut = [...bin.rows, ...movers]
audit.counts[BIN_FROM] = { in: bin.rows.length, out: binOut.length }
outputs.push({ rel: BIN_TO, rows: binOut, header: header0 })
console.log(`${BIN_FROM}: ${bin.rows.length} in + ${movers.length} added → ${binOut.length}`)

const totalIn = MOVES.reduce((n, m) => n + audit.counts[m.from].in, 0) + bin.rows.length
const totalOut = outputs.reduce((n, o) => n + o.rows.length, 0)
if (totalIn !== totalOut) throw new Error(`conservation FAIL: ${totalIn} in ≠ ${totalOut} out`)
console.log(`conservation: ${totalIn} in = ${totalOut} out — PASS`)

if (!APPLY) {
  console.log('\nDRY RUN — nothing written. Re-run with --apply.')
  for (const m of audit.moved) console.log(`  ${m.domain.padEnd(32)} ${m.why}  [was ${m.prior_disposition}]`)
  process.exit(0)
}

const diffRow = (a, b, cols) => cols.filter((c) => String(a[c] ?? '') !== String(b[c] ?? ''))
for (const { rel, rows, header } of outputs) {
  writeFileSync(join(EMAILS, rel), toCsv(rows, header))
  const reread = fromCsv(readFileSync(join(EMAILS, rel), 'utf8'))
  if (reread.length !== rows.length) throw new Error(`readback ${rel}: ${reread.length} ≠ ${rows.length}`)
  rows.forEach((row, i) => {
    const bad = diffRow(row, reread[i], header)
    if (bad.length) throw new Error(`readback ${rel} row ${i}: ${bad.join(',')}`)
  })
}
// post-condition: the new generation's client pools carry zero auto-approve rows
for (const rel of MOVES.map((m) => m.to)) {
  const left = fromCsv(readFileSync(join(EMAILS, rel), 'utf8')).filter(
    (r) => (isSerpSourced(r) && classifyRow(r).autoApprove) || FOUNDER_CULL.has(r.domain),
  )
  if (left.length) throw new Error(`post-condition FAIL: ${left.length} cull rows remain in ${rel}`)
}
console.log(`readback: 0 diffs · post-condition: zero cull rows remain in the new generation`)
writeFileSync(join(EMAILS, `data/_quality-cull-${TODAY}.json`), JSON.stringify(audit, null, 2))
console.log(`audit → emails/data/_quality-cull-${TODAY}.json`)
