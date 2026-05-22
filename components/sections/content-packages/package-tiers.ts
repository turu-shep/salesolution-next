/**
 * Data-only export for the content-package tiers. Lives outside
 * [PackagesGrid.tsx](./PackagesGrid.tsx) so it stays importable from server
 * components — the grid module itself is `'use client'` (it now wires
 * `pricing_tier_view` viewport tracking) and a server-side import of a
 * client module would give back a client-reference proxy, not the array.
 *
 * Five fixed tiers: one trial / single-article entry, plus four monthly
 * retainers (Niche → Excelsior). Vanguard is the highlighted "most popular"
 * tier — it's the cleanest entry point for a serious content programme.
 */

export type PackageTier = {
  key: string
  name: string
  tagline: string
  price: string
  cadence: string
  bestFor: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  highlight?: boolean
}

export const PACKAGE_TIERS: PackageTier[] = [
  {
    key: 'trial',
    name: "Let's Give It a Try",
    tagline: 'Single article · trial',
    price: '$500',
    cadence: 'per article',
    bestFor: 'You want a writing sample before committing to a monthly cadence.',
    features: [
      'One 2,500-word article',
      'Brand-voice + tone onboarding',
      'Optional custom graphic',
      'Single revision included',
      'Delivered in 7 business days',
    ],
    ctaLabel: 'Order a single piece',
    ctaHref: '/book-growth-call/',
  },
  {
    key: 'niche',
    name: 'Niche',
    tagline: 'Single-vertical authority',
    price: '$2,400',
    cadence: '/ month',
    bestFor: 'A single product line or vertical you want to dominate in 6–9 months.',
    features: [
      'Four 3,000-word articles / month',
      'Custom graphics included ($400 value)',
      'Monthly topic + keyword research',
      'Two revisions per article',
      'Editorial style guide built for you',
    ],
    ctaLabel: 'Choose Niche',
    ctaHref: '/book-growth-call/',
  },
  {
    key: 'vanguard',
    name: 'Vanguard',
    tagline: 'Authority + pillar coverage',
    price: '$4,000',
    cadence: '/ month',
    highlight: true,
    bestFor: 'You sell across 2–3 categories and need both depth pieces and pillar coverage.',
    features: [
      '2 × 3,000-word + 2 × 4,500-word articles',
      'Bi-monthly 6,000-word pillar page',
      'Custom graphics + diagrams ($700 value)',
      'Monthly editorial review call',
      'Internal-linking + cluster planning',
      'SERP + AIO citation tracking',
    ],
    ctaLabel: 'Choose Vanguard',
    ctaHref: '/book-growth-call/',
  },
  {
    key: 'domination',
    name: 'Way to Domination',
    tagline: 'Topical authority at scale',
    price: '$7,500',
    cadence: '/ month',
    bestFor: 'You compete in a crowded vertical and need topical-authority firepower.',
    features: [
      '4 × 2,500-word + 4 × 4,500-word articles',
      'One 7,000-word pillar page / month',
      'Editorial + technical SEO included ($2,000 value)',
      'Weekly editorial sync',
      'Competitive content-gap analysis',
      'Internal author + reviewer credentials',
    ],
    ctaLabel: 'Choose Domination',
    ctaHref: '/book-growth-call/',
  },
  {
    key: 'excelsior',
    name: 'Excelsior',
    tagline: 'Category leadership',
    price: '$15,000',
    cadence: '/ month',
    bestFor: 'You’re positioning for category leadership and need a full editorial team.',
    features: [
      '8 × 2,500-word + 8 × 4,500-word articles',
      'Three 8,000-word pillars / month',
      'Full editorial + strategist team ($4,000 value)',
      'Weekly + bi-weekly sprints',
      'Dedicated managing editor',
      'Quarterly content-strategy offsite',
    ],
    ctaLabel: 'Choose Excelsior',
    ctaHref: '/book-growth-call/',
  },
]
