/**
 * sources — display names and the named-provenance line.
 *
 * "Verified" is a strong word and it should be. It means: we recorded the page,
 * the date and the link, and the link is in the row. Every token below meets
 * that bar.
 *
 * This map is a DISPLAY map, not an allowlist. Every token renders — `dfs`
 * included (founder decision 2026-08-07, risk explicitly accepted; see
 * specs/02-client-view.md AMENDMENT 2 C-G1) — and a token with no entry falls
 * back to the raw token rather than being dropped. Dropping it would make
 * "found in N lists" a lie.
 */

/** The noun phrase that follows "Verified from ". */
export const SOURCE_PHRASE = {
  ad: 'the AD member directory',
  adaptall: 'the Adaptall distributor lookup',
  atlascopco: 'the Atlas Copco distributor locator',
  ballymore: 'the Ballymore dealer locator',
  banjo: 'the Banjo distributor locator',
  banner: 'the Banner Engineering distributor locator',
  bobcat: 'the Bobcat dealer locator',
  boschrexroth: 'the Bosch Rexroth distributor locator',
  caseih: 'the Case IH dealer locator',
  cmco: 'the Columbus McKinnon distributor locator',
  continental: 'the Continental distributor locator',
  dfs: 'the DataForSEO business listings',
  dorner: 'the Dorner distributor locator',
  enerpac: 'the Enerpac distributor locator',
  festo: 'the Festo distributor locator',
  flexlink: 'the FlexLink partner locator',
  gast: 'the Gast distributor locator',
  indsci: 'the Industrial Scientific distributor locator',
  interroll: 'the Interroll partner locator',
  kennametal: 'the Kennametal distributor list',
  kubota: 'the Kubota dealer locator',
  lincolnelectric: 'the Lincoln Electric distributor locator',
  lovejoy: 'the Lovejoy distributor locator',
  mknorthamerica: 'the MK North America partner locator',
  nord: 'the NORD distributor locator',
  ntn: 'the NTN distributor locator',
  ocenco: 'the Ocenco distributor list',
  pepperlfuchs: 'the Pepperl+Fuchs distributor locator',
  ptda: 'the PTDA member directory',
  quincy: 'the Quincy Compressor dealer locator',
  samsonrope: 'the Samson Rope distributor locator',
  serp: "the company's own website",
  skf: 'the SKF distributor locator',
  spxflow: 'the SPX FLOW distributor locator',
  sullair: 'the Sullair distributor locator',
  timken: 'the Timken authorized distributor list',
  usaspending: 'the USAspending federal award records',
  waltersurface: 'the Walter Surface Technologies distributor locator',
  yaskawa: 'the Yaskawa distributor locator',
}

/** Chip text: the brand name where we have one, the raw token where we do not. */
export function sourceLabel(token) {
  const phrase = SOURCE_PHRASE[token]
  if (!phrase) return String(token)
  // "the Enerpac distributor locator" -> "Enerpac"; "the PTDA member directory" -> "PTDA"
  const words = phrase.replace(/^the /, '').split(' ')
  return /^[A-Z0-9+]/.test(words[0]) ? words[0] : String(token)
}

export function sourcePhrase(token) {
  return SOURCE_PHRASE[token] ?? `the ${token} source`
}

/**
 * The kind suffixes that occur in SOURCE_PHRASE, longest first so
 * "authorized distributor list" wins over "distributor list".
 */
const KIND_SUFFIXES = [
  'authorized distributor list',
  'federal award records',
  'distributor locator',
  'distributor lookup',
  'distributor list',
  'business listings',
  'member directory',
  'partner locator',
  'dealer locator',
]

/**
 * The display map decomposed for the Sources page: what the source is called
 * and what kind of source it is. Derived from SOURCE_PHRASE — one map, so the
 * page and the per-row provenance lines can never disagree. An unmapped token
 * falls back to the raw token with no kind (same rule as the chips), and a
 * phrase with no recognized suffix (serp's "company's own website") renders
 * whole as the name rather than being force-split.
 */
export function sourceDisplayParts(token) {
  const phrase = SOURCE_PHRASE[token]
  if (!phrase) return { display: String(token), kind: null }
  const name = phrase.replace(/^the /, '')
  for (const kind of KIND_SUFFIXES) {
    if (name.endsWith(` ${kind}`)) return { display: name.slice(0, -(kind.length + 1)), kind }
  }
  return { display: name, kind: null }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** '2026-08-01' -> 'Aug 2026'. Anything unparseable is null, never a guess. */
export function monthYear(iso) {
  const m = /^(\d{4})-(\d{2})-\d{2}$/.exec(String(iso ?? ''))
  if (!m) return null
  const month = MONTHS[Number(m[2]) - 1]
  return month ? `${month} ${m[1]}` : null
}

/** The C-G4 wording: "Verified from {phrase}, {Mon YYYY}". */
export function provenanceLine(token, captured) {
  const when = monthYear(captured)
  return when ? `Verified from ${sourcePhrase(token)}, ${when}` : `Verified from ${sourcePhrase(token)}`
}

const chain = (v) => String(v ?? '').split('|').map((s) => s.trim()).filter(Boolean)

/**
 * One provenance line per source token.
 *
 * `source`, `source_url` and `captured` are all pipe chains, and their lengths
 * disagree on roughly 40% of seated rows. Zipping blindly attaches the wrong
 * date to the wrong source, so the zip only runs when a chain is exactly as long
 * as the source chain; otherwise the earliest recorded date stands for the row
 * and the URL is withheld rather than mis-assigned.
 */
export function provenanceRows(source, sourceUrl, captured) {
  const tokens = chain(source)
  if (!tokens.length) return { rows: [], missing: true }

  const urls = chain(sourceUrl)
  const dates = chain(captured)
  const zipUrls = urls.length === tokens.length
  const zipDates = dates.length === tokens.length
  const fallbackDate = dates.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort()[0] ?? null

  const rows = tokens.map((token, i) => {
    const when = zipDates ? dates[i] : fallbackDate
    return {
      token,
      label: sourceLabel(token),
      line: provenanceLine(token, when),
      url: zipUrls ? urls[i] : urls.length === 1 && tokens.length === 1 ? urls[0] : null,
      captured: when,
    }
  })
  return { rows, missing: false }
}

/**
 * Tokens arriving in the data from a source with no handoff folder.
 *
 * The founder's mechanism for "tell me when we're pulling from somewhere I don't
 * know about." Matched on the token only, so renaming a folder's status never
 * makes the badge flicker. It clears when someone creates the folder and
 * re-syncs — there is no dismiss control.
 */
export function newTokens(dataTokens, registryTokens) {
  const known = new Set(registryTokens ?? [])
  return [...new Set(dataTokens ?? [])].filter((t) => !known.has(t)).sort()
}

/** The inverse: a registry row with no data token. That is PLANNED, not an error. */
export function plannedTokens(dataTokens, registryTokens) {
  const seen = new Set(dataTokens ?? [])
  return [...new Set(registryTokens ?? [])].filter((t) => !seen.has(t)).sort()
}
