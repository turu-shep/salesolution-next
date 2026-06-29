import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/outbound-email/ § 5 — Sequence framework.
 *
 * Five-touch sequence as a left-rail timeline. Each row has a day marker,
 * the touch type, the body intent, and the branching rule. Visually similar
 * to ProcessTimeline on /services/ai-seo/ — but on light so the page rhythm
 * stays L D L D L.
 */

type Touch = {
  day: string
  channel: string
  title: string
  intent: string
  branch: string
  emphasis?: 'first' | 'last'
}

const TOUCHES: Touch[] = [
  {
    day: 'Day 0',
    channel: 'Email · plain text',
    title: 'Reference open',
    intent:
      'Three-sentence opener that names a specific operational pattern they will recognize. No tracking pixel, no image, no link.',
    branch:
      'If positive reply → triage to human within 2h · if no open in 72h → continue',
    emphasis: 'first',
  },
  {
    day: 'Day 3',
    channel: 'Email · plain text',
    title: 'Concrete artifact',
    intent:
      'A specific number, screenshot, or one-page audit. The job of touch 2 is to make touch 1 feel like the opening line of a peer email, not a sequence.',
    branch:
      'If link click → branch to artifact-deep sequence · if no engagement → continue',
  },
  {
    day: 'Day 7',
    channel: 'LinkedIn · view + connect',
    title: 'Cross-channel signal',
    intent:
      'Light LinkedIn presence — profile view, optional connect. Buyer recognizes the name from email by the time they see the request.',
    branch:
      'If connection accepted → InMail follow-up routed manually · else → continue',
  },
  {
    day: 'Day 12',
    channel: 'Email · plain text',
    title: 'Reframe the offer',
    intent:
      'Same problem, different angle. We split-test the reframe at the offer level — never just the subject line.',
    branch:
      'If reply → human triage · if no opens across 3 touches → mark cold, exit sequence',
  },
  {
    day: 'Day 18',
    channel: 'Email · plain text',
    title: 'Break-up + permission',
    intent:
      'Honest close. "Should I stop reaching out, or is this just bad timing?" — converts a meaningful percentage of the warm-but-quiet pile.',
    branch:
      'If permissive reply → quarterly nurture · if negative → suppress globally',
    emphasis: 'last',
  },
]

export function SequenceFramework({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          A live sequence
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Five touches.{' '}
          Each earns the next.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          The cadence below is the default skeleton &mdash; we tighten or extend
          it based on ICP, sales cycle, and offer maturity. What doesn&rsquo;t
          change is the branching: a touch ships only when the prior touch
          earned the signal it was supposed to.
        </p>
      </div>

      <ol className="relative mt-16 space-y-10 border-l border-rule-strong pl-8 md:pl-12">
        {TOUCHES.map((t, i) => (
          <li key={t.day} className="relative">
            {/* Marker */}
            <span
              aria-hidden
              className="absolute -left-[34px] top-1.5 flex h-4 w-4 items-center justify-center md:-left-[50px]"
            >
              <span className="absolute inset-0 rounded-full bg-surface" />
              <span
                className={
                  t.emphasis === 'first'
                    ? 'relative h-3 w-3 rounded-full bg-accent-500 ring-2 ring-accent-500/30'
                    : t.emphasis === 'last'
                      ? 'relative h-3 w-3 rounded-full bg-ink-900 ring-2 ring-ink-900/20'
                      : 'relative h-3 w-3 rounded-full bg-brand-600 ring-2 ring-brand-600/25'
                }
              />
            </span>

            <div className="grid gap-3 md:grid-cols-12 md:gap-10">
              <div className="md:col-span-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                  {t.day}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
                  {t.channel}
                </p>
                {t.emphasis === 'first' && (
                  <p className="mt-2 inline-block rounded-[3px] bg-accent-500/15 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-700">
                    First send
                  </p>
                )}
                {i + 1 < TOUCHES.length && i > 0 && (
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
                    Touch {i + 1} / {TOUCHES.length}
                  </p>
                )}
              </div>
              <div className="md:col-span-9">
                <h3 className="font-display text-xl font-semibold text-ink-900">
                  {t.title}
                </h3>
                <p className="mt-3 text-ink-700">{t.intent}</p>
                <div className="mt-5 border-l-2 border-brand-600/40 pl-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-600">
                    Branch rule
                  </p>
                  <p className="mt-1.5 text-sm text-ink-700">{t.branch}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </SectionRail>
  )
}
