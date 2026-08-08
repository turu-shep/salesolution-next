import assert from 'node:assert/strict'
import test from 'node:test'

import { LOCATION_COLUMNS } from './columns.mjs'
import {
  EXPORT_BATCH,
  EXPORT_CAP,
  OVER_CAP_MESSAGE,
  csvCell,
  csvLine,
  exportColumns,
  exportFilename,
  exportFilter,
  exportRefusal,
  runExport,
} from './csv.mjs'
import { parseSheetParams } from './query.mjs'

// ── the writer ──────────────────────────────────────────────────────────────

test('csvCell quotes anything that would corrupt a row', () => {
  // Company names carry commas routinely, and scraped declarations carry newlines.
  assert.equal(csvCell('Hirsch Pipe & Supply Co., Inc.'), '"Hirsch Pipe & Supply Co., Inc."')
  assert.equal(csvCell('say "hi"'), '"say ""hi"""')
  assert.equal(csvCell('two\nlines'), '"two\nlines"')
  assert.equal(csvCell('plain'), 'plain')
  assert.equal(csvCell(null), '')
  assert.equal(csvCell(undefined), '')
  assert.equal(csvCell(0), '0') // a real zero survives; only null/undefined blank out
  assert.equal(csvCell(false), 'false')
  assert.equal(csvCell({ a: 1 }), '"{""a"":1}"')
})

test('csvLine joins and terminates', () => {
  assert.equal(csvLine(['a', 'b,c', null]), 'a,"b,c",\n')
})

// ── the columns (D1): the whitelist, always, via the same serializer ────────

test('exportColumns is the client row minus the React key — pinned exactly', () => {
  assert.deepEqual(exportColumns(), [
    'country',
    'company', 'company_display', 'address_1', 'city', 'state', 'zip5',
    'phone_e164', 'domain', 'category_core', 'brand_authorized', 'line_card',
    'source', 'source_url', 'captured', 'location_count',
  ])
  // Derived from toClientRow — the sheet's own serializer — never a second list…
  assert.deepEqual(exportColumns(), ['country', ...LOCATION_COLUMNS])
  // …and no argument reaches a wider set, because there is no wider set.
  assert.deepEqual(exportColumns(true), exportColumns())
  for (const gone of ['key', 'id', 'pool', 'list_generation', 'email', 'tier']) {
    assert.equal(exportColumns().includes(gone), false, `${gone} must never be a CSV column`)
  }
})

test('exportFilename carries the view and the date', () => {
  assert.equal(exportFilename('field-advisor', '2026-08-08'), 'field-advisor-locations-2026-08-08.csv')
  assert.equal(exportFilename('hosebox', '2026-08-08'), 'hosebox-locations-2026-08-08.csv')
  assert.equal(exportFilename(null, '2026-08-07'), 'contacts-locations-2026-08-07.csv')
})

test('the cap is 10,000 and the refusal message never changes out from under the UI', () => {
  assert.equal(EXPORT_CAP, 10000)
  assert.equal(EXPORT_BATCH, 1000)
  assert.equal(OVER_CAP_MESSAGE, "That's more than 10,000 locations. Narrow the filter and try again.")
})

// ── raw-param admissibility (D1/D3): the sheet falls back, the export refuses ──

test('a sort outside the whitelist is a 400 at the export where the sheet falls back', () => {
  // The page's parser swallows the evidence…
  assert.equal(parseSheetParams(new URLSearchParams('sort=email')).sort, 'company')
  // …so the export inspects the RAW value, names the column, and refuses —
  // a request for a removed column is a bug or probing, both deserve a line.
  for (const bad of ['email', 'tier', 'headcount']) {
    const r = exportRefusal(new URLSearchParams(`sort=${bad}`))
    assert.equal(r.status, 400)
    assert.match(r.error, new RegExp(`"${bad}"`))
    assert.match(r.log, new RegExp(`column "${bad}"`))
  }
  assert.equal(exportRefusal(new URLSearchParams('sort=city')), null)
  assert.equal(exportRefusal(new URLSearchParams('state=IL')), null)
  assert.equal(exportRefusal(new URLSearchParams('sort=')), null) // empty names nothing — the default sort applies
})

