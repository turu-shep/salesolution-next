import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'

export type ProcessStep = {
  title: string
  body: string
  duration?: string
}

export function ProcessSteps({
  eyebrow,
  headline,
  steps,
  tone = 'default',
}: {
  eyebrow?: string
  headline: string
  steps: ProcessStep[]
  tone?: 'default' | 'alt'
}) {
  return (
    <Section tone={tone}>
      <div className="text-center">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="mt-3 text-balance">{headline}</h2>
      </div>

      <ol className="relative mt-12 grid gap-6 md:grid-cols-4">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="relative rounded-lg bg-surface p-6 ring-1 ring-ink-300/10"
          >
            <span className="font-display text-3xl font-bold text-brand-600">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-3 font-display text-lg font-semibold text-ink-900">
              {s.title}
            </h3>
            {s.duration && (
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-500">
                {s.duration}
              </p>
            )}
            <p className="mt-3 text-sm text-ink-500">{s.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
