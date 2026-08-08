import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { AfterCall } from '@/components/sections/book-call/AfterCall'
import { BookCallHero } from '@/components/sections/book-call/BookCallHero'
import { OnTheCall } from '@/components/sections/book-call/OnTheCall'
import { WhoBooks } from '@/components/sections/book-call/WhoBooks'

export const metadata: Metadata = {
  title: 'Book Your Growth Strategy Call · Revenue Roadmap Session',
  description:
    'A senior strategist returns a tailored growth proposal within 24 hours. Scope, timeline, ROI forecast. Free, no obligation.',
  alternates: { canonical: 'https://salesolution.net/book-growth-call/' },
}

const CALL_FAQ: QA[] = [
  {
    q: 'Is the call really 15 minutes?',
    a: (
      <>
        <p>
          Yes &mdash; and we hold to it. If we discover something worth a
          longer conversation, we end the call on time and email you to
          book a second one. Respecting your calendar is the first signal
          of how the engagement will run.
        </p>
      </>
    ),
  },
  {
    q: 'Do I need to prepare anything?',
    a: (
      <>
        <p>
          Three things, no more: 3&ndash;5 of your highest-revenue category
          or product URLs, your rough monthly e-commerce revenue band, and
          the single biggest frustration you&rsquo;d unlock if you could.
          That&rsquo;s it &mdash; no 20-question intake form, no
          access-token requests up front.
        </p>
      </>
    ),
  },
  {
    q: 'Will you try to sell me something on the call?',
    a: (
      <>
        <p>
          No. We don&rsquo;t pitch on the call. The output is the one
          highest-payback change &mdash; yours to ship with or without us.
          If we both think it&rsquo;s a fit, you get a written diagnostic
          within 24h and an SOW within 48h. You decide; we don&rsquo;t
          chase.
        </p>
      </>
    ),
  },
  {
    q: 'Who will I actually be talking to?',
    a: (
      <>
        <p>
          Artur Shepel &mdash; founder and the operator who would run your
          engagement. Not a closer, not a junior strategist, not a partner
          you only meet once. The same person on the call is the same
          person on the proposal and on every monthly outcome review
          afterwards.
        </p>
      </>
    ),
  },
  {
    q: 'What if we\'re too small for a retained engagement?',
    a: (
      <>
        <p>
          We&rsquo;ll tell you on the call, straight. Below $200k/month
          the retainer math usually doesn&rsquo;t hold, and we&rsquo;d
          rather say so than take the engagement. Either way the call ends
          the same: a written SOW for the install &mdash; scope, sequence,
          and your number &mdash; inside 48 hours. If you&rsquo;re under
          the line, a generalist agency serves you better and we&rsquo;ll
          usually point you at one.
        </p>
      </>
    ),
  },
  {
    q: 'Can I bring a colleague to the call?',
    a: (
      <>
        <p>
          Yes &mdash; up to two. Beyond that the conversation thins. If
          you&rsquo;re bringing a head of growth, head of marketing, or
          founder, mention it in the form so we can shape the URLs we walk
          through accordingly.
        </p>
      </>
    ),
  },
  {
    q: 'What if I just want the audit, not a call?',
    a: (
      <>
        <p>
          The{' '}
          <a
            href="/unlock-growth-audit/"
            data-cta="audit__book_call_faq"
            data-cta-location="mid_body"
            className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
          >
            free 15-minute Growth Audit
          </a>{' '}
          gives you a written diagnostic without the call. Slower turnaround
          (24h vs same-day), but no calendar coordination. Submit either
          form &mdash; we&rsquo;ll work with what you send us.
        </p>
      </>
    ),
  },
]

export default function BookGrowthCallPage() {
  return (
    <>
      <BookCallHero />
      <OnTheCall />
      <WhoBooks />
      <AfterCall />
      <FAQ
        eyebrow="Before you book"
        headline={
          <>
            Questions about the call.
          </>
        }
        kicker="Not the service. Not the engagement. Just the 15 minutes themselves."
        items={CALL_FAQ}
      />
      <FinalCTARail />
    </>
  )
}
