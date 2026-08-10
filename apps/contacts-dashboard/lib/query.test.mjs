import assert from 'node:assert/strict'
import test from 'node:test'

import { CLIENT_POOLS } from './columns.mjs'
import { applyFilters, buildFilterSpec, counterArgs, countryOf, escapeLike, pageRange, parseSheetParams, toSearchParams } from './query.mjs'

/** A stand-in for a PostgrestFilterBuilder: every filter method returns `this`. */
function recorder() {
  const calls = []
  const self = {}
  for (const m of ['eq', 'neq', 'gte', 'lte', 'in', 'overlaps', 'or', 'order', 'range', 'not']) {
    self[m] = (...args) => {
      calls.push([m, ...args])
      return self
    }
  }
  self.calls = calls
  return self
}

const params = (qs) => parseSheetParams(new URLSearchParams(qs))

test('parseSheetParams reads every control', () => {
  const p = params('source=timken&source=dfs&state=IL&state=WI&brands=Timken&brands=Parker&sizes=5-10M&sizes=10-20M&btype=distributor&country=us&catMin=2&catMax=8&q=acme&page=3&sort=city&dir=desc&view=hosebox')
  assert.deepEqual(p.sources, ['timken', 'dfs'])
  assert.deepEqual(p.states, ['IL', 'WI'])
  assert.deepEqual(p.brands, ['Timken', 'Parker'])
  assert.deepEqual(p.sizes, ['5-10M', '10-20M'])
  assert.equal(p.btype, 'distributor')
  assert.equal(p.country, 'us')
  assert.equal(p.catMin, 2)
  assert.equal(p.catMax, 8)
  assert.equal(p.q, 'acme')
  assert.equal(p.page, 3)
  assert.equal(p.sort, 'city')
  assert.equal(p.dir, 'desc')
  assert.equal(p.view, 'hosebox')
})

test('parseSheetParams refuses nonsense instead of passing it to the database', () => {
  const p = params('page=-4&sort=DROP TABLE&dir=sideways&catMin=abc&country=mars&view=catalog-ai&btype=franchise')
  assert.equal(p.page, 1)
  assert.equal(p.sort, 'company')     // falls back to a whitelist column
  assert.equal(p.dir, 'asc')
  assert.equal(p.catMin, null)        // never coerced to 0
  assert.equal(p.country, null)
  assert.equal(p.view, 'field-advisor')  // an unknown view is the default lens; a bad URL still renders
  assert.equal(p.btype, null)         // outside the sync vocabulary — clamped, never forwarded
  assert.equal(params('btype=').btype, null)
  assert.equal(params('btype=contractor-service').btype, 'contractor-service')
})

test('no parameter exists that reaches the pools predicate — the client base cannot be widened', () => {
  // Task 13 rails: `pool` is not a control. A request naming it parses to
  // nothing, and toSearchParams never reflects it back out.
  const p = params('pool=not-a-distributor&pool=ranked-out')
  assert.equal('pool' in p, false)
  assert.equal('pools' in p, false)
  assert.equal(toSearchParams(p).has('pool'), false)
})

test('a sort naming a column outside the whitelist falls back — typed is not enough', () => {
  // AMENDMENT 2 D1: nothing a request supplies can widen what the sheet touches.
  assert.equal(params('sort=email').sort, 'company')
  assert.equal(params('sort=tier').sort, 'company')
  assert.equal(params('sort=rank_score').sort, 'company')
  assert.equal(params('sort=id').sort, 'company')
  assert.equal(params('sort=captured').sort, 'captured')  // whitelist columns still sort
})

test('show=all is dead vocabulary: ignored, and the page size never changes', () => {
  const p = params('show=all&page=2')
  assert.equal('showAll' in p, false)
  assert.deepEqual(pageRange(p), { from: 500, to: 999, pageSize: 500 })
  assert.deepEqual(pageRange(params('page=2')), { from: 500, to: 999, pageSize: 500 })
})

