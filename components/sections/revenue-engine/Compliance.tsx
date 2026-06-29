import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Dental / medical vertical § HIPAA & compliance — the reassurance section that
 * proves we know the trade.
 *
 * Spec §6.3 — BAAs on call tracking, SMS, CRM; recording disclosures; plain
 * language, no legal-advice phrasing. Describes how the stack operates; the
 * practice's own compliance officer signs off.
 *
 * Prop-driven so each vertical can pass its own reassurance copy. The defaults
 * are the original dental/medical content, so callers that pass no props (the
 * medical page) render unchanged. A measure can be a plain string or a
 * `{ title, copy }` pair when the brief wants a headed bullet.
 */

type Measure = string | { title: string; copy: string }

const DEFAULT_MEASURES: Measure[] = [
  'Signed BAAs on every tool that touches patient data — call tracking, SMS, and the CRM.',
  'Call-recording disclosures built into the greeting, per state two-party rules.',
  'Access controls and audit logs on the systems that hold patient information.',
  'Patient data stays in your systems; I operate the engine on top, not a copy of your database.',
]

export function Compliance({
  id,
  eyebrow = 'HIPAA & compliance',
  title = 'Built to handle',
  titleAccent = 'patient data correctly.',
  intro = 'Automation in a practice only works if it is compliant by default. Here is how the stack is set up before a single call is answered.',
  measures = DEFAULT_MEASURES,
  footnote = 'This is how I operate, not legal advice — your compliance officer reviews and signs off on the stack during onboarding.',
}: {
  id?: string
  eyebrow?: string
  title?: React.ReactNode
  titleAccent?: React.ReactNode
  intro?: React.ReactNode
  measures?: Measure[]
  footnote?: React.ReactNode
}) {
  return (
    // `paper` (vs the plan's `surface` above it) gives a subtle tonal break so the
    // two adjacent light sections don't read flat.
    <SectionRail tone="paper" id={id}>
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            {eyebrow}
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            {title} {titleAccent}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">{intro}</p>
        </div>

        <div className="md:col-span-7">
          <ul className="rounded-[4px] border border-rule-strong bg-paper">
            {measures.map((m, i) => {
              const headed = typeof m !== 'string'
              return (
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
                  {headed ? (
                    <span>
                      <span className="block font-display font-semibold text-ink-900">{m.title}</span>
                      <span className="mt-1 block text-ink-700">{m.copy}</span>
                    </span>
                  ) : (
                    <span className="text-ink-700">{m}</span>
                  )}
                </li>
              )
            })}
          </ul>
          <p className="mt-4 text-sm text-ink-500">{footnote}</p>
        </div>
      </div>
    </SectionRail>
  )
}
