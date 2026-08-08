/**
 * csv — RFC 4180 CSV reader/writer (PF-7).
 *
 * The old inline parser in precall-scan.mjs was `line.split(',')`, which shifts
 * every column right of a comma inside a field. Company names are full of them
 * ("Smith, Jones & Co", "Bearings, Belts and Chain Inc"), so it silently
 * corrupted rows — name truncated, phone landing in the city column, and no
 * error anywhere. This is the shared, tested replacement.
 *
 * RFC 4180 as implemented here:
 *   - fields separated by `,`, records by CRLF or LF (both accepted on read)
 *   - a field may be wrapped in double quotes
 *   - a quoted field may contain `,`, CR, LF and `""` (an escaped `"`)
 *   - unquoted fields are trimmed; quoted fields are returned verbatim, so
 *     leading/trailing spaces survive when the writer meant them to
 *   - a leading UTF-8 BOM is stripped
 *
 * Used by: scripts/precall-scan.mjs, emails/scripts/* (prospect-list pipeline).
 */

/**
 * Parse CSV text into an array of string arrays (header row included).
 * @param {string} text
 * @returns {string[][]}
 */
export function parseCsvRows(text) {
  let src = String(text ?? '')
  if (src.charCodeAt(0) === 0xfeff) src = src.slice(1) // BOM

  /** @type {string[][]} */
  const rows = []
  /** @type {string[]} */
  let row = []
  let field = ''
  let inQuotes = false
  let fieldWasQuoted = false

  const endField = () => {
    row.push(fieldWasQuoted ? field : field.trim())
    field = ''
    fieldWasQuoted = false
  }
  const endRow = () => {
    endField()
    rows.push(row)
    row = []
  }

  for (let i = 0; i < src.length; i++) {
    const c = src[i]

    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"' // escaped double-quote
          i++
        } else {
          inQuotes = false // closing quote
        }
      } else {
        field += c
      }
      continue
    }

    if (c === '"' && field.trim() === '') {
      // Opening quote. Whitespace before it is discarded, per common practice.
      inQuotes = true
      fieldWasQuoted = true
      field = ''
      continue
    }
    if (c === ',') {
      endField()
      continue
    }
    if (c === '\r') {
      if (src[i + 1] === '\n') i++
      endRow()
      continue
    }
    if (c === '\n') {
      endRow()
      continue
    }
    field += c
  }

  // Trailing record (no final newline). A file that ends with a newline leaves
  // nothing buffered, so nothing is pushed.
  if (field !== '' || fieldWasQuoted || row.length > 0) endRow()

  return rows
}

/**
 * Parse CSV text into row objects keyed by the header row.
 * Blank lines are skipped. Missing trailing cells become ''.
 *
 * @param {string} text
 * @param {{ lowercaseHeaders?: boolean }} [opts]
 * @returns {Record<string, string>[]}
 */
export function parseCsv(text, opts = {}) {
  const { lowercaseHeaders = true } = opts
  const rows = parseCsvRows(text)
  if (rows.length === 0) return []

  const headers = rows[0].map((h) => {
    const t = h.trim()
    return lowercaseHeaders ? t.toLowerCase() : t
  })

  const out = []
  for (const cells of rows.slice(1)) {
    if (cells.every((c) => c === '')) continue // blank line
    /** @type {Record<string, string>} */
    const obj = {}
    headers.forEach((h, i) => {
      obj[h] = cells[i] ?? ''
    })
    out.push(obj)
  }
  return out
}

/**
 * Quote a single value for CSV output if it needs it.
 * @param {unknown} value
 * @returns {string}
 */
export function csvEscape(value) {
  if (value === null || value === undefined) return ''
  const s = Array.isArray(value) ? value.join('|') : String(value)
  return /[",\r\n]/.test(s) || s !== s.trim() ? `"${s.replace(/"/g, '""')}"` : s
}

/**
 * Serialize row objects to RFC 4180 CSV (CRLF line endings).
 * @param {Record<string, unknown>[]} rows
 * @param {string[]} [headers] column order; defaults to the union of all keys
 * @returns {string}
 */
export function toCsv(rows, headers) {
  const cols = headers ?? [...new Set(rows.flatMap((r) => Object.keys(r)))]
  const lines = [cols.map(csvEscape).join(',')]
  for (const r of rows) lines.push(cols.map((c) => csvEscape(r[c])).join(','))
  return lines.join('\r\n') + '\r\n'
}
