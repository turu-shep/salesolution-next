import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine pillar § 2 — The leak.
 *
 * Three leak cards: missed calls, response time, abandoned estimates /
 * treatment plans. Each closes on the same framing — revenue you already
 * paid to generate. Claims are §4-approved only (C-05 hedged, C-01
 * sourced, C-06 qualitative — no fabricated close-rate numbers). A numbered
 * index + hairline rule gives the three cards a consistent anchor so the
 * mixed numeric / qualitative stats read as a parallel set.
 */

const LEAKS = [
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

export function TheLeak({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          The leak
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          You lose more to the leak{' '}
          <span className="text-ink-500">than you gain from more leads.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Local service businesses bleed revenue between the click and the
          booking. Three places it leaks, every week:
        </p>
      </div>

      <ul className="mt-12 grid gap-px overflow-hidden rounded-[4px] bg-rule sm:grid-cols-3">
        {LEAKS.map((leak) => (
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
        Every one of these is revenue you already paid to generate.
      </p>
    </SectionRail>
  )
}
