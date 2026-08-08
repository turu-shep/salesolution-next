/**
 * ad-gap-audit — Steps 0 + 1 of `ad [UNDERWORKED]/01-prompt.md`.
 *
 * Step 0: histogram the disposition of every record whose `source` contains the
 * exact token `ad` across seated-v5 + all current side pools, then a
 * company-grain conservation check of the AD raw pull against the whole
 * current generation.
 *
 * Step 1: join AD company identities (phone → name+zip5 → domain, the S2 keys)
 * against pool-ranked-out-v7 and simulate an `ad_member` rank term.
 *
 * Offline. Zero network. Reads only — unless `--emit-fixes <path>` is passed,
 * which additionally writes the missing-token fix list (seated + ranked-out
 * rows that ARE AD members but do not carry the `ad` source token) for the
 * next re-rank to consume. GATE answer 2026-08-03: record now, apply at next
 * re-rank — this CSV is the record.
 */
import { readFileSync, writeFileSync } from 'fs'
import { pathToFileURL } from 'url'

import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const lib = (f) => import(pathToFileURL(`${ROOT}/scripts/lib/${f}`).href)
const { fromCsv, split } = await lib('contract.mjs')
const { normalizeCompany, normalizePhone, normalizeZip5, apexDomain } = await lib('normalize.mjs')
const { EVIDENCE_BANDS } = await lib('rank.mjs')

const read = (p) => fromCsv(readFileSync(`${ROOT}/${p}`, 'utf8'))

// ── AD raw, both waves ───────────────────────────────────────────────────────
const w1 = read('data/raw/ad-2026-08-01.csv')
const w2 = read('data/raw/ad-expansion-2026-08-01.csv')

const loose = (n) => normalizeCompany(n)
const strip = (n) => normalizeCompany(n, { stripBranch: true })

const loose1 = new Set(w1.map((r) => loose(r.company)).filter(Boolean))
const loose2 = new Set(w2.map((r) => loose(r.company)).filter(Boolean))
const looseUnion = new Set([...loose1, ...loose2])

// Per-company identity, keyed on the branch-stripped name (the generation's key form).
const adCo = new Map()
for (const r of [...w1, ...w2]) {
  const name = strip(r.company)
  if (!name) continue
  if (!adCo.has(name))
    adCo.set(name, {
      name,
      rawNames: new Set(),
      phones: new Set(),
      zips: new Set(),
      domains: new Set(),
      divisions: new Set(),
    })
  const c = adCo.get(name)
  c.rawNames.add(r.company)
  const p = normalizePhone(r.phone_raw)
  if (p) c.phones.add(p)
  const z = normalizeZip5(r.zip) ?? normalizeZip5(String(r.address_raw ?? '').match(/(\d{5})(?:-\d{4})?\s*$/)?.[1])
  if (z) c.zips.add(z)
  const d = apexDomain(r.website)
  if (d) c.domains.add(d)
  if (r.division_code) c.divisions.add(r.division_code)
}

console.log('── AD raw ──')
console.log(`wave1 rows ${w1.length} · expansion rows ${w2.length} · total ${w1.length + w2.length}`)
console.log(`distinct loose: wave1 ${loose1.size} · expansion ${loose2.size} · sum ${loose1.size + loose2.size} · union ${looseUnion.size}`)
console.log(`distinct branch-stripped union: ${adCo.size}`)

// ── The current generation ───────────────────────────────────────────────────
const FILES = {
  'seated-v5': 'lists/seated-v5.csv',
  'ranked-out-v7': 'data/side-pools/pool-ranked-out-v7.csv',
  'adjacent-trades-v7': 'data/side-pools/pool-adjacent-trades-v7.csv',
  'small-shops-v7': 'data/side-pools/pool-small-shops-v7.csv',
  'segment-w-v7': 'data/side-pools/pool-segment-w-v7.csv',
  'not-a-distributor-v10': 'data/side-pools/pool-not-a-distributor-v10.csv',
  'chains-v7': 'data/side-pools/pool-chains-v7.csv',
  'above-ceiling-v8': 'data/side-pools/pool-above-ceiling-v8.csv',
  'non-us-v9': 'data/side-pools/pool-non-us-v9.csv',
  'duplicate-sites-v8': 'data/side-pools/pool-duplicate-sites-v8.csv',
  'identity-backlog-v1': 'data/side-pools/pool-identity-backlog-v1.csv',
  'usaspending-unmatched': 'data/side-pools/pool-usaspending-unmatched.csv',
}
// The prompt says pool-*-v7 literally; four pools have newer versions. Read the
// v7 variants too and report any delta in ad-token rows.
const V7_ALT = {
  'not-a-distributor-v7': 'data/side-pools/pool-not-a-distributor-v7.csv',
  'above-ceiling-v7': 'data/side-pools/pool-above-ceiling-v7.csv',
  'non-us-v7': 'data/side-pools/pool-non-us-v7.csv',
  'duplicate-sites-v7': 'data/side-pools/pool-duplicate-sites-v7.csv',
}

