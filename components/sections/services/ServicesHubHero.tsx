import Link from 'next/link'

/**
 * /services/ hub hero — compact on purpose.
 *
 * The shared ServicesHero runs at md:text-[6rem], which is right for a 2-3 word
 * cylinder-page title but turns the hub's longer line into a full-screen wall
 * that buries the actual value. This hero keeps the value visible fast: a short
 * decommoditise hook, the recognizable disciplines as scannable tags (the "what
 * we do" up front, concrete), then a one-line frame that hands off to the engine
 * section directly below.
 */

const DISCIPLINES = [
  'AI Search & GEO',
  'Local SEO',
  'Content',
  'Catalog',
  'Website Dev',
  'Paid Ads',
  'Outbound',
  'Reviews',
]

const ANCHORS = [
  { label: 'The engine', href: '#engine' },
  { label: 'The parts', href: '#cylinders' },
  { label: 'How they combine', href: '#combinations' },
  { label: 'Pricing', href: '#engagement' },
  { label: 'FAQ', href: '#faq' },
]

export function ServicesHubHero() {
  return (
    <section data-section-tone="light" className="relative bg-paper">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 md:pb-14 md:pt-20 lg:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-600">
          What we do
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink-900 sm:text-5xl md:text-[3.5rem]">
          One system, not six vendors.
        </h1>

        {/* The disciplines, concrete and scannable — the "what we do" up front. */}
        <ul className="mt-7 flex flex-wrap gap-2">
          {DISCIPLINES.map((d) => (
            <li
              key={d}
              className="rounded-[4px] border border-rule bg-surface px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.1em] text-ink-700"
            >
              {d}
            </li>
          ))}
        </ul>

        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-700">
          The work most owners split across a stack of separate vendors, run as
          one machine where the parts actually hand off. We install the engine,
          then add the parts that pay back.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/book-growth-call/"
            data-cta="book_call__service_hero"
            data-cta-location="hero"
            className="inline-flex items-center justify-center rounded-[4px] bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
          >
            Book a Growth Call
          </Link>
          <Link
            href="#engine"
            data-cta-location="hero"
            className="inline-flex items-center gap-1.5 py-3 text-base font-semibold text-ink-800 underline decoration-rule-strong underline-offset-[6px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
          >
            See how it works
            <span aria-hidden>→</span>
          </Link>
        </div>

        <nav aria-label="Page sections" className="mt-12 border-t border-rule pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            On this page
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {ANCHORS.map((a, i) => (
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
      </div>
    </section>
  )
}
