import assert from 'node:assert/strict'
import test from 'node:test'

import { ALLOWED_VIEWS, ALWAYS_SELECTED, BUSINESS_TYPES, CLIENT_POOLS, CLIENT_POOLS_NO_SMALL_SHOPS, DEFAULT_VIEW, LOCATION_COLUMNS, TYPED_COLUMNS, businessTypeLabel, isSheetColumn, selectList, viewLabel } from './columns.mjs'

test('LOCATION_COLUMNS is the whitelist, verbatim and in order', () => {
  // Task 13 pin update (founder v2): size_band + business_type join the
  // whitelist, ordered after category_core — both LABELED ESTIMATES on the sheet.
  assert.deepEqual(LOCATION_COLUMNS, [
    'company', 'company_display', 'address_1', 'city', 'state', 'zip5',
    'phone_e164', 'domain', 'category_core', 'size_band', 'business_type',
    'brand_authorized', 'line_card', 'source', 'source_url', 'captured', 'location_count',
  ])
  // 17 identifiers, 16 visible columns: company + company_display render as one
  // "Company" cell (display for the human, company for sort stability).
  assert.equal(LOCATION_COLUMNS.length, 17)
})

test('CLIENT_POOLS is the curated client base — the reject bins can never appear in it', () => {
  // Founder decision 2026-08-09, narrowed by the G2 re-pick 2026-08-10: the
  // client base is everything EXCEPT the reject bins and non-us,
  // server-enforced. This constant is a SECURITY-CLASS control like the
  // whitelist: both query emitters pin it unconditionally.
  assert.deepEqual(CLIENT_POOLS, [
    'seated', 'above-ceiling', 'adjacent-trades', 'chains', 'small-shops', 'segment-w',
  ])
  for (const rejected of ['not-a-distributor', 'ranked-out', 'duplicate-sites', 'identity-backlog', 'usaspending-unmatched']) {
    assert.equal(CLIENT_POOLS.includes(rejected), false, `${rejected} is a reject bin and must never be a client pool`)
  }
  // non-us is not a reject bin — it stays in the asset — but the founder
  // dropped it from the client view entirely ("fully drop non-us").
  assert.equal(CLIENT_POOLS.includes('non-us'), false)
})

test('CLIENT_POOLS_NO_SMALL_SHOPS is the only other pool set an emitter may pin', () => {
  // The hide-small-shops toggle chooses between two code-owned subsets; it can
  // never name pools, so it can never widen.
  assert.deepEqual(CLIENT_POOLS_NO_SMALL_SHOPS, CLIENT_POOLS.filter((p) => p !== 'small-shops'))
  for (const p of CLIENT_POOLS_NO_SMALL_SHOPS) {
    assert.equal(CLIENT_POOLS.includes(p), true, `${p} must be a subset of the client base`)
  }
})

test('BUSINESS_TYPES is the sync vocabulary, labeled for the client', () => {
  assert.deepEqual(BUSINESS_TYPES, ['distributor', 'contractor-service', 'other'])
  assert.equal(businessTypeLabel('distributor'), 'Distributor')
  assert.equal(businessTypeLabel('contractor-service'), 'Contractor & service')
  assert.equal(businessTypeLabel('other'), 'Other')
  // Null (not yet re-synced) and junk render as empty, never a crash or a guess.
  assert.equal(businessTypeLabel(null), '')
  assert.equal(businessTypeLabel(undefined), '')
  assert.equal(businessTypeLabel('junk'), '')
})

test('every whitelist column is a real column in the contacts table', () => {
  for (const c of LOCATION_COLUMNS) assert.equal(TYPED_COLUMNS.includes(c), true, `${c} is not in TYPED_COLUMNS`)
  assert.equal(TYPED_COLUMNS.includes('website'), false)   // a brief would reach for it; the real one is `domain`
  assert.equal(TYPED_COLUMNS.includes('zip'), false)       // the real one is `zip5`
  assert.equal(TYPED_COLUMNS.includes('phone'), false)     // the real one is `phone_e164`
  assert.equal(TYPED_COLUMNS.includes('country'), false)   // no column exists; the derived one left with non-us
  assert.equal(TYPED_COLUMNS.includes('category_display'), false)
})

test('selectList is the whitelist plus the server-internal fields, and nothing widens it', () => {
  assert.equal(selectList(), [...ALWAYS_SELECTED, ...LOCATION_COLUMNS].join(','))
  assert.equal(selectList().includes('raw'), false)
  // The show-all path is DELETED (AMENDMENT 2 D1), not hidden: no argument —
  // truthy, string, whatever a caller passes — reaches a wider select.
  assert.equal(selectList(true), selectList())
  assert.equal(selectList('*'), selectList())
})

test('isSheetColumn admits whitelist columns only — a typed column is not enough', () => {
  assert.equal(isSheetColumn('city'), true)
  assert.equal(isSheetColumn('captured'), true)
  // Task 13: the two new whitelist columns are sortable automatically.
  assert.equal(isSheetColumn('size_band'), true)
  assert.equal(isSheetColumn('business_type'), true)
  assert.equal(isSheetColumn('email'), false)      // typed, but outside the whitelist
  assert.equal(isSheetColumn('tier'), false)       // typed, but outside the whitelist
  assert.equal(isSheetColumn('rank_score'), false)
  assert.equal(isSheetColumn('brand_tokens'), false) // a FILTER column, never a rendered/sorted one
  assert.equal(isSheetColumn('id'), false)         // server-internal; never a client sort
  assert.equal(isSheetColumn('pool'), false)
  assert.equal(isSheetColumn('raw'), false)
})

test('the view registry is the two client lenses, labeled', () => {
  assert.deepEqual(ALLOWED_VIEWS, ['field-advisor', 'hosebox'])
  assert.equal(DEFAULT_VIEW, 'field-advisor')
  assert.equal(viewLabel('field-advisor'), 'Field Advisor')
  assert.equal(viewLabel('hosebox'), 'Hosebox')
  // An unknown view never renders a blank title; the raw value is the fallback.
  assert.equal(viewLabel('something-else'), 'something-else')
})

test('TYPED_COLUMNS carries the campaign and person-adjacent columns too', () => {
  for (const c of ['segment', 'tier', 'cohort', 'icp_class', 'size_band', 'rank_score', 'disposition', 'email', 'email_state', 'has_person', 'pool', 'list_generation', 'captured_date', 'brand_tokens', 'business_type']) {
    assert.equal(TYPED_COLUMNS.includes(c), true, `${c} missing from TYPED_COLUMNS`)
  }
})
