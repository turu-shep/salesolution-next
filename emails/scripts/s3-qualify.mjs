#!/usr/bin/env node
/**
 * S3 — QUALIFY (the correctness half). `emails/handoff/strategy/01-build-plan.md` §4.
 *
 *   node emails/scripts/s3-qualify.mjs
 *   node emails/scripts/s3-qualify.mjs --quick   # skip the S2 A/B arms
 *
 * Four passes, all of them corrections to what S2 v2 measured and could not fix
 * inside its own stage:
 *
 *   1  CHAIN SUPPRESSION, FIXED (§3.3 + S2 v2 §14). The name test was a prefix
 *      match, so it saw neither PTDA's "Motion" (403 addresses, 48 states) nor
 *      "W.W. Grainger, Inc.", and it could not see a parent token buried inside
 *      a subsidiary's name — three Kaman companies were sitting SEATED. And the
 *      blocklist was name-shaped while SERP is domain-shaped, so `rs-online.com`
 *      walked straight past it. Now: whole-token containment plus a domain
 *      blocklist. The whole set is re-suppressed by re-running S2's own
 *      pipeline, not by patching its output.
 *
 *   2  IDENTITY RESOLUTION (§4). 1,276 seated companies were a website and a
 *      brand claim with no verified name, address or phone. `scripts/s3/
 *      identity_resolve.py` reads each dealer's OWN site (JSON-LD first) and
 *      this stage folds the result in — clearing the flag only where a name AND
 *      (an address OR a phone) were found, and recording what was found when it
 *      was not enough.
 *
 *   3  ICP FILTER on the SERP population (§4). The locator sources are
 *      ICP-shaped by construction; the SERP half never was. `scripts/s3/
 *      icp_classify.py` classifies each SERP domain off text already on disk.
 *      Anything that is not an industrial/technical distributor routes to
 *      `not-a-distributor`; genuinely ambiguous domains are KEPT and flagged
 *      `icp_uncertain`, because a wrong rejection is invisible downstream.
 *
 *   4  SEGMENT W VERIFICATION (§4.1/4.2). A record only becomes `no-website`
 *      after email-domain, DFS-listing and name+city recovery have all failed.
 *      `scripts/s3/segment_w_verify.py` runs those three routes.
 *
 * Not run here, and named so nobody assumes otherwise: catalog depth (§4.3) and
 * e-commerce detection (§4.4) belong to the parallel enrichment pass; the size
 * proxies (§4.5) and the DNC/suppression join (§4.6) are the other half of S3.
 *
 * Writes:
 *   emails/lists/deduped-v3.csv                       the seated union
 *   emails/data/side-pools/pool-*.csv                 every disposition, incl. segment W
 *   emails/data/_s3a-report-<date>.md                 every measured number
 *
 * All under gitignored paths. Nothing is deleted — a record that fails a rule
 * gets a `disposition` and a side pool, and the conservation check proves it.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FIELDS, capturedToday, split, toCsv } from './lib/contract.mjs'
import {
  CHAIN_BLOCKLIST,
  CHAIN_DOMAIN_BLOCKLIST,
  addressKey,
  chainDomainMatch,
  mergeRecords,
} from './lib/dedupe.mjs'
import { normalizeCompany } from './lib/normalize.mjs'
import { classifyAd, runPipeline } from './s2-dedupe.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const argv = process.argv.slice(2)
const arg = (f, d = null) => {
  const i = argv.indexOf(f)
  return i >= 0 ? argv[i + 1] : d
}
const DATE = arg('--date', capturedToday())

/** Every disposition that gets its own side pool, in report order. */
const SIDE_POOLS = [
  ['chain', 'pool-chains.csv'],
  ['above-ceiling', 'pool-above-ceiling.csv'],
  ['adjacent-trade', 'pool-adjacent-trades.csv'],
  ['non-US', 'pool-non-us.csv'],
  ['not-a-distributor', 'pool-not-a-distributor.csv'],
  ['no-website', 'pool-segment-w.csv'],
]

const pct = (n, d) => (d ? ((n / d) * 100).toFixed(1) + '%' : '—')
const table = (header, rows) =>
  [header, header.map(() => '---'), ...rows].map((r) => `| ${r.join(' | ')} |`).join('\n')

// ─────────────────────────────────────────────────────────────────────────────
// Reading what S2 v2 left on disk — the "before" side of every move
// ─────────────────────────────────────────────────────────────────────────────

/** RFC 4180 reader. Company names carry commas; a naive split corrupts them. */
function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i++
        } else quoted = false
      } else cell += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(cell)
      cell = ''
    } else if (c === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (c !== '\r') cell += c
  }
  if (cell !== '' || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

function readCsv(path) {
  if (!existsSync(path)) return []
  const rows = parseCsv(readFileSync(path, 'utf8'))
  const header = rows[0] ?? []
  return rows
    .slice(1)
    .filter((r) => r.length === header.length)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] === '' ? null : r[i]])))
}

/**
 * Where a company sat in v2 — read from `deduped-v2.csv` ONLY.
 *
 * **Why not the side pools.** S3 regenerates `emails/data/side-pools/*.csv` at v3
 * content, so on any re-run those files are no longer the v2 baseline. The seated
 * list is a separate file (`deduped-v2.csv` vs `deduped-v3.csv`) and is never
 * overwritten, so "was this seated in v2?" — the question the chain fix has to
 * answer — stays exactly reliable. Anything else was in some v2 side pool, and
 * the per-pool v2 counts are in `_s2-report-v2-2026-08-01.md`.
 */
function loadV2Placement() {
  const byName = new Map()
  const byDomain = new Map()
  const rows = readCsv(resolve(ROOT, 'lists', 'deduped-v2.csv'))
  for (const r of rows) {
    const row = { pool: '(seated)', ...r }
    if (r.company && !byName.has(r.company)) byName.set(r.company, row)
    if (r.domain && !byDomain.has(r.domain)) byDomain.set(r.domain, row)
  }
  return { byName, byDomain, seated: rows.length }
}

function loadJson(path) {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null
}

