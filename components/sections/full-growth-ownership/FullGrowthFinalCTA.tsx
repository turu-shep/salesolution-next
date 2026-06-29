import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/full-growth-ownership/ § 8 — Final CTA.
 *
 * Page-specific dark closing band. The primary path is the qualifier (a
 * 3-question intake; currently routed to /contact-me/ until the dedicated
 * form ships) and the secondary path is the existing 30-min growth call.
 */
export function FullGrowthFinalCTA() {
  return (
    <SectionRail tone="dark" size="lg">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
          Three questions &middot; written quote within 24 hours
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-6xl">
          Three questions. One personal reply.
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
          The qualifier takes under 3 minutes. We respond personally
          &mdash; no SDR loop, no drip sequence, no chasing.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/full-growth-quote/"
            data-cta="full_growth__final_rail"
            data-cta-location="final_rail"
            className="inline-flex items-center justify-center rounded-[4px] bg-white px-6 py-3 text-sm font-semibold text-ink-900 transition-colors duration-200 hover:bg-paper"
          >
            Get a quote
          </Link>
          <Link
            href="/book-growth-call/"
            data-cta="book_call__full_growth_final_rail"
            data-cta-location="final_rail"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/85 underline decoration-white/20 underline-offset-[6px] transition-colors duration-200 hover:text-white hover:decoration-white"
          >
            Or book a 30-min call instead
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </SectionRail>
  )
}
