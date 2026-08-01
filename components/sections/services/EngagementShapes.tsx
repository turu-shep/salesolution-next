import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { CompositeBar } from '@/components/services/CompositeBar'

/**
 * Pricing for the Services hub — priced the way the page is framed: the engine
 * is the base you install once, the cylinders are the parts you add on top.
 *
 * Two moves: a one-time install that puts the Revenue Engine in (~90 days,
 * 3-month engagement), then the cylinders you choose, billed monthly — or one
 * operator owning the whole thing (Full Growth Ownership).
 *
 * 2026-07-27 (FD2): the $30K install floor is the only figure published here.
 * Cylinder and FGO fees are scoped in the SOW, and the standalone-sprint
 * footnote is gone with the rest of the sprint machinery.
 */
export function EngagementShapes({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          How it&rsquo;s priced
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Install the base. Then add the parts.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          One system, billed in two moves: a one-time install that puts the
          engine in, then the cylinders you choose, monthly. Or hand the whole
          thing to one operator.
        </p>
      </div>

      {/* The base — the foundation you install once. */}
      <div className="mt-12 rounded-[8px] border border-rule border-t-2 border-t-brand-600 bg-surface p-7 shadow-[0_24px_56px_-32px_rgba(15,20,30,0.28)] sm:p-9">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-600">
            The base &middot; installed once
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
            ~90 days &middot; 3-month engagement
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <h3 className="font-display text-2xl font-semibold tracking-[-0.015em] text-ink-900">
            The Revenue Engine
          </h3>
          <p className="font-display text-3xl font-semibold tabular-nums leading-none text-ink-900">
            From $30K{' '}
            <span className="text-lg font-medium text-ink-500">one-time</span>
          </p>
        </div>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-700">
          Answer the call, book the job, recover what went cold, prove the
          revenue. The foundation every cylinder bolts onto.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-600">
          Scaled to the value at stake, never to a menu. Your exact number
          comes in a written SOW within 48 hours &mdash; date-stamped, yours to
          keep either way.
        </p>
      </div>

      {/* connector — the parts bolt onto the base */}
      <div className="flex flex-col items-center">
        <span aria-hidden className="h-7 w-px bg-rule-strong" />
        <span className="my-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
          then bolt on the parts
        </span>
        <span aria-hidden className="h-7 w-px bg-rule-strong" />
      </div>

      <ul className="grid gap-6 md:grid-cols-2">
        {/* Add cylinders — where most start. */}
        <li className="relative flex flex-col border border-ink-900 bg-surface shadow-[0_30px_80px_-30px_rgba(15,20,30,0.25)]">
          <span className="absolute -top-3 left-6 inline-flex items-center rounded-[3px] bg-ink-900 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
            Where most start
          </span>
          <div className="border-b border-rule px-6 py-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              Per part &middot; monthly
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
              Add cylinders
            </h3>
            <p className="mt-3 text-base leading-relaxed text-ink-700">
              Added one at a time, each scoped in writing before it starts.
            </p>
          </div>
          <div className="flex-1 px-6 py-6">
            <p className="text-sm italic text-ink-500">
              &ldquo;Pick the parts that move our number.&rdquo;
            </p>
            <p className="mt-4 text-sm text-ink-700">
              AI search, content, local SEO, paid, outbound, reviews &mdash;
              added on top of the base, run and re-aimed each cycle. Start with
              one, add more as they pay back.
            </p>
          </div>
          <div className="border-t border-rule px-6 py-4">
            <Link
              href="/book-growth-call/"
              data-cta="book_call__engagement_cylinders"
              data-cta-location="mid_body"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600"
            >
              Book a Growth Call
              <span aria-hidden>&rarr;</span>
            </Link>
          </div>
        </li>

        {/* Own the whole engine — Full Growth Ownership. */}
        <li className="relative flex flex-col overflow-hidden border border-rule bg-surface transition-shadow duration-200 hover:border-ink-700">
          <CompositeBar weight="card" />
          <div className="border-b border-rule px-6 py-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              Whole engine &middot; one operator
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
              Full Growth Ownership
            </h3>
            <p className="mt-3 text-base leading-relaxed text-ink-700">
              One number, quoted after the qualifier.
            </p>
          </div>
          <div className="flex-1 px-6 py-6">
            <p className="text-sm italic text-ink-500">
              &ldquo;Run our entire growth function.&rdquo;
            </p>
            <p className="mt-4 text-sm text-ink-700">
              One operator owns the base and every cylinder, reads both revenue
              lines, and re-aims the weakest part each cycle. 3&ndash;6 month
              minimum.
            </p>
          </div>
          <div className="border-t border-rule px-6 py-4">
            <Link
              href="/services/full-growth-ownership/"
              data-cta="full_growth_ownership__engagement_card"
              data-cta-location="mid_body"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] border border-ink-300 bg-surface px-5 py-2.5 text-sm font-semibold text-ink-900 transition-colors duration-200 hover:border-ink-900"
            >
              Get a quote
              <span aria-hidden>&rarr;</span>
            </Link>
          </div>
        </li>
      </ul>

      {/* The reframe: read the numbers above against what staying put costs. */}
      <div className="mt-10 border-l-2 border-brand-600 pl-5 sm:pl-6">
        <p className="font-display text-lg font-semibold tracking-[-0.01em] text-ink-900">
          The fee isn&rsquo;t the expensive part.
        </p>
        <p className="mt-2 max-w-2xl leading-relaxed text-ink-700">
          You already spend $15&ndash;40K a month on agencies, and get less for
          it. Five vendors, no one accountable, and you still can&rsquo;t say
          which lever moved revenue. The costly line item is another year
          exactly where you are, demand leaking the whole time.
        </p>
      </div>
    </SectionRail>
  )
}
