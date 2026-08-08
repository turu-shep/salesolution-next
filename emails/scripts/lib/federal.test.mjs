import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  CEILING_AWARD_HARD_USD,
  CEILING_AWARD_SOFT_USD,
  FEDERAL_FIELDS,
  MANUFACTURING_NAICS,
  MATCH_TIERS,
  NORMALIZER_OPTS,
  PSC_SEGMENT,
  businessTypes,
  ceilingSignal,
  federalEnrichment,
  hasDetail,
  isPlaceholderName,
  isRecentAward,
  joinName,
  joinNames,
  manufacturerRead,
  matchKeys,
  pscSegment,
  segmentAgreement,
} from './federal.mjs'

describe('joinName — the shipped normalizer, at the shipped settings', () => {
  it('strips the §3.1 suffix tokens and lowercases', () => {
    assert.equal(joinName('SCOTT INDUSTRIAL SYSTEMS, INC'), 'scott industrial systems')
    assert.equal(joinName('Scott Industrial Systems'), 'scott industrial systems')
  })

  it('keeps hyphenated names whole — the bare-dash split cost 242 companies', () => {
    // `dashMode: 'any'` would make all three of these the join key `tri`.
    assert.equal(joinName('Tri-State Bearing'), 'tri-state bearing'.replace('-', ' '))
    assert.notEqual(joinName('Tri-State Bearing'), joinName('Tri-County Electrical Supply'))
    assert.notEqual(joinName('Mid-City Supply'), joinName('Mid-West Bearing'))
  })

  it('still strips a whitespace-adjacent dash — that IS a branch qualifier', () => {
    assert.equal(joinName('Motion Ai – MN'), 'motion ai')
    assert.equal(joinName('Coburn Supply Company- Memphis'), 'coburn supply')
    assert.equal(joinName('BHQ - Joliet, IL'), 'bhq')
  })

  it('drops parenthetical and numbered branch tails', () => {
    assert.equal(joinName('Kirby Risk - Crawfordsville (Br# 3)'), 'kirby risk')
    assert.equal(joinName('Elliott Electric Supply, Inc. #187'), 'elliott electric supply')
  })

  it('pins the normalizer settings so the join and its tests cannot drift', () => {
    assert.equal(NORMALIZER_OPTS.stripBranch, true)
    assert.equal(NORMALIZER_OPTS.dashMode, 'adjacent-space')
  })
})

describe('isPlaceholderName', () => {
  it('refuses the GSA synthetic recipient', () => {
    assert.equal(isPlaceholderName('MISCELLANEOUS FOREIGN AWARDEES'), true)
    assert.equal(isPlaceholderName('MISCELLANEOUS FOREIGN AWARDEES, INC.'), true)
  })

  it('refuses redaction strings and empties', () => {
    assert.equal(isPlaceholderName('REDACTED DUE TO PII'), true)
    assert.equal(isPlaceholderName('Unknown'), true)
    assert.equal(isPlaceholderName(''), true)
    assert.equal(isPlaceholderName(null), true)
  })

  it('passes real companies', () => {
    assert.equal(isPlaceholderName('Jamaica Bearings Co Inc'), false)
  })
})

describe('joinNames', () => {
  it('collects display, normalized and alternate names, deduped', () => {
    const names = joinNames({
      company_display: 'SCOTT INDUSTRIAL SYSTEMS, INC',
      company: 'scott industrial systems',
      alternate_names: ['Scott Industrial'],
    })
    assert.deepEqual(names.sort(), ['scott industrial', 'scott industrial systems'])
  })

  it('keeps a domain-derived pool key, which the display name never produces', () => {
    const names = joinNames({
      company_display: 'Scott Industrial Systems',
      company: 'scottindustrialsystems',
    })
    assert.ok(names.includes('scottindustrialsystems'))
    assert.ok(names.includes('scott industrial systems'))
  })

  it('drops placeholders instead of joining on them', () => {
    assert.deepEqual(joinNames({ company_display: 'MISCELLANEOUS FOREIGN AWARDEES' }), [])
  })
})

