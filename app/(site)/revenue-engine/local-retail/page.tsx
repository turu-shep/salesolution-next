import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { AuditCTA } from '@/components/sections/revenue-engine/AuditCTA'
import { Guarantee } from '@/components/sections/revenue-engine/Guarantee'
import { PlanByPillar } from '@/components/sections/revenue-engine/PlanByPillar'
import { RevenueHero } from '@/components/sections/revenue-engine/RevenueHero'
import { RevenuePricing } from '@/components/sections/revenue-engine/RevenuePricing'
import { TheLeak, type Leak } from '@/components/sections/revenue-engine/TheLeak'
import { TwoRevenueLines } from '@/components/sections/revenue-engine/TwoRevenueLines'
import { FlowBlock } from '@/components/sections/revenue-engine/flow-concepts/FlowBlock'
import { JsonLd } from '@/components/seo/JsonLd'
import { serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Revenue Engine for Local Retail · Showrooms, brands, specialty shops',
  description:
    'A done-for-you system for showrooms and local brands. It gets you found in Maps and AI for your area, brings back the shoppers who looked and left, and sells again to the customers you already won — then proves the revenue. Book a free Revenue Leak Audit.',
  alternates: { canonical: 'https://salesolution.net/revenue-engine/local-retail/' },
}

const RETAIL_LEAKS: Leak[] = [
  {
    n: '01',
    stat: 'The top 3',
    label: 'results take most of the local clicks',
    body: 'When someone nearby searches, or asks AI who sells this near me, a few names get the visits and the calls. If you are not one of them, you never knew the customer was looking.',
    source: null,
  },
  {
    n: '02',
    stat: 'Most',
    label: 'first-time visitors leave without buying',
    body: 'They found you, looked, and left to compare. With no way to follow them, that interest is gone, and you paid to earn it once already.',
    source: null,
  },
  {
    n: '03',
    stat: 'Your cheapest sale',
    label: 'is to a customer you already have',
    body: 'The people who already bought are the likeliest to buy again and the cheapest to reach. Most shops never ask: no second offer, no win-back, no reason to return. The list just sits there.',
    source: null,
  },
]

const RETAIL_GROUPS = [
  {
    pillar: 'Bring',
    outcome: 'Get found when they’re searching nearby',
    steps: [
      {
        key: 'Capture',
        what: 'A tidied-up Google and Maps listing, location and product pages built to show up for “near me” searches, and a simple way to ask or book — all yours, running alongside your site.',
        metric: 'More local searchers find you first',
      },
    ],
  },
  {
    pillar: 'Convert',
    outcome: 'Win the ones who reach you',
    steps: [
      {
        key: 'Respond',
        what: 'Every call, text, DM, and form answered fast, even after close. A missed call gets an instant text back, so the shopper doesn’t move on to the next shop.',
        metric: 'No interested buyer left waiting',
      },
      {
        key: 'Book',
        what: 'Visits, consults, and appointments booked straight to your calendar with reminders so they show, and walk-ins logged so you know who came in.',
        metric: 'More interest turns into a sale',
      },
    ],
  },
  {
    pillar: 'Retain',
    outcome: 'Bring them back',
    steps: [
      {
        key: 'Recover',
        what: 'The shoppers who looked and left get brought back, and the customers you already have get sold to again — win-back offers, new-arrival emails, referral asks, and a steady stream of reviews that lifts you in local search.',
        metric: 'Repeat revenue from customers you already won',
      },
    ],
  },
]

const RETAIL_PROVE = {
  key: 'Prove',
  what: 'A record of every lead and sale the system touched, and a monthly dashboard that shows what it brought in — on its own line, separate from your ads.',
  metric: 'What the system earned, against the fee',
}

