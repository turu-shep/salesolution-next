import { LeadForm } from '@/components/forms/LeadForm'
import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /unlock-growth-audit/ § 6 — full-width form on dark.
 *
 * Second occurrence of the form for users who scrolled past the hero.
 * The form card sits on the dark band so it reads as the primary
 * commitment moment — bright surface against deep navy, accent eyebrow,
 * reassurance copy on the left.
 */
export function AuditFormSection({ id }: { id?: string }) {
  const reassurances = [
    {
      title: 'No sales pitch',
      body: 'We reply personally with the report. No SDR loop. No discovery-call gauntlet.',
    },
    {
      title: 'No credit card',
      body: 'Free is free. We don’t run a “free-for-an-hour-then-$99” trick.',
    },
    {
      title: 'Yours to keep',
      body: 'Every finding, scorecard, and checklist is yours — even if we never speak again.',
    },
    {
      title: '24-hour promise',
      body: 'If we can’t meet that, we email you within 12 hours with the reason.',
    },
  ]

  return (
    <SectionRail tone="dark" id={id} size="lg">
      <div className="grid gap-14 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            Book the audit
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl md:text-6xl">
            Eight minutes. <span className="text-ink-400">Your audit lands tomorrow.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
            Fill the form. We&rsquo;ll review your store against the
            60-point technical checklist, the CRO framework, and the AI-search
            scorecard &mdash; and email you the diagnosis within 24 hours.
          </p>

          <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
            {reassurances.map((r) => (
              <li key={r.title} className="border-t border-white/15 pt-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
                  {r.title}
                </p>
                <p className="mt-2 text-sm text-ink-300">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-6">
          <div className="rounded-[6px] border border-white/20 bg-paper p-1 shadow-cta">
            <div className="rounded-[5px] bg-surface px-5 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-700">
                Start your Growth Audit
              </p>
              <p className="mt-1 font-display text-2xl font-semibold leading-snug text-ink-900">
                Two steps. About eight minutes.
              </p>
              <p className="mt-2 text-sm text-ink-500">
                We reply within 24 hours with the written report.
              </p>
            </div>
            <LeadForm
              formId="audit_lead_form"
              formName="Audit page lead form"
              leadType="audit"
              submitLabel="Book my free audit"
              thankYouHref="/unlock-growth-audit/thank-you/"
              className="rounded-t-none border-t border-rule shadow-none ring-0"
            />
          </div>
        </div>
      </div>
    </SectionRail>
  )
}
