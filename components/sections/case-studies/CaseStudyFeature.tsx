import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import type { CaseStudyCard as CaseStudyCardData } from '@/sanity/lib/case-studies'

import { CountMetric } from './CountMetric'
import { MetricValue } from './MetricValue'
import { disclosureLabel, serviceMeta } from './service-meta'

/**
 * Hub anchor — the featured study as a full-width dark band so the page opens
 * on its single loudest proof. Desktop: narrative + CTA stacked left, the
 * headline metric and at-a-glance stats on the right. Mobile: the proof
 * (number → stats) leads, then the CTA — so the number lands as the payoff of
 * the sentence rather than stranded below a button.
 */
export function CaseStudyFeature({ study, id }: { study: CaseStudyCardData; id?: string }) {
  const primary = serviceMeta(study.primaryService)
  const services = [primary, ...(study.supportingServices ?? []).map(serviceMeta)]
  const metric = study.keyMetric
  const href = `/case-studies/${study.slug}/`

  return (
    <SectionRail tone="dark" size="lg" glow="strong" id={id}>
      <div className="grid gap-x-12 gap-y-12 lg:grid-cols-2">
        {/* A — narrative (desktop: top-left · mobile: first) */}
        <div className="lg:col-start-1 lg:row-start-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            Featured case study
            {study.client?.descriptor && (
              <>
                <span aria-hidden className="mx-2 text-ink-500">/</span>
                {study.client.descriptor}
                {study.client.scale && ` · ${study.client.scale}`}
              </>
            )}
          </p>

          <h2 className="mt-5 font-display text-balance text-4xl font-semibold leading-[1.06] tracking-[-0.02em] text-white sm:text-5xl">
            <Link href={href} className="transition-colors hover:text-ink-200">
              {study.title}
              {study.titleMuted && <> {study.titleMuted}</>}
            </Link>
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-200">
            {study.summary}
          </p>
        </div>

        {/* B — proof (desktop: right, spans both rows · mobile: second) */}
        <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start lg:border-l lg:border-white/10 lg:pl-12">
          {metric && (
            <div>
              <p className="font-display text-6xl font-semibold leading-[0.9] tabular-nums tracking-[-0.03em] text-white sm:text-7xl lg:text-8xl">
                <CountMetric prefix={metric.prefix} value={metric.value} unit={metric.unit} />
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
          )}

          {study.stats?.length > 0 && (
            <>
              <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
                At a glance
              </p>
              <ul className="mt-3 grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10">
                {study.stats.map((stat) => (
                  <li key={stat._key} className="flex flex-col gap-1.5 bg-surface-dark p-4">
                    <p className="font-display text-2xl font-semibold leading-none tabular-nums tracking-[-0.02em] text-white">
                      <MetricValue value={stat.value} />
                    </p>
                    <p className="text-[13px] leading-snug text-ink-200">{stat.label}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* C — action (desktop: bottom-left · mobile: last) */}
        <div className="lg:col-start-1 lg:row-start-2">
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-[4px] bg-white px-6 py-3 text-sm font-semibold text-ink-900 transition-colors duration-200 hover:bg-paper"
          >
            See how it was measured
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center rounded-[3px] border border-white/15 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300">
              {disclosureLabel(study.disclosure)}
            </span>
            {services.map((s) => (
              <span
                key={s.href}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-200"
              >
                <span aria-hidden className={`inline-block h-2 w-2 ${s.dotLight}`} />
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </SectionRail>
  )
}
