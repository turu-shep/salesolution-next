import Link from 'next/link'

import { Eyebrow } from './Eyebrow'

/**
 * Dark closing band. The end-of-page CTA every long marketing route ends with.
 * Variant of CTABand specifically for the dark-tone treatment.
 */
export function FinalCTA() {
  return (
    <section className="bg-surface-dark text-ink-inverse">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 md:py-28">
        <Eyebrow className="text-brand-300">Let&rsquo;s talk</Eyebrow>
        <h2 className="mt-3 text-balance text-white">
          Find the one constraint capping your growth
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-300">
          15 minutes is enough to find the single biggest constraint on your
          growth engine. No sales pitch — just a straight read on what to fix.
        </p>
        <Link
          href="/book-growth-call/"
          data-cta="book_call__final_cta"
          data-cta-location="final_rail"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-brand-600 px-7 py-3.5 text-sm font-semibold text-white shadow-cta transition hover:bg-brand-700"
        >
          Book a strategy call
        </Link>
      </div>
    </section>
  )
}
