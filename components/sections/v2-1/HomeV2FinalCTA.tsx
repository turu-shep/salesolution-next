import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /v2-1/ — Dual-CTA close.
 *
 * Two cards at different friction levels side by side. Card A is the
 * conversion-key low-friction path (email-only PDF snapshot, no call).
 * Card B is the canonical high-friction path (15-min call with the
 * operator). Equal visual weight — buyer self-selects.
 *
 * Below both cards, a third no-friction escape hatch (read the checklist,
 * no email needed) for users who aren&rsquo;t ready for either CTA.
 */

export function HomeV2FinalCTA() {
  return (
    <SectionRail tone="dark" size="lg">
      <div className="max-w-3xl">
        <h2 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Two ways to start.{' '}
          <span className="text-ink-400">Pick the friction you want.</span>
        </h2>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-2 lg:gap-6">
        {/* Card A — LOW FRICTION */}
        <div className="flex flex-col border border-white/10 bg-black/30 p-7 backdrop-blur">
          <div className="h-1 w-12 bg-service-catalog-500" aria-hidden />
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-service-catalog-500">
            Low friction &middot; No call required
          </p>
          <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.01em] text-white">
            Get the catalog snapshot.
          </h3>
          <p className="mt-4 text-base leading-relaxed text-ink-300">
            Send your URL + SKU count. We rewrite 5 of your products under
            Standard + Pro and send back a side-by-side PDF in 48 hours. No
            follow-up sequence.
          </p>

          <div className="mt-auto pt-8">
            <Link
              href="/catalog-snapshot/"
              data-cta="catalog_snapshot__v2_final"
              data-cta-location="final_rail"
              className="inline-flex items-center justify-center gap-2 rounded-[4px] bg-service-catalog-500 px-6 py-3.5 text-base font-semibold text-white transition-opacity duration-200 hover:opacity-90"
            >
              Get the free snapshot <span aria-hidden>&rarr;</span>
            </Link>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
              Email only &middot; 48 hr &middot; No call required
            </p>
          </div>
        </div>

        {/* Card B — HIGH FRICTION */}
        <div className="flex flex-col border border-white/10 bg-black/30 p-7 backdrop-blur">
          <div className="h-1 w-12 bg-brand-500" aria-hidden />
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-500">
            Book a call &middot; 15 min
          </p>
          <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.01em] text-white">
            Talk to the operator.
          </h3>
          <p className="mt-4 text-base leading-relaxed text-ink-300">
            15-minute strategy call with Artur directly. We talk through your
            specific situation, you get an honest first-call recommendation,
            no sales pitch.
          </p>

          <div className="mt-auto pt-8">
            <Link
              href="/book-growth-call/"
              data-cta="book_call__v2_final"
              data-cta-location="final_rail"
              className="inline-flex items-center justify-center gap-2 rounded-[4px] bg-brand-600 px-6 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-brand-700"
            >
              Book a 15-min call <span aria-hidden>&rarr;</span>
            </Link>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
              Direct calendar &middot; No SDR &middot; No discovery questions
            </p>
          </div>
        </div>
      </div>

      <p className="mt-10 text-sm text-ink-300">
        Not ready for either? Read the{' '}
        <Link
          href="/future-proof-your-seo/"
          className="font-semibold text-white underline decoration-white/30 underline-offset-[5px] transition-colors duration-200 hover:decoration-white"
        >
          free GEO checklist
        </Link>{' '}
        &mdash; no email required.
      </p>
    </SectionRail>
  )
}
