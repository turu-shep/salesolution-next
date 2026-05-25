import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { cn } from '@/lib/cn'

/**
 * /services/catalog-ai/ § 3 — Three productized tiers.
 *
 * Standard / Pro / Enterprise side by side. Pro is the recommended tier
 * (spec §14 — "always lead with Pro") so it gets the same visual emphasis
 * as the Operator Retainer card in EngagementModel.tsx: heavier border,
 * drop shadow, floating chip, primary-style CTA at the bottom.
 *
 * Per-SKU pricing on cards 1 + 2 references the entry-tier rate. The full
 * volume breakdown (1K / 10K / 50K breaks + ongoing maintenance) lives in
 * the sibling `CatalogVolumePricing` section so this card grid stays
 * scannable.
 */

type Tier = {
  key: 'standard' | 'pro' | 'enterprise'
  name: string
  cadence: string
  price: string
  priceCadence: string
  forWhom: string
  includes: string[]
  cta: { label: string; href: string }
  featured?: boolean
}

const TIERS: Tier[] = [
  {
    key: 'standard',
    name: 'Standard',
    cadence: 'Per-SKU · one-time + maintenance',
    price: '$3.00',
    priceCadence: '/ SKU',
    forWhom:
      '"Our descriptions are tired and inconsistent — fix them across the whole catalog."',
    includes: [
      '200–400 word AI-rewritten descriptions',
      'Brand voice training on your 50 best descriptions',
      'Schema.org Product + Offer + AggregateRating',
      '3–7 internal links per page, contextually placed',
      'CRM-format delivery (Shopify, Magento, BigCommerce, custom)',
      '5% manual QA sampling · 500-SKU pilot at day 7',
      '30 days of post-delivery issue resolution',
    ],
    cta: { label: 'Scope a Standard project', href: '/catalog-snapshot/?tier=standard' },
  },
  {
    key: 'pro',
    name: 'Pro',
    cadence: 'Per-SKU · one-time + maintenance',
    price: '$7.00',
    priceCadence: '/ SKU',
    forWhom:
      '"We want AI Overviews and ChatGPT shopping to cite us — not the manufacturer."',
    featured: true,
    includes: [
      '500–800 word structured descriptions (Overview / Specs / Applications / Compatibility / FAQ)',
      'Manufacturer spec sheet integration — your operator pulls PDFs',
      '4–6 schema-marked FAQ Q&A pairs per product, citation-engineered',
      'Application content grounded in real industry context',
      'Comparison content for top 20% of SKUs by revenue',
      'Product + FAQ + HowTo + AggregateRating + technicalSpec schema',
      '20% manual QA sampling · quarterly performance review',
    ],
    cta: { label: 'Scope a Pro project', href: '/catalog-snapshot/?tier=pro' },
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    cadence: '6-month minimum · 30-day exit thereafter',
    price: 'From $15K',
    priceCadence: '/ month',
    forWhom:
      '"We have 50K+ SKUs. We don\'t want a project — we want someone running it."',
    includes: [
      'Pro-depth content for the entire catalog',
      'Dedicated operator assigned to the account',
      'Top 50 category pages rewritten for AIO scannability',
      'Programmatic SEO build (comparison + application landing pages)',
      'Monthly outcome reviews on citation share + qualified-lead inflows',
      'PIM integration (Salsify, Akeneo, PIMcore) where applicable',
      'Direct Slack to the operator, no PMs in the middle',
    ],
    cta: { label: 'Talk to Artur', href: '/contact-me/' },
  },
]

export function CatalogTiers({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          How to engage
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Three tiers. <span className="text-ink-500">Published prices.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Same buyer profile across all three. Different depth of work,
          different price points. Volume discounts at 10K and 50K SKUs in
          every tier &mdash; full table below.
        </p>
      </div>

      <ul className="mt-14 grid gap-6 md:grid-cols-3">
        {TIERS.map((t) => (
          <li
            key={t.key}
            className={cn(
              'relative flex flex-col border bg-surface transition-shadow duration-200',
              t.featured
                ? 'border-ink-900 shadow-[0_30px_80px_-30px_rgba(15,20,30,0.25)]'
                : 'border-rule hover:border-ink-700',
            )}
          >
            {t.featured && (
              <span className="absolute -top-3 left-6 inline-flex items-center rounded-[3px] bg-accent-500 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                Most common
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
                <span className="ml-1 text-base font-medium text-ink-500">
                  {t.priceCadence}
                </span>
              </p>
            </div>

            <div className="flex-1 px-6 py-6">
              <p className="text-sm italic text-ink-500">{t.forWhom}</p>

              <ul className="mt-5 space-y-3">
                {t.includes.map((item) => (
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

            <div className="border-t border-rule px-6 py-4">
              <Link
                href={t.cta.href}
                data-cta={`catalog_${t.key}__tier_card`}
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
        ))}
      </ul>

      <p className="mt-10 max-w-2xl text-sm text-ink-500">
        Not sure which tier? The{' '}
        <Link
          href="/catalog-snapshot/"
          className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
        >
          free catalog snapshot
        </Link>{' '}
        rewrites 5 of your products in both Standard and Pro so you can see
        the depth difference before deciding.
      </p>
    </SectionRail>
  )
}
