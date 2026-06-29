import Link from 'next/link'

import { business } from '@/lib/business'
import { footerColumns, legalLinks } from '@/lib/navigation'

import { Logo } from './Logo'

const socialIcons = {
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden width="18" height="18">
      <path d="M22 12a10 10 0 1 0-11.55 9.88V14.9H7.9V12h2.55V9.8c0-2.52 1.5-3.91 3.79-3.91 1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.25 0-1.64.78-1.64 1.58V12h2.79l-.45 2.9h-2.34v6.98A10 10 0 0 0 22 12z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden width="16" height="16">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden width="18" height="18">
      <path d="M20.45 20.45h-3.55v-5.56c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.65H9.36V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54c0 .96.79 1.73 1.77 1.73h20.45c.99 0 1.78-.77 1.78-1.73V1.73C24 .77 23.21 0 22.22 0z" />
    </svg>
  ),
}

export function Footer() {
  return (
    <footer
      data-section-tone="dark"
      className="relative overflow-hidden bg-surface-dark text-ink-300"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 1200px 600px at 30% 0%, rgba(38, 82, 239, 0.12), transparent 60%)',
      }}
    >
      {/* Top coda — oversized brand statement. No CTA here on purpose: the
          page's last interactive moment is § 07 right above; the footer
          stays a brand statement, not another conversion attempt. */}
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-16 sm:px-6 md:pb-20 md:pt-24 lg:px-8">
        <p className="font-display text-5xl font-semibold leading-[1] tracking-[-0.03em] text-white sm:text-6xl md:text-[5.5rem]">
          Engineered<br />
          to be cited.
        </p>
      </div>

      {/* Divider line */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-white/10" />
      </div>

      {/* Link grid */}
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand block */}
          <div className="md:col-span-4">
            <Logo tone="dark" className="text-2xl" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              AI search engineered for industrial e&#8209;commerce.
              Hydraulics, MRO, technical distribution.
            </p>
            <ul className="mt-7 flex items-center gap-2">
              {(
                [
                  { key: 'linkedin', href: business.social.linkedin, label: 'LinkedIn' },
                  { key: 'twitter', href: business.social.twitter, label: 'X / Twitter' },
                  { key: 'facebook', href: business.social.facebook, label: 'Facebook' },
                ] as const
              ).map((s) => (
                <li key={s.key}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full ring-1 ring-white/15 text-ink-300 transition-colors duration-200 hover:bg-white hover:text-ink-900 hover:ring-white"
                  >
                    {socialIcons[s.key]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Two link columns */}
          {footerColumns.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-400">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-white/85 transition-colors duration-200 hover:text-accent-500"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Office block */}
          <div className="md:col-span-4">
            <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-400">
              Office
            </h3>
            <address className="mt-4 not-italic text-sm">
              <p className="text-white/85">{business.address.street}</p>
              <p className="text-white/85">
                {business.address.city}, {business.address.region} {business.address.postalCode}
              </p>
            </address>
            <div className="mt-4 space-y-1.5 text-sm">
              <a
                href={`tel:${business.phone}`}
                className="block text-white/85 transition-colors duration-200 hover:text-accent-500"
              >
                {business.phoneDisplay}
              </a>
              <a
                href={`mailto:${business.emails.leads}`}
                className="block text-white/85 transition-colors duration-200 hover:text-accent-500"
              >
                {business.emails.leads}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom: legal sweep */}
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
            &copy; {new Date().getFullYear()} {business.legalName}
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors duration-200 hover:text-white"
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
