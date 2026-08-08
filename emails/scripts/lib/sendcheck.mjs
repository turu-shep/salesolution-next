/**
 * sendcheck — the three list-level defects that block a send, as pure functions.
 *
 * Named in build-plan §5t. Each one is a rule, not a fix list: the twelve rows
 * carrying `info.us@nord.com` were the visible part, and every rule here is
 * written to sweep the whole file rather than to patch the rows already known.
 *
 *   1. {@link emailVerdict}      a manufacturer's own inbox seated as the
 *                                prospect's contact address
 *   2. {@link declarationIsNegated}  the INVERSE sentence — "is **not** an
 *                                authorized distributor" — sitting in a sendable
 *                                row's `self_declaration`
 *   3. {@link usGeoVerdict}      a null `state` satisfying a US-only filter
 *
 * The fourth (§5t's D3-against-its-own-brand hole) belongs to the detector and
 * lives in `manufacturer.mjs`.
 *
 * No filesystem, no network, no dates. Every function is a function of its
 * arguments so the runner can be re-run and the tests can pin behaviour.
 *
 * @module sendcheck
 */
import { BRAND_OWNER_DOMAINS, MARKETPLACE_DOMAINS } from './vertical.mjs'

// ─────────────────────────────────────────────────────────────────────────────
// Domains
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Multi-label public suffixes we actually meet. `parker.co.uk` and
 * `radwell.co.uk` both appear in this data, and a naive last-two-labels apex
 * turns them into `co.uk` — which then matches every other `.co.uk` address.
 */
const SECOND_LEVEL = new Set(['co', 'com', 'net', 'org', 'gov', 'edu', 'ac'])

/**
 * Registrable domain for a host. `ra.rockwell.com` → `rockwell.com`,
 * `us.pepperl-fuchs.com` → `pepperl-fuchs.com`, `parker.co.uk` unchanged.
 *
 * @param {unknown} host
 * @returns {string} lowercase apex, or `''`
 */
