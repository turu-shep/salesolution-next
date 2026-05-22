import 'server-only'

/**
 * Sliding-window rate limiter for /api/lead.
 *
 * Two backends:
 *   1. Upstash Redis (production) — picked when UPSTASH_REDIS_REST_URL and
 *      UPSTASH_REDIS_REST_TOKEN are both set. Survives Vercel cold starts
 *      and works correctly across concurrent serverless instances.
 *   2. In-memory Map (dev / un-configured) — keyed on IP, resets per
 *      instance. Fine locally; warn if production traffic ever hits this.
 *
 * Returns `{ success, remaining, reset }`. Callers should 429 when `success`
 * is false.
 */

const WINDOW_MS = 10 * 60 * 1000
const MAX = 5

type RateLimitResult = {
  success: boolean
  remaining: number
  /** Epoch ms when the window resets (= when the oldest hit expires). */
  reset: number
}

// ── Upstash backend (lazy-init once) ──────────────────────────────────────

let upstashLimiter: {
  limit: (id: string) => Promise<RateLimitResult>
} | null = null
let upstashInitTried = false

async function getUpstashLimiter() {
  if (upstashInitTried) return upstashLimiter
  upstashInitTried = true

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  // Dynamic import keeps Upstash out of the bundle when unused.
  const [{ Ratelimit }, { Redis }] = await Promise.all([
    import('@upstash/ratelimit'),
    import('@upstash/redis'),
  ])

  const redis = new Redis({ url, token })
  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX, `${WINDOW_MS / 1000} s`),
    prefix: 'rl:lead',
    analytics: false,
  })

  upstashLimiter = {
    async limit(id: string): Promise<RateLimitResult> {
      const r = await rl.limit(id)
      return {
        success: r.success,
        remaining: r.remaining,
        reset: r.reset,
      }
    },
  }
  return upstashLimiter
}

// ── In-memory fallback ────────────────────────────────────────────────────

const hits = new Map<string, number[]>()

function memoryLimit(ip: string): RateLimitResult {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX) {
    hits.set(ip, recent)
    const oldest = Math.min(...recent)
    return { success: false, remaining: 0, reset: oldest + WINDOW_MS }
  }
  recent.push(now)
  hits.set(ip, recent)
  return { success: true, remaining: MAX - recent.length, reset: now + WINDOW_MS }
}

// ── Public API ────────────────────────────────────────────────────────────

export async function rateLimit(ip: string): Promise<RateLimitResult> {
  const upstash = await getUpstashLimiter()
  if (upstash) return upstash.limit(ip)
  return memoryLimit(ip)
}

export const RATE_LIMIT_CONFIG = { WINDOW_MS, MAX } as const
