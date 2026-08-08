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
 * FGO qualifier dispatch — its own pipeline, separate from the productized
 * lead flow in submit.ts (which is shaped around the productized schema).
 * FGO qualifiers carry different fields and a different downstream
 * commitment (1-page personal diagnostic within 24h), so they get their
 * own route and the existing pipeline stays untouched.
 *
 * Channels, each env-gated and degrading gracefully when unconfigured:
 *   1. Turnstile — verifies the bot-check token if a secret is set
 *   2. HubSpot   — dedicated FGO form (HUBSPOT_FGO_FORM_ID) so qualifiers
 *                  land in their own pipeline; maps the `fgo_*` properties
 *   3. Resend (team)   — the lead notification into the operator inbox
 *   4. Resend (auto-ack) — the submitter's "got it, 24h personal reply"
 *                  confirmation; best-effort, gated on the lead actually
 *                  being captured so we never acknowledge a dropped lead
 */

type ChannelState = 'sent' | 'skipped' | 'failed'

type SubmitResult = {
  ok: boolean
  channels: {
    turnstile: ChannelState
    hubspot: ChannelState
    resend: ChannelState
    autoAck: ChannelState
  }
  errors: string[]
}

export async function submitFgoQuote(data: FgoQuoteData): Promise<SubmitResult> {
  const errors: string[] = []
  const channels: SubmitResult['channels'] = {
    turnstile: 'skipped',
    hubspot: 'skipped',
    resend: 'skipped',
    autoAck: 'skipped',
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

  // ── HubSpot CRM (dedicated FGO form so qualifiers land in their own
  //    pipeline, separate from the productized lead form). Gated on a
  //    distinct HUBSPOT_FGO_FORM_ID — falls back to skipped until the FGO
  //    form + properties exist in the portal. ──
  if (process.env.HUBSPOT_PORTAL_ID && process.env.HUBSPOT_FGO_FORM_ID) {
    try {
      await postToHubSpot(data)
      channels.hubspot = 'sent'
    } catch (err) {
      channels.hubspot = 'failed'
      errors.push(`HubSpot: ${(err as Error).message}`)
      console.error('[fgo-quote-submit] HubSpot failed:', err)
    }
  }

  // ── Team notification (the lead lands in Artur's inbox) ──
  if (process.env.RESEND_API_KEY && process.env.RESEND_TO_EMAIL) {
    try {
      await sendResendNotification(data)
      channels.resend = 'sent'
    } catch (err) {
      channels.resend = 'failed'
      errors.push(`Resend: ${(err as Error).message}`)
      console.error('[fgo-quote-submit] Resend failed:', err)
    }
  } else if (process.env.RESEND_API_KEY && !process.env.RESEND_TO_EMAIL) {
    // Half-configured: the API key is present but there's no destination
    // inbox, so the lead has nowhere to land. Treat this as a FAILED channel
    // (not a benign "no channels configured" dev success) so we don't silently
    // drop a real lead and report success below.
    channels.resend = 'failed'
    errors.push('Resend: RESEND_API_KEY is set but RESEND_TO_EMAIL is missing — lead has no destination')
    console.error(
      '[fgo-quote-submit] MISCONFIG: RESEND_API_KEY set but RESEND_TO_EMAIL missing — refusing to drop the lead silently',
    )
  }

  // Whether the lead was actually captured by a delivery channel. Computed
  // here so the auto-ack below can gate on it.
  const someChannelSent = channels.hubspot === 'sent' || channels.resend === 'sent'

  // ── Submitter auto-acknowledgment (the "we got it, 24h personal reply"
  //    promise from spec §3.5 + §9). Best-effort, so it never gates success —
  //    BUT it must only fire when the lead was actually captured. Acknowledging
  //    a prospect for a lead nobody received is worse than silence. ──
  if (process.env.RESEND_API_KEY && someChannelSent) {
    try {
      await sendAutoAcknowledgment(data)
      channels.autoAck = 'sent'
    } catch (err) {
      channels.autoAck = 'failed'
      errors.push(`Auto-ack: ${(err as Error).message}`)
      console.error('[fgo-quote-submit] Auto-ack failed:', err)
    }
  }

  // The form succeeds if at least one delivery channel sent the lead, OR if
  // no delivery channels are configured at all (dev mode — don't punish the
  // user). A half-configured channel marked 'failed' above is NOT "skipped",
  // so it correctly fails the submission instead of passing as dev mode.
  const noChannelsConfigured =
    channels.hubspot === 'skipped' && channels.resend === 'skipped'

  // F-014: in production that dev-mode branch is silent lead loss. Note this
  // handler is the most exposed of the three — HUBSPOT_FGO_FORM_ID is
  // deliberately unset until the portal form exists, so Resend is often the
  // only live channel here.
  if (noChannelsConfigured) {
    if (process.env.NODE_ENV === 'production') {
      const msg =
        'No lead delivery channel is configured (HubSpot and Resend both absent) — refusing to report success and drop the lead.'
      console.error('[fgo-quote-submit]', msg)
      return { ok: false, channels, errors: [...errors, msg] }
    }
    console.log('[fgo-quote-submit] No backend channels configured — logging:', data)
  }

  return { ok: someChannelSent || noChannelsConfigured, channels, errors }
}

/**
 * Map the FGO qualifier onto HubSpot contact properties via the Forms API.
 *
 * Uses a DEDICATED form id (HUBSPOT_FGO_FORM_ID) so qualifiers route into
 * their own HubSpot pipeline rather than mixing with productized leads.
 * HubSpot silently ignores unknown property names, so the `fgo_*` properties
 * are safe to send even before they're created in the portal — they'll start
 * populating the moment the operator adds them.
 */
async function postToHubSpot(data: FgoQuoteData) {
  const url =
    `https://api.hsforms.com/submissions/v3/integration/submit/` +
    `${process.env.HUBSPOT_PORTAL_ID}/${process.env.HUBSPOT_FGO_FORM_ID}`

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
    .join('; ')

  const fields = [
    { objectTypeId: '0-1', name: 'firstname', value: data.fullName.split(' ')[0] },
    { objectTypeId: '0-1', name: 'lastname',  value: data.fullName.split(' ').slice(1).join(' ') },
    { objectTypeId: '0-1', name: 'email',     value: data.email },
    ...(data.phone ? [{ objectTypeId: '0-1', name: 'phone', value: data.phone }] : []),
    ...(data.website ? [{ objectTypeId: '0-1', name: 'website', value: data.website }] : []),
    // FGO-specific properties (create these in the portal to start capturing).
    { objectTypeId: '0-1', name: 'fgo_shape',                value: shape },
    { objectTypeId: '0-1', name: 'fgo_services',             value: services },
    { objectTypeId: '0-1', name: 'fgo_revenue_band',         value: revenue },
    { objectTypeId: '0-1', name: 'fgo_headcount_band',       value: headcount },
    { objectTypeId: '0-1', name: 'fgo_marketing_spend_band', value: spend },
    ...(data.bestTime
      ? [{ objectTypeId: '0-1', name: 'fgo_best_time', value: data.bestTime }]
      : []),
    ...(data.notes
      ? [{ objectTypeId: '0-1', name: 'fgo_notes', value: data.notes }]
      : []),
  ]

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields,
      context: {
        pageUri: data.pageSource ?? 'https://salesolution.net/full-growth-quote/',
      },
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`HubSpot ${res.status}: ${detail.slice(0, 200)}`)
  }
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

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'connect@salesolution.net',
    to: process.env.RESEND_TO_EMAIL!,
    subject,
    text,
  })
  // F-031: the SDK resolves with { data, error } rather than throwing.
  if (error) throw new Error(`${error.name}: ${error.message}`)
}