describe('matchKeys', () => {
  it('emits both tiers when zip and state are present', () => {
    const k = matchKeys({ company_display: 'Acme Bearing Co', zip5: '45424-1199', state: 'Ohio' })
    assert.deepEqual(k.zipKeys, ['acme bearing|45424'])
    assert.deepEqual(k.stateKeys, ['acme bearing|OH'])
  })

  it('emits no zip keys when the ZIP is missing — 42% of the source', () => {
    const k = matchKeys({ company_display: 'Acme Bearing Co', zip5: null, state: 'OH' })
    assert.deepEqual(k.zipKeys, [])
    assert.deepEqual(k.stateKeys, ['acme bearing|OH'])
  })

  it('emits nothing for a Canadian postal code and a non-US state', () => {
    const k = matchKeys({ company_display: 'Acme Bearing Co', zip5: 'M5V 3A8', state: 'ON' })
    assert.deepEqual(k.zipKeys, [])
    assert.deepEqual(k.stateKeys, [])
  })

  it('names the tiers strongest-first', () => {
    assert.deepEqual(MATCH_TIERS, ['name+zip5', 'name+state'])
  })
})

describe('pscSegment — free vertical evidence', () => {
  it('reads bearings as B', () => {
    const v = pscSegment({ 3110: 'BEARINGS, ANTIFRICTION', 3120: 'BEARINGS, PLAIN' })
    assert.equal(v.segment, 'B')
    assert.equal(v.scores.B, 6)
  })

  it('reads pumps and compressors as A', () => {
    const v = pscSegment({ 4320: 'POWER AND HAND PUMPS', 4310: 'COMPRESSORS AND VACUUM PUMPS' })
    assert.equal(v.segment, 'A')
  })

  it('accepts an array of codes as well as the published map', () => {
    assert.equal(pscSegment(['3110', '3130']).segment, 'B')
  })

  it('refuses to decide on one weak code — FLOOR is 4', () => {
    assert.equal(pscSegment({ 4820: 'VALVES, NONPOWERED' }).segment, null)
    assert.equal(pscSegment({ 3990: 'MATERIALS HANDLING' }).segment, null)
  })

  it('refuses to decide when A and B are within MARGIN of each other', () => {
    const v = pscSegment({ 4320: 'PUMPS', 3110: 'BEARINGS' })
    assert.equal(v.scores.A, 3)
    assert.equal(v.scores.B, 3)
    assert.equal(v.segment, null)
  })

  it('caps each axis so one verbose company cannot out-shout the other side', () => {
    const v = pscSegment({ 3110: '', 3120: '', 3130: '', 3040: '', 3020: '', 3030: '' })
    assert.equal(v.scores.B, 6) // 18 points of codes, capped at AXIS_CAP
  })

  it('ignores MRO breadth codes — C is the residual, not a class', () => {
    const v = pscSegment({ 5975: 'ELECTRICAL HARDWARE', 5340: 'HARDWARE, COMMERCIAL' })
    assert.equal(v.segment, null)
    assert.deepEqual(v.evidence, [])
  })

  it('survives null, undefined and empty input', () => {
    for (const input of [null, undefined, {}, []]) assert.equal(pscSegment(input).segment, null)
  })

  it('maps every listed code to a real segment and weight', () => {
    for (const [code, [seg, pts]] of Object.entries(PSC_SEGMENT)) {
      assert.ok(['A', 'B'].includes(seg), `${code} → ${seg}`)
      assert.ok(pts >= 1 && pts <= 3, `${code} weight ${pts}`)
    }
  })
})

describe('segmentAgreement', () => {
  it('flags a decisive disagreement as a contradiction', () => {
    assert.equal(segmentAgreement('A', 'B'), 'contradict')
    assert.equal(segmentAgreement('B', 'A'), 'contradict')
  })

  it('confirms agreement', () => {
    assert.equal(segmentAgreement('A', 'A'), 'corroborate')
  })

  it('treats C as informed, never contradicted — C is the residual', () => {
    assert.equal(segmentAgreement('C', 'A'), 'corroborate-c')
    assert.equal(segmentAgreement('C', 'B'), 'corroborate-c')
  })

  it('says nothing when the PSC codes did not decide', () => {
    assert.equal(segmentAgreement('A', null), 'none')
    assert.equal(segmentAgreement('W', 'A'), 'none')
    assert.equal(segmentAgreement(null, 'A'), 'none')
  })
})

