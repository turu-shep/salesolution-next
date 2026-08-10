/**
 * csv — the export writer (AMENDMENT 2 D1–D4).
 *
 * RFC 4180 quoting, because company names carry commas ("Hirsch Pipe & Supply
 * Co., Inc.") and scraped declarations carry newlines. A naive writer corrupts
 * every row that has one.
 *
 * The columns are the sheet's client fields, derived from the same serializer
 * the page renders through (toClientRow) — never a second column list, so the
 * file and the screen cannot disagree. The order that matters — count → cap →
 * audit → stream — lives here as runExport() with the IO injected, so the
 * contract "an audit row exists before a single CSV byte" is provable offline.
 */
import { ALLOWED_VIEWS, isSheetColumn } from './columns.mjs'
import { toClientRow } from './rows.mjs'

/** Beyond this the export refuses. It never truncates — a short CSV looks complete. */
export const EXPORT_CAP = 10000

export const OVER_CAP_MESSAGE = "That's more than 10,000 locations. Narrow the filter and try again."

/** Rows pulled per round trip while streaming. */
export const EXPORT_BATCH = 1000

export function csvCell(v) {
  if (v === undefined || v === null) return ''
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function csvLine(values) {
  return `${values.map(csvCell).join(',')}\n`
}

/**
 * The CSV header: the client row's own field names, minus `key` — the opaque
 * key is a React key, not data. Derived from toClientRow, so no argument (and
 * no future drift) can widen the export past what the sheet serves: `country`
 * rides along because the sheet shows it; nothing else exists to include.
 */
export function exportColumns() {
  return Object.keys(toClientRow({})).filter((c) => c !== 'key')
}

export function exportFilename(view, isoDate) {
  return `${view || 'contacts'}-locations-${isoDate}.csv`
}

/**
 * Raw-param admissibility (D1/D3). The SHEET falls back on a bad sort or view
 * so a stale URL still renders; the EXPORT refuses — a request naming a column
 * or lens that does not exist is a bug or someone probing, and both deserve a
 * log line. Inspects the RAW values because parseSheetParams' fallback would
 * swallow the evidence. An empty value names nothing and reads as missing.
 */
export function exportRefusal(searchParams) {
  const sort = searchParams.get('sort')
  if (sort && !isSheetColumn(sort)) {
    return { status: 400, error: `Unknown column "${sort}".`, log: `rejected unknown column "${sort}"` }
  }
  const view = searchParams.get('view')
  if (view && !ALLOWED_VIEWS.includes(view)) {
    return { status: 400, error: `Unknown view "${view}".`, log: `rejected unknown view "${view}"` }
  }
  return null
}

/**
 * The filter as audited (D2): exactly the fields that decide set membership —
 * the Task 13 trio (brands/sizes/btype) included, or an export filtered to
 * `brands=Timken&btype=distributor` would write an audit row indistinguishable
 * from an unfiltered pull. Sort and dir order the set, page windows it, and
 * view is audited as its own export_audit column — none of them belongs in
 * the filter JSON.
 */
export function exportFilter(params) {
  const { sources, states, brands, sizes, btype, country, catMin, catMax, q } = params
  return { sources, states, brands, sizes, btype, country, catMin, catMax, q }
}

/**
 * The export, ordered: count → cap → audit → lines (D2/D4). IO arrives as
 * arguments so the ordering is provable offline; the route wires the real
 * countMatching / logExport / fetchPage.
 *
 * Over the cap answers 413 before logExport runs — an over-cap request is not
 * an export, so it writes no audit row. A logExport failure rejects, and the
 * caller answers 500: an export that cannot be audited must not exist. Only
 * after the audit row is written does the line generator exist to consume,
 * and it pulls whitelist client rows through the sheet's own fetchPage.
 */
export async function runExport(params, { account, countMatching, logExport, fetchPage }) {
  const total = await countMatching(params)
  if (total > EXPORT_CAP) return { status: 413, error: OVER_CAP_MESSAGE, rows: total }

  await logExport(account, params.view, exportFilter(params), total)

  async function* lines() {
    const columns = exportColumns()
    yield csvLine(columns)
    // Advance by what actually came back, not by EXPORT_BATCH: PostgREST's
    // Max Rows clamp can shorten a page below the asked-for window, and a
    // constant stride would jump the gap and silently drop rows from the file.
    let offset = 0
    while (offset < total) {
      const rows = await fetchPage(params, offset, Math.min(EXPORT_BATCH, total - offset))
      if (!rows.length) break
      for (const row of rows) yield csvLine(columns.map((c) => row[c]))
      offset += rows.length
    }
  }
  return { status: 200, rows: total, lines: lines() }
}
