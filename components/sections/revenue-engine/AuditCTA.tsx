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
          I look at your missed calls, response time, Google Business Profile,
          and the estimate or treatment-plan follow-up gap, then show you
          where the revenue is leaking. No pitch, no obligation.
        </p>

        {/* TODO Phase 2 (RE-203): replace this button with the GHL audit
            form + calendar embed ({{GHL_AUDIT_EMBED}}); thank-you page at
            /revenue-engine/audit-booked/ (noindex). */}
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/book-growth-call/"
            data-cta="revenue_leak_audit__pillar_close"
            data-cta-location="final_rail"
            className="inline-flex items-center justify-center rounded-[4px] bg-white px-6 py-3 text-sm font-semibold text-ink-900 transition-colors duration-200 hover:bg-paper"
          >
            Book a Revenue Leak Audit
          </Link>
          <Link
            href="/revenue-engine/home-services/"
            data-cta="revenue_engine_vertical__pillar_close"
            data-cta-location="final_rail"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/85 underline decoration-white/20 underline-offset-[6px] transition-colors duration-200 hover:text-white hover:decoration-white"
          >
            Or see it for your trade
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </SectionRail>
  )
}
