import { cn } from '@/lib/cn'

import type { LeakData } from './data'
import { LeakShell } from './LeakShell'

/**
 * Concept 1 — One Lead, Timestamped.
 * A single job leaking by the clock. Elapsed time is the only quantity, and the
 * "dead" gap between reach-out and callback is the visual — no invented bar.
 */
export function Concept1Timeline({ data, conceptLabel }: { data: LeakData; conceptLabel?: string }) {
  const { timeline } = data
  return (
    <LeakShell
      conceptLabel={conceptLabel}
      eyebrow={data.eyebrow}
      headlineA={data.headlineA}
      headlineB={data.headlineB}
      intro={data.intro}
      closer={data.closer}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
        {timeline.kicker}
      </p>

      <ol className="mt-6 max-w-2xl">
        {timeline.steps.map((step, i) => {
          const booked = step.tone === 'booked'
          return (
            <li key={i}>
              {step.gapBefore && (
                <div className="flex gap-4">
                  <div className="w-20 shrink-0" />
                  <div className="flex items-center gap-3 py-2 pl-[7px]">
                    <span className="h-8 w-px bg-rule-strong" aria-hidden />
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
                      {step.gapBefore}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex gap-4">
                <span
                  className={cn(
                    'w-20 shrink-0 pt-0.5 text-right font-mono text-[11px] uppercase tracking-[0.12em]',
                    booked ? 'text-brand-700' : 'text-ink-500',
                  )}
                >
                  {step.time ?? ''}
                </span>
                <div className="relative flex-1 pb-6 pl-5">
                  <span
                    className={cn(
                      'absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-surface',
                      booked ? 'bg-brand-600' : 'bg-ink-400',
                    )}
                    aria-hidden
                  />
                  {i < timeline.steps.length - 1 && (
                    <span className="absolute left-[5px] top-1.5 h-full w-px bg-rule" aria-hidden />
                  )}
                  <p className={cn('text-base leading-snug', booked ? 'font-semibold text-brand-700' : 'text-ink-900')}>
                    {step.line}
                  </p>
                  {step.sub && <p className="mt-1 text-sm leading-relaxed text-ink-600">{step.sub}</p>}
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="mt-2 max-w-2xl border-t border-rule pt-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">
          {timeline.sourceCaption}
        </p>
        <p className="mt-2 text-sm italic text-ink-400">{timeline.note}</p>
      </div>
    </LeakShell>
  )
}
