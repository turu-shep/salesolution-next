import { cn } from '@/lib/cn'

import type { EvidenceCard, HeaderOverride, LeakData } from './data'
import { LeakShell } from './LeakShell'

/**
 * Concept 2 — The Evidence Card.
 * Three realistic "receipts" the owner recognizes from their own devices (a
 * Recents screen, a CRM row, a Maps pack). The artifact does the agitating;
 * the artifact *type* carries each vertical's true shape. Mirrors the hero
 * AIOverviewMockup chrome + accent highlight so the page reads as one operator
 * who shows receipts.
 */
function Artifact({ card }: { card: EvidenceCard }) {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl border border-ink-300/30 bg-surface shadow-[0_24px_60px_-30px_rgba(15,20,30,0.22)]">
        {/* chrome strip */}
        <div className="flex items-center gap-2 border-b border-rule px-4 py-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-ink-300" />
          <span className="h-2 w-2 shrink-0 rounded-full bg-ink-300" />
          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">
            {card.chrome}
          </span>
        </div>
        <ul className="divide-y divide-rule">
          {card.rows.map((row, i) => (
            <li
              key={i}
              className={cn(
                'flex items-center justify-between gap-3 px-4 py-2.5 font-mono text-[12px]',
                row.flag ? 'bg-accent-50' : 'bg-surface',
              )}
            >
              <span className={cn('truncate', row.flag ? 'font-semibold text-accent-700' : 'text-ink-700')}>
                {row.left}
              </span>
              {row.right && (
                <span className={cn('shrink-0 tabular-nums', row.flag ? 'text-accent-600' : 'text-ink-400')}>
                  {row.right}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {card.annotation && (
        <div className="absolute -bottom-3 right-4 -rotate-2">
          <span className="inline-block rounded-md bg-ink-900 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white">
            ← {card.annotation}
          </span>
        </div>
      )}
    </div>
  )
}

export function Concept2Evidence({ data, conceptLabel, header }: { data: LeakData; conceptLabel?: string; header?: HeaderOverride }) {
  return (
    <LeakShell
      conceptLabel={conceptLabel}
      eyebrow={header?.eyebrow ?? data.eyebrow}
      headlineA={header?.headlineA ?? data.headlineA}
      headlineB={header?.headlineB ?? data.headlineB}
      intro={header?.intro ?? data.intro}
      closer={header?.closer ?? data.closer}
    >
      <div className="flex flex-col gap-8">
        {data.evidence.cards.map((card, i) => (
          <div
            key={i}
            className={cn(
              'grid items-center gap-x-10 gap-y-5 md:grid-cols-2',
              i % 2 === 1 && 'md:[&>*:first-child]:order-2',
            )}
          >
            <Artifact card={card} />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
                {card.kicker}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.015em] text-ink-900">
                {card.label}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-ink-700">{card.body}</p>
              {card.source && (
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
                  {card.source}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
        {data.evidence.note}
      </p>
    </LeakShell>
  )
}
