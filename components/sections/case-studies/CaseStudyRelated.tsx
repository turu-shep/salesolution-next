import { SectionRail } from '@/components/layout/SectionRail'
import type { CaseStudyCard as CaseStudyCardData } from '@/sanity/lib/case-studies'

import { CaseStudyCard } from './CaseStudyCard'

/**
 * Related case studies, two tiers: other stories from the SAME client first
 * (one engagement, told per service — the strongest cross-sell proof there
 * is), then other clients. Caller passes both lists pre-filtered.
 */
export function CaseStudyRelated({
  sameClient,
  others,
  id,
}: {
  sameClient: CaseStudyCardData[]
  others: CaseStudyCardData[]
  id?: string
}) {
  if (sameClient.length === 0 && others.length === 0) return null

  return (
    <SectionRail tone="paper" id={id}>
      {sameClient.length > 0 && (
        <div>
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              Same client, different service
            </p>
            <h2 className="mt-3 font-display text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.015em] text-ink-900 sm:text-4xl">
              More from this engagement.
            </h2>
          </div>
          <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sameClient.map((s) => (
              <CaseStudyCard key={s._id} study={s} />
            ))}
          </ul>
        </div>
      )}

      {others.length > 0 && (
        <div className={sameClient.length > 0 ? 'mt-20 border-t border-rule pt-16' : ''}>
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              More case studies
            </p>
            <h2 className="mt-3 font-display text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.015em] text-ink-900 sm:text-4xl">
              Adjacent verticals, same standard of proof.
            </h2>
          </div>
          <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => (
              <CaseStudyCard key={s._id} study={s} />
            ))}
          </ul>
        </div>
      )}
    </SectionRail>
  )
}
