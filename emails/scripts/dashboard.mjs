/**
 * dashboard — a read-only, loopback-only operator cockpit over `emails/`.
 *
 *   node emails/scripts/dashboard.mjs [--port 4688]
 *   pnpm emails:dashboard
 *
 * It answers six questions and nothing else: how big is the sendable list, what
 * blocks the first send, where did every sourced record go, what is actually in
 * the list, what is Smartlead's live state, and what changed last.
 *
 * Three rails hold this file down. They are not style preferences.
 *
 *   1. READ-ONLY BY OMISSION. The Smartlead import below takes three read
 *      functions. Every mutating function that module exports — status changes,
 *      lead upload, sequence saves, webhook upserts, campaign creation, settings
 *      and schedule updates, mailbox attachment, lead export — is simply never
 *      imported, so no code path, bug included, can act on a campaign. Campaign
 *      3750571 is a deliberately parked draft; this server cannot change it.
 *      Non-GET requests are refused outright.
 *   2. NOTHING IS WRITTEN. No file is created, appended to, renamed or removed
 *      at runtime, and no response is cached to disk. The workspace's
 *      polite-fetch helper is deliberately NOT reused for Smartlead: it persists
 *      each response keyed by full URL, and a Smartlead URL carries the API key
 *      in its query string. Request URLs are never logged, and any thrown
 *      message has URLs stripped before it reaches the browser.
 *   3. CREDENTIALS DO NOT CROSS THE WIRE. Every account and campaign goes
 *      through the whitelists in `lib/dashboard-data.mjs`. The live API returns
 *      plaintext SMTP/IMAP passwords; the browser must never see one.
 *
 * Rails 1 and 2 are enforced by two grep guards (see the plan's Task 5). Those
 * guards must print NOTHING, so the forbidden function names are described
 * above rather than spelled out — a comment that trips the check forever is a
 * comment that teaches the next reader to ignore it.
 *
 * CSVs are parsed only with `parseCsv` from `lib/contract.mjs`. Splitting on
 * newlines undercounts every list here — scraped `self_declaration` values
 * embed line breaks inside quoted cells.
 *
 * Design: docs/superpowers/specs/2026-08-01-emails-dashboard-design.md
 */
import { createServer } from 'node:http'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'
import { parseCsv } from './lib/contract.mjs'
import {
  accountWarnings,
  aggregateBy,
  currentList,
  filterRows,
  latestPools,
  paginate,
  parseArgs,
  resolveRegistry,
  sanitizeAccount,
  sanitizeCampaign,
} from './lib/dashboard-data.mjs'
// READ FUNCTIONS ONLY — see rail 1 above. Do not widen this list.
import { getCampaignAnalytics, listCampaigns, listEmailAccounts } from '../../scripts/lib/smartlead.mjs'

// ── layout ───────────────────────────────────────────────────────────────────
// Resolved from this file, never from the cwd, so `node emails/scripts/…` and
// `node dashboard.mjs` from inside the directory behave identically.
const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..', '..')
const EMAILS_DIR = join(REPO_ROOT, 'emails')
const LISTS_DIR = join(EMAILS_DIR, 'lists')
const POOLS_DIR = join(EMAILS_DIR, 'data', 'side-pools')
const DATA_DIR = join(EMAILS_DIR, 'data')
const EXPORTS_DIR = join(EMAILS_DIR, 'exports')
const HTML_FILE = join(HERE, 'dashboard.html')

/** The stage report that carries the S4f conservation numbers. */
const SENDFIX_REPORT = /^_sendfix-\d{4}-\d{2}-\d{2}\.json$/
/** An audit report that may be rendered. Anchored, and re-checked against a listing. */
const REPORT_NAME = /^_[\w.-]+\.md$/
/** A suppression or do-not-contact list, in either format. */
const SUPPRESSION_FILE = /^(suppression|dnc)[\w.-]*\.(csv|txt)$/i

const SMARTLEAD_TTL_MS = 120_000
/** Cap the analytics fan-out: one extra throttled request per campaign. */
const MAX_CAMPAIGNS = 10
/** Parsed rows are heavy (the deduped generations are ~10 MB each). Hold few. */
const ROW_CACHE_MAX = 4

// ── read-only fs, cached by mtime ────────────────────────────────────────────
// The list work is running in parallel, so nothing is snapshotted at boot: each
// read re-checks `mtimeMs` and re-parses when the file moved underneath us.
const rowCache = new Map()
const countCache = new Map()

