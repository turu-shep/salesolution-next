import type { CaseStudyCard as CaseStudyCardData } from '@/sanity/lib/case-studies'

import { MetricValue } from './MetricValue'
import { serviceMeta } from './service-meta'

/**
 * Self-identification index — "find the closest to you." A scannable,
 * clickable row of every study by vertical + its headline number, so a
 * reader (a fastener distributor, say) lands on their peer in one click
 * instead of reading the whole grid linearly. Anchors to each study's
 * section id (the featured band and every card carry one).
 */
export function CaseStudyIndex({ studies }: { studies: CaseStudyCardData[] }) {
  if (studies.length < 2) return null

  return (
    <nav aria-label="Jump to a case study" className="mt-14 border-t border-rule pt-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
        {studies.length} engagements · find the closest to you
      </p>
      <ul className="mt-5 flex flex-wrap gap-3">
        {studies.map((study) => {
          const primary = serviceMeta(study.primaryService)
          const metric = study.keyMetric
          return (
            <li key={study._id}>
              <a
                href={`#${study.slug}`}
                className="group inline-flex items-center gap-2.5 border border-rule bg-surface px-3.5 py-2 transition-colors hover:border-ink-900"
              >
                <span aria-hidden className={`h-2 w-2 shrink-0 ${primary.dot}`} />
                <span className="text-sm font-medium text-ink-700 transition-colors group-hover:text-ink-900">
                  {study.client?.descriptor ?? 'Case study'}
                </span>
                {metric && (
                  <span className="font-display text-sm font-semibold tabular-nums text-ink-900">
                    {metric.prefix && <span className="text-accent-500">{metric.prefix}</span>}
                    <MetricValue value={metric.value} />
                    {metric.unit && <span className="text-ink-400">{metric.unit}</span>}
                  </span>
                )}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
