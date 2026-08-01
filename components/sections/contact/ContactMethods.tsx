import { Eyebrow } from '@/components/sections/Eyebrow'
import { business } from '@/lib/business'

/**
 * Three-card grid of contact channels: phone, email, office. Driven entirely
 * from lib/business.ts so the canonical address (D5) shows up here
 * automatically.
 */
export function ContactMethods() {
  return (
    <div>
      <Eyebrow>How to reach us</Eyebrow>
      <h2 className="mt-3 text-balance text-3xl font-semibold">Direct lines, no gatekeeping</h2>
      <p className="mt-4 text-ink-500">
        Three ways to start the conversation. Whatever&rsquo;s easiest.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        <li className="rounded-lg bg-surface p-5 ring-1 ring-ink-300/15">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-100 text-brand-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Phone</p>
          <a
            href={`tel:${business.phone}`}
            className="mt-1 block font-display text-lg font-semibold text-ink-900 transition hover:text-brand-600"
          >
            {business.phoneDisplay}
          </a>
          <p className="mt-1 text-xs text-ink-500">Mon–Fri · 9am–6pm ET</p>
        </li>

        <li className="rounded-lg bg-surface p-5 ring-1 ring-ink-300/15">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-100 text-brand-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Email</p>
          <a
            href={`mailto:${business.emails.general}`}
            className="mt-1 block break-all font-display text-base font-semibold text-ink-900 transition hover:text-brand-600"
          >
            {business.emails.general}
          </a>
          <p className="mt-1 text-xs text-ink-500">Replies within 24 hours</p>
        </li>

        <li className="rounded-lg bg-surface p-5 ring-1 ring-ink-300/15">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-100 text-brand-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Office</p>
          <address className="mt-1 not-italic font-display text-sm font-semibold text-ink-900">
            {business.address.street}<br />
            {business.address.city}, {business.address.region} {business.address.postalCode}
          </address>
          <p className="mt-1 text-xs text-ink-500">By appointment</p>
        </li>
      </ul>
    </div>
  )
}
