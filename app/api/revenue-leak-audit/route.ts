/**
 * POST /api/revenue-leak-audit
 *
 * Local-service (Revenue Engine) lead capture. Mirrors /api/lead but uses the
 * Revenue-Engine schema + submitter, so roofer/dental leads never flow through
 * the industrial e-commerce schema. Validation runs client-side (UX) and here
 * (security).
 *
 * Returns:
 *   200 { ok: true, channels }              — at least one channel sent (or dev mode)
 *   400 { ok: false, error|errors }         — bad JSON / validation failed
 *   429 { ok: false, error: 'rate-limit' }  — too many attempts from this IP
 *   500 { ok: false, errors }               — all configured channels failed
 */
import { NextRequest, NextResponse } from 'next/server'

import { sendServerEvent } from '@/lib/analytics-server'
import { revenueLeakAuditSchema } from '@/lib/lead-form/revenue-leak-audit-schema'
import { submitAudit } from '@/lib/lead-form/submit-audit'
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
    return NextResponse.json({ ok: false, error: 'invalid-json' }, { status: 400 })
  }

  const parsed = revenueLeakAuditSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await submitAudit(parsed.data)
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, errors: result.errors, channels: result.channels },
      { status: 500 },
    )
  }

  // ── GA4 Measurement Protocol failsafe (mirrors the client generate_lead) ──
  // Dedups against the client hit on transaction_id = submissionId. No-ops if env
  // is missing or the client sent no GA client_id (consent denied / blocked).
  if (parsed.data.gaClientId && parsed.data.submissionId) {
    const baseParams = {
      // Flat value for a local-service audit lead (no revenue band collected).
      value: 220,
      currency: 'USD',
      transaction_id: parsed.data.submissionId,
      lead_type: 'audit' as const,
      page_location: parsed.data.pageSource || undefined,
    }
    await sendServerEvent({
      clientId: parsed.data.gaClientId,
      eventName: 'generate_lead',
      params: baseParams,
    })
    await sendServerEvent({
      clientId: parsed.data.gaClientId,
      eventName: 'audit_request',
      params: baseParams,
    })
  }

  return NextResponse.json({ ok: true, channels: result.channels })
}
