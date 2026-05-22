import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'

type CaseStudy = {
  problem: string
  metrics: string[]
  attribution: { name: string; role: string }
}

const CASES: CaseStudy[] = [
  {
    problem: 'Stagnant organic growth & low search conversion.',
    metrics: [
      '+150% organic sessions in 6 mo',
      '2.8× search-driven leads',
      'Top-3 ranks for 25+ core keywords',
    ],
    attribution: { name: 'Marcus L.', role: 'CEO at ScaleFast' },
  },
  {
    problem: 'High PPC spend with diminishing return.',
    metrics: [
      '−40% ad spend, ↑ leads',
      '#1 rank for industry software',
      'Organic revenue share 15% → 45%',
    ],
    attribution: { name: 'Marcus L.', role: 'CEO at ScaleFast' },
  },
  {
    problem: 'New market entry with zero search presence.',
    metrics: [
      '50+ first-page ranks in 9 mo',
      '$500k pipeline from organic',
      'Thought-leader status in new niche',
    ],
    attribution: { name: 'Marcus L.', role: 'CEO at ScaleFast' },
  },
]

export function RealResults() {
  return (
    <Section tone="alt">
      <div className="text-center">
        <Eyebrow>Real results</Eyebrow>
        <h2 className="mt-3 text-balance">Real businesses, real outcomes</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-500">
          See how our GEO strategies transformed growth for companies like yours.
        </p>
      </div>

      <ul className="mt-12 grid gap-6 md:grid-cols-3">
        {CASES.map((c, i) => (
          <li
            key={i}
            className="flex flex-col rounded-xl bg-surface p-7 shadow-md ring-1 ring-ink-300/10"
          >
            <p className="font-display text-base font-semibold leading-snug text-ink-900">
              &ldquo;{c.problem}&rdquo;
            </p>
            <ul className="mt-5 space-y-2.5 border-t border-ink-300/10 pt-5 text-sm">
              {c.metrics.map((m) => (
                <li key={m} className="flex items-start gap-2.5">
                  <span
                    className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600"
                    aria-hidden
                  />
                  <span className="text-ink-700">{m}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-ink-300/10 pt-3 text-xs text-ink-500">
              <p className="font-semibold text-ink-800">{c.attribution.name}</p>
              <p>{c.attribution.role}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-center text-xs text-ink-400">
        Composite case studies based on aggregated engagement patterns. Real
        client engagements available on request under NDA.
      </p>
    </Section>
  )
}
