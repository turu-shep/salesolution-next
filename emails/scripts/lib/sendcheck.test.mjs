import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  MANUFACTURER_EMAIL_DOMAINS,
  apexDomain,
  apexLabel,
  declarationIsNegated,
  declarationNegationSuspect,
  emailVerdict,
  manufacturerHost,
  usGeoVerdict,
} from './sendcheck.mjs'

const vocab = new Set(['nord', 'atlascopco', 'nucor', 'timken', 'parker', 'viking'])

// ─────────────────────────────────────────────────────────────────────────────
// apex
// ─────────────────────────────────────────────────────────────────────────────

test('apexDomain reduces a host to its registrable domain', () => {
  assert.equal(apexDomain('ra.rockwell.com'), 'rockwell.com')
  assert.equal(apexDomain('us.pepperl-fuchs.com'), 'pepperl-fuchs.com')
  assert.equal(apexDomain('WWW.Nord.Com'), 'nord.com')
  assert.equal(apexDomain('https://example.com/path?q=1'), 'example.com')
  assert.equal(apexDomain(null), '')
})

// A naive last-two-labels apex turns every `.co.uk` host into `co.uk`, which
// then matches every other `.co.uk` host — including `parker.co.uk`, which is in
// the brand-owner registry.
test('apexDomain keeps multi-label public suffixes whole', () => {
  assert.equal(apexDomain('radwell.co.uk'), 'radwell.co.uk')
  assert.equal(apexDomain('shop.parker.co.uk'), 'parker.co.uk')
  assert.notEqual(apexDomain('radwell.co.uk'), apexDomain('parker.co.uk'))
})

test('apexLabel squashes punctuation', () => {
  assert.equal(apexLabel('pepperl-fuchs.com'), 'pepperlfuchs')
})

// ─────────────────────────────────────────────────────────────────────────────
// D1 — a manufacturer's inbox as the prospect's contact
// ─────────────────────────────────────────────────────────────────────────────

test('the registry, the research inventory and the swept additions are all loaded', () => {
  for (const d of ['nord.com', 'atlascopco.com', 'pepperl-fuchs.com', 'kaeser.com', 'xylem.com', 'rockwell.com', 'idexcorp.com'])
    assert.ok(MANUFACTURER_EMAIL_DOMAINS.has(d), `${d} missing from the manufacturer set`)
})

test('§5t: info.us@nord.com on a dealer’s record is invalid', () => {
  const v = emailVerdict({ email: 'info.us@nord.com', domain: 'goldenindustrial.com' }, { brandVocab: vocab })
  assert.equal(v.verdict, 'manufacturer-inbox')
  assert.equal(v.rule, 'registry')
  assert.match(v.why, /nord\.com/)
})

test('a subdomain of a manufacturer host resolves against the registry', () => {
  assert.equal(
    emailVerdict({ email: 'productsafety@ra.rockwell.com', domain: 'cbtcompany.com' }, { brandVocab: vocab }).verdict,
    'manufacturer-inbox',
  )
  assert.equal(
    emailVerdict({ email: 'fa-info@us.pepperl-fuchs.com', domain: 'stevenengineering.com' }, { brandVocab: vocab }).verdict,
    'manufacturer-inbox',
  )
})

// The list-free half of the rule: every brand in `brand_authorized` is by
// definition a manufacturer, so its apex label is that manufacturer's host and
// nobody has to maintain a list.
test('the brand vocabulary catches manufacturer hosts that are on no list', () => {
  const a = emailVerdict({ email: 'info@atlascopcousa.com', domain: 'edwardsvacuum.com' }, { brandVocab: vocab })
  assert.equal(a.verdict, 'manufacturer-inbox')
  assert.equal(a.rule, 'brand-owner')
  assert.equal(a.matched, 'atlascopco')
  const n = emailVerdict({ email: 'ashley.gilbert@nucor.com', domain: 'nucorwarehousesystems.com' }, { brandVocab: vocab })
  assert.equal(n.verdict, 'manufacturer-inbox')
  assert.equal(n.matched, 'nucor')
})

