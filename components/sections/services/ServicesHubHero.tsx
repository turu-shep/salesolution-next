import Link from 'next/link'

import { LeakFinder } from './LeakFinder'

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

// Each discipline links straight to its cylinder page (/services/{slug}/).
const DISCIPLINES: { label: string; slug: string }[] = [
  { label: 'AI Search & GEO', slug: 'ai-seo' },
  { label: 'Local SEO', slug: 'local-seo-maps' },
  { label: 'Content', slug: 'editorial-authority' },
  { label: 'Catalog', slug: 'catalog-ai' },
  { label: 'Website Dev', slug: 'website-development-design-services' },
  { label: 'Paid Ads', slug: 'paid-acquisition' },
  { label: 'Outbound', slug: 'outbound-email-marketing-services' },
  { label: 'Reviews', slug: 'reviews-reputation' },
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
          Services
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink-900 sm:text-5xl md:text-[3.5rem]">
          Most owners buy the parts. We build the machine.
        </h1>

        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-700">
          Your SEO vendor doesn&rsquo;t know what your content team is doing.
          Your ads account doesn&rsquo;t talk to your landing pages. Most of the
          revenue that slips doesn&rsquo;t disappear inside a single tactic
          &mdash; it leaks at the handoffs between them. We run the whole
          machine, so those handoffs are ours to own.
        </p>

        {/* The disciplines — what's inside the machine. Each is a door into its cylinder page. */}
        <ul className="mt-7 flex flex-wrap gap-2">
          {DISCIPLINES.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/services/${d.slug}/`}
                data-cta-location="hero-disciplines"
                className="inline-flex rounded-[4px] border border-rule bg-surface px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.1em] text-ink-700 transition-colors duration-200 hover:border-ink-700 hover:bg-paper hover:text-ink-900"
              >
                {d.label}
              </Link>
            </li>
          ))}
        </ul>

        <LeakFinder />

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
