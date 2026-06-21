import Link from 'next/link'

import { Logo } from '@/components/layout/Logo'
import { business } from '@/lib/business'

/**
 * Layout for paid campaign landing pages (/lp/*).
 *
 * Deliberately NOT the site shell: no main nav, no footer mega-menu. Paid LPs
 * strip exits so the one CTA wins (see docs/strategy/ads/landing-pages/README.md
 * §4). The root app/layout.tsx still provides fonts, analytics, consent, and the
 * data-cta click tracker — this just swaps Header/Footer for a minimal bar.
 *
 * Click-to-call in the top bar is a conversion aid for local-service traffic.
 */
export default function CampaignLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-rule bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo />
          <a
            href={`tel:${business.phone}`}
            data-cta="campaign-call"
            data-cta-location="campaign-header"
            className="font-mono text-[13px] font-medium text-ink-700 transition-colors hover:text-accent-600"
          >
            {business.phoneDisplay}
          </a>
        </div>
      </header>

      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>

      <footer className="border-t border-rule bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-ink-400 sm:flex-row sm:px-6 lg:px-8">
          <span>© {business.name}</span>
          <span className="flex gap-4">
            <Link href="/privacy-policy/" className="hover:text-ink-700">Privacy</Link>
            <Link href="/terms-of-service/" className="hover:text-ink-700">Terms</Link>
          </span>
        </div>
      </footer>
    </>
  )
}