test('a manufacturer’s address on its OWN domain is not the defect', () => {
  assert.equal(emailVerdict({ email: 'info@nord.com', domain: 'nord.com' }, { brandVocab: vocab }).verdict, 'own-domain')
})

test('a consumer mailbox is normal, not a mismatch finding', () => {
  assert.equal(emailVerdict({ email: 'bob@gmail.com', domain: 'bobsbearings.com' }, { brandVocab: vocab }).verdict, 'free-provider')
})

// The lower-confidence bucket. Reported, never nulled: a different domain is
// usually a parent company, a sister brand or the owner's own address.
test('a merely different domain is a mismatch, not a manufacturer inbox', () => {
  const v = emailVerdict({ email: 'orders@vonrohr.com', domain: 'vonrohrequipment.com' }, { brandVocab: vocab })
  assert.equal(v.verdict, 'domain-mismatch')
})

test('placeholder and marketplace hosts get their own buckets', () => {
  assert.equal(emailVerdict({ email: 'a@example.com', domain: 'x.com' }, { brandVocab: vocab }).verdict, 'placeholder')
  assert.equal(emailVerdict({ email: 'a@grainger.com', domain: 'x.com' }, { brandVocab: vocab }).verdict, 'marketplace-inbox')
})

test('no email is not a verdict about the email', () => {
  assert.equal(emailVerdict({ email: null, domain: 'x.com' }).verdict, 'none')
})

test('manufacturerHost needs no vocabulary to use the registry', () => {
  assert.equal(manufacturerHost('timken.com')?.rule, 'registry')
  assert.equal(manufacturerHost('somedistributor.com', vocab), null)
})

// ─────────────────────────────────────────────────────────────────────────────
// D2 — the negated declaration
// ─────────────────────────────────────────────────────────────────────────────

test('§5t: santaclarasystems.com’s declaration is negated', () => {
  assert.equal(declarationIsNegated('purchases legacy material and is not an authorized distributor'), true)
})

test('the inverse sentence is caught in its published forms', () => {
  for (const s of [
    'Universal Servo Group, LLC is not an authorized distributor or representative for all of the listed manufacturers',
    'We are a Non-Authorized Stocking Distributor for the following brands',
    'SB Industrial Supply is not an authorized distributor, affiliate, or agent',
    'PLC Direct, LLC is not an authorized distributor for, or representative of, the manufacturers listed on this website',
    'We are no longer an authorized dealer for this line',
    'Acme has never been an authorized distributor of these products',
  ])
    assert.equal(declarationIsNegated(s), true, s)
})

test('a genuine claim is not flipped by an unrelated negation word', () => {
  // Both of these fired on the loose port and both are real declarations.
  const berrington =
    'Stock SERFILCO Non-Metallic Pumps, Filters, & Accessories SETHCO Fiberglass Horizontal ANSI Pumps * Vertical T & T PUMP Multi-Stage Centrif, Tonkaflo Drop In Pump VANTON MASTER DISTRIBUTOR'
  const crimper = 'Price is not the only criterion for measuring suppliers'
  assert.equal(declarationIsNegated(berrington), false)
  assert.equal(declarationIsNegated(crimper), false)
  assert.equal(declarationIsNegated('We are an authorized distributor with no minimum order'), false)
  assert.equal(declarationIsNegated('Seal Company is an authorized distributor of o-rings'), false)
})

test('the loose test is kept as a review net, not as the verdict', () => {
  assert.equal(declarationNegationSuspect('Stock SERFILCO Non-Metallic Pumps VANTON MASTER DISTRIBUTOR'), true)
  assert.equal(declarationIsNegated('Stock SERFILCO Non-Metallic Pumps VANTON MASTER DISTRIBUTOR'), false)
})

test('an empty declaration is not negated', () => {
  assert.equal(declarationIsNegated(null), false)
  assert.equal(declarationIsNegated('   '), false)
})

