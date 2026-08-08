/**
 * columns — one place that says what the sheet selects.
 *
 * LOCATION_COLUMNS is the DEFAULT VIEW, not a whitelist and not a ceiling. The
 * audience is the founder looking at his own asset, so nothing is withheld: the
 * show-all toggle reaches every typed column plus the `raw` JSONB. The default
 * is simply the set that answers "where is this location and how do we know,"
 * which is what makes the sheet readable.
 *
 * Four names a brief would reach for do not exist in the data, and the
 * corrections are load-bearing: `zip5` not `zip`, `phone_e164` not `phone`,
 * `domain` not `website`, and there is no `category_display` at all. Country is
 * derived from pool membership — see countryOf() in query.mjs.
 */

/** The 15 identifiers the sheet opens on. They render as 14 columns: company + company_display are one cell. */
export const LOCATION_COLUMNS = [
  'company',
  'company_display',
  'address_1',
  'city',
  'state',
  'zip5',
  'phone_e164',
  'domain',
  'category_core',
  'brand_authorized',
  'line_card',
  'source',
  'source_url',
  'captured',
  'location_count',
]

/** `id` is the React key; `pool` is what the country filter is derived from. Always selected. */
export const ALWAYS_SELECTED = ['id', 'pool']

/** Every typed column in `contacts`. The schema guard rejects anything absent from this list. */
export const TYPED_COLUMNS = [
  'id', 'list_generation', 'pool',
  'company', 'company_display', 'domain',
  'address_1', 'city', 'state', 'zip5', 'phone_e164',
  'category_core', 'brand_authorized', 'line_card',
  'source', 'source_url', 'captured', 'captured_date', 'location_count',
  'segment', 'tier', 'cohort', 'icp_class', 'size_band', 'rank_score',
  'disposition', 'source_tokens', 'email', 'email_state', 'has_person',
]

/** Mirrors the local dashboard's `paginate` cap. The browser never receives the full set. */
export const DEFAULT_PAGE_SIZE = 500

/** `raw` is the whole CSV row per record. 500 of those is megabytes, so show-all pages are smaller. */
export const SHOW_ALL_PAGE_SIZE = 100

/** A real column, or not. Rejects a bad `sort` before it reaches PostgREST. */
export function isRealColumn(name) {
  return TYPED_COLUMNS.includes(String(name))
}

/**
 * The `select()` string. One builder feeds both the page and the export, so the
 * two can never disagree about what a row contains.
 */
export function selectList(showAll) {
  return showAll ? '*' : [...ALWAYS_SELECTED, ...LOCATION_COLUMNS].join(',')
}
