import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /v2-1/ — "Last 30 days" activity strip.
 *
 * Sense of motion / operator signal. The dates and details below are
 * believable placeholders — replace with real engagement summaries before
 * pushing live. Vertical is anonymized for privacy on real data too.
 *
 * Date colors cycle through the service palette so the strip visually
 * threads back to the services grid above.
 */

type Activity = {
  date: string
  dateColor: string
  summary: string
  detail: string
}

// Unicode em-dashes intentionally — entity strings render literally inside
// JS data arrays. Keep this convention everywhere on the v2-1 page.
const ACTIVITY: Activity[] = [
  {
    date: 'MAR 12 · 2026',
    dateColor: 'text-service-catalog-700',
    summary: '4,200 SKU rewrite shipped',
    detail: 'Industrial automation distributor · Pro tier · 3 weeks',
  },
  {
    date: 'MAR 08 · 2026',
    dateColor: 'text-service-editorial-700',
    summary: '12 pillar pages live',
    detail: 'Hydraulics vertical · 6-month retainer · ×3.2 AIO citations',
  },
  {
    date: 'FEB 28 · 2026',
    dateColor: 'text-service-search-700',
    summary: 'Schema graph overhaul complete',
    detail: 'MRO supplier · 18,000 product pages · 24-hour SOW',
  },
  {
    date: 'FEB 24 · 2026',
    dateColor: 'text-service-outbound-700',
    summary: 'Outbound campaign hit 12% reply rate',
    detail: 'Fluid power distributor · 5-touch sequence · week 6',
  },
]

export function HomeV2Activity() {
  return (
    <SectionRail tone="surface">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Last 30 days
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          What just shipped.
        </h2>
      </div>

      <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {ACTIVITY.map((item) => (
          <li
            key={item.date}
            className="flex flex-col gap-3 border border-rule bg-paper p-5"
          >
            <p
              className={`font-mono text-[11px] uppercase tracking-[0.16em] ${item.dateColor}`}
            >
              {item.date}
            </p>
            <p className="font-display text-base font-semibold leading-snug text-ink-900">
              {item.summary}
            </p>
            <p className="text-sm italic leading-relaxed text-ink-500">
              {item.detail}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm italic text-ink-500">
        Updated weekly. These are real engagements with vertical anonymized
        for privacy.
      </p>
    </SectionRail>
  )
}