function safeReaddir(dir) {
  try {
    return readdirSync(dir)
  } catch {
    return []
  }
}

function mtimeOf(path) {
  try {
    return statSync(path).mtimeMs
  } catch {
    return null
  }
}

/**
 * CSV text → `{fields, rows}`, matching `fromCsv` semantics exactly (short rows
 * dropped, empty cells null) while keeping the header, which `fromCsv` discards.
 */
function parseTable(text) {
  const grid = parseCsv(text)
  const fields = grid[0] ?? []
  const rows = []
  for (let i = 1; i < grid.length; i++) {
    const cells = grid[i]
    if (cells.length !== fields.length) continue
    const row = {}
    for (let j = 0; j < fields.length; j++) row[fields[j]] = cells[j] === '' ? null : cells[j]
    rows.push(row)
  }
  return { fields, rows }
}

/** Full rows for one file. Bounded cache — parsed 10 MB lists do not all fit. */
function readTable(path) {
  const mtimeMs = mtimeOf(path)
  if (mtimeMs === null) return null
  const hit = rowCache.get(path)
  if (hit && hit.mtimeMs === mtimeMs) return hit
  const parsed = parseTable(readFileSync(path, 'utf8'))
  const entry = { mtimeMs, fields: parsed.fields, rows: parsed.rows }
  rowCache.set(path, entry)
  while (rowCache.size > ROW_CACHE_MAX) rowCache.delete(rowCache.keys().next().value)
  return entry
}

/**
 * Row count and header only.
 *
 * Deliberately separate from {@link readTable}: the overview counts all sixteen
 * lineage generations (~51 MB), and holding every one of those parsed would cost
 * hundreds of megabytes to answer a question about integers.
 */
