/**
 * POST /api/lead
 *
 * Body: JSON matching `leadSchema`.
 *
 * Returns:
 *   200 { ok: true, channels }            — form succeeded (at least one channel sent)
 *   400 { ok: false, errors: ZodIssue[] } — validation failed
 *   429 { ok: false, error: 'rate-limit' } — too many attempts from this IP
 *   500 { ok: false, errors: string[] }   — all configured channels failed
 *
 * Validation runs both on the client (UX) and here (security). Never trust
 * the client schema alone — malicious clients skip the validator entirely.
 */
import { NextRequest, NextResponse } from 'next/server'

import { leadSchema } from '@/lib/lead-form/schema'
import { submitLead } from '@/lib/lead-form/submit'

// Crude in-memory rate limiter — fine for dev; replace with Upstash / Redis
// before high-traffic launch. Keyed on IP, 5 submissions / 10 minutes.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5
const hits = new Map<string, number[]>()

function rateLimitHit(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  return false
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  if (rateLimitHit(ip)) {
    return NextResponse.json(
      { ok: false, error: 'rate-limit' },
      { status: 429 },
    )
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'invalid-json' },
      { status: 400 },
    )
  }

  const parsed = leadSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await submitLead(parsed.data)

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, errors: result.errors, channels: result.channels },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, channels: result.channels })
}
