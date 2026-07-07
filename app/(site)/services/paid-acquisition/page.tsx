import type { Metadata } from 'next'

import { FAQ } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { PaidAcqHow } from '@/components/sections/paid-acquisition/PaidAcqHow'
import { PaidAcqLeak } from '@/components/sections/paid-acquisition/PaidAcqLeak'
import { PaidAcqWhereItFits } from '@/components/sections/paid-acquisition/PaidAcqWhereItFits'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { CompositeBar } from '@/components/services/CompositeBar'
import { breadcrumbListSchema, faqPageSchema, serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Paid Acquisition · Google & Meta ads on your own account, at cost',
  description:
    'Paid search and social run on your own ad account, at cost, with zero markup. Every dollar judged on one number: cost per booked job, not clicks. For home services, practices, and distributors.',
  alternates: { canonical: 'https://salesolution.net/services/paid-acquisition/' },
}

const PAID_ACQ_FAQ = [
  {
    q: 'Do you mark up my ad spend?',
    a: 'No. Zero markup. You pay the platforms directly from your own account, and you see every dollar that goes out.',
  },
  {
    q: 'Who owns the ad account?',
    a: 'You, always. We build in your account, so nothing walks out the door if we part ways. The campaigns, the data, and the history stay with you.',
  },
  {
    q: 'Google, Meta, or both?',
    a: 'Whichever your buyers actually use. Often Google for high-intent search and Meta for local awareness. We start where the booked jobs are cheapest and grow from there.',
  },
  {
    q: 'Is there a minimum ad budget?',
    a: 'It only makes sense once there’s enough spend to learn from. If you’re below that, we will tell you honestly on the first call instead of taking the work.',
  },
  {
    q: 'How do you measure success?',
    a: 'Cost per booked job. Not impressions, clicks, or cost per lead. The dollars in against the jobs out.',
  },
  {
    q: 'Who is this for?',
    a: 'Home services, practices, and distributors that want ad spend they can see and own.',
  },
]

export default function PaidAcquisitionPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Paid Acquisition — Google & Meta ads on your own account, at cost',
          slug: 'paid-acquisition',
          description:
            'Done-for-you paid search and social run inside your own Google and Meta accounts, at cost with zero markup. Keyword and audience research, ad creative, landing-page alignment, and cost-per-booked-job tracking, all judged on the dollars in against the jobs out.',
          category: 'Digital Marketing',
        })}
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: 'https://salesolution.net/' },
          { name: 'Services', url: 'https://salesolution.net/services/' },
          { name: 'Paid Acquisition', url: 'https://salesolution.net/services/paid-acquisition/' },
        ])}
      />
      <JsonLd data={faqPageSchema(PAID_ACQ_FAQ.map((f) => ({ question: f.q, answer: f.a })))} />

      <CompositeBar weight="hero" />

      <ServicesHero
        eyebrow="Services / Paid Acquisition"
        title="Ad spend that books real jobs."
        titleAccent="Your account. At cost. No markup."
        lede={
          <>
            You&rsquo;ve been burned by agencies that mark up your ad spend, lock
            you out of the account, and report clicks while you wonder where the
            jobs went. We run Google and Meta in your own account at cost, and
            judge every dollar on one number: cost per booked job. Built for home
            services, practices, and distributors that want spend they can see.
          </>
        }
        primaryCta={{ label: 'Book a Revenue Leak Audit', href: '/industries/home-services/#audit' }}
        secondaryCta={{ label: 'Book a Growth Call', href: '/book-growth-call/' }}
        anchors={[
          { label: 'The leak', href: '#leak' },
          { label: 'How it works', href: '#how' },
          { label: 'Where it fits', href: '#engine' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />

      <PaidAcqLeak id="leak" />
      <PaidAcqHow id="how" />
      <PaidAcqWhereItFits id="engine" />

      <FAQ
        id="faq"
        eyebrow="Before you book a call"
        headline={<>Questions on paid spend.</>}
        kicker="Markup. Who owns the account. Which platform. Minimum budget. How we measure it."
        items={PAID_ACQ_FAQ.map((f) => ({ q: f.q, a: <p>{f.a}</p> }))}
      />

      <FinalCTARail />
    </>
  )
}
