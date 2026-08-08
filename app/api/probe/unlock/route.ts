/**
 * POST /api/probe/unlock — email capture that unlocks the AI read's
 * remaining runs (see lib/probe/gate.mjs for the policy).
 *
 * The lead lands best-effort in the existing channels: HubSpot (email-only
 * form submission, tagged with the scored URL as page context) and a Resend
 * notification. Neither failing blocks the unlock — the email was given in
 * good faith; losing the visitor over our plumbing would be worse.
 */
import { NextRequest, NextResponse } from 'next/server'

import { clientIp, incrCounter, readGate, writeGate } from '@/lib/probe/gate-server'
import { consume } from '@/lib/probe/limits.mjs'
import { isSameOrigin } from '@/lib/same-origin'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[a-z]{2,24}$/i

export async function POST(req: NextRequest) {
  // F-019: see lib/same-origin.ts — Next does not do this for Route Handlers.
  // Matters here because this route writes a contact into the CRM.
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }
  const body = (typeof raw === 'object' && raw !== null ? raw : {}) as {
    email?: unknown
    scoredUrl?: unknown
  }
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const scoredUrl = typeof body.scoredUrl === 'string' ? body.scoredUrl.slice(0, 500) : ''
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const limit = await consume('unlock', clientIp(req), incrCounter)
  if (!limit.ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  await Promise.allSettled([sendToHubSpot(email, scoredUrl), notifyViaResend(email, scoredUrl)])

  const gate = readGate(req)
  const res = NextResponse.json({ ok: true })
  writeGate(res, { runs: gate.runs, unlocked: true })
  return res
}

async function sendToHubSpot(email: string, scoredUrl: string): Promise<void> {
  const portal = process.env.HUBSPOT_PORTAL_ID
  const form = process.env.HUBSPOT_FORM_ID
  if (!portal || !form) return
  await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${portal}/${form}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: [{ objectTypeId: '0-1', name: 'email', value: email }],
      context: {
        pageUri: 'https://salesolution.net/ai-readiness/',
        pageName: `AI-Readiness probe unlock — ${scoredUrl || 'unknown target'}`,
      },
    }),
    signal: AbortSignal.timeout(5000),
  })
}

async function notifyViaResend(email: string, scoredUrl: string): Promise<void> {
  const key = process.env.RESEND_API_KEY
  const to = process.env.RESEND_TO_EMAIL
  if (!key || !to) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? 'connect@salesolution.net',
      to,
      subject: `Probe unlock: ${email}`,
      text: `${email} unlocked the AI read${scoredUrl ? ` while scoring ${scoredUrl}` : ''}.\nSource: probe_v2 (AI-readiness report page).\nNote: email is UNVERIFIED — gate capture, not a confirmed form submission.`,
    }),
    signal: AbortSignal.timeout(5000),
  })
}
