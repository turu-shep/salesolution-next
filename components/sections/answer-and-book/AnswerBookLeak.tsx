import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/answer-and-book/ § — the leak.
 *
 * The Convert-side problem in the owner's words: the job goes to whoever
 * replies first, and after hours that isn't them. Dark tone so it carries
 * weight under the hero. Full-contrast headline (no muted two-tone).
 */
export function AnswerBookLeak({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          The leak
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          The fastest reply wins the job. Right now it isn&rsquo;t yours.
        </h2>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-12 md:gap-16">
        <div className="space-y-5 text-lg leading-relaxed text-ink-300 md:col-span-7">
          <p>
            The call comes while you&rsquo;re on a roof or with a patient. The web
            lead lands at 9pm. By the time someone gets back to it, the buyer has
            already called the next name on the list and booked with whoever picked
            up first.
          </p>
          <p>
            You paid to make that phone ring. The ads, the truck wrap, the
            referral, the site you built. The leak isn&rsquo;t getting found. It is
            the gap between the ring and the reply.
          </p>
          <p>
            A missed call is a missed quote. A lead that waits an hour is usually a
            lead that&rsquo;s gone.
          </p>
        </div>

        <div className="md:col-span-5">
          <div className="border-l-2 border-accent-500/60 pl-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-500">
              Why speed decides it
            </p>
            <p className="mt-3 font-display text-xl font-semibold leading-snug text-white">
              Most buyers go with the first business that answers.
            </p>
            <p className="mt-4 text-ink-300">
              Not the cheapest, not the closest. The one that picked up while they
              still had the phone in their hand.
            </p>
          </div>
        </div>
      </div>
    </SectionRail>
  )
}
