import type { Metadata } from 'next'

import { LegalPageLayout } from '@/components/sections/legal/LegalPageLayout'
import type { LegalTOCItem } from '@/components/sections/legal/LegalTOC'
import { business } from '@/lib/business'

export const metadata: Metadata = {
  title: 'Disclaimer',
  description:
    'Editorial position, content disclosures, and the general legal disclaimer for salesolution.net.',
  alternates: { canonical: 'https://salesolution.net/disclaimer/' },
}

const LAST_UPDATED = 'July 27, 2026'

const TOC: LegalTOCItem[] = [
  { id: 'editorial-position', label: 'Editorial position' },
  { id: 'no-professional-advice', label: 'No professional advice' },
  { id: 'no-guarantee-of-results', label: 'No guarantee of results' },
  { id: 'accuracy-and-completeness', label: 'Accuracy & completeness' },
  { id: 'third-party-content-and-links', label: 'Third-party content & links' },
  {
    id: 'affiliate-and-partner-relationships',
    label: 'Affiliate & partner relationships',
  },
  { id: 'composite-examples', label: 'Anonymized & composite examples' },
  { id: 'forward-looking-statements', label: 'Forward-looking statements' },
  { id: 'intellectual-property', label: 'Intellectual property' },
  { id: 'external-references', label: 'External references' },
  { id: 'no-warranty', label: 'No warranty' },
  { id: 'limitation-of-liability', label: 'Limitation of liability' },
  { id: 'governing-law-and-disputes', label: 'Governing law & disputes' },
  { id: 'changes-to-this-disclaimer', label: 'Changes to this disclaimer' },
  { id: 'contact', label: 'Contact' },
]

