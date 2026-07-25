import 'server-only'

/**
 * Sliding-window rate limiter for the public POST routes.
 *
 * Two backends:
 *   1. Upstash Redis (production) — picked when UPSTASH_REDIS_REST_URL and
 *      UPSTASH_REDIS_REST_TOKEN are both set. Survives Vercel cold starts
 *      and works correctly across concurrent serverless instances.
 *   2. In-memory Map (dev / un-configured) — keyed on IP, resets per
 *      instance. Fine locally; warn if production traffic ever hits this.
 *
 * Upstash failures degrade to the in-memory backend rather than throwing
 * (F-034): a Redis blip must not 500 every form on the site, and it must not
 * fail open either — the memory window still limits, just per instance.
 *
 * One limiter, several policies. The lead routes and the password gates need
 * different budgets, so callers pass a policy; they must not hand-roll a
 * second limiter.
 *
 * Returns `{ success, remaining, reset }`. Callers should 429 when `success`
 * is false.
 */

const WINDOW_MS = 10 * 60 * 1000
const MAX = 5

export type LimitPolicy = {
  /** Requests allowed per window. */
  max: number
  windowMs: number
  /** Redis key namespace — keeps each policy's budget separate. */
  prefix: string
}

/** Public lead forms: 5 per 10 minutes. */
export const LEAD_POLICY: LimitPolicy = { max: MAX, windowMs: WINDOW_MS, prefix: 'rl:lead' }

/**
 * Password gates: 5 per 15 minutes. Tighter than the lead forms because a
 * password gate has no legitimate high-frequency use, but still enough tries
 * to survive a few typos — locking the owner out is the real failure mode of
 * this fix, not leaving the door open.
 */
export const LOGIN_POLICY: LimitPolicy = { max: 5, windowMs: 15 * 60 * 1000, prefix: 'rl:login' }

type RateLimitResult = {
  success: boolean
  remaining: number
  /** Epoch ms when the window resets (= when the oldest hit expires). */
  reset: number
}

// ── Upstash backend (lazy-init once) ──────────────────────────────────────

type Backend = { limit: (id: string) => Promise<RateLimitResult> }

/** One lazily-built Upstash limiter per policy prefix. */
const upstashByPrefix = new Map<string, Backend | null>()

async function getUpstashLimiter(policy: LimitPolicy): Promise<Backend | null> {
  if (upstashByPrefix.has(policy.prefix)) return upstashByPrefix.get(policy.prefix) ?? null

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    upstashByPrefix.set(policy.prefix, null)
    return null
  }

  try {
    // Dynamic import keeps Upstash out of the bundle when unused.
    const [{ Ratelimit }, { Redis }] = await Promise.all([
      import('@upstash/ratelimit'),
      import('@upstash/redis'),
    ])

    const redis = new Redis({ url, token })
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(policy.max, `${policy.windowMs / 1000} s`),
      prefix: policy.prefix,
      analytics: false,
    })

    const backend: Backend = {
      async limit(id: string): Promise<RateLimitResult> {
        const r = await rl.limit(id)
        return { success: r.success, remaining: r.remaining, reset: r.reset }
      },
    }
    upstashByPrefix.set(policy.prefix, backend)
    return backend
  } catch (err) {
    // Never cache the failure permanently — a transient import or connect error
    // shouldn't pin this instance to memory for its whole life.
    console.warn(`[rate-limit] Upstash init failed for ${policy.prefix}, using memory:`, err)
    return null
  }
}

// ── In-memory fallback ────────────────────────────────────────────────────

const hits = new Map<string, number[]>()

function memoryLimit(ip: string, policy: LimitPolicy): RateLimitResult {
  const now = Date.now()
  const key = `${policy.prefix}:${ip}`
  const recent = (hits.get(key) ?? []).filter((t) => now - t < policy.windowMs)
  if (recent.length >= policy.max) {
    hits.set(key, recent)
    const oldest = Math.min(...recent)
    return { success: false, remaining: 0, reset: oldest + policy.windowMs }
  }
  recent.push(now)
  hits.set(key, recent)
  return { success: true, remaining: policy.max - recent.length, reset: now + policy.windowMs }
}

// ── Public API ────────────────────────────────────────────────────────────

export async function rateLimit(
  ip: string,
  policy: LimitPolicy = LEAD_POLICY,
): Promise<RateLimitResult> {
  const upstash = await getUpstashLimiter(policy)
  if (!upstash) return memoryLimit(ip, policy)
  try {
    return await upstash.limit(ip)
  } catch (err) {
    // A Redis outage must not 500 the form, and must not fail open either.
    console.warn(`[rate-limit] Upstash call failed for ${policy.prefix}, using memory:`, err)
    return memoryLimit(ip, policy)
  }
}

export const RATE_LIMIT_CONFIG = { WINDOW_MS, MAX } as const
