import Image from 'next/image'
import Link from 'next/link'

/**
 * Revenue Engine hero — the story's Hook (SB7 Character + PAS problem).
 *
 * Opens in the owner's own words so he thinks "this is me", promises the
 * outcome, offers one direct CTA (the audit) and a thin self-qualifier
 * ("I'm a contractor / I run a dental practice") that demotes the old
 * VerticalFork into the hero. A reserved video slot (the transitional CTA,
 * SB7) renders only once `videoUrl` is supplied — text-first until then.
 */

type CTA = { label: string; href: string }
type SelfQualifier = { label: string; href: string }
type Anchor = { label: string; href: string }
type Founder = {
  name: string
  src: string
  caption: string
  specs: { label: string; value: string }[]
}

export function RevenueHero({
  eyebrow = 'Revenue Engine',
  title,
  titleAccent,
  lede,
  primaryCta,
  founder,
  selfQualifiers,
  videoUrl,
  anchors,
}: {
  eyebrow?: string
  title: React.ReactNode
  titleAccent?: React.ReactNode
  lede: React.ReactNode
  primaryCta: CTA
  founder?: Founder
  selfQualifiers?: SelfQualifier[]
  videoUrl?: string
  anchors?: Anchor[]
}) {
  return (
    <section data-section-tone="light" className="relative bg-paper">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 md:pb-24 md:pt-24 lg:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          {eyebrow}
        </p>

        <h1 className="mt-4 font-display text-balance text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.03em] text-ink-900 sm:text-5xl md:text-[3.5rem]">
          <span className="block">{title}</span>
          {titleAccent && <span className="block text-ink-500">{titleAccent}</span>}
        </h1>

        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-700 md:text-xl">
          {lede}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href={primaryCta.href}
            data-cta="revenue_leak_audit__hero"
            data-cta-location="hero"
            className="inline-flex items-center justify-center rounded-[4px] bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
          >
            {primaryCta.label}
          </Link>

          {/* Reserved VSL slot (SB7 transitional CTA). Renders only once a
              recorded video exists — text-first until then. */}
          {videoUrl && (
            <Link
              href={videoUrl}
              data-cta="revenue_vsl__hero"
              data-cta-location="hero"
              className="group inline-flex items-center gap-2.5 py-3 text-base font-semibold text-ink-800 transition-colors duration-200 hover:text-brand-600"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-rule-strong transition-colors duration-200 group-hover:border-brand-600">
                <span aria-hidden className="ml-0.5 border-y-[6px] border-l-[9px] border-y-transparent border-l-current" />
              </span>
              Watch the 90-second version
            </Link>
          )}
        </div>

        {/* Founder spec-card — a named face + named terms is the calm-operator
            trust signal, shown not asserted. Wired off an optional prop so the
            vertical heroes stay text-only unless they opt in. */}
        {founder && (
          <figure className="mt-10 max-w-md overflow-hidden rounded-[4px] border border-rule-strong bg-surface shadow-[0_22px_48px_-26px_rgba(15,23,42,0.4)]">
            <div className="h-1.5 w-full bg-brand-600" aria-hidden />
            <div className="flex items-stretch gap-4 p-4 sm:gap-5 sm:p-5">
              <div className="relative h-[100px] w-[78px] shrink-0 overflow-hidden rounded-[3px] ring-1 ring-rule sm:h-[116px] sm:w-[90px]">
                <Image
                  src={founder.src}
                  alt={founder.name}
                  fill
                  sizes="90px"
                  className="object-cover object-top"
                />
              </div>
              <figcaption className="flex min-w-0 flex-col justify-center">
                <p className="font-display text-lg font-semibold tracking-[-0.01em] text-ink-900">
                  {founder.name}
                </p>
                <p className="mt-1 text-sm leading-snug text-ink-700">{founder.caption}</p>
                <dl className="mt-3.5 space-y-1.5 border-t border-rule pt-3 font-mono text-[10px] uppercase tracking-[0.12em]">
                  {founder.specs.map((s) => (
                    <div key={s.label} className="flex items-baseline gap-3">
                      <dt className="w-[4.5rem] shrink-0 text-ink-400">{s.label}</dt>
                      <dd className="font-semibold text-ink-800">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </figcaption>
            </div>
          </figure>
        )}

        {selfQualifiers && selfQualifiers.length > 0 && (
          <p className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-ink-500">
            <span>Or jump straight to your trade:</span>
            {selfQualifiers.map((s, i) => (
              <span key={s.href} className="flex items-baseline gap-3">
                {i > 0 && <span aria-hidden className="text-ink-300">·</span>}
                <Link
                  href={s.href}
                  className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[4px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
                >
                  {s.label}
                </Link>
              </span>
            ))}
          </p>
        )}

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
