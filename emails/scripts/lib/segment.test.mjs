import assert from 'node:assert/strict'
import { test } from 'node:test'
import { makeRecord, split } from './contract.mjs'
import {
  MANUFACTURER_EMAIL_SOURCES,
  isCohortE,
  isOwnerIdentifiable,
  segmentOf,
  segmentScores,
  tierOf,
  typeToCode,
} from './segment.mjs'

const rec = (o) =>
  makeRecord({
    company: 'x',
    source: 'dfs',
    source_url: 'https://example.com/',
    captured: '2026-08-01',
    ...o,
    brand_authorized: split(o.brand_authorized),
    line_card: split(o.line_card),
  })

// ─────────────────────────────────────────────────────────────────────────────
// The source's own taxonomy, read as published
// ─────────────────────────────────────────────────────────────────────────────

test('DFS category codes decide A', () => {
  const r = rec({ line_card: 'DFS:hydraulic_equipment_supplier|DFS:hose_supplier' })
  assert.equal(segmentOf(r), 'A')
})

test('DFS category codes decide B', () => {
  const r = rec({ line_card: 'DFS:bearing_supplier|DFS:electric_motor_store' })
  assert.equal(segmentOf(r), 'B')
})

test("AD's BPT division is B and PVF is A", () => {
  assert.equal(segmentScores(rec({ line_card: 'AD:BPT Bearings & Power Transmission' })).scores.B, 3)
  assert.equal(segmentScores(rec({ line_card: 'AD:PVF Pipe, Valves & Fittings' })).scores.A, 2)
})

test('PTDA categories split across A and B on the published string', () => {
  const b = segmentScores(rec({ line_card: 'PTDA:BEARINGS|PTDA:BELT & CHAIN DRIVES|PTDA:GEARING (open/closed)' }))
  assert.equal(b.segment, 'B')
  const a = segmentScores(rec({ line_card: 'PTDA:HYDRAULICS & PNEUMATICS|PTDA:PUMPS' }))
  assert.equal(a.scores.A, 4)
})

test('distributor_type is the same taxonomy in English', () => {
  assert.equal(typeToCode('Hydraulic equipment supplier'), 'hydraulic_equipment_supplier')
  assert.equal(segmentOf(rec({ distributor_type: 'Hydraulic equipment supplier, Hose supplier' })), 'A')
})

test('a locator votes for its own product class but cannot decide alone', () => {
  // A locator listing is 3 points, one short of SEGMENT_FLOOR. Deliberate: a
  // general-MRO house that happens to stock Enerpac is on Enerpac's locator too,
  // and one source saying "hydraulics" is a vote, not a verdict.
  assert.equal(segmentScores(rec({ source: 'enerpac|dfs' })).scores.A, 3)
  assert.equal(segmentOf(rec({ source: 'enerpac|dfs' })), 'C')
  // Corroborated by any second axis, it decides.
  assert.equal(segmentOf(rec({ source: 'enerpac|dfs', brand_authorized: 'Enerpac' })), 'A')
  assert.equal(segmentOf(rec({ source: 'ptda|dfs', line_card: 'PTDA:BEARINGS' })), 'B')
})

test('brands vote for their own segment', () => {
  assert.equal(segmentOf(rec({ brand_authorized: 'Timken|SKF|Dodge' })), 'B')
  assert.equal(segmentOf(rec({ brand_authorized: 'Enerpac|Parker|Graco' })), 'A')
})

// ─────────────────────────────────────────────────────────────────────────────
// The rules that keep C honest
// ─────────────────────────────────────────────────────────────────────────────

test('C is the residual — a generic industrial supplier is not forced into A or B', () => {
  const r = rec({ company_display: 'Acme Industrial Supply Co.', line_card: 'DFS:industrial_equipment_supplier|DFS:fastener_supplier' })
  assert.equal(segmentOf(r), 'C')
})

test('a tie inside the margin falls to C rather than being guessed', () => {
  // Three A points and three B points: over the floor on neither margin.
  const r = rec({ line_card: 'DFS:hose_supplier|DFS:bearing_supplier' })
  const s = segmentScores(r)
  assert.equal(s.scores.A, 3)
  assert.equal(s.scores.B, 3)
  assert.equal(s.segment, 'C')
})

