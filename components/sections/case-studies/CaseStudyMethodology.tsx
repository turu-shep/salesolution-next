import { SectionRail } from '@/components/layout/SectionRail'
import type { CaseStudy } from '@/sanity/lib/case-studies'

import { disclosureCopy } from './service-meta'

/**
 * "How these numbers were measured" — one method line per metric, then the
 * disclosure note for the page's disclosure mode (named / anonymized /
 * composite). This section is deliberately quiet: methodology stated in
 * mono small-type reads like an instrument label, which is the point.
 *
 * It also keeps the disclaimer page honest — composites must be "clearly
 * marked where they appear", and this is where the marking happens.
 */
export function CaseStudyMethodology({ study, id }: { study: CaseStudy; id?: string }) {
  const items = study.methodology ?? []
  const note =
    study.disclosureNote ??
    disclosureCopy(study.disclosure, study.client?.descriptor ?? 'client')

  if (items.length === 0 && !note) return null

  return (
    <SectionRail tone="surface" size="sm" id={id}>
      <div className="grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Measurement notes
          </p>
          <h2 className="mt-3 font-display text-balance text-2xl font-semibold leading-snug tracking-[-0.01em] text-ink-900 sm:text-3xl">
            How these numbers were measured.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-500">
            A metric without a source is an assertion. Every number on this
            page is listed below with how it was counted.
          </p>
        </div>

        <div className="md:col-span-8 lg:col-span-7">
          {items.length > 0 && (
            <dl>
              {items.map((item) => (
                <div
                  key={item._key}
                  className="grid gap-2 border-t border-rule py-5 first:border-t-0 first:pt-0 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6"
                >
                  <dt className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-ink-500">
                    {item.metric}
                  </dt>
                  <dd className="text-sm leading-relaxed text-ink-700">{item.method}</dd>
                </div>
              ))}
            </dl>
          )}

          <p className="mt-2 border-t border-rule-strong pt-5 text-sm leading-relaxed text-ink-700">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              {study.disclosure === 'composite'
                ? 'Composite disclosure. '
                : study.disclosure === 'named'
                  ? 'Attribution. '
                  : 'Anonymity. '}
            </span>
            {note}
          </p>
        </div>
      </div>
    </SectionRail>
  )
}
