#!/usr/bin/env node
/**
 * ptda-rollup-audit — did `rollupBranches` merge PTDA distributors that are not
 * the same company?
 *
 *   node emails/scripts/ptda-rollup-audit.mjs
 *
 * The `ptda [UNDERWORKED]` handoff, Steps 1–2. **Zero network requests** — the
 * raw payload (`data/raw/ptda-2026-08-01.json`) and every current-generation
 * list are on disk.
 *
 * What it measures:
 *
 *   1  provenance histogram   where each rolled-up PTDA company landed across
 *                             seated-v5 + the ten current side pools. Names any
 *                             company found in NO list (conservation break).
 *   2  false-merge tests      for every multi-location group: the domain test
 *                             (PTDA is 100% website — two apexes under one
 *                             normalized name is a false merge unless one
 *                             redirects to the other), the phone test (distinct
 *                             area codes, no shared corporate number), and the
 *                             geography test (non-contiguous state sets).
 *
 * The automated tests are evidence, not a verdict (§5s's rule) — the report
 * prints the full member rows of every disagreeing group so the disagreements
 * can be hand-read.
 *
 * Writes:
 *   emails/data/_ptda-rollup-audit-<date>.md            the report
 *   emails/data/_ptda-rollup-audit-evidence-<date>.json full per-group evidence
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MULTI, capturedToday, fromCsv } from './lib/contract.mjs'
import { dedupeWithinSource } from './lib/dedupe.mjs'
import { MAPPERS } from './lib/map.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')

const argv = process.argv.slice(2)
const arg = (flag, fallback = null) => {
  const i = argv.indexOf(flag)
  return i >= 0 ? argv[i + 1] : fallback
}
const RAW_DATE = arg('--raw-date', '2026-08-01')
const DATE = arg('--date', capturedToday())

/** The shipped S2 arm — `runPipeline()` defaults, so the groups here are the
 *  pipeline's groups, not a re-derivation with different knobs. */
const MAP_OPTS = { stripBranch: true, dashMode: 'adjacent-space' }

/** The dossier pins the nine nationals at ≥20 distinct addresses. The
 *  classification below is by measured address count, not by a name list. */
const NATIONAL_FLOOR = 20

/** Current generation, per `handoff/strategy/02-list-guide.md` and the pack
 *  index. seated + the pools are mutually exclusive; `deduped-v7` overlays the
 *  seated+ranked-out union and is used as a cross-check only. */
const EXCLUSIVE_FILES = [
  ['seated-v5', 'lists/seated-v5.csv'],
  ['pool-ranked-out-v7', 'data/side-pools/pool-ranked-out-v7.csv'],
  ['pool-segment-w-v7', 'data/side-pools/pool-segment-w-v7.csv'],
  ['pool-chains-v7', 'data/side-pools/pool-chains-v7.csv'],
  ['pool-above-ceiling-v8', 'data/side-pools/pool-above-ceiling-v8.csv'],
  ['pool-adjacent-trades-v7', 'data/side-pools/pool-adjacent-trades-v7.csv'],
  ['pool-not-a-distributor-v10', 'data/side-pools/pool-not-a-distributor-v10.csv'],
  ['pool-small-shops-v7', 'data/side-pools/pool-small-shops-v7.csv'],
  ['pool-non-us-v9', 'data/side-pools/pool-non-us-v9.csv'],
  ['pool-duplicate-sites-v8', 'data/side-pools/pool-duplicate-sites-v8.csv'],
  ['pool-identity-backlog-v1', 'data/side-pools/pool-identity-backlog-v1.csv'],
]
const CROSSCHECK_FILE = ['deduped-v7', 'lists/deduped-v7.csv']

/** Toll-free NPAs — excluded from the area-code disagreement test, because the
 *  mapper falls back to `toll_free_raw` when `phone_raw` is empty and a shared
 *  800-number is corporate identity, not geography. */
const TOLL_FREE = new Set(['800', '833', '844', '855', '866', '877', '888'])

/** Lower-48 + DC land adjacency. AK and HI are isolated on purpose — a group
 *  spanning HI and the mainland with no other tie deserves the flag. */
