import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'

const STEPS = [
  {
    title: 'Discovery call',
    duration: '30 min',
    body: 'A real conversation — not a discovery survey. We learn your store, your team, your pain.',
    tint: 'bg-surface-tint-blue',
  },
  {
    title: 'Custom proposal',
    duration: 'Within 24h',
    body: 'Written scope, timeline, ROI forecast, team composition. No slide decks.',
    tint: 'bg-surface-tint-cool',
  },
  {
    title: '30-day pilot',
    duration: 'Month 1',
    body: 'A scoped engagement that proves the value before you commit longer-term.',
    tint: 'bg-surface-tint-warm',
  },
  {
    title: 'Scale and ascend',
    duration: 'Month 2+',
    body: 'A retained partnership tied to revenue outcomes — not hours, not deliverables.',
    tint: 'bg-surface-tint-blue',
  },
]

export function ContactJourney() {
  return (
    <Section tone="alt">
      <div className="text-center">
        <Eyebrow>The journey</Eyebrow>
        <h2 className="mt-3 text-balance">Your journey with us</h2>
      </div>

      <ol className="mt-12 grid gap-6 md:grid-cols-4">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className={`rounded-xl p-6 ring-1 ring-ink-300/10 ${s.tint}`}
          >
            <span className="font-display text-3xl font-bold text-brand-600">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-3 font-display text-lg font-semibold text-ink-900">
              {s.title}
            </h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-brand-600">
              {s.duration}
            </p>
            <p className="mt-3 text-sm text-ink-700">{s.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
