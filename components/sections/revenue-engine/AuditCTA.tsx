import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine pillar § 10 — closing CTA, the Revenue Leak Audit.
 *
 * Primary conversion action across both verticals (spec §1.7). The booking
 * runs through a GHL form + calendar embed in Phase 2 (token
 * {{GHL_AUDIT_EMBED}}); until that asset lands, the button points at the
 * existing call-booking funnel as an interim destination.
 */

export function AuditCTA({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id} size="lg">
      <div className="max-w-3xl">
        <h2 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl md:text-6xl">
          Book a free Revenue Leak Audit.
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-200">
          In about 20 minutes I&rsquo;ll show you your own numbers &mdash; how
          many calls you&rsquo;re missing, your real response time, how your
          Google profile is doing, and the follow-up gap on your quotes. Yours
          to keep whether we work together or not. No pitch, no obligation.
        </p>

        {/* TODO Phase 2 (RE-203): replace this button with the GHL audit
            form + calendar embed ({{GHL_AUDIT_EMBED}}); thank-you page at
            /revenue-engine/audit-booked/ (noindex). */}
        <div className="mt-10">
          <Link
            href="/book-growth-call/"
            data-cta="revenue_leak_audit__pillar_close"
            data-cta-location="final_rail"
            className="inline-flex items-center justify-center rounded-[4px] bg-white px-6 py-3 text-sm font-semibold text-ink-900 transition-colors duration-200 hover:bg-paper"
          >
            Book a Revenue Leak Audit
          </Link>
        </div>
      </div>
    </SectionRail>
  )
}
