import 'server-only'

import type { LeadFormData } from './schema'

/**
 * Server-side submission orchestrator. Three channels, env-gated:
 *   1. Cloudflare Turnstile — verifies the bot-check token if a secret is set
 *   2. HubSpot Forms API    — primary CRM destination
 *   3. Resend                — transactional email fallback / notification
 *
 * If a channel's env vars are missing, the channel is skipped without failing.
 * Result: forms keep working from day one; switching on credentials lights
 * up the channels one at a time.
 */

type SubmitResult = {
  ok: boolean
  channels: { turnstile: ChannelState; hubspot: ChannelState; resend: ChannelState }
  errors: string[]
}

type ChannelState = 'sent' | 'skipped' | 'failed'

export async function submitLead(data: LeadFormData): Promise<SubmitResult> {
  const errors: string[] = []
  const channels: SubmitResult['channels'] = {
    turnstile: 'skipped',
    hubspot: 'skipped',
    resend: 'skipped',
  }

  // ── 1. Turnstile verification (only if configured) ──
  if (process.env.TURNSTILE_SECRET_KEY) {
    if (!data.turnstileToken) {
      errors.push('Missing Turnstile token (bot check required)')
      channels.turnstile = 'failed'
      return { ok: false, channels, errors }
    }
    const verifyOk = await verifyTurnstile(data.turnstileToken)
    channels.turnstile = verifyOk ? 'sent' : 'failed'
    if (!verifyOk) {
      errors.push('Turnstile verification failed')
      return { ok: false, channels, errors }
    }
  }

  // ── 2. HubSpot Forms API ──
  if (process.env.HUBSPOT_PORTAL_ID && process.env.HUBSPOT_FORM_ID) {
    try {
      await postToHubSpot(data)
      channels.hubspot = 'sent'
    } catch (err) {
      channels.hubspot = 'failed'
      errors.push(`HubSpot: ${(err as Error).message}`)
      console.error('[lead-submit] HubSpot failed:', err)
    }
  }

  // ── 3. Resend notification (always runs if configured — acts as receipt) ──
  if (process.env.RESEND_API_KEY && process.env.RESEND_TO_EMAIL) {
    try {
      await sendResendNotification(data)
      channels.resend = 'sent'
    } catch (err) {
      channels.resend = 'failed'
      errors.push(`Resend: ${(err as Error).message}`)
      console.error('[lead-submit] Resend failed:', err)
    }
  }

  // Dev-mode fallback when no channels are configured yet.
  if (channels.hubspot === 'skipped' && channels.resend === 'skipped') {
    console.log('[lead-submit] No backend channels configured — logging:', data)
  }

  // Form "succeeds" as long as at least one delivery channel sent it,
  // OR if no channels are configured (dev mode — don't punish the user).
  const someChannelSent = channels.hubspot === 'sent' || channels.resend === 'sent'
  const noChannelsConfigured =
    channels.hubspot === 'skipped' && channels.resend === 'skipped'

  return {
    ok: someChannelSent || noChannelsConfigured,
    channels,
    errors,
  }
}

// ────────────────────────────────────────────────────────────────────────────

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

async function postToHubSpot(data: LeadFormData) {
  const url =
    `https://api.hsforms.com/submissions/v3/integration/submit/` +
    `${process.env.HUBSPOT_PORTAL_ID}/${process.env.HUBSPOT_FORM_ID}`

  const fields = [
    { objectTypeId: '0-1', name: 'firstname', value: data.fullName.split(' ')[0] },
    { objectTypeId: '0-1', name: 'lastname',  value: data.fullName.split(' ').slice(1).join(' ') },
    { objectTypeId: '0-1', name: 'email',     value: data.email },
    { objectTypeId: '0-1', name: 'phone',     value: data.phone },
    { objectTypeId: '0-1', name: 'website',   value: data.website ?? '' },
    { objectTypeId: '0-1', name: 'monthly_revenue', value: data.revenue },
    { objectTypeId: '0-1', name: 'platform',  value: data.platform },
    { objectTypeId: '0-1', name: 'primary_marketing_frustration', value: data.frustration },
    // Only sent when the catalog-snapshot form populates it. HubSpot will
    // silently ignore an unknown property name, so this is safe to send even
    // before the `catalog_sku_count_range` property exists in the portal.
    ...(data.skuCount
      ? [{ objectTypeId: '0-1', name: 'catalog_sku_count_range', value: data.skuCount }]
      : []),
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

async function sendResendNotification(data: LeadFormData) {
  // Dynamic import keeps the SDK out of any client bundle.
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY!)

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'leads@salesolution.net',
    to: process.env.RESEND_TO_EMAIL!,
    subject: `New lead — ${data.fullName} (${data.revenue})`,
    text: formatPlainText(data),
  })
}

function formatPlainText(data: LeadFormData): string {
  return [
    `Name:        ${data.fullName}`,
    `Email:       ${data.email}`,
    `Phone:       ${data.phone}`,
    `Website:     ${data.website || '—'}`,
    `Revenue:     ${data.revenue}`,
    `Platform:    ${data.platform}`,
    `Frustration: ${data.frustration}`,
    ...(data.skuCount ? [`SKU range:   ${data.skuCount}`] : []),
    '',
    `Source:      ${data.pageSource ?? 'unknown'}`,
  ].join('\n')
}
