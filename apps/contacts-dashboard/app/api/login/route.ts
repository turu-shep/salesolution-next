import { NextResponse, type NextRequest } from 'next/server'

import { CONTACTS_COOKIE, MAX_AGE_S, hashPassword, signSession, verifyPassword } from '@/lib/auth.mjs'
import { LOGIN_POLICY, rateLimit } from '@/lib/rate-limit.mjs'
import { describeError, serverClient } from '@/lib/supabase'

/**
 * POST /api/login — the one route that mints sessions, so the one route with
 * no session guard. Rate-limited per (ip, email) BEFORE any DB read; one
 * generic 401 body for missing account, wrong password, and revoked alike —
 * nothing in the response says which, and nothing in its timing should either.
 */

/**
 * A real hash of a value nobody knows (fresh random bytes each boot). When the
 * email matches no account, the password is verified against THIS, so the
 * request burns the same scrypt work as a wrong password on a real account —
 * a fast reply would otherwise say "that email exists".
 */
const DECOY_HASH = hashPassword(crypto.randomUUID())

export async function POST(req: NextRequest) {
  const secret = process.env.CONTACTS_DASHBOARD_SESSION_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'the dashboard is not configured' }, { status: 500 })
  }

  const body = (await req.json().catch(() => null)) as { email?: unknown; password?: unknown } | null
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  const limit = rateLimit(`${ip}:${email}`, LOGIN_POLICY)
  if (!limit.success) {
    const retryAfter = Math.max(1, Math.ceil((limit.reset - Date.now()) / 1000))
    return NextResponse.json(
      { error: `too many attempts — try again in ${Math.max(1, Math.ceil(retryAfter / 60))} min` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    )
  }

  type AccountRow = { id: string; password_hash: string; status: string }
  let row: AccountRow | null = null
  if (email !== '') {
    try {
      const db = serverClient()
      const { data, error } = await db
        .from('accounts')
        .select('id, password_hash, status')
        .eq('email', email)
        .limit(1)
      if (error) throw new Error(describeError(error))
      row = (data?.[0] as AccountRow | undefined) ?? null
    } catch {
      row = null // DB down or unconfigured — fail closed as "invalid credentials"
    }
  }

  // Constant-cost path: scrypt runs whether the account exists, is revoked, or
  // neither; the status check comes after the hash work, never instead of it.
  const passwordOk = verifyPassword(password, row ? row.password_hash : DECOY_HASH)
  if (row === null || !passwordOk || row.status !== 'active') {
    return NextResponse.json({ error: 'invalid credentials' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(CONTACTS_COOKIE, signSession(row.id, secret), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_S,
  })
  return res
}
