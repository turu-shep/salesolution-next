import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Home § 08 — homepage-specific dark closing band.
 *
 * Cross-vertical close: one door per funnel, tagged by audience, keeping the
 * two funnels separate. Industrial → Book a Growth Call; local-service → the
 * Revenue Leak Audit (routes through /revenue-engine/, its own funnel home).
 * Both are framed as a diagnosis the owner keeps — the brand's honesty stance.
 *
 * The shared `FinalCTA` component is still used on 19 other routes; it stays
 * untouched. This variant uses the editorial rail language so the homepage
 * ends in the same voice it started.
 */
export function FinalCTARail() {
  return (
    <SectionRail tone="dark" size="lg">
      <div className="max-w-3xl">
        <h2 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-6xl">
          Find the hole. Then decide.
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
          Most owners think they need more leads. They usually don&rsquo;t. The
          calls that ring out and the quotes nobody chased are a bigger hole than
          the ad budget. Either way you leave with the numbers: the exact gap and
          the highest-payback fix, whether or not you hire us.
        </p>
      </div>

      <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
        <Link
          href="/book-growth-call/"
          data-cta="book_call__final_rail"
          data-cta-location="final_rail"
          className="group flex flex-col border border-white/15 bg-white/[0.03] transition-colors duration-200 hover:border-white/40"
        >
          <span aria-hidden className="h-1 w-full bg-brand-500" />
          <div className="flex flex-1 flex-col p-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-300">
              You sell a product
            </span>
            <span className="mt-2 inline-flex items-center gap-1.5 font-display text-xl font-semibold text-white">
              Book a Growth Call
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </span>
            <span className="mt-2 text-sm leading-relaxed text-ink-200">
              15 minutes, no pitch. We name the one constraint capping your
              growth and the change with the highest payback.
            </span>
          </div>
        </Link>

        <Link
          href="/industries/home-services/#audit"
          data-cta="revenue-leak-audit__final_rail"
          data-cta-location="final_rail"
          className="group flex flex-col border border-white/15 bg-white/[0.03] transition-colors duration-200 hover:border-white/40"
        >
          <span aria-hidden className="h-1 w-full bg-accent-500" />
          <div className="flex flex-1 flex-col p-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-500">
              You book jobs &amp; appointments
            </span>
            <span className="mt-2 inline-flex items-center gap-1.5 font-display text-xl font-semibold text-white">
              Revenue Leak Audit
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </span>
            <span className="mt-2 text-sm leading-relaxed text-ink-200">
              About 20 minutes. See the calls, quotes, and revenue slipping
              through right now &mdash; the numbers are yours to keep.
            </span>
          </div>
        </Link>
      </div>
    </SectionRail>
  )
}
