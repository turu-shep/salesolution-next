/**
 * map — raw payload → §1 contract records. S2 step 1, "normalize every source".
 *
 * One mapper per acquired source. All are PURE: they take the raw payload that
 * `emails/data/raw/<source>-<date>.json` holds and return contract records. No
 * I/O, no network, no clock — so S2 replays from disk and never re-hits an
 * origin, and the mapping is unit-testable.
 *
 * The two rules that shape every mapper (build-plan §1):
 *   - `company` is the JOIN KEY (normalized); `company_display` is what goes in
 *     the email. Both are carried from here on.
 *   - `line_card[]` is NOT `brand_authorized[]`. A locator proves exactly one
 *     brand — its own. Product families, divisions and business units go to
 *     `line_card`, where they cannot inflate the brand count S3 reads as a size
 *     proxy.
 *
 * Tests: emails/scripts/lib/map.test.mjs
 */
import { makeRecord } from './contract.mjs'
import {
  apexDomain,
  decodeEntities,
  displayName,
  domainLabelName,
  isForeignCcTld,
  normalizeAddress,
  normalizeCompany,
  normalizeEmail,
  normalizePhone,
  normalizeState,
  normalizeZip5,
  splitUsAddressLine,
} from './normalize.mjs'

/** Country strings the acquired sources use for the US. */
export const isUS = (country) =>
  /^(usa|u\.?s\.?a?\.?|united states(?: of america)?)$/i.test(String(country ?? '').trim())

const splitList = (raw, sep = ',') =>
  String(raw ?? '')
    .split(sep)
    .map((s) => decodeEntities(s).replace(/\|+$/, '').trim())
    .filter(Boolean)

// ─────────────────────────────────────────────────────────────────────────────
// Timken — WP Google Maps markers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * "123 MAIN ST, STE B, AKRON, OH, 44301-1234, USA" → parts, right-anchored.
 * ~1.7% of rows carry a secondary unit as an extra 6th part, which left-anchored
 * indexing gets wrong. Right-anchored parses 100% of US rows; left-anchored 98.3%.
 */
export function parseTimkenAddress(raw) {
  const p = String(raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s, i, a) => s !== '' || i === a.length - 1)
  if (p.length < 5) return { address_1: null, city: null, state: null, zip5: null, country: p.at(-1) ?? null }
  return {
    country: p.at(-1),
    zip5: normalizeZip5(p.at(-2)),
    state: normalizeState(p.at(-3)),
    city: p.at(-4) || null,
    address_1: normalizeAddress(p.slice(0, -4).join(' ')),
  }
}

