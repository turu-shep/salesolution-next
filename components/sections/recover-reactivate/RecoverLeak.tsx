import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/recover-reactivate/ § — the leak.
 *
 * The Retain-side problem in the owner's words: the warmest, cheapest demand
 * they have is already on their list, and nobody is working it. Dark tone so
 * it carries weight under the hero. Full-contrast headline (no muted two-tone).
 */
export function RecoverLeak({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          The leak
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Your best leads are ones you already have.
        </h2>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-12 md:gap-16">
        <div className="space-y-5 text-lg leading-relaxed text-ink-300 md:col-span-7">
          <p>
            The estimate that went quiet is not a dead lead. It is a buyer who
            got busy. The customer from two years ago already trusts you, already
            paid you once, already knows your name.
          </p>
          <p>
            That list cost you nothing to build, and it is warmer than anything
            an ad will bring you. Every name on it is demand you already earned.
          </p>
          <p>
            It is just sitting there cooling off, because no one has time to
            chase it.
          </p>
        </div>

        <div className="md:col-span-5">
          <div className="border-l-2 border-accent-500/60 pl-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-500">
              Already paid for
            </p>
            <p className="mt-3 font-display text-xl font-semibold leading-snug text-white">
              Warm beats new.
            </p>
            <p className="mt-4 text-ink-300">
              A revived customer costs you a message. A new one costs you an ad
              budget.
            </p>
          </div>
        </div>
      </div>
    </SectionRail>
  )
}
