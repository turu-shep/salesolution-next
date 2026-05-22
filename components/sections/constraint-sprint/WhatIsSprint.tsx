import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /constraint-sprint/ § 2 — Definition.
 *
 * Dark band. Names what a "constraint sprint" actually is, the mental model
 * behind it (Theory of Constraints applied to e-commerce growth), and why
 * it's the right entry point for a buyer not ready to commit to a retainer.
 *
 * Three principles, each one a sentence — frames the engagement as
 * disciplined, not generic.
 */

const PRINCIPLES = [
  {
    title: 'One constraint, not a list',
    body: 'A 200-item audit isn\'t a strategy. Every growth engine is bottlenecked by exactly one thing at a time. We find that one — and ignore the rest until it moves.',
  },
  {
    title: 'Shipped, not slidewared',
    body: 'By Week 3 there is a live, in-store asset producing measurable lift. No PDF deck. No "phase 2 recommendations." The work lands inside your stack.',
  },
  {
    title: 'Fixed scope, fixed price',
    body: 'Four weeks. $12–24k depending on stack complexity. Refund if we can\'t isolate the constraint in Week 1. The terms don\'t move.',
  },
]

export function WhatIsSprint() {
  return (
    <SectionRail tone="dark" id="what-is-it">
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            What is a Constraint Sprint
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            One blocker.{' '}
            <span className="text-ink-400">Surfaced, then shipped.</span>
          </h2>

          <div className="mt-8 space-y-5 text-ink-300">
            <p>
              Borrowed from Goldratt&rsquo;s Theory of Constraints and adapted
              to a B2B e&#8209;commerce stack. Every growth engine has a
              single dominant bottleneck. Pour effort into anything else and
              the bottleneck still caps the output.
            </p>
            <p>
              The sprint is built for operators who don&rsquo;t want a
              retainer yet. Four weeks. Fixed scope. You see the work before
              you commit to more.
            </p>
          </div>
        </div>

        <ul className="md:col-span-7">
          {PRINCIPLES.map((p, i) => (
            <li
              key={p.title}
              className="border-t border-white/10 py-7 first:border-t-0 first:pt-0 last:pb-0"
            >
              <div className="flex items-baseline gap-5">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] tabular-nums text-accent-500">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold text-white">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-ink-300">{p.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </SectionRail>
  )
}