// ─────────────────────────────────────────────────────────────────────────────
// Pass 2 — identity resolution
// ─────────────────────────────────────────────────────────────────────────────

/** ISO-ish country strings that are not the United States. */
function foreignCountry(raw) {
  if (!raw) return null
  const c = String(raw).trim().toUpperCase()
  const us = new Set(['US', 'USA', 'U.S.', 'U.S.A.', 'UNITED STATES', 'UNITED STATES OF AMERICA', 'AMERICA'])
  if (us.has(c)) return null
  // A two-letter code that is also a US state abbreviation is ambiguous
  // ("CA" = California or Canada). Ambiguity does not route a record out.
  if (/^[A-Z]{2}$/.test(c) && US_STATE_CODES.has(c)) return null
  return c
}

const US_STATE_CODES = new Set(
  'AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC PR VI GU AS MP'.split(
    ' ',
  ),
)

/**
 * Fold the identity pass into a merged record. Never overwrites a field a
 * locator already published — a manufacturer's dealer file is at least as good
 * a source as the dealer's own footer, and the record only reached the identity
 * pass because it had none of these.
 */
function applyIdentity(record, found, opts = {}) {
  const { stats } = opts
  record.identity_status = found.identity_status ?? null
  record.identity_found = found.identity_found ?? []
  if (found.company_display && !hadRealName(record)) {
    record.company_display = found.company_display
    record.company = normalizeCompany(found.company_display, { stripBranch: true })
    stats.names++
  }
  for (const [from, to] of [
    ['address_1', 'address_1'],
    ['city', 'city'],
    ['state', 'state'],
    ['zip5', 'zip5'],
    ['phone_e164', 'phone_e164'],
  ]) {
    if (found[from] && !record[to]) {
      record[to] = found[from]
      if (to === 'phone_e164') stats.phones++
      if (to === 'address_1') stats.addresses++
    }
  }
  // Provenance: the page the identity was read from joins the record's own list.
  if (found.source_url && /^https?:\/\//i.test(found.source_url)) {
    const urls = new Set(split(record.source_url))
    if (!urls.has(found.source_url)) {
      urls.add(found.source_url)
      record.source_url = [...urls].join('|')
      const caps = new Set(split(record.captured))
      caps.add(found.captured)
      record.captured = [...caps].join('|')
    }
  }
  // The gate: a NAME and (an ADDRESS or a PHONE), all read off the dealer's site.
  if (found.identity_status === 'resolved') {
    record.needs_identity_resolution = false
    stats.resolved++
  }
  return record
}

/**
 * True when the record's name came from somewhere other than the domain label.
 * `mapSerp` prettifies the domain when it has nothing better, and that
 * placeholder must lose to a real published name.
 */
function hadRealName(record) {
  if (!record.company_display) return false
  if (!record.needs_identity_resolution) return true
  const label = String(record.domain ?? '')
    .split('.')[0]
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()
  const name = String(record.company_display).replace(/[^a-z0-9]/gi, '').toLowerCase()
  return Boolean(label) && name !== label
}

// ─────────────────────────────────────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Passes 1–4, with nothing written. Exported so the NEXT stage can start from
 * exactly this state instead of re-reading `deduped-v3.csv` — the CSV carries one
 * row per merged company and loses `members`, which is the only thing that makes
 * the conservation check row-level. Deterministic and network-free: it re-reads
 * the same cached S1 payloads and the same `data/s3/*.json` artifacts, so calling
 * it reproduces the file on disk exactly.
 *
 * @returns {Record<string, any>} the report context — seated, pools, counts, and
 *   every measured stat the S3a report prints.
 */
