import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/conversion-cro/ § — the leak.
 *
 * The Convert-side problem in the owner's words: you keep buying traffic to
 * cover a leak you could plug. Dark tone so it carries weight under the hero.
 * Full-contrast headline (no muted two-tone).
 */
export function CroLeak({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          The leak
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          You are paying to fill a leaky bucket.
        </h2>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-12 md:gap-16">
        <div className="space-y-5 text-lg leading-relaxed text-ink-300 md:col-span-7">
          <p>
            Every visit costs you, through ads, search, and referrals. Most of
            them leave at a step you could fix: a slow quote, a twelve-field
            form, a checkout that asks too much, a follow-up that never lands.
          </p>
          <p>
            So you keep buying more traffic to make up for the leak instead of
            plugging it. The clicks go up, the booked work doesn&rsquo;t.
          </p>
        </div>

        <div className="md:col-span-5">
          <div className="border-l-2 border-accent-500/60 pl-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-500">
              The cheapest growth
            </p>
            <p className="mt-3 font-display text-xl font-semibold leading-snug text-white">
              Keep what you already brought in.
            </p>
            <p className="mt-4 text-ink-300">
              A point of conversion is worth more than a month of new clicks.
            </p>
          </div>
        </div>
      </div>
    </SectionRail>
  )
}
