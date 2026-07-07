import type { Metadata } from 'next'

import { FAQ } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { LocalSeoHow } from '@/components/sections/local-seo/LocalSeoHow'
import { LocalSeoLeak } from '@/components/sections/local-seo/LocalSeoLeak'
import { LocalSeoWhereItFits } from '@/components/sections/local-seo/LocalSeoWhereItFits'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { CompositeBar } from '@/components/services/CompositeBar'
import { breadcrumbListSchema, faqPageSchema, serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Local SEO & Maps · Rank in the Google map pack and “near me” search',
  description:
    'Show up first when nearby customers search. Local SEO & Maps optimizes your Google Business Profile, builds local landing pages, and wins the reviews that put you in the map pack. For home services, practices, and local shops.',
  alternates: { canonical: 'https://salesolution.net/services/local-seo-maps/' },
}

const LOCAL_SEO_FAQ = [
  {
    q: 'How is this different from regular SEO?',
    a: 'Regular SEO chases the blue links below the map. Local SEO is about the map itself: the three-business pack, “near me” searches, and your Google Business Profile. Different ranking signals, different page, a different buyer who is ready to call now.',
  },
  {
    q: 'How long until I show up in the map pack?',
    a: 'Honest answer: profile and citation fixes can move you within a few weeks. A competitive area, or one where you are starting with few reviews, takes a few months of steady work. We track your map position monthly so you can see it move.',
  },
  {
    q: 'Do I need a Google Business Profile?',
    a: 'Yes, it is the core of all of this. If you already have one, we optimize it. If you do not, we set it up correctly from the start, which is half the battle.',
  },
  {
    q: 'What about reviews? Do you write them?',
    a: 'Never. We make asking easy and automatic after real jobs, so real customers leave real reviews. Fake reviews break Google’s rules, risk your listing, and read as fake to buyers anyway.',
  },
  {
    q: 'Does this work if I cover several towns or a whole service area?',
    a: 'Yes. Service-area pages plus the right Google Business Profile settings are exactly how you rank beyond your home city, in every town you actually serve.',
  },
  {
    q: 'Who is this for?',
    a: 'Local businesses that win customers from their area: home services like roofing, HVAC, and plumbing, dental and medical practices, and local shops. If “near me” searches should be finding you, this is for you.',
  },
]

export default function LocalSeoMapsPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Local SEO & Maps — Google Business Profile, map pack, and local search',
          slug: 'local-seo-maps',
          description:
            'A done-for-you local search service that wins the Google map pack: Google Business Profile optimization, local and service-area landing pages, automated review generation, and citation cleanup, tracked monthly. For home services, practices, and local retail.',
          category: 'Digital Marketing',
        })}
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: 'https://salesolution.net/' },
          { name: 'Services', url: 'https://salesolution.net/services/' },
          { name: 'Local SEO & Maps', url: 'https://salesolution.net/services/local-seo-maps/' },
        ])}
      />
      <JsonLd data={faqPageSchema(LOCAL_SEO_FAQ.map((f) => ({ question: f.q, answer: f.a })))} />

      <CompositeBar weight="hero" />

      <ServicesHero
        eyebrow="Services / Local SEO & Maps"
        title="Be the first name they find nearby."
        titleAccent="Top of the map, not page two."
        lede={
          <>
            When someone nearby searches for what you do, Google shows a map with
            three businesses and their reviews. Local SEO &amp; Maps gets you into
            that pack and keeps you there, so the customers already looking in your
            area find you first. Built for home services, practices, and local shops
            that win work from their own backyard.
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

      <LocalSeoLeak id="leak" />
      <LocalSeoHow id="how" />
      <LocalSeoWhereItFits id="engine" />

      <FAQ
        id="faq"
        eyebrow="Before you book a call"
        headline={<>Questions on local search.</>}
        kicker="How it differs from regular SEO. How fast it moves. Reviews, service areas, and who it's for."
        items={LOCAL_SEO_FAQ.map((f) => ({ q: f.q, a: <p>{f.a}</p> }))}
      />

      <FinalCTARail />
    </>
  )
}