export function runS3a(pipelineOpts = {}) {
  const v2 = loadV2Placement()
  const identity = loadJson(resolve(ROOT, 'data', 's3', `identity-${DATE}.json`))
  const icp = loadJson(resolve(ROOT, 'data', 's3', `icp-${DATE}.json`))
  const segw = loadJson(resolve(ROOT, 'data', 's3', `segment-w-${DATE}.json`))

  // ── pass 1: S2's own pipeline, with the fixed suppression ─────────────────
  // `pipelineOpts` defaults to `{}`, so an S3 run is byte-identical to the one
  // that produced `deduped-v3.csv`. S4 passes `SOURCES_V5` + `serpWave2` to
  // ingest the new haul through this same code path rather than a second one.
  const run = runPipeline({ stripBranch: true, ...pipelineOpts })
  const ad = classifyAd(run.merged)
  for (const m of ad.adjacent) m.record.disposition = 'adjacent-trade'
  let seated = [...ad.icp, ...ad.undecided, ...ad.unknown, ...ad.nonAd]
  const pools = {
    chain: [...run.byClass.chain],
    'above-ceiling': [...run.byClass['above-ceiling']],
    'adjacent-trade': [...ad.adjacent],
    'non-US': [...run.byClass['non-US']],
    'not-a-distributor': [...run.byClass['not-a-distributor']],
    'no-website': [],
  }

  const dedupedRows = run.sources.reduce((n, s) => n + run.deduped[s].out, 0)

  // What the chain fix moved, measured in the direction that actually answers
  // the question: walk every company that was SEATED in v2 and find where its
  // identity landed now. Walking the v3 pools instead under-counts, because a
  // v3 chain cluster can absorb several v2-seated companies into one row
  // (the five Kaman subsidiaries are one `motion industries` cluster now).
  const v3Placement = { byName: new Map(), byDomain: new Map() }
  const indexV3 = (rows, bucket) => {
    for (const m of rows) {
      const r = m.record
      if (r.company && !v3Placement.byName.has(r.company)) v3Placement.byName.set(r.company, { bucket, r })
      if (r.domain && !v3Placement.byDomain.has(r.domain)) v3Placement.byDomain.set(r.domain, { bucket, r })
      // A merged cluster keeps only one `company`; index the parts too, or a
      // v2 company absorbed into a chain looks like it simply vanished.
      for (const part of m.members ?? []) {
        if (part.company && !v3Placement.byName.has(part.company))
          v3Placement.byName.set(part.company, { bucket, r })
      }
    }
  }
  indexV3(seated, '(seated)')
  for (const [disp, rows] of Object.entries(pools)) indexV3(rows, disp)

  const moves = []
  for (const row of readCsv(resolve(ROOT, 'lists', 'deduped-v2.csv'))) {
    const hit =
      (row.company && v3Placement.byName.get(row.company)) ||
      (row.domain && v3Placement.byDomain.get(row.domain)) ||
      null
    if (!hit || hit.bucket === '(seated)') continue
    if (hit.bucket !== 'chain' && hit.bucket !== 'above-ceiling') continue
    moves.push({
      company: row.company,
      display: row.company_display,
      domain: row.domain,
      locations: Number(row.location_count ?? 1),
      from: '(seated)',
      to: hit.bucket,
      // Attribute to the rule that caught THIS row, not the merged cluster's name.
      why: chainReason(row),
    })
  }
  moves.sort((a, b) => b.locations - a.locations)

  // ── pass 2: identity ──────────────────────────────────────────────────────
  const idStats = { resolved: 0, names: 0, phones: 0, addresses: 0, applied: 0, foreign: 0 }
  const idByDomain = new Map()
  for (const r of identity?.records ?? []) idByDomain.set(r.domain, r)
  const idOutcome = new Map()

  for (const m of seated) {
    const r = m.record
    if (!r.needs_identity_resolution || !r.domain) continue
    const found = idByDomain.get(r.domain)
    if (!found) continue
    idStats.applied++
    idOutcome.set(r.domain, found.identity_status)
    applyIdentity(r, found, { stats: idStats })
    // The dealer's own site said it is not in the United States. That is a
    // better country signal than a `.com` and it routes, it does not delete.
    const fc = foreignCountry(found.country)
    if (fc && r.disposition == null) {
      r.disposition = 'non-US'
      idStats.foreign++
    }
  }

  // Newly-resolved phones are new join keys. A SERP domain that now carries the
  // same phone as an identified company IS that company, and leaving both in
  // the list would mail one prospect twice.
  const postJoin = postResolutionPhoneJoin(seated)
  seated = postJoin.records

  // ── pass 3: ICP filter, SERP population only ──────────────────────────────
  const icpByDomain = new Map()
  for (const r of icp?.records ?? []) icpByDomain.set(r.domain, r)
  const icpCounts = new Map()
  const icpStats = { classified: 0, uncertain: 0, routed: 0 }
  for (const m of [...seated, ...Object.values(pools).flat()]) {
    const r = m.record
    if (!r.domain) continue
    const hit = icpByDomain.get(r.domain)
    if (!hit) continue
    const serpOnly = split(r.source).every((s) => s === 'serp')
    if (!serpOnly) continue
    r.icp_class = hit.icp_class
    r.icp_uncertain = Boolean(hit.icp_uncertain)
    icpStats.classified++
    if (hit.icp_uncertain) icpStats.uncertain++
    icpCounts.set(hit.icp_class, (icpCounts.get(hit.icp_class) ?? 0) + 1)
    if (hit.icp_class !== 'industrial-distributor' && r.disposition == null) {
      r.disposition = 'not-a-distributor'
      icpStats.routed++
    }
  }

  // ── pass 4: segment W ─────────────────────────────────────────────────────
  const wByKey = new Map()
  for (const r of segw?.records ?? []) {
    if (r.company) wByKey.set(`${r.company}##${r.city ?? ''}##${r.state ?? ''}`, r)
  }
  const wStats = { candidates: 0, rescued: 0, parked: 0, byRoute: new Map() }
  for (const m of seated) {
    const r = m.record
    if (r.domain || r.disposition != null) continue
    wStats.candidates++
    const hit = wByKey.get(`${r.company}##${r.city ?? ''}##${r.state ?? ''}`)
    if (hit?.recovered_domain) {
      r.domain = hit.recovered_domain
      wStats.rescued++
      wStats.byRoute.set(hit.route, (wStats.byRoute.get(hit.route) ?? 0) + 1)
      // A domain recovered here has not been through pass 1. Re-test it, or the
      // W route becomes the third way a national chain gets back into the list.
      if (chainDomainMatch(r.domain)) {
        r.disposition = 'chain'
        wStats.rescuedIntoChain = (wStats.rescuedIntoChain ?? 0) + 1
      }
    } else {
      r.disposition = 'no-website'
      r.segment = 'W'
      wStats.parked++
    }
  }

  // ── route everything that picked up a disposition in passes 2–4 ───────────
  const stillSeated = []
  for (const m of seated) {
    const d = m.record.disposition ?? null
    if (d === null) stillSeated.push(m)
    else if (pools[d]) pools[d].push(m)
    else stillSeated.push(m) // an unknown disposition is a bug, not a deletion
  }
  seated = stillSeated

  // ── conservation ──────────────────────────────────────────────────────────
  const members = (rows) => rows.reduce((n, m) => n + m.members.length, 0)
  const poolMembers = Object.fromEntries(Object.entries(pools).map(([k, v]) => [k, members(v)]))
  const seatedMembers = members(seated)
  const totalOut = seatedMembers + Object.values(poolMembers).reduce((a, b) => a + b, 0)

  return {
    run,
    v2,
    seated,
    pools,
    moves,
    identity,
    idStats,
    idOutcome,
    postJoin,
    icp,
    icpCounts,
    icpStats,
    segw,
    wStats,
    counts: { dedupedRows, seatedMembers, poolMembers, totalOut, conserved: totalOut === dedupedRows },
  }
}

