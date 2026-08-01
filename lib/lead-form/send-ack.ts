import 'server-only'

import { business } from '@/lib/business'

import { buildAck } from './ack-copy.mjs'

/**
 * Sends the prospect acknowledgment built by ack-copy.mjs (F-02).
 *
 * One sender for every funnel so the from-address fallback, the reply-to, and
 * the failure semantics can't drift per pipeline. Copy lives in the pure
 * module; this file is the only part that touches the network.
 *
 * Two rules the callers must honor, both learned from the FGO ack
 * (lib/lead-form/full-growth-quote-submit.ts):
 *
 *   1. **Gate on capture.** Only call this once a delivery channel actually
 *      took the lead. Acknowledging a lead nobody received is worse than
 *      silence — the prospect waits on a promise no one can keep.
 *   2. **Never gate submission on it.** A failed ack is logged and recorded,
 *      not surfaced as a form error. The lead is already safe.
 *
 * Missing RESEND_API_KEY = the caller skips this entirely (graceful
 * degradation: the form still succeeds, the miss is logged).
 */

export type AckChannel =
  | 'lead_magnet'
  | 'audit'
  | 'catalog_snapshot'
  | 'sprint'
  | 'strategy_call'
  | 'contact'
  | 'revenue_leak_audit'

/** The instantly-delivered asset. GATE:HUMAN — founder QA before deploy. */
export const CHECKLIST_URL = `${business.url}/checklists/ai-search-survival/`

/** Where "one click to unsubscribe" points. */
export const PREFERENCES_URL = `${business.url}/communication-preferences/`

export async function sendAck(
  channel: AckChannel,
  to: string,
  extras: { fullName?: string } = {},
): Promise<void> {
  // Dynamic import keeps the SDK out of any client bundle (same as submit.ts).
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY!)

  const { subject, text } = buildAck(channel, {
    business,
    fullName: extras.fullName,
    checklistUrl: CHECKLIST_URL,
    preferencesUrl: PREFERENCES_URL,
  })

  const { error } = await resend.emails.send({
    // Post-identity-sweep the canonical public address is connect@ — the same
    // fallback every other sender in this directory uses.
    from: process.env.RESEND_FROM_EMAIL ?? 'connect@salesolution.net',
    to,
    replyTo: process.env.RESEND_TO_EMAIL ?? business.emails.general,
    subject,
    text,
  })
  // F-031: the SDK resolves with { data, error } rather than throwing.
  if (error) throw new Error(`${error.name}: ${error.message}`)
}