function readCount(path) {
  const mtimeMs = mtimeOf(path)
  if (mtimeMs === null) return null
  const hit = countCache.get(path)
  if (hit && hit.mtimeMs === mtimeMs) return hit
  const cached = rowCache.get(path)
  const entry =
    cached && cached.mtimeMs === mtimeMs
      ? { mtimeMs, fields: cached.fields, total: cached.rows.length }
      : (() => {
          const grid = parseCsv(readFileSync(path, 'utf8'))
          const fields = grid[0] ?? []
          let total = 0
          for (let i = 1; i < grid.length; i++) if (grid[i].length === fields.length) total++
          return { mtimeMs, fields, total }
        })()
  countCache.set(path, entry)
  return entry
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

// ── the registry: the only way a filename is ever chosen ─────────────────────

/**
 * The registry, rebuilt from the directory listing and cached until the
 * directory itself changes.
 *
 * Keyed on the DIRECTORY's mtime, which moves when a file is added or removed —
 * exactly when the registry could change. Rewriting a file in place leaves the
 * registry identical and only moves that file's own row count, which
 * {@link readCount} tracks on its own mtime.
 */
let registryCache = null

function registry() {
  const mtimeMs = mtimeOf(LISTS_DIR)
  if (registryCache && registryCache.mtimeMs === mtimeMs) return registryCache.entries
  const entries = resolveRegistry(safeReaddir(LISTS_DIR))
  registryCache = { mtimeMs, entries }
  return entries
}

/**
 * Resolve a `:name` from the browser to a file on disk, or null.
 *
 * A lookup table, not a path join: the client sends `seated-v5` or
 * `pool:chains` and anything else — including `../../package.json` — misses the
 * table and 404s before the filesystem is touched at all.
 *
 * Superseded generations DO resolve here even though they are `browsable:
 * false`. That flag governs what the dropdown offers, not what may be read: an
 * operator auditing why v4 became v5 needs to open v4, and it is the same
 * registry-vetted read as any other.
 */
function resolveList(name) {
  const entry = registry().find((l) => l.name === name)
  if (entry) {
    return { ...entry, dir: LISTS_DIR }
  }
  if (name.startsWith('pool:')) {
    const disposition = name.slice('pool:'.length)
    const pool = latestPools(safeReaddir(POOLS_DIR)).find((p) => p.disposition === disposition)
    if (!pool) return null
    return {
      name,
      dir: POOLS_DIR,
      file: pool.file,
      stage: 'side-pool',
      role: `disposition: ${disposition}`,
      browsable: true,
      current: false,
    }
  }
  return null
}

/** Belt-and-braces containment: a resolved file must sit inside its own root. */
function withinDir(dir, file) {
  const abs = resolve(dir, file)
  return abs === dir || abs.startsWith(dir + '/') ? abs : null
}

// ── overview ─────────────────────────────────────────────────────────────────

function lineage() {
  return registry().map((entry) => {
    // Only count what is actually a CSV: an unclassified `.md` note dropped in
    // lists/ still gets a row, but parsing it would invent a row count.
    const counted = entry.file.toLowerCase().endsWith('.csv') ? readCount(join(LISTS_DIR, entry.file)) : null
    return {
      name: entry.name,
      file: entry.file,
      rows: counted ? counted.total : null,
      stage: entry.stage,
      role: entry.role,
      current: Boolean(entry.current),
      browsable: Boolean(entry.browsable),
    }
  })
}

function newestSendfix() {
  const names = safeReaddir(DATA_DIR)
    .filter((n) => SENDFIX_REPORT.test(n))
    .sort()
  if (!names.length) return null
  const file = names[names.length - 1]
  const json = readJson(join(DATA_DIR, file))
  return json ? { file, json } : null
}

/**
 * The S4f conservation invariant: everything that went into S4f came out either
 * seated or routed. Reported by the stage, then recomputed against the files as
 * they are right now — a stage report is a claim, the CSVs are the evidence.
 *
 * PINNED to S4f's own inputs and outputs, deliberately. This is a HISTORICAL
 * stage invariant, not a statement about the current list. Re-pointing it at
 * whatever `seated-v<n>` happens to be newest would false-FAIL the moment a
 * later stage adds or removes a row (v4 folded in Adaptall, v5 split a NAP),
 * and it would be asking a question no stage ever promised to answer. The
 * payload is labelled so the UI cannot imply it covers the current list.
 */
const S4F_INPUT_FILE = 'seated-v2.csv'
const S4F_OUTPUT_FILE = 'seated-v3.csv'

function conservation(sendfix) {
  const lhs = countOfFile(S4F_INPUT_FILE)
  const seatedOut = countOfFile(S4F_OUTPUT_FILE)
  const routed = Array.isArray(sendfix?.json?.routed) ? sendfix.json.routed.length : null
  const rhs = seatedOut === null || routed === null ? null : seatedOut + routed
  return {
    label: 'S4f conservation',
    scope: `${S4F_INPUT_FILE} → ${S4F_OUTPUT_FILE} + routed (historical stage check, not the current list)`,
    reported: sendfix?.json?.conservation ?? null,
    recomputed: {
      lhs,
      rhs,
      pass: lhs !== null && rhs !== null && lhs === rhs,
      formula: `rows(${S4F_INPUT_FILE.replace(/\.csv$/, '')}) == rows(${S4F_OUTPUT_FILE.replace(/\.csv$/, '')}) + routed`,
    },
  }
}

/** Row count for one literal filename inside `emails/lists/`. */
function countOfFile(file) {
  const abs = withinDir(LISTS_DIR, file)
  if (!abs || !existsSync(abs)) return null
  const counted = readCount(abs)
  return counted ? counted.total : null
}

function pipeline() {
  const apollo = Boolean(process.env.APOLLO_API_KEY)
  const neverbounce = Boolean(process.env.NEVERBOUNCE_API)
  const verifyResults = existsSync(`${DATA_DIR}/verify-results.csv`)
  const exportsExists = existsSync(EXPORTS_DIR)
  return [
    { id: 'S1', title: 'SOURCE', status: 'done', detail: '32,004 records sourced across locators, AD/PTDA, DFS and SERP' },
    { id: 'S2', title: 'NORMALIZE + DEDUPE', status: 'done', detail: 'phone/domain/name joins; chains and adjacent trades routed to pools' },
    { id: 'S3', title: 'QUALIFY', status: 'done', detail: 'identity resolution, ICP classification, vertical axis' },
    { id: 'S4', title: 'RANK', status: 'done', detail: 'size score, rank score, shortlist' },
    { id: 'S4d', title: 'SEAT', status: 'done', detail: 'segment + tier assigned; cohort E quarantined' },
    { id: 'S4f', title: 'SENDFIX', status: 'done', detail: 'send-blocking defects routed out of seated-v2' },
    {
      id: 'S5',
      title: 'Apollo enrich',
      status: apollo ? 'pending' : 'blocked',
      detail: apollo ? 'key present — not yet run' : 'APOLLO_API_KEY absent',
    },
    {
      id: 'S6',
      title: 'Verify (NeverBounce)',
      status: neverbounce ? 'pending' : 'blocked',
      detail: [
        neverbounce ? 'NEVERBOUNCE_API present' : 'NEVERBOUNCE_API absent',
        verifyResults ? 'results accumulating in data/verify-results.csv' : 'nothing sends without a NeverBounce valid verdict',
      ].join(' — '),
    },
    {
      id: 'S7',
      title: 'Export / send',
      status: 'pending',
      detail: exportsExists ? 'emails/exports/ present' : 'emails/exports/ does not exist yet',
    },
  ]
}

function blockers(smartlead) {
  const out = []

  const suppression = safeReaddir(DATA_DIR).filter((n) => SUPPRESSION_FILE.test(n))
  out.push(
    suppression.length
      ? { id: 'suppression', label: 'Suppression / DNC list', status: 'ok', detail: suppression.join(', ') }
      : {
          id: 'suppression',
          label: 'Suppression / DNC list',
          status: 'serious',
          detail: 'no suppression or DNC file in emails/data/ — the join is wired and tested, there is no data to join',
        },
  )

  out.push(
    process.env.APOLLO_API_KEY
      ? { id: 'apollo', label: 'APOLLO_API_KEY', status: 'ok', detail: 'present' }
      : { id: 'apollo', label: 'APOLLO_API_KEY', status: 'warning', detail: 'absent — S5 enrichment cannot run' },
  )

  out.push(warmupBlocker(smartlead))

  out.push({
    id: 'gate-t1',
    label: 'GATE:HUMAN — T1 evidence_depth relaxation',
    status: 'warning',
    detail: 'T1 hot tier is 44 against Track 1’s 50; relaxing evidence_depth from ≥3 to ≥2 yields 400 candidates. Unsigned.',
  })
  out.push({
    id: 'gate-dental',
    label: 'GATE:HUMAN — dental §8 copy',
    status: 'warning',
    detail: 'campaign 3750571 stays DRAFTED until the copy gate is signed',
  })

  return out
}

/** Warmup is a Smartlead fact. Report it only when the tab has actually loaded. */
function warmupBlocker(smartlead) {
  if (!smartlead || smartlead.ok !== true) {
    return { id: 'warmup', label: 'Mailbox warmup', status: 'warning', detail: 'unknown — open Smartlead tab' }
  }
  const accounts = smartlead.accounts || []
  const cold = accounts.filter((a) => String(a.warmup_status ?? '').toUpperCase() !== 'ACTIVE')
  if (!accounts.length) return { id: 'warmup', label: 'Mailbox warmup', status: 'serious', detail: 'no sending accounts' }
  return cold.length
    ? {
        id: 'warmup',
        label: 'Mailbox warmup',
        status: 'serious',
        detail: `${cold.length} of ${accounts.length} mailboxes are not warming`,
      }
    : { id: 'warmup', label: 'Mailbox warmup', status: 'ok', detail: `${accounts.length} mailboxes warming` }
}

function overview() {
  const sendfix = newestSendfix()
  const lists = lineage()
  const pools = poolRows()
  const byName = Object.fromEntries(lists.map((l) => [l.name, l.rows]))
  const routedFromCohort = byName['first-send-200-routed']
  const cohort = byName['first-send-200']
  // Whatever the newest seated generation happens to be, not a hardcoded name.
  const live = lists.find((l) => l.current) || null

  return {
    generated_at: new Date().toISOString(),
    current_list: live ? { name: live.name, file: live.file, rows: live.rows, stage: live.stage } : null,
    lists,
    pipeline: pipeline(),
    blockers: blockers(smartleadCache?.payload ?? null),
    conservation: conservation(sendfix),
    sendfix: sendfix
      ? {
          file: sendfix.file,
          stage: sendfix.json.stage ?? null,
          captured: sendfix.json.captured ?? null,
          input: sendfix.json.input ?? null,
          output: sendfix.json.output ?? null,
          routed: Array.isArray(sendfix.json.routed) ? sendfix.json.routed.length : null,
        }
      : null,
    totals: {
      seated: live ? live.rows : null,
      // The LIVE row count of the cohort file, NOT `200 − routed`. S4f removed
      // five records and backfilled five from rank #201–#205, so the file is
      // already net of the routing (`_sendfix` reports cohort_in 200 →
      // cohort_out 200, cohort_dropped 0, and none of the five routed domains
      // is still in the file). Subtracting would count the removal twice and
      // under-report what is actually sendable by five.
      first_send_effective: cohort ?? null,
      first_send_cohort: cohort ?? null,
      first_send_routed: routedFromCohort ?? null,
      first_send_backfilled: cohort !== null && routedFromCohort !== null && routedFromCohort > 0,
      side_pooled: pools.reduce((sum, p) => sum + (p.rows ?? 0), 0),
      sourced: 32004,
    },
  }
}

// ── pools ────────────────────────────────────────────────────────────────────

function poolRows() {
  return latestPools(safeReaddir(POOLS_DIR)).map((pool) => {
    const abs = withinDir(POOLS_DIR, pool.file)
    const counted = abs ? readCount(abs) : null
    return { ...pool, name: `pool:${pool.disposition}`, rows: counted ? counted.total : null }
  })
}

// ── smartlead ────────────────────────────────────────────────────────────────

let smartleadCache = null

/** Strip anything URL-shaped out of an error before it reaches the browser. */
function safeMessage(err) {
  return String(err?.message ?? err)
    .replace(/https?:\/\/\S+/gi, '<url>')
    .slice(0, 300)
}

async function smartleadPayload() {
  const nowIso = new Date().toISOString()
  const rawCampaigns = await listCampaigns()
  const campaignList = (Array.isArray(rawCampaigns) ? rawCampaigns : []).slice(0, MAX_CAMPAIGNS)

  const campaigns = []
  for (const campaign of campaignList) {
    let analytics = null
    try {
      analytics = await getCampaignAnalytics(campaign.id)
    } catch {
      analytics = null // one campaign without stats must not empty the whole tab
    }
    campaigns.push(sanitizeCampaign(campaign, analytics))
  }

  const rawAccounts = await listEmailAccounts()
  const accounts = (Array.isArray(rawAccounts) ? rawAccounts : []).map((raw) => {
    const account = sanitizeAccount(raw)
    return { ...account, warnings: accountWarnings(account, nowIso) }
  })

  const grouped = new Map()
  for (const account of accounts) {
    for (const warning of account.warnings) {
      const key = `${warning.status}|${warning.label}`
      grouped.set(key, { ...warning, count: (grouped.get(key)?.count ?? 0) + 1 })
    }
  }

  return {
    ok: true,
    fetched_at: nowIso,
    campaigns,
    accounts,
    warnings: [...grouped.values()].sort((a, b) => b.count - a.count),
  }
}

async function smartlead(refresh) {
  const fresh = smartleadCache && Date.now() - smartleadCache.fetched_at < SMARTLEAD_TTL_MS
  if (fresh && !refresh) return smartleadCache.payload
  try {
    const payload = await smartleadPayload()
    smartleadCache = { fetched_at: Date.now(), payload }
    return payload
  } catch (err) {
    const payload = {
      ok: false,
      reason: process.env.SMARTLEAD_API_KEY ? 'error' : 'missing-key',
      detail: safeMessage(err),
      fetched_at: new Date().toISOString(),
      campaigns: [],
      accounts: [],
      warnings: [],
    }
    smartleadCache = { fetched_at: Date.now(), payload }
    return payload
  }
}

// ── reports ──────────────────────────────────────────────────────────────────

function reportList() {
  return safeReaddir(DATA_DIR)
    .filter((name) => REPORT_NAME.test(name))
    .map((name) => {
      const stat = statSync(join(DATA_DIR, name))
      return { name, mtime: stat.mtime.toISOString(), size: stat.size }
    })
    .sort((a, b) => b.mtime.localeCompare(a.mtime))
}

// ── routing ──────────────────────────────────────────────────────────────────

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  })
  res.end(JSON.stringify(payload))
}

