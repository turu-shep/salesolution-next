/**
 * normalize — build-plan §3.1, and nothing else.
 *
 * §3.1 verbatim: "Phone → 10-digit. Company → lowercase, strip
 * `inc|llc|corp|co|company|ltd|the`, collapse whitespace/punctuation. Address →
 * USPS-ish abbreviations. Website field → strip Google-Maps URLs (AD stores map
 * links in the website column), extract apex domain."
 *
 * Scope discipline: §3.2 (chain suppression), §3.3 (branch rollup) and §3.4
 * (cross-source dedupe) are S2's job and deliberately live elsewhere. Every
 * function here is pure — same input, same output, no I/O, no clock.
 *
 * Tests: emails/scripts/lib/normalize.test.mjs (`node --test emails/scripts/lib/`).
 */

// ─────────────────────────────────────────────────────────────────────────────
// Phone
// ─────────────────────────────────────────────────────────────────────────────

/**
 * US phone → bare 10 digits. This is the PRIMARY JOIN KEY, so it has to be
 * exact: anything that isn't confidently a US 10-digit line returns null rather
 * than a guess that would join two different companies together.
 *
 * Extensions are cut before digit extraction — "(330) 438-3000 ext. 214" must
 * not become 3304383000214 → rejected, or worse 3304383002 → wrong company.
 *
 * @param {unknown} raw
 * @returns {string|null}
 */
