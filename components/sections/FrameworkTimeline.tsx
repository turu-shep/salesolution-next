import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Home § 03 — Framework.
 *
 * The track is the centerpiece visual: three phase stations connected by
 * a dashed rail, each with a window label, an outcome line, and a vertical
 * drop-line into the items column below. Reads as an engineering process
 * diagram, not a slide-deck triptych.
 *
 * "What good looks like" is deliberately number-free: the old +12% / +43% /
 * 2.5× illustrative targets were de-numbered per the homepage alignment
 * sign-off (founder, 2026-07-08, G1 Option A) — unattested numbers don't
 * ship, and 2.5× collided with the locked lib/stats.ts label. Real numbers
 * live in the monthly report.
 */

type Item = { title: string; body: string }
type Phase = {
  number: string
  name: string
  window: string
  /** "What good looks like" — the outcome in owner words, no numbers. */
  outcome: string
  title: string
  description: string
  items: Item[]
}

const PHASES: Phase[] = [
  {
    number: '01',
    name: 'Bring',
    window: 'Get found',
    outcome: 'The AI answer starts naming you for what you sell.',
    title: 'Get found wherever buyers look',
    description:
      'Search, maps, and the AI answer. We get you named where your buyer is already looking — for what you actually sell.',
    items: [
      { title: 'Named in the AI answer', body: 'When a buyer asks Google’s AI or ChatGPT, the answer names you — not the manufacturer or a competitor.' },
      { title: 'Found for what you sell', body: 'Part numbers, specs, "near me" — the searches that bring a real buyer, not vanity traffic.' },
      { title: 'The source AI quotes', body: 'The guides and pages that make you the authority AI reaches for first.' },
      { title: 'Reach the rest', body: 'Targeted outreach to the right buyers who aren’t searching yet.' },
    ],
  },
  {
    number: '02',
    name: 'Convert',
    window: 'Win the sale',
    outcome: 'Answered calls and chased quotes turn into booked work.',
    title: 'Win the demand you already have',
    description:
      'Every call answered, every quote chased, every page built to close — so the leads you already pay for stop slipping out the back.',
    items: [
      { title: 'Answer in seconds', body: 'The call, the form, the message — caught and replied to before a competitor gets there.' },
      { title: 'A site that closes', body: 'Fast pages and a clear quote path that don’t make a ready buyer jump through hoops.' },
      { title: 'Chase the quotes that stall', body: 'The follow-up that turns a sent quote into a signed one, instead of a maybe.' },
      { title: 'Book the job', body: 'Scheduling and reminders that put the work on the calendar, not in limbo.' },
    ],
  },
  {
    number: '03',
    name: 'Retain',
    window: 'Keep them coming back',
    outcome: 'The customers you already won buy again.',
    title: 'Keep them — and sell again',
    description:
      'The cheapest revenue you have is the customer you already won. We bring them back, and win back the ones who went quiet.',
    items: [
      { title: 'Win back the lapsed', body: 'The dormant customer list you already paid to build, sold to again.' },
      { title: 'Recover cold quotes', body: 'The estimates and RFQs that went silent, chased until they close or die for a reason.' },
      { title: 'Reviews and referrals', body: 'Turn happy customers into the reviews and referrals that feed the top of the funnel.' },
      { title: 'Grow what each is worth', body: 'Reorders, upsells, and the next job — more from every customer over time.' },
    ],
  },
]

export function FrameworkTimeline({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <h2 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          One system runs the whole sale.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Get found, win the sale, keep them coming back. Three jobs every sale
          runs through. Most businesses buy them from three vendors who never
          talk, so customers fall through the gaps between them. We run all three
          as one engine.
        </p>
      </div>

      {/* The track + stations. Each station has phase header above the dashed
          rail, then a hard drop-line into the items column below. */}
      <div className="mt-16 grid grid-cols-1 gap-y-10 gap-x-8 md:grid-cols-3 md:gap-y-0 md:gap-x-12">
        {PHASES.map((p, i) => (
          <div key={p.number} className="relative">
            {/* Station header: phase number + outcome metric */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  Job &middot; {p.number} <span className="text-ink-400">/</span> {p.name}
                </p>
                <p className="mt-2 font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
                  {p.window}
                </p>
              </div>
              {i === 0 && (
                <span className="rounded-[3px] bg-accent-500 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-white">
                  Start
                </span>
              )}
            </div>

            {/* Outcome — what you should see by end of phase, in owner words */}
            <div className="mt-6 border-t border-rule pt-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-600">
                What good looks like
              </p>
              <p
                className={`mt-3 max-w-[22ch] font-display text-2xl font-semibold leading-snug tracking-[-0.015em] sm:text-[1.7rem] ${
                  i === 0 ? 'text-accent-600' : 'text-brand-700'
                }`}
              >
                {p.outcome}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 max-w-2xl font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
        Your real numbers show up in the monthly report.
      </p>

      {/* Dashed rail with station markers below the headers */}
      <div className="relative mt-12 hidden md:block">
        <svg
          viewBox="0 0 1000 24"
          preserveAspectRatio="none"
          className="block h-6 w-full"
          aria-hidden
        >
          <line
            x1="0"
            y1="12"
            x2="1000"
            y2="12"
            stroke="var(--color-rule-strong)"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
          {[166, 500, 833].map((cx, i) => {
            const isStart = i === 0
            const color = isStart ? 'var(--color-accent-500)' : 'var(--color-brand-600)'
            return (
              <g key={i}>
                <circle cx={cx} cy="12" r="10" fill="var(--color-paper)" stroke={color} strokeWidth="1.5" />
                <circle cx={cx} cy="12" r="4" fill={color} />
              </g>
            )
          })}
        </svg>
      </div>

      {/* Phase items columns below the rail */}
      <ol className="mt-12 grid gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-0 md:gap-x-12">
        {PHASES.map((p, i) => (
          <li
            key={p.number}
            className={
              i === 0
                ? ''
                : 'md:border-l md:border-rule md:pl-6'
            }
          >
            <h3 className="font-display text-lg font-semibold text-ink-900">
              {p.title}
            </h3>
            <p className="mt-3 text-sm text-ink-700">{p.description}</p>

            <ul className="mt-6 space-y-6 border-t border-rule pt-5">
              {p.items.map((item) => (
                <li key={item.title}>
                  <p className="font-display text-base font-semibold text-ink-900">
                    {item.title}
                  </p>
                  <p className="mt-1.5 text-sm text-ink-700">{item.body}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {/* Prove — the measurement spine under all three jobs */}
      <div className="mt-16 border-t border-rule pt-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          And then &mdash; Prove
        </p>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-ink-700">
          Every month, two revenue lines: what your ad spend brought in, and what
          the system brought back. The line the system recovered should clear what
          you pay us. That&rsquo;s the whole proof.
        </p>
      </div>
    </SectionRail>
  )
}
