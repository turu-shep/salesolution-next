/**
 * s4j-rollup-retag — route confirmed PE roll-up subsidiaries out of seated and
 * the replenishment pools, into pool-chains (rollup-rosters workstream, step 5).
 *
 * The durable fix is upstream: CHAIN_DOMAIN_BLOCKLIST in lib/dedupe.mjs now
 * carries every confirmed Singer / MCE / SunSource subsidiary apex, so any
 * future S2/S3/S4 regeneration routes them `chain` at source. This stage
 * applies the SAME test to the already-generated artifacts so today's lists
 * are correct without waiting for a full regeneration. No hand-edits: the
 * routing decision lives in the shared lib, this script only moves rows.
 *
 *   lists/seated-v5.csv                → lists/seated-v6.csv          (minus movers)
 *   data/side-pools/pool-ranked-out-v7 → pool-ranked-out-v8           (minus movers)
 *   data/side-pools/pool-small-shops-v7→ pool-small-shops-v8          (minus movers)
 *   data/side-pools/pool-above-ceiling-v8 → pool-above-ceiling-v9     (minus movers)
 *   data/side-pools/pool-chains-v7     → pool-chains-v8               (v7 rows + all movers, disposition: chain)
 *
 * One row cannot ride the domain test: `instrument associates` (Alsip, IL) in
 * pool-ranked-out carries the junk domain hubs.li (a HubSpot link shortener —
 * blocklisting it would be wrong). It moves by normalized name + city/state,
 * with MCE's own announcement as evidence:
 * https://mceautomation.com/about/news/acquisition-announcement-instrument-associates
 * ("Founded in the 1940s and based in Alsip, IL" — 2021-08-31).
 *
 * Movers change EXACTLY one field: disposition → 'chain'. Everything else is
 * asserted byte-identical in the field-for-field readback (§5s), and
 * conservation (rows in = stayed + moved) is asserted per file and globally.
 *
 * Deliberately untouched (findings note, blocklist covers future regens):
 * pool-duplicate-sites, pool-not-a-distributor, pool-segment-w, pool-non-us,
 * pool-usaspending-unmatched — their roll-up rows are already unmailable and
 * carry no replenishment path.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv, toCsv } from '../../scripts/lib/csv.mjs'
import { chainDomainMatch } from './lib/dedupe.mjs'
import { normalizeCompany, apexDomain } from './lib/normalize.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const EMAILS = resolve(HERE, '..')
const TODAY = new Date().toISOString().slice(0, 10)
const APPLY = process.argv.includes('--apply')

const PARENT_BY_ENTRY = (apex) => {
  const SINGER = new Set(['singerindustrial.com','4starhose.com','ablehose.com','alliedrubber.com','american-hose.com','capitalrubberco.com','catawbarubber.com','ccrconveyor.com','cenhyd.com','connectallltd.com','customhydraulic.com','dakotafluidpower.com','dfpoemdivision.com','epgdivision.com','fcgdivision.com','fluidconveyancegroup.com','fluidtechhydraulics.com','fosterhose.com','futurehydraulik.com','hamptonrubber.com','hannarubbercompany.com','hosetechusa.com','hoserinc.com','hydrafab-us.com','kencohydraulics.com','mepbrothers.com','midway-machining.com','nationalhose.com','polyflowhose.com','prcindustrial.com','qualityconveyorsolutions.com','raylewisco.com','rubberworxhose.com','rwconnection.com','shipyardsupplyinc.com','smithindustrial.com','spartanindustrial.com','stewarthunt.com','summersrubber.com','texasrubbersupply.com','triadbellows.com','unisource-mfg.com','vikinghose.com','wattssteamstore.com','wilmingtonrubber.com','y2kfiltration.com'])
  const MCE = new Set(['mceautomation.com','ritter1.com','aic-controls.com','airautomation.com','dascosales.com','esgcontrols.com','filterresources.com','generalmachinery.com','global-controls.us','industrialcontrol.com','ivesequipment.com','lonestarmachineworks.com','netechsales.com','novahydraulics.com','piedmontelectricmotor.com','questenginc.com','romanoffindustries.com','rsainfo.com','tlr-hydraulics.com','ultimationinc.com'])
  const SUNSOURCE = new Set(['sunsource.com','sun-source.com','amazonhose.com','callahanweber.com','carotek.com','ford-gelatt.com','perfectionservo.com','priceeng.com','rhfs.com','stuarthose.com','thehopegroup.com','unitedcentral.net','westernintech.com'])
  if (SINGER.has(apex)) return 'Singer Industrial'
  if (MCE.has(apex)) return 'Motion & Control Enterprises'
  if (SUNSOURCE.has(apex)) return 'SunSource'
  return 'chain-blocklist'
}

// The one confirmed non-domain-matchable row (see header).
const NAME_KEYED = [
  {
    file: 'data/side-pools/pool-ranked-out-v7.csv',
    company: 'instrument associates',
    city: 'alsip',
    state: 'IL',
    parent: 'Motion & Control Enterprises',
    evidence: 'https://mceautomation.com/about/news/acquisition-announcement-instrument-associates',
  },
]

const FILES = [
  { from: 'lists/seated-v5.csv', to: 'lists/seated-v6.csv', label: 'seated' },
  { from: 'data/side-pools/pool-ranked-out-v7.csv', to: 'data/side-pools/pool-ranked-out-v8.csv', label: 'ranked-out' },
  { from: 'data/side-pools/pool-small-shops-v7.csv', to: 'data/side-pools/pool-small-shops-v8.csv', label: 'small-shops' },
  { from: 'data/side-pools/pool-above-ceiling-v8.csv', to: 'data/side-pools/pool-above-ceiling-v9.csv', label: 'above-ceiling' },
]
const CHAINS_FROM = 'data/side-pools/pool-chains-v7.csv'
const CHAINS_TO = 'data/side-pools/pool-chains-v8.csv'

const readRows = (rel) => {
  const text = readFileSync(join(EMAILS, rel), 'utf8')
  const rows = parseCsv(text)
  const header = text.slice(0, text.indexOf('\n')).replace(/\r$/, '').split(',')
  return { rows, header }
}

const seatedHeader = readRows('lists/seated-v5.csv').header

const audit = { date: TODAY, applied: APPLY, moved: [], counts: {}, postconditions: {} }
const movers = [] // rows destined for pool-chains-v8, already retagged
const outputs = [] // {rel, rows, header} to write

for (const f of FILES) {
  const { rows, header } = readRows(f.from)
  const stay = []
  const moved = []
  for (const row of rows) {
    const apex = apexDomain(row.domain || '')
    const hit = apex ? chainDomainMatch(apex) : null
    const nameKey = NAME_KEYED.find(
      (k) =>
        k.file === f.from &&
        normalizeCompany(row.company || row.company_display || '') === k.company &&
        (row.city || '').trim().toLowerCase() === k.city &&
        (row.state || '').trim().toUpperCase() === k.state,
    )
    if (hit || nameKey) {
      const retagged = { ...row, disposition: 'chain' }
      moved.push({ row, retagged })
      movers.push(retagged)
      audit.moved.push({
        from: f.from,
        company: row.company || row.company_display || '',
        domain: apex || row.domain || '',
        matched: hit || `name+location (${nameKey.evidence})`,
        parent: hit ? PARENT_BY_ENTRY(hit) : nameKey.parent,
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

// pool-chains-v8: v7 rows under the seated (54-col) header — every v7 column is
// a subset of it (asserted) — plus all movers.
const chains = readRows(CHAINS_FROM)
for (const c of chains.header)
  if (!seatedHeader.includes(c)) throw new Error(`pool-chains-v7 column ${c} missing from seated header — union assumption broken`)
for (const o of outputs)
  for (const c of o.header)
    if (!seatedHeader.includes(c)) throw new Error(`${o.fromRel} column ${c} missing from seated header — union assumption broken`)
const chainsOut = [...chains.rows, ...movers]
audit.counts.chains = { in: chains.rows.length, added: movers.length, out: chainsOut.length }
console.log(`chains: ${chains.rows.length} in + ${movers.length} added → ${chainsOut.length}`)

// Global conservation: every input row lands in exactly one output.
const totalIn = Object.values(audit.counts).reduce((a, c) => a + (c.in ?? 0), 0)
const totalOut = outputs.reduce((a, o) => a + o.rows.length, 0) + chainsOut.length
if (totalIn !== totalOut) throw new Error(`conservation FAIL: ${totalIn} in ≠ ${totalOut} out`)
console.log(`conservation: ${totalIn} in = ${outputs.reduce((a, o) => a + o.rows.length, 0)} stayed + ${chainsOut.length} chains-v8 (v7 ${chains.rows.length} + moved ${movers.length}) — PASS`)

if (!APPLY) {
  console.log('\nDRY RUN — nothing written. Re-run with --apply.')
  for (const m of audit.moved) console.log(`  ${m.from.split('/').pop()}: ${m.company} (${m.domain}) → chain [${m.parent}]`)
  process.exit(0)
}

// ── write + field-for-field readback (§5s) ───────────────────────────────────
const diffRow = (a, b, cols) => cols.filter((c) => String(a[c] ?? '') !== String(b[c] ?? ''))

for (const o of outputs) {
  const text = toCsv(o.rows, o.header)
  writeFileSync(join(EMAILS, o.rel), text)
  const reread = parseCsv(readFileSync(join(EMAILS, o.rel), 'utf8'))
  if (reread.length !== o.rows.length) throw new Error(`readback ${o.rel}: ${reread.length} ≠ ${o.rows.length}`)
  o.rows.forEach((row, i) => {
    const bad = diffRow(row, reread[i], o.header)
    if (bad.length) throw new Error(`readback ${o.rel} row ${i}: fields differ: ${bad.join(',')}`)
  })
  // the movers from this file: identical to their source row except disposition
  for (const { row, retagged } of o.movedPairs) {
    const bad = diffRow(row, retagged, o.header.filter((c) => c !== 'disposition'))
    if (bad.length) throw new Error(`mover from ${o.fromRel} (${row.domain}): unexpected field changes: ${bad.join(',')}`)
    if (retagged.disposition !== 'chain') throw new Error(`mover from ${o.fromRel} (${row.domain}): disposition not chain`)
  }
  console.log(`readback ${o.rel}: ${o.rows.length} rows × ${o.header.length} cols — 0 diffs`)
}

const chainsText = toCsv(chainsOut, seatedHeader)
writeFileSync(join(EMAILS, CHAINS_TO), chainsText)
const rereadChains = parseCsv(readFileSync(join(EMAILS, CHAINS_TO), 'utf8'))
if (rereadChains.length !== chainsOut.length) throw new Error(`readback ${CHAINS_TO}: ${rereadChains.length} ≠ ${chainsOut.length}`)
chainsOut.forEach((row, i) => {
  const bad = diffRow(row, rereadChains[i], seatedHeader)
  if (bad.length) throw new Error(`readback ${CHAINS_TO} row ${i}: fields differ: ${bad.join(',')}`)
})
console.log(`readback ${CHAINS_TO}: ${chainsOut.length} rows × ${seatedHeader.length} cols — 0 diffs (v7 values preserved verbatim under the wider header)`)

// Post-conditions: nothing left in any staying file matches the chain test.
for (const o of outputs) {
  const left = o.rows.filter((r) => chainDomainMatch(apexDomain(r.domain || '')))
  audit.postconditions[o.rel] = left.length
  if (left.length) throw new Error(`post-condition FAIL: ${o.rel} still holds ${left.length} chain-domain rows`)
}
console.log('post-condition: zero chain-domain rows remain in seated-v6 / ranked-out-v8 / small-shops-v8 / above-ceiling-v9')

writeFileSync(join(EMAILS, `data/_rollup-retag-${TODAY}.json`), JSON.stringify(audit, null, 2))
console.log(`audit → emails/data/_rollup-retag-${TODAY}.json`)
