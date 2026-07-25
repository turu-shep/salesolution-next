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

import { sendServerEvent } from '@/lib/analytics-server'
import { leadSchema } from '@/lib/lead-form/schema'
import { submitLead } from '@/lib/lead-form/submit'
import { rateLimit } from '@/lib/rate-limit'
import { isSameOrigin } from '@/lib/same-origin'

export async function POST(req: NextRequest) {
  // F-019: Route Handlers get no Origin check from Next, so a third-party page
  // could drive this form from a visitor's browser and spend their IP's budget.
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

  // ── GA4 Measurement Protocol failsafe ──
  // Mirrors the client-side `generate_lead` hit (see docs/strategy/ga4.md §5.8).
  // Dedups against the client hit on `transaction_id` (= our submissionId UUID).
  // No-ops silently if env vars are missing, or if the client didn't include a
  // GA client_id (consent denied / no cookie / ad-blocker stripped it).
  if (parsed.data.gaClientId && parsed.data.submissionId) {
    const pageSource = parsed.data.pageSource ?? ''
    const leadType: 'audit' | 'sprint' | 'strategy_call' | 'contact' | 'catalog_snapshot' =
      pageSource.includes('/unlock-growth-audit/') ? 'audit' :
      pageSource.includes('/constraint-sprint/')   ? 'sprint' :
      pageSource.includes('/book-growth-call/')    ? 'strategy_call' :
      pageSource.includes('/catalog-snapshot/')    ? 'catalog_snapshot' :
      'contact'

    const value = computeLeadValue(leadType, parsed.data.revenue)
    const baseParams = {
      value,
      currency: 'USD',
      transaction_id: parsed.data.submissionId,
      lead_type: leadType,
      revenue_band: parsed.data.revenue,
      page_location: pageSource || undefined,
    }

    // Canonical conversion — always fire.
    await sendServerEvent({
      clientId: parsed.data.gaClientId,
      eventName: 'generate_lead',
      params: baseParams,
    })

    // Page-specific echo, matches the client-side behavior.
    const echo =
      leadType === 'audit'            ? 'audit_request' :
      leadType === 'sprint'           ? 'constraint_sprint_apply' :
      leadType === 'strategy_call'    ? 'book_growth_call' :
      leadType === 'catalog_snapshot' ? 'catalog_snapshot_request' :
      null
    if (echo) {
      await sendServerEvent({
        clientId: parsed.data.gaClientId,
        eventName: echo,
        params: baseParams,
      })
    }
  }

  return NextResponse.json({ ok: true, channels: result.channels })
}

// ────────────────────────────────────────────────────────────────────────────

/**
 * Lead-value model from docs/strategy/ga4.md §3.2. Maps the form's revenue
 * select (lib/lead-form-config.ts REVENUE_RANGES) onto the doc's coarser
 * `<$50k`, `$50k–$250k`, `$250k–$1M`, `$1M+` bands.
 *
 * `under-100k` lands in the smallest band (the form has no sub-50k option).
 * Unknown revenue values fall through to the smallest tier.
 */
function computeLeadValue(
  leadType: 'audit' | 'sprint' | 'strategy_call' | 'contact' | 'catalog_snapshot',
  revenueBand: string,
): number {
  if (leadType === 'sprint') return 2400
  if (leadType === 'contact') return 50
  // Catalog snapshot sits between audit and sprint: higher intent than a
  // general audit (committed buyer of a specific productized service), lower
  // than a sprint applicant who has already named a constraint. Tunable.
  if (leadType === 'catalog_snapshot') return 300

  const auditValue =
    revenueBand === 'under-100k' ? 80  :
    revenueBand === '100k-250k'  ? 220 :
    revenueBand === '250k-500k'  ? 500 :
    revenueBand === '500k-1m'    ? 500 :
    revenueBand === '1m-2m'      ? 900 :
    revenueBand === '2m-5m'      ? 900 :
    revenueBand === '5m-plus'    ? 900 :
    80

  if (leadType === 'strategy_call') return Math.round(auditValue * 1.2)
  return auditValue
}
