import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/full-growth-ownership/ § 6 — First 60 days.
 *
 * Mirrors the rail treatment from `services/ProcessTimeline.tsx` but
 * with a 5-step, 60-day cadence specific to Full Growth Ownership. Dark
 * tone so it carries weight after the comparison table.
 */

type Step = {
  week: string
  title: string
  body: string
  outcome: string
}

const STEPS: Step[] = [
  {
    week: 'Day 0',
    title: 'Qualifier + 30-min call · no deck',
    body: 'You fill out the qualifier. We respond within 24 hours with a 1-page written diagnostic and a suggested call time. The call is 30 minutes. No SDR loop.',
    outcome: 'You leave with a clear read on whether Shape A or Shape B fits.',
  },
  {
    week: 'Day 1–3',
    title: 'Written SOW',
    body: 'Within 48 hours of the call: a written SOW with the specific shape (A or B), the services included, the monthly price, the engagement length, and what is specifically out of scope.',
    outcome: 'You decide. We don\'t chase.',
  },
  {
    week: 'Day 7–14',
    title: 'Onboarding',
    body: 'Access to your GA4, GSC, ad accounts, CRM, ESP, and CMS. Baseline crawl, citation snapshot, current funnel map. First leadership meeting attended (Shape A) or first operator-team standup scheduled (Shape B).',
    outcome: 'Baseline numbers + funnel map in your inbox.',
  },
  {
    week: 'Day 14–30',
    title: 'First shipped work',
    body: 'By end of week 4, visible work is shipping. AI search baseline fixes, first pillar piece in progress, first outbound sequence drafted, or first catalog batch in pilot — whichever fits the scope.',
    outcome: 'First measurable lift on a target query or channel.',
  },
  {
    week: 'Day 45–60',
    title: 'First outcome review',
    body: 'Written 1-page outcome review. What shipped, what moved, what\'s next. Either confirms the engagement is working or surfaces what to adjust. Going forward, monthly cadence.',
    outcome: 'Decision point: continue, adjust scope, or exit at the minimum term.',
  },
]

export function FullGrowthTimeline({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          Engagement shape
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          First 60 days. No black box.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          The timeline below is what you can expect from the moment you
          submit the qualifier. Five steps, two months, written outcomes
          at every gate.
        </p>
      </div>

      <ol className="relative mt-16 space-y-12 border-l border-white/15 pl-8 md:pl-12">
        {STEPS.map((step, i) => (
          <li key={step.week} className="relative">
            <span
              aria-hidden
              className="absolute -left-[34px] top-2 flex h-4 w-4 items-center justify-center md:-left-[50px]"
            >
              <span className="absolute inset-0 rounded-full bg-surface-dark" />
              <span
                className={
                  i === 0
                    ? 'relative h-3 w-3 rounded-full bg-accent-500 ring-2 ring-accent-500/30'
                    : 'relative h-3 w-3 rounded-full bg-brand-600 ring-2 ring-brand-600/30'
                }
              />
            </span>

            <div className="grid gap-6 md:grid-cols-12 md:gap-10">
              <div className="md:col-span-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
                  {step.week}
                </p>
                {i === 0 && (
                  <p className="mt-2 inline-block rounded-[3px] bg-accent-500/15 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-500">
                    Start here
                  </p>
                )}
              </div>
              <div className="md:col-span-9">
                <h3 className="font-display text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-ink-300">{step.body}</p>
                <div className="mt-5 border-l-2 border-accent-500/50 pl-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-500">
                    You&rsquo;ll see
                  </p>
                  <p className="mt-1.5 text-sm text-ink-200">{step.outcome}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </SectionRail>
  )
}
