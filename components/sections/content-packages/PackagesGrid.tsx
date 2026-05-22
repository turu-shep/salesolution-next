import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { cn } from '@/lib/cn'

/**
 * Content packages § — the centerpiece pricing grid.
 *
 * Five fixed tiers: one trial / single-article entry, plus four monthly
 * retainers (Niche → Excelsior). Vanguard is the highlighted "most popular"
 * tier — it's the cleanest entry point for a serious content programme and
 * the operator wants the eye to land there.
 *
 * Treatment is deliberately deeper than the homepage EngagementModel: per-
 * tier deliverable list, named volume + word-count, included extras with
 * dollar values, and an explicit "best for" line so the reader can self-
 * select without a call.
 */

export type PackageTier = {
  key: string
  name: string
  tagline: string
  price: string
  cadence: string
  bestFor: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  highlight?: boolean
}

export const PACKAGE_TIERS: PackageTier[] = [
  {
    key: 'trial',
    name: "Let's Give It a Try",
    tagline: 'Single article · trial',
    price: '$500',
    cadence: 'per article',
    bestFor: 'You want a writing sample before committing to a monthly cadence.',
    features: [
      'One 2,500-word article',
      'Brand-voice + tone onboarding',
      'Optional custom graphic',
      'Single revision included',
      'Delivered in 7 business days',
    ],
    ctaLabel: 'Order a single piece',
    ctaHref: '/book-growth-call/',
  },
  {
    key: 'niche',
    name: 'Niche',
    tagline: 'Single-vertical authority',
    price: '$2,400',
    cadence: '/ month',
    bestFor: 'A single product line or vertical you want to dominate in 6–9 months.',
    features: [
      'Four 3,000-word articles / month',
      'Custom graphics included ($400 value)',
      'Monthly topic + keyword research',
      'Two revisions per article',
      'Editorial style guide built for you',
    ],
    ctaLabel: 'Choose Niche',
    ctaHref: '/book-growth-call/',
  },
  {
    key: 'vanguard',
    name: 'Vanguard',
    tagline: 'Authority + pillar coverage',
    price: '$4,000',
    cadence: '/ month',
    highlight: true,
    bestFor: 'You sell across 2–3 categories and need both depth pieces and pillar coverage.',
    features: [
      '2 × 3,000-word + 2 × 4,500-word articles',
      'Bi-monthly 6,000-word pillar page',
      'Custom graphics + diagrams ($700 value)',
      'Monthly editorial review call',
      'Internal-linking + cluster planning',
      'SERP + AIO citation tracking',
    ],
    ctaLabel: 'Choose Vanguard',
    ctaHref: '/book-growth-call/',
  },
  {
    key: 'domination',
    name: 'Way to Domination',
    tagline: 'Topical authority at scale',
    price: '$7,500',
    cadence: '/ month',
    bestFor: 'You compete in a crowded vertical and need topical-authority firepower.',
    features: [
      '4 × 2,500-word + 4 × 4,500-word articles',
      'One 7,000-word pillar page / month',
      'Editorial + technical SEO included ($2,000 value)',
      'Weekly editorial sync',
      'Competitive content-gap analysis',
      'Internal author + reviewer credentials',
    ],
    ctaLabel: 'Choose Domination',
    ctaHref: '/book-growth-call/',
  },
  {
    key: 'excelsior',
    name: 'Excelsior',
    tagline: 'Category leadership',
    price: '$15,000',
    cadence: '/ month',
    bestFor: 'You’re positioning for category leadership and need a full editorial team.',
    features: [
      '8 × 2,500-word + 8 × 4,500-word articles',
      'Three 8,000-word pillars / month',
      'Full editorial + strategist team ($4,000 value)',
      'Weekly + bi-weekly sprints',
      'Dedicated managing editor',
      'Quarterly content-strategy offsite',
    ],
    ctaLabel: 'Choose Excelsior',
    ctaHref: '/book-growth-call/',
  },
]

export function PackagesGrid({ id }: { id?: string }) {
  const [trial, ...monthly] = PACKAGE_TIERS

  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          The packages
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Five tiers. <span className="text-ink-500">One obvious fit.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Every tier is a fixed monthly fee with the deliverables locked.
          No &ldquo;starting at&rdquo; pricing, no surprise upcharges.
          Prices assume a 3-month minimum; single-piece pricing is available
          on the entry tier.
        </p>
      </div>

      {/* Trial / single-piece strip — sits above the monthly grid */}
      <div className="mt-12 flex flex-col gap-6 border-y border-rule bg-surface/60 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 md:mt-16">
        <div className="flex-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            {trial.tagline}
          </p>
          <h3 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] text-ink-900 sm:text-2xl">
            {trial.name}
          </h3>
          <p className="mt-2 max-w-xl text-sm text-ink-700">
            {trial.bestFor}{' '}
            <span className="text-ink-500">
              {trial.features.slice(0, 3).join(' · ')}.
            </span>
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <p className="font-display text-3xl font-semibold tabular-nums leading-none text-ink-900">
            {trial.price}
            <span className="ml-1 font-mono text-xs font-normal text-ink-500">
              {trial.cadence}
            </span>
          </p>
          <Link
            href={trial.ctaHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
          >
            {trial.ctaLabel} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/* The monthly retainers grid — the actual centerpiece */}
      <ul className="mt-10 grid gap-6 lg:grid-cols-4 lg:gap-5">
        {monthly.map((t) => (
          <li
            key={t.key}
            className={cn(
              'relative flex flex-col border bg-surface transition-shadow duration-200',
              t.highlight
                ? 'border-ink-900 shadow-[0_30px_80px_-30px_rgba(15,20,30,0.30)] lg:-my-4'
                : 'border-rule hover:border-ink-700',
            )}
          >
            {t.highlight && (
              <span className="absolute -top-3 left-6 inline-flex items-center rounded-[3px] bg-accent-500 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                Most popular
              </span>
            )}

            <div
              className={cn(
                'border-b border-rule px-6 py-5',
                t.highlight && 'lg:pt-7',
              )}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                {t.tagline}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
                {t.name}
              </h3>
              <p className="mt-3 font-display text-3xl font-semibold tabular-nums leading-none text-ink-900">
                {t.price}
                <span className="ml-1 font-mono text-xs font-normal text-ink-500">
                  {t.cadence}
                </span>
              </p>
            </div>

            <div className="flex-1 px-6 py-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                Best for
              </p>
              <p className="mt-2 text-sm italic text-ink-700">{t.bestFor}</p>

              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                What ships
              </p>
              <ul className="mt-3 space-y-3">
                {t.features.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-ink-700"
                  >
                    <svg
                      className={cn(
                        'mt-0.5 h-3.5 w-3.5 shrink-0',
                        t.highlight ? 'text-accent-500' : 'text-brand-600',
                      )}
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
                href={t.ctaHref}
                className={cn(
                  'inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] px-5 py-2.5 text-sm font-semibold transition-colors duration-200',
                  t.highlight
                    ? 'bg-ink-900 text-white hover:bg-brand-600'
                    : 'border border-ink-300 bg-surface text-ink-900 hover:border-ink-900',
                )}
              >
                {t.ctaLabel}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-10 max-w-2xl text-sm text-ink-500">
        Volume discounts:{' '}
        <span className="font-semibold text-ink-900">5%</span> over 6 months,{' '}
        <span className="font-semibold text-ink-900">15%</span> over 12 months.
        Need a different shape &mdash; multilingual, white-label, editorial-
        only?{' '}
        <Link
          href="/contact-me/"
          className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
        >
          Request a custom quote
        </Link>
        .
      </p>
    </SectionRail>
  )
}
