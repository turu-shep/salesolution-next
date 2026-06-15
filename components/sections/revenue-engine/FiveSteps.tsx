import { cn } from '@/lib/cn'
import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine pillar § 4 — the 5-step system.
 *
 * Canonical names and order (spec §1.3 — do not rename, reorder, or
 * merge): CAPTURE → RESPOND → BOOK → RECOVER → PROVE. Rendered as a
 * numbered timeline: a connected vertical rail of nodes, each with what
 * the step is and the metric it moves. The final node (PROVE) is filled
 * to read as the outcome. Vertical by construction — no mobile reflow bug.
 */

const STEPS = [
  {
    n: '01',
    key: 'CAPTURE',
    what: 'Conversion assets you own: dedicated landing pages, an instant quote widget or online booking, and a Google Business Profile overhaul.',
    metric: 'Conversion rate',
  },
  {
    n: '02',
    key: 'RESPOND',
    what: 'An AI receptionist answers 100% of calls, 24/7. Missed calls get an instant text back; every form fill gets an AI reply in under 60 seconds.',
    metric: 'Answer rate · after-hours bookings recovered',
  },
  {
    n: '03',
    key: 'BOOK',
    what: 'AI qualification scripts book straight to the calendar, then run reminder sequences. Every call is recorded, transcribed, and classified.',
    metric: 'Lead-to-appointment rate · show rate',
  },
  {
    n: '04',
    key: 'RECOVER',
    what: 'AI follow-up on unclosed estimates and unaccepted treatment plans, dormant-database reactivation, and a review engine that feeds the map pack.',
    metric: 'Recovered revenue from leads already paid for',
  },
  {
    n: '05',
    key: 'PROVE',
    what: 'An attribution dashboard splits system-driven revenue from media-driven revenue. Monthly report. For dental, front-desk conversion scoring.',
    metric: 'System-attributed revenue vs. fee',
  },
]

export function FiveSteps({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          The system
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Five steps,{' '}
          <span className="text-ink-500">one engine.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          The same system runs whether you are a roofer or a dental practice.
          The skin changes; the engine does not.
        </p>
      </div>

      <ol className="mt-14 max-w-4xl">
        {STEPS.map((step, i) => {
          const isLast = i === STEPS.length - 1
          return (
            <li
              key={step.key}
              className="grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-8"
            >
              {/* Node + connector rail */}
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] font-mono text-sm font-semibold tabular-nums',
                    isLast
                      ? 'bg-brand-600 text-white'
                      : 'border border-rule-strong bg-surface text-brand-600',
                  )}
                >
                  {step.n}
                </span>
                {!isLast && <span aria-hidden className="w-px flex-1 bg-rule-strong" />}
              </div>

              {/* Content */}
              <div className={cn(isLast ? 'pb-0' : 'pb-12')}>
                <h3 className="font-display text-xl font-semibold leading-tight tracking-[-0.01em] text-ink-900">
                  {step.key}
                </h3>
                <p className="mt-2 text-ink-700">{step.what}</p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-600">
                  {step.metric}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </SectionRail>
  )
}
