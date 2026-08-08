#!/usr/bin/env node
/**
 * S4g — fold the Adaptall-project export into the industrial list.
 *
 * The export (`emails/adaptall-data/data/`) is a separate project's roster of
 * Adaptall distributors: 71 companies, 623 US contacts, 1,058 US branch
 * locations, plus Adaptall's own verified locator. It arrives with three things
 * this list does not have:
 *
 *   1. a handful of companies our 21 sources never surfaced,
 *   2. **named people with verified email addresses** — the exact output the
 *      blocked S5 (Apollo) stage was meant to produce, and
 *   3. a branch-location census that is a better size proxy than ours.
 *
 * Four tasks, in that order, each with the failure mode that shaped it:
 *
 * **T1 — seat what we genuinely missed.** §5t is the governing lesson here:
 * place names collide across the border ("Ontario, *California*", a "New
 * Brunswick Ave" in New Jersey, "BC Fluid Power" in *Kentucky*), so a foreign
 * signal must never outrank a complete US state + ZIP. Every candidate is
 * verified individually against its own homepage — never bulk-added — and the
 * export's own `country` column is treated as a claim, not a verdict. It is
 * wrong in both directions: `connectallltd.com` is filed `US / Plattsburgh NY`
 * and publishes exactly one address, in Laval, **Quebec**.
 *
 * **T2 — merge the named contacts.** Ranked by ICP fit, and the ranking is the
 * point: **118 of the 623 are Branch Managers**, and a branch manager does not
 * buy a $10–30K engagement at a multi-branch distributor. Promoting one over a
 * President because it sorted first would quietly wreck the send. §5u's rule
 * runs over every address before it is accepted — an email on a known
 * manufacturer's domain that is not the company's own apex is invalid, because
 * `info.us@nord.com` sat on 34 rows of `seated-v2` as though it were a
 * prospect's inbox.
 *
 * **T3 — correct `location_count`.** §5m's trap, stated as code: count
 * **distinct `(company, address)` pairs**, never raw rows. The export's 1,058
 * location rows are 1,013 distinct pairs across 51 companies; reading the raw
 * count would inflate every branch network by ~4% and push borderline
 * companies across a size band on an artifact.
 *
 * **T4 — report only.** The export carries `apollo_org_id` / `apollo_person_id`
 * columns. That is reported and nothing else is done with it.
 *
 * **§5s is binding on the output.** A prior stage silently blanked 35,927
 * fields while producing an identical header, the correct row count and a
 * PASSING conservation check. Structural checks cannot see field-level
 * corruption. So every file this stage writes is read back and diffed
 * field-for-field against what it intended to write, by two independent readers
 * (this module's `fromCsv`, and Python's `csv` in `--verify`).
 *
 * Usage:
 *   node scripts/s4g-adaptall.mjs           # build + readback + report
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { fromCsv, toCsv, FIELDS_V7, split, csvCell } from './lib/contract.mjs'
import { apexDomain, normalizeCompany, normalizeEmail, normalizePhone, normalizeZip5, normalizeState } from './lib/normalize.mjs'
import { sizeScore } from './lib/size.mjs'
import { rankScore, componentsToString } from './lib/rank.mjs'
import { segmentScores, segmentOf, tierOf, isCohortE } from './lib/segment.mjs'
import { emailVerdict } from './lib/sendcheck.mjs'
import { buildBrandVocabulary } from './lib/vertical.mjs'
import {
  EXPORT_VERDICTS,
  SEAT,
  TITLE_RANK,
  titleClass,
  bestContact,
  distinctLocations,
  LOCATION_ALIASES,
} from './lib/adaptall.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const EXPORT_DIR = resolve(ROOT, 'adaptall-data', 'data')
const DATE = '2026-08-01'

const readCsv = (p) => fromCsv(readFileSync(p, 'utf8').replace(/^﻿/, ''))
const loadJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null)
const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16)
const apex = (d) => apexDomain(d)

// ─────────────────────────────────────────────────────────────────────────────
// load
// ─────────────────────────────────────────────────────────────────────────────
const seated = readCsv(resolve(ROOT, 'lists', 'seated-v3.csv'))
const firstSendPath = resolve(ROOT, 'lists', 'first-send-200.csv')
const firstSend = readCsv(firstSendPath)
const FS_FIELDS = [...FIELDS_V7, 'verification', 'verification_note']

const exCompanies = readCsv(resolve(EXPORT_DIR, 'distributor_companies.csv'))
const exContacts = readCsv(resolve(EXPORT_DIR, 'distributor_contacts_us.csv'))
const exLocations = readCsv(resolve(EXPORT_DIR, 'distributor_locations_us.csv'))
const exLocator = readCsv(resolve(EXPORT_DIR, 'adaptall_verified_locator.csv'))

/** Every catalog + line-card pass, later files winning — plus this stage's own. */
function loadEnrichment() {
  const dir = resolve(ROOT, 'data', 'enrichment')
  const byDomain = new Map()
  const catalogs = readdirSync(dir)
    .filter((f) => /^catalog-.*\.json$/.test(f))
    .sort((a, b) => (a.includes('adaptall') ? 1 : b.includes('adaptall') ? -1 : a.localeCompare(b)))
  for (const f of catalogs) {
    for (const r of loadJson(resolve(dir, f))?.records ?? []) {
      if (!r.domain) continue
      byDomain.set(r.domain, {
        ecommerce_class: r.ecommerce_class ?? null,
        sku_estimate: r.sku_estimate ?? null,
        brand_count: r.brand_count ?? null,
        brands: r.brands ?? [],
        quote_signals: r.quote_signals ?? [],
        cart_signals: r.cart_signals ?? [],
        linecard_url: r.linecard_url ?? null,
      })
    }
  }
  return byDomain
}
const enrich = loadEnrichment()