const STATE_ADJ = {
  AL: ['FL', 'GA', 'MS', 'TN'],
  AZ: ['CA', 'CO', 'NM', 'NV', 'UT'],
  AR: ['LA', 'MS', 'MO', 'OK', 'TN', 'TX'],
  CA: ['AZ', 'NV', 'OR'],
  CO: ['AZ', 'KS', 'NE', 'NM', 'OK', 'UT', 'WY'],
  CT: ['MA', 'NY', 'RI'],
  DE: ['MD', 'NJ', 'PA'],
  DC: ['MD', 'VA'],
  FL: ['AL', 'GA'],
  GA: ['AL', 'FL', 'NC', 'SC', 'TN'],
  ID: ['MT', 'NV', 'OR', 'UT', 'WA', 'WY'],
  IL: ['IN', 'IA', 'KY', 'MO', 'WI'],
  IN: ['IL', 'KY', 'MI', 'OH'],
  IA: ['IL', 'MN', 'MO', 'NE', 'SD', 'WI'],
  KS: ['CO', 'MO', 'NE', 'OK'],
  KY: ['IL', 'IN', 'MO', 'OH', 'TN', 'VA', 'WV'],
  LA: ['AR', 'MS', 'TX'],
  ME: ['NH'],
  MD: ['DC', 'DE', 'PA', 'VA', 'WV'],
  MA: ['CT', 'NH', 'NY', 'RI', 'VT'],
  MI: ['IN', 'OH', 'WI'],
  MN: ['IA', 'ND', 'SD', 'WI'],
  MS: ['AL', 'AR', 'LA', 'TN'],
  MO: ['AR', 'IL', 'IA', 'KS', 'KY', 'NE', 'OK', 'TN'],
  MT: ['ID', 'ND', 'SD', 'WY'],
  NE: ['CO', 'IA', 'KS', 'MO', 'SD', 'WY'],
  NV: ['AZ', 'CA', 'ID', 'OR', 'UT'],
  NH: ['MA', 'ME', 'VT'],
  NJ: ['DE', 'NY', 'PA'],
  NM: ['AZ', 'CO', 'OK', 'TX', 'UT'],
  NY: ['CT', 'MA', 'NJ', 'PA', 'VT'],
  NC: ['GA', 'SC', 'TN', 'VA'],
  ND: ['MN', 'MT', 'SD'],
  OH: ['IN', 'KY', 'MI', 'PA', 'WV'],
  OK: ['AR', 'CO', 'KS', 'MO', 'NM', 'TX'],
  OR: ['CA', 'ID', 'NV', 'WA'],
  PA: ['DE', 'MD', 'NJ', 'NY', 'OH', 'WV'],
  RI: ['CT', 'MA'],
  SC: ['GA', 'NC'],
  SD: ['IA', 'MN', 'MT', 'ND', 'NE', 'WY'],
  TN: ['AL', 'AR', 'GA', 'KY', 'MS', 'MO', 'NC', 'VA'],
  TX: ['AR', 'LA', 'NM', 'OK'],
  UT: ['AZ', 'CO', 'ID', 'NM', 'NV', 'WY'],
  VT: ['MA', 'NH', 'NY'],
  VA: ['DC', 'KY', 'MD', 'NC', 'TN', 'WV'],
  WA: ['ID', 'OR'],
  WV: ['KY', 'MD', 'OH', 'PA', 'VA'],
  WI: ['IL', 'IA', 'MI', 'MN'],
  WY: ['CO', 'ID', 'MT', 'NE', 'SD', 'UT'],
  AK: [],
  HI: [],
}

/** Is a set of states one connected landmass? Single state → trivially yes. */
function statesContiguous(states) {
  const s = [...states].filter((x) => STATE_ADJ[x])
  if (s.length <= 1) return true
  const seen = new Set([s[0]])
  const queue = [s[0]]
  const inSet = new Set(s)
  while (queue.length) {
    const cur = queue.pop()
    for (const n of STATE_ADJ[cur] ?? []) {
      if (inSet.has(n) && !seen.has(n)) {
        seen.add(n)
        queue.push(n)
      }
    }
  }
  return seen.size === s.length
}

const areaCode = (e164) => (e164 && /^\+1\d{10}$/.test(e164) ? e164.slice(2, 5) : null)

/** Wilson score interval, 95%. */
function wilson(k, n) {
  if (!n) return [0, 0]
  const z = 1.96
  const phat = k / n
  const denom = 1 + (z * z) / n
  const centre = phat + (z * z) / (2 * n)
  const half = z * Math.sqrt((phat * (1 - phat)) / n + (z * z) / (4 * n * n))
  return [(centre - half) / denom, (centre + half) / denom]
}

const pct = (n, d) => (d ? ((n / d) * 100).toFixed(1) + '%' : '—')

