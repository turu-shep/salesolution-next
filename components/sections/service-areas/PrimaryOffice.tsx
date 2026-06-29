import { SectionRail } from '@/components/layout/SectionRail'
import { business } from '@/lib/business'

/**
 * /service-areas/ § 2 — Primary office.
 *
 * Dark section anchored on the single physical address. Accent orange
 * highlights the headquarters as the gravitational center of an
 * otherwise distributed team. Mono labels for NAP fields per the
 * design system; address is the canonical NAP from `lib/business.ts`.
 */
export function PrimaryOffice({ id }: { id?: string }) {
  const { address, phone, phoneDisplay, emails } = business

  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
          Headquarters &middot; FL
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          One physical office. The rest of the team is distributed.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          Mail, in-person meetings, and the operator&rsquo;s home base
          live in North Miami Beach. Everything else &mdash; delivery,
          standups, reporting &mdash; runs remote on Eastern Time.
        </p>
      </div>

      <div className="mt-14 grid gap-px overflow-hidden bg-white/10 ring-1 ring-white/10 md:grid-cols-3">
        {/* Address — accent orange highlight */}
        <div className="relative bg-surface-dark p-8 md:col-span-1">
          <span
            aria-hidden
            className="absolute left-0 top-0 h-full w-[3px] bg-accent-500"
          />
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
            Address &middot; NAP
          </p>
          <address className="mt-4 font-display text-xl font-semibold not-italic leading-snug text-white">
            {address.street}
            <br />
            {address.city}, {address.region} {address.postalCode}
            <br />
            <span className="text-ink-300">{address.country}</span>
          </address>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${address.street}, ${address.city}, ${address.region} ${address.postalCode}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white underline decoration-white/30 underline-offset-[6px] transition-colors duration-200 hover:text-accent-500 hover:decoration-accent-500"
          >
            View on map
            <span aria-hidden>→</span>
          </a>
        </div>

        {/* Hours / time zone */}
        <div className="bg-surface-dark p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            Hours &middot; UTC&minus;5 / &minus;4
          </p>
          <p className="mt-4 font-display text-xl font-semibold leading-snug text-white">
            Mon&ndash;Fri
            <br />
            9am&ndash;6pm ET
          </p>
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-400">
            Same-day reply on weekdays. Async on evenings &amp; weekends.
          </p>
        </div>

        {/* Channels */}
        <div className="bg-surface-dark p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            Direct lines
          </p>
          <ul className="mt-4 space-y-3">
            <li>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                Phone
              </p>
              <a
                href={`tel:${phone}`}
                className="mt-1 inline-block font-display text-lg font-semibold text-white underline decoration-white/20 underline-offset-[5px] transition-colors duration-200 hover:text-accent-500 hover:decoration-accent-500"
              >
                {phoneDisplay}
              </a>
            </li>
            <li>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                Email
              </p>
              <a
                href={`mailto:${emails.general}`}
                className="mt-1 inline-block font-mono text-sm text-white underline decoration-white/20 underline-offset-[5px] transition-colors duration-200 hover:text-accent-500 hover:decoration-accent-500"
              >
                {emails.general}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </SectionRail>
  )
}
