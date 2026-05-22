import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /service-areas/ § 3 — Directory of regions served.
 *
 * Honest, deliverable-first directory. Grouped by US census region with
 * a stated coverage note per region (which clients we&rsquo;ve actually
 * delivered for, which states are open for new engagements). Mono
 * labels for region/state per the design system.
 *
 * D9 in the execution roadmap: programmatic per-state landing pages
 * are deferred until we have unique content per state. Until then,
 * this single directory page does the local-SEO work via the JSON-LD
 * AreaServed array in the page route.
 */

type Region = {
  code: string
  name: string
  note: string
  states: string[]
  featured?: boolean
}

const REGIONS: Region[] = [
  {
    code: 'R-01',
    name: 'Southeast',
    note: 'Home region. Headquarters in North Miami Beach, FL.',
    featured: true,
    states: [
      'Florida',
      'Georgia',
      'North Carolina',
      'South Carolina',
      'Tennessee',
      'Alabama',
      'Virginia',
    ],
  },
  {
    code: 'R-02',
    name: 'Northeast',
    note: 'Active retainers in NY, NJ, MA, PA. In-person on request.',
    states: [
      'New York',
      'New Jersey',
      'Pennsylvania',
      'Massachusetts',
      'Connecticut',
      'Rhode Island',
      'Maine',
      'New Hampshire',
      'Vermont',
      'Maryland',
      'Delaware',
    ],
  },
  {
    code: 'R-03',
    name: 'Midwest',
    note: 'Industrial belt — strong fit for hydraulics, fluid power, MRO.',
    states: [
      'Ohio',
      'Michigan',
      'Indiana',
      'Illinois',
      'Wisconsin',
      'Minnesota',
      'Iowa',
      'Missouri',
      'Kansas',
      'Nebraska',
      'North Dakota',
      'South Dakota',
    ],
  },
  {
    code: 'R-04',
    name: 'South Central',
    note: 'Oil &amp; gas, industrial distribution. Texas-heavy book.',
    states: [
      'Texas',
      'Oklahoma',
      'Arkansas',
      'Louisiana',
      'Mississippi',
      'Kentucky',
      'West Virginia',
    ],
  },
  {
    code: 'R-05',
    name: 'Mountain',
    note: 'Mining, energy, agricultural-tech distribution.',
    states: [
      'Colorado',
      'Utah',
      'Nevada',
      'Arizona',
      'New Mexico',
      'Idaho',
      'Montana',
      'Wyoming',
    ],
  },
  {
    code: 'R-06',
    name: 'Pacific',
    note: 'West-coast hours by arrangement. Remote-first delivery.',
    states: [
      'California',
      'Oregon',
      'Washington',
      'Alaska',
      'Hawaii',
    ],
  },
]

const INTERNATIONAL = [
  'Canada',
  'United Kingdom',
  'European Union',
  'Australia',
]

export function AreasDirectory({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Coverage directory
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          All 50 states. <span className="text-ink-500">Grouped by where we&rsquo;ve actually delivered.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-700">
          Engagements are remote by default. The list below reflects
          census regions and the kind of distribution work we&rsquo;ve
          done in each &mdash; not vanity geo-pages.
        </p>
      </div>

      <ol className="mt-14 grid gap-6 md:grid-cols-2">
        {REGIONS.map((r) => (
          <li
            key={r.code}
            className={`group relative ${r.featured ? 'md:col-span-2' : ''}`}
          >
            <div
              className={`relative h-full border bg-surface p-6 md:p-8 ${
                r.featured
                  ? 'border-ink-900 shadow-[0_30px_80px_-30px_rgba(15,20,30,0.20)]'
                  : 'border-rule'
              }`}
            >
              {r.featured && (
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-full w-[3px] bg-accent-500"
                />
              )}

              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                    Region &middot; {r.code}
                  </p>
                  <h3
                    className={`mt-2 font-display font-semibold tracking-[-0.01em] text-ink-900 ${
                      r.featured ? 'text-3xl sm:text-4xl' : 'text-2xl'
                    }`}
                  >
                    {r.name}
                  </h3>
                </div>
                {r.featured && (
                  <span className="inline-block rounded-[3px] bg-accent-500 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                    Home region
                  </span>
                )}
              </div>

              <p
                className="mt-4 max-w-2xl text-ink-700"
                dangerouslySetInnerHTML={{ __html: r.note }}
              />

              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-rule pt-5">
                {r.states.map((s) => (
                  <li
                    key={s}
                    className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-700"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-14 border-t border-rule pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              International &middot; retainer only
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
              Outside the US.
            </h3>
          </div>
          <p className="max-w-md text-sm text-ink-500">
            Retainer-only for English-language sites. ET-overlapping
            hours required for standups.
          </p>
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          {INTERNATIONAL.map((c) => (
            <li
              key={c}
              className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-700"
            >
              {c}
            </li>
          ))}
        </ul>
      </div>
    </SectionRail>
  )
}
