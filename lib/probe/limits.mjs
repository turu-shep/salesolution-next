/**
 * Fixed-window rate limiting for the probe's paid surfaces (AI read costs
 * Claude tokens; every fresh domain costs DataForSEO credits). Pure window
 * math + an in-memory counter here; the route layer picks the store
 * (Upstash REST when configured, per-instance memory otherwise).
 *
 * In-memory is per-serverless-instance — a determined abuser can spread load
 * across instances, but combined with the gate cookie it stops the casual
 * script. Add UPSTASH_REDIS_REST_URL/TOKEN for cross-instance enforcement.
 */

/**
 * Per-kind caps. `hour`/`day` are per-IP; `globalDay` is one shared UTC-day
 * ledger across ALL IPs — the spend kill switches. `dfs` is a global-only
 * ledger consumed on every real (cache-missing) DataForSEO lookup, whatever
 * surface triggered it.
 */
export const CAPS = {
  // hour matches UNLOCKED_RUNS so a legit unlocked visitor can use all six
  // runs in one sitting; the cookie + day cap still bound the total.
  ai: { hour: 6, day: 10, globalDay: 200 },
  unlock: { hour: 5, day: 20, globalDay: 100 },
  // OG unfurl renders re-score the page — generous caps that no real unfurl
  // bot hits, but a token-mill does.
  og: { hour: 20, day: 60, globalDay: null },
  // The deterministic band/report scan (cheap in itself; DataForSEO spend is
  // ledgered separately under `dfs`).
  probe: { hour: 30, day: 100, globalDay: null },
  dfs: { hour: null, day: null, globalDay: 500 },
}

/**
 * The counter keys + TTLs one consumption touches.
 * @param {keyof typeof CAPS} kind
 * @param {string} ip
 * @param {number} nowMs
 */
export function windowKeys(kind, ip, nowMs) {
  const caps = CAPS[kind]
  const hourBucket = Math.floor(nowMs / 3_600_000)
  const dayBucket = Math.floor(nowMs / 86_400_000)
  const keys = []
  if (caps.hour != null) {
    keys.push({ key: `probe:${kind}:${ip}:h${hourBucket}`, ttlS: 3_700, cap: caps.hour, scope: 'hour' })
  }
  if (caps.day != null) {
    keys.push({ key: `probe:${kind}:${ip}:d${dayBucket}`, ttlS: 87_000, cap: caps.day, scope: 'day' })
  }
  if (caps.globalDay != null) {
    keys.push({ key: `probe:${kind}:GLOBAL:d${dayBucket}`, ttlS: 87_000, cap: caps.globalDay, scope: 'global' })
  }
  return keys
}

/**
 * Consume one unit across every window; deny if ANY window is over its cap.
 * `incr(key, ttlS)` must return the post-increment count for that key.
 * Denials still increment (simpler, and biases toward stricter limiting).
 *
 * @param {keyof typeof CAPS} kind
 * @param {string} ip
 * @param {(key: string, ttlS: number) => Promise<number> | number} incr
 * @param {number} [nowMs]
 * @returns {Promise<{ok: true} | {ok: false, scope: 'hour' | 'day' | 'global'}>}
 */
export async function consume(kind, ip, incr, nowMs = Date.now()) {
  for (const w of windowKeys(kind, ip, nowMs)) {
    const count = await incr(w.key, w.ttlS)
    if (count > w.cap) return { ok: false, scope: w.scope }
  }
  return { ok: true }
}

/** Per-instance fallback store. Prunes expired buckets on write. */
export class MemoryCounter {
  constructor() {
    /** @type {Map<string, {count: number, expiresAt: number}>} */
    this.buckets = new Map()
  }

  /** @param {string} key @param {number} ttlS */
  incr(key, ttlS, nowMs = Date.now()) {
    if (this.buckets.size > 10_000) {
      for (const [k, v] of this.buckets) {
        if (v.expiresAt <= nowMs) this.buckets.delete(k)
      }
    }
    const existing = this.buckets.get(key)
    if (!existing || existing.expiresAt <= nowMs) {
      this.buckets.set(key, { count: 1, expiresAt: nowMs + ttlS * 1000 })
      return 1
    }
    existing.count += 1
    return existing.count
  }
}
