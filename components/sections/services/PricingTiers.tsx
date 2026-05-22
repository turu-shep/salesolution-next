import Link from 'next/link'

import { Section } from '@/components/layout/Section'
import { Eyebrow } from '@/components/sections/Eyebrow'
import { cn } from '@/lib/cn'

export type PricingTier = {
  name: string
  price: string
  cadence?: string
  tagline?: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  highlight?: boolean
}

export function PricingTiers({
  eyebrow,
  headline,
  sub,
  tiers,
  tone = 'default',
}: {
  eyebrow?: string
  headline: string
  sub?: string
  tiers: PricingTier[]
  tone?: 'default' | 'alt'
}) {
  return (
    <Section tone={tone}>
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="mt-3 text-balance">{headline}</h2>
        {sub && <p className="mx-auto mt-4 text-lg text-ink-500">{sub}</p>}
      </div>

      <div
        className={cn(
          'mt-12 grid gap-6',
          tiers.length === 6 && 'lg:grid-cols-3',
          tiers.length === 5 && 'lg:grid-cols-5 md:grid-cols-2',
          tiers.length === 4 && 'lg:grid-cols-4 md:grid-cols-2',
          tiers.length === 3 && 'md:grid-cols-3',
        )}
      >
        {tiers.map((t) => (
          <article
            key={t.name}
            className={cn(
              'flex flex-col rounded-xl bg-surface p-6 ring-1',
              t.highlight
                ? 'shadow-lg ring-brand-600 lg:scale-[1.02]'
                : 'shadow-md ring-ink-300/10',
            )}
          >
            {t.highlight && (
              <p className="-mt-9 mb-4 self-start rounded-pill bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                Most popular
              </p>
            )}
            <h3 className="font-display text-lg font-semibold text-ink-900">{t.name}</h3>
            {t.tagline && <p className="mt-1 text-xs text-ink-500">{t.tagline}</p>}

            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-ink-900">{t.price}</span>
              {t.cadence && <span className="text-sm text-ink-500">{t.cadence}</span>}
            </div>

            <ul className="mt-5 flex-1 space-y-2.5 border-t border-ink-300/15 pt-5 text-sm">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="mt-1 shrink-0 text-brand-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-ink-700">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={t.ctaHref}
              className={cn(
                'mt-6 inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold transition',
                t.highlight
                  ? 'bg-brand-600 text-white shadow-cta hover:bg-brand-700'
                  : 'border border-ink-300 text-ink-800 hover:border-brand-600 hover:text-brand-600',
              )}
            >
              {t.ctaLabel}
            </Link>
          </article>
        ))}
      </div>
    </Section>
  )
}
