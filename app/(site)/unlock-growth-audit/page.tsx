import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { AuditDeliverables } from '@/components/sections/audit/AuditDeliverables'
import { AuditFit } from '@/components/sections/audit/AuditFit'
import { AuditFormSection } from '@/components/sections/audit/AuditFormSection'
import { AuditHero } from '@/components/sections/audit/AuditHero'
import { AuditPreview } from '@/components/sections/audit/AuditPreview'
import { AuditSocialProof } from '@/components/sections/audit/AuditSocialProof'

export const metadata: Metadata = {
  title: 'Free 15-Minute E-commerce Growth Audit',
  description:
    'Find out exactly what is holding your e-commerce store back — in 15 minutes. Free. No sales pitch. 24-hour turnaround.',
  alternates: { canonical: 'https://salesolution.net/unlock-growth-audit/' },
  openGraph: {
    type: 'website',
    url: 'https://salesolution.net/unlock-growth-audit/',
    siteName: 'Sale Solution',
  },
}

const AUDIT_FAQ: QA[] = [
  {
    q: 'Is the audit really free?',
    a: (
      <>
        <p>
          Yes &mdash; and you keep everything we send, whether we work
          together after or not. The economics work because ~30% of audited
          businesses engage us afterward; the other 70% get a free
          $2k-equivalent diagnostic and ship it themselves.
        </p>
      </>
    ),
  },
  {
    q: 'How is this different from a free agency audit?',
    a: (
      <>
        <p>
          Most &ldquo;free audits&rdquo; are automated scans wrapped in
          slide decks. This is a written, opinionated diagnosis by a senior
          strategist who has lived in technical e&#8209;commerce for a
          decade. We name <em className="not-italic font-semibold text-ink-900">the one constraint</em>,
          not the top fifty.
        </p>
      </>
    ),
  },
  {
    q: 'How long until I get the report?',
    a: (
      <>
        <p>
          Within 24 hours of your form submission. If we can&rsquo;t meet
          that promise we email you within the first 12 hours with a
          reason &mdash; almost always &ldquo;your catalog is bigger than
          average, give us another day.&rdquo;
        </p>
      </>
    ),
  },
  {
    q: 'Will you ask for credit-card details?',
    a: (
      <>
        <p>
          No. The audit is entirely free. We don&rsquo;t run a &ldquo;free
          for an hour, then $99/month&rdquo; trick. The form asks for a
          work email and a phone number; the phone number is so we can
          confirm the report landed in your inbox &mdash; not for a call
          you didn&rsquo;t agree to.
        </p>
      </>
    ),
  },
  {
    q: 'Why do you need monthly revenue and platform info?',
    a: (
      <>
        <p>
          Two reasons. First, fit: if you&rsquo;re under $50k/month, the
          audit will recommend simpler things than what we&rsquo;d normally
          ship &mdash; we want to size advice to your stage. Second, the
          checklist itself changes by platform (Shopify schema lives
          somewhere different than headless schema), so we want to read
          your store with the right lens.
        </p>
      </>
    ),
  },
  {
    q: 'What if my growth problem isn’t in the three lenses?',
    a: (
      <>
        <p>
          Write it in the &ldquo;biggest frustration&rdquo; field on step
          two. We&rsquo;ll either expand the audit to cover it (free, no
          delay) or tell you on the reply that it&rsquo;s outside our
          range and recommend who you should actually talk to.
        </p>
      </>
    ),
  },
  {
    q: 'Can I forward the report to my team / agency?',
    a: (
      <>
        <p>
          Yes &mdash; it&rsquo;s designed for that. Each finding is tagged
          with effort and lift so the person who has to implement it
          (developer, agency, in-house marketer) can pick it up without us
          in the room.
        </p>
      </>
    ),
  },
]

export default function UnlockGrowthAuditPage() {
  return (
    <>
      <AuditHero />
      <AuditDeliverables id="deliverables" />
      <AuditPreview id="preview" />
      <AuditSocialProof />
      <AuditFit id="fit" />
      <AuditFormSection id="book" />
      <FAQ
        id="faq"
        eyebrow="Common questions"
        headline={<>Last questions before you book.</>}
        kicker="What the audit covers, what it costs, what we do with your data, and what happens after the report lands."
        items={AUDIT_FAQ}
      />
      <FinalCTARail />
    </>
  )
}
