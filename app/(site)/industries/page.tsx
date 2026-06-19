import type { Metadata } from 'next'

import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { WhoWeServe } from '@/components/sections/WhoWeServe'

/**
 * /industries/ — the cross-vertical index ("Who We Serve" lands here).
 *
 * The front door for the audience axis: a one-line positioning h1, then the
 * shared WhoWeServe splitter (canonical audience cards, kept in sync with the
 * homepage), then the two-door close. Each card routes to its own hub, keeping
 * the industrial and Revenue Engine funnels separate.
 */

export const metadata: Metadata = {
  title: 'Who we serve · Industries',
  description:
    'Industrial distribution, home services, dental practices, and local retail — the businesses I run growth for. The leak looks different in each; find the version that is yours.',
  alternates: { canonical: 'https://salesolution.net/industries/' },
}

export default function IndustriesPage() {
  return (
    <>
      <section className="relative bg-paper">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 md:pb-16 md:pt-24 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Industries
          </p>
          <h1 className="mt-4 font-display text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.02em] text-ink-900 sm:text-5xl lg:text-6xl">
            Revenue systems for businesses that sell parts, book jobs, and fill chairs.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-700 md:text-xl">
            One operator, four playbooks. Whether you&rsquo;re a distributor, a
            contractor, a dental practice, or a local showroom, the leak looks
            different &mdash; and so does the fix. Find the version that&rsquo;s
            yours.
          </p>
        </div>
      </section>

      <WhoWeServe />

      <FinalCTARail />
    </>
  )
}
