import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { FullGrowthTierCard } from '@/components/services/FullGrowthTierCard'
import { cn } from '@/lib/cn'

/**
 * /services/website-development-design-services/ § Engagement — build-specific tiers.
 *
 * Replaces the shared <EngagementModel /> on this page because the AI-search
 * pricing shape ($12–24K Sprint, $8–14K/mo Retainer) doesn't map to website
 * builds. Three tiers here:
 *   1. Build Sprint — single-template proof-of-approach ($15–35K)
 *   2. Full Build — replatform or net-new ($40–150K), FEATURED
 *   3. Full Growth Ownership — multi-service coordination (FGO shared card)
 *
 * Visual structure mirrors EngagementModel.tsx and catalog-ai/CatalogTiers.tsx:
 * slate accent strip on top, header (cadence + name + price), italic for-whom
 * blurb, checked includes list, CTA footer. Featured card gets the ink-900
 * border + drop shadow + floating slate "Most engagements start here" badge.
 *
 * Full Build also renders a small price-by-stack sub-grid below its includes
 * list so the buyer can map their stack to a budget without leaving the card.
 */

type StackPrice = { label: string; price: string }

type Tier = {
  key: 'sprint' | 'full' | 'fgo'
  name: string
  cadence: string
  price: string
  forWhom: string
  includes: string[]
  stackPrices?: StackPrice[]
  cta: { label: string; href: string }
  featured?: boolean
}

const TIERS: Tier[] = [
  {
    key: 'sprint',
    name: 'Build Sprint',
    cadence: '4–6 weeks · fixed scope',
    price: '$15–35K',
    forWhom:
      '"Show me the build approach works before we commit to a full replatform."',
    includes: [
      'Single-template build or focused redesign (PDP + category template only, not full site)',
      'Performance SLA in SOW: LCP < 2.0s, INP < 200ms, CLS < 0.05',
      'Schema graph (Product, Offer, FAQ, HowTo, Breadcrumb) on the template',
      'GA4 + server-side events configured',
      'Mobile-first build, WCAG 2.2 AA pre-checked',
      'One executive readout',
    ],
    cta: { label: 'Scope a build sprint', href: '/book-growth-call/' },
  },
  {
    key: 'full',
    name: 'Full Build',
    cadence: '10–16 weeks · scoped to catalog',
    price: '$40–150K',
    forWhom: '"Replatform or net-new build. Most engagements start here."',
    featured: true,
    includes: [
      'Full e-commerce on Shopify Plus, WooCommerce, or headless (Next.js + Hydrogen/Saleor)',
      'Catalog migration with 301 redirect map',
      'PIM/ERP integration where applicable (Acumatica, NetSuite, SAP B1)',
      'Schema graph baked in across all templates',
      'Core Web Vitals SLA + 30-day stabilization window included',
      'You own the code at midnight on launch day',
    ],
    stackPrices: [
      { label: 'Shopify Plus B2B (1–20K SKUs)', price: '$40–80K' },
      { label: 'WooCommerce overhaul', price: '$35–70K' },
      { label: 'Headless Next.js + Hydrogen/Saleor', price: '$90–150K' },
    ],
    cta: { label: 'Request a build quote', href: '/book-growth-call/' },
  },
  {
    key: 'fgo',
    name: 'Full Growth Ownership',
    cadence: 'Multi-service · 3–6 month minimum',
    price: '',
    forWhom: '',
    includes: [],
    cta: { label: 'See Full Growth Ownership', href: '/services/full-growth-ownership/' },
  },
]

export function WebDevPricing({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          How to engage
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Three ways to build. All priced.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Fixed-scope sprint to prove the approach, full build for the
          replatform, or coordinated multi-service ownership when the build
          is one piece of a bigger growth program.
        </p>
      </div>

      <ul className="mt-14 grid gap-6 md:grid-cols-3">
        {TIERS.map((t) => {
          if (t.key === 'fgo') {
            return (
              <li key={t.key} className="flex">
                <FullGrowthTierCard
                  cadence="Multi-service · 3–6 month minimum"
                  body={
                    <>
                      When you need more than a build alone. We coordinate AI
                      search, content, outbound, and catalog work alongside
                      ongoing dev as a single growth function &mdash; one
                      operator accountable. Does NOT cover full new builds,
                      which remain separate Build Sprint or Full Build
                      projects.
                    </>
                  }
                  className="w-full"
                />
              </li>
            )
          }

          return (
            <li
              key={t.key}
              className={cn(
                'relative flex flex-col border bg-surface transition-shadow duration-200',
                t.featured
                  ? 'border-ink-900 shadow-[0_30px_80px_-30px_rgba(15,20,30,0.25)]'
                  : 'border-rule hover:border-ink-700',
              )}
            >
              <div className="h-1 w-full bg-service-dev-500" aria-hidden />

              {t.featured && (
                <span className="absolute -top-3 left-6 inline-flex items-center rounded-[3px] bg-service-dev-500 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                  Most engagements start here
                </span>
              )}

              <div className="border-b border-rule px-6 py-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                  {t.cadence}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
                  {t.name}
                </h3>
                <p className="mt-3 font-display text-3xl font-semibold tabular-nums leading-none text-ink-900">
                  {t.price}
                </p>
              </div>

              <div className="flex-1 px-6 py-6">
                <p className="text-sm italic text-ink-500">{t.forWhom}</p>

                <ul className="mt-5 space-y-3">
                  {t.includes.map((item) => (
                    <li
                      key={item}
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
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {t.stackPrices && (
                  <div className="mt-6 border-t border-rule pt-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                      Price by stack
                    </p>
                    <ul className="mt-3 space-y-2">
                      {t.stackPrices.map((sp) => (
                        <li
                          key={sp.label}
                          className="flex items-baseline justify-between gap-3 text-xs text-ink-700"
                        >
                          <span>{sp.label}</span>
                          <span className="font-semibold tabular-nums text-ink-900">
                            {sp.price}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="border-t border-rule px-6 py-4">
                <Link
                  href={t.cta.href}
                  data-cta={`webdev_${t.key}__tier_card`}
                  data-cta-location="mid_body"
                  className={cn(
                    'inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] px-5 py-2.5 text-sm font-semibold transition-colors duration-200',
                    t.featured
                      ? 'bg-ink-900 text-white hover:bg-brand-600'
                      : 'border border-ink-300 bg-surface text-ink-900 hover:border-ink-900',
                  )}
                >
                  {t.cta.label}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="mt-10 max-w-2xl text-sm text-ink-500">
        All builds: 30-day post-launch stabilization included. You own the
        code, the repo, and the hosting account at launch.
      </p>
    </SectionRail>
  )
}
