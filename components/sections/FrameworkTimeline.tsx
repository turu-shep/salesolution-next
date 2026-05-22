import { SectionRail } from '@/components/layout/SectionRail'

import { CountUp } from './CountUp'

/**
 * Home § 03 — Framework.
 *
 * The track is the centerpiece visual: three phase stations connected by
 * a dashed rail, each with a window label, an outcome metric, and a vertical
 * drop-line into the items column below. Reads as an engineering process
 * diagram, not a slide-deck triptych.
 */

type Item = { title: string; body: string }
type Phase = {
  number: string
  name: string
  window: string
  outcome: {
    value: number
    decimals?: number
    prefix?: string
    unit: string
    label: string
  }
  title: string
  description: string
  items: Item[]
}

const PHASES: Phase[] = [
  {
    number: '01',
    name: 'Foundation',
    window: 'Months 1–3',
    outcome: { value: 12, prefix: '+', unit: '%', label: 'AIO citations' },
    title: 'AI-Ready Foundation',
    description:
      'Technical, structural, and content fundamentals that make your store legible to AI parsers and ranking models.',
    items: [
      { title: 'Technical excellence', body: "Schema, product feeds, site speed, mobile-first — the AI parser's preconditions." },
      { title: 'Platform diversification', body: 'YouTube and LinkedIn presence calibrated to a technical buyer audience.' },
      { title: 'Content clarity', body: 'Product pages and guides structured for AI parsing and H-E-E-A-T alignment.' },
      { title: 'Frictionless checkout', body: 'Modern payment paths and quote flows that match technical-buyer expectations.' },
    ],
  },
  {
    number: '02',
    name: 'Amplify',
    window: 'Months 4–9',
    outcome: { value: 43, prefix: '+', unit: '%', label: 'qualified leads' },
    title: 'Authority & Engagement',
    description:
      'Topical depth, citation engineering, and engagement systems that compound your visibility quarter over quarter.',
    items: [
      { title: 'Hyper-personalization', body: 'Customer data drives tailored experiences that lift CLV.' },
      { title: 'Intelligent PPC', body: 'Paid search adapted for AI ad surfaces and conversational queries.' },
      { title: 'Omnichannel SEO', body: 'Unified messaging across every surface AI engines crawl.' },
      { title: 'AI-driven insights', body: 'New visibility KPIs that keep the strategy honest quarter over quarter.' },
    ],
  },
  {
    number: '03',
    name: 'Lead',
    window: 'Months 10+',
    outcome: { value: 2.5, decimals: 1, unit: '×', label: 'ARR multiple' },
    title: 'Sustainable Growth',
    description:
      'Ongoing optimization cycles that ride algorithm changes instead of reacting to them.',
    items: [
      { title: 'Cited authority strategy', body: 'Pillar pages, topic clusters, and structured data tuned for generative engines.' },
      { title: 'Digital PR & citation engineering', body: 'Trade press, podcasts, webinars — sources AI engines preferentially reference.' },
      { title: 'AI trust monitoring', body: 'Brand sentiment, citation tracking, and competitive positioning inside AI surfaces.' },
      { title: 'Compounding revenue cycles', body: 'A/B testing, lifecycle systems, and revenue-per-visitor optimization.' },
    ],
  },
]

export function FrameworkTimeline({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <h2 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          A 3-phase adaptation framework.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          One operator, three sequential phases. Each phase has an exit
          criterion that clears before we move &mdash; so gains compound
          instead of stacking on an unbuilt foundation.
        </p>
      </div>

      {/* The track + stations. Each station has phase header above the dashed
          rail, then a hard drop-line into the items column below. */}
      <div className="mt-16 grid grid-cols-3 gap-x-8 md:gap-x-12">
        {PHASES.map((p, i) => (
          <div key={p.number} className="relative">
            {/* Station header: phase number + outcome metric */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                  Phase &middot; {p.number}
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
                  {p.name}
                </p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
                  {p.window}
                </p>
              </div>
              {i === 0 && (
                <span className="rounded-[3px] bg-accent-500 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-white">
                  Start
                </span>
              )}
            </div>

            {/* Outcome metric — what you should see by end of phase */}
            <div className="mt-6 border-t border-rule pt-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                Outcome by end of phase
              </p>
              <p className="mt-2 font-display text-5xl font-semibold leading-[0.95] tabular-nums tracking-[-0.02em] text-ink-900 sm:text-6xl">
                <CountUp
                  value={p.outcome.value}
                  decimals={p.outcome.decimals ?? 0}
                  prefix={
                    p.outcome.prefix ? (
                      <span className={i === 0 ? 'text-accent-500' : 'text-brand-600'}>
                        {p.outcome.prefix}
                      </span>
                    ) : null
                  }
                  className={i === 0 ? 'text-accent-500' : 'text-brand-600'}
                />
                <span className="text-ink-400">{p.outcome.unit}</span>
              </p>
              <p className="mt-2 text-sm text-ink-700">{p.outcome.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Dashed rail with station markers below the headers */}
      <div className="relative mt-12">
        <svg
          viewBox="0 0 1000 24"
          preserveAspectRatio="none"
          className="block h-6 w-full"
          aria-hidden
        >
          <line
            x1="0"
            y1="12"
            x2="1000"
            y2="12"
            stroke="var(--color-rule-strong)"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
          {[166, 500, 833].map((cx, i) => {
            const isStart = i === 0
            const color = isStart ? 'var(--color-accent-500)' : 'var(--color-brand-600)'
            return (
              <g key={i}>
                <circle cx={cx} cy="12" r="10" fill="var(--color-paper)" stroke={color} strokeWidth="1.5" />
                <circle cx={cx} cy="12" r="4" fill={color} />
              </g>
            )
          })}
        </svg>
      </div>

      {/* Phase items columns below the rail */}
      <ol className="mt-12 grid gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-0 md:gap-x-12">
        {PHASES.map((p, i) => (
          <li
            key={p.number}
            className={
              i === 0
                ? ''
                : 'md:border-l md:border-rule md:pl-6'
            }
          >
            <h3 className="font-display text-lg font-semibold text-ink-900">
              {p.title}
            </h3>
            <p className="mt-3 text-sm text-ink-700">{p.description}</p>

            <ul className="mt-6 space-y-6 border-t border-rule pt-5">
              {p.items.map((item) => (
                <li key={item.title}>
                  <p className="font-display text-base font-semibold text-ink-900">
                    {item.title}
                  </p>
                  <p className="mt-1.5 text-sm text-ink-700">{item.body}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </SectionRail>
  )
}
