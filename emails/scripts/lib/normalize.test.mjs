/**
 * Unit tests for the §3.1 normalizers.
 *   node --test emails/scripts/lib/
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizePhone,
  normalizeCompany,
  normalizeAddress,
  streetNumber,
  cleanWebsite,
  apexDomain,
  normalizeState,
  normalizeZip5,
} from './normalize.mjs'
import { makeRecord, validateRecord, validateAll, assertRecord } from './contract.mjs'

// ── phone (PRIMARY JOIN KEY) ─────────────────────────────────────────────────

test('phone: every US format collapses to the same 10 digits', () => {
  for (const raw of [
    '(330) 438-3000',
    '330-438-3000',
    '330.438.3000',
    '+1 330 438 3000',
    '1-330-438-3000',
    ' 3304383000 ',
    'Tel: (330) 438-3000',
  ]) {
    assert.equal(normalizePhone(raw), '3304383000', `failed on ${raw}`)
  }
})

test('phone: an extension is cut, never absorbed into the number', () => {
  assert.equal(normalizePhone('(330) 438-3000 ext. 214'), '3304383000')
  assert.equal(normalizePhone('330-438-3000 x214'), '3304383000')
  assert.equal(normalizePhone('330-438-3000 EXT 214'), '3304383000')
})

test('phone: a second number after a separator takes the first', () => {
  assert.equal(normalizePhone('330-438-3000 / 800-555-1212'), '3304383000')
})

test('phone: an unlabelled 4th group is an extension, but 1-800 is not', () => {
  assert.equal(normalizePhone('516-678-3900-413'), '5166783900') // Timken's form
  assert.equal(normalizePhone('1-800-555-1212'), '8005551212') // must NOT be cut
  assert.equal(normalizePhone('330.438.3000.12'), '3304383000')
})

test('phone: anything not confidently a US line is null, never a guess', () => {
  assert.equal(normalizePhone(''), null)
  assert.equal(normalizePhone(null), null)
  assert.equal(normalizePhone('n/a'), null)
  assert.equal(normalizePhone('123'), null)
  assert.equal(normalizePhone('+44 20 7946 0958'), null) // UK
  assert.equal(normalizePhone('000-000-0000'), null) // placeholder
  assert.equal(normalizePhone('111-111-1111'), null)
})

// ── company name (SECONDARY JOIN KEY) ────────────────────────────────────────

test('company: the seven §3.1 tokens are stripped', () => {
  assert.equal(normalizeCompany('The Timken Company'), 'timken')
  assert.equal(normalizeCompany('Motion Industries, Inc.'), 'motion industries')
  assert.equal(normalizeCompany('Hydradyne, LLC'), 'hydradyne')
  assert.equal(normalizeCompany('Applied Industrial Technologies Corp'), 'applied industrial technologies')
  assert.equal(normalizeCompany('Kaman Industrial Ltd'), 'kaman industrial')
  assert.equal(normalizeCompany('Bearing Service Co'), 'bearing service')
})

test('company: spelling variants of the same firm converge', () => {
  const a = normalizeCompany('Smith, Jones & Co.')
  const b = normalizeCompany('SMITH JONES  CO')
  assert.equal(a, b)
  assert.equal(a, 'smith jones')
})

test('company: periods die before punctuation becomes whitespace', () => {
  assert.equal(normalizeCompany('Acme L.L.C.'), 'acme')
  assert.equal(normalizeCompany('U.S. Bearings'), 'us bearings')
})

test('company: stripping never yields an empty join key', () => {
  // "The Company" is entirely suffix tokens — falls back rather than returning ''.
  assert.equal(normalizeCompany('The Company'), 'the company')
  assert.equal(normalizeCompany('   '), null)
  assert.equal(normalizeCompany(null), null)
})

test('company: a suffix token inside a word is left alone', () => {
  assert.equal(normalizeCompany('Cotter & Sons'), 'cotter sons')
  assert.equal(normalizeCompany('Incom Bearing'), 'incom bearing')
})

// ── address ──────────────────────────────────────────────────────────────────

test('address: USPS-ish abbreviations make the tiebreak key stable', () => {
  const a = normalizeAddress('1835 Dueber Avenue S.W.')
  const b = normalizeAddress('1835 Dueber Ave SW')
  assert.equal(a, b)
  assert.equal(a, '1835 dueber ave sw')
})

test('address: suite / directional / highway forms normalize', () => {
  assert.equal(normalizeAddress('100 North Main Street, Suite 200'), '100 n main st ste 200')
  assert.equal(normalizeAddress('4321 West Highway 62'), '4321 w hwy 62')
  assert.equal(normalizeAddress(null), null)
})

test('streetNumber pulls the leading house number only', () => {
  assert.equal(streetNumber('1835 Dueber Ave SW'), '1835')
  assert.equal(streetNumber('PO Box 42'), null)
})

// ── website field → apex domain ──────────────────────────────────────────────

test('website: Google-Maps URLs are stripped, not turned into google.com', () => {
  for (const raw of [
    'https://www.google.com/maps/place/Acme+Bearing/@41.08,-81.5,17z',
    'https://maps.google.com/?cid=12345',
    'https://goo.gl/maps/abc123',
    'https://maps.app.goo.gl/abc123',
    'https://g.page/acme-bearing',
  ]) {
    assert.equal(cleanWebsite(raw), null, `not stripped: ${raw}`)
    assert.equal(apexDomain(raw), null, `leaked a domain: ${raw}`)
  }
})

test('website: placeholders and non-http schemes are null', () => {
  for (const raw of ['', '  ', 'N/A', 'none', '-', 'http://', 'mailto:sales@acme.com', 'tel:3304383000']) {
    assert.equal(cleanWebsite(raw), null, `not rejected: ${JSON.stringify(raw)}`)
  }
})

test('website: a bare host gets a scheme', () => {
  assert.equal(cleanWebsite('acmebearing.com'), 'https://acmebearing.com/')
  assert.equal(cleanWebsite('www.acmebearing.com/locations'), 'https://www.acmebearing.com/locations')
})

test('apexDomain: lowercase, no www, no port, no path', () => {
  assert.equal(apexDomain('HTTP://WWW.AcmeBearing.COM/contact?x=1'), 'acmebearing.com')
  assert.equal(apexDomain('https://shop.acmebearing.com:8443/catalog'), 'acmebearing.com')
  assert.equal(apexDomain('www2.acmebearing.com'), 'acmebearing.com')
  assert.equal(apexDomain('https://acme.co.uk/parts'), 'acme.co.uk')
  assert.equal(apexDomain('https://192.168.0.1/'), null)
  assert.equal(apexDomain('localhost'), null)
})

// ── postal ───────────────────────────────────────────────────────────────────

test('state: codes and full names normalize; non-US is null', () => {
  assert.equal(normalizeState('oh'), 'OH')
  assert.equal(normalizeState('Ohio'), 'OH')
  assert.equal(normalizeState('N.C.'), 'NC')
  assert.equal(normalizeState('Ontario'), null)
  assert.equal(normalizeState(''), null)
})

test('zip5: ZIP+4 truncates, non-US postal codes are null', () => {
  assert.equal(normalizeZip5('44706'), '44706')
  assert.equal(normalizeZip5('44706-0001'), '44706')
  assert.equal(normalizeZip5('  44706  '), '44706')
  assert.equal(normalizeZip5('M5V 3A8'), null)
  assert.equal(normalizeZip5(null), null)
})

// ── contract ─────────────────────────────────────────────────────────────────

const GOOD = {
  company: 'Acme Bearing',
  source: 'timken',
  source_url: 'https://locations.timken.com/wp-json/wpgmza/v1/markers',
  captured: '2026-08-01',
}

test('contract: makeRecord fills every field so nothing downstream sees undefined', () => {
  const r = makeRecord(GOOD)
  assert.equal(r.domain, null)
  assert.deepEqual(r.brand_authorized, [])
  assert.equal(r.disposition, null)
  assert.equal(r.evidence_depth, 1)
  assert.equal(validateRecord(r).ok, true)
})

test('contract: a record without source_url or captured is REJECTED', () => {
  const noUrl = makeRecord({ ...GOOD, source_url: undefined })
  assert.equal(validateRecord(noUrl).ok, false)
  assert.match(validateRecord(noUrl).errors.join(' '), /source_url/)

  const noCaptured = makeRecord({ ...GOOD, captured: undefined })
  assert.equal(validateRecord(noCaptured).ok, false)
  assert.match(validateRecord(noCaptured).errors.join(' '), /captured/)

  assert.throws(() => assertRecord(noUrl), /contract violation/)
})

test('contract: captured must be an ISO date', () => {
  assert.equal(validateRecord(makeRecord({ ...GOOD, captured: '08/01/2026' })).ok, false)
  assert.equal(validateRecord(makeRecord({ ...GOOD, captured: '2026-08-01T12:00:00Z' })).ok, true)
})

test('contract: join keys are shape-checked', () => {
  assert.equal(validateRecord(makeRecord({ ...GOOD, phone_e164: '330-438-3000' })).ok, false)
  assert.equal(validateRecord(makeRecord({ ...GOOD, zip5: '44706-0001' })).ok, false)
  assert.equal(validateRecord(makeRecord({ ...GOOD, state: 'Ohio' })).ok, false)
  assert.equal(validateRecord(makeRecord({ ...GOOD, domain: 'https://acme.com' })).ok, false)
  assert.equal(validateRecord(makeRecord({ ...GOOD, disposition: 'maybe' })).ok, false)
})

test('contract: brand_authorized is always a deduped array', () => {
  assert.deepEqual(makeRecord({ ...GOOD, brand_authorized: 'Timken' }).brand_authorized, ['Timken'])
  assert.deepEqual(
    makeRecord({ ...GOOD, brand_authorized: ['Timken', 'Timken', ' Enerpac '] }).brand_authorized,
    ['Timken', 'Enerpac'],
  )
})

test('contract: validateAll partitions instead of discarding', () => {
  const { valid, invalid } = validateAll([makeRecord(GOOD), makeRecord({ company: 'No provenance' })])
  assert.equal(valid.length, 1)
  assert.equal(invalid.length, 1)
  assert.equal(valid.length + invalid.length, 2) // nothing is ever deleted
})
