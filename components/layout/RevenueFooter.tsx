import Link from 'next/link'

import { Logo } from '@/components/layout/Logo'
import { business } from '@/lib/business'
import { legalLinks } from '@/lib/navigation'

/**
 * Slim footer for the Revenue Engine cluster (/revenue-engine/*).
 *
 * The sitewide Footer ("Engineered to be cited." + the industrial / hydraulics
 * brand statement) is off-message under a local-service page, so FooterSwitch
 * swaps in this one on RE routes: NAP for local trust, one audit link, legal.
 * No mega-menu, no industrial coda.
 */
export function RevenueFooter() {
  return (
    <footer data-section-tone="light" className="border-t border-rule bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-14 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-600">
              The Revenue Engine &mdash; a done-for-you system that answers every call, books
              the job, and chases the work that goes cold. Built and run by one operator.
            </p>
            <address className="mt-5 space-y-1 not-italic text-sm text-ink-700">
              <p>{business.address.street}</p>
              <p>
                {business.address.city}, {business.address.region} {business.address.postalCode}
              </p>
              <p className="pt-1">
                <a
                  href={`tel:${business.phone}`}
                  className="font-medium text-ink-900 transition-colors duration-200 hover:text-brand-600"
                >
                  {business.phoneDisplay}
                </a>
                <span className="px-2 text-ink-300">&middot;</span>
                <a
                  href={`mailto:${business.emails.leads}`}
                  className="font-medium text-ink-900 transition-colors duration-200 hover:text-brand-600"
                >
                  {business.emails.leads}
                </a>
              </p>
            </address>
          </div>

          <div className="shrink-0">
            <Link
              href="/revenue-engine/#audit"
              data-cta="revenue_leak_audit__footer"
              data-cta-location="footer"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 transition-colors duration-200 hover:text-brand-600"
            >
              Book a Revenue Leak Audit
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-rule pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
            &copy; {new Date().getFullYear()} {business.legalName}
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors duration-200 hover:text-ink-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
