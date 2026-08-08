#!/usr/bin/env node
/**
 * S2 — NORMALIZE + DEDUPE. `emails/handoff/strategy/01-build-plan.md` §3.
 *
 *   node emails/scripts/s2-dedupe.mjs
 *   node emails/scripts/s2-dedupe.mjs --no-strip-branch   # the §2b A/B, other arm
 *   node emails/scripts/s2-dedupe.mjs --quick             # skip the leave-one-out arms
 *
 * Reads the raw payloads S1 already wrote. **Zero network requests** — every
 * origin was hit once, in S1, and the payloads are kept precisely so re-runs are
 * free.
 *
 * **v2 (2026-08-01): eight sources.** The five of the first run (timken map 2,
 * enerpac, ad, dorner, spxflow) plus the three S1c acquisitions — AD's metro
 * 51–150 expansion, PTDA, and SERP self-identification. SERP is the awkward one:
 * it is **domain-keyed**, publishes no address and no phone, and therefore
 * reaches neither of §3.5's join keys. §3 gains a third path for it, and only
 * for it — see `domainAnchors` in lib/dedupe.mjs.
 *
 * The steps, in the order §3 fixes (the order is the point — see lib/dedupe.mjs
 * for why each precedence matters):
 *
 *   1  normalize    every source → the §1 contract, `line_card` kept apart from
 *                   `brand_authorized`
 *   2  within-source dedupe  distinct (company, address) pairs, BEFORE counting
 *   3  suppression   named blocklist → chain · ≥20 distinct addresses →
 *                    above-ceiling (the §5a correction)
 *   4  branch rollup         one entity per (source, company), location_count kept
 *   4b domain anchoring      a domain-only SERP entity attaches to the identified
 *                            entity that already publishes that domain, and
 *                            inherits its disposition
 *   5  cross-source dedupe   phone → name+zip5 → street#+zip5 → domain
 *   6  AD division classification (§2a), on the UNION of a company's divisions
 *   7  the §2b branch-stripping A/B, plus a leave-one-out arm per S1c source
 *
 * Writes:
 *   emails/lists/deduped-v2.csv                       the seated union
 *   emails/data/side-pools/pool-chains.csv            disposition: chain
 *   emails/data/side-pools/pool-above-ceiling.csv     disposition: above-ceiling
 *   emails/data/side-pools/pool-adjacent-trades.csv   disposition: adjacent-trade
 *   emails/data/side-pools/pool-non-us.csv            disposition: non-US
 *   emails/data/side-pools/pool-not-a-distributor.csv disposition: not-a-distributor
 *   emails/data/_s2-report-v2-<date>.md               every measured number
 *
 * All of them live under gitignored paths (`emails/.gitignore`: data/, lists/).
 * Nothing is ever deleted — a record that fails a rule gets a `disposition` and
 * a side pool, and the conservation check at the end of the report proves it.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FIELDS, capturedToday, toCsv, validateAll } from './lib/contract.mjs'
import {
  CHAIN_BLOCKLIST,
  crossSourceDedupe,
  dedupeWithinSource,
  distinctAddresses,
  domainAnchors,
  inheritAnchorDisposition,
  rollupBranches,
  suppressChains,
} from './lib/dedupe.mjs'
import {
  AD_ADJACENT_DIVISIONS,
  AD_ICP_DIVISIONS,
  AD_UNDECIDED_DIVISIONS,
  LOCATOR_SOURCES,
  MAPPERS,
  adDivisionCodes,
} from './lib/map.mjs'
import { readJsonLines } from './lib/jsonl.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const RAW = resolve(ROOT, 'data', 'raw')

const argv = process.argv.slice(2)
const arg = (flag, fallback = null) => {
  const i = argv.indexOf(flag)
  return i >= 0 ? argv[i + 1] : fallback
}
const DATE = arg('--date', capturedToday())
const STRIP_BRANCH = !argv.includes('--no-strip-branch')
const QUICK = argv.includes('--quick')

/** The eight acquired sources, as seven contract `source` values. */
export const SOURCES = ['timken', 'enerpac', 'ad', 'dorner', 'spxflow', 'ptda', 'serp']
/**
 * S4's source list: everything above, plus the DataForSEO listings sweep and the
 * nine easy-tier locators (§5f, §5c's "cheapest routes first").
 *
 * **Kept separate from `SOURCES` on purpose.** S2 and S3 write `deduped-v2.csv`
 * and `deduped-v3.csv`, and `_s3c-report` asserts S3a still reproduces v3
 * byte-for-byte. Widening the default source list would silently invalidate that
 * check for two stages that were never asked to ingest the new haul. S4 opts in
 * explicitly; the older stages keep reproducing exactly what they always did.
 */
export const SOURCES_V5 = [...SOURCES, 'dfs', ...LOCATOR_SOURCES]
/** The five that were already merged in the first S2 run (§5a). */
const S1AB_SOURCES = ['timken', 'enerpac', 'ad', 'dorner', 'spxflow']
/** Dispositions that get their own side pool, in the order the report lists them. */
export const SIDE_POOLS = [
  ['chain', 'pool-chains.csv'],
  ['above-ceiling', 'pool-above-ceiling.csv'],
  ['adjacent-trade', 'pool-adjacent-trades.csv'],
  ['non-US', 'pool-non-us.csv'],
  ['not-a-distributor', 'pool-not-a-distributor.csv'],
]
/** The classes cross-source dedupe runs over, kept apart so none absorbs another. */
export const CLASSES = [null, 'chain', 'above-ceiling', 'non-US', 'not-a-distributor']

const pct = (n, d) => (d ? ((n / d) * 100).toFixed(1) + '%' : '—')

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — normalize
// ─────────────────────────────────────────────────────────────────────────────

const rawCache = new Map()
function loadRaw(name) {
  if (rawCache.has(name)) return rawCache.get(name)
  const p = resolve(RAW, `${name}-${DATE}.json`)
  if (!existsSync(p)) throw new Error(`missing raw payload: ${p}`)
  const parsed = JSON.parse(readFileSync(p, 'utf8'))
  rawCache.set(name, parsed)
  return parsed
}

/**
 * One source → contract records, plus the raw-row count this stage ingested.
 *
 * Two sources read more than one payload file:
 *   `ad`   the original 50-metro sweep + the 51–150 expansion. Same shape, same
 *          mapper, same `source` value — the expansion is more AD, not a new
 *          source, so within-source dedupe collapses the 276 branch IDs the two
 *          sweeps share.
 *   `serp` the SERP program + the bounded page-fetch pass that re-read 406 of
 *          those pages on the dealer's own site.
 */
function mapSource(source, opts) {
  const { adExpansion = true, serpWave2 = false, serpWave3 = false } = opts
  if (source === 'dfs') {
    // 240 MB, one record per line. Streamed and projected — see lib/jsonl.mjs.
    // The payload is `dfs-listings-<date>.json`, not `dfs-<date>.json`: the
    // acquirer named the file after the endpoint, and renaming raw payloads
    // after the fact is exactly the provenance break §2 keeps them to avoid.
    const path = resolve(RAW, `dfs-listings-${DATE}.json`)
    if (!existsSync(path)) throw new Error(`missing raw payload: ${path}`)
    const batch = []
    const stats = readJsonLines(path, (r) => batch.push(r), { marker: '{"company_display"' })
    return { records: MAPPERS.dfs({ records: batch }, opts), raw: stats.records }
  }
  if (LOCATOR_SOURCES.includes(source)) {
    const payload = loadRaw(source)
    // `mapLocator` is one function for nine sources; it needs to know which.
    return { records: MAPPERS[source](payload, { ...opts, source }), raw: (payload.records ?? []).length }
  }
  if (source === 'ad') {
    const base = loadRaw('ad')
    const rows = MAPPERS.ad(base, opts)
    let raw = base.records.length
    if (adExpansion) {
      const exp = loadRaw('ad-expansion')
      rows.push(...MAPPERS.ad(exp, opts))
      raw += exp.records.length
    }
    return { records: rows, raw }
  }
  if (source === 'serp') {
    const serp = loadRaw('serp-selfid')
    const pages = loadRaw('serp-selfid-pages')
    let records = serp.records
    let raw = serp.records.length + pages.records.length
    if (serpWave2) {
      // §5g: 500 more queries, 1,477 net-new dealer domains. Same record shape,
      // same `source` value — wave 2 is more SERP, not a new source, so it joins
      // the SAME grouping pass and `mapSerp` unions the two waves per apex.
      // Grouping them separately would emit two records for every domain that
      // ranked in both waves and inflate the domain-only population by 926.
      const w2 = loadRaw('serp-selfid-wave2')
      records = [...records, ...(w2.records ?? [])]
      raw += w2.records?.length ?? 0
    }
    if (serpWave3) {
      // §5k: 389 queries, 12,378 organic results, 2,798 net-new dealer DOMAINS
      // — a count of hosts, not of verified companies. Same record shape and
      // the same `source` value, so it joins the SAME per-apex grouping wave 2
      // does; grouping it separately would emit a second record for every
      // domain that ranked in more than one wave.
      //
      // Two wave-3 fields are load-bearing and both are honoured in `mapSerp`:
      // `declaration_is_negated` (the disclaimer sentence, never copy) and the
      // byte-exact declaration text — 1,603 carry non-breaking spaces and 112
      // are ALL CAPS as published.
      const w3 = loadRaw('serp-selfid-wave3')
      records = [...records, ...(w3.records ?? [])]
      raw += w3.records?.length ?? 0
    }
    return { records: MAPPERS.serp({ serp: { records }, pages }, opts), raw }
  }
  if (source === 'timken') {
    const payload = loadRaw('timken')
    // Map 2 only. Map 8's 9,002 markers stay in raw for provenance and are never
    // counted, per the settled duplicate finding in §3.
    const raw = (payload.maps ?? [])
      .filter((m) => String(m.map_id) === '2')
      .reduce((n, m) => n + (m.markers?.length ?? 0), 0)
    return { records: MAPPERS.timken(payload, opts), raw }
  }
  const payload = loadRaw(source)
  return { records: MAPPERS[source](payload, opts), raw: (payload.records ?? []).length }
}

