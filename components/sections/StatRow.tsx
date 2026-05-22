import { cn } from '@/lib/cn'
import type { Stat } from '@/lib/stats'

/**
 * Big-number proof row. Defaults to the canonical 4-stat set; pass a `stats`
 * prop to override on specific pages.
 *
 * `tone="dark"` flips the text colors for use on `bg-surface-dark` sections.
 */
export function StatRow({
  stats,
  tone = 'light',
}: {
  stats: Stat[]
  tone?: 'light' | 'dark'
}) {
  const numberClass = tone === 'dark' ? 'text-white' : 'text-ink-900'
  const labelClass = tone === 'dark' ? 'text-ink-300' : 'text-ink-500'
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label}>
          <dt className="sr-only">{s.label}</dt>
          <dd>
            <div className={cn('font-display text-4xl font-bold sm:text-5xl', numberClass)}>
              {s.value}
            </div>
            <div className={cn('mt-1 text-sm', labelClass)}>{s.label}</div>
          </dd>
        </div>
      ))}
    </dl>
  )
}
