import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /future-proof-your-seo/ § 03 — Why-now timeline on light band.
 *
 * The shipped→next→horizon rhythm. Numbered milestones rather than card
 * chrome; the editorial rail does the framing.
 */

const TIMELINE = [
  {
    year: '2024 Q4',
    label: 'Shipped',
    title: 'SGE → AI Overviews global rollout',
    body:
      'AIO surfaces moved from limited markets to global default. Coverage on US informational queries jumped from ~18% to ~38% inside six months.',
  },
  {
    year: '2025 Q3',
    label: 'Shipped',
    title: 'Shopping inside AI summaries',
    body:
      'Google and ChatGPT both ship product cards inside generative answers. Product schema depth becomes the eligibility test, not a ranking nudge.',
  },
  {
    year: '2026 Q1',
    label: 'Next',
    title: 'Brand-citation primacy over rankings',
    body:
      'Citation-share is replacing rank as the reported KPI. Tools (Ahrefs Brand Radar, Profound, Otterly) shipped this quarter to measure it.',
  },
  {
    year: '2027',
    label: 'Horizon',
    title: 'Paid placements inside AI Overviews',
    body:
      'Sponsored slots arrive. The window where you can win citation share with organic schema work — before pay-to-play kicks in — closes in 12-18 months.',
  },
] as const

const labelStyle: Record<string, string> = {
  Shipped: 'bg-data-up/10 text-data-up ring-data-up/30',
  Next:    'bg-accent-50 text-accent-700 ring-accent-500/30',
  Horizon: 'bg-rule text-ink-700 ring-rule-strong/40',
}

export function WhyNowTimeline() {
  return (
    <SectionRail tone="paper">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Why now &middot; The roadmap
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          The window closes in 18 months.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          AI search is on a one-way ramp. The shifts that hit organic
          traffic in 2024-25 weren&rsquo;t a feature release &mdash; they
          were the retrieval layer changing under the SERP. Here&rsquo;s
          what shipped, what&rsquo;s next, and the horizon you&rsquo;re
          racing.
        </p>
      </div>

      <ol className="mt-14">
        {TIMELINE.map((step, i) => (
          <li
            key={step.year}
            className="grid gap-4 border-t border-rule py-8 md:grid-cols-12 md:gap-10"
          >
            <div className="md:col-span-3">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-ink-400">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <span
                  className={`inline-flex items-center rounded-[3px] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] ring-1 ring-inset ${labelStyle[step.label]}`}
                >
                  {step.label}
                </span>
              </div>
              <p className="mt-3 font-display text-2xl font-semibold tabular-nums text-ink-900">
                {step.year}
              </p>
            </div>
            <div className="md:col-span-9">
              <h3 className="font-display text-xl font-semibold text-ink-900">
                {step.title}
              </h3>
              <p className="mt-2.5 max-w-2xl text-ink-700">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </SectionRail>
  )
}
