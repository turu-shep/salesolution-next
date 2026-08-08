/**
 * jsonl — read a large raw payload one record at a time, synchronously.
 *
 * `dfs-listings-2026-08-01.json` is **240 MB**. The acquirer writes it as a
 * pretty envelope with one record per physical line, which is a gift:
 * `JSON.parse` on the whole file needs the 240 MB string plus a full object
 * graph — several gigabytes once `people_also_search`, `attributes` and
 * `rating_distribution` are materialized for 45,554 listings — and the S2
 * pipeline is synchronous, so a `readline` stream cannot be dropped in without
 * making every caller async.
 *
 * This reads the file through a fixed 4 MB buffer and hands each record to a
 * callback, so peak memory is the buffer plus whatever the caller keeps. The
 * mapper keeps ~20 projected fields per record and discards the rest.
 *
 * **Not a general JSONL parser.** It requires exactly the shape the acquirers
 * emit: one complete JSON object per line, nothing wrapped across lines. A line
 * that does not start with the caller's marker is skipped (the envelope's own
 * keys, the closing brackets), and a trailing comma is stripped. If an acquirer
 * ever pretty-prints its records, this returns zero rows rather than silently
 * half-parsing — which is the failure §5g asks for: *"verify partial
 * reconciliation, not just file existence."*
 *
 * Tests: emails/scripts/lib/jsonl.test.mjs
 */
import { closeSync, openSync, readSync } from 'node:fs'
import { StringDecoder } from 'node:string_decoder'

const BUFFER_BYTES = 4 * 1024 * 1024

/**
 * @param {string} path
 * @param {(record: any) => void} onRecord
 * @param {{marker?: string}} [opts]  a line must start with this to be parsed
 * @returns {{lines: number, records: number, skipped: number}}
 */
export function readJsonLines(path, onRecord, opts = {}) {
  const { marker = '{"' } = opts
  const fd = openSync(path, 'r')
  const buf = Buffer.alloc(BUFFER_BYTES)
  // A multi-byte character can straddle a 4 MB read boundary. `StringDecoder`
  // holds the partial bytes back until the next chunk completes them; naive
  // `buf.toString('utf8')` would emit U+FFFD and corrupt a company name.
  const decoder = new StringDecoder('utf8')
  let tail = ''
  let lines = 0
  let records = 0
  let skipped = 0

  const handle = (line) => {
    lines++
    const t = line.trim()
    if (!t.startsWith(marker)) {
      skipped++
      return
    }
    onRecord(JSON.parse(t.endsWith(',') ? t.slice(0, -1) : t))
    records++
  }

  try {
    for (;;) {
      const n = readSync(fd, buf, 0, BUFFER_BYTES, null)
      if (n === 0) break
      const chunk = tail + decoder.write(buf.subarray(0, n))
      const parts = chunk.split('\n')
      tail = parts.pop() ?? ''
      for (const line of parts) handle(line)
    }
    tail += decoder.end()
    if (tail.trim()) handle(tail)
  } finally {
    closeSync(fd)
  }

  return { lines, records, skipped }
}
