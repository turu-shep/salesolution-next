import type { Metadata } from 'next'

import { RecoverHow } from '@/components/sections/recover-reactivate/RecoverHow'
import { RecoverLeak } from '@/components/sections/recover-reactivate/RecoverLeak'
import { RecoverWhereItFits } from '@/components/sections/recover-reactivate/RecoverWhereItFits'
import { FAQ } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { CompositeBar } from '@/components/services/CompositeBar'
import { breadcrumbListSchema, faqPageSchema, serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Recover & Reactivate · Chase cold quotes, win back dormant customers',
  description:
    'The cheapest revenue you have is the quote that went cold and the customer who has not called in a year. We chase both, automatically, so the work you already earned does not sit there going quiet.',
  alternates: { canonical: 'https://salesolution.net/services/recover-reactivate/' },
}

const RECOVER_FAQ = [
  {
    q: 'Is this just spam to my list?',
    a: 'No. It is paced, relevant, and sent with a real reason to get back in touch. The goal is a booked job, not an unsubscribe.',
  },
  {
    q: 'What if my list is old or messy?',
    a: 'We clean and segment it first. A messy list is normal, and sorting it out is part of the work, not a thing you have to fix before you start.',
  },
  {
    q: 'Will it annoy my customers?',
    a: 'Pacing and opt-outs are respected. Done right, a well-timed reminder reads as service, not nagging.',
  },
  {
    q: 'How much can I expect to win back?',
    a: 'It depends on the size and quality of your list, so we will not promise a number. We will show you what comes back, monthly.',
  },
  {
    q: 'Who is this for?',
    a: 'Any business with a backlog of quotes or a list of past customers: home services, practices, and shops.',
  },
]

export default function RecoverReactivatePage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Recover & Reactivate — chase cold quotes and win back dormant customers',
          slug: 'recover-reactivate',
          description:
            'A done-for-you reactivation system that chases the estimates that went quiet with paced follow-up and wakes your dormant customer list with reminders, seasonal nudges, and win-back offers, segmented so the right message reaches the right buyer and the revived revenue lands as a booked job.',
          category: 'Digital Marketing',
        })}
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: 'https://salesolution.net/' },
          { name: 'Services', url: 'https://salesolution.net/services/' },
          { name: 'Recover & Reactivate', url: 'https://salesolution.net/services/recover-reactivate/' },
        ])}
      />
      <JsonLd data={faqPageSchema(RECOVER_FAQ.map((f) => ({ question: f.q, answer: f.a })))} />

      <CompositeBar weight="hero" />

      <ServicesHero
        eyebrow="Services / Recover & Reactivate"
        title="Win back the revenue you already earned."
        titleAccent="Cold quotes and quiet customers, chased."
        lede={
          <>
            You quoted the job and never followed up. The customer you delighted
            two years ago forgot you exist. That is the warmest, cheapest demand
            you will ever get, and right now nobody is working it. We do,
            automatically. Built for businesses sitting on a list of past
            customers and unclosed quotes.
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

      <RecoverLeak id="leak" />
      <RecoverHow id="how" />
      <RecoverWhereItFits id="engine" />

      <FAQ
        id="faq"
        eyebrow="Before you book a call"
        headline={<>Questions on working your list.</>}
        kicker="Spam or service. Old, messy lists. How much comes back. Who it's for."
        items={RECOVER_FAQ.map((f) => ({ q: f.q, a: <p>{f.a}</p> }))}
      />

      <FinalCTARail />
    </>
  )
}
