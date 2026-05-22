import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'

export type Pillar = {
  title: string
  body: string
}

export function ValuePillars({
  eyebrow,
  headline,
  pillars,
  tone = 'default',
}: {
  eyebrow?: string
  headline: string
  pillars: Pillar[]
  tone?: 'default' | 'alt' | 'tint-blue'
}) {
  return (
    <Section tone={tone}>
      <div className="text-center">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="mt-3 text-balance">{headline}</h2>
      </div>

      <ul
        className={`mt-12 grid gap-6 ${
          pillars.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'
        }`}
      >
        {pillars.map((p) => (
          <li
            key={p.title}
            className="rounded-lg bg-surface p-6 shadow-md ring-1 ring-ink-300/10"
          >
            <h3 className="font-display text-lg font-semibold text-ink-900">{p.title}</h3>
            <p className="mt-3 text-sm text-ink-500">{p.body}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
