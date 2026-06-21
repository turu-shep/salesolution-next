import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Auth primitives for the private /sales area (server-only — imports node:crypto).
 *
 * The gate is a signed, httpOnly session cookie verified in app/sales/layout.tsx
 * and minted in app/api/sales/login/route.ts. No DB, no session store: the cookie
 * value is `<issuedAtMs>.<hmac>`, signed with SALES_SESSION_SECRET, and self-expires.
 * Localhost is open (dev convenience); production requires the password + the flag.
 */

export const SALES_COOKIE = 'sales_auth'
export const MAX_AGE_S = 60 * 60 * 24 * 30 // 30 days

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])

/** True when the request host is a local dev host (the gate is open there). */
export function isLocalHost(host: string): boolean {
  const h = host.toLowerCase().split(':')[0].trim()
  return LOCAL_HOSTS.has(h) || h.endsWith('.local')
}

function hmacHex(secret: string, value: string): string {
  return createHmac('sha256', secret).update(value).digest('hex')
}

/** Constant-time compare of two strings via fixed-length SHA-256 digests (no length leak). */
function safeEqual(a: string, b: string): boolean {
  const da = createHash('sha256').update(a).digest()
  const db = createHash('sha256').update(b).digest()
  return timingSafeEqual(da, db)
}

/** Verify the submitted password against SALES_PASSWORD, constant-time. */
export function verifyPassword(input: string, expected: string): boolean {
  if (!expected) return false
  return safeEqual(input, expected)
}

/** Mint a signed session token: `<issuedAtMs>.<hmac>`. */
export function signSession(secret: string): string {
  const iat = String(Date.now())
  return `${iat}.${hmacHex(secret, iat)}`
}

/** Verify a session token's signature and that it was issued within maxAgeMs. */
export function verifySession(token: string, secret: string, maxAgeMs: number): boolean {
  if (!secret || !token) return false
  const dot = token.indexOf('.')
  if (dot <= 0) return false
  const iat = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = hmacHex(secret, iat)
  if (sig.length !== expected.length) return false
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false
  const issued = Number(iat)
  if (!Number.isFinite(issued)) return false
  return Date.now() - issued < maxAgeMs
}
