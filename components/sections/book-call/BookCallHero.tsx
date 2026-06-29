import { LeadForm } from '@/components/forms/LeadForm'
import { CalendlyEmbed } from '@/components/integrations/CalendlyEmbed'

/**
 * /book-growth-call/ hero.
 *
 * Mirrors the ServicesHero typography (eyebrow, two-tone H1, lede) but adds
 * a right-rail booking widget so the page IS the booking — no scroll required.
 *
 * Booking widget — two modes:
 *   1. If NEXT_PUBLIC_CALENDLY_URL is set, embed the Calendly inline widget
 *      (matches live site behavior).
 *   2. Otherwise, fall back to the LeadForm so the page is still functional
 *      (form submits to /api/lead and redirects to the thank-you page).
 */
export function BookCallHero() {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL
  return (
    <section data-section-tone="light" className="relative bg-paper">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 md:pb-24 md:pt-24 lg:px-8">
        <div className="grid gap-12 md:grid-cols-12 md:gap-12 lg:gap-16">
          {/* Left column — editorial */}
          <div className="md:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              Strategy call · 15 minutes
            </p>

            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1] tracking-[-0.03em] text-ink-900 sm:text-6xl md:text-[5.5rem]">
              <span className="block">Book the call.</span>
              <span className="block">No deck. No pitch.</span>
            </h1>

            <p className="mt-10 max-w-xl text-lg leading-relaxed text-ink-700 md:text-xl">
              Fifteen minutes with a senior operator &mdash; not a sales rep.
              You paste 3&ndash;5 high-revenue category URLs. We walk through
              them live: schema, AIO-readiness, citation gaps. You leave with
              the single highest-payback change.
            </p>

            <ul className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {[
                'No slide deck',
                'No SDR follow-up loops',
                'Written diagnostic within 24h',
                '90-day exit, no obligation',
              ].map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 text-sm text-ink-700"
                >
                  <svg
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="mt-12 border-t border-rule pt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                Who picks up
              </p>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-700">
                Artur Shepel &mdash; founder, the operator who runs your
                engagement if we work together. Not a closer. Not a junior
                strategist. The same person on the call as on the proposal.
              </p>
            </div>
          </div>

          {/* Right column — booking widget */}
          <div className="md:col-span-5">
            <div className="md:sticky md:top-24">
              <div className="rounded-2xl border border-rule bg-surface p-1 shadow-[0_30px_80px_-30px_rgba(15,20,30,0.18)]">
                {calendlyUrl ? (
                  <CalendlyEmbed
                    url={calendlyUrl}
                    className="overflow-hidden rounded-[14px]"
                  />
                ) : (
                  <LeadForm
                    formId="strategy_call_form"
                    formName="Book call lead form"
                    leadType="strategy_call"
                    submitLabel="Book my call"
                    thankYouHref="/unlock-growth-audit/thank-you/"
                    className="rounded-[14px] border-0 bg-surface p-6 shadow-none ring-0 sm:p-7"
                  />
                )}
              </div>
              <p className="mt-5 text-xs leading-relaxed text-ink-500">
                Prefer email? Write to{' '}
                <a
                  href="mailto:leads@salesolution.net"
                  className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
                >
                  leads@salesolution.net
                </a>{' '}
                with your store URL &mdash; we reply within 24h.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
