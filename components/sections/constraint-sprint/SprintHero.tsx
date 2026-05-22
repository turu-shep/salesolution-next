import Link from 'next/link'

/**
 * /constraint-sprint/ hero.
 *
 * Productised, fixed-price engagement. The buyer needs the price + duration
 * within the first viewport — both sit in the meta-rail under the headline
 * so they read like spec sheet entries, not pricing-page chrome.
 *
 * Two-tone H1: the lead promises a noun ("Find the constraint"), the muted
 * second line is the conclusion ("walk away with the fix").
 */
export function SprintHero() {
  return (
    <section data-section-tone="light" className="relative bg-paper">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 md:pb-20 md:pt-24 lg:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Productised offer &middot; Constraint Sprint
        </p>

        <h1 className="mt-4 font-display text-5xl font-semibold leading-[1] tracking-[-0.03em] text-ink-900 sm:text-6xl md:text-[5.5rem]">
          <span className="block">Find the constraint.</span>
          <span className="block text-ink-500">Install the fix.</span>
        </h1>

        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-ink-700 md:text-xl">
          A 4-week diagnostic + execution sprint for industrial e&#8209;commerce
          brands doing $2M&ndash;$20M. One blocker identified, one fix shipped,
          a 90&#8209;day roadmap to compound the result.
        </p>

        {/* Spec rail — duration · price · output · guarantee. Reads as a
            tech-spec block, not a pricing card. Sits where buyers expect
            the deal terms in the first scroll. */}
        <dl className="mt-12 grid grid-cols-2 gap-y-6 border-y border-rule py-7 sm:grid-cols-4">
          <SpecCell label="Duration" value="4 weeks" />
          <SpecCell label="Price" value="$12–24k" accent />
          <SpecCell label="Output" value="4 artifacts" />
          <SpecCell label="Guarantee" value="Week-1 refund" />
        </dl>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="#apply"
            className="inline-flex items-center justify-center rounded-[4px] bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
          >
            Apply for a sprint
          </Link>
          <Link
            href="#timeline"
            className="inline-flex items-center gap-1.5 py-3 text-base font-semibold text-ink-800 underline decoration-rule-strong underline-offset-[6px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
          >
            See the 4-week timeline
            <span aria-hidden>→</span>
          </Link>
        </div>

        <nav
          aria-label="Page sections"
          className="mt-14 border-t border-rule pt-5 md:mt-20"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            On this page
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {[
              { label: 'What is it', href: '#what-is-it' },
              { label: 'Timeline', href: '#timeline' },
              { label: 'Deliverables', href: '#deliverables' },
              { label: 'Who it fits', href: '#fit' },
              { label: 'Apply', href: '#apply' },
              { label: 'FAQ', href: '#faq' },
            ].map((a, i) => (
              <li key={a.href} className="flex items-baseline gap-3">
                {i > 0 && <span aria-hidden className="text-ink-300">/</span>}
                <a
                  href={a.href}
                  className="font-display text-sm font-semibold text-ink-700 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
                >
                  {a.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
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
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
        {label}
      </dt>
      <dd
        className={
          accent
            ? 'mt-2 font-display text-2xl font-semibold tabular-nums leading-none text-accent-500 sm:text-3xl'
            : 'mt-2 font-display text-2xl font-semibold tabular-nums leading-none text-ink-900 sm:text-3xl'
        }
      >
        {value}
      </dd>
    </div>
  )
}
