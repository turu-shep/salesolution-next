/**
 * Site navigation tree. Mirrors the live site's information architecture
 * (extracted in docs/strategy/02-information-architecture.md).
 *
 * This stays in code as the static fallback. Once Sanity `siteSettings` is
 * populated, the site layout reads from there first and falls back to this.
 */

export type NavChild = { label: string; href: string }
export type NavItem = { label: string; href: string; children?: NavChild[] }

export const primaryNav: NavItem[] = [
  { label: 'Services', href: '/services/' },
  {
    // Audience-led entry, sitting beside the capability-led "Services" so a
    // visitor can self-identify by industry in one click. Parent is the
    // cross-vertical /industries/ index; each child routes to its own hub
    // (industrial proof-led page; the Revenue Engine verticals to their
    // tailored offer pages), keeping the two funnels separate.
    label: 'Who We Serve',
    href: '/industries/',
    children: [
      { label: 'Industrial & Technical B2B', href: '/industries/industrial-distribution/' },
      { label: 'Medical & Aesthetics', href: '/revenue-engine/medical/' },
      { label: 'Home & Local Services', href: '/revenue-engine/home-services/' },
      { label: 'Retail & Consumer Brands', href: '/revenue-engine/local-retail/' },
    ],
  },
  { label: 'Case Studies', href: '/case-studies/' },
  { label: 'Framework', href: '/future-proof-your-seo/' },
  {
    // "Resources" folded in here to keep the top-level bar at six items once
    // "Who We Serve" was added (the AI Search Readiness Checklist lived at
    // /future-proof-your-seo/, already top-levelled as "Framework").
    label: 'Insights',
    href: '/category/blog/',
    children: [
      { label: 'Articles', href: '/category/blog/' },
      { label: 'Guides', href: '/guides/' },
      { label: 'Learning Hub', href: '/career-paths/' },
      { label: 'Glossary', href: '/glossary/' },
      { label: 'Tools', href: '/tools/' },
    ],
  },
  { label: 'Contact', href: '/contact-me/' },
]

export const primaryCta = {
  label: 'Book a Growth Call',
  href: '/book-growth-call/',
} as const

export const footerColumns = [
  {
    title: 'Learning',
    items: [
      { label: 'Insights', href: '/category/blog/' },
      { label: 'Career Paths', href: '/career-paths/' },
      { label: 'Glossary', href: '/glossary/' },
      { label: 'Tools', href: '/tools/' },
      { label: 'Guides', href: '/guides/' },
    ],
  },
  {
    title: 'Work with us',
    items: [
      { label: 'Services', href: '/services/' },
      { label: 'Case Studies', href: '/case-studies/' },
      { label: 'About', href: '/about/' },
      { label: 'Book a strategy call', href: '/book-growth-call/' },
      { label: 'Contact', href: '/contact-me/' },
    ],
  },
] as const

export const legalLinks: NavChild[] = [
  { label: 'Privacy Policy', href: '/privacy-policy/' },
  { label: 'Terms of Service', href: '/terms-of-service/' },
  { label: 'Disclaimer', href: '/disclaimer/' },
  { label: 'Opt-out Preferences', href: '/opt-out-preferences/' },
]
