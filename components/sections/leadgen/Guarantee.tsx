import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'

export function Guarantee({
  eyebrow = 'The guarantee',
  headline,
  body,
}: {
  eyebrow?: string
  headline: string
  body: string
}) {
  return (
    <Section tone="tint-blue" size="sm">
      <div className="mx-auto max-w-3xl rounded-xl bg-surface p-10 text-center shadow-md ring-1 ring-ink-300/10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
        <Eyebrow className="mt-4">{eyebrow}</Eyebrow>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink-900">
          {headline}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-ink-500">{body}</p>
      </div>
    </Section>
  )
}
