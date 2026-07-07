import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { SprintApply } from '@/components/sections/constraint-sprint/SprintApply'
import { SprintDeliverables } from '@/components/sections/constraint-sprint/SprintDeliverables'
import { SprintHero } from '@/components/sections/constraint-sprint/SprintHero'
import { SprintTimeline } from '@/components/sections/constraint-sprint/SprintTimeline'
import { WhatIsSprint } from '@/components/sections/constraint-sprint/WhatIsSprint'
import { WhoFor } from '@/components/sections/constraint-sprint/WhoFor'

export const metadata: Metadata = {
  title: 'Constraint Sprint · 4-Week E-commerce Diagnostic',
  description:
    'Find the single biggest blocker in your e-commerce growth engine. Install one compounding fix. Walk away with a 90-day execution roadmap. $12,000.',
  alternates: { canonical: 'https://salesolution.net/constraint-sprint/' },
}

const SPRINT_FAQ: QA[] = [
  {
    q: 'What exactly is included in the $12–24k?',
    a: (
      <>
        <p>
          Four weeks of senior operator + execution time. The Revenue Leak
          Scan, a KPI scoreboard wired to your real data, one installed
          asset in your store, and the 90&#8209;day Ticket Pack + Fix
          Order. Every artifact transfers to you in editable form.
        </p>
        <p className="mt-3">
          The range covers stack complexity. A single-store Shopify build
          on the lower end; a multi-region headless or WooCommerce setup
          with 5,000+ SKUs at the upper.
        </p>
      </>
    ),
  },
  {
    q: 'What kind of "installed asset" do I get?',
    a: (
      <>
        <p>
          Whichever asset matches the constraint we identify in Week 1: a
          lifecycle email flow, a structured-data deployment, a GA4 funnel
          rebuild, or a paid campaign restructure. We pick the asset with
          the largest expected revenue impact for your specific situation
          &mdash; not a menu item you chose ahead of time.
        </p>
      </>
    ),
  },
  {
    q: 'How is this different from an agency audit?',
    a: (
      <>
        <p>
          Most agency audits are slide decks &mdash; a list of findings
          and recommendations. The Constraint Sprint ships actual work
          inside your stack. By Week 3 there&rsquo;s a live asset
          producing measurable lift, plus the diagnostic and 90&#8209;day
          plan. You walk away with momentum, not a PDF.
        </p>
      </>
    ),
  },
  {
    q: "What if I'm already working with agencies?",
    a: (
      <>
        <p>
          Common. The sprint slots in alongside your existing setup as
          the strategic layer that connects the pieces. We frequently
          find the biggest constraint is coordination between agencies
          &mdash; and the fix is one shared scoreboard plus a written
          ticket order.
        </p>
      </>
    ),
  },
  {
    q: 'What happens after the sprint?',
    a: (
      <>
        <p>
          Three outcomes, all supported. Some clients roll into a retainer
          ($8&ndash;14k/month) for ongoing execution. Others take the Ticket
          Pack to their in-house team and run it themselves. Some pause and
          revisit a quarter or two later.
        </p>
        <p className="mt-3">
          No clawback on artifacts in any case. The work is yours.
        </p>
      </>
    ),
  },
  {
    q: "What's the guarantee, precisely?",
    a: (
      <>
        <p>
          If we can&rsquo;t isolate a clear, evidence-backed growth
          constraint by the end of Week 1, we refund the full sprint fee.
          You keep every deliverable already produced &mdash; the scan,
          the scoreboard, the in-progress asset. No clawback.
        </p>
      </>
    ),
  },
  {
    q: 'How do I know if my brand is a strong fit?',
    a: (
      <>
        <p>
          Strong fit: $2M&ndash;$20M annual revenue, plateaued or
          decelerating, running multiple agencies, decision-maker on
          the call. Industrial e&#8209;commerce, MRO, hydraulics,
          contract manufacturing, technical distribution &mdash; any
          spec-driven category &mdash; is where the playbook earns out
          fastest.
        </p>
        <p className="mt-3">
          Not a fit: under $1M ARR, pure-DTC fashion, looking for a
          quick-fix bandage. We&rsquo;ll say so on the first call.
        </p>
      </>
    ),
  },
  {
    q: 'Can we engage on a longer retainer instead?',
    a: (
      <>
        <p>
          Yes &mdash; the Operator Retainer is $8&ndash;14k/month and
          fits brands that already know the structural problem and just
          want it fixed. If you&rsquo;re unsure which engagement shape
          fits, fill in the form and mention it; we&rsquo;ll suggest the
          right entry point.
        </p>
      </>
    ),
  },
]

export default function ConstraintSprintPage() {
  return (
    <>
      <SprintHero />
      <WhatIsSprint />
      <SprintTimeline />
      <SprintDeliverables />
      <WhoFor />
      <SprintApply />
      <FAQ
        id="faq"
        eyebrow="Constraint Sprint FAQ"
        headline={
          <>
            Sprint questions answered straight.
          </>
        }
        kicker="The terms, the deliverables, the refund — the things buyers actually ask before they apply."
        items={SPRINT_FAQ}
      />
      <FinalCTARail />
    </>
  )
}
