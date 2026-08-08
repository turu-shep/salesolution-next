import assert from 'node:assert/strict'
import test from 'node:test'

import { fromCsv } from './contract.mjs'
import {
  PAUSED_MESSAGE,
  SOURCE_DIR_RE,
  conservationLines,
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
})

test('toContactRow nulls an unparseable numeric or date rather than guessing zero', () => {
  const raws = fromCsv(FIXTURE_CSV)
  const row = toContactRow(raws[2], { generation: 'seated-v9', pool: 'seated', index: 2 })
  assert.equal(row.category_core, null)
  assert.equal(row.rank_score, null)
  assert.equal(row.captured, 'not-a-date')  // stored verbatim
  assert.equal(row.captured_date, null)     // but never coerced
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
