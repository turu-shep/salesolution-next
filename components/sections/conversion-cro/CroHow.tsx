import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/conversion-cro/ § — how it works.
 *
 * The four mechanics, in plain order: find the drop-off, fix the costliest
 * step, test instead of guess, close the follow-up gap. Numbered steps on
 * paper, operator voice.
 */

type Step = {
  n: string
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    n: '01',
    title: 'Find the drop-off',
    body: 'The data, the session recordings, and the funnel show exactly where ready buyers leave.',
  },
  {
    n: '02',
    title: 'Fix the costliest step first',
    body: 'The one leak losing you the most money, before the small ones.',
  },
  {
    n: '03',
    title: 'Test, do not guess',
    body: 'Change one thing, measure it against the old version, keep only what wins.',
  },
  {
    n: '04',
    title: 'Close the follow-up gap',
    body: 'The automatic reply and sequence that catches the buyers who did not convert on the spot.',
  },
]

export function CroHow({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          How it works
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Find the leak. Fix the step. Prove it.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          A measured loop, not a redesign. We work the step that loses you the
          most, prove the change, then move to the next one.
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