/** The phone lives inside the description HTML as a tel: href. */
export function parseTimkenPhone(description) {
  const m = String(description ?? '').match(/tel:([^'"<>]*)/i)
  return m ? normalizePhone(m[1]) : null
}

/**
 * Timken markers → records. US only; non-US stays in raw (nothing is deleted,
 * and S1 already kept the full payload).
 *
 * `mapIds` defaults to map 2 ALONE. Map 8 is a settled duplicate: 9,002 raw
 * records, 1,895 companies, 1,890 of which are already in map 2 — five net-new.
 * Ingesting both doubles every location count (Motion Industries 378 → 704),
 * which silently turns the ≥20-location chain threshold into ≥10.
 *
 * @param {{maps: {map_id: string, source_url: string, captured: string, markers: any[]}[]}} payload
 * @param {{mapIds?: string[], stripBranch?: boolean}} [opts]
 */
export function mapTimken(payload, opts = {}) {
  const { mapIds = ['2'], ...norm } = opts
  const out = []
  for (const m of payload.maps ?? []) {
    if (mapIds && !mapIds.includes(String(m.map_id))) continue
    for (const mk of m.markers ?? []) {
      const addr = parseTimkenAddress(mk.address)
      if (!isUS(addr.country)) continue
      out.push(
        makeRecord({
          company: normalizeCompany(mk.title, norm),
          company_display: displayName(mk.title),
          domain: apexDomain(mk.link),
          address_1: addr.address_1,
          city: addr.city,
          state: addr.state,
          zip5: addr.zip5,
          phone_e164: parseTimkenPhone(mk.description),
          lat: mk.lat,
          lng: mk.lng,
          source: 'timken',
          source_url: m.source_url,
          captured: m.captured,
          brand_authorized: ['Timken'],
          line_card: [], // `category` is a numeric map-layer code, not a product family
          tier_raw: mk.category || (Array.isArray(mk.categories) ? mk.categories[0] : null),
        }),
      )
    }
  }
  return out
}

// ─────────────────────────────────────────────────────────────────────────────
// Enerpac — Oracle Commerce distributorLocator.json
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Enerpac distributors → records. US only.
 * "Products Carried" is the per-dealer line card (5 Enerpac product families) —
 * it goes to `line_card`, never to `brand_authorized`, which gets ['Enerpac'].
 * "E-Mail" is populated on 64% of US rows and is Cohort E material (§7.2).
 *
 * @param {{records: any[], source_url: string, captured: string}} payload
 */
export function mapEnerpac(payload, opts = {}) {
  return (payload.records ?? [])
    .filter((r) => isUS(r.Country))
    .map((r) =>
      makeRecord({
        company: normalizeCompany(displayName(r.Name), opts),
        company_display: displayName(r.Name),
        domain: apexDomain(r.URL),
        email: normalizeEmail(r['E-Mail']),
        email_source: normalizeEmail(r['E-Mail']) ? 'enerpac' : null,
        address_1: normalizeAddress(r.Street),
        city: r.City,
        state: normalizeState(r['State/Province']),
        zip5: normalizeZip5(r['Postal Code']),
        phone_e164: normalizePhone(r.Phone),
        lat: r.Latitude,
        lng: r.Longitude,
        source: 'enerpac',
        source_url: payload.source_url,
        captured: payload.captured,
        brand_authorized: ['Enerpac'],
        line_card: splitList(r['Products Carried']),
        distributor_type: r['Distributor Type'],
        tier_raw: r.Tier,
      }),
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// AD (Affiliated Distributors) — member locator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * §2a. AD's nine reachable divisions, and which are ICP-shaped for Catalog AI.
 * BPT/PVF/ISD stay in the main pool; the rest are real businesses and the wrong
 * buyer, so they get `disposition: adjacent-trade` and a side pool. Nothing is
 * deleted. 530 companies carry 2+ divisions, so classification is on the UNION.
 */
export const AD_ICP_DIVISIONS = new Set(['BPT', 'PVF', 'ISD'])
/** GSD is a judgement call, not a guess — reported, never auto-routed. */
export const AD_UNDECIDED_DIVISIONS = new Set(['GSD'])
export const AD_ADJACENT_DIVISIONS = new Set(['ESD', 'PLBG', 'HVAC', 'WWD', 'BSDC'])

/**
 * AD members → records.
 *
 * AD is a buying group, not a manufacturer, so `brand_authorized` stays EMPTY —
 * membership proves no brand authorization. The division is a product category,
 * so it goes to `line_card` as `AD:<CODE> <label>`, which keeps the §2a
 * classification readable straight off the contract record after a merge.
 *
 * @param {{records: any[]}} payload
 */
export function mapAd(payload, opts = {}) {
  return (payload.records ?? []).map((r) => {
    const addr = splitUsAddressLine(r.address_raw)
    return makeRecord({
      company: normalizeCompany(r.company, opts),
      company_display: displayName(r.company),
      // `website` is the "Visit Website" anchor only; §2b confirmed 0 of 5,438
      // rows hold a Maps URL. The cleaner still runs — it costs nothing.
      domain: apexDomain(r.website),
      address_1: addr.address_1,
      city: addr.city,
      state: addr.state,
      zip5: normalizeZip5(r.zip) ?? addr.zip5,
      phone_e164: normalizePhone(r.phone_raw),
      lat: r.lat,
      lng: r.lng,
      source: 'ad',
      source_url: r.source_url,
      captured: r.captured,
      brand_authorized: [],
      line_card: r.division_code ? [`AD:${r.division_code} ${r.division_label ?? ''}`.trim()] : [],
      tier_raw: null,
    })
  })
}

/** Pull the AD division codes back out of a (possibly merged) `line_card`. */
export function adDivisionCodes(lineCard = []) {
  const out = new Set()
  for (const item of lineCard) {
    const m = String(item).match(/^AD:([A-Z]+)\b/)
    if (m) out.add(m[1])
  }
  return out
}

// ─────────────────────────────────────────────────────────────────────────────
// Dorner — inline distributorPlaces array
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dorner distributors → records. `address_2` is "City, State ZIP".
 * `markets` is the pipe-separated facet set (Automation, Food Industry, …) —
 * line card, not brands. Email fill is 95.9%, the richest of the five.
 *
 * @param {{records: any[]}} payload
 */
export function mapDorner(payload, opts = {}) {
  return (payload.records ?? [])
    .filter((r) => isUS(r.country))
    .map((r) => {
      const tail = String(r.address_2 ?? '').match(/^(.*?),\s*([^,]+?)\s+(\d{5})(?:-\d{4})?\s*$/)
      const email = normalizeEmail(r.email)
      return makeRecord({
        company: normalizeCompany(r.company, opts),
        company_display: displayName(r.company),
        domain: apexDomain(r.website),
        email,
        email_source: email ? 'dorner' : null,
        address_1: normalizeAddress(r.address_1),
        city: tail ? tail[1].trim() : null,
        state: tail ? normalizeState(tail[2]) : null,
        zip5: tail ? normalizeZip5(tail[3]) : normalizeZip5(r.address_2),
        phone_e164: normalizePhone(r.phone_raw ?? r.phone_formatted),
        lat: r.lat,
        lng: r.lng,
        source: 'dorner',
        source_url: r.source_url,
        captured: r.captured,
        brand_authorized: ['Dorner'],
        line_card: splitList(r.markets, '|'),
        tier_raw: r.tier_raw,
      })
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// SPX FLOW — MetaLocator directory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SPX FLOW locations → records, ONE PER `id`.
 *
 * The raw pull repeats a location once per business unit and once per matching
 * territory ZIP: 2,157 rows for 505 distinct locations. Collapsing on `id` here
 * is the within-source dedupe the source's own shape demands, and it unions
 * `businessunit` + `taglist` into the line card while doing it.
 *
 * `priority_name` is NOT a quality tier — the values are product-line names
 * ("Johnson Pump Marine", "Nutrition & Health"). It stays in `tier_raw`,
 * unmapped, per the Adaptall warning.
 *
 * @param {{records: any[]}} payload
 */
export function mapSpxflow(payload, opts = {}) {
  const byId = new Map()
  for (const r of payload.records ?? []) {
    if (!isUS(r.country)) continue
    const id = String(r.id ?? '')
    if (!id) continue
    let e = byId.get(id)
    if (!e) {
      e = { first: r, lineCard: new Set(), tiers: new Set() }
      byId.set(id, e)
    }
    if (r.businessunit) e.lineCard.add(decodeEntities(r.businessunit).trim())
    for (const t of splitList(r.taglist)) e.lineCard.add(t)
    if (r.priority_name) e.tiers.add(String(r.priority_name).trim())
    // Prefer the row that actually carries contact data.
    if (!e.first.email && r.email) e.first = { ...e.first, email: r.email }
  }

  return [...byId.values()].map(({ first: r, lineCard, tiers }) => {
    const email = normalizeEmail(r.email)
    return makeRecord({
      company: normalizeCompany(r.name ?? r.title, opts),
      company_display: displayName(r.name ?? r.title),
      domain: apexDomain(r.link),
      email,
      email_source: email ? 'spxflow' : null,
      address_1: normalizeAddress([r.address, r.address2].filter(Boolean).join(' ')),
      city: r.city,
      state: normalizeState(r.state),
      zip5: normalizeZip5(r.postalcode),
      phone_e164: normalizePhone(r.phone) ?? normalizePhone(r.phone2),
      lat: r.lat,
      lng: r.lng,
      source: 'spxflow',
      source_url: r.source_url,
      captured: r.captured,
      brand_authorized: ['SPX FLOW'],
      line_card: [...lineCard],
      distributor_type: r.type || null,
      tier_raw: [...tiers].join(', ') || null,
    })
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// PTDA — Power Transmission Distributors Association member locator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PTDA's 14 product categories are the association's own taxonomy, queried one
 * at a time, so a company's category set is the union of the queries it came
 * back on. `(Any)` is the unfiltered sweep, not a category — it is dropped from
 * the line card rather than counted as a 15th.
 */
export const PTDA_ANY_CATEGORY = '(Any)'

/**
 * PTDA members → records.
 *
 * PTDA is a trade association, not a manufacturer: membership proves no brand
 * authorization, so `brand_authorized` stays EMPTY — same rule AD gets. The
 * product category goes to `line_card` as `PTDA:<CATEGORY>`, which keeps the
 * taxonomy readable straight off the contract record after a merge, matching the
 * `AD:<CODE>` convention.
 *
 * ~7% of rows publish a phone and a website but no address at all. They are kept
 * — `addressKey` falls back to the phone, so they degrade to one location rather
 * than being discarded or collapsing a company's branches onto one key.
 *
 * @param {{records: any[]}} payload
 */
export function mapPtda(payload, opts = {}) {
  return (payload.records ?? []).map((r) => {
    const category = String(r.product_category ?? '').trim()
    return makeRecord({
      company: normalizeCompany(r.company, opts),
      company_display: displayName(r.company),
      domain: apexDomain(r.website),
      address_1: normalizeAddress(r.address_1),
      city: r.city,
      state: normalizeState(r.state),
      zip5: normalizeZip5(r.zip),
      phone_e164: normalizePhone(r.phone_raw) ?? normalizePhone(r.toll_free_raw),
      source: 'ptda',
      source_url: r.source_url,
      captured: r.captured,
      brand_authorized: [],
      line_card: category && category !== PTDA_ANY_CATEGORY ? [`PTDA:${category}`] : [],
      tier_raw: null,
    })
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// SERP self-identification — DOMAIN-KEYED, no address, no phone
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SERP classifications that are not a distributor at all. Tagged and parked
 * (`disposition: not-a-distributor`), never deleted — the no-delete rule applies
 * to a manufacturer's own page as much as to a company we can't sell.
 */
export const SERP_NON_DEALER = new Set([
  'manufacturer',
  'marketplace_directory',
  'social_jobs_forum',
  'gov_edu',
  'trade_press',
])
/** The acquirer's own foreign flag. Routed to `non-US`, alongside the TLD test. */
export const SERP_FOREIGN = 'foreign_tld'

/** Title separators publishers use between the page name and the brand name. */
const TITLE_SPLIT = /\s*(?:\||–|—|·|»|::|:|•)\s*|\s+-\s+/
/** Title segments that are a page label, not a company. */
const TITLE_NOISE = new Set([
  'home', 'homepage', 'products', 'product', 'about', 'about us', 'contact', 'contact us',
  'welcome', 'shop', 'store', 'blog', 'news', 'services', 'distributor', 'distributors',
  'dealer', 'dealers', 'industrial', 'catalog', 'search', 'index',
])

const squash = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '')

/**
 * Best published name for a domain, from the titles of the pages that ranked.
 *
 * A SERP title is a page title, not a company name — "Authorized Parker
 * Distributor | Valin" names Parker twice and the company once, at the end. The
 * only segment we can trust is one that **corroborates the domain**: its
 * squashed form contains, or is contained by, the domain's own label. Anything
 * else falls back to the domain label, and every record built this way carries
 * `needs_identity_resolution: true` regardless.
 *
 * Measured on the S1c payload: 209 of 1,474 domains yield a corroborated title
 * segment. The other 1,265 get a prettified domain label and wait for S3.
 *
 * @param {string} apex
 * @param {string[]} titles  page title first, then SERP titles by rank
 * @returns {{display: string|null, from: 'title'|'domain'}}
 */
export function serpCompanyName(apex, titles = []) {
  const label = squash(String(apex ?? '').split('.')[0])
  let best = null
  for (const t of titles) {
    for (const seg of decodeEntities(t).split(TITLE_SPLIT)) {
      const s = seg.replace(/\s+/g, ' ').trim()
      if (!s || s.length > 60) continue
      if (TITLE_NOISE.has(s.toLowerCase())) continue
      const q = squash(s)
      if (!q || !label) continue
      if (!(label.includes(q) || q.includes(label))) continue
      // Prefer the segment closest to a two-word company name.
      const cost = Math.abs(s.split(' ').length - 2)
      if (!best || cost < best.cost) best = { s, cost }
    }
  }
  return best ? { display: best.s, from: 'title' } : { display: domainLabelName(apex), from: 'domain' }
}

/**
 * SERP self-identification → ONE RECORD PER APEX DOMAIN.
 *
 * This is the only source with no address and no phone, so it breaks both §3.5
 * join keys. Its identity is the domain; the cross-source join reaches it
 * through the domain path in `dedupe.mjs`, and everything it cannot prove stays
 * null. **Nothing is invented** — no address, no phone, no city, no state.
 *
 * Two payloads, one record:
 *   `serp`  the 250-query SERP program (6,397 results, classified at acquisition)
 *   `pages` the bounded fetch pass that re-read 406 of those pages on the
 *           dealer's own site (`quotable_on_page`), which is what upgrades a
 *           declaration from "Google's truncation of it" to page-verbatim.
 *
 * `brand_authorized[]` gets the brands the page actually names — that is real
 * authorization evidence, the dealer's own claim. `line_card[]` stays empty:
 * SERP publishes brands, not product families, and folding brands in would
 * inflate the breadth S3 reads as a size proxy (§1).
 *
 * @param {{serp: {records: any[]}, pages?: {records: any[]}}} payload
 */
export function mapSerp(payload, opts = {}) {
  const { serp = { records: [] }, pages = { records: [] } } = payload

  const byPageDomain = new Map()
  for (const r of pages.records ?? []) {
    const apex = apexDomain(r.domain)
    if (!apex) continue
    // One fetched page per domain in the S1c payload; if that ever changes, the
    // page with a quotable declaration wins over one without.
    const prev = byPageDomain.get(apex)
    if (!prev || (r.quotable_on_page && !prev.quotable_on_page)) byPageDomain.set(apex, r)
  }

  const groups = new Map()
  for (const r of serp.records ?? []) {
    const apex = apexDomain(r.domain)
    if (!apex) continue // a host that will not parse is not a lead; it stays in raw
    if (!groups.has(apex)) groups.set(apex, [])
    groups.get(apex).push(r)
  }

  const out = []
  for (const [apex, rows] of groups) {
    const ranked = [...rows].sort((a, b) => (a.rank_absolute ?? 999) - (b.rank_absolute ?? 999))
    const page = byPageDomain.get(apex)

    // A domain that ranked as a dealer anywhere IS a dealer candidate — the
    // strongest claim wins over an incidental classification on another query.
    const isDealer = rows.some((r) => r.classification === 'dealer_candidate')
    const classification = isDealer ? 'dealer_candidate' : ranked[0].classification
    const foreign = classification === SERP_FOREIGN || isForeignCcTld(apex)
    const disposition = foreign
      ? 'non-US'
      : SERP_NON_DEALER.has(classification)
        ? 'not-a-distributor'
        : null

    const name = serpCompanyName(apex, [page?.page_title, ...ranked.map((r) => r.title)].filter(Boolean))

    // The dealer's own words. Page-verbatim beats the SERP snippet, which Google
    // truncates and rewrites; boilerplate beats nothing but is marked as such by
    // the acquirer and only used when there is no clean sentence.
    //
    // **A NEGATED declaration is never copy.** Wave 3 measured brokers and
    // resellers publishing the inverse sentence — "is **not** an authorized
    // distributor" — at 2.5% of declaration records, with 30 net-new domains
    // carrying *only* that form. A naive regex reads it as a claim; quoting one
    // back at a prospect would be a catastrophe. The acquirer flags it, and the
    // flag is honoured here rather than downstream, so no stage can reach a
    // negated sentence at all. Waves 1 and 2 predate the flag; `!== true` reads
    // their `undefined` as "unchecked", which is what it is.
    const notNegated = (x) => x?.is_negated !== true && x?.declaration_is_negated !== true
    const pageDecl = (page?.page_declarations ?? []).find((d) => d && d.text && !d.is_boilerplate && notNegated(d))
    const serpClean = ranked.find((r) => r.declaration && !r.declaration_is_boilerplate && notNegated(r))
    const serpAny = ranked.find((r) => r.declaration && notNegated(r))
    // Recorded, never seated as copy: a domain whose ONLY published sentence is
    // a disclaimer. Nothing is deleted — it goes to the run's negated sink so
    // `_negated-declarations-*.json` can name it and nobody re-derives it.
    if (Array.isArray(opts.negatedSink)) {
      const negated = ranked.filter((r) => r.declaration && !notNegated(r))
      if (negated.length && !pageDecl && !serpAny)
        opts.negatedSink.push({
          domain: apex,
          declaration_verbatim: negated[0].declaration,
          declaration_match: negated[0].declaration_match ?? null,
          source_url: negated[0].source_url ?? negated[0].page_url ?? null,
          captured: negated[0].captured ?? null,
          source_wave: negated[0].source_wave ?? 'wave1',
          why: 'declaration_is_negated — the page says the company is NOT an authorized distributor',
        })
    }
    const declSource = pageDecl
      ? { text: pageDecl.text, url: page.final_url || page.page_url, verbatim: true }
      : serpClean
        ? { text: serpClean.declaration, url: serpClean.page_url, verbatim: false }
        : serpAny
          ? { text: serpAny.declaration, url: serpAny.page_url, verbatim: false }
          : null

    const brands = new Set()
    for (const r of ranked) for (const b of r.brands_named ?? []) brands.add(String(b).trim())
    for (const b of page?.brands_named_on_page ?? []) brands.add(String(b).trim())

    const urls = new Set(ranked.map((r) => r.source_url).filter(Boolean))
    if (page?.source_url) urls.add(page.source_url)
    const captured = new Set(ranked.map((r) => r.captured).filter(Boolean))
    if (page?.captured) captured.add(page.captured)

    out.push(
      makeRecord({
        company: normalizeCompany(name.display, opts),
        company_display: name.display,
        domain: apex,
        // No address, no phone, no coordinates. The source does not publish them
        // and S2 does not invent them.
        source: 'serp',
        source_url: [...urls].join('|'),
        captured: [...captured].join('|'),
        brand_authorized: [...brands].filter(Boolean),
        line_card: [],
        distributor_type: null,
        tier_raw: classification,
        disposition,
        // Text preserved exactly as published — this is email copy (§1).
        self_declaration: declSource ? decodeEntities(declSource.text) : null,
        self_declaration_verbatim: Boolean(declSource?.verbatim),
        self_declaration_url: declSource ? declSource.url : null,
        // Cleared by `mergeRecords` the moment this domain joins an identified
        // record; until then it is a website and a claim, nothing more.
        needs_identity_resolution: true,
      }),
    )
  }
  return out
}

// ─────────────────────────────────────────────────────────────────────────────
// DataForSEO business listings — §5f, the bulk of the haul
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DFS Google-Maps listings → one record per listing.
 *
 * The best NAP density in the program (phone 97.2%, ZIP 99.9%, website 87.5%)
 * and the only source that ships a **usable vertical code**: `category_ids`,
 * 4.33 per record across 1,694 distinct codes. Those go to `line_card[]` as
 * `DFS:<code>`, matching the `AD:` and `PTDA:` conventions — source-native,
 * verbatim, unmapped, and readable straight off the contract record after a
 * merge. `category.mjs` is the only thing that interprets them, which is §5e's
 * rule: capture the code, interpret it late, in one place.
 *
 * `brand_authorized` stays EMPTY. A Google Maps listing proves a business
 * exists; it proves nothing about which manufacturer authorized it.
 *
 * `tier_raw` carries the listing's own claimed/review state verbatim
 * (`claimed=true;votes=37;rating=4.6`) because there is nowhere else in the
 * contract for it and §4.5 needs review counts as a size proxy. Per §3's rule it
 * is UNMAPPED — nothing reads it as a quality signal; `size.mjs` parses the
 * vote count out of it and nothing else does.
 *
 * @param {{records: any[]}} payload
 */
export function mapDfs(payload, opts = {}) {
  const out = []
  for (const r of payload.records ?? []) {
    if (r.country_code && String(r.country_code).toUpperCase() !== 'US') continue
    const email = (r.emails ?? []).map(normalizeEmail).find(Boolean) ?? null
    const votes = r.rating?.votes_count
    const tier = [
      r.is_claimed === true ? 'claimed=true' : r.is_claimed === false ? 'claimed=false' : null,
      votes != null ? `votes=${votes}` : null,
      r.rating?.value != null ? `rating=${r.rating.value}` : null,
    ]
      .filter(Boolean)
      .join(';')
    out.push(
      makeRecord({
        company: normalizeCompany(r.company_display, opts),
        company_display: displayName(r.company_display),
        domain: apexDomain(r.domain) ?? apexDomain(r.website),
        email,
        email_source: email ? 'dfs' : null,
        address_1: normalizeAddress(r.street),
        city: r.city,
        state: normalizeState(r.state_region),
        zip5: normalizeZip5(r.zip),
        phone_e164: normalizePhone(r.phone),
        lat: r.latitude,
        lng: r.longitude,
        source: 'dfs',
        source_url: r.source_url,
        captured: r.captured,
        brand_authorized: [],
        line_card: (r.category_ids ?? []).map((c) => `DFS:${String(c).trim()}`).filter((c) => c !== 'DFS:'),
        distributor_type: r.category_display ?? null,
        tier_raw: tier || null,
      }),
    )
  }
  return out
}

// ─────────────────────────────────────────────────────────────────────────────
// The nine easy-tier locators — one shape, nine configs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Per-locator configuration. Every acquirer in `scripts/sources/` already emits
 * the same flat shape (`company`, `address_1`, `city`, `state`, `zip_raw`,
 * `phone_10`, `email`, `website`/`domain`, `lat`, `lng`, `is_us`), so one mapper
 * covers all nine. What differs is only the SOURCE-NATIVE CODE each one
 * publishes — and §5e says that is the field that matters most, so each source
 * names its own field here rather than being averaged into a generic string.
 *
 *   `brand`      the manufacturer whose locator this is → `brand_authorized[]`.
 *                One brand, exactly what the locator proves.
 *   `codeFields` source-native code fields, carried VERBATIM into `tier_raw` as
 *                `field=value`. NTN's `categories_raw` is an explicit
 *                Industrial-vs-HD-Truck/Automotive split; Banjo's `filters_raw`
 *                is Agricultural-vs-Industrial; Kennametal's `industries_raw`
 *                separates metalworking from road rehabilitation. These are the
 *                §5e codes for these sources and they must not be averaged over.
 *   `typeField`  the locator's own dealer-type string → `distributor_type`.
 */
export const LOCATOR_CONFIG = {
  nord: { brand: 'NORD', codeFields: ['type_raw'], typeField: 'type_raw' },
  lovejoy: { brand: 'Lovejoy', codeFields: ['categories_raw', 'brand_raw', 'special_raw'], typeField: null },
  ballymore: { brand: 'Ballymore', codeFields: ['tier_raw', 'category_tag_ids'], typeField: null },
  ntn: { brand: 'NTN', codeFields: ['categories_raw'], typeField: 'categories_raw' },
  banjo: { brand: 'Banjo', codeFields: ['filters_raw'], typeField: 'filters_raw' },
  kennametal: {
    brand: 'Kennametal',
    codeFields: ['industries_raw', 'location_type_raw', 'certified_partner'],
    typeField: 'location_type_raw',
  },
  atlascopco: { brand: 'Atlas Copco', codeFields: [], typeField: null },
  gast: { brand: 'Gast', codeFields: [], typeField: null },
  quincy: { brand: 'Quincy Compressor', codeFields: ['is_lead_manager', 'is_store_locator'], typeField: null },
  // ── the small-locator tail (§5i, folded in 2026-08-01) ────────────────────
  // Yaskawa is the third independent confirmation of §5e's rule and the reason
  // §5i made it standing: `product_group_code` (the locator's `groupList`
  // parameter) sorts D09/D02/D33 industrial from D13 HVAC and D23 iQpump
  // water/wastewater, and **69 of its 232 companies are reachable ONLY through
  // the off-ICP groups**. Captured here, decoded in `SOURCE_VERTICAL_PRIORS`.
  yaskawa: {
    brand: 'Yaskawa',
    codeFields: ['product_group_code', 'product_group_label', 'tier_tokens_raw'],
    typeField: 'tier_tokens_raw',
  },
  // The acquirers recorded `vertical_code: null` for these three after checking
  // — no code any of them publishes encodes vertical. Carried anyway, unmapped,
  // per §5i: capture every source-native code verbatim and interpret it late.
  interroll: {
    brand: 'Interroll',
    codeFields: ['partner_tier_token', 'approved_logo_raw', 'breadcrumb_category', 'solutions_raw'],
    typeField: 'partner_tier_token',
  },
  flexlink: {
    brand: 'FlexLink',
    codeFields: ['partner_level_code', 'partner_level_label', 'country_code'],
    typeField: 'partner_level_label',
  },
  mknorthamerica: {
    brand: 'mk North America',
    codeFields: ['category_code', 'category_label', 'products_raw', 'is_mk_employee'],
    typeField: 'category_label',
  },
}

/**
 * One of the nine easy-tier locators → records. US rows only; the acquirers
 * already set `is_us`, and a foreign row is dropped at the SOURCE boundary the
 * same way `mapTimken` drops non-US markers — it never entered the contract, so
 * the no-delete rule (which governs contract records) is not in play.
 *
 * @param {{records: any[]}} payload
 * @param {{source: string} & Record<string, any>} opts  `source` is required
 */
export function mapLocator(payload, opts = {}) {
  const source = opts.source
  const cfg = LOCATOR_CONFIG[source]
  if (!cfg) throw new Error(`mapLocator: no config for source "${source}"`)

  return (payload.records ?? [])
    .filter((r) => r.is_us === true)
    .map((r) => {
      // One `field=value` token per value. Kennametal publishes multi-valued
      // industries as `grader blades|snowplow blades`, and a source-native code
      // that arrives glued to its neighbour cannot be matched later — which is
      // the whole point of carrying it (§5e). Split on the source's own
      // separator, emit one token each, join with `;`.
      //
      // **Arrays are split as arrays, not stringified.** §5j found `split()`
      // turning `['Enerpac','Timken']` into the single token `"Enerpac,Timken"`
      // and §5f's re-rank found the same class again in an export. This is the
      // third: Interroll publishes `solutions_raw` and mk North America
      // publishes `products_raw` as JSON arrays, and `String(v).split('|')`
      // would have glued each of them into one unmatchable code — the exact
      // failure `SOURCE_VERTICAL_PRIORS` keys against.
      const codes = cfg.codeFields
        .flatMap((f) => {
          const v = r[f]
          if (v === null || v === undefined || v === '') return []
          const parts = Array.isArray(v) ? v : String(v).split('|')
          return parts
            .map((part) => String(part).trim())
            .filter(Boolean)
            .map((part) => `${f}=${part}`)
        })
        .join(';')
      const email = normalizeEmail(r.email)
      // Several of these publish `address_raw` and nothing parsed; the shared
      // splitter is what `mapSpxflow` already uses for the same problem.
      const parsed = r.address_1 ? null : splitUsAddressLine(r.address_raw)
      return makeRecord({
        company: normalizeCompany(r.company, opts),
        company_display: displayName(r.company),
        domain: apexDomain(r.domain) ?? apexDomain(r.website),
        email,
        email_source: email ? source : null,
        address_1: normalizeAddress(r.address_1 ?? parsed?.address_1),
        city: r.city ?? parsed?.city ?? null,
        state: normalizeState(r.state ?? parsed?.state),
        zip5: normalizeZip5(r.zip_raw ?? parsed?.zip5),
        phone_e164: normalizePhone(r.phone_10) ?? normalizePhone(r.phone_raw),
        lat: r.lat,
        lng: r.lng,
        source,
        source_url: r.source_url,
        captured: r.captured,
        // The locator's own brand, and only that. §1's rule, nine more times.
        brand_authorized: [cfg.brand],
        line_card: [],
        distributor_type: cfg.typeField ? (r[cfg.typeField] ?? null) : null,
        tier_raw: codes || null,
      })
    })
}

/** The nine easy-tier locators, as contract `source` values. */
export const LOCATOR_SOURCES = Object.keys(LOCATOR_CONFIG)

/** source name → mapper. The S2 runner iterates this. */
export const MAPPERS = {
  timken: mapTimken,
  enerpac: mapEnerpac,
  ad: mapAd,
  dorner: mapDorner,
  spxflow: mapSpxflow,
  ptda: mapPtda,
  serp: mapSerp,
  dfs: mapDfs,
  ...Object.fromEntries(LOCATOR_SOURCES.map((s) => [s, mapLocator])),
}
