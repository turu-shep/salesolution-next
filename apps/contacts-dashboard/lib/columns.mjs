/**
 * columns — one place that says what the sheet selects.
 *
 * LOCATION_COLUMNS is a WHITELIST, server-enforced (AMENDMENT 2 D1). The
 * audience is a client, so the sheet renders this set, period: every select
 * list is generated from it plus the two server-internal fields below, which
 * are stripped again before anything is serialized (lib/rows.mjs). Nothing a
 * request supplies — sort, show, any parameter — can widen the select. The
 * show-all path and the per-row JSONB panel are deleted, not hidden.
 *
 * Four names a brief would reach for do not exist in the data, and the
 * corrections are load-bearing: `zip5` not `zip`, `phone_e164` not `phone`,
 * `domain` not `website`, and there is no `category_display` at all. Country is
 * derived from pool membership — see countryOf() in query.mjs.
 */

/** The 17 identifiers the sheet serves. They render as 16 columns: company + company_display are one cell. */
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
  'size_band',       // "Est. size" — our estimate from public signals, labeled as such
  'business_type',   // "Type (est.)" — the sync's labeled heuristic, never fact
  'brand_authorized',
  'line_card',
  'source',
  'source_url',
  'captured',
  'location_count',
]

/**
 * The curated client base (founder decision 2026-08-09): every pool EXCEPT the
 * pipeline's reject bins. A SECURITY-CLASS control like the whitelist above —
 * server-side, unwidenable, attached at BOTH query emitters unconditionally
 * (applyFilters pins `pool = any(CLIENT_POOLS)` on every PostgREST path;
 * counterArgs pins `p_pools` on every RPC path). Nothing a request supplies
 * can widen it, because no request value ever reaches it.
 *
 * REJECTED set (never client-visible): not-a-distributor, ranked-out,
 * duplicate-sites, identity-backlog, usaspending-unmatched.
 */
export const CLIENT_POOLS = [
  'seated',
  'above-ceiling',
  'adjacent-trades',
  'chains',
  'non-us',
  'small-shops',
  'segment-w',
]

/**
 * The sync's `deriveBusinessType` vocabulary, verbatim (emails/scripts/lib/
 * sync-supabase-data.mjs). The filter clamps to this set; anything else in a
 * request is null. An unknown or null value renders empty — an ESTIMATE that
 * is missing stays visibly missing, it is never guessed at render time.
 */
export const BUSINESS_TYPES = ['distributor', 'contractor-service', 'other']

const BUSINESS_TYPE_LABELS = {
  distributor: 'Distributor',
  'contractor-service': 'Contractor & service',
  other: 'Other',
}

/** The client-facing label for a stored business_type; null/junk is '' — blank, never a guess. */
export function businessTypeLabel(value) {
  return BUSINESS_TYPE_LABELS[value] ?? ''
}

/**
 * Server-internal fields: `id` becomes the opaque row key, `pool` becomes the
 * derived country. Both are consumed and DROPPED by toClientRow() before the
 * response — they never reach HTML, JSON, serialized props, or the export.
 */
export const ALWAYS_SELECTED = ['id', 'pool']

/** Every typed column in `contacts`. A schema mirror for server-side reference — NOT a permission. */
export const TYPED_COLUMNS = [
  'id', 'list_generation', 'pool',
  'company', 'company_display', 'domain',
  'address_1', 'city', 'state', 'zip5', 'phone_e164',
  'category_core', 'brand_authorized', 'line_card',
  'source', 'source_url', 'captured', 'captured_date', 'location_count',
  'segment', 'tier', 'cohort', 'icp_class', 'size_band', 'business_type', 'rank_score',
  'disposition', 'source_tokens', 'brand_tokens', 'email', 'email_state', 'has_person',
]

/** Mirrors the local dashboard's `paginate` cap. The browser never receives the full set. */
export const DEFAULT_PAGE_SIZE = 500

/**
 * In or out of the whitelist. This is the `sort` admissibility check: a
 * client-supplied sort naming any column outside LOCATION_COLUMNS — typed or
 * not — falls back to the default sort, and a bad URL still renders.
 */
export function isSheetColumn(name) {
  return LOCATION_COLUMNS.includes(String(name))
}

/**
 * The `select()` string. One builder feeds both the page and the export, so the
 * two can never disagree about what a row contains — and no argument reaches a
 * wider select, because there is no wider select.
 */
export function selectList() {
  return [...ALWAYS_SELECTED, ...LOCATION_COLUMNS].join(',')
}

/**
 * The in-app project switcher (AMENDMENT 2 D4). Two lenses over the same pool,
 * chosen per request via ?view= — never a per-deployment env pin. The labels
 * are hardcoded on purpose: the `projects` table rows carry internal
 * `criteria`/`note` vocabulary and are never queried on a client-reachable
 * path. The table becomes load-bearing only when per-view filter presets
 * arrive. Route handlers (Task 7's export) must refuse a non-allowed view
 * with 400; the page falls back to DEFAULT_VIEW instead.
 */
export const ALLOWED_VIEWS = ['field-advisor', 'hosebox']

export const DEFAULT_VIEW = 'field-advisor'

const VIEW_LABELS = { 'field-advisor': 'Field Advisor', hosebox: 'Hosebox' }

/** The lens's display name — the sheet title and, later, the export filename. */
export function viewLabel(view) {
  return VIEW_LABELS[view] ?? String(view)
}