describe('hasDetail / businessTypes — where the manufacturer signal actually lives', () => {
  it('reads observation from has_detail, NOT from the shape of business_flags', () => {
    // The bug this test exists for: `business_flags` is written as a fixed
    // 19-key all-false map on ALL 3,975 records, so key count proves nothing.
    const unprofiled = {
      has_detail: false,
      business_flags: { small_business: false, other_than_small_business: false },
      business_types: [],
    }
    assert.equal(hasDetail(unprofiled), false)
    assert.equal(manufacturerRead(unprofiled).declaredManufacturer, null)
  })

  it('finds manufacturer_of_goods in business_types, where it is published', () => {
    assert.ok(businessTypes({ business_types: ['small_business', 'manufacturer_of_goods'] }).includes('manufacturer_of_goods'))
    // …and NOT in business_flags, which has no such key at all.
    assert.deepEqual(businessTypes({ business_flags: { manufacturer_of_goods: true } }), [])
  })

  it('survives a missing or malformed business_types', () => {
    assert.deepEqual(businessTypes({}), [])
    assert.deepEqual(businessTypes({ business_types: null }), [])
  })
})

describe('manufacturerRead — NAICS must not route alone', () => {
  it('names the agency-coded case: manufacturing NAICS, no self-declaration', () => {
    const r = manufacturerRead({
      has_detail: true,
      naics_codes: { 332991: 'Ball and Roller Bearing Manufacturing' },
      business_types: ['small_business'],
    })
    assert.equal(r.naicsManufacturing, true)
    assert.equal(r.declaredManufacturer, false)
    assert.equal(r.verdict, 'agency-coded') // 44.2% of manufacturing-NAICS companies
  })

  it('believes the company when it declares manufacturing', () => {
    const r = manufacturerRead({
      has_detail: true,
      naics_codes: { 423830: 'Industrial Machinery' },
      business_types: ['manufacturer_of_goods'],
    })
    assert.equal(r.verdict, 'manufacturer')
  })

  it('reads a wholesale NAICS with no declaration as a distributor', () => {
    const r = manufacturerRead({
      has_detail: true,
      naics_codes: { 423610: 'Electrical Apparatus' },
      business_types: ['small_business'],
    })
    assert.equal(r.verdict, 'distributor')
  })

  it('returns unknown below the detail floor — 1,742 records were never profiled', () => {
    const r = manufacturerRead({ has_detail: false, naics_codes: { 332991: '' }, business_types: [] })
    assert.equal(r.declaredManufacturer, null)
    assert.equal(r.verdict, 'unknown')
    assert.equal(r.naicsManufacturing, true) // the NAICS is still observed
  })

  it('knows the three manufacturing codes', () => {
    assert.deepEqual([...MANUFACTURING_NAICS].sort(), ['332991', '333995', '333996'])
  })
})

describe('ceilingSignal — a ceiling tool and nothing else', () => {
  it('hard-excludes a company whose federal book alone reaches the revenue ceiling', () => {
    const s = ceilingSignal({
      cumulative_award_value: 607_844_704,
      business_flags: { other_than_small_business: true },
    })
    assert.equal(s.signal, 'above-ceiling')
  })

  it('DOES exclude Jamaica Bearings — the small_business flag is not a veto', () => {
    // $149M of federal awards, still flagged small_business, because the SBA
    // wholesale standard counts employees. Letting the flag block the exclusion
    // would keep a $149M national in a list capped at $75M of revenue.
    const s = ceilingSignal({
      cumulative_award_value: 149_000_000,
      business_flags: { small_business: true, other_than_small_business: false },
    })
    assert.equal(s.signal, 'above-ceiling')
  })

  it('flags the soft band only with a corroborating other_than_small declaration', () => {
    const value = CEILING_AWARD_SOFT_USD + 1
    assert.equal(
      ceilingSignal({ cumulative_award_value: value, business_flags: { other_than_small_business: true } }).signal,
      'above-ceiling-candidate',
    )
    assert.equal(
      ceilingSignal({ cumulative_award_value: value, business_flags: { small_business: true } }),
      null,
    )
  })

  it('stays silent below the soft threshold even when other_than_small', () => {
    const s = ceilingSignal({
      cumulative_award_value: CEILING_AWARD_SOFT_USD - 1,
      business_flags: { other_than_small_business: true },
    })
    assert.equal(s, null)
  })

  it('never returns a FLOOR signal — there is deliberately no such branch', () => {
    // §5p: award value may exclude at the top and may never be read as evidence
    // that a company clears $2M.
    for (const v of [0, 25_000, 266_511, 2_000_000, 9_999_999]) {
      assert.equal(ceilingSignal({ cumulative_award_value: v, business_flags: {} }), null)
    }
    assert.ok(CEILING_AWARD_HARD_USD > CEILING_AWARD_SOFT_USD)
  })

  it('survives missing values without inventing a signal', () => {
    assert.equal(ceilingSignal({}), null)
    assert.equal(ceilingSignal({ cumulative_award_value: null, business_flags: {} }), null)
    assert.equal(ceilingSignal({ cumulative_award_value: 'n/a' }), null)
  })
})