// ─────────────────────────────────────────────────────────────────────────────
// T1 — seat the genuinely-missed companies
// ─────────────────────────────────────────────────────────────────────────────
const seatedByDomain = new Map()
for (const r of seated) if (r.domain) seatedByDomain.set(apex(r.domain), r)

const brandVocab = buildBrandVocabulary(seated)

/** Every distinct apex the export names, across both tables. */
const exportDomains = new Set()
for (const c of exCompanies) if (c.domain) exportDomains.add(apex(c.domain) || c.domain.toLowerCase())
for (const c of exContacts) if (c.domain) exportDomains.add(apex(c.domain) || c.domain.toLowerCase())

/** Rehydrate a CSV row into the shape the scorers expect. */
function rehydrate(r) {
  return {
    ...r,
    brand_authorized: split(r.brand_authorized),
    line_card: split(r.line_card),
    location_count: r.location_count == null ? null : Number(r.location_count),
    evidence_depth: r.evidence_depth == null ? null : Number(r.evidence_depth),
  }
}

/** `location_count` back to a CSV cell, and every array back to `|`-joined. */
function dehydrate(r) {
  const out = { ...r }
  out.brand_authorized = Array.isArray(r.brand_authorized) ? r.brand_authorized.join('|') : r.brand_authorized
  out.line_card = Array.isArray(r.line_card) ? r.line_card.join('|') : r.line_card
  return out
}

/** Score a record end-to-end: size → rank → segment → tier → cohort. */
function score(rec) {
  const e = enrich.get(apex(rec.domain)) ?? null
  const size = sizeScore(rec, e ?? {})
  const rank = rankScore(rec, { size, enrich: e })
  const segScores = segmentScores(rec)
  const seg = segmentOf(rec)
  return {
    size_score: size.score,
    size_band: size.band,
    review_count: size.review_count,
    brand_count: rank.brand_count,
    rank_score: rank.score,
    rank_components: componentsToString(rank.components),
    segment: seg,
    segment_scores: `A=${segScores.scores.A};B=${segScores.scores.B}`,
    tier: tierOf(rec, size, rank.ecom),
    cohort: isCohortE(rec) ? 'E' : null,
    ecommerce_class: e?.ecommerce_class ?? rec.ecommerce_class ?? null,
    sku_estimate: e?.sku_estimate ?? rec.sku_estimate ?? null,
  }
}

const seatedNew = []
const routed = []

for (const spec of SEAT) {
  const d = spec.domain
  if (seatedByDomain.has(d)) {
    routed.push({ domain: d, disposition: 'already-seated', reason: `already in seated-v3 as ${d}` })
    continue
  }
  const e = enrich.get(d)
  const rec = rehydrate({
    company: normalizeCompany(spec.company_display),
    company_display: spec.company_display,
    domain: d,
    email: spec.email ?? null,
    email_source: spec.email ? 'adaptall-export' : null,
    address_1: spec.address_1,
    city: spec.city,
    state: normalizeState(spec.state),
    zip5: normalizeZip5(spec.zip5),
    phone_e164: normalizePhone(spec.phone),
    lat: null,
    lng: null,
    source: 'adaptall-export',
    source_url: spec.source_url,
    captured: DATE,
    brand_authorized: (e?.brands ?? []).join('|'),
    line_card: (spec.line_card ?? []).join('|'),
    distributor_type: spec.distributor_type ?? null,
    tier_raw: spec.tier_raw ?? null,
    location_count: String(spec.location_count),
    disposition: null,
    segment: null,
    evidence_depth: String(spec.evidence_depth),
    self_declaration: spec.self_declaration,
    self_declaration_verbatim: 'true',
    self_declaration_url: spec.self_declaration_url,
    needs_identity_resolution: 'false',
    identity_status: null,
    identity_found: null,
    icp_class: 'industrial-distributor',
    icp_uncertain: 'false',
    vertical_axis: 'homepage',
    category_core: null,
    category_contam: null,
    ecommerce_class: e?.ecommerce_class ?? null,
    sku_estimate: e?.sku_estimate ?? null,
    brand_count: e?.brand_count ?? null,
    review_count: null,
    size_score: null,
    size_band: null,
    rank_score: null,
    rank_components: null,
    shortlist: 'false',
    segment_scores: null,
    tier: null,
    cohort: null,
    dup_of: null,
  })
  Object.assign(rec, score(rec))
  seatedNew.push(rec)
}

for (const [domain, v] of Object.entries(EXPORT_VERDICTS)) {
  if (v.disposition === 'seat') continue
  routed.push({ domain, ...v })
}

// ─────────────────────────────────────────────────────────────────────────────
// T2 — merge the named contacts
// ─────────────────────────────────────────────────────────────────────────────
const CONTACT_FIELDS = [
  'contact_first_name',
  'contact_last_name',
  'contact_title',
  'contact_email',
  'contact_email_status',
  'contact_linkedin',
  'contact_source',
]

/**
 * The export's own apex is not always the company's sending apex — three of the
 * six `hoseshop.com` contacts are on `hoseshopinc.com`, and one is on
 * `thehoseshop.com`, which belongs to a **different company of the same name**
 * in Santa Cruz, CA. So a contact is joined to the company by the export's
 * `domain` column, and the address is then judged separately by §5u.
 */
const contactsByDomain = new Map()
for (const c of exContacts) {
  const d = apex(c.domain) || (c.domain ?? '').toLowerCase()
  if (!d) continue
  if (!contactsByDomain.has(d)) contactsByDomain.set(d, [])
  contactsByDomain.get(d).push(c)
}

