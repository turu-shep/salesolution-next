import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/paid-acquisition/ § — the leak.
 *
 * The Bring-side problem in the owner's words: the budget buys clicks the
 * report can show off, not jobs, and the account isn't even yours to leave
 * with. Dark tone so it carries weight under the hero. Full-contrast headline.
 */
export function PaidAcqLeak({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          The leak
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Your ad budget is buying clicks, not jobs.
        </h2>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-12 md:gap-16">
        <div className="space-y-5 text-lg leading-relaxed text-ink-300 md:col-span-7">
          <p>
            The agency marks your spend up and pockets the difference. They lock
            the account so you can&rsquo;t leave. Then they optimize for the
            numbers that flatter the report: impressions, clicks, click-through
            rate.
          </p>
          <p>
            None of those pay your bills. You can&rsquo;t see what&rsquo;s
            actually working, and the day you walk, the account walks with them.
            You&rsquo;re left with a stack of invoices and no idea which dollar
            ever turned into a job.
          </p>
        </div>

        <div className="md:col-span-5">
          <div className="border-l-2 border-accent-500/60 pl-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-500">
              The number that matters
            </p>
            <p className="mt-3 font-display text-xl font-semibold leading-snug text-white">
              Cost per booked job.
            </p>
            <p className="mt-4 text-ink-300">
              Not impressions. Not clicks. The dollars in, against the jobs out.
            </p>
          </div>
        </div>
      </div>
    </SectionRail>
  )
}
