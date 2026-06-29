import type { Metadata } from 'next'

import { AnswerBookHow } from '@/components/sections/answer-and-book/AnswerBookHow'
import { AnswerBookLeak } from '@/components/sections/answer-and-book/AnswerBookLeak'
import { AnswerBookWhereItFits } from '@/components/sections/answer-and-book/AnswerBookWhereItFits'
import { FAQ } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { CompositeBar } from '@/components/services/CompositeBar'
import { breadcrumbListSchema, faqPageSchema, serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Answer & Book · 24/7 call answering, missed-call text-back, online booking',
  description:
    'Never lose a job to a missed call or a slow reply. Answer & Book picks up every call around the clock, texts back the ones that slip in seconds, and books qualified leads straight onto your calendar. For home services, dental, and any business that books work.',
  alternates: { canonical: 'https://salesolution.net/services/answer-and-book/' },
}

const ANSWER_BOOK_FAQ = [
  {
    q: 'Is this a real person or a bot?',
    a: 'Both, used where each is best. Live calls are answered by trained people who sound like your front desk. The instant text-back and the booking run automatically, so they happen in seconds, day or night. A caller can always reach a human.',
  },
  {
    q: 'Does it cover after hours and weekends?',
    a: 'Yes, and that is the whole point. The 9pm lead and the Saturday call are exactly the ones that book with whoever answers first, so the system runs around the clock.',
  },
  {
    q: 'Will it book straight into my calendar?',
    a: 'Yes. Qualified leads land on the calendar your team already uses, with the job details your crew needs, plus reminders so the work actually shows up.',
  },
  {
    q: 'What happens to a call you cannot book on the spot?',
    a: 'It does not disappear. The caller gets an instant text, the lead is logged with a transcript, and it is queued for follow-up so nothing slips between the cracks.',
  },
  {
    q: 'Who is this for?',
    a: 'Any business that wins work by booking a call or an appointment: home services like roofing, HVAC, and plumbing, and practices like dental and medical. If a missed call is a missed job, this is for you.',
  },
  {
    q: 'Can I run it without the rest of the engine?',
    a: 'Yes. Answer & Book works on its own. It just compounds when it sits next to the cylinders that drive the calls in and chase the ones that go cold.',
  },
]

export default function AnswerAndBookPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Answer & Book — 24/7 call answering, missed-call text-back, and online booking',
          slug: 'answer-and-book',
          description:
            'A done-for-you speed-to-lead system for businesses that book work: every call answered live around the clock, missed calls texted back within seconds, and qualified leads booked straight onto the calendar with reminders, recordings, and transcripts.',
          category: 'Digital Marketing',
        })}
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: 'https://salesolution.net/' },
          { name: 'Services', url: 'https://salesolution.net/services/' },
          { name: 'Answer & Book', url: 'https://salesolution.net/services/answer-and-book/' },
        ])}
      />
      <JsonLd data={faqPageSchema(ANSWER_BOOK_FAQ.map((f) => ({ question: f.q, answer: f.a })))} />

      <CompositeBar weight="hero" />

      <ServicesHero
        eyebrow="Services / Answer & Book"
        title="Answer every call. Book the job."
        titleAccent="Even the 9pm ones."
        lede={
          <>
            The call comes while you&rsquo;re on a roof or with a patient. The web
            lead lands after hours. Whoever replies first books the work, and right
            now that isn&rsquo;t always you. Answer &amp; Book picks up every call,
            texts back the misses in seconds, and books real leads onto your
            calendar. Built for home services and dental practices that win work by
            phone.
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

      <AnswerBookLeak id="leak" />
      <AnswerBookHow id="how" />
      <AnswerBookWhereItFits id="engine" />

      <FAQ
        id="faq"
        eyebrow="Before you book a call"
        headline={<>Questions on speed-to-lead.</>}
        kicker="Real people or a bot. After-hours coverage. Where the leads land. Who it's for."
        items={ANSWER_BOOK_FAQ.map((f) => ({ q: f.q, a: <p>{f.a}</p> }))}
      />

      <FinalCTARail />
    </>
  )
}
