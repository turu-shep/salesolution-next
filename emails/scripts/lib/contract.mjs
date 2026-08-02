/**
 * contract — the one record shape every source, stage and export conforms to.
 *
 * Verbatim from `emails/handoff/strategy/01-build-plan.md` §1. Do not add fields
 * here without changing that document first; the plan is the contract, this file
 * is the enforcement.
 *
 *   company            normalized legal-ish name (see normalize.mjs) — JOIN KEY ONLY
 *   company_display    the name as published, original casing — USE THIS IN COPY
 *   domain             apex domain, lowercase, no www — null until proven
 *   email              contact address where a source publishes one
 *   email_source       which source published it (§7.2 cohort rule)
 *   address_1, city, state, zip5
 *   phone_e164         10-digit US normalized; PRIMARY JOIN KEY, ~92% populated
 *   lat, lng
 *   source             timken | enerpac | ad | ptda | dfs | serp | dorner | spxflow | …
 *   source_url         exact URL fetched
 *   captured           ISO date
 *   brand_authorized[] brands this source proves they carry — MANUFACTURER BRANDS ONLY
 *   line_card[]        product families/categories a source lists (NOT brands)
 *   distributor_type   source's own type string (Sales/Service/Rental/Rep…), unmapped
 *   tier_raw           source's own tier string, UNMAPPED
 *   location_count     distinct addresses for this company (after within-source dedupe)
 *   disposition        null (seated) | chain | above-ceiling | sub-floor
 *                      | single-location-small | no-website | non-US | dead
 *                      | adjacent-trade | not-a-distributor
 *   segment            A | B | C | W | null
 *   evidence_depth     count of distinct sources this company appears in
 *
 * S1c additions (build-plan §1, extended 2026-08-01 — the SERP self-identification
 * source is domain-keyed and publishes the dealer's own words):
 *
 *   self_declaration          the dealer's own sentence about the lines they carry,
 *                             VERBATIM AS PUBLISHED, original casing. This is email
 *                             copy. Never title-case it, never trim it to a phrase,
 *                             never paraphrase it.
 *   self_declaration_verbatim true when the sentence was read off the dealer's own
 *                             page (the bounded fetch pass), false when it came from
 *                             the SERP snippet, which Google truncates and rewrites.
 *   self_declaration_url      the exact page the declaration was read from
 *   needs_identity_resolution true when the record has a website and a brand claim
 *                             but NO verified company name, address or phone — a
 *                             net-new SERP domain. S3 resolves it. A merge with any
 *                             identified record clears the flag.
 *
 * S3 additions (build-plan §4, extended 2026-08-01 — the qualify stage has to
 * carry the OUTCOME of its own passes, not just their side effects):
 *
 *   identity_status   what the §4 identity pass found on the dealer's own site:
 *                     `resolved` (a name AND an address or phone) · `partial`
 *                     (something, not enough) · `unresolved` (the site says
 *                     nothing) · `refused` (403/401 — recorded, abandoned, never
 *                     bypassed) · `unreachable` (DNS/TLS/connection failure) ·
 *                     null (never attempted; the record already had an identity)
 *   identity_found    which fields the pass actually read: name | address |
 *                     phone. The honest half of a `partial` — it is the
 *                     difference between "site says nothing" and "we got a phone
 *                     but no name".
 *   icp_class         what the SERP population turned out to be:
 *                     `industrial-distributor` (keep) · `auto-parts` ·
 *                     `promotional-products` · `general-retail` · `manufacturer`
 *                     · `marketplace` · `directory` · `trade-press` ·
 *                     `job-board`. Null for locator-sourced records, which were
 *                     ICP-filtered at acquisition (§2a).
 *   icp_uncertain     true when the classifier could not decide. Per the S3
 *                     brief the record is KEPT and flagged, so S4 can tier it
 *                     low; the alternative — a coin-flip disposition — deletes
 *                     prospects on a guess.
 *
 * Non-negotiable rules this file enforces:
 *   - `source_url` + `captured` are REQUIRED. A row without provenance is a bug,
 *     not a lead. validateRecord() rejects it. After a cross-source merge both
 *     hold a `|`-joined list — every part is still validated.
 *   - `line_card` is NOT `brand_authorized`. Folding product families in as
 *     pseudo-brands inflates line-card breadth, which S3 reads as a SIZE PROXY.
 *     Two fields, kept apart, on purpose (§1).
 *   - `tier_raw` is carried through unmapped. Adaptall proved a source's own
 *     tier flag can be INVERTED (73% of its "premier" tier were chains), so no
 *     stage may read a tier as a quality signal until it is validated per source.
 *   - Nothing is ever deleted. Failing a filter sets `disposition`; that is S2's
 *     (chains, adjacent trades) and S3's job. Sources emit `disposition: null`.
 */

