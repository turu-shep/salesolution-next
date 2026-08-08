/**
 * sync-supabase — push the current generation into the deployed dashboard's database.
 *
 *   node emails/scripts/sync-supabase.mjs
 *
 * Manual and on-demand. No cron, no webhook. Pair it with the Friday metrics
 * ritual in docs/strategy/industrial-email-campaign/06-process-runbook.md
 * ("The weekly loop — every Friday"): it refreshes the deployed view AND keeps
 * the free-tier Supabase project from pausing after ~a week of inactivity.
 *
 * FULL REPLACE, never merge. Rows are batched into staging tables and moved
 * across by sync_promote() in one transaction; the visible table is never
 * half-written. The conservation check compares file rows to database rows on
 * every line and exits non-zero on any mismatch.
 *
 * Reads only. Writes nothing to disk. The service-role key is read from
 * .env.local and never logged.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { fromCsv } from './lib/contract.mjs'
// The pure resolver. POOL_FILE is NOT exported from this module — never import it.
import { currentList, latestPools, resolveRegistry } from './lib/dashboard-data.mjs'
import {
  PAUSED_MESSAGE,
  POOL_DISPOSITIONS,
  conservationLines,
  isPausedError,
  parseRegistryTable,
  parseSourceDirs,
  parseStatusBanner,
  toContactRow,
  toVerifyRow,
} from './lib/sync-supabase-data.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..', '..')
const EMAILS_DIR = join(REPO_ROOT, 'emails')
const LISTS_DIR = join(EMAILS_DIR, 'lists')
const POOLS_DIR = join(EMAILS_DIR, 'data', 'side-pools')
const VERIFY_FILE = join(EMAILS_DIR, 'data', 'verify-results.csv')
const PACK_DIR = join(EMAILS_DIR, 'handoff', 'industrial-contact-list')

/** Batch size for a PostgREST insert. 500 keeps each request well under the body limit. */
const BATCH = 500

function loadEnv() {
  const file = resolve(REPO_ROOT, '.env.local')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
}
loadEnv()

const URL_BASE = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL_BASE) fail('Missing SUPABASE_URL — add it to .env.local at the repo root (Supabase → Settings → API → Project URL).')
if (!KEY) fail('Missing SUPABASE_SERVICE_ROLE_KEY — add it to .env.local at the repo root (Supabase → Settings → API → service_role secret).')

function fail(message) {
  console.error(message)
  process.exit(1)
}

const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

