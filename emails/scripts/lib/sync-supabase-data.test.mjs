import assert from 'node:assert/strict'
import test from 'node:test'

import { fromCsv } from './contract.mjs'
import {
  PAUSED_MESSAGE,
  SOURCE_DIR_RE,
  brandTokens,
  conservationLines,
  deriveBusinessType,
  firstDate,
  isPausedError,
  normDomain,
  parseRegistryTable,
  parseSourceDirs,
  parseStatusBanner,
  toContactRow,
  toVerifyRow,
} from './sync-supabase-data.mjs'

/** Three synthetic rows. No real company, no real contact, no real domain. */
const FIXTURE_CSV = [
  'company,company_display,domain,email,address_1,city,state,zip5,phone_e164,source,source_url,captured,brand_authorized,line_card,location_count,disposition,segment,icp_class,category_core,size_band,rank_score,tier,cohort,contact_first_name,contact_last_name,contact_email_status',
  'acme-fixture,"Acme Fixture, Inc.",WWW.Acme-Fixture.example,SALES@acme-fixture.example,1 Test Way,Springfield,IL,62701,+15555550100,timken|dfs,https://a.example/x|https://b.example/y,2026-08-01|2026-08-03,Timken,Bearings,3,seated,A,ICP-1,4.5,5-10M,71.5,T1,C,Dale,Fixture,verified',
  'beta-fixture,Beta Fixture Co,,,"2 Test Rd",Peoria,IL,61601,,serp,https://c.example/z,2026-08-01,,,1,seated,B,ICP-2,1.5,2-5M,40,T2,,,,',
  'gamma-fixture,Gamma Fixture,gamma-fixture.example,ops@gamma-fixture.example,3 Test Ln,Madison,WI,53703,+15555550101,dfs,https://d.example/w,not-a-date,,,,seated,C,ICP-3,,sub-floor,,T3,E,,,',
].join('\n')

test('normDomain lowercases, strips www., and keeps null null', () => {
  assert.equal(normDomain('WWW.Acme-Fixture.example'), 'acme-fixture.example')
  assert.equal(normDomain('  Acme-Fixture.example '), 'acme-fixture.example')
  assert.equal(normDomain(''), null)
  assert.equal(normDomain(null), null)
})

test('firstDate takes the earliest parseable date out of a pipe chain', () => {
  assert.equal(firstDate('2026-08-03|2026-08-01'), '2026-08-01')
  assert.equal(firstDate('2026-08-01'), '2026-08-01')
  assert.equal(firstDate('not-a-date'), null)
  assert.equal(firstDate(null), null)
})

test('toContactRow maps every typed column and keeps the whole row in raw', () => {
  const raws = fromCsv(FIXTURE_CSV)
  const row = toContactRow(raws[0], { generation: 'seated-v9', pool: 'seated', index: 0 })

  assert.equal(row.id, 'seated-v9:seated:0')
  assert.equal(row.list_generation, 'seated-v9')
  assert.equal(row.pool, 'seated')
  assert.equal(row.domain, 'acme-fixture.example')
  assert.equal(row.company_display, 'Acme Fixture, Inc.')
  assert.equal(row.zip5, '62701')
  assert.equal(row.phone_e164, '+15555550100')
  assert.equal(row.category_core, 4.5)
  assert.equal(row.rank_score, 71.5)
  assert.equal(row.location_count, '3')            // TEXT: the company's own claim, never summed
  assert.equal(row.captured, '2026-08-01|2026-08-03') // verbatim chain
  assert.equal(row.captured_date, '2026-08-01')       // derived sort key
  assert.deepEqual(row.source_tokens, ['timken', 'dfs'])
  // Founder v2 (Task 13): the carried-lines tokens and the estimated type are
  // derived AT SYNC TIME — the dashboard filters on stored values, never re-derives.
  assert.deepEqual(row.brand_tokens, ['Timken', 'Bearings'])
  assert.equal(row.business_type, 'distributor')   // rule 2: non-empty brand_authorized
  assert.equal(row.email, 'sales@acme-fixture.example')
  assert.equal(row.email_state, 'verified')
  assert.equal(row.has_person, true)
  assert.equal(row.raw.contact_last_name, 'Fixture')
  assert.equal(Object.keys(row.raw).length, 26)    // every CSV column survives in raw
})

