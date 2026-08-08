import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildVocab, makeScorer, manufacturerPreFilter, norm } from './manufacturer.mjs'

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

// ─────────────────────────────────────────────────────────────────────────────
// §5t — signal D3 fired against a company's own brand
// ─────────────────────────────────────────────────────────────────────────────

const VIKING = buildVocab(['Viking', 'Parker', 'Timken', 'Martin', 'Nucor'])
const scoreV = makeScorer(VIKING)

// The defect: `vikingpump.com` was scored TOWARD distributor because
// `brand_authorized` contained "Viking" — its own name.
test('§5t: a brand match against the company’s own apex label is a MANUFACTURER signal', () => {
  const r = row({
    domain: 'vikingpump.com',
    company_display: 'Viking Pump Inc',
    company: 'viking pump',
    homepage_title: 'Viking Pump - Positive Displacement Pumps',
    homepage_text: pad('Viking Pump is the leading manufacturer of positive displacement pumps. Find a Distributor. Stocking Distributor Locator.'),
    brand_authorized: ['Viking'],
  })
  const s = scoreV(r)
  assert.ok(s.signals.some((x) => x.startsWith('M7')), 'the own brand has to register as evidence of manufacturing')
  assert.ok(!s.signals.some((x) => x.startsWith('D3')), 'and must never register as evidence of distribution')
  assert.equal(s.verdict, 'manufacturer')
})

// The counterweight. "Martin Supply" is Martin Sprocket's DEALER, and a loose
// name match makes it look like the brand owner.
test('a distributor that shares a name with a brand it carries is not the brand owner', () => {
  const r = row({
    domain: 'martinsupply.com',
    company_display: 'Martin Supply Inc',
    company: 'martin supply',
    homepage_text: pad('We are a stocking distributor of power transmission products.'),
    brand_authorized: ['Martin'],
  })
  assert.ok(!scoreV(r).signals.some((x) => x.startsWith('M7')))
})

test('a reseller word ANYWHERE in the tail disqualifies the own-brand read', () => {
  // All three fired when the tail was compared for equality instead of containment.
  for (const [domain, display, brand] of [
    ['millerpumpsupply.com', 'Miller Pump Supply, Inc.', 'Miller'],
    ['millerindustrial.com', 'Miller Industrial', 'Miller'],
    ['parkerstore-koblenz.com', 'ParkerStore Koblenz', 'Parker'],
  ]) {
    const v = buildVocab(['Miller', 'Parker'])
    const s = makeScorer(v)(
      row({ domain, company_display: display, company: display.toLowerCase(), homepage_text: pad('We stock and supply hydraulic components.'), brand_authorized: [brand] }),
    )
    assert.ok(!s.signals.some((x) => x.startsWith('M7')), `${domain} must not read as the brand owner`)
  }
})

test('the own-brand signal needs make evidence already on the page', () => {
  const r = row({
    domain: 'vikingpump.com',
    company_display: 'Viking Pump Inc',
    company: 'viking pump',
    homepage_text: pad('Contact us for pumps and service.'),
    brand_authorized: ['Viking'],
  })
  assert.ok(!scoreV(r).signals.some((x) => x.startsWith('M7')), 'it is a multiplier on evidence, not a claim of its own')
})

test('the own-brand signal is dropped when another party’s locator also named the company', () => {
  const r = row({
    domain: 'vikingpump.com',
    company_display: 'Viking Pump Inc',
    company: 'viking pump',
    homepage_text: pad('Viking Pump is the leading manufacturer of positive displacement pumps.'),
    brand_authorized: ['Viking', 'Timken'],
  })
  const s = scoreV(r)
  assert.ok(!s.signals.some((x) => x.startsWith('M7')))
  assert.ok(s.signals.some((x) => x.startsWith('D3')))
})

test('M7 cannot route a row on its own', () => {
  const r = row({
    domain: 'nucorwarehousesystems.com',
    company_display: 'Nucor Warehouse Systems',
    company: 'nucor warehouse systems',
    homepage_text: pad('Rack systems and decking.'),
    brand_authorized: ['Nucor'],
  })
  assert.ok(scoreV(r).score < 6)
})

// §5t corrected §5s's proposed pre-filter: two of the three manufacturers the
// first-send census found sat at `brand_count = 1`, and Viking's single brand
// was its own.
test('§5t: the reading surface is cut at brand_count ≤ 1, not = 0', () => {
  assert.equal(manufacturerPreFilter({ brand_count: 0 }), true)
  assert.equal(manufacturerPreFilter({ brand_count: 1 }), true)
  assert.equal(manufacturerPreFilter({ brand_count: '1' }), true)
  assert.equal(manufacturerPreFilter({ brand_count: 2 }), false)
  assert.equal(manufacturerPreFilter({ brand_count: null }), true, 'an unmeasured row has not been excluded, it has not been measured')
  assert.equal(manufacturerPreFilter({}), true)
})
