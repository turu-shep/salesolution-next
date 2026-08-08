/**
 * dashboard-data — the pure half of the emails operator dashboard.
 *
 * No `fs`, no network, no clock. Every time value arrives as an argument, so
 * the whole module is testable by inspection and the server file keeps sole
 * ownership of I/O. Same convention as the other `lib/*.mjs` here.
 *
 * The one rule worth stating twice: `sanitizeAccount` and `sanitizeCampaign`
 * are the boundary between the Smartlead API and the browser. The API returns
 * PLAINTEXT SMTP/IMAP passwords on every email account (verified against the
 * live account 2026-08-01 — the object carries `password`, `imap_password`,
 * `username`, `imap_username`, `smtp_host`, `imap_host`). Both functions are
 * WHITELISTS: they name the fields that may leave, rather than the fields that
 * may not, so a new secret field upstream is excluded by default rather than
 * forwarded by default. The regex sweep at the end of `sanitizeAccount` is a
 * second lock on the same door, not the door.
 */

/** The port the dashboard listens on when nothing says otherwise. */
export const DEFAULT_PORT = 4688

/** The dental campaign that is deliberately parked in DRAFTED. Never started. */
export const GATED_CAMPAIGN_IDS = [3750571]

/**
 * Stage codes for generations already in the written record.
 *
 * OPTIONAL METADATA, not the mechanism. A generation that isn't listed here
 * still resolves correctly — it just wears its family's label instead of an
 * S-code. Nobody has to come back to this file when the list advances; that is
 * the whole point of {@link resolveRegistry}.
 */
const STAGE_BY_NAME = {
  'seated-v1': 'S4d',
  'seated-v2': 'audit',
  'seated-v3': 'S4f',
  'seated-v4': 'S4g',
  'seated-v5': 'S4h',
  'seated-v6': 'S4j',
  'seated-v7': 'S4k',
  'seated-v8': 'S4l',
  'seated-v9': 'S4n',
  'deduped-v1': 'S2',
  'deduped-v2': 'S2',
  'deduped-v3': 'S3a',
  'deduped-v4': 'S3c',
  'deduped-v5': 'S4',
  'deduped-v6': 'S4',
  'deduped-v7': 'S4d',
  'shortlist-v1': 'S4',
  'shortlist-v2': 'S4b',
}

/**
 * Lists with a fixed identity rather than a version series. Matched by glob, so
 * a date-stamped name (`sendfix-routed-2026-08-01.csv`) keeps one stable
 * registry name across reruns.
 */
const NAMED_LISTS = [
  { name: 'first-send-200', glob: 'first-send-200.csv', stage: 'S4', role: 'first-send cohort', browsable: true, order: 10 },
  { name: 'first-send-200-routed', glob: 'first-send-200-routed.csv', stage: 'S4f', role: 'removed from cohort', browsable: true, order: 11 },
  { name: 'sendfix-routed', glob: 'sendfix-routed-*.csv', stage: 'S4f', role: 'routed out of seated-v2', browsable: true, order: 12 },
  { name: 'adaptall-routed', glob: 'adaptall-routed-*.csv', stage: 'S4g', role: 'routed out of seated-v3', browsable: true, order: 13 },
]

/**
 * Version series. The HIGHEST version on disk wins the live role; every older
 * generation is superseded. `mainList` marks the series that answers "what do
 * we send?" — only that one produces `current: true`.
 */
const FAMILIES = [
  { prefix: 'seated', stage: 'seated', currentRole: 'CURRENT main list', mainList: true, order: 0 },
  { prefix: 'cohort-e', stage: 'S4d', currentRole: 'dealer-email quarantine', order: 20 },
  { prefix: 'deduped', stage: 'deduped', currentRole: 'current full union', order: 21 },
  // Every shortlist generation is superseded — the series was replaced by the
  // seated series, so its newest member is not "live" in any sense.
  { prefix: 'shortlist', stage: 'shortlist', currentRole: 'superseded', neverCurrent: true, order: 22 },
]

/** Where superseded and unrecognised entries sort, relative to the live ones. */
const ORDER_SUPERSEDED = 50
const ORDER_UNCLASSIFIED = 90

/** `*` → any run of non-separator characters. Everything else is literal. */
function globToRegExp(glob) {
  const parts = String(glob)
    .split('*')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return new RegExp(`^${parts.join('[^/]*')}$`)
}

