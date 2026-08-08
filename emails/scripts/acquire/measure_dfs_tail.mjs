/**
 * Measure the DFS generic-tail wave (2026-08-04) against the current generation.
 *
 * Reads the deduped CSV view, scores every row's `category_ids` with the SAME
 * library the pipeline uses (`scripts/lib/category.mjs`), and reports net-new
 * domains on a three-rung ladder rather than a single flattering number.
 *
 * WHY THE LADDER. `lists/deduped-v7.csv` is not "everything we have seen" — it
 * is what survived. Chains, non-US, small shops, adjacent trades and
 * not-a-distributor rows were carved into `data/side-pools/`, and measured
 * here: 6,943 side-pool domains are absent from deduped-v7. Scoring net-new
 * against deduped-v7 alone therefore counts companies we have already met and
 * already rejected as brand-new. That is exactly the artifact that turned
 * Walter Surface's 93.9% into 89.4%, so all three rungs get printed.
 *
 * Run: node scripts/acquire/measure_dfs_tail.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'
import { classifyCategories, CORE_CODES } from '../lib/category.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..', '..')
const RAW = path.join(ROOT, 'data', 'raw')
const CAPTURED = '2026-08-04'
const PRIOR = '2026-08-01'

const apex = (d) => {
  const s = String(d ?? '').trim().toLowerCase().replace(/^\.+/, '')
  return s.startsWith('www.') ? s.slice(4) : s
}
const normName = (n) =>
  String(n ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\b(inc|llc|corp|corporation|co|company|ltd|the|lp|llp)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Minimal RFC4180 line splitter — the payload has quoted commas and newlines. */
function* csvRows(file) {
  const text = fs.readFileSync(file, 'utf8')
  let row = []
  let field = ''
  let q = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (q) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else q = false
      } else field += ch
    } else if (ch === '"') q = true
    else if (ch === ',') { row.push(field); field = '' }
    else if (ch === '\n') { row.push(field); yield row; row = []; field = '' }
    else if (ch !== '\r') field += ch
  }
  if (field || row.length) { row.push(field); yield row }
}

function readCsv(file) {
  const it = csvRows(file)
  const head = it.next().value
  const out = []
  for (const r of it) {
    if (r.length === 1 && r[0] === '') continue
    const o = {}
    head.forEach((h, i) => { o[h] = r[i] })
    out.push(o)
  }
  return { head, rows: out }
}

/** Domains from any CSV that has a `domain` column. */
function domainsOf(file) {
  const s = new Set()
  if (!fs.existsSync(file)) return s
  const { head, rows } = readCsv(file)
  if (!head.includes('domain')) return s
  for (const r of rows) { const d = apex(r.domain); if (d) s.add(d) }
  return s
}

async function headerOf(jsonFile) {
  const rl = readline.createInterface({ input: fs.createReadStream(jsonFile), crlfDelay: Infinity })
  const buf = []
  for await (const line of rl) {
    if (line.startsWith('"records"')) break
    buf.push(line)
  }
  rl.close()
  let txt = buf.join('\n').trim()
  if (txt.endsWith(',')) txt = txt.slice(0, -1)
  if (!txt.startsWith('{')) txt = '{' + txt
  return JSON.parse(txt + '}')
}

const pct = (a, b) => (b ? Math.round((1000 * a) / b) / 10 : 0)