/** The separator for multi-valued fields in exports and post-merge provenance. */
export const MULTI = '|'

/** Field order — also the CSV column order for exports. */
export const FIELDS = [
  'company',
  'company_display',
  'domain',
  'email',
  'email_source',
  'address_1',
  'city',
  'state',
  'zip5',
  'phone_e164',
  'lat',
  'lng',
  'source',
  'source_url',
  'captured',
  'brand_authorized',
  'line_card',
  'distributor_type',
  'tier_raw',
  'location_count',
  'disposition',
  'segment',
  'evidence_depth',
  'self_declaration',
  'self_declaration_verbatim',
  'self_declaration_url',
  'needs_identity_resolution',
  'identity_status',
  'identity_found',
  'icp_class',
  'icp_uncertain',
]

/**
 * The S4 columns. **Deliberately NOT in `FIELDS`.** S2 and S3 write their CSVs
 * with `FIELDS`, and `_s3c-report` asserts S3a still reproduces `deduped-v3.csv`
 * byte-for-byte; widening `FIELDS` would break that for a stage that has no use
 * for the columns. S4 exports `FIELDS_V5` instead.
 *
 * They exist because §5f inverted the pipeline: ranking now runs BEFORE
 * enrichment, so the rank has to be auditable from the CSV itself.
 *
 *   vertical_axis    which axis decided the vertical — `category` (the DFS
 *                    `category_ids` weighing), `name`, `homepage`, `domain-vote`
 *                    or `default`. §5e's lesson, made legible: a source-native
 *                    code decided 2,165 markers no other axis could read, and
 *                    nobody could tell afterwards which axis had spoken.
 *   category_core    weighted count of CORE industrial codes, with the strongest
 *                    one discounted 0.5× — §5f's "never seat on a single
 *                    category code", implemented. Every DFS record carries at
 *                    least one core code BY CONSTRUCTION (the sweep queried on
 *                    them), so the first one is a query artifact, not evidence.
 *   category_contam  the winning contamination cluster and its weight, verbatim
 *                    (`construction=9.0`), so a wrong route can be read back.
 *   ecommerce_class  carried from the S3b enrichment where it exists. NEVER
 *                    fetched here — §5f forbids per-domain work at this volume.
 *   sku_estimate     ditto. §5d: a tiering input, never a gate.
 *   brand_count      the dealer's own published line card, where the S3b pass
 *                    read one. Ranked in a BAND (3–20, peak 6–10), not
 *                    monotonically — §5d measured 50% of 65+-brand dealers as
 *                    fully transactional, i.e. already solved.
 *   review_count     DFS `rating.votes_count`. A size proxy, and the only one
 *                    that arrives free with the listing.
 *   size_score       0–100 stack score (§4.5). SCORED, never gated — §5e.
 *   size_band        `sub-floor` | `2-5M` | `5-10M` | `10-50M` | `above-band`
 *   rank_score       0–100. The cut is a rank, not a filter.
 *   rank_components  every contribution, `k=v;k=v`, so the ranking is auditable
 *                    without re-running the pipeline.
 *   shortlist        true when the record is in `shortlist-v1.csv`.
 */
export const S4_FIELDS = [
  'vertical_axis',
  'category_core',
  'category_contam',
  'ecommerce_class',
  'sku_estimate',
  'brand_count',
  'review_count',
  'size_score',
  'size_band',
  'rank_score',
  'rank_components',
  'shortlist',
]

/** The full S4 export shape: the contract, then the ranking columns. */
export const FIELDS_V5 = [...FIELDS, ...S4_FIELDS]