/**
 * Build the list registry from what is actually on disk.
 *
 * This replaced a hand-maintained table, and it replaced it for cause: within a
 * day of being written that table said `seated-v3` was the current list while
 * the pipeline had moved to v5, and someone had to hand-patch it. A registry
 * that has to be edited whenever the work advances will be wrong exactly when
 * it matters. So: the newest `seated-v<n>` on disk IS the current list, decided
 * numerically (v10 beats v9, which a string sort gets backwards).
 *
 * Still a lookup table from the browser's point of view — `:name` resolves
 * through the returned entries and nothing else, so a path can never reach the
 * filesystem. Files matching no known pattern are returned as `unclassified`
 * rather than dropped, so nothing sitting in `lists/` is invisible.
 *
 * Pure: takes a directory listing, touches no fs.
 *
 * @param {string[]} filenames  bare basenames, e.g. from `readdirSync`
 * @returns {{name: string, glob: string, file: string, version: number, stage: string, role: string, current: boolean, browsable: boolean, order: number}[]}
 */
export function resolveRegistry(filenames) {
  const files = (filenames || []).filter((f) => typeof f === 'string' && f !== '')
  const claimed = new Set()
  const entries = []

  // 1. Fixed-identity lists first: an explicit annotation beats a pattern.
  for (const spec of NAMED_LISTS) {
    const re = globToRegExp(spec.glob)
    const hits = files.filter((f) => re.test(f)).sort()
    if (!hits.length) continue
    const file = hits[hits.length - 1]
    claimed.add(file)
    entries.push({ ...spec, file, glob: spec.glob, version: 0, current: false })
  }

  // 2. Version series: newest wins, numerically.
  for (const family of FAMILIES) {
    const re = new RegExp(`^${family.prefix}-v(\\d+)\\.csv$`)
    const found = []
    for (const file of files) {
      if (claimed.has(file)) continue
      const match = re.exec(file)
      if (match) found.push({ file, version: Number(match[1]) })
    }
    if (!found.length) continue
    found.sort((a, b) => b.version - a.version)

    found.forEach((hit, index) => {
      claimed.add(hit.file)
      const live = index === 0 && !family.neverCurrent
      const name = hit.file.replace(/\.csv$/, '')
      entries.push({
        name,
        glob: hit.file,
        file: hit.file,
        version: hit.version,
        stage: STAGE_BY_NAME[name] || family.stage,
        role: live ? family.currentRole : 'superseded',
        current: Boolean(live && family.mainList),
        browsable: live,
        order: live ? family.order : ORDER_SUPERSEDED + family.order,
      })
    })
  }

  // 3. Anything left is still listed — unknown, but never hidden.
  for (const file of files) {
    if (claimed.has(file)) continue
    entries.push({
      name: file.replace(/\.csv$/, ''),
      glob: file,
      file,
      version: 0,
      stage: '—',
      role: 'unclassified',
      current: false,
      browsable: false,
      order: ORDER_UNCLASSIFIED,
    })
  }

  return entries.sort(
    (a, b) => a.order - b.order || (b.version || 0) - (a.version || 0) || a.name.localeCompare(b.name),
  )
}

/** The one entry that answers "what do we send?", or null if there is none. */
export function currentList(entries) {
  return (entries || []).find((entry) => entry.current) || null
}

/** The fields a free-text search looks through. */
const QUERY_FIELDS = ['company', 'company_display', 'domain', 'email', 'city']

/** The fields the dropdown filters match exactly. */
const EXACT_FIELDS = ['segment', 'tier', 'cohort', 'state']

/** `pool-<disposition>[-v<n>].csv` — the only filename shape a side pool takes. */
const POOL_FILE = /^pool-(.+?)(?:-v(\d+))?\.csv$/

/** What a credential-ish key looks like. Two booleans are deliberate exceptions. */
const CREDENTIAL_KEY = /pass|secret|token|credential|smtp|imap|api_key/i
const CREDENTIAL_KEY_EXCEPTIONS = new Set(['is_smtp_success', 'is_imap_success'])

/** The bucket an empty value falls into, so "no segment" is visible, not missing. */
const EMPTY_BUCKET = '(none)'

/**
 * The newest generation of each side pool.
 *
 * Versions compare as NUMBERS. `pool-not-a-distributor-v10.csv` sorts before
 * `-v9` as a string, which would silently serve a whole generation of routing
 * decisions out of date — the live directory has exactly that pair.
 *
 * @param {string[]} filenames  a bare `readdirSync` listing, no paths
 * @returns {{disposition: string, file: string, version: number}[]} by disposition
 */
export function latestPools(filenames) {
  const best = new Map()
  for (const file of filenames || []) {
    const m = POOL_FILE.exec(String(file))
    if (!m) continue
    const disposition = m[1]
    const version = m[2] === undefined ? 0 : Number(m[2])
    const prev = best.get(disposition)
    if (!prev || version > prev.version) best.set(disposition, { disposition, file: String(file), version })
  }
  return [...best.values()].sort((a, b) => a.disposition.localeCompare(b.disposition))
}

