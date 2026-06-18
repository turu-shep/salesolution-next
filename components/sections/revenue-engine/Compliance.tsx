import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Dental vertical § HIPAA & compliance.
 *
 * Spec §6.3 — BAAs on call tracking, SMS, CRM; recording disclosures;
 * plain language, no legal-advice phrasing. Describes how the stack
 * operates; the practice's own compliance officer signs off.
 */

const MEASURES = [
  'Signed BAAs on every tool that touches patient data — call tracking, SMS, and the CRM.',
  'Call-recording disclosures built into the greeting, per state two-party rules.',
  'Access controls and audit logs on the systems that hold patient information.',
  'Patient data stays in your systems; I operate the engine on top, not a copy of your database.',
]

export function Compliance({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            HIPAA &amp; compliance
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            Built to handle{' '}
            <span className="text-ink-500">patient data correctly.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            Automation in a practice only works if it is compliant by
            default. Here is how the stack is set up before a single call is
            answered.
          </p>
        </div>

        <div className="md:col-span-7">
          <ul className="rounded-[4px] border border-rule-strong bg-paper">
            {MEASURES.map((m, i) => (
              <li
                key={i}
                className="flex items-start gap-3 border-b border-rule px-6 py-5 last:border-b-0"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-ink-700">{m}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-500">
            This is how I operate, not legal advice — your compliance officer
            reviews and signs off on the stack during onboarding.
          </p>
        </div>
      </div>
    </SectionRail>
  )
}
