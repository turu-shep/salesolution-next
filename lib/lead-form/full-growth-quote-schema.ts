import { z } from 'zod'

/**
 * Full Growth Ownership qualifier — single source of truth.
 *
 * Used client-side via @hookform/resolvers and server-side by
 * /api/full-growth-quote/. Per spec §3 the form has three logical
 * blocks: Q1 (shape), Q2 (services, multi-select), Q3 (context).
 */

export const FGO_SHAPES = [
  { value: 'fractional', label: 'One operator running my entire growth function (Shape A)' },
  { value: 'retainer',   label: 'Coordinated execution across our services (Shape B)' },
  { value: 'unsure',     label: "Not sure — I'd like to discuss both" },
] as const

export const FGO_SERVICES = [
  { value: 'ai-search', label: 'AI Search & GEO' },
  { value: 'editorial', label: 'Editorial content & authority' },
  { value: 'catalog',   label: 'Catalog AI (product page rewrite at scale)' },
  { value: 'dev',       label: 'Website development or replatform' },
  { value: 'outbound',  label: 'Outbound email program' },
  { value: 'unsure',    label: 'Not sure — would like guidance' },
] as const

export const FGO_REVENUE_RANGES = [
  { value: 'under-2m',  label: 'Under $2M' },
  { value: '2-5m',      label: '$2–5M' },
  { value: '5-10m',     label: '$5–10M' },
  { value: '10-25m',    label: '$10–25M' },
  { value: '25m-plus',  label: '$25M+' },
] as const

export const FGO_HEADCOUNT_RANGES = [
  { value: '0',     label: '0 — no in-house growth lead' },
  { value: '1-2',   label: '1–2' },
  { value: '3-5',   label: '3–5' },
  { value: '6-plus', label: '6+' },
] as const

export const FGO_SPEND_RANGES = [
  { value: 'under-5k', label: 'Under $5K / mo' },
  { value: '5-15k',    label: '$5–15K / mo' },
  { value: '15-30k',   label: '$15–30K / mo' },
  { value: '30k-plus', label: '$30K+ / mo' },
] as const

export const fgoQuoteSchema = z.object({
  // Q1
  shape: z.enum(['fractional', 'retainer', 'unsure'], {
    message: 'Pick the shape that fits',
  }),

  // Q2 — multi-select, at least one
  services: z
    .array(z.enum(['ai-search', 'editorial', 'catalog', 'dev', 'outbound', 'unsure']))
    .min(1, 'Pick at least one'),

  // Q3 — context
  website: z
    .union([z.string().url('Use the full URL with https://'), z.literal('')])
    .optional(),
  revenue: z.string().min(1, 'Pick a revenue range'),
  headcount: z.string().min(1, 'Pick a headcount range'),
  marketingSpend: z.string().min(1, 'Pick a spend range'),
  notes: z.string().max(2000).optional(),

  // Contact
  fullName: z.string().min(2, 'Please share your name').max(120),
  email: z.string().email('Use a real email — we reply within 24 hours'),
  phone: z
    .union([z.string().min(7, 'Phone number looks too short').max(40), z.literal('')])
    .optional(),
  bestTime: z.string().max(120).optional(),

  // Anti-spam / context — never rendered back to the user.
  turnstileToken: z.string().optional(),
  pageSource: z.string().optional(),
  gaClientId: z.string().optional(),
  submissionId: z.string().uuid().optional(),
})

export type FgoQuoteData = z.infer<typeof fgoQuoteSchema>
