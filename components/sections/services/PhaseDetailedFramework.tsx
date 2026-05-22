import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'

type Group = {
  title: string
  bullets: string[]
}

type Phase = {
  number: string
  title: string
  badge: string
  intro: string
  groupsLabel: string
  groups: Group[]
  result: string
  defaultOpen?: boolean
}

/**
 * The 3-phase expandable framework on /services/. Native <details>/<summary>
 * for accordion behavior — no client JS state, server-rendered, accessible
 * out of the box. First phase opens by default.
 */
const PHASES: Phase[] = [
  {
    number: '01',
    title: 'Foundation',
    badge: '+118% Revenue Lift',
    intro:
      "Stop bleeding money from preventable issues. We audit and fix the foundational problems that kill both conversions and visibility. This isn't sexy work, but it's the difference between a business that scales and one that stalls at $5M.",
    groupsLabel: 'What we optimize',
    groups: [
      {
        title: 'Conversion & UX',
        bullets: [
          'Full CRO audit with heatmaps and user behavior analysis',
          'Checkout flow optimization (reduce 69% cart abandonment)',
          'Mobile experience overhaul',
          'A/B testing for maximum revenue per visitor',
          'Sales copy that converts browsers into buyers',
        ],
      },
      {
        title: 'Technical SEO & Performance',
        bullets: [
          'Fix 100+ technical errors killing your rankings',
          'Site speed optimization (every second = 7% more conversions)',
          'Schema markup for AI search visibility',
          'Core Web Vitals & crawlability fixes',
          'Platform-specific optimization',
        ],
      },
    ],
    result:
      'A rock-solid foundation that turns visitors into customers. Most clients see 30-50% conversion lifts within 60 days.',
    defaultOpen: true,
  },
  {
    number: '02',
    title: 'Authority Building',
    badge: '+43% CTR',
    intro:
      'Your competitors are eating your lunch in search results. We build the content fortress and authority signals that dominate both Google and AI engines. This is how you go from page 3 to position 1 — and stay there.',
    groupsLabel: 'What we build',
    groups: [
      {
        title: 'Content & Topical Authority',
        bullets: [
          'Strategic content pillars that own entire topic clusters',
          'E-E-A-T optimization (Expertise, Experience, Authority, Trust)',
          'AI-optimized content that ChatGPT and Perplexity cite',
          'Competitor gap analysis and content warfare strategy',
          'FAQ and Q&A schema for featured snippets',
        ],
      },
      {
        title: 'Link Building & Digital PR',
        bullets: [
          '10-15 high-authority backlinks monthly',
          'Strategic outreach to industry publications',
          'Digital PR campaigns that earn real coverage',
          'Brand mention reclamation',
          'Competitor link theft tactics',
        ],
      },
    ],
    result:
      'Become the undisputed authority in your niche. Watch your organic traffic triple while competitors wonder what happened.',
  },
  {
    number: '03',
    title: 'Compounding Growth',
    badge: '×2.5 ROI',
    intro:
      "Traffic without conversion is vanity. Revenue without retention is insanity. We turn your one-time buyers into lifetime customers while squeezing every drop of revenue from every visitor. This is where 7-figure brands become 8-figure machines.",
    groupsLabel: 'What we compound',
    groups: [
      {
        title: 'Revenue Optimization',
        bullets: [
          'Continuous A/B testing program (never stop improving)',
          'Personalization engines that boost AOV by 25%+',
          'Upsell and cross-sell flows that actually work',
          'Dynamic pricing and promotion testing',
          'Multi-channel attribution modeling',
        ],
      },
      {
        title: 'Customer Lifecycle Maximization',
        bullets: [
          'Email automation that prints money (30%+ of revenue)',
          'Win-back campaigns for dormant customers',
          'VIP segmentation and loyalty programs',
          'Post-purchase sequences that triple LTV',
          'SMS and push notification optimization',
        ],
      },
    ],
    result:
      "Watch your revenue per visitor double, then triple. While competitors fight for new traffic, you're building a compound growth engine that turns every customer into 3.5× more revenue.",
  },
]

export function PhaseDetailedFramework() {
  return (
    <Section>
      <div className="text-center">
        <Eyebrow>Our proven framework</Eyebrow>
        <h2 className="mt-3 text-balance">
          A systematic approach that turns search presence into a predictable revenue engine
        </h2>
      </div>

      <ul className="mx-auto mt-12 max-w-4xl space-y-4">
        {PHASES.map((p) => (
          <li
            key={p.number}
            className="overflow-hidden rounded-xl bg-surface ring-1 ring-ink-300/15 shadow-sm transition hover:shadow-md"
          >
            <details className="group" open={p.defaultOpen}>
              <summary className="flex cursor-pointer list-none items-center gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-lg font-bold text-brand-600">
                  {p.number}
                </span>
                <h3 className="flex-1 font-display text-xl font-semibold text-ink-900">
                  {p.title}
                </h3>
                <span className="hidden rounded-pill bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 sm:inline-flex">
                  {p.badge}
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-ink-500 transition group-open:rotate-180"
                  aria-hidden
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>

              <div className="border-t border-ink-300/15 px-6 py-6">
                <p className="text-ink-700">{p.intro}</p>

                <p className="mt-7 font-display text-base font-semibold text-ink-900">
                  {p.groupsLabel}:
                </p>

                <div className="mt-4 grid gap-8 md:grid-cols-2">
                  {p.groups.map((g) => (
                    <div key={g.title}>
                      <h4 className="font-display text-base font-semibold text-ink-800">
                        {g.title}
                      </h4>
                      <ul className="mt-3 space-y-2.5">
                        {g.bullets.map((b) => (
                          <li
                            key={b}
                            className="flex items-start gap-3 text-sm text-ink-700"
                          >
                            <span
                              className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600"
                              aria-hidden
                            >
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <p className="mt-7 rounded-lg bg-surface-tint-blue px-5 py-4 text-sm text-ink-800">
                  <span className="font-semibold text-ink-900">Result:</span>{' '}
                  {p.result}
                </p>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </Section>
  )
}
