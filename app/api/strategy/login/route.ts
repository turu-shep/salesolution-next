import { NextResponse, type NextRequest } from 'next/server'

import { LOGIN_POLICY, rateLimit } from '@/lib/rate-limit'
import { MAX_AGE_S, STRATEGY_COOKIE, signSession, verifyPassword } from '@/lib/strategy/auth'

/**
 * POST /api/strategy/login
 *
 * Gate for the private /strategy area. Verifies the submitted password against
 * SALES_PASSWORD (the same env param /sales uses, constant-time) and, on success,
 * sets a signed httpOnly session cookie scoped to /strategy. JSON in, JSON out so
 * the client login form (components/strategy/StrategyLogin.tsx) can show an inline
 * error. Localhost is open and never hits this route — see app/strategy/layout.tsx.
 * Mirror of app/api/sales/login/route.ts.
 *
 * Rate limited under LOGIN_POLICY (F-002), sharing the budget with /api/sales/login
 * because both verify the same SALES_PASSWORD — throttling them separately would
 * hand an attacker twice the attempts.
 */
export async function POST(req: NextRequest) {
  const expected = process.env.SALES_PASSWORD
  const secret = process.env.SALES_SESSION_SECRET
  if (!expected || !secret) {
    return NextResponse.json(
      { ok: false, error: 'The strategy area is not configured.' },
      { status: 500 },
    )
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  const limit = await rateLimit(ip, LOGIN_POLICY)
  if (!limit.success) {
    const retryAfter = Math.max(1, Math.ceil((limit.reset - Date.now()) / 1000))
    return NextResponse.json(
      { ok: false, error: `Too many attempts. Try again in ${Math.ceil(retryAfter / 60)} min.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    )
  }

  let password = ''
  const contentType = req.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    const body = (await req.json().catch(() => null)) as { password?: unknown } | null
    password = typeof body?.password === 'string' ? body.password : ''
  } else {
    const form = await req.formData().catch(() => null)
    password = form ? String(form.get('password') ?? '') : ''
  }

  if (!verifyPassword(password, expected)) {
    return NextResponse.json({ ok: false, error: 'Wrong password.' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(STRATEGY_COOKIE, signSession(secret), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/strategy',
    maxAge: MAX_AGE_S,
  })
  return res
}
