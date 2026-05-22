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
          Free, no sales pitch. We&rsquo;ll review your top product
          categories against the AI-Readiness checklist and tell you the
          single change with the highest payback.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/unlock-growth-audit/"
            className="inline-flex items-center justify-center rounded-[4px] bg-white px-6 py-3 text-sm font-semibold text-ink-900 transition-colors duration-200 hover:bg-paper"
          >
            Get the free audit
          </Link>
          <Link
            href="/book-growth-call/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/85 underline decoration-white/20 underline-offset-[6px] transition-colors duration-200 hover:text-white hover:decoration-white"
          >
            Or book a strategy call
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </SectionRail>
  )
}
