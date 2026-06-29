import type { Metadata } from 'next'

import { SectionRail } from '@/components/layout/SectionRail'
import { LeakProof } from '@/components/drafts/LeakProof'

/**
 * /drafts — parked components.
 *
 * A holding page for pieces pulled off live pages but worth keeping for reuse.
 * noindex (the `index: false` below also exempts it from the sitemap-registry
 * reconcile test), not linked in nav.
 */
export const metadata: Metadata = {
  title: 'Drafts — parked components',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://salesolution.net/drafts/' },
}

export default function DraftsPage() {
  return (
    <>
      <SectionRail tone="paper">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Drafts · parked
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.015em] text-ink-900 sm:text-4xl">
            Parked components
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-700">
            Pieces pulled from live pages, kept here for reuse. Not in the nav,
            noindex.
          </p>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
            From: homepage wedge (ProblemShift) · the two-leak proof ·
            parked 2026-06-28 for relocation to a &ldquo;why now&rdquo; beat.
          </p>
        </div>
      </SectionRail>

      <LeakProof />
    </>
  )
}
