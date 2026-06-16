import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine § get found — the demand / top-of-funnel layer.
 *
 * The engine converts demand; first it has to exist. This section makes the
 * full-funnel scope explicit: organic demand generation (local SEO, GBP,
 * GEO / AI-Overview citations, authority content, reviews) is work we own,
 * not something the client brings. Paid ads stay optional fuel they own
 * (see EngineVsFuel). The pillar uses generic defaults; vertical pages can
 * pass their own points.
 */

export type DemandPoint = { kicker: string; title: string; body: string }

const DEFAULT_POINTS: DemandPoint[] = [
  {
    kicker: 'Local search',
    title: 'Map pack + Google Business Profile',
    body: 'Rank for "[service] near me" and the city-plus-service searches that actually dial your phone — the profile, the categories, the on-page signals.',
  },
  {
    kicker: 'AI search · GEO',
    title: 'Cited in AI Overviews',
    body: 'Be the source ChatGPT and Google’s AI pull from when someone asks "best [service] in [city]" or "how much does [service] cost" before they ever click.',
  },
  {
    kicker: 'Authority content',
    title: 'The pages they read before they call',
    body: 'Cost guides, comparisons, and FAQs built to get cited — the research your customer does while deciding who to trust.',
  },
  {
    kicker: 'Reputation',
    title: 'Reviews that compound',
    body: 'A review engine that feeds the map pack and the AI answers, so local authority builds on itself month over month.',
  },
]

export function GetFound({
  id,
  eyebrow = 'Get found',
  headline,
  intro,
  points = DEFAULT_POINTS,
}: {
  id?: string
  eyebrow?: string
  headline?: React.ReactNode
  intro?: React.ReactNode
  points?: DemandPoint[]
}) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          {headline ?? (
            <>
              Demand first.{' '}
              <span className="text-ink-500">We get you found where customers already look.</span>
            </>
          )}
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          {intro ?? (
            <>
              Before anyone can book, they have to find you. So we build the
              demand &mdash; the organic searches, maps, and AI answers your
              customers already use, before a single ad dollar.
            </>
          )}
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {points.map((p) => (
          <div
            key={p.title}
            className="rounded-[4px] border border-rule-strong bg-paper p-7"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-600">
              {p.kicker}
            </p>
            <p className="mt-3 font-display text-xl font-semibold tracking-[-0.01em] text-ink-900">
              {p.title}
            </p>
            <p className="mt-2 text-ink-700">{p.body}</p>
          </div>
        ))}
      </div>
    </SectionRail>
  )
}
