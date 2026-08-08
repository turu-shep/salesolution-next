/**
 * Prospect acknowledgment copy — one builder per funnel, pure and testable.
 *
 * F-02: every door on the site promised a delivery ("checklist arrives
 * instantly", "diagnosis within 24 hours") while the backend sent the
 * submitter nothing. Founder policy (2026-07-27): if we already have the
 * thing, it ships instantly; if a human has to make it, the prospect gets an
 * instant acknowledgment stating the honest window, and the deliverable
 * follows. No funnel stays silent.
 *
 * This module holds the copy only — no network, no env, no React. The
 * submitters (submit.ts, submit-audit.ts, lead-magnet-submit.ts) call
 * `buildAck()` and hand the result to Resend, gated on the lead actually
 * having been captured. Plain .mjs so `node --test` covers it without a TS
 * loader (same arrangement as lib/probe/score.mjs).
 *
 * Register: transactional. Short, no marketing block anywhere except the
 * checklist email's single subscribe line — that one is a real lead magnet,
 * so the opt-in gets stated plainly instead of hidden.
 *
 * @typedef {'lead_magnet' | 'audit' | 'catalog_snapshot' | 'sprint' | 'strategy_call' | 'contact' | 'revenue_leak_audit'} AckChannel
 *
 * @typedef {Object} AckBusiness  Identity fields, passed in from lib/business.ts (the NAP SSOT).
 * @property {string} legalName
 * @property {string} dba
 * @property {{ street: string, city: string, region: string, postalCode: string }} address
 * @property {string} phoneDisplay
 * @property {{ general: string }} emails
 *
 * @typedef {Object} AckOptions
 * @property {AckBusiness} business
 * @property {string} [fullName]        Submitter's name, when the funnel collects one.
 * @property {string} [checklistUrl]    lead_magnet only — the delivered asset.
 * @property {string} [preferencesUrl]  lead_magnet only — the unsubscribe/preferences page.
 *
 * @typedef {Object} Ack
 * @property {string} subject
 * @property {string} text
 */

/** Every channel that sends an acknowledgment. Order = the order they were wired. */
export const ACK_CHANNELS = /** @type {const} */ ([
  'lead_magnet',
  'audit',
  'catalog_snapshot',
  'sprint',
  'strategy_call',
  'contact',
  'revenue_leak_audit',
])

/**
 * Which funnel a /api/lead submission came from. Derived from the page the
 * form was on — the productized schema is shared across five doors, so the
 * page is the only discriminator we have. Kept here (pure) so the route's
 * GA4 lead_type and the acknowledgment can never drift apart.
 *
 * @param {string | undefined} pageSource
 * @returns {'audit' | 'sprint' | 'strategy_call' | 'catalog_snapshot' | 'contact'}
 */
export function leadChannelFromSource(pageSource) {
  const src = pageSource ?? ''
  if (src.includes('/unlock-growth-audit/')) return 'audit'
  if (src.includes('/constraint-sprint/')) return 'sprint'
  if (src.includes('/book-growth-call/')) return 'strategy_call'
  if (src.includes('/catalog-snapshot/')) return 'catalog_snapshot'
  return 'contact'
}

/**
 * First name for the greeting. Falls back to "there" rather than an empty
 * "Hi ," — the ack reads worse broken than generic.
 *
 * @param {string | undefined} fullName
 * @returns {string}
 */
export function firstNameOf(fullName) {
  return (fullName ?? '').trim().split(/\s+/)[0] || 'there'
}

/**
 * The NAP footer line every acknowledgment carries. Built from the identity
 * SSOT so a legal-name or address change lands in the emails too.
 *
 * @param {AckBusiness} business
 * @returns {string}
 */
export function napFooterLine(business) {
  const { street, city, region, postalCode } = business.address
  return [
    `${business.legalName} d/b/a ${business.dba}`,
    `${street}, ${city}, ${region} ${postalCode}`,
    business.phoneDisplay,
    business.emails.general,
  ].join(' · ')
}

