/**
 * Unit tests for S2 — §3 steps 2–5, plus the §1 contract additions and the
 * §2b branch-strip normalizer.
 *   node --test emails/scripts/lib/
 *
 * Every case here is a rule the build plan states, or a defect measured in the
 * acquired data. Nothing is a smoke test.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CHAIN_BLOCKLIST,
  addressKey,
  chainDomainMatch,
  chainNameMatch,
  crossSourceDedupe,
  dedupeWithinSource,
  distinctAddresses,
  domainAnchors,
  inheritAnchorDisposition,
  isDomainOnly,
  mergeRecords,
  rollupBranches,
  suppressChains,
} from './dedupe.mjs'
import { FIELDS, makeRecord, toCsv, validateRecord } from './contract.mjs'
import {
  decodeEntities,
  displayName,
  normalizeCompany,
  normalizeEmail,
  splitUsAddressLine,
  stripBranchSuffix,
} from './normalize.mjs'

const rec = (over = {}) =>
  makeRecord({
    company: 'acme bearing',
    company_display: 'Acme Bearing Co.',
    source: 'timken',
    source_url: 'https://locations.timken.com/x',
    captured: '2026-08-01',
    ...over,
  })

// ── §1 contract additions ────────────────────────────────────────────────────

test('contract: line_card and brand_authorized are separate arrays', () => {
  const r = rec({ brand_authorized: ['Enerpac'], line_card: ['Industrial Tools', 'Bolting Tools'] })
  assert.deepEqual(r.brand_authorized, ['Enerpac'])
  assert.deepEqual(r.line_card, ['Industrial Tools', 'Bolting Tools'])
  assert.ok(validateRecord(r).ok)
})

test('contract: company_display survives, company is the join key', () => {
  const r = rec({ company: normalizeCompany('Acme Bearing Co.'), company_display: displayName('Acme Bearing Co.') })
  assert.equal(r.company, 'acme bearing')
  assert.equal(r.company_display, 'Acme Bearing Co.')
})

test('contract: an email without provenance is rejected', () => {
  const bad = rec({ email: 'sales@acme.com', email_source: null })
  assert.equal(validateRecord(bad).ok, false)
  assert.ok(validateRecord(bad).errors.some((e) => /email_source/.test(e)))
  assert.ok(validateRecord(rec({ email: 'sales@acme.com', email_source: 'enerpac' })).ok)
})

test('contract: post-merge `|`-joined provenance still validates, part by part', () => {
  const r = rec({
    source: 'timken|ad',
    source_url: 'https://locations.timken.com/x|https://www.adhq.com/y',
    captured: '2026-08-01',
  })
  assert.ok(validateRecord(r).ok)
  const bad = rec({ source_url: 'https://ok.com|not-a-url' })
  assert.equal(validateRecord(bad).ok, false)
})

test('contract: location_count must be a positive integer', () => {
  assert.equal(validateRecord(rec({ location_count: 0 })).ok, false)
  assert.equal(rec().location_count, 1)
})

test('csv: a comma inside a company name does not corrupt the row (build-plan D4/PF-7)', () => {
  const csv = toCsv([rec({ company_display: 'Hirsch Pipe & Supply Co., Inc.' })], FIELDS)
  const line = csv.split('\n')[1]
  assert.ok(line.includes('"Hirsch Pipe & Supply Co., Inc."'))
  // The quoted cell holds one comma; splitting naively would yield an extra field.
  assert.equal(line.split('","').length, 1)
})

test('csv: array fields are pipe-joined, quotes are doubled', () => {
  const csv = toCsv([rec({ line_card: ['Pumps', 'Valves'], company_display: 'The "Big" Co' })], FIELDS)
  assert.ok(csv.includes('Pumps|Valves'))
  assert.ok(csv.includes('"The ""Big"" Co"'))
})

// ── §2b branch stripping ─────────────────────────────────────────────────────

test('branch strip: the three shapes measured in the acquired data', () => {
  assert.equal(stripBranchSuffix('Motion Ai &#8211; MN'), 'Motion Ai')
  assert.equal(stripBranchSuffix('BHQ - Joliet, IL'), 'BHQ')
  assert.equal(stripBranchSuffix('Kirby Risk - Crawfordsville (Br# 3)'), 'Kirby Risk')
  assert.equal(stripBranchSuffix('Elliott Electric Supply, Inc. #187'), 'Elliott Electric Supply, Inc.')
  assert.equal(stripBranchSuffix('Coburn Supply Company- Memphis/Cordova Showroom'), 'Coburn Supply Company')
})

test('branch strip: a hyphenated NAME is not a branch — the measured `tri` defect', () => {
  // Splitting on any dash merged 9 different companies onto the key `tri`.
  const names = ['Tri-State Bearing', 'Tri-County Electrical Supply, Inc.', 'Tri-State Industrial']
  const keys = new Set(names.map((n) => normalizeCompany(n, { stripBranch: true })))
  assert.equal(keys.size, 3, 'hyphenated prefixes must stay distinct')
  assert.equal(normalizeCompany('Mid-City Supply Co., Inc.', { stripBranch: true }), 'mid city supply')
  assert.equal(normalizeCompany('McNaughton-McKay/Georgia Reg', { stripBranch: true }), 'mcnaughton mckay georgia reg')
})

test('branch strip: dashMode "any" reproduces the old defect, so the A/B is real', () => {
  assert.equal(normalizeCompany('Tri-State Bearing', { stripBranch: true, dashMode: 'any' }), 'tri')
  assert.equal(normalizeCompany('Tri-County Electrical Supply', { stripBranch: true, dashMode: 'any' }), 'tri')
})

test('branch strip: stripping still collapses real branches onto one key', () => {
  const keys = new Set(
    ['Kenny Pipe & Supply, Inc.', 'Kenny Pipe & Supply- Nashville', 'Kenny Pipe & Supply- Murfreesboro'].map((n) =>
      normalizeCompany(n, { stripBranch: true }),
    ),
  )
  assert.deepEqual([...keys], ['kenny pipe supply'])
})

test('branch strip is opt-in — the default normalizer is unchanged', () => {
  assert.equal(normalizeCompany('Motion Ai - MN'), 'motion ai mn')
})

// ── other §1 normalizers ─────────────────────────────────────────────────────

test('entities decode before the name becomes a join key', () => {
  assert.equal(decodeEntities('Smith &amp; Sons'), 'Smith & Sons')
  assert.equal(decodeEntities('Motion Ai &#8211; MN'), 'Motion Ai – MN')
  assert.equal(normalizeCompany('Smith &amp; Sons'), normalizeCompany('Smith & Sons'))
})

test('displayName strips annotations that are not part of the name', () => {
  assert.equal(displayName('** Temporarily Suspended ** Distributor: Nord-West Tool'), 'Nord-West Tool')
})

test('email: one address, lowercased; a multi-address blob keeps the first', () => {
  assert.equal(normalizeEmail('  Sales@Acme.COM '), 'sales@acme.com')
  assert.equal(normalizeEmail('a@x.com, b@x.com'), 'a@x.com')
  assert.equal(normalizeEmail('mailto:a@x.com'), 'a@x.com')
  assert.equal(normalizeEmail('not an email'), null)
})

test('single-line US address splits into street / city / state / zip', () => {
  const a = splitUsAddressLine('8188 Commercial Street La Mesa, CA 91942')
  assert.equal(a.city, 'La Mesa')
  assert.equal(a.state, 'CA')
  assert.equal(a.zip5, '91942')
  assert.equal(a.address_1, '8188 commercial st')

  // A directional belongs to the street, not the city.
  assert.equal(splitUsAddressLine('1711 Sixth Street, SW Canton, OH 44706').city, 'Canton')
  // Step past a unit tail.
  assert.equal(splitUsAddressLine('86 Glocker Way Circle Suite 300 Pottstown, PA 19467').city, 'Pottstown')
  // A grid address has no street type — degrade, never guess.
  const grid = splitUsAddressLine('370 S 200 E Crawfordsville, IN 47933')
  assert.equal(grid.city, null)
  assert.equal(grid.zip5, '47933')
  assert.ok(grid.address_1.startsWith('370'))
})

// ── §3.2 within-source dedupe ────────────────────────────────────────────────

test('within-source dedupe: distinct (company, address) pairs, merged additively', () => {
  const rows = [
    rec({ address_1: '1 main st', zip5: '44706', line_card: ['AD:BPT Bearings'] }),
    rec({ address_1: '1 main st', zip5: '44706', line_card: ['AD:PVF Pipe'], domain: 'acme.com' }),
    rec({ address_1: '2 oak ave', zip5: '44706' }),
  ]
  const { records, in: nIn, out } = dedupeWithinSource(rows)
  assert.equal(nIn, 3)
  assert.equal(out, 2)
  const merged = records.find((r) => r.address_1 === '1 main st')
  assert.deepEqual(merged.line_card.sort(), ['AD:BPT Bearings', 'AD:PVF Pipe'])
  assert.equal(merged.domain, 'acme.com', 'a merge must not lose a field one side had')
})

test('addressKey falls back rather than collapsing every branch onto one key', () => {
  assert.ok(addressKey(rec({ address_1: '1 main st', zip5: '44706' })).startsWith('a:'))
  assert.ok(addressKey(rec({ phone_e164: '3304383000' })).startsWith('p:'))
  assert.ok(addressKey(rec({ lat: 40.1, lng: -81.2 })).startsWith('g:'))
  assert.notEqual(addressKey(rec({ phone_e164: '3304383000' })), addressKey(rec({ phone_e164: '3304383001' })))
})

// ── §3.3 chain suppression ───────────────────────────────────────────────────

test('chain blocklist matches on a word boundary, including the longer trading name', () => {
  assert.equal(chainNameMatch('applied industrial technologies'), 'Applied Industrial')
  assert.equal(chainNameMatch('motion industries'), 'Motion Industries')
  assert.equal(chainNameMatch('dxp enterprises'), 'DXP')
  assert.equal(chainNameMatch('appliedware systems'), null, 'a prefix without a word boundary is not a match')
  assert.equal(chainNameMatch('bdirect supply'), null)
  assert.equal(chainNameMatch(null), null)
})

test('chain blocklist covers every name §3.3 lists', () => {
  for (const { name } of CHAIN_BLOCKLIST) {
    assert.ok(chainNameMatch(normalizeCompany(name)), `${name} does not match itself`)
  }
})

// ── S3: the two measured leaks in §3.3, and the guards that keep it honest ────

test('the name test is token containment, not a prefix — the two biggest chains in the pool', () => {
  // S2 v2 §14: PTDA publishes these two, and the prefix rule saw neither.
  assert.equal(chainNameMatch('motion'), 'Motion Industries', 'PTDA publishes the short form')
  assert.equal(chainNameMatch('ww grainger'), 'Grainger', 'the key sits INSIDE the name')
  // …and the subsidiaries that were sitting seated because of it.
  assert.equal(chainNameMatch('minarik a kaman'), 'Kaman')
  assert.equal(chainNameMatch('catching a kaman'), 'Kaman')
  assert.equal(chainNameMatch('zeller a kaman'), 'Kaman')
  assert.equal(chainNameMatch('florida bearings a kaman'), 'Kaman')
  assert.equal(chainNameMatch('brown bearing div of bdi'), 'BDI')
  assert.equal(chainNameMatch('tool supply a dxp'), 'DXP')
})

test('containment is guarded where the token is a common word — measured false positives', () => {
  // A bare `motion` containment test sweeps these three real independents.
  assert.equal(chainNameMatch('evolution motion solutions'), null)
  assert.equal(chainNameMatch('systems in motion'), null)
  assert.equal(chainNameMatch('power motion'), null)
  // `applied` alone sweeps these four; the entry requires `industrial` as well.
  assert.equal(chainNameMatch('applied bearing distributors'), null)
  assert.equal(chainNameMatch('applied automation'), null)
  assert.equal(chainNameMatch('applied power products'), null)
  assert.equal(chainNameMatch('holland applied technologies'), null)
  // …and the parent is still caught.
  assert.equal(chainNameMatch('applied industrial technologies'), 'Applied Industrial')
  // A token must be a whole token, never a substring.
  assert.equal(chainNameMatch('kamanski supply'), null)
  assert.equal(chainNameMatch('graingerville hardware'), null)
})

test('the domain blocklist catches what a name-shaped blocklist structurally cannot', () => {
  // S2 v2 §14: rs-online.com reached the seated pool as `rs online`.
  assert.equal(chainDomainMatch('rs-online.com'), 'rs-online.com')
  assert.equal(chainDomainMatch('www.dxpe.com'), 'dxpe.com')
  assert.equal(chainDomainMatch('shop.grainger.com'), 'grainger.com', 'a subdomain is the same chain')
  assert.equal(chainDomainMatch('kamandirect.com'), 'kamandirect.com')
  assert.equal(chainDomainMatch('notgrainger.com'), null, 'containment in the STRING is not a match')
  assert.equal(chainDomainMatch('mygrainger.com'), null)
  assert.equal(chainDomainMatch(null), null)
})

test('suppression routes a chain-domain row to chain even when the name is innocent', () => {
  const rows = [
    rec({ company: 'tucker tool', domain: 'dxpe.com', address_1: '1 main st', zip5: '77002' }),
    rec({ company: 'rs americas', domain: 'rs-online.com', address_1: '2 main st', zip5: '76051' }),
    rec({ company: 'honest bearing', domain: 'honestbearing.com', address_1: '3 main st', zip5: '44706' }),
  ]
  const { records, byDomain } = suppressChains(rows)
  assert.equal(records.length, 3, 'nothing is deleted')
  assert.equal(records[0].disposition, 'chain')
  assert.equal(records[1].disposition, 'chain')
  assert.equal(records[2].disposition, null, 'an independent is untouched')
  assert.equal(byDomain.get('tucker tool'), 'dxpe.com')
})

test('the domain test never overwrites a disposition the source already established', () => {
  const rows = [rec({ company: 'zoro', domain: 'zoro.com', disposition: 'not-a-distributor' })]
  assert.equal(suppressChains(rows).records[0].disposition, 'not-a-distributor')
})

test('chain suppression tags, never deletes, and counts DISTINCT ADDRESSES', () => {
  const rows = []
  // 25 branches of one independent, and 25 duplicate rows for a second.
  for (let i = 0; i < 25; i++) rows.push(rec({ company: 'big regional', address_1: `${i} main st`, zip5: '44706' }))
  for (let i = 0; i < 25; i++) rows.push(rec({ company: 'small shop', address_1: '1 oak ave', zip5: '44706' }))
  const deduped = dedupeWithinSource(rows).records
  const { records, byName, bySize } = suppressChains(deduped)

  assert.equal(records.length, deduped.length, 'nothing is deleted')
  assert.equal(bySize.get('big regional'), 25)
  assert.equal(bySize.has('small shop'), false, 'duplicate ROWS must never reach the ≥20 threshold')
  assert.equal(byName.size, 0)
  assert.equal(
    records.filter((r) => r.disposition === 'above-ceiling').length,
    25,
    '§5a: a size-only catch is above the ceiling, not a chain',
  )
  assert.equal(records.filter((r) => r.disposition === 'chain').length, 0)
})

test('the ≥20 threshold reads deduped addresses — the map-8 hazard, in miniature', () => {
  // 12 branches, ingested twice (two map layers). Raw counting says 24 → chain.
  const rows = []
  for (const layer of [0, 1]) {
    for (let i = 0; i < 12; i++) rows.push(rec({ company: 'mid size', address_1: `${i} main st`, zip5: '44706', tier_raw: String(layer) }))
  }
  assert.equal(distinctAddresses(rows).get('mid size').size, 12)
  const deduped = dedupeWithinSource(rows).records
  const { bySize } = suppressChains(deduped)
  assert.equal(bySize.has('mid size'), false, 'a 12-branch independent must not be tagged as a chain')
})

// ── §3.4 rollup + §3.5 cross-source ──────────────────────────────────────────

test('rollup: one record per (source, company), location_count retained', () => {
  const rows = [
    rec({ address_1: '1 main st', zip5: '44706', phone_e164: '3304383000' }),
    rec({ address_1: '2 oak ave', zip5: '44707', phone_e164: '3304383001' }),
  ]
  const [entity] = rollupBranches(rows)
  assert.equal(entity.record.location_count, 2)
  assert.equal(entity.phones.size, 2, 'every branch phone stays available as a join key')
})

test('rollup keeps a chain-tagged row out of a seated one', () => {
  const rows = [rec({ address_1: '1 main st' }), rec({ address_1: '2 oak ave', disposition: 'chain' })]
  assert.equal(rollupBranches(rows).length, 2)
})

test('cross-source: the phone key merges, and the merge is additive', () => {
  const a = rec({ source: 'timken', phone_e164: '3304383000', brand_authorized: ['Timken'], company_display: 'Acme Bearing' })
  const b = rec({
    source: 'ad',
    source_url: 'https://www.adhq.com/y',
    phone_e164: '3304383000',
    brand_authorized: [],
    line_card: ['AD:BPT Bearings'],
    company_display: 'Acme Bearing Company, Inc.',
    email: 'sales@acme.com',
    email_source: 'ad',
  })
  const { merged } = crossSourceDedupe(rollupBranches([a, b]))
  assert.equal(merged.length, 1)
  const r = merged[0].record
  assert.equal(r.evidence_depth, 2)
  assert.deepEqual(r.brand_authorized, ['Timken'])
  assert.deepEqual(r.line_card, ['AD:BPT Bearings'])
  assert.equal(r.company_display, 'Acme Bearing Company, Inc.', 'the longest display name wins')
  assert.equal(r.email, 'sales@acme.com')
  assert.equal(r.source_url.split('|').length, 2, 'every source_url is kept')
  assert.ok(validateRecord(r).ok)
})

test('cross-source: a branch phone in one source still joins the other', () => {
  const timken = [
    rec({ source: 'timken', address_1: '1 main st', zip5: '44706', phone_e164: '3304383000' }),
    rec({ source: 'timken', address_1: '2 oak ave', zip5: '44707', phone_e164: '3304383001' }),
  ]
  const ad = [rec({ source: 'ad', source_url: 'https://www.adhq.com/y', address_1: '2 oak ave', zip5: '44707', phone_e164: '3304383001' })]
  const { merged } = crossSourceDedupe(rollupBranches([...timken, ...ad]))
  assert.equal(merged.length, 1, 'matching must consider every branch phone, not a representative')
})

test('cross-source: name+zip5 carries the join when no phone exists', () => {
  const a = rec({ source: 'timken', zip5: '44706', address_1: '1 main st', phone_e164: null })
  const b = rec({ source: 'ad', source_url: 'https://www.adhq.com/y', zip5: '44706', address_1: '1 main st', phone_e164: null })
  const { merged, stats } = crossSourceDedupe(rollupBranches([a, b]))
  assert.equal(merged.length, 1)
  assert.equal(stats.secondaryMerges, 1)
})

test('cross-source: same name + zip, different street AND different phone = collision, not a merge', () => {
  const a = rec({ source: 'timken', company: 'industrial supply', zip5: '44706', address_1: '1 main st', phone_e164: '3304383000' })
  const b = rec({
    source: 'ad',
    source_url: 'https://www.adhq.com/y',
    company: 'industrial supply',
    zip5: '44706',
    address_1: '900 oak ave',
    phone_e164: '3304389999',
  })
  const { merged, stats } = crossSourceDedupe(rollupBranches([a, b]))
  assert.equal(merged.length, 2, 'a conflicting pair must never merge')
  assert.equal(stats.conflicting, 1)
  assert.equal(stats.collisionRate, 1)
})

test('cross-source: different companies never merge on nothing', () => {
  const a = rec({ source: 'timken', company: 'acme bearing', zip5: '44706', phone_e164: '3304383000' })
  const b = rec({ source: 'ad', source_url: 'https://www.adhq.com/y', company: 'other supply', zip5: '99999', phone_e164: '2125551000' })
  assert.equal(crossSourceDedupe(rollupBranches([a, b])).merged.length, 2)
})

test('cross-source: nothing is lost — every input member is under exactly one output', () => {
  const rows = [
    rec({ source: 'timken', phone_e164: '3304383000' }),
    rec({ source: 'ad', source_url: 'https://www.adhq.com/y', phone_e164: '3304383000' }),
    rec({ source: 'dorner', source_url: 'https://www.dornerconveyors.com/z', company: 'other', phone_e164: '2125551000' }),
  ]
  const { merged } = crossSourceDedupe(rollupBranches(rows))
  assert.equal(merged.reduce((n, m) => n + m.members.length, 0), rows.length)
})

test('mergeRecords: the first non-null wins and provenance is unioned, never replaced', () => {
  const merged = mergeRecords([
    rec({ domain: null, city: 'Canton', source: 'timken', captured: '2026-08-01' }),
    rec({ domain: 'acme.com', city: 'Akron', source: 'ad', source_url: 'https://www.adhq.com/y', captured: '2026-07-31' }),
  ])
  assert.equal(merged.domain, 'acme.com')
  assert.equal(merged.city, 'Canton')
  assert.equal(merged.source, 'timken|ad')
  assert.deepEqual(merged.captured.split('|').sort(), ['2026-07-31', '2026-08-01'])
})


// ── §5a: the chain / above-ceiling split ─────────────────────────────────────

test('suppression: the blocklist means chain, size alone means above-ceiling', () => {
  const rows = []
  for (let i = 0; i < 25; i++) rows.push(rec({ company: 'motion industries', address_1: `${i} main st`, zip5: '44706' }))
  for (let i = 0; i < 25; i++) rows.push(rec({ company: 'purvis industries', address_1: `${i} oak ave`, zip5: '75201' }))
  const { records } = suppressChains(dedupeWithinSource(rows).records)
  const disp = (c) => records.find((r) => r.company === c).disposition
  assert.equal(disp('motion industries'), 'chain')
  assert.equal(disp('purvis industries'), 'above-ceiling', 'a regional independent is not a national chain')
})

test('suppression never overwrites a disposition the source already established', () => {
  const rows = [rec({ company: 'ubuy', domain: 'ubuy.hn', disposition: 'non-US' })]
  const { records } = suppressChains(rows)
  assert.equal(records[0].disposition, 'non-US')
})

// ── S1c: the domain path ─────────────────────────────────────────────────────

const serpRec = (over = {}) =>
  rec({
    source: 'serp',
    source_url: 'https://acme.com/line-card',
    company: 'acme',
    company_display: 'Acme',
    address_1: null,
    phone_e164: null,
    lat: null,
    lng: null,
    needs_identity_resolution: true,
    ...over,
  })

test('addressKey: a domain-only row keys on its domain, not on the empty zip/city bucket', () => {
  assert.equal(addressKey(serpRec({ domain: 'acme.com' })), 'd:acme.com')
  assert.notEqual(addressKey(serpRec({ domain: 'acme.com' })), addressKey(serpRec({ domain: 'other.com' })))
  // The rung sits BELOW address, phone and coordinates, so no locator row moves.
  assert.equal(addressKey(rec({ domain: 'acme.com', address_1: '1 main st', zip5: '44706' })), 'a:1 main st|44706')
  assert.equal(addressKey(rec({ domain: 'acme.com', phone_e164: '3304383000' })), 'p:3304383000')
})

test('isDomainOnly: only a row with a domain and nothing else', () => {
  assert.equal(isDomainOnly(serpRec({ domain: 'acme.com' })), true)
  assert.equal(isDomainOnly(rec({ domain: 'acme.com', phone_e164: '3304383000' })), false)
  assert.equal(isDomainOnly(rec({ domain: null })), false)
})

test('rollup: two SERP domains whose derived names collide stay two companies', () => {
  const ents = rollupBranches([serpRec({ domain: 'motion.com' }), serpRec({ domain: 'ai.motion.com' })])
  assert.equal(ents.length, 2, 'a name we derived ourselves must never merge two published domains')
})

test('domain join: a domain-only entity attaches to the identified entity with that domain', () => {
  const ents = rollupBranches([
    rec({ source: 'timken', company: 'acme bearing', domain: 'acme.com', address_1: '1 main st', zip5: '44706', phone_e164: '3304383000' }),
    serpRec({ domain: 'acme.com' }),
  ])
  const { anchorOf, matched, netNew } = domainAnchors(ents)
  assert.equal(matched, 1)
  assert.equal(netNew, 0)
  assert.equal(anchorOf.size, 1)
  const { merged, stats } = crossSourceDedupe(ents, { domainJoin: true })
  assert.equal(merged.length, 1)
  assert.equal(stats.domainMerges, 1)
  assert.equal(merged[0].record.evidence_depth, 2, 'the domain path is what lifts depth above 1')
})

test('domain join: identified entities are NEVER joined to each other by domain', () => {
  // motion.com carries two different companies in the acquired data. A general
  // domain join would merge them; this one must not.
  const ents = rollupBranches([
    rec({ source: 'timken', company: 'motion industries', domain: 'motion.com', address_1: '1 main st', zip5: '44706' }),
    rec({ source: 'ptda', source_url: 'https://www.ptda.org/x', company: 'kaman industrial', domain: 'motion.com', address_1: '2 oak ave', zip5: '99999' }),
  ])
  const { merged, stats } = crossSourceDedupe(ents, { domainJoin: true })
  assert.equal(merged.length, 2)
  assert.equal(stats.domainMerges, 0)
})

test('domain join: an ambiguous domain picks the largest occupant and says so', () => {
  const ents = rollupBranches([
    rec({ source: 'timken', company: 'big co', domain: 'shared.com', address_1: '1 main st', zip5: '44706' }),
    rec({ source: 'timken', company: 'big co', domain: 'shared.com', address_1: '2 main st', zip5: '44706' }),
    rec({ source: 'ad', source_url: 'https://www.adhq.com/y', company: 'small co', domain: 'shared.com', address_1: '3 oak ave', zip5: '99999' }),
    serpRec({ domain: 'shared.com' }),
  ])
  const { anchorOf, matched, ambiguous } = domainAnchors(ents)
  assert.equal(matched, 1)
  assert.equal(ambiguous, 1)
  const serpIdx = ents.findIndex((e) => e.domainOnly)
  assert.equal(ents[anchorOf.get(serpIdx)].record.company, 'big co', 'the largest occupant anchors')
})

test('domain join: a SERP hit on a chain website inherits chain, not a seat', () => {
  const ents = rollupBranches([
    { ...rec({ source: 'timken', company: 'motion industries', domain: 'motion.com', address_1: '1 main st', zip5: '44706' }), disposition: 'chain' },
    serpRec({ domain: 'motion.com' }),
  ])
  const { anchorOf } = domainAnchors(ents)
  inheritAnchorDisposition(ents, anchorOf)
  assert.equal(ents[1].record.disposition, 'chain')
})

test('domain join: an unmatched SERP domain is net-new and stays seated', () => {
  const ents = rollupBranches([
    rec({ source: 'timken', company: 'acme bearing', domain: 'acme.com', address_1: '1 main st', zip5: '44706' }),
    serpRec({ domain: 'nobody-has-this.com' }),
  ])
  const { matched, netNew, anchorOf } = domainAnchors(ents)
  assert.equal(matched, 0)
  assert.equal(netNew, 1)
  inheritAnchorDisposition(ents, anchorOf)
  assert.equal(ents[1].record.disposition, null)
  assert.equal(crossSourceDedupe(ents, { domainJoin: true }).merged.length, 2)
})

// ── S1c: the contract additions ──────────────────────────────────────────────

test('merge: one identified part resolves the whole — the flag is AND, not OR', () => {
  const merged = mergeRecords([
    serpRec({ domain: 'acme.com' }),
    rec({ source: 'timken', company: 'acme bearing', address_1: '1 main st', zip5: '44706' }),
  ])
  assert.equal(merged.needs_identity_resolution, false)
  assert.equal(mergeRecords([serpRec({ domain: 'a.com' }), serpRec({ domain: 'b.com' })]).needs_identity_resolution, true)
})

test('merge: the page-verbatim declaration wins over a SERP snippet, with its own URL', () => {
  const merged = mergeRecords([
    serpRec({ domain: 'a.com', self_declaration: 'truncated snippet …', self_declaration_verbatim: false, self_declaration_url: 'https://a.com/serp' }),
    serpRec({ domain: 'a.com', self_declaration: 'We are an authorized Parker distributor', self_declaration_verbatim: true, self_declaration_url: 'https://a.com/page' }),
  ])
  assert.equal(merged.self_declaration, 'We are an authorized Parker distributor')
  assert.equal(merged.self_declaration_verbatim, true)
  assert.equal(merged.self_declaration_url, 'https://a.com/page')
})

test('contract: a quoted declaration without its page URL is a provenance bug', () => {
  const bad = rec({ self_declaration: 'We are an authorized Parker distributor', self_declaration_url: null })
  assert.equal(validateRecord(bad).ok, false)
  assert.ok(validateRecord(bad).errors.some((e) => /self_declaration_url/.test(e)))
})

test('contract: verbatim cannot be claimed without the text, and the flags are booleans', () => {
  assert.equal(validateRecord(rec({ self_declaration_verbatim: true })).ok, false)
  const r = rec()
  assert.equal(r.self_declaration_verbatim, false)
  assert.equal(r.needs_identity_resolution, false)
  assert.ok(validateRecord(r).ok)
})

test('contract: the four S1c fields are in FIELDS, so they reach the CSV', () => {
  for (const f of ['self_declaration', 'self_declaration_verbatim', 'self_declaration_url', 'needs_identity_resolution'])
    assert.ok(FIELDS.includes(f), `${f} missing from the export`)
  const csv = toCsv([rec({ self_declaration: 'We sell Parker, Eaton "and" more', self_declaration_url: 'https://a.com/p' })])
  assert.ok(csv.includes('"We sell Parker, Eaton ""and"" more"'), 'a quoted declaration must survive the CSV')
})