test('toContactRow leaves a missing domain null and never invents a person', () => {
  const raws = fromCsv(FIXTURE_CSV)
  const row = toContactRow(raws[1], { generation: 'seated-v9', pool: 'seated', index: 1 })
  assert.equal(row.domain, null)
  assert.equal(row.email, null)
  assert.equal(row.has_person, false)
  assert.deepEqual(row.source_tokens, ['serp'])
  // No brand claim anywhere on the row: an EMPTY array (never null — the column
  // is not null default '{}') and the honest 'other', never a guessed type.
  assert.deepEqual(row.brand_tokens, [])
  assert.equal(row.business_type, 'other')
})

test('toContactRow nulls an unparseable numeric or date rather than guessing zero', () => {
  const raws = fromCsv(FIXTURE_CSV)
  const row = toContactRow(raws[2], { generation: 'seated-v9', pool: 'seated', index: 2 })
  assert.equal(row.category_core, null)
  assert.equal(row.rank_score, null)
  assert.equal(row.captured, 'not-a-date')  // stored verbatim
  assert.equal(row.captured_date, null)     // but never coerced
})

// ── brand_tokens (founder v2, Task 13 B) ────────────────────────────────────

test('brandTokens splits both brand_authorized and line_card on | and keeps order', () => {
  assert.deepEqual(brandTokens('Timken|SKF', 'Bearings|Seals'), ['Timken', 'SKF', 'Bearings', 'Seals'])
  assert.deepEqual(brandTokens('Timken', null), ['Timken'])
  assert.deepEqual(brandTokens(null, 'Bearings'), ['Bearings'])
})

test('brandTokens trims, collapses internal whitespace, and drops empties', () => {
  assert.deepEqual(brandTokens(' Gates  Fluid   Power |Parker', null), ['Gates Fluid Power', 'Parker'])
  assert.deepEqual(brandTokens('||', ''), [])
  assert.deepEqual(brandTokens(null, undefined), [])
  assert.deepEqual(brandTokens('  ', ' | '), [])
})

test('brandTokens dedupes case-insensitively keeping the first-seen casing', () => {
  // The facet feeds the filter, so the STORED casing is what round-trips; two
  // casings of one brand must collapse to one stored value or the filter splits.
  assert.deepEqual(brandTokens('Timken|TIMKEN', 'timken|SKF'), ['Timken', 'SKF'])
  assert.deepEqual(brandTokens('enerpac', 'Enerpac'), ['enerpac'])
  // Whitespace-collapse happens BEFORE dedupe, so spacing variants collapse too.
  assert.deepEqual(brandTokens('Gates  Fluid Power', 'gates fluid  power'), ['Gates Fluid Power'])
})

test('brandTokens caps an absurd chain at the first 100 tokens', () => {
  const chain = Array.from({ length: 150 }, (_, i) => `Brand${i}`).join('|')
  const out = brandTokens(chain, null)
  assert.equal(out.length, 100)
  assert.equal(out[0], 'Brand0')
  assert.equal(out[99], 'Brand99')
  // The cap applies to the COMBINED deduped list, not per field.
  const out2 = brandTokens(Array.from({ length: 60 }, (_, i) => `A${i}`).join('|'), Array.from({ length: 60 }, (_, i) => `B${i}`).join('|'))
  assert.equal(out2.length, 100)
  assert.equal(out2[99], 'B39')
})

// ── business_type (founder v2, Task 13 D) — exact precedence ────────────────

