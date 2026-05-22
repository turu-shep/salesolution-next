import 'server-only'

/**
 * Server-side GA4 Measurement Protocol failsafe.
 *
 * The client-side `gtag` call from [lib/analytics.ts](./analytics.ts) is fragile —
 * ad-blockers, broken JS, or flaky networks all silently drop it. The server
 * already knows when /api/lead/ succeeds, so we fire a parallel hit here as a
 * backstop. To avoid double-counting in GA4, the client and server hits carry
 * the SAME `transaction_id` (our `submissionId` UUID); GA4 dedups conversions
 * automatically when `transaction_id` matches. See docs/strategy/ga4.md §5.8.
 *
 * If either env var is missing this no-ops silently — keeps non-prod
 * environments from spamming the property.
 */

const ENDPOINT = 'https://www.google-analytics.com/mp/collect'

export async function sendServerEvent(args: {
  clientId: string // GA client_id from _ga cookie
  userId?: string // hashed email
  eventName: 'generate_lead' | 'audit_request' | 'constraint_sprint_apply' | 'book_growth_call'
  params: Record<string, unknown>
}): Promise<void> {
  const measurementId = process.env.GA4_MEASUREMENT_ID
  const apiSecret = process.env.GA4_API_SECRET
  if (!measurementId || !apiSecret) return

  const body: Record<string, unknown> = {
    client_id: args.clientId,
    events: [{ name: args.eventName, params: args.params }],
  }
  if (args.userId) body.user_id = args.userId

  // Fire-and-forget — GA4 MP returns 204 on success and doesn't surface useful
  // errors on failure, so there's nothing to await beyond the network round-trip.
  await fetch(
    `${ENDPOINT}?measurement_id=${measurementId}&api_secret=${apiSecret}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      next: { revalidate: 0 },
    },
  ).catch((err) => console.error('[GA4 MP] failed:', err))
}
