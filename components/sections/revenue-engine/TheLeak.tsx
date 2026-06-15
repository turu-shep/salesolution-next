import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine § the leak — shared leak-card grid.
 *
 * Three leak cards close on the same framing: revenue you already paid to
 * generate. Claims are §4-approved only (pillar uses C-05 hedged, C-01
 * sourced, C-06 qualitative). A numbered index + hairline rule keeps the
 * cards a parallel set whether the stats are numeric or qualitative.
 *
 * The pillar uses the generic defaults; the vertical pages pass their own
 * `leaks` + heading/intro/closer.
 */

export type Leak = {
  n: string
  stat: string
  label: string
  body: string
  source: string | null
}

const DEFAULT_LEAKS: Leak[] = [
  {
    n: '01',
    stat: 'As many as 1 in 3',
    label: 'inbound calls go unanswered',
    body: 'You are on a roof, in a chair, or already on another call. The lead dials the next name on the list. The ad that produced that call still gets billed.',
    source: null,
  },
  {
    n: '02',
    stat: '47 hours',
    label: 'industry-average lead response time',
    body: 'Most leads expect a reply in minutes, not days. By the time a form fill gets a callback, the job is usually booked with whoever answered first.',
    source: 'LeadSync, 2026',
  },
  {
    n: '03',
    stat: 'A large share',
    label: 'of estimates and treatment plans go unchased',
    body: 'The quote goes out, the treatment plan gets presented, and then nothing. The work was won and lost in the same week, inside your own CRM.',
    source: null,
  },
]

export function TheLeak({
  id,
  eyebrow = 'The leak',
  headline,
  intro,
  leaks = DEFAULT_LEAKS,
  closer,
}: {
  id?: string
  eyebrow?: string
  headline?: React.ReactNode
  intro?: React.ReactNode
  leaks?: Leak[]
  closer?: React.ReactNode
}) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          {headline ?? (
            <>
              You lose more to the leak{' '}
              <span className="text-ink-500">than you gain from more leads.</span>
            </>
          )}
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          {intro ?? (
            <>
              Local service businesses bleed revenue between the click and the
              booking. Three places it leaks, every week:
            </>
          )}
        </p>
      </div>

      <ul className="mt-12 grid gap-px overflow-hidden rounded-[4px] bg-rule sm:grid-cols-3">
        {leaks.map((leak) => (
          <li key={leak.n} className="flex flex-col gap-3 bg-paper p-7">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] tabular-nums text-brand-600">
                {leak.n}
              </span>
              <span aria-hidden className="h-px flex-1 bg-rule" />
            </div>
            <p className="font-display text-3xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900">
              {leak.stat}
            </p>
            <p className="text-sm font-semibold text-ink-900">{leak.label}</p>
            <p className="text-sm leading-relaxed text-ink-700">{leak.body}</p>
            <p className="mt-auto pt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
              {leak.source ?? 'Field pattern'}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-12 max-w-2xl text-lg font-semibold text-ink-900">
        {closer ?? <>Every one of these is revenue you already paid to generate.</>}
      </p>
    </SectionRail>
  )
}
