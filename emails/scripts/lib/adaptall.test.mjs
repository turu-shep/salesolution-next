import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  TITLE_RANK,
  titleClass,
  bestContact,
  distinctLocations,
  EXPORT_VERDICTS,
  SEAT,
  LOCATION_ALIASES,
} from './adaptall.mjs'
import { declarationIsNegated, emailVerdict } from './sendcheck.mjs'

// ─────────────────────────────────────────────────────────────────────────────
// titleClass
// ─────────────────────────────────────────────────────────────────────────────

test('titleClass: the buyer titles', () => {
  assert.equal(titleClass('Owner'), 'owner')
  assert.equal(titleClass('President'), 'owner')
  assert.equal(titleClass('President/CEO'), 'owner')
  assert.equal(titleClass('President / CEO'), 'owner')
  assert.equal(titleClass('Global President'), 'owner')
  assert.equal(titleClass('Co-Founder'), 'owner')
  assert.equal(titleClass('General Manager'), 'general-manager')
  assert.equal(titleClass('GM'), 'general-manager')
  assert.equal(titleClass('Automation General Manager'), 'general-manager')
})

test('titleClass: "Vice President" is never "President"', () => {
  // The single highest-consequence miss. `hosepower.com` publishes one
  // President among 63 contacts and four Vice Presidents; reading either as the
  // other picks the wrong human for a founder-manual send.
  assert.equal(titleClass('Vice President'), 'vp')
  assert.equal(titleClass('Executive Vice President'), 'vp')
  assert.equal(titleClass('Vice President of Sales'), 'vp')
  assert.equal(titleClass('Regional Vice President'), 'vp')
  assert.equal(titleClass('VP of Sales'), 'vp')
  assert.equal(titleClass('Vice President and General Counsel'), 'vp')
  assert.equal(titleClass('Vice President Operations'), 'vp')
})

test('titleClass: branch and sales sort last and cannot be promoted', () => {
  assert.equal(titleClass('Branch Manager'), 'branch')
  assert.equal(titleClass('Assistant Branch Manager'), 'branch')
  assert.equal(titleClass('Regional Branch Manager'), 'branch')
  assert.equal(titleClass('Chicago Branch Manager at Evolution'), 'branch')
  assert.equal(titleClass('Sales'), 'sales')
  assert.equal(titleClass('Territory Sales Manager'), 'sales')
  assert.equal(titleClass('Outside Sales Account Manager'), 'sales')
  assert.ok(TITLE_RANK.branch > TITLE_RANK.owner)
  assert.ok(TITLE_RANK.sales > TITLE_RANK.owner)
  assert.ok(TITLE_RANK.branch > TITLE_RANK.purchasing)
})

test('titleClass: classifies on the first segment, not the padding', () => {
  // Real rows from the export. Whole-string matching files the first under
  // Operations and promotes the second over Triad's actual General Manager.
  assert.equal(
    titleClass('General Manager | P&L Leadership | Scaling Operations, Sales, and Commercial Execution'),
    'general-manager',
  )
  assert.equal(
    titleClass('General Manager - Seal Group Triad Technologies; President Tech-Syn LLC / All Seals & Hose Inc.'),
    'general-manager',
  )
})

test('titleClass: operations, purchasing, other', () => {
  assert.equal(titleClass('Operations Manager'), 'operations')
  assert.equal(titleClass('Warehouse Operations Manager'), 'operations')
  assert.equal(titleClass('Purchasing Manager'), 'purchasing')
  assert.equal(titleClass('Procurement Lead'), 'purchasing')
  assert.equal(titleClass('Corporate Purchasing'), 'purchasing')
  assert.equal(titleClass(''), 'other')
  assert.equal(titleClass(null), 'other')
  assert.equal(titleClass('Marketing Specialist'), 'other')
})

test('titleClass: purchasing beats sales on a hybrid title', () => {
  assert.equal(titleClass('Sales and Purchasing Manager'), 'purchasing')
})

// ─────────────────────────────────────────────────────────────────────────────
// bestContact
// ─────────────────────────────────────────────────────────────────────────────

const c = (title, email, status, last = 'X') => ({
  contact: { title, email, email_status: status, last_name: last },
  email: email
    ? emailVerdict({ email, domain: 'acme.com' })
    : { verdict: 'none' },
})

test('bestContact: a President with no address still beats a Branch Manager with one', () => {
  const pick = bestContact([
    c('Branch Manager', 'bm@acme.com', 'verified'),
    c('President', null, 'unavailable'),
  ])
  assert.equal(pick.contact.title, 'President')
})

test('bestContact: title class is absolute, email quality only breaks ties inside it', () => {
  const pick = bestContact([
    c('General Manager', 'gm@acme.com', 'verified'),
    c('President', null, 'unavailable'),
  ])
  assert.equal(pick.contact.title, 'President')

  const tie = bestContact([
    c('President', null, 'unavailable', 'NoMail'),
    c('President', 'p@acme.com', 'verified', 'HasMail'),
  ])
  assert.equal(tie.contact.last_name, 'HasMail')
})

test('bestContact: own-domain beats an off-domain address inside a class', () => {
  const pick = bestContact([
    c('President', 'boss@someothercorp.com', 'verified', 'Off'),
    c('President', 'boss@acme.com', 'verified', 'Own'),
  ])
  assert.equal(pick.contact.last_name, 'Own')
})

