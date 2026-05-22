import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /constraint-sprint/ § 4 — Deliverables.
 *
 * Dark band. Four concrete artifacts the buyer walks out of the sprint
 * holding. The previous section explained the schedule; this section is
 * the inventory. Each item gets a numbered marker (mono uppercase)
 * matching the editorial language of the other dark bands.
 */

type Deliverable = {
  name: string
  type: string
  body: string
  format: string
}

const DELIVERABLES: Deliverable[] = [
  {
    name: 'Revenue Leak Scan',
    type: 'Diagnostic',
    body: 'A written audit naming the single constraint, the evidence behind it, and the lift expected from fixing it. Not a 60-slide deck — a one-page document a CEO can read in 8 minutes.',
    format: '1-page PDF · evidence appendix · loom walkthrough',
  },
  {
    name: 'KPI Scoreboard',
    type: 'Live dashboard',
    body: 'Wired to your real data — GA4, ad accounts, CRM, ESP. Tracks the 4–6 indicators tied to your constraint. Reviewable on your own without a strategist explaining it to you.',
    format: 'Looker Studio · refresh nightly · ownership transfers',
  },
  {
    name: 'One installed asset',
    type: 'In-store implementation',
    body: 'A lifecycle email flow, a structured-data deployment, a GA4 funnel rebuild, or a paid campaign restructure. Whichever matches the constraint we identified. Live in your stack by Week 3.',
    format: 'Production-ready · documented · your team can iterate',
  },
  {
    name: 'Ticket Pack + Fix Order',
    type: '90-day execution plan',
    body: 'A prioritized backlog. Every ticket has an effort estimate, an expected-lift score, and a sequence number. Ready to drop into Linear / Asana / Jira / a Notion table.',
    format: 'CSV + Notion table · 25–40 tickets · sequenced',
  },
]

export function SprintDeliverables() {
  return (
    <SectionRail tone="dark" id="deliverables">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          What you walk out with
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Four artifacts.{' '}
          <span className="text-ink-400">All yours, regardless.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          Every deliverable transfers to you in editable, ownership-clean
          form. If we never speak again after Week 4, your team can keep
          executing.
        </p>
      </div>

      <ul className="mt-16 grid gap-6 md:grid-cols-2">
        {DELIVERABLES.map((d, i) => (
          <li
            key={d.name}
            className="relative flex flex-col border border-white/10 bg-black/30 p-7"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-ink-400">
              Deliverable {(i + 1).toString().padStart(2, '0')}
            </span>

            <h3 className="mt-4 font-display text-2xl font-semibold tracking-[-0.01em] text-white">
              {d.name}
            </h3>

            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-500">
              {d.type}
            </p>

            <p className="mt-5 flex-1 text-ink-300">{d.body}</p>

            <p className="mt-6 border-t border-white/10 pt-4 font-mono text-[11px] text-ink-400">
              {d.format}
            </p>
          </li>
        ))}
      </ul>

      {/* Guarantee strip — the refund commitment. Keeps the band from feeling
          like marketing puffery by closing on a real, falsifiable promise. */}
      <div className="mt-14 border-t border-white/10 pt-10">
        <div className="grid gap-6 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
              Week-1 guarantee
            </p>
            <p className="mt-3 font-display text-2xl font-semibold leading-tight text-white">
              No constraint found, full refund.
            </p>
          </div>
          <p className="md:col-span-8 text-ink-300">
            If we can&rsquo;t isolate a clear, evidence-backed constraint by
            the end of Week 1, we refund the full sprint fee. You keep every
            artifact produced &mdash; the scan, the scoreboard, the
            in-progress asset. No clawback. Never been invoked in 42 sprints.
          </p>
        </div>
      </div>
    </SectionRail>
  )
}
