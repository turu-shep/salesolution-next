import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Home § 07 — homepage-specific dark closing band.
 *
 * The shared `FinalCTA` component is still used on 19 other routes; it
 * stays untouched. This variant uses the editorial rail language so the
 * homepage ends in the same voice it started.
 */
export function FinalCTARail() {
  return (
    <SectionRail tone="dark" size="lg">
      <div className="max-w-3xl">
        <h2 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-6xl">
          15 minutes. The one constraint.
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
          Book a 15-minute strategy call. No sales pitch &mdash; we&rsquo;ll
          name the single constraint capping your growth right now and the
          one change with the highest payback.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/book-growth-call/"
            data-cta="book_call__final_rail"
            data-cta-location="final_rail"
            className="inline-flex items-center justify-center rounded-[4px] bg-white px-6 py-3 text-sm font-semibold text-ink-900 transition-colors duration-200 hover:bg-paper"
          >
            Book a strategy call
          </Link>
          <Link
            href="/unlock-growth-audit/"
            data-cta="audit__final_rail"
            data-cta-location="final_rail"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/85 underline decoration-white/20 underline-offset-[6px] transition-colors duration-200 hover:text-white hover:decoration-white"
          >
            Or get the free written audit
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </SectionRail>
  )
}
