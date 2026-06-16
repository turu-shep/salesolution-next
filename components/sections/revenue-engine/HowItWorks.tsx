import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Revenue Engine § how it works — the big picture, in plain language.
 *
 * Built for a business owner, not an SEO. Before any jargon (map pack, GEO,
 * schema), this shows the whole engine as one journey: the three hero verbs
 * — Get found → Get booked → Get paid — as a connected flow. The detailed
 * sections below expand each phase.
 */

const PHASES = [
  {
    n: '01',
    name: 'Get found',
    body: 'Customers searching for your service find you first — at the top of Google, and in the answers people get before they click a link.',
  },
  {
    n: '02',
    name: 'Get booked',
    body: 'Every call and form gets answered in seconds and booked straight to your calendar, around the clock — no lead left waiting.',
  },
  {
    n: '03',
    name: 'Get paid',
    body: 'Cold quotes and no-shows get chased and recovered automatically, and a dashboard proves every dollar the work brought in.',
  },
]

export function HowItWorks({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          How it works
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          The whole picture,{' '}
          <span className="text-ink-500">before the detail.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Getting found, booking the job, and getting paid is usually three
          different vendors. I run all three as one &mdash; here is the whole
          picture, before any of the detail.
        </p>
      </div>

      <ol className="mt-14 flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-0">
        {PHASES.map((p, i) => (
          <li key={p.n} className="flex flex-col gap-4 lg:contents">
            <div className="flex flex-1 flex-col rounded-[4px] border border-rule-strong bg-paper p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-[4px] bg-brand-600 font-mono text-sm font-semibold tabular-nums text-white">
                {p.n}
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold tracking-[-0.015em] text-ink-900">
                {p.name}
              </h3>
              <p className="mt-3 leading-relaxed text-ink-700">{p.body}</p>
            </div>
            {i < PHASES.length - 1 && (
              <span
                aria-hidden
                className="flex shrink-0 items-center justify-center text-2xl text-brand-600 lg:px-6"
              >
                <span className="lg:hidden">↓</span>
                <span className="hidden lg:inline">→</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </SectionRail>
  )
}