/**
 * Count rows by one field, most common first.
 *
 * `null`, `undefined` and `''` are one bucket. They mean the same thing here —
 * the stage that fills that column hasn't run for this row — and splitting them
 * across three labels reads as three different problems.
 *
 * @param {Record<string, unknown>[]} rows
 * @param {string} field
 * @returns {{value: string, count: number}[]}
 */
export function aggregateBy(rows, field) {
  const counts = new Map()
  for (const row of rows || []) {
    const raw = row?.[field]
    const value = raw === null || raw === undefined || raw === '' ? EMPTY_BUCKET : String(raw)
    counts.set(value, (counts.get(value) || 0) + 1)
  }
  // Stable sort: ties keep first-seen order rather than shuffling between loads.
  return [...counts.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count)
}

/**
 * Filter rows by a free-text query plus the four exact-match dropdowns.
 *
 * `q` is a case-insensitive substring over {@link QUERY_FIELDS}; the four
 * others match exactly when non-empty; everything ANDs. Values are read with
 * `String(...)`, never split or line-scanned — `company_display` inherits the
 * embedded newlines that scraped declarations carry, and a line-oriented filter
 * drops those rows without saying so.
 *
 * @param {Record<string, unknown>[]} rows
 * @param {{q?: string, segment?: string, tier?: string, cohort?: string, state?: string}} criteria
 * @returns {Record<string, unknown>[]}
 */
export function filterRows(rows, criteria = {}) {
  const q = String(criteria.q ?? '').trim().toLowerCase()
  const exact = EXACT_FIELDS.filter((f) => String(criteria[f] ?? '') !== '').map((f) => [f, String(criteria[f])])
  if (!q && !exact.length) return [...(rows || [])]

  return (rows || []).filter((row) => {
    for (const [field, want] of exact) {
      if (String(row?.[field] ?? '') !== want) return false
    }
    if (!q) return true
    for (const field of QUERY_FIELDS) {
      const v = row?.[field]
      if (v !== null && v !== undefined && String(v).toLowerCase().includes(q)) return true
    }
    return false
  })
}

/**
 * One page of rows. Both bounds are clamped rather than trusted: `offset` and
 * `limit` arrive straight off a query string.
 *
 * @param {unknown[]} rows
 * @param {number|string|undefined} offset  clamped to ≥ 0
 * @param {number|string|undefined} limit   clamped to 1..500, default 50
 * @returns {{total: number, offset: number, limit: number, rows: unknown[]}}
 */
export function paginate(rows, offset, limit) {
  const all = rows || []
  const limitRaw = Number(limit)
  const limitClamped = Number.isFinite(limitRaw) ? Math.min(500, Math.max(1, Math.trunc(limitRaw))) : 50
  const offsetRaw = Number(offset)
  const offsetClamped = Number.isFinite(offsetRaw) ? Math.max(0, Math.trunc(offsetRaw)) : 0
  return {
    total: all.length,
    offset: offsetClamped,
    limit: limitClamped,
    rows: all.slice(offsetClamped, offsetClamped + limitClamped),
  }
}

/**
 * A Smartlead email account, reduced to what an operator needs to see.
 *
 * A WHITELIST. The live account object carries plaintext `password` and
 * `imap_password` alongside the mail hosts — none of it is named here, so none
 * of it can be forwarded, and a field added upstream tomorrow is excluded by
 * default. The regex sweep afterwards is the second lock: if this projection is
 * ever widened carelessly, a credential-shaped key still doesn't leave.
 *
 * @param {Record<string, any>|null|undefined} raw
 * @returns {Record<string, any>}
 */
export function sanitizeAccount(raw) {
  const a = raw && typeof raw === 'object' ? raw : {}
  const w = a.warmup_details && typeof a.warmup_details === 'object' ? a.warmup_details : {}

  const out = {
    id: a.id ?? null,
    from_name: a.from_name ?? null,
    from_email: a.from_email ?? null,
    type: a.type ?? null,
    message_per_day: a.message_per_day ?? null,
    daily_sent_count: a.daily_sent_count ?? null,
    is_smtp_success: a.is_smtp_success ?? null,
    is_imap_success: a.is_imap_success ?? null,
    expires_at: a.expires_at ?? null,
    warmup_status: w.status ?? a.warmup_status ?? null,
    warmup_reputation: w.warmup_reputation ?? a.warmup_reputation ?? null,
    warmup_sent_count: w.total_sent_count ?? a.warmup_sent_count ?? null,
    warmup_spam_count: w.total_spam_count ?? a.warmup_spam_count ?? null,
    blocked_reason: w.blocked_reason ?? a.blocked_reason ?? null,
  }

  for (const key of Object.keys(out)) {
    if (!CREDENTIAL_KEY_EXCEPTIONS.has(key) && CREDENTIAL_KEY.test(key)) delete out[key]
  }
  return out
}

