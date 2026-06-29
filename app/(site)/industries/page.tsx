import type { Metadata } from 'next'

import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { IndustriesShowcase } from '@/components/sections/IndustriesShowcase'

/**
 * /industries/ — the cross-vertical index (the "Industries" nav item lands here).
 *
 * The front door for the audience axis: a one-line positioning h1, the
 * IndustriesShowcase (image-topped audience cards, brand-graded photos), then
 * the two-door close. Each card routes to its own hub, keeping the industrial
 * and Revenue Engine funnels separate. NOTE: IndustriesShowcase keeps its own
 * AUDIENCES copy mirroring the homepage WhoWeServe — re-sync if that changes.
 */

export const metadata: Metadata = {
  title: 'Industries · Pick the engine for your business',
  description:
    'Industrial distribution, home services, medical & aesthetics, and consumer brands — the four businesses we build Revenue Engines for. The leak looks different in each; find the version that is yours.',
  alternates: { canonical: 'https://salesolution.net/industries/' },
}

export default function IndustriesPage() {
  return (
    <>
      <section className="relative bg-paper">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-16 sm:px-6 md:pb-12 md:pt-24 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Industries
          </p>
          <h1 className="mt-4 font-display text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.02em] text-ink-900 sm:text-5xl">
            Pick the engine for your business.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-700 md:text-xl">
            We build one Revenue Engine per business. For a distributor it wins
            the search and the quote. For a roofer or a dental practice it
            answers the call, books the job, and chases what stalls. The leak
            looks different in each &mdash; find the version that&rsquo;s yours.
          </p>
        </div>
      </section>

      <IndustriesShowcase />

      <FinalCTARail />
    </>
  )
}
