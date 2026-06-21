import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { AuditCTA } from '@/components/sections/revenue-engine/AuditCTA'
import { FounderNote } from '@/components/sections/revenue-engine/FounderNote'
import { Guarantee } from '@/components/sections/revenue-engine/Guarantee'
import { PlanByPillar } from '@/components/sections/revenue-engine/PlanByPillar'
import { RevenueHero } from '@/components/sections/revenue-engine/RevenueHero'
import { RevenuePricing } from '@/components/sections/revenue-engine/RevenuePricing'
import { TwoRevenueLines } from '@/components/sections/revenue-engine/TwoRevenueLines'
import { Concept2Evidence } from '@/components/sections/revenue-engine/leak-concepts/Concept2Evidence'
import { Concept3Calculator } from '@/components/sections/revenue-engine/leak-concepts/Concept3Calculator'
import { Concept4BeforeAfter } from '@/components/sections/revenue-engine/leak-concepts/Concept4BeforeAfter'
import { LEAK_DATA } from '@/components/sections/revenue-engine/leak-concepts/data'
import { FlowBlock } from '@/components/sections/revenue-engine/flow-concepts/FlowBlock'

/**
 * Internal end-to-end preview of the reworked Revenue Engine page (home-services
 * data). Order, after the narrative review:
 *   Hook -> 3-leak villain -> quantify YOUR leak (calculator) -> mechanism
 *   (flow) -> plan (5 steps by pillar) -> the difference (before/after) ->
 *   who runs it (founder) -> proof/attribution -> offer -> guarantee -> FAQ ->
 *   audit.
 * Calculator pulled up next to the villain, attribution pushed down by the
 * offer, storm-season cut — to break the proof pileup and the back-half light
 * wall. Not linked in nav, noindex. Delete once wired into the real pages.
 */
export const metadata: Metadata = {
  title: 'Revenue Engine — full page preview',
  robots: { index: false, follow: false },
}

const hs = LEAK_DATA['home-services']

const FAQ_ITEMS: QA[] = [
  {
    q: 'Do I need a new website?',
    a: (
      <p>
        No. The quote form and pages run alongside your existing site. I don&rsquo;t touch
        your domain or make you rebuild &mdash; the engine bolts on to what you have.
      </p>
    ),
  },
  {
    q: 'Are these leads exclusive to me?',
    a: (
      <p>
        Yes. Your own demand, your own ad account, your own pipeline. I never resell a lead
        to another contractor.
      </p>
    ),
  },
  {
    q: 'How fast can we start?',
    a: (
      <p>
        The full system installs over 90 days, but call answering and missed-call text-back
        are live within the first couple of weeks.
      </p>
    ),
  },
]

export default function RevenueEngineFullPreview() {
  return (
    <>
      <div className="h-1.5 w-full bg-brand-600" aria-hidden />

      {/* 1 — HOOK */}
      <RevenueHero
        eyebrow="Revenue Engine · Home services"
        title="Built for contractors who miss calls"
        titleAccent="because they're on a roof."
        lede={
          <>
            You&rsquo;re on a roof when the phone rings &mdash; and the lead you paid for
            dials the next contractor on the list. The estimate you drove out for goes quiet.
            Each one is a booked job you never see.
          </>
        }
        primaryCta={{ label: 'Book a Revenue Leak Audit', href: '#audit' }}
        anchors={[
          { label: 'The leak', href: '#leak' },
          { label: 'The plan', href: '#plan' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />

      {/* 2 — THE VILLAIN: three leaks (Evidence cards) */}
      <div id="leak">
        <Concept2Evidence data={hs} />
      </div>

      {/* 3 — QUANTIFY YOUR OWN LEAK (calculator, pulled up next to the villain) */}
      <Concept3Calculator
        data={hs}
        header={{
          eyebrow: 'Your leak, in dollars',
          headlineA: 'Put a number on it.',
          headlineB: 'Your number, not mine.',
          intro: 'Three figures from your own week. The math is in the open — change them.',
          closer: '',
        }}
      />

      {/* 4 — THE MECHANISM: I run the whole flow */}
      <FlowBlock />

      {/* 5 — THE PLAN: 5 steps grouped under the 3 pillars */}
      <PlanByPillar id="plan" />

      {/* 6 — THE DIFFERENCE: same lead, two endings */}
      <Concept4BeforeAfter
        data={hs}
        header={{
          eyebrow: 'The difference',
          headlineA: 'Same lead.',
          headlineB: 'Two endings.',
          intro:
            'One contractor, one inbound lead. The only thing that changes is whether it gets answered.',
          closer: '',
        }}
      />

      {/* 7 — WHO RUNS IT (operator credibility, before the price) */}
      <FounderNote />

      {/* 8 — PROOF / ATTRIBUTION (moved down, by the offer) */}
      <TwoRevenueLines id="proof" />

      {/* 9 — OFFER */}
      <RevenuePricing id="pricing" />

      {/* 10 — GUARANTEE */}
      <Guarantee id="guarantee" />

      {/* 11 — SLIM FAQ */}
      <FAQ
        id="faq"
        eyebrow="A few last questions"
        headline={
          <>
            Questions <span className="text-ink-500">before the audit.</span>
          </>
        }
        kicker="New website, lead exclusivity, time to start. Straight answers."
        items={FAQ_ITEMS}
      />

      {/* 12 — AUDIT CLOSE */}
      <AuditCTA id="audit" />
    </>
  )
}
