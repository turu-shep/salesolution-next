import { SectionRail } from '@/components/layout/SectionRail'
import type { CaseStudy } from '@/sanity/lib/case-studies'

import { MetricValue } from './MetricValue'

/**
 * Dark proof band — the page's one loud moment. The key metric set huge,
 * with its source line, and the client quote beside it. Dark tone marks it
 * as a distinct beat in the page rhythm, mirroring the homepage Evidence
 * section's role.
 */
export function CaseStudyProofBand({ study, id }: { study: CaseStudy; id?: string }) {
  const metric = study.keyMetric
  if (!metric) return null

  const attribution =
    study.disclosure === 'named' && study.quote?.name
      ? study.quote.name
      : study.quote?.role

  const attributionDetail =
    study.disclosure === 'named' && study.quote?.name
      ? study.quote?.role
      : [study.client?.descriptor, study.client?.scale].filter(Boolean).join(' · ')

  const hasQuote = Boolean(study.quote)

  return (
    <SectionRail tone="dark" glow="strong" id={id}>
      <div className={hasQuote ? 'grid gap-12 md:grid-cols-12 md:gap-16' : ''}>
        <div className={hasQuote ? 'md:col-span-5' : 'max-w-3xl'}>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            The number that mattered
          </p>
          <p className="mt-8 font-display text-6xl font-semibold leading-none tabular-nums tracking-[-0.03em] text-white sm:text-7xl md:text-8xl">
            {metric.prefix && <span className="text-accent-500">{metric.prefix}</span>}
            <MetricValue value={metric.value} />
            {metric.unit && <span className="text-ink-400">{metric.unit}</span>}
          </p>
          <p className="mt-5 font-display text-base font-semibold leading-snug text-white">
            {metric.label}
          </p>
          {metric.sourceLine && (
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-200">
              {metric.sourceLine}
            </p>
          )}
        </div>

        {hasQuote && study.quote && (
          <figure className="border-t border-white/10 pt-10 md:col-span-7 md:border-l md:border-t-0 md:pl-12 md:pt-0">
            <blockquote className="font-display text-2xl font-medium leading-snug text-white sm:text-3xl">
              <span aria-hidden className="mr-2 text-ink-400">&ldquo;</span>
              {study.quote.text}
              <span aria-hidden className="ml-1 text-ink-400">&rdquo;</span>
            </blockquote>
            <figcaption className="mt-6 text-sm text-ink-200">
              <span className="font-semibold text-white">{attribution}</span>
              {attributionDetail && (
                <>
                  <span aria-hidden className="mx-2 text-ink-400">&middot;</span>
                  <span>{attributionDetail}</span>
                </>
              )}
            </figcaption>
          </figure>
        )}
      </div>
    </SectionRail>
  )
}
