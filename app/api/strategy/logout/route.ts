import { NextResponse, type NextRequest } from 'next/server'

import { STRATEGY_COOKIE } from '@/lib/strategy/auth'

/**
 * POST /api/strategy/logout — clears the session cookie and returns to /strategy
 * (which then re-renders the password gate in production). The "Lock" button in
 * the internal shell submits here. POST (not GET) so a prefetch or crawler can't
 * trip it; 303 turns the redirect back into a GET. Mirror of /api/sales/logout.
 */
export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/strategy', req.nextUrl.origin), 303)
  res.cookies.set(STRATEGY_COOKIE, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/strategy',
    maxAge: 0,
  })
  return res
}