test('no SKU gate — §5d: the estimator is a tiering input, never a filter', () => {
  // A thin general-MRO record still gets a segment. §4.3's ≥1,000-SKU floor for
  // Segment C is deliberately NOT implemented (§5d: precision 0.60, 54% unknown).
  const r = rec({ company_display: 'Small Supply', sku_estimate: 3 })
  assert.equal(segmentOf(r), 'C')
})

test('one verbose axis cannot out-shout the others (AXIS_CAP)', () => {
  // Five distinct B codes are worth 15 uncapped. A PTDA member publishing its
  // whole taxonomy is a PTDA member, not five times more bearings-shaped.
  const many = 'DFS:bearing_supplier|DFS:belt_shop|DFS:conveyor_belt_supplier|DFS:electric_motor_store|DFS:electric_motor_repair_shop'
  assert.equal(segmentScores(rec({ line_card: many })).scores.B, 6)
})

test('W is the disposition talking, not the scorer', () => {
  const r = rec({ disposition: 'no-website', line_card: 'DFS:bearing_supplier|DFS:belt_shop' })
  assert.equal(segmentOf(r), 'W')
})

test('Gates votes for neither segment — it makes both belts and hose', () => {
  const s = segmentScores(rec({ brand_authorized: 'Gates' }))
  assert.equal(s.scores.A, 0)
  assert.equal(s.scores.B, 0)
})

// ─────────────────────────────────────────────────────────────────────────────
// Tiers
// ─────────────────────────────────────────────────────────────────────────────

const hot = () =>
  rec({
    company_display: 'Hot Co',
    domain: 'hot.com',
    phone_e164: '2125550000',
    address_1: '1 main st',
    zip5: '10001',
    evidence_depth: 3,
  })

test('T1 needs all four conditions', () => {
  assert.equal(tierOf(hot(), { band: '10-50M' }, 'catalog_rfq_no_cart'), 'T1')
  // …fails on e-commerce class
  assert.equal(tierOf(hot(), { band: '10-50M' }, 'ecom_full'), 'T2')
  // …fails on evidence depth
  assert.equal(tierOf(rec({ ...hot(), evidence_depth: 2 }), { band: '10-50M' }, 'catalog_no_cart'), 'T2')
  // …fails on size band
  assert.equal(tierOf(hot(), { band: '5-10M' }, 'catalog_no_cart'), 'T3')
})

test('owner-identifiable is refused when identity resolution is still open', () => {
  const r = hot()
  r.needs_identity_resolution = true
  assert.equal(isOwnerIdentifiable(r), false)
  assert.equal(tierOf(r, { band: '10-50M' }, 'catalog_no_cart'), 'T2')
})

test('owner-identifiable needs a full NAP a human can walk into', () => {
  const r = hot()
  r.address_1 = null
  assert.equal(isOwnerIdentifiable(r), false)
})

test('the size bands map to T2/T3/T4 and above-band is named, not folded', () => {
  assert.equal(tierOf(rec({}), { band: '10-50M' }, 'brochure'), 'T2')
  assert.equal(tierOf(rec({}), { band: '5-10M' }, 'brochure'), 'T3')
  assert.equal(tierOf(rec({}), { band: '2-5M' }, 'brochure'), 'T4')
  assert.equal(tierOf(rec({}), { band: 'above-band' }, 'brochure'), 'T0')
})

test('Cohort E is a sending cohort, NOT a tier — a company can be both T1 and E', () => {
  // Implemented as a tier branch it demotes real T1 leads on a fact about the
  // address rather than about the company. §7.2 wants isolation at send time,
  // which a flag and a separate file give.
  const r = { ...hot(), email: 'a@b.com', email_source: 'enerpac' }
  assert.equal(isCohortE(r), true)
  assert.equal(tierOf(r, { band: '10-50M' }, 'catalog_rfq_no_cart'), 'T1')
})

test('a DFS-published email is the BUSINESS publishing itself, not a manufacturer', () => {
  assert.equal(isCohortE(rec({ email: 'a@b.com', email_source: 'dfs' })), false)
  assert.ok(!MANUFACTURER_EMAIL_SOURCES.has('dfs'))
})

test('a merged record with any self-published address is not Cohort E', () => {
  // `every`, not `some`: the cohort is "manufacturer-published email ONLY".
  assert.equal(isCohortE(rec({ email: 'a@b.com', email_source: 'enerpac|dfs' })), false)
})

test('no email at all is not Cohort E', () => {
  assert.equal(isCohortE(rec({ email_source: 'enerpac' })), false)
})
