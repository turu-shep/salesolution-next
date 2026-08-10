import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  ICP_NON_COMPANY,
  classifyRow,
  foreignDomainMentions,
  isHollow,
  isSerpSourced,
  nonCompanyDomain,
} from './census.mjs'

// ── serp membership: source is a pipe chain, not a scalar ────────────────────

test('isSerpSourced reads the pipe chain, not the string', () => {
  assert.equal(isSerpSourced({ source: 'serp' }), true)
  assert.equal(isSerpSourced({ source: 'serp|dfs' }), true)
  assert.equal(isSerpSourced({ source: 'dfs|serp|ad' }), true)
  assert.equal(isSerpSourced({ source: 'dfs' }), false)
  // "serp" as a substring of another token must not count
  assert.equal(isSerpSourced({ source: 'serpentine' }), false)
  assert.equal(isSerpSourced({ source: null }), false)
})

// ── non-company domains: seeded from the 2026-08-10 inspection, not invented ─

test('directory domains hit', () => {
  assert.equal(nonCompanyDomain('01webdirectory.com')?.label, 'directory')
  assert.equal(nonCompanyDomain('yellowpages.om')?.label, 'directory')
  assert.equal(nonCompanyDomain('yellowpages.ca')?.label, 'directory')
  assert.equal(nonCompanyDomain('411s.ca')?.label, 'directory')
})

test('publication domains hit on the ENDING of the second-level label', () => {
  assert.equal(nonCompanyDomain('ffjournal.net')?.label, 'publication')
  assert.equal(nonCompanyDomain('canadianminingjournal.com')?.label, 'publication')
  assert.equal(nonCompanyDomain('knoxnews.com')?.label, 'publication')
  assert.equal(nonCompanyDomain('wiringharnessnews.com')?.label, 'publication')
  assert.equal(nonCompanyDomain('fastenerblog.net')?.label, 'publication')
  assert.equal(nonCompanyDomain('thetimesherald.com')?.label, 'publication')
  assert.equal(nonCompanyDomain('spiuserforum.com')?.label, 'publication')
})

test('real companies that merely CONTAIN a publication word do not hit', () => {
  // "news" inside "newsouth", "press" at the end of Hose Express — both are
  // live rows in the current generation, both are real businesses.
  assert.equal(nonCompanyDomain('newsouthsupply.com'), null)
  assert.equal(nonCompanyDomain('hosexpress.com'), null)
  assert.equal(nonCompanyDomain('hipress.com.br'), null)
  assert.equal(nonCompanyDomain('yespress.io'), null)
})

test('government / institution patterns hit without eating hospitality', () => {
  assert.equal(nonCompanyDomain('cityofevanston.org')?.label, 'government')
  assert.equal(nonCompanyDomain('dekalbsheriff.org')?.label, 'government')
  assert.equal(nonCompanyDomain('dbhospital.org')?.label, 'institution')
  // the guard: "hospitality" must not match "hospital"
  assert.equal(nonCompanyDomain('hospitalitysupply.com'), null)
})

test('inspected exact domains hit; look-alike .org companies do not', () => {
  assert.equal(nonCompanyDomain('sema.org')?.label, 'association')
  assert.equal(nonCompanyDomain('aopa.org')?.label, 'association')
  assert.equal(nonCompanyDomain('copper.org')?.label, 'association')
  assert.equal(nonCompanyDomain('rocketreach.co')?.label, 'marketplace')
  // .org alone is NOT evidence — these are (or may be) operating businesses.
  assert.equal(nonCompanyDomain('hosesolutions.org'), null)
  assert.equal(nonCompanyDomain('air-filters.org'), null)
  assert.equal(nonCompanyDomain(null), null)
})

// ── the 01webdirectory tell: snippet describes a DIFFERENT company ───────────

test('foreignDomainMentions finds a domain that is not the row domain', () => {
  const text =
    'UsedRack.com : Minnesota stocking distributor specializing in new and used warehouse storage racks'
  assert.deepEqual(foreignDomainMentions(text, '01webdirectory.com'), ['usedrack.com'])
})

