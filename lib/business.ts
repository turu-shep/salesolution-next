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
 * Legal identity, address, and inbound email were confirmed by the founder
 * on 2026-07-26 (closes F-04 / D-26). The values below are the only ones
 * that may appear on a rendered surface.
 */

export const business = {
  // Display brand (wordmark, titles, schema `name`). The "Sale Solution" vs
  // "Salesolution" spelling call is still open — F-17. Don't change it here
  // without that decision.
  name: 'Sale Solution',
  // Registered entity. Founder-confirmed 2026-07-26. Renders in the footer
  // copyright and anchors every legal page. Legal pages compose the full
  // sentence from these two: `{legalName}, a Florida limited liability
  // company, doing business as {dba}`.
  legalName: 'IT Sale Solution LLC',
  dba: 'Salesolution',
  // Multi-vertical positioning (set 2026-06-18). Canonical value only — not yet
  //   rendered: wire into Organization JSON-LD (lib/schema.ts `slogan`) / metadata to surface it.
  tagline: 'Revenue systems for businesses that sell parts, book jobs, and fill chairs.',
  url: 'https://salesolution.net',

  // The only address. Founder-confirmed 2026-07-26, unit included.
  // Historical variants that still exist off-repo (Google Business Profile,
  // the old WP site, directory listings) must be corrected to match this.
  address: {
    street: '17071 W Dixie Hwy, PH42',
    city: 'North Miami Beach',
    region: 'FL',
    postalCode: '33160',
    country: 'US',
  },

  phone: '+1-561-531-4339',
  phoneDisplay: '561-531-4339',

  // Single public inbound address. Founder-confirmed 2026-07-26: connect@ is
  // the only address that may appear on a rendered surface. The former
  // leads@ alias is retired from the site — if the mailbox still exists it
  // should forward here.
  emails: {
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
