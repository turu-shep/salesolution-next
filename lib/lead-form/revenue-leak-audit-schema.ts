import { z } from 'zod'

/**
 * Validation for the Revenue Leak Audit form (local-service / Revenue Engine
 * funnel). Separate from the industrial `leadSchema` on purpose: a roofer or a
 * dental office has no "e-commerce platform" or "SKU count," and the two funnels
 * keep their lead data clean. Used by:
 *   - RevenueLeakAuditForm (client-side via @hookform/resolvers)
 *   - /api/revenue-leak-audit route handler (server-side)
 */

export const TRADES = [
  { value: 'roofing', label: 'Roofing' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'other', label: 'Other home service' },
] as const

// Home-services "Where it hurts most" — the default list.
export const LEAKS = [
  { value: 'missed-calls', label: 'Calls get missed when we’re busy' },
  { value: 'leads-ghost', label: 'We pay for leads that never call back' },
  { value: 'quotes-cold', label: 'Estimates go out and go cold' },
  { value: 'cant-tell', label: 'Can’t tell what marketing actually works' },
] as const

// Dental "Where it hurts most" — one option per pillar so the buyer can name the
// real leak (Bring / Convert / Retain×2 / Prove). Values are namespaced so the
// CRM/email label lookup stays unambiguous across verticals (see ALL_LEAKS).
export const DENTAL_LEAKS = [
  { value: 'dental-search', label: 'Patients can’t find us when they search' },
  { value: 'dental-chair-time', label: 'Calls get missed during chair time' },
  { value: 'dental-plans-cold', label: 'Treatment plans get presented, then go cold' },
  { value: 'dental-recall', label: 'Overdue recall and past patients never come back' },
  { value: 'dental-attribution', label: 'Can’t tell what marketing actually works' },
] as const

// Vertical the form was filled on. Carried in the lead data so the funnel knows
// the landing page without making the buyer pick a "trade" that doesn't fit.
export const VERTICAL_TRADES = [
  ...TRADES,
  { value: 'dental', label: 'Dental practice' },
] as const

// Flat lookups for value → label (used server-side; `?? value` fallback if missing).
export const ALL_LEAKS = [...LEAKS, ...DENTAL_LEAKS] as const

export const revenueLeakAuditSchema = z.object({
  fullName: z.string().min(2, 'Please share your name').max(120),
  phone: z.string().min(7, 'Phone number looks too short').max(40),
  company: z.string().min(2, 'What’s the business called?').max(160),
  email: z
    .union([z.string().email('Use a real email so I can send the numbers'), z.literal('')])
    .optional(),
  website: z
    .union([z.string().url('Use the full URL with https://'), z.literal('')])
    .optional(),
  trade: z.string().min(1, 'Pick your trade'),
  leak: z.string().min(1, 'Pick the one that stings most'),

  // Anti-spam / context — not user-visible. gaClientId + submissionId are GA4-only
  // and are NOT forwarded to HubSpot or Resend.
  turnstileToken: z.string().optional(),
  pageSource: z.string().optional(),
  gaClientId: z.string().optional(),
  submissionId: z.string().uuid().optional(),
})

export type RevenueLeakAuditData = z.infer<typeof revenueLeakAuditSchema>