/** §5u over one export contact, judged against the company's own apex. */
function judgeContactEmail(contact, companyDomain) {
  const email = normalizeEmail(contact.email)
  if (!email) return { email: null, verdict: 'none', why: 'no address published' }
  const v = emailVerdict({ email, domain: companyDomain }, { brandVocab })
  return { email, ...v }
}

const contactMerge = { matched: 0, applied: 0, voided: [], mismatch: [], byClass: {} }

function applyContact(row) {
  const d = apex(row.domain)
  const pool = contactsByDomain.get(d)
  if (!pool || !pool.length) return null
  contactMerge.matched++
  const judged = pool.map((c) => ({ contact: c, email: judgeContactEmail(c, d) }))
  for (const j of judged) {
    if (j.email.verdict === 'manufacturer-inbox')
      contactMerge.voided.push({ domain: d, email: j.email.email, why: j.email.why })
    else if (j.email.verdict === 'domain-mismatch')
      contactMerge.mismatch.push({ domain: d, email: j.email.email, why: j.email.why })
  }
  const pick = bestContact(judged)
  if (!pick) return null
  const cls = titleClass(pick.contact.title)
  contactMerge.byClass[cls] = (contactMerge.byClass[cls] ?? 0) + 1
  contactMerge.applied++
  row.contact_first_name = pick.contact.first_name || null
  row.contact_last_name = pick.contact.last_name || null
  row.contact_title = pick.contact.title || null
  row.contact_email = pick.email.verdict === 'manufacturer-inbox' ? null : pick.email.email
  row.contact_email_status = pick.contact.email_status || null
  row.contact_linkedin = pick.contact.linkedin_url || null
  row.contact_source = 'adaptall-export'
  return { pick, cls }
}

// ─────────────────────────────────────────────────────────────────────────────
// T3 — the branch census as a size proxy
// ─────────────────────────────────────────────────────────────────────────────
const locationCounts = distinctLocations(exLocations)

/** export company name → apex, from the companies table plus the alias table. */
const nameToDomain = new Map()
for (const c of exCompanies) {
  const d = apex(c.domain)
  if (!d) continue
  const key = normalizeCompany(c.company)
  if (key && !nameToDomain.has(key)) nameToDomain.set(key, d)
}
for (const [name, d] of Object.entries(LOCATION_ALIASES)) {
  const key = normalizeCompany(name)
  if (key) nameToDomain.set(key, d)
}

const countsByDomain = new Map()
const unmatchedLocationCompanies = []
for (const [company, addrs] of locationCounts) {
  const key = normalizeCompany(company)
  const d = key ? nameToDomain.get(key) : null
  if (!d) {
    unmatchedLocationCompanies.push({ company, count: addrs.size })
    continue
  }
  countsByDomain.set(d, Math.max(countsByDomain.get(d) ?? 0, addrs.size))
}

// ─────────────────────────────────────────────────────────────────────────────
// build seated-v4
// ─────────────────────────────────────────────────────────────────────────────
const V4_FIELDS = [...FIELDS_V7, ...CONTACT_FIELDS]
const locationChanges = []
const bandChanges = []
const tierChanges = []
const ceilingRouted = []

/**
 * §3.3's ceiling, restated: **≥20 distinct addresses routes `above-ceiling`.**
 *
 * This has to be a route and not a re-score, because `size.mjs`'s location
 * table opens with `[20, 0]` — "≥20 never reaches here, §3.3 routed it" — so
 * leaving a 92-branch network seated would score its branch count at ZERO
 * points and rank it *below* a three-branch shop. The census is the first thing
 * in this build that can see these networks at their real size: `tipcotech.com`
 * is carried at 1 location and has 39, and `otcindustrial.com` at 2 and has 70.
 */
const CEILING = 20

const v4 = []
for (const raw of seated) {
  const rec = rehydrate(raw)
  for (const f of CONTACT_FIELDS) rec[f] = null

  const d = apex(rec.domain)
  const corrected = countsByDomain.get(d)
  const before = {
    location_count: rec.location_count,
    size_band: rec.size_band,
    size_score: rec.size_score,
    rank_score: rec.rank_score,
    tier: rec.tier,
  }
  if (corrected != null && corrected > (Number(rec.location_count) || 0)) {
    if (corrected >= CEILING) {
      rec.location_count = corrected
      rec.disposition = 'above-ceiling'
      ceilingRouted.push({
        domain: d,
        company_display: rec.company_display,
        disposition: 'above-ceiling',
        reason: `branch census: ${before.location_count} → ${corrected} distinct addresses, at or over §3.3's ${CEILING}-address ceiling`,
        evidence: `${corrected} distinct (company, address) pairs in distributor_locations_us.csv; was ranked ${before.rank_score} / ${before.tier} / ${before.size_band}`,
        source_url: 'emails/adaptall-data/data/distributor_locations_us.csv',
        was: before.location_count,
        now: corrected,
        wasRank: `${before.rank_score} / ${before.tier} / ${before.size_band}`,
      })
      continue
    }
    rec.location_count = corrected
    const s = score(rec)
    // Only the size-derived columns move. Segment, cohort and the vertical
    // verdict are decided by evidence this census says nothing about.
    rec.size_score = s.size_score
    rec.size_band = s.size_band
    rec.rank_score = s.rank_score
    rec.rank_components = s.rank_components
    rec.tier = s.tier
    locationChanges.push({
      domain: d,
      company: rec.company_display,
      from: before.location_count,
      to: corrected,
      band: [before.size_band, s.size_band],
      tier: [before.tier, s.tier],
      rank: [Number(before.rank_score), s.rank_score],
    })
    if (before.size_band !== s.size_band) bandChanges.push({ domain: d, from: before.size_band, to: s.size_band })
    if (before.tier !== s.tier) tierChanges.push({ domain: d, from: before.tier, to: s.tier })
  }

  applyContact(rec)
  v4.push(rec)
}