/**
 * A campaign, reduced to id / name / status / gated flag / numeric analytics.
 *
 * @param {Record<string, any>|null|undefined} raw
 * @param {Record<string, any>|null|undefined} analytics
 * @returns {{id: any, name: any, status: any, gated: boolean, created_at: any, analytics: Record<string, number>|null}}
 */
export function sanitizeCampaign(raw, analytics) {
  const c = raw && typeof raw === 'object' ? raw : {}
  const name = c.name ?? null
  return {
    id: c.id ?? null,
    name,
    status: c.status ?? null,
    gated: isGated(c.id, name),
    created_at: c.created_at ?? null,
    analytics: numericFieldsOnly(analytics),
  }
}

/** Gated by id OR by what the operator named it. Either alone is enough. */
function isGated(id, name) {
  if (GATED_CAMPAIGN_IDS.includes(Number(id))) return true
  return /GATED|do not start/i.test(String(name ?? ''))
}

/**
 * Numeric identifiers. They pass a "is it a number" test and are not aggregates,
 * so they are named and dropped: the campaign's own id already rides at the top
 * level, and the workspace's `user_id` is nobody's business in a browser.
 */
const ANALYTICS_IDENTIFIERS = new Set(['id', 'user_id', 'client_id', 'team_member_id', 'parent_campaign_id'])

/**
 * Keep the counters, drop everything else.
 *
 * The live analytics endpoint returns every counter as a STRING (`"0"`,
 * `"12"`) while the documented shape is numeric, so both are accepted and
 * normalized to a number. Booleans, nulls, dates and nested objects are not
 * counters and don't survive; neither do the numeric identifiers above.
 */
function numericFieldsOnly(analytics) {
  if (!analytics || typeof analytics !== 'object' || Array.isArray(analytics)) return null
  const out = {}
  for (const [k, v] of Object.entries(analytics)) {
    if (ANALYTICS_IDENTIFIERS.has(k)) continue
    const n = asCounter(v)
    if (n !== undefined) out[k] = n
  }
  return out
}

function asCounter(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined
  if (typeof v !== 'string') return undefined
  const s = v.trim()
  if (s === '') return undefined
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}

/**
 * What is wrong with one sending account, as of `nowIso`.
 *
 * Silence is meaningful: a missing or unparseable `expires_at` produces no
 * warning rather than a guessed one. An operator acts on this panel, so an
 * invented problem costs more than a missing one.
 *
 * @param {Record<string, any>} acct  a SANITIZED account (flat warmup fields)
 * @param {string} nowIso
 * @returns {{status: 'serious'|'warning', label: string}[]}
 */
export function accountWarnings(acct, nowIso) {
  const a = acct && typeof acct === 'object' ? acct : {}
  const out = []

  const now = Date.parse(String(nowIso ?? ''))
  const expires = Date.parse(String(a.expires_at ?? ''))
  if (Number.isFinite(now) && Number.isFinite(expires) && expires < now) {
    out.push({ status: 'serious', label: 'mailbox expired' })
  }

  if (a.is_smtp_success === false) out.push({ status: 'serious', label: 'sending connection failing' })
  if (a.is_imap_success === false) out.push({ status: 'serious', label: 'reply connection failing' })

  const warmup = a.warmup_status
  if (warmup !== null && warmup !== undefined && String(warmup).toUpperCase() !== 'ACTIVE') {
    out.push({ status: 'warning', label: `warmup ${String(warmup).toLowerCase()}` })
  }
  if (a.blocked_reason) out.push({ status: 'serious', label: 'mailbox blocked' })

  return out
}

/**
 * `--port N` ▸ `--port=N` ▸ `EMAILS_DASHBOARD_PORT` ▸ 4688.
 *
 * Each candidate is tried in order and a bad one falls through to the next, so
 * a typo'd flag lands on a working default instead of a crash.
 *
 * @param {string[]} argv  argv WITHOUT the node/script prefix
 * @param {Record<string, string|undefined>} env
 * @returns {{port: number}}
 */
export function parseArgs(argv, env) {
  const args = Array.isArray(argv) ? argv : []
  const candidates = []

  for (let i = 0; i < args.length; i++) {
    const arg = String(args[i])
    if (arg === '--port') candidates.push(args[i + 1])
    else if (arg.startsWith('--port=')) candidates.push(arg.slice('--port='.length))
  }
  candidates.push(env?.EMAILS_DASHBOARD_PORT)

  for (const candidate of candidates) {
    const port = asPort(candidate)
    if (port !== null) return { port }
  }
  return { port: DEFAULT_PORT }
}

function asPort(v) {
  if (v === undefined || v === null) return null
  const s = String(v).trim()
  if (!/^\d+$/.test(s)) return null
  const n = Number(s)
  return n >= 1 && n <= 65535 ? n : null
}
