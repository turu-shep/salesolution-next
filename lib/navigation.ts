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
  { label: 'Framework', href: '/future-proof-your-seo/' },
  { label: 'Insights', href: '/category/blog/' },
  {
    label: 'Resources',
    href: '/guides/',
    children: [
      { label: 'AI Search Readiness Checklist', href: '/future-proof-your-seo/' },
      { label: 'Guides', href: '/guides/' },
      { label: 'Learning Hub', href: '/career-paths/' },
    ],
  },
  { label: 'Contact', href: '/contact-me/' },
]

export const primaryCta = {
  label: 'Get Your Free Growth Audit',
  href: '/unlock-growth-audit/',
} as const

export const footerColumns = [
  {
    title: 'Learning',
    items: [
      { label: 'Insights', href: '/category/blog/' },
      { label: 'Career Paths', href: '/career-paths/' },
      { label: 'Guides', href: '/guides/' },
    ],
  },
  {
    title: 'Work with us',
    items: [
      { label: 'Services', href: '/services/' },
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
