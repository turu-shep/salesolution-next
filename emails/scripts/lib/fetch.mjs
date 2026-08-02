/**
 * fetch — polite HTTP for the prospect-list pipeline.
 *
 * Implements the pacing and compliance posture in `00-sourcing-strategy.md` §7
 * and `01-build-plan.md` §2, which are policy, not preference:
 *
 *   - **≤1 request per 3s per host.** A per-host serial queue, so two extractors
 *     hitting the same origin still take turns. Never parallelize against one host.
 *   - **429 is a pace signal — honour it.** Exponential backoff (3s → 6s → 12s …),
 *     `Retry-After` respected when the server sends one. Same for 5xx.
 *   - **Cache every response on disk, keyed by URL.** Re-runs must not re-hit the
 *     origin; raw payloads are kept this time so profiling never costs a fetch.
 *   - **A normal desktop User-Agent.** Honest identification. We do NOT rotate
 *     UAs, spoof TLS fingerprints, or otherwise disguise the client to defeat a
 *     block — §7.1 draws that line at Cloudflare/Akamai 403s, which we never
 *     bypass. Set EMAILS_USER_AGENT to override.
 *   - **`source_url` + `captured` on every response.** A row without provenance
 *     is a bug, not a lead (contract §1).
 */
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
/** emails/data/cache — gitignored by emails/.gitignore (`data/`). */
export const CACHE_DIR = resolve(HERE, '..', '..', 'data', 'cache')

/** Chrome on macOS. Honest desktop UA — see the header note. */
const DEFAULT_UA =
  process.env.EMAILS_USER_AGENT ||
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const MIN_INTERVAL_MS = 3000 // ≤1 request / 3s / host
const MAX_RETRIES = 5
const TIMEOUT_MS = 180_000 // Timken's map 2 is ~4.7MB

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ── per-host serial queue ────────────────────────────────────────────────────
/** @type {Map<string, Promise<unknown>>} */
const hostChain = new Map()
/** @type {Map<string, number>} */
const hostLastAt = new Map()

/**
 * Run `task` after the previous task for `host` finished AND at least
 * MIN_INTERVAL_MS has elapsed since that host's last request.
 */
function queued(host, task) {
  const prev = hostChain.get(host) ?? Promise.resolve()
  const next = prev.then(async () => {
    const last = hostLastAt.get(host) ?? 0
    const wait = MIN_INTERVAL_MS - (Date.now() - last)
    if (wait > 0) await sleep(wait)
    try {
      return await task()
    } finally {
      hostLastAt.set(host, Date.now())
    }
  })
  // Keep the chain alive even if this task rejects.
  hostChain.set(
    host,
    next.catch(() => {}),
  )
  return next
}

// ── disk cache ───────────────────────────────────────────────────────────────

function cacheKey(url, method, body) {
  return createHash('sha256').update(`${method} ${url}\n${body ?? ''}`).digest('hex').slice(0, 32)
}

function cachePath(key) {
  return join(CACHE_DIR, `${key}.json`)
}

function readCache(key) {
  const p = cachePath(key)
  if (!existsSync(p)) return null
  try {
    return JSON.parse(readFileSync(p, 'utf8'))
  } catch {
    return null // a truncated cache file is a miss, not a crash
  }
}

function writeCache(key, entry) {
  mkdirSync(CACHE_DIR, { recursive: true })
  writeFileSync(cachePath(key), JSON.stringify(entry))
}

// ── the fetcher ──────────────────────────────────────────────────────────────

/**
 * @typedef {object} PoliteResponse
 * @property {string}  source_url  the exact URL fetched — goes straight onto the record
 * @property {string}  captured    ISO date (YYYY-MM-DD) — goes straight onto the record
 * @property {string}  captured_at full ISO timestamp, for the audit log
 * @property {number}  status
 * @property {string}  body
 * @property {Record<string,string>} headers
 * @property {boolean} fromCache
 */

/**
 * GET (or POST) a URL politely, with an on-disk cache.
 *
 * @param {string} url
 * @param {object} [opts]
 * @param {string} [opts.method='GET']
 * @param {string} [opts.body]
 * @param {Record<string,string>} [opts.headers]
 * @param {boolean} [opts.refresh=false]  bypass the cache and re-fetch
 * @param {boolean} [opts.cache=true]
 * @param {string}  [opts.label]          shown in progress logs
 * @returns {Promise<PoliteResponse>}
 */
export async function politeFetch(url, opts = {}) {
  const { method = 'GET', body, headers = {}, refresh = false, cache = true, label } = opts
  const key = cacheKey(url, method, body)

  if (cache && !refresh) {
    const hit = readCache(key)
    if (hit) {
      log(`cache hit  ${label ?? url}`)
      return { ...hit, fromCache: true }
    }
  }

  const host = new URL(url).host

  return queued(host, async () => {
    let attempt = 0
    let backoff = MIN_INTERVAL_MS

    for (;;) {
      attempt++
      log(`GET ${label ?? url}${attempt > 1 ? `  (attempt ${attempt})` : ''}`)

      let res
      try {
        res = await fetch(url, {
          method,
          body,
          headers: {
            'User-Agent': DEFAULT_UA,
            Accept: 'application/json, text/html;q=0.9, */*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            ...headers,
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(TIMEOUT_MS),
        })
      } catch (err) {
        if (attempt > MAX_RETRIES) throw new Error(`${url}: ${err.message} (after ${MAX_RETRIES} retries)`)
        log(`  network error: ${err.message} — retrying in ${backoff / 1000}s`)
        await sleep(backoff)
        backoff *= 2
        continue
      }

      // 429 is a pace signal. Honour it; slowing down IS the fix (§7.1).
      if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
        if (attempt > MAX_RETRIES) throw new Error(`${url}: HTTP ${res.status} after ${MAX_RETRIES} retries`)
        const retryAfter = Number(res.headers.get('retry-after'))
        const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : backoff
        log(`  HTTP ${res.status} — backing off ${Math.round(waitMs / 1000)}s`)
        await sleep(waitMs)
        backoff *= 2
        continue
      }

      // 403/401 are access controls, not pace signals. No bypass, ever (§7.1).
      // Recorded and surfaced, never retried with a different disguise.
      const text = await res.text()
      const now = new Date()
      const entry = {
        source_url: url,
        captured: now.toISOString().slice(0, 10),
        captured_at: now.toISOString(),
        status: res.status,
        headers: Object.fromEntries(res.headers.entries()),
        body: text,
      }

      if (!res.ok) throw new Error(`${url}: HTTP ${res.status} (${text.slice(0, 200)})`)

      if (cache) writeCache(key, entry)
      return { ...entry, fromCache: false }
    }
  })
}

/**
 * politeFetch + JSON.parse. Keeps the provenance envelope alongside the data.
 *
 * @param {string} url
 * @param {object} [opts] same as politeFetch
 * @returns {Promise<{ data: any, source_url: string, captured: string, captured_at: string, fromCache: boolean, bytes: number }>}
 */
export async function fetchJson(url, opts = {}) {
  const res = await politeFetch(url, opts)
  let data
  try {
    data = JSON.parse(res.body)
  } catch (err) {
    throw new Error(`${url}: response is not JSON (${err.message}); first 200 chars: ${res.body.slice(0, 200)}`)
  }
  return {
    data,
    source_url: res.source_url,
    captured: res.captured,
    captured_at: res.captured_at,
    fromCache: res.fromCache,
    bytes: Buffer.byteLength(res.body),
  }
}

function log(msg) {
  if (process.env.EMAILS_QUIET) return
  process.stderr.write(`[fetch] ${msg}\n`)
}
