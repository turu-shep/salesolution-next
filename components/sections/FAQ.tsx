import { SectionRail } from '@/components/layout/SectionRail'

/**
 * FAQ section — reusable across home, services, and any page that needs
 * founder/CMO-level objections answered.
 *
 * Default items are the homepage set. Pass `items` to override per page;
 * pass `eyebrow` / `headline` / `kicker` to customize the heading slab.
 */

export type QA = { q: string; a: React.ReactNode }

export const HOMEPAGE_FAQ_ITEMS: QA[] = [
  {
    q: 'Won’t AI search just stabilize and we’ll be fine?',
    a: (
      <>
        <p>
          The structural change is one-way. AI Overviews aren&rsquo;t a
          search feature on top of links &mdash; they&rsquo;re a new
          retrieval layer that re-ranks what gets cited. Google has invested
          too much in Gemini-powered surfaces to retreat.
        </p>
        <p className="mt-3">
          What changes month-to-month is <em className="text-ink-900 not-italic font-semibold">which queries trigger AIO</em> (the
          coverage rate). What doesn&rsquo;t change is <em className="text-ink-900 not-italic font-semibold">which sites get
          cited when they do</em>. The latter is the work.
        </p>
      </>
    ),
  },
  {
    q: 'Why not just hire an in-house SEO?',
    a: (
      <>
        <p>
          In-house wins when you&rsquo;re north of $50M ARR and have enough
          velocity to keep someone with senior GEO chops fully utilized.
          Below that, you end up with a generalist learning on your time.
        </p>
        <p className="mt-3">
          The fractional model exists because schema engineering, citation
          tracking, and AIO-aware PPC don&rsquo;t need a 40-hour week from
          one person &mdash; they need 5–15 hours from the right one.
        </p>
      </>
    ),
  },
  {
    q: 'How do I know it’s working in 90 days?',
    a: (
      <>
        <p>
          Three leading indicators land in the first 60 days, before the
          revenue numbers move:
        </p>
        <ul className="mt-3 space-y-1.5 pl-5 [list-style-type:square]">
          <li>AIO citation coverage on your top 50 commercial queries</li>
          <li>Schema completeness rate across the product catalog</li>
          <li>Inbound query mix (informational vs commercial split)</li>
        </ul>
        <p className="mt-3">
          You see them in the monthly outcome review. Qualified-lead lift
          shows up months 4–6, depending on how broken the foundation was
          when we started.
        </p>
      </>
    ),
  },
  {
    q: 'What if we’re not in hydraulics or MRO?',
    a: (
      <>
        <p>
          The playbook works for any technical-distribution or
          specification-heavy e-commerce: electronics, contract
          manufacturing, lab supply, industrial automation, fluid power,
          fasteners, abrasives. If buyers read a spec sheet before they
          purchase, the same mechanics apply.
        </p>
        <p className="mt-3">
          If you sell something that doesn&rsquo;t require specification
          comparison (commodity SKUs, generic consumer), we&rsquo;ll tell
          you on the first call. Not every vertical needs us.
        </p>
      </>
    ),
  },
  {
    q: 'What actually happens on the first call?',
    a: (
      <>
        <p>
          15 minutes, no deck. You paste 3–5 of your highest-revenue category
          URLs. We walk through them live: schema completeness, AIO-readiness
          score, the queries you&rsquo;re cited for vs the queries your
          competitors are.
        </p>
        <p className="mt-3">
          You leave with either: (a) the single change with the highest
          payback, or (b) confirmation that your foundation is solid and you
          don&rsquo;t need us yet.
        </p>
      </>
    ),
  },
]

export function FAQ({
  items = HOMEPAGE_FAQ_ITEMS,
  eyebrow = 'Before you book',
  headline,
  kicker = 'Pulled from real strategy calls. No marketing softening.',
  id,
}: {
  items?: QA[]
  eyebrow?: string
  headline?: React.ReactNode
  kicker?: React.ReactNode
  id?: string
}) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            {eyebrow}
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            {headline ?? (
              <>
                Questions founders <span className="text-ink-500">ask first.</span>
              </>
            )}
          </h2>
          <p className="mt-6 text-ink-700">{kicker}</p>
        </div>

        <ul className="md:col-span-8">
          {items.map((item, i) => (
            <li key={i} className="border-t border-rule last:border-b">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 transition-colors duration-200 hover:text-ink-900">
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-ink-400">
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="font-display text-lg font-semibold text-ink-900">
                      {item.q}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rule-strong text-ink-500 transition-all duration-200 group-hover:border-ink-900 group-hover:text-ink-900 group-open:rotate-45 group-open:border-accent-500 group-open:bg-accent-500 group-open:text-white"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3 w-3">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </summary>
                <div className="pb-6 pl-10 pr-12 text-ink-700">
                  {item.a}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </SectionRail>
  )
}
