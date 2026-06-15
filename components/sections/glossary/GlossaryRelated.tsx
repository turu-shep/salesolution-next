import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import type { GlossaryTerm } from '@/sanity/lib/glossary'

type RelatedTerm = NonNullable<GlossaryTerm['relatedTerms']>[number]

/**
 * /glossary/[term]/ — "Related terms" rail.
 *
 * Renders the explicit `relatedTerms` references. Failures upstream degrade
 * to an empty list, so the component simply renders nothing — never blocks
 * the definition above it.
 */
export function GlossaryRelated({ terms }: { terms?: RelatedTerm[] }) {
  const items = (terms ?? []).filter((t) => t?.slug)
  if (items.length === 0) return null

  return (
    <SectionRail tone="surface" size="sm">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
        Related terms
      </p>
      <ul className="mt-6 grid gap-px overflow-hidden rounded-[4px] border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <li key={t._id}>
            <Link
              href={`/glossary/${t.slug}/`}
              className="group flex h-full flex-col bg-surface p-5 transition-colors duration-200 hover:bg-paper"
            >
              <h3 className="font-display text-base font-semibold tracking-[-0.01em] text-ink-900 transition-colors duration-200 group-hover:text-brand-600">
                {t.term}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-700">
                {t.shortDefinition}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </SectionRail>
  )
}
