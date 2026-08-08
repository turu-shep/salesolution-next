import assert from 'node:assert/strict'
import test from 'node:test'

import { ALLOWED_VIEWS, ALWAYS_SELECTED, DEFAULT_VIEW, LOCATION_COLUMNS, TYPED_COLUMNS, isSheetColumn, selectList, viewLabel } from './columns.mjs'

test('LOCATION_COLUMNS is the whitelist, verbatim and in order', () => {
  assert.deepEqual(LOCATION_COLUMNS, [
    'company', 'company_display', 'address_1', 'city', 'state', 'zip5',
    'phone_e164', 'domain', 'category_core', 'brand_authorized', 'line_card',
    'source', 'source_url', 'captured', 'location_count',
  ])
  // 15 identifiers, 14 visible columns: company + company_display render as one
  // "Company" cell (display for the human, company for sort stability).
  assert.equal(LOCATION_COLUMNS.length, 15)
})

test('every whitelist column is a real column in the contacts table', () => {
  for (const c of LOCATION_COLUMNS) assert.equal(TYPED_COLUMNS.includes(c), true, `${c} is not in TYPED_COLUMNS`)
  assert.equal(TYPED_COLUMNS.includes('website'), false)   // a brief would reach for it; the real one is `domain`
  assert.equal(TYPED_COLUMNS.includes('zip'), false)       // the real one is `zip5`
  assert.equal(TYPED_COLUMNS.includes('phone'), false)     // the real one is `phone_e164`
  assert.equal(TYPED_COLUMNS.includes('country'), false)   // derived from pool; no column exists
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
  assert.equal(isSheetColumn('email'), false)      // typed, but outside the whitelist
  assert.equal(isSheetColumn('tier'), false)       // typed, but outside the whitelist
  assert.equal(isSheetColumn('rank_score'), false)
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
  for (const c of ['segment', 'tier', 'cohort', 'icp_class', 'size_band', 'rank_score', 'disposition', 'email', 'email_state', 'has_person', 'pool', 'list_generation', 'captured_date']) {
    assert.equal(TYPED_COLUMNS.includes(c), true, `${c} missing from TYPED_COLUMNS`)
  }
})
