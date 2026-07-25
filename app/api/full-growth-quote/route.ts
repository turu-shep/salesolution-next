/**
 * POST /api/full-growth-quote
 *
 * Body: JSON matching `fgoQuoteSchema`.
 *
 * Returns:
 *   200 { ok: true, channels }            — form succeeded
 *   400 { ok: false, errors: ZodIssue[] } — validation failed
 *   429 { ok: false, error: 'rate-limit' } — too many attempts from this IP
 *   500 { ok: false, error: 'submit-failed' } — delivery failed (detail logged server-side)
 *
 * This endpoint is FGO-specific. The generic /api/lead pipeline stays
 * untouched so productized lead flows (audit, sprint, catalog snapshot,
 * strategy call) keep working unchanged.
 */
import { NextRequest, NextResponse } from 'next/server'

import { sendServerEvent } from '@/lib/analytics-server'
import { fgoQuoteSchema } from '@/lib/lead-form/full-growth-quote-schema'
import { submitFgoQuote } from '@/lib/lead-form/full-growth-quote-submit'
import { fgoLeadValue } from '@/lib/lead-form/full-growth-quote-value'
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
    // Log the verbose channel/error detail server-side for diagnostics, but
    // return only a generic failure to the client — the per-channel errors can
    // include raw upstream (HubSpot) response bodies, which must not leak to an
    // unauthenticated caller. The form UI only reads res.ok/res.status anyway.
    console.error('[full-growth-quote] submit failed:', {
      channels: result.channels,
      errors: result.errors,
    })
    return NextResponse.json(
      { ok: false, error: 'submit-failed' },
      { status: 500 },
    )
  }

  // ── GA4 Measurement Protocol failsafe ──
  // Mirrors the client-side `generate_lead` + `full_growth_quote_request`
  // hits (see docs/strategy/ga4.md §5.8). Dedups against the client hit on
  // `transaction_id` (= our submissionId UUID). No-ops silently if env vars
  // are missing or the client didn't include a GA client_id.
  if (parsed.data.gaClientId && parsed.data.submissionId) {
    const value = fgoLeadValue(parsed.data.revenue)
    const serviceCount = parsed.data.services.filter((s) => s !== 'unsure').length
    const baseParams = {
      value,
      currency: 'USD',
      transaction_id: parsed.data.submissionId,
      lead_type: 'full_growth',
      revenue_band: parsed.data.revenue,
      page_location: parsed.data.pageSource || undefined,
    }

    await sendServerEvent({
      clientId: parsed.data.gaClientId,
      eventName: 'generate_lead',
      params: baseParams,
    })
    await sendServerEvent({
      clientId: parsed.data.gaClientId,
      eventName: 'full_growth_quote_request',
      params: { ...baseParams, shape: parsed.data.shape, service_count: serviceCount },
    })
  }

  return NextResponse.json({ ok: true, channels: result.channels })
}