test('a mention of the row own domain is not foreign', () => {
  assert.deepEqual(
    foreignDomainMentions('Visit Acme.com for our full catalog', 'acme.com'),
    [],
  )
  // www + casing normalize away
  assert.deepEqual(foreignDomainMentions('See WWW.Acme.COM today', 'acme.com'), [])
})

test('foreignDomainMentions dedupes and survives empty input', () => {
  const text = 'listed on Example.com and example.com and also otherco.net'
  assert.deepEqual(foreignDomainMentions(text, 'mysite.com'), ['example.com', 'otherco.net'])
  assert.deepEqual(foreignDomainMentions(null, 'mysite.com'), [])
  assert.deepEqual(foreignDomainMentions('no domains here', 'mysite.com'), [])
})

// ── hollow: all four contact/identity fields empty — candidate only ──────────

test('isHollow is true only when address, phone, brands AND line card are all empty', () => {
  assert.equal(isHollow({ address_1: null, phone_e164: null, brand_authorized: null, line_card: null }), true)
  assert.equal(isHollow({ address_1: '12 Main St', phone_e164: null, brand_authorized: null, line_card: null }), false)
  assert.equal(isHollow({ address_1: null, phone_e164: '5551234567', brand_authorized: null, line_card: null }), false)
  assert.equal(isHollow({ address_1: null, phone_e164: null, brand_authorized: 'Timken', line_card: null }), false)
  // pipe-joined CSV form counts as populated
  assert.equal(isHollow({ address_1: null, phone_e164: null, brand_authorized: null, line_card: 'DFS:hose_supplier|DFS:pump_supplier' }), false)
})

// ── classifyRow: the integration the census script drives ────────────────────

const serpRow = (extra = {}) => ({
  domain: 'acmesupply.com',
  source: 'serp',
  self_declaration: null,
  address_1: null,
  phone_e164: null,
  brand_authorized: null,
  line_card: null,
  icp_class: 'industrial-distributor',
  ...extra,
})

test('the specimen shape earns all three classes, high confidence, auto-approve', () => {
  const verdict = classifyRow(
    serpRow({
      domain: '01webdirectory.com',
      self_declaration: 'UsedRack.com : Minnesota stocking distributor specializing in racks',
    }),
  )
  assert.deepEqual(verdict.classes, ['non-company-domain', 'misattributed-snippet', 'hollow'])
  assert.equal(verdict.confidence, 'high')
  assert.equal(verdict.autoApprove, true)
  assert.equal(verdict.evidence.domainLabel, 'directory')
  assert.equal(verdict.evidence.domainRule, 'sld-contains:directory')
  assert.deepEqual(verdict.evidence.foreignDomains, ['usedrack.com'])
})

test('a sparse-but-real small shop is hollow-only: low confidence, never auto-approved', () => {
  const verdict = classifyRow(serpRow())
  assert.deepEqual(verdict.classes, ['hollow'])
  assert.equal(verdict.confidence, 'low')
  assert.equal(verdict.autoApprove, false)
})

test('a populated row with a clean domain earns nothing', () => {
  const verdict = classifyRow(serpRow({ phone_e164: '5551234567', address_1: '1 Elm St' }))
  assert.deepEqual(verdict.classes, [])
  assert.equal(verdict.confidence, null)
  assert.equal(verdict.autoApprove, false)
})

test('an icp_class the pipeline itself calls non-company raises confidence, not auto-approve', () => {
  const verdict = classifyRow(serpRow({ icp_class: 'directory', phone_e164: '5551234567', address_1: '1 Elm St' }))
  assert.deepEqual(verdict.classes, [])
  assert.equal(verdict.evidence.icpNonCompany, true)
  assert.equal(verdict.confidence, 'high')
  assert.equal(verdict.autoApprove, false)
})

test('ICP_NON_COMPANY is exactly the contract four non-company classes', () => {
  assert.deepEqual([...ICP_NON_COMPANY].sort(), ['directory', 'job-board', 'marketplace', 'trade-press'])
})
