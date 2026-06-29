import { SectionRail } from '@/components/layout/SectionRail'
import { PortableTextRenderer } from '@/components/portable-text/PortableTextRenderer'
import type { CaseStudy } from '@/sanity/lib/case-studies'

import { MetricPathChart } from './MetricPathChart'

/**
 * "What happened" — the results, with the metric path as the full-width
 * visual climax of the light half of the page. A short narrative lede sets up
 * the claim, then the chart (actual counts, dips included) lands beneath it at
 * full width — the proof element skeptical buyers trust most, sized to be the
 * payoff rather than a side figure.
 */
export function CaseStudyResults({ study, id }: { study: CaseStudy; id?: string }) {
  const hasNarrative =
    Array.isArray(study.resultsNarrative) && study.resultsNarrative.length > 0
  if (!hasNarrative && !study.chart) return null

  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          What happened
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.08] tracking-[-0.015em] text-ink-900 sm:text-4xl">
          The results.{' '}
          As measured, dips included.
        </h2>
      </div>

      {hasNarrative && (
        <div className="mt-10 max-w-2xl">
          <PortableTextRenderer value={study.resultsNarrative} />
        </div>
      )}

      {study.chart && <MetricPathChart chart={study.chart} className="mt-12 max-w-4xl" />}
    </SectionRail>
  )
}
