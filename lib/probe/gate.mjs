/**
 * Signed gate state for the probe's AI read, carried in an HTTP-only cookie.
 * Pure codec — no next/headers — so it unit-tests with `node --test` and the
 * routes stay thin.
 *
 * Policy: 1 anonymous run, then an email unlocks 5 more (6 total). The cookie
 * is the UX nudge, not the security boundary — incognito evades it, which is
 * fine because the per-IP limits in limits.mjs are the backstop.
 *
 * Wire format: `v1.<runs>.<unlocked 0|1>.<hmac>` — HMAC-SHA256 over the
 * first three segments, base64url, truncated to 24 chars.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'

export const GATE_COOKIE = 'ss_probe_gate'
export const FREE_RUNS = 1
export const UNLOCKED_RUNS = 6
export const GATE_MAX_AGE_S = 60 * 60 * 24 * 180 // 180 days

/**
 * @typedef {Object} GateState
 * @property {number} runs      // AI runs consumed so far
 * @property {boolean} unlocked // email captured
 */

function sig(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url').slice(0, 24)
}

/** @param {GateState} state */
export function encodeGate(state, secret) {
  const runs = Math.max(0, Math.min(999, Math.floor(state.runs)))
  const payload = `v1.${runs}.${state.unlocked ? 1 : 0}`
  return `${payload}.${sig(payload, secret)}`
}

/**
 * @param {string | null | undefined} value
 * @returns {GateState} — fresh state for missing/tampered cookies
 */
export function decodeGate(value, secret) {
  const fresh = { runs: 0, unlocked: false }
  if (!value) return fresh
  const m = /^v1\.(\d{1,3})\.([01])\.([A-Za-z0-9_-]{24})$/.exec(value)
  if (!m) return fresh
  const payload = `v1.${m[1]}.${m[2]}`
  const expected = sig(payload, secret)
  const a = Buffer.from(m[3])
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return fresh
  return { runs: Number(m[1]), unlocked: m[2] === '1' }
}

/**
 * What this gate state allows next.
 * @param {GateState} state
 * @returns {'run' | 'email_required' | 'exhausted'}
 */
export function gateVerdict(state) {
  if (state.runs < FREE_RUNS) return 'run'
  if (!state.unlocked) return 'email_required'
  return state.runs < UNLOCKED_RUNS ? 'run' : 'exhausted'
}
