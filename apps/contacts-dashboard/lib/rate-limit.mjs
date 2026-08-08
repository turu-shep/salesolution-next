/**
 * A sliding-window limiter for the login route.
 *
 * The constant-time password compare stops a timing leak and does nothing about
 * volume; unthrottled guessing is the whole gate otherwise (finding F-002).
 * The login route keys each window on `${ip}:${email}` — per-person accounts
 * mean one caller hammering one mailbox burns only that pair's budget, not the
 * whole instance. In-memory and per-instance is still the right size: a
 * handful of named viewers, and adding Redis for that would be a dependency to
 * keep a short account list honest.
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
