import { LeadForm } from '@/components/forms/LeadForm'
import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /constraint-sprint/ § 6 — Apply.
 *
 * Dark band. The conversion moment. Left column: spec sheet that mirrors
 * the hero spec rail (price · duration · output · guarantee) plus the
 * "what happens after you apply" expectations. Right column: the form.
 *
 * Reuses the shared <LeadForm> — submission logic, validation, captcha,
 * thank-you redirect are untouched.
 */

const NEXT_STEPS = [
  { t: 'Within 24h', body: 'A real human reply from Artur. No SDR loop.' },
  { t: '15-min discovery call', body: 'Live walkthrough of 3–5 of your highest-revenue category URLs.' },
  { t: 'Written SOW within 48h', body: 'Fixed scope, fixed start date, fixed price. You decide.' },
]

export function SprintApply() {
  return (
    <SectionRail tone="dark" id="apply">
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            Apply for a sprint
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            Two minutes.{' '}
            <span className="text-ink-400">No discovery loop.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-300">
            The form below gives us enough to know whether the sprint
            shape fits your stage. If it does, you hear back within 24
            hours. If it doesn&rsquo;t, we&rsquo;ll tell you that too
            &mdash; with a pointer to a better next step.
          </p>

          {/* Spec rail — mirrors the hero so the buyer sees the terms one
              last time before clicking submit. */}
          <dl className="mt-10 grid grid-cols-2 gap-y-6 border-y border-white/10 py-6">
            <SpecCell label="Duration" value="4 weeks" />
            <SpecCell label="Price" value="$12–24k" accent />
            <SpecCell label="Output" value="4 artifacts" />
            <SpecCell label="Guarantee" value="Week-1 refund" />
          </dl>

          <ol className="mt-10 space-y-5">
            {NEXT_STEPS.map((s, i) => (
              <li key={s.t} className="flex items-baseline gap-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] tabular-nums text-accent-500">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <div>
                  <p className="font-display text-base font-semibold text-white">
                    {s.t}
                  </p>
                  <p className="mt-1 text-sm text-ink-300">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="md:col-span-7">
          <LeadForm
            formId="sprint_lead_form"
            formName="Constraint Sprint application"
            leadType="sprint"
            submitLabel="Apply for a sprint"
            thankYouHref="/constraint-sprint/thank-you/"
          />
        </div>
      </div>
    </SectionRail>
  )
}

function SpecCell({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
        {label}
      </dt>
      <dd
        className={
          accent
            ? 'mt-2 font-display text-2xl font-semibold tabular-nums leading-none text-accent-500 sm:text-3xl'
            : 'mt-2 font-display text-2xl font-semibold tabular-nums leading-none text-white sm:text-3xl'
        }
      >
        {value}
      </dd>
    </div>
  )
}