test('deriveBusinessType rule 1: distributor_type decides first, distributor branch before contractor', () => {
  assert.equal(deriveBusinessType({ distributor_type: 'Authorized Distributor' }, 'seated'), 'distributor')
  assert.equal(deriveBusinessType({ distributor_type: 'Dealer' }, 'seated'), 'distributor')
  assert.equal(deriveBusinessType({ distributor_type: 'Wholesaler' }, 'seated'), 'distributor')
  assert.equal(deriveBusinessType({ distributor_type: 'Parts Supplier' }, 'seated'), 'distributor')
  assert.equal(deriveBusinessType({ distributor_type: 'Service Center' }, 'seated'), 'contractor-service')
  assert.equal(deriveBusinessType({ distributor_type: 'Repair Shop' }, 'seated'), 'contractor-service')
  assert.equal(deriveBusinessType({ distributor_type: 'Rental' }, 'seated'), 'contractor-service')
  assert.equal(deriveBusinessType({ distributor_type: 'Installation' }, 'seated'), 'contractor-service')
  assert.equal(deriveBusinessType({ distributor_type: 'Contractor' }, 'seated'), 'contractor-service')
  // Matching BOTH sets: the distributor branch is checked first within rule 1.
  assert.equal(deriveBusinessType({ distributor_type: 'Distributor / Service Center' }, 'seated'), 'distributor')
  // "Sales" is in neither set — rule 1 passes and the row falls through.
  assert.equal(deriveBusinessType({ distributor_type: 'Sales' }, 'seated'), 'other')
})

test('deriveBusinessType precedence: rule 1 contractor BEATS rule 2 brands — the order is the contract', () => {
  // A row matching 1-contractor AND 2 must be contractor-service. Rule 1 wins.
  const row = { distributor_type: 'Service & Repair', brand_authorized: 'Timken', line_card: 'Bearings' }
  assert.equal(deriveBusinessType(row, 'seated'), 'contractor-service')
})

test('deriveBusinessType rule 2: a non-empty brand_authorized OR line_card means distributor', () => {
  assert.equal(deriveBusinessType({ brand_authorized: 'Timken' }, 'seated'), 'distributor')
  assert.equal(deriveBusinessType({ line_card: 'Bearings' }, 'seated'), 'distributor')
  // Whitespace-only is empty, not a brand claim.
  assert.equal(deriveBusinessType({ brand_authorized: '  ', line_card: '' }, 'seated'), 'other')
})

test('deriveBusinessType rule 3: the self-declaration matches the same sets, distributor first', () => {
  assert.equal(deriveBusinessType({ self_declaration: 'A stocking distributor of hydraulic components.' }, 'seated'), 'distributor')
  assert.equal(deriveBusinessType({ self_declaration: 'We repair and rebuild pumps.' }, 'seated'), 'contractor-service')
  assert.equal(deriveBusinessType({ self_declaration_verbatim: 'Full-service dealer for Bobcat.' }, 'seated'), 'distributor')
  // Matching both sets resolves distributor-first, same as rule 1.
  assert.equal(deriveBusinessType({ self_declaration: 'Distribution and service since 1952.' }, 'seated'), 'distributor')
  // A boolean-ish verbatim flag ('true') matches neither set and falls through.
  assert.equal(deriveBusinessType({ self_declaration_verbatim: 'true' }, 'seated'), 'other')
  // Rule 3 beats rule 4: a declared distributor in adjacent-trades is a distributor.
  assert.equal(deriveBusinessType({ self_declaration: 'Wholesale distributor.' }, 'adjacent-trades'), 'distributor')
})

test('deriveBusinessType rule 4/5: adjacent-trades defaults to contractor-service, everything else to other', () => {
  assert.equal(deriveBusinessType({}, 'adjacent-trades'), 'contractor-service')
  assert.equal(deriveBusinessType({}, 'seated'), 'other')
  assert.equal(deriveBusinessType({}, 'chains'), 'other')
  assert.equal(deriveBusinessType(null, 'seated'), 'other')
  assert.equal(deriveBusinessType(undefined, undefined), 'other')
})

test('toVerifyRow keeps the verdict verbatim and nulls an unparseable date', () => {
  assert.deepEqual(
    toVerifyRow({ email: 'A@Example.test', result: 'valid', flags: 'has_dns', verified_date: '2026-08-02' }),
    { email: 'a@example.test', result: 'valid', flags: 'has_dns', verified_date: '2026-08-02' },
  )
  assert.equal(toVerifyRow({ email: 'b@example.test', result: 'unknown', verified_date: '' }).verified_date, null)
})