const SIGNOFF = ['— Artur Shepel', 'Founder, Sale Solution', 'salesolution.net']

/**
 * @param {AckChannel} channel
 * @param {AckOptions} options
 * @returns {Ack}
 */
export function buildAck(channel, options) {
  const first = firstNameOf(options.fullName)
  const body = BODIES[channel]
  if (!body) throw new Error(`buildAck: unknown channel "${channel}"`)
  const { subject, lines } = body(first, options)
  return {
    subject,
    text: [...lines, '', ...SIGNOFF, '', napFooterLine(options.business)].join('\n'),
  }
}

/**
 * Body builders. Each returns the subject plus the lines above the sign-off.
 *
 * @type {Record<AckChannel, (first: string, options: AckOptions) => { subject: string, lines: string[] }>}
 */
const BODIES = {
  // ── Instant delivery. The asset exists, so it ships now, not "within X". ──
  lead_magnet: (_first, o) => ({
    subject: 'Your AI Search Survival Checklist',
    lines: [
      'Here it is:',
      '',
      o.checklistUrl ?? '',
      '',
      'Sixty checks across four sections — schema, content structuring, citation engineering, authority and monitoring — with a scoring sheet at the end, so you finish with a number instead of a feeling. An hour is enough. Print it or work through it on screen.',
      '',
      o.preferencesUrl
        ? `You'll also get the occasional note worth reading — one click to unsubscribe: ${o.preferencesUrl}`
        : "You'll also get the occasional note worth reading — one click to unsubscribe.",
    ],
  }),

  // ── Human-made deliverables. Instant ack, honest window. ──
  audit: (first) => ({
    subject: 'Got it — your Growth Audit is in motion',
    lines: [
      `Hi ${first},`,
      '',
      'Your site is in the queue and the crawl starts today.',
      '',
      'Within 24 hours you get the written diagnosis: six findings ranked by what they cost you, with one flagged as the constraint — the thing to fix before anything else pays back. Written in plain words, not a jargon dump.',
      '',
      'Reply lands with me directly.',
    ],
  }),

  catalog_snapshot: (first) => ({
    subject: 'Snapshot request received — PDF within 2 business days',
    lines: [
      `Hi ${first},`,
      '',
      'Here is what happens next.',
      '',
      'We crawl your catalog, pick five products, and rewrite them both ways: the version a buyer reads and the version an AI engine can quote. The dual-version PDF and the findings land in your inbox within 2 business days.',
      '',
      'If you want specific SKUs in the five, reply with them.',
    ],
  }),

  sprint: (first) => ({
    subject: 'Application received — answer within 24 hours',
    lines: [
      `Hi ${first},`,
      '',
      'Your Constraint Sprint application is in. You get an answer within 24 hours either way.',
      '',
      'One of two emails follows: a calendar link to scope the sprint, or a candid note on why now is not the time, with a referral to someone who fits it better.',
    ],
  }),

  strategy_call: (first) => ({
    subject: 'Call request received',
    lines: [
      `Hi ${first},`,
      '',
      'Proposed times follow within a few hours, same business day.',
      '',
      'Take whichever slot works, or reply with a window that suits you better.',
    ],
  }),

  contact: (first) => ({
    subject: 'Got your message',
    lines: [
      `Hi ${first},`,
      '',
      'It lands with Artur, not a queue.',
      '',
      'You get a reply within one business day. If it is time-sensitive, say so on this thread and it moves up.',
    ],
  }),

  // First person: this funnel is the founder's own, and the audit is his work.
  revenue_leak_audit: (first) => ({
    subject: 'Got your numbers — audit underway',
    lines: [
      `Hi ${first},`,
      '',
      'I pull your missed-call, reply-speed, and follow-up data and come back within one business day with the dollar figure and the one fix with the highest payback. No pitch.',
      '',
      'If anything changed since you filled the form, reply here and I will work from the new numbers.',
    ],
  }),
}
