/**
 * smartlead — REST client for the Smartlead v1 API (cold-email sending).
 *
 * Dual-use: import the named functions, or run the file directly for the
 * read-only operator commands.
 *
 *   node scripts/lib/smartlead.mjs campaigns
 *   node scripts/lib/smartlead.mjs accounts
 *   node scripts/lib/smartlead.mjs analytics <campaignId>
 *   node scripts/lib/smartlead.mjs export-leads <campaignId> [outfile]
 *
 * Secrets (.env.local — auto-loaded; or run with node --env-file=.env.local):
 *   SMARTLEAD_API_KEY   Smartlead → Settings → API Key.
 *
 * Two things about this API to know before reading the code:
 *
 *   - Auth is a QUERY PARAMETER, not a header (`?api_key=…`), so every request
 *     URL is itself a secret. Nothing here logs or throws a raw URL — redact()
 *     runs over every message, and `politeFetch` from emails/scripts/lib is
 *     deliberately NOT reused: it writes each response to an on-disk cache
 *     keyed by (and storing) the full URL, which would leave the key in
 *     plaintext under emails/data/cache.
 *   - The rate limit is 10 requests / 2 seconds, account-wide. Every call goes
 *     through one serialized queue spaced 200ms apart, so parallel callers
 *     still take turns.
 *
 * Verified against the live API on 2026-08-01: the two read paths the CLI uses
 * (`/campaigns/`, `/email-accounts/`) both returned 200. Everything that writes
 * follows the documented v1 shapes and is UNTESTED — see setCampaignStatus.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// ── env ──────────────────────────────────────────────────────────────────────
// Same convention as scripts/precall-scan.mjs, but resolved from this file's
// own location rather than the cwd: a lib module gets imported from anywhere,
// and `.env.local` only ever lives at the repo root.
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

function loadEnv() {
  const file = resolve(REPO_ROOT, '.env.local')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
}
loadEnv()

// ── transport ────────────────────────────────────────────────────────────────
const BASE = 'https://server.smartlead.ai/api/v1'
const MIN_INTERVAL_MS = 200 // 10 requests / 2s → one every 200ms
const MAX_ATTEMPTS = 4
const TIMEOUT_MS = 120_000 // a leads-export CSV can be slow to assemble
const PAGE_LIMIT = 100 // API max for every offset/limit endpoint
const MAX_PAGES = 200 // stop a runaway loop if the API ever ignores `offset`

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const enc = (v) => encodeURIComponent(String(v))

/** Strip the api_key out of anything on its way to a log, throw, or stderr. */
const redact = (s) => String(s).replace(/([?&]api_key=)[^&\s"']*/gi, '$1REDACTED')

function apiKey() {
  const key = process.env.SMARTLEAD_API_KEY
  if (!key)
    throw new Error(
      'Missing SMARTLEAD_API_KEY — add it to .env.local (get it from Smartlead → Settings → API Key), or run with node --env-file=.env.local',
    )
  return key
}

function buildUrl(path, query = {}) {
  const url = new URL(BASE + path)
  url.searchParams.set('api_key', apiKey())
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
  }
  return url
}

// One queue for the whole process. `chain` serializes, `lastAt` spaces.
let chain = Promise.resolve()
let lastAt = 0

function queued(task) {
  const next = chain.then(async () => {
    const wait = MIN_INTERVAL_MS - (Date.now() - lastAt)
    if (wait > 0) await sleep(wait)
    try {
      return await task()
    } finally {
      lastAt = Date.now()
    }
  })
  chain = next.catch(() => {}) // keep the chain alive when a task rejects
  return next
}

/**
 * One throttled, retrying request. JSON in, JSON out — unless `raw`, which
 * returns the body as text (the leads export is CSV).
 *
 * @param {string} method
 * @param {string} path        e.g. '/campaigns/'
 * @param {object} [opts]
 * @param {Record<string, unknown>} [opts.query]
 * @param {unknown} [opts.body]
 * @param {boolean} [opts.raw=false]
 * @returns {Promise<any>}
 */
function request(method, path, { query, body, raw = false } = {}) {
  const url = buildUrl(path, query)
  const safe = `${method} ${redact(url)}`

  return queued(async () => {
    let backoff = 1000

    for (let attempt = 1; ; attempt++) {
      let res
      try {
        res = await fetch(url, {
          method,
          headers: {
            accept: raw ? 'text/csv, */*' : 'application/json',
            ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
          },
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        })
      } catch (err) {
        // undici sometimes carries the request URL in the message — redact it.
        if (attempt >= MAX_ATTEMPTS)
          throw new Error(`Smartlead ${safe}: ${redact(err.message)} (after ${attempt} attempts)`)
        await sleep(backoff)
        backoff *= 2
        continue
      }

      // 429 is a pace signal, 5xx is transient. Everything else is an answer.
      if ((res.status === 429 || res.status >= 500) && attempt < MAX_ATTEMPTS) {
        const retryAfter = Number(res.headers.get('retry-after'))
        const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : backoff
        await sleep(waitMs)
        backoff *= 2
        continue
      }

      const text = await res.text()
      if (!res.ok) throw new Error(`Smartlead ${safe} → HTTP ${res.status}: ${redact(text).slice(0, 300)}`)
      if (raw) return text
      if (!text.trim()) return null
      try {
        return JSON.parse(text)
      } catch {
        throw new Error(`Smartlead ${safe} → 200 but not JSON: ${redact(text).slice(0, 200)}`)
      }
    }
  })
}

/**
 * Walk an offset/limit endpoint to the end.
 *
 * Smartlead is inconsistent about the envelope: /email-accounts returns a bare
 * array, while /campaigns/:id/leads and /statistics wrap the page as
 * `{ data: [...], total_leads | total_stats }`. Handle both.
 */
async function fetchAll(path, { query = {}, limit = PAGE_LIMIT } = {}) {
  const out = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const body = await request('GET', path, { query: { ...query, offset: page * limit, limit } })
    const rows = Array.isArray(body) ? body : (body && body.data) || []
    out.push(...rows)
    if (rows.length < limit) break
  }
  return out
}

