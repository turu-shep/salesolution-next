#!/usr/bin/env node
/**
 * S3c — the CLASSIFICATION half of S3. `01-build-plan.md` §5c + §4.6.
 *
 *   node emails/scripts/s3c-classify.mjs
 *
 * S3a fixed chain suppression, resolved identity, and ICP-filtered the SERP
 * half. It left five things open, and this stage closes them. It does not rerun
 * S3a — it imports {@link runS3a} and starts from exactly that state, so the
 * conservation check stays row-level (a CSV carries one row per merged company
 * and loses `members`).
 *
 *   1  VERTICAL FILTER OVER EVERY RECORD (§5c.1). S3a classified 1,640
 *      SERP-sourced domains on the stated ground that "the locator sources are
 *      ICP-shaped by construction". Measured, that is false: Timken sells
 *      bearings into the automotive and heavy-truck aftermarket as well as into
 *      industry, and 349 seated names carry "TRUCK", 203 carry "AUTO". Being in
 *      a dealer file proves what a company BUYS, not what trade it sells into.
 *      `lib/vertical.mjs` supplies the name/domain axis, `s3/icp_classify.py
 *      --scope all` the homepage axis, and S3a's snippet discount survives both.
 *
 *   2  MULTI-COMPANY DOMAINS (§5c, the rule the plan lacks). A domain carrying
 *      dozens of differently-named seated companies is either one chain's branch
 *      network or a buying group of independents, and those are opposite for
 *      ICP. Pass 1 resolves most of it — they are mostly automotive. What
 *      survives goes through the independence test.
 *
 *   3  THE above-ceiling SPLIT (§5c). Bass Pro and Cabela's are consumer retail
 *      and do not belong next to Purvis and Hydradyne, which are genuine large
 *      industrial distributors excluded on size alone. Pass 1's verdict does the
 *      splitting; the industrial residue stays as a real asset.
 *
 *   4  SUPPRESSION / DNC JOIN AT PULL TIME (§4.6). The campaign pack calls this
 *      its highest-consequence gap. The join runs here; whether it finds a list
 *      is a measurement, and an honest "no list exists" is the answer the plan
 *      needs if that is what is true.
 *
 *   5  RE-DEDUPE AFTER IDENTITY RESOLUTION (§5c architectural finding). §3.5's
 *      primary key is the phone, and SERP records have none at S2 time. The
 *      identity pass created join keys that did not exist, 19 companies collapsed
 *      on them inside S3a, and the full §3.5 pass has not run since.
 *
 * Writes:
 *   emails/lists/deduped-v4.csv                the seated union
 *   emails/data/side-pools/pool-*.csv          every disposition
 *   emails/data/_s3c-report-<date>.md          every measured number
 *
 * All under gitignored paths. Nothing is deleted — a record that fails a rule
 * gets a `disposition` and a side pool, and the conservation check proves it.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { classifyCategories } from './lib/category.mjs'
import { FIELDS, capturedToday, split, toCsv, validateAll } from './lib/contract.mjs'
import { addressKey, chainNameMatch, crossSourceDedupe, isDomainOnly, mergeRecords } from './lib/dedupe.mjs'
import { streetNumber } from './lib/normalize.mjs'
import {
  VERTICAL_DISPOSITION,
  buildBrandVocabulary,
  classifyIdentity,
  classifyName,
  mergeVerdicts,
  voteDomain,
} from './lib/vertical.mjs'
import { classifyAd } from './s2-dedupe.mjs'
import { runS3a } from './s3-qualify.mjs'

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

/**
 * Pools whose records are still candidates and therefore get routed by the
 * vertical filter. `chain`, `adjacent-trade`, `non-US` and `not-a-distributor`
 * are already out; classifying them is reporting, not routing.
 *
 * `above-ceiling` is in the list because §5c says so — that is task 3.
 * `no-website` is in it because segment W is parked, not rejected: an automotive
 * jobber with no website is still not a prospect.
 */
const ROUTABLE = new Set(['(seated)', 'above-ceiling', 'no-website'])

/**
 * How many distinct seated companies a domain needs before the independence test
 * runs. **Measured, not chosen:** the distribution thins between 4 and 5 — 110
 * domains carry 2 companies, 26 carry 3, 16 carry 4, then 3 carry 5 and the rest
 * jump straight to 8+. Sensitivity at every threshold is in the report.
 */
const MULTI_DOMAIN_TRIGGER = 5

/** §3.3's own size rule, reused rather than reinvented. */
const CEILING_ADDRESSES = 20

const pct = (n, d) => (d ? ((n / d) * 100).toFixed(1) + '%' : '—')
const table = (header, rows) =>
  [header, header.map(() => '---'), ...rows].map((r) => `| ${r.join(' | ')} |`).join('\n')

function loadJson(path) {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null
}

// ─────────────────────────────────────────────────────────────────────────────
// Task 4 — the suppression / DNC join (§4.6)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Where a shared phone DNC list, a prior-contact list or an existing-customer
 * list would live in this repo. Searched in order; the first that exists wins.
 *
 * This list is the search, written down. If none of these exists the stage does
 * not invent one — §4.6 is the campaign pack's highest-consequence gap and a
 * fabricated suppression file would be worse than a recorded absence.
 */
export const SUPPRESSION_CANDIDATES = [
  'data/suppression/dnc.csv',
  'data/suppression/prior-contact.csv',
  'data/suppression/customers.csv',
  'lists/suppression.csv',
  'lists/dnc.csv',
  '../docs/strategy/sales/dnc.csv',
  '../docs/strategy/sales/suppression.csv',
  '../data/dnc.csv',
]

/**
 * Read whatever suppression list is on disk into phone / domain / name keys.
 *
 * @param {string[]} [candidates]
 * @returns {{found: string|null, searched: string[], phones: Set<string>, domains: Set<string>, names: Set<string>, rows: number}}
 */
