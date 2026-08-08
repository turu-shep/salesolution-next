import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'

import { LOCATION_COLUMNS } from './columns.mjs'
import { opaqueKey, toClientCounters, toClientRow } from './rows.mjs'

test('opaqueKey is stable, 16 hex chars, and distinct per id', () => {
  const id = 'seated-v9:seated:1042'
  assert.equal(opaqueKey(id), opaqueKey(id))                 // stable across calls
  assert.match(opaqueKey(id), /^[0-9a-f]{16}$/)              // 16 hex chars, nothing else
  assert.equal(opaqueKey(id), createHash('sha256').update(id).digest('hex').slice(0, 16))
  assert.notEqual(opaqueKey('seated-v9:seated:1042'), opaqueKey('seated-v9:seated:1043'))
  // The composite id's vocabulary never survives into the key.
  assert.equal(opaqueKey(id).includes(':'), false)
})

test('toClientRow strips every internal field and everything off the whitelist', () => {
  const row = {
    id: 'seated-v9:chains:7', list_generation: 'seated-v9', pool: 'chains',
    raw: { anything: true }, tier: 'A', email: 'x@y.example', rank_score: 99, disposition: 'live',
    company: 'Acme Bearing', company_display: 'Acme Bearing Co', address_1: '1 Main St',
    city: 'Peoria', state: 'IL', zip5: '61601', phone_e164: '+13095550100',
    domain: 'acmebearing.example', category_core: 4.5, brand_authorized: 'timken',
    line_card: 'bearings', source: 'timken|dfs', source_url: 'https://a.example/x|https://b.example/y',
    captured: '2026-08-01|2026-08-03', location_count: 3,
  }
  const out = toClientRow(row)
  // Exactly: the opaque key, the derived country, and the whitelist. Nothing else.
  assert.deepEqual(Object.keys(out).sort(), ['key', 'country', ...LOCATION_COLUMNS].sort())
  for (const gone of ['id', 'pool', 'list_generation', 'raw', 'tier', 'email', 'rank_score', 'disposition']) {
    assert.equal(gone in out, false, `${gone} must never be serialized`)
  }
  assert.equal(out.key, opaqueKey(row.id))
  assert.equal(out.country, 'United States')
  assert.equal(out.company_display, 'Acme Bearing Co')
})

test('toClientRow derives Non-US from the pool before dropping it', () => {
  const out = toClientRow({ id: 'g:non-us:1', pool: 'non-us', company: 'X' })
  assert.equal(out.country, 'Non-US')
  assert.equal('pool' in out, false)
  // An absent whitelist field is an explicit null, never a missing key —
  // downstream consumers (the sheet, the export) see one stable shape.
  assert.equal(out.city, null)
})

test('toClientCounters serializes exactly the three location counters', () => {
  const out = toClientCounters({ locations: '12', brands: 3, states: '7', companies: 999, no_domain: 1, people: 500, sendable: 250 })
  assert.deepEqual(out, { locations: 12, brands: 3, states: 7 })
  assert.deepEqual(Object.keys(out).sort(), ['brands', 'locations', 'states'])
  // A missing RPC row is three zeros, never a leak of whatever was in scope.
  assert.deepEqual(toClientCounters(undefined), { locations: 0, brands: 0, states: 0 })
})
