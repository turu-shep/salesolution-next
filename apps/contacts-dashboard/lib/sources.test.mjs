import assert from 'node:assert/strict'
import test from 'node:test'

import { monthYear, newTokens, plannedTokens, provenanceLine, provenanceRows, sourceDisplayParts, sourceLabel, sourcePhrase } from './sources.mjs'

test('monthYear reads the month off an ISO date and refuses anything else', () => {
  assert.equal(monthYear('2026-08-01'), 'Aug 2026')
  assert.equal(monthYear('2026-01-31'), 'Jan 2026')
  assert.equal(monthYear('not-a-date'), null)
  assert.equal(monthYear(null), null)
})

test('provenanceLine ships the C-G4 wording for every token kind', () => {
  assert.equal(provenanceLine('enerpac', '2026-08-01'), 'Verified from the Enerpac distributor locator, Aug 2026')
  assert.equal(provenanceLine('timken', '2026-08-01'), 'Verified from the Timken authorized distributor list, Aug 2026')
  assert.equal(provenanceLine('serp', '2026-08-01'), "Verified from the company's own website, Aug 2026")
  assert.equal(provenanceLine('ptda', '2026-08-01'), 'Verified from the PTDA member directory, Aug 2026')
  assert.equal(provenanceLine('ad', '2026-08-01'), 'Verified from the AD member directory, Aug 2026')
  // dfs is included now — the licensing gate dissolved on 2026-08-07.
  assert.equal(provenanceLine('dfs', '2026-08-01'), 'Verified from the DataForSEO business listings, Aug 2026')
})

test('an unmapped token degrades to the raw token instead of being dropped', () => {
  // Dropping it would make "found in N lists" a lie. Every token renders for the
  // client (AMENDMENT 2 D5), so the raw token is the honest fallback.
  assert.equal(sourcePhrase('adaptall-export'), 'the adaptall-export source')
  assert.equal(sourceLabel('adaptall-export'), 'adaptall-export')
  assert.equal(sourceLabel('enerpac'), 'Enerpac')
  assert.equal(provenanceLine('adaptall-export', '2026-08-01'), 'Verified from the adaptall-export source, Aug 2026')
})

test('sourceDisplayParts splits the display map into name + kind, raw-token fallback', () => {
  // Derived from SOURCE_PHRASE, so the Sources page and the provenance lines
  // can never disagree about what a source is called.
  assert.deepEqual(sourceDisplayParts('enerpac'), { display: 'Enerpac', kind: 'distributor locator' })
  assert.deepEqual(sourceDisplayParts('atlascopco'), { display: 'Atlas Copco', kind: 'distributor locator' })
  assert.deepEqual(sourceDisplayParts('ad'), { display: 'AD', kind: 'member directory' })
  assert.deepEqual(sourceDisplayParts('timken'), { display: 'Timken', kind: 'authorized distributor list' })
  assert.deepEqual(sourceDisplayParts('dfs'), { display: 'DataForSEO', kind: 'business listings' })
  assert.deepEqual(sourceDisplayParts('usaspending'), { display: 'USAspending', kind: 'federal award records' })
  // serp has no brand-vs-kind split; the whole phrase is the name.
  assert.deepEqual(sourceDisplayParts('serp'), { display: "company's own website", kind: null })
  // Unmapped token: the raw token, no invented kind (same fallback rule as the chips).
  assert.deepEqual(sourceDisplayParts('adaptall-export'), { display: 'adaptall-export', kind: null })
})

test('provenanceRows zips source to url and date when the chains agree', () => {
  const out = provenanceRows(
    'timken|dfs',
    'https://a.example/x|https://b.example/y',
    '2026-08-01|2026-08-03',
  )
  assert.equal(out.missing, false)
  assert.deepEqual(out.rows.map((r) => [r.token, r.url, r.captured]), [
    ['timken', 'https://a.example/x', '2026-08-01'],
    ['dfs', 'https://b.example/y', '2026-08-03'],
  ])
  assert.equal(out.rows[0].line, 'Verified from the Timken authorized distributor list, Aug 2026')
})

test('when the chains disagree in length, every line falls back to the earliest date', () => {
  // Real data: source and captured lengths disagree on ~40% of seated rows, so
  // zipping blindly would attach the wrong date to the wrong source.
  const out = provenanceRows('timken|dfs|serp', 'https://a.example/x', '2026-08-01')
  assert.equal(out.rows.length, 3)
  assert.deepEqual(out.rows.map((r) => r.captured), ['2026-08-01', '2026-08-01', '2026-08-01'])
  assert.equal(out.rows[0].url, null)
  assert.equal(out.rows[1].url, null)
})

test('a row with no provenance is marked as the defect it is', () => {
  // Provenance is 100% filled on every current file, so a blank is a bug and
  // renders as one — never an empty row that reads as "no source".
  const out = provenanceRows(null, null, null)
  assert.equal(out.missing, true)
  assert.deepEqual(out.rows, [])
})

test('newTokens flags data arriving from a source with no folder', () => {
  assert.deepEqual(newTokens(['dfs', 'timken', 'adaptall-export'], ['dfs', 'timken', 'apollo-enrichment']), ['adaptall-export'])
  // Match on the TOKEN only: a status rename must never make the badge flicker.
  assert.deepEqual(newTokens(['dfs'], ['dfs']), [])
})

test('plannedTokens is the inverse, and it is not an error', () => {
  // A registry row with no data token is a source that has not run yet.
  assert.deepEqual(plannedTokens(['dfs'], ['dfs', 'apollo-enrichment', 'ranked-out-backlog']), ['apollo-enrichment', 'ranked-out-backlog'])
})
