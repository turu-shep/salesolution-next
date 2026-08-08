import { test } from 'node:test'
import assert from 'node:assert/strict'
import { brandTokens, candidateExcerpt, sourceFlags, validateApproved } from './declaration.mjs'

const T = brandTokens({ brand_authorized: 'Stauff|Stucchi' })

test('negated declarations never yield a candidate and are flagged', () => {
  const d = 'We are a Non-Authorized Stocking Distributor of industrial products.'
  assert.equal(candidateExcerpt(d, T), null)
  assert.ok(sourceFlags(d, T).includes('negated'))
})

test('a clean boast yields the noun phrase that completes "calls itself ___"', () => {
  const d = 'Founded long ago, Kerr Pump & Supply is the oldest pump distributor in Michigan. We serve everyone.'
  assert.equal(candidateExcerpt(d, T), 'the oldest pump distributor in Michigan')
})

test('candidates clamp to 14 words on a word boundary, byte-exact from the source', () => {
  const d = 'We are a full-service distributor of o-rings, seals, gaskets, hoses, fittings, adapters, clamps, sheet rubber, gasket material, tapes, lubricants and much more for everyone.'
  const c = candidateExcerpt(d, T)
  assert.ok(c && d.includes(c), 'must be a contiguous substring')
  assert.ok(c.split(/\s+/).length <= 14, c)
})

test('nav junk, phone numbers, and digits never reach a candidate', () => {
  assert.equal(candidateExcerpt('0 Skip to Content Home Products About Us CONTACT US Open Menu', T), null)
  assert.equal(candidateExcerpt('Call us! We are the best hose shop at (407) 851-3536 today', T), null)
  const flags = sourceFlags('Saturday, Sunday: Closed 24 Hour Emergency Service: (407) 851-3536', T)
  assert.ok(flags.includes('hours-or-phone'))
})

test('a manufacturer brand in the phrase kills the candidate — including per-row brands', () => {
  assert.equal(candidateExcerpt('We are a factory authorized distributor for the entire line of John Crane products', T), null)
  assert.equal(candidateExcerpt('We are the largest Stauff house in the region for you', T), null)
})

test('validateApproved enforces the §1 shape rules', () => {
  const d = 'Acme is a leading distributor and fabricator of industrial hoses in the region.'
  assert.deepEqual(validateApproved('a leading distributor and fabricator of industrial hoses', d, T), [])
  assert.ok(validateApproved('a premier distributor', d, T).some((v) => v.includes('substring')))
  assert.ok(validateApproved('a leading', d, T).some((v) => v.includes('4–14')))
  const neg = validateApproved('not an authorized distributor of hoses', 'They are not an authorized distributor of hoses at all.', T)
  assert.ok(neg.includes('negated'))
})

test('sourceFlags: ALL-CAPS declarations are flagged for the reviewer', () => {
  assert.ok(sourceFlags('WE ARE THE PREMIER INDUSTRIAL HOSE DISTRIBUTOR IN THE SOUTHEAST', T).includes('all-caps'))
})
