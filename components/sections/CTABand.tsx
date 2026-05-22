import Link from 'next/link'

import { Section } from '@/components/layout/Section'
import { cn } from '@/lib/cn'

type Variant = 'blue' | 'green' | 'purple'

const variantBg: Record<Variant, string> = {
  blue:   'bg-brand-600 hover:bg-brand-700',
  green:  'bg-[#09bc8a] hover:bg-[#07a37a]',
  purple: 'bg-[#9826ef] hover:bg-[#8419d6]',
}

/**
 * Mid-page CTA band. Mid-section reset that gives the eye a place to land
 * before continuing. Variant maps to D2: blue=audit funnel, green=strategy
 * call, purple=packages.
 */
export function CTABand({
  headline,
  sub,
  ctaLabel,
  ctaHref,
  variant = 'blue',
  tone = 'tint-blue',
}: {
  headline: string
  sub?: string
  ctaLabel: string
  ctaHref: string
  variant?: Variant
  tone?: 'tint-blue' | 'dark' | 'default'
}) {
  return (
    <Section tone={tone} size="sm">
      <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:gap-10 md:text-left">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold">{headline}</h2>
          {sub && <p className="mt-3 text-ink-500">{sub}</p>}
        </div>
        <Link
          href={ctaHref}
          className={cn(
            'mt-6 inline-flex shrink-0 items-center justify-center rounded-md px-6 py-3 text-sm font-semibold text-white shadow-cta transition md:mt-0',
            variantBg[variant],
          )}
        >
          {ctaLabel}
        </Link>
      </div>
    </Section>
  )
}
