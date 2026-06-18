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
    outcome: { value: 12, prefix: '+', unit: '%', label: 'more AI answers cite you' },
    title: 'Get AI-ready',
    description:
      'The groundwork that lets AI and search engines actually read your site and understand what you sell.',
    items: [
      { title: 'The plumbing', body: 'Fast pages, clean product info, and a site AI can actually read. The boring stuff everything else needs.' },
      { title: 'Show up where buyers look', body: 'A presence on YouTube and LinkedIn, aimed at the people who actually buy from you.' },
      { title: 'Pages that answer real questions', body: 'Product pages and guides written so a buyer — and an AI — gets a straight answer fast.' },
      { title: 'Make it easy to buy', body: "Checkout and quote requests that don't make a ready buyer jump through hoops." },
    ],
  },
  {
    number: '02',
    name: 'Amplify',
    window: 'Months 4–9',
    outcome: { value: 43, prefix: '+', unit: '%', label: 'qualified leads' },
    title: 'Become the name they trust',
    description:
      'Go deep enough on your subject that AI keeps quoting you and buyers keep choosing you — and it builds quarter after quarter.',
    items: [
      { title: 'Treat repeat buyers like regulars', body: 'Use what you know about customers to bring them back and grow what each one is worth.' },
      { title: 'Ads that keep up with AI', body: 'Paid search tuned for how people actually ask questions now, including inside AI tools.' },
      { title: 'One clear story everywhere', body: 'The same straight message wherever a buyer — or an AI — runs into you.' },
      { title: 'Numbers that tell the truth', body: "Plain measures of whether you're getting found and chosen, reviewed every quarter." },
    ],
  },
  {
    number: '03',
    name: 'Lead',
    window: 'Months 10+',
    outcome: { value: 2.5, decimals: 1, unit: '×', label: 'return on spend' },
    title: 'Stay out front',
    description:
      'Steady improvements that keep you ahead when Google and AI change the rules, instead of scrambling every time they do.',
    items: [
      { title: 'Own your subject', body: 'Deep, well-organized content that makes you the source AI reaches for first.' },
      { title: 'Get mentioned where it counts', body: 'Trade press, podcasts, and webinars — the places AI trusts and quotes.' },
      { title: 'Watch what AI says about you', body: 'Track how often AI names you, how it describes you, and where you stand against competitors.' },
      { title: 'More from every visit', body: 'Test, follow up, and improve so each visitor is worth more over time.' },
    ],
  },
]

export function FrameworkTimeline({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <h2 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Three phases. Each one earns the next.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          One operator runs all three. We don&rsquo;t move to the next phase
          until the last one has done its job &mdash; so each win sits on solid
          ground, not a shaky foundation.
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
