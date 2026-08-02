/**
 * Unit tests for the S1c mappers — PTDA and SERP self-identification.
 *   node --test emails/scripts/lib/
 *
 * SERP is the one that earns its tests: it is the only source with no address
 * and no phone, so every rule that stops it fabricating identity is checked here.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { LOCATOR_SOURCES, MAPPERS, PTDA_ANY_CATEGORY, mapDfs, mapLocator, mapPtda, mapSerp, serpCompanyName } from './map.mjs'
import { validateRecord } from './contract.mjs'

const PROV = { source_url: 'https://www.ptda.org/x', captured: '2026-08-01' }

// ── PTDA ─────────────────────────────────────────────────────────────────────

test('ptda: the association proves no brand — brand_authorized stays empty', () => {
  const [r] = mapPtda({
    records: [{ company: 'Acme Bearing Co.', address_1: '1 Main St', city: 'Akron', state: 'OH', zip: '44306-1234', phone_raw: '(330) 438-3000', website: 'http://www.acme.com', product_category: 'BEARINGS', ...PROV }],
  })
  assert.deepEqual(r.brand_authorized, [], 'membership of a trade body is not authorization')
  assert.deepEqual(r.line_card, ['PTDA:BEARINGS'])
  assert.equal(r.zip5, '44306')
  assert.equal(r.phone_e164, '3304383000')
  assert.equal(r.domain, 'acme.com')
  assert.ok(validateRecord(r).ok)
})

test('ptda: the unfiltered "(Any)" sweep is not a 15th category', () => {
  const [r] = mapPtda({ records: [{ company: 'Acme', product_category: PTDA_ANY_CATEGORY, ...PROV }] })
  assert.deepEqual(r.line_card, [])
})

test('ptda: a row with no address keeps its phone as identity, and is not dropped', () => {
  const [r] = mapPtda({ records: [{ company: 'Acme', address_1: null, city: null, state: null, zip: null, phone_raw: '(734) 479-1500', toll_free_raw: '(800) 523-3146', website: 'http://x.com', product_category: 'MOTORS', ...PROV }] })
  assert.equal(r.address_1, null)
  assert.equal(r.phone_e164, '7344791500')
  assert.ok(validateRecord(r).ok)
})

test('ptda: a toll-free number is the fallback when the local line is missing', () => {
  const [r] = mapPtda({ records: [{ company: 'Acme', phone_raw: null, toll_free_raw: '(800) 523-3146', product_category: 'PUMPS', ...PROV }] })
  assert.equal(r.phone_e164, '8005233146')
})

// ── SERP: the company-name derivation ────────────────────────────────────────

test('serp name: a title segment only wins when it corroborates the domain', () => {
  assert.deepEqual(serpCompanyName('valin.com', ['Authorized Parker Distributor | Valin']), {
    display: 'Valin',
    from: 'title',
  })
  // "Parker" is the brand the page is about, not the company that published it.
  assert.equal(serpCompanyName('bernellhydraulics.com', ['Parker Hose Fittings | Buy Online']).from, 'domain')
})

test('serp name: with no corroborating title the domain label is the placeholder', () => {
  assert.deepEqual(serpCompanyName('fluid-power-solutions.com', ['Home']), {
    display: 'Fluid Power Solutions',
    from: 'domain',
  })
})

// ── SERP: the mapper ─────────────────────────────────────────────────────────

const serpRow = (over = {}) => ({
  domain: 'valin.com',
  page_url: 'https://www.valin.com/a',
  title: 'Authorized Parker Distributor | Valin',
  rank_absolute: 1,
  classification: 'dealer_candidate',
  declaration: 'Authorized Parker Distributor',
  declaration_is_boilerplate: false,
  brands_named: ['Parker'],
  source: 'serp',
  source_url: 'https://www.valin.com/a',
  captured: '2026-08-01',
  ...over,
})

test('serp: one record per apex domain, and www/subdomains collapse onto it', () => {
  const out = mapSerp({
    serp: { records: [serpRow(), serpRow({ domain: 'www.valin.com', page_url: 'https://www.valin.com/b' }), serpRow({ domain: 'store.valin.com' })] },
  })
  assert.equal(out.length, 1)
  assert.equal(out[0].domain, 'valin.com')
})

test('serp: nothing is invented — no address, no phone, no city, and the flag is set', () => {
  const [r] = mapSerp({ serp: { records: [serpRow()] } })
  assert.equal(r.address_1, null)
  assert.equal(r.phone_e164, null)
  assert.equal(r.city, null)
  assert.equal(r.state, null)
  assert.equal(r.zip5, null)
  assert.equal(r.needs_identity_resolution, true)
  assert.ok(validateRecord(r).ok)
})

test('serp: brands go to brand_authorized, and line_card stays empty', () => {
  const [r] = mapSerp({
    serp: { records: [serpRow()] },
    pages: {
      records: [
        {
          domain: 'valin.com',
          page_url: 'https://www.valin.com/a',
          final_url: 'https://www.valin.com/a',
          page_title: 'Authorized Parker Distributor | Valin',
          page_declarations: [{ text: 'Authorized Parker Distributor', is_boilerplate: false }],
          quotable_on_page: true,
          brands_named_on_page: ['Eaton', 'NSK', 'Parker'],
          source_url: 'https://www.valin.com/a',
          captured: '2026-08-01',
        },
      ],
    },
  })
  assert.deepEqual(r.brand_authorized.sort(), ['Eaton', 'NSK', 'Parker'])
  assert.deepEqual(r.line_card, [], 'brands are not product families — folding them in inflates the size proxy')
})

test('serp: a page-verbatim declaration beats the SERP snippet, and keeps its own URL', () => {
  const [r] = mapSerp({
    serp: { records: [serpRow({ declaration: 'Authorized Parker Distributor ... Read more' })] },
    pages: {
      records: [
        {
          domain: 'valin.com',
          page_url: 'https://www.valin.com/a',
          final_url: 'https://www.valin.com/final',
          page_declarations: [{ text: 'We are an Authorized Parker Distributor', is_boilerplate: false }],
          quotable_on_page: true,
          brands_named_on_page: [],
          captured: '2026-08-01',
        },
      ],
    },
  })
  assert.equal(r.self_declaration, 'We are an Authorized Parker Distributor')
  assert.equal(r.self_declaration_verbatim, true)
  assert.equal(r.self_declaration_url, 'https://www.valin.com/final')
})

test('serp: a declaration keeps its published casing exactly — it is email copy', () => {
  const shouty = 'IBSCO OFFERS ALL TYPES OF BEARING PRODUCTS as a Factory Authorized Distributor'
  const [r] = mapSerp({ serp: { records: [serpRow({ declaration: shouty })] } })
  assert.equal(r.self_declaration, shouty)
  assert.equal(r.self_declaration_verbatim, false, 'a SERP snippet is not page-verbatim')
})

test('serp: a foreign ccTLD is routed, never deleted', () => {
  const [r] = mapSerp({ serp: { records: [serpRow({ domain: 'ubuy.hn' })] } })
  assert.equal(r.disposition, 'non-US')
  assert.ok(validateRecord(r).ok)
})

test('serp: a manufacturer or marketplace page is tagged, never deleted', () => {
  const out = mapSerp({
    serp: {
      records: [
        serpRow({ domain: 'parker.com', classification: 'manufacturer' }),
        serpRow({ domain: 'indeed.com', classification: 'social_jobs_forum' }),
      ],
    },
  })
  assert.equal(out.length, 2)
  for (const r of out) assert.equal(r.disposition, 'not-a-distributor')
})

test('serp: a domain that ranked as a dealer anywhere is a dealer, not the first classification seen', () => {
  const out = mapSerp({
    serp: {
      records: [
        serpRow({ classification: 'marketplace_directory', rank_absolute: 1 }),
        serpRow({ classification: 'dealer_candidate', rank_absolute: 9, page_url: 'https://www.valin.com/c' }),
      ],
    },
  })
  assert.equal(out.length, 1)
  assert.equal(out[0].disposition, null, 'the strongest claim wins')
})

test('serp: provenance unions across every result and the fetched page', () => {
  const [r] = mapSerp({
    serp: { records: [serpRow(), serpRow({ page_url: 'https://www.valin.com/b', source_url: 'https://www.valin.com/b' })] },
  })
  assert.deepEqual(r.source_url.split('|').sort(), ['https://www.valin.com/a', 'https://www.valin.com/b'])
  assert.ok(validateRecord(r).ok)
})

// ─────────────────────────────────────────────────────────────────────────────
// S4 — DataForSEO listings and the nine easy-tier locators
// ─────────────────────────────────────────────────────────────────────────────

const dfsRow = (over = {}) => ({
  company_display: 'Acme Bearing Co., Inc.',
  cid: '123',
  category_display: 'Bearing supplier',
  category_ids: ['bearing_supplier', 'industrial_equipment_supplier'],
  street: '1101 Victoria St H',
  city: 'Costa Mesa',
  state_region: 'California',
  zip: '92627',
  country_code: 'US',
  latitude: 33.65,
  longitude: -117.94,
  phone: '+1714-555-0100',
  website: 'https://www.acmebearing.com/',
  domain: 'acmebearing.com',
  emails: [],
  is_claimed: true,
  rating: { value: 4.6, votes_count: 37 },
  source_url: 'https://www.google.com/maps?cid=123',
  captured: '2026-08-01',
  ...over,
})

test('dfs: category_ids go to line_card as DFS: codes, never to brand_authorized', () => {
  const [r] = mapDfs({ records: [dfsRow()] })
  assert.deepEqual(r.line_card, ['DFS:bearing_supplier', 'DFS:industrial_equipment_supplier'])
  assert.deepEqual(r.brand_authorized, [], 'a Maps listing proves no manufacturer authorization')
  assert.equal(r.distributor_type, 'Bearing supplier')
  assert.ok(validateRecord(r).ok)
})

test('dfs: the listing state is carried verbatim and unmapped in tier_raw', () => {
  const [r] = mapDfs({ records: [dfsRow()] })
  assert.equal(r.tier_raw, 'claimed=true;votes=37;rating=4.6')
})

test('dfs: non-US listings never enter the contract', () => {
  assert.equal(mapDfs({ records: [dfsRow({ country_code: 'CA' })] }).length, 0)
})

test('dfs: a published email carries its provenance', () => {
  const [r] = mapDfs({ records: [dfsRow({ emails: ['Sales@AcmeBearing.com'] })] })
  assert.equal(r.email, 'sales@acmebearing.com')
  assert.equal(r.email_source, 'dfs')
  assert.ok(validateRecord(r).ok)
})

test('locator: each of the nine proves exactly one brand — its own', () => {
  const row = {
    company: 'Cedar Creek Compressor LLC',
    address_1: '456 Old Highway 91',
    city: 'Hurricane',
    state: 'UT',
    zip_raw: '84737',
    phone_10: '4356276811',
    email: 'blake@cedarcreekcompressor.com',
    website: 'https://cccompressor.com/',
    domain: 'cccompressor.com',
    is_us: true,
    source_url: 'https://www.quincycompressor.com/wp-admin/admin-ajax.php',
    captured: '2026-08-01',
  }
  const [r] = mapLocator({ records: [row] }, { source: 'quincy' })
  assert.deepEqual(r.brand_authorized, ['Quincy Compressor'])
  assert.deepEqual(r.line_card, [], '§1: a locator publishes a brand, not product families')
  assert.equal(r.email_source, 'quincy')
  assert.ok(validateRecord(r).ok)
})

test('locator: a multi-valued source code becomes one token per value', () => {
  // Kennametal publishes `grader blades|snowplow blades`. Glued together the
  // code cannot be matched by SOURCE_VERTICAL_PRIORS later — §5e's whole point.
  const [r] = mapLocator(
    {
      records: [
        {
          company: 'X',
          industries_raw: 'grader blades|snowplow blades',
          location_type_raw: 'NATIONAL',
          is_us: true,
          source_url: 'https://www.kennametal.com/x',
          captured: '2026-08-01',
        },
      ],
    },
    { source: 'kennametal' },
  )
  assert.equal(r.tier_raw, 'industries_raw=grader blades;industries_raw=snowplow blades;location_type_raw=NATIONAL')
})

test('locator: non-US rows are filtered at the source boundary', () => {
  const recs = mapLocator(
    { records: [{ company: 'A', is_us: false, source_url: 'https://x.test', captured: '2026-08-01' }] },
    { source: 'nord' },
  )
  assert.equal(recs.length, 0)
})

test('locator: an unconfigured source throws rather than emitting brandless rows', () => {
  assert.throws(() => mapLocator({ records: [] }, { source: 'not-a-locator' }), /no config/)
})

test('locator: every configured source is registered in MAPPERS', () => {
  for (const s of LOCATOR_SOURCES) assert.equal(typeof MAPPERS[s], 'function', `${s} is not in MAPPERS`)
})

// ─────────────────────────────────────────────────────────────────────────────
// §5k — the negated declaration, and the array-stringify bug class, third pass
// ─────────────────────────────────────────────────────────────────────────────

test('serp: a NEGATED declaration never becomes copy', () => {
  const [r] = mapSerp({
    serp: {
      records: [
        serpRow({
          declaration: 'SB Industrial Supply is not an authorized distributor, affiliate, or agent',
          declaration_is_negated: true,
        }),
      ],
    },
  })
  assert.equal(r.self_declaration, null, 'quoting a disclaimer back at a prospect would be a catastrophe')
  assert.equal(r.self_declaration_url, null)
})

test('serp: a clean sentence still wins when the same domain also publishes a disclaimer', () => {
  const [r] = mapSerp({
    serp: {
      records: [
        serpRow({ rank_absolute: 1, declaration: 'We are NOT an authorized distributor', declaration_is_negated: true }),
        serpRow({ rank_absolute: 2, declaration: 'Valin is an authorized Parker distributor' }),
      ],
    },
  })
  assert.equal(r.self_declaration, 'Valin is an authorized Parker distributor')
})

test('serp: a negated-only domain is recorded in the sink, never deleted', () => {
  const negatedSink = []
  const [r] = mapSerp(
    { serp: { records: [serpRow({ declaration: 'is not an authorized distributor', declaration_is_negated: true })] } },
    { negatedSink },
  )
  assert.equal(r.self_declaration, null)
  assert.equal(negatedSink.length, 1)
  assert.equal(negatedSink[0].domain, 'valin.com')
  assert.equal(negatedSink[0].declaration_verbatim, 'is not an authorized distributor', 'byte-exact, so it can be audited')
})

test('locator: an ARRAY source code splits into one token per value, never String(array)', () => {
  const [r] = mapLocator(
    {
      records: [
        {
          company: 'AuthenTEK Solutions',
          domain: 'authentek.io',
          is_us: true,
          solutions_raw: ['Interroll DC drive technology', 'Interroll MCP conveyor modules'],
          partner_tier_token: 'accelerator',
          source_url: 'https://www.rollingoninterroll.com/x',
          captured: '2026-08-01',
        },
      ],
    },
    { source: 'interroll' },
  )
  const tokens = r.tier_raw.split(';')
  assert.ok(tokens.includes('solutions_raw=Interroll DC drive technology'))
  assert.ok(tokens.includes('solutions_raw=Interroll MCP conveyor modules'))
  assert.ok(
    !tokens.some((t) => t.includes(',')),
    'String([a,b]) would have produced one comma-glued, unmatchable token — §5j, third instance',
  )
})

test("locator: Yaskawa's groupList code is captured verbatim so the vertical can be read", () => {
  const [r] = mapLocator(
    {
      records: [
        {
          company: 'Air Distribution Enterprises',
          is_us: true,
          phone_10: '7814911100',
          product_group_code: 'D13',
          product_group_label: 'HVAC Drives',
          tier_tokens_raw: 'premier|dist-service',
          source_url: 'https://www.yaskawa.com/x',
          captured: '2026-08-01',
        },
      ],
    },
    { source: 'yaskawa' },
  )
  assert.ok(r.tier_raw.split(';').includes('product_group_code=D13'))
  assert.deepEqual(r.brand_authorized, ['Yaskawa'])
})
