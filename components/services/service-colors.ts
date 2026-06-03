/**
 * Service identity color map.
 *
 * Per the shared system reference (00-shared-system-reference.md §2):
 * five services + one composite. Colors appear in accent strips, tier-card
 * top borders, color dots, and divider lines only — NEVER in body text,
 * headings, primary CTAs, or form fields.
 *
 * The tokens themselves live in app/globals.css under @theme. This file is
 * the typed registry that components reference when they need a named slot.
 */

export type ServiceKey =
  | 'search'
  | 'catalog'
  | 'editorial'
  | 'dev'
  | 'outbound'
  | 'composite'

export type ServiceMeta = {
  /** Display name used in cross-link callouts. */
  name: string
  /** Canonical href, trailing slash per Next config. */
  href: string
  /** Eyebrow / one-line value statement. */
  oneLiner: string
  /** Tailwind className for the 500-weight accent (bg-, border-, text-). */
  // We expose individual className helpers below rather than a single token —
  // Tailwind v4 generates utilities from @theme vars at build time, so the
  // strings must appear literally in source for the JIT to pick them up.
}

export const SERVICES: Record<Exclude<ServiceKey, 'composite'>, ServiceMeta> = {
  search: {
    name: 'AI Search & GEO',
    href: '/services/ai-seo/',
    oneLiner:
      'Engineer your store to be cited inside AI Overviews, ChatGPT, and Perplexity.',
  },
  catalog: {
    name: 'Catalog AI',
    href: '/services/catalog-ai/',
    oneLiner:
      'AI-drafted, editor-reviewed product catalogs at SKU scale.',
  },
  editorial: {
    name: 'Editorial Authority',
    href: '/services/editorial-authority/',
    oneLiner:
      'Senior subject-matter writers shipping pillar pages and category content.',
  },
  dev: {
    name: 'Website Development',
    href: '/services/website-development-design-services/',
    oneLiner:
      'Performance-engineered e-commerce builds. You own the code.',
  },
  outbound: {
    name: 'Outbound Email',
    href: '/services/outbound-email-marketing-services/',
    oneLiner:
      'Deliverability-first cold outbound. Sender-reputation engineering.',
  },
}

export const FULL_GROWTH = {
  name: 'Full Growth Ownership',
  href: '/services/full-growth-ownership/',
  oneLiner:
    'One operator running multiple services as a coordinated growth function.',
}

/**
 * Named className tokens. Tailwind v4 cannot tree-shake dynamic class
 * concatenation, so each color/weight combination must appear as a literal
 * somewhere in source. Keeping them centralized here means the JIT sees
 * every combination it needs to generate.
 */
export const SERVICE_CLASSES: Record<
  Exclude<ServiceKey, 'composite'>,
  {
    bg500: string
    bg50: string
    text600: string
    text700: string
    border500: string
    borderTop: string
    ring: string
    dot: string
    accentBar: string
  }
> = {
  search: {
    bg500: 'bg-service-search-500',
    bg50: 'bg-service-search-50',
    text600: 'text-service-search-600',
    text700: 'text-service-search-700',
    border500: 'border-service-search-500',
    borderTop: 'border-t-2 border-t-service-search-500',
    ring: 'ring-service-search-500',
    dot: 'bg-service-search-500',
    accentBar: 'h-1 w-full bg-service-search-500',
  },
  catalog: {
    bg500: 'bg-service-catalog-500',
    bg50: 'bg-service-catalog-50',
    text600: 'text-service-catalog-600',
    text700: 'text-service-catalog-700',
    border500: 'border-service-catalog-500',
    borderTop: 'border-t-2 border-t-service-catalog-500',
    ring: 'ring-service-catalog-500',
    dot: 'bg-service-catalog-500',
    accentBar: 'h-1 w-full bg-service-catalog-500',
  },
  editorial: {
    bg500: 'bg-service-editorial-500',
    bg50: 'bg-service-editorial-50',
    text600: 'text-service-editorial-600',
    text700: 'text-service-editorial-700',
    border500: 'border-service-editorial-500',
    borderTop: 'border-t-2 border-t-service-editorial-500',
    ring: 'ring-service-editorial-500',
    dot: 'bg-service-editorial-500',
    accentBar: 'h-1 w-full bg-service-editorial-500',
  },
  dev: {
    bg500: 'bg-service-dev-500',
    bg50: 'bg-service-dev-50',
    text600: 'text-service-dev-600',
    text700: 'text-service-dev-700',
    border500: 'border-service-dev-500',
    borderTop: 'border-t-2 border-t-service-dev-500',
    ring: 'ring-service-dev-500',
    dot: 'bg-service-dev-500',
    accentBar: 'h-1 w-full bg-service-dev-500',
  },
  outbound: {
    bg500: 'bg-service-outbound-500',
    bg50: 'bg-service-outbound-50',
    text600: 'text-service-outbound-600',
    text700: 'text-service-outbound-700',
    border500: 'border-service-outbound-500',
    borderTop: 'border-t-2 border-t-service-outbound-500',
    ring: 'ring-service-outbound-500',
    dot: 'bg-service-outbound-500',
    accentBar: 'h-1 w-full bg-service-outbound-500',
  },
}
