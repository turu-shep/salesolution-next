import { z } from 'zod'

/**
 * Validation for the AI Search Survival Checklist form (the lead magnet on
 * /future-proof-your-seo/). Separate from `leadSchema` on purpose: this door
 * asks for an email and four quiz answers, no name, no phone, no platform —
 * folding it into the productized schema would mean making five required
 * fields optional for every other funnel.
 *
 * Same split the FGO qualifier took (full-growth-quote-schema.ts): different
 * fields, different downstream commitment, its own route.
 *
 * Used by:
 *   - LeadMagnetForm (client-side via @hookform/resolvers)
 *   - /api/lead-magnet route handler (server-side)
 */

export const leadMagnetSchema = z.object({
  email: z
    .string()
    .email('Use a real email — we send the checklist instantly')
    .max(254),
  revenue: z.string().min(1, 'Pick a range').max(40),
  organicShare: z.string().min(1, 'Pick a share').max(40),
  trafficType: z.string().min(1, 'Pick a traffic type').max(40),
  timeline: z.string().min(1, 'Pick a timeframe').max(40),

  // Anti-spam / context. Never rendered back to the user.
  turnstileToken: z.string().optional(),
  pageSource: z.string().max(2048).optional(),
})

export type LeadMagnetData = z.infer<typeof leadMagnetSchema>
