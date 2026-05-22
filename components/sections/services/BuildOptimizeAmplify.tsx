import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'

type Subphase = {
  label: string
  items: string[]
}

const PHASES: Subphase[] = [
  {
    label: 'Build',
    items: [
      'Visualise your entire keyword universe',
      'Schema automation',
      'Content engine',
      'Technical SEO audit',
    ],
  },
  {
    label: 'Optimize',
    items: [
      'CWV performance sprint',
      'UX micro-tests',
      'Intent-led internal linking',
      'Conversion rate optimization',
    ],
  },
  {
    label: 'Amplify',
    items: [
      'Authority outreach',
      'Cited-by-AI asset publishing',
      'Digital PR campaigns',
      'Brand-mention monitoring',
    ],
  },
  {
    label: 'Sustain',
    items: [
      'Quarterly review cadence',
      'Algorithm-change response loops',
      'Content refresh cycles',
      'Revenue-tied scoreboard',
    ],
  },
]

export function BuildOptimizeAmplify() {
  return (
    <Section>
      <div className="text-center">
        <Eyebrow>Unlock 25% higher ROI</Eyebrow>
        <h2 className="mt-3 text-balance">
          The Elite GEO team operating model
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-500">
          A 4-stage operating loop that runs every quarter. Each stage compounds
          on the one before — no rip-and-replace, no specialist hand-offs.
        </p>
      </div>

      <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PHASES.map((p, i) => (
          <li
            key={p.label}
            className="rounded-xl bg-surface-tint-blue p-6 ring-1 ring-ink-300/10"
          >
            <span className="font-display text-3xl font-bold text-brand-600">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-3 font-display text-xl font-semibold text-ink-900">
              {p.label}
            </h3>
            <ul className="mt-4 space-y-2 border-t border-ink-300/15 pt-4 text-sm">
              {p.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="mt-1 shrink-0 text-brand-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-ink-700">{item}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  )
}