test('a view outside the allowed lenses is a 400; missing means the default lens', () => {
  assert.equal(parseSheetParams(new URLSearchParams('view=catalog-ai')).view, 'field-advisor')
  for (const bad of ['catalog-ai', 'small-shops', 'junk']) {
    const r = exportRefusal(new URLSearchParams(`view=${bad}`))
    assert.equal(r.status, 400)
    assert.match(r.error, new RegExp(`"${bad}"`))
    assert.match(r.log, new RegExp(`view "${bad}"`))
  }
  assert.equal(exportRefusal(new URLSearchParams('view=field-advisor')), null)
  assert.equal(exportRefusal(new URLSearchParams('view=hosebox')), null)
  assert.equal(exportRefusal(new URLSearchParams('')), null)
  assert.equal(exportRefusal(new URLSearchParams('view=')), null)
  // When both are bad, one refusal answers — the sort check runs first.
  assert.match(exportRefusal(new URLSearchParams('sort=headcount&view=catalog-ai')).log, /column "headcount"/)
})

// ── the audited filter (D2) ─────────────────────────────────────────────────

test('the audited filter is the membership-deciding fields, nothing else', () => {
  const params = parseSheetParams(
    new URLSearchParams('source=timken&state=IL&state=WI&country=us&catMin=2&catMax=5&q=bearing&sort=city&dir=desc&page=3&view=hosebox'),
  )
  // sort/dir order the set, page windows it, view is audited as its own column.
  assert.deepEqual(exportFilter(params), {
    sources: ['timken'], states: ['IL', 'WI'], country: 'us', catMin: 2, catMax: 5, q: 'bearing',
  })
})

// ── runExport: count → cap → audit → stream (D2/D4) ─────────────────────────

const ACCOUNT = { id: 'a1', email: 'op@example.com', name: 'Op', role: 'member' }

const ROW_1 = {
  key: 'k1', country: 'United States',
  company: 'acme bearing', company_display: 'Acme Bearing Co., Inc.', address_1: null,
  city: 'Peoria', state: 'IL', zip5: '61601', phone_e164: null, domain: 'acme.example',
  category_core: 4.5, brand_authorized: null, line_card: null, source: 'timken',
  source_url: null, captured: null, location_count: 1,
}

const ROW_2 = {
  key: 'k2', country: 'United States',
  company: 'b co', company_display: null, address_1: null,
  city: null, state: 'WI', zip5: null, phone_e164: null, domain: null,
  category_core: 3, brand_authorized: null, line_card: null, source: 'dfs',
  source_url: null, captured: null, location_count: 2,
}

test('the audit row precedes the first CSV byte, and the file is the sheet, exactly', async () => {
  const calls = []
  const params = parseSheetParams(new URLSearchParams('state=IL'))
  const result = await runExport(params, {
    account: ACCOUNT,
    countMatching: async () => { calls.push(['count']); return 2 },
    logExport: async (account, view, filter, rowCount) => { calls.push(['audit', account.email, view, filter, rowCount]) },
    fetchPage: async (_params, offset, size) => { calls.push(['page', offset, size]); return [ROW_1, ROW_2].slice(offset, offset + size) },
  })
  // Ordering: count, then the audit — and NOT ONE page fetch until the caller
  // consumes the stream. The audit row exists before any byte can.
  assert.deepEqual(calls, [
    ['count'],
    ['audit', 'op@example.com', 'field-advisor', exportFilter(params), 2],
  ])
  assert.equal(result.status, 200)
  assert.equal(result.rows, 2)

  const lines = []
  for await (const line of result.lines) lines.push(line)
  assert.deepEqual(calls.slice(2), [['page', 0, 2]])
  assert.equal(lines.length, 3)
  assert.equal(lines[0], csvLine(exportColumns())) // header row = the client field names
  assert.equal(lines[1], 'United States,acme bearing,"Acme Bearing Co., Inc.",,Peoria,IL,61601,,acme.example,4.5,,,timken,,,1\n')
  assert.equal(lines[2], 'United States,b co,,,,WI,,,,3,,,dfs,,,2\n')
  // The opaque React key rides on every client row and lands in no CSV cell.
  assert.equal(lines.join('').includes('k1'), false)
  assert.equal(lines.join('').includes('k2'), false)
})

