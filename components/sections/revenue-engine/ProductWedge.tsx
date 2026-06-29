import { SectionRail } from '@/components/layout/SectionRail'

/**
 * The wedge — a collapsed, banner-form version of FlowBlock for the cross-vertical
 * product page. The full connected-track visual + compounding-loop diagram stays
 * on the niche pages; here it's the belief shift in two sentences plus the trust
 * line, neutralized to firm "we". PlanByPillar is the only place the
 * Bring → Convert → Retain frame appears in full on this page.
 */
export function ProductWedge({ id }: { id?: string }) {
  return (
    <SectionRail tone="dark" id={id} glow="strong">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">The wedge</p>
        <h2 className="mt-4 font-display text-[2.5rem] font-semibold leading-[1.0] tracking-[-0.025em] text-white sm:text-5xl lg:text-[3.5rem]">
          <span className="block">You’ve been sold pieces.</span>
          <span className="block">We run the whole flow.</span>
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-200">
          A website, an ad, a CRM, each sold by someone who never saw the other
          two. Customers fall into the gaps between them. We run all of it as one
          system, so they don’t.
        </p>
      </div>

      <div className="mt-12 border-t border-white/10 pt-7">
        <p className="flex flex-col gap-x-10 gap-y-2.5 text-lg font-semibold text-white sm:flex-row sm:flex-wrap">
          <span>No markup on your ad spend.</span>
          <span>We don’t resell your leads.</span>
          <span>No lock-in.</span>
        </p>
      </div>
    </SectionRail>
  )
}
