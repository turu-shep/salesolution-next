import { NextResponse, type NextRequest } from 'next/server'

import { MAX_AGE_S, SALES_COOKIE, signSession, verifyPassword } from '@/lib/sales/auth'

/**
 * POST /api/sales/login
 *
 * Gate for the private /sales area. Verifies the submitted password against
 * SALES_PASSWORD (constant-time) and, on success, sets a signed httpOnly session
 * cookie scoped to /sales. JSON in, JSON out so the client login form
 * (components/sales/SalesLogin.tsx) can show an inline error. Localhost is open
 * and never hits this route — see app/sales/layout.tsx.
 */
export async function POST(req: NextRequest) {
  const expected = process.env.SALES_PASSWORD
  const secret = process.env.SALES_SESSION_SECRET
  if (!expected || !secret) {
    return NextResponse.json(
      { ok: false, error: 'The sales area is not configured.' },
      { status: 500 },
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
  res.cookies.set(SALES_COOKIE, signSession(secret), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/sales',
    maxAge: MAX_AGE_S,
  })
  return res
}
