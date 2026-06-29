import { RevenueLeakAuditForm } from '@/components/forms/RevenueLeakAuditForm'
import { SectionRail } from '@/components/layout/SectionRail'
import { business } from '@/lib/business'

/**
 * Revenue Engine § close — the Revenue Leak Audit, with the form embedded.
 *
 * Primary conversion action for the local-service funnel (spec §1.7). Every
 * "Book a Revenue Leak Audit" CTA across the pillar + verticals scrolls to
 * this band (#audit), so the form lives here: one scroll, no extra click, and
 * the local-service funnel never bleeds into the industrial /book-growth-call/
 * path. The form posts to /api/revenue-leak-audit → /revenue-engine/audit-booked/.
 */

export function AuditCTA({ id, vertical = 'home-services' }: { id?: string; vertical?: 'home-services' | 'dental' }) {
  const followUp =
    vertical === 'dental'
      ? 'the follow-up gap on your treatment plans and recall'
      : 'the follow-up gap on your quotes'
  return (
    <SectionRail tone="dark" id={id} size="lg">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-14">
        <div className="lg:col-span-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            The audit
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            Book a free Revenue Leak Audit.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-200">
            In about 20 minutes I&rsquo;ll show you your own numbers &mdash; how
            many calls you&rsquo;re missing, your real response time, how your
            Google profile is doing, and {followUp}. Yours to keep whether we
            work together or not. No pitch, no obligation.
          </p>

          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink-300">
            <li className="flex items-center gap-2"><Dot /> No contract to start</li>
            <li className="flex items-center gap-2"><Dot /> Keep your ads guy</li>
            <li className="flex items-center gap-2"><Dot /> Your numbers, yours to keep</li>
          </ul>

          <p className="mt-6 text-sm text-ink-300">
            Prefer to talk?{' '}
            <a
              href={`tel:${business.phone}`}
              data-cta="revenue_leak_audit__call"
              data-cta-location="final_rail"
              className="font-semibold text-white underline decoration-white/30 underline-offset-4 transition-colors duration-200 hover:decoration-white"
            >
              Call or text {business.phoneDisplay}
            </a>
          </p>
        </div>

        <div className="lg:col-span-6">
          <RevenueLeakAuditForm vertical={vertical} />
        </div>
      </div>
    </SectionRail>
  )
}

function Dot() {
  return <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-500" />
}
