import { LeadMagnetForm } from '@/components/forms/LeadMagnetForm'
import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /future-proof-your-seo/ § 05 — Email capture.
 *
 * The form does the work. We add framing (eyebrow + headline + a small
 * "what happens next" rail) on the left, drop the LeadMagnetForm on the
 * right. Every promise in the rail has to match what /api/lead-magnet
 * actually sends — that mismatch was F-02.
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
            Four questions.{' '}
            Then the checklist.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            The answers tell us who&rsquo;s auditing and how exposed you already
            are. The checklist is the same for everyone &mdash; all sixty
            points, nothing held back.
          </p>

          <ul className="mt-10 space-y-5">
            {[
              {
                k: '01',
                h: 'Checklist arrives instantly',
                b: 'A link in your inbox about a minute after you submit. No waiting list, no sales call required.',
              },
              {
                k: '02',
                h: 'Sixty checks, four sections',
                b: 'Schema, content structuring, citation engineering, authority and monitoring — with the scoring sheet at the end. Print it or work through it on screen.',
              },
              {
                k: '03',
                h: 'The occasional note after that',
                b: 'Only when something in AI search changes what you should actually do. One click to unsubscribe.',
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
          <LeadMagnetForm />
        </div>
      </div>
    </SectionRail>
  )
}
