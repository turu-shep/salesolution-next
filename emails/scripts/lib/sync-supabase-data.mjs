/**
 * sync-supabase-data — the pure half of the Supabase sync.
 *
 * No `fs`, no network, no clock, same convention as `dashboard-data.mjs`. Every
 * mapping decision that could silently corrupt a count lives here so it can be
 * tested by inspection.
 *
 * Two rules worth stating twice:
 *   - A value that will not parse becomes NULL, never 0 and never ''. A missing
 *     number written as zero puts every unmeasured company under a "<$1M" style
 *     filter and deletes them from every view.
 *   - `captured` and `source_url` are PIPE CHAINS in the real files and their
 *     lengths disagree with `source` on ~40% of seated rows. Both are stored
 *     verbatim; only `captured_date` is derived, and only for sorting.
 */
import { split } from './contract.mjs'

/** What the sync says when the project is asleep. Never a bare fetch error. */
export const PAUSED_MESSAGE = 'project paused — restore it in the Supabase dashboard'

/** The 11 side pools that ride along with the seated list. A different count is a data question. */
export const POOL_DISPOSITIONS = [
  'above-ceiling',
  'adjacent-trades',
  'chains',
  'duplicate-sites',
  'identity-backlog',
  'non-us',
  'not-a-distributor',
  'ranked-out',
  'segment-w',
  'small-shops',
  'usaspending-unmatched',
]

/**
 * `{token} [{STATUS}]` — greedy token up to the space-bracket, because tokens
 * carry hyphens (`e4-headless-locators`), both ends anchored. `dashboard/` does
 * not match, and that is guardrail 5: a match would register a phantom source
 * token named `dashboard` with zero rows, forever.
 */
export const SOURCE_DIR_RE = /^(.+) \[([A-Z-]+)\]$/

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Lowercase, strip `www.`, trim. A join key, not a canonicalizer — nothing else is stripped. */
export function normDomain(v) {
  if (v === null || v === undefined) return null
  const s = String(v).trim().toLowerCase().replace(/^www\./, '')
  return s === '' ? null : s
}

