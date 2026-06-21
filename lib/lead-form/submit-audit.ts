import 'server-only'

import { LEAKS, type RevenueLeakAuditData, TRADES } from './revenue-leak-audit-schema'

/**
 * Server-side submission for the Revenue Leak Audit (local-service funnel).
 * Same env-gated, fail-soft pattern as lib/lead-form/submit.ts:
 *   1. Cloudflare Turnstile — verify the bot token if a secret is set
 *   2. HubSpot Forms API    — CRM destination (its own form id)
 *   3. Resend                — email notification to leads@
 *
 * Missing env for a channel = that channel is skipped, not failed. With no
 * channels configured the form still "succeeds" (dev mode) so it never blocks a
 * real lead while the GHL/CRM wiring (RE-203) is finished.
 */

type ChannelState = 'sent' | 'skipped' | 'failed'
type SubmitResult = {
  ok: boolean
  channels: { turnstile: ChannelState; hubspot: ChannelState; resend: ChannelState }
  errors: string[]
}

const labelFor = (list: readonly { value: string; label: string }[], v: string) =>
  list.find((x) => x.value === v)?.label ?? v

export async function submitAudit(data: RevenueLeakAuditData): Promise<SubmitResult> {
  const errors: string[] = []
  const channels: SubmitResult['channels'] = {
    turnstile: 'skipped',
    hubspot: 'skipped',
    resend: 'skipped',
  }

  // ── 1. Turnstile ──
  if (process.env.TURNSTILE_SECRET_KEY) {
    if (!data.turnstileToken) {
      channels.turnstile = 'failed'
      return { ok: false, channels, errors: ['Missing Turnstile token'] }
    }
    const ok = await verifyTurnstile(data.turnstileToken)
    channels.turnstile = ok ? 'sent' : 'failed'
    if (!ok) return { ok: false, channels, errors: ['Turnstile verification failed'] }
  }

  // ── 2. HubSpot (uses a Revenue-Engine-specific form id when present) ──
  const hubspotFormId =
    process.env.HUBSPOT_AUDIT_FORM_ID ?? process.env.HUBSPOT_FORM_ID
  if (process.env.HUBSPOT_PORTAL_ID && hubspotFormId) {
    try {
      await postToHubSpot(data, hubspotFormId)
      channels.hubspot = 'sent'
    } catch (err) {
      channels.hubspot = 'failed'
      errors.push(`HubSpot: ${(err as Error).message}`)
      console.error('[audit-submit] HubSpot failed:', err)
    }
  }

  // ── 3. Resend notification ──
  if (process.env.RESEND_API_KEY && process.env.RESEND_TO_EMAIL) {
    try {
      await sendResendNotification(data)
      channels.resend = 'sent'
    } catch (err) {
      channels.resend = 'failed'
      errors.push(`Resend: ${(err as Error).message}`)
      console.error('[audit-submit] Resend failed:', err)
    }
  }

  if (channels.hubspot === 'skipped' && channels.resend === 'skipped') {
    console.log('[audit-submit] No backend channels configured — logging:', data)
  }

  const someSent = channels.hubspot === 'sent' || channels.resend === 'sent'
  const noneConfigured =
    channels.hubspot === 'skipped' && channels.resend === 'skipped'

  return { ok: someSent || noneConfigured, channels, errors }
}

// ─────────────────────────────────────────────────────────────────────────────

async function verifyTurnstile(token: string): Promise<boolean> {
  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY!,
        response: token,
      }),
    },
  )
  const result = (await res.json()) as { success?: boolean }
  return !!result.success
}

async function postToHubSpot(data: RevenueLeakAuditData, formId: string) {
  const url =
    `https://api.hsforms.com/submissions/v3/integration/submit/` +
    `${process.env.HUBSPOT_PORTAL_ID}/${formId}`

  const fields = [
    { objectTypeId: '0-1', name: 'firstname', value: data.fullName.split(' ')[0] },
    { objectTypeId: '0-1', name: 'lastname', value: data.fullName.split(' ').slice(1).join(' ') },
    { objectTypeId: '0-1', name: 'phone', value: data.phone },
    { objectTypeId: '0-1', name: 'company', value: data.company },
    ...(data.email ? [{ objectTypeId: '0-1', name: 'email', value: data.email }] : []),
    ...(data.website ? [{ objectTypeId: '0-1', name: 'website', value: data.website }] : []),
    { objectTypeId: '0-1', name: 'trade', value: labelFor(TRADES, data.trade) },
    { objectTypeId: '0-1', name: 'primary_leak', value: labelFor(LEAKS, data.leak) },
  ]

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields,
      context: { pageUri: data.pageSource ?? 'https://salesolution.net/' },
    }),
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`HubSpot ${res.status}: ${detail.slice(0, 200)}`)
  }
}

async function sendResendNotification(data: RevenueLeakAuditData) {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY!)
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'leads@salesolution.net',
    to: process.env.RESEND_TO_EMAIL!,
    subject: `Revenue Leak Audit — ${data.fullName}, ${data.company}`,
    text: [
      `Name:    ${data.fullName}`,
      `Phone:   ${data.phone}`,
      `Company: ${data.company}`,
      `Email:   ${data.email || '—'}`,
      `Website: ${data.website || '—'}`,
      `Trade:   ${labelFor(TRADES, data.trade)}`,
      `Leak:    ${labelFor(LEAKS, data.leak)}`,
      '',
      `Source:  ${data.pageSource ?? 'unknown'}`,
    ].join('\n'),
  })
}