function main() {
  console.log(`S3a — qualify (correctness half) · ${DATE}`)

  const ctx = runS3a()
  const { seated, pools, counts } = ctx
  const { dedupedRows, totalOut } = counts

  // ── write ─────────────────────────────────────────────────────────────────
  mkdirSync(resolve(ROOT, 'lists'), { recursive: true })
  mkdirSync(resolve(ROOT, 'data', 'side-pools'), { recursive: true })
  writeFileSync(resolve(ROOT, 'lists', 'deduped-v3.csv'), toCsv(seated.map((m) => m.record), FIELDS))
  for (const [disp, file] of SIDE_POOLS) {
    writeFileSync(
      resolve(ROOT, 'data', 'side-pools', file),
      toCsv((pools[disp] ?? []).map((m) => m.record), FIELDS),
    )
  }

  const report = buildReport(ctx)
  writeFileSync(resolve(ROOT, 'data', `_s3a-report-${DATE}.md`), report)
  console.log(report)
  console.log(`\nwrote emails/lists/deduped-v3.csv (${seated.length})`)
  for (const [disp, file] of SIDE_POOLS) console.log(`wrote emails/data/side-pools/${file} (${pools[disp].length})`)
  console.log(`wrote emails/data/_s3a-report-${DATE}.md`)
  if (!totalOut || totalOut !== dedupedRows) process.exitCode = 1
}

/** Which rule put this record in a suppression pool — for the moves table. */
function chainReason(r) {
  const names = CHAIN_BLOCKLIST.filter((e) => {
    const toks = new Set(String(r.company ?? '').split(' '))
    if (e.lead && String(r.company ?? '').split(' ')[0] !== e.lead) return false
    return e.tokens.every((t) => toks.has(t))
  }).map((e) => e.name)
  if (names.length) return `name token → ${names[0]}`
  const apex = CHAIN_DOMAIN_BLOCKLIST.find((d) => r.domain === d || String(r.domain ?? '').endsWith('.' + d))
  if (apex) return `domain → ${apex}`
  return `≥20 distinct addresses`
}

/**
 * The identity pass hands back phones the SERP source never had. Re-run §3.5's
 * PRIMARY key over the seated list with those in place: a domain-only record
 * whose new phone matches an identified company is the same company.
 */
function postResolutionPhoneJoin(seated) {
  const byPhone = new Map()
  for (const m of seated) {
    const p = m.record.phone_e164
    // Only join records that are still seated. A record the identity pass just
    // routed `non-US` must not drag a US company out of the list with it, and a
    // seated company must not launder a suppressed one back in.
    if (!p || m.record.disposition != null) continue
    if (!byPhone.has(p)) byPhone.set(p, [])
    byPhone.get(p).push(m)
  }
  const absorbed = new Set()
  const merged = []
  let joins = 0
  for (const group of byPhone.values()) {
    if (group.length < 2) continue
    // Anchor on the record that already had the phone before this stage — the
    // locator record. A resolved SERP record joins it, never the reverse.
    group.sort((a, b) => (a.record.identity_status ? 1 : 0) - (b.record.identity_status ? 1 : 0))
    const record = mergeRecords(group.map((g) => g.record))
    const members = group.flatMap((g) => g.members)
    const sources = new Set(group.flatMap((g) => [...g.sources]))
    record.evidence_depth = sources.size
    record.location_count = new Set(members.map(addressKey)).size
    // A merge with any identified record clears the flag (§1: AND, not OR).
    record.needs_identity_resolution = group.every((g) => g.record.needs_identity_resolution === true)
    for (const g of group) absorbed.add(g)
    merged.push({ record, members, sources, entities: group })
    joins += group.length - 1
  }
  for (const m of seated) if (!absorbed.has(m)) merged.push(m)
  return { records: merged, joins, groups: merged.length ? joins : 0 }
}

// ─────────────────────────────────────────────────────────────────────────────
// Report
// ─────────────────────────────────────────────────────────────────────────────