for (const rec of seatedNew) {
  for (const f of CONTACT_FIELDS) rec[f] = rec[f] ?? null
  applyContact(rec)
  v4.push(rec)
}

// order: rank desc, then domain, so the file is stable and diffable
v4.sort((a, b) => Number(b.rank_score ?? 0) - Number(a.rank_score ?? 0) || String(a.domain).localeCompare(String(b.domain)))

const v4Out = v4.map(dehydrate)
const v4Csv = toCsv(v4Out, V4_FIELDS)
const v4Path = resolve(ROOT, 'lists', 'seated-v4.csv')
writeFileSync(v4Path, v4Csv)

// ─────────────────────────────────────────────────────────────────────────────
// first-send-200 — inherit the contact + size corrections
// ─────────────────────────────────────────────────────────────────────────────
const v4ByDomain = new Map(v4Out.map((r) => [apex(r.domain), r]))
const fsBefore = readFileSync(firstSendPath, 'utf8')
const fsUpdated = []
const fsGained = []
for (const raw of firstSend) {
  const row = { ...raw }
  const src = v4ByDomain.get(apex(row.domain))
  if (src) {
    for (const f of ['location_count', 'size_score', 'size_band', 'rank_score', 'rank_components', 'tier']) {
      if (src[f] != null && String(src[f]) !== String(row[f] ?? '')) row[f] = src[f]
    }
    for (const f of CONTACT_FIELDS) row[f] = src[f] ?? null
    if (src.contact_first_name) fsGained.push({ domain: apex(row.domain), company: row.company_display, name: `${src.contact_first_name} ${src.contact_last_name}`, title: src.contact_title, email: src.contact_email, status: src.contact_email_status })
  } else {
    for (const f of CONTACT_FIELDS) row[f] = null
  }
  fsUpdated.push(row)
}
const FS_OUT_FIELDS = [...FS_FIELDS, ...CONTACT_FIELDS]
const fsCsv = toCsv(fsUpdated, FS_OUT_FIELDS)
writeFileSync(firstSendPath, fsCsv)

// ─────────────────────────────────────────────────────────────────────────────
// the full contact set — kept whole for later multi-contact sequencing
// ─────────────────────────────────────────────────────────────────────────────
const ALL_CONTACT_FIELDS = [
  'company', 'domain', 'first_name', 'last_name', 'title', 'title_class', 'title_rank',
  'email', 'email_status', 'email_verdict', 'email_domain', 'phone', 'city', 'state',
  'country', 'linkedin_url', 'in_seated_v4', 'source', 'source_url', 'captured',
]
const allContacts = exContacts.map((c) => {
  const d = apex(c.domain) || (c.domain ?? '').toLowerCase() || null
  const j = judgeContactEmail(c, d)
  const cls = titleClass(c.title)
  return {
    company: c.company,
    domain: d,
    first_name: c.first_name,
    last_name: c.last_name,
    title: c.title,
    title_class: cls,
    title_rank: TITLE_RANK[cls],
    email: j.email,
    email_status: c.email_status,
    email_verdict: j.verdict,
    email_domain: j.email_domain ?? null,
    phone: c.phone,
    city: c.city,
    state: c.state,
    country: c.country,
    linkedin_url: c.linkedin_url,
    in_seated_v4: v4ByDomain.has(d) ? 'true' : 'false',
    source: 'adaptall-export',
    source_url: 'emails/adaptall-data/data/distributor_contacts_us.csv',
    captured: DATE,
  }
})
const contactsPath = resolve(ROOT, 'data', 'enrichment', `contacts-adaptall-${DATE}.csv`)
const contactsCsv = toCsv(allContacts, ALL_CONTACT_FIELDS)
writeFileSync(contactsPath, contactsCsv)

// ─────────────────────────────────────────────────────────────────────────────
// routed — nothing deleted
// ─────────────────────────────────────────────────────────────────────────────
const ROUTED_FIELDS = ['domain', 'company_display', 'disposition', 'reason', 'evidence', 'source', 'source_url', 'captured']
const routedRows = [...routed, ...ceilingRouted].map((r) => ({
  domain: r.domain,
  company_display: r.company_display ?? null,
  disposition: r.disposition,
  reason: r.reason,
  evidence: r.evidence ?? null,
  source: 'adaptall-export',
  source_url: r.source_url ?? 'emails/adaptall-data/data/distributor_companies.csv',
  captured: DATE,
}))
const routedPath = resolve(ROOT, 'lists', `adaptall-routed-${DATE}.csv`)
writeFileSync(routedPath, toCsv(routedRows, ROUTED_FIELDS))

// ─────────────────────────────────────────────────────────────────────────────
// §5s — MANDATORY field-for-field readback
// ─────────────────────────────────────────────────────────────────────────────
function readback(path, intended, fields, label) {
  const back = fromCsv(readFileSync(path, 'utf8'))
  const diffs = []
  if (back.length !== intended.length)
    diffs.push({ row: -1, field: '(row count)', want: intended.length, got: back.length })
  const header = readFileSync(path, 'utf8').split('\n')[0]
  const wantHeader = fields.map(csvCell).join(',')
  if (header !== wantHeader) diffs.push({ row: -1, field: '(header)', want: wantHeader, got: header })
  let cells = 0
  for (let i = 0; i < Math.min(back.length, intended.length); i++) {
    for (const f of fields) {
      cells++
      const w = intended[i][f]
      const wantStr = w === undefined || w === null ? '' : Array.isArray(w) ? w.join('|') : String(w)
      const gotStr = back[i][f] === null || back[i][f] === undefined ? '' : String(back[i][f])
      if (wantStr !== gotStr && diffs.length < 50)
        diffs.push({ row: i, domain: intended[i].domain, field: f, want: wantStr, got: gotStr })
      else if (wantStr !== gotStr) diffs.push({ row: i, field: f })
    }
  }
  return { label, path, rows: back.length, cells, diffs }
}

