/**
 * query — the one builder. The page and the export both go through it, which is
 * how they are stopped from disagreeing about what a filter means. Two code
 * paths is how an export ends up with a column the page does not show.
 *
 * Filters translate to SQL `where` clauses server-side. The browser receives
 * filtered, paginated pages only — never the full set, never a
 * count-plus-payload of 35K rows.
 *
 * The predicate here mirrors contacts_counters() in 0002_functions.sql exactly.
 * One parse, two emitters: change one, change the other.
 *
 * parseSheetParams and toSearchParams are inverses: nothing a request carried
 * that the parser did not admit is ever emitted back into a URL the page
 * renders. That is what keeps junk parameters from reflecting into hrefs.
 */
import { ALLOWED_VIEWS, DEFAULT_PAGE_SIZE, DEFAULT_VIEW, isSheetColumn } from './columns.mjs'

const COUNTRIES = ['us', 'non-us']

/** Neutralise LIKE metacharacters so a search for "50%" is a search for "50%". */
export function escapeLike(s) {
  return String(s ?? '').replace(/[\\%_]/g, (c) => `\\${c}`)
}

/**
 * One or-branch pattern, as a PostgREST double-quoted literal. PostgREST splits
 * an `or=` string on top-level commas, so a bare q containing one either breaks
 * the parse (400) or smuggles extra OR conditions in. The quotes keep the
 * pattern one value; this layer's own escapes — backslash first, then the
 * double quote — sit on top of escapeLike's LIKE escaping underneath.
 */
function quotedPattern(pattern) {
  return `"${pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

/**
 * Country, honestly. There is no `country` column in the seated list or in any
 * pool, including pool-non-us. The only country signal we hold is pool
 * membership, so the filter ships as two values derived server-side. A non-US
 * row's `state` holds a province or region code with no country attached, so it
 * is never used to guess. Real country values are a pipeline task, not a
 * display task here.
 */
export function countryOf(pool) {
  return String(pool ?? '') === 'non-us' ? 'Non-US' : 'United States'
}

function numOrNull(v) {
  const s = String(v ?? '').trim()
  if (s === '') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

/**
 * URLSearchParams -> SheetParams. Every bound is clamped; nothing is trusted.
 * `sort` admits whitelist columns only (AMENDMENT 2 D1) and `view` admits the
 * two lenses only, defaulting to the Field Advisor lens — a bad URL still
 * renders. (Route handlers are stricter: a non-allowed view is a 400 there.)
 */
export function parseSheetParams(searchParams) {
  const sp = searchParams ?? new URLSearchParams()
  const sortRaw = sp.get('sort') ?? ''
  const dirRaw = (sp.get('dir') ?? '').toLowerCase()
  const country = sp.get('country')
  const view = sp.get('view')
  return {
    sources: sp.getAll('source').filter(Boolean),
    states: sp.getAll('state').filter(Boolean),
    country: COUNTRIES.includes(country) ? country : null,
    catMin: numOrNull(sp.get('catMin')),
    catMax: numOrNull(sp.get('catMax')),
    q: (sp.get('q') ?? '').trim(),
    page: Math.max(1, Math.trunc(Number(sp.get('page')) || 1)),
    view: ALLOWED_VIEWS.includes(view) ? view : DEFAULT_VIEW,
    sort: isSheetColumn(sortRaw) ? sortRaw : 'company',
    dir: dirRaw === 'desc' ? 'desc' : 'asc',
  }
}

/**
 * SheetParams -> the canonical query string. The ONLY way the page emits state
 * into a URL (sort links, the switcher, the export link), so a parameter the
 * parser rejected can never ride along. Defaults are left out; `page` is
 * navigation, not filter state, and is never emitted.
 */
export function toSearchParams(params) {
  const sp = new URLSearchParams()
  if (params.view !== DEFAULT_VIEW) sp.set('view', params.view)
  for (const s of params.sources) sp.append('source', s)
  for (const s of params.states) sp.append('state', s)
  if (params.country) sp.set('country', params.country)
  if (params.catMin !== null) sp.set('catMin', String(params.catMin))
  if (params.catMax !== null) sp.set('catMax', String(params.catMax))
  if (params.q) sp.set('q', params.q)
  if (params.sort !== 'company') sp.set('sort', params.sort)
  if (params.dir !== 'asc') sp.set('dir', params.dir)
  return sp
}

/** SheetParams -> a single declarative spec. Pure; no client involved. */
export function buildFilterSpec(params) {
  const p = params
  const spec = { overlaps: null, in: [], eq: [], neq: [], gte: [], lte: [], or: null }

  if (p.sources.length) spec.overlaps = { column: 'source_tokens', values: p.sources }
  if (p.states.length) spec.in.push({ column: 'state', values: p.states })
  if (p.country === 'non-us') spec.eq.push({ column: 'pool', value: 'non-us' })
  if (p.country === 'us') spec.neq.push({ column: 'pool', value: 'non-us' })
  if (p.catMin !== null) spec.gte.push({ column: 'category_core', value: p.catMin })
  if (p.catMax !== null) spec.lte.push({ column: 'category_core', value: p.catMax })
  if (p.q) {
    const like = quotedPattern(`%${escapeLike(p.q)}%`)
    spec.or = `company_display.ilike.${like},domain.ilike.${like}`
  }
  return spec
}

/** Apply a spec to a PostgrestFilterBuilder. Order is fixed so the tests can assert it. */
export function applyFilters(query, spec) {
  let q = query
  if (spec.overlaps) q = q.overlaps(spec.overlaps.column, spec.overlaps.values)
  for (const f of spec.in) q = q.in(f.column, f.values)
  for (const f of spec.eq) q = q.eq(f.column, f.value)
  for (const f of spec.neq) q = q.neq(f.column, f.value)
  for (const f of spec.gte) q = q.gte(f.column, f.value)
  for (const f of spec.lte) q = q.lte(f.column, f.value)
  if (spec.or) q = q.or(spec.or)
  return q
}

/** The same params, shaped for the contacts_counters RPC. */
export function counterArgs(params) {
  return {
    p_sources: params.sources.length ? params.sources : null,
    p_states: params.states.length ? params.states : null,
    p_country: params.country,
    p_cat_min: params.catMin,
    p_cat_max: params.catMax,
    p_q: params.q || null,
  }
}

/** Zero-based inclusive range for `.range(from, to)`. One page size; nothing shrinks or widens it. */
export function pageRange(params) {
  const pageSize = DEFAULT_PAGE_SIZE
  const from = (params.page - 1) * pageSize
  return { from, to: from + pageSize - 1, pageSize }
}
