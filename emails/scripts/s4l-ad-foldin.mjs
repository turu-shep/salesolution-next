/**
 * s4l-ad-foldin — fold the 2026-08-03 AD pulls (denser-grid probe + the
 * gate-approved off-ICP sweep) into the current generation, and apply the
 * ad_member rank term Artur queued "for the next re-rank" — this is that
 * regeneration (`ad [DONE-DEEP]/00-README.md` §4, gate answers 2026-08-03).
 *
 * Four moves, same discipline as s4j/s4k (surgical, conservation-asserted,
 * field-level readback):
 *
 *   1. ATTACH — AD raw entities matched to current rows by the S2 keys
 *      (phone → name+zip5; domain-only evidence never merges identified rows,
 *      per lib/dedupe.mjs doctrine). Matched rows missing the `ad` token get:
 *      token + source_url + captured appended, evidence_depth recounted,
 *      AD division line_card entries unioned, null NAP fields filled.
 *      Scope: seated + ranked-out + adjacent-trades + segment-w. Matches in
 *      other pools are counted and skipped (no version bump for provenance
 *      alone).
 *   2. TERM — rank.mjs now carries AD_MEMBER (+6, the gate-question figure).
 *      Existing seated/ranked-out member rows get the delta applied through
 *      their `rank_components` (parse → set ad_member=6, refresh evidence to
 *      the recounted depth's band → score = clamped sum), never a blind +=.
 *   3. CROSS — ranked-out rows whose refreshed score ≥ 45 (the empirical cut,
 *      both generations) move to seated, `shortlist` flipped, all else
 *      byte-identical.
 *   4. NEW — entities with no corroborated match anywhere become new rows:
 *      chain blocklist first (incl. the +77 roll-up apexes), off-ICP divisions
 *      → adjacent-trade, no-domain ICP → segment-w, the rest scored with the
 *      real segment/size/rank machinery and seated or ranked-out by the cut.
 *
 *   lists/seated-v7.csv                 → lists/seated-v8.csv
 *   pool-ranked-out-v9.csv              → pool-ranked-out-v10.csv
 *   pool-adjacent-trades-v7.csv         → pool-adjacent-trades-v8.csv
 *   pool-segment-w-v7.csv               → pool-segment-w-v8.csv
 *   pool-chains-v9.csv                  → pool-chains-v10.csv (only if fed)
 *
 * Report: data/_ad-foldin-2026-08-04.md
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MULTI, csvCell, makeRecord, parseCsv, split } from './lib/contract.mjs'
import { chainDomainMatch, chainNameMatch } from './lib/dedupe.mjs'
import {
  apexDomain,
  displayName,
  normalizeCompany,
  normalizePhone,
  normalizeZip5,
  splitUsAddressLine,
} from './lib/normalize.mjs'
import { AD_MEMBER, EVIDENCE_BANDS, componentsToString, rankScore } from './lib/rank.mjs'
import { segmentScores, tierOf } from './lib/segment.mjs'
import { sizeScore } from './lib/size.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const EMAILS = resolve(HERE, '..')
const TODAY = '2026-08-04'
const CAPTURED = '2026-08-03'
const CUT = 45
const APPLY = process.argv.includes('--apply')

const RAW_FILES = ['data/raw/ad-gridprobe-2026-08-03.csv', 'data/raw/ad-officp-2026-08-03.csv']
const ICP_DIVISIONS = new Set(['BPT', 'PVF', 'ISD'])

// Attach + append surface. Files are rewritten at the next version on --apply.
const FILES = [
  { label: 'seated', from: 'lists/seated-v7.csv', to: 'lists/seated-v8.csv', attach: true },
  { label: 'ranked-out', from: 'data/side-pools/pool-ranked-out-v9.csv', to: 'data/side-pools/pool-ranked-out-v10.csv', attach: true },
  { label: 'adjacent-trades', from: 'data/side-pools/pool-adjacent-trades-v7.csv', to: 'data/side-pools/pool-adjacent-trades-v8.csv', attach: true },
  { label: 'segment-w', from: 'data/side-pools/pool-segment-w-v7.csv', to: 'data/side-pools/pool-segment-w-v8.csv', attach: true },
  { label: 'chains', from: 'data/side-pools/pool-chains-v9.csv', to: 'data/side-pools/pool-chains-v10.csv', attach: false },
]
// Match-only files: an entity matching here is NOT net-new, but the file is
// not rewritten for provenance alone.
const MATCH_ONLY = [
  ['small-shops', 'data/side-pools/pool-small-shops-v9.csv'],
  ['above-ceiling', 'data/side-pools/pool-above-ceiling-v9.csv'],
  ['not-a-distributor', 'data/side-pools/pool-not-a-distributor-v10.csv'],
  ['non-us', 'data/side-pools/pool-non-us-v9.csv'],
  ['duplicate-sites', 'data/side-pools/pool-duplicate-sites-v8.csv'],
  ['identity-backlog', 'data/side-pools/pool-identity-backlog-v1.csv'],
  ['usaspending-unmatched', 'data/side-pools/pool-usaspending-unmatched.csv'],
]

// ── CSV round-trip that preserves each file's own header ─────────────────────
function readFile(rel) {
  const text = readFileSync(join(EMAILS, rel), 'utf8')
  const cells = parseCsv(text)
  const header = cells[0]
  const rows = cells
    .slice(1)
    .filter((r) => r.length === header.length)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] === '' ? null : r[i]])))
  if (cells.length - 1 !== rows.length)
    throw new Error(`${rel}: ${cells.length - 1 - rows.length} rows dropped on parse`)
  return { header, rows }
}
const rowLine = (header, r) => header.map((h) => csvCell(r[h])).join(',')
const writeFile = (rel, header, rows) =>
  writeFileSync(join(EMAILS, rel), [header.join(','), ...rows.map((r) => rowLine(header, r))].join('\n') + '\n')

const phone10 = (v) => {
  const d = String(v ?? '').replace(/\D/g, '')
  if (d.length === 10) return d
  if (d.length === 11 && d[0] === '1') return d.slice(1)
  return null
}
const uniqJoin = (chain, add) => {
  const parts = split(chain)
  for (const a of add) if (a && !parts.includes(a)) parts.push(a)
  return parts.join(MULTI)
}
const evBand = (depth) => {
  for (const [min, pts] of EVIDENCE_BANDS) if (depth >= min) return pts
  return 0
}

// ── 1. AD entities from the two raw pulls ────────────────────────────────────
function buildEntities() {
  const entities = new Map()
  for (const rel of RAW_FILES) {
    const { rows } = readFile(rel)
    for (const raw of rows) {
      const key = normalizeCompany(raw.company, { stripBranch: true })
      if (!key) continue
      if (!entities.has(key))
        entities.set(key, {
          key,
          rawNames: [],
          phones: new Set(),
          nameZips: new Set(),
          domains: new Set(),
          lineCard: new Set(),
          divisions: new Set(),
          addresses: [],
          sourceUrls: new Set(),
        })
      const e = entities.get(key)
      e.rawNames.push(raw.company)
      const p = normalizePhone(raw.phone_raw)
      if (p) e.phones.add(p)
      const z = normalizeZip5(raw.zip) ?? normalizeZip5(String(raw.address_raw ?? '').match(/(\d{5})(?:-\d{4})?\s*$/)?.[1])
      if (z) e.nameZips.add(`${key}|${z}`)
      const d = apexDomain(raw.website)
      if (d) e.domains.add(d)
      e.divisions.add(raw.division_code)
      e.lineCard.add(`AD:${raw.division_code} ${raw.division_label}`)
      if (raw.source_url) e.sourceUrls.add(raw.source_url)
      const addr = splitUsAddressLine(raw.address_raw)
      e.addresses.push({
        ...addr,
        zip5: addr.zip5 ?? z ?? null,
        lat: raw.lat != null ? Number(raw.lat) : null,
        lng: raw.lng != null ? Number(raw.lng) : null,
        blob: raw.address_raw ?? null,
      })
    }
  }
  return entities
}

// ── main ─────────────────────────────────────────────────────────────────────
const entities = buildEntities()
const files = new Map(FILES.map((f) => [f.label, { ...f, ...readFile(f.from) }]))
const matchOnly = MATCH_ONLY.map(([label, rel]) => [label, readFile(rel)])

// Index every row of every file by the two corroborating keys.
const rowIndex = new Map() // key string → [{fileLabel, row}]
const addKey = (k, fileLabel, row) => {
  if (!rowIndex.has(k)) rowIndex.set(k, [])
  rowIndex.get(k).push({ fileLabel, row })
}
for (const [label, f] of [...files.entries(), ...matchOnly]) {
  for (const row of f.rows) {
    const p = phone10(row.phone_e164)
    if (p) addKey(`p:${p}`, label, row)
    if (row.company && row.zip5) addKey(`nz:${row.company}|${row.zip5}`, label, row)
  }
}

// 1. ATTACH + collect matched entities.
const attachTouched = new Map() // row → Set(entity keys)  (attach-scope files only)
const rowFile = new Map() // row → file label
for (const f of files.values()) for (const row of f.rows) rowFile.set(row, f.label)
const matchedEntities = new Set()
const matchOnlyHits = {}
for (const e of entities.values()) {
  const hits = []
  for (const p of e.phones) hits.push(...(rowIndex.get(`p:${p}`) ?? []))
  for (const nz of e.nameZips) hits.push(...(rowIndex.get(`nz:${nz}`) ?? []))
  if (!hits.length) continue
  matchedEntities.add(e.key)
  for (const { fileLabel, row } of hits) {
    const f = files.get(fileLabel)
    if (!f || !f.attach) {
      if (!f) matchOnlyHits[fileLabel] = (matchOnlyHits[fileLabel] ?? 0) + 1
      continue
    }
    if (!attachTouched.has(row)) attachTouched.set(row, new Set())
    attachTouched.get(row).add(e.key)
  }
}

const attachStats = {}
const depthBumped = new Map() // row → {oldDepth, newDepth}
for (const [row, keys] of attachTouched) {
  const hadToken = split(row.source).includes('ad')
  const oldDepth = split(row.source).length
  const es = [...keys].map((k) => entities.get(k))
  if (!hadToken) {
    row.source = uniqJoin(row.source, ['ad'])
    row.source_url = uniqJoin(row.source_url, [[...es[0].sourceUrls][0]].filter(Boolean))
    row.captured = uniqJoin(row.captured, [CAPTURED])
    const newDepth = split(row.source).length
    row.evidence_depth = String(newDepth)
    depthBumped.set(row, { oldDepth, newDepth })
  }
  row.line_card = uniqJoin(
    row.line_card,
    es.flatMap((e) => [...e.lineCard]),
  )
  if (!row.phone_e164) {
    const p = es.flatMap((e) => [...e.phones])[0]
    if (p) row.phone_e164 = p
  }
  if (!row.address_1 && !row.city && !row.zip5) {
    const a = es.flatMap((e) => e.addresses).find((a) => a.address_1 && a.zip5)
    if (a) {
      row.address_1 = a.address_1
      row.city = a.city
      row.state = a.state
      row.zip5 = a.zip5
    }
  }
  if (row.lat == null && row.lng == null) {
    const a = es.flatMap((e) => e.addresses).find((a) => a.lat != null)
    if (a) {
      row.lat = String(a.lat)
      row.lng = String(a.lng)
    }
  }
  const label = rowFile.get(row) ?? '?'
  const bucket = (attachStats[label] ??= { touched: 0, tokenAdded: 0 })
  bucket.touched++
  if (!hadToken) bucket.tokenAdded++
}

// 2. TERM — refresh rank via components for member rows in seated + ranked-out.
function refreshRank(row) {
  if (!split(row.source).includes('ad')) return false
  if (row.rank_components == null || row.rank_score == null) return false
  const comps = {}
  for (const kv of String(row.rank_components).split(';')) {
    const [k, v] = kv.split('=')
    if (k && v !== undefined && Number.isFinite(Number(v))) comps[k] = Number(v)
  }
  comps.ad_member = AD_MEMBER
  const bump = depthBumped.get(row)
  if (bump) {
    const pts = evBand(bump.newDepth)
    if (pts) comps.evidence = pts
    else delete comps.evidence
  }
  const raw = Object.values(comps).reduce((a, b) => a + b, 0)
  row.rank_score = String(Math.round(Math.max(0, Math.min(100, raw)) * 10) / 10)
  row.rank_components = componentsToString(comps)
  return true
}
let termSeated = 0
let termRankedOut = 0
for (const row of files.get('seated').rows) if (refreshRank(row)) termSeated++
for (const row of files.get('ranked-out').rows) if (refreshRank(row)) termRankedOut++

// 3. CROSS — ranked-out member rows at/over the cut move to seated.
const ro = files.get('ranked-out')
const seated = files.get('seated')
const crossers = ro.rows.filter(
  (r) => split(r.source).includes('ad') && Number(r.rank_score) >= CUT,
)
ro.rows = ro.rows.filter((r) => !crossers.includes(r))
for (const r of crossers) {
  r.shortlist = 'true'
  seated.rows.push(r)
}

// 4. NEW — unmatched entities become new rows.
const newRows = { seated: [], 'ranked-out': [], 'adjacent-trades': [], 'segment-w': [], chains: [] }
for (const e of entities.values()) {
  if (matchedEntities.has(e.key)) continue
  const display = displayName(e.rawNames.sort((a, b) => b.length - a.length)[0])
  const addr = e.addresses.find((a) => a.address_1 && a.zip5) ?? e.addresses[0] ?? {}
  const geo = e.addresses.find((a) => a.lat != null) ?? {}
  const domain = [...e.domains][0] ?? null
  const rec = makeRecord({
    company: e.key,
    company_display: display,
    domain,
    address_1: addr.address_1 ?? null,
    city: addr.city ?? null,
    state: addr.state ?? null,
    zip5: addr.zip5 ?? null,
    phone_e164: [...e.phones][0] ?? null,
    lat: geo.lat ?? null,
    lng: geo.lng ?? null,
    source: 'ad',
    source_url: [...e.sourceUrls][0] ?? null,
    captured: CAPTURED,
    line_card: [...e.lineCard].sort(),
    location_count: new Set(e.addresses.map((a) => a.blob ?? `${a.address_1}|${a.zip5}`)).size,
  })
  rec.evidence_depth = 1
  rec.icp_class = 'industrial-distributor'
  rec.vertical_axis = 'default'

  const chain = chainNameMatch(rec.company) ?? chainDomainMatch(rec.domain)
  if (chain) {
    rec.disposition = 'chain'
    newRows.chains.push(rec)
    continue
  }
  const icp = [...e.divisions].some((d) => ICP_DIVISIONS.has(d))
  if (!icp) {
    rec.disposition = 'adjacent-trade'
    newRows['adjacent-trades'].push(rec)
    continue
  }
  if (!rec.domain) {
    rec.disposition = 'no-website'
    rec.segment = 'W'
    newRows['segment-w'].push(rec)
    continue
  }
  const scores = segmentScores(rec)
  rec.segment = scores.segment
  rec.segment_scores = `A=${scores.A};B=${scores.B};C=${scores.C}`
  const size = sizeScore(rec, {})
  rec.size_score = String(size.score)
  rec.size_band = size.band
  const rank = rankScore(rec, { size, enrich: null })
  rec.rank_score = String(rank.score)
  rec.rank_components = componentsToString(rank.components)
  rec.tier = tierOf(rec, size, 'unknown')
  if (rank.score >= CUT) {
    rec.shortlist = 'true'
    newRows.seated.push(rec)
  } else {
    rec.shortlist = 'false'
    newRows['ranked-out'].push(rec)
  }
}

// Serialize new records into each target file's own header.
for (const [label, recs] of Object.entries(newRows)) {
  const f = files.get(label)
  for (const rec of recs) {
    const row = {}
    for (const h of f.header) {
      const v = rec[h]
      row[h] = v == null || v === '' ? null : Array.isArray(v) ? v.join(MULTI) : String(v)
    }
    f.rows.push(row)
  }
}

// ── conservation + report ────────────────────────────────────────────────────
const inCounts = Object.fromEntries(FILES.map((f) => [f.label, readFile(f.from).rows.length]))
const summary = []
summary.push(`entities ${entities.size} (matched ${matchedEntities.size} · net-new ${entities.size - matchedEntities.size})`)
for (const [label, s] of Object.entries(attachStats))
  summary.push(`attach ${label}: ${s.touched} rows touched, ${s.tokenAdded} tokens added`)
summary.push(`match-only hits (not rewritten): ${JSON.stringify(matchOnlyHits)}`)
summary.push(`ad_member refreshed: seated ${termSeated} · ranked-out ${termRankedOut} (of which ${crossers.length} crossed the cut)`)
summary.push(`crossers ranked-out → seated: ${crossers.length}`)
for (const [label, recs] of Object.entries(newRows)) summary.push(`new → ${label}: ${recs.length}`)

let conservationOk = true
for (const f of files.values()) {
  const added = (newRows[f.label] ?? []).length + (f.label === 'seated' ? crossers.length : 0)
  const removed = f.label === 'ranked-out' ? crossers.length : 0
  const expect = inCounts[f.label] + added - removed
  const ok = f.rows.length === expect
  conservationOk &&= ok
  summary.push(`${f.label}: ${inCounts[f.label]} in + ${added} − ${removed} = ${f.rows.length} ${ok ? 'PASS' : `FAIL (expected ${expect})`}`)
}

console.log(summary.join('\n'))
if (!conservationOk) throw new Error('conservation FAIL — nothing written')

if (!APPLY) {
  console.log('\nDRY RUN — re-run with --apply to write the new generations.')
} else {
  for (const f of files.values()) {
    if (f.label === 'chains' && newRows.chains.length === 0) continue
    writeFile(f.to, f.header, f.rows)
    console.log(`wrote ${f.to} (${f.rows.length})`)
  }
  const report = [
    `# S4l — AD fold-in (${TODAY})`,
    '',
    `Folds \`ad-gridprobe-${CAPTURED}\` + \`ad-officp-${CAPTURED}\` into the generation`,
    `and applies the queued \`ad_member\` term (+${AD_MEMBER}) — gate answers 2026-08-03,`,
    'recorded in `handoff/industrial-contact-list/ad [DONE-DEEP]/00-README.md` §4.',
    '',
    '```',
    ...summary,
    '```',
    '',
    'Notes: domain-only membership evidence never merges identified rows',
    '(lib/dedupe.mjs doctrine), so those remain in the fix CSV',
    '`data/ad-member-token-fixes-2026-08-03.csv` for manual adjudication.',
    'New rows are unenriched: no email, catalog/e-commerce class unknown until',
    'the next enrichment pass. Sendable is unchanged by this stage.',
  ].join('\n')
  writeFileSync(join(EMAILS, `data/_ad-foldin-${TODAY}.md`), report + '\n')
  console.log(`wrote data/_ad-foldin-${TODAY}.md`)
}
