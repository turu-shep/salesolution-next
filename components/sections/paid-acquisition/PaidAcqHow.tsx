import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/paid-acquisition/ § — how it works.
 *
 * The four mechanics, in plain order: your account at cost, aim at buyers,
 * land them where it converts, judge on booked jobs. Numbered steps on paper,
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
    title: 'Your account, your data',
    body: 'Campaigns are built in your own Google and Meta accounts. You own them. No markup on the spend, ever. If we part ways, the account and its history stay with you.',
  },
  {
    n: '02',
    title: 'Aim at buyers, not reach',
    body: 'We target the keywords and audiences of people ready to hire now, not the cheap clicks that never call. Fewer impressions, more of the right ones.',
  },
  {
    n: '03',
    title: 'Land them where it converts',
    body: 'The ad, the page, and the offer all say the same thing, so the click turns into a quote instead of a bounce. The whole path is aligned, not just the headline.',
  },
  {
    n: '04',
    title: 'Judge on booked jobs',
    body: 'Every campaign is measured on cost per booked job. We kill what doesn’t pay and move the budget to what does, every cycle.',
  },
]

export function PaidAcqHow({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          How it works
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          On your account, aimed at jobs.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          One system, one number to judge it by. Every dollar you put in is
          tracked to the jobs it books, so you always know what the spend bought.
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
