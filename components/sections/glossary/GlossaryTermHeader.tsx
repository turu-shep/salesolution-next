import Link from 'next/link'

import type { GlossaryTerm } from '@/sanity/lib/glossary'

/**
 * /glossary/[term]/ — header.
 *
 * The first block on the page IS the short definition, rendered verbatim and
 * unadorned above any prose — this is the passage AI answer engines lift and
 * attribute, so nothing competes with it for the top of the page.
 */
export function GlossaryTermHeader({ term }: { term: GlossaryTerm }) {
  const aliases = term.aliases?.filter(Boolean) ?? []

  return (
    <section data-section-tone="light" className="relative bg-paper">
      <div className="mx-auto max-w-3xl px-4 pb-10 pt-16 sm:px-6 md:pt-24 lg:px-8">
        <nav aria-label="Breadcrumb" className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          <Link href="/glossary/" className="hover:text-brand-600">
            Glossary
          </Link>
        </nav>

        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink-900 sm:text-5xl">
          {term.term}
        </h1>

        {aliases.length > 0 && (
          <p className="mt-3 text-sm text-ink-500">
            Also: {aliases.join(', ')}
          </p>
        )}

        <p className="mt-8 border-l-2 border-brand-600 bg-surface-tint-blue px-5 py-4 text-xl leading-[1.6] text-pretty text-ink-800">
          {term.shortDefinition}
        </p>

        {term.lastReviewed && (
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            Reviewed {formatReviewed(term.lastReviewed)}
          </p>
        )}
      </div>
    </section>
  )
}

function formatReviewed(date: string): string {
  // `lastReviewed` is a Sanity date string (YYYY-MM-DD). Parse the parts
  // directly to avoid timezone drift from `new Date('YYYY-MM-DD')`.
  const [year, month] = date.split('-')
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const monthName = months[Number(month) - 1]
  return monthName ? `${monthName} ${year}` : year
}
