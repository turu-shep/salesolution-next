import Link from 'next/link'

import type { GlossaryTermCard } from '@/sanity/lib/glossary'

/**
 * The shared glossary term-card grid — used by the hub's cluster sections and
 * the /glossary/cluster/<slug>/ pages so both render identical cards. The
 * heading level is caller-controlled (h4 under the hub's h3 section labels, h3
 * on a cluster page under its h1) to keep the document outline correct.
 */
export function GlossaryCardGrid({
  terms,
  headingLevel = 'h3',
}: {
  terms: GlossaryTermCard[]
  headingLevel?: 'h2' | 'h3' | 'h4'
}) {
  const Heading = headingLevel
  return (
    <ul className="grid gap-px overflow-hidden rounded-[4px] border border-rule bg-rule sm:grid-cols-2">
      {terms.map((t) => (
        <li key={t._id}>
          <Link
            href={`/glossary/${t.slug}/`}
            className="group flex h-full flex-col bg-surface p-6 transition-colors duration-200 hover:bg-paper"
          >
            <Heading className="font-display text-lg font-semibold tracking-[-0.01em] text-ink-900 transition-colors duration-200 group-hover:text-brand-600">
              {t.term}
            </Heading>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-700">
              {t.shortDefinition}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  )
}
