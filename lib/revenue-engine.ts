/**
 * Shared data SHAPE for the Revenue Engine plan (CAPTURE → RESPOND → BOOK →
 * RECOVER → PROVE), grouped under Bring / Convert / Retain.
 *
 * Only the data shape is shared, not the prose. The cross-vertical product page
 * (`/revenue-engine/`) uses the vertical-agnostic copy below ("booked work,"
 * "the whole sale"); each niche page keeps its own trade-specific strings
 * ("roofs," "patients") inline. Identical strings across product + niche on a
 * low-authority domain risk Google collapsing the pages, so the prose diverges
 * by design — see docs/strategy/multi-vertical-pivot/06-product-page-and-nav-plan.md §1.3.
 */
import type { PillarGroup, Step } from '@/components/sections/revenue-engine/PlanByPillar'

export type { PillarGroup, Step }

/** Vertical-agnostic plan content for the product page. No trade nouns. */
export const PRODUCT_PILLAR_GROUPS: PillarGroup[] = [
  {
    pillar: 'Bring',
    outcome: 'Get found when they’re looking',
    steps: [
      {
        key: 'Capture',
        what: 'Show up in Google, Maps, and AI answers when someone nearby looks for what you do — with an easy way to reach you right there. New demand, pointed at your door instead of a competitor’s.',
        metric: 'More of the right searches turn into inquiries',
      },
    ],
  },
  {
    pillar: 'Convert',
    outcome: 'Win the ones who reach you',
    steps: [
      {
        key: 'Respond',
        what: 'Every call answered around the clock, even when your team is heads-down. Missed calls get an instant text back, forms get a reply in under a minute, and a caller can always reach a human.',
        metric: 'No sale lost to a missed call or a slow reply',
      },
      {
        key: 'Book',
        what: 'Inquiries qualified and booked straight into your calendar, with reminders so they show. Every call recorded and sorted, so nothing slips between the cracks.',
        metric: 'More of the demand you already have turns into booked work',
      },
    ],
  },
  {
    pillar: 'Retain',
    outcome: 'Bring them back',
    steps: [
      {
        key: 'Recover',
        what: 'Quotes and plans that went quiet get chased automatically, past customers get a reason to return, and a steady stream of reviews lifts you in local search.',
        metric: 'Revenue won back from work you already earned',
      },
    ],
  },
]

export const PRODUCT_PILLAR_PROVE: Step = {
  key: 'Prove',
  what: 'A dispute-proof log of every call, and a monthly dashboard that shows what the system brought in — on its own line, separate from your ads.',
  metric: 'What the system earned, on its own line',
}

/**
 * The cylinders, grouped by the job they fire in the engine (Bring / Convert /
 * Retain). Built ones carry a `slug` and deep-link to /services/{slug}/; the
 * rest are listed without a slug (no link, "Coming soon") until their page
 * exists — see the catalog-expansion decision (2026-06-29). The product page
 * names and describes them; it does not target their head keywords (those
 * belong to the service pages).
 */
export type Cylinder = { name: string; fires: string; slug?: string }
export type CylinderGroup = { pillar: string; job: string; cylinders: Cylinder[] }

export const CYLINDER_GROUPS: CylinderGroup[] = [
  {
    pillar: 'Bring',
    job: 'Get found',
    cylinders: [
      {
        name: 'AI Search & GEO',
        fires: 'Gets you named inside Google’s AI answers and ChatGPT when a buyer asks who to use.',
        slug: 'ai-seo',
      },
      {
        name: 'Catalog AI',
        fires: 'Rewrites your product data so search and AI can actually read and surface what you sell.',
        slug: 'catalog-ai',
      },
      {
        name: 'Editorial Authority',
        fires: 'Publishes the pages that earn citations and answer the questions your buyers ask first.',
        slug: 'editorial-authority',
      },
      {
        name: 'Outbound Email',
        fires: 'Reaches the buyers who never came inbound with hand-built lists and reply-first sequences.',
        slug: 'outbound-email-marketing-services',
      },
      {
        name: 'Local SEO & Maps',
        fires: 'Wins the map pack and “near me” searches: the Google Business Profile and local pages that put you first in your area.',
        slug: 'local-seo-maps',
      },
      {
        name: 'Paid Acquisition',
        fires: 'Paid search and social on your own account, at cost, zero markup — one input, judged on cost per booked job.',
        slug: 'paid-acquisition',
      },
    ],
  },
  {
    pillar: 'Convert',
    job: 'Win the sale',
    cylinders: [
      {
        name: 'Website Development',
        fires: 'Builds the fast, search-ready site that turns a visit into a quote request or a call.',
        slug: 'website-development-design-services',
      },
      {
        name: 'Answer & Book',
        fires: 'Answers every call around the clock, texts back the missed ones in seconds, and books the job straight onto the calendar.',
        slug: 'answer-and-book',
      },
      {
        name: 'Conversion & CRO',
        fires: 'Tightens the path from interested to booked — the quote, the checkout, the follow-up that stops ready buyers slipping away.',
        slug: 'conversion-cro',
      },
    ],
  },
  {
    pillar: 'Retain',
    job: 'Keep it running',
    cylinders: [
      {
        name: 'Recover & Reactivate',
        fires: 'Chases the quotes and estimates that went quiet, and wins back the dormant customer list you already paid to build.',
        slug: 'recover-reactivate',
      },
      {
        name: 'Reviews & Reputation',
        fires: 'Turns happy customers into a steady stream of reviews that close the next buyer and lift you in local search.',
        slug: 'reviews-reputation',
      },
      {
        name: 'Full Growth Ownership',
        fires: 'One operator owns the whole loop, reads the two revenue lines, and re-aims the weakest part each cycle.',
        slug: 'full-growth-ownership',
      },
    ],
  },
]
