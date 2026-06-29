import type { Metadata } from 'next'

import { CroHow } from '@/components/sections/conversion-cro/CroHow'
import { CroLeak } from '@/components/sections/conversion-cro/CroLeak'
import { CroWhereItFits } from '@/components/sections/conversion-cro/CroWhereItFits'
import { FAQ } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { CompositeBar } from '@/components/services/CompositeBar'
import { breadcrumbListSchema, faqPageSchema, serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Conversion & CRO · Turn more of your traffic into booked work',
  description:
    'You do not have a traffic problem. You have a conversion problem. We find where ready buyers drop off, fix the highest-impact step, and close the follow-up gap, so more of the traffic you already pay for turns into booked work.',
  alternates: { canonical: 'https://salesolution.net/services/conversion-cro/' },
}

const CRO_FAQ = [
  {
    q: "Isn't this just web design?",
    a: 'No. Design makes it look good. This makes more people finish, using data on where they actually drop, not taste.',
  },
  {
    q: 'Do you rebuild my whole site?',
    a: 'Usually not. We make targeted fixes to the steps that lose buyers. A full rebuild is Website Development, and we will tell you if you need one.',
  },
  {
    q: 'How do you know what to fix?',
    a: 'We watch where real buyers drop, fix the costliest step, and test the change against the old version.',
  },
  {
    q: 'How fast will I see results?',
    a: 'Some fixes move the number in weeks. Bigger gains compound as we test through the funnel. We track it monthly.',
  },
  {
    q: 'Who is this for?',
    a: 'Any business paying for traffic that lands and leaves: home services, practices, distributors, and DTC stores.',
  },
]

export default function ConversionCroPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Conversion & CRO — turn more of your traffic into booked work',
          slug: 'conversion-cro',
          description:
            'A done-for-you conversion-rate program for businesses paying for traffic that does not convert: funnel and drop-off analysis, fixes to the quote, checkout, and form steps that lose ready buyers, A/B testing, follow-up automation, and a monthly report on what moved.',
          category: 'Digital Marketing',
        })}
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: 'https://salesolution.net/' },
          { name: 'Services', url: 'https://salesolution.net/services/' },
          { name: 'Conversion & CRO', url: 'https://salesolution.net/services/conversion-cro/' },
        ])}
      />
      <JsonLd data={faqPageSchema(CRO_FAQ.map((f) => ({ question: f.q, answer: f.a })))} />

      <CompositeBar weight="hero" />

      <ServicesHero
        eyebrow="Services / Conversion & CRO"
        title="Keep the buyers you already paid to reach."
        titleAccent="Fix the last step, not the funnel."
        lede={
          <>
            Ready buyers land on your site and slip away at the quote, the form,
            the checkout, the follow-up that never comes. The cheapest growth
            isn&rsquo;t more traffic. It&rsquo;s keeping more of the traffic you
            already have. We find where they drop and fix the step that costs you
            most. Built for businesses paying for traffic that does not convert.
          </>
        }
        primaryCta={{ label: 'Book a Growth Call', href: '/book-growth-call/' }}
        secondaryCta={{ label: 'See how it works', href: '#how' }}
        anchors={[
          { label: 'The leak', href: '#leak' },
          { label: 'How it works', href: '#how' },
          { label: 'Where it fits', href: '#engine' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />

      <CroLeak id="leak" />
      <CroHow id="how" />
      <CroWhereItFits id="engine" />

      <FAQ
        id="faq"
        eyebrow="Before you book a call"
        headline={<>Questions on conversion.</>}
        kicker="Whether it's web design. Whether we rebuild. How we pick what to fix. How fast it moves. Who it's for."
        items={CRO_FAQ.map((f) => ({ q: f.q, a: <p>{f.a}</p> }))}
      />

      <FinalCTARail />
    </>
  )
}