// ─────────────────────────────────────────────────────────────────────────────
// D3 — the null state that passed the US filter
// ─────────────────────────────────────────────────────────────────────────────

// The defect itself: `checkerindustrial.com` reached rank 200 of a US-only list.
test('§5t: a null state cannot satisfy the US check', () => {
  const v = usGeoVerdict({ domain: 'checkerindustrial.com', city: 'Windsor, ON N8Y 1E9', address_1: '3345 wyandotte st e', state: null, zip5: null, phone_e164: '5197372644' })
  assert.equal(v.verdict, 'non-US')
})

test('a missing state with no other evidence is `unverified`, never `US`', () => {
  const v = usGeoVerdict({ domain: 'toolkrib.com', city: null, state: null, zip5: null, phone_e164: null })
  assert.equal(v.verdict, 'unverified')
  assert.notEqual(v.verdict, 'US')
})

test('a Canadian province in the state field routes non-US', () => {
  assert.equal(usGeoVerdict({ domain: 'x.com', state: 'ON', zip5: null }).verdict, 'non-US')
})

test('a Canadian area code is a non-US signal on a record with no address', () => {
  assert.equal(usGeoVerdict({ domain: 'electrotechdistributors.com', phone_e164: '5145008756' }).verdict, 'non-US')
  assert.equal(usGeoVerdict({ domain: 'lakeportpower.com', city: 'Cramahe', phone_e164: '9053553281' }).verdict, 'non-US')
})

test('a foreign ccTLD with no US postal identity routes non-US', () => {
  assert.equal(usGeoVerdict({ domain: 'greatlakessupply.ca', city: 'Windsor, ON N8W 3S5' }).verdict, 'non-US')
})

// The false positives the first cut produced, all eleven of the same shape: a
// complete US postal identity beaten by a word that is also a US place name.
test('a complete US postal identity beats every foreign-looking signal', () => {
  const cases = [
    { why: 'Ontario, California', r: { domain: 'apumpstore.com', city: 'Ontario', state: 'CA', zip5: '91761' } },
    { why: 'New Brunswick Ave, Fords NJ', r: { domain: 'middlesexindustrial.com', city: 'Fords', address_1: '522 new brunswick ave', state: 'NJ', zip5: '08863' } },
    { why: 'Quebec Ave N, New Hope MN', r: { domain: 'sheridansheetmetal.com', city: 'New Hope', address_1: '4108 quebec ave n', state: 'MN', zip5: '55427' } },
    { why: 'a company called "BC Fluid Power"', r: { domain: 'bcfluidpower.com', company_display: 'BC Fluid Power Of Florence', city: 'Walton', state: 'KY', zip5: '41094' } },
    { why: 'a .co.uk host on a Hollywood FL address', r: { domain: 'saywell.co.uk', city: 'HOLLYWOOD', state: 'FL', zip5: '33020' } },
    { why: '.co is a vanity TLD, not Colombia', r: { domain: 'dynamicsupply.co', city: 'Adrian', state: 'MI', zip5: '49221' } },
  ]
  for (const c of cases) assert.equal(usGeoVerdict(c.r).verdict, 'US', c.why)
})

test('a foreign signal alongside a US postal identity is reported as a conflict', () => {
  const v = usGeoVerdict({ domain: 'saywell.co.uk', city: 'HOLLYWOOD', state: 'FL', zip5: '33020' })
  assert.equal(v.verdict, 'US')
  assert.ok(v.conflicts.length, 'the ccTLD still has to be named')
})

test('an area code plus a US-boxed lat/lng places a record with no postal address', () => {
  const v = usGeoVerdict({ domain: 'toolkrib.com', state: null, zip5: null, phone_e164: '9738084550', lat: 40.8632802, lng: -74.2848011 })
  assert.equal(v.verdict, 'US')
  assert.match(v.why, /no postal address/)
})

test('the verdict is a pure function of the record', () => {
  const r = { domain: 'x.com', city: 'Windsor, ON N8Y 1E9' }
  assert.deepEqual(usGeoVerdict(r), usGeoVerdict({ ...r }))
})
