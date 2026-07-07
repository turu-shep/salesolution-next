import type { Metadata } from 'next'
import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { FAQ, type QA } from '@/components/sections/FAQ'
import { PlanByPillar } from '@/components/sections/revenue-engine/PlanByPillar'
import { RevenueHero } from '@/components/sections/revenue-engine/RevenueHero'
import { TwoRevenueLines } from '@/components/sections/revenue-engine/TwoRevenueLines'
import { FlowBlock } from '@/components/sections/revenue-engine/flow-concepts/FlowBlock'
import { Concept2Evidence } from '@/components/sections/revenue-engine/leak-concepts/Concept2Evidence'
import { Concept4BeforeAfter } from '@/components/sections/revenue-engine/leak-concepts/Concept4BeforeAfter'
import { LEAK_DATA } from '@/components/sections/revenue-engine/leak-concepts/data'
import {
  WholeFlowLeak,
  type FieldSet,
  type LeakHeading,
  type Preset,
} from '@/components/sections/revenue-engine/WholeFlowLeak'
import { EngagementShapes } from '@/components/sections/services/EngagementShapes'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbListSchema, serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Revenue Engine for Consumer & DTC Brands · Showrooms, retailers, specialty shops',
  description:
    'A done-for-you growth system for consumer and DTC brands. We get you found in search, AI, and Maps, win the buyers who reach you, and sell again to the customers you already have — run as one system, not five vendors. Book a Growth Call.',
  alternates: { canonical: 'https://salesolution.net/industries/consumer-brands/' },
}

const leak = LEAK_DATA['retail']

/**
 * Consumer presets — jewelry leads (strongest economics), adjacent showroom
 * profiles that clear the same $150K+ modeled-leak bar. Values are the signed
 * §3.2 table from docs/strategy/offer-research/consumer-jewelry-offer-spec.md;
 * every default lands the leak at 11–15x the $30K floor and the conservative
 * recovery at 5.9–7.3x, with room for the buyer to lower inputs and still
 * clear the install.
 */
const CONSUMER_PRESETS: Preset[] = [
  { key: 'jewelry-bridal', label: 'Jewelry — bridal & custom', avg: 4600, bvol: 150, brate: 25, cvol: 3, crate: 18, rvol: 600, rrate: 4 },
  { key: 'jewelry-fine', label: 'Jewelry — fine & gifts', avg: 2700, bvol: 250, brate: 25, cvol: 5, crate: 20, rvol: 1000, rrate: 5 },
  { key: 'furniture', label: 'Furniture showroom', avg: 1600, bvol: 500, brate: 25, cvol: 8, crate: 20, rvol: 1200, rrate: 6 },
  { key: 'flooring', label: 'Flooring showroom', avg: 3200, bvol: 200, brate: 25, cvol: 5, crate: 20, rvol: 400, rrate: 5 },
  { key: 'hot-tub', label: 'Hot tub & spa dealer', avg: 12000, bvol: 60, brate: 25, cvol: 2, crate: 15, rvol: 300, rrate: 3 },
]

/** Slider labels in the buyer's language (spec §3.2): inquiries = calls, DMs,
 *  "is this in stock," carts, quote requests. */
const CONSUMER_FIELDS: FieldSet = {
  bring: [
    { key: 'bvol', label: 'Nearby searches a month for what you sell', min: 0, max: 2000, step: 10, fmt: 'n' },
    { key: 'brate', label: 'How many find you today', min: 0, max: 100, step: 1, fmt: 'pct' },
  ],
  convert: [
    { key: 'cvol', label: 'Serious inquiries missed or answered late a week', min: 0, max: 40, step: 1, fmt: 'n' },
    { key: 'crate', label: 'Would have bought', min: 0, max: 100, step: 1, fmt: 'pct' },
  ],
  retain: [
    { key: 'rvol', label: 'Past customers in your book', min: 0, max: 4000, step: 25, fmt: 'n' },
    { key: 'rrate', label: 'Would buy again this year if someone asked', min: 0, max: 50, step: 1, fmt: 'pct' },
  ],
}

const CONSUMER_LEAK_HEADING: LeakHeading = {
  eyebrow: 'Your leak, in dollars',
  titleA: 'Put a number on it.',
  titleB: 'Then put it next to the price.',
  intro:
    'Pick your shelf, slide in your own numbers, and watch what walks out in a year.',
}

