import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'

import { LOCATION_COLUMNS } from './columns.mjs'
import { opaqueKey, toClientCounters, toClientFacets, toClientRow, toClientSource, toClientSources } from './rows.mjs'

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
    brand_tokens: ['Timken', 'Bearings'],
    company: 'Acme Bearing', company_display: 'Acme Bearing Co', address_1: '1 Main St',
    city: 'Peoria', state: 'IL', zip5: '61601', phone_e164: '+13095550100',
    domain: 'acmebearing.example', category_core: 4.5, size_band: '5-10M',
    business_type: 'distributor', brand_authorized: 'timken',
    line_card: 'bearings', source: 'timken|dfs', source_url: 'https://a.example/x|https://b.example/y',
    captured: '2026-08-01|2026-08-03', location_count: 3,
  }
  const out = toClientRow(row)
  // Exactly: the opaque key, the derived country, and the whitelist. Nothing else.
  assert.deepEqual(Object.keys(out).sort(), ['key', 'country', ...LOCATION_COLUMNS].sort())
  // brand_tokens is a FILTER column: it decides membership, it never serializes.
  for (const gone of ['id', 'pool', 'list_generation', 'raw', 'tier', 'email', 'rank_score', 'disposition', 'brand_tokens']) {
    assert.equal(gone in out, false, `${gone} must never be serialized`)
  }
  assert.equal(out.key, opaqueKey(row.id))
  assert.equal(out.country, 'United States')
  assert.equal(out.company_display, 'Acme Bearing Co')
  // Task 13: the two labeled estimates ride the whitelist like any other column.
  assert.equal(out.size_band, '5-10M')
  assert.equal(out.business_type, 'distributor')
})

test('toClientRow derives Non-US from the pool before dropping it', () => {
  const out = toClientRow({ id: 'g:non-us:1', pool: 'non-us', company: 'X' })
  assert.equal(out.country, 'Non-US')
  assert.equal('pool' in out, false)
  // An absent whitelist field is an explicit null, never a missing key —
  // downstream consumers (the sheet, the export) see one stable shape.
  assert.equal(out.city, null)
})

test('toClientRow is null-safe on rows synced before 0005 populated the estimates', () => {
  // Until the founder pastes 0005 and the controller re-syncs, size_band and
  // business_type are null on every row. The shape stays stable: explicit
  // nulls, never a missing key, never a throw.
  const out = toClientRow({ id: 'g:seated:1', pool: 'seated', company: 'X' })
  assert.equal(out.size_band, null)
  assert.equal(out.business_type, null)
  const empty = toClientRow({})
  assert.deepEqual(Object.keys(empty).sort(), ['key', 'country', ...LOCATION_COLUMNS].sort())
  assert.equal(empty.size_band, null)
  assert.equal(empty.business_type, null)
})

test('toClientFacets serializes exactly the three facet lists, null-safe at every level', () => {
  // The client_facets RPC returns one row of three text[] columns. The
  // serializer sorts, drops empties, and answers junk with empty lists — the
  // filter controls render (empty) even when the RPC answer is malformed.
  const out = toClientFacets({ states: ['WI', 'IL'], brands: ['Timken', 'Parker'], sizes: ['5-10M'] })
  assert.deepEqual(out, { states: ['IL', 'WI'], brands: ['Parker', 'Timken'], sizes: ['5-10M'] })
  assert.deepEqual(Object.keys(out).sort(), ['brands', 'sizes', 'states'])

  // A pre-0005 database has no RPC; a post-0005 pre-sync one answers empties.
  assert.deepEqual(toClientFacets(undefined), { states: [], brands: [], sizes: [] })
  assert.deepEqual(toClientFacets(null), { states: [], brands: [], sizes: [] })
  assert.deepEqual(toClientFacets({}), { states: [], brands: [], sizes: [] })
  assert.deepEqual(toClientFacets({ states: null, brands: 'junk', sizes: 42 }), { states: [], brands: [], sizes: [] })
  // Null/empty entries inside a list are dropped, non-strings stringified never thrown on.
  assert.deepEqual(toClientFacets({ states: ['IL', null, ''], brands: [], sizes: [] }).states, ['IL'])
})

test('toClientCounters serializes exactly the three location counters', () => {
  const out = toClientCounters({ locations: '12', brands: 3, states: '7', companies: 999, no_domain: 1, people: 500, sendable: 250 })
  assert.deepEqual(out, { locations: 12, brands: 3, states: 7 })
  assert.deepEqual(Object.keys(out).sort(), ['brands', 'locations', 'states'])
  // A missing RPC row is three zeros, never a leak of whatever was in scope.
  assert.deepEqual(toClientCounters(undefined), { locations: 0, brands: 0, states: 0 })
})

test('toClientSource serializes exactly the five provenance keys and nothing else', () => {
  // The source_stats RPC returns the full per-token analytics row; the client
  // gets the provenance story only (AMENDMENT 2, Task 8 D2).
  const out = toClientSource({
    token: 'enerpac', rows: '1234', domains: '900', sole_source: '120',
    with_email: '456', with_domain: '900', with_person: '300', last_captured: '2026-08-01',
  })
  assert.deepEqual(out, { token: 'enerpac', display: 'Enerpac', kind: 'distributor locator', locations: 1234, lastCaptured: 'Aug 2026' })
  assert.deepEqual(Object.keys(out).sort(), ['display', 'kind', 'lastCaptured', 'locations', 'token'])
  for (const gone of ['with_email', 'with_person', 'sole_source', 'domains', 'with_domain', 'rows', 'last_captured']) {
    assert.equal(gone in out, false, `${gone} must never be serialized`)
  }
})

test('toClientSource ships Mon YYYY only — the capture day never serializes', () => {
  assert.equal(toClientSource({ token: 'dfs', rows: 1, last_captured: '2026-08-03' }).lastCaptured, 'Aug 2026')
  assert.equal(toClientSource({ token: 'dfs', rows: 1, last_captured: null }).lastCaptured, null)
  assert.equal(toClientSource({ token: 'dfs', rows: 1, last_captured: 'not-a-date' }).lastCaptured, null)
})

test('toClientSource falls back to the raw token for unmapped sources', () => {
  // Every token renders, unmapped ones as themselves — dropping a token would
  // make the sheet's "found in N lists" story a lie.
  const out = toClientSource({ token: 'adaptall-export', rows: 7, last_captured: '2026-08-01' })
  assert.equal(out.display, 'adaptall-export')
  assert.equal(out.kind, null)
  assert.equal(out.locations, 7)
})

test('toClientSources sorts by locations contributed, descending, token as tiebreak', () => {
  const out = toClientSources([
    { token: 'serp', rows: '50', last_captured: null },
    { token: 'timken', rows: '900', last_captured: '2026-08-01' },
    { token: 'dfs', rows: '900', last_captured: '2026-08-01' },
    { token: 'enerpac', rows: 1200, last_captured: '2026-08-01' },
  ])
  assert.deepEqual(out.map((s) => s.token), ['enerpac', 'dfs', 'timken', 'serp'])
  // Empty input is an empty list, never a throw.
  assert.deepEqual(toClientSources(undefined), [])
})
