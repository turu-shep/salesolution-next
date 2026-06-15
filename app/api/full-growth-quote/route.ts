/**
 * POST /api/full-growth-quote
 *
 * Body: JSON matching `fgoQuoteSchema`.
 *
 * Returns:
 *   200 { ok: true, channels }            — form succeeded
 *   400 { ok: false, errors: ZodIssue[] } — validation failed
 *   429 { ok: false, error: 'rate-limit' } — too many attempts from this IP
 *   500 { ok: false, errors: string[] }   — Resend failed
 *
 * This endpoint is FGO-specific. The generic /api/lead pipeline stays
 * untouched so productized lead flows (audit, sprint, catalog snapshot,
 * strategy call) keep working unchanged.
 */
import { NextRequest, NextResponse } from 'next/server'

import { fgoQuoteSchema } from '@/lib/lead-form/full-growth-quote-schema'
import { submitFgoQuote } from '@/lib/lead-form/full-growth-quote-submit'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
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
    return NextResponse.json(
      { ok: false, error: 'invalid-json' },
      { status: 400 },
    )
  }

  const parsed = fgoQuoteSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await submitFgoQuote(parsed.data)
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, errors: result.errors, channels: result.channels },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, channels: result.channels })
}
