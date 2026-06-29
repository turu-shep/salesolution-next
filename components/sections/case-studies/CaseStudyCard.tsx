import Link from 'next/link'

import type { CaseStudyCard as CaseStudyCardData } from '@/sanity/lib/case-studies'

import { MetricValue } from './MetricValue'
import { disclosureLabel, serviceMeta } from './service-meta'

/**
 * Hub / related-grid card. Leads with the headline metric and its source line
 * — the same "receipts" the featured band shows, so every card carries
 * provenance, not just the feature. A disclosure badge surfaces the honesty
 * differentiator at scan level. The whole card is the hit area.
 */
export function CaseStudyCard({ study }: { study: CaseStudyCardData }) {
  const primary = serviceMeta(study.primaryService)
  const services = [primary, ...(study.supportingServices ?? []).map(serviceMeta)]
  const metric = study.keyMetric

  return (
    <li
      id={study.slug}
      className="group relative flex scroll-mt-24 flex-col border border-rule bg-surface transition-all duration-200 hover:border-ink-900 hover:shadow-[0_24px_60px_-32px_rgba(15,20,30,0.28)]"
    >
      <div aria-hidden className={`h-1.5 w-full ${primary.dot}`} />
      <div className="flex flex-1 flex-col p-7 md:p-8">
        {study.engagementRole === 'anchor' && (
          <p className="mb-3 inline-flex w-fit items-center rounded-[3px] bg-ink-900 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white">
            Full engagement
          </p>
        )}
        {/* Descriptor + disclosure badge — the "is this me / can I trust it" row */}
        <div className="flex items-start justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            {study.client?.descriptor ?? 'Client'}
            {study.client?.scale && (
              <>
                <span aria-hidden className="mx-1.5 text-ink-300">&middot;</span>
                {study.client.scale}
              </>
            )}
          </p>
          <span className="shrink-0 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
            {disclosureLabel(study.disclosure)}
          </span>
        </div>

        {/* Headline metric + source line — the scannable receipt */}
        {metric && (
          <p className="mt-5 font-display text-5xl font-semibold leading-[0.95] tabular-nums tracking-[-0.03em] text-ink-900">
            {metric.prefix && <span className="text-accent-500">{metric.prefix}</span>}
            <MetricValue value={metric.value} />
            {metric.unit && <span className="text-ink-400">{metric.unit}</span>}
          </p>
        )}
        {metric && (
          <p className="mt-4 line-clamp-1 text-sm font-semibold leading-snug text-ink-900">
            {metric.label}
          </p>
        )}
        {metric?.sourceLine && (
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
            {metric.sourceLine}
          </p>
        )}

        {/* Story headline + one-line summary */}
        <h3 className="mt-6 border-t border-rule pt-6 font-display text-xl font-semibold leading-snug tracking-[-0.01em] text-ink-900">
          <Link href={`/case-studies/${study.slug}/`} className="focus:outline-none">
            <span aria-hidden className="absolute inset-0" />
            {study.title}
            {study.titleMuted && <> {study.titleMuted}</>}
          </Link>
        </h3>
        {study.summary && (
          <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-ink-700">
            {study.summary}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-rule pt-5 text-ink-500">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {services.map((s) => (
              <span key={s.href} className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em]">
                <span aria-hidden className={`inline-block h-2 w-2 ${s.dot}`} />
                {s.name}
              </span>
            ))}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
            {study.engagementWindow}
          </span>
        </div>
      </div>
    </li>
  )
}
