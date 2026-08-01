/**
 * POST /api/lead-magnet
 *
 * AI Search Survival Checklist capture + instant delivery. Mirrors /api/lead
 * but carries the lead-magnet schema (email + four quiz answers, no name or
 * phone), so the productized funnels keep their required fields.
 *
 * Returns:
 *   200 { ok: true, channels }              — captured (or dev mode); checklist sent
 *   400 { ok: false, error|errors }         — bad JSON / validation failed
 *   429 { ok: false, error: 'rate-limit' }  — too many attempts from this IP
 *   500 { ok: false, errors }               — every configured channel failed
 *
 * Validation runs on the client (UX) and here (security).
 */
import { NextRequest, NextResponse } from 'next/server'

import { leadMagnetSchema } from '@/lib/lead-form/lead-magnet-schema'
import { submitLeadMagnet } from '@/lib/lead-form/lead-magnet-submit'
import { rateLimit } from '@/lib/rate-limit'
import { isSameOrigin } from '@/lib/same-origin'

export async function POST(req: NextRequest) {
  // F-019: see lib/same-origin.ts — Next does not do this for Route Handlers.
  if (!isSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  const limit = await rateLimit(ip)
  if (!limit.success) {
    return NextResponse.json(
      { ok: false, error: 'rate-limit' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil((limit.reset - Date.now()) / 1000))),
        },
      },
    )
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid-json' }, { status: 400 })
  }

  const parsed = leadMagnetSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await submitLeadMagnet(parsed.data)
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, errors: result.errors, channels: result.channels },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, channels: result.channels })
}
