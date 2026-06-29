import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { cn } from '@/lib/cn'

/**
 * /services/website-development-design-services/ — What we build.
 *
 * Three stack tracks we ship for industrial / technical-distribution
 * e-commerce. Each one is the right answer for a specific buyer profile;
 * the goal is to help the buyer self-identify before the call instead of
 * pretending one stack fits everyone.
 *
 * Middle column (Shopify Plus) is the most common entry-point so the
 * featured emphasis lands there.
 */

type Stack = {
  key: string
  name: string
  tagline: string
  forWhom: string
  best: string
  includes: string[]
  caveat?: string
  featured?: boolean
}

const STACKS: Stack[] = [
  {
    key: 'headless',
    name: 'Headless · Next.js',
    tagline: 'Custom commerce on React',
    forWhom: '$10M+ ARR · complex catalog · in-house dev',
    best: 'Specification-heavy catalogs, custom quoting, deep ERP / PIM integration.',
    includes: [
      'Next.js 16 storefront on the edge',
      'Headless backend (Shopify Hydrogen, Saleor, or BigCommerce)',
      'Custom product configurators + quote flows',
      'PIM / ERP sync (NetSuite, SAP B1, Acumatica)',
    ],
    caveat: 'Higher build cost. Higher ceiling.',
  },
  {
    key: 'shopify',
    name: 'Shopify Plus',
    tagline: 'The pragmatic default',
    forWhom: '$2–25M ARR · 1–20k SKUs · standard B2B flows',
    best: 'Distributors with net-terms, tiered pricing, and quote-to-cart needs that Shopify B2B already handles.',
    featured: true,
    includes: [
      'Shopify Plus B2B (companies, catalogs, net terms)',
      'Custom Liquid + Hydrogen sections, no plugin sprawl',
      'Schema layer for product, FAQ, HowTo, breadcrumb',
      'GA4 + server-side events via Customer Privacy API',
    ],
    caveat: 'Most engagements start here.',
  },
  {
    key: 'woocommerce',
    name: 'WooCommerce',
    tagline: 'When WordPress is non-negotiable',
    forWhom: 'Existing WP investment · content-led commerce',
    best: 'Stores with deep editorial + technical content that already lives in WordPress and earns SEO equity worth preserving.',
    includes: [
      'WooCommerce on managed hosting (Kinsta / Pressable)',
      'Lean plugin diet — typically 12–18 plugins total',
      'Custom Gutenberg blocks for product / spec content',
      'Edge caching layer + image CDN (no plugin needed)',
    ],
    caveat: 'We will tell you when Shopify is the better answer.',
  },
]

export function StackTypes({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          What we build
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Three stacks. Picked for your shape, not ours.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          We don&rsquo;t resell a single platform. The right stack is the one
          that fits your catalog size, integration map, and operational
          model &mdash; not the one with the highest agency margin.
        </p>
      </div>

      <ul className="mt-14 grid gap-6 md:grid-cols-3">
        {STACKS.map((s) => (
          <li
            key={s.key}
            className={cn(
              'relative flex flex-col border bg-surface transition-colors duration-200',
              s.featured
                ? 'border-ink-900 shadow-[0_30px_80px_-30px_rgba(15,20,30,0.25)]'
                : 'border-rule hover:border-ink-700',
            )}
          >
            {s.featured && (
              <span className="absolute -top-3 left-6 inline-flex items-center rounded-[3px] bg-accent-500 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                Most builds start here
              </span>
            )}

            <div className="border-b border-rule px-6 py-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                {s.tagline}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
                {s.name}
              </h3>
              <p className="mt-3 text-sm text-ink-500">{s.forWhom}</p>
            </div>

            <div className="flex-1 px-6 py-6">
              <p className="text-sm italic text-ink-700">{s.best}</p>

              <ul className="mt-5 space-y-3">
                {s.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-ink-700">
                    <svg
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {s.caveat && (
              <div className="border-t border-rule px-6 py-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
                  {s.caveat}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-10 max-w-2xl text-sm text-ink-500">
        Migrating from Magento, BigCommerce, or a custom monolith?{' '}
        <Link
          href="/contact-me/"
          data-cta="contact__stack_types"
          data-cta-location="mid_body"
          className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
        >
          Talk to us about the redirect map first
        </Link>
        .
      </p>
    </SectionRail>
  )
}
