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
  // ⚠ STALE: industrial-only, predates the multi-vertical pivot (open TODO — owner
  //   decision). See AGENTS.md → Landmines and docs/strategy/multi-vertical-pivot/.
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
    // Canonical page for the founder entity (Person @id lives here).
    url: 'https://salesolution.net/about/',
    // Headshot in /public. Used for Person.image (absolute URL built in schema)
    // and the /about portrait.
    image: '/artur-shepel.jpg',
    // One factual paragraph — reused for the /about lede + Person schema
    // description. Sourced from the homepage Operator copy (already approved).
    bio: 'Artur Shepel is the founder of Sale Solution and an AI-growth strategist with 14 years operating growth across industrial distribution, home services, and dental. He builds and runs the AI-search, catalog, and content systems for technical B2B and e-commerce teams — and tells clients which constraint to fix first.',
    // Personal profiles → the Person entity's sameAs (entity disambiguation).
    profiles: {
      linkedin: 'https://www.linkedin.com/in/artur-shepel/',
      youtube: 'https://www.youtube.com/channel/UCX7raLyA9B1L167Y2bHLTPg',
      instagram: 'https://www.instagram.com/arthur.shepel/',
      twitter: 'https://x.com/ArturShepel',
    },
    // Expertise areas → Person.knowsAbout.
    knowsAbout: [
      'Generative engine optimization',
      'AI search',
      'Search engine optimization',
      'Technical SEO',
      'Industrial e-commerce',
      'Citation engineering',
      'B2B content strategy',
    ],
  },
} as const

export type Business = typeof business
