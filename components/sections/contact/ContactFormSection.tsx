import { LeadForm } from '@/components/forms/LeadForm'
import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Form section — light tone to keep the L-D rhythm (paper → surface →
 * dark → paper). The form itself is unchanged; the left rail tells the
 * reader exactly what happens after they hit submit so the form feels
 * like a real conversation, not a lead-capture funnel.
 */

const EXPECTATIONS = [
  {
    label: 'Step 01',
    title: 'Two-minute form',
    body: 'Contact details, then four questions on your business so we can prep before the call.',
  },
  {
    label: 'Step 02',
    title: 'Personal reply',
    body: 'Within one business day. From Artur, not a sequencer. Calendar link or written diagnosis, depending on what you sent.',
  },
  {
    label: 'Step 03',
    title: '30 minutes, no deck',
    body: 'A real conversation on a real screen share. You leave with the single highest-payback change either way.',
  },
]

export function ContactFormSection() {
  return (
    <SectionRail tone="paper" id="form">
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Send the details
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            The form, if that&rsquo;s easier.
          </h2>
          <p className="mt-6 text-ink-700">
            Two short steps. Nothing here is gating &mdash; you can call or
            email instead. The form just lets us prep so the first call
            isn&rsquo;t a discovery survey.
          </p>

          <ol className="mt-10 border-t border-rule">
            {EXPECTATIONS.map((e) => (
              <li key={e.label} className="border-b border-rule py-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  {e.label}
                </p>
                <p className="mt-2 font-display text-lg font-semibold text-ink-900">
                  {e.title}
                </p>
                <p className="mt-1 text-sm text-ink-700">{e.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="md:col-span-7">
          <LeadForm
            formId="contact_lead_form"
            formName="Contact page lead form"
            leadType="contact"
            submitLabel="Send my details"
            thankYouHref="/unlock-growth-audit/thank-you/"
          />
        </div>
      </div>
    </SectionRail>
  )
}
