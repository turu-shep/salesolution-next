import assert from 'node:assert/strict'
import test from 'node:test'

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
  const p = params('source=timken&source=dfs&state=IL&state=WI&country=us&catMin=2&catMax=8&q=acme&page=3&sort=city&dir=desc&view=hosebox')
  assert.deepEqual(p.sources, ['timken', 'dfs'])
  assert.deepEqual(p.states, ['IL', 'WI'])
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
  const p = params('page=-4&sort=DROP TABLE&dir=sideways&catMin=abc&country=mars&view=catalog-ai')
  assert.equal(p.page, 1)
  assert.equal(p.sort, 'company')     // falls back to a whitelist column
  assert.equal(p.dir, 'asc')
  assert.equal(p.catMin, null)        // never coerced to 0
  assert.equal(p.country, null)
  assert.equal(p.view, 'field-advisor')  // an unknown view is the default lens; a bad URL still renders
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
  const p = params('source=timken&source=dfs&state=IL&country=us&catMin=2&catMax=8&q=acme&sort=city&dir=desc&view=hosebox&page=3&show=all&tier=junk')
  const sp = toSearchParams(p)
  assert.equal(sp.has('page'), false)   // page is navigation, not filter state
  assert.equal(sp.has('show'), false)   // deleted vocabulary is never re-emitted
  assert.equal(sp.has('tier'), false)   // junk a request carried is never reflected back out
  const p2 = parseSheetParams(sp)
  const { page: _a, ...rest } = p
  const { page: _b, ...rest2 } = p2
  assert.deepEqual(rest2, rest)
})

test('toSearchParams leaves defaults out of the URL', () => {
  assert.equal(toSearchParams(params('')).toString(), '')
  assert.equal(toSearchParams(params('view=hosebox')).toString(), 'view=hosebox')
  assert.equal(toSearchParams(params('sort=city')).toString(), 'sort=city')
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
  const spec = buildFilterSpec(params('source=timken&source=dfs&state=IL&country=non-us&catMin=2&catMax=8&q=ac%25me'))
  assert.deepEqual(spec.overlaps, { column: 'source_tokens', values: ['timken', 'dfs'] })
  assert.deepEqual(spec.in, [{ column: 'state', values: ['IL'] }])
  assert.deepEqual(spec.eq, [{ column: 'pool', value: 'non-us' }])
  assert.deepEqual(spec.gte, [{ column: 'category_core', value: 2 }])
  assert.deepEqual(spec.lte, [{ column: 'category_core', value: 8 }])
  assert.equal(spec.or, 'company_display.ilike."%ac\\\\%me%",domain.ilike."%ac\\\\%me%"')

  const q = recorder()
  applyFilters(q, spec)
  assert.deepEqual(q.calls, [
    ['overlaps', 'source_tokens', ['timken', 'dfs']],
    ['in', 'state', ['IL']],
    ['eq', 'pool', 'non-us'],
    ['gte', 'category_core', 2],
    ['lte', 'category_core', 8],
    ['or', 'company_display.ilike."%ac\\\\%me%",domain.ilike."%ac\\\\%me%"'],
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
  assert.deepEqual(q.calls, [['neq', 'pool', 'non-us']])
})

test('an empty filter set touches nothing', () => {
  const q = recorder()
  applyFilters(q, buildFilterSpec(params('')))
  assert.deepEqual(q.calls, [])
})

test('counterArgs matches the contacts_counters signature exactly', () => {
  assert.deepEqual(counterArgs(params('source=dfs&state=IL&country=us&catMin=2&q=acme')), {
    p_sources: ['dfs'],
    p_states: ['IL'],
    p_country: 'us',
    p_cat_min: 2,
    p_cat_max: null,
    p_q: 'acme',
  })
  assert.deepEqual(counterArgs(params('')), {
    p_sources: null, p_states: null, p_country: null, p_cat_min: null, p_cat_max: null, p_q: null,
  })
})
