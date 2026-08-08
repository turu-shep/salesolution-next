import { NextResponse } from 'next/server'

import { CONTACTS_COOKIE } from '@/lib/auth.mjs'

/**
 * POST /api/logout — clears the session cookie. Needs no session itself:
 * clearing an absent cookie is a no-op and discloses nothing.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(CONTACTS_COOKIE, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}
