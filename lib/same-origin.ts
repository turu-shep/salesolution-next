import 'server-only'

import type { NextRequest } from 'next/server'

/**
 * Same-origin check for the public POST route handlers.
 *
 * Next 16 compares Origin against Host for Server Actions, but Route Handlers get
 * no such protection (node_modules/next/dist/docs/01-app/02-guides/data-security.md
 * §"Origin header"), so each handler has to ask. This mirrors the framework's own
 * semantics: same-origin when the Origin header's host matches Host, preferring
 * X-Forwarded-Host so it keeps working behind the platform proxy and on previews.
 *
 * Comparing against the request's own host rather than a hardcoded domain is
 * deliberate — apex, www, and preview deployments all pass without a list to
 * maintain, and none of them is an attacker-controlled origin.
 *
 * A missing Origin is allowed. Browsers always send it on cross-origin POST, which
 * is the vector this closes (a third-party page driving our forms from a visitor's
 * browser, laundering their IP past the rate limits). Rejecting absent-Origin would
 * break server-to-server and legacy callers without adding protection.
 */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true

  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  if (!host) return false

  try {
    return new URL(origin).host === host
  } catch {
    // Unparseable Origin (including the literal "null" sent by opaque origins).
    return false
  }
}
