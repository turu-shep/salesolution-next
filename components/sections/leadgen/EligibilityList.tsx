import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'

export function EligibilityList({
  eyebrow,
  headline,
  fits,
  doesNotFit,
}: {
  eyebrow?: string
  headline: string
  fits: string[]
  doesNotFit: string[]
}) {
  return (
    <Section>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="mt-3 text-balance">{headline}</h2>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-surface-tint-cool p-7 ring-1 ring-ink-300/10">
          <p className="font-display text-sm font-semibold uppercase tracking-wider text-brand-600">
            Best fit
          </p>
          <ul className="mt-4 space-y-3">
            {fits.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-ink-700">
                <CheckIcon className="mt-0.5 shrink-0 text-brand-600" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-surface-tint-warm p-7 ring-1 ring-ink-300/10">
          <p className="font-display text-sm font-semibold uppercase tracking-wider text-danger-500">
            Not a fit
          </p>
          <ul className="mt-4 space-y-3">
            {doesNotFit.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-ink-700">
                <XIcon className="mt-0.5 shrink-0 text-danger-500" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function XIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  )
}