const main = async () => {
  const csvFile = path.join(RAW, `dfs-listings-${CAPTURED}.csv`)
  const jsonFile = path.join(RAW, `dfs-listings-${CAPTURED}.json`)
  const header = await headerOf(jsonFile)
  const { rows } = readCsv(csvFile)

  // ---------------------------------------------------------------- spend
  const pages = header.pages ?? []
  const live = pages.filter((p) => !p.cached && !p.error)
  const spendSweep = pages.reduce((a, p) => a + (p.cost ?? 0), 0)
  console.log('=== SPEND')
  console.log(`  requests billed        ${live.length} (of ${pages.length} pages)`)
  console.log(`  sweep cost             $${spendSweep.toFixed(4)}`)
  console.log(`  probes before sweep    $${header.program.probe_spend_before_this_run.toFixed(4)}`)
  console.log(`  SESSION TOTAL          $${(spendSweep + header.program.probe_spend_before_this_run).toFixed(4)}  (cap $${header.program.hard_spend_cap.toFixed(2)})`)
  console.log(`  aborted for cap        ${JSON.stringify(header.program.aborted_for_cap)}`)

  // ------------------------------------------------------------- volumes
  const companies = new Set()
  const domains = new Set()
  const byBatch = {}
  let nullSite = 0
  const fill = { website: 0, phone: 0, email: 0, zip: 0 }
  for (const r of rows) {
    const nm = normName(r.company_display)
    if (nm) companies.add(nm)
    const d = apex(r.domain)
    if (d) domains.add(d)
    byBatch[r.query_batch] = (byBatch[r.query_batch] ?? 0) + 1
    if (!r.website) nullSite++
    if (r.website) fill.website++
    if (r.phone) fill.phone++
    if (r.emails) fill.email++
    if (r.zip) fill.zip++
  }
  const n = rows.length
  console.log('\n=== VOLUME')
  console.log(`  raw records (JSON)     ${header.measured.raw_rows}`)
  console.log(`  deduped listings (CSV) ${n}`)
  console.log(`  distinct companies     ${companies.size}`)
  console.log(`  distinct domains       ${domains.size}`)
  console.log(`  by batch               ${JSON.stringify(byBatch)}`)
  console.log('\n=== FILL (deduped view)')
  for (const [k, v] of Object.entries(fill)) console.log(`  ${k.padEnd(22)} ${pct(v, n)}%  (${v})`)
  console.log(`  ${'null website (Seg W)'.padEnd(22)} ${pct(nullSite, n)}%  (${nullSite})`)

  // ------------------------------------------------------- net-new ladder
  const dv7 = domainsOf(path.join(ROOT, 'lists', 'deduped-v7.csv'))
  const poolDir = path.join(ROOT, 'data', 'side-pools')
  const pools = new Set()
  for (const f of fs.readdirSync(poolDir).filter((x) => x.endsWith('.csv'))) {
    for (const d of domainsOf(path.join(poolDir, f))) pools.add(d)
  }
  const prior = new Set()
  {
    const p = path.join(RAW, `dfs-listings-${PRIOR}.csv`)
    for (const d of domainsOf(p)) prior.add(d)
  }
  const seenAll = new Set([...dv7, ...pools])
  const seenAllPlusPrior = new Set([...seenAll, ...prior])
  const nn = (base) => [...domains].filter((d) => !base.has(d)).length
  console.log('\n=== NET-NEW DOMAINS (the ladder)')
  console.log(`  baseline deduped-v7            ${dv7.size} domains -> net-new ${nn(dv7)} (${pct(nn(dv7), domains.size)}%)`)
  console.log(`  + all side-pools               ${seenAll.size} domains -> net-new ${nn(seenAll)} (${pct(nn(seenAll), domains.size)}%)`)
  console.log(`  + the ${PRIOR} DFS payload    ${seenAllPlusPrior.size} domains -> net-new ${nn(seenAllPlusPrior)} (${pct(nn(seenAllPlusPrior), domains.size)}%)`)
  console.log(`  ARTIFACT: side-pools hold ${[...pools].filter((d) => !dv7.has(d)).length} domains absent from deduped-v7;`)
  console.log(`            they inflate the headline by ${nn(dv7) - nn(seenAll)} domains.`)

  // --------------------------------------------------------- contamination
  const clusterRows = {}
  const clusterDecisive = {}
  let clean = 0
  let noCore = 0
  let decisive = 0
  const coreHist = {}
  for (const r of rows) {
    const codes = String(r.category_ids ?? '').split('|').filter(Boolean)
    const v = classifyCategories({ line_card: codes.map((c) => `DFS:${c}`) })
    if (!v) { clean++; continue }
    if (v.coreCodes.length === 0) noCore++
    for (const c of v.coreCodes) coreHist[c] = (coreHist[c] ?? 0) + 1
    const ks = Object.keys(v.clusters)
    if (ks.length === 0) clean++
    for (const k of ks) clusterRows[k] = (clusterRows[k] ?? 0) + 1
    if (v.decisive) {
      decisive++
      clusterDecisive[v.top] = (clusterDecisive[v.top] ?? 0) + 1
    }
  }
  console.log('\n=== CATEGORY CONTAMINATION (scored with scripts/lib/category.mjs)')
  console.log('  cluster                 rows     %    decisive-reject   %')
  for (const [k, v] of Object.entries(clusterRows).sort((a, b) => b[1] - a[1])) {
    const d = clusterDecisive[k] ?? 0
    console.log(`  ${k.padEnd(22)} ${String(v).padStart(6)} ${String(pct(v, n)).padStart(6)}  ${String(d).padStart(10)} ${String(pct(d, n)).padStart(7)}`)
  }
  console.log(`  ${'no wrong-vertical mark'.padEnd(22)} ${String(clean).padStart(6)} ${String(pct(clean, n)).padStart(6)}`)
  console.log(`  ${'DECISIVE REJECT (all)'.padEnd(22)} ${String(decisive).padStart(6)} ${String(pct(decisive, n)).padStart(6)}`)
  console.log(`  ${'no CORE code at all'.padEnd(22)} ${String(noCore).padStart(6)} ${String(pct(noCore, n)).padStart(6)}   <- scorer has no vocabulary for these`)
  console.log('\n  top core codes seen:')
  for (const [k, v] of Object.entries(coreHist).sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    console.log(`    ${String(v).padStart(6)}  ${k} (weight ${CORE_CODES[k]})`)
  }

  // queried categories that the scorer does not know
  const queried = header.program.batches.flatMap((b) => b.categories)
  const unknown = queried.filter((c) => !(c in CORE_CODES))
  console.log(`\n  queried categories absent from CORE_CODES: ${JSON.stringify(unknown)}`)

  // ------------------------------------------------ per-batch domain yield
  console.log('\n=== PER-BATCH (deduped listings / domains / net-new vs full baseline)')
  for (const b of header.program.batches) {
    const rs = rows.filter((r) => r.query_batch === b.name)
    const ds = new Set(rs.map((r) => apex(r.domain)).filter(Boolean))
    const newd = [...ds].filter((d) => !seenAllPlusPrior.has(d)).length
    const nw = rs.filter((r) => !r.website).length
    console.log(`  ${b.name.padEnd(18)} rows ${String(rs.length).padStart(6)}  domains ${String(ds.size).padStart(6)}  net-new ${String(newd).padStart(6)}  nullsite ${String(nw).padStart(5)}`)
  }
}

main()
