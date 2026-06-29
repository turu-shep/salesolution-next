import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/reviews-reputation/ § — the leak.
 *
 * The Retain-side problem in the owner's words: the happy customer never
 * leaves a review on their own, the unhappy one always does, and the
 * competitor who asks pulls ahead. Dark tone to carry weight under the hero.
 * Full-contrast headline (no muted two-tone).
 */
export function ReviewsLeak({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          The leak
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Your best salespeople are saying nothing.
        </h2>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-12 md:gap-16">
        <div className="space-y-5 text-lg leading-relaxed text-ink-300 md:col-span-7">
          <p>
            The next buyer reads your reviews before they ever call you. A happy
            customer almost never leaves one on their own. An unhappy one always
            does.
          </p>
          <p>
            Without a system that asks, your rating drifts and your count
            stalls. Meanwhile the competitor who asks after every job quietly
            pulls ahead in the exact search you both want.
          </p>
        </div>

        <div className="md:col-span-5">
          <div className="border-l-2 border-accent-500/60 pl-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-500">
              It pays twice
            </p>
            <p className="mt-3 font-display text-xl font-semibold leading-snug text-white">
              Reviews close and rank.
            </p>
            <p className="mt-4 text-ink-300">
              They convince the next buyer and lift you in the map at the same
              time.
            </p>
          </div>
        </div>
      </div>
    </SectionRail>
  )
}
