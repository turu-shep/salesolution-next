/**
 * PF-7 regression tests — RFC 4180 CSV.
 *   node --test scripts/lib/
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { parseCsv, parseCsvRows, csvEscape, toCsv } from './csv.mjs'

test('PF-7: a quoted comma inside a company name round-trips', () => {
  const csv =
    'name,city,state,phone\r\n' +
    '"Smith, Jones & Co",Akron,OH,3304383000\r\n' +
    'Timken Supply,Canton,OH,3304714000\r\n'

  const rows = parseCsv(csv)

  assert.equal(rows.length, 2)
  // The whole point: the comma stays inside the field and nothing shifts right.
  assert.equal(rows[0].name, 'Smith, Jones & Co')
  assert.equal(rows[0].city, 'Akron')
  assert.equal(rows[0].state, 'OH')
  assert.equal(rows[0].phone, '3304383000')
  assert.equal(rows[1].name, 'Timken Supply')

  // ...and it survives a write/read cycle unchanged.
  const reparsed = parseCsv(toCsv(rows, ['name', 'city', 'state', 'phone']))
  assert.deepEqual(reparsed, rows)
})

test('PF-7: the old split(",") behaviour is what we are fixing', () => {
  const line = '"Smith, Jones & Co",Akron,OH,3304383000'
  const naive = line.split(',')
  assert.equal(naive.length, 5) // 5 cells for a 4-column row — the corruption
  assert.equal(parseCsvRows(line)[0].length, 4)
})

test('escaped double-quotes decode to a single quote', () => {
  const rows = parseCsv('name,note\r\n"Bob ""The Bearing"" Miller Inc",ok\r\n')
  assert.equal(rows[0].name, 'Bob "The Bearing" Miller Inc')
  assert.equal(rows[0].note, 'ok')
})

test('a newline inside a quoted field stays inside the field', () => {
  const rows = parseCsv('company,address\r\n"Acme Fluid Power","1 Main St\r\nSuite 200"\r\n')
  assert.equal(rows.length, 1)
  assert.equal(rows[0].address, '1 Main St\r\nSuite 200')
})

test('unquoted fields are trimmed, quoted fields are verbatim', () => {
  const rows = parseCsvRows('  a  ,"  b  "')
  assert.deepEqual(rows[0], ['a', '  b  '])
})

test('LF-only files, blank lines and short rows are handled', () => {
  const rows = parseCsv('name,city,state\nAcme,Akron,OH\n\nBeta,Canton\n')
  assert.equal(rows.length, 2)
  assert.equal(rows[1].name, 'Beta')
  assert.equal(rows[1].state, '') // missing trailing cell, not undefined
})

test('empty input and header-only input yield no rows', () => {
  assert.deepEqual(parseCsv(''), [])
  assert.deepEqual(parseCsv('name,city\r\n'), [])
})

test('a leading BOM is stripped from the first header', () => {
  const rows = parseCsv('﻿name,city\r\nAcme,Akron\r\n')
  assert.deepEqual(Object.keys(rows[0]), ['name', 'city'])
})

test('csvEscape quotes only what needs quoting', () => {
  assert.equal(csvEscape('plain'), 'plain')
  assert.equal(csvEscape('a,b'), '"a,b"')
  assert.equal(csvEscape('say "hi"'), '"say ""hi"""')
  assert.equal(csvEscape(' padded '), '" padded "')
  assert.equal(csvEscape(null), '')
  assert.equal(csvEscape(['Timken', 'Enerpac']), 'Timken|Enerpac')
})

test('toCsv writes RFC 4180 CRLF rows and a header', () => {
  const out = toCsv([{ a: 1, b: 'x,y' }], ['a', 'b'])
  assert.equal(out, 'a,b\r\n1,"x,y"\r\n')
})