const hasAd = (r) => split(r.source).includes('ad')
const phone10 = (v) => {
  const d = String(v ?? '').replace(/\D/g, '')
  if (d.length === 10) return d
  if (d.length === 11 && d[0] === '1') return d.slice(1)
  return null
}

const gen = {}
console.log('\n── Step 0: rows whose source contains token `ad` ──')
for (const [label, path] of Object.entries(FILES)) {
  let rows
  try {
    rows = read(path)
  } catch (e) {
    console.log(`${label}: UNREADABLE (${e.message})`)
    continue
  }
  gen[label] = rows
  const withSource = rows.filter((r) => 'source' in r)
  const ad = rows.filter(hasAd)
  console.log(
    `${label}: ${ad.length} ad-token rows of ${rows.length}` +
      (withSource.length !== rows.length ? ` (only ${withSource.length} have a source col)` : ''),
  )
}
let adTokenTotal = 0
for (const rows of Object.values(gen)) adTokenTotal += rows.filter(hasAd).length
console.log(`TOTAL ad-token rows across generation: ${adTokenTotal}`)

console.log('\n literal v7 variants (delta check):')
for (const [label, path] of Object.entries(V7_ALT)) {
  try {
    const rows = read(path)
    console.log(`  ${label}: ${rows.filter(hasAd).length} ad-token rows of ${rows.length}`)
  } catch (e) {
    console.log(`  ${label}: UNREADABLE (${e.message})`)
  }
}

// ── Conservation: company-grain, strong keys + name rung ─────────────────────
// Build per-file identity indexes.
const IDX = {}
for (const [label, rows] of Object.entries(gen)) {
  const names = new Set()
  const nameZips = new Set()
  const phones = new Set()
  const domains = new Set()
  for (const r of rows) {
    if (r.company) names.add(r.company)
    if (r.company && r.zip5) nameZips.add(`${r.company}|${r.zip5}`)
    const p = phone10(r.phone_e164)
    if (p) phones.add(p)
    if (r.domain) domains.add(String(r.domain).toLowerCase())
  }
  IDX[label] = { names, nameZips, phones, domains }
}

// Priority = best outcome first; a company is assigned to the first file that
// holds any identity match for it.
const PRIORITY = [
  'seated-v5',
  'ranked-out-v7',
  'small-shops-v7',
  'above-ceiling-v8',
  'chains-v7',
  'adjacent-trades-v7',
  'not-a-distributor-v10',
  'non-us-v9',
  'duplicate-sites-v8',
  'segment-w-v7',
  'identity-backlog-v1',
  'usaspending-unmatched',
]

function matchIn(c, idx, { withName }) {
  for (const p of c.phones) if (idx.phones.has(p)) return 'phone'
  for (const z of c.zips) if (idx.nameZips.has(`${c.name}|${z}`)) return 'name+zip5'
  for (const d of c.domains) if (idx.domains.has(d)) return 'domain'
  if (withName && idx.names.has(c.name)) return 'name'
  return null
}

for (const withName of [false, true]) {
  const waterfall = new Map(PRIORITY.map((p) => [p, 0]))
  let vanished = 0
  const vanishedSample = []
  const keyKind = new Map()
  for (const c of adCo.values()) {
    let placed = null
    let kind = null
    for (const label of PRIORITY) {
      kind = matchIn(c, IDX[label], { withName })
      if (kind) {
        placed = label
        break
      }
    }
    if (placed) {
      waterfall.set(placed, waterfall.get(placed) + 1)
      keyKind.set(kind, (keyKind.get(kind) ?? 0) + 1)
    } else {
      vanished++
      if (vanishedSample.length < 15)
        vanishedSample.push(
          `${[...c.rawNames][0]} [${[...c.divisions].join(',')}] ph:${c.phones.size} dom:${c.domains.size} zip:${c.zips.size}`,
        )
    }
  }
  console.log(`\n── Conservation (companies, ${withName ? 'strong keys + exact-name rung' : 'strong keys only: phone/name+zip5/domain'}) ──`)
  for (const [label, n] of waterfall) if (n) console.log(`  ${label}: ${n}`)
  console.log(`  VANISHED (no identity anywhere): ${vanished} of ${adCo.size}`)
  console.log(`  matched via: ${[...keyKind.entries()].map(([k, n]) => `${k} ${n}`).join(' · ')}`)
  if (vanished && withName) console.log(`  sample vanished:\n    ${vanishedSample.join('\n    ')}`)
}

