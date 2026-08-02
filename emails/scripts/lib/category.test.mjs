import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CONTAM_CODES, CORE_CODES, FLOOR, MARGIN, categoryCodes, classifyCategories } from './category.mjs'
import { makeRecord } from './contract.mjs'

const rec = (codes, extra = {}) =>
  makeRecord({
    company: 'x',
    source: 'dfs',
    source_url: 'https://example.com',
    captured: '2026-08-01',
    line_card: codes.map((c) => `DFS:${c}`),
    ...extra,
  })

test('categoryCodes reads only DFS-prefixed line-card entries', () => {
  const r = rec(['bearing_supplier'], { line_card: ['DFS:bearing_supplier', 'AD:BPT', 'PTDA:Bearings'] })
  assert.deepEqual(categoryCodes(r), ['bearing_supplier'])
})

test('categoryCodes survives the CSV round trip (pipe-joined string)', () => {
  const r = { line_card: 'DFS:bearing_supplier|DFS:pump_supplier|AD:BPT' }
  assert.deepEqual(categoryCodes(r), ['bearing_supplier', 'pump_supplier'])
})

test('categoryCodes dedupes — a merged record can carry the same code twice', () => {
  const r = rec(['pump_supplier', 'pump_supplier', 'hose_supplier'])
  assert.deepEqual(categoryCodes(r), ['pump_supplier', 'hose_supplier'])
})

test('the axis is SILENT, not neutral, when a record carries no DFS codes', () => {
  // The distinction is load-bearing: `mergeVerdicts` must be able to tell
  // "no opinion" from "opinion: keep", or S3c stops reproducing v4.
  assert.equal(classifyCategories(rec([], { line_card: ['AD:BPT'] })), null)
  assert.equal(classifyCategories({ line_card: [] }), null)
})

test('§5f: a single core code is discounted by half — it is a query artifact', () => {
  const one = classifyCategories(rec(['bearing_supplier']))
  assert.equal(one.coreRaw, 3)
  assert.equal(one.core, 1.5)
  const two = classifyCategories(rec(['bearing_supplier', 'hose_supplier']))
  assert.equal(two.coreRaw, 6)
  assert.equal(two.core, 4.5, 'only the STRONGEST core code is discounted, not every one')
})

test('a plumber that matched on pump_supplier routes out', () => {
  // The measured case: `plumber|bathroom_remodeler|drainage_service|pump_supplier`
  const v = classifyCategories(rec(['pump_supplier', 'plumber', 'bathroom_remodeler', 'drainage_service']))
  assert.equal(v.decisive, true)
  assert.equal(v.top, 'propane_hvac')
  assert.equal(v.vertical, 'other-trade')
})

test('a garage-door service that matched on spring_supplier routes out at MARGIN 2', () => {
  const v = classifyCategories(rec(['spring_supplier', 'garage_door_supplier', 'door_supplier', 'repair_service']))
  assert.equal(v.core, 1.5 + 1, 'spring_supplier discounted, repair_service worth 1')
  assert.equal(v.topScore, 6)
  assert.equal(v.decisive, true, 'this is exactly the case MARGIN 4 was missing')
  assert.equal(v.vertical, 'other-trade')
})

test('a real bearings house with three corroborating codes is kept', () => {
  const v = classifyCategories(rec(['bearing_supplier', 'hydraulic_equipment_supplier', 'industrial_equipment_supplier']))
  assert.equal(v.decisive, false)
  assert.equal(v.vertical, null)
  assert.equal(v.uncertain, false)
  // 3 + 3 + 2 = 8 raw, less half of the strongest (3 × 0.5) = 6.5
  assert.equal(v.core, 6.5)
})

test('an industrial distributor that also carries ONE contamination code is kept', () => {
  const v = classifyCategories(rec(['bearing_supplier', 'hose_supplier', 'building_materials_supplier']))
  assert.equal(v.topScore, 3, 'below FLOOR, so it cannot reject on its own')
  assert.ok(v.topScore < FLOOR)
  assert.equal(v.decisive, false)
})

test('uncertain means AMBIGUOUS, not thin — thin evidence is a ranking input', () => {
  // Thin: one core code, no contamination at all. Not ambiguous.
  const thin = classifyCategories(rec(['welding_supply_store']))
  assert.equal(thin.core, 1.5)
  assert.equal(thin.uncertain, false, 'flagging this would mark 84% of the pool uncertain')
  // Ambiguous: a cluster cleared FLOOR and lost on MARGIN alone.
  const contested = classifyCategories(
    rec(['bearing_supplier', 'hose_supplier', 'hydraulic_equipment_supplier', 'lumber_store', 'roofing_supply_store']),
  )
  assert.ok(contested.topScore >= FLOOR)
  assert.equal(contested.decisive, false)
  assert.equal(contested.uncertain, true)
})

test('auto and truck codes route to auto-parts, not adjacent-trade', () => {
  const v = classifyCategories(rec(['spring_supplier', 'truck_parts_supplier', 'auto_parts_store']))
  assert.equal(v.top, 'auto_truck')
  assert.equal(v.vertical, 'auto-parts')
})

test('an unlisted code is evidence in neither direction', () => {
  const v = classifyCategories(rec(['bearing_supplier', 'some_code_google_invented_last_tuesday']))
  assert.deepEqual(v.coreCodes, ['bearing_supplier'])
  assert.deepEqual(v.clusters, {})
})

test('MARGIN and FLOOR are the documented values', () => {
  assert.equal(FLOOR, 5)
  assert.equal(MARGIN, 2)
})

test('no code is both core and contamination', () => {
  const both = Object.keys(CORE_CODES).filter((c) => c in CONTAM_CODES)
  assert.deepEqual(both, [], 'a code scoring for both sides would cancel itself')
})

test('evidence names the winning cluster and the score it beat', () => {
  const v = classifyCategories(rec(['pump_supplier', 'plumber', 'well_drilling_contractor']))
  assert.match(v.evidence, /propane_hvac=6 vs core=1\.5/)
  assert.match(v.evidence, /plumber/)
})
