import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Editorial Authority § 01 — market reality.
 *
 * Three structural shifts behind why editorial content needs rebuilding.
 * Light paper tone (matches the page's amber-led rhythm). Stat cards lean
 * on the same shape as ContentMarketReality but sit on a light band so
 * they read as a calibrated reference, not a marketing dunk.
 */

type Stat = {
  value: string
  label: string
  source: string
}

const STATS: Stat[] = [
  {
    value: '−34%',
    label: 'CTR on informational queries since AIO rollout',
    source: 'Ahrefs Content Explorer, B2B segment · Jan 2024–Mar 2026',
  },
  {
    value: '×2.7',
    label: 'More content shipped per quarter to hold position',
    source: 'Aggregated client data · 30 industrial B2B sites, 2025',
  },
  {
    value: '78%',
    label: 'Of AI-generated content earns zero AIO citations in 90 days',
    source: 'Salesolution citation tracker · 8,200 page sample, Q1 2026',
  },
]

export function EditorialMarketReality({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Why editorial needs rebuilding
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Generalist content is now free.{' '}
          Cited content isn&rsquo;t.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-700">
          AI engines harvest the web, paraphrase the answer, and keep the
          click. The only content that still earns a citation is content a
          model can&rsquo;t synthesize on its own &mdash; first-hand specs,
          named operators, source-grade engineering answers.
        </p>
      </div>

      <ul className="mt-14 grid gap-px bg-rule sm:grid-cols-3">
        {STATS.map((s) => (
          <li
            key={s.label}
            className="relative flex flex-col bg-paper p-6 md:p-8"
          >
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-1 bg-service-editorial-500"
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-service-editorial-700">
              Δ &middot; structural shift
            </p>
            <p className="mt-4 font-display text-6xl font-semibold leading-[0.95] tabular-nums tracking-[-0.03em] text-ink-900 sm:text-7xl">
              {s.value}
            </p>
            <p className="mt-5 font-display text-lg font-semibold leading-snug text-ink-900">
              {s.label}
            </p>
            <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-500">
              {s.source}
            </p>
          </li>
        ))}
      </ul>
    </SectionRail>
  )
}