const CONSUMER_GROUPS = [
  {
    pillar: 'Bring',
    outcome: 'Get found when they’re searching for what you sell',
    steps: [
      {
        key: 'Capture',
        what: 'A tidied-up Google and Maps listing, location and product pages built to show up in search and AI for what you sell, and your catalog connected so what’s on the floor shows up with price and availability — all yours, running alongside your store.',
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
        what: 'Every call, text, DM, and form answered in seconds, even after close. A missed message gets an instant reply, so the buyer doesn’t move on to the next brand.',
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
  what: 'Every call, DM, form, cart, and walk-in logged to one record — wired in before anything else fires — and a monthly dashboard that shows what the system brought in, on its own line, separate from your ads.',
  metric: 'What the system earned, against the fee',
}

const CONSUMER_FAQ: QA[] = [
  {
    q: 'We already have a web agency.',
    a: (
      <p>
        Keep them. The website is one part. We install the system around it:
        found in search and AI answers, every inquiry answered in seconds,
        carts and quotes chased, past customers brought back &mdash; and every
        sale it touched counted on its own line. If your agency already does
        all that, the dashboard will say so and you don&rsquo;t need us.
      </p>
    ),
  },
  {
    q: 'Our Instagram brings the traffic.',
    a: (
      <p>
        Good. Keep posting. But reach you rent can be cut by an algorithm
        tomorrow, and you can&rsquo;t sell twice to a follower you never
        captured. The system works the audience you own: your customer book,
        your Google profile, the searches happening three blocks from your
        door. When a post lands, it makes sure the DM gets answered and the
        browser gets followed up. Rented reach fills the room. Owned demand
        keeps the lights on.
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
        One model, published. The engine installs once &mdash; from $30,000,
        scaled to what&rsquo;s at stake &mdash; and the parts that keep running
        are cylinders at $4&ndash;15K a month each, added as they pay for
        themselves. Want proof before the install? Any cylinder runs standalone
        as a fixed-scope sprint at its published band, and the fee credits
        toward the install within 90 days. There&rsquo;s no guarantee on a
        count of sales; the price is in the open instead.
      </p>
    ),
  },
  {
    q: '$30K against our margin?',
    a: (
      <p>
        Run it in pieces. At a $4,600 average sale, the install is seven pieces
        &mdash; once. The model on this page, at settings you can lower, brings
        back about forty a year that would have walked. And the recovered ones
        are your best economics: the repeat sale carries no ad cost, and nobody
        discounts to a customer who came back on their own.
      </p>
    ),
  },
  {
    q: 'Why no guarantee?',
    a: (
      <p>
        Because the price is in the open instead. A guarantee is what you reach
        for when the fee is hidden. Here you see the model, the floor, and the
        exit terms before we ever talk; the SOW arrives in writing within 48
        hours; the work is shown by week four; and if you leave, every asset we
        built goes with you. Your own trade press says it plainly: nobody
        honest promises rankings. What we promise is method, cadence, and
        receipts.
      </p>
    ),
  },
  {
    q: 'We’re seasonal.',
    a: (
      <p>
        That&rsquo;s the argument for the calendar, not against it. October
        through December can be a third of a store&rsquo;s year in sales, and
        engagement season runs Thanksgiving to Valentine&rsquo;s. The system
        has to be live before the quarter that decides your year &mdash; which
        makes this a summer project, not a someday project. Installs run one
        store at a time, by the operator you talked to, and the ones signed by
        July are the ones proving through December.
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
        title="They love it in your store."
        titleAccent="Then they buy it online."
        lede={
          <>
            The shopper who tried it on. The customer who bought from you three
            years ago. The one asking Google who sells it nearby. Each is a
            sale you already earned, and each one leaks somewhere you
            can&rsquo;t see. We build the system that keeps them yours: found
            first, answered in seconds, brought back.
          </>
        }
        primaryCta={{ label: 'Book a Growth Call', href: '/book-growth-call/' }}
        primaryCtaTag="growth_call__consumer_pillar_hero"
        primaryCtaSub="15 minutes on your numbers. A written plan with your exact price follows within 48 hours — yours to keep either way."
        founder={{
          name: 'Artur Shepel',
          src: '/artur-shepel-480.webp',
          caption: 'One operator runs your account.',
          specs: [
            { label: 'Install', value: '90 days, one-time fee' },
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

      {/* 3 — QUANTIFY YOUR LEAK (whole-flow, sell-product: install frame, no
           fee slider, no guarantee — the price sits next to the leak it fixes) */}
      <WholeFlowLeak
        presets={CONSUMER_PRESETS}
        fields={CONSUMER_FIELDS}
        avgLabel="Your average sale"
        avgNoun="sale"
        unitLabel="piece"
        heading={CONSUMER_LEAK_HEADING}
        motion="sell-product"
        cta={{
          label: 'Book a Growth Call',
          href: '/book-growth-call/',
          tag: 'growth_call__calculator',
          sub: '15 min on your numbers · a written plan in 48 hours · yours to keep',
        }}
      />

      {/* 4 — THE FIX: one system, not five vendors */}
      <div id="flow">
        <FlowBlock />
      </div>

      {/* 5 — THE PLAN: the five steps grouped under Bring / Convert / Retain */}
      <PlanByPillar
        id="how"
        groups={CONSUMER_GROUPS}
        prove={CONSUMER_PROVE}
        intro="Three jobs, five moving parts. We build and run all of it — the 90-day install is on us."
        proveLine="We prove it paid."
      />

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
        kicker="Your web agency, your Instagram, the price, the guarantee question, seasonality. Straight answers."
        items={CONSUMER_FAQ}
      />

      {/* 10 — CLOSE (single sell-product door) */}
      <SectionRail tone="dark" size="lg">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-500">
            One system, not five vendors
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-6xl">
            We build the engine. You sell more.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
            Do nothing, and the model above says roughly six pieces a month
            keep walking: the shopper who loved it in the case and bought it
            online that night, the couple the mall jeweler answered first, the
            customer from three years ago whose next piece someone else just
            sold. None of them will tell you. The report would.
          </p>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-300">
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
