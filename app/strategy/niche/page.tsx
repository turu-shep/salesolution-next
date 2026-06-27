import Link from 'next/link'

import { NICHE_BRIEFS, briefsByLandingPage } from '@/lib/strategy/niches/data'
import { LANDING_PAGES } from '@/lib/strategy/niches/types'

export const metadata = { title: 'Niche briefs' }

export default function NicheIndexPage() {
  const empty = NICHE_BRIEFS.length === 0

  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/strategy" className="text-ink-400 hover:text-ink-700">
          Strategy
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">Niche briefs</span>
      </div>

      <h1 className="text-xl font-semibold text-ink-900">Niche copy-angle briefs</h1>
      <p className="mt-1 text-sm text-ink-500">
        Per-industry research for what to highlight on each landing page — heading, the leak, the
        plan, the difference, the reassurance section, and the FAQ, in the buyer&rsquo;s own language.
        Grouped by the live page each maps to.
      </p>

      {empty ? (
        <p className="mt-8 rounded-lg border border-rule bg-surface p-4 text-sm text-ink-500">
          Briefs are being generated. Check back once the research run completes.
        </p>
      ) : (
        <div className="mt-8 space-y-8">
          {LANDING_PAGES.map((lp) => {
            const briefs = briefsByLandingPage(lp.key)
            if (!briefs.length) return null
            return (
              <section key={lp.key}>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-ink-400">
                  {lp.label} ·{' '}
                  <Link href={lp.href} className="text-ink-500 hover:text-brand-600">
                    live page
                  </Link>
                </p>
                <ul className="space-y-3">
                  {briefs.map((b) => (
                    <li key={b.slug}>
                      <Link
                        href={`/strategy/niche/${b.slug}`}
                        className="block rounded-lg border border-rule bg-surface p-4 transition-colors hover:border-rule-strong"
                      >
                        <span className="font-medium text-ink-800">{b.industry}</span>
                        <p className="mt-1 text-sm text-ink-500">{b.oneLine}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