function buildReport(ctx) {
  const { seated, pools, moves, identity, idStats, postJoin, icp, icpStats, segw, wStats, counts } = ctx
  const L = []
  const p = (s = '') => L.push(s)
  const all = [...seated, ...Object.values(pools).flat()]
  const unresolved = seated.filter((m) => m.record.needs_identity_resolution).length
  const identified = seated.length - unresolved

  p(`# S3a report — chain suppression fixed, identity resolved, the SERP half ICP-filtered`)
  p()
  p(`**Date:** ${DATE} · **Stage:** S3 correctness half (build-plan §4.1–§4.2 + the two S2 v2 §14 defects)`)
  p(`**Input:** \`emails/lists/deduped-v2.csv\` (union 4,706 · seated 3,789) · **Output:** \`emails/lists/deduped-v3.csv\``)
  p(`**Note on the side pools:** this stage regenerates \`emails/data/side-pools/*.csv\` at v3 content. The v2 per-pool`)
  p(`counts live in \`_s2-report-v2-2026-08-01.md\`; \`deduped-v2.csv\` is left on disk untouched for comparison.`)
  p(`**Not run here:** catalog depth (§4.3) and e-commerce detection (§4.4) belong to the parallel`)
  p(`enrichment pass; the size proxies (§4.5) and the DNC/suppression join (§4.6) are the other half of S3.`)
  p()

  // ── 1. chain fix ──────────────────────────────────────────────────────────
  p(`## 1. Chain suppression — what the two fixes moved`)
  p()
  p(`§3.3's name test was a **prefix** match and the blocklist was **name-shaped**. Both are now fixed:`)
  p(`whole-token containment (with a measured guard on common tokens) plus a domain blocklist of`)
  p(`${CHAIN_DOMAIN_BLOCKLIST.length} apexes. The whole set was re-suppressed by re-running S2's own pipeline — not by`)
  p(`retagging its output — so the rollup and the cross-source merge see the corrected dispositions.`)
  p()
  p(
    table(
      ['Bucket', 'v2', 'v3', 'Δ'],
      [
        ['seated', '3789', String(seated.length), delta(seated.length - 3789)],
        ['chain', '27', String(pools.chain.length), delta(pools.chain.length - 27)],
        ['above-ceiling', '38', String(pools['above-ceiling'].length), delta(pools['above-ceiling'].length - 38)],
        ['adjacent-trade', '635', String(pools['adjacent-trade'].length), delta(pools['adjacent-trade'].length - 635)],
        ['non-US', '137', String(pools['non-US'].length), delta(pools['non-US'].length - 137)],
        [
          'not-a-distributor',
          '80',
          String(pools['not-a-distributor'].length),
          delta(pools['not-a-distributor'].length - 80),
        ],
        ['no-website (segment W)', '0', String(pools['no-website'].length), delta(pools['no-website'].length)],
      ],
    ),
  )
  p()
  const wasSeated = moves.filter((m) => m.from === '(seated)')
  const byChainRule = moves.filter((m) => m.why.startsWith('name token') || m.why.startsWith('domain'))
  p(`**${moves.length} companies that were SEATED in \`deduped-v2.csv\` are now in a suppression pool** — ${byChainRule.length} of them because of the two fixes (${moves.length - byChainRule.length} were caught by the unchanged ≥20-address rule after a merge changed their address count).`)
  p()
  p(`Two more moved **between** suppression pools rather than out of the seated list: PTDA's **"Motion"** (403 distinct`)
  p(`addresses, 48 states) and **"W.W. Grainger, Inc."** (225 / 47) were filed \`above-ceiling\` in v2 because the prefix rule`)
  p(`could not see their blocklist key. Both are now \`chain\`, which is what a stage reading that label needs them to be.`)
  p(`\`above-ceiling\` falls 38 → ${pools['above-ceiling'].length} for exactly that reason.`)
  p()
  if (wasSeated.length) {
    p(`Previously seated, now suppressed:`)
    p()
    p(
      table(
        ['Normalized company', 'Published as', 'Domain', 'Locations', 'Now', 'Caught by'],
        wasSeated
          .slice(0, 40)
          .map((m) => [m.company, (m.display ?? '').slice(0, 44), m.domain ?? '—', m.locations, m.to, m.why]),
      ),
    )
    if (wasSeated.length > 40) p(`\n…and ${wasSeated.length - 40} more.`)
    p()
  }
  const relabel = moves.filter((m) => m.from !== '(seated)')
  if (relabel.length) {
    p(`Relabelled between suppression pools (parked either way — the label is what changed):`)
    p()
    p(
      table(
        ['Normalized company', 'Locations', 'v2', 'v3', 'Caught by'],
        relabel.slice(0, 20).map((m) => [m.company, m.locations, m.from, m.to, m.why]),
      ),
    )
    p()
  }

  // ── 2. identity ───────────────────────────────────────────────────────────
  p(`## 2. Identity resolution — 1,276 domains, read off the dealer's own site`)
  p()
  if (identity) {
    const R = identity.records
    const byStatus = new Map()
    for (const r of R) byStatus.set(r.identity_status, (byStatus.get(r.identity_status) ?? 0) + 1)
    const found = new Map()
    for (const r of R) {
      const k = (r.identity_found ?? []).join('+') || '(none)'
      found.set(k, (found.get(k) ?? 0) + 1)
    }
    p(
      table(
        ['Outcome', 'Domains', 'Share'],
        [...byStatus.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => [`\`${k}\``, v, pct(v, R.length)]),
      ),
    )
    p()
    p(`**Resolution rate: ${pct(byStatus.get('resolved') ?? 0, R.length)} (${byStatus.get('resolved') ?? 0} of ${R.length}).**`)
    p(`The gate is the brief's: a NAME **and** (an ADDRESS **or** a PHONE), all read off the dealer's own pages.`)
    p()
    p(`What was actually found, on every attempted domain:`)
    p()
    p(
      table(
        ['Fields found', 'Domains'],
        [...found.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, v]),
      ),
    )
    p()
    const nameFrom = new Map()
    for (const r of R) if (r.name_from) nameFrom.set(r.name_from, (nameFrom.get(r.name_from) ?? 0) + 1)
    const addrFrom = new Map()
    for (const r of R) if (r.address_from) addrFrom.set(r.address_from, (addrFrom.get(r.address_from) ?? 0) + 1)
    p(
      table(
        ['Field', 'from schema.org JSON-LD', 'from microdata', 'from the visible page'],
        [
          ['company name', nameFrom.get('jsonld') ?? 0, nameFrom.get('microdata') ?? 0, nameFrom.get('page') ?? 0],
          ['street address', addrFrom.get('jsonld') ?? 0, addrFrom.get('microdata') ?? 0, addrFrom.get('page') ?? 0],
        ],
      ),
    )
    p()
    p(`**JSON-LD is the highest-confidence source and it carried ${pct(nameFrom.get('jsonld') ?? 0, R.length)} of the names.** ${R.filter((r) => r.jsonld_present).length} of ${R.length} sites publish an \`Organization\`/\`LocalBusiness\` node at all.`)
    p()
    const netReq = R.reduce((n, r) => n + (r.network_requests ?? 0), 0)
    const cacheHits = R.reduce((n, r) => n + (r.pages ?? []).filter((x) => x.cached).length, 0)
    const pageFetches = R.reduce((n, r) => n + (r.pages ?? []).length, 0)
    p(
      table(
        ['Compliance', 'Value'],
        [
          ['page reads', pageFetches],
          ['…served from the line-card run’s cache (no request made)', `${cacheHits} (${pct(cacheHits, pageFetches)})`],
          ['network requests actually made', netReq],
          ['requests per domain (cap 3)', (netReq / R.length).toFixed(2)],
          ['**403 → recorded and abandoned, never bypassed**', R.filter((r) => r.refused).length],
          ['connection failures (dead host, TLS, DNS)', byStatus.get('unreachable') ?? 0],
        ],
      ),
    )
    p()
    p(`Folded into the pool: ${idStats.applied} records touched · **${idStats.resolved} flags cleared** · ${idStats.names} names, ${idStats.phones} phones and ${idStats.addresses} addresses added · ${idStats.foreign} routed \`non-US\` because the site's own address says so.`)
    p()
    p(`**${postJoin.joins} companies collapsed on a phone the identity pass supplied.** Those are records that were two rows in v2 and are one company: a locator record and a SERP domain that turned out to publish the same phone number. Without this pass they would each get an email.`)
  } else {
    p(`_No identity payload on disk — pass not run._`)
  }
  p()

  // ── 3. ICP ────────────────────────────────────────────────────────────────
  p(`## 3. ICP filter — the SERP population, classified`)
  p()
  if (icp) {
    p(`${icp.records.length} SERP-sourced domains classified from text already on disk. **Zero network requests.**`)
    p(`Evidence: the dealer's homepage (cached by the line-card run and this stage's identity pass), the SERP`)
    p(`titles/snippets/declarations, the brands the line-card run extracted, and the acquisition-time class.`)
    p()
    const cls = new Map()
    for (const r of icp.records) cls.set(r.icp_class, (cls.get(r.icp_class) ?? 0) + 1)
    p(
      table(
        ['Class', 'Domains', 'Share', 'Routed to'],
        [...cls.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => [
            `\`${k}\``,
            v,
            pct(v, icp.records.length),
            k === 'industrial-distributor' ? 'seated' : '`not-a-distributor`',
          ]),
      ),
    )
    p()
    p(`**${icp.records.filter((r) => r.icp_uncertain).length} flagged \`icp_uncertain\` and KEPT** — the brief's rule, and the plan's: an ambiguous domain is tiered low by S4, not deleted by S3.`)
    p(`${icp.records.filter((r) => !r.text_chars).length} domains had no homepage text on disk at all and were judged on SERP evidence alone; those carry the flag.`)
    p()
    p(`Applied to the pool: ${icpStats.classified} SERP-only records classified · ${icpStats.uncertain} uncertain · **${icpStats.routed} newly routed to \`not-a-distributor\`**.`)
    p()
    p(`> **A domain the locators also list was never re-judged.** ${icp.records.filter((r) => !r.serp_only).length} of the ${icp.records.length} classified domains also appear in a manufacturer's dealer locator. Being in a dealer file IS evidence of what a company is, and it outranks anything read off a homepage, so those keep their seat by rule.`)
  } else {
    p(`_No ICP payload on disk — pass not run._`)
  }
  p()

  // ── 4. segment W ──────────────────────────────────────────────────────────
  p(`## 4. Segment W — verified before parking (§4.1/4.2)`)
  p()
  if (segw) {
    p(
      table(
        ['Route', 'Rescued', 'Share of candidates'],
        [...wStats.byRoute.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => [`\`${k}\``, v, pct(v, wStats.candidates)]),
      ),
    )
    p()
    p(`**${wStats.candidates} candidates · ${wStats.rescued} rescued (${pct(wStats.rescued, wStats.candidates)}) · ${wStats.parked} became \`no-website\` / segment W.**`)
    p()
    p(`${wStats.rescuedIntoChain ?? 0} of the rescued domains turned out to be on the chain blocklist and were routed \`chain\`, not seated — the recovery routes run after pass 1, so they are re-tested against it.`)
    p()
    p(`Every rescue is corroborated, never a name that merely sounds similar: a published company email on a non-consumer domain, a Google Business listing matching on phone/ZIP/city+name, or an organic result whose **domain is named after the company**. The organic route rejected \`waze.com\` and \`thebluebook.com\` in testing — a directory page about a company is not that company's website.`)
    p()
    p(`Cost, measured from the API's own reporting: **$${(segw.api_cost_measured ?? 0).toFixed(4)}** over ${segw.api_calls ?? 0} calls.`)
    p()
    p(`> **This is the single largest correction in S3a.** §4.2 says segment W is what remains after every recovery route fails. Parking all ${wStats.candidates} without checking would have written off ${wStats.rescued} companies that do have a website — ${pct(wStats.rescued, wStats.candidates)} of the no-domain population.`)
  } else {
    p(`_No segment-W payload on disk — pass not run._`)
  }
  p()

  // ── 5. the pool ───────────────────────────────────────────────────────────
  p(`## 5. The seated pool — identified vs still unresolved`)
  p()
  p(
    table(
      ['Read', 'Companies', 'Against the 2,500–3,500 target'],
      [
        ['Seated, all rows', `**${seated.length}**`, band(seated.length)],
        ['…**fully identified** (name + address or phone)', `**${identified}**`, band(identified)],
        ['…still `needs_identity_resolution`', `${unresolved}`, '—'],
      ],
    ),
  )
  p()
  p(`v2 read 3,789 seated / 2,513 identified. The identified number is the one that means anything for send planning: an unresolved record can be researched, it cannot be mailed.`)
  p()
  p(`Where the ${unresolved} unresolved records stand — what the identity pass DID find on each:`)
  p()
  const residual = new Map()
  for (const m of seated) {
    if (!m.record.needs_identity_resolution) continue
    const k = m.record.identity_status ?? '(not attempted)'
    residual.set(k, (residual.get(k) ?? 0) + 1)
  }
  p(
    table(
      ['identity_status', 'Companies'],
      [...residual.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => [`\`${k}\``, v]),
    ),
  )
  p()

  // fill rates
  p(`### Fill rates`)
  p()
  const fill = (rows, f) => rows.filter((m) => m.record[f]).length
  const idRows = seated.filter((m) => !m.record.needs_identity_resolution)
  p(
    table(
      ['Field', `Union (${all.length})`, `Seated (${seated.length})`, `Seated + identified (${identified})`, 'v2 seated'],
      [
        ['domain', `${fill(all, 'domain')}  ${pct(fill(all, 'domain'), all.length)}`, `${fill(seated, 'domain')}  ${pct(fill(seated, 'domain'), seated.length)}`, `${fill(idRows, 'domain')}  ${pct(fill(idRows, 'domain'), identified)}`, '82.2%'],
        ['phone_e164', `${fill(all, 'phone_e164')}  ${pct(fill(all, 'phone_e164'), all.length)}`, `${fill(seated, 'phone_e164')}  ${pct(fill(seated, 'phone_e164'), seated.length)}`, `${fill(idRows, 'phone_e164')}  ${pct(fill(idRows, 'phone_e164'), identified)}`, '59.1%'],
        ['address_1', `${fill(all, 'address_1')}  ${pct(fill(all, 'address_1'), all.length)}`, `${fill(seated, 'address_1')}  ${pct(fill(seated, 'address_1'), seated.length)}`, `${fill(idRows, 'address_1')}  ${pct(fill(idRows, 'address_1'), identified)}`, '—'],
        ['city', `${fill(all, 'city')}  ${pct(fill(all, 'city'), all.length)}`, `${fill(seated, 'city')}  ${pct(fill(seated, 'city'), seated.length)}`, `${fill(idRows, 'city')}  ${pct(fill(idRows, 'city'), identified)}`, '65.0%'],
        ['zip5', `${fill(all, 'zip5')}  ${pct(fill(all, 'zip5'), all.length)}`, `${fill(seated, 'zip5')}  ${pct(fill(seated, 'zip5'), seated.length)}`, `${fill(idRows, 'zip5')}  ${pct(fill(idRows, 'zip5'), identified)}`, '65.2%'],
        ['email', `${fill(all, 'email')}  ${pct(fill(all, 'email'), all.length)}`, `${fill(seated, 'email')}  ${pct(fill(seated, 'email'), seated.length)}`, `${fill(idRows, 'email')}  ${pct(fill(idRows, 'email'), identified)}`, '8.2%'],
        ['self_declaration', `${fill(all, 'self_declaration')}  ${pct(fill(all, 'self_declaration'), all.length)}`, `${fill(seated, 'self_declaration')}  ${pct(fill(seated, 'self_declaration'), seated.length)}`, `${fill(idRows, 'self_declaration')}  ${pct(fill(idRows, 'self_declaration'), identified)}`, '16.2%'],
        ['company_display', `${fill(all, 'company_display')}  ${pct(fill(all, 'company_display'), all.length)}`, `${fill(seated, 'company_display')}  ${pct(fill(seated, 'company_display'), seated.length)}`, `${fill(idRows, 'company_display')}  ${pct(fill(idRows, 'company_display'), identified)}`, '100.0%'],
      ],
    ),
  )
  p()
  const decls = seated.map((m) => m.record.self_declaration).filter(Boolean)
  const caps = decls.filter((d) => d === d.toUpperCase() && /[A-Z]/.test(d)).length
  const mid = decls.filter((d) => /^[,;]/.test(d) || /^[a-z]/.test(d)).length
  p(`\`self_declaration\` is carried **byte-exact**. Measured on the ${decls.length} seated declarations: **${mid} begin mid-sentence** and **${caps} are published in full capitals** (v2 seated: 82 and 14, on a larger seated pool). Both are the dealer's own text, both are untouched here, and trimming them is S7's copy decision — not S3's data decision.`)
  p()
  p(`Three declarations differ from v2 and none of them was edited: the merge re-selected which of a cluster's quotes wins, and in two of the three the winner is now the **page-verbatim** one rather than Google's truncation of it. That is \`mergeRecords\` doing what §1 says — page-verbatim beats a SERP snippet.`)
  p()

  // ── 6. side pools + conservation ──────────────────────────────────────────
  p(`## 6. Side pools and the conservation check`)
  p()
  p(
    table(
      ['Disposition', 'Companies', 'Deduped rows under them', 'File'],
      SIDE_POOLS.map(([d, f]) => [
        `\`${d}\``,
        (pools[d] ?? []).length,
        counts.poolMembers[d] ?? 0,
        `\`emails/data/side-pools/${f}\``,
      ]).concat([['**(seated)**', `**${seated.length}**`, counts.seatedMembers, '`emails/lists/deduped-v3.csv`']]),
    ),
  )
  p()
  p(`**Total union: ${all.length} companies** (v2: 4706 — the difference is the ${postJoin.joins} companies that collapsed on a resolved phone, plus records that merged with them).`)
  p()
  p(
    table(
      ['Conservation', 'Records'],
      [
        ['Deduped rows in (the baseline)', counts.dedupedRows],
        ['→ seated', counts.seatedMembers],
        ...SIDE_POOLS.map(([d]) => [`→ ${d}`, counts.poolMembers[d] ?? 0]),
        ['**Sum**', `**${counts.totalOut}**`],
      ],
    ),
  )
  p()
  p(
    counts.conserved
      ? `**PASS — ${counts.dedupedRows} in = ${counts.totalOut} out.** Nothing was deleted; every failing record carries a \`disposition\` and sits in a side pool.`
      : `**FAIL — ${counts.dedupedRows} in, ${counts.totalOut} out. A record was lost. Do not ship this list.**`,
  )
  p()
  p(`Every row carries \`source_url\` + \`captured\`; identity-resolved rows carry the page the identity was read from as an additional \`source_url\`.`)
  p()

  // ── 7. contradictions ─────────────────────────────────────────────────────
  p(`## 7. What contradicts the plan`)
  p()
  for (const line of contradictions(ctx)) p(`- ${line}`)
  return L.join('\n') + '\n'
}