// ── campaigns ────────────────────────────────────────────────────────────────
/** @returns {Promise<any[]>} every campaign on the account. */
export function listCampaigns() {
  return request('GET', '/campaigns/')
}

export function getCampaign(id) {
  return request('GET', `/campaigns/${enc(id)}`)
}

/** `client_id` is for whitelabel sub-accounts; null means "mine". */
export function createCampaign({ name, client_id = null }) {
  if (!name) throw new Error('createCampaign: name is required')
  return request('POST', '/campaigns/create', { body: { name, client_id } })
}

/** settings: { track_settings, stop_lead_settings, unsubscribe_text, send_as_plain_text, follow_up_percentage, … } */
export function updateCampaignSettings(id, settings) {
  return request('POST', `/campaigns/${enc(id)}/settings`, { body: settings })
}

/** schedule: { timezone, days_of_the_week, start_hour, end_hour, min_time_btw_emails, max_leads_per_day } */
export function updateCampaignSchedule(id, schedule) {
  return request('POST', `/campaigns/${enc(id)}/schedule`, { body: schedule })
}

const CAMPAIGN_STATUSES = ['START', 'PAUSED', 'STOPPED']

/**
 * START | PAUSED | STOPPED. Note the asymmetry: you START a campaign but read
 * its state back as ACTIVE.
 *
 * The docs disagree on the verb — the API reference lists this sibling as POST,
 * the help-center article writes PATCH. POST is used here; if a live run ever
 * comes back 404/405, that is the line to flip.
 */
export function setCampaignStatus(id, status) {
  if (!CAMPAIGN_STATUSES.includes(status))
    throw new Error(`setCampaignStatus: status must be one of ${CAMPAIGN_STATUSES.join(' | ')} (got ${status})`)
  return request('POST', `/campaigns/${enc(id)}/status`, { body: { status } })
}

// ── sequences ────────────────────────────────────────────────────────────────
export function getSequences(id) {
  return request('GET', `/campaigns/${enc(id)}/sequences`)
}

/**
 * Save the whole sequence set — this replaces what's there, it does not append.
 * Takes the bare array or an already-wrapped { sequences } object; the API
 * wants the wrapped form.
 */
export function saveSequences(id, sequences) {
  const body = Array.isArray(sequences) ? { sequences } : sequences
  return request('POST', `/campaigns/${enc(id)}/sequences`, { body })
}

// ── leads ────────────────────────────────────────────────────────────────────
// Anything not on this list is rejected by the API. Per-lead merge variables
// belong in `custom_fields` (an object, max 200 keys), not at the top level.
const LEAD_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'company_name',
  'website',
  'phone_number',
  'location',
  'linkedin_profile',
  'company_url',
  'custom_fields',
]

// Smartlead accepts up to 400 per POST; 100 keeps a failed batch cheap to redo.
const LEAD_BATCH = 100

function toLead(lead, dropped) {
  const out = {}
  for (const [k, v] of Object.entries(lead)) {
    if (!LEAD_FIELDS.includes(k)) dropped.add(k)
    else if (v !== undefined && v !== null && v !== '') out[k] = v
  }
  return out
}

/**
 * Add leads to a campaign, auto-chunked into batches of ≤100.
 *
 * Unknown top-level keys are stripped (the API rejects them) and reported back
 * as `dropped_fields` — if a merge variable shows up there, it needs to move
 * into `custom_fields`.
 *
 * @param {string|number} id
 * @param {object[]} leads
 * @param {object} [settings] ignore_global_block_list, ignore_unsubscribe_list,
 *   ignore_duplicate_leads_in_other_campaign, ignore_community_bounce_list
 * @returns {Promise<object>} summed counters + the raw per-batch responses
 */
