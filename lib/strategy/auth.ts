/**
 * Auth for the private /strategy area.
 *
 * Deliberately reuses the /sales primitives and the SAME env params
 * (SALES_ENABLED / SALES_PASSWORD / SALES_SESSION_SECRET) — one password,
 * one secret, one enable flag gate both private areas. The only thing that
 * differs is the session cookie, scoped to /strategy so the two sections sign
 * in independently (path-scoped cookies, same as /sales).
 */
export { MAX_AGE_S, isLocalHost, signSession, verifySession, verifyPassword } from '@/lib/sales/auth'

export const STRATEGY_COOKIE = 'strategy_auth'