function textOrNull(v) {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

function numOrNull(v) {
  const s = textOrNull(v)
  if (s === null) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function dateOrNull(v) {
  const s = textOrNull(v)
  if (s === null || !ISO_DATE.test(s)) return null
  return s
}

/** The earliest parseable ISO date in a possibly-`|`-joined `captured` value. */
export function firstDate(captured) {
  const dates = split(captured).filter((d) => ISO_DATE.test(d)).sort()
  return dates.length ? dates[0] : null
}

/**
 * One CSV row -> one `contacts` row.
 *
 * `raw` carries the WHOLE row, every column, as read. That is the point: the
 * typed columns carry the filters and `raw` carries the drift, so a new column
 * in generation N+1 needs no migration.
 *
 * @param {Record<string, string|null>} raw
 * @param {{generation: string, pool: string, index: number}} ctx
 */
export function toContactRow(raw, ctx) {
  const r = raw || {}
  const first = textOrNull(r.contact_first_name)
  const last = textOrNull(r.contact_last_name)
  const email = textOrNull(r.email)
  return {
    id: `${ctx.generation}:${ctx.pool}:${ctx.index}`,
    list_generation: ctx.generation,
    pool: ctx.pool,
    company: textOrNull(r.company),
    company_display: textOrNull(r.company_display),
    domain: normDomain(r.domain),
    address_1: textOrNull(r.address_1),
    city: textOrNull(r.city),
    state: textOrNull(r.state),
    zip5: textOrNull(r.zip5),
    phone_e164: textOrNull(r.phone_e164),
    category_core: numOrNull(r.category_core),
    brand_authorized: textOrNull(r.brand_authorized),
    line_card: textOrNull(r.line_card),
    source: textOrNull(r.source),
    source_url: textOrNull(r.source_url),
    captured: textOrNull(r.captured),
    captured_date: firstDate(r.captured),
    // TEXT on purpose. This is the company's own claim about its branch count,
    // not a count of rows we hold, and it is never summed into a total.
    location_count: textOrNull(r.location_count),
    segment: textOrNull(r.segment),
    tier: textOrNull(r.tier),
    cohort: textOrNull(r.cohort),
    icp_class: textOrNull(r.icp_class),
    size_band: textOrNull(r.size_band),
    rank_score: numOrNull(r.rank_score),
    disposition: textOrNull(r.disposition),
    source_tokens: split(r.source),
    email: email === null ? null : email.toLowerCase(),
    // The CSV has no `email_state` column; `contact_email_status` is the value
    // the schema's `email_state` was named for.
    email_state: textOrNull(r.contact_email_status),
    has_person: Boolean(first || last),
    raw: r,
  }
}

/** One `verify-results.csv` row -> one `verify_results` row. Verdict verbatim. */
export function toVerifyRow(raw) {
  const r = raw || {}
  return {
    email: String(r.email ?? '').trim().toLowerCase(),
    result: String(r.result ?? '').trim(),
    flags: textOrNull(r.flags),
    verified_date: dateOrNull(r.verified_date),
  }
}

const n = (v) => Number(v).toLocaleString('en-US')

/**
 * The conservation report. File rows and DB rows must match EXACTLY. A sync that
 * silently drops 40 rows produces a dashboard that is confidently wrong, which
 * is worse than one that is down.
 *
 * @param {{label: string, file: number, db: number}[]} counts
 * @returns {{lines: string[], ok: boolean}}
 */
export function conservationLines(counts) {
  const rows = counts || []
  const width = Math.max(14, ...rows.map((c) => String(c.label).length))
  let ok = true
  const lines = rows.map((c) => {
    const good = c.file === c.db
    if (!good) ok = false
    return `${String(c.label).padEnd(width)}  file ${n(c.file).padStart(7)}   db ${n(c.db).padStart(7)}   ${good ? 'ok' : 'MISMATCH'}`
  })
  return { lines, ok }
}

/** Directory names -> the source folders, sorted by token. Non-matching names are not sources. */
export function parseSourceDirs(names) {
  const out = []
  for (const name of names || []) {
    const m = SOURCE_DIR_RE.exec(String(name))
    if (!m) continue
    out.push({ token: m[1], status: m[2], folder: String(name) })
  }
  return out.sort((a, b) => a.token.localeCompare(b.token))
}

/**
 * The pack README's registry table -> one entry per token.
 *
 * `—` is a legitimate cell and becomes null, never 0. A guessed number is worse
 * than an empty one.
 */
export function parseRegistryTable(markdown) {
  const map = new Map()
  for (const line of String(markdown || '').split('\n')) {
    if (!line.startsWith('|')) continue
    const cells = line.split('|').slice(1, -1).map((c) => c.trim())
    if (cells.length < 7) continue
    const [token, status, rawRows, seated, lastPull, estLeft] = cells
    if (!/^[a-z0-9][a-z0-9-]*$/.test(token)) continue // skips the header and the |---| rule
    map.set(token, {
      status_row: status || null,
      raw_rows: intOrNull(rawRows),
      seated: intOrNull(seated),
      last_pull: dateOrNull((lastPull.match(/\d{4}-\d{2}-\d{2}/) || [])[0]),
      est_left: estLeft === '—' ? null : estLeft || null,
    })
  }
  return map
}

function intOrNull(v) {
  const s = String(v ?? '').replace(/,/g, '').trim()
  if (!/^\d+$/.test(s)) return null
  return Number(s)
}

/** `> **STATUS (2026-08-04):** text` -> `text`. A malformed or missing banner is null, never a crash. */
export function parseStatusBanner(markdown) {
  const m = /^>\s*\*\*STATUS\s*\([^)]*\):\*\*\s*(.+)$/m.exec(String(markdown || ''))
  return m ? m[1].trim() : null
}

/** Connection refused / DNS gone / timeout — the shapes a paused free-tier project produces. */
export function isPausedError(err) {
  const code = err?.cause?.code ?? err?.code ?? ''
  if (['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT', 'UND_ERR_CONNECT_TIMEOUT'].includes(code)) return true
  return /fetch failed|network|socket hang up/i.test(String(err?.message ?? ''))
}
