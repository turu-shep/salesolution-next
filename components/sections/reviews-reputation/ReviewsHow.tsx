import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/reviews-reputation/ § — how it works.
 *
 * The four mechanics, in plain order: ask after every job, make it one tap,
 * route it where it counts, respond and recover. Numbered steps on paper,
 * operator voice. Honesty line under the grid: real reviews only, never
 * written or bought.
 */

type Step = {
  n: string
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    n: '01',
    title: 'Ask every time',
    body: 'A well-timed request goes out automatically after every completed job, while the goodwill is still fresh.',
  },
  {
    n: '02',
    title: 'Make it one tap',
    body: 'The customer is one click from leaving the review, on the platform that matters, with nothing to figure out.',
  },
  {
    n: '03',
    title: 'Send it where it counts',
    body: 'Google first, because it lifts the map pack, then the others that matter for your trade.',
  },
  {
    n: '04',
    title: 'Respond and recover',
    body: 'Every review gets a reply. An unhappy one gets caught and handled before it hardens into a public one-star.',
  },
]

export function ReviewsHow({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          How it works
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Ask every time. Route it right.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          A system that runs after every job, not a one-off push.
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

      <p className="mt-8 text-base leading-relaxed text-ink-600">
        Real reviews only. We never write or buy them.
      </p>
    </SectionRail>
  )
}
