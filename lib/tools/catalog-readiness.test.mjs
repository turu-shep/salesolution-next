import assert from 'node:assert/strict'
import { test } from 'node:test'

import { READINESS_ITEMS, bandFor, scoreCatalog } from './catalog-readiness.mjs'

test('empty → 0, lowest band, three heaviest fixes', () => {
  const r = scoreCatalog([])
  assert.equal(r.score, 0)
  assert.equal(r.band, 'Largely invisible to AI')
  assert.equal(r.topFixes.length, 3)
  // heaviest gaps first (weight 3)
  assert.equal(r.topFixes[0].weight, 3)
  assert.ok(r.topFixes[1].weight <= r.topFixes[0].weight)
})

test('all checked → 100, top band, no fixes', () => {
  const r = scoreCatalog(READINESS_ITEMS.map((i) => i.id))
  assert.equal(r.score, 100)
  assert.equal(r.band, 'AI-ready')
  assert.equal(r.topFixes.length, 0)
})

test('unknown ids are ignored', () => {
  const r = scoreCatalog(['not-a-real-id', 'another-fake'])
  assert.equal(r.score, 0)
})

test('partial score is the weighted fraction, rounded', () => {
  // the three weight-3 items = 9 of 23 total → 39
  const r = scoreCatalog(['crawlers-allowed', 'ssr', 'html-specs'])
  assert.equal(r.score, Math.round((9 / 23) * 100))
  assert.equal(r.score, 39)
  assert.equal(r.band, 'Largely invisible to AI')
})

test('band thresholds', () => {
  assert.equal(bandFor(0), 'Largely invisible to AI')
  assert.equal(bandFor(39), 'Largely invisible to AI')
  assert.equal(bandFor(40), 'Partly there')
  assert.equal(bandFor(64), 'Partly there')
  assert.equal(bandFor(65), 'Competitive')
  assert.equal(bandFor(84), 'Competitive')
  assert.equal(bandFor(85), 'AI-ready')
  assert.equal(bandFor(100), 'AI-ready')
})

test('every item has a fix and a positive weight', () => {
  for (const i of READINESS_ITEMS) {
    assert.ok(i.fix && i.fix.length > 0, `${i.id} missing fix`)
    assert.ok(i.weight > 0, `${i.id} weight must be > 0`)
  }
})
