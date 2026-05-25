import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { CatalogSnapshotDeliverables } from '@/components/sections/catalog-snapshot/CatalogSnapshotDeliverables'
import { CatalogSnapshotFit } from '@/components/sections/catalog-snapshot/CatalogSnapshotFit'
import { CatalogSnapshotFormSection } from '@/components/sections/catalog-snapshot/CatalogSnapshotFormSection'
import { CatalogSnapshotHero } from '@/components/sections/catalog-snapshot/CatalogSnapshotHero'

export const metadata: Metadata = {
  title: 'Free Catalog Snapshot · Dual-version product rewrite',
  description:
    'Send your URL and SKU count. We rewrite 5 of your products in both Standard and Pro tiers, audit your catalog for citation gaps, and apply three-tier pricing to your catalog size. Free. 2 business days.',
  alternates: { canonical: 'https://salesolution.net/catalog-snapshot/' },
  openGraph: {
    type: 'website',
    url: 'https://salesolution.net/catalog-snapshot/',
    siteName: 'Sale Solution',
  },
}

const SNAPSHOT_FAQ: QA[] = [
  {
    q: 'How is this different from the free Growth Audit?',
    a: (
      <>
        <p>
          The Growth Audit is a written diagnosis of the single biggest
          constraint slowing your store down &mdash; technical, CRO, and
          AI-search. The Catalog Snapshot is specifically about your
          product catalog: rewritten samples, catalog-wide patterns, and
          three-tier pricing applied to your SKU count.
        </p>
        <p className="mt-3">
          Different decision, different deliverable. If you&rsquo;re
          comparing Catalog AI vs. doing nothing, this is the right
          snapshot. If you don&rsquo;t know where your bottleneck is yet,
          start with the Growth Audit.
        </p>
      </>
    ),
  },
  {
    q: 'Which 5 products do you rewrite?',
    a: (
      <>
        <p>
          We pick five from different categories to give you a
          representative read across your catalog &mdash; high-spec
          technical products, simpler accessories, and a category page or
          two. If you want us to rewrite specific products, list them in
          the &ldquo;biggest frustration&rdquo; field on step two.
        </p>
      </>
    ),
  },
  {
    q: 'Will you ask for credit-card details?',
    a: (
      <>
        <p>
          No. The snapshot is entirely free. We don&rsquo;t run a
          &ldquo;free for an hour, then $99/month&rdquo; trick. Phone
          number is so we can confirm the report landed in your
          inbox &mdash; not for a call you didn&rsquo;t agree to.
        </p>
      </>
    ),
  },
  {
    q: 'What if my catalog is under 1,000 SKUs?',
    a: (
      <>
        <p>
          We&rsquo;ll still produce the snapshot, but we&rsquo;ll be
          honest in the reply: under 1,000 SKUs the minimum project cost
          ($3,000 on Standard) doesn&rsquo;t amortize well. A SaaS tool is
          usually a better fit until your catalog grows. We&rsquo;ll name
          the tool we&rsquo;d recommend.
        </p>
      </>
    ),
  },
  {
    q: 'Can I forward the snapshot to my team or agency?',
    a: (
      <>
        <p>
          Yes &mdash; it&rsquo;s designed for that. Each finding includes
          enough technical detail that your developer, agency, or in-house
          marketer can act on it without us in the room.
        </p>
      </>
    ),
  },
  {
    q: 'What happens after I get the PDF?',
    a: (
      <>
        <p>
          Nothing automatic. If you want to discuss it on a 30-minute call,
          there&rsquo;s a link on the last page of the PDF. If you want to
          think about it, no follow-up sequence. Email back when
          you&rsquo;re ready &mdash; could be a week, could be six months.
        </p>
      </>
    ),
  },
]

export default function CatalogSnapshotPage() {
  return (
    <>
      <CatalogSnapshotHero />
      <CatalogSnapshotDeliverables id="deliverables" />
      <CatalogSnapshotFit id="fit" />
      <CatalogSnapshotFormSection id="book" />
      <FAQ
        id="faq"
        eyebrow="Common questions"
        headline={<>Last questions <span className="text-ink-500">before you book.</span></>}
        kicker="What's in the PDF. Who it’s for. What we won’t do with your details."
        items={SNAPSHOT_FAQ}
      />
      <FinalCTARail />
    </>
  )
}