test('bestContact: verified beats extrapolated inside a class', () => {
  const pick = bestContact([
    c('General Manager', 'a@acme.com', 'extrapolated', 'Extrap'),
    c('General Manager', 'b@acme.com', 'verified', 'Verif'),
  ])
  assert.equal(pick.contact.last_name, 'Verif')
})

test('bestContact: a manufacturer inbox is the worst address, never the best', () => {
  const judged = [
    { contact: { title: 'President', email: 'x@nord.com', email_status: 'verified', last_name: 'Mfg' }, email: emailVerdict({ email: 'x@nord.com', domain: 'acme.com' }) },
    { contact: { title: 'President', email: 'y@acme.com', email_status: 'verified', last_name: 'Own' }, email: emailVerdict({ email: 'y@acme.com', domain: 'acme.com' }) },
  ]
  assert.equal(judged[0].email.verdict, 'manufacturer-inbox')
  assert.equal(bestContact(judged).contact.last_name, 'Own')
})

test('bestContact: empty in, null out', () => {
  assert.equal(bestContact([]), null)
})

// ─────────────────────────────────────────────────────────────────────────────
// distinctLocations — §5m
// ─────────────────────────────────────────────────────────────────────────────

test('distinctLocations: counts distinct (company, address), never raw rows', () => {
  const m = distinctLocations([
    { company: 'MFCP', address: '1716 N Post Rd', city: 'Anchorage', state: 'AK' },
    { company: 'MFCP', address: '1716 N. Post Road', city: 'Anchorage', state: 'AK' },
    { company: 'MFCP', address: '330 E. International Airport Rd', city: 'Anchorage', state: 'AK' },
  ])
  assert.equal(m.get('MFCP').size, 2, 'the two spellings of one address are one branch')
})

test('distinctLocations: the same street in two cities is two branches', () => {
  const m = distinctLocations([
    { company: 'ACME', address: '1 Main St', city: 'Akron', state: 'OH' },
    { company: 'ACME', address: '1 Main St', city: 'Toledo', state: 'OH' },
  ])
  assert.equal(m.get('ACME').size, 2)
})

test('distinctLocations: skips rows with neither company nor address', () => {
  const m = distinctLocations([
    { company: '', address: '1 Main St', city: 'Akron', state: 'OH' },
    { company: 'ACME', address: '', city: '', state: '' },
  ])
  assert.equal(m.has(''), false)
  assert.equal(m.has('ACME'), false)
})

// ─────────────────────────────────────────────────────────────────────────────
// The adjudicated verdicts
// ─────────────────────────────────────────────────────────────────────────────

test('SEAT: every seated record carries provenance and a byte-exact declaration', () => {
  for (const s of SEAT) {
    assert.ok(s.domain && s.source_url && s.self_declaration_url, `${s.domain} provenance`)
    assert.ok(s.self_declaration && s.self_declaration.trim() === s.self_declaration, 'declaration is not padded')
    assert.equal(declarationIsNegated(s.self_declaration), false, `${s.domain} declaration is not a negation`)
    assert.ok(/^[A-Z]{2}$/.test(s.state) && /^\d{5}$/.test(s.zip5), `${s.domain} has a complete US state + ZIP`)
  }
})

test('EXPORT_VERDICTS: every verdict names a disposition, a reason and evidence', () => {
  for (const [domain, v] of Object.entries(EXPORT_VERDICTS)) {
    assert.ok(v.disposition, `${domain} disposition`)
    assert.ok(v.reason && v.reason.length > 10, `${domain} reason`)
    assert.ok(v.evidence && v.evidence.length > 10, `${domain} evidence`)
    assert.ok(v.source_url, `${domain} source_url`)
  }
})

test('EXPORT_VERDICTS: the seat verdicts and SEAT agree', () => {
  const seats = Object.entries(EXPORT_VERDICTS)
    .filter(([, v]) => v.disposition === 'seat')
    .map(([d]) => d)
    .sort()
  assert.deepEqual(seats, SEAT.map((s) => s.domain).sort())
})

test('EXPORT_VERDICTS: no US-addressed company was routed non-us (§5t)', () => {
  // The naive foreign filter cost 11 genuine US distributors — "Ontario,
  // California"; a New Brunswick Ave in New Jersey; "BC Fluid Power" in
  // Kentucky. A complete US state + ZIP settles geography first, so no `non-us`
  // verdict here may cite one.
  const US_STATE_ZIP = /\b(?:A[KLRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|PA|RI|S[CD]|T[NX]|UT|V[AT]|W[AIVY])\s+\d{5}\b/
  for (const [domain, v] of Object.entries(EXPORT_VERDICTS)) {
    if (v.disposition !== 'non-us') continue
    assert.equal(US_STATE_ZIP.test(v.evidence), false, `${domain} cites a US state+ZIP yet was routed non-us`)
  }
})

test('LOCATION_ALIASES: every alias resolves to an apex, not a slug', () => {
  for (const [name, domain] of Object.entries(LOCATION_ALIASES)) {
    assert.ok(domain.includes('.'), `${name} → ${domain} is not a domain`)
    assert.equal(domain, domain.toLowerCase(), `${name} → ${domain} is not normalized`)
  }
})