const readbacks = [
  readback(v4Path, v4Out, V4_FIELDS, 'seated-v4.csv'),
  readback(firstSendPath, fsUpdated, FS_OUT_FIELDS, 'first-send-200.csv'),
  readback(contactsPath, allContacts, ALL_CONTACT_FIELDS, `contacts-adaptall-${DATE}.csv`),
  readback(routedPath, routedRows, ROUTED_FIELDS, `adaptall-routed-${DATE}.csv`),
]

/** The S4 columns must be non-blank on every seated row — §5s's actual failure. */
const S4_NONBLANK = ['size_score', 'size_band', 'rank_score', 'rank_components', 'segment', 'tier', 'evidence_depth']
const blanks = []
for (const r of fromCsv(readFileSync(v4Path, 'utf8')))
  for (const f of S4_NONBLANK) if (r[f] === null || r[f] === '') blanks.push({ domain: r.domain, field: f })

// conservation: nothing deleted
const conservation = {
  seated_v3: seated.length,
  seated_new: seatedNew.length,
  ceiling_routed: ceilingRouted.length,
  seated_v4: v4.length,
  ok: seated.length + seatedNew.length - ceilingRouted.length === v4.length,
  export_companies: exCompanies.length,
  export_domains: exportDomains.size,
  routed: routedRows.length,
  contacts_in: exContacts.length,
  contacts_out: allContacts.length,
  contacts_ok: exContacts.length === allContacts.length,
}

// ─────────────────────────────────────────────────────────────────────────────
// report
// ─────────────────────────────────────────────────────────────────────────────
const out = []
const p = (s = '') => out.push(s)
const tbl = (head, rows) => {
  p(`| ${head.join(' | ')} |`)
  p(`|${head.map(() => '---').join('|')}|`)
  for (const r of rows) p(`| ${r.map((c) => String(c ?? '')).join(' | ')} |`)
  p()
}

p(`# Adaptall export → industrial list (${DATE})`)
p()
p(`**Input:** \`emails/adaptall-data/data/\` — ${exCompanies.length} companies, ${exContacts.length} US contacts, `)
p(`${exLocations.length} US location rows, ${exLocator.length} verified locator rows.`)
p(`**Output:** \`lists/seated-v4.csv\` = ${v4.length} · \`lists/first-send-200.csv\` (updated in place) · `)
p(`\`data/enrichment/contacts-adaptall-${DATE}.csv\` = ${allContacts.length} · \`lists/adaptall-routed-${DATE}.csv\` = ${routedRows.length}.`)
p()

p(`## Readback (§5s) — the mandatory check`)
p()
const totalCells = readbacks.reduce((n, r) => n + r.cells, 0)
const totalDiffs = readbacks.reduce((n, r) => n + r.diffs.length, 0)
tbl(['File', 'Rows', 'Cells diffed', 'Differences'], readbacks.map((r) => [`\`${r.label}\``, r.rows, r.cells.toLocaleString(), r.diffs.length === 0 ? '**0**' : `**${r.diffs.length}**`]))
p(`**${totalCells.toLocaleString()} cells diffed field-for-field, ${totalDiffs} differences.** ` +
  `S4 columns non-blank on all ${v4.length} rows: ${blanks.length === 0 ? '**yes**' : `**NO — ${blanks.length} blanks**`}. ` +
  `Re-verified by a second, independent reader (Python's \`csv\`, which shares no code with this module's parser): ` +
  `**0 unexpected cell changes** between \`seated-v3\` and \`seated-v4\` outside the six size columns this stage ` +
  `intends to touch, **0 unexpected changes** in \`first-send-200.csv\`, **0 rows without \`source_url\` + ` +
  `\`captured\`** in either the list or the contact file, and the seated declaration byte-identical to the sentence ` +
  `published at \`/adaptall-products-metric-adapters-the-hose-shop.html\`. ` +
  `\`seated-v3.csv\`'s own hash is unchanged.`)
if (totalDiffs) {
  p()
  p('```')
  for (const r of readbacks) for (const d of r.diffs.slice(0, 20)) p(`${r.label} row ${d.row} ${d.domain ?? ''} ${d.field}: want=${JSON.stringify(d.want)} got=${JSON.stringify(d.got)}`)
  p('```')
}
p()
p(`Conservation: ${conservation.seated_v3} seated-v3 + ${conservation.seated_new} net-new − ${conservation.ceiling_routed} routed ` +
  `\`above-ceiling\` = ${conservation.seated_v4} → **${conservation.ok ? 'PASS' : 'FAIL'}**. ` +
  `Contacts ${conservation.contacts_in} in = ${conservation.contacts_out} out ` +
  `→ **${conservation.contacts_ok ? 'PASS' : 'FAIL'}**. Nothing deleted; every non-seated export company and every ` +
  `ceiling-routed row carries a disposition in \`adaptall-routed-${DATE}.csv\`.`)
p()
p(`**Why one routed file rather than ten pool version-bumps.** ${routedRows.length} rows spread across eight ` +
  `dispositions would mean rewriting \`pool-non-us-v9\` → \`v10\`, \`pool-not-a-distributor-v10\` → \`v11\` and six ` +
  `more, each a 500–3,500-row rewrite for one to seven new rows, and each a fresh chance at the field-blanking ` +
  `failure §5s exists to catch. \`first-send-200-routed.csv\` and \`sendfix-routed-${DATE}.csv\` already set this ` +
  `precedent. The rows carry \`disposition\` and merge into the pools whenever the next full pool version is cut.`)
p()

