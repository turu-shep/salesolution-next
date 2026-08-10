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
import { ALLOWED_VIEWS, BUSINESS_TYPES, CLIENT_POOLS, CLIENT_POOLS_NO_SMALL_SHOPS, DEFAULT_PAGE_SIZE, DEFAULT_VIEW, isSheetColumn } from './columns.mjs'

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

// The country filter and the derived Country column were retired with the G2
// non-us drop (2026-08-10): the base is US-only, so there is nothing to filter
// or display. The only country signal ever held was pool membership.

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
  const view = sp.get('view')
  const btype = sp.get('btype')
  return {
    sources: sp.getAll('source').filter(Boolean),
    states: sp.getAll('state').filter(Boolean),
    // Brands/lines carried and Est. size are facet-fed data values, admitted
    // like states: a value the data does not hold simply matches nothing.
    brands: sp.getAll('brands').filter(Boolean),
    sizes: sp.getAll('sizes').filter(Boolean),
    // business_type is a CLOSED vocabulary (the sync's), so it clamps.
    btype: BUSINESS_TYPES.includes(btype) ? btype : null,
    // One boolean, exact-match '1' — it selects between two sanctioned pool
    // subsets at the emitters and can only narrow (G2 2026-08-10).
    hideSmall: sp.get('hideSmall') === '1',
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
  for (const b of params.brands) sp.append('brands', b)
  for (const s of params.sizes) sp.append('sizes', s)
  if (params.btype) sp.set('btype', params.btype)
  if (params.hideSmall) sp.set('hideSmall', '1')
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
  // `hideSmall` is a boolean, not a filter clause: applyFilters reads it to
  // choose WHICH sanctioned pool subset to pin. A mutated spec can only pick
  // between the two code-owned sets — it cannot name pools.
  const spec = { hideSmall: p.hideSmall === true, overlaps: [], in: [], eq: [], neq: [], gte: [], lte: [], or: null }

  if (p.sources.length) spec.overlaps.push({ column: 'source_tokens', values: p.sources })
  if (p.brands.length) spec.overlaps.push({ column: 'brand_tokens', values: p.brands })
  if (p.states.length) spec.in.push({ column: 'state', values: p.states })
  if (p.sizes.length) spec.in.push({ column: 'size_band', values: p.sizes })
  if (p.btype) spec.eq.push({ column: 'business_type', value: p.btype })
  if (p.catMin !== null) spec.gte.push({ column: 'category_core', value: p.catMin })
  if (p.catMax !== null) spec.lte.push({ column: 'category_core', value: p.catMax })
  if (p.q) {
    const like = quotedPattern(`%${escapeLike(p.q)}%`)
    spec.or = `company_display.ilike.${like},domain.ilike.${like}`
  }
  return spec
}

/**
 * Apply a spec to a PostgrestFilterBuilder. Order is fixed so the tests can
 * assert it — and the FIRST filter is not the spec's: the curated client base
 * (Task 13 A, founder decision 2026-08-09) is pinned here at the emitter, from
 * the imported constant. It is deliberately NOT a spec field: a spec a caller
 * hand-built, emptied, or mutated still gets `pool = any(CLIENT_POOLS)`, and a
 * spec that smuggles its own pool filter merely ANDs a narrower one on top.
 * counterArgs() is the other emitter and pins the same predicate as p_pools.
 */
export function applyFilters(query, spec) {
  let q = query.in('pool', spec?.hideSmall === true ? CLIENT_POOLS_NO_SMALL_SHOPS : CLIENT_POOLS)
  for (const f of spec.overlaps) q = q.overlaps(f.column, f.values)
  for (const f of spec.in) q = q.in(f.column, f.values)
  for (const f of spec.eq) q = q.eq(f.column, f.value)
  for (const f of spec.neq) q = q.neq(f.column, f.value)
  for (const f of spec.gte) q = q.gte(f.column, f.value)
  for (const f of spec.lte) q = q.lte(f.column, f.value)
  if (spec.or) q = q.or(spec.or)
  return q
}

/**
 * The same params, shaped for the contacts_counters RPC. p_pools is pinned to
 * CLIENT_POOLS unconditionally — same rail as applyFilters, second emitter.
 * One predicate, two emitters: change one, change the other.
 */
export function counterArgs(params) {
  return {
    p_pools: params.hideSmall === true ? CLIENT_POOLS_NO_SMALL_SHOPS : CLIENT_POOLS,
    p_sources: params.sources.length ? params.sources : null,
    p_states: params.states.length ? params.states : null,
    p_brands: params.brands.length ? params.brands : null,
    p_sizes: params.sizes.length ? params.sizes : null,
    p_btype: params.btype,
    // The country control is retired (G2 non-us drop); the RPC keeps the
    // parameter in its signature, so it is pinned null rather than removed.
    p_country: null,
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
