import 'server-only'

import {
  ORGANIC_PERCENTAGES,
  REVENUE_RANGES,
  TIMELINES,
  TRAFFIC_TYPES,
} from '@/lib/lead-form-config'

import type { LeadMagnetData } from './lead-magnet-schema'
import { sendAck } from './send-ack'

/**
 * AI Search Survival Checklist dispatch (F-02).
 *
 * Until 2026-07-27 this funnel had no backend at all: the form console.logged
 * the answers, waited 600ms, and redirected to another funnel's thank-you
 * page. Nobody was captured and nothing was ever sent. This is the pipeline
 * that makes the page's promise true.
 *
 * Same env-gated, fail-soft shape as submit.ts / submit-audit.ts:
 *   1. Turnstile — verify the bot token if a secret is set
 *   2. HubSpot   — CRM capture (its own form id when one exists)
 *   3. Resend    — operator notification
 *   4. Resend    — THE DELIVERY: the checklist link to the prospect. Gated on
 *                  the lead actually being captured, best-effort otherwise.
 *
 * The delivery is the product here, not a courtesy. It still doesn't gate
 * `ok`: if capture worked and only the send failed, the lead is safe and the
 * failure is loud in the logs — a retry is a human action, not a form error.
 */

type ChannelState = 'sent' | 'skipped' | 'failed'
type SubmitResult = {
  ok: boolean
  channels: {
    turnstile: ChannelState
    hubspot: ChannelState
    resend: ChannelState
    delivery: ChannelState
  }
  errors: string[]
}

const labelFor = (list: readonly { value: string; label: string }[], v: string) =>
  list.find((x) => x.value === v)?.label ?? v

export async function submitLeadMagnet(data: LeadMagnetData): Promise<SubmitResult> {
  const errors: string[] = []
  const channels: SubmitResult['channels'] = {
    turnstile: 'skipped',
    hubspot: 'skipped',
    resend: 'skipped',
    delivery: 'skipped',
  }

  // ── 1. Turnstile ──
  if (process.env.TURNSTILE_SECRET_KEY) {
    if (!data.turnstileToken) {
      channels.turnstile = 'failed'
      return { ok: false, channels, errors: ['Missing Turnstile token (bot check required)'] }
    }
    const ok = await verifyTurnstile(data.turnstileToken)
    channels.turnstile = ok ? 'sent' : 'failed'
    if (!ok) return { ok: false, channels, errors: ['Turnstile verification failed'] }
  }

  // ── 2. HubSpot (dedicated form id when the portal has one, else the shared
  //    lead form — same fallback shape as submit-audit.ts) ──
  const hubspotFormId =
    process.env.HUBSPOT_LEAD_MAGNET_FORM_ID ?? process.env.HUBSPOT_FORM_ID
  if (process.env.HUBSPOT_PORTAL_ID && hubspotFormId) {
    try {
      await postToHubSpot(data, hubspotFormId)
      channels.hubspot = 'sent'
    } catch (err) {
      channels.hubspot = 'failed'
      errors.push(`HubSpot: ${(err as Error).message}`)
      console.error('[lead-magnet-submit] HubSpot failed:', err)
    }
  }

  // ── 3. Operator notification ──
  if (process.env.RESEND_API_KEY && process.env.RESEND_TO_EMAIL) {
    try {
      await sendResendNotification(data)
      channels.resend = 'sent'
    } catch (err) {
      channels.resend = 'failed'
      errors.push(`Resend: ${(err as Error).message}`)
      console.error('[lead-magnet-submit] Resend failed:', err)
    }
  }

  const someSent = channels.hubspot === 'sent' || channels.resend === 'sent'
  const noneConfigured =
    channels.hubspot === 'skipped' && channels.resend === 'skipped'

  // ── 4. Deliver the checklist. Only once the lead is captured — promising a
  //    checklist to someone whose details went nowhere is the F-02 bug in
  //    reverse. Missing RESEND_API_KEY degrades to a logged skip. ──
  if (process.env.RESEND_API_KEY && someSent) {
    try {
      await sendAck('lead_magnet', data.email)
      channels.delivery = 'sent'
    } catch (err) {
      channels.delivery = 'failed'
      errors.push(`Delivery: ${(err as Error).message}`)
      console.error('[lead-magnet-submit] Checklist delivery FAILED — owed manually:', {
        email: data.email,
        err,
      })
    }
  } else if (!process.env.RESEND_API_KEY && someSent) {
    console.error(
      '[lead-magnet-submit] RESEND_API_KEY missing — lead captured but the checklist was never sent:',
      data.email,
    )
  }

  // F-014: dev convenience locally, silent lead loss in production.
  if (noneConfigured) {
    if (process.env.NODE_ENV === 'production') {
      const msg =
        'No lead delivery channel is configured (HubSpot and Resend both absent) — refusing to report success and drop the lead.'
      console.error('[lead-magnet-submit]', msg)
      return { ok: false, channels, errors: [...errors, msg] }
    }
    console.log('[lead-magnet-submit] No backend channels configured — logging:', data)
  }

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

/**
 * Email-only capture — this form asks for no name, so HubSpot gets the email
 * plus the four quiz answers. Unknown property names are ignored by the Forms
 * API, so the `checklist_*` properties are safe to send before they exist in
 * the portal (same assumption as the `fgo_*` and `catalog_*` properties).
 */
async function postToHubSpot(data: LeadMagnetData, formId: string) {
  const url =
    `https://api.hsforms.com/submissions/v3/integration/submit/` +
    `${process.env.HUBSPOT_PORTAL_ID}/${formId}`

  const fields = [
    { objectTypeId: '0-1', name: 'email', value: data.email },
    { objectTypeId: '0-1', name: 'checklist_revenue_band', value: labelFor(REVENUE_RANGES, data.revenue) },
    { objectTypeId: '0-1', name: 'checklist_organic_share', value: labelFor(ORGANIC_PERCENTAGES, data.organicShare) },
    { objectTypeId: '0-1', name: 'checklist_traffic_type', value: labelFor(TRAFFIC_TYPES, data.trafficType) },
    { objectTypeId: '0-1', name: 'checklist_timeline', value: labelFor(TIMELINES, data.timeline) },
  ]

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields,
      context: {
        pageUri: data.pageSource ?? 'https://salesolution.net/future-proof-your-seo/',
      },
    }),
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`HubSpot ${res.status}: ${detail.slice(0, 200)}`)
  }
}

async function sendResendNotification(data: LeadMagnetData) {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY!)

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'connect@salesolution.net',
    to: process.env.RESEND_TO_EMAIL!,
    subject: `Checklist request — ${data.email}`,
    text: [
      `Email:         ${data.email}`,
      `Revenue:       ${labelFor(REVENUE_RANGES, data.revenue)}`,
      `Organic share: ${labelFor(ORGANIC_PERCENTAGES, data.organicShare)}`,
      `Traffic type:  ${labelFor(TRAFFIC_TYPES, data.trafficType)}`,
      `Timeline:      ${labelFor(TIMELINES, data.timeline)}`,
      '',
      `Source:        ${data.pageSource ?? 'unknown'}`,
    ].join('\n'),
  })
  // F-031: the SDK resolves with { data, error } rather than throwing.
  if (error) throw new Error(`${error.name}: ${error.message}`)
}