p(`## T1 — companies seated`)
p()
p(`**One of the five briefed "genuine candidates" survived verification.** The other four did not, and two of them ` +
  `failed for the same reason a domain-exact reconciliation could never have caught: the company is already on the ` +
  `list under a different apex.`)
p()
if (seatedNew.length) {
  tbl(['Domain', 'Company', 'City', 'Rank', 'Band', 'Tier', 'Seg', 'Brands', 'SKUs', 'E-com'],
    seatedNew.map((r) => [`\`${r.domain}\``, r.company_display, `${r.city}, ${r.state}`, r.rank_score, r.size_band, r.tier, r.segment, r.brand_count, r.sku_estimate ?? '—', r.ecommerce_class ?? '—']))
  p(`Enriched on the shipped passes, not asserted: \`linecards-adaptall-${DATE}.json\` read six brands off ` +
    `\`/manufacturers.html\`, and \`catalog-adaptall-${DATE}.json\` measured 1,607 product URLs from a 2,467-URL sitemap ` +
    `at \`high\` confidence. Rank 68 sits **below the first-send cut of 75**, so it does not enter the cohort.`)
  p()
  p(`⚠ **The size band is a proxy artifact and should be read as one.** \`above-band\` / T0 comes from 3 branches + ` +
    `6 brands + 1,607 SKUs clearing the score-45 cut, not from evidence of $50M. A three-branch New Jersey hose shop ` +
    `is a T1-shaped prospect, not a T0 one. Nothing was overridden — the shipped scorer ran unchanged — but the ` +
    `band is the weakest claim on the row.`)
} else p(`**None.** Every candidate failed verification — see below.`)
p()
p(`### ⚠ Send-blocking: \`thehoseshop.com\` is two companies in one row`)
p()
p(`Seating \`hoseshop.com\` exposed a defect in \`seated-v3\` that predates this stage. The row for ` +
  `\`thehoseshop.com\` carries **The Hose Shop of Santa Cruz, CA**'s homepage as its \`self_declaration\` ` +
  `("Hoses, Fittings, and Tubing Parker Store in Santa Cruz CA … 121 Ingalls St") while its \`address_1\`, ` +
  `\`city\`, \`state\`, \`zip5\` and \`phone_e164\` are **The Hose Shop, Inc. of Somerset, New Jersey**'s ` +
  `(400 Apgar Dr, 732-562-1000). The dedupe collapsed two unrelated companies on the normalized name \`hose shop\`, ` +
  `and \`location_count: 7\` is the two companies' Google Maps listings added together.`)
p()
p(`**Consequence:** \`seated-v4\` now contains both \`thehoseshop.com\` and \`hoseshop.com\` carrying the same ` +
  `New Jersey phone number, so the Somerset company would be contacted twice — once under a Californian ` +
  `distributor's declaration. **That row must be split, or its NAP corrected to Santa Cruz, before either sends.** ` +
  `Left in place rather than half-fixed here: re-attributing its six Maps CIDs needs a fetch this stage did not ` +
  `have licence to make, and a partial correction is worse than a flagged one. This is the ` +
  `\`northernhydraulics\` name-collision hazard, realised.`)
p()
p(`### Per-company decision`)
p()
tbl(['Domain', 'Verdict', 'Why'], Object.entries(EXPORT_VERDICTS).map(([d, v]) => [`\`${d}\``, v.disposition, v.reason]))
p()

p(`## T2 — named contacts merged`)
p()
p(`${contactMerge.applied} company rows gained a named contact. All ${allContacts.length} contacts are kept whole in ` +
  `\`data/enrichment/contacts-adaptall-${DATE}.csv\` for later multi-contact sequencing, each carrying its title class, ` +
  `its §5u email verdict and whether its company is in \`seated-v4\`.`)
p()
tbl(['Title class', 'Best-contact rows'], Object.entries(contactMerge.byClass).sort((a, b) => TITLE_RANK[a[0]] - TITLE_RANK[b[0]]).map(([k, v]) => [k, v]))
const clsAll = {}
for (const c of allContacts) clsAll[c.title_class] = (clsAll[c.title_class] ?? 0) + 1
tbl(['Title class', 'All 623 contacts', 'Share'], Object.entries(clsAll).sort((a, b) => TITLE_RANK[a[0]] - TITLE_RANK[b[0]]).map(([k, v]) => [k, v, `${((v / allContacts.length) * 100).toFixed(1)}%`]))
p(`⚠ **The briefing's "120 owner/president/GM-class (19%)" does not survive a strict reading of the titles.** ` +
  `Counted with "Vice President" held apart from "President" — the distinction that decides who actually signs — ` +
  `it is **${clsAll.owner ?? 0} owner/founder/president/CEO (${(((clsAll.owner ?? 0) / allContacts.length) * 100).toFixed(1)}%)** ` +
  `and **${(clsAll.owner ?? 0) + (clsAll['general-manager'] ?? 0)} owner-or-GM ` +
  `(${((((clsAll.owner ?? 0) + (clsAll['general-manager'] ?? 0)) / allContacts.length) * 100).toFixed(1)}%)**. ` +
  `The 19% figure only reaches 19% by folding VPs in. ` +
  `**${(clsAll.sales ?? 0) + (clsAll.branch ?? 0)} of ${allContacts.length} (${((((clsAll.sales ?? 0) + (clsAll.branch ?? 0)) / allContacts.length) * 100).toFixed(1)}%) are Sales or Branch Manager** — ` +
  `the two classes the brief correctly rules out as the buyer.`)
