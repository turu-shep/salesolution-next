import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildVocab, makeScorer, norm } from './manufacturer.mjs'

const VOCAB = buildVocab([
  'Parker', 'Timken', 'Garlock', 'SKF', 'Gates', 'Enerpac', 'Dixon', 'Kuriyama',
  'RBC Bearings', 'Dodge', 'Toyota Forklift', 'NTN',
])
const score = makeScorer(VOCAB)

/** Pad past the 200-char `observed` floor without adding matchable words. */
const pad = (s) => s + ' ' + 'z'.repeat(Math.max(0, 260 - s.length))

const row = (o = {}) => ({
  domain: 'example.com',
  company_display: 'Example Company',
  company: 'example company',
  homepage_title: '',
  homepage_text: pad('generic industrial page'),
  linecard_text: null,
  linecard_url: null,
  brand_authorized: [],
  lc_brands: [],
  sku_estimate: null,
  self_declaration: null,
  homepage_garbage: 0,
  ...o,
})

test('buildVocab drops brands shorter than four characters', () => {
  const v = buildVocab(['3M', 'ABB', 'Gates', 'SKF', ''])
  assert.deepEqual([...v].sort(), ['gates'])
})

// `norm` deliberately does NOT trim: the phrase matcher anchors on
// `(^|[^a-z0-9])`, so the padding space is what lets a phrase at the very start
// of a page match at all.
test('norm folds curly quotes and collapses whitespace without trimming', () => {
  assert.equal(norm('  We’re   a MAKER!  '), " we're a maker ")
})

test('a first-person manufacture claim scores as a manufacturer', () => {
  const r = row({
    domain: 'trengineering.com',
    company_display: 'TR ENGINEERING INC.',
    homepage_text: pad('We manufacture a broad line of hydraulic hand pumps and valves. We produce an extensive range of hand pumps.'),
  })
  const s = score(r)
  assert.equal(s.verdict, 'manufacturer')
  assert.ok(s.mfg > s.dist)
})

test('an authorized distributor with locator brands scores as a distributor', () => {
  const r = row({
    domain: 'triadtechnologies.com',
    company_display: 'Triad Technologies',
    homepage_text: pad('We are a premier, full-line stocking distributor of Parker Hannifin products. Line Card. We carry Dixon, Enerpac and Kuriyama.'),
    brand_authorized: ['Enerpac', 'Parker', 'Dixon'],
  })
  const s = score(r)
  assert.equal(s.verdict, 'distributor')
  assert.ok(s.dist >= 7, 'three locator brands must weigh at least 7')
})

// The defect the attribution test exists for.
test('a manufacture claim about a RESOLD brand is not attributed to the seller', () => {
  const r = row({
    domain: 'sealcompany.com',
    company_display: 'SEAL CO ENTERPRISES INC',
    homepage_text: pad('Garlock is a leading manufacturer of high-performance sealing solutions. Seal Company is an authorized distributor of o-rings.'),
    brand_authorized: ['Timken'],
  })
  const s = score(r)
  assert.equal(s.verdict, 'distributor')
  assert.ok(
    !s.signals.some((x) => x.startsWith('M3')),
    'the Garlock sentence must not register as an own-name claim',
  )
})

test('the same claim about the company itself IS attributed to it', () => {
  const r = row({
    domain: 'nhbb.com',
    company_display: 'New Hampshire Ball Bearings',
    homepage_text: pad('New Hampshire Ball Bearings, Inc. (NHBB) is a leading manufacturer of precision bearings.'),
  })
  assert.ok(score(r).signals.some((x) => x.startsWith('M3')))
})

// Plural / singular disambiguation — the biggest false-negative source.
test('"authorized distributors" (their dealers) is a manufacturer signal', () => {
  const r = row({ homepage_text: pad('Products. Authorized Distributors. Sales Network. Contact Engineering.') })
  const s = score(r)
  assert.ok(s.signals.some((x) => x.startsWith('M2')))
  assert.ok(!s.signals.some((x) => x.startsWith('D1')))
})

test('"an authorized distributor" (themselves) is a distributor signal', () => {
  const r = row({ homepage_text: pad('We are an authorized distributor for several product lines.') })
  const s = score(r)
  assert.ok(s.signals.some((x) => x.startsWith('D1')))
  assert.ok(!s.signals.some((x) => x.startsWith('M2')))
})

// Regressions for the two phrase bugs the hand check surfaced.
test('"our factory-trained technicians" is a dealer phrase, not a make claim', () => {
  const r = row({ homepage_text: pad('Our factory-trained technicians provide sales and service for air compressors.') })
  assert.ok(!score(r).signals.some((x) => x.startsWith('M1')))
})

test('"our factory" on its own still counts', () => {
  const r = row({ homepage_text: pad('Ordered direct from our factory with same day shipping.') })
  assert.ok(score(r).signals.some((x) => x.startsWith('M1')))
})

test('a reseller word in the company name weighs against the zero-brand signal', () => {
  const bare = row({ homepage_text: pad('Steel bar and wire, cut to length.'), sku_estimate: 200 })
  const named = row({ company_display: 'Metro Wire Supply', homepage_text: pad('Steel bar and wire, cut to length.'), sku_estimate: 200 })
  assert.ok(score(named).score < score(bare).score)
  assert.ok(score(named).signals.some((x) => x.startsWith('D6')))
})

// Own-brand collision: RBC Bearings' own brand must not read as a third party's.
test("a company's own brand is not counted as another party's", () => {
  const r = row({
    domain: 'rbcbearings.com',
    company_display: 'RBC Eastern Distribution Center',
    homepage_text: pad('RBC Bearings Incorporated. Our manufacturing facilities are located in the United States.'),
    lc_brands: ['RBC Bearings'],
  })
  const s = score(r)
  assert.ok(!s.signals.some((x) => x.startsWith('D2')), 'own brand must not count as a harvested line card')
})

test('"remanufacturing" in a title does not by itself claim manufacture', () => {
  const r = row({ homepage_title: 'Bearing remanufacturing services', homepage_text: pad('We remanufacture bearings.') })
  assert.ok(!score(r).signals.some((x) => x.startsWith('M4')))
})

test('"remanufacturing" does not mask a real claim in the same title', () => {
  const r = row({
    homepage_title: 'Spring manufacturer and bearing remanufacturing',
    homepage_text: pad('Custom springs.'),
  })
  assert.ok(score(r).signals.some((x) => x.startsWith('M4')))
})

test('a page with no readable text is `unobserved`, never `distributor`', () => {
  assert.equal(score(row({ homepage_text: null })).verdict, 'unobserved')
  assert.equal(score(row({ homepage_text: pad('x'), homepage_garbage: 0.4 })).verdict, 'unobserved')
})

test('no single signal reaches the routing threshold on its own', () => {
  // §5f cuts both ways: one signal must never be enough to route.
  const single = [
    row({ homepage_text: pad('We manufacture widgets.'), brand_authorized: ['Timken'] }),
    row({ homepage_title: 'Widget Manufacturer', brand_authorized: ['Timken'] }),
  ]
  for (const r of single) assert.ok(score(r).score < 6, `${r.homepage_title} routed on one signal`)
})

test('the verdict is a pure function of the row', () => {
  const r = row({ homepage_text: pad('We manufacture widgets in our own factory.') })
  assert.deepEqual(score(r), score({ ...r }))
})
