import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { readJsonLines } from './jsonl.mjs'

const dir = mkdtempSync(join(tmpdir(), 'jsonl-'))
const write = (name, text) => {
  const p = join(dir, name)
  writeFileSync(p, text)
  return p
}

test('reads one record per line and skips the envelope', () => {
  const p = write(
    'a.json',
    ['{', '"source": "dfs_listings",', '"records": [', '{"company_display": "A"},', '{"company_display": "B"}', ']', '}'].join('\n'),
  )
  const seen = []
  const stats = readJsonLines(p, (r) => seen.push(r.company_display), { marker: '{"company_display"' })
  assert.deepEqual(seen, ['A', 'B'])
  assert.equal(stats.records, 2)
  assert.equal(stats.skipped, 5)
})

test('a trailing comma is stripped', () => {
  const p = write('b.json', '{"company_display": "A", "n": 1},\n{"company_display": "B", "n": 2}\n')
  const seen = []
  readJsonLines(p, (r) => seen.push(r.n), { marker: '{"company_display"' })
  assert.deepEqual(seen, [1, 2])
})

test('a record without the marker is skipped, not half-parsed', () => {
  // §5g: "verify partial reconciliation, not just file existence." A payload
  // that changed shape must return zero rows, loudly, not a silent half-read.
  const p = write('c.json', '{\n  "company_display": "A"\n}\n')
  const seen = []
  const stats = readJsonLines(p, (r) => seen.push(r), { marker: '{"company_display"' })
  assert.deepEqual(seen, [])
  assert.equal(stats.records, 0)
  assert.ok(stats.skipped > 0)
})

test('multi-byte characters survive a buffer boundary', () => {
  // 4 MB buffer: pad past it so a UTF-8 sequence is guaranteed to straddle one.
  const pad = 'x'.repeat(1024)
  const lines = []
  for (let i = 0; i < 6000; i++) lines.push(`{"company_display": "Nord Systemy Napędowe ${i} ${pad}"},`)
  const p = write('d.json', lines.join('\n') + '\n')
  let count = 0
  let bad = 0
  readJsonLines(
    p,
    (r) => {
      count++
      if (!r.company_display.includes('Napędowe')) bad++
    },
    { marker: '{"company_display"' },
  )
  assert.equal(count, 6000)
  assert.equal(bad, 0)
})

test('an empty file returns zero records rather than throwing', () => {
  const p = write('e.json', '')
  assert.deepEqual(readJsonLines(p, () => {}, { marker: '{"' }), { lines: 0, records: 0, skipped: 0 })
})
