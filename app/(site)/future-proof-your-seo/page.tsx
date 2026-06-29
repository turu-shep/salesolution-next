import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { ChecklistPreview } from '@/components/sections/future-proof/ChecklistPreview'
import { EmailCaptureSection } from '@/components/sections/future-proof/EmailCaptureSection'
import { FutureProofHero } from '@/components/sections/future-proof/FutureProofHero'
import { ProofBand } from '@/components/sections/future-proof/ProofBand'
import { WhyNowTimeline } from '@/components/sections/future-proof/WhyNowTimeline'

export const metadata: Metadata = {
  title: 'Future-Proof Your SEO: Survive AI Search',
  description:
    'AI Overviews are erasing 1 in 3 clicks. Get the 10-minute survival checklist + a personalised risk score, plus the Weekly Turbulence Brief.',
  alternates: { canonical: 'https://salesolution.net/future-proof-your-seo/' },
}

const CHECKLIST_FAQ: QA[] = [
  {
    q: 'What exactly is the checklist?',
    a: (
      <>
        <p>
          A 60-point self-audit framework you can run on your own store in
          under an hour. Covers schema depth, content structuring, citation
          engineering, and brand-mention monitoring. Includes a
          self-scoring sheet so you finish with a number, not a vibe.
        </p>
        <p className="mt-3">
          It&rsquo;s the same framework we run on paid engagements. We just
          hand you the diagnostic side &mdash; you score yourself and pick
          the weakest link to fix first.
        </p>
      </>
    ),
  },
  {
    q: 'What is the Weekly Turbulence Brief?',
    a: (
      <>
        <p>
          A short Monday email with the algorithm and AI-engine changes
          that landed the previous week, what they mean for technical
          e&#8209;commerce, and the one thing to do this week. Unsubscribe
          any time &mdash; the unsubscribe link is in every email.
        </p>
      </>
    ),
  },
  {
    q: 'Is this just an SEO checklist with new branding?',
    a: (
      <>
        <p>
          No. Traditional SEO checklists score on ranking factors;
          this one scores on{' '}
          <em className="not-italic font-semibold text-ink-900">retrieval factors</em> &mdash;
          what AI engines actually pull when they cite a source.
          Schema depth, entity density, citation-pattern adherence,
          structured comparability. About 35% overlaps with traditional
          SEO; the rest is new.
        </p>
      </>
    ),
  },
  {
    q: 'Will it work if we&rsquo;re not in hydraulics or industrial?',
    a: (
      <>
        <p>
          Yes for any specification-heavy e&#8209;commerce: electronics,
          contract manufacturing, fluid power, lab supply, fasteners,
          abrasives, industrial automation. If your buyers read a spec
          sheet before they purchase, the mechanics apply. Generic
          consumer SKUs benefit less &mdash; the AIO surface treats those
          differently.
        </p>
      </>
    ),
  },
  {
    q: 'Do I need to book a call to use the checklist?',
    a: (
      <>
        <p>
          No. The checklist + scoring sheet arrive the moment you submit
          the form. The Weekly Brief lands the following Monday. We do
          offer a 15-minute strategy call as an optional next step, but
          there&rsquo;s no obligation and you don&rsquo;t need it to use
          the framework.
        </p>
      </>
    ),
  },
  {
    q: 'How is the risk score calculated?',
    a: (
      <>
        <p>
          From three inputs: monthly revenue, share from organic, and
          traffic mix (informational vs. transactional). We apply the
          published AIO CTR-impact rates (Ahrefs, BrightEdge, Pew) and
          surface the annualised pipeline most exposed. It&rsquo;s a
          back-of-envelope number, not a forecast &mdash; meant to
          calibrate where on the curve you sit, not to size a budget.
        </p>
      </>
    ),
  },
]

export default function FutureProofYourSEOPage() {
  return (
    <>
      <FutureProofHero />
      <ChecklistPreview />
      <WhyNowTimeline />
      <ProofBand />
      <EmailCaptureSection />
      <FAQ
        eyebrow="About the checklist"
        headline={
          <>
            Honest questions about what you&rsquo;re opting into.
          </>
        }
        kicker="What it is, what arrives in your inbox, and what isn’t included."
        items={CHECKLIST_FAQ}
      />
      <FinalCTARail />
    </>
  )
}
