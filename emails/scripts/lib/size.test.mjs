import assert from 'node:assert/strict'
import { test } from 'node:test'
import { makeRecord } from './contract.mjs'
import { reviewCount, sizeScore } from './size.mjs'

const rec = (extra = {}) =>
  makeRecord({
    company: 'x',
    company_display: 'X Industrial Supply',
    source: 'dfs',
    source_url: 'https://example.com',
    captured: '2026-08-01',
    ...extra,
  })

test('reviewCount parses DFS votes out of the unmapped tier_raw', () => {
  assert.equal(reviewCount(rec({ tier_raw: 'claimed=true;votes=37;rating=4.6' })), 37)
  assert.equal(reviewCount(rec({ tier_raw: 'claimed=false' })), null, 'no votes published is null, not zero')
  assert.equal(reviewCount(rec({ tier_raw: null })), null)
})

test('after a merge the LARGEST vote count wins', () => {
  // Post-merge `tier_raw` is a comma-joined list of every source's own string.
  assert.equal(reviewCount(rec({ tier_raw: 'claimed=true;votes=12, claimed=true;votes=204' })), 204)
})

test('an UNMEASURED company is never called small', () => {
  // No reviews, no SKU estimate, one location, no association, no brands.
  const s = sizeScore(rec({ location_count: 1 }), {})
  assert.equal(s.measurable, false)
  assert.notEqual(s.band, 'sub-floor', 'absence of evidence is not evidence of absence — §5c, Segment W')
  assert.equal(s.band, '2-5M')
})

test('a MEASURED small company routes sub-floor', () => {
  const s = sizeScore(rec({ location_count: 1, tier_raw: 'votes=2', domain: null, phone_e164: null }), {})
  assert.equal(s.measurable, true)
  assert.equal(s.band, 'sub-floor')
})

test('nothing disqualifies — every signal is additive', () => {
  const small = sizeScore(rec({ location_count: 1, tier_raw: 'votes=0' }), {})
  const big = sizeScore(
    rec({
      location_count: 8,
      tier_raw: 'votes=300',
      evidence_depth: 3,
      address_1: '1 main st',
      zip5: '44087',
      phone_e164: '3303553253',
      domain: 'example.com',
      source: 'ad|ptda|dfs',
    }),
    { brand_count: 12, sku_estimate: 6000 },
  )
  assert.ok(big.score > small.score)
  assert.equal(big.band, 'above-band')
  assert.equal(big.components.association, 16, 'AD + PTDA is worth more than one, not twice one')
})

test('a SKU estimate is a tiering input, never a gate (§5d)', () => {
  const below = sizeScore(rec({ location_count: 1, tier_raw: 'votes=40' }), { sku_estimate: 12 })
  assert.notEqual(below.band, 'sub-floor', 'PF-3s hard floor was measured unimplementable at 0.60 precision')
  assert.equal(below.components.skus, 0)
})

test('location_count feeds the band, and ≥20 never reaches this module', () => {
  const one = sizeScore(rec({ location_count: 1 }), {})
  const twelve = sizeScore(rec({ location_count: 12 }), {})
  assert.equal(one.components.locations, 0)
  assert.equal(twelve.components.locations, 30)
  // §3.3 routes ≥20 to `above-ceiling` before S4 sees it; if one leaks through
  // it must not out-score a genuine mid-size firm.
  assert.equal(sizeScore(rec({ location_count: 25 }), {}).components.locations, 0)
})

test('brand_count from the line-card pass beats the locator brand list', () => {
  const r = rec({ brand_authorized: ['Timken'] })
  assert.equal(sizeScore(r, {}).brand_count, 1)
  assert.equal(sizeScore(r, { brand_count: 14 }).components.brands, 12)
})

test('brand_authorized counts correctly as an array AND as a CSV string', () => {
  // The `split()` bug S4 found: `String(['a','b'])` is `'a,b'`, which splits on
  // `|` to ONE element, so every multi-brand record counted as one brand and the
  // first run reported `brand_authorized ≥2 = 0 companies`.
  assert.equal(sizeScore(rec({ brand_authorized: ['Timken', 'Parker', 'SKF'] }), {}).brand_count, 3)
  // A record read back from a CSV is a plain object with a `|`-joined string —
  // it never goes through `makeRecord`, whose `list()` would wrap it whole.
  const fromCsvShape = { ...rec(), brand_authorized: 'Timken|Parker|SKF' }
  assert.equal(sizeScore(fromCsvShape, {}).brand_count, 3)
})

// ─────────────────────────────────────────────────────────────────────────────
// The `??`/`||`-on-zero bug class (§5j, §5f re-rank) — closed at the source
// ─────────────────────────────────────────────────────────────────────────────

test('a line-card fetch that returns 0 never overwrites a real locator count', () => {
  // `campbellsalesandservice.com` was ranked 5th on SIXTEEN brands and shipped
  // with `brand_count=0`, because `e?.brand_count ?? s.brand_count` falls
  // through only on null. The precedence lives here and it is `> 0`, not `??`.
  const r = rec({ brand_authorized: ['Festo', 'SKF', 'Timken', 'Baldor', 'Dodge'] })
  assert.equal(sizeScore(r, { brand_count: 0 }).brand_count, 5, 'a measured zero is not more evidence than five brands')
  assert.equal(sizeScore(r, { brand_count: 14 }).brand_count, 14)
})

test('a genuine zero is exported as 0, not collapsed to null by `||`', () => {
  // `brandCount || null` made "no source named a brand" indistinguishable from
  // "we never looked" — the same falsy-zero mistake in the other direction.
  assert.equal(sizeScore(rec({ brand_authorized: [] }), {}).brand_count, 0)
  assert.notEqual(sizeScore(rec({ brand_authorized: [] }), {}).brand_count, null)
})
