import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BATCH_SIZE, buildBatches, categoryFor, conservation, mergeFields, routeRow, toLeadRecord } from './s7.mjs'

const row = (over = {}) => ({
  company: over.company ?? `co-${Math.floor(Math.random() * 1e9)}`,
  company_display: 'Acme Bearing Co.',
  domain: 'acmebearing.example',
  email: 'sales@acmebearing.example',
  email_source: '',
  contact_first_name: '',
  segment: 'B',
  tier: 'T2',
  cohort: '',
  state: 'OH',
  ...over,
})

test('voided manufacturer-inbox rows never export, even ahead of Track 1', () => {
  const r = routeRow(row({ email_source: 'voided:manufacturer-inbox:nord', contact_first_name: 'Brian' }))
  assert.deepEqual(r, { route: 'routed', reason: 'voided-manufacturer-inbox' })
})

test('named-contact rows route to Track 1, with or without an email', () => {
  assert.equal(routeRow(row({ contact_first_name: 'Brian' })).route, 'track1')
  assert.equal(routeRow(row({ contact_first_name: 'Brian', email: '' })).route, 'track1')
})

test('no email → routed; cohort E → its own campaign; declaration → E1-A only when approved', () => {
  assert.deepEqual(routeRow(row({ email: '' })), { route: 'routed', reason: 'no-email' })
  assert.deepEqual(routeRow(row({ cohort: 'E' })), { route: 'batch', campaign: 'C1-CE', body: 'E1-B' })
  const approved = new Map([['acmebearing.example', 'a stocking distributor']])
  assert.deepEqual(routeRow(row(), { approved }), { route: 'batch', campaign: 'C1', body: 'E1-A' })
  assert.deepEqual(routeRow(row(), {}), { route: 'batch', campaign: 'C1', body: 'E1-B' })
})

test('cohort E never gets the declaration body, approved or not', () => {
  const approved = new Map([['acmebearing.example', 'a stocking distributor']])
  assert.deepEqual(routeRow(row({ cohort: 'E' }), { approved }), { route: 'batch', campaign: 'C1-CE', body: 'E1-B' })
})

test('Segment C without an overlay category does not send; with one it does', () => {
  assert.deepEqual(routeRow(row({ segment: 'C' })), { route: 'routed', reason: 'pending-segment-c-category' })
  const segmentCOverlay = new Map([['acmebearing.example', 'cutting tools and abrasives']])
  assert.equal(routeRow(row({ segment: 'C' }), { segmentCOverlay }).route, 'batch')
  assert.equal(categoryFor(row({ segment: 'C' }), segmentCOverlay), 'cutting tools and abrasives')
})

test('mergeFields: all six keys always present, empty string not missing', () => {
  const m = mergeFields(row({ segment: 'C', state: '' }))
  assert.deepEqual(Object.keys(m).sort(), ['category', 'category_region', 'company_display', 'declaration', 'hello', 'segment'])
  assert.equal(m.category, '')
  assert.equal(m.category_region, '')
  assert.equal(m.declaration, '')
  assert.equal(m.hello, '')
})

test('mergeFields: full state names, hello with the em-dash shape, region falls back cleanly', () => {
  const m = mergeFields(row({ contact_first_name: 'Brian' }))
  assert.equal(m.hello, 'Brian — ')
  assert.equal(m.category_region, 'bearings and power transmission in Ohio')
  const noState = mergeFields(row({ state: '' }))
  assert.equal(noState.category_region, 'bearings and power transmission')
})

test('batches split at 50, group by campaign × body × segment, isolate T4', () => {
  const rows = []
  for (let i = 0; i < 120; i++) rows.push(row({ company: `main-${i}` }))
  for (let i = 0; i < 3; i++) rows.push(row({ company: `t4-${i}`, tier: 'T4' }))
  for (let i = 0; i < 5; i++) rows.push(row({ company: `ce-${i}`, cohort: 'E' }))
  const batches = buildBatches(rows)
  const sizes = batches.map((b) => `${b.id}:${b.rows.length}`)
  assert.ok(batches.every((b) => b.rows.length <= BATCH_SIZE), sizes.join(' '))
  const mainBatches = batches.filter((b) => b.key === 'C1|E1-B|segB|main')
  assert.deepEqual(mainBatches.map((b) => b.rows.length), [50, 50, 20])
  assert.equal(batches.filter((b) => b.key === 'C1|E1-B|segB|T4').length, 1)
  assert.equal(batches.filter((b) => b.campaign === 'C1-CE').length, 1)
})

test('a duplicate company join key inside a group is a build defect, not a silent cap break', () => {
  const rows = [row({ company: 'dup' }), row({ company: 'dup' })]
  assert.throws(() => buildBatches(rows), /duplicate company join keys/)
})

test('toLeadRecord carries the send target, all six custom fields, and the audit trail', () => {
  const r = row()
  const [batch] = buildBatches([r])
  const lead = toLeadRecord(r, batch)
  assert.equal(lead.email, r.email)
  assert.equal(lead.company_name, 'Acme Bearing Co.')
  assert.equal(lead.website, 'https://acmebearing.example')
  for (const k of ['hello', 'company_display', 'category', 'category_region', 'declaration', 'segment'])
    assert.ok(k in lead, `missing custom field ${k}`)
  assert.equal(lead.batch, batch.id)
})

test('verification join: only valid batches once any results exist; empty map changes nothing', () => {
  const r = row({ email: 'sales@acmebearing.example' })
  assert.equal(routeRow(r, {}).route, 'batch')
  const verified = new Map([['sales@acmebearing.example', 'valid']])
  assert.equal(routeRow(r, { verified }).route, 'batch')
  for (const state of ['invalid', 'catchall', 'disposable', 'unknown']) {
    verified.set('sales@acmebearing.example', state)
    assert.deepEqual(routeRow(r, { verified }), { route: 'routed', reason: `verify-${state}` })
  }
  const other = new Map([['someone@else.example', 'valid']])
  assert.deepEqual(routeRow(r, { verified: other }), { route: 'routed', reason: 'unverified' })
})

test('verification runs before the Segment C cull so reasons stay honest', () => {
  const verified = new Map([['sales@acmebearing.example', 'invalid']])
  const r = row({ segment: 'C', email: 'sales@acmebearing.example' })
  assert.deepEqual(routeRow(r, { verified }), { route: 'routed', reason: 'verify-invalid' })
})

test('conservation: every row lands in exactly one bucket', () => {
  const rows = [
    row({ company: 'a' }),
    row({ company: 'b', email: '' }),
    row({ company: 'c', contact_first_name: 'Kay' }),
    row({ company: 'd', email_source: 'voided:manufacturer-inbox:x' }),
    row({ company: 'e', segment: 'C' }),
  ]
  const c = conservation(rows)
  assert.equal(c.total, 5)
  assert.equal(c.batch, 1)
  assert.equal(c.track1, 1)
  assert.deepEqual(c.routed, { 'no-email': 1, 'voided-manufacturer-inbox': 1, 'pending-segment-c-category': 1 })
})