export default function DisclaimerPage() {
  return (
    <LegalPageLayout
      title="Disclaimer"
      lastUpdated={LAST_UPDATED}
      summary="The honest fine print, plus the hard legal language. What we publish is opinionated, evidence-based, and explicitly not a substitute for tailored professional advice."
      tocItems={TOC}
    >
      <h2 id="editorial-position">Editorial position</h2>
      <p>
        Articles, guides, and case studies on salesolution.net express the
        opinions of their authors at the time of publication. Markets evolve;
        what was true in 2023 may not be true today. We revisit and update
        material where we can, but we make no commitment to keep every page
        current.
      </p>

      <h2 id="no-professional-advice">No professional advice</h2>
      <p>
        Content on this site is provided for informational and educational
        purposes only. It is <strong>not</strong> legal, financial, tax,
        accounting, marketing, investment, or any other form of professional
        advice tailored to your specific situation, business, or jurisdiction.
        Reading, downloading, or otherwise interacting with content on this site
        does not create a client-attorney, fiduciary, consultant, or other
        professional relationship between you and IT Sale Solution LLC.
      </p>
      <p>
        Always consult a qualified professional before acting on anything you
        read here. Decisions you make based on site content are your own
        responsibility.
      </p>

      <h2 id="no-guarantee-of-results">No guarantee of results</h2>
      <p>
        Outcomes described on this site — revenue lifts, ranking changes,
        conversion rate improvements, traffic growth, pipeline movement —
        reflect specific engagements with specific clients under specific
        conditions. They are illustrative, not predictive. We do not guarantee
        similar outcomes for readers without an engagement.
      </p>
      <p>
        Where we do make a guarantee, it is defined in writing in the signed
        engagement letter for that project; nothing on this site modifies,
        extends, or substitutes for those written terms.
      </p>

      <h2 id="accuracy-and-completeness">Accuracy &amp; completeness</h2>
      <p>
        We strive for accuracy across everything we publish, but we accept no
        liability for errors, omissions, broken citations, or information that
        has become outdated since publication. Statistics, benchmarks, screen
        captures, pricing, and platform behaviour described on the site may
        change without notice and may not reflect current conditions.
      </p>
      <p>
        Readers should independently verify any fact, figure, or claim before
        relying on it. If you notice an inaccuracy, please notify us at{' '}
        <a href={`mailto:${business.emails.general}`}>
          {business.emails.general}
        </a>{' '}
        so we can review and, where appropriate, correct it.
      </p>

      <h2 id="third-party-content-and-links">
        Third-party content &amp; links
      </h2>
      <p>
        Our content may reference, quote, embed, or link to third-party
        websites, tools, products, or services. We do not control and do not
        endorse those third parties, their content, or their practices. Their
        inclusion on this site is for reference and reader convenience only and
        does not imply endorsement, affiliation, or warranty of any kind.
      </p>
      <p>
        You access third-party sites and services at your own risk. Their
        terms, privacy policies, and pricing govern your use of them, not ours.
      </p>

      <h2 id="affiliate-and-partner-relationships">
        Affiliate &amp; partner relationships
      </h2>
      <p>
        Where we recommend tools or platforms, we disclose any commercial
        relationship — affiliate link, referral fee, paid partnership, or
        active client relationship — in the article itself. The recommendation
        reflects our honest opinion; affiliate revenue does not change which
        tools we recommend or how we rank them.
      </p>
      <p>
        We comply with the U.S. Federal Trade Commission&rsquo;s{' '}
        <em>Guides Concerning the Use of Endorsements and Testimonials in
        Advertising</em> (16 CFR Part 255).
      </p>

      <h2 id="composite-examples">Anonymized &amp; composite examples</h2>
      <p>
        Most case studies on this site are <strong>anonymized</strong>: they
        describe a single, real engagement, but the client&rsquo;s name is
        withheld at their request — most industrial distributors prefer the case
        study without the logo. In these, the vertical, scale, timeline, and
        reported metrics are as measured; only identifying details are removed.
        Each case study states its disclosure mode on the page.
      </p>
      <p>
        A smaller number of illustrations are <strong>composites</strong> —
        patterns drawn from multiple client engagements rather than a single
        attributed case. Where a story is a composite it is labeled as one, and
        the names, numbers, and details have been altered or aggregated to
        protect client confidentiality while preserving the lesson. We do not
        present a composite as if it were a single client.
      </p>
      <p>
        Where a client is <strong>named</strong>, it is published with their
        written consent, and the quoted figures are as measured in the sources
        cited on that page.
      </p>

      <h2 id="forward-looking-statements">Forward-looking statements</h2>
      <p>
        Any predictions, forecasts, projections, or commentary on future trends
        — SEO behaviour, AI search dynamics, algorithm shifts, channel
        economics, market direction, regulatory change — are forward-looking
        statements. They reflect our view at the time of writing based on the
        evidence available then, and they are inherently uncertain. Actual
        outcomes may differ materially. Treat them as informed perspective, not
        as a basis for material business decisions.
      </p>

      <h2 id="intellectual-property">Intellectual property</h2>
      <p>
        All content on this site — including text, images, illustrations,
        diagrams, code samples, schemas, frameworks, page designs, and
        downloadable assets — is owned by IT Sale Solution LLC or licensed to
        it, and is protected by U.S. and international copyright, trademark,
        and other intellectual property laws.
      </p>
      <p>
        Copying, redistributing, republishing, framing, scraping, or commercial
        use of site content requires our prior written permission, with two
        narrow exceptions: (a) short quotations of up to 200 words with clear
        attribution to <em>Sale Solution</em> and a working back-link to the
        original page, and (b) uses otherwise permitted under the fair use
        doctrine. All trademarks, service marks, and logos remain the property
        of their respective owners.
      </p>

      <h2 id="external-references">External references</h2>
      <p>
        Mentions of other companies, products, services, or trademarks on this
        site belong to their respective owners. Such mentions are for
        identification, comparison, or commentary only and do not imply
        endorsement of those parties by Sale Solution, or endorsement of Sale
        Solution by them.
      </p>

      <h2 id="no-warranty">No warranty</h2>
      <p>
        The site and all content on it are provided on an{' '}
        <strong>&ldquo;AS IS&rdquo;</strong> and{' '}
        <strong>&ldquo;AS AVAILABLE&rdquo;</strong> basis. To the maximum extent
        permitted by applicable law, IT Sale Solution LLC disclaims all
        warranties, whether express, implied, statutory, or otherwise,
        including without limitation any implied warranties of merchantability,
        fitness for a particular purpose, accuracy, completeness, title,
        quiet enjoyment, and non-infringement.
      </p>
      <p>
        We make no warranty that the site will be uninterrupted, error-free,
        secure, or free of viruses or other harmful components.
      </p>

      <h2 id="limitation-of-liability">Limitation of liability</h2>
      <p>
        Your use of the site and reliance on its content is at your own risk.
        Our full liability cap, and the categories of damages excluded, are set
        out in our{' '}
        <a href="/terms-of-service/">Terms of Service</a>. This page provides
        notice that those limitations apply to any claim arising out of or
        relating to the site or its content, to the maximum extent permitted by
        law.
      </p>

      <h2 id="governing-law-and-disputes">Governing law &amp; disputes</h2>
      <p>
        This disclaimer, and any dispute arising out of or relating to the
        site, is governed by the laws of the State of Florida, without regard
        to its conflict-of-laws principles. Disputes are resolved through
        binding arbitration administered by the American Arbitration
        Association (AAA) and seated in Miami-Dade County, Florida, as further
        described in our{' '}
        <a href="/terms-of-service/">Terms of Service</a>, the relevant
        provisions of which are incorporated into this page by reference.
      </p>

      <h2 id="changes-to-this-disclaimer">Changes to this disclaimer</h2>
      <p>
        We may update this disclaimer from time to time to reflect changes in
        our content, services, or applicable law. Material changes will be
        announced on this page by updating the &ldquo;Last updated&rdquo; date
        above and, where appropriate, by a notice on the site. Your continued
        use of the site after a change is posted constitutes acceptance of the
        updated disclaimer. See our{' '}
        <a href="/privacy-policy/">Privacy Policy</a> for how we handle any
        personal information you share with us.
      </p>

      <h2 id="contact">Contact</h2>
      <p>
        For content corrections, intellectual property concerns, accessibility
        issues, or any other questions about this disclaimer, contact:
      </p>
      <p>
        <strong>{business.legalName}</strong>, a Florida limited liability
        company, doing business as {business.dba}
        <br />
        {business.address.street}
        <br />
        {business.address.city}, {business.address.region}{' '}
        {business.address.postalCode}, USA
        <br />
        <a href={`mailto:${business.emails.general}`}>
          {business.emails.general}
        </a>
      </p>
    </LegalPageLayout>
  )
}
