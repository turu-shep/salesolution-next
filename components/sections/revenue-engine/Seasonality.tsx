import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Home-services vertical § seasonality.
 *
 * Spec §6.2 — the storm/seasonal demand spike, FL-aware, no fear-mongering.
 * Demand is spiky; the week it triples is the week most contractors miss
 * the most calls. The engine scales through the surge without hiring.
 */

const POINTS = [
  {
    title: 'Answer the whole surge',
    body: 'When a storm triples your call volume in a day, the AI receptionist answers all of it — crews stay on roofs, no caller hits voicemail.',
  },
  {
    title: 'Book the overflow',
    body: 'Qualified calls go straight to the calendar with reminder sequences, so the surge turns into booked jobs instead of a callback backlog.',
  },
  {
    title: 'Log every storm lead',
    body: 'Every storm-season call recorded and sorted — a record you can use to see which jobs your ad money actually produced.',
  },
]

export function Seasonality({ id }: { id?: string }) {
  return (
    // `paper` (vs the plan's `surface` above it) gives a subtle tonal break so the
    // two adjacent light sections don't read flat.
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Seasonality
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          When demand spikes,{' '}
          the engine scales without hiring.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Roofing and home-services demand is spiky — storm season, heat
          waves, the first freeze. The week demand triples is the week most
          contractors miss the most calls, because the crew is in the field
          and the office is one person.
        </p>
      </div>

      <dl className="mt-12 grid gap-x-12 gap-y-8 sm:grid-cols-3">
        {POINTS.map((p) => (
          <div key={p.title} className="border-t border-rule pt-5">
            <dt className="font-display text-lg font-semibold tracking-[-0.01em] text-ink-900">
              {p.title}
            </dt>
            <dd className="mt-2 text-ink-700">{p.body}</dd>
          </div>
        ))}
      </dl>
    </SectionRail>
  )
}