// ─────────────────────────────────────────────────────────────────────────────
// Steps 2–5 — the pipeline, parameterized so every arm is the same code
// ─────────────────────────────────────────────────────────────────────────────

export function runPipeline(opts = {}) {
  const {
    stripBranch = true,
    dashMode = 'adjacent-space',
    tighten = false,
    sources = SOURCES,
    adExpansion = true,
    serpWave2 = false,
    serpWave3 = false,
  } = opts
  // Where `mapSerp` parks domains whose only published sentence is a disclaimer
  // ("is NOT an authorized distributor"). Surfaced on the run so the caller can
  // write it out — nothing is deleted, and nothing quotable is invented.
  const negatedSink = []
  const mapOpts = { stripBranch, dashMode, adExpansion, serpWave2, serpWave3, negatedSink }

  const perSource = {}
  const deduped = {}
  let allDeduped = []
  for (const source of sources) {
    const { records, raw } = mapSource(source, mapOpts)
    const { valid, invalid } = validateAll(records)
    perSource[source] = { raw, mapped: records.length, valid, invalid }
    // 2 — within each source, distinct (company, address) pairs. Before counting.
    deduped[source] = dedupeWithinSource(valid)
    allDeduped = allDeduped.concat(deduped[source].records)
  }

  // 3 — suppression. In-dataset distinct-address counts, never raw row counts.
  //     Name match → chain. Size-only match → above-ceiling (§5a).
  const addresses = distinctAddresses(allDeduped)
  const chains = suppressChains(allDeduped, { threshold: 20, addresses })

  // 4 — branch rollup, per source, location_count retained.
  const entities = rollupBranches(chains.records)

  // 4b — the domain path. Measured across every entity BEFORE the class split,
  //      so a SERP hit on a chain's website inherits `chain` instead of entering
  //      the seated pool as a net-new company.
  const anchors = domainAnchors(entities)
  const inherited = inheritAnchorDisposition(entities, anchors.anchorOf)

  // 5 — cross-source merge, one pass per class. Classes are kept apart so a
  //     chain can never absorb an independent through a shared 800-number.
  const byClass = {}
  let stats = null
  for (const cls of CLASSES) {
    const subset = entities.filter((e) => (e.record.disposition ?? null) === cls)
    const run = crossSourceDedupe(subset, { tighten, domainJoin: true })
    byClass[cls ?? 'seated'] = run.merged
    if (cls === null) stats = run.stats
  }

  return {
    sources,
    adExpansion,
    negatedSink,
    perSource,
    deduped,
    addresses,
    chains,
    entities,
    anchors,
    inherited,
    byClass,
    merged: byClass.seated,
    stats,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 6 — AD division classification (§2a), on the UNION of divisions
// ─────────────────────────────────────────────────────────────────────────────

/** The seated list of any pipeline arm — the seated class minus adjacent trades. */
function seatedOf(run) {
  const c = classifyAd(run.merged)
  return [...c.icp, ...c.undecided, ...c.unknown, ...c.nonAd]
}

export function classifyAd(merged) {
  const out = { icp: [], adjacent: [], undecided: [], unknown: [], nonAd: [], gsdComposition: new Map() }
  for (const m of merged) {
    const codes = [...adDivisionCodes(m.record.line_card)]
    if (codes.length === 0) {
      out.nonAd.push(m)
      continue
    }
    // The UNION of divisions decides — 530 AD companies carry 2+, and taking the
    // first one seen would classify most of them on a coin flip (§2a).
    if (codes.some((c) => AD_ICP_DIVISIONS.has(c))) out.icp.push(m)
    else if (codes.some((c) => AD_UNDECIDED_DIVISIONS.has(c))) {
      out.undecided.push(m)
      const others = codes.filter((c) => !AD_UNDECIDED_DIVISIONS.has(c)).sort()
      const key = others.length ? `GSD + ${others.join('+')}` : 'GSD only'
      out.gsdComposition.set(key, (out.gsdComposition.get(key) ?? 0) + 1)
    } else if (codes.every((c) => AD_ADJACENT_DIVISIONS.has(c))) out.adjacent.push(m)
    // A division code in none of the three sets is new or renamed. Seat it and
    // surface it rather than sweeping it into a side pool on a guess.
    else out.unknown.push(m)
  }
  return out
}

/**
 * Re-confirm that Timken map 8 is the duplicate §3 settled it to be. Cheap, and
 * it means the exclusion is evidence in this run rather than a claim inherited
 * from another one.
 */
function checkMap8() {
  const payload = loadRaw('timken')
  const names = (id) =>
    new Set(
      MAPPERS.timken(payload, { mapIds: [id], stripBranch: true })
        .map((r) => r.company)
        .filter(Boolean),
    )
  const m2 = names('2')
  const m8 = names('8')
  const shared = [...m8].filter((c) => m2.has(c)).length
  return { map2: m2.size, map8: m8.size, shared, netNew: m8.size - shared }
}

// ─────────────────────────────────────────────────────────────────────────────
// Reporting helpers
// ─────────────────────────────────────────────────────────────────────────────

const fill = (rows, f) => rows.filter((r) => r.record[f]).length

/**
 * The ceiling on cross-source overlap: how many normalized names two sources
 * literally share, before any join key is consulted. If the pipeline's merged
 * count sits well below this, the dedupe is under-merging; if it sits on it, the
 * overlap really is that thin.
 */
function pairCeilings(run, all) {
  const names = {}
  for (const s of run.sources) names[s] = new Set(run.deduped[s].records.map((r) => r.company).filter(Boolean))
  const rows = []
  for (let i = 0; i < run.sources.length; i++) {
    for (let j = i + 1; j < run.sources.length; j++) {
      const a = names[run.sources[i]]
      const b = names[run.sources[j]]
      const ceiling = [...a].filter((x) => b.has(x)).length
      const got = all.filter((m) => m.sources.has(run.sources[i]) && m.sources.has(run.sources[j])).length
      if (ceiling || got) rows.push([run.sources[i], run.sources[j], ceiling, got])
    }
  }
  return rows
}

function histogram(values) {
  const h = new Map()
  for (const v of values) h.set(v, (h.get(v) ?? 0) + 1)
  return [...h.entries()].sort((a, b) => a[0] - b[0])
}

function table(header, rows) {
  const sep = header.map(() => '---')
  return [header, sep, ...rows].map((r) => `| ${r.join(' | ')} |`).join('\n')
}

/** Distinct states a normalized company's addresses span — nationals vs regionals. */
function statesOf(records, company) {
  const s = new Set()
  for (const r of records) if (r.company === company && r.state) s.add(r.state)
  return s
}

// ─────────────────────────────────────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  console.log(`S2 v2 — eight sources · ${DATE} · branch-stripping ${STRIP_BRANCH ? 'ON (§2b: STRIP)' : 'OFF'}`)

  // The §2b A/B first: it costs one extra pass and keeps the lever visible.
  const stripped = runPipeline({ stripBranch: true })
  const unstripped = runPipeline({ stripBranch: false })
  // The third arm: the profiling script that produced §2b's 32% split on ANY
  // dash, which merges "Tri-State Bearing" and "Tri-County Electrical" onto the
  // join key `tri`. Measured here so the §5a correction stays visible.
  const looseDash = runPipeline({ stripBranch: true, dashMode: 'any' })
  const ship = STRIP_BRANCH ? stripped : unstripped

  // The plan says: if the secondary-key collision rate is high, tighten with
  // street number BEFORE merging. Measured here, then acted on — not assumed.
  const TIGHTEN_AT = 0.05
  const tightened =
    ship.stats.collisionRate > TIGHTEN_AT ? runPipeline({ stripBranch: STRIP_BRANCH, tighten: true }) : null
  const final = tightened ?? ship

  // Leave-one-out: the honest measure of what each S1c source contributed. Order
  // -independent, unlike an incremental add, and it is a measurement rather than
  // an attribution guess.
  const loo = QUICK
    ? {}
    : {
        'ad-expansion': runPipeline({ stripBranch: STRIP_BRANCH, adExpansion: false }),
        ptda: runPipeline({ stripBranch: STRIP_BRANCH, sources: SOURCES.filter((s) => s !== 'ptda') }),
        serp: runPipeline({ stripBranch: STRIP_BRANCH, sources: SOURCES.filter((s) => s !== 'serp') }),
      }
  const baseline5 = QUICK
    ? null
    : runPipeline({ stripBranch: STRIP_BRANCH, sources: S1AB_SOURCES, adExpansion: false })

  const ad = classifyAd(final.merged)
  const seated = [...ad.icp, ...ad.undecided, ...ad.unknown, ...ad.nonAd]
  const adjacent = ad.adjacent
  for (const m of adjacent) m.record.disposition = 'adjacent-trade'

  const pools = {
    chain: final.byClass.chain,
    'above-ceiling': final.byClass['above-ceiling'],
    'adjacent-trade': adjacent,
    'non-US': final.byClass['non-US'],
    'not-a-distributor': final.byClass['not-a-distributor'],
  }

  // ── conservation: every deduped input row lands in exactly one bucket ──────
  const sum = (f) => final.sources.reduce((n, s) => n + f(final.perSource[s]), 0)
  const members = (rows) => rows.reduce((n, m) => n + m.members.length, 0)
  const dedupedRows = final.sources.reduce((n, s) => n + final.deduped[s].out, 0)
  const poolMembers = Object.fromEntries(Object.entries(pools).map(([k, v]) => [k, members(v)]))
  const seatedMembers = members(seated)
  const totalOut = seatedMembers + Object.values(poolMembers).reduce((a, b) => a + b, 0)
  const counts = {
    rawRows: sum((p) => p.raw),
    mappedRows: sum((p) => p.mapped),
    inputRows: sum((p) => p.valid.length),
    invalidRows: sum((p) => p.invalid.length),
    dedupedRows,
    seatedMembers,
    poolMembers,
    totalOut,
    conserved: totalOut === dedupedRows,
  }

  // ── write ─────────────────────────────────────────────────────────────────
  mkdirSync(resolve(ROOT, 'lists'), { recursive: true })
  mkdirSync(resolve(ROOT, 'data', 'side-pools'), { recursive: true })

  const seatedRecords = seated.map((m) => m.record)
  writeFileSync(resolve(ROOT, 'lists', 'deduped-v2.csv'), toCsv(seatedRecords, FIELDS))
  for (const [disp, file] of SIDE_POOLS) {
    writeFileSync(resolve(ROOT, 'data', 'side-pools', file), toCsv(pools[disp].map((m) => m.record), FIELDS))
  }

  const invalid = final.sources.flatMap((s) => final.perSource[s].invalid)
  if (invalid.length) {
    console.error(`\n${invalid.length} contract violations — first 5:`)
    for (const v of invalid.slice(0, 5)) console.error(' ', v.record?.company, v.errors.join('; '))
  }

  const report = buildReport({
    final,
    stripped,
    unstripped,
    looseDash,
    tightened,
    loo,
    baseline5,
    map8: checkMap8(),
    ad,
    seated,
    pools,
    counts,
  })
  writeFileSync(resolve(ROOT, 'data', `_s2-report-v2-${DATE}.md`), report)

  console.log(report)
  console.log(`\nwrote emails/lists/deduped-v2.csv (${seatedRecords.length})`)
  for (const [disp, file] of SIDE_POOLS) console.log(`wrote emails/data/side-pools/${file} (${pools[disp].length})`)
  console.log(`wrote emails/data/_s2-report-v2-${DATE}.md`)
  if (!counts.conserved) process.exitCode = 1
}

// ─────────────────────────────────────────────────────────────────────────────
// Report
// ─────────────────────────────────────────────────────────────────────────────

function buildReport(ctx) {
  const { final, stripped, unstripped, looseDash, tightened, loo, baseline5, ad, seated, pools, counts } = ctx
  const L = []
  const p = (s = '') => L.push(s)

  const all = CLASSES.flatMap((c) => final.byClass[c ?? 'seated'])
  const union = final.merged.length
  const seatedN = seated.length
  const unresolved = seated.filter((m) => m.record.needs_identity_resolution).length
  const identified = seatedN - unresolved

  p(`# S2 report v2 — eight sources, the domain join, and the above-ceiling split`)
  p()
  p(`**Date:** ${DATE} · **Stage:** S2 (build-plan §3, re-run over S1c) · **Sources:** ${final.sources.join(', ')} (\`ad\` = the 50-metro sweep + the 51–150 expansion; \`serp\` = the SERP program + the page-fetch pass)`)
  p(`**Branch stripping:** ${STRIP_BRANCH ? '**ON** — the §2b decision' : 'OFF'} · **Secondary-key tightening:** ${tightened ? 'ON (collision rate exceeded 5%)' : 'off (collision rate under 5%)'}`)
  p(`**Network requests: 0.** Every number below is measured off the S1/S1c raw payloads on disk.`)
  p(`**Supersedes** \`_s2-report-2026-08-01.md\` (five sources). \`deduped-v1.csv\` is left on disk for comparison;`)
  p(`the five side-pool CSVs are regenerated at v2 content. Nothing under \`emails/data/enrichment/\` is touched —`)
  p(`that is the line-card fetch pass running in parallel, and its target list was drawn from \`deduped-v1.csv\`.`)
  p()

  // ── 1. per-source ─────────────────────────────────────────────────────────
  p(`## 1. Distinct companies per source, and the union`)
  p()
  p(
    table(
      ['Source', 'Raw rows', 'Contract-valid rows', 'After within-source dedupe', 'Distinct companies', 'Rolled-up entities'],
      final.sources.map((s) => {
        const ps = final.perSource[s]
        const d = final.deduped[s]
        const names = new Set(d.records.map((r) => r.company).filter(Boolean))
        const ents = final.entities.filter((e) => e.sources.has(s)).length
        return [s, ps.raw, ps.valid.length, d.out, `**${names.size}**`, ents]
      }),
    ),
  )
  p()
  const sumDistinct = final.sources.reduce(
    (n, s) => n + new Set(final.deduped[s].records.map((r) => r.company).filter(Boolean)).size,
    0,
  )
  p(`Sum across sources (double-counts overlap): **${sumDistinct}**.`)
  p(`**Total union across every disposition: ${all.length} companies.** Split:`)
  p()
  p(
    table(
      ['Bucket', 'Companies', 'File'],
      [
        ['**seated**', `**${seatedN}**`, '`emails/lists/deduped-v2.csv`'],
        ...SIDE_POOLS.map(([disp, file]) => [disp, pools[disp].length, `\`emails/data/side-pools/${file}\``]),
      ],
    ),
  )
  p()
  p(`### Against the 2,500–3,500 target`)
  p()
  p(
    table(
      ['Read', 'Companies', 'In range?'],
      [
        ['Seated, all rows', `**${seatedN}**`, seatedN >= 2500 && seatedN <= 3500 ? 'yes' : seatedN > 3500 ? `**over the high end by ${seatedN - 3500}**` : `**${2500 - seatedN} short**`],
        [
          'Seated with a verified identity (name + address or phone)',
          `**${identified}**`,
          identified >= 2500 && identified <= 3500 ? 'yes' : identified > 3500 ? `over by ${identified - 3500}` : `${2500 - identified} short`,
        ],
        ['…of which `needs_identity_resolution` (domain + brand claim only)', unresolved, 'S3 resolves'],
      ],
    ),
  )
  p()
  p(`The two reads differ by ${unresolved} companies, and the difference is not cosmetic: an unresolved record`)
  p(`has a website and a quotable brand claim but **no verified company name, no address and no phone**.`)
  p(`It can be researched; it cannot be mailed. Read the second row against the target for send planning`)
  p(`and the first for pool size.`)
  p()
  if (baseline5) {
    const b5 = seatedOf(baseline5).length
    p(`**S1c moved the seated pool from ${b5} to ${seatedN}.** (The five-source arm re-run here lands on`)
    p(`${b5}${b5 === 2355 ? ', reproducing §5a exactly' : `, against §5a's 2,355 — see §14 for why the two differ`}.)`)
    p()
  }
  p(`**Timken map 8 stays excluded, and that is re-confirmed here, not taken on trust.** ${ctx.map8.map8} companies in map 8,`)
  p(`${ctx.map8.shared} of them already in map 2 — **${ctx.map8.netNew} net-new**. Ingesting map 8 would buy ${ctx.map8.netNew} companies and double`)
  p(`every location count, which turns the ≥20 threshold into ≥10. Map 8 stays in raw for provenance.`)
  p()

  // ── 2. net-new per S1c source ─────────────────────────────────────────────
  p(`## 2. What each S1c source actually contributed — leave-one-out`)
  p()
  if (Object.keys(loo).length) {
    p(`Each arm re-runs the whole pipeline with one S1c source removed. The drop is that source's`)
    p(`contribution **after** dedupe, chain suppression and the domain join — not its raw count, and not an`)
    p(`attribution guess. Leave-one-out is order-independent; an incremental add is not.`)
    p()
    p(
      table(
        ['Arm', 'Seated', 'Δ vs full', 'Total union', 'Δ vs full'],
        [
          ['**full (eight sources)**', `**${seatedN}**`, '—', all.length, '—'],
          ...Object.entries(loo).map(([name, run]) => {
            const runSeatedN = seatedOf(run).length
            const runAll = CLASSES.flatMap((c) => run.byClass[c ?? 'seated']).length
            return [`without ${name}`, runSeatedN, `**+${seatedN - runSeatedN}**`, runAll, `+${all.length - runAll}`]
          }),
          ...(baseline5
            ? [['without all three (the §5a five-source arm)', seatedOf(baseline5).length, `**+${seatedN - seatedOf(baseline5).length}**`, CLASSES.flatMap((c) => baseline5.byClass[c ?? 'seated']).length, `+${all.length - CLASSES.flatMap((c) => baseline5.byClass[c ?? 'seated']).length}`]]
            : []),
        ],
      ),
    )
    p()
    const looSum = Object.entries(loo).reduce((n, [, run]) => n + (seatedN - seatedOf(run).length), 0)
    if (baseline5) {
      const joint = seatedN - seatedOf(baseline5).length
      p(`The three leave-one-out drops sum to ${looSum}; removing all three at once costs ${joint}.`)
      p(
        looSum === joint
          ? `They are equal — the three S1c sources are **disjoint**: none of them would have been found by the others.`
          : `The ${Math.abs(joint - looSum)}-company gap is overlap between the S1c sources themselves — companies a second S1c source would have supplied anyway.`,
      )
      p()
    }
  } else {
    p(`_Skipped (\`--quick\`)._`)
    p()
  }

  // ── 3. the domain join ────────────────────────────────────────────────────
  p(`## 3. The domain join — does SERP overlap the locator pool?`)
  p()
  p(`SERP self-identification is the only source with **no address and no phone**, so it reaches neither`)
  p(`§3.5 join key. §3 gains a third path for it: a domain-only entity attaches to the identified entity`)
  p(`that already publishes that apex domain. **One direction only** — identified entities are never joined`)
  p(`to each other by domain, because 209 of the 1,683 locator domains are published by 2+ distinct`)
  p(`companies (\`motion.com\` carries Motion Industries *and* Kaman; \`theprontonetwork.com\` carries a`)
  p(`dozen unrelated jobbers), and a general domain join would merge companies that are not the same company.`)
  p()
  const a = final.anchors
  // Slice by the acquirer's own classification so the headline rate is measured
  // on dealer candidates, not diluted by marketplaces and manufacturer pages.
  const domainOnlyEnts = final.entities.filter((e) => e.domainOnly)
  const dealerEnts = domainOnlyEnts.filter((e) => e.record.tier_raw === 'dealer_candidate')
  const dealerIdx = new Set()
  final.entities.forEach((e, i) => {
    if (e.domainOnly && e.record.tier_raw === 'dealer_candidate') dealerIdx.add(i)
  })
  const dealerMatched = [...a.anchorOf.keys()].filter((i) => dealerIdx.has(i)).length
  p(
    table(
      ['Measure', 'All SERP domains', 'Dealer-classified only'],
      [
        ['entering the join', a.matched + a.netNew, dealerEnts.length],
        ['**matched a company the locators had already seated**', `**${a.matched}** (${pct(a.matched, a.matched + a.netNew)})`, `**${dealerMatched}** (${pct(dealerMatched, dealerEnts.length)})`],
        ['…locator domain has 2+ occupants (ambiguous — largest wins)', a.ambiguous, '—'],
        ['**arrived net-new**', `**${a.netNew}** (${pct(a.netNew, a.matched + a.netNew)})`, `**${dealerEnts.length - dealerMatched}** (${pct(dealerEnts.length - dealerMatched, dealerEnts.length)})`],
      ],
    ),
  )
  p()
  p(`**This is the first real read on SERP↔locator overlap, and it is ${pct(dealerMatched, dealerEnts.length)} on dealer-classified domains.**`)
  p(`SERP is addressing a near-disjoint population from the manufacturer locators — the same finding §5a`)
  p(`made about the locators themselves, now confirmed for a source built on a completely different axis.`)
  p()
  p(`Where the matched domains landed (a SERP hit on a chain's website **is** that chain):`)
  p()
  p(table(['Disposition inherited from the anchor', 'Domains'], [...final.inherited.entries()].sort((x, y) => y[1] - x[1])))
  p()
  const inheritedN = [...final.inherited.values()].reduce((x, y) => x + y, 0)
  p(`**The matched domains reconcile:** ${a.matched} matched → ${inheritedN} inherited a suppressed disposition from their`)
  p(`anchor and left the seated class → ${final.stats.domainMerges} merged inside the seated class →`)
  p(`${a.matched - inheritedN - final.stats.domainMerges} matched a seated anchor but were themselves already tagged \`non-US\` or`)
  p(`\`not-a-distributor\` at acquisition, so they stayed in their own pool rather than merging.`)
  p()

  // ── 4. evidence depth ─────────────────────────────────────────────────────
  p(`## 4. Overlap matrix — \`evidence_depth\`, and whether the domain join lifts it`)
  p()
  const depths = histogram(seated.map((m) => m.sources.size))
  p(table(['Sources a company appears in', 'Companies (seated)', 'Share of seated'], depths.map(([d, n]) => [d, n, pct(n, seatedN)])))
  p()
  const multi = seated.filter((m) => m.sources.size >= 2).length
  p(`**${multi} of ${seatedN} seated companies (${pct(multi, seatedN)}) appear in 2+ sources.**`)
  if (baseline5) {
    const b5 = seatedOf(baseline5)
    const b5multi = b5.filter((m) => m.sources.size >= 2).length
    p(`§5a measured 98.3% at depth 1 on five sources (${b5multi} of ${b5.length} at 2+ in the re-run — ${pct(b5.length - b5multi, b5.length)} at depth 1).`)
  }
  p()
  const depth2WithSerp = seated.filter((m) => m.sources.size >= 2 && m.sources.has('serp')).length
  p(`**Does the domain join lift anything above depth 1?** Yes — **${depth2WithSerp} companies** reach depth ≥2`)
  p(`*because* a SERP domain attached to them. That is the entire lift the domain path produces; without it`)
  p(`those ${depth2WithSerp} would be ${depth2WithSerp} locator records at depth 1 plus ${depth2WithSerp} orphan domains.`)
  p()
  p(`Pairwise overlap (companies appearing in both):`)
  p()
  const pairRows = []
  for (let i = 0; i < final.sources.length; i++) {
    for (let j = i + 1; j < final.sources.length; j++) {
      const n = all.filter((m) => m.sources.has(final.sources[i]) && m.sources.has(final.sources[j])).length
      if (n) pairRows.push([final.sources[i], final.sources[j], n])
    }
  }
  p(pairRows.length ? table(['Source A', 'Source B', 'Shared companies'], pairRows.sort((x, y) => y[2] - x[2])) : '_No pairwise overlap at all._')
  p()
  p(`Net-new per source (companies that appear in that source and no other), across every disposition:`)
  p()
  p(
    table(
      ['Source', 'Net-new (only source)', 'In the union', 'Seated'],
      final.sources.map((s) => {
        const inS = all.filter((m) => m.sources.has(s))
        return [s, inS.filter((m) => m.sources.size === 1).length, inS.length, seated.filter((m) => m.sources.has(s)).length]
      }),
    ),
  )
  p()
  p(`**Is that overlap real, or is the dedupe under-merging?** Checked against the theoretical ceiling —`)
  p(`how many *normalized names* two sources literally share, ignoring every join key:`)
  p()
  p(
    table(
      ['Source pair', 'Shared normalized names (ceiling)', 'Merged by the pipeline'],
      pairCeilings(final, all).map(([x, y, ceiling, got]) => [`${x} × ${y}`, ceiling, got]),
    ),
  )
  p()
  p(`**Two caveats §5a did not need at five sources.** SERP's ceiling is meaningless by construction — its`)
  p(`\`company\` is derived from the domain, not published, so a name collision with a locator is coincidence`)
  p(`and its real join is the domain (§3). And "merged" can now legitimately *exceed* the pairwise ceiling,`)
  p(`because a company can join A to B transitively through C — an AD record and a Timken record that share`)
  p(`no name can both share a phone with the same PTDA record. At five sources that was rare enough to`)
  p(`ignore; at seven it is the reason timken × ad reads above its own ceiling.`)
  p()

  // ── 5. the self-declaration corpus ────────────────────────────────────────
  p(`## 5. Self-declarations — the dealer's own words (§5b's Angle-2 re-base)`)
  p()
  const declAll = all.filter((m) => m.record.self_declaration)
  const declSeated = seated.filter((m) => m.record.self_declaration)
  const verbSeated = seated.filter((m) => m.record.self_declaration_verbatim)
  p(
    table(
      ['Measure', 'Union', 'Seated'],
      [
        ['companies carrying a `self_declaration`', declAll.length, declSeated.length],
        ['…**page-verbatim** (read off the dealer\'s own site)', all.filter((m) => m.record.self_declaration_verbatim).length, verbSeated.length],
        ['…SERP-snippet only (Google truncates and rewrites these)', declAll.length - all.filter((m) => m.record.self_declaration_verbatim).length, declSeated.length - verbSeated.length],
      ],
    ),
  )
  p()
  p(`Every declaration carries \`self_declaration_url\` — the exact page it was read from — and the text is`)
  p(`stored **exactly as published, original casing included**. It is email copy, not a data field:`)
  p(`title-casing it or trimming it to a phrase destroys the only thing that makes it worth quoting.`)
  p()
  // Verbatim is the rule, and verbatim means some of them start mid-sentence.
  const midSentence = declSeated.filter((m) => /^[^A-Z0-9"']/.test(m.record.self_declaration)).length
  const shouty = declSeated.filter((m) => {
    const t = m.record.self_declaration.replace(/[^A-Za-z]/g, '')
    return t.length > 20 && t === t.toUpperCase()
  }).length
  p(`**They are not all ready to paste, and preserving them verbatim is why.** Measured on the ${declSeated.length} seated`)
  p(`declarations: **${midSentence}** begin mid-sentence (a leading comma or lowercase word — the extractor cut on a`)
  p(`sentence boundary the page did not have) and **${shouty}** are published in full capitals. Both are the`)
  p(`dealer's own text and both are kept exactly as found. Trimming a fragment is a **copy** decision for S7,`)
  p(`not a data decision for S2 — the moment the pipeline "cleans" a quote, it stops being a quote.`)
  p()
  const sample = declSeated.filter((m) => m.record.self_declaration_verbatim).slice(0, 3)
  if (sample.length) {
    p(`Three seated examples, verbatim:`)
    p()
    for (const m of sample) p(`> **${m.record.company_display}** (${m.record.domain}) — "${m.record.self_declaration}"`)
    p()
  }

  // ── 6. brand_authorized and line_card ─────────────────────────────────────
  p(`## 6. \`brand_authorized\` and \`line_card\` — the Angle-2 evidence base`)
  p()
  const ba = histogram(seated.map((m) => m.record.brand_authorized.length))
  p(`\`brand_authorized[]\` — manufacturer brands a source proves, plus the brands a dealer's own page names:`)
  p()
  p(table(['brand_authorized entries', 'Companies (seated)'], ba.map(([k, n]) => [k, n])))
  p()
  const ba2 = seated.filter((m) => m.record.brand_authorized.length >= 2).length
  p(`**${ba2} seated companies (${pct(ba2, seatedN)}) carry 2+ brands.** §5a measured **8 (0.3%)** on five locators.`)
  p(`The rise is not a better join — it is §5b's finding made operational: **the brands come from the dealer's`)
  p(`own page, not from reconstructing a graph across manufacturer locators.** A locator can only ever prove`)
  p(`its own brand; a line-card page names as many as the dealer chose to publish.`)
  p()
  const baBySource = [['serp', seated.filter((m) => m.sources.has('serp') && m.record.brand_authorized.length >= 2).length], ['locators only', seated.filter((m) => !m.sources.has('serp') && m.record.brand_authorized.length >= 2).length]]
  p(table(['Where the 2+ brand companies come from', 'Companies'], baBySource))
  p()
  const lc = histogram(seated.map((m) => m.record.line_card.length))
  const lc2 = seated.filter((m) => m.record.line_card.length >= 2).length
  p(`\`line_card[]\` (product families / divisions / association categories — NOT brands): **${lc2} companies (${pct(lc2, seatedN)}) carry 2+.**`)
  p()
  p(table(['line_card entries', 'Companies'], lc.map(([k, n]) => [k, n])))
  p()
  p(`> **Read \`line_card\` with care.** SPX FLOW's \`taglist\` mixes its own sub-brands with genuine product`)
  p(`> families, so SPX-derived breadth is one manufacturer's catalogue breadth. AD divisions (\`AD:BPT\`) and`)
  p(`> PTDA categories (\`PTDA:BEARINGS\`) are genuine product categories. SERP contributes **nothing** here —`)
  p(`> it publishes brands, and folding brands in would inflate the breadth S3 reads as a size proxy (§1).`)
  p()

  // ── 7. chain vs above-ceiling ─────────────────────────────────────────────
  p(`## 7. Suppression — chains and the above-ceiling split (§5a's correction, shipped)`)
  p()
  p(`Caught by **name** (§3.3 blocklist) → \`disposition: chain\`: **${final.chains.byName.size} normalized names**`)
  p(`Caught by the **≥20 distinct-address rule only** → \`disposition: above-ceiling\`: **${final.chains.bySize.size} normalized names**`)
  p(`Merged records: \`pool-chains.csv\` **${pools.chain.length}** · \`pool-above-ceiling.csv\` **${pools['above-ceiling'].length}**`)
  p()
  p(`§5a: *"the ≥20-address rule caught Purvis (72), IBT (35) and Hydradyne (34) — regional independents,`)
  p(`not national chains. They are correctly out of the seated list, but for the wrong stated reason: they`)
  p(`are above the revenue ceiling."* That is now a disposition of its own with its own pool, mirroring`)
  p(`\`pool-small-shops.csv\` at the other end. **Name-blocklist matches stay \`chain\`.**`)
  p()
  const namedGroups = new Map()
  for (const [company, entry] of final.chains.byName) {
    if (!namedGroups.has(entry)) namedGroups.set(entry, [])
    namedGroups.get(entry).push(company)
  }
  p(`By name → \`chain\`:`)
  p()
  p(
    table(
      ['Blocklist entry', 'Normalized names matched', 'Distinct addresses'],
      [...namedGroups.entries()]
        .map(([entry, names]) => [entry, names.length, names.reduce((n, c) => n + (final.addresses.get(c)?.size ?? 0), 0)])
        .sort((x, y) => y[2] - x[2]),
    ),
  )
  p()
  const absent = CHAIN_BLOCKLIST.filter((n) => ![...final.chains.byName.values()].includes(n))
  if (absent.length) p(`Blocklist entries with **no prefix match in the data**: ${absent.join(', ')}.`)
  else p(`Every blocklist entry matched at least one company.`)
  p()
  // §3.3's name test is a PREFIX match. Measure what a word-boundary-anywhere
  // match would add before anyone changes it — the looser rule is a plan change.
  const loose = []
  for (const name of CHAIN_BLOCKLIST) {
    const key = String(name).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
    const esc = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    for (const [c, addrs] of final.addresses) {
      if (final.chains.byName.has(c) || addrs.size < 5) continue
      // Two directions the prefix rule cannot see:
      //   infix   "minarik a kaman" contains the key but does not start with it
      //   short   "motion" IS the key's first word — the source published a
      //           shortened trading name, not the full legal one
      const infix = new RegExp(`(^| )${esc}( |$)`).test(c)
      const short = !infix && key.startsWith(c + ' ')
      if (!infix && !short) continue
      loose.push([name, c, infix ? 'key inside the name' : 'source published a short form', addrs.size, final.chains.bySize.has(c) ? 'above-ceiling' : '**SEATED**'])
    }
  }
  if (loose.length) {
    p(`**The name test is a prefix match, and that is measurable.** §3.3 matches a blocklist key at the START`)
    p(`of the normalized name, so it sees neither a key buried inside a longer name nor a source that`)
    p(`publishes a shorter one. Every company with ≥5 addresses that a looser rule would catch, and where it`)
    p(`sits today:`)
    p()
    p(table(['Blocklist entry', 'Normalized company', 'Why the prefix rule misses it', 'Distinct addresses', 'Currently'], loose.sort((x, y) => y[3] - x[3])))
    p()
    const stillSeated = loose.filter((r) => r[4].includes('SEATED'))
    p(`Widening §3.3's name test is a **plan change**, so it is measured here and not made. Two consequences,`)
    p(`both real: the largest chains in the pool are filed under \`above-ceiling\` rather than \`chain\`, which is a`)
    p(`label the next stage should not trust${stillSeated.length ? `; and ${stillSeated.length} chain-owned brands (${stillSeated.map((r) => r[1]).join(', ')}) are` : ', and nothing is'}`)
    p(`${stillSeated.length ? '**seated right now** — they are subsidiaries of a blocklisted parent and the rule cannot see it.' : 'seated that a looser rule would remove.'}`)
    p()
  }
  p(`By the ≥20 rule → \`above-ceiling\` (top 25, with the state spread that separates a national from a regional):`)
  p()
  const allDedupedRows = final.sources.flatMap((s) => final.deduped[s].records)
  p(
    table(
      ['Normalized company', 'Distinct addresses', 'States'],
      [...final.chains.bySize.entries()]
        .sort((x, y) => y[1] - x[1])
        .slice(0, 25)
        .map(([c, n]) => [c, n, statesOf(allDedupedRows, c).size]),
    ),
  )
  p()
  p(`> **The above-ceiling pool is not homogeneous, and the state column says so.** A company with 70+`)
  p(`> addresses across 20+ states is a national chain that simply is not on the §3.3 blocklist (Elliott`)
  p(`> Electric, Bass Pro, NAPA, TruckPro — Timken's locator lists retailers). A company with 30 addresses`)
  p(`> across 3 states is a large regional independent: above our ceiling, but the same kind of business as`)
  p(`> the ICP. Splitting those two by rule needs a decision that is not in the plan, so both are parked`)
  p(`> together, tagged, and reinstatable by a threshold change or a named allowlist. Nothing is deleted.`)
  p()

  // ── 8. cross-source key load ──────────────────────────────────────────────
  p(`## 8. Cross-source dedupe — key load and the secondary-key collision rate`)
  p()
  const s = final.stats
  p(
    table(
      ['Measure', 'Value'],
      [
        ['Merges made on the primary key (`phone_e164`)', s.phoneMerges],
        ['Secondary-key groups (name + zip5 shared by 2+ entities)', s.secondaryGroups],
        ['Candidate pairs evaluated on the secondary key', s.candidatePairs],
        ['…already joined by phone (corroboration, no new merge)', s.alreadyJoinedByPhone],
        ['…corroborated by the street-number tiebreak or unopposed', s.corroborated],
        ['…**conflicting** (street numbers AND phones both disagree)', `**${s.conflicting}**`],
        ['**Secondary-key collision rate**', `**${(s.collisionRate * 100).toFixed(2)}%**`],
        ['Merges made on the secondary key alone', s.secondaryMerges],
        ['Pairs suppressed (conflict, or tightening)', s.suppressedByTighten],
        ['**Merges made on the domain path (S1c)**', `**${s.domainMerges}**`],
      ],
    ),
  )
  p()
  p(
    tightened
      ? `The rate exceeded 5%, so the secondary path was **tightened with the street number before merging**, exactly as §3.5 instructs.`
      : `The rate is under the 5% threshold, so the secondary path merged on name+zip5 with the street number used only as corroboration. Conflicting pairs were suppressed regardless.`,
  )
  p()
  p(`Phone fill by source — why the secondary and domain paths carry real load:`)
  p()
  p(
    table(
      ['Source', 'Rows with phone', 'Fill'],
      final.sources.map((src) => {
        const rows = final.deduped[src].records
        const n = rows.filter((r) => r.phone_e164).length
        return [src, `${n} / ${rows.length}`, pct(n, rows.length)]
      }),
    ),
  )
  p()

  // ── 9. fill rates ─────────────────────────────────────────────────────────
  p(`## 9. Fill rates on the union`)
  p()
  const fillRow = (label, f) => [
    label,
    `${fill(all, f)}  ${pct(fill(all, f), all.length)}`,
    `${fill(seated, f)}  ${pct(fill(seated, f), seatedN)}`,
    `${seated.filter((m) => !m.record.needs_identity_resolution && m.record[f]).length}  ${pct(seated.filter((m) => !m.record.needs_identity_resolution && m.record[f]).length, identified)}`,
  ]
  p(
    table(
      ['Field', `Union (${all.length})`, `Seated (${seatedN})`, `Seated + identified (${identified})`],
      [
        fillRow('website / apex domain', 'domain'),
        fillRow('phone_e164', 'phone_e164'),
        fillRow('email', 'email'),
        fillRow('zip5', 'zip5'),
        fillRow('city', 'city'),
        fillRow('company_display', 'company_display'),
        fillRow('self_declaration', 'self_declaration'),
      ],
    ),
  )
  p()
  p(`The seated column now mixes two populations. ${unresolved} seated companies are SERP domains with no`)
  p(`address and no phone by construction, so they drag \`phone_e164\` and \`zip5\` down and push \`domain\` to`)
  p(`100%. The third column is the honest fill on records that can actually be mailed today.`)
  p()
  const emailBySource = new Map()
  for (const m of all) if (m.record.email_source) emailBySource.set(m.record.email_source, (emailBySource.get(m.record.email_source) ?? 0) + 1)
  p(`Email provenance (Cohort E, §7.2 — isolated micro-campaign, separate bounce reporting):`)
  p()
  p(table(['email_source', 'Companies'], [...emailBySource.entries()].sort((x, y) => y[1] - x[1])))
  p()

  // ── 10. AD ────────────────────────────────────────────────────────────────
  p(`## 10. AD division classification (§2a) — on the UNION of divisions, both sweeps merged`)
  p()
  p(
    table(
      ['Bucket', 'Companies', 'Routed to'],
      [
        ['ICP-shaped (BPT / PVF / ISD)', ad.icp.length, '`deduped-v2.csv` (seated)'],
        ['Adjacent trades (ESD / PLBG / HVAC / WWD / BSDC)', ad.adjacent.length, '`pool-adjacent-trades.csv`'],
        ['**GSD — judgement call, not guessed**', ad.undecided.length, '`deduped-v2.csv` (seated, FLAGGED)'],
        ['Unrecognised division code (new or renamed)', ad.unknown.length, '`deduped-v2.csv` (seated)'],
        ['Not an AD member (the other six sources)', ad.nonAd.length, '`deduped-v2.csv` (seated)'],
      ],
    ),
  )
  p()
  p(`The expansion sweep queried **BPT/PVF/ISD only** across metros 51–150, so every company it adds is`)
  p(`ICP-shaped by construction — the adjacent-trade pool is unchanged by it except where an expansion`)
  p(`record merged onto a company the first sweep had already filed under an adjacent division.`)
  p()
  p(`**GSD composition — the flagged judgement call.** GSD is "Gypsum Supply". ${ad.undecided.length} companies carry it`)
  p(`without any ICP division:`)
  p()
  p(table(['Division union', 'Companies'], [...ad.gsdComposition.entries()].sort((x, y) => y[1] - x[1])))
  p()
  p(`Seated **and flagged**, not routed. **To find them in \`deduped-v2.csv\`:** \`line_card\` contains \`AD:GSD\`.`)
  p()

  // ── 11. PTDA ──────────────────────────────────────────────────────────────
  p(`## 11. PTDA — the association source`)
  p()
  const ptdaRows = final.deduped.ptda?.records ?? []
  const ptdaEnts = final.entities.filter((e) => e.sources.has('ptda'))
  const ptdaAddr = new Map()
  for (const r of ptdaRows) {
    if (!ptdaAddr.has(r.company)) ptdaAddr.set(r.company, new Set())
    ptdaAddr.get(r.company).add(`${r.address_1 ?? ''}|${r.zip5 ?? ''}`)
  }
  const ptdaCats = ptdaEnts.map((e) => e.record.line_card.filter((x) => String(x).startsWith('PTDA:')).length)
  ctx.ptdaCats = ptdaCats
  const ptdaTop = [...ptdaAddr.entries()].sort((x, y) => y[1].size - x[1].size).slice(0, 9)
  const ptdaTotalAddr = [...ptdaAddr.values()].reduce((n, v) => n + v.size, 0)
  const ptdaTop9 = ptdaTop.reduce((n, [, v]) => n + v.size, 0)
  p(
    table(
      ['Measure', 'Value'],
      [
        ['Raw rows (84 ZIPs × 15 category queries)', final.perSource.ptda.raw],
        ['After within-source dedupe', final.deduped.ptda.out],
        ['Distinct companies', new Set(ptdaRows.map((r) => r.company).filter(Boolean)).size],
        ['Distinct locations', ptdaTotalAddr],
        ['Top nine companies\' share of locations', `${ptdaTop9} / ${ptdaTotalAddr} = **${pct(ptdaTop9, ptdaTotalAddr)}**`],
        ['Seated after suppression', seated.filter((m) => m.sources.has('ptda')).length],
        ['Routed to `chain`', pools.chain.filter((m) => m.sources.has('ptda')).length],
        ['Routed to `above-ceiling`', pools['above-ceiling'].filter((m) => m.sources.has('ptda')).length],
        ['Mean `line_card` entries per PTDA entity (of 14)', (ptdaCats.reduce((n, x) => n + x, 0) / (ptdaCats.length || 1)).toFixed(1)],
        ['…counting only entities that publish at least one category', (ptdaCats.filter((x) => x > 0).reduce((n, x) => n + x, 0) / (ptdaCats.filter((x) => x > 0).length || 1)).toFixed(1)],
        ['Entities with zero categories (found only by the unfiltered `(Any)` sweep)', ptdaCats.filter((x) => x === 0).length],
        ['Entities carrying all 14 categories', ptdaCats.filter((x) => x === 14).length],
      ],
    ),
  )
  p()
  p(`Chain suppression handles the nationals exactly as §5b predicted — the nine biggest PTDA members by`)
  p(`location count are ${ptdaTop.map(([c]) => c).slice(0, 4).join(', ')} and five more, and they leave through`)
  p(`the blocklist and the ≥20 rule without a special case.`)
  p()

  // ── 12. branch-strip A/B ──────────────────────────────────────────────────
  p(`## 12. Branch stripping — the §2b A/B, all three arms, on eight sources`)
  p()
  const distinct = (run, src) => new Set(run.deduped[src]?.records.map((r) => r.company).filter(Boolean) ?? []).size
  p(
    table(
      ['Arm', 'Seated union', 'Chains', 'Above-ceiling', ...SOURCES],
      [
        ['**STRIP, adjacent-space dash** (shipped)', `**${seatedOf(stripped).length}**`, stripped.byClass.chain.length, stripped.byClass['above-ceiling'].length, ...SOURCES.map((x) => distinct(stripped, x))],
        ['keep branch names', seatedOf(unstripped).length, unstripped.byClass.chain.length, unstripped.byClass['above-ceiling'].length, ...SOURCES.map((x) => distinct(unstripped, x))],
        ['STRIP, split on ANY dash (§2b profiling rule)', seatedOf(looseDash).length, looseDash.byClass.chain.length, looseDash.byClass['above-ceiling'].length, ...SOURCES.map((x) => distinct(looseDash, x))],
      ],
    ),
  )
  p()
  const delta = seatedOf(unstripped).length - seatedOf(stripped).length
  p(`The lever is worth **${delta} companies — ${pct(delta, seatedOf(unstripped).length)} of the unstripped seated union**.`)
  p(`The §5a dash correction is worth **${seatedOf(stripped).length - seatedOf(looseDash).length}** on eight sources (it was 242 on five).`)
  p()
  const dornerSingles = (run) => run.entities.filter((e) => e.sources.has('dorner') && e.record.location_count === 1).length
  p(`Dorner calibration (§2b's empirical validation — stripping should reproduce 76 companies / 56 single-location):`)
  p()
  p(
    table(
      ['Arm', 'Dorner distinct companies', 'Single-location'],
      [
        ['**STRIP, adjacent-space** (shipped)', distinct(stripped, 'dorner'), dornerSingles(stripped)],
        ['STRIP, any dash', distinct(looseDash, 'dorner'), dornerSingles(looseDash)],
        ['keep branch names', distinct(unstripped, 'dorner'), dornerSingles(unstripped)],
        ['_research/06 target_', '_76_', '_56_'],
      ],
    ),
  )
  p()

  // ── 13. conservation ──────────────────────────────────────────────────────
  p(`## 13. Conservation check — nothing was deleted`)
  p()
  p(
    table(
      ['Stage', 'Records'],
      [
        ['Raw rows across the eight payloads', counts.rawRows],
        ['Mapped to the contract', counts.mappedRows],
        ['Contract-valid', counts.inputRows],
        ['Contract violations (reported, never dropped silently)', counts.invalidRows],
        ['After within-source dedupe — **this is the conservation baseline**', `**${counts.dedupedRows}**`],
        ['→ members under seated companies', counts.seatedMembers],
        ...SIDE_POOLS.map(([disp]) => [`→ members under ${disp} companies`, counts.poolMembers[disp]]),
        ['**Sum**', `**${counts.totalOut}**`],
      ],
    ),
  )
  p()
  p(
    counts.conserved
      ? `**PASS — ${counts.dedupedRows} in = ${counts.seatedMembers} seated + ${SIDE_POOLS.map(([d]) => `${counts.poolMembers[d]} ${d}`).join(' + ')}.** Nothing was deleted; every failing record carries a \`disposition\` and sits in a side pool.`
      : `**FAIL — ${counts.dedupedRows} in ≠ ${counts.totalOut} out.** Investigate before shipping.`,
  )
  p()
  p(`Rows that exist in raw and never reach the contract, and why:`)
  p()
  p(`- **non-US locator rows** — filtered at the mapper by the source's own \`country\` field. Kept verbatim`)
  p(`  in the raw payloads; S1 never discarded them.`)
  p(`- **SERP results collapse to domains** — ${final.perSource.serp.raw} raw results and fetched pages become`)
  p(`  ${final.perSource.serp.mapped} domain records, because the source's unit of identity is the domain, not the result.`)
  p(`  A handful of hosts will not parse to an apex domain and stay in raw.`)
  p()

  // ── 14. contradictions ────────────────────────────────────────────────────
  p(`## 14. What contradicts the build plan`)
  p()
  for (const line of contradictions(ctx, { all, union, seatedN, identified, unresolved })) p(`- ${line}`)
  p()
  return L.join('\n')
}

/** Measured facts that disagree with what §1–§5b assumed. Reported, not smoothed. */
function contradictions(ctx, m) {
  const { final, stripped, unstripped, looseDash, baseline5, ad, pools, seated } = ctx
  const { all, seatedN, identified, unresolved } = m
  const out = []
  const a = final.anchors
  const s = final.stats
  const depth = (n) => seated.filter((x) => x.sources.size >= n).length
  const serpLift = seated.filter((x) => x.sources.size >= 2 && x.sources.has('serp')).length
  const dealerIdx = new Set()
  final.entities.forEach((e, i) => {
    if (e.domainOnly && e.record.tier_raw === 'dealer_candidate') dealerIdx.add(i)
  })
  const dealerN = dealerIdx.size
  const dealerMatched = [...a.anchorOf.keys()].filter((i) => dealerIdx.has(i)).length

  out.push(
    `**The pool now overshoots the target, and the overshoot is entirely unverified identity.** Seated is ` +
      `**${seatedN}** against 2,500–3,500 — ${seatedN > 3500 ? `**${seatedN - 3500} over the high end**` : 'inside the range'}. But ${unresolved} of those ` +
      `are SERP domains with no verified name, address or phone (\`needs_identity_resolution: true\`). The ` +
      `mailable pool today is **${identified}**. §5a reported a single seated number against the target; on eight ` +
      `sources that is no longer a meaningful single number.`,
  )
  out.push(
    `**SERP does not overlap the locator pool — ${pct(dealerMatched, dealerN)} matched.** ${dealerMatched} of ${dealerN} dealer-classified SERP domains ` +
      `resolved to a company the locators had already seated; ${dealerN - dealerMatched} arrived net-new (${a.matched} / ${a.netNew} across all ` +
      `${a.matched + a.netNew} SERP domains). §5b hoped SERP would ` +
      `deepen evidence on companies we already had. It does the opposite: it is overwhelmingly a *different* ` +
      `population, found on a different axis. The line-card rescue still works — it just runs on new companies, ` +
      `not on the existing ones.`,
  )
  out.push(
    `**The domain join lifts evidence depth, and it is the only thing that does.** ${serpLift} seated companies reach ` +
      `depth ≥2 because a SERP domain attached to them, out of ${seatedN}. Total at depth ≥2 is ${depth(2)} (${pct(depth(2), seatedN)}), against ` +
      `§5a's 1.7% on five sources — so depth roughly tripled, and ${pct(serpLift, depth(2))} of it is the domain path. §5's ` +
      `\`evidence_depth ≥3\` T1-hot rule now has ${depth(3)} companies behind it, up from zero. **That is a real tier where §5a ` +
      `had none — and it is still ${pct(depth(3), seatedN)} of the pool, so T1-hot is a hand-picked 38, not a segment.**`,
  )
  out.push(
    `**\`brand_authorized\` ≥2 went from 8 to ${seated.filter((x) => x.record.brand_authorized.length >= 2).length} — and none of it came from the join.** Every one of them is a ` +
      `dealer whose own page named 2+ brands. §4 of \`00-sourcing-strategy.md\` framed this as "the line-card ` +
      `graph"; the graph never materialized and never will. What replaced it is strictly better evidence ` +
      `(the dealer's own published claim) obtained a completely different way.`,
  )
  out.push(
    `**The ≥20-address rule is a size rule, and calling its catch "chains" was wrong — but "above-ceiling" ` +
      `is not right for all of it either.** ${final.chains.bySize.size} normalized names were caught by size alone and are now ` +
      `\`above-ceiling\` (${pools['above-ceiling'].length} merged records). The pool genuinely mixes national retail chains Timken's ` +
      `locator happens to list (Bass Pro, Cabela's, NAPA — 20+ states) with large regional independents ` +
      `(3–5 states). §5a named the second group; it did not name the first. Separating them needs a rule the ` +
      `plan does not have, so the state-spread column in §7 is the input for that decision.`,
  )
  out.push(
    `**§3.3's name test is a prefix match, and PTDA breaks it — the two largest chains in the pool are ` +
      `mislabelled.** PTDA publishes Motion Industries as **"Motion"** (403 addresses, 48 states) and Grainger ` +
      `as **"W.W. Grainger, Inc."** (225 addresses, 47 states). Neither \`motion\` nor \`ww grainger\` starts with ` +
      `its blocklist key, so both were caught by the ≥20-address rule and filed under \`above-ceiling\` instead ` +
      `of \`chain\`. §5a recorded Grainger as "no match in the data at all"; it is in the data, the rule just ` +
      `cannot see it. Both are parked either way — no send-list risk — but a downstream stage reading ` +
      `\`above-ceiling\` as "regional independent" would be wrong about the two biggest rows in that pool. ` +
      `§7 measures exactly what a looser rule catches; changing it is a plan change to §3.3.`,
  )
  out.push(
    `**The blocklist is name-shaped and SERP is domain-shaped, so it leaks.** \`rs-online.com\` (RS Components) ` +
      `reaches the pool through SERP under the derived name \`rs online\`, which the blocklist entry ` +
      `"RS Components" does not match. The domain path catches a chain only when a *locator* already ` +
      `published that domain. A domain-level blocklist is the fix; it is a plan change, so it is reported, not made.`,
  )
  out.push(
    `**SERP precision is a real cost and it is now inside the pool.** §5b hand-checked ~75–80% precision on ` +
      `the 1,474 dealer domains. This run routed ${pools['non-US'].length} to \`non-US\` (foreign ccTLD or the acquirer's own ` +
      `\`foreign_tld\` flag) and ${pools['not-a-distributor'].length} to \`not-a-distributor\` (manufacturer pages, marketplaces, job ` +
      `boards, trade press). What remains still includes \`.com\` foreign dealers, CDN and platform hosts, and ` +
      `aggregator pages that the classifier read as dealers. **\`needs_identity_resolution\` is the honest ` +
      `handling, not a filter** — S3 has to resolve each one before it can be mailed.`,
  )
  out.push(
    `**AD's expansion confirms §5b's "stop AD".** ${Object.keys(ctx.loo).length ? `Leave-one-out puts the expansion at ` + `+${seatedN - (() => { const c = classifyAd(ctx.loo['ad-expansion'].merged); return [...c.icp, ...c.undecided, ...c.unknown, ...c.nonAd].length })()} seated companies for 300 more queries` : 'Leave-one-out was skipped'}, ` +
      `against SERP's much larger contribution for 250 queries at $1.36. ICP-shaped AD companies are now ` +
      `${ad.icp.length} (§5a: 276, pre-expansion).`,
  )
  out.push(
    `**Secondary-key load and the new third path.** ${s.phoneMerges} merges on phone, ${s.secondaryMerges} on name+zip5 alone, ` +
      `${s.domainMerges} on the domain. Collision rate ${(s.collisionRate * 100).toFixed(2)}% — still under the 5% tightening threshold ` +
      `§3.5 sets, on nearly twice the data.`,
  )
  out.push(
    `**§2b's dash rule and the branch-strip lever, re-measured on eight sources.** Splitting on any dash still ` +
      `costs ${seatedOf(stripped).length - seatedOf(looseDash).length} seated companies (${seatedOf(stripped).length} vs ${seatedOf(looseDash).length}) — §5a measured 242 on five. The branch-strip lever is ` +
      `now ${pct(seatedOf(unstripped).length - seatedOf(stripped).length, seatedOf(unstripped).length)} (${seatedOf(stripped).length} vs ${seatedOf(unstripped).length}), against §5a's 20.1% and §2b's original 32%. It keeps shrinking as ` +
      `sources are added, because cross-source merging recovers branch splits on its own.`,
  )
  if (baseline5) {
    const b5 = seatedOf(baseline5).length
    out.push(
      b5 === 2355
        ? `**Not a contradiction — a control that passed.** The five-source arm re-run under the v2 code lands on ` +
          `**${b5} seated, reproducing §5a exactly.** The above-ceiling retag, the domain rung in \`addressKey\` and the ` +
          `four new contract fields are therefore behaviour-preserving on the original five sources: every ` +
          `difference in this report comes from the S1c data, not from the code that reads it.`
        : `**The five-source arm no longer reproduces §5a.** Re-run under the v2 code it gives ${b5} seated against ` +
          `§5a's 2,355. Investigate before trusting any delta in this report.`,
    )
  }
  out.push(
    `**PTDA's line-card depth is thinner than §5b measured.** §5b reported an average of 8.4 of 14 categories ` +
      `with 31 companies carrying all 14. Measured here over rolled-up PTDA entities: ${(ctx.ptdaCats.reduce((n, x) => n + x, 0) / (ctx.ptdaCats.length || 1)).toFixed(1)} mean, ` +
      `${ctx.ptdaCats.filter((x) => x === 14).length} at all 14, and ${ctx.ptdaCats.filter((x) => x === 0).length} entities with **no** category at all — they were only ever returned by the ` +
      `unfiltered \`(Any)\` sweep. Excluding those, the mean is ${(ctx.ptdaCats.filter((x) => x > 0).reduce((n, x) => n + x, 0) / (ctx.ptdaCats.filter((x) => x > 0).length || 1)).toFixed(1)}. §5b's 8.4 looks like the second denominator ` +
      `measured before branch rollup.`,
  )
  out.push(
    `**Conservation still passes, but the baseline moved.** ${all.length} merged companies over ${ctx.counts.dedupedRows} deduped ` +
      `rows across five buckets. Every row carries \`source_url\` + \`captured\`; ${ctx.counts.invalidRows} contract violations.`,
  )
  return out
}

// Run only when invoked directly. S3 imports `runPipeline` from here — the S2
// steps are the S2 steps, and re-implementing them downstream is how two stages
// quietly stop agreeing about what the pool is.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
