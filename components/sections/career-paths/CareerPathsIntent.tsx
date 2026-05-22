import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /career-paths/ § 2 — "What this is, what it isn't."
 *
 * Sits in dark tone between the hero (light) and the card grid (light)
 * to enforce the L-D-L-D rhythm. Functionally: defines the editorial
 * posture so a casual visitor knows what kind of reading they're
 * signing up for before they click into a card.
 *
 * Two columns:
 *  - Left: prose framing — "by working operators, not influencers".
 *  - Right: a small "shape" card with format primitives — length,
 *    cadence, structure — in mono / tabular form.
 */

const SHAPE = [
  { label: 'Format', value: 'Reading-first, ungated' },
  { label: 'Length', value: '8–15 hours per path' },
  { label: 'Cadence', value: 'Self-paced, no deadline' },
  { label: 'Cost', value: 'Free — no signup' },
]

const POSTURE = [
  {
    label: 'By',
    body: 'Working operators currently shipping in industrial e-commerce — not platform influencers selling cohort courses.',
  },
  {
    label: 'Not',
    body: 'A bootcamp. No live calls, no Discord, no recruiter pipeline. We don’t hire from these paths.',
  },
  {
    label: 'For',
    body: 'Practitioners who learned SEO five years ago and want to know what changed when AI Overviews arrived.',
  },
]

export function CareerPathsIntent({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            What these are
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            Reading lists, not courses.{' '}
            <span className="text-ink-400">Written by the operator.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
            Each path is a structured walk through one role inside the new
            search stack &mdash; SEO, content strategy, citation
            engineering &mdash; written by the same person who runs paid
            client work. Same vocabulary, same trade-offs, no marketing
            gloss.
          </p>

          <dl className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {POSTURE.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[5rem_1fr] items-baseline gap-6 py-4 sm:grid-cols-[7rem_1fr]"
              >
                <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
                  {row.label}.
                </dt>
                <dd className="text-ink-200">{row.body}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="md:col-span-5">
          <div className="border border-white/10 bg-black/30 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
              <span>Path shape</span>
              <span className="text-ink-400">v1.0</span>
            </div>
            <dl className="divide-y divide-white/10">
              {SHAPE.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between px-5 py-4"
                >
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-300">
                    {row.label}
                  </dt>
                  <dd className="text-right font-display text-base font-semibold text-white">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-white/10 px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
                Note
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-200">
                Every chapter ends with a &ldquo;test it on your own
                site&rdquo; prompt. The point is the work, not the
                certificate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionRail>
  )
}
