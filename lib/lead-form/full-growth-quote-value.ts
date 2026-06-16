/**
 * Lead-value model for Full Growth Ownership qualifiers.
 *
 * Shared by the client form ([components/forms/FullGrowthQuoteForm.tsx])
 * and the server route ([app/api/full-growth-quote/route.ts]) so the
 * `generate_lead` `value` is identical on both the client gtag hit and the
 * server Measurement-Protocol failsafe (they dedup on `transaction_id`).
 *
 * FGO sits ABOVE every productized lead in the taxonomy — a qualified
 * fractional-GTM / coordinated-retainer buyer is worth far more than an
 * audit or snapshot request (catalog_snapshot = 300, audit = 80–900). The
 * values below are a deliberate first-pass model scaled by ARR band; tune
 * once enough qualifiers close to know the real shape→SOW→close economics.
 * See docs/strategy/ga4.md and docs/strategy/full-growth-ownership/.
 */

const FGO_VALUE_BY_REVENUE: Record<string, number> = {
  'under-2m': 600,
  '2-5m': 1200,
  '5-10m': 2000,
  '10-25m': 2800,
  '25m-plus': 3500,
}

/** Default when the revenue band is missing/unknown — the lowest band. */
const FGO_VALUE_FALLBACK = 600

export function fgoLeadValue(revenueBand: string | undefined): number {
  if (!revenueBand) return FGO_VALUE_FALLBACK
  return FGO_VALUE_BY_REVENUE[revenueBand] ?? FGO_VALUE_FALLBACK
}