const RETAIL_FAQ: QA[] = [
  {
    q: 'Do I need a new website?',
    a: (
      <p>
        No. The location pages and booking run alongside your existing site. I
        don&rsquo;t touch your domain or make you rebuild &mdash; the engine
        bolts on to what you already have.
      </p>
    ),
  },
  {
    q: 'I sell in a store and online. Does this cover both?',
    a: (
      <p>
        Yes. The system brings local searchers to the store and the site,
        catches the ones who would have left, and follows up by text and email
        either way. Whichever channel they buy in, it gets logged.
      </p>
    ),
  },
  {
    q: 'Will this work in a competitive city?',
    a: (
      <p>
        That is where it pays off most. The top few local results take most of
        the clicks. The work is getting you into them, then converting the
        shoppers your ads already brought in.
      </p>
    ),
  },
  {
    q: 'How fast can we start?',
    a: (
      <p>
        The full system installs over 90 days, but the first pieces &mdash; the
        tidied listing and instant reply to calls and forms &mdash; are live
        within the first couple of weeks.
      </p>
    ),
  },
]

export default function LocalRetailRevenueEnginePage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Revenue Engine for Local Retail',
          url: 'https://salesolution.net/revenue-engine/local-retail/',
          description:
            'A done-for-you AI revenue system for showrooms and local brands: local and AI search visibility, fast reply to calls and forms, retargeting, repeat-customer follow-up, and attribution.',
          category: 'Marketing',
        })}
      />

      <div className="h-1.5 w-full bg-brand-600" aria-hidden />

      {/* 1 — HOOK */}
      <RevenueHero
        eyebrow={'For showrooms, brands & specialty shops'}
        title="Built for the local shop"
        titleAccent="nobody nearby can find online."
        lede={
          <>
            Someone three blocks away searches for what you sell, and Google
            hands them a competitor. The shopper who browsed once never comes
            back. The customer who bought last year forgot you exist. Each one
            is a sale you already earned, walking to someone else.
          </>
        }
        primaryCta={{ label: 'Book a Revenue Leak Audit', href: '#audit' }}
        founder={{
          name: 'Artur Shepel',
          src: '/artur-shepel.jpg',
          caption: 'I run every account myself.',
          specs: [
            { label: 'Setup', value: '90 days, on me' },
            { label: 'Minimum', value: '3 months' },
            { label: 'Lock-in', value: 'none' },
          ],
        }}
        anchors={[
          { label: 'The leak', href: '#leak' },
          { label: 'The plan', href: '#how' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />

      {/* 2 — THE LEAK */}
      <TheLeak
        id="leak"
        eyebrow="The local shop's leak"
        headline={
          <>
            They&rsquo;re searching for you.{' '}
            <span className="text-ink-500">They&rsquo;re finding someone else.</span>
          </>
        }
        intro={
          <>
            Most of what a local shop could earn never shows up as a sale. It
            leaks in three places, and almost nobody plugs them.
          </>
        }
        leaks={RETAIL_LEAKS}
        closer={<>Every one of these is a customer you already earned, handed to someone else.</>}
      />

      {/* 3 — THE FIX: "you've been sold pieces / I run the whole flow" */}
      <div id="flow">
        <FlowBlock />
      </div>

      {/* 4 — THE PLAN: the five steps grouped under Bring / Convert / Retain */}
      <PlanByPillar id="how" groups={RETAIL_GROUPS} prove={RETAIL_PROVE} />

      {/* 5 — HOW I REPORT IT (dark) — closer hands into the guarantee */}
      <TwoRevenueLines id="prove" />

      {/* 6 — GUARANTEE (dark, abutted to the report as one conviction field) */}
      <Guarantee id="guarantee" abut />

      {/* 7 — OFFER (the price, now that the risk is reversed) */}
      <RevenuePricing id="pricing" />

      {/* 7 — FAQ */}
      <FAQ
        id="faq"
        eyebrow="A few last questions"
        headline={
          <>
            Questions <span className="text-ink-500">before the audit.</span>
          </>
        }
        kicker="New website, in-store and online, competitive cities, time to start. Straight answers."
        items={RETAIL_FAQ}
      />

      {/* 8 — FREE-AUDIT CLOSE */}
      <AuditCTA id="audit" />
    </>
  )
}
