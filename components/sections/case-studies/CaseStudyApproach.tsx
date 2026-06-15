import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import type { CaseStudy } from '@/sanity/lib/case-studies'

import { serviceMeta } from './service-meta'

/**
 * "What we ran" — the engagement phase by phase, numbered process cards.
 * Ends with a quiet link to the primary service page so the case study
 * does double duty as proof for the service it sells.
 */
export function CaseStudyApproach({ study, id }: { study: CaseStudy; id?: string }) {
  const phases = study.approach ?? []
  if (phases.length === 0) return null
  const primary = serviceMeta(study.primaryService)

  const cols =
    phases.length >= 3 ? 'md:grid-cols-3' : phases.length === 2 ? 'md:grid-cols-2' : ''

  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          What we ran
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          The work, phase by phase.{' '}
          <span className="text-ink-500">Specific deliverables, no brochure language.</span>
        </h2>
      </div>

      <ol className={`mt-14 grid gap-6 ${cols}`}>
        {phases.map((phase, i) => (
          <li key={phase._key} className="flex flex-col border border-rule bg-surface p-6 md:p-8">
            <div className="flex items-baseline justify-between gap-4">
              <p
                aria-hidden
                className="font-display text-5xl font-semibold leading-none tabular-nums tracking-[-0.02em] text-ink-300"
              >
                {String(i + 1).padStart(2, '0')}
              </p>
              {phase.timeframe && (
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                  {phase.timeframe}
                </p>
              )}
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold leading-snug text-ink-900">
              {phase.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-700">{phase.detail}</p>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-sm text-ink-500">
        This is what a{' '}
        <Link
          href={primary.href}
          className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
        >
          {primary.name}
        </Link>{' '}
        engagement at this scale looks like in practice.
      </p>
    </SectionRail>
  )
}