function table(header, rows) {
  const sep = header.map(() => '---')
  return [header, sep, ...rows].map((r) => `| ${r.join(' | ')} |`).join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// Reproduce the pipeline's PTDA view — mapper + within-source dedupe + group
// ─────────────────────────────────────────────────────────────────────────────

const rawPath = resolve(ROOT, 'data', 'raw', `ptda-${RAW_DATE}.json`)
const payload = JSON.parse(readFileSync(rawPath, 'utf8'))
const mapped = MAPPERS.ptda(payload, MAP_OPTS)
const { records: locations } = dedupeWithinSource(mapped)

// The unstripped arm, only to reconcile the log's "159 loose / 151 stripped".
const mappedLoose = MAPPERS.ptda(payload, { ...MAP_OPTS, stripBranch: false })
const locationsLoose = dedupeWithinSource(mappedLoose).records

/** @type {Map<string, Record<string, any>[]>} normalized company → its locations */
const groups = new Map()
for (const r of locations) {
  const key = r.company ?? '(null)'
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push(r)
}

const groupList = [...groups.entries()].map(([company, rows]) => {
  const domains = new Set(rows.map((r) => r.domain).filter(Boolean))
  const phones = new Set(rows.map((r) => r.phone_e164).filter(Boolean))
  const states = new Set(rows.map((r) => r.state).filter(Boolean))
  const geoCodes = new Set([...phones].map(areaCode).filter((c) => c && !TOLL_FREE.has(c)))
  // A number shared by 2+ member rows — the corporate-number signal.
  const phoneUse = new Map()
  for (const r of rows) if (r.phone_e164) phoneUse.set(r.phone_e164, (phoneUse.get(r.phone_e164) ?? 0) + 1)
  const sharedPhones = [...phoneUse.entries()].filter(([, n]) => n >= 2).map(([p]) => p)
  return {
    company,
    display: rows.map((r) => r.company_display).filter(Boolean)[0] ?? company,
    rows,
    locations: rows.length,
    domains,
    phones,
    states,
    geoCodes,
    sharedPhones,
  }
})

const nationals = groupList.filter((g) => g.locations >= NATIONAL_FLOOR)
const multi = groupList.filter((g) => g.locations >= 2 && g.locations < NATIONAL_FLOOR)
const singles = groupList.filter((g) => g.locations === 1)

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — provenance: where each rolled-up company landed
// ─────────────────────────────────────────────────────────────────────────────

function loadPtdaRows(relPath) {
  const p = resolve(ROOT, relPath)
  if (!existsSync(p)) return null
  const rows = fromCsv(readFileSync(p, 'utf8'))
  return rows.filter((r) => String(r.source ?? '').split(MULTI).includes('ptda'))
}

const fileRows = new Map()
for (const [name, rel] of EXCLUSIVE_FILES) {
  const rows = loadPtdaRows(rel)
  if (rows === null) console.error(`MISSING FILE (skipped): ${rel}`)
  else fileRows.set(name, rows)
}
const crosscheckRows = loadPtdaRows(CROSSCHECK_FILE[1]) ?? []

/** Match a group to a list row: company key first, then domain, then phone. */
function matchKind(g, row) {
  if (row.company && row.company === g.company) return 'company'
  if (row.domain && g.domains.has(row.domain)) return 'domain'
  if (row.phone_e164 && g.phones.has(row.phone_e164)) return 'phone'
  return null
}

const attribution = new Map() // company → [{file, kind, row}]
for (const g of groupList) attribution.set(g.company, [])
const unmatchedRows = [] // ptda-tagged rows matching NO group — should be empty
for (const [file, rows] of fileRows) {
  for (const row of rows) {
    let matched = false
    for (const g of groupList) {
      const kind = matchKind(g, row)
      if (kind) {
        attribution.get(g.company).push({ file, kind, row })
        matched = true
      }
    }
    if (!matched) unmatchedRows.push({ file, company: row.company, domain: row.domain })
  }
}

/** One disposition per company: the exclusive file(s) its matches live in. */
function dispositionOf(g) {
  return [...new Set(attribution.get(g.company).map((m) => m.file))]
}

const unaccounted = groupList.filter((g) => dispositionOf(g).length === 0)
const multiHomed = groupList.filter((g) => dispositionOf(g).length > 1)

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — false-merge tests on every multi-location group
// ─────────────────────────────────────────────────────────────────────────────

function testGroup(g) {
  const domainSplit = g.domains.size >= 2
  const areaSplit = g.geoCodes.size >= 2 && g.sharedPhones.length === 0
  const geoSplit = !statesContiguous(g.states)
  return {
    company: g.company,
    display: g.display,
    locations: g.locations,
    domains: [...g.domains].sort(),
    states: [...g.states].sort(),
    areaCodes: [...g.geoCodes].sort(),
    sharedPhones: g.sharedPhones,
    domainSplit,
    areaSplit,
    geoSplit,
    flagged: domainSplit, // the primary, decisive test; the others corroborate
    members: g.rows.map((r) => ({
      display: r.company_display,
      address_1: r.address_1,
      city: r.city,
      state: r.state,
      zip5: r.zip5,
      domain: r.domain,
      phone: r.phone_e164,
      line_card: r.line_card,
    })),
  }
}

const multiTests = multi.map(testGroup)
const nationalTests = nationals.map(testGroup)
const flagged = multiTests.filter((t) => t.flagged)
const flaggedNationals = nationalTests.filter((t) => t.domainSplit)

// ─────────────────────────────────────────────────────────────────────────────
// Report
// ─────────────────────────────────────────────────────────────────────────────

const L = []
const p = (s = '') => L.push(s)

p(`# PTDA rollup audit — Steps 1–2 of the \`ptda [UNDERWORKED]\` handoff`)
p()
p(`**Date:** ${DATE} · **Raw:** \`data/raw/ptda-${RAW_DATE}.json\` (${payload.records.length.toLocaleString()} rows) · **Network requests: 0.**`)
p(`**Arm:** the shipped S2 defaults — \`stripBranch: true\`, \`dashMode: 'adjacent-space'\` — so every group below is exactly a \`rollupBranches\` group.`)
p()

p(`## 0. Reproduction check against the acquisition log`)
p()
p(
  table(
    ['Measure', 'This audit', 'Acquisition log §6'],
    [
      ['Raw records', payload.records.length.toLocaleString(), '23,105'],
      ['Distinct (company, address) locations', locations.length.toLocaleString(), '1,588'],
      ['Distinct companies (branch-stripped — the shipped key)', groups.size, '151'],
      ['Distinct companies (loose norm)', new Set(locationsLoose.map((r) => r.company).filter(Boolean)).size, '159'],
      [`Nationals (≥${NATIONAL_FLOOR} locations)`, nationals.length, '9'],
      ['Independents, single location', singles.length, '93'],
      ['Independents, 2–19 locations', multi.length, '57'],
    ],
  ),
)
p()

p(`## 1. Provenance histogram — where the ${groupList.length} rolled-up companies landed`)
p()
const histo = new Map()
for (const g of groupList) {
  const files = dispositionOf(g)
  const key = files.length === 0 ? '**NOWHERE (conservation break)**' : files.sort().join(' + ')
  if (!histo.has(key)) histo.set(key, [])
  histo.get(key).push(g)
}
p(
  table(
    ['Disposition (current-generation file)', 'Companies', 'Locations they roll up'],
    [...histo.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([k, gs]) => [k, gs.length, gs.reduce((n, g) => n + g.locations, 0)]),
  ),
)
p()
p(`Raw ptda-token row counts per file (cross-check against the pack registry):`)
p()
p(
  table(
    ['File', 'Rows with `ptda` in source'],
    [...fileRows.entries()].map(([f, rows]) => [f, rows.length]).concat([[`${CROSSCHECK_FILE[0]} (overlay cross-check)`, crosscheckRows.length]]),
  ),
)
p()
if (unmatchedRows.length) {
  p(`**${unmatchedRows.length} ptda-tagged rows match no PTDA rollup group** — attribution gap, listed:`)
  p()
  p(table(['File', 'company', 'domain'], unmatchedRows.map((u) => [u.file, u.company, u.domain])))
} else {
  p(`Every ptda-tagged row in every current file matches at least one rollup group. No orphans.`)
}
p()
if (unaccounted.length) {
  p(`### ⚠ Companies in NO list — conservation break`)
  p()
  p(table(['Company', 'Locations', 'Domains'], unaccounted.map((g) => [g.company, g.locations, [...g.domains].join(' ')])))
} else {
  p(`**Conservation holds: all ${groupList.length} companies appear in at least one current-generation list.**`)
}
p()
if (multiHomed.length) {
  p(`Companies matched in 2+ exclusive files (named, with match kinds — a company-key match in two exclusive files is a real double-home; a domain-kind second match is usually a shared-website artifact):`)
  p()
  p(
    table(
      ['Company', 'Files (kind)'],
      multiHomed.map((g) => [
        g.company,
        [...new Set(attribution.get(g.company).map((m) => `${m.file} (${m.kind})`))].join(' · '),
      ]),
    ),
  )
  p()
}

p(`## 2. False-merge measurement — every multi-location group`)
p()
p(`Population: **${multi.length} independent groups (2–19 locations)** + **${nationals.length} nationals (≥${NATIONAL_FLOOR})**, tested separately.`)
p(`Tests: **domain** (2+ apex domains under one name — primary, decisive), **phone** (2+ non-toll-free area codes with no shared number — corroborating), **geography** (non-contiguous state set — corroborating).`)
p()
const corrob = (t) => [t.areaSplit ? 'area-codes' : null, t.geoSplit ? 'non-contiguous' : null].filter(Boolean).join(', ') || '—'
p(
  table(
    ['Test', 'Independents (2–19)', `Nationals (≥${NATIONAL_FLOOR})`],
    [
      ['groups tested', multi.length, nationals.length],
      ['**domain test fails (2+ apexes)**', `**${flagged.length}**`, flaggedNationals.length],
      ['…of those, area-code test also fails', flagged.filter((t) => t.areaSplit).length, flaggedNationals.filter((t) => t.areaSplit).length],
      ['…of those, geography test also fails', flagged.filter((t) => t.geoSplit).length, flaggedNationals.filter((t) => t.geoSplit).length],
      ['area-code split alone (single apex)', multiTests.filter((t) => !t.domainSplit && t.areaSplit).length, nationalTests.filter((t) => !t.domainSplit && t.areaSplit).length],
      ['non-contiguous alone (single apex)', multiTests.filter((t) => !t.domainSplit && !t.areaSplit && t.geoSplit).length, nationalTests.filter((t) => !t.domainSplit && !t.areaSplit && t.geoSplit).length],
    ],
  ),
)
p()
const [lo, hi] = wilson(flagged.length, multi.length)
p(`**Domain-test failure rate on independents: ${flagged.length}/${multi.length} = ${pct(flagged.length, multi.length)}.**`)
p(`This is a census of all ${multi.length} groups, so the rate is exact for PTDA. Read as a sample of`)
p(`\`rollupBranches\`' behaviour on name-keyed sources generally, the 95% Wilson interval is`)
p(`**${(lo * 100).toFixed(1)}%–${(hi * 100).toFixed(1)}%**.`)
p()
p(`The domain test is evidence, not a verdict — every flagged group's full membership follows for hand-reading.`)
p()

p(`### Flagged independents — full membership, for the hand-read`)
p()
for (const t of flagged) {
  p(`#### ${t.display} (\`${t.company}\`) — ${t.locations} locations, ${t.domains.length} domains`)
  p()
  p(`states: ${t.states.join(' ')} · area codes: ${t.areaCodes.join(' ') || '—'} · shared numbers: ${t.sharedPhones.join(' ') || 'none'} · corroboration: ${corrob(t)}`)
  p()
  p(
    table(
      ['as published', 'address', 'city', 'state', 'zip', 'domain', 'phone'],
      t.members.map((m) => [m.display, m.address_1 ?? '—', m.city ?? '—', m.state ?? '—', m.zip5 ?? '—', m.domain ?? '—', m.phone ?? '—']),
    ),
  )
  p()
}

if (flaggedNationals.length) {
  p(`### Nationals with 2+ apexes (expected for acquisitive chains — checked, not assumed)`)
  p()
  p(
    table(
      ['Company', 'Locations', 'Domains', 'Corroboration'],
      flaggedNationals.map((t) => [t.company, t.locations, t.domains.join(' '), corrob(t)]),
    ),
  )
  p()
}

p(`### Clean groups (single apex domain) — the other ${multi.length - flagged.length} independents`)
p()
p(
  table(
    ['Company', 'Locations', 'Domain', 'States', 'Area codes', 'Contiguous?'],
    multiTests
      .filter((t) => !t.flagged)
      .sort((a, b) => b.locations - a.locations)
      .map((t) => [t.company, t.locations, t.domains[0] ?? '—', t.states.join(' '), t.areaCodes.join(' ') || '—', t.geoSplit ? '**no**' : 'yes']),
  ),
)
p()

const report = L.join('\n') + '\n'
writeFileSync(resolve(ROOT, 'data', `_ptda-rollup-audit-${DATE}.md`), report)
writeFileSync(
  resolve(ROOT, 'data', `_ptda-rollup-audit-evidence-${DATE}.json`),
  JSON.stringify({ date: DATE, rawDate: RAW_DATE, multiTests, nationalTests }, null, 1),
)
console.log(report)
console.log(`wrote emails/data/_ptda-rollup-audit-${DATE}.md`)
console.log(`wrote emails/data/_ptda-rollup-audit-evidence-${DATE}.json`)
