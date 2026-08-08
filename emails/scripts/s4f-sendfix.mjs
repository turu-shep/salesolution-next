#!/usr/bin/env node
/**
 * S4f — the four send-blocking defects in build-plan §5t, swept over the whole
 * list rather than patched on the rows already named.
 *
 *   D1  A manufacturer's own inbox seated as the prospect's contact.
 *       `info.us@nord.com` is NORD Drivesystems' US address, published on its
 *       dealer locator for dealers that list none of their own. Mailing one
 *       sends a pitch about a distributor's catalog to the manufacturer whose
 *       products they carry. **Rule, not a fix list:** an email whose domain is
 *       a known manufacturer domain and is not the company's own apex is
 *       invalid. Nulled, with the reason recorded.
 *   D2  A NEGATED declaration inside a sendable row. §5o's "zero leaked" held
 *       for the first-send cohort, not for `seated-v2`. Brokers publish the
 *       inverse sentence — "is **not** an authorized distributor" — and quoting
 *       one back at a prospect would be a catastrophe.
 *   D3  A null `state` passing the non-US filter. That is how a Windsor,
 *       **Ontario** company reached rank 200 of a US-only list.
 *   D4  The detector's signal D3 firing against a company's own brand.
 *       `vikingpump.com` scored TOWARD distributor because `brand_authorized`
 *       held "Viking" — its own name.
 *
 * Plus the duplicate `rg-group.com` / `benzhydraulics.com`, which are one
 * company under two domains.
 *
 * ## Two phases, because D4 routes on a reading and not on a score
 *
 *   `--audit`  scores every seated row against the corrected detector and writes
 *              `data/_sendfix-candidates-<date>.json` — the candidates with the
 *              page evidence needed to read them. Writes no list.
 *   (default)  reads `data/_sendfix-adjudication-<date>.json` — the hand
 *              verdicts — and writes `seated-v3.csv`, the corrected cohort and
 *              the side pools.
 *
 * §5s's rule is binding here: **structural checks cannot detect field-level
 * corruption.** A prior pass blanked 35,927 fields while producing an identical
 * header, the right row count and a passing conservation check. Every file this
 * script writes is read back and diffed field-for-field against the record it
 * intended to write, by a parser independent of the writer, and the run fails if
 * a single cell differs.
 *
 * Usage:
 *   node emails/scripts/s4f-sendfix.mjs --audit
 *   node emails/scripts/s4f-sendfix.mjs
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { FIELDS_V7, fromCsv, parseCsv, split, toCsv } from './lib/contract.mjs'
import { buildVocab, makeScorer, manufacturerPreFilter } from './lib/manufacturer.mjs'
import { declarationIsNegated, declarationNegationSuspect, emailVerdict, usGeoVerdict } from './lib/sendcheck.mjs'
import { buildBrandVocabulary } from './lib/vertical.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const argv = process.argv.slice(2)
const arg = (f, d = null) => {
  const i = argv.indexOf(f)
  return i >= 0 ? argv[i + 1] : d
}
const DATE = arg('--date', '2026-08-01')
const AUDIT_ONLY = argv.includes('--audit')

const p = (...s) => resolve(ROOT, ...s)
const readJson = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null)

// ─────────────────────────────────────────────────────────────────────────────
// The offline corpus. 951 MB of already-fetched HTML, keyed sha1(url).
// ─────────────────────────────────────────────────────────────────────────────

const CACHE = p('data/enrichment/_cache')
const cacheGet = (url) => {
  const f = resolve(CACHE, createHash('sha1').update(url).digest('hex') + '.gz')
  if (!existsSync(f)) return null
  try {
    return JSON.parse(gunzipSync(readFileSync(f)).toString('utf8'))
  } catch {
    return null
  }
}

/** Every line-card harvest pass, merged. Later files win; attempts accumulate. */
function loadLinecards() {
  const dir = p('data/enrichment')
  const byDomain = new Map()
  for (const f of readdirSync(dir).filter((x) => /^linecards-.*\.json$/.test(x)).sort()) {
    for (const r of readJson(resolve(dir, f))?.records ?? []) {
      const prev = byDomain.get(r.domain)
      byDomain.set(
        r.domain,
        prev ? { ...prev, ...r, attempts: [...(prev.attempts ?? []), ...(r.attempts ?? [])] } : r,
      )
    }
  }
  return byDomain
}

