import Link from 'next/link'

import { GlossaryCardGrid } from '@/components/sections/glossary/GlossaryCardGrid'
import { SectionRail } from '@/components/layout/SectionRail'
import {
  GLOSSARY_CLUSTERS,
  type GlossaryTermCard,
} from '@/sanity/lib/glossary'

/**
 * /glossary/ — terms grouped by cluster.
 *
 * Pure presentational. The page server component owns the Sanity fetch +
 * error handling and passes the flat list; this groups it into the
 * cluster sections defined in `GLOSSARY_CLUSTERS` (stable display order).
 *
 * Empty clusters are skipped, so the hub grows section-by-section as
 * batches land — no placeholder scaffolding promising future content
 * (the lesson from the empty career-paths hub).
 */
export function GlossaryHub({
  terms,
  id,
}: {
  terms: GlossaryTermCard[]
  id?: string
}) {
  const groups = GLOSSARY_CLUSTERS.map((c) => ({
    ...c,
    terms: terms.filter((t) => t.cluster === c.value),
  })).filter((g) => g.terms.length > 0)

  if (terms.length === 0) {
    return (
      <SectionRail tone="paper" id={id}>
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            The glossary
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            Terms landing soon.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            Plain-English definitions for the AI-search vocabulary &mdash; GEO,
            answer engines, citation engineering &mdash; written for people who
            run technical e-commerce, not for a keyword.
          </p>
        </div>
      </SectionRail>
    )
  }

  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          The glossary
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          {terms.length} {terms.length === 1 ? 'term' : 'terms'},{' '}
          defined for industrial e-commerce.
        </h2>
      </div>

      {/* Cluster jump strip */}
      <nav aria-label="Glossary sections" className="mt-10 border-t border-rule pt-5">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {groups.map((g, i) => (
            <li key={g.value} className="flex items-baseline gap-3">
              {i > 0 && <span aria-hidden className="text-ink-300">/</span>}
              <a
                href={`#${g.value}`}
                className="font-display text-sm font-semibold text-ink-700 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
              >
                {g.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-14 space-y-16">
        {groups.map((g) => (
          <section key={g.value} id={g.value} className="scroll-mt-24">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                {g.label}
              </h3>
              <Link
                href={`/glossary/cluster/${g.value}/`}
                className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-600 underline decoration-transparent underline-offset-[5px] transition-colors duration-200 hover:decoration-brand-600"
              >
                View cluster &rarr;
              </Link>
            </div>
            {g.intro && (
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-700">{g.intro}</p>
            )}
            <div className="mt-6">
              <GlossaryCardGrid terms={g.terms} headingLevel="h4" />
            </div>
          </section>
        ))}
      </div>
    </SectionRail>
  )
}
