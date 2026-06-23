import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine § the leak — the problem beat, shown as three named leaks.
 *
 * A colour-coded legend names where revenue leaks. No fabricated chart — the old
 * "where your leads go" bar used invented proportions and was removed. Claims are
 * §4-approved only (C-05 hedged, C-01 sourced, C-06 qualitative).
 *
 * The pillar uses the generic defaults; the vertical pages use the richer
 * Evidence-card villain (leak-concepts/Concept2Evidence).
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

const LEAK_DOT = ['bg-ink-500', 'bg-ink-400', 'bg-ink-300']

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
    <SectionRail tone="surface" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          {headline ?? (
            <>
              It isn&rsquo;t your ad budget.{' '}
              <span className="text-ink-500">It&rsquo;s everything after the phone rings.</span>
            </>
          )}
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          {intro ?? (
            <>
              Most owners I talk to think they need more leads. They almost
              never do. The calls that ring out and the quotes nobody chased
              are usually a bigger hole than the ad budget.
            </>
          )}
        </p>
      </div>

      {/* The three leaks */}
      <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-3">
        {leaks.map((leak, i) => (
          <li key={leak.n}>
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className={`h-3 w-3 shrink-0 rounded-[2px] ${LEAK_DOT[i] ?? 'bg-ink-200'}`}
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

      <p className="mt-10 max-w-2xl text-lg font-semibold text-ink-900">
        {closer ?? <>Every job that didn&rsquo;t book is money you already worked to win.</>}
      </p>
    </SectionRail>
  )
}
