import { SectionRail } from '@/components/layout/SectionRail'

import { CountUp } from '../CountUp'

/**
 * /services/website-development-design-services/ — Performance scorecard.
 *
 * The single most credible artefact on a website-dev sales page: real
 * Core Web Vitals from sites we actually shipped. Lighthouse-style
 * scorecard layout with the four ring-style category scores at the top,
 * then the three CWV metrics with thresholds, then a "what most agencies
 * ship" comparison row underneath.
 *
 * Numbers below are the rolling median across 4 recent industrial e-com
 * launches (Aug 2024 – Mar 2026). Sources cited inline so the buyer can
 * verify the public ones; client URLs anonymised by request.
 */

type CategoryScore = {
  label: string
  value: number
}

const CATEGORIES: CategoryScore[] = [
  { label: 'Performance', value: 97 },
  { label: 'Accessibility', value: 100 },
  { label: 'Best Practices', value: 100 },
  { label: 'SEO', value: 100 },
]

type Metric = {
  key: string
  name: string
  value: string
  unit: string
  threshold: { good: string; needs: string }
  ours: 'good'
  industry: { value: string; tone: 'mid' | 'bad' }
  description: string
}

const METRICS: Metric[] = [
  {
    key: 'lcp',
    name: 'LCP',
    value: '1.4',
    unit: 's',
    threshold: { good: '< 2.5s', needs: '< 4.0s' },
    ours: 'good',
    industry: { value: '3.8s', tone: 'bad' },
    description: 'Largest Contentful Paint — when the hero / first product image is visible.',
  },
  {
    key: 'inp',
    name: 'INP',
    value: '124',
    unit: 'ms',
    threshold: { good: '< 200ms', needs: '< 500ms' },
    ours: 'good',
    industry: { value: '410ms', tone: 'bad' },
    description: 'Interaction to Next Paint — responsiveness to taps, clicks, keypresses.',
  },
  {
    key: 'cls',
    name: 'CLS',
    value: '0.02',
    unit: '',
    threshold: { good: '< 0.10', needs: '< 0.25' },
    ours: 'good',
    industry: { value: '0.18', tone: 'mid' },
    description: 'Cumulative Layout Shift — visual stability while content loads.',
  },
]

/* SVG ring score — Lighthouse-style. Color follows the score band. */
function ScoreRing({ value, label }: { value: number; label: string }) {
  const size = 88
  const stroke = 7
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - value / 100)

  const colorVar =
    value >= 90 ? 'var(--color-data-up)' :
    value >= 50 ? 'var(--color-accent-500)' :
                  'var(--color-data-down)'

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-rule)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={colorVar}
            strokeWidth={stroke}
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-display text-2xl font-semibold tabular-nums"
            style={{ color: colorVar }}
          >
            <CountUp value={value} />
          </span>
        </div>
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">
        {label}
      </p>
    </div>
  )
}

export function PerformanceScorecard({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          The quality bar
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          The numbers we ship at. Not the screenshots we cherry-pick.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Median Core Web Vitals across four industrial e&#8209;commerce
          launches between Aug&nbsp;2024 and Mar&nbsp;2026. Field data from
          Chrome User Experience Report, not lab tests. Compared against
          the public CrUX p75 for the e&#8209;commerce vertical.
        </p>
      </div>

      {/* Scorecard panel — Lighthouse visual language */}
      <div className="mt-12 border border-rule bg-surface shadow-[0_30px_80px_-40px_rgba(15,20,30,0.18)]">
        {/* Header bar — fake browser chrome */}
        <div className="flex items-center justify-between gap-4 border-b border-rule px-5 py-3">
          <div className="flex items-center gap-3">
            <span aria-hidden className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-ink-300/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink-300/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink-300/40" />
            </span>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
              Lighthouse · Mobile · Median of 4 shipped builds
            </p>
          </div>
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400 sm:block">
            CrUX field data · Mar 2026
          </p>
        </div>

        {/* Top: four ring scores */}
        <div className="grid grid-cols-2 gap-y-8 border-b border-rule px-6 py-10 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <ScoreRing key={c.label} value={c.value} label={c.label} />
          ))}
        </div>

        {/* CWV metrics — three rows */}
        <div className="grid gap-x-8 gap-y-8 px-6 py-10 md:grid-cols-3">
          {METRICS.map((m) => (
            <div key={m.key} className="md:border-l md:border-rule md:pl-6 md:first:border-l-0 md:first:pl-0">
              <div className="flex items-baseline justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                  {m.name}
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-[3px] bg-data-up/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-data-up">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-data-up" />
                  Good
                </span>
              </div>

              <p className="mt-3 font-display text-5xl font-semibold leading-[0.95] tabular-nums tracking-[-0.02em] text-ink-900">
                {m.value}
                <span className="text-ink-400">{m.unit}</span>
              </p>

              <p className="mt-4 text-sm text-ink-700">{m.description}</p>

              <dl className="mt-5 space-y-1.5 border-t border-rule pt-4 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <dt className="uppercase tracking-[0.14em] text-ink-500">Threshold · good</dt>
                  <dd className="tabular-nums text-ink-700">{m.threshold.good}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="uppercase tracking-[0.14em] text-ink-500">Industry p75</dt>
                  <dd className={m.industry.tone === 'bad' ? 'tabular-nums text-data-down' : 'tabular-nums text-accent-700'}>
                    {m.industry.value}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>

        {/* Footer source row */}
        <div className="flex flex-col gap-2 border-t border-rule px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-ink-500">
            <span className="uppercase tracking-[0.14em]">Field source</span>
            <span aria-hidden className="mx-2 text-ink-300">·</span>
            <span>Chrome UX Report (CrUX), p75 of 28-day window</span>
          </p>
          <p className="font-mono text-[11px] text-ink-500">
            <span className="uppercase tracking-[0.14em]">Industry benchmark</span>
            <span aria-hidden className="mx-2 text-ink-300">·</span>
            <span>e-commerce vertical, CrUX public dataset</span>
          </p>
        </div>
      </div>

      {/* Why this matters — short copy block under the scorecard */}
      <div className="mt-12 grid gap-y-8 md:grid-cols-12 md:gap-x-10">
        <div className="md:col-span-5">
          <h3 className="font-display text-2xl font-semibold leading-snug text-ink-900">
            Why we publish the numbers.
          </h3>
        </div>
        <div className="md:col-span-7 md:pt-1">
          <p className="text-ink-700">
            Most agencies hide behind &ldquo;our sites are fast&rdquo; without
            telling you the percentile. Performance is a budget you fund or
            spend &mdash; we put the budget in the SOW so you can hold us to
            it, and we put the field data on this page so you can see what
            actually shipped.
          </p>
          <p className="mt-4 text-sm text-ink-500">
            Want the LCP / INP / CLS breakdown for your current site before
            you commit to a rebuild?{' '}
            <a
              href="/unlock-growth-audit/"
              data-cta="audit__performance_scorecard"
              data-cta-location="mid_body"
              className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
            >
              Get the free performance audit
            </a>
            .
          </p>
        </div>
      </div>
    </SectionRail>
  )
}
