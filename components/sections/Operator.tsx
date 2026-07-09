import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { business } from '@/lib/business'

/**
 * Home § 5.5 — Operator.
 *
 * Service businesses are bought on the operator. This section names the
 * person doing the work. Single paragraph, three credentials, one quote
 * from the founder, no founder-as-mascot stock photo.
 *
 * Sits between Evidence (which proved the outcome) and Signals (which asks
 * the reader to self-diagnose) — so the reader knows *who* will diagnose
 * them.
 */

// Attested rows only. "Years operating 14" traces to the approved founder bio
// (lib/business.ts); "Verticals shipped 7" is claims row F-01
// (docs/strategy/sales/_claims-library.md, founder-attested 2026-07-09, list
// itemized there). A live "engagements active" count was declined by the
// founder (goes stale); a third row is pending his pick — add nothing here
// without a claims row.
const CREDENTIALS = [
  { label: 'Years operating', value: '14', unit: 'yrs' },
  { label: 'Verticals shipped', value: '7', unit: '' },
]

export function Operator() {
  return (
    <SectionRail tone="dark">
      <div className="grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            Who&rsquo;s doing the work
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            One operator. No agency layer.
          </h2>

          <div className="mt-8 max-w-xl space-y-5 text-ink-300">
            <p>
              I&rsquo;m {business.founder.name} &mdash; the person who builds
              the systems and tells you which constraint to fix first. Fourteen
              years running growth across industrial distribution, home services,
              and dental: catalog rewrites for distributors, an AI receptionist
              for the contractor stuck on a roof, recovered revenue for the
              practice missing calls at chair time.
            </p>
            <p>
              Sale Solution is small on purpose. No account managers, no
              decks from a junior analyst, no &ldquo;we&rsquo;ll get back
              to you next quarter.&rdquo; You work with the person whose
              name is on the proposal.
            </p>
          </div>

          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
              How we work
            </p>
            <ul className="mt-4 grid gap-2.5 text-sm text-ink-200 sm:grid-cols-2">
              <li className="flex items-baseline gap-2">
                <span aria-hidden className="shrink-0 text-accent-500">·</span>
                <span><span className="font-medium text-white">No markup</span> on your ad spend.</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span aria-hidden className="shrink-0 text-accent-500">·</span>
                <span><span className="font-medium text-white">You own</span> your code, data, and customer list.</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span aria-hidden className="shrink-0 text-accent-500">·</span>
                <span><span className="font-medium text-white">No annual lock-in.</span> Leave after the minimum, keep everything.</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span aria-hidden className="shrink-0 text-accent-500">·</span>
                <span><span className="font-medium text-white">Published pricing model.</span> You see it before we talk.</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={business.founder.profiles.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-white/30 underline-offset-[6px] transition-colors duration-200 hover:text-accent-500 hover:decoration-accent-500"
            >
              LinkedIn &mdash; {business.founder.name}
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/about/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink-300 transition-colors duration-200 hover:text-white"
            >
              Background &amp; track record
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        {/* Credentials column */}
        <div className="md:col-span-5">
          <div className="border border-white/10 bg-black/30 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
              <span>{business.founder.name}</span>
              <span className="text-ink-400">{business.founder.role}</span>
            </div>

            <dl className="divide-y divide-white/10">
              {CREDENTIALS.map((c) => (
                <div
                  key={c.label}
                  className="flex items-baseline justify-between px-5 py-4"
                >
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-300">
                    {c.label}
                  </dt>
                  <dd className="font-display text-3xl font-semibold tabular-nums leading-none text-white">
                    {c.value}
                    {c.unit && (
                      <span className="ml-1 text-base font-normal text-ink-400">
                        {c.unit}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="border-t border-white/10 px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
                Operator stance
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-200">
                &ldquo;Build the engine, run the engine, prove it pays.
                A 9-field schema for a fitting or a 24/7 receptionist for a
                roofer &mdash; the operator stance doesn&rsquo;t change.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionRail>
  )
}