/**
 * S4d — the seating columns. §5's segment/tier spec, made auditable.
 *
 *   segment_scores  `A=n;B=n`, the per-segment evidence totals `segment.mjs`
 *                   scored. The `segment` column says WHICH; this says WHY, and
 *                   whether the margin was 2 or 12.
 *   tier            `T1` | `T2` | `T3` | `T4` | `T0` — §5's priority table, plus
 *                   `T0` for the `above-band` proxy §5 does not name.
 *   cohort          `E` when every email on the record was published by a
 *                   MANUFACTURER's locator rather than by the business (§7.2).
 *                   Deliberately a separate column from `tier`: §5 lists Cohort
 *                   E as a fifth tier row, and implemented that way it demotes
 *                   real T1 leads on a fact about the ADDRESS rather than about
 *                   the company. The isolation §7.2 asks for is a send-time
 *                   split, which this column and `cohort-e-v1.csv` provide.
 *   dup_of          the domain this record was folded into by
 *                   `lib/dupsite.mjs`. Set only alongside
 *                   `disposition: duplicate-site`, and it is what makes the
 *                   merge reversible.
 */
export const S4D_FIELDS = ['segment_scores', 'tier', 'cohort', 'dup_of']

/** The seated-list export shape. */
export const FIELDS_V7 = [...FIELDS_V5, ...S4D_FIELDS]

/** §4.5 size bands, in the order the report prints them. */
export const SIZE_BANDS = ['sub-floor', '2-5M', '5-10M', '10-50M', 'above-band']

/** §4 identity pass outcomes. `null` means the pass never ran on this record. */
export const IDENTITY_STATUSES = ['resolved', 'partial', 'unresolved', 'refused', 'unreachable']

/**
 * §4 ICP classes for the SERP population. Only `industrial-distributor` is
 * seated on its own; every other class routes to `not-a-distributor`, which is
 * the disposition §1 already defines for exactly this.
 */
export const ICP_CLASSES = [
  'industrial-distributor',
  'auto-parts',
  // S3c (§5c.1): the vertical axis, once it ran over the LOCATOR half too.
  // Timken's dealer file is not ICP-shaped — it carries 349 seated names with
  // "TRUCK" in them and 203 with "AUTO". `truck-fleet` and `other-trade` are the
  // two classes that population needs and the SERP-only run never had to name.
  'truck-fleet',
  'other-trade',
  'promotional-products',
  'general-retail',
  'manufacturer',
  'marketplace',
  'directory',
  'trade-press',
  'job-board',
]

/**
 * §1: null means seated. Anything else routes to emails/data/side-pools/.
 *
 * `adjacent-trade` is the §2a addition: AD's electrical/plumbing/HVAC/waterworks
 * members are real businesses and the wrong buyer, so they are tagged and parked,
 * never deleted.
 *
 * `above-ceiling` is the §5a correction. The ≥20-distinct-address rule caught
 * Purvis (72), IBT (35) and Hydradyne (34) — regional independents, not national
 * chains. They are correctly out of the seated list but for the wrong stated
 * reason: they are above the revenue ceiling. Name-blocklist matches stay `chain`;
 * size-only matches become `above-ceiling` and get their own pool, mirroring
 * `pool-small-shops.csv` at the other end.
 *
 * `not-a-distributor` is the S1c addition. SERP self-identification returns
 * manufacturer pages, marketplaces, job boards and trade press alongside dealers.
 * They are classified at acquisition, tagged here, and parked — not deleted.
 *
 * `duplicate-site` is S4d's. One business on two apex domains survives every
 * key S2 and S3 join on — the name normalizes differently, the phone is
 * published on one site and not the other, and the domains are literally
 * distinct. `lib/dupsite.mjs` finds them through the sitemap fingerprint. The
 * winning domain stays seated; the rest carry this disposition and a `dup_of`
 * pointer, so a merge that turns out to be wrong is one column away from being
 * undone.
 *
 * `identity-backlog` is S4e's, and it names a state the earlier dispositions
 * cannot. USAspending publishes **no website, no email and no phone** (0.0% on
 * all three), so its unmatched companies are not `no-website` — nobody looked.
 * Overloading `no-website` would have poured ~2,900 unexamined federal
 * contractors into Segment W, which is a *decided* pool sitting in front of a
 * GATE-L2 offer decision. This disposition says the true thing instead: real
 * company, real UEI, real address, no contact route yet, and resolving one costs
 * the most expensive step in the pipeline. It is a queue, not a verdict.
 */
