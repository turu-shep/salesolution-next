/**
 * A sliding-window limiter for the login route.
 *
 * The constant-time password compare stops a timing leak and does nothing about
 * volume; unthrottled guessing is the whole gate otherwise (finding F-002).
 * In-memory and per-instance, which is the right size here: this app has one
 * user and one password, and adding Redis for it would be a dependency to keep a
 * single operator honest.
 */

/** Password gates: 5 per 15 minutes. Enough tries to survive a few typos. */
export const LOGIN_POLICY = { max: 5, windowMs: 15 * 60 * 1000, prefix: 'rl:login' }

const hits = new Map()

export function rateLimit(ip, policy = LOGIN_POLICY) {
  const now = Date.now()
  const key = `${policy.prefix}:${ip}`
  const recent = (hits.get(key) ?? []).filter((t) => now - t < policy.windowMs)
  if (recent.length >= policy.max) {
    hits.set(key, recent)
    return { success: false, remaining: 0, reset: Math.min(...recent) + policy.windowMs }
  }
  recent.push(now)
  hits.set(key, recent)
  return { success: true, remaining: policy.max - recent.length, reset: now + policy.windowMs }
}
