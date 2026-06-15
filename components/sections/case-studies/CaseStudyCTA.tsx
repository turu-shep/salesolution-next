import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Case-studies-specific closing band. A reader who has just finished sourced
 * proof is further down the funnel than a homepage visitor, so the close
 * converts the proof posture into the offer — "we'll measure your baseline
 * before we propose anything" — and offers the reference call the disclosure
 * copy already promises. Quiet glow so it doesn't compete with the featured
 * proof band above.
 */
export function CaseStudyCTA() {
  return (
    <SectionRail tone="dark" glow="quiet">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          Your catalog, same standard
        </p>
        <h2 className="mt-4 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Want a number like these for your catalog?
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-200">
          Held to the same standard as the studies above: we measure where you
          stand today — organic and AI-search visibility across your top
          categories — and show you the baseline before we propose a thing.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/unlock-growth-audit/"
            data-cta="audit__final_rail"
            data-cta-location="final_rail"
            className="inline-flex items-center justify-center rounded-[4px] bg-white px-6 py-3 text-sm font-semibold text-ink-900 transition-colors duration-200 hover:bg-paper"
          >
            Measure my baseline
          </Link>
          <Link
            href="/book-growth-call/"
            data-cta="book_call__final_rail"
            data-cta-location="final_rail"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/85 underline decoration-white/20 underline-offset-[6px] transition-colors duration-200 hover:text-white hover:decoration-white"
          >
            Or book a call and ask for a reference
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </SectionRail>
  )
}
