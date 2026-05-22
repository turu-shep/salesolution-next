import { LeadMagnetForm } from '@/components/forms/LeadMagnetForm'
import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /future-proof-your-seo/ § 05 — Email capture.
 *
 * The form does the work. We add framing (eyebrow + headline + a small
 * "what happens next" rail) on the left, drop the working LeadMagnetForm
 * on the right. The form's submission logic is preserved — we don't touch
 * it, we just frame it.
 */
export function EmailCaptureSection() {
  return (
    <SectionRail tone="paper" id="get-the-checklist">
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Get the checklist
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            Five questions.{' '}
            <span className="text-ink-500">A personalised score.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            We tune the 60-point checklist to your traffic mix and timeline
            &mdash; so the points you read first are the ones you can act on
            this week.
          </p>

          <ul className="mt-10 space-y-5">
            {[
              {
                k: '01',
                h: 'Checklist arrives instantly',
                b: 'PDF + spreadsheet to your inbox, no waiting list, no sales call required.',
              },
              {
                k: '02',
                h: 'Risk score in the email',
                b: 'Based on your inputs, where you sit on the AI-exposure curve and which checkpoints to start with.',
              },
              {
                k: '03',
                h: 'Weekly Turbulence Brief',
                b: 'Mondays only. Algorithm + AI-engine changes that landed last week. Unsubscribe any time.',
              },
            ].map((step) => (
              <li
                key={step.k}
                className="flex items-baseline gap-4 border-t border-rule pt-5"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-ink-400">
                  {step.k}
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-ink-900">
                    {step.h}
                  </h3>
                  <p className="mt-1.5 text-sm text-ink-700">{step.b}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-7">
          <LeadMagnetForm thankYouHref="/unlock-growth-audit/thank-you/" />
        </div>
      </div>
    </SectionRail>
  )
}
