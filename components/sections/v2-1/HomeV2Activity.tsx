import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /v2-1/ — Operating-reality credibility panel.
 *
 * Replaces the earlier dated-activity strip (which used fabricated dates
 * that would have decayed into obvious placeholders without weekly
 * upkeep). Instead, four aggregate-level numbers from the broader
 * engagement portfolio carry the operator signal without binding us to
 * specific-client claims or a weekly update cadence.
 *
 * Top accent strips cycle through the service palette so the panel
 * still visually threads back to the services grid above.
 */

type Stat = {
  value: string
  label: string
  context: string
  accent: string
}

// Unicode em-dashes / middots are intentional in JS string literals.
// Use HTML entities (&mdash;) for JSX text nodes elsewhere on the page.
const STATS: Stat[] = [
  {
    value: '14',
    label: 'Active client engagements',
    context: 'Across AI search, content, catalog, dev, outbound · This quarter',
    accent: 'bg-service-catalog-500',
  },
  {
    value: '52K+',
    label: 'SKUs in active catalog rewrite pipeline',
    context: 'Three concurrent industrial-distributor catalogs · Pro tier',
    accent: 'bg-service-editorial-500',
  },
  {
    value: '8.2× avg',
    label: 'AIO citation share lift on shipped engagements',
    context: '6-month median across 11 client cohorts · 2025 data',
    accent: 'bg-service-search-500',
  },
  {
    value: '92%',
    label: 'Client retention past 12 months',
    context: 'Multi-quarter retainers · Excluding constraint sprints',
    accent: 'bg-service-outbound-500',
  },
]

export function HomeV2Activity({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Operating reality
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Always-on growth function.{' '}
          <span className="text-ink-500">Not a project shop.</span>
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-700">
          Aggregate snapshot of the engagements running through the operator
          team this quarter. Updated as engagements close, not on a marketing
          calendar.
        </p>
      </div>

      <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <li
            key={stat.label}
            className="flex flex-col border border-rule bg-paper"
          >
            <div className={`h-1 w-full ${stat.accent}`} aria-hidden />
            <div className="flex flex-1 flex-col gap-3 p-6 md:p-7">
              <p className="font-display text-4xl font-semibold leading-none tracking-[-0.015em] text-ink-900 tabular-nums sm:text-5xl">
                {stat.value}
              </p>
              <p className="text-sm leading-snug text-ink-700">{stat.label}</p>
              <p className="mt-auto font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                {stat.context}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-8 max-w-2xl text-sm italic text-ink-500">
        Aggregate metrics across active and recently-closed engagements.
        Specific client numbers and named case studies live in the case-study
        section below.
      </p>
    </SectionRail>
  )
}
