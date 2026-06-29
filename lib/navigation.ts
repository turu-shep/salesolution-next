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
    // Audience-led entry beside the capability-led "Services": a visitor
    // self-identifies by industry in one click. Parent is the cross-vertical
    // /industries/ index. NOTE (Phase 1): label is now "Industries"; the
    // children still point at their current live targets and repoint to the
    // /industries/{industry}/ pillars in Phase 5 (after the pillar dirs + 301s
    // exist) — see docs/strategy/multi-vertical-pivot/06-product-page-and-nav-plan.md.
    label: 'Industries',
    href: '/industries/',
    children: [
      { label: 'Industrial & Technical B2B', href: '/industries/industrial-distribution/' },
      { label: 'Medical & Aesthetics', href: '/revenue-engine/medical/' },
      { label: 'Home & Local Services', href: '/revenue-engine/home-services/' },
      { label: 'Retail & Consumer Brands', href: '/revenue-engine/local-retail/' },
    ],
  },
  { label: 'Case Studies', href: '/case-studies/' },
  // The Revenue Engine product page (what it is + how it works). Replaces the
  // mislabeled "Framework" link, which pointed at the AI Search Readiness
  // checklist — that now lives as an Insights child below.
  { label: 'The Revenue Engine', href: '/revenue-engine/' },
  {
    // "Resources" folded in here to keep the top-level bar at six items. The AI
    // Search Readiness checklist (/future-proof-your-seo/) now sits here as a
    // child instead of being top-levelled as "Framework".
    label: 'Insights',
    href: '/category/blog/',
    children: [
      { label: 'Articles', href: '/category/blog/' },
      { label: 'Guides', href: '/guides/' },
      { label: 'Learning Hub', href: '/career-paths/' },
      { label: 'Glossary', href: '/glossary/' },
      { label: 'Tools', href: '/tools/' },
      { label: 'AI Search Readiness', href: '/future-proof-your-seo/' },
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
