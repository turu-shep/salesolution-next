/**
 * dedupe — build-plan §3 steps 2–5, in the order the plan fixes them.
 *
 *   2. dedupeWithinSource   distinct (company, address) pairs, PER SOURCE
 *   3. suppressChains       named blocklist + ≥20 distinct addresses
 *   4. rollupBranches       one entity per (source, company), location_count kept
 *   5. crossSourceDedupe    phone first, then name+zip5, tiebreak street#+zip5
 *
 * **The order is load-bearing, not stylistic.** Step 2 before step 3: Timken's
 * map 8 shares zero marker IDs with map 2 but 99.7% of the same companies, so
 * counting locations before deduping doubles every count and turns the ≥20 chain
 * threshold into ≥10 — which sweeps mid-size regional independents into
 * `disposition: chain`. Step 3 before steps 4–5: national chains otherwise
 * dominate the line-card graph and score as "high line card", exactly the
 * accounts that cannot be sold.
 *
 * Nothing here deletes. Every function tags or groups; the caller routes.
 *
 * Tests: emails/scripts/lib/dedupe.test.mjs
 */
import { MULTI, makeRecord } from './contract.mjs'
import { streetNumber } from './normalize.mjs'

// ─────────────────────────────────────────────────────────────────────────────
// Merging — additive, always (§3.5)
// ─────────────────────────────────────────────────────────────────────────────

const uniq = (xs) => [...new Set(xs.filter(Boolean))]

