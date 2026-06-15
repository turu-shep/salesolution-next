import 'server-only'

import {
  FGO_HEADCOUNT_RANGES,
  FGO_REVENUE_RANGES,
  FGO_SERVICES,
  FGO_SHAPES,
  FGO_SPEND_RANGES,
  type FgoQuoteData,
} from './full-growth-quote-schema'

/**
 * FGO qualifier dispatch — Resend only.
 *
 * The lead pipeline that lives in submit.ts (HubSpot + Resend with a
 * shared shape) is built around the productized-lead schema. FGO
 * qualifiers carry different fields and a different downstream
 * commitment (1-page personal diagnostic within 24h), so they get their
 * own route and we keep the existing pipeline untouched.
 *
 * HubSpot mapping for FGO is deliberately deferred to the "operational
 * readiness" pass — by then the FGO-specific HubSpot properties exist in
 * the portal and we can map cleanly instead of stuffing this into the
 * generic lead form.
 */

type ChannelState = 'sent' | 'skipped' | 'failed'

type SubmitResult = {
  ok: boolean
  channels: { turnstile: ChannelState; resend: ChannelState }
  errors: string[]
}

export async function submitFgoQuote(data: FgoQuoteData): Promise<SubmitResult> {
  const errors: string[] = []
  const channels: SubmitResult['channels'] = {
    turnstile: 'skipped',
    resend: 'skipped',
  }

  if (process.env.TURNSTILE_SECRET_KEY) {
    if (!data.turnstileToken) {
      errors.push('Missing Turnstile token (bot check required)')
      channels.turnstile = 'failed'
      return { ok: false, channels, errors }
    }
    const ok = await verifyTurnstile(data.turnstileToken)
    channels.turnstile = ok ? 'sent' : 'failed'
    if (!ok) {
      errors.push('Turnstile verification failed')
      return { ok: false, channels, errors }
    }
  }

  if (process.env.RESEND_API_KEY && process.env.RESEND_TO_EMAIL) {
    try {
      await sendResendNotification(data)
      channels.resend = 'sent'
    } catch (err) {
      channels.resend = 'failed'
      errors.push(`Resend: ${(err as Error).message}`)
      console.error('[fgo-quote-submit] Resend failed:', err)
    }
  }

  if (channels.resend === 'skipped') {
    console.log('[fgo-quote-submit] No backend channels configured — logging:', data)
  }

  const sent = channels.resend === 'sent'
  const noChannels = channels.resend === 'skipped'
  return { ok: sent || noChannels, channels, errors }
}

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

async function sendResendNotification(data: FgoQuoteData) {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY!)

  const shape = FGO_SHAPES.find((s) => s.value === data.shape)?.label ?? data.shape
  const revenue =
    FGO_REVENUE_RANGES.find((r) => r.value === data.revenue)?.label ?? data.revenue
  const headcount =
    FGO_HEADCOUNT_RANGES.find((h) => h.value === data.headcount)?.label ?? data.headcount
  const spend =
    FGO_SPEND_RANGES.find((s) => s.value === data.marketingSpend)?.label ??
    data.marketingSpend
  const services = data.services
    .map((v) => FGO_SERVICES.find((s) => s.value === v)?.label ?? v)
    .join(', ')

  const subject = `FGO quote — ${data.fullName} (${revenue})`
  const text = [
    `Name:     ${data.fullName}`,
    `Email:    ${data.email}`,
    `Phone:    ${data.phone || '—'}`,
    `Best time: ${data.bestTime || '—'}`,
    '',
    `Shape:    ${shape}`,
    `Services: ${services}`,
    '',
    `Website:  ${data.website || '—'}`,
    `Revenue:  ${revenue}`,
    `Headcount: ${headcount}`,
    `Spend:    ${spend}`,
    '',
    'Notes:',
    data.notes || '—',
    '',
    `Source:   ${data.pageSource ?? 'unknown'}`,
  ].join('\n')

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'leads@salesolution.net',
    to: process.env.RESEND_TO_EMAIL!,
    subject,
    text,
  })
}
