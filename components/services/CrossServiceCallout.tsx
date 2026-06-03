import Link from 'next/link'

import { ServiceColorDot } from './ServiceColorDot'
import { SERVICES, type ServiceKey } from './service-colors'

/**
 * Cross-service callout block. Rendered inside service pages to point the
 * reader at related services with a colored dot for visual threading.
 *
 * Per shared system §2.2 — the dot uses the destination service's color so
 * the reader can scan and recognize where the link goes before clicking.
 */

type LinkItem = {
  /** Service key — composite for FGO, otherwise one of the five services. */
  service: ServiceKey
  /** Override the canonical name (rare). */
  label?: string
  /** Override the canonical href (rare). */
  href?: string
  /** Short reason this link is here. */
  note: React.ReactNode
}

type Props = {
  /** Eyebrow above the callout. Defaults to "Related services". */
  eyebrow?: string
  /** Optional 1-paragraph framing above the link list. */
  intro?: React.ReactNode
  links: LinkItem[]
  className?: string
}

export function CrossServiceCallout({
  eyebrow = 'Related services',
  intro,
  links,
  className,
}: Props) {
  return (
    <aside
      className={`border border-rule bg-paper p-6 md:p-8 ${className ?? ''}`}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
        {eyebrow}
      </p>
      {intro && (
        <p className="mt-3 max-w-2xl text-ink-700">{intro}</p>
      )}

      <ul className="mt-5 space-y-3 border-t border-rule pt-4">
        {links.map((link, i) => {
          const meta =
            link.service === 'composite'
              ? {
                  name: link.label ?? 'Full Growth Ownership',
                  href: link.href ?? '/services/full-growth-ownership/',
                }
              : {
                  name: link.label ?? SERVICES[link.service].name,
                  href: link.href ?? SERVICES[link.service].href,
                }
          return (
            <li key={i} className="flex items-start gap-3 text-sm text-ink-700">
              <ServiceColorDot
                service={link.service}
                className="mt-2 shrink-0"
              />
              <div>
                <Link
                  href={meta.href}
                  className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
                >
                  {meta.name}
                  <span aria-hidden> →</span>
                </Link>{' '}
                <span className="text-ink-700">— {link.note}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
