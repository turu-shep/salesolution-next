/**
 * neverbounce — minimal client for the NeverBounce v4 API (stage S6).
 *
 * Replaces the planned Truelist integration (Artur, 2026-08-02: "instead of
 * Truelist we will do neverbounce"). Key lives in .env.local as
 * NEVERBOUNCE_API. Like Smartlead, auth rides the QUERY STRING, so every
 * request URL is a secret: redact() runs over anything thrown or logged, and
 * this client must never be routed through emails/scripts/lib/fetch.mjs
 * (politeFetch) — its disk cache would write the key to disk.
 *
 * Result classes (v4): valid · invalid · disposable · catchall · unknown.
 * Sending policy against the 2% bounce kill line: only `valid` sends.
 * catchall/unknown are not "probably fine" — they are unverifiable, and the
 * numeric aliases (0..4) some endpoints return are normalized here so no
 * caller ever branches on a bare integer.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

function loadEnv() {
  const file = resolve(REPO_ROOT, '.env.local')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
}
loadEnv()

const BASE = 'https://api.neverbounce.com/v4'
export const redact = (s) => String(s).replace(/([?&]key=)[^&\s"']*/gi, '$1REDACTED')

function apiKey() {
  const key = process.env.NEVERBOUNCE_API
  if (!key) throw new Error('Missing NEVERBOUNCE_API — add it to .env.local')
  return key
}

const RESULT_BY_CODE = { 0: 'valid', 1: 'invalid', 2: 'disposable', 3: 'catchall', 4: 'unknown' }

/** Normalize a v4 result (string or numeric alias) to the textual class. */
export function normalizeResult(r) {
  if (r === null || r === undefined || r === '') return 'unknown'
  if (typeof r === 'number' || /^[0-4]$/.test(String(r))) return RESULT_BY_CODE[Number(r)] ?? 'unknown'
  const s = String(r).toLowerCase()
  return ['valid', 'invalid', 'disposable', 'catchall', 'unknown'].includes(s) ? s : 'unknown'
}

async function request(method, path, { query = {}, body } = {}) {
  const url = new URL(BASE + path)
  url.searchParams.set('key', apiKey())
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
  const safe = `${method} ${redact(url)}`

  let res
  try {
    res = await fetch(url, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify({ key: apiKey(), ...body }),
      signal: AbortSignal.timeout(120_000),
    })
  } catch (err) {
    throw new Error(`NeverBounce ${safe}: ${redact(err.message)}`)
  }
  const text = await res.text()
  if (!res.ok) throw new Error(`NeverBounce ${safe} → HTTP ${res.status}: ${redact(text).slice(0, 300)}`)
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`NeverBounce ${safe} → 200 but not JSON: ${redact(text).slice(0, 200)}`)
  }
  if (json.status && json.status !== 'success')
    throw new Error(`NeverBounce ${safe} → ${json.status}: ${redact(json.message || '').slice(0, 300)}`)
  return json
}

export const accountInfo = () => request('GET', '/account/info')

/** Create a supplied-data bulk job, auto-parsed and auto-started. */
export function createJob(emails, filename) {
  return request('POST', '/jobs/create', {
    body: {
      input_location: 'supplied',
      input: emails.map((email) => ({ email })),
      auto_parse: 1,
      auto_start: 1,
      run_sample: 0,
      filename,
    },
  })
}

export const jobStatus = (jobId) => request('GET', '/jobs/status', { query: { job_id: jobId } })

/** All results for a job, paginated; [{ email, result, flags, suggested }]. */
export async function jobResults(jobId) {
  const out = []
  for (let page = 1; page < 100; page++) {
    const body = await request('GET', '/jobs/results', { query: { job_id: jobId, page, items_per_page: 1000 } })
    const rows = body.results || []
    for (const r of rows) {
      out.push({
        email: r.data?.email ?? '',
        result: normalizeResult(r.verification?.result),
        flags: (r.verification?.flags || []).join('|'),
        suggested: r.verification?.suggested_correction || '',
      })
    }
    if (page >= (body.total_pages || 1)) break
  }
  return out
}

/** Poll a job until complete/failed; returns the final status payload. */
export async function waitForJob(jobId, { intervalMs = 10_000, timeoutMs = 15 * 60_000 } = {}) {
  const started = Date.now()
  for (;;) {
    const st = await jobStatus(jobId)
    const s = String(st.job_status || '').toLowerCase()
    if (s === 'complete') return st
    if (['failed', 'user_cancelled', 'deleted'].includes(s))
      throw new Error(`NeverBounce job ${jobId} ended ${s}`)
    if (Date.now() - started > timeoutMs) throw new Error(`NeverBounce job ${jobId} timed out after ${timeoutMs}ms (status ${s})`)
    await new Promise((r) => setTimeout(r, intervalMs))
  }
}
