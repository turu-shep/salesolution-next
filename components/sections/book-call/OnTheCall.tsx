import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /book-growth-call/ § 2 — What happens ON the call.
 *
 * Mirrors the visual language of /services/ ProcessTimeline (dark band,
 * left-rail timeline, "you'll see" outcome). But the cadence is minutes,
 * not weeks — this is the 15-minute walkthrough demystified, beat by beat.
 *
 * Buyer mindset: they're hesitating because "discovery call" usually means
 * 30 minutes of qualification followed by a deck. We invert that — show
 * them what we'll actually do in real time so they can decide if it's
 * worth the calendar slot.
 */

type Beat = {
  minute: string
  title: string
  body: string
  outcome: string
}

const BEATS: Beat[] = [
  {
    minute: '0–2 min',
    title: 'Context · the one constraint',
    body: 'You tell us what the most expensive problem looks like. Plateaued revenue, AIO eating the click, agency that under-delivered — pick one. We skip the rest.',
    outcome: 'The call narrows to the constraint that actually matters.',
  },
  {
    minute: '2–10 min',
    title: 'Live walkthrough · your URLs',
    body: 'You paste 3–5 of your highest-revenue category or product URLs. We share screen and walk through them live: schema completeness, AIO-readiness, citation gaps vs your competitors.',
    outcome: 'You see exactly where the leverage is — and where it isn\'t.',
  },
  {
    minute: '10–13 min',
    title: 'The one highest-payback change',
    body: 'We name the single change with the largest expected revenue impact in 90 days. No top-50 lists, no severity scores. One thing, with reasoning.',
    outcome: 'A specific action you can ship this week, with or without us.',
  },
  {
    minute: '13–15 min',
    title: 'Honest fit-check',
    body: 'We tell you whether you should hire us, hire someone else, or do nothing yet. Below $200k/month or pre-PMF, "do nothing" is often the right answer.',
    outcome: 'You leave with a decision, not a follow-up sequence.',
  },
]

export function OnTheCall() {
  return (
    <SectionRail tone="dark">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          What happens on the call
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Fifteen minutes. Beat by beat.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
          Most "discovery calls" are 30 minutes of qualification followed by
          a deck. We don&rsquo;t do that. Here&rsquo;s exactly how the 15
          minutes are spent &mdash; so you can decide if it&rsquo;s worth
          the calendar slot.
        </p>
      </div>

      <ol className="relative mt-16 space-y-12 border-l border-white/15 pl-8 md:pl-12">
        {BEATS.map((beat, i) => (
          <li key={beat.minute} className="relative">
            <span
              aria-hidden
              className="absolute -left-[34px] top-2 flex h-4 w-4 items-center justify-center md:-left-[50px]"
            >
              <span className="absolute inset-0 rounded-full bg-surface-dark" />
              <span
                className={
                  i === 0
                    ? 'relative h-3 w-3 rounded-full bg-accent-500 ring-2 ring-accent-500/30'
                    : 'relative h-3 w-3 rounded-full bg-brand-600 ring-2 ring-brand-600/30'
                }
              />
            </span>

            <div className="grid gap-6 md:grid-cols-12 md:gap-10">
              <div className="md:col-span-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] tabular-nums text-ink-300">
                  {beat.minute}
                </p>
                {i === 0 && (
                  <p className="mt-2 inline-block rounded-[3px] bg-accent-500/15 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-500">
                    We start here
                  </p>
                )}
              </div>
              <div className="md:col-span-9">
                <h3 className="font-display text-xl font-semibold text-white">
                  {beat.title}
                </h3>
                <p className="mt-3 text-ink-300">{beat.body}</p>
                <div className="mt-5 border-l-2 border-accent-500/50 pl-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-500">
                    You&rsquo;ll leave with
                  </p>
                  <p className="mt-1.5 text-sm text-ink-200">{beat.outcome}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-16 border-t border-white/10 pt-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          Bring to the call
        </p>
        <ul className="mt-4 grid gap-x-10 gap-y-3 sm:grid-cols-2 md:grid-cols-3">
          {[
            '3–5 high-revenue category URLs',
            'Rough monthly revenue band',
            'Your single biggest frustration',
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-sm text-ink-200"
            >
              <span aria-hidden className="mt-2 h-1 w-3 shrink-0 bg-accent-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-ink-400">
          No prep beyond that. We don&rsquo;t send a 20-question intake form.
        </p>
      </div>
    </SectionRail>
  )
}
