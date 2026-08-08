import assert from 'node:assert/strict'
import test from 'node:test'

import { ALWAYS_SELECTED, LOCATION_COLUMNS, TYPED_COLUMNS, isRealColumn, selectList } from './columns.mjs'

test('LOCATION_COLUMNS is the default view, verbatim and in order', () => {
  assert.deepEqual(LOCATION_COLUMNS, [
    'company', 'company_display', 'address_1', 'city', 'state', 'zip5',
    'phone_e164', 'domain', 'category_core', 'brand_authorized', 'line_card',
    'source', 'source_url', 'captured', 'location_count',
  ])
  // 15 identifiers, 14 visible columns: company + company_display render as one
  // "Company" cell (display for the human, company for sort stability).
  assert.equal(LOCATION_COLUMNS.length, 15)
})

test('every default column is a real column in the contacts table', () => {
  for (const c of LOCATION_COLUMNS) assert.equal(isRealColumn(c), true, `${c} is not in TYPED_COLUMNS`)
  assert.equal(isRealColumn('website'), false)   // the brief's name; the real one is `domain`
  assert.equal(isRealColumn('zip'), false)       // the real one is `zip5`
  assert.equal(isRealColumn('phone'), false)     // the real one is `phone_e164`
  assert.equal(isRealColumn('country'), false)   // derived from pool; no column exists
  assert.equal(isRealColumn('category_display'), false)
})

test('selectList opens on the default columns and widens to everything', () => {
  const dflt = selectList(false)
  assert.equal(dflt, [...ALWAYS_SELECTED, ...LOCATION_COLUMNS].join(','))
  assert.equal(dflt.includes('raw'), false)      // raw is heavy; it rides the show-all path only
  assert.equal(selectList(true), '*')            // typed columns + raw, for the details panel
})

test('TYPED_COLUMNS carries the campaign and person-adjacent columns too', () => {
  for (const c of ['segment', 'tier', 'cohort', 'icp_class', 'size_band', 'rank_score', 'disposition', 'email', 'email_state', 'has_person', 'pool', 'list_generation', 'captured_date']) {
    assert.equal(TYPED_COLUMNS.includes(c), true, `${c} missing from TYPED_COLUMNS`)
  }
})
