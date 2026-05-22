import Link from 'next/link'

/**
 * Hero used by services detail pages (and the /services/ hub).
 *
 * Same shape across all services routes: two-tone H1, lede, two CTAs,
 * optional jump-link strip. Each page passes its own copy so the
 * component stays a layout primitive, not a content lockup.
 */

type CTA = { label: string; href: string }
type Anchor = { label: string; href: string }

export function ServicesHero({
  eyebrow = 'Services',
  title,
  titleAccent,
  lede,
  primaryCta = { label: 'Book a strategy call', href: '/book-growth-call/' },
  secondaryCta,
  anchors,
}: {
  eyebrow?: string
  title: React.ReactNode
  titleAccent: React.ReactNode
  lede: React.ReactNode
  primaryCta?: CTA
  secondaryCta?: CTA
  anchors?: Anchor[]
}) {
  return (
    <section data-section-tone="light" className="relative bg-paper">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 md:pb-16 md:pt-24 lg:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {eyebrow}
        </p>

        <h1 className="mt-4 font-display text-5xl font-semibold leading-[1] tracking-[-0.03em] text-ink-900 sm:text-6xl md:text-[6rem]">
          <span className="block">{title}</span>
          <span className="block text-ink-500">{titleAccent}</span>
        </h1>

        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-700 md:text-xl">
          {lede}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href={primaryCta.href}
            className="inline-flex items-center justify-center rounded-[4px] bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
          >
            {primaryCta.label}
          </Link>
          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center gap-1.5 py-3 text-base font-semibold text-ink-800 underline decoration-rule-strong underline-offset-[6px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
            >
              {secondaryCta.label}
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>

        {anchors && anchors.length > 0 && (
          <nav
            aria-label="Page sections"
            className="mt-14 border-t border-rule pt-5 md:mt-20"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              On this page
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {anchors.map((a, i) => (
                <li key={a.href} className="flex items-baseline gap-3">
                  {i > 0 && <span aria-hidden className="text-ink-300">/</span>}
                  <a
                    href={a.href}
                    className="font-display text-sm font-semibold text-ink-700 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
                  >
                    {a.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </section>
  )
}