export function normalizePhone(raw) {
  if (raw === undefined || raw === null) return null
  let s = String(raw)

  // Drop an extension and anything after it. Matched as "marker then digits" so
  // "3000x214" (no word boundary before the x) is caught too.
  const ext = s.match(/(?:ext(?:ension|n)?|(?<=[\d\s])x)[\s.:#*-]*\d/i)
  if (ext) s = s.slice(0, ext.index)
  // Unlabelled extension: a 4th group hung off a complete 3-3-4 number, e.g.
  // Timken's "516-678-3900-413". Anchored so "1-800-555-1212" is never touched.
  s = s.replace(/^(\s*\+?1?[\s.-]*\d{3}[\s.-]\d{3}[\s.-]\d{4})[\s.-]+\d{1,5}\s*$/, '$1')
  // A second number after a separator ("330-438-3000 / 800-555-1212") — take the first.
  s = s.split(/\s+(?:or|\/|;|\||,)\s+/i)[0]

  const digits = s.replace(/\D/g, '')
  if (digits.length === 10) return validNanp(digits)
  if (digits.length === 11 && digits[0] === '1') return validNanp(digits.slice(1))
  return null
}

/** NANP: area code and exchange both start 2-9. Rejects 000/111 placeholder rows. */
function validNanp(d) {
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(d)) return null
  return d
}

// ─────────────────────────────────────────────────────────────────────────────
// Company name
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The seven tokens §3.1 names, exactly. Not extended: "corporation",
 * "incorporated", "limited" etc. are deliberately NOT stripped, because
 * widening this list is a plan change, not an implementation detail.
 */
export const COMPANY_SUFFIX_TOKENS = new Set(['inc', 'llc', 'corp', 'co', 'company', 'ltd', 'the'])

/**
 * HTML entities → characters. Locators serve names straight out of a CMS, so
 * "Motion Ai &#8211; MN" and "Smith &amp; Sons" arrive encoded; leaving them
 * encoded splits one company into two join keys.
 *
 * @param {unknown} raw
 * @returns {string}
 */
export function decodeEntities(raw) {
  if (raw === undefined || raw === null) return ''
  return String(raw)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeCodePoint(parseInt(d, 10)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&(quot|apos|#39);/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    // Dashes and quotes publishers use in page titles. Found in the S4 run:
    // "Products &mdash; Campbell Sales and Service" reached a shortlist row with
    // the entity intact, and `company_display` is email copy (§1).
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&(ldquo|rdquo);/gi, '"')
    .replace(/&(lsquo|rsquo);/gi, "'")
    .replace(/&hellip;/gi, '…')
    .replace(/&amp;/gi, '&')
}

function safeCodePoint(n) {
  try {
    return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ''
  } catch {
    return ''
  }
}

/**
 * Branch qualifiers, stripped. Build-plan §2b: **the single biggest lever in
 * S2** — it moves distinct-company counts by 32% across the acquired set, and
 * the decision is STRIP, calibrated on Dorner (stripping reproduces the known
 * research figures).
 *
 * Three shapes, all measured in the acquired data:
 *   "Motion Ai – MN" / "BHQ - Joliet, IL"      → cut at the dash
 *   "Kirby Risk - Crawfordsville (Br# 3)"      → drop the parenthetical too
 *   "Elliott Electric Supply, Inc. #187"       → drop the trailing branch number
 *
 * `dashMode` settles the one genuinely ambiguous case — a dash with no adjacent
 * whitespace. **Default `adjacent-space`, and that is a measured correction to
 * the profiling script that produced §2b's 32% figure**, which split on any dash:
 *
 *   any             "Tri-State Bearing", "Tri-County Electrical Supply" and
 *                   "Tri-State Industrial" all become the join key `tri`.
 *                   Measured across AD + Timken: 63 keys swallow 2+ genuinely
 *                   different companies, `tri` alone swallowing 9. A join key
 *                   that merges unrelated companies is worse than one that
 *                   splits a company in two — the second is recoverable.
 *   adjacent-space  split only when the dash touches whitespace on at least one
 *                   side ("Motion Ai – MN", "Coburn Supply Company- Memphis").
 *                   Branch qualifiers virtually always have one; hyphenated
 *                   names ("Mid-City", "McNaughton-McKay", "Power-Flo") never do.
 *   both-spaces     the strictest reading; misses "Company- Memphis".
 *
 * @param {unknown} raw
 * @param {{dashMode?: 'any'|'adjacent-space'|'both-spaces'}} [opts]
 * @returns {string}
 */
const DASH_SPLIT = {
  any: /\s*[-–—]\s*/,
  'adjacent-space': /\s+[-–—]\s*|\s*[-–—]\s+/,
  'both-spaces': /\s+[-–—]\s+/,
}

export function stripBranchSuffix(raw, { dashMode = 'adjacent-space' } = {}) {
  let s = decodeEntities(raw)
  s = s.replace(/\([^)]*\)/g, ' ') // "(Br# 3)", "(Branch 12)"
  s = s.split(DASH_SPLIT[dashMode] ?? DASH_SPLIT['adjacent-space'])[0]
  s = s.replace(/[\s,]*#\s*\d+\s*$/, '') // "…, Inc. #187"
  return s.trim()
}

/**
 * Company → the normalized name used as the secondary join key.
 * lowercase · periods removed (so "L.L.C." → "llc", "U.S." → "us") · remaining
 * punctuation collapsed to spaces · the §3.1 tokens dropped · whitespace
 * collapsed.
 *
 * `stripBranch: true` runs {@link stripBranchSuffix} first — that is the §2b
 * decision, and the A/B in the S2 report is this flag flipped.
 *
 * Safety valve: if stripping tokens would empty the name (a company literally
 * called "The Company"), the punctuation-collapsed form is returned instead.
 * An empty join key silently merges unrelated records — worse than a noisy one.
 *
 * @param {unknown} raw
 * @param {{stripBranch?: boolean, dashMode?: 'any'|'adjacent-space'|'both-spaces'}} [opts]
 * @returns {string|null}
 */
export function normalizeCompany(raw, opts = {}) {
  if (raw === undefined || raw === null) return null

  const source = opts.stripBranch ? stripBranchSuffix(raw, opts) : decodeEntities(raw)

  const collapsed = source
    .toLowerCase()
    .replace(/[.]/g, '') // "l.l.c." → "llc" before punctuation becomes space
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')

  if (!collapsed) return null

  const kept = collapsed.split(' ').filter((t) => !COMPANY_SUFFIX_TOKENS.has(t))
  const stripped = kept.join(' ').trim()

  return stripped || collapsed
}

/**
 * Company name as published, cleaned only of encoding artefacts and annotations
 * that are not part of the name. §1: this is what S7 puts in the email; the
 * normalized `company` is a join key and reads as "acme bearing".
 *
 * @param {unknown} raw
 * @returns {string|null}
 */
export function displayName(raw) {
  const s = decodeEntities(raw)
    .replace(/\*\*[^*]*\*\*/g, ' ') // Enerpac's "** Temporarily Suspended **"
    .replace(/^\s*(?:distributor|dealer|service cent(?:er|re))\s*:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
  return s || null
}

// ─────────────────────────────────────────────────────────────────────────────
// Address
// ─────────────────────────────────────────────────────────────────────────────

/** USPS Publication 28 street suffixes + directionals + unit designators. */
const ADDRESS_ABBREV = {
  street: 'st',
  str: 'st',
  avenue: 'ave',
  av: 'ave',
  boulevard: 'blvd',
  road: 'rd',
  drive: 'dr',
  lane: 'ln',
  court: 'ct',
  circle: 'cir',
  place: 'pl',
  plaza: 'plz',
  parkway: 'pkwy',
  highway: 'hwy',
  turnpike: 'tpke',
  terrace: 'ter',
  trail: 'trl',
  square: 'sq',
  expressway: 'expy',
  freeway: 'fwy',
  junction: 'jct',
  crossing: 'xing',
  extension: 'ext',
  industrial: 'ind',
  north: 'n',
  south: 's',
  east: 'e',
  west: 'w',
  northeast: 'ne',
  northwest: 'nw',
  southeast: 'se',
  southwest: 'sw',
  suite: 'ste',
  apartment: 'apt',
  building: 'bldg',
  floor: 'fl',
  unit: 'unit',
  department: 'dept',
  post: 'po',
}

/**
 * Address line → USPS-ish abbreviations, lowercase, punctuation collapsed.
 * Used as the tiebreak join key (street number + zip5), so "1835 Dueber Avenue
 * SW" and "1835 Dueber Ave. S.W." have to land on the same string.
 *
 * @param {unknown} raw
 * @returns {string|null}
 */
export function normalizeAddress(raw) {
  if (raw === undefined || raw === null) return null

  const collapsed = String(raw)
    .toLowerCase()
    .replace(/[.]/g, '') // "s.w." → "sw"
    .replace(/[^a-z0-9#]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')

  if (!collapsed) return null

  return collapsed
    .split(' ')
    .map((t) => ADDRESS_ABBREV[t] ?? t)
    .join(' ')
}

/**
 * Leading house number, for the §3.4 tiebreak key (street number + zip5).
 * @param {unknown} raw
 * @returns {string|null}
 */
export function streetNumber(raw) {
  const m = String(raw ?? '').trim().match(/^(\d+)/)
  return m ? m[1] : null
}

// ─────────────────────────────────────────────────────────────────────────────
// Website field → apex domain
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hosts that mean "this locator stored a map link, not a website". AD is the
 * known offender (§3.1: "AD stores map links in the website column"), but
 * Timken and others do it too.
 */
const MAP_HOSTS = [
  'google.com/maps',
  'google.com/local',
  'maps.google.',
  'goo.gl/maps',
  'maps.app.goo.gl',
  'g.page',
  'bing.com/maps',
  'mapquest.com',
  'openstreetmap.org',
  'waze.com',
  'apple.com/maps',
  'maps.apple.com',
]

/** Placeholder strings locators use for "no website". */
const WEBSITE_NULLS = new Set([
  'n/a',
  'na',
  'none',
  'no website',
  'not available',
  'tbd',
  '-',
  '--',
  'null',
  'http://',
  'https://',
  'www',
  'http://www',
])

/**
 * Clean a locator's website field to a usable absolute URL, or null.
 * Returns null for map links, mailto:/tel:, placeholders and junk — a map link
 * left in place would be "resolved" later as a real domain and every record
 * carrying one would collapse onto google.com.
 *
 * @param {unknown} raw
 * @returns {string|null}
 */
export function cleanWebsite(raw) {
  if (raw === undefined || raw === null) return null
  let s = String(raw).trim().replace(/[<>"']/g, '')
  if (!s) return null
  if (WEBSITE_NULLS.has(s.toLowerCase())) return null
  if (/^(mailto|tel|fax|javascript):/i.test(s)) return null

  if (!/^https?:\/\//i.test(s)) {
    if (/^\/\//.test(s)) s = 'https:' + s
    else if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return null // some other scheme
    else s = 'https://' + s
  }

  let url
  try {
    url = new URL(s)
  } catch {
    return null
  }
  if (!/^https?:$/.test(url.protocol)) return null

  const probe = (url.hostname + url.pathname).toLowerCase()
  if (MAP_HOSTS.some((h) => probe.includes(h))) return null
  if (!url.hostname.includes('.')) return null

  return url.toString()
}

/**
 * Public suffixes that need three labels, not two. Deliberately short — this
 * list is US-focused, matching a US-only pipeline. It is not the full PSL.
 */
const TWO_LEVEL_TLDS = new Set([
  'co.uk',
  'org.uk',
  'ac.uk',
  'gov.uk',
  'com.au',
  'net.au',
  'org.au',
  'co.nz',
  'com.br',
  'com.mx',
  'com.cn',
  'co.jp',
  'co.in',
  'co.za',
  'com.sg',
])

/**
 * Website field → apex domain: lowercase, no www, no port, no path.
 * Runs cleanWebsite() first, so a Google-Maps URL yields null, not "google.com".
 *
 * @param {unknown} raw
 * @returns {string|null}
 */
export function apexDomain(raw) {
  const cleaned = cleanWebsite(raw)
  if (!cleaned) return null

  let host
  try {
    host = new URL(cleaned).hostname.toLowerCase()
  } catch {
    return null
  }
  host = host.replace(/\.$/, '').replace(/^www\d*\./, '')
  // A typo'd URL parses ("folsomindustrial,.com" survives new URL()) but is not
  // a domain. Reject rather than emit a value the contract has to refuse later.
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*$/.test(host)) return null

  const labels = host.split('.')
  if (labels.length < 2) return null
  if (/^\d+$/.test(labels[labels.length - 1])) return null // bare IP

  const lastTwo = labels.slice(-2).join('.')
  const take = labels.length > 2 && TWO_LEVEL_TLDS.has(lastTwo) ? 3 : 2
  return labels.slice(-take).join('.')
}

/**
 * Does this apex domain sit on a foreign country-code TLD?
 *
 * The SERP source is domain-keyed and has no address, so the usual `country`
 * test is unavailable — the TLD is the only country signal a domain carries.
 * Any two-letter final label that is not `us` counts as foreign. That is a blunt
 * rule and it is *deliberately* blunt: it costs a handful of US companies on
 * `.io` / `.co`, and those are routed to a side pool with `disposition: non-US`
 * rather than deleted, so the cost is recoverable and the gain (Honduras,
 * Maldives, Liberia, Togo and Tunisia domains staying out of a US send list) is
 * not.
 *
 * @param {unknown} apex
 * @returns {boolean}
 */
export function isForeignCcTld(apex) {
  const last = String(apex ?? '')
    .toLowerCase()
    .split('.')
    .pop()
  return /^[a-z]{2}$/.test(last) && last !== 'us'
}

/**
 * Apex domain → a human-readable fallback name. Used ONLY where a source
 * publishes no company name at all (SERP self-identification), and every record
 * built this way carries `needs_identity_resolution: true`.
 *
 * "central-hydraulicsmn.com" → "Central Hydraulicsmn". It is a placeholder, not
 * a legal name, and the flag is what stops it reaching an email before S3.
 *
 * @param {unknown} apex
 * @returns {string|null}
 */
export function domainLabelName(apex) {
  const label = String(apex ?? '')
    .toLowerCase()
    .split('.')[0]
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!label) return null
  return label.replace(/\b[a-z]/g, (c) => c.toUpperCase())
}

// ─────────────────────────────────────────────────────────────────────────────
// US postal fields
// ─────────────────────────────────────────────────────────────────────────────

/** The 50 states + DC + PR/VI/GU/AS/MP. Used to decide `state` and US-only. */
export const US_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC','PR','VI','GU','AS','MP',
])

/**
 * State → 2-letter USPS code, or null if it isn't a US state.
 * @param {unknown} raw
 * @returns {string|null}
 */
export function normalizeState(raw) {
  if (raw === undefined || raw === null) return null
  const s = String(raw).trim().toUpperCase().replace(/\./g, '')
  if (US_STATES.has(s)) return s
  const full = STATE_NAMES[s.toLowerCase()]
  return full ?? null
}

const STATE_NAMES = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO',
  connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID',
  illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS', kentucky: 'KY', louisiana: 'LA',
  maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI', minnesota: 'MN',
  mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK', oregon: 'OR',
  pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD',
  tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT', virginia: 'VA', washington: 'WA',
  'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY', 'district of columbia': 'DC',
  'puerto rico': 'PR',
}

/**
 * ZIP → 5 digits. ZIP+4 is truncated; a Canadian postal code returns null.
 * @param {unknown} raw
 * @returns {string|null}
 */
export function normalizeZip5(raw) {
  if (raw === undefined || raw === null) return null
  const m = String(raw).trim().match(/\b(\d{5})(?:-?\d{4})?\b/)
  return m ? m[1] : null
}

// ─────────────────────────────────────────────────────────────────────────────
// Email
// ─────────────────────────────────────────────────────────────────────────────

/**
 * One lowercase address, or null. Multi-address fields ("a@x.com, b@x.com")
 * keep the first — the contract carries one `email` and `email_source`, and a
 * comma-joined blob would ship straight into a send tool as a malformed
 * recipient.
 *
 * @param {unknown} raw
 * @returns {string|null}
 */
export function normalizeEmail(raw) {
  if (raw === undefined || raw === null) return null
  const m = String(raw)
    .toLowerCase()
    .replace(/^\s*mailto:/, '')
    .match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/)
  return m ? m[0] : null
}

// ─────────────────────────────────────────────────────────────────────────────
// Single-line US address → parts (AD publishes one blob, not fields)
// ─────────────────────────────────────────────────────────────────────────────

/** Street-type words that mark the end of the street portion of a blob. */
const STREET_TYPES = new Set([
  'st','street','ave','avenue','av','blvd','boulevard','rd','road','dr','drive','ln','lane',
  'ct','court','cir','circle','pl','place','plz','plaza','pkwy','parkway','hwy','highway',
  'tpke','turnpike','ter','terrace','trl','trail','sq','square','expy','expressway','fwy',
  'freeway','way','loop','run','row','path','pass','bend','ridge','pt','point','park','ctr',
  'center','centre','jct','junction','xing','crossing','alley','aly','pike','route','rte',
  'broadway','walk','landing','lndg','commons','close','curve','crest','cove','creek','bay',
  'mall','mews','oval','quay','ramp','spur','vista','estates','industrial','ext','extension',
])

/** Unit designators that can sit between the street and the city. */
const UNIT_WORDS = new Set([
  'ste','suite','unit','apt','apartment','bldg','building','fl','floor','rm','room','dept',
  'department','box','po','pmb','lot','space','spc','#','no',
])

const DIRECTIONALS = new Set([
  'n','s','e','w','ne','nw','se','sw','north','south','east','west',
  'northeast','northwest','southeast','southwest',
])

/**
 * "8188 Commercial Street La Mesa, CA 91942" → street / city / state / zip5.
 *
 * AD is the only acquired source that publishes the whole address as one blob.
 * The state and ZIP are pinned by the trailing `, ST 12345`; the street/city
 * boundary is found by scanning for the LAST street-type word, then stepping
 * past any unit tail ("Suite 300") and pulling a trailing directional back onto
 * the street ("1711 Sixth Street, SW Canton" → street "…Street SW", city
 * "Canton").
 *
 * Grid addresses with no street type ("370 S 200 E Crawfordsville") cannot be
 * split this way; those return `city: null` and the whole blob as `address_1`
 * rather than a guess. `address_1` still yields the street number, which is the
 * tiebreak join key — so an unsplit row is degraded, not broken.
 *
 * @param {unknown} raw
 * @returns {{address_1: string|null, city: string|null, state: string|null, zip5: string|null, split: boolean}}
 */
export function splitUsAddressLine(raw) {
  const s = decodeEntities(raw).replace(/\s+/g, ' ').trim()
  const out = { address_1: null, city: null, state: null, zip5: null, split: false }
  if (!s) return out

  const tail = s.match(/^(.*?)[,\s]+([A-Za-z]{2})[.,\s]+(\d{5})(?:-\d{4})?\s*$/)
  let head = s
  if (tail) {
    head = tail[1].trim().replace(/,$/, '')
    out.state = normalizeState(tail[2])
    out.zip5 = normalizeZip5(tail[3])
    if (!out.state) head = s // a 2-letter word that isn't a state — don't eat it
  }

  const tokens = head.split(' ')
  const bare = tokens.map((t) => t.replace(/[.,]/g, '').toLowerCase())

  let cut = -1
  for (let i = tokens.length - 2; i >= 0; i--) {
    if (STREET_TYPES.has(bare[i])) {
      cut = i
      break
    }
  }

  if (cut >= 0) {
    let i = cut + 1
    // "…Street SW Canton" — a directional belongs to the street, not the city.
    if (DIRECTIONALS.has(bare[i]) && i + 1 < tokens.length) i++
    // "…Way Circle Suite 300 Pottstown" — step past the unit tail.
    while (i + 1 < tokens.length && (UNIT_WORDS.has(bare[i]) || /^#/.test(bare[i]))) i += 2
    if (i < tokens.length) {
      out.address_1 = normalizeAddress(tokens.slice(0, i).join(' '))
      out.city = tokens.slice(i).join(' ').replace(/[,]+$/, '').trim() || null
      out.split = true
      return out
    }
  }

  out.address_1 = normalizeAddress(head)
  return out
}
