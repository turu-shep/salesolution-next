import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/answer-and-book/ § — how it works.
 *
 * The four mechanics, in plain order: pick up, text back the misses, qualify
 * and book, remind and log. Numbered steps on paper, operator voice.
 */

type Step = {
  n: string
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    n: '01',
    title: 'Answer every call, live',
    body: 'A real, friendly voice picks up day and night. After hours, during the lunch rush, when your team is heads-down on a job. Not a phone tree your customer hangs up on.',
  },
  {
    n: '02',
    title: 'Text back the ones that slip',
    body: 'Any call that still gets missed gets an instant text within seconds: “Sorry we missed you. How can we help?” The conversation keeps going on your side instead of moving to a competitor.',
  },
  {
    n: '03',
    title: 'Qualify, then book',
    body: 'Real leads get the few questions that matter and land straight on your calendar with the details your crew needs. Tire-kickers and spam get filtered before they reach you.',
  },
  {
    n: '04',
    title: 'Remind, then log it',
    body: 'Automatic reminders so booked work actually shows up. Every call recorded, transcribed, and sorted, so nothing slips and you can see exactly what came in and what it was worth.',
  },
]

export function AnswerBookHow({ id }: { id?: string }) {
  return (
    <SectionRail tone="paper" id={id}>
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          How it works
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Pick up, text back, book. Around the clock.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          One system handles the moment a lead reaches you, every hour of the day,
          so the demand you already paid for turns into booked jobs.
        </p>
      </div>

      <ol className="mt-12 grid gap-px overflow-hidden rounded-[6px] border border-rule bg-rule sm:grid-cols-2">
        {STEPS.map((s) => (
          <li key={s.n} className="bg-paper p-7 sm:p-8">
            <span className="font-mono text-[13px] font-medium tabular-nums text-accent-600">
              {s.n}
            </span>
            <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-ink-900">
              {s.title}
            </h3>
            <p className="mt-3 leading-relaxed text-ink-700">{s.body}</p>
          </li>
        ))}
      </ol>
    </SectionRail>
  )
}