export function loadSuppression(candidates = SUPPRESSION_CANDIDATES) {
  const out = { found: null, searched: [], phones: new Set(), domains: new Set(), names: new Set(), rows: 0 }
  for (const rel of candidates) {
    const p = resolve(ROOT, rel)
    out.searched.push(rel)
    if (!existsSync(p)) continue
    out.found = rel
    const lines = readFileSync(p, 'utf8').split('\n').filter(Boolean)
    const header = (lines[0] ?? '').toLowerCase().split(',')
    const col = (names) => header.findIndex((h) => names.includes(h.trim()))
    const iPhone = col(['phone', 'phone_e164', 'telephone', 'number'])
    const iDomain = col(['domain', 'website'])
    const iName = col(['company', 'company_display', 'name', 'business'])
    for (const line of lines.slice(1)) {
      const cells = line.split(',')
      out.rows++
      if (iPhone >= 0 && cells[iPhone]) out.phones.add(cells[iPhone].replace(/\D/g, '').slice(-10))
      if (iDomain >= 0 && cells[iDomain]) out.domains.add(cells[iDomain].trim().toLowerCase().replace(/^www\./, ''))
      if (iName >= 0 && cells[iName]) out.names.add(cells[iName].trim().toLowerCase())
    }
    break
  }
  return out
}

/**
 * Join a suppression list against the seated pool. Sets no disposition of its
 * own — §1 has no `suppressed` value — so a hit is reported and the record is
 * routed `dead`, which is the disposition §1 already defines for a record that
 * must never be contacted.
 *
 * @param {{record: Record<string, any>}[]} seated
 * @param {ReturnType<typeof loadSuppression>} list
 */
export function applySuppression(seated, list) {
  const hits = { phone: 0, domain: 0, name: 0, total: 0 }
  if (!list.found) return hits
  for (const m of seated) {
    const r = m.record
    let hit = null
    if (r.phone_e164 && list.phones.has(r.phone_e164)) hit = 'phone'
    else if (r.domain && list.domains.has(r.domain)) hit = 'domain'
    else if (r.company && list.names.has(r.company)) hit = 'name'
    if (!hit) continue
    hits[hit]++
    hits.total++
    r.disposition = 'dead'
  }
  return hits
}

// ─────────────────────────────────────────────────────────────────────────────
// Task 5 — re-entity, so §3.5 can run again on keys that did not exist at S2
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Turn an S3a cluster back into a `crossSourceDedupe` entity, reading the join
 * keys from the MERGED record as well as its members.
 *
 * That is the whole point of the pass: the identity resolver wrote 979 phones
 * and 726 addresses onto merged records, and none of them exists on the member
 * rows S2 built its keys from. An entity rebuilt from members alone would be
 * exactly the entity S2 already deduped, and the re-run would find nothing.
 *
 * @param {{record: Record<string, any>, members: Record<string, any>[], sources: Set<string>}} cluster
 */