// ── Step 1: ranked-out join + ad_member simulation ───────────────────────────
const ro = gen['ranked-out-v7']
const roIdx = { byPhone: new Map(), byNameZip: new Map(), byDomain: new Map(), byName: new Map() }
const push = (m, k, i) => {
  if (!m.has(k)) m.set(k, [])
  m.get(k).push(i)
}
ro.forEach((r, i) => {
  const p = phone10(r.phone_e164)
  if (p) push(roIdx.byPhone, p, i)
  if (r.company && r.zip5) push(roIdx.byNameZip, `${r.company}|${r.zip5}`, i)
  if (r.domain) push(roIdx.byDomain, String(r.domain).toLowerCase(), i)
  if (r.company) push(roIdx.byName, r.company, i)
})

const matchedRows = new Map() // row idx → {via:Set, companies:Set}
for (const c of adCo.values()) {
  const hit = (idxs, via) => {
    for (const i of idxs ?? []) {
      if (!matchedRows.has(i)) matchedRows.set(i, { via: new Set(), companies: new Set() })
      matchedRows.get(i).via.add(via)
      matchedRows.get(i).companies.add(c.name)
    }
  }
  for (const p of c.phones) hit(roIdx.byPhone.get(p), 'phone')
  for (const z of c.zips) hit(roIdx.byNameZip.get(`${c.name}|${z}`), 'name+zip5')
  for (const d of c.domains) hit(roIdx.byDomain.get(d), 'domain')
}

const withToken = [...matchedRows.keys()].filter((i) => hasAd(ro[i]))
const newlyJoined = [...matchedRows.keys()].filter((i) => !hasAd(ro[i]))
const tokenOnly = ro.map((r, i) => i).filter((i) => hasAd(ro[i]) && !matchedRows.has(i))

console.log('\n── Step 1: AD membership vs pool-ranked-out-v7 ──')
console.log(`ranked-out rows: ${ro.length}`)
console.log(`identity-matched rows: ${matchedRows.size} (already ad-token: ${withToken.length} · newly joined: ${newlyJoined.length})`)
console.log(`ad-token rows NOT re-matched by identity keys: ${tokenOnly.length}`)
const viaCount = {}
for (const m of matchedRows.values()) for (const v of m.via) viaCount[v] = (viaCount[v] ?? 0) + 1
console.log(`match keys (rows, multi-counted): ${JSON.stringify(viaCount)}`)

// Cut line, empirical.
const seatScores = gen['seated-v5'].map((r) => Number(r.rank_score)).filter((n) => Number.isFinite(n))
const roScores = ro.map((r) => Number(r.rank_score)).filter((n) => Number.isFinite(n))
const cutScore = Math.min(...seatScores)
console.log(`\nseated-v5 rank_score: min ${cutScore} · rows with score ${seatScores.length}/${gen['seated-v5'].length}`)
console.log(`ranked-out rank_score: max ${Math.max(...roScores)} · rows with score ${roScores.length}/${ro.length}`)

const bandStep = (depth) => {
  const s = (v) => {
    for (const [min, pts] of EVIDENCE_BANDS) if (v >= min) return pts
    return 0
  }
  return s(depth + 1) - s(depth)
}

const allMatched = [...matchedRows.keys()]
const noScore = allMatched.filter((i) => !Number.isFinite(Number(ro[i].rank_score)))
console.log(`matched rows without a rank_score: ${noScore.length}`)

console.log('\nad_member weight → matched ranked-out rows crossing the cut (score+bump ≥ cut ' + cutScore + ')')
console.log('  (newly-joined rows also get the evidence_depth band step; already-ad rows do not)')
for (const X of [0, 2, 4, 6, 8, 10, 12]) {
  let cross = 0
  let crossNew = 0
  for (const i of allMatched) {
    const base = Number(ro[i].rank_score)
    if (!Number.isFinite(base)) continue
    const isNew = !hasAd(ro[i])
    const bump = isNew ? bandStep(Number(ro[i].evidence_depth ?? 1)) : 0
    if (base + bump + X >= cutScore) {
      cross++
      if (isNew) crossNew++
    }
  }
  console.log(`  +${X}: ${cross} cross (${crossNew} newly-joined, ${cross - crossNew} already-ad)`)
}