function sendHtml(res, status, html) {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy':
      "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:",
  })
  res.end(html)
}

function segment(pathname, prefix) {
  const raw = pathname.slice(prefix.length)
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

async function handle(req, res) {
  // GET only. A dashboard that cannot be POSTed to cannot be made to act.
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'read-only: GET only' })

  const url = new URL(req.url, 'http://127.0.0.1')
  const path = url.pathname

  if (path === '/' || path === '/index.html') {
    if (!existsSync(HTML_FILE)) return sendHtml(res, 500, '<h1>dashboard.html is missing</h1>')
    return sendHtml(res, 200, readFileSync(HTML_FILE, 'utf8'))
  }

  if (path === '/api/overview') return sendJson(res, 200, overview())

  if (path === '/api/pools') return sendJson(res, 200, { pools: poolRows() })

  if (path === '/api/segments') {
    // Aggregates describe the CURRENT seated list, whichever generation that is.
    const entry = currentList(registry())
    const abs = entry?.file ? withinDir(LISTS_DIR, entry.file) : null
    const table = abs ? readTable(abs) : null
    const empty = { list: entry?.name ?? null, by_segment: [], by_tier: [], by_cohort: [], by_state: [] }
    if (!table) return sendJson(res, 200, empty)
    return sendJson(res, 200, {
      list: entry.name,
      by_segment: aggregateBy(table.rows, 'segment'),
      by_tier: aggregateBy(table.rows, 'tier'),
      by_cohort: aggregateBy(table.rows, 'cohort'),
      by_state: aggregateBy(table.rows, 'state'),
    })
  }

  if (path.startsWith('/api/list/')) {
    const name = segment(path, '/api/list/')
    const entry = resolveList(name)
    if (!entry) return sendJson(res, 404, { error: 'unknown list' })
    if (!entry.file) return sendJson(res, 404, { error: 'list file not on disk', name })
    const abs = withinDir(entry.dir, entry.file)
    if (!abs) return sendJson(res, 404, { error: 'unknown list' })

    const table = readTable(abs)
    if (!table) return sendJson(res, 404, { error: 'list file not on disk', name })

    const q = url.searchParams
    const matched = filterRows(table.rows, {
      q: q.get('q') ?? '',
      segment: q.get('segment') ?? '',
      tier: q.get('tier') ?? '',
      cohort: q.get('cohort') ?? '',
      state: q.get('state') ?? '',
    })
    const page = paginate(matched, q.get('offset'), q.get('limit'))
    return sendJson(res, 200, {
      name,
      file: entry.file,
      stage: entry.stage,
      role: entry.role,
      total: table.rows.length,
      filtered: matched.length,
      offset: page.offset,
      limit: page.limit,
      fields: table.fields,
      rows: page.rows,
    })
  }

  if (path === '/api/smartlead') {
    return sendJson(res, 200, await smartlead(url.searchParams.get('refresh') === '1'))
  }

  if (path === '/api/reports') return sendJson(res, 200, { reports: reportList() })

  if (path.startsWith('/api/report/')) {
    const name = segment(path, '/api/report/')
    // Shape first, then membership in a real listing. The name is never joined
    // to a path until it has been found in `readdirSync` output.
    if (!REPORT_NAME.test(name)) return sendJson(res, 404, { error: 'unknown report' })
    const known = safeReaddir(DATA_DIR).find((n) => n === name)
    if (!known) return sendJson(res, 404, { error: 'unknown report' })
    const abs = withinDir(DATA_DIR, known)
    if (!abs) return sendJson(res, 404, { error: 'unknown report' })
    return sendJson(res, 200, { name: known, html: marked.parse(readFileSync(abs, 'utf8')) })
  }

  return sendJson(res, 404, { error: 'not found' })
}

// ── boot ─────────────────────────────────────────────────────────────────────

const { port } = parseArgs(process.argv.slice(2), process.env)

const server = createServer((req, res) => {
  handle(req, res).catch((err) => {
    if (!res.headersSent) sendJson(res, 500, { error: safeMessage(err) })
    else res.end()
  })
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Start it somewhere else:\n  node emails/scripts/dashboard.mjs --port ${port + 11}`)
    process.exit(1)
  }
  console.error('ERROR:', safeMessage(err))
  process.exit(1)
})

// Loopback explicitly. Not 0.0.0.0, not ::. "Accessible only locally" is the
// requirement, and the binding is what enforces it — there is no auth layer.
server.listen(port, '127.0.0.1', () => {
  console.log(`emails dashboard → http://127.0.0.1:${port}  (read-only; Ctrl-C to stop)`)
})