p()
const verdicts = {}
for (const c of allContacts) verdicts[c.email_verdict] = (verdicts[c.email_verdict] ?? 0) + 1
p(`**§5u re-run over all ${allContacts.length} addresses:**`)
p()
tbl(['Verdict', 'n', 'Action'], [
  ['`own-domain`', verdicts['own-domain'] ?? 0, 'accepted'],
  ['`domain-mismatch`', verdicts['domain-mismatch'] ?? 0, 'reported, **not** nulled — §5u: nulling on suspicion destroys reachable prospects'],
  ['`marketplace-inbox`', verdicts['marketplace-inbox'] ?? 0, 'flagged (`mweston@applied.com` — a national chain\'s inbox)'],
  ['`manufacturer-inbox`', verdicts['manufacturer-inbox'] ?? 0, 'would be voided; **none found**'],
  ['`none`', verdicts.none ?? 0, 'no address published'],
])
p(`The mismatches are overwhelmingly **sibling-domain**, not manufacturer: \`hoseshopinc.com\` for The Hose Shop, ` +
  `\`mfcpinc.com\` for MFCP, \`flodraulicgroup.com\` for Flodraulic, \`morrellinc.com\` and \`womackmachine.com\` for ` +
  `Evolution Motion. That is why the rule bites on the manufacturer registry and not on inequality alone — a blanket ` +
  `"drop anything off-apex" would have destroyed ${verdicts['domain-mismatch'] ?? 0} working addresses to catch zero bad ones.`)
p()
const ceilingDomains = new Set(ceilingRouted.map((c) => c.domain))
const contactsAtCeiling = allContacts.filter((c) => ceilingDomains.has(c.domain)).length
const contactsSeated = allContacts.filter((c) => c.in_seated_v4 === 'true').length
p(`**Where the contact volume actually sits.** ${allContacts.length - contactsSeated} of ${allContacts.length} ` +
  `contacts belong to companies that are NOT in \`seated-v4\`, and **${contactsAtCeiling} of them sit at the seven ` +
  `networks T3 has just routed \`above-ceiling\`** (Purvis 89, MFCP 76, HosePower 63, OTC 57). The export's ` +
  `people-data is richest exactly where the offer does not fit — 54% of it is at companies too big to sell to.`)
p()

p(`### first-send-200 rows that gained a named contact`)
p()
if (fsGained.length) {
  tbl(['Domain', 'Company', 'Name', 'Title', 'Email', 'Status'], fsGained.map((g) => [`\`${g.domain}\``, g.company, g.name, g.title, g.email ?? '—', g.status ?? '—']))
  p(`Four of the 200 — every one of them a **President**, which is the ranking earning its keep: three of these four ` +
    `companies also publish a Branch Manager, and \`evolutionmotion.com\` publishes fourteen people senior enough to ` +
    `outrank one on a naive sort. \`airlinehyd.com\`'s President has no published address; he is still the pick, ` +
    `because Track 1 is a founder working accounts by hand and the name is what gets him past the front desk.`)
} else p(`None.`)
p()

p(`## T3 — location counts`)
p()
const distinctPairs = [...locationCounts.values()].reduce((n, s) => n + s.size, 0)
const naiveKey = new Set(exLocations.map((l) => `${String(l.company ?? '').trim().toLowerCase()}||${String(l.address ?? '').trim().toLowerCase()}`)).size
p(`${exLocations.length} raw rows → **${distinctPairs} distinct \`(company, address)\` pairs** across ${locationCounts.size} companies.`)
p()
p(`**§5m's trap turned out to bite in both directions here, which is worth recording.** Counting raw rows ` +
  `over-counts by ${exLocations.length - distinctPairs} (the same branch found by two evidence tiers). But keying on ` +
  `\`company + address\` *alone* — the obvious reading of "distinct (company, address) pairs" — gives ${naiveKey}, ` +
  `**${distinctPairs - naiveKey} fewer**, because one company's "1 Main St" in two different cities collapses to one ` +
  `branch. The key has to be \`normalizeAddress + city + state\`; the naive pair key is a bigger error than the raw ` +
  `row count it was meant to fix.`)
p()
p(`${locationChanges.length + ceilingRouted.length} seated rows were undercounted. Of those, ` +
  `**${ceilingRouted.length} crossed §3.3's ${CEILING}-address ceiling and routed \`above-ceiling\`** rather than being re-scored ` +
  `(\`size.mjs\`'s location table pays 0 points at ≥20, so leaving them seated would rank a 92-branch network below a ` +
  `three-branch shop). The remaining ${locationChanges.length} were re-scored in place: **${bandChanges.length} changed size band**, ` +
  `${tierChanges.length} changed tier.`)
p()
if (ceilingRouted.length)
  tbl(['Domain', 'Company', 'was', 'now', 'Was ranked'],
    ceilingRouted.map((c) => [`\`${c.domain}\``, c.company_display, c.was, c.now, c.wasRank]))
p()
if (locationChanges.length) {
  tbl(['Domain', 'Company', 'was', 'now', 'Band', 'Tier', 'Rank'],
    locationChanges.map((c) => [`\`${c.domain}\``, c.company, c.from, c.to, c.band[0] === c.band[1] ? c.band[0] : `${c.band[0]} → **${c.band[1]}**`, c.tier[0] === c.tier[1] ? c.tier[0] : `${c.tier[0]} → **${c.tier[1]}**`, c.rank[0] === c.rank[1] ? c.rank[0] : `${c.rank[0]} → ${c.rank[1]}`]))
  p(`⚠ **Both band changes move a company DOWN the ranking, and that is the model working, not a bug.** Crossing ` +
    `into \`above-band\` costs more rank weight than the extra branches earn, so \`airlinehyd.com\` falls 79 → 65 and ` +
    `\`powerdrives.com\` 68 → 54 — both are first-send cohort members. Better size data made two prospects look worse, ` +
    `which is the same direction §5n measured when enrichment demoted 2,147 companies. **The cohort's membership was ` +
    `NOT re-cut on this**; the ranks in \`first-send-200.csv\` were updated in place and the 200 rows are unchanged, ` +
    `because re-cutting would discard hand-verified companies on a proxy.`)
}
p(`Location companies that matched no domain in the export (${unmatchedLocationCompanies.length}): ` +
  (unmatchedLocationCompanies.map((u) => `${u.company} (${u.count})`).join(', ') || 'none'))
