import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { CompositeBar } from '@/components/services/CompositeBar'
import { ServiceColorDot } from '@/components/services/ServiceColorDot'
import { SERVICE_CLASSES, type ServiceKey } from '@/components/services/service-colors'
import { cn } from '@/lib/cn'

/**
 * Services hub directory — 6-card color-coded grid.
 *
 * Each card carries the service's identity color on a top accent strip
 * (composite bar for Full Growth Ownership), an optional badge, a 1-line
 * positioning lede, three capability bullets marked with service-color
 * dots, and a "See the [Service] page →" CTA. The color thread lets the
 * reader visually link a card to its detail page and to the other
 * sections on this hub (decision tree, combinations table).
 *
 * Per the merger that retired the legacy content-writing-services and
 * website-content-writing-packages routes, this list now contains SIX
 * entries — Editorial Authority is the single content offering at the
 * category level and above.
 */

type Service = {
  key: ServiceKey
  slug: string
  name: string
  badge?: string
  lede: string
  capabilities: string[]
  ctaLabel: string
}

const SERVICES_DATA: Service[] = [
  {
    key: 'search',
    slug: '/services/ai-seo/',
    name: 'AI Search & GEO',
    badge: 'Most engagements start here',
    lede:
      'Engineer your store to be cited inside AI Overviews, ChatGPT, and Perplexity. The core practice.',
    capabilities: [
      'Schema rewrite for AI parsers',
      'Citation engineering for generative engines',
      'AIO-aware PPC & paid acceleration',
    ],
    ctaLabel: 'See the AI Search page',
  },
  {
    key: 'catalog',
    slug: '/services/catalog-ai/',
    name: 'Catalog AI',
    badge: 'Per-SKU pricing',
    lede:
      'Product-page rewrites at scale. AI-drafted, editor-reviewed at Pro and above.',
    capabilities: [
      'Descriptions + schema + internal linking',
      'FAQ blocks engineered for AIO citation',
      '1,000 to 100,000+ SKU catalogs',
    ],
    ctaLabel: 'See the Catalog AI page',
  },
  {
    key: 'editorial',
    slug: '/services/editorial-authority/',
    name: 'Editorial Authority',
    lede:
      'Pillar pages and category content written by senior subject-matter writers. Built to be cited, not just published.',
    capabilities: [
      'Pillar pages + cluster posts',
      'Engineering Q&A hubs',
      'Editorial calendars + 12-month plans',
    ],
    ctaLabel: 'See the Editorial Authority page',
  },
  {
    key: 'dev',
    slug: '/services/website-development-design-services/',
    name: 'Website Development',
    lede:
      'Performance-engineered e-commerce builds. Headless, Shopify Plus, or WooCommerce. You own the code.',
    capabilities: [
      'Core Web Vitals SLA in the SOW',
      'AIO-ready schema baked in',
      'Plugin-thin by policy',
    ],
    ctaLabel: 'See the Website Development page',
  },
  {
    key: 'outbound',
    slug: '/services/outbound-email-marketing-services/',
    name: 'Outbound Email',
    lede:
      'Deliverability-first cold outbound. Sender-reputation engineering, not spray-and-pray.',
    capabilities: [
      'Sender domain + DNS engineering',
      'Vertical-specific list building',
      'Multi-touch sequences with branching logic',
    ],
    ctaLabel: 'See the Outbound Email page',
  },
  {
    key: 'composite',
    slug: '/services/full-growth-ownership/',
    name: 'Full Growth Ownership',
    badge: 'Premium · all services, one owner',
    lede:
      'One operator running multiple services as a coordinated growth function. Fractional GTM Engineer or 4-in-1 Retainer.',
    capabilities: [
      'Coordinates AI search, content, outbound, dev, catalog',
      'Replaces multiple agency relationships',
      '6-month minimum (Shape A) or 3-month (Shape B)',
    ],
    ctaLabel: 'See Full Growth Ownership',
  },
]

export function ServicesIndex({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          The services in detail
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          What each service ships. Color-coded for cross-reference.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Each runs as a standalone engagement. Most engagements eventually
          combine two or three. AI search is the gravity well, Catalog AI is
          the productized entry point, Full Growth Ownership is the premium
          tier when you need all of it under one accountable owner.
        </p>
      </div>

      <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SERVICES_DATA.map((s) => {
          const isComposite = s.key === 'composite'
          const colorClasses = isComposite
            ? null
            : SERVICE_CLASSES[s.key as Exclude<ServiceKey, 'composite'>]
          const badgeBg = isComposite
            ? 'bg-ink-900'
            : colorClasses!.bg500

          return (
            <li key={s.slug} className="group relative flex">
              <Link
                href={s.slug}
                className="flex w-full flex-col overflow-hidden border border-rule bg-surface transition-colors duration-200 hover:border-ink-900"
              >
                {isComposite ? (
                  <CompositeBar weight="hero" />
                ) : (
                  <span
                    aria-hidden
                    className={cn('h-1.5 w-full', colorClasses!.bg500)}
                  />
                )}

                <div className="flex flex-1 flex-col p-6 md:p-7">
                  {s.badge && (
                    <span
                      className={cn(
                        'inline-flex w-fit items-center rounded-[3px] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white',
                        badgeBg,
                      )}
                    >
                      {s.badge}
                    </span>
                  )}

                  <h3
                    className={cn(
                      'font-display text-xl font-semibold tracking-[-0.01em] text-ink-900 sm:text-2xl',
                      s.badge ? 'mt-4' : 'mt-0',
                    )}
                  >
                    {s.name}
                  </h3>

                  <p className="mt-3 text-ink-700">{s.lede}</p>

                  <ul className="mt-5 space-y-2.5 border-t border-rule pt-4">
                    {s.capabilities.map((c) => (
                      <li
                        key={c}
                        className="flex items-start gap-3 text-sm text-ink-700"
                      >
                        <span className="mt-1.5 shrink-0">
                          <ServiceColorDot service={s.key} />
                        </span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 group-hover:text-brand-600 group-hover:decoration-brand-600">
                    {s.ctaLabel}
                    <span aria-hidden>&rarr;</span>
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      <p className="mt-10 max-w-3xl text-sm text-ink-500">
        Each service runs standalone. About 70% of AI Search clients add
        content within 90 days. About 60% of builds pair with Catalog AI
        within 6 months. Cross-service work is most of the value over time.
      </p>
    </SectionRail>
  )
}
