// Content canaries for the two dentist docs — the offer sheet
// (/strategy/offers/dentist/, now typed data in ../dentist-offer/data.ts) and the
// outreach manual (/strategy/offers/dentist/outreach/, still markdown). Both are
// authored prose; these assert the binding rules from the 2026-07-25 design spec
// plus the 2026-07-28 offer/outreach split, reading each module as text because
// node 20 can't import .ts (same idiom as the sitemap reconcile test).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const read = (name) => readFileSync(path.join(here, name), 'utf8')

const offerSheet = read('../dentist-offer/data.ts')
const outreachManual = read('dentist-outreach-manual.ts')

// Founder decision 2026-07-28: 120-day cost-recovery guarantee, denominator is
// everything paid (install + fees), clock runs from signing. The old day-90
// "beat my monthly fee" line is retired. Canonical source for this string is
// components/sections/revenue-engine/Guarantee.tsx.
const GUARANTEE =
  "If the revenue the system brings back hasn't covered everything you've paid me — install and fees — by day 120, I work free until it has."

// brand/competitor-policy.yaml is the source of truth for this list.
const BANNED_COMPETITORS = [
  'LSEO', 'Graphite', 'Victorious', 'Animalz', 'SEOProfy',
  'Thrive Internet Marketing', 'Position Digital', 'Digital Elevator',
  'iPullRank', 'Onely', 'Directive Consulting', 'Siege Media', 'MADX Digital',
  'Straight North', 'WebFX', 'Seer Interactive', 'First Page Sage', 'Grizzle',
  'Virayo', 'NP Digital', 'Amsive', 'Single Grain', 'Ignite Visibility',
  'KlientBoost', 'SmartSites', 'Disruptive Advertising', 'Black Propeller',
  'Intero Digital', 'Titan Growth', 'JumpFly',
]

const DOCS = [
  ['offer sheet', offerSheet],
  ['outreach manual', outreachManual],
]

// --- offer sheet -----------------------------------------------------------

test('offer sheet exports typed data with its title', () => {
  assert.match(offerSheet, /export const DENTIST_OFFER: DentistOffer/)
  assert.ok(offerSheet.includes("title: 'The dentist offer'"))
})

test('offer sheet quotes the guarantee verbatim, exactly once', () => {
  assert.equal(offerSheet.split(GUARANTEE).length - 1, 1)
})

test('offer sheet states the current pricing regime', () => {
  assert.ok(offerSheet.includes('Installs start at $30,000'))
})

test('offer sheet carries the unsigned taught-layer gate', () => {
  assert.ok(offerSheet.includes('GATE:HUMAN'))
})

// --- outreach manual -------------------------------------------------------

test('outreach manual exports a non-empty doc with an H1', () => {
  assert.match(outreachManual, /export const DENTIST_OUTREACH_MANUAL_MD/)
  assert.match(outreachManual, /^# Dentist outreach manual$/m)
})

test('partner-voiced drafts are gated on Artur', () => {
  assert.ok(outreachManual.includes('GATE:HUMAN'))
})

// The offer sheet is typed data now, so the inert-template-literal check only
// applies to the manual, which is still one markdown template literal.
test('outreach manual: template literal stays inert — no backticks, no interpolation', () => {
  const body = outreachManual.slice(
    outreachManual.indexOf('`') + 1,
    outreachManual.lastIndexOf('`'),
  )
  assert.ok(!body.includes('`'), 'backtick inside the doc body')
  assert.ok(!body.includes('${'), 'template interpolation inside the doc body')
})

// --- both ------------------------------------------------------------------

for (const [name, doc] of DOCS) {
  test(`${name}: never names the active deal or the unnamed practice`, () => {
    assert.ok(!doc.includes('Beautiful Smiles'))
    assert.ok(!doc.includes('Plantation'))
  })

  test(`${name}: no banned competitor names`, () => {
    for (const banned of BANNED_COMPETITORS) {
      assert.ok(!doc.includes(banned), `banned competitor present: ${banned}`)
    }
  })
}