test('conservationLines passes on equal counts and fails naming the offender', () => {
  const ok = conservationLines([
    { label: 'seated-v9', file: 2773, db: 2773 },
    { label: 'pool-chains-v11', file: 118, db: 118 },
  ])
  assert.equal(ok.ok, true)
  assert.match(ok.lines[0], /seated-v9\s+file\s+2,773\s+db\s+2,773\s+ok/)

  const bad = conservationLines([
    { label: 'seated-v9', file: 2773, db: 2773 },
    { label: 'pool-chains-v11', file: 118, db: 113 },
  ])
  assert.equal(bad.ok, false)
  assert.match(bad.lines[1], /pool-chains-v11.*MISMATCH/)
})

test('parseSourceDirs keeps token+status pairs and rejects the dashboard folder', () => {
  const dirs = parseSourceDirs([
    'dfs [DONE-DEEP]',
    'adaptall [RETIRED-TO-LOOKUPS]',
    'e4-headless-locators [PART-BUILT]',
    'dashboard',
    '00-README.md',
  ])
  assert.deepEqual(dirs, [
    { token: 'adaptall', status: 'RETIRED-TO-LOOKUPS', folder: 'adaptall [RETIRED-TO-LOOKUPS]' },
    { token: 'dfs', status: 'DONE-DEEP', folder: 'dfs [DONE-DEEP]' },
    { token: 'e4-headless-locators', status: 'PART-BUILT', folder: 'e4-headless-locators [PART-BUILT]' },
  ])
  // The token group is greedy up to the space-bracket, so hyphens survive.
  assert.deepEqual(SOURCE_DIR_RE.exec('e4-headless-locators [PART-BUILT]').slice(1), [
    'e4-headless-locators',
    'PART-BUILT',
  ])
  // Guardrail 5: `dashboard` must never become a source token.
  assert.equal(dirs.some((d) => d.token === 'dashboard'), false)
})

test('parseRegistryTable reads the section-5 rows and tolerates an em-dash cell', () => {
  const md = [
    '| token | status | raw rows | seated | last pull | est. left on table | handoff |',
    '|---|---|---|---|---|---|---|',
    '| dfs | DONE-DEEP | 74,578 | 2,437 | 2026-08-04 | ~30k listings | `dfs [DONE-DEEP]/` |',
    '| equipment-dealers | PART-BUILT | — | — | 2026-08-04 | workstream row | `equipment-dealers [PART-BUILT]/` |',
  ].join('\n')
  const map = parseRegistryTable(md)
  assert.deepEqual(map.get('dfs'), {
    status_row: 'DONE-DEEP', raw_rows: 74578, seated: 2437, last_pull: '2026-08-04', est_left: '~30k listings',
  })
  assert.deepEqual(map.get('equipment-dealers'), {
    status_row: 'PART-BUILT', raw_rows: null, seated: null, last_pull: '2026-08-04', est_left: 'workstream row',
  })
})

test('parseStatusBanner returns the banner text, or null for a malformed one', () => {
  assert.equal(
    parseStatusBanner('# dfs\n\n> **STATUS (2026-08-04):** Worked to exhaustion.\n\nmore'),
    'Worked to exhaustion.',
  )
  assert.equal(parseStatusBanner('# dfs\n\nno banner here'), null)
  assert.equal(parseStatusBanner(''), null)
})

test('isPausedError recognises the shapes a paused project produces', () => {
  assert.equal(isPausedError(new TypeError('fetch failed')), true)
  assert.equal(isPausedError(Object.assign(new Error('x'), { cause: { code: 'ECONNREFUSED' } })), true)
  assert.equal(isPausedError(Object.assign(new Error('x'), { cause: { code: 'ENOTFOUND' } })), true)
  assert.equal(isPausedError(Object.assign(new Error('x'), { cause: { code: 'UND_ERR_CONNECT_TIMEOUT' } })), true)
  assert.equal(isPausedError(new Error('duplicate key value violates unique constraint')), false)
  assert.match(PAUSED_MESSAGE, /restore it in the Supabase dashboard/)
})
