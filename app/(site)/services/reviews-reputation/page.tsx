import type { Metadata } from 'next'

import { FAQ } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { ReviewsHow } from '@/components/sections/reviews-reputation/ReviewsHow'
import { ReviewsLeak } from '@/components/sections/reviews-reputation/ReviewsLeak'
import { ReviewsWhereItFits } from '@/components/sections/reviews-reputation/ReviewsWhereItFits'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { CompositeBar } from '@/components/services/CompositeBar'
import { breadcrumbListSchema, faqPageSchema, serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Reviews & Reputation · A steady stream of real customer reviews',
  description:
    'Your happiest customers would vouch for you. They just never get asked. We make the ask automatic after every job, so real reviews stack up, close the next buyer, and lift you in local search.',
  alternates: { canonical: 'https://salesolution.net/services/reviews-reputation/' },
}

const REVIEWS_FAQ = [
  {
    q: 'Do you write or buy reviews?',
    a: 'Never. Real reviews from real customers, only. Fake ones break Google’s rules, put your listing at risk, and read as fake to buyers anyway.',
  },
  {
    q: 'How do you actually get more?',
    a: 'We make asking automatic and effortless, right after the job when the customer is happiest. Most businesses simply never ask, so the reviews never get written.',
  },
  {
    q: 'What about bad reviews?',
    a: 'We catch unhappy customers early and handle it, and we respond to the public ones. A handful of honest replies builds more trust than a wall of five stars.',
  },
  {
    q: 'Which platforms?',
    a: 'Google first, because it also lifts your local ranking, then the ones that matter for your trade.',
  },
  {
    q: 'Who is this for?',
    a: 'Any business that wins on trust and local search: home services, dental and medical practices, and local shops.',
  },
]

export default function ReviewsReputationPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Reviews & Reputation — a steady stream of real customer reviews',
          slug: 'reviews-reputation',
          description:
            'A done-for-you review system that asks every happy customer automatically after the job, routes them one-tap to Google first and the platforms that matter for the trade, and monitors and replies to every review. Real reviews only, never written or bought.',
          category: 'Digital Marketing',
        })}
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: 'https://salesolution.net/' },
          { name: 'Services', url: 'https://salesolution.net/services/' },
          { name: 'Reviews & Reputation', url: 'https://salesolution.net/services/reviews-reputation/' },
        ])}
      />
      <JsonLd data={faqPageSchema(REVIEWS_FAQ.map((f) => ({ question: f.q, answer: f.a })))} />

      <CompositeBar weight="hero" />

      <ServicesHero
        eyebrow="Services / Reviews & Reputation"
        title="Make your reviews do the selling."
        titleAccent="Real ones, after every job."
        lede={
          <>
            The buyer deciding between you and the next name checks the reviews
            first. Your happiest customers would vouch for you. They just never
            get asked. We make the ask automatic after every job, so reviews
            stack up instead of staying in people&rsquo;s heads. Built for
            businesses whose reputation should be doing more of the selling.
          </>
        }
        primaryCta={{ label: 'Book a Revenue Leak Audit', href: '/industries/home-services/#audit' }}
        secondaryCta={{ label: 'See how it works', href: '#how' }}
        anchors={[
          { label: 'The leak', href: '#leak' },
          { label: 'How it works', href: '#how' },
          { label: 'Where it fits', href: '#engine' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />

      <ReviewsLeak id="leak" />
      <ReviewsHow id="how" />
      <ReviewsWhereItFits id="engine" />

      <FAQ
        id="faq"
        eyebrow="Before you book a call"
        headline={<>Questions on reviews.</>}
        kicker="Whether we write them (we don't). How we get more. Bad reviews. Which platforms. Who it's for."
        items={REVIEWS_FAQ.map((f) => ({ q: f.q, a: <p>{f.a}</p> }))}
      />

      <FinalCTARail />
    </>
  )
}
