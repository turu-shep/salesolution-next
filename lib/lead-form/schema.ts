import { z } from 'zod'

/**
 * Single source of truth for lead-form validation. Used by:
 *   - LeadForm (client-side via @hookform/resolvers)
 *   - /api/lead route handler (server-side)
 *
 * Keep this in sync with components/forms/LeadForm.tsx — they must agree.
 */

export const leadSchema = z.object({
  fullName: z.string().min(2, 'Please share your name').max(120),
  email: z.string().email('Use a real email — we reply within 24 hours'),
  phone: z.string().min(7, 'Phone number looks too short').max(40),
  website: z
    .union([z.string().url('Use the full URL with https://'), z.literal('')])
    .optional(),
  revenue: z.string().min(1, 'Pick a range'),
  platform: z.string().min(1, 'Pick a platform'),
  frustration: z.string().min(1, 'Pick what stings most right now'),

  // Catalog Snapshot funnel only. Optional everywhere else; required on the
  // /catalog-snapshot/ form via the leadType-aware refine below.
  skuCount: z.string().optional(),

  // Anti-spam / context fields — not user-visible, never rendered back to the
  // user. `gaClientId` and `submissionId` are GA4-only (see lib/analytics-server.ts)
  // and are NOT forwarded to HubSpot or Resend.
  turnstileToken: z.string().optional(),
  pageSource: z.string().optional(),
  gaClientId: z.string().optional(),
  submissionId: z.string().uuid().optional(),
})

export type LeadFormData = z.infer<typeof leadSchema>
