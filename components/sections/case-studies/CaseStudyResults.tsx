import { SectionRail } from '@/components/layout/SectionRail'
import { PortableTextRenderer } from '@/components/portable-text/PortableTextRenderer'
import type { CaseStudy } from '@/sanity/lib/case-studies'

import { MetricPathChart } from './MetricPathChart'

/**
 * "What happened" — the results narrative beside the raw metric path.
 * The chart shows actual counts (including flat months), not a stylized
 * curve: a trajectory with visible texture is the proof element skeptical
 * buyers trust most.
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
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          The results.{' '}
          <span className="text-ink-500">As measured, dips included.</span>
        </h2>
      </div>

      {study.chart ? (
        <div className="mt-12 grid gap-y-10 md:grid-cols-12 md:gap-x-10">
          <div className="md:col-span-5">
            <PortableTextRenderer value={study.resultsNarrative} />
          </div>
          <MetricPathChart chart={study.chart} className="md:col-span-7" />
        </div>
      ) : (
        <div className="mt-12 max-w-2xl">
          <PortableTextRenderer value={study.resultsNarrative} />
        </div>
      )}
    </SectionRail>
  )
}
