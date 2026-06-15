import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import type { RelatedTermCard } from '@/sanity/lib/career-paths'

/**
 * /career-paths/[slug]/ — "Key terms" rail linking into the glossary.
 *
 * The wiki connective tissue: a path references the glossary terms it uses,
 * sending readers (and link equity) into the citable glossary. Renders
 * nothing when a path has no related terms, so the page falls straight
 * through to the sibling-paths rail.
 */
export function PathTerms({ terms }: { terms?: RelatedTermCard[] }) {
  const items = (terms ?? []).filter((t) => t?.slug)
  if (items.length === 0) return null

  return (
    <SectionRail tone="surface" size="sm">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
        Key terms in this path
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
