import { SectionRail } from '@/components/layout/SectionRail'

/**
 * The Plan — the 5-step machine, grouped under the 3-pillar spine.
 *
 * The 3 pillars (Bring / Sell / Retain) are the narrative; the 5 steps
 * (Capture / Respond / Book / Recover / Prove) are the operational detail nested
 * under them — the wider process. Bring=Capture, Sell=Respond+Book,
 * Retain=Recover, and Prove caps the plan and hands into the Proof section.
 *
 * Default content is home-services; pass `groups`/`prove` to retune per vertical.
 */
type Step = { key: string; what: string; metric: string }
type PillarGroup = { pillar: string; outcome: string; steps: Step[] }

const HS_GROUPS: PillarGroup[] = [
  {
    pillar: 'Bring',
    outcome: 'Get found when they’re looking',
    steps: [
      {
        key: 'Capture',
        what: 'A tidied-up Google and Maps listing, pages built to show up for “roofer near me” and in AI answers, and a simple way to get a quote — all yours, running alongside your site.',
        metric: 'More searchers turn into quote requests',
      },
    ],
  },
  {
    pillar: 'Sell',
    outcome: 'Win the ones who reach you',
    steps: [
      {
        key: 'Respond',
        what: 'Every call answered, 24/7 — even mid-storm on a roof. Missed calls get an instant text back, every form a reply in under a minute, and a caller can always reach a human.',
        metric: 'No lead lost to a missed call or slow reply',
      },
      {
        key: 'Book',
        what: 'Estimates qualified and booked straight to your calendar, with reminders so they show. Every call recorded and sorted, so nothing slips.',
        metric: 'More leads become booked, kept jobs',
      },
    ],
  },
  {
    pillar: 'Retain',
    outcome: 'Bring them back',
    steps: [
      {
        key: 'Recover',
        what: 'The quotes that went cold get chased automatically, past customers get a reason to call you back, and a steady stream of reviews lifts you in local search.',
        metric: 'Revenue won back from quotes already chased',
      },
    ],
  },
]

const HS_PROVE: Step = {
  key: 'Prove',
  what: 'A dispute-proof log of every call, and a monthly dashboard that shows what this system brought in — separate from your ads.',
  metric: 'What the system earned, against the fee',
}

function StepCard({ step }: { step: Step }) {
  return (
    <div className="rounded-[4px] border border-rule bg-paper p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">{step.key}</p>
      <p className="mt-3 leading-relaxed text-ink-800">{step.what}</p>
      <p className="mt-4 flex items-baseline gap-2 border-t border-rule pt-3 text-sm text-ink-600">
        <span aria-hidden className="text-accent-500">→</span>
        {step.metric}
      </p>
    </div>
  )
}

export function PlanByPillar({
  id,
  groups = HS_GROUPS,
  prove = HS_PROVE,
}: {
  id?: string
  groups?: PillarGroup[]
  prove?: Step
}) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">The plan</p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          The whole machine,{' '}
          <span className="text-ink-500">one part at a time.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Three jobs, five moving parts. I install and run all of it — the 90-day setup is on
          me.
        </p>
      </div>

      <div className="mt-14 space-y-12">
        {groups.map((g, gi) => (
          <div key={g.pillar} className="grid gap-6 md:grid-cols-[14rem_1fr] md:gap-10">
            <div className="md:pt-1">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 font-mono text-xs font-bold tabular-nums text-white">
                  {gi + 1}
                </span>
                <h3 className="font-display text-2xl font-semibold tracking-[-0.015em] text-ink-900">
                  {g.pillar}
                </h3>
              </div>
              <p className="mt-2 text-base text-ink-600 md:ml-10">{g.outcome}.</p>
            </div>
            <div className={g.steps.length > 1 ? 'grid gap-4 sm:grid-cols-2' : 'grid gap-4'}>
              {g.steps.map((s) => (
                <StepCard key={s.key} step={s} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Prove — the capstone that hands into the Proof section */}
      <div className="mt-12 flex flex-col gap-4 rounded-[4px] border-l-2 border-ink-900 bg-surface px-6 py-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="sm:w-56 sm:shrink-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
            And then · {prove.key}
          </p>
          <p className="mt-1 font-display text-xl font-semibold text-ink-900">
            I prove it paid.
          </p>
        </div>
        <p className="leading-relaxed text-ink-700">
          {prove.what} <span className="text-ink-500">↓</span>
        </p>
      </div>
    </SectionRail>
  )
}