// Distribution of the gap to the cut for matched rows.
const gaps = allMatched
  .map((i) => {
    const base = Number(ro[i].rank_score)
    if (!Number.isFinite(base)) return null
    const bump = hasAd(ro[i]) ? 0 : bandStep(Number(ro[i].evidence_depth ?? 1))
    return cutScore - (base + bump)
  })
  .filter((g) => g !== null)
  .sort((a, b) => a - b)
const q = (p) => gaps[Math.min(gaps.length - 1, Math.floor((p / 100) * gaps.length))]
console.log(`\ngap-to-cut among matched rows: min ${gaps[0]} · p10 ${q(10)} · p25 ${q(25)} · p50 ${q(50)} · p75 ${q(75)} · max ${gaps[gaps.length - 1]}`)

// Top near-cut examples for the report.
const near = allMatched
  .filter((i) => Number.isFinite(Number(ro[i].rank_score)))
  .sort((a, b) => Number(ro[b].rank_score) - Number(ro[a].rank_score))
  .slice(0, 12)
console.log('\nhighest-scored matched rows:')
for (const i of near) {
  const r = ro[i]
  const m = matchedRows.get(i)
  console.log(
    `  ${r.rank_score}  ${r.company_display ?? r.company}  [${[...m.via].join(',')}] ` +
      `${hasAd(r) ? 'ad-token' : 'NEWLY-JOINED'} depth=${r.evidence_depth} seg=${r.segment ?? '—'} size=${r.size_band ?? '—'}`,
  )
}

// ── --emit-fixes: the missing-token record for the next re-rank ──────────────
// Seated + ranked-out rows that ARE AD members (by the S2 keys) but whose
// `source` chain lacks the `ad` token. The next list regeneration attaches the
// token (and the evidence_depth that follows) from this file instead of
// re-deriving the join.
const emitAt = process.argv.indexOf('--emit-fixes')
if (emitAt !== -1) {
  const outPath = process.argv[emitAt + 1]
  if (!outPath) throw new Error('--emit-fixes needs a path')
  const fixes = []
  const collect = (label, rows) => {
    const byPhone = new Map()
    const byNZ = new Map()
    const byDom = new Map()
    rows.forEach((r, i) => {
      const p = phone10(r.phone_e164)
      if (p) push(byPhone, p, i)
      if (r.company && r.zip5) push(byNZ, `${r.company}|${r.zip5}`, i)
      if (r.domain) push(byDom, String(r.domain).toLowerCase(), i)
    })
    const hits = new Map()
    for (const c of adCo.values()) {
      const hit = (idxs, via) => {
        for (const i of idxs ?? []) {
          if (!hits.has(i)) hits.set(i, { via: new Set(), companies: new Set(), divisions: new Set() })
          hits.get(i).via.add(via)
          hits.get(i).companies.add(c.name)
          for (const d of c.divisions) hits.get(i).divisions.add(d)
        }
      }
      for (const p of c.phones) hit(byPhone.get(p), 'phone')
      for (const z of c.zips) hit(byNZ.get(`${c.name}|${z}`), 'name+zip5')
      for (const d of c.domains) hit(byDom.get(d), 'domain')
    }
    for (const [i, m] of hits) {
      const r = rows[i]
      if (hasAd(r)) continue
      fixes.push({
        list: label,
        domain: r.domain ?? '',
        company: r.company ?? '',
        company_display: r.company_display ?? '',
        zip5: r.zip5 ?? '',
        phone_e164: r.phone_e164 ?? '',
        ad_companies: [...m.companies].join('|'),
        ad_divisions: [...m.divisions].sort().join('|'),
        match_keys: [...m.via].sort().join('|'),
      })
    }
  }
  collect('seated-v5', gen['seated-v5'])
  collect('ranked-out-v7', ro)
  const cols = ['list', 'domain', 'company', 'company_display', 'zip5', 'phone_e164', 'ad_companies', 'ad_divisions', 'match_keys']
  const cell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v))
  writeFileSync(outPath, [cols.join(','), ...fixes.map((f) => cols.map((c) => cell(f[c])).join(','))].join('\n') + '\n')
  console.log(`\nwrote ${outPath} (${fixes.length} missing-token rows)`)
}
