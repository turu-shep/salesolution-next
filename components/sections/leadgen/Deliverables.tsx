import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'

export type Deliverable = {
  title: string
  body: string
  badge?: string
}

export function Deliverables({
  eyebrow,
  headline,
  items,
  tone = 'alt',
}: {
  eyebrow?: string
  headline: string
  items: Deliverable[]
  tone?: 'default' | 'alt'
}) {
  return (
    <Section tone={tone}>
      <div className="text-center">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="mt-3 text-balance">{headline}</h2>
      </div>

      <ul className="mt-12 grid gap-6 md:grid-cols-2">
        {items.map((d) => (
          <li
            key={d.title}
            className="rounded-lg bg-surface p-7 shadow-md ring-1 ring-ink-300/10"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-lg font-semibold text-ink-900">
                {d.title}
              </h3>
              {d.badge && (
                <span className="shrink-0 rounded-pill bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                  {d.badge}
                </span>
              )}
            </div>
            <p className="mt-3 text-sm text-ink-500">{d.body}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
