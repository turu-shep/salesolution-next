import type { ClientRow, SheetParams } from '@/lib/contacts'
import { toSearchParams } from '@/lib/query.mjs'
import { provenanceRows } from '@/lib/sources.mjs'

/**
 * Every string renders through React's default escaping — the injection-prone
 * HTML API is banned app-wide (the ship greps enforce it): scraped fields are
 * untrusted and carry embedded newlines. Rows arrive here already serialized
 * (lib/rows.mjs): opaque `key`, derived `country`, whitelist fields — nothing
 * else exists on the object, so nothing else can render.
 */

/** The 14 visible headings: company + company_display collapse into one cell; country is derived server-side. */
const HEADINGS = [
  ['company_display', 'Company'],
  ['address_1', 'Address'],
  ['city', 'City'],
  ['state', 'State'],
  ['zip5', 'ZIP'],
  ['country', 'Country'],
  ['phone_e164', 'Phone'],
  ['domain', 'Website'],
  ['category_core', 'Core-category score'],
  ['brand_authorized', 'Brands authorized'],
  ['line_card', 'Line card'],
  ['source', 'Sources'],
  ['captured', 'Captured'],
  ['location_count', "Locations (company's own claim)"],
] as const

const text = (v: unknown) => (v === null || v === undefined || v === '' ? '' : String(v))

/** Columns that hold numbers: right-aligned, tabular figures (CSS .num). Display only. */
const NUM_COLUMNS = new Set(['category_core', 'location_count'])

function sortHref(params: SheetParams, column: string) {
  const sp = toSearchParams(params)
  sp.set('sort', column)
  sp.set('dir', params.sort === column && params.dir === 'asc' ? 'desc' : 'asc')
  return `/?${sp.toString()}`
}

/** aria-sort for the active sort column — styling hook for the ↑/↓ marker, state already in the URL. */
function sortState(params: SheetParams, column: string) {
  if (params.sort !== column) return undefined
  return params.dir === 'desc' ? ('descending' as const) : ('ascending' as const)
}

export function Sheet({ rows, params }: { rows: ClientRow[]; params: SheetParams }) {
  return (
    <div className="scroll">
      <table>
        <thead>
          <tr>
            <th>Provenance</th>
            {HEADINGS.map(([key, label]) => (
              <th key={key} className={NUM_COLUMNS.has(key) ? 'num' : undefined} aria-sort={sortState(params, key)}>
                {key === 'country' ? label : <a href={sortHref(params, key)}>{label}</a>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const prov = provenanceRows(row.source, row.source_url, row.captured)
            return (
              <tr key={row.key}>
                <td className="prov">
                  <details>
                    <summary>
                      {prov.missing ? (
                        <span className="chip warn">provenance missing</span>
                      ) : (
                        <>
                          {prov.rows.map((p) => <span key={p.token} className="chip">{p.label}</span>)}
                          <span className="muted"> found in {prov.rows.length} list{prov.rows.length === 1 ? '' : 's'}</span>
                        </>
                      )}
                    </summary>
                    {prov.missing ? (
                      <p className="warn">No source recorded. Provenance is 100% filled on every current file, so this is a bug.</p>
                    ) : (
                      <ul>
                        {prov.rows.map((p) => (
                          <li key={p.token}>
                            {p.line}
                            {/* href is scheme-pinned to http(s) in provenanceRows; a refused URL renders as bare text. */}
                            {p.url ? <> · {p.href ? <a href={p.href} target="_blank" rel="noopener noreferrer">{p.url}</a> : p.url}</> : null}
                            {p.captured ? <> · captured {p.captured}</> : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </details>
                </td>
                {HEADINGS.map(([key]) => (
                  <td
                    key={key}
                    className={NUM_COLUMNS.has(key) ? 'cell num' : 'cell'}
                    title={text(row[key]) || undefined}
                  >
                    {key === 'domain' && row.domain
                      ? <a href={`https://${String(row.domain)}`} target="_blank" rel="noopener noreferrer">{String(row.domain)}</a>
                      : text(row[key])}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
      {rows.length === 0 ? <p className="empty">No rows match this filter.</p> : null}
    </div>
  )
}
