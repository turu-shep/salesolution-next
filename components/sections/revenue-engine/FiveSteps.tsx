import { cn } from '@/lib/cn'
import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine § the 5-step system — shared timeline.
 *
 * Canonical names and order (spec §1.3 — do not rename, reorder, or
 * merge): CAPTURE → RESPOND → BOOK → RECOVER → PROVE. Rendered as a
 * numbered timeline (connected nodes; PROVE filled as the outcome).
 * Vertical by construction, so no mobile reflow bug.
 *
 * The pillar uses the generic defaults; the vertical pages pass their own
 * `steps` (the same five names, applied to that trade) + heading/intro.
 */

export type FiveStep = { n: string; key: string; what: string; metric: string }

const DEFAULT_STEPS: FiveStep[] = [
  {
    n: '01',
    key: 'CAPTURE',
    what: 'A simple way for visitors to get a quote or book online, plus a tidied-up Google listing — all yours, running alongside the website you already have.',
    metric: 'More of your visitors turn into calls and forms',
  },
  {
    n: '02',
    key: 'RESPOND',
    what: 'Every call gets answered, 24/7 — even when you are on a job. Missed calls get an instant text back, every form gets a reply in under a minute, and a caller can always reach a human. I tune the scripts against real recordings every week.',
    metric: 'No more leads lost to a missed call or a slow reply',
  },
  {
    n: '03',
    key: 'BOOK',
    what: 'Calls get qualified and booked straight to your calendar, with reminders so they show up. Every call is recorded and sorted, so nothing slips through.',
    metric: 'More leads become booked, kept appointments',
  },
  {
    n: '04',
    key: 'RECOVER',
    what: 'The quotes that went cold and the customers overdue for a visit get followed up automatically, plus a steady stream of new reviews that lifts you in local search.',
    metric: 'Revenue won back from work you already chased',
  },
  {
    n: '05',
    key: 'PROVE',
    what: 'A monthly dashboard shows which revenue the system drove versus your ads, so you see exactly what you are paying for.',
    metric: 'What the system earned, measured against the fee',
  },
]

export function FiveSteps({
  id,
  eyebrow = 'The system',
  headline,
  intro,
  steps = DEFAULT_STEPS,
}: {
  id?: string
  eyebrow?: string
  headline?: React.ReactNode
  intro?: React.ReactNode
  steps?: FiveStep[]
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
              Here&rsquo;s the whole machine.{' '}
              <span className="text-ink-500">No black box.</span>
            </>
          )}
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          {intro ?? (
            <>
              I install and run all of it &mdash; the 90-day setup is on me,
              not another job for you. Here is each piece, in plain terms.
            </>
          )}
        </p>
      </div>

      <ol className="mt-14 max-w-4xl">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1
          return (
            <li
              key={step.key}
              className="grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-8"
            >
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] font-mono text-sm font-semibold tabular-nums',
                    isLast
                      ? 'bg-brand-600 text-white'
                      : 'border border-rule-strong bg-surface text-brand-600',
                  )}
                >
                  {step.n}
                </span>
                {!isLast && <span aria-hidden className="w-px flex-1 bg-rule-strong" />}
              </div>

              <div className={cn(isLast ? 'pb-0' : 'pb-12')}>
                <h3 className="font-display text-xl font-semibold leading-tight tracking-[-0.01em] text-ink-900">
                  {step.key}
                </h3>
                <p className="mt-2 text-ink-700">{step.what}</p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-600">
                  {step.metric}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </SectionRail>
  )
}
