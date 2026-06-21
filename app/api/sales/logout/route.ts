import { NextResponse, type NextRequest } from 'next/server'

import { SALES_COOKIE } from '@/lib/sales/auth'

/**
 * POST /api/sales/logout — clears the session cookie and returns to /sales (which
 * then re-renders the password gate in production). The "Lock" button in the
 * internal shell submits here. POST (not GET) so a prefetch or crawler can't
 * trip it; 303 turns the redirect back into a GET.
 */
export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/sales', req.nextUrl.origin), 303)
  res.cookies.set(SALES_COOKIE, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/sales',
    maxAge: 0,
  })
  return res
}