/**
 * Auto-acknowledgment to the submitter. This is the load-bearing promise of
 * the whole FGO pitch (spec §3.5): the form is short, the reply is personal,
 * and the submitter hears back within 24 business hours. The auto-ack
 * confirms receipt immediately so the 24h window doesn't read as silence.
 *
 * Tone matches the site: no drip sequence, no SDR loop, just "got it, here's
 * what happens next." The optional calendar link lets an impatient buyer
 * self-book rather than wait for the personal reply.
 */
async function sendAutoAcknowledgment(data: FgoQuoteData) {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY!)

  const firstName = data.fullName.trim().split(/\s+/)[0] || 'there'
  const calendarUrl =
    process.env.FGO_CALENDAR_URL ?? process.env.NEXT_PUBLIC_CALENDLY_URL ?? ''

  const lines = [
    `Hi ${firstName},`,
    '',
    'Thanks for the Full Growth Ownership qualifier — it landed with me directly, not a shared inbox.',
    '',
    "Here's what happens next:",
    '',
    '  1. I read it personally (no SDR loop, no drip sequence).',
    '  2. Within 24 business hours you get a 1-page written diagnostic and a suggested call time.',
    '  3. If we fit, a written SOW follows within 48 hours of that call — shape, scope, price, exit terms.',
    '',
    calendarUrl
      ? `If you'd rather not wait, you can grab a 30-minute slot here: ${calendarUrl}`
      : "If anything's time-sensitive, just reply to this email and tell me.",
    '',
    '— Artur Shepel',
    'Founder, Sale Solution',
    'salesolution.net/services/full-growth-ownership/',
  ]

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'connect@salesolution.net',
    to: data.email,
    replyTo: process.env.RESEND_TO_EMAIL ?? 'connect@salesolution.net',
    subject: 'Got your Full Growth Ownership qualifier — personal reply within 24h',
    text: lines.join('\n'),
  })
  // F-031: the SDK resolves with { data, error } rather than throwing.
  if (error) throw new Error(`${error.name}: ${error.message}`)
}
