import Image from 'next/image'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * Operator-credibility beat — answers "can YOU actually do this?" for a burned
 * buyer, before the price. No fabricated results (there's no cohort data yet);
 * it sells WHO runs it and HOW (you work with the operator, not a junior team).
 * Facts trace to lib/business.ts founder bio.
 */
export function FounderNote({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="grid items-center gap-10 md:grid-cols-[15rem_1fr] md:gap-14">
        <div className="mx-auto w-44 md:mx-0 md:w-full">
          <Image
            src="/artur-shepel.jpg"
            alt="Artur Shepel, founder of Sale Solution"
            width={719}
            height={1280}
            className="w-full rounded-xl object-cover"
          />
        </div>

        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Who runs it
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            You work with me.{' '}
            <span className="text-ink-500">Not a rotating team.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            I&rsquo;m Artur. I&rsquo;ve spent 14 years running growth for home-services,
            dental, and industrial businesses, and I build and run this system myself. No
            account managers, no junior handoff.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-ink-700">
            On the audit I tell you which leak to fix first, even when it isn&rsquo;t one
            you&rsquo;d pay me for. That&rsquo;s the job.
          </p>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
            Artur Shepel · Founder, Sale Solution
          </p>
        </div>
      </div>
    </SectionRail>
  )
}
