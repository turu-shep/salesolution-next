/**
 * Single source of truth for business identity (NAP) + social presence.
 *
 * Anywhere the site renders the address, phone, or socials — footer,
 * Organization JSON-LD, contact page, schema markup — pulls from here.
 *
 * Once Sanity is fully wired, this becomes a fallback for the
 * `siteSettings` singleton. The Sanity values win at runtime; these stay
 * in code for build-time SSG and for the `lib/schema.ts` JSON-LD builder.
 *
 * ⚠ The canonical address is BLOCKED on locked-decision D5 (see
 *   docs/strategy/12-execution-roadmap.md). Three different addresses appear
 *   on the live site today. Update the `address` block + Google Business
 *   Profile when the decision is made.
 */

export const business = {
  name: 'Sale Solution',
  legalName: 'Sale Solution',
  tagline: 'AI-Driven SEO for Technical B2B & Industrial E-commerce',
  url: 'https://salesolution.net',

  // D5 locked 2026-05-19. The other two addresses on the live site
  // (200 Kings Point Dr · Sunny Isles Beach + Suite 1107 variant) are wrong
  // and need to be swept from the WP site + Google Business Profile at cutover.
  address: {
    street: '17071 W Dixie Hwy',
    city: 'North Miami Beach',
    region: 'FL',
    postalCode: '33160',
    country: 'US',
  },

  phone: '+1-561-531-4339',
  phoneDisplay: '561-531-4339',

  emails: {
    leads: 'leads@salesolution.net',
    general: 'connect@salesolution.net',
  },

  social: {
    facebook: 'https://facebook.com/salesolution.10x',
    twitter: 'https://x.com/ArturShepel',
    linkedin: 'https://linkedin.com/company/sale-solution',
  },

  founder: {
    name: 'Artur Shepel',
    role: 'Founder & AI-Growth Strategist',
  },
} as const

export type Business = typeof business