export function reEntity(cluster) {
  const rows = [cluster.record, ...cluster.members]
  const phones = new Set()
  const nameZips = new Set()
  const numZips = new Set()
  const domains = new Set()
  for (const r of rows) {
    if (r.phone_e164) phones.add(r.phone_e164)
    if (r.company && r.zip5) nameZips.add(`${r.company}|${r.zip5}`)
    const n = streetNumber(r.address_1)
    if (n && r.zip5) numZips.add(`${n}|${r.zip5}`)
    if (r.domain) domains.add(r.domain)
  }
  return {
    record: cluster.record,
    members: cluster.members,
    phones,
    nameZips,
    numZips,
    domains,
    // Recomputed on the RESOLVED record: a SERP row that now publishes a phone
    // is no longer domain-only, and must not be re-anchored by the domain path.
    domainOnly: isDomainOnly(cluster.record),
    sources: cluster.sources,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Task 2 — the independence test (§5c.2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Does this company stand on its own, or is it a branch of whoever operates the
 * domain it sits on?
 *
 * §5c's two discriminators, verbatim: "do the constituent companies appear in
 * other sources on their own (`evidence_depth` > 1), or hold their own separate
 * domains? Independents sharing a group site do; chain branches do not."
 *
 * @param {{record: Record<string, any>, members: Record<string, any>[]}} cluster
 * @param {string} domain the shared domain under test
 */
export function independenceTest(cluster, domain) {
  const r = cluster.record
  const reasons = []
  if ((r.evidence_depth ?? 1) > 1) reasons.push(`evidence_depth ${r.evidence_depth}`)
  // Its own domain, if any source or its own quoted page published a different one.
  const own = new Set()
  for (const m of cluster.members) if (m.domain && m.domain !== domain) own.add(m.domain)
  for (const u of split(r.self_declaration_url)) {
    const h = hostOf(u)
    if (h && h !== domain) own.add(h)
  }
  if (own.size) reasons.push(`own domain ${[...own][0]}`)
  return { independent: reasons.length > 0, reasons, ownDomain: [...own][0] ?? null }
}

function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every S3c pass, with nothing written — the same contract `runS3a` offers, and
 * for the same reason: S4 has to start from exactly this state, and the CSV
 * loses `members`, which is the only thing that makes conservation row-level.
 *
 * `pipelineOpts` defaults to `{}`, so calling it bare reproduces `deduped-v4.csv`
 * exactly. S4 passes `{ sources: SOURCES_V5, serpWave2: true }` to run the same
 * five tasks over the merged haul.
 *
 * @param {Record<string, any>} [pipelineOpts] forwarded to `runPipeline` via `runS3a`
 * @returns {Record<string, any>} the report context
 */
export function runS3c(pipelineOpts = {}) {
  const s3a = runS3a(pipelineOpts)
  const pools = s3a.pools
  let seated = s3a.seated
  const baseline = {
    seated: seated.length,
    pools: Object.fromEntries(Object.entries(pools).map(([k, v]) => [k, v.length])),
  }

  // ── task 1: the vertical filter, over EVERY record ────────────────────────
  const vertical = loadJson(resolve(ROOT, 'data', 's3', `vertical-${DATE}.json`))
  const textByDomain = new Map()
  for (const r of vertical?.records ?? []) textByDomain.set(r.domain, r)

  /** Every cluster in the union, tagged with the pool it currently sits in. */
  const union = [
    ...seated.map((m) => ({ m, pool: '(seated)' })),
    ...Object.entries(pools).flatMap(([pool, rows]) => rows.map((m) => ({ m, pool }))),
  ]

  // The domain vote is computed over the WHOLE union: the 63 Parts Authority
  // rows and the parent "PARTS AUTHORITY IMC" sitting in above-ceiling are the
  // same evidence about the same domain, and splitting them by pool would throw
  // half of it away.
  const byDomain = new Map()
  for (const { m } of union) {
    const d = m.record.domain
    if (!d) continue
    if (!byDomain.has(d)) byDomain.set(d, [])
    byDomain.get(d).push(m.record)
  }
  const votes = new Map()
  for (const [d, rows] of byDomain) {
    const v = voteDomain(rows)
    if (v) votes.set(d, v)
  }
  // The identity axis's list-free half. Built over the WHOLE union for the same
  // reason the domain vote is: a brand named on a chain's line card is still
  // proof that brand is a manufacturer.
  const brandVocab = buildBrandVocabulary(union.map(({ m }) => m.record))
  // Snapshot BEFORE task 1 mutates dispositions — the §5c table has to be able
  // to say what each named domain carried at v3.
  const seatedAtV3 = new Map()
  for (const m of seated) {
    const d = m.record.domain
    if (d) seatedAtV3.set(d, (seatedAtV3.get(d) ?? 0) + 1)
  }

  const v1 = {
    classified: 0,
    byClass: new Map(),
    byAxis: new Map(),
    uncertain: 0,
    routed: 0,
    movedFrom: new Map(),
    routedByClassFrom: new Map(),
    examples: [],
    byCategory: new Map(),
    byCluster: new Map(),
    byIdentityRule: new Map(),
  }
  for (const { m, pool } of union) {
    const r = m.record
    const name = classifyName(r)
    const text = r.domain ? (textByDomain.get(r.domain) ?? null) : null
    const dv = r.domain ? (votes.get(r.domain) ?? null) : null
    // §5f's DFS category axis. `null` for every record that carries no `DFS:`
    // code — which is every record in a default S3c run — so the axis is silent
    // rather than neutral and v4 reproduces byte-for-byte.
    const cat = classifyCategories(r)
    // Whose site is this. Silent for every record without a domain, and for
    // every domain that is neither on the acquirer's registry nor a brand the
    // program itself has proven is a manufacturer.
    const ident = classifyIdentity(r, brandVocab)
    const v = mergeVerdicts({ name, text, domain: dv, category: cat, identity: ident })
    if (ident) v1.byIdentityRule.set(ident.rule, (v1.byIdentityRule.get(ident.rule) ?? 0) + 1)
    r.icp_class = v.vertical
    r.icp_uncertain = v.uncertain
    // Carried so the report and the shortlist can say WHICH axis spoke — §5e's
    // whole lesson was that nobody could tell afterwards.
    r.vertical_axis = v.axis
    if (cat) {
      r.category_core = cat.core
      r.category_contam = cat.top ? `${cat.top}=${cat.topScore}` : null
      v1.byCategory.set(cat.decisive ? (cat.vertical ?? 'keep') : 'not-decisive', (v1.byCategory.get(cat.decisive ? (cat.vertical ?? 'keep') : 'not-decisive') ?? 0) + 1)
      if (cat.top) v1.byCluster.set(cat.top, (v1.byCluster.get(cat.top) ?? 0) + 1)
    }
    v1.classified++
    if (v.uncertain) v1.uncertain++
    v1.byClass.set(v.vertical, (v1.byClass.get(v.vertical) ?? 0) + 1)
    const axisKey = `${pool}##${v.axis}`
    v1.byAxis.set(axisKey, (v1.byAxis.get(axisKey) ?? 0) + 1)

    if (!ROUTABLE.has(pool)) continue
    const disp = VERTICAL_DISPOSITION[v.vertical]
    if (disp == null || disp === r.disposition) continue
    r.disposition = disp
    v1.routed++
    v1.movedFrom.set(`${pool} → ${disp}`, (v1.movedFrom.get(`${pool} → ${disp}`) ?? 0) + 1)
    const k = `${pool}##${v.vertical}`
    v1.routedByClassFrom.set(k, (v1.routedByClassFrom.get(k) ?? 0) + 1)
    if (v1.examples.length < 24)
      v1.examples.push({
        display: r.company_display,
        domain: r.domain,
        pool,
        to: disp,
        cls: v.vertical,
        axis: v.axis,
        why: v.evidence,
      })
  }

  const reroute = () => {
    const stay = []
    for (const m of seated) {
      const d = m.record.disposition ?? null
      if (d === null) stay.push(m)
      else if (pools[d]) pools[d].push(m)
      else stay.push(m)
    }
    seated = stay
    for (const [pool, rows] of Object.entries(pools)) {
      const keep = []
      for (const m of rows) {
        const d = m.record.disposition ?? null
        if (d === pool) keep.push(m)
        else if (d === null) seated.push(m)
        else if (pools[d]) pools[d].push(m)
        else keep.push(m)
      }
      pools[pool] = keep
    }
  }
  reroute()

  // ── task 3b: §2a's own division rule, on a pool it never ran on ───────────
  //
  // `s3-qualify` calls `classifyAd(run.merged)` and `run.merged` IS the seated
  // class — so a company the ≥20-address rule tagged `above-ceiling` at step 3
  // never reached AD's division classifier at step 6. Measured, that left
  // electrical and plumbing wholesalers in the pool §5c wants to keep as "genuine
  // large industrial distributors": Facility Solutions Group carries `AD:ESD
  // Electrical` and nothing else, Habegger carries ESD+HVAC, Hirsch Pipe and Van
  // Marcke carry HVAC+PLBG. This is §2a's rule as written, applied to the records
  // it skipped — not a new rule.
  const adCeiling = classifyAd(pools['above-ceiling'])
  const adCeilingMoved = []
  for (const m of adCeiling.adjacent) {
    m.record.disposition = 'adjacent-trade'
    adCeilingMoved.push({ display: m.record.company_display, lc: m.record.line_card })
  }
  reroute()

  // ── task 3: what the split did to above-ceiling ───────────────────────────
  const ceilingSplit = {
    adMoved: adCeilingMoved,
    before: baseline.pools['above-ceiling'],
    after: pools['above-ceiling'].length,
    left: [...v1.routedByClassFrom.entries()]
      .filter(([k]) => k.startsWith('above-ceiling##'))
      .map(([k, n]) => [k.split('##')[1], n])
      .sort((a, b) => b[1] - a[1]),
    kept: pools['above-ceiling'].map((m) => ({
      display: m.record.company_display,
      domain: m.record.domain,
      loc: m.record.location_count,
      src: m.record.source,
    })),
  }

  // ── task 2: multi-company domains ─────────────────────────────────────────
  const multi = runMultiDomain(seated)
  seated = multi.seated
  reroute()

  // ── task 5: re-dedupe on keys identity resolution created ─────────────────
  const entities = seated.map(reEntity)
  const redupe = crossSourceDedupe(entities, { tighten: false, domainJoin: false })
  const before5 = seated.length
  seated = redupe.merged
  const merges5 = before5 - seated.length

  // ── task 4: the suppression / DNC join, at pull time ──────────────────────
  const suppression = loadSuppression()
  const dnc = applySuppression(seated, suppression)
  reroute()

  // ── conservation ──────────────────────────────────────────────────────────
  const members = (rows) => rows.reduce((n, m) => n + m.members.length, 0)
  const poolMembers = Object.fromEntries(Object.entries(pools).map(([k, v]) => [k, members(v)]))
  const seatedMembers = members(seated)
  const totalOut = seatedMembers + Object.values(poolMembers).reduce((a, b) => a + b, 0)
  const dedupedRows = s3a.counts.dedupedRows

  const invalid = validateAll(seated.map((m) => m.record)).invalid

  return {
    s3a,
    baseline,
    seated,
    pools,
    v1,
    votes,
    byDomain,
    seatedAtV3,
    ceilingSplit,
    multi,
    redupe: { stats: redupe.stats, merges: merges5, before: before5 },
    suppression,
    dnc,
    invalid,
    counts: {
      dedupedRows,
      seatedMembers,
      poolMembers,
      totalOut,
      conserved: totalOut === dedupedRows,
    },
  }
}

function main() {
  console.log(`S3c — classify (the other half) · ${DATE}`)

  const ctx = runS3c()
  const { seated, pools, invalid } = ctx

  mkdirSync(resolve(ROOT, 'lists'), { recursive: true })
  mkdirSync(resolve(ROOT, 'data', 'side-pools'), { recursive: true })
  writeFileSync(resolve(ROOT, 'lists', 'deduped-v4.csv'), toCsv(seated.map((m) => m.record), FIELDS))
  for (const [disp, file] of SIDE_POOLS)
    writeFileSync(resolve(ROOT, 'data', 'side-pools', file), toCsv((pools[disp] ?? []).map((m) => m.record), FIELDS))

  const report = buildReport(ctx)
  writeFileSync(resolve(ROOT, 'data', `_s3c-report-${DATE}.md`), report)
  console.log(report)
  console.log(`\nwrote emails/lists/deduped-v4.csv (${seated.length})`)
  for (const [disp, file] of SIDE_POOLS) console.log(`wrote emails/data/side-pools/${file} (${pools[disp].length})`)
  console.log(`wrote emails/data/_s3c-report-${DATE}.md`)
  if (!ctx.counts.conserved || invalid.length) process.exitCode = 1
}

/**
 * §5c.2 — resolve the domains that carry many distinct seated companies.
 *
 * Order is §5c's: the vertical filter has already run, so what arrives here is
 * whatever survived it. Every survivor gets the independence test per company.
 *
 * **What happens to a company that FAILS.** §5c says "those that fail → chain".
 * Applied literally that is wrong for at least one measured case, and this stage
 * says so rather than tuning around it: a company that fails the test is a
 * BRANCH, and the pipeline already has a rule for branches — §3.4 rolls them up
 * into one company and §3.3 then decides that company. So the failing
 * constituents of a domain are collapsed into one record and §3.3's own two
 * tests are re-applied to it: a name on the blocklist is a `chain`, ≥20 distinct
 * addresses is `above-ceiling` (§5a's correction — size is not identity), and
 * anything else is ONE seated company. The report names every case where that
 * verdict differs from "→ chain".
 */
function runMultiDomain(seatedIn) {
  const byDomain = new Map()
  for (const m of seatedIn) {
    const d = m.record.domain
    if (!d) continue
    if (!byDomain.has(d)) byDomain.set(d, [])
    byDomain.get(d).push(m)
  }

  const sensitivity = []
  for (const k of [2, 3, 4, 5, 10, 20]) {
    const doms = [...byDomain.values()].filter((v) => v.length >= k)
    sensitivity.push([k, doms.length, doms.reduce((n, v) => n + v.length, 0)])
  }

  const targets = [...byDomain.entries()]
    .filter(([, v]) => v.length >= MULTI_DOMAIN_TRIGGER)
    .sort((a, b) => b[1].length - a[1].length)

  const absorbed = new Set()
  const outcomes = []
  for (const [domain, group] of targets) {
    const passed = []
    const failed = []
    for (const m of group) {
      const t = independenceTest(m, domain)
      if (t.independent) passed.push({ m, t })
      else failed.push({ m, t })
    }

    // A passing company keeps its seat and is re-keyed to its own domain where
    // one exists, so it stops looking like a tenant of the group site.
    let rekeyed = 0
    for (const { m, t } of passed) {
      if (t.ownDomain) {
        m.record.domain = t.ownDomain
        rekeyed++
      }
    }

    let verdict = 'all independent'
    let collapsedRecord = null
    if (failed.length > 1) {
      const rows = failed.map((f) => f.m)
      const record = mergeRecords(rows.map((r) => r.record))
      const memberRows = rows.flatMap((r) => r.members)
      const sources = new Set(rows.flatMap((r) => [...r.sources]))
      const addrs = new Set(memberRows.map(addressKey))
      record.domain = domain
      record.evidence_depth = sources.size
      record.location_count = addrs.size
      record.needs_identity_resolution = rows.every((r) => r.record.needs_identity_resolution === true)

      // §3.3, unchanged, applied to the collapsed company.
      const named = chainNameMatch(record.company)
      if (named) {
        record.disposition = 'chain'
        verdict = `chain (name → ${named})`
      } else if (addrs.size >= CEILING_ADDRESSES) {
        record.disposition = 'above-ceiling'
        verdict = `above-ceiling (${addrs.size} distinct addresses)`
      } else {
        verdict = `one seated company (${addrs.size} distinct addresses, under the ${CEILING_ADDRESSES} ceiling)`
      }
      for (const r of rows) absorbed.add(r)
      collapsedRecord = { record, members: memberRows, sources, entities: rows }
    } else if (failed.length === 1) {
      verdict = 'single dependent row, left alone'
    }

    outcomes.push({
      domain,
      n: group.length,
      passed: passed.length,
      failed: failed.length,
      rekeyed,
      verdict,
      collapsed: collapsedRecord,
      passedNames: passed.map((p) => ({ display: p.m.record.company_display, why: p.t.reasons.join(', ') })),
      display: group[0].record.company_display,
    })
  }

  const seated = seatedIn.filter((m) => !absorbed.has(m))
  for (const o of outcomes) if (o.collapsed) seated.push(o.collapsed)
  return { seated, outcomes, sensitivity, trigger: MULTI_DOMAIN_TRIGGER, targets: targets.length }
}

// ─────────────────────────────────────────────────────────────────────────────
// Report
// ─────────────────────────────────────────────────────────────────────────────

function buildReport(ctx) {
  const { s3a, baseline, seated, pools, v1, ceilingSplit, multi, redupe, suppression, dnc, counts, invalid } = ctx
  const L = []
  const p = (s = '') => L.push(s)
  const all = [...seated, ...Object.values(pools).flat()]
  const unresolved = seated.filter((m) => m.record.needs_identity_resolution).length
  const identified = seated.length - unresolved

  p(`# S3c report — the vertical filter, the multi-company domains, the DNC gap`)
  p()
  p(`**Date:** ${DATE} · **Stage:** S3 classification half (build-plan §5c.1–2, §5c's above-ceiling split, §4.6, §5c's re-dedupe finding)`)
  p(`**Input:** \`emails/lists/deduped-v3.csv\` (seated ${baseline.seated}) · **Output:** \`emails/lists/deduped-v4.csv\``)
  p(`**Note on the side pools:** this stage regenerates \`emails/data/side-pools/*.csv\` at v4 content, exactly as S3a`)
  p(`regenerated them at v3. The v3 per-pool counts are in \`_s3a-report-2026-08-01.md\`; \`deduped-v3.csv\` is left on`)
  p(`disk untouched, so the v3 → v4 comparison stays exact and re-runnable.`)
  p(`**Not run here:** catalog depth (§4.3), e-commerce detection (§4.4) and the size proxies (§4.5) are the parallel`)
  p(`enrichment pass and the tiering stage. This report is a CORRECTNESS number, not a qualified one.`)
  p()

  // ── 1 ─────────────────────────────────────────────────────────────────────
  p(`## 1. The vertical filter — run over every record, not just the SERP half`)
  p()
  p(`S3a classified ${s3a.icp?.records.length ?? 0} SERP-sourced domains and gave everything else a free pass, on the stated`)
  p(`ground that "the seven locator sources are ICP-shaped by construction". **Measured, that is false.**`)
  p(`Timken sells bearings into the automotive and heavy-truck aftermarket as well as into industry, so its`)
  p(`dealer file carries automotive jobbers and truck dealerships alongside industrial distributors. Being in a`)
  p(`manufacturer's dealer file proves a company BUYS that manufacturer's parts; it does not prove what trade it`)
  p(`sells into.`)
  p()
  p(`${v1.classified} companies classified — the whole union, every pool. Three axes: the published name and domain`)
  p(`label (\`lib/vertical.mjs\`), the homepage text (\`s3/icp_classify.py --scope all\`, zero network, the same`)
  p(`cached pages S3a read), and a per-domain vote for rows whose own name says nothing. S3a's snippet discount`)
  p(`survives inside the Python classifier untouched.`)
  p()
  p(
    table(
      ['Vertical', 'Companies', 'Share', 'Routes to'],
      [...v1.byClass.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([k, n]) => [`\`${k}\``, n, pct(n, v1.classified), VERTICAL_DISPOSITION[k] ?? 'seated']),
    ),
  )
  p()
  p(`**${v1.routed} records changed pool.** Where they came from and where they went:`)
  p()
  p(
    table(
      ['Move', 'Companies'],
      [...v1.movedFrom.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => [k, n]),
    ),
  )
  p()
  p(
    table(
      ['Seated pool', 'v3', 'v4', 'Δ'],
      [
        ['seated', baseline.seated, seated.length, delta(seated.length - baseline.seated)],
        ...SIDE_POOLS.map(([d]) => [
          d,
          baseline.pools[d],
          pools[d].length,
          delta(pools[d].length - baseline.pools[d]),
        ]),
      ],
    ),
  )
  p()
  p(`Which axis decided, for the records that moved out of a candidate pool:`)
  p()
  p(
    table(
      ['Pool ## axis', 'Companies'],
      [...v1.byAxis.entries()]
        .filter(([k]) => ROUTABLE.has(k.split('##')[0]))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([k, n]) => [k.replace('##', ' · '), n]),
    ),
  )
  p()
  if (v1.examples.length) {
    p(`A sample of what moved:`)
    p()
    p(
      table(
        ['Published as', 'Domain', 'From', 'To', 'Vertical', 'Axis', 'Evidence'],
        v1.examples.map((e) => [
          (e.display ?? '').slice(0, 38),
          e.domain ?? '—',
          e.pool,
          e.to,
          e.cls,
          e.axis,
          (e.why ?? '').slice(0, 34),
        ]),
      ),
    )
    p()
  }
  p(`**${v1.uncertain} companies are flagged \`icp_uncertain\` and KEPT** — S3a's rule and the plan's: an ambiguous`)
  p(`record is tiered low by S4, never deleted by S3.`)
  p()

  // ── 2 ─────────────────────────────────────────────────────────────────────
  p(`## 2. Multi-company domains — the rule §5c says the plan lacks`)
  p()
  p(`§5c predicted the vertical filter would "remove most of these outright". Measured against the seven domains`)
  p(`§5c names:`)
  p()
  p(
    table(
      ['Domain', 'Seated companies at v3', 'After the vertical filter', 'Verdict'],
      NAMED_DOMAINS.map((d) => {
        const v3n = ctx.seatedAtV3.get(d) ?? 0
        const o = multi.outcomes.find((x) => x.domain === d)
        const now = seated.filter((m) => m.record.domain === d).length
        return [`\`${d}\``, v3n || '—', now, o ? o.verdict : now ? 'below the trigger' : 'removed by the vertical filter']
      }),
    ),
  )
  p()
  p(`Trigger: **≥${multi.trigger} distinct seated companies on one domain**, measured not chosen — the distribution thins`)
  p(`between 4 and 5. Sensitivity:`)
  p()
  p(
    table(
      ['Threshold', 'Domains', 'Seated companies under them'],
      multi.sensitivity.map(([k, d, n]) => [`≥${k}`, d, n]),
    ),
  )
  p()
  p(`${multi.targets} domains cleared the trigger after the vertical filter. Per-domain outcome:`)
  p()
  p(
    table(
      ['Domain', 'Companies', 'Independent', 'Branch', 'Re-keyed', 'Verdict'],
      multi.outcomes.map((o) => [`\`${o.domain}\``, o.n, o.passed, o.failed, o.rekeyed, o.verdict]),
    ),
  )
  p()
  for (const o of multi.outcomes) {
    if (!o.passedNames.length) continue
    p(`**\`${o.domain}\` — the ${o.passed} that passed the independence test:** ` + o.passedNames.map((x) => `${x.display} (${x.why})`).join(' · '))
    p()
  }

  // ── 3 ─────────────────────────────────────────────────────────────────────
  p(`## 3. \`above-ceiling\`, split`)
  p()
  const ceilLeft = ceilingSplit.left.reduce((n, [, v]) => n + v, 0)
  p(`**${ceilingSplit.before} in · ${ceilLeft} routed out by vertical · ${ceilingSplit.adMoved.length} by §2a's own division rule · ${ceilingSplit.after} remain · ` +
    `+${pools['above-ceiling'].length - ceilingSplit.after} arriving from task 2's collapse = **${pools['above-ceiling'].length}** in \`pool-above-ceiling.csv\`.**`)
  p()
  p(`What left, by vertical:`)
  p()
  p(
    ceilingSplit.left.length
      ? table(['Vertical', 'Companies', 'Routed to'], ceilingSplit.left.map(([k, n]) => [`\`${k}\``, n, VERTICAL_DISPOSITION[k]]))
      : '_Nothing left the pool._',
  )
  p()
  if (ceilingSplit.adMoved.length) {
    p(`Plus ${ceilingSplit.adMoved.length} that §2a's OWN division rule would have parked at S2 and never got the chance to —`)
    p('`s3-qualify` runs `classifyAd` over the seated class only, so a company the ≥20-address rule tagged')
    p('`above-ceiling` at step 3 skipped step 6 entirely:')
    p()
    p(
      table(
        ['Published as', 'AD divisions'],
        ceilingSplit.adMoved.map((x) => [(x.display ?? '').slice(0, 44), (Array.isArray(x.lc) ? x.lc : String(x.lc ?? '').split('|')).filter((c) => String(c).startsWith('AD:')).join(', ')]),
      ),
    )
    p()
  }
  p(`What stays is the asset §5c asked for — genuine large industrial distributors, excluded on size alone.`)
  p(`Read the plumbing-and-electrical-looking names in it against §2a rather than against instinct: The Granite`)
  p(`Group, Cregger, Keller Supply, Northeastern Supply and Coburn all carry \`AD:PVF Pipe, Valves & Fittings\`,`)
  p(`which is one of §2a's three ICP divisions, and Kirby Risk carries \`AD:BPT\`. §2a seats on the UNION of a`)
  p(`company's divisions; that rule is doing exactly what it says, and changing it is a plan decision, not a bug fix.`)
  p()
  p()
  p(
    table(
      ['Published as', 'Domain', 'Distinct addresses', 'Sources'],
      ceilingSplit.kept
        .sort((a, b) => b.loc - a.loc)
        .slice(0, 30)
        .map((k) => [(k.display ?? '').slice(0, 44), k.domain ?? '—', k.loc, k.src]),
    ),
  )
  p()

  // ── 4 ─────────────────────────────────────────────────────────────────────
  p(`## 4. Suppression / DNC join (§4.6) — the measurement`)
  p()
  if (suppression.found) {
    p(`Joined \`${suppression.found}\` (${suppression.rows} rows). Matches: phone ${dnc.phone} · domain ${dnc.domain} · name ${dnc.name} · **total ${dnc.total}**, all routed \`dead\`.`)
  } else {
    p(`**No suppression list exists in this repository. The join ran and matched nothing, because there is nothing to match against.**`)
    p()
    p(`Searched, in order — none of these files exists:`)
    p()
    for (const s of suppression.searched) p(`- \`emails/${s.replace(/^\.\.\//, '')}\``)
    p()
    p(`What DOES exist, and why none of it is a list:`)
    p()
    p(
      table(
        ['Artifact', 'What it actually is'],
        [
          [
            '`lib/sales/playbook/metrics.ts` → `CallLog.doNotCall`',
            'a per-call checkbox in the /sales cockpit. `components/sales/cockpit/useCallLog.ts` persists the log to **browser localStorage** (`sales.cockpit.calllog`) and nowhere else — there is no export, no file, no server. A DNC ticked on one machine is invisible to this pipeline.',
          ],
          [
            'Sanity `precallLead`',
            '**0 documents in the production dataset** (queried 2026-08-01). The schema is the local-services pre-call scanner — dental / home-services verticals, no DNC field, and the wrong vertical for this campaign anyway.',
          ],
          ['`scripts/precall.targets.json`', 'a DataForSEO *query* spec (dental + roofing, three cities). Not contacts.'],
          [
            '`docs/strategy/sales/07-compliance.md`',
            'DNC **policy** — "if it\'s on the registry, the B2B exemption doesn\'t reliably save me. Scrub it." It states the requirement and ships no list.',
          ],
          ['HubSpot', '`HUBSPOT_PORTAL_ID` is set for the site\'s forms. No contact export is in the repo and nothing here can read it.'],
        ],
      ),
    )
    p()
    p(`**This is the gap, recorded.** §4.6 calls the suppression join the campaign pack's highest-consequence gap;`)
    p(`the honest state is that the join has no input. Two things follow, and both are decisions for the founder,`)
    p(`not for this stage:`)
    p()
    p(`1. **Nothing suppresses a prior contact or an existing customer today.** Every one of the ${seated.length} seated`)
    p(`   companies is treated as never-touched. If any of them has been called or emailed before, this pipeline`)
    p(`   cannot know.`)
    p(`2. **The National DNC registry is not in the repo and cannot be.** It is a paid subscription per area code;`)
    p(`   07-compliance.md already reasons that ordinary B2B calls sit outside it, but that reasoning is about`)
    p(`   *calls*, and it does not create a list for *email* suppression either.`)
    p()
    p(`The join is wired and tested: drop a CSV with a \`phone\`/\`domain\`/\`company\` column at any of the paths above`)
    p(`and the next run suppresses on it. \`loadSuppression()\` + \`applySuppression()\` in \`scripts/s3c-classify.mjs\`.`)
  }
  p()

  // ── 5 ─────────────────────────────────────────────────────────────────────
  p(`## 5. Re-dedupe after identity resolution`)
  p()
  p(`§5c's architectural finding: §3.5's primary key is the phone, SERP records have none by construction, and`)
  p(`the identity pass supplied 979 phones and 726 addresses that did not exist when S2 built its keys. S3a ran`)
  p(`the PHONE half of §3.5 and found 19 collapses. This is the full pass — phone, then name+zip5 with the`)
  p(`street-number tiebreak — over entities rebuilt from the RESOLVED records.`)
  p()
  p(
    table(
      ['Measure', 'Value'],
      [
        ['Seated companies in', redupe.before],
        ['…out', seated.length],
        ['**Further merges**', `**${redupe.merges}**`],
        ['…on the phone key', redupe.stats.phoneMerges],
        ['…on name+zip5', redupe.stats.secondaryMerges],
        ['secondary candidate pairs', redupe.stats.candidatePairs],
        ['…already joined by phone', redupe.stats.alreadyJoinedByPhone],
        ['…conflicting (the collision rate)', `${redupe.stats.conflicting} (${pct(redupe.stats.conflicting, redupe.stats.candidatePairs)})`],
        ['suppressed by the conflict test', redupe.stats.suppressedByTighten],
      ],
    ),
  )
  p()
  p(`The domain path is **off** for this pass (\`domainJoin: false\`). The new information identity resolution`)
  p(`created is phones and addresses; the domain key already ran at S2, and §5c.2 has just spent this whole`)
  p(`stage establishing that a shared domain is exactly the join you cannot trust.`)
  p()

  // ── 6 ─────────────────────────────────────────────────────────────────────
  p(`## 6. The seated pool`)
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
  p(`v3 read ${baseline.seated} seated / ${baseline.seated - s3a.seated.filter((m) => m.record.needs_identity_resolution).length} identified.`)
  p()
  const fill = (rows, f) => rows.filter((m) => m.record[f]).length
  const idRows = seated.filter((m) => !m.record.needs_identity_resolution)
  p(
    table(
      ['Field', `Union (${all.length})`, `Seated (${seated.length})`, `Seated + identified (${identified})`],
      ['domain', 'phone_e164', 'address_1', 'city', 'zip5', 'email', 'self_declaration', 'company_display'].map((f) => [
        f,
        `${fill(all, f)}  ${pct(fill(all, f), all.length)}`,
        `${fill(seated, f)}  ${pct(fill(seated, f), seated.length)}`,
        `${fill(idRows, f)}  ${pct(fill(idRows, f), identified)}`,
      ]),
    ),
  )
  p()
  const decls = seated.map((m) => m.record.self_declaration).filter(Boolean)
  const caps = decls.filter((d) => d === d.toUpperCase() && /[A-Z]/.test(d)).length
  const mid = decls.filter((d) => /^[,;]/.test(d) || /^[a-z]/.test(d)).length
  p(`\`self_declaration\` is carried **byte-exact**: ${decls.length} seated declarations, of which ${mid} begin mid-sentence and ${caps} are`)
  p(`published in full capitals. Untouched here — trimming is S7's copy decision, not S3's data decision.`)
  p()
  p(`Contract validation on the seated list: **${invalid.length} invalid rows**${invalid.length ? ' — ' + invalid[0].errors.join('; ') : ''}.`)
  p()

  // ── 7 ─────────────────────────────────────────────────────────────────────
  p(`## 7. Side pools and the conservation check`)
  p()
  p(
    table(
      ['Disposition', 'Companies', 'Deduped rows under them', 'File'],
      SIDE_POOLS.map(([d, f]) => [
        `\`${d}\``,
        (pools[d] ?? []).length,
        counts.poolMembers[d] ?? 0,
        `\`emails/data/side-pools/${f}\``,
      ]).concat([['**(seated)**', `**${seated.length}**`, counts.seatedMembers, '`emails/lists/deduped-v4.csv`']]),
    ),
  )
  p()
  p(`**Total union: ${all.length} companies.**`)
  p()
  p(
    table(
      ['Conservation', 'Records'],
      [
        ['Deduped rows in (the S2 baseline)', counts.dedupedRows],
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
  p(`Every row carries \`source_url\` + \`captured\`.`)
  p()

  // ── 8 ─────────────────────────────────────────────────────────────────────
  p(`## 8. What contradicts the plan`)
  p()
  for (const line of contradictions(ctx)) p(`- ${line}`)
  return L.join('\n') + '\n'
}

/** The domains §5c names by hand, in its own order. */
const NAMED_DOMAINS = [
  'partsauthority.com',
  'rushtruckcenters.com',
  'napaonline.com',
  'mhc.com',
  'singerindustrial.com',
  'otcindustrial.com',
  'theprontonetwork.com',
]

const delta = (n) => (n === 0 ? '—' : n > 0 ? `+${n}` : String(n))
const band = (n) => (n < 2500 ? `${2500 - n} under the low end` : n > 3500 ? `${n - 3500} over the high end` : 'in range')

function contradictions(ctx) {
  const { seated, v1, multi, ceilingSplit, redupe, suppression, counts } = ctx
  const out = []
  const seatedRouted = [...v1.movedFrom.entries()]
    .filter(([k]) => k.startsWith('(seated) →'))
    .reduce((n, [, v]) => n + v, 0)
  const auto = v1.byClass.get('auto-parts') ?? 0
  const truck = v1.byClass.get('truck-fleet') ?? 0
  const other = v1.byClass.get('other-trade') ?? 0

  out.push(
    `**"The locator sources are ICP-shaped by construction" is false, and it cost ${seatedRouted} of the 3,530 seated records.** ` +
      `S3a's ICP pass skipped every locator- and directory-sourced record on that assumption. Classified, the union ` +
      `holds ${truck} truck/fleet companies and ${auto} automotive ones. A manufacturer's dealer file proves what a company ` +
      `BUYS; the trade it sells into is a separate fact and has to be measured separately.`,
  )
  out.push(
    `**The name outranks the homepage when a domain has many occupants — the opposite of S3a's precedence.** S3a made ` +
      `the homepage the evidence because it was classifying one company per domain. §5c's population is 63 Parts ` +
      `Authority branches on one homepage. The homepage is per-DOMAIN evidence; the published name is per-RECORD, and ` +
      `it is the record that carries a disposition. The snippet discount S3a actually measured is untouched.`,
  )
  const pronto = multi.outcomes.find((o) => o.domain === 'theprontonetwork.com')
  out.push(
    `**§5c is wrong about \`theprontonetwork.com\`, and the error is a vertical error, not a structural one.** The brief ` +
      `says its 13 companies "must be KEPT" because it is a buying group of independents. It IS a buying group of ` +
      `independents — and they are **automotive** independents. Its 14 seated rows read SOUTH LYON PARTS PLUS, ROTHBURY ` +
      `PARTS PLUS, PARTS AUTHORITY ANSONIA, WAYLAND PARTS PLUS: Parts Plus and Parts Authority are the Pronto Network's ` +
      `automotive banners. All 14 route \`not-a-distributor\` at task 1 and never reach the independence test` +
      `${pronto ? '' : ' — the domain is not in the task-2 population at all'}. Structure was never the discriminator here; vertical was.`,
  )
  out.push(
    `**"Fail the independence test → chain" is wrong for the branch networks of mid-size independents.** ` +
      multi.outcomes
        .filter((o) => o.verdict.startsWith('one seated company'))
        .map((o) => `\`${o.domain}\` (${o.n} rows → 1 company, ${o.verdict.match(/\d+/)?.[0]} addresses)`)
        .join(', ') +
      `. Those are one company's branches that the normalizer could not collapse because the source publishes the ` +
      `BRANCH as the member name — AD lists Paramount Supply's members as "Houston", "Phoenix", "Seattle". Tagging ` +
      `them \`chain\` would suppress a real prospect. §3.4 already has the right rule (roll the branches up) and §3.3 ` +
      `already has the right test for what comes out; this stage reuses both rather than inventing a third.`,
  )
  out.push(
    `**The above-ceiling pool held three populations, not two.** §5c says it mixes retail with large industrial. ` +
      `Measured: ${ceilingSplit.before} → ${ctx.pools['above-ceiling'].length}, and what left was ` +
      ceilingSplit.left.map(([k, n]) => `${n} ${k}`).join(', ') +
      `, plus ${ceilingSplit.adMoved.length} that §2a's division rule would have parked at S2 had \`classifyAd\` ever run on this pool` +
      `. The electrical, plumbing and building-supply houses (Elliott Electric, Southern Pipe, Crescent Electric, ` +
      `Hirsch Pipe) are neither retail nor our ICP — they are §2a's adjacent trades, arriving through a source that ` +
      `carries no division code.`,
  )
  out.push(
    `**The vertical filter decides §2a's UNDECIDED GSD division, on evidence §2a did not have.** ${other} companies ` +
      `classify \`other-trade\`, and the largest block is gypsum / drywall / building-materials houses that §2a parked ` +
      `as "GSD partial" and seated. They are routed on their OWN published names ("Action Gypsum Supply", "Carolina ` +
      `Drywall Supply"), never on the \`AD:\` line-card string — that is excluded from the classifier on purpose, ` +
      `because re-reading a division code §2a already spent would be a plan change dressed as a measurement. ` +
      `**GSD is now decided in practice. §2a should say so.**`,
  )
  out.push(
    `**The re-dedupe finds ${redupe.merges} further merges** on top of S3a's 19. ` +
      (redupe.merges > 0
        ? `${redupe.stats.phoneMerges} joined on a phone and ${redupe.stats.secondaryMerges} on name+zip5, so the identity pass created BOTH kinds ` +
          `of key, not just phones. §3.5 has to run after every identity-resolving stage, not once after S2.`
        : `That is a smaller residue than S3a's phone-only pass, which means S3a's post-resolution join already ` +
          `absorbed the available collapses — but it had to be measured, not assumed.`),
  )
  if (!suppression.found) {
    out.push(
      `**§4.6 cannot run: there is no suppression list, no prior-contact list and no customer list in this repo.** ` +
        `The only \`doNotCall\` in the codebase is a checkbox in the /sales cockpit that persists to browser ` +
        `localStorage and is never exported. Sanity holds **0** \`precallLead\` documents, and that schema is the ` +
        `dental/home-services scanner anyway. \`07-compliance.md\` states the DNC requirement and ships no list. ` +
        `**Every seated company is being treated as never-contacted, and nothing in the pipeline can verify that.** ` +
        `The join is built and wired to eight conventional paths; it is waiting on data, not on code.`,
    )
  }
  out.push(
    `**The seated count is still a correctness number.** Catalog depth (§4.3), e-commerce detection (§4.4) and the ` +
      `$2M size floor (§4.5) have not run. ${seated.length} is what survives identity and ICP; §4.5 will move it down again.`,
  )
  if (!counts.conserved)
    out.push(`**CONSERVATION FAILED — ${counts.dedupedRows} in, ${counts.totalOut} out. Investigate before anything reads this list.**`)
  return out
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
