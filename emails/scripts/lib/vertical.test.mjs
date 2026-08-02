/**
 * Tests for the S3c vertical filter. Every case here is a row that actually
 * exists in the pool, or a false positive the first build produced and this one
 * has to keep out.
 *
 *   node --test emails/scripts/lib/
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ICP_CLASSES } from './contract.mjs'
import {
  KEEP,
  VERTICALS,
  VERTICAL_DISPOSITION,
  buildBrandVocabulary,
  classifyIdentity,
  classifyName,
  domainLabel,
  mergeVerdicts,
  scoreRecord,
  sourcePrior,
  voteDomain,
} from './vertical.mjs'

const rec = (company_display, extra = {}) => ({
  company_display,
  company: company_display.toLowerCase(),
  domain: null,
  line_card: [],
  distributor_type: null,
  tier_raw: null,
  source: 'serp',
  ...extra,
})

// ─────────────────────────────────────────────────────────────────────────────
// contract
// ─────────────────────────────────────────────────────────────────────────────

test('every vertical is a legal icp_class and has a routing rule', () => {
  for (const v of VERTICALS) {
    assert.ok(ICP_CLASSES.includes(v), `${v} missing from ICP_CLASSES`)
    assert.ok(v in VERTICAL_DISPOSITION, `${v} has no disposition`)
  }
  assert.equal(VERTICAL_DISPOSITION[KEEP], null, 'industrial distributors stay seated')
  // §2a's usage: another trade is parked, not rejected.
  assert.equal(VERTICAL_DISPOSITION['other-trade'], 'adjacent-trade')
  assert.equal(VERTICAL_DISPOSITION['auto-parts'], 'not-a-distributor')
  assert.equal(VERTICAL_DISPOSITION['truck-fleet'], 'not-a-distributor')
})

// ─────────────────────────────────────────────────────────────────────────────
// the two verticals §5c.1 exists for
// ─────────────────────────────────────────────────────────────────────────────

test('automotive names route out', () => {
  for (const n of [
    'PARTS AUTHORITY HICKSVILLE',
    'GILBERT AUTO PARTS',
    'NAPA SOLON SPRINGS',
    'SOUTH LYON PARTS PLUS',
    'AUTO SPRING CO',
    'Tasco Auto Color',
    'MID NITE AUTO SALES',
  ]) {
    const v = classifyName(rec(n))
    assert.equal(v.vertical, 'auto-parts', n)
    assert.ok(v.decisive, n)
  }
})

test('truck and fleet names route out', () => {
  for (const n of [
    'RUSH TRUCK CENTER-DALLAS SOUTH',
    'MHC KENWORTH-CACTUS',
    'USA TRUCK PARTS & ACCESSORIES',
    'COVINGTON HEAVY DUTY PARTS',
    'COASTAL DIESEL SERVICE INC',
    'ACME TRUCK SERVICES',
  ]) {
    const v = classifyName(rec(n))
    assert.equal(v.vertical, 'truck-fleet', n)
    assert.ok(v.decisive, n)
  }
})

test('the domain label carries a name the source misspelled', () => {
  // Timken publishes "DOGGETT FRIGHTLINER SEARCY". No name pattern should be
  // taught that typo; the domain is what reads it.
  const v = classifyName(rec('DOGGETT FRIGHTLINER SEARCY'))
  assert.equal(v.vertical, KEEP, 'the name alone says nothing')
  const w = classifyName(rec('DOGGETT FRIGHTLINER SEARCY', { domain: 'doggettfreightliner.com' }))
  assert.equal(w.vertical, 'truck-fleet')
})

test('adjacent trades route to adjacent-trade, not to rejection', () => {
  for (const n of [
    'Standard Plumbing Supply Company',
    'Escom Electrical Distributors',
    'Central Plumbing Specialties Yonkers',
    'Carolina Drywall Supply LLC - Statesville',
    'Action Gypsum Supply, LP - IRV',
    'Robertson Heating Supply',
  ]) {
    const v = classifyName(rec(n))
    assert.equal(v.vertical, 'other-trade', n)
    assert.equal(VERTICAL_DISPOSITION[v.vertical], 'adjacent-trade')
  }
})

test('industrial distributors are kept, including the ones with a vehicle word', () => {
  for (const n of [
    'CARTNEY BEARING & SUPPLY CO',
    'Bearing Headquarters Company',
    'Hydraquip',
    // "industrial truck" is a forklift; "welding & truck" is a welding shop.
    'INDUSTRIAL TRUCK & FARM SUPPLY',
    "BOTT'S WELDING & TRUCK INC",
    // measured false positives of a bare-token classifier
    'Evolution Motion Solutions',
    'Applied Bearing Distributors',
    'Rundle-Spence Mfg. Co.',
    'Manufacturer Rep Network, LLC',
  ]) {
    assert.equal(classifyName(rec(n)).vertical, KEEP, n)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// domain labels — squashed, so every pattern has to be anchored
// ─────────────────────────────────────────────────────────────────────────────

test('domain labels do not match on substrings', () => {
  assert.equal(domainLabel('rush-truck.com'), 'rushtruck')
  assert.equal(domainLabel(null), '')
  // `napa` inside `buenaparklibrary`, `lumber` inside `plumberssupplyco`,
  // `^auto` inside every `automation*` — all measured false positives.
  for (const [name, domain] of [
    ['ONE STOP PARTS SOURCE', 'buenaparklibrary.org'],
    ['Automation Distribution', 'automationdistribution.com'],
    ['AutomationDirect', 'automationdirect.com'],
  ]) {
    assert.equal(classifyName(rec(name, { domain })).vertical, KEEP, domain)
  }
  // …while the real ones still score.
  assert.ok(scoreRecord(rec('GOLDER CO', { domain: 'goldersnapa.com' })).scores['auto-parts'] >= 6)
  assert.ok(scoreRecord(rec('WORLDWIDE EQUIPMENT INC', { domain: 'thetruckpeople.com' })).scores['truck-fleet'] >= 5)
})

// ─────────────────────────────────────────────────────────────────────────────
// the source's own category (Timken), validated in vertical.mjs
// ─────────────────────────────────────────────────────────────────────────────

test('the Timken category prior only fires for Timken records', () => {
  assert.deepEqual(sourcePrior(rec('X', { source: 'ad', tier_raw: '4' })).scores, {})
  assert.deepEqual(sourcePrior(rec('X', { source: 'timken', tier_raw: null })).scores, {})
  const four = sourcePrior(rec('X', { source: 'timken', tier_raw: '4' }))
  assert.ok(four.scores['truck-fleet'] > four.scores['auto-parts'], 'cat 4 leans truck, 1318 to 738')
  assert.ok(sourcePrior(rec('X', { source: 'timken|serp', tier_raw: '5, dealer_candidate' })).scores[KEEP] > 0)
})

test('category 4 decides an unreadable name; category 5 protects one', () => {
  // "TRACTION-AUGUSTA" and "POLAR SERVICE CENTER" carry no vehicle word and have
  // no cached homepage. Only the source's own category can read them.
  const t = classifyName(rec('TRACTION-AUGUSTA', { source: 'timken', tier_raw: '4', domain: 'traction.com' }))
  assert.equal(t.vertical, 'truck-fleet')
  assert.ok(t.decisive)
  // A category-5 record with a weak vehicle hit stays seated: the prior is worth
  // 6 and the margin test is symmetric.
  const c = classifyName(rec('MIDWEST SPRING CO', { source: 'timken', tier_raw: '5' }))
  assert.equal(c.vertical, KEEP)
  // The name still wins when it says something outright.
  const n = classifyName(rec('SMITH TRUCK PARTS', { source: 'timken', tier_raw: '5' }))
  assert.equal(n.vertical, 'truck-fleet')
})

// ─────────────────────────────────────────────────────────────────────────────
// the domain vote
// ─────────────────────────────────────────────────────────────────────────────

test('a domain vote needs two decisive votes and an outright majority', () => {
  assert.equal(voteDomain([rec('SAND LAKE PARTS PLUS')]), null, 'one vote is not a vote')
  const v = voteDomain([rec('SAND LAKE PARTS PLUS'), rec('FLINT PARTS PLUS'), rec('H & H HEAVY DUTY')])
  assert.equal(v.vertical, 'auto-parts')
  assert.equal(v.cast, 3)
  // A tie relabels nothing.
  assert.equal(voteDomain([rec('A AUTO PARTS'), rec('B TRUCK PARTS')]), null)
  // Rows that say nothing do not dilute the majority, they just do not vote.
  const q = voteDomain([rec('ACME CO'), rec('BETA LLC'), rec('X AUTO PARTS'), rec('Y AUTO PARTS')])
  assert.equal(q.vertical, 'auto-parts')
  assert.equal(q.cast, 2)
})

// ─────────────────────────────────────────────────────────────────────────────
// precedence
// ─────────────────────────────────────────────────────────────────────────────

test('a decisive name beats a confident homepage that says industrial', () => {
  // Measured: partsauthority.com's homepage classifies `industrial-distributor`,
  // NOT uncertain. Under S3a's homepage-first precedence all 63 Parts Authority
  // branches would have kept their seat.
  const v = mergeVerdicts({
    name: classifyName(rec('PARTS AUTHORITY BROOKLYN', { domain: 'partsauthority.com' })),
    text: { icp_class: KEEP, icp_uncertain: false },
    domain: null,
  })
  assert.equal(v.vertical, 'auto-parts')
  assert.equal(v.axis, 'name')
})

test('a confident homepage decides a name that says nothing', () => {
  const v = mergeVerdicts({
    name: classifyName(rec('POWER TRANSMISSION INC')),
    text: { icp_class: 'truck-fleet', icp_uncertain: false, evidence: 'Heavy-Duty Truck Parts' },
    domain: null,
  })
  assert.equal(v.vertical, 'truck-fleet')
  assert.equal(v.axis, 'homepage')
})

test('the domain vote only carries rows their own name cannot', () => {
  const name = classifyName(rec('H & H HEAVY DUTY'))
  const v = mergeVerdicts({ name, text: null, domain: { vertical: 'auto-parts', votes: 15, cast: 16 } })
  // Its own name is decisive for truck, so the domain vote does not overrule it.
  assert.equal(v.axis, 'name')
  const blank = classifyName(rec('AUTO CLINIC'.replace('AUTO CLINIC', 'ACME INC')))
  const w = mergeVerdicts({ name: blank, text: null, domain: { vertical: 'auto-parts', votes: 15, cast: 16 } })
  assert.equal(w.axis, 'domain-vote')
  assert.equal(w.vertical, 'auto-parts')
})

test('a thin homepage verdict routes but is flagged uncertain', () => {
  const v = mergeVerdicts({
    name: classifyName(rec('ACME INC')),
    text: { icp_class: 'directory', icp_uncertain: true },
    domain: null,
  })
  assert.equal(v.vertical, 'directory')
  assert.equal(v.uncertain, true)
})

test('nothing decides → keep, flagged', () => {
  const v = mergeVerdicts({ name: classifyName(rec('ACME INC')), text: null, domain: null })
  assert.equal(v.vertical, KEEP)
  assert.equal(v.uncertain, true)
})

// ─────────────────────────────────────────────────────────────────────────────
// AD's divisions are S2's decision, not this stage's
// ─────────────────────────────────────────────────────────────────────────────

test('an AD line-card division never routes a record', () => {
  const r = rec('Western Nevada Supply Co.', {
    source: 'ad',
    line_card: ['AD:PVF Pipe, Valves & Fittings', 'AD:WWD Waterworks', 'AD:HVAC HVAC'],
  })
  assert.equal(classifyName(r).vertical, KEEP, '§2a already spent these codes')
  // A non-AD source's own category string is still read, at the 0.4 discount.
  const e = scoreRecord(rec('Acme Co', { source: 'enerpac', line_card: ['Plumbing Supply'] }))
  assert.ok(e.scores['other-trade'] > 0)
})

// ─────────────────────────────────────────────────────────────────────────────
// The identity axis — whose site is this (§5c's failure mode, generalized)
// ─────────────────────────────────────────────────────────────────────────────

const vocab = buildBrandVocabulary([
  { brand_authorized: ['Flowserve', 'Grundfos', 'SMC', 'Gates', 'Continental', 'Alliance'] },
  { brand_authorized: 'Timken|Parker' },
])

test('identity: a brand owner on the acquirer registry is not a distributor', () => {
  const v = classifyIdentity(rec('Flowserve Corporation', { domain: 'flowserve.com' }), vocab)
  assert.equal(v.vertical, 'manufacturer')
  assert.equal(v.rule, 'registry')
  assert.equal(VERTICAL_DISPOSITION[v.vertical], 'not-a-distributor')
})

test('identity: the LIST-FREE rule catches a brand owner on no list at all', () => {
  // `gorbel.com` is on no registry; the pool's own line cards name Gorbel.
  const v = classifyIdentity(rec('Gorbel Inc', { domain: 'gorbel.com' }), buildBrandVocabulary([{ brand_authorized: ['Gorbel'] }]))
  assert.equal(v.rule, 'brand-owner')
  assert.equal(v.vertical, 'manufacturer')
})

test('identity: a corporate suffix is stripped only when the stem is exactly a brand', () => {
  // `leesonus.com` is on no registry — `leeson.com` is. The `us` suffix is what
  // resolves it, and the pool's own line cards are what name Leeson.
  const v2 = buildBrandVocabulary([{ brand_authorized: ['Leeson', 'Rexnord'] }])
  assert.equal(classifyIdentity(rec('LEESON', { domain: 'leesonus.com' }), v2).rule, 'brand-owner')
  assert.equal(classifyIdentity(rec('Rexnord', { domain: 'rexnordus.com' }), v2).rule, 'brand-owner')
  // `industries` is NOT a suffix: it is a word distributors use about themselves.
  assert.equal(classifyIdentity(rec('Continental Industries Group', { domain: 'continental-industries.com' }), vocab), null)
  assert.equal(classifyIdentity(rec('Alliance Industries', { domain: 'allianceindustries.us' }), vocab), null)
})

test('identity: a distributor whose name merely contains a brand is untouched', () => {
  assert.equal(classifyIdentity(rec('Gates Industrial Supply', { domain: 'gatesindustrialsupply.com' }), vocab), null)
  assert.equal(classifyIdentity(rec('Parker Store, operated by The Hope Group', { domain: 'thehopegroup.com' }), vocab), null)
})

test('identity: silent without a domain, so Segment W is never touched', () => {
  assert.equal(classifyIdentity(rec('Flowserve Corporation', { domain: null }), vocab), null)
})

test('identity: two-character brands never vote — 3M would match any 3m* label', () => {
  const v2 = buildBrandVocabulary([{ brand_authorized: ['3M'] }])
  assert.equal(v2.size, 0)
})

test('identity outranks every other axis, including a confident category verdict', () => {
  const v = mergeVerdicts({
    name: classifyName(rec('Flowserve Corporation', { domain: 'flowserve.com' })),
    category: { vertical: KEEP, decisive: true, uncertain: false, core: 9, evidence: 'pump_supplier' },
    identity: classifyIdentity(rec('Flowserve Corporation', { domain: 'flowserve.com' }), vocab),
  })
  assert.equal(v.axis, 'identity')
  assert.equal(v.vertical, 'manufacturer')
})

// ─────────────────────────────────────────────────────────────────────────────
// §5i — Yaskawa's groupList, and mk's own staff
// ─────────────────────────────────────────────────────────────────────────────

test("Yaskawa's HVAC and iQpump groups score adjacent, its industrial groups score ICP", () => {
  const hvac = sourcePrior(rec('Air Distribution Enterprises', { source: 'yaskawa', tier_raw: 'product_group_code=D13' }))
  assert.equal(hvac.scores['other-trade'], 5)
  const ind = sourcePrior(rec('Bayview Bearing & Supply', { source: 'yaskawa', tier_raw: 'product_group_code=D09' }))
  assert.equal(ind.scores['industrial-distributor'], 6)
  // 12 of the 232 carry both; reachable through an industrial group means KEEP.
  const both = sourcePrior(
    rec('X', { source: 'yaskawa', tier_raw: 'product_group_code=D09;product_group_code=D13' }),
  )
  assert.ok(both.scores['industrial-distributor'] > both.scores['other-trade'])
})

test("mk North America's own field staff are flagged by the source and scored as the maker", () => {
  const p = sourcePrior(rec('mk North America, Inc.', { source: 'mknorthamerica', tier_raw: 'is_mk_employee=true' }))
  assert.equal(p.scores.manufacturer, 6)
})
