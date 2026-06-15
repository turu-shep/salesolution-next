import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import type { CaseStudy } from '@/sanity/lib/case-studies'

import { serviceMeta } from './service-meta'

/**
 * "What we ran" — the engagement phase by phase, numbered process cards on a
 * dark band. Dark gives the long page an early contrast beat (a real chapter
 * break) and frames the work as the substantive, engineered core of the
 * story. Ends with a quiet link to the primary service page so the case study
 * does double duty as proof for the service it sells.
 */
export function CaseStudyApproach({ study, id }: { study: CaseStudy; id?: string }) {
  const phases = study.approach ?? []
  if (phases.length === 0) return null
  const primary = serviceMeta(study.primaryService)

  // Keep the hairline grid complete: 4 (or 2) phases read best as a clean
  // 2-up; otherwise a 3-up, with the final card spanning any short remainder
  // so the row never ends on empty dark cells.
  const twoCol = phases.length === 4 || phases.length === 2
  const cols = twoCol ? 'md:grid-cols-2' : phases.length >= 3 ? 'md:grid-cols-3' : ''
  const remainder = phases.length % 3
  const lastSpan =
    !twoCol && phases.length > 3 && remainder === 1
      ? 'md:col-span-3'
      : !twoCol && phases.length > 3 && remainder === 2
        ? 'md:col-span-2'
        : ''

  return (
    <SectionRail tone="dark" glow="quiet" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          What we ran
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.08] tracking-[-0.015em] text-white sm:text-4xl">
          The work, phase by phase.{' '}
          <span className="text-ink-400">What shipped, and when.</span>
        </h2>
      </div>

      <ol className={`mt-14 grid gap-px overflow-hidden border border-white/10 bg-white/10 ${cols}`}>
        {phases.map((phase, i) => (
          <li
            key={phase._key}
            className={`flex flex-col bg-surface-dark p-6 md:p-8 ${i === phases.length - 1 ? lastSpan : ''}`}
          >
            <div className="flex items-baseline justify-between gap-4">
              <p
                aria-hidden
                className="font-display text-5xl font-semibold leading-none tabular-nums tracking-[-0.02em] text-ink-500"
              >
                {String(i + 1).padStart(2, '0')}
              </p>
              {phase.timeframe && (
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-200">
                  {phase.timeframe}
                </p>
              )}
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold leading-snug text-white">
              {phase.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-300">{phase.detail}</p>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-sm text-ink-300">
        This is what a{' '}
        <Link
          href={primary.href}
          className="font-semibold text-white underline decoration-white/25 underline-offset-[5px] transition-colors duration-200 hover:decoration-white"
        >
          {primary.name}
        </Link>{' '}
        engagement at this scale looks like in practice.
      </p>
    </SectionRail>
  )
}
