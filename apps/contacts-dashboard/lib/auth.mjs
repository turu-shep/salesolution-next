import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

/**
 * Auth primitives for the contacts dashboard (server-only — imports node:crypto).
 *
 * Per-person accounts (specs/02-client-view.md AMENDMENT 2): passwords are
 * scrypt hashes stored on the `accounts` row, and the session cookie is an
 * HMAC-signed token CARRYING THE ACCOUNT ID —
 * `<accountId>.<issuedAtMs>.<hmac>` — signed with
 * CONTACTS_DASHBOARD_SESSION_SECRET. No GoTrue, no session store: the token
 * self-expires, and revocation is enforced by the account-status check that
 * runs on every request (lib/auth-server.ts).
 *
 * Same trust idioms as the house /sales gate (lib/sales/auth.ts):
 * timingSafeEqual over fixed-length keys, F-003 production short-circuit.
 */

export const CONTACTS_COOKIE = 'contacts_auth'
export const MAX_AGE_S = 60 * 60 * 24 * 30 // 30 days

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])

/**
 * True when the request host is a local dev host (the gate is open there).
 *
 * The Host header is client-supplied, so this must never be reachable from a
 * production request — otherwise `Host: anything.local` opens the dashboard
 * with no credentials (finding F-003). On Vercel NODE_ENV is `production`, so
 * the localhost convenience is dev-only and stays that way.
 */
export function isLocalHost(host) {
  if (process.env.NODE_ENV === 'production') return false
  const raw = String(host ?? '').toLowerCase().trim()
  // Strip a port without mangling IPv6: '[::1]:3000' → '::1'; a bare literal
  // with 2+ colons ('::1') is already portless; else 'host:port' → 'host'.
  let h = raw
  if (raw.startsWith('[')) {
    const end = raw.indexOf(']')
    h = end === -1 ? raw : raw.slice(1, end)
  } else if (raw.split(':').length === 2) {
    h = raw.split(':')[0].trim()
  }
  return LOCAL_HOSTS.has(h) || h.endsWith('.local')
}

// ── scrypt password hashing ─────────────────────────────────────────────────

const SCRYPT_N = 16384
const SCRYPT_R = 8
const SCRYPT_P = 1
const SALT_BYTES = 16
const KEY_BYTES = 64

/** Hash a password for storage: `scrypt$16384$8$1$<salt b64>$<hash b64>`. */
export function hashPassword(password) {
  const salt = randomBytes(SALT_BYTES)
  const key = scryptSync(String(password), salt, KEY_BYTES, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P })
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('base64')}$${key.toString('base64')}`
}

/**
 * Verify a password against a stored `scrypt$N$r$p$salt$hash` value.
 *
 * Re-derives with the STORED salt/params and compares the two fixed-length
 * keys with timingSafeEqual. Returns false — never throws — on any malformed
 * stored value: unknown scheme tag, wrong part count, bad base64, params
 * outside sane bounds. The derived-key length is pinned to KEY_BYTES so a
 * truncated/empty stored hash can never become a zero-length "match".
 */
export function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false
  if (!/^\d+$/.test(parts[1]) || !/^\d+$/.test(parts[2]) || !/^\d+$/.test(parts[3])) return false
  const N = Number(parts[1])
  const r = Number(parts[2])
  const p = Number(parts[3])
  // Sane bounds: N a power of two within 2^10..2^17, small r/p. Anything else
  // is not a value this app ever wrote — malformed, not merely expensive.
  if (N < 1024 || N > 131072 || (N & (N - 1)) !== 0) return false
  if (r < 1 || r > 32 || p < 1 || p > 16) return false
  const salt = Buffer.from(parts[4], 'base64')
  const expected = Buffer.from(parts[5], 'base64')
  if (salt.length === 0 || expected.length !== KEY_BYTES) return false
  try {
    const key = scryptSync(String(password ?? ''), salt, KEY_BYTES, { N, r, p })
    return timingSafeEqual(key, expected)
  } catch {
    return false // e.g. params exceed scrypt's memory limit — refuse, don't crash
  }
}

// ── HMAC sessions carrying the account id ───────────────────────────────────

function hmacHex(secret, value) {
  return createHmac('sha256', secret).update(value).digest('hex')
}

/**
 * Mint a signed session token: `<accountId>.<issuedAtMs>.<hmac>`, where the
 * HMAC covers `<accountId>.<issuedAtMs>`. uuids contain no `.`, so `.` is a
 * safe delimiter. Throws on an empty secret or empty accountId — a
 * misconfigured server must fail loudly at mint time, never sign with ''.
 */
export function signSession(accountId, secret) {
  if (!secret) throw new Error('signSession: refusing to sign without a secret')
  if (!accountId || String(accountId).includes('.')) {
    throw new Error('signSession: accountId must be a non-empty, dot-free id')
  }
  const payload = `${accountId}.${Date.now()}`
  return `${payload}.${hmacHex(secret, payload)}`
}

/**
 * Read a session token back: `{ accountId }` when the signature verifies and
 * the token is younger than maxAgeMs; null on tamper, expiry, malformed shape,
 * or an empty/unset secret. Splits into EXACTLY three parts and rejects
 * anything else. Never throws.
 */
export function readSession(token, secret, maxAgeMs) {
  if (!secret || typeof token !== 'string' || token === '') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [accountId, iat, sig] = parts
  if (accountId === '' || iat === '') return null
  if (!/^[0-9a-f]{64}$/.test(sig)) return null // fixed-length hex; also keeps timingSafeEqual throw-free
  const expected = hmacHex(secret, `${accountId}.${iat}`)
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  const issued = Number(iat)
  if (!Number.isFinite(issued)) return null
  if (Date.now() - issued >= maxAgeMs) return null
  return { accountId }
}
