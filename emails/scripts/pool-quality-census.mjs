/**
 * pool-quality-census — read-only census of non-company serp rows across the
 * seven client-visible pools (quality-reprocess package, 2026-08-10).
 *
 *   node emails/scripts/pool-quality-census.mjs
 *
 * Classifies every serp-sourced row in seated + the six client side pools
 * (above-ceiling, adjacent-trades, chains, non-us, small-shops, segment-w)
 * with lib/census.mjs and writes ONE artifact:
 *
 *   emails/data/quality-census-<date>.csv   (gitignored, like all data)
 *
 * Pool files are never touched — classify loudly, cull via the pipeline,
 * delete nothing. The founder signs the disposition list off this report;
 * the retag lands in the NEXT generation via the retag mechanics.
 *
 * The console table is the per-pool junk-rate report that answers gate G2
 * (the CLIENT_POOLS re-pick in apps/contacts-dashboard/lib/columns.mjs).
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { classifyRow, isSerpSourced } from './lib/census.mjs'
import { fromCsv, parseCsv, toCsv } from './lib/contract.mjs'
import { latestPools } from './lib/dashboard-data.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const EMAILS = resolve(HERE, '..')
const LISTS_DIR = join(EMAILS, 'lists')
const POOLS_DIR = join(EMAILS, 'data', 'side-pools')
const TODAY = new Date().toISOString().slice(0, 10)
const OUT = join(EMAILS, 'data', `quality-census-${TODAY}.csv`)

/** The client-visible side pools — CLIENT_POOLS minus seated, which lives in lists/. */
const CLIENT_SIDE_POOLS = ['above-ceiling', 'adjacent-trades', 'chains', 'non-us', 'small-shops', 'segment-w']

/** Newest seated generation, by NUMERIC version — v10 must beat v9. */
function currentSeated() {
  const files = readdirSync(LISTS_DIR)
    .map((f) => /^seated-v(\d+)\.csv$/.exec(f))
    .filter(Boolean)
    .sort((a, b) => Number(a[1]) - Number(b[1]))
  if (!files.length) throw new Error(`no seated-v*.csv under ${LISTS_DIR}`)
  return files.at(-1)[0]
}

const files = [
  { pool: 'seated', file: join(LISTS_DIR, currentSeated()) },
  ...latestPools(readdirSync(POOLS_DIR))
    .filter((p) => CLIENT_SIDE_POOLS.includes(p.disposition))
    .map((p) => ({ pool: p.disposition, file: join(POOLS_DIR, p.file) })),
]
if (files.length !== 7) throw new Error(`expected 7 client pools, resolved ${files.length}`)

const REPORT_FIELDS = [
  'pool',
  'file',
  'company',
  'company_display',
  'domain',
  'classes',
  'confidence',
  'auto_approve',
  'domain_rule',
  'domain_label',
  'foreign_domains',
  'icp_class',
  'icp_noncompany',
  'self_declaration_verbatim',
  'disposition',
  'tier_raw',
  'source',
  'source_url',
  'self_declaration',
]

const flagged = []
const summary = []
for (const { pool, file } of files) {
  const text = readFileSync(file, 'utf8')
  // fromCsv silently drops rows whose cell count mismatches the header; a
  // census that under-scans silently is worse than none, so count the drops.
  const physical = parseCsv(text).length - 1
  const rows = fromCsv(text)
  const dropped = physical - rows.length

  const counts = {
    pool,
    file: file.split('/').pop(),
    records: rows.length,
    dropped,
    serp: 0,
    nonCompanyDomain: 0,
    misattributed: 0,
    hollow: 0,
    hollowOnly: 0,
    icpFlagged: 0,
    autoApprove: 0,
    flagged: 0,
  }

  for (const row of rows) {
    if (!isSerpSourced(row)) continue
    counts.serp++
    const verdict = classifyRow(row)
    const interesting =
      verdict.classes.length > 0 || verdict.evidence.icpNonCompany || row.icp_class === 'manufacturer'
    if (!interesting) continue

    counts.flagged++
    if (verdict.classes.includes('non-company-domain')) counts.nonCompanyDomain++
    if (verdict.classes.includes('misattributed-snippet')) counts.misattributed++
    if (verdict.classes.includes('hollow')) counts.hollow++
    if (verdict.classes.length === 1 && verdict.classes[0] === 'hollow') counts.hollowOnly++
    if (verdict.evidence.icpNonCompany) counts.icpFlagged++
    if (verdict.autoApprove) counts.autoApprove++

    flagged.push({
      pool,
      file: counts.file,
      company: row.company,
      company_display: row.company_display,
      domain: row.domain,
      classes: verdict.classes.join('|'),
      confidence: verdict.confidence,
      auto_approve: verdict.autoApprove,
      domain_rule: verdict.evidence.domainRule,
      domain_label: verdict.evidence.domainLabel,
      foreign_domains: verdict.evidence.foreignDomains.join('|'),
      icp_class: row.icp_class,
      icp_noncompany: verdict.evidence.icpNonCompany,
      self_declaration_verbatim: row.self_declaration_verbatim,
      disposition: row.disposition,
      tier_raw: row.tier_raw,
      source: row.source,
      source_url: row.source_url,
      self_declaration: row.self_declaration,
    })
  }
  summary.push(counts)
}

writeFileSync(OUT, toCsv(flagged, REPORT_FIELDS))

const COLS = [
  ['pool', 16],
  ['records', 8],
  ['dropped', 8],
  ['serp', 6],
  ['flagged', 8],
  ['nonCompanyDomain', 17],
  ['misattributed', 14],
  ['hollow', 7],
  ['hollowOnly', 11],
  ['icpFlagged', 11],
  ['autoApprove', 12],
]
const line = (vals) => vals.map(([v, w]) => String(v).padEnd(w)).join('')
console.log(line(COLS.map(([k, w]) => [k, w])))
const totals = Object.fromEntries(COLS.map(([k]) => [k, 0]))
for (const s of summary) {
  console.log(line(COLS.map(([k, w]) => [s[k], w])))
  for (const [k] of COLS) if (typeof s[k] === 'number') totals[k] += s[k]
}
totals.pool = 'TOTAL'
console.log(line(COLS.map(([k, w]) => [totals[k], w])))

console.log('\nper-pool junk rate (flagged / serp · auto-approve / serp):')
for (const s of summary) {
  const rate = (n) => (s.serp ? `${((100 * n) / s.serp).toFixed(1)}%` : '—')
  console.log(`  ${s.pool.padEnd(16)} ${String(s.flagged).padStart(5)}/${s.serp} = ${rate(s.flagged).padStart(6)} · ${String(s.autoApprove).padStart(3)}/${s.serp} = ${rate(s.autoApprove).padStart(6)}`)
}
console.log(`\nreport → ${OUT} (${flagged.length} rows)`)
