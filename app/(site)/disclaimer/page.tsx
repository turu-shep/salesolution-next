import type { Metadata } from 'next'

import { LegalPageLayout } from '@/components/sections/legal/LegalPageLayout'

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Disclosures about content, claims, and external references on salesolution.net.',
  alternates: { canonical: 'https://salesolution.net/disclaimer/' },
}

const LAST_UPDATED = 'May 20, 2026'

// Only 4 sections — TOC is intentionally omitted (threshold = 5).
export default function DisclaimerPage() {
  return (
    <LegalPageLayout
      title="Disclaimer"
      lastUpdated={LAST_UPDATED}
      summary="The honest fine print. What we publish is opinionated, evidence-based, and explicitly not a substitute for tailored advice on your business."
    >
      <h2 id="editorial-position">Editorial position</h2>
      <p>
        Articles, guides, and case studies on salesolution.net express the
        opinions of their authors at the time of publication. Markets evolve;
        what was true in 2023 may not be true today.
      </p>

      <h2 id="no-guarantee-of-results">No guarantee of results</h2>
      <p>
        Outcomes described — revenue lifts, ranking changes, conversion rate
        improvements — reflect specific engagements with specific clients
        under specific conditions. We do not guarantee similar outcomes for
        readers without an engagement. Where we make a guarantee, it is
        defined in writing in the engagement letter.
      </p>

      <h2 id="affiliate-and-partner-relationships">
        Affiliate &amp; partner relationships
      </h2>
      <p>
        Where we recommend tools or platforms, we disclose any commercial
        relationship in the article. The recommendation reflects our honest
        opinion; affiliate revenue does not change which tools we recommend.
      </p>

      <h2 id="composite-examples">Composite examples</h2>
      <p>
        Some illustrations on the site use composite stories — patterns drawn
        from multiple client engagements rather than a single attributed case.
        These are clearly marked where they appear.
      </p>
    </LegalPageLayout>
  )
}