export const DISPOSITIONS = [
  'chain',
  'above-ceiling',
  'sub-floor',
  'single-location-small',
  'no-website',
  'non-US',
  'dead',
  'adjacent-trade',
  'not-a-distributor',
  'duplicate-site',
  'identity-backlog',
]

/** §5: A fluid power/hydraulics · B bearings/PT · C general MRO · W no website. */
export const SEGMENTS = ['A', 'B', 'C', 'W']

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/

/**
 * Build a fully-shaped record from a partial one. Every contract field is
 * present afterwards, so downstream stages never have to test for `undefined`.
 *
 * @param {Partial<Record<string, unknown>>} input
 * @returns {Record<string, any>}
 */
export function makeRecord(input = {}) {
  return {
    company: str(input.company),
    company_display: str(input.company_display),
    domain: str(input.domain),
    email: str(input.email),
    email_source: str(input.email_source),
    address_1: str(input.address_1),
    city: str(input.city),
    state: str(input.state),
    zip5: str(input.zip5),
    phone_e164: str(input.phone_e164),
    lat: num(input.lat),
    lng: num(input.lng),
    source: str(input.source),
    source_url: str(input.source_url),
    captured: str(input.captured),
    brand_authorized: list(input.brand_authorized),
    line_card: list(input.line_card),
    distributor_type: str(input.distributor_type),
    tier_raw: str(input.tier_raw),
    location_count:
      input.location_count === undefined || input.location_count === null
        ? 1
        : Number(input.location_count),
    disposition: str(input.disposition),
    segment: str(input.segment),
    evidence_depth:
      input.evidence_depth === undefined || input.evidence_depth === null
        ? 1
        : Number(input.evidence_depth),
    // Verbatim: `str()` only trims the ends and drops empties. Casing, internal
    // punctuation and sentence shape are the dealer's, and they ship as copy.
    self_declaration: str(input.self_declaration),
    self_declaration_verbatim: bool(input.self_declaration_verbatim),
    self_declaration_url: str(input.self_declaration_url),
    needs_identity_resolution: bool(input.needs_identity_resolution),
    // S3 §4 — the qualify stage's own findings.
    identity_status: str(input.identity_status),
    identity_found: list(input.identity_found),
    icp_class: str(input.icp_class),
    icp_uncertain: bool(input.icp_uncertain),
  }
}

/** Strict boolean, defaulting false. Nulls are not a third state here. */
function bool(v) {
  return v === true || v === 'true' || v === 1
}

/** A de-duplicated, order-preserving list of non-empty strings. */
function list(v) {
  if (Array.isArray(v)) return [...new Set(v.map((x) => String(x).trim()).filter(Boolean))]
  if (v === undefined || v === null || v === '') return []
  return [String(v).trim()].filter(Boolean)
}

