import { SectionRail } from '@/components/layout/SectionRail'
import type {
  CaseStudyCard as CaseStudyCardData,
  CaseStudyEngagementRole,
} from '@/sanity/lib/case-studies'

import { CaseStudyCard } from './CaseStudyCard'

/**
 * Related case studies, two tiers. First, the rest of the SAME engagement —
 * the hub-and-spoke cross-link: when a client had a full-stack engagement, the
 * anchor (full overview) and each discipline cut point at one another, so a
 * reader can move between "the whole thing" and "just the replatform". The
 * copy adapts to where the reader is (on the anchor vs on a cut). Then, other
 * clients. Caller passes both lists pre-filtered.
 */
export function CaseStudyRelated({
  sameClient,
  others,
  currentRole,
  clientLabel,
  id,
}: {
  sameClient: CaseStudyCardData[]
  others: CaseStudyCardData[]
  currentRole?: CaseStudyEngagementRole
  clientLabel?: string
  id?: string
}) {
  if (sameClient.length === 0 && others.length === 0) return null

  // In a real engagement (anchor or cut), surface the anchor first and use
  // engagement-aware copy.
  const inEngagement = currentRole === 'anchor' || currentRole === 'cut'
  const ordered = inEngagement
    ? [...sameClient].sort(
        (a, b) =>
          Number(b.engagementRole === 'anchor') - Number(a.engagementRole === 'anchor'),
      )
    : sameClient

  const eyebrow =
    currentRole === 'anchor'
      ? 'The engagement, by discipline'
      : currentRole === 'cut'
        ? 'Part of a bigger engagement'
        : 'Same client, different service'
  const heading =
    currentRole === 'anchor'
      ? 'Every piece, written up on its own.'
      : currentRole === 'cut'
        ? `The rest of the ${clientLabel ?? 'same'} engagement.`
        : 'More from this engagement.'

  return (
    <SectionRail tone="paper" id={id}>
      {sameClient.length > 0 && (
        <div>
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              {eyebrow}
            </p>
            <h2 className="mt-3 font-display text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.015em] text-ink-900 sm:text-4xl">
              {heading}
            </h2>
          </div>
          <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ordered.map((s) => (
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
            <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.08] tracking-[-0.015em] text-ink-900 sm:text-4xl">
              Other distributors.{' '}
              <span className="text-ink-500">Same standard of proof.</span>
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
