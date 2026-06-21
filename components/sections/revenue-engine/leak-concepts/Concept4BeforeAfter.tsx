import { cn } from '@/lib/cn'

import type { HeaderOverride, LeakData, Outcome } from './data'
import { LeakShell } from './LeakShell'

/**
 * Concept 4 — Same Lead, Two Endings.
 * One lead, two side-by-side sequences with the same opening and two finishes;
 * the only variable that changed is the response. The "won" column stays a
 * generic mechanism (the call gets answered), never the product — it sits
 * before the engine-vs-fuel reveal.
 */
function Column({
  label,
  rows,
  side,
}: {
  label: string
  rows: Outcome[]
  side: 'lost' | 'won'
}) {
  const won = side === 'won'
  return (
    <div>
      <div className={cn('border-t-2 pt-3', won ? 'border-brand-600/40' : 'border-rule-strong')}>
        <p
          className={cn(
            'font-mono text-[11px] uppercase tracking-[0.16em]',
            won ? 'text-brand-700' : 'text-ink-500',
          )}
        >
          {label}
        </p>
      </div>
      <ol className="mt-4 space-y-3">
        {rows.map((row, i) => {
          const terminal = row.tone === 'loss' || row.tone === 'booked'
          return (
            <li key={i} className="flex gap-3">
              <span className="w-16 shrink-0 pt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-400">
                {row.time ?? ''}
              </span>
              <p
                className={cn(
                  'text-base leading-snug',
                  terminal && won && 'font-semibold text-brand-700',
                  terminal && !won && 'font-semibold text-ink-900',
                  !terminal && 'text-ink-700',
                )}
              >
                {row.line}
              </p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function Concept4BeforeAfter({ data, conceptLabel, header }: { data: LeakData; conceptLabel?: string; header?: HeaderOverride }) {
  const { beforeAfter } = data
  return (
    <LeakShell
      conceptLabel={conceptLabel}
      eyebrow={header?.eyebrow ?? data.eyebrow}
      headlineA={header?.headlineA ?? data.headlineA}
      headlineB={header?.headlineB ?? data.headlineB}
      intro={header?.intro ?? data.intro}
      closer={header?.closer ?? data.closer}
    >
      <div className="relative grid gap-10 md:grid-cols-2 md:gap-0">
        <div className="md:pr-10">
          <Column label={beforeAfter.leftLabel} rows={beforeAfter.lost} side="lost" />
        </div>
        <span
          className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-rule md:block"
          aria-hidden
        />
        <div className="md:pl-10">
          <Column label={beforeAfter.rightLabel} rows={beforeAfter.won} side="won" />
        </div>
      </div>

      <div className="mt-8 max-w-2xl border-t border-rule pt-4">
        <p className="text-sm font-medium text-ink-700">{beforeAfter.note}</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
          {beforeAfter.sourceCaption}
        </p>
      </div>
    </LeakShell>
  )
}
