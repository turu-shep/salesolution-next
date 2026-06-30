import type { Metadata } from 'next'
import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { FAQ, type QA } from '@/components/sections/FAQ'
import { PlanByPillar } from '@/components/sections/revenue-engine/PlanByPillar'
import { RevenueHero } from '@/components/sections/revenue-engine/RevenueHero'
import { TwoRevenueLines } from '@/components/sections/revenue-engine/TwoRevenueLines'
import { FlowBlock } from '@/components/sections/revenue-engine/flow-concepts/FlowBlock'
import { Concept2Evidence } from '@/components/sections/revenue-engine/leak-concepts/Concept2Evidence'
import { Concept3Calculator } from '@/components/sections/revenue-engine/leak-concepts/Concept3Calculator'
import { Concept4BeforeAfter } from '@/components/sections/revenue-engine/leak-concepts/Concept4BeforeAfter'
import { LEAK_DATA } from '@/components/sections/revenue-engine/leak-concepts/data'
import { EngagementShapes } from '@/components/sections/services/EngagementShapes'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbListSchema, serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Revenue Engine for Consumer & DTC Brands · Showrooms, retailers, specialty shops',
  description:
    'A done-for-you growth system for consumer and DTC brands. We get you found in search, AI, and Maps, win the buyers who reach you, and sell again to the customers you already have — run as one system, not six vendors. Book a Growth Call.',
  alternates: { canonical: 'https://salesolution.net/industries/consumer-brands/' },
}

const leak = LEAK_DATA['retail']

const CONSUMER_GROUPS = [
  {
    pillar: 'Bring',
    outcome: 'Get found when they’re searching for what you sell',
    steps: [
      {
        key: 'Capture',
        what: 'A tidied-up Google and Maps listing, location and product pages built to show up in search and AI for what you sell, and a simple way to buy or ask — all yours, running alongside your store.',
        metric: 'More of the right searches find you first',
      },
    ],
  },
  {
    pillar: 'Convert',
    outcome: 'Win the ones who reach you',
    steps: [
      {
        key: 'Respond',
        what: 'Every call, text, DM, and form answered fast, even after close. A missed message gets an instant reply, so the buyer doesn’t move on to the next brand.',
        metric: 'No interested buyer left waiting',
      },
      {
        key: 'Book',
        what: 'The path from interested to bought, tightened: visits and consults booked, carts and quotes recovered, and the follow-up that closes the sale. Every order logged, in store or online.',
        metric: 'More interest turns into a sale',
      },
    ],
  },
  {
    pillar: 'Retain',
    outcome: 'Sell to them again',
    steps: [
      {
        key: 'Recover',
        what: 'The shoppers who looked and left get brought back, and the customers you already have get sold to again — win-back offers, new-arrival emails, referral asks, and a steady stream of reviews that lifts you in search.',
        metric: 'Repeat revenue from customers you already won',
      },
    ],
  },
]

const CONSUMER_PROVE = {
  key: 'Prove',
  what: 'A record of every lead and sale the system touched, and a monthly dashboard that shows what it brought in — on its own line, separate from your ads.',
  metric: 'What the system earned, against the fee',
}

