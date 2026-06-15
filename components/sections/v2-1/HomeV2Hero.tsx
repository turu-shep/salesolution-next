import Link from 'next/link'

import { CompositeBar } from '@/components/services/CompositeBar'

/**
 * /v2-1/ — Hero.
 *
 * Top-to-bottom anatomy:
 *   A. Composite 5-color bar (visual signature)
 *   B. Trust strip — sharper headline + 4 client-archetype mini-cards
 *      (placeholder-safe credibility signal, swap for real logos later)
 *   C. Scarcity badge — subtle red dot + slot counter (NOT a blinking banner)
 *   D. Eyebrow
 *   E. Headline (two-tone, large display) + before/after artifact (lg+)
 *   F. Lede
 *   G. TL;DR strip — 3 bullets with service-color top borders
 *   H. Triple CTA — primary call + mid-friction calculator + ghost services link
 *
 * The mid-friction CTA is the conversion key: buyers who aren't ready
 * for a 15-min call get an interactive way to engage. The third (ghost)
 * link catches non-catalog buyers who'd be lost to a catalog-only anchor.
 */

type TldrBullet = {
  title: string
  body: string
  borderClass: string
  iconClass: string
}

// Service-color top borders cycle through catalog (teal), editorial (amber),
// search (deep blue) so the TL;DR visually echoes the system colors.
const TLDR: TldrBullet[] = [
  {
    title: 'Priced in public',
    body: 'From $3 / SKU on catalog work, $4–$15K / mo retainers.',
    borderClass: 'border-t-service-catalog-500',
    iconClass: 'text-service-catalog-700',
  },
  {
    title: 'Free catalog snapshot',
    body: '5 of your products rewritten in 48 hours, no follow-up sequence.',
    borderClass: 'border-t-service-editorial-500',
    iconClass: 'text-service-editorial-700',
  },
  {
    title: '30-day exit',
    body: 'No 12-month contracts on retainer work. Cancel anytime after month one.',
    borderClass: 'border-t-service-search-500',
    iconClass: 'text-service-search-700',
  },
]

// Client-archetype mini-cards. Each conveys a credible engagement profile
// without naming a real account — when logo permissions land, swap the
// revenue/descriptor pair for an `<Image>` in the same slot.
type ClientArchetype = {
  revenue: string
  descriptor: string
}

const ARCHETYPES: ClientArchetype[] = [
  { revenue: '$8M ARR',  descriptor: 'Hydraulics distributor' },
  { revenue: '$14M ARR', descriptor: 'MRO supplier' },
  { revenue: '$22M ARR', descriptor: 'Industrial automation' },
  { revenue: '+ 12 more', descriptor: 'Active engagements' },
]