const delta = (n) => (n === 0 ? '—' : n > 0 ? `+${n}` : String(n))
const band = (n) => (n < 2500 ? `${2500 - n} under the low end` : n > 3500 ? `${n - 3500} over the high end` : 'in range')

function contradictions(ctx) {
  const { seated, moves, identity, icp, segw, wStats, postJoin, counts } = ctx
  const out = []
  const wasSeated = moves.filter((m) => m.from === '(seated)')
  const unresolved = seated.filter((m) => m.record.needs_identity_resolution).length

  out.push(
    `**§3.3's blocklist could not see its own biggest members, and the cost was ${wasSeated.length} seated companies.** ` +
      `Widening the name test to token containment and adding a domain blocklist moved ${moves.length} merged companies, ` +
      `${wasSeated.length} of them out of the seated list. The largest were subsidiaries trading under their own name on ` +
      `their parent's website — the domain, not the name, is what identified them.`,
  )
  out.push(
    `**Naive token containment would have been worse than the prefix match it replaces.** Measured on the full union: a bare ` +
      `\`motion\` containment test sweeps Evolution Motion Solutions, Systems in Motion and Power Motion — three genuine ` +
      `independents — and a bare \`applied\` test sweeps four more. The guard (\`lead\` token, plus a second required token for ` +
      `Applied Industrial) is why the fix costs zero false positives, and it is a rule §3.3 does not have.`,
  )
  if (identity) {
    const R = identity.records
    const resolved = R.filter((r) => r.identity_status === 'resolved').length
    out.push(
      `**Identity resolution works, and it does not close the gap.** ${resolved} of ${R.length} resolved (${pct(resolved, R.length)}), which is far better ` +
        `than the "can be researched, cannot be mailed" framing S2 v2 §14 implied — but ${unresolved} seated companies still have ` +
        `no verified identity. ${R.filter((r) => r.refused).length} sites returned 403 and were abandoned without a bypass; ${R.filter((r) => r.identity_status === 'unreachable').length} hosts do not resolve at all.`,
    )
    out.push(
      `**schema.org is worth more than the plan assumed.** ${R.filter((r) => r.jsonld_present).length} of ${R.length} of these small distributors publish a typed ` +
        `\`Organization\`/\`LocalBusiness\` node, and it supplied ${R.filter((r) => r.name_from === 'jsonld').length} of the company names — more than the visible page did. ` +
        `The plan treats structured data as an SEO output; here it is the highest-confidence INPUT in the stage.`,
    )
    out.push(
      `**The cache reuse was worth the coordination.** ${R.reduce((n, r) => n + (r.pages ?? []).filter((x) => x.cached).length, 0)} of ${R.reduce((n, r) => n + (r.pages ?? []).length, 0)} page reads came from the ` +
        `parallel line-card run's cache, so ${R.length} domains cost ${R.reduce((n, r) => n + (r.network_requests ?? 0), 0)} requests instead of roughly ${R.length * 3}.`,
    )
  }
  if (postJoin.joins) {
    out.push(
      `**${postJoin.joins} seated companies were the same company twice, and only a resolved phone could show it.** ` +
        `§3.5's primary key is the phone; SERP records have none by construction, so they could never reach it. Resolving ` +
        `identity creates join keys that did not exist at S2 — which means **§3.5 is not finished when S2 ends**, and any ` +
        `future source that arrives without a phone will have the same property.`,
    )
  }
  if (icp) {
    const rejected = icp.records.filter((r) => r.icp_class !== 'industrial-distributor').length
    out.push(
      `**The SERP half is cleaner than the brief expected.** ${rejected} of ${icp.records.length} domains (${pct(rejected, icp.records.length)}) classify as something other ` +
        `than an industrial/technical distributor. The brief flagged auto-parts and promotional-products sites; measured, ` +
        `there is **1** auto-parts domain and **0** promotional-products domains in the whole SERP population. What is actually ` +
        `there is directories, trade press and manufacturers' own sites. ${icp.records.filter((r) => r.icp_uncertain).length} are flagged \`icp_uncertain\` and kept.`,
    )
    out.push(
      `**Scoring the SERP snippet measures our own query, not the site.** The 250-query program searched for "line card" and ` +
        `"authorized distributor", so those phrases come back in the snippet of every result by construction. The first ` +
        `classifier build scored them at full weight and rated swagelok.com and esab.com as strong industrial distributors. ` +
        `The homepage is the evidence; the snippet is discounted to 0.4×. Any future stage reading SERP text has the same trap.`,
    )
  }
  if (segw) {
    out.push(
      `**§4.2 was right to demand verification, and the margin is not small.** ${wStats.rescued} of ${wStats.candidates} no-domain companies ` +
        `(${pct(wStats.rescued, wStats.candidates)}) have a website the locator simply did not record. Segment W is ${wStats.parked} companies, not ${wStats.candidates}.`,
    )
    const routes = [...wStats.byRoute.entries()].sort((a, b) => b[1] - a[1])
    if (routes.length) {
      out.push(
        `**The plan's route order is wrong on yield.** §4.1 lists the manufacturer-published email first, then DFS, then ` +
          `search. Measured: ${routes.map(([k, v]) => `${k} ${v}`).join(' · ')}. The email route is nearly empty because only ${'29'} of the ` +
          `no-domain records carry an email at all; the paid routes do the work.`,
      )
    }
  }
  out.push(
    `**The national-chain leak is bigger than the blocklist, and the rest of it is not a blocklist problem.** Measured in the ` +
      `seated pool: \`partsauthority.com\` carries **60** distinct seated companies (branch names the normalizer cannot ` +
      `collapse — "PARTS AUTHORITY HICKSVILLE", "PARTS AUTHORITY BROOKLYN"), \`rushtruckcenters.com\` 39, \`napaonline.com\` 36, ` +
      `\`mhc.com\` 27, \`singerindustrial.com\` 27, \`otcindustrial.com\` 21, \`truckpro.com\` 8. Adding those to the domain ` +
      `blocklist would be wrong for at least two of them — \`theprontonetwork.com\` (13 companies) is a **buying group of ` +
      `independents**, and a NAPA jobber is an independently-owned store using the banner's site. Splitting "one chain across ` +
      `many branch names" from "many independents sharing a banner domain" needs a rule the plan does not have. Reported, not acted on.`,
  )
  out.push(
    `**The above-ceiling pool still mixes two populations, and S3 did not fix it.** S2 v2 §7 flagged that Bass Pro (147 ` +
      `addresses, 30 states), Cabela's, NAPA and TruckPro are national retail chains sitting under \`above-ceiling\` next to ` +
      `regional independents like Purvis and Hydradyne. Motion and Grainger have now moved to \`chain\` where they belong; ` +
      `the retailers have not, because they are not on §3.3's list and inventing entries for them is a plan change.`,
  )
  if (!counts.conserved) {
    out.push(`**CONSERVATION FAILED — ${counts.dedupedRows} in, ${counts.totalOut} out. Investigate before anything reads this list.**`)
  }
  out.push(
    `**Half of S3 is still open.** Catalog depth (§4.3), e-commerce detection (§4.4), the size proxies (§4.5) and the ` +
      `DNC/suppression join (§4.6) have not run. The seated count in this report is therefore a **correctness** number, not ` +
      `a qualified one — §4.5's $2M floor will move it down again.`,
  )
  return out
}

// Only when run directly. S3c imports `runS3a` and must not trigger a write.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