test('a failed audit insert fails the export before any row is fetched', async () => {
  const fetched = []
  await assert.rejects(
    runExport(parseSheetParams(new URLSearchParams('')), {
      account: ACCOUNT,
      countMatching: async () => 5,
      logExport: async () => { throw new Error('audit insert failed') },
      fetchPage: async () => { fetched.push('page'); return [] },
    }),
    /audit insert failed/,
  )
  // An unaudited export must not exist — the route answers the rejection with a 500.
  assert.deepEqual(fetched, [])
})

test('over the cap: 413, the exact message, no audit row, no rows fetched', async () => {
  const calls = []
  const params = parseSheetParams(new URLSearchParams(''))
  const deps = {
    account: ACCOUNT,
    countMatching: async () => EXPORT_CAP + 1,
    logExport: async () => { calls.push('audit') },
    fetchPage: async () => { calls.push('page'); return [] },
  }
  assert.deepEqual(await runExport(params, deps), { status: 413, error: OVER_CAP_MESSAGE, rows: EXPORT_CAP + 1 })
  assert.deepEqual(calls, []) // an over-cap request is not an export: nothing audited, nothing fetched

  // Exactly at the cap is allowed — the cap is a ceiling, not a shrink.
  deps.countMatching = async () => EXPORT_CAP
  assert.equal((await runExport(params, deps)).status, 200)
  assert.deepEqual(calls, ['audit'])
})

test('the stream pulls rows in EXPORT_BATCH windows across the whole filtered set', async () => {
  const windows = []
  const total = 2500
  const result = await runExport(parseSheetParams(new URLSearchParams('')), {
    account: ACCOUNT,
    countMatching: async () => total,
    logExport: async () => {},
    fetchPage: async (_params, offset, size) => {
      windows.push([offset, size])
      return Array.from({ length: size }, (_, i) => ({ ...ROW_2, key: `k${offset + i}` }))
    },
  })
  let lineCount = 0
  for await (const _line of result.lines) lineCount += 1
  assert.equal(lineCount, 1 + total)
  assert.deepEqual(windows, [[0, 1000], [1000, 1000], [2000, 500]])
})

test('a set that shrank between count and fetch ends the stream instead of erroring', async () => {
  const result = await runExport(parseSheetParams(new URLSearchParams('')), {
    account: ACCOUNT,
    countMatching: async () => 1500,
    logExport: async () => {},
    fetchPage: async (_params, offset) => (offset === 0 ? [ROW_1] : []), // rows deleted mid-export
  })
  const lines = []
  for await (const line of result.lines) lines.push(line)
  assert.equal(lines.length, 2) // header + the row that still exists — the stream closes clean
})

test('an empty filter result is a header-only CSV, still audited', async () => {
  const audited = []
  const result = await runExport(parseSheetParams(new URLSearchParams('q=zzz')), {
    account: ACCOUNT,
    countMatching: async () => 0,
    logExport: async (_account, _view, _filter, rowCount) => { audited.push(rowCount) },
    fetchPage: async () => { throw new Error('nothing to fetch') },
  })
  const lines = []
  for await (const line of result.lines) lines.push(line)
  assert.deepEqual(lines, [csvLine(exportColumns())])
  assert.deepEqual(audited, [0]) // a zero-row export is still an export somebody ran
})