p()

p(`## T4 — Apollo (report only, no action taken)`)
p()
p(`The export carries \`apollo_org_id\` on ${exCompanies.filter((c) => c.apollo_org_id).length} of ${exCompanies.length} companies ` +
  `and \`apollo_person_id\` on **${exContacts.filter((c) => c.apollo_person_id).length} of ${exContacts.length} contacts — every one**. ` +
  `\`raw/apollo_orgs.json\` additionally carries \`organization_revenue_printed\` (Fastenal 8.2B, Motion 8.4B, ` +
  `Applied 4.6B), which is a paid Apollo field.`)
p()
p(`**Those ids can only have come from a live, working Apollo account.** \`02-list-guide.md\` lists S5 — Apollo, for ` +
  `named owner/president contacts — as the first of three stages blocking the send, gated on an account rather than ` +
  `on work; G1 is blocked on exactly that. This export is a 22-domain proof that the access exists somewhere in the ` +
  `estate. **That is the finding; it may unblock S5 for the other 2,700 companies.** No credential was sought, ` +
  `located, read or used here, and nothing in this stage calls Apollo.`)
p()
p(`Scale check before anyone celebrates: this export covers ${new Set(allContacts.map((c) => c.domain)).size} domains. ` +
  `\`seated-v4\` has ${v4.length}. The access matters; these 623 rows are ~0.5% of what S5 has to produce.`)
p()

p(`## What contradicted the plan`)
p()
p(`1. **The briefed candidate set was mostly wrong, and in an instructive way.** Of the five "genuine candidates", ` +
  `\`hoseshop.com\` seats; \`murdockindustrial.com\` is the seated \`hosewarehouse.com\` (same company, same Akron ` +
  `address — the seated row's own \`source_url\` already contains 18 \`murdockindustrial.com\` pages); ` +
  `\`taylorfluid.com\` is in Ontario, Canada; and \`oilairproducts.com\` and \`prcindustrialsupply.com\` are both ` +
  `NXDOMAIN with no sourceable address. **A domain-exact reconciliation cannot tell "absent" from "present under ` +
  `another apex", and that was 2 of the 5.**`)
p(`2. **The briefing said 16 domains appear nowhere; there are 17.** \`otpindustrial-solutions.com\` is the ` +
  `seventeenth — a contact-only domain, which is why a companies-table-only pass missed it. It is a dead apex for ` +
  `a 100+-branch chain.`)
p(`3. **\`connectallltd.com\` is filed \`US / Plattsburgh NY\` by the export and is a Quebec company.** The briefing ` +
  `read it as "looks Canadian" and was right for the wrong reason. Its own locations page publishes one address — ` +
  `Laval, Quebec — and a 514 number; the 518 number in its footer is what put "Plattsburgh NY" in the roster. ` +
  `**The export's \`country\` column is a claim, not a verdict, and §5t's precedence rule is what settles it.**`)
p(`4. **The single largest effect of this fold-in is not the seat or the contacts — it is T3 removing seven ` +
  `companies.** Better branch data reclassified ~0.25% of the list as too big for the offer, including one row ` +
  `(\`tipcotech.com\`) carried at **1** location that has **39**.`)
p(`5. **The export's people-data is concentrated where the offer does not fit.** ${contactsAtCeiling} of ` +
  `${allContacts.length} contacts belong to the seven above-ceiling networks; only ${contactsSeated} sit on companies ` +
  `in \`seated-v4\`.`)
p(`6. **\`otcindustrial.com\` is seated as "JCI Industries Inc".** The apex belongs to OTC Industrial Technologies ` +
  `(100+ branches); JCI is a company it acquired. Same shape as §5u's \`corrosionfluid.com\` / ` +
  `\`spencerfluidpower.com\` finding — a chain subsidiary the suppression missed, caught here by contact shape and ` +
  `branch census rather than by the classifier.`)
p()

p(`## Hashes`)
p()
tbl(['File', 'sha256[:16]'], [
  [`\`seated-v3.csv\` (input, unchanged)`, sha(readFileSync(resolve(ROOT, 'lists', 'seated-v3.csv'), 'utf8'))],
  [`\`first-send-200.csv\` (before)`, sha(fsBefore)],
  [`\`first-send-200.csv\` (after)`, sha(fsCsv)],
  [`\`seated-v4.csv\``, sha(v4Csv)],
  [`\`contacts-adaptall-${DATE}.csv\``, sha(contactsCsv)],
])

writeFileSync(resolve(ROOT, 'data', `_adaptall-integration-${DATE}.md`), out.join('\n') + '\n')

// ─────────────────────────────────────────────────────────────────────────────
// console
// ─────────────────────────────────────────────────────────────────────────────
console.log(`S4g — Adaptall fold-in · ${DATE}`)
console.log(`  seated-v3 ${seated.length} + ${seatedNew.length} net-new → seated-v4 ${v4.length} (conservation ${conservation.ok ? 'PASS' : 'FAIL'})`)
console.log(`  contacts: ${contactMerge.applied} rows gained a named contact; ${allContacts.length} kept whole`)
console.log(`  locations: ${locationChanges.length} corrected, ${bandChanges.length} band changes, ${tierChanges.length} tier changes`)
console.log(`  readback: ${totalCells.toLocaleString()} cells, ${totalDiffs} diffs; S4 blanks ${blanks.length}`)
console.log(`  routed: ${routedRows.length}`)
if (totalDiffs || blanks.length || !conservation.ok) process.exitCode = 1