export function apexDomain(host) {
  const h = String(host ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/[/?#].*$/, '')
    .replace(/\.+$/, '')
  const p = h.split('.').filter(Boolean)
  if (p.length < 2) return p.join('.')
  if (p.length >= 3 && p.at(-1).length === 2 && SECOND_LEVEL.has(p.at(-2))) return p.slice(-3).join('.')
  return p.slice(-2).join('.')
}

/** The label an apex is built on: `nord.com` → `nord`. Punctuation squashed. */
export const apexLabel = (host) => apexDomain(host).split('.')[0].replace(/[^a-z0-9]/g, '')

/**
 * Manufacturer hosts named by `emails/research/01-dealer-locator-sources.md` and
 * `06-adjacent-segments.md` that the acquirer registry does not already carry.
 *
 * Every entry is a locator source this program actually inventoried — the table
 * rows are "manufacturer → its own dealer-locator URL", so the domain is the
 * manufacturer's own by construction. Nothing here is recalled from memory.
 */
export const RESEARCH_MANUFACTURER_DOMAINS = [
  'airtechvacuum.com', // Airtech Vacuum — research/01
  'arozone.com', // ARO (Ingersoll Rand) — research/01
  'beckerpumps.com', // Becker Pumps — research/01
  'camfil.com', // Camfil — research/06
  'campbellchainandfittings.com', // Campbell Chain — research/01
  'continental-industry.com', // Continental / ContiTech — research/01
  'copeland.com', // Copeland — research/06
  'domino-printing.com', // Domino — research/06
  'grpumps.com', // Gorman-Rupp — research/01
  'hammondpowersolutions.com', // Hammond Power Solutions — research/06
  'henkel-adhesives.com', // Henkel / Loctite — research/06
  'kaeser.com', // Kaeser — research/01
  'lenze.com', // Lenze — research/06
  'littelfuse.com', // Littelfuse — research/06
  'matthewsmarking.com', // Matthews Marking Systems — research/06
  'mersen.com', // Mersen — research/06
  'mknorthamerica.com', // mk North America — research/06
  'nederman.com', // Nederman — research/06
  'nordson.com', // Nordson — research/06
  'pemnet.com', // PennEngineering (PEM) — research/06
  'pentair.com', // Pentair — research/06
  'ptplace.com', // Dodge (RBC) storefront `dodge.ptplace.com` — research/01
  'qcconveyors.com', // QC Conveyors — research/06
  'rollingoninterroll.com', // Interroll — research/01
  'seweurodrive.com', // SEW-Eurodrive — research/01
  'signode.com', // Signode — research/06
  'spirol.com', // SPIROL — research/06
  'stauffusa.com', // STAUFF — research/06
  'strongtie.com', // Simpson Strong-Tie — research/06
  'sumitomodrive.com', // Sumitomo Drive — research/06
  'turck.us', // Turck — research/01
  'vestil.com', // Vestil — research/01
  'videojet.com', // Videojet — research/06
  'walter.com', // Walter Surface — research/01
  'xylem.com', // Xylem / Goulds — research/01
]

/**
 * Manufacturer hosts the sweep itself surfaced, each one confirmed against the
 * row it was found on before being added. **These are corporate inboxes seated
 * as a prospect's contact**; the evidence is in the comment, not in memory.
 *
 * The bar for entry: the address belongs to a company that makes its own
 * products, and the seated row it sits on is a different company.
 */
export const SWEPT_MANUFACTURER_DOMAINS = [
  // `productsafety@ra.rockwell.com` on cbtcompany.com. `rockwellautomation.com`
  // is already a registry brand-owner host and Allen-Bradley is in the brand
  // vocabulary; `ra.rockwell.com` is the same company's second host.
  'rockwell.com',
  // `webmaster-cfp@idexcorp.com` on vikingpump.com — IDEX is Viking Pump's
  // parent, recorded in `_first-send-200-reasoning-2026-08-01.md` §1.
  'idexcorp.com',
  // `vivek.bandekar@ametek.com` on ametekfactoryautomation.com — AMETEK's own
  // corporate host, on a row that is AMETEK's own division.
  'ametek.com',
  // `de-data-protection@igus.net` on igus.com — igus's German privacy inbox.
  'igus.net',
  // `nd-info@hbfuller.com` on ndindustries.com — H.B. Fuller, adhesives maker.
  'hbfuller.com',
  // `information-hydraulics@hengst.com` on mainfilter.com — Hengst filtration.
  'hengst.com',
  // `info@buschusa.com` on buschvacuum.com — Busch Vacuum's US host.
  'buschusa.com',
  // `info@hawe-microfluid.com` on hawe.com — HAWE Hydraulik group host.
  'hawe-microfluid.com',
  // `prodinfo@ricelake.com` on arlingtonscale.com — Rice Lake Weighing Systems,
  // the scale manufacturer whose products that dealer sells.
  'ricelake.com',
  // `contacto@fischer-technology.com` on helmut-fischer.com — Helmut Fischer's
  // instrument host.
  'fischer-technology.com',
]

/**
 * Every host an email must not come from unless it is the company's own.
 *
 * Three evidence bases, union'd: the acquirer's `manufacturer` registry in
 * `lib/vertical.mjs`, the research inventory, and the swept additions. Stored
 * as apexes so `us.pepperl-fuchs.com` resolves against `pepperl-fuchs.com`.
 */
export const MANUFACTURER_EMAIL_DOMAINS = new Set(
  [...BRAND_OWNER_DOMAINS, ...RESEARCH_MANUFACTURER_DOMAINS, ...SWEPT_MANUFACTURER_DOMAINS].map(apexDomain),
)

/** Marketplaces + national chains, from the same registry. Reported, not nulled. */
export const MARKETPLACE_EMAIL_DOMAINS = new Set(MARKETPLACE_DOMAINS.map(apexDomain))

/**
 * Consumer / ISP mailbox providers. A `@gmail.com` address on a distributor's
 * record is normal and is NOT a mismatch finding — it is how a 12-person shop
 * publishes its contact. Everything here was observed in this list.
 */
export const FREE_EMAIL_DOMAINS = new Set([
  'aim.com', 'alltel.net', 'aol.com', 'att.net', 'bellsouth.net', 'bright.net', 'cableone.net',
  'cablelynx.com', 'centurytel.net', 'charter.net', 'comcast.net', 'cox.net', 'earthlink.net',
  'embarqmail.com', 'frontier.com', 'frontiernet.net', 'gmail.com', 'gmx.com', 'googlemail.com',
  'hotmail.com', 'icloud.com', 'juno.com', 'live.com', 'mac.com', 'mail.com', 'me.com', 'msn.com',
  'netzero.net', 'outlook.com', 'pacbell.net', 'peoplepc.com', 'proton.me', 'protonmail.com',
  'qwestoffice.net', 'roadrunner.com', 'rocketmail.com', 'sbcglobal.net', 'suddenlink.net',
  'verizon.net', 'windstream.net', 'yahoo.com', 'ymail.com',
])

/**
 * RFC 2606 / vendor placeholders. Never a real recipient. Reported as their own
 * bucket rather than nulled — §5t's rule is about manufacturer inboxes, and
 * widening it silently is how a fix becomes a second defect.
 */
export const PLACEHOLDER_EMAIL_DOMAINS = new Set([
  'com.com', 'demolink.org', 'domain.com', 'example.com', 'example.net', 'example.org',
  'mydomain.com', 'mysite.com', 'test.com', 'yourcompany.com', 'yourdomain.com', 'yourwebsite.com',
])

/**
 * Corporate suffixes a brand owner bolts onto its own label, so `atlascopcousa`
 * resolves to the brand `atlascopco`. Same list `vertical.mjs` measured, kept
 * local so the two rules cannot drift apart silently.
 */
const OWNER_SUFFIXES = ['corporation', 'americas', 'america', 'company', 'holdings', 'group', 'corp', 'usa', 'inc', 'llc', 'ltd', 'na', 'us', 'co']

/**
 * Does this email host belong to a manufacturer?
 *
 * Registry first, then the **list-free** rule §5m proved: every brand in the
 * program's own `brand_authorized` vocabulary is by definition a manufacturer,
 * so an apex label that IS one of those brands is that manufacturer's own host.
 * `nucor.com` and `atlascopcousa.com` arrive that way with nobody maintaining a
 * list.
 *
 * @param {string} host
 * @param {Set<string>} [brandVocab] squashed brand labels
 * @returns {{domain: string, rule: 'registry'|'brand-owner', matched: string}|null}
 */
export function manufacturerHost(host, brandVocab = null) {
  const apex = apexDomain(host)
  if (!apex) return null
  if (MANUFACTURER_EMAIL_DOMAINS.has(apex)) return { domain: apex, rule: 'registry', matched: apex }
  if (!brandVocab || !brandVocab.size) return null
  const label = apexLabel(apex)
  // Three characters is where `vertical.mjs` measured the false-positive rate to
  // zero; two would make `3m` match every `3m*` label.
  if (label.length < 3) return null
  if (brandVocab.has(label)) return { domain: apex, rule: 'brand-owner', matched: label }
  for (const suf of OWNER_SUFFIXES) {
    if (!label.endsWith(suf)) continue
    const stem = label.slice(0, -suf.length)
    if (stem.length >= 3 && brandVocab.has(stem)) return { domain: apex, rule: 'brand-owner', matched: stem }
  }
  return null
}

/**
 * Is this row's seated `email` a valid contact for this row?
 *
 * §5t's rule, stated once: **an email whose domain is a known manufacturer
 * domain and does not match the company's own apex domain is invalid.** Twelve
 * rows carried `info.us@nord.com` — NORD Drivesystems' own US inbox, published
 * on its dealer locator for dealers that list no address of their own. Mailing
 * one sends a pitch about a distributor's catalog to the manufacturer whose
 * products they carry.
 *
 * The second bucket is deliberately weaker and deliberately does not null:
 * an email whose domain merely differs from the company's is usually benign — a
 * parent company, a sister brand, an owner's personal address.
 *
 * @param {{email?: string|null, domain?: string|null}} record
 * @param {{brandVocab?: Set<string>}} [opts]
 * @returns {{verdict: 'none'|'own-domain'|'free-provider'|'manufacturer-inbox'|'marketplace-inbox'|'placeholder'|'domain-mismatch', email_domain: string|null, why: string, matched?: string, rule?: string}}
 */
export function emailVerdict(record, opts = {}) {
  const email = String(record?.email ?? '').trim().toLowerCase()
  if (!email || !email.includes('@')) return { verdict: 'none', email_domain: null, why: 'no email on the record' }
  const host = email.slice(email.lastIndexOf('@') + 1)
  const emailApex = apexDomain(host)
  const ownApex = apexDomain(record?.domain)
  if (emailApex && ownApex && emailApex === ownApex)
    return { verdict: 'own-domain', email_domain: emailApex, why: 'the address is on the company’s own domain' }

  const mfg = manufacturerHost(host, opts.brandVocab)
  if (mfg)
    return {
      verdict: 'manufacturer-inbox',
      email_domain: emailApex,
      rule: mfg.rule,
      matched: mfg.matched,
      why:
        mfg.rule === 'registry'
          ? `${emailApex} is a known manufacturer host and is not ${ownApex || 'the company’s domain'}`
          : `${emailApex}'s apex label matches the manufacturer brand "${mfg.matched}" and is not ${ownApex || 'the company’s domain'}`,
    }
  if (FREE_EMAIL_DOMAINS.has(emailApex))
    return { verdict: 'free-provider', email_domain: emailApex, why: 'a consumer mailbox — normal for a small distributor' }
  if (PLACEHOLDER_EMAIL_DOMAINS.has(emailApex))
    return { verdict: 'placeholder', email_domain: emailApex, why: 'a reserved / template domain, never a real recipient' }
  if (MARKETPLACE_EMAIL_DOMAINS.has(emailApex))
    return { verdict: 'marketplace-inbox', email_domain: emailApex, why: `${emailApex} is a known marketplace or national chain host` }
  return { verdict: 'domain-mismatch', email_domain: emailApex, why: `${emailApex} is not ${ownApex || 'the company’s domain'} and is not a consumer provider` }
}

// ─────────────────────────────────────────────────────────────────────────────
// Negated declarations
// ─────────────────────────────────────────────────────────────────────────────

/** The reseller nouns a negation has to be attached to for it to mean anything. */
const RESELLER_NOUN = '(?:distributors?|dealers?|resellers?|representatives?|agents?|affiliates?)'

/**
 * The inverse sentence, as published. Each pattern binds the negation to the
 * reseller noun rather than looking for a negation word anywhere before it.
 *
 * **Why the binding matters.** `acquire/serp_selfid_wave3.py` scopes its check
 * to one sentence and the exact phrase it matched; a CSV row carries neither,
 * so the loose port fired on `berringtonpumps.com` ("Stock SERFILCO **Non**-
 * Metallic Pumps … VANTON **MASTER DISTRIBUTOR**") and on "Price is **not** the
 * **only** criterion for measuring **suppliers**". Both are real declarations
 * and clearing them would have cost genuine copy.
 */
const NEGATED_DECL = [
  // "… is not an authorized distributor", "are not a dealer for"
  new RegExp(`\\b(?:is|are|was|were|am|'m|'re|be|being|been)\\s+not\\s+(?:an?|the)?\\s*(?:\\w+[\\s-]+){0,3}?${RESELLER_NOUN}\\b`, 'i'),
  // "not an authorized distributor of the manufacturers listed"
  new RegExp(`\\bnot\\s+(?:an?|the)\\s+(?:\\w+[\\s-]+){0,3}?${RESELLER_NOUN}\\b`, 'i'),
  // "We are a Non-Authorized Stocking Distributor for the following brands"
  /\bnon[\s-]?authoris?z?(?:ed)?\b/i,
  new RegExp(`\\bun[\\s-]?authoris?z?(?:ed)?\\s+(?:\\w+[\\s-]+){0,2}?${RESELLER_NOUN}\\b`, 'i'),
  new RegExp(`\\bneither\\s+(?:an?\\s+)?(?:\\w+[\\s-]+){0,3}?${RESELLER_NOUN}\\b`, 'i'),
  new RegExp(`\\bno\\s+longer\\s+(?:an?\\s+)?(?:\\w+[\\s-]+){0,3}?${RESELLER_NOUN}\\b`, 'i'),
  new RegExp(`\\bnever\\s+(?:been\\s+)?(?:an?\\s+)?(?:\\w+[\\s-]+){0,3}?${RESELLER_NOUN}\\b`, 'i'),
]

/**
 * Does this declaration say the company is **NOT** an authorized distributor?
 *
 * §5k found brokers and grey-market resellers publishing the exact inverse
 * sentence. A phrase reader sees "authorized distributor" and files a claim.
 * **Quoting one back at a prospect would be a catastrophe** — which is why this
 * runs over every sendable row rather than trusting the mapper that was
 * supposed to have stopped them: §5o's "zero leaked" held for the first-send
 * cohort and not for `seated-v2`.
 *
 * @param {unknown} text the declaration sentence as published
 * @returns {boolean}
 */
export function declarationIsNegated(text) {
  const s = String(text ?? '')
  if (!s.trim()) return false
  return NEGATED_DECL.some((rx) => rx.test(s))
}

/** The declaration heads `DECL_RX` matches on, for the loose suspect test. */
const DECL_ANCHORS = [
  /(?:authorized|authorised|factory[- ]authorized|certified|approved|official)\s+(?:\w+[\s-]+){0,4}?(?:stocking\s+)?(?:distributor|dealer|reseller|partner|integrator|repair\s+cent(?:er|re)|service\s+cent(?:er|re))/i,
  /(?:distributor|dealer|reseller|partner)s?\s+(?:of|for)\s+\w/i,
  /(?:largest|leading|premier|exclusive|only|oldest|#\s?1)\s+(?:\w+[\s-]+){0,4}?(?:distributor|dealer|supplier)/i,
  /(?:master|exclusive|sole|stocking|full[- ]line|value[- ]added)\s+distributor/i,
  /\b(?:distributor|dealer|reseller|authorized)\b/i,
]
/** §5k's negation vocabulary, verbatim from `serp_selfid_wave3.py`. */
const LOOSE_NEGATION = /\b(not|never|no|non|unauthorized|un-authorized|neither|nor|without)\b/i

/**
 * The loose port of `serp_selfid_wave3.py::declaration_is_negated` — a negation
 * word anywhere before a declaration head.
 *
 * Kept, and deliberately **not** used to clear text. It is the review net: a row
 * it flags that {@link declarationIsNegated} does not is a sentence worth a
 * human glance before it is quoted, not a sentence to delete.
 *
 * @param {unknown} text
 * @returns {boolean}
 */
export function declarationNegationSuspect(text) {
  const s = String(text ?? '')
  if (!s.trim()) return false
  for (const rx of DECL_ANCHORS) {
    const m = rx.exec(s)
    if (m && LOOSE_NEGATION.test(s.slice(0, m.index))) return true
  }
  return false
}

// ─────────────────────────────────────────────────────────────────────────────
// US geography
// ─────────────────────────────────────────────────────────────────────────────

/** The 13 Canadian provinces and territories, by code. */
export const CA_PROVINCES = new Set(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'])

/**
 * Province NAMES are **not** a usable signal on their own and this list exists
 * to say so. Measured on this list: "Ontario" is a city in California, New York
 * and Oregon; "New Brunswick" is a city in New Jersey (and a street in Fords);
 * "Quebec" is an avenue in New Hope, Minnesota. Every one of those routed a US
 * distributor out on the first cut. A province name only counts when it arrives
 * with a Canadian postal code and no US postal identity.
 */
const CA_PROVINCE_NAMES = [
  'alberta', 'british columbia', 'manitoba', 'new brunswick', 'newfoundland', 'nova scotia',
  'northwest territories', 'nunavut', 'ontario', 'prince edward island', 'quebec', 'québec',
  'saskatchewan', 'yukon',
]

/**
 * NANP area codes that are **not** United States: the Canadian set plus the
 * non-US Caribbean. A ten-digit phone looks American to a regex and is the only
 * geography half these rows carry, so the exclusions have to be named.
 */
export const NON_US_AREA_CODES = new Set([
  // Canada
  '204', '226', '236', '249', '250', '263', '289', '306', '343', '354', '365', '367', '368', '382',
  '403', '416', '418', '428', '431', '437', '438', '450', '468', '474', '506', '514', '519', '548',
  '579', '581', '584', '587', '604', '613', '639', '647', '672', '683', '705', '709', '742', '753',
  '778', '780', '782', '807', '819', '825', '867', '873', '879', '902', '905',
  // Caribbean + Atlantic NANP members that are not US territories
  '242', '246', '264', '268', '284', '345', '441', '473', '649', '658', '664', '721', '758', '767',
  '784', '809', '829', '849', '868', '869', '876',
])

/** The 50 states + DC + the territories that carry USPS codes. */
export const US_STATE_CODES = new Set(
  ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY ' +
    'NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC PR VI GU AS MP').split(' '),
)

/** A Canadian postal code: `N9A 1B2`. The letters exclude D, F, I, O, Q, U. */
const CA_POSTAL = /\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d\b/i
/**
 * ccTLDs that are never a US business's primary host. **`.co` is deliberately
 * absent** — Colombia's ccTLD is sold as a generic vanity suffix and
 * `dynamicsupply.co` is in Adrian, Michigan.
 */
const FOREIGN_TLD = /\.(ca|co\.uk|uk|au|de|fr|mx|nl|it|es|se|dk|no|fi|pl|br|cn|in|jp|kr|ru|za|ie|ch|at|be|pt|cz|nz|sg|tw|tr|il|ar|cl|pe|ve)$/i

/** Rough US bounding boxes: continental, Alaska, Hawaii, Puerto Rico. */
const US_BOXES = [
  [24.4, 49.4, -125.0, -66.9],
  [51.0, 71.6, -179.9, -129.0],
  [18.8, 22.4, -160.4, -154.7],
  [17.8, 18.6, -67.4, -65.2],
]

/**
 * Is this record's address inside the United States?
 *
 * **The defect §5t names: a null `state` used to pass.** `checkerindustrial.com`
 * is in Windsor, **Ontario**, and reached rank 200 of a US-only list because
 * `state` and `zip5` were both null and the whole locality sat unparsed in
 * `city` as `"Windsor, ON N8Y 1E9"`. A US-state test cannot fire on a null, and
 * a filter that reads "not a foreign state" answers *pass* for a record it has
 * never looked at.
 *
 * So the verdict has three values, not two. **`unverified` is not `US`** — a
 * missing state cannot satisfy the US check, it routes to review.
 *
 * ## Precedence, and why it is this way round
 *
 * A **complete US postal identity — a valid state code AND a valid ZIP5 —
 * settles the record**, and the foreign tests run after it. That ordering was
 * not the first cut: putting the foreign tests first routed out eleven genuine
 * US distributors in one pass, because "Ontario" is a city in California, "New
 * Brunswick" is a street in Fords NJ, "BC" is a company's initials, and a
 * `.co.uk` host sat on a Hollywood, Florida address. **Every true Canadian in
 * this list carries neither a state nor a ZIP** — which is exactly why the null
 * was the hole.
 *
 * @param {Record<string, any>} record
 * @returns {{verdict: 'US'|'non-US'|'unverified', why: string, signals: string[], conflicts: string[]}}
 */
export function usGeoVerdict(record) {
  const state = String(record?.state ?? '').trim().toUpperCase()
  const zip5 = String(record?.zip5 ?? '').trim()
  const blob = [record?.city, record?.address_1, record?.company_display, record?.company].filter(Boolean).join(' , ')
  const upper = blob.toUpperCase()
  const lower = blob.toLowerCase()
  const hasUsState = state.length === 2 && US_STATE_CODES.has(state)
  const hasZip = /^\d{5}$/.test(zip5)
  const caPostal = CA_POSTAL.test(blob) && !/\b\d{5}\b/.test(blob)

  // ── foreign signals, strongest first.
  const signals = []
  if (CA_PROVINCES.has(state) && !US_STATE_CODES.has(state)) signals.push(`state "${state}" is a Canadian province`)
  // `Windsor, ON N8Y 1E9` — the whole locality unparsed into `city`. The postal
  // code is required: a bare ", ON" is "M.B. McKee, ON…" as often as it is
  // Ontario, and a bare province code cost four false routes on its own.
  const inlineProv = /(^|,)\s*(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)\s+[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]/.exec(upper)
  if (inlineProv) signals.push(`province code "${inlineProv[2]}" with a Canadian postal code in an unparsed locality`)
  if (caPostal && !inlineProv) signals.push('a Canadian-shaped postal code and no US ZIP')
  const provinceWord = CA_PROVINCE_NAMES.find((p) => new RegExp(`(^|[^a-z])${p}([^a-z]|$)`).test(lower))
  if (provinceWord && caPostal) signals.push(`"${provinceWord}" in the address, with a Canadian postal code`)
  const area = /^\d{10}$/.test(String(record?.phone_e164 ?? '')) ? String(record.phone_e164).slice(0, 3) : null
  if (area && NON_US_AREA_CODES.has(area)) signals.push(`area code ${area} is not United States`)
  const domainApex = apexDomain(record?.domain)
  if (domainApex && FOREIGN_TLD.test(domainApex)) signals.push(`foreign ccTLD on ${domainApex}`)

  // ── a complete US postal identity settles it. Any foreign signal alongside it
  // is a conflict worth naming, not a route.
  if (hasUsState && hasZip)
    return { verdict: 'US', why: `state ${state} + zip5 ${zip5}`, signals: [], conflicts: signals }
  if (signals.length) return { verdict: 'non-US', why: signals[0], signals, conflicts: [] }

  // ── partial postal identity. One half is still positive evidence.
  if (hasUsState) return { verdict: 'US', why: `state ${state}`, signals: [], conflicts: [] }
  if (hasZip) return { verdict: 'US', why: `zip5 ${zip5}`, signals: [], conflicts: [] }

  // ── no postal identity at all. Weaker evidence may still place it, and it is
  // labelled as weaker: a US area code plus a US-boxed lat/lng is what lifts
  // `toolkrib.com` out of review, and neither is a postal address.
  const lat = Number(record?.lat)
  const lng = Number(record?.lng)
  const boxed =
    Number.isFinite(lat) && Number.isFinite(lng) && US_BOXES.some(([a, b, c, d]) => lat >= a && lat <= b && lng >= c && lng <= d)
  if (area && boxed) return { verdict: 'US', why: `area code ${area} + lat/lng inside the US (no postal address)`, signals: [], conflicts: [] }
  return {
    verdict: 'unverified',
    why: state || zip5 ? `state "${state}" / zip "${zip5}" is not a US postal identity` : 'no state and no zip5 — the US test never fired',
    signals,
    conflicts: [],
  }
}