export function HomeV2Hero() {
  return (
    <section data-section-tone="light" className="relative bg-paper">
      {/* A. Composite color bar — signature strip at the very top */}
      <CompositeBar weight="hero" />

      {/* B. Trust strip — sharpened headline ties into the archetype cards on
          the right. Mini-cards stand in for real logos until permissions
          arrive; same layout slots, so swap is mechanical. */}
      <div className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-8 lg:px-8">
          <p className="max-w-sm font-mono text-[11px] uppercase leading-relaxed tracking-[0.16em] text-ink-700">
            Trusted by industrial distributors. Aggregate{' '}
            <span className="text-ink-900">$300M+ ARR</span> across{' '}
            <span className="text-ink-900">16 active engagements</span>.
          </p>
          <ul className="flex flex-wrap items-stretch gap-x-0 gap-y-3">
            {ARCHETYPES.map((archetype, i) => (
              <li
                key={archetype.revenue}
                className={`flex w-[120px] flex-col justify-center px-4 ${
                  i === 0 ? '' : 'border-l border-rule'
                }`}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-500">
                  {archetype.revenue}
                </span>
                <span className="mt-1 text-xs leading-snug text-ink-700">
                  {archetype.descriptor}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 md:pb-28 md:pt-20 lg:px-8">
        {/* C. Scarcity badge — operator credibility, not a flashing banner */}
        <div className="inline-flex items-center gap-2 border border-rule bg-surface px-2.5 py-1.5">
          <span aria-hidden className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger-500 opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-danger-500" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-700">
            2 new client slots <span className="text-ink-400">·</span> Q2 2026{' '}
            <span className="text-ink-400">·</span>{' '}
            <span className="text-danger-500">1 remaining</span>
          </span>
        </div>

        {/* Two-column wrap for lg+: hero copy left, before/after artifact
            right, vertically centered. On mobile/tablet, the artifact is
            hidden — it would push CTAs too far down the fold. */}
        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            {/* D. Eyebrow */}
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              Industrial e-commerce growth
            </p>

            {/* E. Headline — bold sentence 1, muted sentence 2 */}
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.02] tracking-[-0.02em] text-ink-900 sm:text-6xl md:text-7xl">
              From $3 a SKU to a $20K/mo growth function.{' '}
              <span className="text-ink-500">Pick your entry point.</span>
            </h1>

            {/* F. Lede */}
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-700 md:text-xl">
              AI search engineering, catalog rewrites at SKU scale, editorial
              authority content, performance e-commerce builds, and
              deliverability-first outbound. One operator-led team for
              industrial distributors with $2&ndash;25M ARR.
            </p>

            {/* G. TL;DR strip — 3 bullets, each anchored by a service-color rule */}
            <ul className="mt-12 grid gap-px overflow-hidden border border-rule bg-rule md:grid-cols-3">
              {TLDR.map((bullet) => (
                <li
                  key={bullet.title}
                  className={`flex flex-col gap-2 border-t-2 bg-surface p-5 ${bullet.borderClass}`}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className={`h-4 w-4 shrink-0 ${bullet.iconClass}`}
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
                    <span className="font-display text-base font-semibold text-ink-900">
                      {bullet.title}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-700">
                    {bullet.body}
                  </p>
                </li>
              ))}
            </ul>

            {/* H. Triple CTA stack —
                  1. Primary book-call (loudest)
                  2. Mid-friction calculator (medium, catalog-specific)
                  3. Ghost link to full services grid (catches non-catalog buyers) */}
            <div className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/book-growth-call/"
                data-cta="book_call__v2_hero"
                data-cta-location="hero"
                className="inline-flex items-center justify-center rounded-[4px] bg-brand-600 px-7 py-4 text-base font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
              >
                Book a 15-min strategy call
              </Link>
              <a
                href="#calculator"
                data-cta="calculator__v2_hero"
                data-cta-location="hero"
                className="inline-flex items-center justify-center gap-2 rounded-[4px] bg-ink-900 px-7 py-4 text-base font-semibold text-white transition-colors duration-200 hover:bg-ink-800"
              >
                <span aria-hidden>&darr;</span>
                Try the catalog price calculator
              </a>
            </div>

            {/* Tertiary ghost link — small text button, catches buyers who
                aren't in the catalog funnel. */}
            <div className="mt-5">
              <a
                href="#services-grid"
                data-cta="services_grid__v2_hero"
                data-cta-location="hero"
                className="text-sm font-semibold text-ink-700 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600"
              >
                <span aria-hidden>&darr;</span> See all 6 service prices
              </a>
            </div>
          </div>

          {/* Right column — mini before/after artifact widget. Hidden below
              lg; on lg+ it sits beside the headline and gives the otherwise
              all-text hero a visual anchor that demonstrates concrete output
              and threads the catalog teal color. */}
          <aside
            aria-label="Catalog rewrite sample — before and after"
            className="hidden lg:col-span-5 lg:flex lg:items-center"
          >
            <div className="w-full max-w-[360px] rounded-md border border-rule bg-surface shadow-sm">
              {/* BEFORE — manufacturer plain copy */}
              <div className="p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  <span aria-hidden className="mr-1 text-ink-400">&#x2572;</span>
                  Before
                </p>
                <p className="mt-3 text-sm italic leading-relaxed text-ink-500">
                  &ldquo;1/2&Prime; NPT-JIC adapter. 37&deg; flare. Steel.&rdquo;
                </p>
              </div>

              {/* Catalog-teal divider ties the artifact to the catalog tier */}
              <div aria-hidden className="h-px w-full bg-service-catalog-500" />

              {/* AFTER — Pro-tier rewrite */}
              <div className="p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-service-catalog-700">
                  <span aria-hidden className="mr-1">&uarr;</span>
                  After &middot; Pro tier
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-900">
                  Carbon steel adapter connecting 1/2&Prime; female NPT to male
                  JIC 37&deg; flare. Used in high-pressure hydraulic systems
                  rated above 3,000 PSI&hellip;
                </p>
                <p className="mt-4 border-t border-rule pt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-service-catalog-700">
                  + 4 FAQ pairs &middot; schema &middot; 100% editor reviewed
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
