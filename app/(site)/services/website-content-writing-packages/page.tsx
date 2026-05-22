import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import {
  PACKAGE_TIERS,
  PackagesGrid,
} from '@/components/sections/content-packages/PackagesGrid'
import { WhatsIncluded } from '@/components/sections/content-packages/WhatsIncluded'
import { WhyFixedPackages } from '@/components/sections/content-packages/WhyFixedPackages'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { productWithOffersSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Website Content Writing Packages & Pricing',
  description:
    'Five fixed-price content packages from $500 to $15,000/month, plus a custom option. SEO-led, senior writers, no offshoring.',
  alternates: {
    canonical: 'https://salesolution.net/services/website-content-writing-packages/',
  },
}

const PACKAGES_FAQ: QA[] = [
  {
    q: 'Are these prices fixed?',
    a: (
      <>
        <p>
          Yes. Every tier is a fixed monthly fee with the deliverables
          locked. No &ldquo;starting at&rdquo; pricing, no surprise
          upcharges, no scope creep priced retroactively.
        </p>
      </>
    ),
  },
  {
    q: 'How do volume discounts stack?',
    a: (
      <>
        <p>
          <em className="not-italic font-semibold text-ink-900">5% off</em>{' '}
          for a 6-month commitment,{' '}
          <em className="not-italic font-semibold text-ink-900">15% off</em>{' '}
          for 12 months. Both stack on top of the listed tier prices and
          apply for the duration of the commitment term.
        </p>
      </>
    ),
  },
  {
    q: 'What if my needs change mid-engagement?',
    a: (
      <>
        <p>
          You can move up or down a tier with 30 days&rsquo; notice.
          Mid-contract pauses aren&rsquo;t standard but we handle them
          case-by-case &mdash; usually a one-month skip without losing
          the commitment discount.
        </p>
      </>
    ),
  },
  {
    q: 'Do you write in languages other than English?',
    a: (
      <>
        <p>
          English (US + UK) and Spanish are standard at every tier. Other
          languages run through vetted translation partners we&rsquo;ve
          worked with before &mdash; pricing varies by language and we
          quote it transparently.
        </p>
      </>
    ),
  },
  {
    q: 'Can we see samples before committing?',
    a: (
      <>
        <p>
          Yes. Once we identify your vertical we share 2&ndash;3
          representative samples from that domain, plus client references
          on request. The trial tier exists for buyers who want a real
          sample written for their site before committing to a retainer.
        </p>
      </>
    ),
  },
  {
    q: 'How does this compare to hiring a freelancer?',
    a: (
      <>
        <p>
          Freelancers ship words. Packages ship a content programme &mdash;
          topic research, internal linking, schema, AIO tracking, editorial
          style guide, monthly reporting. If you only need words and you
          already own the strategy layer, a freelancer is cheaper. If the
          strategy layer is what&rsquo;s missing, a package is the answer.
        </p>
      </>
    ),
  },
  {
    q: 'What’s the minimum term?',
    a: (
      <>
        <p>
          Three months on the monthly tiers. Below that the topic-research
          and onboarding work doesn&rsquo;t amortise &mdash; you&rsquo;d be
          paying retail for the setup. The trial tier exists precisely so
          you don&rsquo;t need a three-month commitment to test the work.
        </p>
      </>
    ),
  },
]

export default function ContentPackagesPage() {
  return (
    <>
      <JsonLd
        data={productWithOffersSchema({
          productName: 'Website Content Writing Packages',
          productDescription:
            'Fixed-price content writing packages ranging from $500 per article to $15,000 per month. SEO-led, senior writers, no offshoring.',
          url: 'https://salesolution.net/services/website-content-writing-packages/',
          tiers: PACKAGE_TIERS,
        })}
      />

      <ServicesHero
        eyebrow="Services / Content packages"
        title="Five packages."
        titleAccent="Real prices. No surprises."
        lede={
          <>
            Fixed-scope content writing programmes for industrial and
            technical e&#8209;commerce. Senior writers, SEO and GEO baked
            in, deliverables written down. Volume earns discounts &mdash;
            5% over 6 months, 15% over 12.
          </>
        }
        primaryCta={{ label: 'Request a quote', href: '/book-growth-call/' }}
        secondaryCta={{ label: 'See the tiers', href: '#packages' }}
        anchors={[
          { label: 'Why fixed packages', href: '#why' },
          { label: 'Packages', href: '#packages' },
          { label: 'Included in every tier', href: '#included' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />

      <WhyFixedPackages id="why" />
      <PackagesGrid id="packages" />
      <WhatsIncluded id="included" />

      <FAQ
        id="faq"
        eyebrow="Pricing & packages"
        headline={
          <>
            Questions before you{' '}
            <span className="text-ink-500">pick a tier.</span>
          </>
        }
        kicker="The pricing-shaped questions buyers send before the first call."
        items={PACKAGES_FAQ}
      />

      <FinalCTARail />
    </>
  )
}