test('toSearchParams emits the canonical state and round-trips through the parser', () => {
  const p = params('source=timken&source=dfs&state=IL&brands=Timken&brands=SKF&sizes=5-10M&btype=other&country=us&catMin=2&catMax=8&q=acme&sort=city&dir=desc&view=hosebox&page=3&show=all&tier=junk')
  const sp = toSearchParams(p)
  assert.equal(sp.has('page'), false)   // page is navigation, not filter state
  assert.equal(sp.has('show'), false)   // deleted vocabulary is never re-emitted
  assert.equal(sp.has('tier'), false)   // junk a request carried is never reflected back out
  assert.deepEqual(sp.getAll('brands'), ['Timken', 'SKF'])
  assert.deepEqual(sp.getAll('sizes'), ['5-10M'])
  assert.equal(sp.get('btype'), 'other')
  const p2 = parseSheetParams(sp)
  const { page: _a, ...rest } = p
  const { page: _b, ...rest2 } = p2
  assert.deepEqual(rest2, rest)
})

test('toSearchParams leaves defaults out of the URL', () => {
  assert.equal(toSearchParams(params('')).toString(), '')
  assert.equal(toSearchParams(params('view=hosebox')).toString(), 'view=hosebox')
  assert.equal(toSearchParams(params('sort=city')).toString(), 'sort=city')
  // The new filters at rest add nothing to the URL.
  assert.equal(toSearchParams(params('btype=&brands=&sizes=')).toString(), '')
})

test('escapeLike neutralises the LIKE wildcards so a search for "50%" means "50%"', () => {
  assert.equal(escapeLike('50%'), '50\\%')
  assert.equal(escapeLike('a_b'), 'a\\_b')
  assert.equal(escapeLike('back\\slash'), 'back\\\\slash')
})

test('countryOf derives country from pool membership and nothing else', () => {
  assert.equal(countryOf('non-us'), 'Non-US')
  assert.equal(countryOf('seated'), 'United States')
  assert.equal(countryOf(null), 'United States')
  // There is no `country` column in any file. On a non-US row `state` holds a
  // province code with no country attached, so it is never used to guess.
})

test('buildFilterSpec turns params into one spec, and applyFilters chains it', () => {
  const spec = buildFilterSpec(params('source=timken&source=dfs&state=IL&brands=Timken&brands=Parker&sizes=5-10M&btype=distributor&country=non-us&catMin=2&catMax=8&q=ac%25me'))
  assert.deepEqual(spec.overlaps, [
    { column: 'source_tokens', values: ['timken', 'dfs'] },
    { column: 'brand_tokens', values: ['Timken', 'Parker'] },
  ])
  assert.deepEqual(spec.in, [{ column: 'state', values: ['IL'] }, { column: 'size_band', values: ['5-10M'] }])
  assert.deepEqual(spec.eq, [{ column: 'pool', value: 'non-us' }, { column: 'business_type', value: 'distributor' }])
  assert.deepEqual(spec.gte, [{ column: 'category_core', value: 2 }])
  assert.deepEqual(spec.lte, [{ column: 'category_core', value: 8 }])
  assert.equal(spec.or, 'company_display.ilike."%ac\\\\%me%",domain.ilike."%ac\\\\%me%"')

  const q = recorder()
  applyFilters(q, spec)
  assert.deepEqual(q.calls, [
    ['in', 'pool', CLIENT_POOLS],   // the client base, ALWAYS first — see below
    ['overlaps', 'source_tokens', ['timken', 'dfs']],
    ['overlaps', 'brand_tokens', ['Timken', 'Parker']],
    ['in', 'state', ['IL']],
    ['in', 'size_band', ['5-10M']],
    ['eq', 'pool', 'non-us'],
    ['eq', 'business_type', 'distributor'],
    ['gte', 'category_core', 2],
    ['lte', 'category_core', 8],
    ['or', 'company_display.ilike."%ac\\\\%me%",domain.ilike."%ac\\\\%me%"'],
  ])
})