describe('federalEnrichment', () => {
  const rec = {
    uei: 'ABC123',
    has_detail: true,
    cumulative_award_value: 9_016_432.5,
    award_count_over_floor: 88,
    first_award_date: '2021-03-04',
    last_award_date: '2025-11-30',
    psc_codes: { 4320: 'POWER AND HAND PUMPS', 4310: 'COMPRESSORS' },
    naics_codes: { 423830: 'Industrial Machinery', 333996: 'Fluid Power Pump Mfg' },
    business_flags: { small_business: true },
    business_types: ['small_business'],
    awarding_sub_agencies: { 'Defense Logistics Agency': 88 },
    award_descriptions: ['SHORT', '8511045970!ENVELOPE,POWER UNIT'],
    source_url: 'https://www.usaspending.gov/recipient/abc/latest',
    captured: '2026-08-01',
  }

  it('carries the six briefed fields', () => {
    const e = federalEnrichment(rec)
    assert.equal(e.federal_award_total, 9_016_432.5)
    assert.equal(e.federal_award_count, 88)
    assert.deepEqual(e.psc_codes, ['4310', '4320'].sort())
    assert.deepEqual(e.naics_codes.sort(), ['333996', '423830'])
    assert.equal(e.sba_small_business, true)
    assert.equal(e.federal_first_award, '2021-03-04')
    assert.equal(e.federal_last_award, '2025-11-30')
  })

  it('derives the PSC segment and the manufacturer read', () => {
    const e = federalEnrichment(rec)
    assert.equal(e.federal_psc_segment, 'A')
    assert.equal(e.federal_manufacturer_read, 'agency-coded')
  })

  it('carries the award description byte-exact, prefix and all — S7 trims, not S2', () => {
    assert.equal(federalEnrichment(rec).federal_award_description, '8511045970!ENVELOPE,POWER UNIT')
  })

  it('preserves a negative cumulative value — 200 companies are net-negative', () => {
    const e = federalEnrichment({ ...rec, cumulative_award_value: -1_013_371 })
    assert.equal(e.federal_award_total, -1_013_371)
  })

  it('does NOT turn a missing value into 0 — the §5l ??-on-zero class', () => {
    const e = federalEnrichment({ ...rec, cumulative_award_value: null, award_count_over_floor: null })
    assert.equal(e.federal_award_total, null)
    assert.equal(e.federal_award_count, null)
  })

  it('keeps a real zero as zero', () => {
    assert.equal(federalEnrichment({ ...rec, award_count_over_floor: 0 }).federal_award_count, 0)
  })

  it('reports sba_small_business as null, not false, below the detail floor', () => {
    // has_detail decides, NOT the presence of the always-written flag map.
    const e = federalEnrichment({ ...rec, has_detail: false, business_flags: { small_business: false } })
    assert.equal(e.sba_small_business, null)
  })

  it('rejects a malformed date rather than passing it through', () => {
    const e = federalEnrichment({ ...rec, first_award_date: 'null', last_award_date: '' })
    assert.equal(e.federal_first_award, null)
    assert.equal(e.federal_last_award, null)
  })

  it('carries provenance on every enrichment — §1 requires it', () => {
    const e = federalEnrichment(rec, { tier: 'name+zip5' })
    assert.equal(e.federal_source_url, 'https://www.usaspending.gov/recipient/abc/latest')
    assert.equal(e.federal_captured, '2026-08-01')
    assert.equal(e.federal_match_tier, 'name+zip5')
  })

  it('emits exactly the declared field set', () => {
    assert.deepEqual(Object.keys(federalEnrichment(rec)).sort(), [...FEDERAL_FIELDS].sort())
  })

  it('survives a bare record with no arrays or maps', () => {
    const e = federalEnrichment({ uei: 'X' })
    assert.deepEqual(e.psc_codes, [])
    assert.deepEqual(e.naics_codes, [])
    assert.equal(e.federal_award_description, null)
  })
})

describe('isRecentAward', () => {
  it('reads 2024+ as a live relationship', () => {
    assert.equal(isRecentAward({ federal_last_award: '2025-11-30' }), true)
    assert.equal(isRecentAward({ federal_last_award: '2023-12-31' }), false)
    assert.equal(isRecentAward({ federal_last_award: null }), false)
    assert.equal(isRecentAward({}), false)
  })
})
