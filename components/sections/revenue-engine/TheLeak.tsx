import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine § the leak — the conversion-stage problem, shown.
 *
 * A single stacked bar shows where the leads you pay for actually go:
 * most leak at the conversion stage (unanswered → slow → unchased) and only
 * a slice books. A colour-coded legend names each leak. Claims are
 * §4-approved only (C-05 hedged, C-01 sourced, C-06 qualitative). Bar
 * proportions are illustrative and labelled as such.
 *
 * The pillar uses the generic defaults; vertical pages pass their own copy.
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
    label: 'calls go unanswered',
    body: 'You are on a roof, in a chair, or already on another call. The lead dials the next name on the list.',
    source: null,
  },
  {
    n: '02',
    stat: '47 hours',
    label: 'average reply to a new lead',
    body: 'Most leads expect minutes, not days. By the callback, the job is booked with whoever answered first.',
    source: 'LeadSync, 2026',
  },
  {
    n: '03',
    stat: 'A large share',
    label: 'of estimates and plans go unchased',
    body: 'The quote goes out, the plan gets presented, and then nothing — won and lost in the same week, inside your CRM.',
    source: null,
  },
]

// Illustrative bar weights (%) for the lost segments, in order; the booked
// segment is the remainder. Not a measured figure — see the note below.
const LOST_WEIGHTS = [32, 20, 14]
const LOST_BG = ['bg-ink-500', 'bg-ink-400', 'bg-ink-300']
const LOST_DOT = ['bg-ink-500', 'bg-ink-400', 'bg-ink-300']

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
  const lostTotal = leaks.reduce((s, _, i) => s + (LOST_WEIGHTS[i] ?? 10), 0)
  const booked = Math.max(18, 100 - lostTotal)

  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          {headline ?? (
            <>
              The leak isn&rsquo;t your ad budget.{' '}
              <span className="text-ink-500">It&rsquo;s everything after the click.</span>
            </>
          )}
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          {intro ?? (
            <>
              Most owners I talk to think the problem is ad spend. It almost
              never is. Count the calls nobody answered and the quotes nobody
              chased, and the leak is bigger than the budget.
            </>
          )}
        </p>
      </div>

      {/* Where your paid leads actually go */}
      <div className="mt-12">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          Where your leads actually go
        </p>
        <div className="flex h-14 w-full overflow-hidden rounded-[4px] border border-rule-strong">
          {leaks.map((leak, i) => (
            <div
              key={leak.n}
              style={{ width: `${LOST_WEIGHTS[i] ?? 10}%` }}
              className={LOST_BG[i] ?? 'bg-ink-200'}
              title={`${leak.stat} — ${leak.label}`}
            />
          ))}
          <div
            style={{ width: `${booked}%` }}
            className="flex items-center justify-center bg-brand-600"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white">
              Booked
            </span>
          </div>
        </div>

        {/* Colour-coded legend = the three leaks */}
        <ul className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-3">
          {leaks.map((leak, i) => (
            <li key={leak.n}>
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className={`h-3 w-3 shrink-0 rounded-[2px] ${LOST_DOT[i] ?? 'bg-ink-200'}`}
                />
                <span className="font-display text-2xl font-semibold leading-none tracking-[-0.015em] text-ink-900">
                  {leak.stat}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-ink-900">{leak.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-700">{leak.body}</p>
              {leak.source && (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
                  {leak.source}
                </p>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
          Proportions illustrative
        </p>
      </div>

      <p className="mt-10 max-w-2xl text-lg font-semibold text-ink-900">
        {closer ?? <>Every job that didn&rsquo;t book is money you already worked to win.</>}
      </p>
    </SectionRail>
  )
}