test('applyFilters pins the client base unconditionally — no spec content can remove or widen it', () => {
  // Task 13 A, the SECURITY-CLASS rail: the pools predicate is attached at the
  // EMITTER from the imported constant, not carried by the spec — so a spec a
  // caller hand-built, emptied, or mutated still gets the curated client base.
  const empty = recorder()
  applyFilters(empty, buildFilterSpec(params('')))
  assert.deepEqual(empty.calls, [['in', 'pool', CLIENT_POOLS]])

  const handBuilt = recorder()
  applyFilters(handBuilt, { overlaps: [], in: [], eq: [], neq: [], gte: [], lte: [], or: null })
  assert.deepEqual(handBuilt.calls, [['in', 'pool', CLIENT_POOLS]])

  // A spec smuggling a wider pool filter ADDS a conjunct — it can only narrow,
  // never replace the pin. AND semantics: both filters apply.
  const smuggled = recorder()
  applyFilters(smuggled, { overlaps: [], in: [{ column: 'pool', values: ['not-a-distributor'] }], eq: [], neq: [], gte: [], lte: [], or: null })
  assert.deepEqual(smuggled.calls, [
    ['in', 'pool', CLIENT_POOLS],
    ['in', 'pool', ['not-a-distributor']],
  ])
})

test('a comma in q stays one quoted pattern instead of splitting the or', () => {
  // PostgREST splits or-conditions on top-level commas. Unquoted, this q is a
  // 400 (the parser sees " Inc.%" as a malformed extra condition); quoted, it
  // is one pattern per field.
  const spec = buildFilterSpec(params('q=Bearings, Inc.'))
  assert.equal(spec.or, 'company_display.ilike."%Bearings, Inc.%",domain.ilike."%Bearings, Inc.%"')
})

test('a double quote in q cannot break out of the quoted pattern', () => {
  const spec = buildFilterSpec(params('q=3" pipe'))
  assert.equal(spec.or, 'company_display.ilike."%3\\" pipe%",domain.ilike."%3\\" pipe%"')
})

test('country=us excludes the non-us pool rather than guessing from state', () => {
  const q = recorder()
  applyFilters(q, buildFilterSpec(params('country=us')))
  assert.deepEqual(q.calls, [
    ['in', 'pool', CLIENT_POOLS],   // the base is curated first…
    ['neq', 'pool', 'non-us'],      // …then country narrows within it
  ])
})

test('an empty filter set still serves only the curated client base', () => {
  // Before Task 13 an empty filter touched nothing; now the ONE unconditional
  // predicate is the client base. Everything else stays absent.
  const q = recorder()
  applyFilters(q, buildFilterSpec(params('')))
  assert.deepEqual(q.calls, [['in', 'pool', CLIENT_POOLS]])
})

test('counterArgs matches the contacts_counters signature exactly', () => {
  assert.deepEqual(counterArgs(params('source=dfs&state=IL&brands=Timken&sizes=5-10M&btype=other&country=us&catMin=2&q=acme')), {
    p_pools: CLIENT_POOLS,
    p_sources: ['dfs'],
    p_states: ['IL'],
    p_brands: ['Timken'],
    p_sizes: ['5-10M'],
    p_btype: 'other',
    p_country: 'us',
    p_cat_min: 2,
    p_cat_max: null,
    p_q: 'acme',
  })
  // p_pools is pinned even when every filter is empty — the RPC emitter and the
  // PostgREST emitter agree on the one unconditional predicate.
  assert.deepEqual(counterArgs(params('')), {
    p_pools: CLIENT_POOLS,
    p_sources: null, p_states: null, p_brands: null, p_sizes: null, p_btype: null,
    p_country: null, p_cat_min: null, p_cat_max: null, p_q: null,
  })
})