const CONSUMER_FAQ: QA[] = [
  {
    q: 'Do I need a new website?',
    a: (
      <p>
        No. The pages and follow-up run alongside your existing store. We
        don&rsquo;t touch your domain or make you rebuild &mdash; the engine
        bolts on to what you already have.
      </p>
    ),
  },
  {
    q: 'I sell in a store and online. Does this cover both?',
    a: (
      <p>
        Yes. The system brings searchers to the store and the site, catches the
        ones who would have left, and follows up by text and email either way.
        Whichever channel they buy in, it gets logged.
      </p>
    ),
  },
  {
    q: 'How is it priced?',
    a: (
      <p>
        Published, in full. A Sprint to install one part and hand it over, an
        Operator Retainer to run a few parts directly, or Full Growth Ownership
        for the whole engine. You see the model before we ever talk &mdash;
        there&rsquo;s no guarantee on a count of sales, because the price is in
        the open instead.
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

export default function ConsumerBrandsPillarPage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Revenue Engine for Consumer & DTC Brands',
          url: 'https://salesolution.net/industries/consumer-brands/',
          description:
            'A done-for-you AI growth system for consumer and DTC brands and local retailers: search and AI visibility, fast reply to calls and forms, cart and visit recovery, repeat-customer follow-up, and attribution.',
          category: 'Marketing',
        })}
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: 'https://salesolution.net/' },
          { name: 'Industries', url: 'https://salesolution.net/industries/' },
          { name: 'Consumer & DTC brands', url: 'https://salesolution.net/industries/consumer-brands/' },
        ])}
      />

      <div className="h-1.5 w-full bg-brand-600" aria-hidden />

      {/* 1 — HOOK */}
      <RevenueHero
        eyebrow={'For showrooms, retailers & specialty brands'}
        title="Built for the brand"
        titleAccent="buyers can’t find, and don’t come back to."
        lede={
          <>
            Someone searches for what you sell, and Google hands them a
            competitor. The shopper who browsed once never comes back. The
            customer who bought last year forgot you exist. Each one is a sale
            you already earned, walking to someone else.
          </>
        }
        primaryCta={{ label: 'Book a Growth Call', href: '/book-growth-call/' }}
        founder={{
          name: 'Artur Shepel',
          src: '/artur-shepel-480.webp',
          caption: 'One operator runs your account.',
          specs: [
            { label: 'Setup', value: '90 days, one-time fee' },
            { label: 'Pricing', value: 'published, in full' },
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

      {/* 2 — THE LEAK: three places you lose the sale */}
      <div id="leak">
        <Concept2Evidence
          data={leak}
          header={{
            eyebrow: "The brand's leak",
            headlineA: 'Three places you lose the sale.',
            headlineB: 'Most brands only fix one.',
            intro:
              'Before they find you, when they look and leave, and after they buy once. The leak is bigger than the storefront.',
            closer: 'Every one of these is a customer you already earned, handed to someone else.',
          }}
        />
      </div>

      {/* 3 — QUANTIFY YOUR LEAK */}
      <Concept3Calculator
        data={leak}
        header={{
          eyebrow: 'Your leak, in dollars',
          headlineA: 'Put a number on it.',
          headlineB: 'Your number, not ours.',
          intro: 'Three figures from your own numbers. The math is in the open — change them.',
          closer: '',
        }}
      />

      {/* 4 — THE FIX: one system, not six vendors */}
      <div id="flow">
        <FlowBlock />
      </div>

      {/* 5 — THE PLAN: the five steps grouped under Bring / Convert / Retain */}
      <PlanByPillar id="how" groups={CONSUMER_GROUPS} prove={CONSUMER_PROVE} />

      {/* 6 — THE DIFFERENCE: same shopper, two endings */}
      <Concept4BeforeAfter
        data={leak}
        header={{
          eyebrow: 'The difference',
          headlineA: 'Same shopper.',
          headlineB: 'Two endings.',
          intro: 'One shopper, one search. The only thing that changes is whether you show up and follow up.',
          closer: '',
        }}
      />

      {/* 7 — HOW WE REPORT IT (dark) */}
      <TwoRevenueLines id="prove" />

      {/* 8 — THE PRICE (sell-product: published bands, no guarantee) */}
      <EngagementShapes id="pricing" />

      {/* 9 — FAQ */}
      <FAQ
        id="faq"
        eyebrow="A few last questions"
        headline={<>Questions before the call.</>}
        kicker="New website, in-store and online, how it's priced, time to start. Straight answers."
        items={CONSUMER_FAQ}
      />

      {/* 10 — CLOSE (single sell-product door) */}
      <SectionRail tone="dark" size="lg">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
            One system, not six vendors
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-6xl">
            We build the engine. You sell more.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
            Tell us your numbers and we&rsquo;ll show you where your brand is
            leaking sales, and what the engine would fix first. No deck, no
            pressure.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/book-growth-call/"
              data-cta="book_call__consumer_pillar_close"
              data-cta-location="final_rail"
              className="inline-flex items-center justify-center rounded-[4px] bg-white px-6 py-3 text-sm font-semibold text-ink-900 transition-colors duration-200 hover:bg-paper"
            >
              Book a Growth Call
            </Link>
            <Link
              href="/services/"
              data-cta="services__consumer_pillar_close"
              data-cta-location="final_rail"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/85 underline decoration-white/20 underline-offset-[6px] transition-colors duration-200 hover:text-white hover:decoration-white"
            >
              Or see the cylinders we install
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </SectionRail>
    </>
  )
}
