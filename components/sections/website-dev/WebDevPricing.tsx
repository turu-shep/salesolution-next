import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { FullGrowthTierCard } from '@/components/services/FullGrowthTierCard'
import { cn } from '@/lib/cn'

/**
 * /services/website-development-design-services/ § Engagement — build-specific tiers.
 *
 * Replaces the shared <EngagementModel /> on this page because the AI-search
 * engagement shape doesn't map to website builds. Three tiers here:
 *   1. Scoped build — single-template proof-of-approach
 *   2. Full Build — replatform or net-new, FEATURED
 *   3. Full Growth Ownership — multi-service coordination (FGO shared card)
 *
 * Visual structure mirrors EngagementModel.tsx and catalog-ai/CatalogTiers.tsx:
 * slate accent strip on top, header (cadence + name + scope line), italic
 * for-whom blurb, checked includes list, CTA footer. Featured card gets the
 * ink-900 border + drop shadow + floating slate badge.
 *
 * 2026-07-27 (FD2): build bands are no longer published — every figure lands
 * in the SOW. The by-stack sub-grid now describes what each stack means
 * instead of what it costs, and the "sprint" naming is retired with the rest
 * of the sprint machinery.
 */

type StackNote = { label: string; note: string }

type Tier = {
  key: 'scoped' | 'full' | 'fgo'
  name: string
  cadence: string
  /** Replaces the old price figure: how the fee is set, not what it is. */
  scopeLine: string
  forWhom: string
  includes: string[]
  stackNotes?: StackNote[]
  cta: { label: string; href: string }
  featured?: boolean
}

const TIERS: Tier[] = [
  {
    key: 'scoped',
    name: 'Scoped build',
    cadence: '4–6 weeks · fixed scope',
    scopeLine: 'Fixed scope, quoted in the SOW within 48 hours.',
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
    cta: { label: 'Scope the build', href: '/book-growth-call/' },
  },
  {
    key: 'full',
    name: 'Full Build',
    cadence: '10–16 weeks · scoped to catalog',
    scopeLine: 'Scoped to your catalog and stack — number in the SOW.',
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
    stackNotes: [
      { label: 'Shopify Plus B2B (1–20K SKUs)', note: 'Standard B2B flows on a managed platform' },
      { label: 'WooCommerce overhaul', note: 'Rebuilt in place — catalog, templates, checkout' },
      { label: 'Headless Next.js + Hydrogen/Saleor', note: 'Custom front end, the deepest build' },
    ],
    cta: { label: 'Request a build quote', href: '/book-growth-call/' },
  },
  {
    key: 'fgo',
    name: 'Full Growth Ownership',
    cadence: 'Multi-service · 3–6 month minimum',
    scopeLine: '',
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
          Three ways to build. All scoped in writing.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          A fixed-scope build to prove the approach, the full replatform, or
          coordinated multi-service ownership when the build is one piece of
          a bigger growth program.
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
                      which remain separate scoped-build or Full Build
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
                <p className="mt-3 text-base leading-relaxed text-ink-700">
                  {t.scopeLine}
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

                {t.stackNotes && (
                  <div className="mt-6 border-t border-rule pt-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                      What each stack means
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {t.stackNotes.map((sn) => (
                        <li key={sn.label} className="text-xs text-ink-700">
                          <span className="font-semibold text-ink-900">
                            {sn.label}
                          </span>
                          <span className="mt-0.5 block leading-relaxed">
                            {sn.note}
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
