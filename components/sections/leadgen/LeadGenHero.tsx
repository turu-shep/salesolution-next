import Link from 'next/link'

import { Eyebrow } from '@/components/sections/Eyebrow'

/**
 * Lead-gen hero. Two-column on desktop: copy left, form (or CTA card) right.
 * Children render in the right column so each funnel composes its own form.
 */
export function LeadGenHero({
  eyebrow,
  headline,
  sub,
  primaryCta,
  secondaryCta,
  tone = 'default',
  children,
}: {
  eyebrow: string
  headline: React.ReactNode
  sub: React.ReactNode
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  tone?: 'default' | 'dark' | 'tint-blue'
  children?: React.ReactNode
}) {
  const toneClass =
    tone === 'dark' ? 'bg-surface-dark text-ink-inverse' :
    tone === 'tint-blue' ? 'bg-surface-tint-blue' :
    'bg-surface'
  const subClass = tone === 'dark' ? 'text-ink-300' : 'text-ink-500'

  return (
    <section className={`${toneClass} border-b border-ink-300/15`}>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-12 md:py-20 sm:px-6 lg:px-8">
        <div className="md:col-span-7">
          <Eyebrow className={tone === 'dark' ? 'text-brand-300' : undefined}>
            {eyebrow}
          </Eyebrow>
          <h1
            className={`mt-4 max-w-2xl font-display text-balance ${
              tone === 'dark' ? 'text-white' : ''
            }`}
          >
            {headline}
          </h1>
          <p className={`mt-6 max-w-xl text-lg ${subClass}`}>{sub}</p>

          {(primaryCta || secondaryCta) && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {primaryCta && (
                <Link
                  href={primaryCta.href}
                  className="inline-flex items-center justify-center rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-cta transition hover:bg-brand-700"
                >
                  {primaryCta.label}
                </Link>
              )}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className={`inline-flex items-center justify-center rounded-md border px-5 py-3 text-sm font-semibold transition ${
                    tone === 'dark'
                      ? 'border-white/30 text-white hover:border-white hover:bg-white/5'
                      : 'border-ink-300 text-ink-800 hover:border-brand-600 hover:text-brand-600'
                  }`}
                >
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </div>

        {children && <div className="md:col-span-5">{children}</div>}
      </div>
    </section>
  )
}