function str(v) {
  if (v === undefined || v === null) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

function num(v) {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/**
 * Validate one record against the contract.
 *
 * Provenance (`source_url` + `captured`) is a hard reject — that is the rule the
 * plan calls non-negotiable. Everything else is checked for type and enum
 * membership so a bad source can't quietly poison the join keys.
 *
 * @param {Record<string, any>} record
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateRecord(record) {
  const errors = []
  if (!record || typeof record !== 'object') return { ok: false, errors: ['record is not an object'] }

  // ── provenance: the non-negotiable pair ────────────────────────────────────
  // Post-merge these hold a `|`-joined list; every part has to stand on its own.
  if (!record.source_url || typeof record.source_url !== 'string')
    errors.push('missing source_url (provenance is required)')
  else {
    const bad = split(record.source_url).filter((u) => !/^https?:\/\//i.test(u))
    if (bad.length) errors.push(`source_url is not an http(s) URL: ${bad[0]}`)
  }

  if (!record.captured || typeof record.captured !== 'string')
    errors.push('missing captured (provenance is required)')
  else {
    const bad = split(record.captured).filter((d) => !ISO_DATE.test(d) && !ISO_DATETIME.test(d))
    if (bad.length) errors.push(`captured is not an ISO date: ${bad[0]}`)
  }

  // ── identity ───────────────────────────────────────────────────────────────
  if (!record.company || typeof record.company !== 'string') errors.push('missing company')
  if (!record.source || typeof record.source !== 'string') errors.push('missing source')

  // ── join keys and shape ────────────────────────────────────────────────────
  if (record.phone_e164 != null && !/^\d{10}$/.test(record.phone_e164))
    errors.push(`phone_e164 must be 10 digits or null: ${record.phone_e164}`)
  if (record.zip5 != null && !/^\d{5}$/.test(record.zip5))
    errors.push(`zip5 must be 5 digits or null: ${record.zip5}`)
  if (record.state != null && !/^[A-Z]{2}$/.test(record.state))
    errors.push(`state must be a 2-letter code or null: ${record.state}`)
  if (record.domain != null && !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(record.domain))
    errors.push(`domain must be a lowercase apex domain or null: ${record.domain}`)
  for (const k of ['lat', 'lng']) {
    if (record[k] != null && !Number.isFinite(record[k])) errors.push(`${k} must be a number or null`)
  }
  if (!Array.isArray(record.brand_authorized)) errors.push('brand_authorized must be an array')
  if (!Array.isArray(record.line_card)) errors.push('line_card must be an array')
  if (record.email != null && !/^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$/i.test(record.email))
    errors.push(`email is not a single address: ${record.email}`)
  if (record.email != null && !record.email_source)
    errors.push('email without email_source (provenance is required for contact data)')
  if (!Number.isInteger(record.location_count) || record.location_count < 1)
    errors.push('location_count must be an integer ≥ 1')
  if (record.disposition != null && !DISPOSITIONS.includes(record.disposition))
    errors.push(`unknown disposition: ${record.disposition}`)
  if (record.segment != null && !SEGMENTS.includes(record.segment))
    errors.push(`unknown segment: ${record.segment}`)
  if (!Number.isInteger(record.evidence_depth) || record.evidence_depth < 1)
    errors.push('evidence_depth must be an integer ≥ 1')

  // ── S3: the qualify stage's findings ──────────────────────────────────────
  if (record.identity_status != null && !IDENTITY_STATUSES.includes(record.identity_status))
    errors.push(`unknown identity_status: ${record.identity_status}`)
  if (!Array.isArray(record.identity_found)) errors.push('identity_found must be an array')
  if (record.icp_class != null && !ICP_CLASSES.includes(record.icp_class))
    errors.push(`unknown icp_class: ${record.icp_class}`)

  // ── S1c: the self-declaration trio and the identity flag ───────────────────
  for (const k of ['self_declaration_verbatim', 'needs_identity_resolution', 'icp_uncertain']) {
    if (typeof record[k] !== 'boolean') errors.push(`${k} must be a boolean`)
  }
  if (record.self_declaration_verbatim && !record.self_declaration)
    errors.push('self_declaration_verbatim without a self_declaration')
  if (record.self_declaration && !record.self_declaration_url)
    errors.push('self_declaration without self_declaration_url (provenance is required for quoted copy)')
  if (record.self_declaration_url != null) {
    const bad = split(record.self_declaration_url).filter((u) => !/^https?:\/\//i.test(u))
    if (bad.length) errors.push(`self_declaration_url is not an http(s) URL: ${bad[0]}`)
  }

  // ── S4: the ranking columns, optional everywhere ──────────────────────────
  // Present only after S4 has run. Every one may be null: a record that never
  // reached the ranker is not invalid, it is unranked.
  if (record.size_band != null && !SIZE_BANDS.includes(record.size_band))
    errors.push(`unknown size_band: ${record.size_band}`)
  for (const k of ['size_score', 'rank_score', 'category_core']) {
    if (record[k] != null && !Number.isFinite(Number(record[k]))) errors.push(`${k} must be a number or null`)
  }
  if (record.shortlist != null && typeof record.shortlist !== 'boolean')
    errors.push('shortlist must be a boolean or null')

  // `FIELDS_V7`, not `FIELDS_V5`: S4d adds `segment_scores`, `tier` and `dup_of`
  // to the export. The guard is still closed — a typo'd column name is still a
  // violation — it just closes one generation later.
  const unknown = Object.keys(record).filter((k) => !FIELDS_V7.includes(k))
  if (unknown.length) errors.push(`fields outside the contract: ${unknown.join(', ')}`)

  return { ok: errors.length === 0, errors }
}

/**
 * Throw on the first invalid record. Use at the boundary of an extractor.
 * @param {Record<string, any>} record
 */
export function assertRecord(record) {
  const { ok, errors } = validateRecord(record)
  if (!ok) throw new Error(`contract violation for "${record?.company ?? '(no company)'}": ${errors.join('; ')}`)
  return record
}

/**
 * Validate a batch. Never throws — returns both sides so a bad row can be
 * reported without discarding the good ones (nothing is ever deleted).
 *
 * @param {Record<string, any>[]} records
 * @returns {{ valid: Record<string, any>[], invalid: { record: any, errors: string[] }[] }}
 */
export function validateAll(records) {
  const valid = []
  const invalid = []
  for (const r of records) {
    const { ok, errors } = validateRecord(r)
    if (ok) valid.push(r)
    else invalid.push({ record: r, errors })
  }
  return { valid, invalid }
}

/** Today as an ISO date, the value `captured` carries. */
export function capturedToday() {
  return new Date().toISOString().slice(0, 10)
}

/** Split a possibly-`|`-joined field back into its parts. */
export function split(v) {
  if (v === undefined || v === null) return []
  // An array is already split. **This mattered:** `brand_authorized` and
  // `line_card` are arrays in memory and `|`-joined strings once they have been
  // through a CSV, and `String(['Enerpac','Timken'])` is `"Enerpac,Timken"`,
  // which splits on `|` to ONE element. S4's first run reported
  // `brand_authorized ≥2 = 0 companies` for exactly that reason — every
  // multi-brand record counted as one brand. Callers should not have to know
  // which side of a CSV they are on.
  if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean)
  return String(v)
    .split(MULTI)
    .map((s) => s.trim())
    .filter(Boolean)
}

// ─────────────────────────────────────────────────────────────────────────────
// CSV — RFC 4180, because build-plan D4 (PF-7) is exactly this bug
// ─────────────────────────────────────────────────────────────────────────────

/**
 * One CSV cell. Quotes anything containing a comma, quote, or newline and
 * doubles embedded quotes. Company names carry commas routinely ("Hirsch Pipe &
 * Supply Co., Inc."); a naive writer corrupts every row that has one.
 */
export function csvCell(v) {
  if (v === undefined || v === null) return ''
  const s = Array.isArray(v) ? v.join(MULTI) : String(v)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/**
 * Records → CSV text in FIELDS order. Array fields are `|`-joined.
 * @param {Record<string, any>[]} records
 * @param {string[]} [fields]
 */
export function toCsv(records, fields = FIELDS) {
  const lines = [fields.map(csvCell).join(',')]
  for (const r of records) lines.push(fields.map((f) => csvCell(r[f])).join(','))
  return lines.join('\n') + '\n'
}

/**
 * CSV text → rows of cells. The inverse of {@link csvCell}: honours quoting, so
 * a `self_declaration` containing a comma or an embedded newline round-trips.
 *
 * S4 is the first stage that reads a CSV this pipeline wrote — S2 and S3 both
 * start from raw JSON — and `deduped-v4.csv` has 2,110 records across 2,171
 * physical lines, because 13 declarations are published with line breaks in
 * them. A line-splitting reader loses 61 rows silently.
 *
 * @param {string} text
 * @returns {string[][]}
 */
export function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i++
        } else quoted = false
      } else cell += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(cell)
      cell = ''
    } else if (c === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (c !== '\r') cell += c
  }
  if (cell !== '' || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

/**
 * CSV text → objects keyed by the header row. Empty cells become `null`, which
 * is what `makeRecord` and every downstream test expect for "not published".
 *
 * @param {string} text
 * @returns {Record<string, string|null>[]}
 */
export function fromCsv(text) {
  const rows = parseCsv(text)
  const header = rows[0] ?? []
  return rows
    .slice(1)
    .filter((r) => r.length === header.length)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] === '' ? null : r[i]])))
}