const titleOf = (html) => (/<title[^>]*>([\s\S]{0,300}?)<\/title>/i.exec(html ?? '') ?? [, ''])[1].replace(/\s+/g, ' ').trim()
const metaOf = (html) =>
  (/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]{0,400}?)["']/i.exec(html ?? '') ??
    /<meta[^>]+content=["']([\s\S]{0,400}?)["'][^>]+name=["']description["']/i.exec(html ?? '') ?? [, ''])[1]
    .replace(/\s+/g, ' ')
    .trim()

/**
 * The fetcher only ever decoded `Content-Encoding: gzip`, so a Brotli response
 * was stored raw. Five seated domains are mojibake for that reason; the ratio is
 * what turns them into `unobserved` instead of a wrong verdict.
 */
function garbageRatio(s) {
  if (!s) return 1
  let bad = 0
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    if (c === 0xfffd || (c < 32 && c !== 9 && c !== 10 && c !== 13) || (c > 126 && c < 160)) bad++
  }
  return bad / s.length
}

const isHomeUrl = (u) => /^https?:\/\/(www\.)?[^/]+\/?$/.test(u)

function corpusFor(domain, lc) {
  const urls = new Set()
  for (const a of lc?.attempts ?? []) if (a?.url) urls.add(a.url)
  for (const u of [`https://${domain}/`, `https://www.${domain}/`, `http://${domain}/`, `http://www.${domain}/`]) urls.add(u)
  let home = null
  let homeUrl = null
  let lcText = ''
  for (const u of urls) {
    const b = cacheGet(u)
    if (!b?.text) continue
    if (isHomeUrl(u) && !home) {
      home = b
      homeUrl = u
    } else lcText += ' ' + b.text
  }
  if (!home) {
    for (const u of urls) {
      const b = cacheGet(u)
      if (b?.text) {
        home = b
        homeUrl = u
        break
      }
    }
  }
  const text = home?.text ?? ''
  const html = home?.html ?? ''
  const head = `${titleOf(html)} ${metaOf(html)}`.trim()
  return {
    homepage_text: `${head} ${text}`.slice(0, 240000),
    homepage_title: head,
    homepage_garbage: garbageRatio(text.slice(0, 4000)),
    linecard_text: lcText.slice(0, 240000),
    homepage_url: homeUrl,
    lc_brands: lc?.brands ?? [],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Load
// ─────────────────────────────────────────────────────────────────────────────

const SEATED_V2 = p('lists/seated-v2.csv')
const COHORT = p('lists/first-send-200.csv')
const seated = fromCsv(readFileSync(SEATED_V2, 'utf8'))
const cohortRaw = readFileSync(COHORT, 'utf8')
const cohort = fromCsv(cohortRaw)
const COHORT_FIELDS = parseCsv(cohortRaw)[0]

/**
 * The brand vocabulary, two ways.
 *
 *   `brandVocab`  squashed `brand_authorized` labels — `vertical.mjs`'s rule 2,
 *                 used by the email test to recognise a manufacturer's host
 *                 without a list.
 *   `pageVocab`   the same brands plus every brand the line-card harvest named,
 *                 used by the detector's page reader. §1 of `vertical.mjs` keeps
 *                 the CSV `line_card` column OUT on purpose: product families
 *                 are not brands, and "Hydraulics" poisons the vocabulary.
 */
const linecards = loadLinecards()
const brandVocab = buildBrandVocabulary([...seated, ...cohort])
const pageBrandNames = new Set()
for (const r of [...seated, ...cohort]) for (const b of split(r.brand_authorized)) pageBrandNames.add(b)
for (const [, lc] of linecards) {
  for (const b of lc.brands ?? []) pageBrandNames.add(b)
  for (const b of lc.homepage_brands ?? []) pageBrandNames.add(b)
}
const scoreRow = makeScorer(buildVocab(pageBrandNames))

const scoreOf = (r) => {
  const c = corpusFor(r.domain, linecards.get(r.domain))
  return {
    ...scoreRow({
      ...r,
      ...c,
      brand_authorized: split(r.brand_authorized),
      lc_brands: c.lc_brands,
      sku_estimate: r.sku_estimate == null ? null : Number(r.sku_estimate),
    }),
    homepage_url: c.homepage_url,
    homepage_title: c.homepage_title,
    excerpt: c.homepage_text.slice(0, 1400),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// The four sweeps. Pure reads — nothing here mutates a record.
// ─────────────────────────────────────────────────────────────────────────────

function sweepEmails(rows) {
  const buckets = { 'manufacturer-inbox': [], 'marketplace-inbox': [], placeholder: [], 'domain-mismatch': [], 'free-provider': [], 'own-domain': [], none: [] }
  for (const r of rows) {
    const v = emailVerdict(r, { brandVocab })
    buckets[v.verdict].push({ domain: r.domain, company_display: r.company_display, email: r.email, email_source: r.email_source, rank_score: r.rank_score, ...v })
  }
  return buckets
}

function sweepDeclarations(rows) {
  const hits = []
  const suspects = []
  for (const r of rows) {
    if (!r.self_declaration) continue
    const rec = {
      domain: r.domain,
      company_display: r.company_display,
      rank_score: r.rank_score,
      self_declaration: r.self_declaration,
      self_declaration_url: r.self_declaration_url,
    }
    if (declarationIsNegated(r.self_declaration)) hits.push(rec)
    else if (declarationNegationSuspect(r.self_declaration)) suspects.push(rec)
  }
  return { hits, suspects }
}

function sweepGeo(rows) {
  const out = { 'non-US': [], unverified: [], US: [] }
  for (const r of rows) {
    const v = usGeoVerdict(r)
    out[v.verdict].push({ domain: r.domain, company_display: r.company_display, city: r.city, state: r.state, zip5: r.zip5, phone_e164: r.phone_e164, lat: r.lat, lng: r.lng, rank_score: r.rank_score, ...v })
  }
  return out
}

function sweepManufacturers(rows) {
  const out = []
  for (const r of rows) {
    const s = scoreOf(r)
    out.push({
      domain: r.domain,
      company_display: r.company_display,
      rank_score: Number(r.rank_score),
      segment: r.segment,
      tier: r.tier,
      brand_count: r.brand_count,
      brand_authorized: r.brand_authorized,
      prefilter: manufacturerPreFilter(r),
      verdict: s.verdict,
      score: s.score,
      signals: s.signals,
      homepage_url: s.homepage_url,
      homepage_title: s.homepage_title,
      excerpt: s.excerpt,
    })
  }
  return out
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1 — audit
// ─────────────────────────────────────────────────────────────────────────────

const emails = sweepEmails(seated)
const { hits: negated, suspects: negatedSuspects } = sweepDeclarations(seated)
const geo = sweepGeo(seated)
const mfg = sweepManufacturers(seated)
const flagged = mfg.filter((m) => m.verdict === 'manufacturer')
const m7 = mfg.filter((m) => m.signals.some((x) => x.startsWith('M7')))

if (AUDIT_ONLY) {
  const out = p(`data/_sendfix-candidates-${DATE}.json`)
  writeFileSync(
    out,
    JSON.stringify(
      {
        stage: 's4f — §5t send-blocking defects',
        captured: DATE,
        input: 'lists/seated-v2.csv (2,847) + lists/first-send-200.csv (200)',
        d1_email: {
          totals: Object.fromEntries(Object.entries(emails).map(([k, v]) => [k, v.length])),
          manufacturer_inbox: emails['manufacturer-inbox'],
          marketplace_inbox: emails['marketplace-inbox'],
          placeholder: emails.placeholder,
          domain_mismatch: emails['domain-mismatch'],
        },
        d2_negated: { count: negated.length, records: negated, suspects: negatedSuspects.length, suspect_records: negatedSuspects },
        d3_geo: { non_us: geo['non-US'], unverified: geo.unverified, us_count: geo.US.length },
        d4_manufacturer: {
          flagged: flagged.length,
          m7_fired: m7.length,
          prefilter_surface: mfg.filter((x) => x.prefilter).length,
          candidates: flagged,
          m7_rows: m7,
        },
      },
      null,
      1,
    ),
  )
  console.log(`wrote ${out}`)
  console.log(`D1 manufacturer-inbox ${emails['manufacturer-inbox'].length} · marketplace ${emails['marketplace-inbox'].length} · placeholder ${emails.placeholder.length} · mismatch ${emails['domain-mismatch'].length} · free ${emails['free-provider'].length} · own ${emails['own-domain'].length} · none ${emails.none.length}`)
  console.log(`D2 negated declarations ${negated.length} · loose suspects (reported, not cleared) ${negatedSuspects.length}`)
  console.log(`D3 non-US ${geo['non-US'].length} · unverified ${geo.unverified.length} · US ${geo.US.length}`)
  console.log(`D4 flagged ${flagged.length} · M7 fired ${m7.length} · prefilter surface ${mfg.filter((x) => x.prefilter).length}`)
  process.exit(0)
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 2 — apply. Every route is a HAND verdict read from the adjudication
// file; nothing routes on a score. §5s: the detector's recall is 0.27.
// ─────────────────────────────────────────────────────────────────────────────

const ADJ = readJson(p(`data/_sendfix-adjudication-${DATE}.json`))
if (!ADJ) {
  console.error(`missing data/_sendfix-adjudication-${DATE}.json — run --audit first, read the candidates, then record the verdicts`)
  process.exit(1)
}

/** domain → {disposition, why} for every hand-confirmed route. */
const ROUTE = new Map()
for (const r of ADJ.route ?? []) ROUTE.set(r.domain, r)
const KEEP = new Set((ADJ.keep ?? []).map((k) => k.domain))

const stats = {
  email_voided: 0,
  declaration_cleared: 0,
  routed: { 'not-a-distributor': 0, 'non-US': 0, 'duplicate-site': 0, 'identity-backlog': 0, 'above-ceiling': 0 },
}
const voidedLog = []
const clearedLog = []

/**
 * Apply D1 and D2 in place on a copy. **Nothing else is touched** — this is
 * where §5s's blanking happened, so the function returns a shallow clone with
 * exactly the keys it changed named in the log.
 */
function fixRow(row) {
  const r = { ...row }
  const ev = emailVerdict(r, { brandVocab })
  if (ev.verdict === 'manufacturer-inbox') {
    voidedLog.push({ domain: r.domain, company_display: r.company_display, email: r.email, email_source: r.email_source, matched: ev.matched, rule: ev.rule, why: ev.why })
    // Provenance is not lost: the original token is kept inside the marker, and
    // `seated-v2.csv` is untouched and holds the address itself.
    r.email_source = `voided:manufacturer-inbox:${r.email_source ?? 'unknown'}`
    r.email = null
    stats.email_voided++
  }
  if (r.self_declaration && declarationIsNegated(r.self_declaration)) {
    clearedLog.push({ domain: r.domain, company_display: r.company_display, self_declaration: r.self_declaration, self_declaration_url: r.self_declaration_url })
    // Cleared, not rewritten. The trio moves together: a `self_declaration_url`
    // without a declaration is a dangling citation, and `..._verbatim` without a
    // declaration is a contract violation.
    r.self_declaration = null
    r.self_declaration_url = null
    r.self_declaration_verbatim = 'false'
    stats.declaration_cleared++
  }
  return r
}

const seatedV3 = []
const routedRows = []
for (const row of seated) {
  const hand = ROUTE.get(row.domain)
  if (hand) {
    const r = fixRow(row)
    r.disposition = hand.disposition
    if (hand.dup_of) r.dup_of = hand.dup_of
    routedRows.push(r)
    stats.routed[hand.disposition] = (stats.routed[hand.disposition] ?? 0) + 1
    continue
  }
  seatedV3.push(fixRow(row))
}

// ── the cohort. Rebuilt from `seated-v3` in rank order, which is the file's own
// order: `seated-v2` is sorted by `rank_score` descending and every stage since
// has preserved it. The 200 that were hand-read keep their verification; a
// replacement is promoted strictly by rank and carries its own.
// The hand-kept rows are an assertion, not a comment: a domain read and
// deliberately left seated must still be in the list at the end of the run.
const kept = new Set(seatedV3.map((r) => r.domain))
const lostKeepers = [...KEEP].filter((d) => !kept.has(d))
if (lostKeepers.length) {
  console.error(`hand-kept rows missing from seated-v3: ${lostKeepers.join(', ')}`)
  process.exit(1)
}
const verifiedBy = new Map(cohort.map((r) => [r.domain, r]))
const promoted = new Map((ADJ.promote ?? []).map((r) => [r.domain, r]))

const cohortOut = []
const cohortDropped = []
for (const r of cohort) if (!kept.has(r.domain)) cohortDropped.push(r.domain)

for (const row of seatedV3) {
  if (cohortOut.length >= 200) break
  const prior = verifiedBy.get(row.domain)
  const promo = promoted.get(row.domain)
  if (!prior && !promo) continue // never examined — the backfill list is the gate
  const out = { ...row }
  out.verification = promo?.verification ?? prior?.verification ?? null
  out.verification_note = promo?.verification_note ?? prior?.verification_note ?? null
  cohortOut.push(out)
}

// ─────────────────────────────────────────────────────────────────────────────
// §5s — the readback. Field-for-field, by a parser independent of the writer.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Write, read back, and diff every cell against the record we meant to write.
 *
 * §5s: `makeRecord()` running before `toCsv()` blanked every S4 column in
 * `seated-v2` — identical header, right row count, conservation PASSED, 35,927
 * fields wrong. Structural checks cannot see that. This can.
 *
 * @returns {{rows: number, cells: number, diffs: {row: number, field: string, wrote: string, read: string}[]}}
 */
function writeAndVerify(file, records, fields) {
  writeFileSync(file, toCsv(records, fields))
  const back = parseCsv(readFileSync(file, 'utf8'))
  const header = back[0]
  const diffs = []
  if (header.join(',') !== fields.join(',')) diffs.push({ row: 0, field: '(header)', wrote: fields.join(','), read: header.join(',') })
  if (back.length - 1 !== records.length) diffs.push({ row: -1, field: '(row count)', wrote: String(records.length), read: String(back.length - 1) })
  const cell = (v) => (v === undefined || v === null ? '' : Array.isArray(v) ? v.join('|') : String(v))
  let cells = 0
  for (let i = 0; i < records.length; i++) {
    const got = back[i + 1] ?? []
    for (let j = 0; j < fields.length; j++) {
      cells++
      const want = cell(records[i][fields[j]])
      const have = got[j] ?? ''
      if (want !== have) diffs.push({ row: i + 1, field: fields[j], wrote: want, read: have, domain: records[i].domain })
    }
  }
  return { rows: records.length, cells, diffs: diffs.slice(0, 40), diffCount: diffs.length }
}

/**
 * The second half of the readback, and the half §5s's bug needed: is the file we
 * wrote still the file we started from, everywhere we did not intend to change
 * it? Compared against `seated-v2.csv` cell by cell.
 */
function verifyInheritance(file, sourceRows, changedByDomain) {
  const back = fromCsv(readFileSync(file, 'utf8'))
  const src = new Map(sourceRows.map((r) => [r.domain, r]))
  const diffs = []
  let cells = 0
  for (const r of back) {
    const s = src.get(r.domain)
    if (!s) {
      diffs.push({ domain: r.domain, field: '(row)', why: 'not present in the source list' })
      continue
    }
    const allowed = changedByDomain.get(r.domain) ?? new Set()
    for (const f of FIELDS_V7) {
      cells++
      if (allowed.has(f)) continue
      if ((s[f] ?? '') !== (r[f] ?? '')) diffs.push({ domain: r.domain, field: f, was: s[f], now: r[f] })
    }
  }
  return { rows: back.length, cells, diffs: diffs.slice(0, 40), diffCount: diffs.length }
}

const changed = new Map()
const noteChange = (domain, field) => {
  if (!changed.has(domain)) changed.set(domain, new Set())
  changed.get(domain).add(field)
}
for (const v of voidedLog) {
  noteChange(v.domain, 'email')
  noteChange(v.domain, 'email_source')
}
for (const c of clearedLog) {
  noteChange(c.domain, 'self_declaration')
  noteChange(c.domain, 'self_declaration_url')
  noteChange(c.domain, 'self_declaration_verbatim')
}
for (const [d, r] of ROUTE) {
  noteChange(d, 'disposition')
  if (r.dup_of) noteChange(d, 'dup_of')
}

const V3 = p('lists/seated-v3.csv')
const rbV3 = writeAndVerify(V3, seatedV3, FIELDS_V7)
const inhV3 = verifyInheritance(V3, seated, changed)
const rbCohort = writeAndVerify(COHORT, cohortOut, COHORT_FIELDS)
const rbRouted = writeAndVerify(p(`lists/sendfix-routed-${DATE}.csv`), routedRows, FIELDS_V7)

// ── side pools: nothing is deleted, everything routed lands somewhere.
const POOL_FILE = {
  'not-a-distributor': ['pool-not-a-distributor-v9.csv', 'pool-not-a-distributor-v10.csv'],
  'non-US': ['pool-non-us-v8.csv', 'pool-non-us-v9.csv'],
  'duplicate-site': ['pool-duplicate-sites-v7.csv', 'pool-duplicate-sites-v8.csv'],
  'identity-backlog': ['pool-identity-backlog-v1.csv', 'pool-identity-backlog-v2.csv'],
  'above-ceiling': ['pool-above-ceiling-v8.csv', 'pool-above-ceiling-v9.csv'],
}
const poolReport = []
for (const [disp, [inFile, outFile]] of Object.entries(POOL_FILE)) {
  const add = routedRows.filter((r) => r.disposition === disp)
  if (!add.length) continue
  const prior = existsSync(p('data/side-pools', inFile)) ? fromCsv(readFileSync(p('data/side-pools', inFile), 'utf8')) : []
  const merged = [...prior, ...add]
  const rb = writeAndVerify(p('data/side-pools', outFile), merged, FIELDS_V7)
  poolReport.push({ disposition: disp, file: outFile, prior: prior.length, added: add.length, total: merged.length, diffs: rb.diffCount })
}

// ─────────────────────────────────────────────────────────────────────────────
// Report
// ─────────────────────────────────────────────────────────────────────────────

const conserved = seated.length === seatedV3.length + routedRows.length
const readbackTotal = rbV3.diffCount + rbCohort.diffCount + rbRouted.diffCount + inhV3.diffCount + poolReport.reduce((a, x) => a + x.diffs, 0)

const audit = {
  stage: 's4f — §5t send-blocking defects',
  captured: DATE,
  input: { seated_v2: seated.length, cohort_in: cohort.length },
  output: { seated_v3: seatedV3.length, cohort_out: cohortOut.length, routed: routedRows.length },
  conservation: { in: seated.length, seated: seatedV3.length, routed: routedRows.length, pass: conserved },
  d1: {
    manufacturer_inbox_voided: stats.email_voided,
    by_domain: Object.entries(voidedLog.reduce((a, v) => ({ ...a, [v.matched]: (a[v.matched] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]),
    marketplace_inbox: emails['marketplace-inbox'].length,
    placeholder: emails.placeholder.length,
    domain_mismatch: emails['domain-mismatch'].length,
    free_provider: emails['free-provider'].length,
    records: voidedLog,
  },
  d2: { cleared: stats.declaration_cleared, records: clearedLog, suspects: negatedSuspects.length, suspect_records: negatedSuspects },
  d3: { non_us: geo['non-US'].length, unverified: geo.unverified.length, us: geo.US.length, non_us_records: geo['non-US'], unverified_records: geo.unverified },
  d4: { flagged: flagged.length, m7_fired: m7.length, prefilter_surface: mfg.filter((x) => x.prefilter).length, routed: stats.routed['not-a-distributor'] },
  routed: [...ROUTE.values()],
  kept_after_reading: ADJ.keep ?? [],
  readback: {
    seated_v3: { rows: rbV3.rows, cells: rbV3.cells, diffs: rbV3.diffCount, sample: rbV3.diffs },
    seated_v3_inheritance: { rows: inhV3.rows, cells: inhV3.cells, diffs: inhV3.diffCount, sample: inhV3.diffs },
    cohort: { rows: rbCohort.rows, cells: rbCohort.cells, diffs: rbCohort.diffCount, sample: rbCohort.diffs },
    routed: { rows: rbRouted.rows, cells: rbRouted.cells, diffs: rbRouted.diffCount, sample: rbRouted.diffs },
    pools: poolReport,
    total_diffs: readbackTotal,
  },
  cohort_dropped: cohortDropped,
}
writeFileSync(p(`data/_sendfix-${DATE}.json`), JSON.stringify(audit, null, 1))

console.log(`seated-v2 ${seated.length} → seated-v3 ${seatedV3.length} + routed ${routedRows.length} · conservation ${conserved ? 'PASS' : 'FAIL'}`)
console.log(`D1 voided ${stats.email_voided} manufacturer inboxes · mismatch bucket ${emails['domain-mismatch'].length} · marketplace ${emails['marketplace-inbox'].length} · placeholder ${emails.placeholder.length}`)
console.log(`D2 cleared ${stats.declaration_cleared} negated declarations`)
console.log(`D3 non-US ${geo['non-US'].length} · unverified ${geo.unverified.length} of ${seated.length}`)
console.log(`D4 detector flagged ${flagged.length} · M7 fired ${m7.length} · routed ${stats.routed['not-a-distributor']}`)
console.log(`cohort ${cohortOut.length} (dropped ${cohortDropped.length}: ${cohortDropped.join(', ') || 'none'})`)
console.log(`readback: ${readbackTotal} diffs across ${rbV3.cells + rbCohort.cells + rbRouted.cells + inhV3.cells} cells — ${readbackTotal === 0 ? 'PASS' : 'FAIL'}`)
console.log(`pools: ${poolReport.map((x) => `${x.file} ${x.prior}+${x.added}=${x.total}`).join(' · ') || 'none'}`)
if (!conserved || readbackTotal || cohortOut.length !== 200) process.exitCode = 1
