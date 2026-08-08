import assert from 'node:assert/strict'
import { test } from 'node:test'
import { makeRecord } from './contract.mjs'
import { AD_MEMBER, BRAND_BANDS, componentsToString, ecomClass, rankScore } from './rank.mjs'

/**
 * S4's own columns (`category_core`, `category_contam`, …) are assigned onto the
 * record AFTER `makeRecord`, which only knows the S1–S3 contract. The helper
 * mirrors that so the tests exercise the shape the ranker actually receives.
 */
const S4_ONLY = new Set(['category_core', 'category_contam', 'size_band', 'size_score', 'rank_score'])
const rec = (extra = {}) => {
  const base = {}
  const s4 = {}
  for (const [k, v] of Object.entries(extra)) (S4_ONLY.has(k) ? s4 : base)[k] = v
  return Object.assign(
    makeRecord({
      company: 'x',
      company_display: 'X Industrial Supply',
      domain: 'example.com',
      source: 'dfs',
      source_url: 'https://example.com',
      captured: '2026-08-01',
      ...base,
    }),
    s4,
  )
}
const at = (record, band = '10-50M', enrich = null) => rankScore(record, { size: { band }, enrich })

test('the 226-domain cohort outranks plain catalog_no_cart', () => {
  assert.equal(ecomClass({ ecommerce_class: 'catalog_no_cart', quote_signals: ['rfq'], cart_signals: [] }), 'catalog_rfq_no_cart')
  assert.equal(ecomClass({ ecommerce_class: 'catalog_no_cart', quote_signals: [], cart_signals: [] }), 'catalog_no_cart')
  assert.equal(ecomClass({ ecommerce_class: 'catalog_no_cart', quote_signals: ['rfq'], cart_signals: ['cart'] }), 'catalog_no_cart')
  assert.equal(ecomClass(null), 'unknown')
})

test('a fully transactional site is PENALIZED — it does not have the problem', () => {
  const full = at(rec(), '10-50M', { ecommerce_class: 'ecom_full' })
  const none = at(rec(), '10-50M', null)
  assert.ok(full.components.ecommerce < 0)
  assert.ok(full.score < none.score, '§5d: ranking on breadth surfaced the dealers who need nothing')
})

test('brand breadth is NOT monotonic — it peaks at 6–10 and turns negative above 40', () => {
  const scoreAt = (n) => at(rec(), '10-50M', { brand_count: n }).components.brands
  assert.equal(scoreAt(8), 16)
  assert.ok(scoreAt(8) > scoreAt(4))
  assert.ok(scoreAt(8) > scoreAt(15))
  assert.ok(scoreAt(15) > scoreAt(30))
  assert.ok(scoreAt(50) < 0)
  assert.ok(scoreAt(80) < scoreAt(50), '50% of 65+-brand dealers are already fully transactional')
})

test('BRAND_BANDS is ordered descending, or `step` reads the wrong row', () => {
  for (let i = 1; i < BRAND_BANDS.length; i++) assert.ok(BRAND_BANDS[i][0] < BRAND_BANDS[i - 1][0])
})

test('AD membership scores as a token of the source chain, never a substring', () => {
  const member = at(rec({ source: 'timken|ad' }))
  const not = at(rec())
  const lookalike = at(rec({ source: 'adaptall' }))
  assert.equal(member.components.ad_member, AD_MEMBER)
  assert.equal(not.components.ad_member, 0)
  assert.equal(lookalike.components.ad_member, 0, '`adaptall` must not read as AD membership')
  assert.equal(member.score - not.score, AD_MEMBER)
})

test('a page-verbatim declaration beats a Google-truncated snippet', () => {
  const verbatim = at(rec({ self_declaration: 'We are an authorized Parker distributor.', self_declaration_verbatim: true }))
  const snippet = at(rec({ self_declaration: 'We are an authorized Parker distributor.', self_declaration_verbatim: false }))
  const none = at(rec())
  assert.ok(verbatim.components.declaration > snippet.components.declaration)
  assert.ok(snippet.components.declaration > none.components.declaration)
})

test('thin category evidence sorts low without being called ambiguous', () => {
  const thin = at(rec({ category_core: 1.5 }))
  const strong = at(rec({ category_core: 8 }))
  assert.equal(thin.components.category, 0)
  assert.equal(strong.components.category, 10)
  assert.ok(strong.score > thin.score)
})

test('a contested category (cluster cleared FLOOR, lost on MARGIN) is penalized', () => {
  const contested = at(rec({ category_core: 6, category_contam: 'construction=7' }))
  const clean = at(rec({ category_core: 6, category_contam: null }))
  assert.ok(contested.components.contested < 0)
  assert.ok(contested.score < clean.score)
})

test('an unresolved identity and an uncertain ICP both cost', () => {
  const base = at(rec())
  assert.ok(at(rec({ needs_identity_resolution: true })).score < base.score)
  assert.ok(at(rec({ icp_uncertain: true })).score < base.score)
})

test('sub-floor size is the largest single penalty', () => {
  assert.ok(at(rec(), 'sub-floor').components.size < 0)
  assert.ok(at(rec(), '10-50M').components.size > at(rec(), 'above-band').components.size, "§4.5's T1 is the 10–50M band, not the biggest firms")
})

test('the score is clamped to 0–100 and nothing goes negative', () => {
  const worst = rankScore(
    rec({ company_display: null, domain: null, needs_identity_resolution: true, icp_uncertain: true, category_contam: 'construction=9' }),
    { size: { band: 'sub-floor' }, enrich: { ecommerce_class: 'ecom_full' } },
  )
  assert.equal(worst.score, 0)
  assert.ok(worst.score >= 0 && worst.score <= 100)
})

test('booleans read correctly off a CSV round trip', () => {
  // Everything downstream of `deduped-v5.csv` reads strings.
  assert.equal(at(rec({ needs_identity_resolution: 'true' })).components.identity, -10)
  assert.equal(at(rec({ self_declaration: 'x', self_declaration_url: 'https://x.test', self_declaration_verbatim: 'true' })).components.declaration, 12)
})

test('componentsToString drops zeros and sorts, so the column is diffable', () => {
  const s = componentsToString({ nap: 10, brands: 0, size: 20, ecommerce: 26 })
  assert.equal(s, 'ecommerce=26;nap=10;size=20')
})
