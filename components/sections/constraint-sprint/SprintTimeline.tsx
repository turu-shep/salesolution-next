import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /constraint-sprint/ § 3 — Week-by-week timeline.
 *
 * Light variant of ProcessTimeline. Four weeks instead of five days /
 * weeks 1–4 cadence. Each week pairs action (what we do) with artifact
 * (what you walk out with).
 *
 * Tone is paper so it reads like an editorial schedule, not a Gantt chart.
 */

type Week = {
  week: string
  title: string
  body: string
  artifact: string
  current?: boolean
}

const WEEKS: Week[] = [
  {
    week: 'Week 1',
    title: 'Revenue Leak Scan',
    body: 'Diagnostic across acquisition, conversion, retention. We pull GA4 / GSC / ad accounts, audit schema + content + funnel data, and isolate the single constraint with the largest revenue drag. Week-1 readout includes the constraint, the evidence, and the proposed fix.',
    artifact: 'One-page diagnostic + the constraint isolated',
    current: true,
  },
  {
    week: 'Week 2',
    title: 'Scoreboard wired to live data',
    body: 'A KPI dashboard built on top of your real data sources. Tracks the leading indicators tied to the constraint — not vanity. Reviewable weekly so you know whether the Week-3 fix is moving the needle.',
    artifact: 'Live scoreboard · 4–6 KPIs tied to the constraint',
  },
  {
    week: 'Week 3',
    title: 'One installed asset',
    body: 'A live, in-store implementation: a lifecycle email flow, a structured-data deployment, a GA4 funnel rebuild, or a paid campaign restructure — whichever matches the constraint. Shipped into your stack, not handed off as recommendations.',
    artifact: 'One asset live in your store · measurable lift',
  },
  {
    week: 'Week 4',
    title: 'Ticket Pack + 90-day Fix Order',
    body: 'A prioritized backlog with effort estimates and expected-lift scoring on every ticket. Sequenced as a 90-day execution plan. Your team can run it themselves, or roll into our retainer — your call.',
    artifact: 'Ticket Pack · 90-day execution roadmap',
  },
]

export function SprintTimeline() {
  return (
    <SectionRail tone="paper" id="timeline">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          The 4-week schedule
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          What happens, week by week.{' '}
          <span className="text-ink-500">No black box.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-700">
          Every week ends with an artifact you can hold &mdash; not a status
          deck. The point is that even if you cancel mid-sprint, you walk
          away with usable work product.
        </p>
      </div>

      <ol className="relative mt-16 space-y-12 border-l border-rule-strong pl-8 md:pl-12">
        {WEEKS.map((w, i) => (
          <li key={w.week} className="relative">
            <span
              aria-hidden
              className="absolute -left-[34px] top-2 flex h-4 w-4 items-center justify-center md:-left-[50px]"
            >
              <span className="absolute inset-0 rounded-full bg-paper" />
              <span
                className={
                  i === 0
                    ? 'relative h-3 w-3 rounded-full bg-accent-500 ring-2 ring-accent-500/30'
                    : 'relative h-3 w-3 rounded-full bg-brand-600 ring-2 ring-brand-600/20'
                }
              />
            </span>

            <div className="grid gap-6 md:grid-cols-12 md:gap-10">
              <div className="md:col-span-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                  {w.week}
                </p>
                {w.current && (
                  <p className="mt-2 inline-block rounded-[3px] bg-accent-500/10 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-600">
                    Start here
                  </p>
                )}
              </div>
              <div className="md:col-span-9">
                <h3 className="font-display text-xl font-semibold text-ink-900">
                  {w.title}
                </h3>
                <p className="mt-3 text-ink-700">{w.body}</p>
                <div className="mt-5 border-l-2 border-accent-500/60 pl-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-600">
                    You walk out with
                  </p>
                  <p className="mt-1.5 text-sm text-ink-800">{w.artifact}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </SectionRail>
  )
}