/** Records that describe the same thing → one record. Never loses provenance. */
export function mergeRecords(records) {
  if (records.length === 1) return { ...records[0] }

  const pick = (field) => records.find((r) => r[field] != null && r[field] !== '')?.[field] ?? null
  // §3.5: "prefer the longest company_display" — the fullest published form.
  const display = records
    .map((r) => r.company_display)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)[0]
  const withEmail = records.find((r) => r.email)

  // §1 S1c: page-verbatim beats a SERP snippet, and the quote keeps its own URL.
  const decl =
    records.find((r) => r.self_declaration && r.self_declaration_verbatim) ??
    records.find((r) => r.self_declaration)

  return makeRecord({
    ...records[0],
    company: pick('company'),
    company_display: display ?? null,
    domain: pick('domain'),
    email: withEmail?.email ?? null,
    email_source: withEmail?.email_source ?? null,
    self_declaration: decl?.self_declaration ?? null,
    self_declaration_verbatim: decl?.self_declaration_verbatim ?? false,
    self_declaration_url: decl?.self_declaration_url ?? null,
    // AND, not OR: a domain-only SERP record that joins a locator record now HAS
    // a verified name, address and phone. One identified part resolves the whole.
    needs_identity_resolution: records.every((r) => r.needs_identity_resolution === true),
    address_1: pick('address_1'),
    city: pick('city'),
    state: pick('state'),
    zip5: pick('zip5'),
    phone_e164: pick('phone_e164'),
    lat: pick('lat'),
    lng: pick('lng'),
    source: uniq(records.flatMap((r) => String(r.source ?? '').split(MULTI))).join(MULTI),
    source_url: uniq(records.flatMap((r) => String(r.source_url ?? '').split(MULTI))).join(MULTI),
    captured: uniq(records.flatMap((r) => String(r.captured ?? '').split(MULTI))).join(MULTI),
    brand_authorized: uniq(records.flatMap((r) => r.brand_authorized ?? [])),
    line_card: uniq(records.flatMap((r) => r.line_card ?? [])),
    distributor_type: uniq(records.map((r) => r.distributor_type)).join(', ') || null,
    tier_raw: uniq(records.map((r) => r.tier_raw)).join(', ') || null,
    location_count: Math.max(...records.map((r) => r.location_count ?? 1)),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Within-source dedupe — BEFORE any location counting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The address identity of one row. Street + ZIP where a street exists; phone,
 * then coordinates, then the domain, then ZIP+city as fallbacks — a source that
 * publishes no street (or a PO box blob) must not collapse every branch onto one
 * key.
 *
 * The domain rung is what makes the SERP source safe. SERP publishes a domain
 * and nothing else, so without it every SERP record would fall through to
 * `z:|` — one key for the whole source — and two domains whose derived names
 * collide would silently merge. Measured on the five locator sources it changes
 * nothing: zero rows there lack a street, a phone AND coordinates.
 */
export function addressKey(r) {
  if (r.address_1) return `a:${r.address_1}|${r.zip5 ?? ''}`
  if (r.phone_e164) return `p:${r.phone_e164}`
  if (r.lat != null && r.lng != null) return `g:${r.lat.toFixed(4)},${r.lng.toFixed(4)}`
  if (r.domain) return `d:${r.domain}`
  return `z:${r.zip5 ?? ''}|${String(r.city ?? '').toLowerCase()}`
}

/**
 * True when a record's only identity is its domain — no street, no phone, no
 * coordinates. These are the SERP self-identification rows: they can never join
 * on §3.5's phone or name+zip5 keys, and they must never anchor a merge for
 * anyone else.
 */
export const isDomainOnly = (r) =>
  Boolean(r.domain) && !r.address_1 && !r.phone_e164 && !(r.lat != null && r.lng != null)

/**
 * §3.2 — distinct `(company, address)` pairs within one source. Duplicate rows
 * (AD repeats a member once per metro radius that covers it; Timken repeats a
 * branch across map layers) merge additively rather than inflating the location
 * count that step 3's chain threshold reads.
 *
 * @param {Record<string, any>[]} records
 * @returns {{records: Record<string, any>[], in: number, out: number}}
 */
export function dedupeWithinSource(records) {
  const groups = new Map()
  for (const r of records) {
    const key = `${r.company ?? ''}##${addressKey(r)}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(r)
  }
  return { records: [...groups.values()].map(mergeRecords), in: records.length, out: groups.size }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Chain suppression — BEFORE rollup and cross-source dedupe
// ─────────────────────────────────────────────────────────────────────────────

/**
 * §3.3's chains, as TOKENS rather than as name prefixes.
 *
 * **Why this changed (S3, measured 2026-08-01).** §3.3 was implemented as a
 * prefix match on the normalized name, and S2 v2 measured what that misses:
 * PTDA publishes Motion Industries as **"Motion"** (403 addresses, 48 states)
 * and Grainger as **"W.W. Grainger, Inc."** → `ww grainger` (225 / 47). Neither
 * starts with its blocklist key, so both were filed `above-ceiling` instead of
 * `chain`. Worse, five Kaman subsidiaries publish as "Minarik, A Kaman Company"
 * / "Florida Bearings, A Kaman Company" — the parent token sits in the MIDDLE of
 * the name, and three of them were sitting **seated**.
 *
 * So each entry now carries the token set that identifies the parent, and a name
 * matches when **every** token is present as a whole token.
 *
 * `lead` is the guard, and it is measured, not defensive. A bare containment
 * test on the token `motion` sweeps three genuine independents out of the seated
 * pool — "Evolution Motion Solutions", "Systems in Motion" and "Power Motion".
 * Requiring `motion` to be the FIRST token keeps all three and still catches
 * `motion`, `motion ai`, `motion industries *` and `motion fluid power
 * solutions`. Distinctive tokens (`grainger`, `kaman`, `fleetpride`, `dxp`,
 * `bdi`, `fastenal`, `mcmaster`, `sunsource`) need no guard: measured across the
 * whole 4,706-company union, every company carrying one of them IS that chain.
 *
 * `Applied Industrial` needs both `applied` and `industrial`, because `applied`
 * alone would sweep Applied Bearing Distributors, Applied Automation, Applied
 * Power Products and Holland Applied Technologies — four independents.
 */
export const CHAIN_BLOCKLIST = [
  { name: 'Motion Industries', tokens: ['motion'], lead: 'motion' },
  { name: 'Applied Industrial', tokens: ['applied', 'industrial'], lead: 'applied' },
  { name: 'FleetPride', tokens: ['fleetpride'] },
  { name: 'DXP', tokens: ['dxp'] },
  { name: 'BDI', tokens: ['bdi'] },
  { name: 'Kaman', tokens: ['kaman'] },
  { name: 'Grainger', tokens: ['grainger'] },
  { name: 'Fastenal', tokens: ['fastenal'] },
  { name: 'McMaster-Carr', tokens: ['mcmaster'] },
  { name: 'RS Components', tokens: ['rs', 'components'], lead: 'rs' },
  { name: 'SunSource', tokens: ['sunsource'] },
]

/**
 * Apex domains that ARE a national chain, whoever the row is named after.
 *
 * **Why a domain list exists (S2 v2 §14, measured).** The §3.3 blocklist is
 * name-shaped and the SERP source is domain-shaped, so the blocklist could not
 * see `rs-online.com` — it reached the seated pool under the derived name `rs
 * online`, which "RS Components" does not match. The same hole let 18 DXP
 * subsidiaries, 8 BDI divisions and 5 Kaman companies sit seated on their
 * parent's own website.
 *
 * Two groups, both measured in the data or named in the S3 brief:
 *   - the corporate sites of the §3.3 parents, including the ones the parents
 *     actually publish (`motion.com`, `kamandirect.com`, `bdi-usa.com`,
 *     `bdtroy.com`, `sun-source.com`) rather than the ones you would guess
 *   - national marketplaces and big-box retail, which are never a Catalog AI
 *     buyer at any size
 *
 * A subdomain of a listed apex counts; a domain that merely *contains* one does
 * not ("notgrainger.com" is not Grainger).
 */
export const CHAIN_DOMAIN_BLOCKLIST = [
  // §3.3 parents — corporate sites
  'grainger.com',
  'rs-online.com',
  'mcmaster.com',
  'mcmaster-carr.com',
  'fastenal.com',
  'motionindustries.com',
  'motion.com',
  'applied.com',
  'dxpe.com',
  'kaman.com',
  'kamandirect.com',
  'bdiexpress.com',
  'bdi-usa.com',
  'bdtroy.com',
  'fleetpride.com',
  'sunsource.com',
  'sun-source.com',
  // national MRO / marketplace / big-box — never the buyer
  'mscdirect.com',
  'zoro.com',
  'globalindustrial.com',
  'amazon.com',
  'ebay.com',
  'alibaba.com',
  'walmart.com',
  'homedepot.com',
  'lowes.com',
]

const CHAIN_DOMAINS = new Set(CHAIN_DOMAIN_BLOCKLIST)

/**
 * Does this normalized company name match the blocklist?
 *
 * Whole-token containment: every token in the entry has to appear as a token of
 * the name, so "W.W. Grainger, Inc." → `ww grainger` matches `grainger`, and
 * "Minarik, A Kaman Company" → `minarik a kaman` matches `kaman`. Where the
 * entry declares `lead`, that token must also be the name's FIRST token — see
 * the note on CHAIN_BLOCKLIST for the three independents that guard protects.
 *
 * @param {string|null|undefined} company normalized company name
 * @returns {string|null} the blocklist entry matched, or null
 */
export function chainNameMatch(company) {
  if (!company) return null
  const tokens = String(company).split(' ').filter(Boolean)
  if (!tokens.length) return null
  const present = new Set(tokens)
  for (const entry of CHAIN_BLOCKLIST) {
    if (entry.lead && tokens[0] !== entry.lead) continue
    if (entry.tokens.every((t) => present.has(t))) return entry.name
  }
  return null
}

/**
 * Is this apex domain a national chain's own site? Subdomains count; a longer
 * domain that merely ends in the same letters does not.
 *
 * @param {string|null|undefined} domain
 * @returns {string|null} the blocklisted apex matched, or null
 */
export function chainDomainMatch(domain) {
  if (!domain) return null
  const d = String(domain).toLowerCase().replace(/^www\./, '')
  if (CHAIN_DOMAINS.has(d)) return d
  for (const apex of CHAIN_DOMAINS) if (d.endsWith('.' + apex)) return apex
  return null
}

/**
 * Distinct addresses per company across the whole in-dataset (§3.3: "a ≥20
 * distinct-address count in-dataset ... never a raw row count"). Computed on
 * already-within-source-deduped rows, and across sources, so a chain split over
 * two locators is still counted once per physical address.
 *
 * @param {Record<string, any>[]} records
 * @returns {Map<string, Set<string>>} company → set of address keys
 */
export function distinctAddresses(records) {
  const byCompany = new Map()
  for (const r of records) {
    if (!r.company) continue
    if (!byCompany.has(r.company)) byCompany.set(r.company, new Set())
    byCompany.get(r.company).add(addressKey(r))
  }
  return byCompany
}

/**
 * §3.3 — tag chains, and (the §5a correction) tag *size* separately from
 * *identity*.
 *
 * A name-blocklist match is a national chain: `disposition: 'chain'`.
 * A size-only match — ≥20 distinct addresses, name not on the list — is
 * something else. §5a measured what the rule actually caught: Purvis (72),
 * IBT (35), Hydradyne (34) are regional independents, correctly out of the
 * seated list but **above the revenue ceiling, not chains**. They get
 * `disposition: 'above-ceiling'` and `pool-above-ceiling.csv`, mirroring
 * `pool-small-shops.csv` at the other end. Neither is deleted; both are
 * reinstated by a threshold change or a named allowlist.
 *
 * **The domain test (S3).** A row on a blocklisted chain's own website is that
 * chain, whatever the row is called — "Minarik, A Kaman Company" on
 * `kamandirect.com`, "Tucker Tool" on `dxpe.com`, "RS Americas" on
 * `rs-online.com`. It runs per ROW, not per company name, because that is the
 * granularity a domain has; a company whose rows carry a chain domain is
 * suppressed on those rows and the rollup follows.
 *
 * @param {Record<string, any>[]} records
 * @param {{threshold?: number, addresses?: Map<string, Set<string>>, domainBlocklist?: boolean}} [opts]
 * @returns {{records: Record<string, any>[], byName: Map<string,string>, bySize: Map<string,number>, byDomain: Map<string,string>}}
 */
export function suppressChains(records, opts = {}) {
  const { threshold = 20, addresses = distinctAddresses(records), domainBlocklist = true } = opts
  const byName = new Map() // company → blocklist entry        → chain
  const bySize = new Map() // company → distinct address count → above-ceiling
  const byDomain = new Map() // company → blocklisted apex      → chain

  for (const [company, addrs] of addresses) {
    const named = chainNameMatch(company)
    if (named) byName.set(company, named)
    else if (addrs.size >= threshold) bySize.set(company, addrs.size)
  }

  const out = records.map((r) => {
    // A disposition the source already established (a foreign domain, a
    // manufacturer's own page) is an acquisition-level fact. Size, name and
    // domain suppression refine seated records; they never overwrite one.
    if (r.disposition != null) return r
    if (byName.has(r.company)) return { ...r, disposition: 'chain' }
    if (domainBlocklist) {
      const apex = chainDomainMatch(r.domain)
      if (apex) {
        if (r.company) byDomain.set(r.company, apex)
        return { ...r, disposition: 'chain' }
      }
    }
    if (bySize.has(r.company)) return { ...r, disposition: 'above-ceiling' }
    return r
  })
  return { records: out, byName, bySize, byDomain }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Branch rollup — one entity per (source, company)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * An entity is a rolled-up company inside one source, carrying every join key
 * its branches contribute. Cross-source dedupe matches on the SETS, not on the
 * representative row: a five-branch Timken company and the same company in AD
 * usually publish different branch phones, and matching on one representative
 * phone would miss the join entirely.
 *
 * @typedef {object} Entity
 * @property {Record<string, any>} record   the merged, contract-shaped record
 * @property {Record<string, any>[]} members the deduped rows it rolled up
 * @property {Set<string>} phones
 * @property {Set<string>} nameZips        `${company}|${zip5}`
 * @property {Set<string>} numZips         `${streetNumber}|${zip5}`
 * @property {Set<string>} domains         apex domains its members publish
 * @property {boolean} domainOnly          identity is the domain and nothing else
 * @property {Set<string>} sources
 */

/** @param {Record<string, any>[]} rows @returns {Entity} */
function toEntity(rows) {
  const record = mergeRecords(rows)
  const phones = new Set()
  const nameZips = new Set()
  const numZips = new Set()
  const domains = new Set()
  const sources = new Set()
  const addrs = new Set()
  for (const r of rows) {
    if (r.phone_e164) phones.add(r.phone_e164)
    if (r.company && r.zip5) nameZips.add(`${r.company}|${r.zip5}`)
    const n = streetNumber(r.address_1)
    if (n && r.zip5) numZips.add(`${n}|${r.zip5}`)
    if (r.domain) domains.add(r.domain)
    for (const s of String(r.source ?? '').split(MULTI)) if (s) sources.add(s)
    addrs.add(addressKey(r))
  }
  record.location_count = addrs.size
  record.evidence_depth = sources.size
  return {
    record,
    members: rows,
    phones,
    nameZips,
    numZips,
    domains,
    domainOnly: rows.every(isDomainOnly),
    sources,
  }
}

/**
 * §3.4 — same company, multiple addresses → one record, `location_count`
 * retained (it feeds the small-shops rule and the size proxy).
 *
 * Grouped by `(source, company, disposition)` so a chain-tagged row never rolls
 * into a seated one — plus the domain for domain-only rows, because for those
 * the domain IS the identity. Two SERP domains whose derived names collide
 * ("motion.com" and "ai.motion.com" both normalize to `motion`) are two
 * companies until S3 says otherwise, and rolling them up on the derived name
 * would fabricate a merge from a name we invented.
 *
 * @param {Record<string, any>[]} records
 * @returns {Entity[]}
 */
export function rollupBranches(records) {
  const groups = new Map()
  for (const r of records) {
    const ident = isDomainOnly(r) ? r.domain : ''
    const key = `${r.source}##${r.company ?? ''}##${r.disposition ?? ''}##${ident}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(r)
  }
  return [...groups.values()].map(toEntity)
}

// ─────────────────────────────────────────────────────────────────────────────
// 4b. The domain join — the S1c addition, and the only path SERP can use
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Anchor a domain-only entity to the identified entity that already publishes
 * that domain.
 *
 * **Why this is not a general domain join.** Measured across the five locator
 * sources: 209 of 1,683 domains are published by 2+ distinct normalized
 * companies. `motion.com` carries Motion Industries *and* Kaman Industrial;
 * `theprontonetwork.com` carries a dozen unrelated jobbers; `singerindustrial.com`
 * carries 22 acquired brands. Joining identified entities to each other on a
 * shared domain would merge companies that are not the same company. So the
 * domain path runs in ONE direction only: a domain-only entity may attach to an
 * identified one, never the reverse, and identified entities are never joined to
 * each other by domain.
 *
 * When a domain has several identified occupants the anchor is the largest
 * (most members, then most distinct addresses, then first by index) and the pair
 * is counted as ambiguous, so the ambiguity is reported rather than hidden.
 *
 * @param {Entity[]} entities
 * @returns {{anchorOf: Map<number, number>, matched: number, ambiguous: number, netNew: number}}
 */
export function domainAnchors(entities) {
  const byDomain = new Map()
  entities.forEach((e, i) => {
    if (e.domainOnly) return
    for (const d of e.domains) {
      if (!byDomain.has(d)) byDomain.set(d, [])
      byDomain.get(d).push(i)
    }
  })

  const anchorOf = new Map()
  let matched = 0
  let ambiguous = 0
  let netNew = 0
  entities.forEach((e, i) => {
    if (!e.domainOnly) return
    const hits = [...e.domains].flatMap((d) => byDomain.get(d) ?? [])
    const uniqHits = [...new Set(hits)]
    if (uniqHits.length === 0) {
      netNew++
      return
    }
    matched++
    if (uniqHits.length > 1) ambiguous++
    const best = uniqHits.sort(
      (a, b) =>
        entities[b].members.length - entities[a].members.length ||
        entities[b].record.location_count - entities[a].record.location_count ||
        a - b,
    )[0]
    anchorOf.set(i, best)
  })
  return { anchorOf, matched, ambiguous, netNew }
}

/**
 * A domain-only entity inherits its anchor's `disposition`. A SERP hit on
 * motion.com is Motion Industries — it belongs in `pool-chains.csv`, not in the
 * seated pool as a net-new company. Runs BEFORE the per-disposition split, so
 * the two cross-source passes stay separated exactly as §3 requires.
 *
 * @param {Entity[]} entities
 * @param {Map<number, number>} anchorOf
 * @returns {Map<string, number>} disposition inherited → count
 */
export function inheritAnchorDisposition(entities, anchorOf) {
  const counts = new Map()
  for (const [i, a] of anchorOf) {
    const d = entities[a].record.disposition ?? null
    if (entities[i].record.disposition === d) continue
    // A domain-only row already tagged non-US or not-a-distributor keeps that —
    // the anchor cannot make a Honduran marketplace into a US distributor.
    if (entities[i].record.disposition != null) continue
    entities[i].record.disposition = d
    const k = d ?? '(seated)'
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return counts
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Cross-source dedupe — the line-card graph is built here
// ─────────────────────────────────────────────────────────────────────────────

class UnionFind {
  constructor(n) {
    this.p = Array.from({ length: n }, (_, i) => i)
  }
  find(i) {
    while (this.p[i] !== i) {
      this.p[i] = this.p[this.p[i]]
      i = this.p[i]
    }
    return i
  }
  union(a, b) {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra === rb) return false
    this.p[rb] = ra
    return true
  }
}

const overlaps = (a, b) => {
  for (const x of a) if (b.has(x)) return true
  return false
}

/**
 * §3.5 — merge the same company across sources.
 *
 * Primary key `phone_e164`. **Measured coverage is Timken 91.8% and AD 73.0%,**
 * so roughly one AD record in four has no phone at all and the secondary path
 * carries far more load than §3.5 assumed. Secondary: normalized name + zip5,
 * tiebreak street number + zip5.
 *
 * The tiebreak is measured, not assumed: every secondary-only candidate pair is
 * classified as *corroborated* (street numbers overlap, or one side has none and
 * the phones do not contradict) or *conflicting* (both sides carry a street
 * number in that ZIP and they are disjoint, and the phones disagree too). The
 * conflicting share is the collision rate. With `tighten: true` only
 * corroborated pairs merge — which is what the plan says to do if the rate is high.
 *
 * **Third path, S1c: the domain.** SERP self-identification publishes a domain
 * and nothing else, so it can reach neither key above. `domainJoin` attaches a
 * domain-only entity to the identified entity that already publishes that
 * domain — one direction only, never identified-to-identified. See
 * {@link domainAnchors} for why the general version is unsafe.
 *
 * @param {Entity[]} entities
 * @param {{tighten?: boolean, domainJoin?: boolean}} [opts]
 */
export function crossSourceDedupe(entities, opts = {}) {
  const { tighten = false, domainJoin = false } = opts
  const uf = new UnionFind(entities.length)

  // ── primary: phone ─────────────────────────────────────────────────────────
  const byPhone = new Map()
  for (let i = 0; i < entities.length; i++) {
    for (const p of entities[i].phones) {
      if (!byPhone.has(p)) byPhone.set(p, [])
      byPhone.get(p).push(i)
    }
  }
  let phoneMerges = 0
  for (const idxs of byPhone.values()) {
    for (let k = 1; k < idxs.length; k++) if (uf.union(idxs[0], idxs[k])) phoneMerges++
  }

  // ── secondary: normalized name + zip5, with the street-number tiebreak ─────
  const byNameZip = new Map()
  for (let i = 0; i < entities.length; i++) {
    for (const nz of entities[i].nameZips) {
      if (!byNameZip.has(nz)) byNameZip.set(nz, [])
      byNameZip.get(nz).push(i)
    }
  }

  const stats = {
    phoneMerges,
    secondaryGroups: 0,
    candidatePairs: 0,
    alreadyJoinedByPhone: 0,
    corroborated: 0,
    conflicting: 0,
    secondaryMerges: 0,
    suppressedByTighten: 0,
  }

  for (const idxs of byNameZip.values()) {
    const uniqIdx = [...new Set(idxs)]
    if (uniqIdx.length < 2) continue
    stats.secondaryGroups++
    for (let a = 0; a < uniqIdx.length; a++) {
      for (let b = a + 1; b < uniqIdx.length; b++) {
        const ea = entities[uniqIdx[a]]
        const eb = entities[uniqIdx[b]]
        stats.candidatePairs++

        if (uf.find(uniqIdx[a]) === uf.find(uniqIdx[b])) {
          stats.alreadyJoinedByPhone++
          continue
        }

        const numsAgree = overlaps(ea.numZips, eb.numZips)
        const numsKnown = ea.numZips.size > 0 && eb.numZips.size > 0
        const phonesKnown = ea.phones.size > 0 && eb.phones.size > 0
        const phonesAgree = overlaps(ea.phones, eb.phones)
        const conflicting = numsKnown && !numsAgree && phonesKnown && !phonesAgree

        if (conflicting) stats.conflicting++
        else stats.corroborated++

        if (conflicting || (tighten && !numsAgree)) {
          stats.suppressedByTighten++
          continue
        }
        if (uf.union(uniqIdx[a], uniqIdx[b])) stats.secondaryMerges++
      }
    }
  }

  stats.collisionRate = stats.candidatePairs ? stats.conflicting / stats.candidatePairs : 0

  // ── third: the domain, for entities that have no other key at all ──────────
  stats.domainOnly = entities.filter((e) => e.domainOnly).length
  stats.domainMatched = 0
  stats.domainAmbiguous = 0
  stats.domainNetNew = 0
  stats.domainMerges = 0
  if (domainJoin) {
    const anchors = domainAnchors(entities)
    stats.domainMatched = anchors.matched
    stats.domainAmbiguous = anchors.ambiguous
    stats.domainNetNew = anchors.netNew
    for (const [i, a] of anchors.anchorOf) if (uf.union(a, i)) stats.domainMerges++
  }

  // ── materialize ────────────────────────────────────────────────────────────
  const clusters = new Map()
  for (let i = 0; i < entities.length; i++) {
    const root = uf.find(i)
    if (!clusters.has(root)) clusters.set(root, [])
    clusters.get(root).push(entities[i])
  }

  const merged = [...clusters.values()].map((group) => {
    const record = mergeRecords(group.map((g) => g.record))
    const sources = new Set(group.flatMap((g) => [...g.sources]))
    const members = group.flatMap((g) => g.members)
    record.evidence_depth = sources.size
    // §1: "distinct addresses for this company". The union across every source's
    // members, not the per-source max — a company with 8 AD branches and 12
    // Timken branches has however many distinct addresses the two sets union to.
    record.location_count = new Set(members.map(addressKey)).size
    return {
      record,
      members,
      sources,
      entities: group,
    }
  })

  return { merged, stats }
}
