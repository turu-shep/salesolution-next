import Link from 'next/link'

import { CompositeBar } from '@/components/services/CompositeBar'

/**
 * /v2-1/ — Hero.
 *
 * Top-to-bottom anatomy:
 *   A. Composite 5-color bar (visual signature)
 *   B. Trust strip — "$300M+ shipped" + grayscale logo placeholders
 *   C. Scarcity badge — subtle red dot + slot counter (NOT a blinking banner)
 *   D. Eyebrow
 *   E. Headline (two-tone, large display)
 *   F. Lede
 *   G. TL;DR strip — 3 bullets with service-color top borders
 *   H. Dual CTA — primary call + mid-friction "calculate price" anchor
 *
 * The mid-friction CTA is the conversion key: buyers who aren't ready
 * for a 15-min call get an interactive way to engage by jumping to the
 * calculator below.
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

const LOGOS = [
  'NORTHERN HYDRAULICS',
  'INDUSTRIAL CO',
  'FLUID DYNAMICS',
  '+ 12 MORE',
]

export function HomeV2Hero() {
  return (
    <section data-section-tone="light" className="relative bg-paper">
      {/* A. Composite color bar — signature strip at the very top */}
      <CompositeBar weight="hero" />

      {/* B. Trust strip — placeholder-styled logos sit in a row that can be
          swapped for real client marks later without re-flowing the hero. */}
      <div className="border-b border-rule bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-700">
            Trusted by industrial distributors shipping{' '}
            <span className="text-ink-900">$300M+</span> in annual revenue
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {LOGOS.map((logo) => (
              <li
                key={logo}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400"
              >
                {logo}
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

        {/* D. Eyebrow */}
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Industrial e-commerce growth
        </p>

        {/* E. Headline — bold sentence 1, muted sentence 2 */}
        <h1 className="mt-4 max-w-5xl font-display text-5xl font-semibold leading-[1.02] tracking-[-0.02em] text-ink-900 sm:text-6xl md:text-7xl">
          From $3 a SKU to a $20K/mo growth function.{' '}
          <span className="text-ink-500">Pick your entry point.</span>
        </h1>

        {/* F. Lede */}
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-700 md:text-xl">
          AI search engineering, catalog rewrites at SKU scale, editorial
          authority content, performance e-commerce builds, and
          deliverability-first outbound. One operator-led team for industrial
          distributors with $2&ndash;25M ARR.
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

        {/* H. Dual CTA row */}
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
            Calculate your catalog price
          </a>
        </div>
      </div>
    </section>
  )
}
