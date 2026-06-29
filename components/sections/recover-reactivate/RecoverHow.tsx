import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/recover-reactivate/ § — how it works.
 *
 * The four mechanics, in plain order: chase the cold quotes, wake the dormant
 * list, segment the message, hand off the warm ones. Numbered steps on paper,
 * operator voice.
 */

type Step = {
  n: string
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    n: '01',
    title: 'Chase the cold quotes',
    body: 'Every estimate that went quiet gets a paced, human-sounding follow-up until you get a yes or a clear no. No more quotes left hanging because no one circled back.',
  },
  {
    n: '02',
    title: 'Wake the dormant list',
    body: 'Past customers get a real reason to come back: a reminder, a seasonal nudge, an offer that fits. The people who already trust you hear from you again.',
  },
  {
    n: '03',
    title: 'Right message, right segment',
    body: 'The list is cleaned and grouped so the new mover, the lapsed regular, and the one-time buyer each hear the thing that moves them. Not one blast to everyone.',
  },
  {
    n: '04',
    title: 'Hand off the warm ones',
    body: 'A revived quote or a returning customer lands as a booked job, not another task on your pile. The system does the chasing; you do the work.',
  },
]

export function RecoverHow({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          How it works
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Work the list you already have.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Automatic, paced, and personal at scale. The follow-up that used to
          depend on someone remembering now just happens.
        </p>
      </div>

      <ol className="mt-12 grid gap-px overflow-hidden rounded-[6px] border border-rule bg-rule sm:grid-cols-2">
        {STEPS.map((s) => (
          <li key={s.n} className="bg-paper p-7 sm:p-8">
            <span className="font-mono text-[13px] font-medium tabular-nums text-accent-600">
              {s.n}
            </span>
            <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-ink-900">
              {s.title}
            </h3>
            <p className="mt-3 leading-relaxed text-ink-700">{s.body}</p>
          </li>
        ))}
      </ol>
    </SectionRail>
  )
}
