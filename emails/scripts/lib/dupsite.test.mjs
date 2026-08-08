import assert from 'node:assert/strict'
import { test } from 'node:test'
import { duplicateSiteGroups, fingerprint, labelKinship, sameApexGroups } from './dupsite.mjs'

test('D0 — two rows on the same apex are one send target', () => {
  const g = sameApexGroups([
    { domain: 'wpspump.com', company: 'wholesale pump and supply' },
    { domain: 'wpspump.com', company: 'wholesale pumps & supply' },
    { domain: 'wpspump.com', company: 'wholesale pump & supply' },
    { domain: 'other.com', company: 'other' },
  ])
  assert.equal(g.length, 1)
  assert.equal(g[0].rule, 'D0')
  assert.equal(g[0].rows.length, 3)
})

test('D0 ignores rows with no domain — Segment W has nothing to collapse', () => {
  assert.equal(sameApexGroups([{ domain: null }, { domain: null }]).length, 0)
})

const e = (o) => ({
  sku_estimate: 100,
  sitemap_urls_seen: 400,
  sitemap_product_urls: 100,
  sitemap_children_total: 3,
  sitemap_kind: 'index',
  ecommerce_class: 'catalog_no_cart',
  sitemap_extrapolated: false,
  ...o,
})

test('an extrapolated estimate never fingerprints — it is a manufactured number', () => {
  // shingle.com and walkerindustrial.com both report 538,210 because both
  // sampled 8 of 39 children and both saturated the URL counting cap. Two
  // different companies, one synthetic number.
  const shingle = e({ sku_estimate: 538210, sitemap_urls_seen: 360000, sitemap_product_urls: 358807, sitemap_children_total: 39, sitemap_extrapolated: true })
  assert.equal(fingerprint(shingle), null)
})

test('a direct urlset read does fingerprint', () => {
  const bev = e({ sku_estimate: 59681, sitemap_urls_seen: 59681, sitemap_product_urls: 59681, sitemap_kind: 'urlset', sitemap_children_total: 0, ecommerce_class: 'ecom_full' })
  assert.ok(fingerprint(bev))
})

test('a measured zero is excluded for being uninformative, not for being falsy', () => {
  assert.equal(fingerprint(e({ sku_estimate: 0 })), null)
  assert.equal(fingerprint(e({ sku_estimate: null })), null)
  // …and a 1 is kept, which is what proves the exclusion is about the value 0
  // and not about `!e.sku_estimate` swallowing every small number.
  assert.ok(fingerprint(e({ sku_estimate: 1 })))
})

test('D1 — a big estimate matching on the whole fingerprint is a duplicate', () => {
  const enrich = new Map([
    ['a.com', e({ sku_estimate: 511, sitemap_product_urls: 511 })],
    ['b.com', e({ sku_estimate: 511, sitemap_product_urls: 511 })],
  ])
  const g = duplicateSiteGroups([{ domain: 'a.com' }, { domain: 'b.com' }], enrich)
  assert.equal(g.length, 1)
  assert.equal(g[0].rule, 'D1')
})

test('a small estimate alone is arithmetic, not identity', () => {
  const enrich = new Map([
    ['acme.com', e({ sku_estimate: 14, sitemap_product_urls: 14 })],
    ['zeta.com', e({ sku_estimate: 14, sitemap_product_urls: 14 })],
  ])
  assert.equal(duplicateSiteGroups([{ domain: 'acme.com' }, { domain: 'zeta.com' }], enrich).length, 0)
})

test('D2 — label kinship catches a doorway network below the magnitude floor', () => {
  const enrich = new Map([
    ['forkliftpartsmesa.com', e({ sku_estimate: 8, sitemap_product_urls: 8 })],
    ['forkliftpartsplano.com', e({ sku_estimate: 8, sitemap_product_urls: 8 })],
  ])
  const g = duplicateSiteGroups([{ domain: 'forkliftpartsmesa.com' }, { domain: 'forkliftpartsplano.com' }], enrich)
  assert.equal(g.length, 1)
  assert.equal(g[0].rule, 'D2')
})

test('D3 — a shared phone corroborates what the domain key missed', () => {
  const enrich = new Map([
    ['one.com', e({ sku_estimate: 9, sitemap_product_urls: 9 })],
    ['two.com', e({ sku_estimate: 9, sitemap_product_urls: 9 })],
  ])
  const g = duplicateSiteGroups(
    [
      { domain: 'one.com', phone_e164: '2125550000' },
      { domain: 'two.com', phone_e164: '2125550000' },
    ],
    enrich,
  )
  assert.equal(g.length, 1)
  assert.equal(g[0].rule, 'D3')
})

test('a differing fingerprint field breaks the group', () => {
  const enrich = new Map([
    ['a.com', e({ sku_estimate: 511, sitemap_urls_seen: 1975 })],
    ['b.com', e({ sku_estimate: 511, sitemap_urls_seen: 1976 })],
  ])
  assert.equal(duplicateSiteGroups([{ domain: 'a.com' }, { domain: 'b.com' }], enrich).length, 0)
})

test('labelKinship needs a real stem, not a coincidental prefix', () => {
  assert.equal(labelKinship('deltafastener.com', 'deltafasteners.com'), true)
  assert.equal(labelKinship('optagroupllc.com', 'opta-group.com'), true)
  assert.equal(labelKinship('trufast.com', 'trufastwalls.com'), true)
  // "bearing" prefixes are common in this pool and must not glue companies.
  assert.equal(labelKinship('bearingdistributors.com', 'totalmachinesolutions.com'), false)
  assert.equal(labelKinship('acme.com', 'acmeco.com'), false) // stem < 6
  assert.equal(labelKinship('same.com', 'same.net'), false) // identical labels
})