async function call(path, init) {
  let res
  try {
    res = await fetch(`${URL_BASE}${path}`, { ...init, headers: { ...HEADERS, ...(init?.headers || {}) } })
  } catch (err) {
    // A paused free-tier project looks exactly like a network bug, and an
    // operator who sees a network error goes looking for one that isn't there.
    if (isPausedError(err)) fail(PAUSED_MESSAGE)
    throw err
  }
  if (!res.ok) fail(`Supabase ${init?.method ?? 'GET'} ${path.split('?')[0]} → HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
  return res
}

async function rpc(fn, body) {
  const res = await call(`/rest/v1/rpc/${fn}`, { method: 'POST', body: JSON.stringify(body ?? {}) })
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

async function insertBatches(table, rows) {
  for (let i = 0; i < rows.length; i += BATCH) {
    await call(`/rest/v1/${table}`, {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(rows.slice(i, i + BATCH)),
    })
  }
}

/** Exact row count without a payload: PostgREST puts it in content-range. */
async function dbCount(table, query = '') {
  const res = await call(`/rest/v1/${table}?select=id&limit=1${query}`, { headers: { Prefer: 'count=exact' } })
  const range = res.headers.get('content-range') ?? ''
  const total = Number(range.split('/')[1])
  return Number.isFinite(total) ? total : -1
}

function readCsv(path) {
  return fromCsv(readFileSync(path, 'utf8'))
}

// ── 1. resolve the current generation ────────────────────────────────────────
const seated = currentList(resolveRegistry(readdirSync(LISTS_DIR)))
if (!seated) fail(`No current seated list in ${LISTS_DIR} — resolveRegistry found no live main list.`)

const pools = latestPools(readdirSync(POOLS_DIR))
if (pools.length !== POOL_DISPOSITIONS.length) {
  const found = pools.map((p) => p.disposition).sort()
  const missing = POOL_DISPOSITIONS.filter((d) => !found.includes(d))
  const extra = found.filter((d) => !POOL_DISPOSITIONS.includes(d))
  fail(
    `Expected ${POOL_DISPOSITIONS.length} side pools, found ${pools.length}.\n` +
      `  missing: ${missing.join(', ') || 'none'}\n  unexpected: ${extra.join(', ') || 'none'}\n` +
      'A missing pool is a data question, not something to sync around. Stopping.',
  )
}

const generation = seated.name
console.log(`generation: ${generation}  (+ ${pools.length} side pools)\n`)

// ── 2. build the rows ────────────────────────────────────────────────────────
const files = [
  { label: seated.name, pool: 'seated', path: join(LISTS_DIR, seated.file) },
  ...pools.map((p) => ({ label: p.file.replace(/\.csv$/, ''), pool: p.disposition, path: join(POOLS_DIR, p.file) })),
]

const counts = []
const contactRows = []
for (const f of files) {
  const raws = readCsv(f.path)
  raws.forEach((raw, index) => contactRows.push(toContactRow(raw, { generation, pool: f.pool, index })))
  counts.push({ label: f.label, file: raws.length, db: 0 })
}

const verifyRaws = existsSync(VERIFY_FILE) ? readCsv(VERIFY_FILE) : []
const verifyRows = verifyRaws.map(toVerifyRow).filter((r) => r.email !== '')
const uniqueEmails = new Set(verifyRows.map((r) => r.email)).size
const duplicateEmails = verifyRows.length - uniqueEmails

// ── 3. stage, promote, verify ────────────────────────────────────────────────
await rpc('sync_reset')
await insertBatches('contacts_staging', contactRows)
await insertBatches('verify_results_staging', verifyRows)
const [promoted] = await rpc('sync_promote', { p_generation: generation })

for (const c of counts) {
  const pool = files.find((f) => f.label === c.label).pool
  c.db = await dbCount('contacts', `&pool=eq.${encodeURIComponent(pool)}`)
}
counts.push({ label: 'TOTAL', file: contactRows.length, db: Number(promoted.contacts_rows) })
counts.push({ label: 'verify-results', file: verifyRows.length, db: Number(promoted.verify_rows) })

const report = conservationLines(counts)
console.log(report.lines.join('\n'))
console.log(`\n${duplicateEmails} duplicate email${duplicateEmails === 1 ? '' : 's'} retained in verify_results (no unique constraint, on purpose)`)

// ── 4. source registry ───────────────────────────────────────────────────────
const dirs = parseSourceDirs(
  readdirSync(PACK_DIR).filter((name) => {
    try { return statSync(join(PACK_DIR, name)).isDirectory() } catch { return false }
  }),
)
const registry = parseRegistryTable(readFileSync(join(PACK_DIR, '00-README.md'), 'utf8'))

const registryRows = dirs.map((dir) => {
  const row = registry.get(dir.token) ?? {}
  const readme = join(PACK_DIR, dir.folder, '00-README.md')
  const banner = existsSync(readme) ? parseStatusBanner(readFileSync(readme, 'utf8')) : null
  if (banner === null) console.log(`  ${dir.token}: status unparsed (no readable STATUS banner in ${dir.folder}/00-README.md)`)
  if (row.status_row && row.status_row !== dir.status) {
    console.log(`  WARNING ${dir.token}: folder says ${dir.status}, registry row says ${row.status_row} — the completion ritual was half-done`)
  }
  return {
    token: dir.token,
    status: banner === null ? 'unparsed' : dir.status,
    status_row: row.status_row ?? null,
    folder: dir.folder,
    raw_rows: row.raw_rows ?? null,
    seated: row.seated ?? null,
    last_pull: row.last_pull ?? null,
    est_left: row.est_left ?? null,
    synced_at: new Date().toISOString(),
  }
})

await call('/rest/v1/sources_registry?on_conflict=token', {
  method: 'POST',
  headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
  body: JSON.stringify(registryRows),
})
console.log(`\nsources_registry: ${registryRows.length} folders upserted`)

// ── 5. verdict ───────────────────────────────────────────────────────────────
if (!report.ok) {
  console.error('\nCONSERVATION FAILED — the lines marked MISMATCH above did not reconcile. The database is not trustworthy for those pools.')
  process.exit(1)
}
console.log('\nconservation PASS')
