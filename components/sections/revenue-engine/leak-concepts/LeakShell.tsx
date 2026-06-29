import type { ReactNode } from 'react'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Shared frame for the four leak concepts so they're judged on the idea, not on
 * inconsistent headers. Reuses the real TheLeak header + closer styling; the
 * concept label is review-only chrome (it would be dropped on the live page).
 */
export function LeakShell({
  conceptLabel,
  eyebrow,
  headlineA,
  headlineB,
  intro,
  closer,
  children,
}: {
  conceptLabel?: string
  eyebrow: string
  headlineA: string
  headlineB: string
  intro?: string
  closer?: string
  children: ReactNode
}) {
  return (
    <SectionRail tone="surface">
      {conceptLabel && (
        <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-ink-300 bg-paper px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {conceptLabel}
        </p>
      )}
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">{eyebrow}</p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          {headlineA} {headlineB}
        </h2>
        {intro && <p className="mt-6 text-lg leading-relaxed text-ink-700">{intro}</p>}
      </div>

      <div className="mt-12">{children}</div>

      {closer && (
        <p className="mt-10 max-w-2xl text-lg font-semibold leading-relaxed text-ink-900">{closer}</p>
      )}
    </SectionRail>
  )
}