export async function addLeads(id, leads, settings = {}) {
  const dropped = new Set()
  const list = leads.map((l) => toLead(l, dropped))
  const missing = list.filter((l) => !l.email).length
  if (missing) throw new Error(`addLeads: ${missing} lead(s) have no email — email is required`)

  const responses = []
  for (let i = 0; i < list.length; i += LEAD_BATCH) {
    responses.push(
      await request('POST', `/campaigns/${enc(id)}/leads`, {
        body: { lead_list: list.slice(i, i + LEAD_BATCH), settings },
      }),
    )
  }

  // Sum whatever numeric counters came back rather than naming them, so a new
  // one in the API response doesn't get silently dropped from the summary.
  const totals = {}
  for (const r of responses) {
    for (const [k, v] of Object.entries(r || {})) {
      if (typeof v === 'number') totals[k] = (totals[k] || 0) + v
    }
  }

  return { sent: list.length, batches: responses.length, dropped_fields: [...dropped], ...totals, responses }
}

/** Every lead on a campaign, paginated to the end. */
export function listCampaignLeads(id) {
  return fetchAll(`/campaigns/${enc(id)}/leads`)
}

/** CSV, not JSON — returned as text. */
export function exportLeadsCsv(id) {
  return request('GET', `/campaigns/${enc(id)}/leads-export`, { raw: true })
}

/** Account-wide lookup. Returns `{}` (not a 404) when the email is unknown. */
export function fetchLeadByEmail(email) {
  return request('GET', '/leads/', { query: { email } })
}

// ── email accounts ───────────────────────────────────────────────────────────
/** Every sending account on the workspace, paginated to the end. */
export function listEmailAccounts() {
  return fetchAll('/email-accounts/')
}

export function addEmailAccountsToCampaign(id, emailAccountIds) {
  return request('POST', `/campaigns/${enc(id)}/email-accounts`, {
    body: { email_account_ids: emailAccountIds },
  })
}

// ── stats ────────────────────────────────────────────────────────────────────
/** Campaign totals — sent / opens / clicks / replies / bounces. */
export function getCampaignAnalytics(id) {
  return request('GET', `/campaigns/${enc(id)}/analytics`)
}

/** Per-email rows behind those totals, paginated to the end. */
export function getCampaignStatistics(id, query = {}) {
  return fetchAll(`/campaigns/${enc(id)}/statistics`, { query })
}

// ── webhooks ─────────────────────────────────────────────────────────────────
export function listWebhooks(id) {
  return request('GET', `/campaigns/${enc(id)}/webhooks`)
}

/**
 * Create or update in one call: `id: null` creates, an existing webhook id
 * updates. webhook: { id, name, webhook_url, event_types: ['EMAIL_REPLY', …], categories }
 */
export function upsertWebhook(id, webhook) {
  return request('POST', `/campaigns/${enc(id)}/webhooks`, { body: { id: null, ...webhook } })
}

// ── CLI (read-only) ──────────────────────────────────────────────────────────
/** a***@domain.tld — enough to identify a sending account without printing it. */
function maskEmail(email) {
  const [user, domain] = String(email || '').split('@')
  if (!domain) return '(no email)'
  return `${user.slice(0, 1)}***@${domain}`
}

async function runCampaigns() {
  const campaigns = await listCampaigns()
  const rows = Array.isArray(campaigns) ? campaigns : []
  console.log(`campaigns: ${rows.length}`)
  for (const c of rows) console.log(`  ${c.id}  ${c.status || '?'}  ${c.name}`)
}

async function runAccounts() {
  const accounts = await listEmailAccounts()
  console.log(`email accounts: ${accounts.length}`)
  for (const a of accounts) {
    const warmup = a.warmup_details?.status || (a.is_smtp_success === false ? 'smtp-failed' : 'ok')
    console.log(`  ${a.id}  ${maskEmail(a.from_email)}  ${warmup}`)
  }
}

async function runAnalytics(campaignId) {
  if (!campaignId) throw new Error('analytics: pass a campaign id')
  console.log(JSON.stringify(await getCampaignAnalytics(campaignId), null, 2))
}

async function runExportLeads(campaignId, outfile) {
  if (!campaignId) throw new Error('export-leads: pass a campaign id')
  const csv = await exportLeadsCsv(campaignId)
  const out = outfile || `campaign-${campaignId}-leads.csv`
  writeFileSync(out, csv)
  // Header row doesn't count, and a trailing newline isn't a row either.
  const rows = Math.max(0, csv.trim().split('\n').length - 1)
  console.log(`exported ${rows} leads → ${out}`)
}

const USAGE = 'Usage: node scripts/lib/smartlead.mjs campaigns | accounts | analytics <campaignId> | export-leads <campaignId> [outfile]'

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const [cmd, ...rest] = process.argv.slice(2)
  ;(async () => {
    try {
      if (cmd === 'campaigns') await runCampaigns()
      else if (cmd === 'accounts') await runAccounts()
      else if (cmd === 'analytics') await runAnalytics(rest[0])
      else if (cmd === 'export-leads') await runExportLeads(rest[0], rest[1])
      else console.log(USAGE)
    } catch (e) {
      console.error('ERROR:', redact(e.message))
      process.exit(1)
    }
  })()
}
