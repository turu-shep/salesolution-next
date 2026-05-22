import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /book-growth-call/ § 4 — What happens after the call.
 *
 * Dark band paired with `OnTheCall` to bookend the page in matching depth
 * (the L-D-L-D-L-D rhythm of the site). Three "step" cards on a thin glass
 * surface so the dark background still reads as canvas, then a two-up
 * footnote covering the "fit" / "not yet" branches honestly.
 *
 * Different layout shape from /services/ ProcessTimeline so the pages
 * don't feel like a duplicate even though both close the buying decision.
 */

type Outcome = {
  when: string
  title: string
  body: string
}

const OUTCOMES: Outcome[] = [
  {
    when: 'Same day',
    title: 'A 1-page recap',
    body: 'Emailed within 4 hours of the call: the constraint you named, the change we recommended, and one link to relevant work.',
  },
  {
    when: 'Within 24h',
    title: 'Written diagnostic (if fit)',
    body: 'If we both think it\'s a fit, you get a one-page written diagnostic — what we\'d ship in the first 30 days, with revenue assumptions.',
  },
  {
    when: 'Within 48h',
    title: 'SOW with a fixed start date',
    body: 'If you want to move forward: scope, deliverables, pricing, start date. No "discovery phases." No proposal-to-statement-of-work round-trip.',
  },
]

export function AfterCall() {
  return (
    <SectionRail tone="dark">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          After the call
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          What lands in your inbox. <span className="text-ink-400">In hours, not weeks.</span>
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          The buying experience IS the proof. We respond on the timeline
          we&rsquo;d expect to ship on. No three-week proposal cycles, no
          re-introductions from a senior partner you haven&rsquo;t met.
        </p>
      </div>

      <ol className="mt-14 grid gap-6 md:grid-cols-3">
        {OUTCOMES.map((o, i) => (
          <li
            key={o.when}
            className="relative flex flex-col border border-white/10 bg-white/[0.03] p-6 transition-colors duration-200 hover:border-white/25 md:p-7"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-ink-400">
              Step {(i + 1).toString().padStart(2, '0')}
            </p>
            <p
              className={
                'mt-2 font-display text-2xl font-semibold tabular-nums leading-none tracking-[-0.01em] ' +
                (i === 0 ? 'text-accent-500' : 'text-white')
              }
            >
              {o.when}
            </p>
            <h3 className="mt-5 font-display text-lg font-semibold text-white">
              {o.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-300">
              {o.body}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-16 grid gap-10 border-t border-white/10 pt-10 md:grid-cols-2 md:gap-16">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-500">
            If we&rsquo;re not a fit
          </p>
          <h3 className="mt-3 font-display text-xl font-semibold text-white">
            We say so on the call.
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-300">
            Below $200k/month, no PMF, or wrong vertical &mdash; we name it
            in real time and usually point you at someone better suited.
            You still keep the one highest-payback change from the call.
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
            If you want to think about it
          </p>
          <h3 className="mt-3 font-display text-xl font-semibold text-white">
            You won&rsquo;t hear from us.
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-300">
            No nurture sequences, no SDR follow-ups, no &ldquo;just
            checking in&rdquo; emails in week three. Reach back out when
            the timing fits. We&rsquo;ll pick up where we left off.
          </p>
        </div>
      </div>
    </SectionRail>
  )
}
