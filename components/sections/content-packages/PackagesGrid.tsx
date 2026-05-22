'use client'

import Link from 'next/link'
import { useCallback, useRef } from 'react'

import { SectionRail } from '@/components/layout/SectionRail'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/cn'
import { useTrackOnView } from '@/lib/use-track-on-view'

import {
  PACKAGE_TIERS,
  type PackageTier,
} from './package-tiers'

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
 *
 * Tier data lives in [./package-tiers.ts](./package-tiers.ts) so the
 * `productWithOffersSchema` JSON-LD on the server page can import it
 * without crossing a client-module boundary (which would otherwise return
 * a client-reference proxy and break server-side rendering).
 */

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
      <TrialStrip tier={trial} />

      {/* The monthly retainers grid — the actual centerpiece */}
      <ul className="mt-10 grid gap-6 lg:grid-cols-4 lg:gap-5">
        {monthly.map((t) => (
          <TierCard key={t.key} tier={t} />
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
          data-cta="contact__packages_custom_quote"
          data-cta-location="mid_body"
          className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
        >
          Request a custom quote
        </Link>
        .
      </p>
    </SectionRail>
  )
}

/**
 * Parse a USD price string like `$2,400` or `$15,000` into a number.
 * Drops the leading `$` and any thousands separators. Returns 0 if the
 * string doesn't contain a parseable integer (defensive — never expected).
 */
function parsePrice(price: string): number {
  const cleaned = price.replace(/[^0-9]/g, '')
  const n = parseInt(cleaned, 10)
  return Number.isFinite(n) ? n : 0
}

function TrialStrip({ tier }: { tier: PackageTier }) {
  const ref = useRef<HTMLDivElement>(null)
  const onView = useCallback(() => {
    track({
      name: 'pricing_tier_view',
      params: {
        tier_name: tier.key,
        tier_price: parsePrice(tier.price),
        tier_currency: 'USD',
      },
    })
  }, [tier])
  useTrackOnView(ref, onView)

  return (
    <div
      ref={ref}
      className="mt-12 flex flex-col gap-6 border-y border-rule bg-surface/60 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 md:mt-16"
    >
      <div className="flex-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {tier.tagline}
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold tracking-[-0.01em] text-ink-900 sm:text-2xl">
          {tier.name}
        </h3>
        <p className="mt-2 max-w-xl text-sm text-ink-700">
          {tier.bestFor}{' '}
          <span className="text-ink-500">
            {tier.features.slice(0, 3).join(' · ')}.
          </span>
        </p>
      </div>
      <div className="flex flex-col items-start gap-3 sm:items-end">
        <p className="font-display text-3xl font-semibold tabular-nums leading-none text-ink-900">
          {tier.price}
          <span className="ml-1 font-mono text-xs font-normal text-ink-500">
            {tier.cadence}
          </span>
        </p>
        <Link
          href={tier.ctaHref}
          data-cta={`book_call__pricing_card_${tier.key}`}
          data-cta-location="pricing_card"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
        >
          {tier.ctaLabel} <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  )
}

function TierCard({ tier }: { tier: PackageTier }) {
  const ref = useRef<HTMLLIElement>(null)
  const onView = useCallback(() => {
    track({
      name: 'pricing_tier_view',
      params: {
        tier_name: tier.key,
        tier_price: parsePrice(tier.price),
        tier_currency: 'USD',
      },
    })
  }, [tier])
  useTrackOnView(ref, onView)

  return (
    <li
      ref={ref}
      className={cn(
        'relative flex flex-col border bg-surface transition-shadow duration-200',
        tier.highlight
          ? 'border-ink-900 shadow-[0_30px_80px_-30px_rgba(15,20,30,0.30)] lg:-my-4'
          : 'border-rule hover:border-ink-700',
      )}
    >
      {tier.highlight && (
        <span className="absolute -top-3 left-6 inline-flex items-center rounded-[3px] bg-accent-500 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
          Most popular
        </span>
      )}

      <div
        className={cn(
          'border-b border-rule px-6 py-5',
          tier.highlight && 'lg:pt-7',
        )}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {tier.tagline}
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
          {tier.name}
        </h3>
        <p className="mt-3 font-display text-3xl font-semibold tabular-nums leading-none text-ink-900">
          {tier.price}
          <span className="ml-1 font-mono text-xs font-normal text-ink-500">
            {tier.cadence}
          </span>
        </p>
      </div>

      <div className="flex-1 px-6 py-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          Best for
        </p>
        <p className="mt-2 text-sm italic text-ink-700">{tier.bestFor}</p>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          What ships
        </p>
        <ul className="mt-3 space-y-3">
          {tier.features.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-sm text-ink-700"
            >
              <svg
                className={cn(
                  'mt-0.5 h-3.5 w-3.5 shrink-0',
                  tier.highlight ? 'text-accent-500' : 'text-brand-600',
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
          href={tier.ctaHref}
          data-cta={`book_call__pricing_card_${tier.key}`}
          data-cta-location="pricing_card"
          className={cn(
            'inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] px-5 py-2.5 text-sm font-semibold transition-colors duration-200',
            tier.highlight
              ? 'bg-ink-900 text-white hover:bg-brand-600'
              : 'border border-ink-300 bg-surface text-ink-900 hover:border-ink-900',
          )}
        >
          {tier.ctaLabel}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </li>
  )
}
