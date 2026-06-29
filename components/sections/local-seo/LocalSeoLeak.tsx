import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/local-seo-maps/ § — the leak.
 *
 * The Bring-side problem for local-service businesses: nearby buyers are
 * searching and finding a competitor, because the map pack and the Google
 * Business Profile decide who shows up. Dark tone, full-contrast headline.
 */
export function LocalSeoLeak({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          The leak
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Your customers are searching. They&rsquo;re finding someone else.
        </h2>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-12 md:gap-16">
        <div className="space-y-5 text-lg leading-relaxed text-ink-300 md:col-span-7">
          <p>
            Someone two streets over needs exactly what you do. They search
            &ldquo;near me&rdquo; on their phone, and Google shows a little map with
            three businesses and a row of star ratings. They tap one and call.
          </p>
          <p>
            If you&rsquo;re not one of the three, that search ended without you. Most
            people never scroll past the pack, and they almost never reach page two.
          </p>
          <p>
            You don&rsquo;t have a demand problem. The demand is already typing your
            service into a phone. It just keeps landing on the business that set up
            its map listing properly and you didn&rsquo;t.
          </p>
        </div>

        <div className="md:col-span-5">
          <div className="border-l-2 border-accent-500/60 pl-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-500">
              The new front door
            </p>
            <p className="mt-3 font-display text-xl font-semibold leading-snug text-white">
              The map pack has three slots.
            </p>
            <p className="mt-4 text-ink-300">
              Win one of them and you get the call. Miss them and you are invisible
              for the exact search that was meant for you.
            </p>
          </div>
        </div>
      </div>
    </SectionRail>
  )
}
