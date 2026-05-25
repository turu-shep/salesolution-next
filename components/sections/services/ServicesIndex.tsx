import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Services hub directory. Lists every service detail page as a card with
 * a one-line value statement, 3 key deliverables, and a CTA to the
 * detail route.
 *
 * The featured service (AI Search / GEO) gets the lead position and a
 * stronger visual treatment because it's the entry point for most
 * engagements.
 */

type Service = {
  slug: string
  name: string
  badge?: string
  lede: string
  deliverables: string[]
  featured?: boolean
}

const SERVICES: Service[] = [
  {
    slug: '/services/ai-seo/',
    name: 'AI search & Generative-Engine Optimization',
    badge: 'Most engagements start here',
    lede:
      'Engineer your store to be cited inside AI Overviews, ChatGPT, and Perplexity. The core practice.',
    deliverables: [
      'Schema rewrite for AI parsers',
      'Citation engineering for generative engines',
      'AIO-aware PPC & paid acceleration',
    ],
    featured: true,
  },
  {
    slug: '/services/catalog-ai/',
    name: 'Catalog AI · product catalog rewrites',
    badge: 'Productized · per-SKU pricing',
    lede:
      'AI-rewritten product catalogs for industrial and equipment distributors. Three tiers from $3/SKU. Free dual-version snapshot.',
    deliverables: [
      'AI-rewritten descriptions + schema',
      'AIO citation engineering (Pro tier)',
      'CRM-format delivery + ongoing maintenance',
    ],
  },
  {
    slug: '/services/content-writing-services/',
    name: 'Content writing for technical B2B',
    lede:
      'Long-form content with engineering credibility. Spec-sheet fluency, citation-friendly structure, AI-readable depth.',
    deliverables: [
      'Pillar pages + topic clusters',
      'Spec-heavy product copy',
      'Engineering Q&A and answer hubs',
    ],
  },
  {
    slug: '/services/website-content-writing-packages/',
    name: 'Website content writing packages',
    lede:
      'Fixed-scope content production for full site rewrites or category overhauls. Priced per deliverable, not per hour.',
    deliverables: [
      'Category & PDP rewrites',
      'Landing pages built for conversion',
      'Editorial calendars + 12-month plans',
    ],
  },
  {
    slug: '/services/website-development-design-services/',
    name: 'Website development & design',
    lede:
      'High-performance e-commerce builds for industrial and technical-distribution stores. Headless and traditional stacks.',
    deliverables: [
      'Next.js / Headless commerce builds',
      'WooCommerce + Shopify Plus stores',
      'Core Web Vitals + AIO-readiness baked in',
    ],
  },
  {
    slug: '/services/outbound-email-marketing-services/',
    name: 'Outbound email marketing',
    lede:
      'Sender-reputation-first cold outbound for technical B2B. Deliverability engineering, not spray-and-pray.',
    deliverables: [
      'Sender domain + DNS engineering',
      'Vertical-specific list building',
      'Multi-touch sequences with reply-rate KPIs',
    ],
  },
]

export function ServicesIndex({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          What we do
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Six services. <span className="text-ink-500">One operator.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Each runs as a standalone engagement or as part of a combined
          retainer. AI search is the gravity well, Catalog AI is the
          productized entry point &mdash; most clients start with one of
          the two, then layer the rest as they need it.
        </p>
      </div>

      <ol className="mt-14 grid gap-6 md:grid-cols-2">
        {SERVICES.map((s) => (
          <li
            key={s.slug}
            className={
              s.featured
                ? 'group relative md:col-span-2'
                : 'group relative'
            }
          >
            <Link
              href={s.slug}
              className={`block h-full border bg-surface p-6 transition-colors duration-200 hover:border-ink-900 md:p-8 ${
                s.featured
                  ? 'border-ink-900 shadow-[0_30px_80px_-30px_rgba(15,20,30,0.20)]'
                  : 'border-rule'
              }`}
            >
              {s.badge && (
                <span className="inline-block rounded-[3px] bg-accent-500 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                  {s.badge}
                </span>
              )}

              <h3
                className={`font-display font-semibold tracking-[-0.01em] text-ink-900 ${
                  s.featured ? 'mt-4 text-3xl sm:text-4xl' : 'mt-0 text-xl sm:text-2xl'
                }`}
              >
                {s.name}
              </h3>

              <p className="mt-3 max-w-2xl text-ink-700">{s.lede}</p>

              <ul className="mt-5 space-y-2 border-t border-rule pt-4">
                {s.deliverables.map((d) => (
                  <li
                    key={d}
                    className="flex items-start gap-3 text-sm text-ink-700"
                  >
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
                    <span>{d}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 group-hover:text-brand-600 group-hover:decoration-brand-600">
                See the {s.name.split(' ').slice(0, 2).join(' ')} page
                <span aria-hidden>→</span>
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </SectionRail>
  )
}
