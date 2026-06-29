import type { Metadata } from 'next'
import Link from 'next/link'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { FounderNote } from '@/components/sections/revenue-engine/FounderNote'
import { IterationLoop } from '@/components/sections/revenue-engine/IterationLoop'
import { PlanByPillar } from '@/components/sections/revenue-engine/PlanByPillar'
import { ProductWedge } from '@/components/sections/revenue-engine/ProductWedge'
import { RevenueHero } from '@/components/sections/revenue-engine/RevenueHero'
import { SixCylinders } from '@/components/sections/revenue-engine/SixCylinders'
import { TwoRevenueLines } from '@/components/sections/revenue-engine/TwoRevenueLines'
import { JsonLd } from '@/components/seo/JsonLd'
import { business } from '@/lib/business'
import { PRODUCT_PILLAR_GROUPS, PRODUCT_PILLAR_PROVE } from '@/lib/revenue-engine'
import { breadcrumbListSchema, itemListSchema, serviceSchema } from '@/lib/schema'

// The cross-vertical PRODUCT page: "what the Revenue Engine is + how it works."
// Parent of the niche pages (Dentists, Home services). The one page where the
// concept leads as the H1 — title/eyebrow/H1 carry no industry modifier.
export const metadata: Metadata = {
  title: 'How the Revenue Engine works',
  description:
    'The Revenue Engine is one system that runs your whole sale: it brings the right buyers in, answers and books the ones who reach you, wins back the ones who went quiet, and proves the revenue in your own numbers. See the five steps and the six services that fire them.',
  alternates: { canonical: 'https://salesolution.net/revenue-engine/' },
}

const REVENUE_ENGINE_FAQ: QA[] = [
  {
    q: 'What is a Revenue Engine?',
    a: (
      <p>
        It&rsquo;s one connected system that runs the whole sale: getting found,
        answering and booking the people who reach you, winning back the ones who
        went quiet, and proving the revenue in your own numbers. Not a single
        tool. The job it does is close the gaps between the tools you already pay
        for.
      </p>
    ),
  },
  {
    q: 'How is this different from buying point tools?',
    a: (
      <p>
        A website, a CRM, an ad account, a reviews app. Each one proves its own
        slice fired. None of them owns whether you made money. The engine runs
        them as one flow and reports on one thing: revenue you can trace back to
        it.
      </p>
    ),
  },
  {
    q: 'Do I have to take all six cylinders?',
    a: (
      <p>
        No. We start with the leak that&rsquo;s costing you the most and add
        cylinders as they pay for themselves. Most owners don&rsquo;t need all
        six on day one.
      </p>
    ),
  },
  {
    q: 'How do you prove the revenue?',
    a: (
      <p>
        Two lines on a monthly report: what your ads produced, and what the
        system brought back. The second line is counted in your own dashboard,
        not estimated on a spreadsheet. If it doesn&rsquo;t cover what you pay
        us, you&rsquo;ll see that too.
      </p>
    ),
  },
]

export default function RevenueEnginePage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'The Revenue Engine',
          // This page lives at /revenue-engine/, not /services/revenue-engine/,
          // so pass the real URL to keep @id/url aligned with the canonical above.
          url: 'https://salesolution.net/revenue-engine/',
          description:
            'A done-for-you system that runs the whole sale for a local business: it brings the right buyers in, answers and books the ones who reach you, wins back the ones who went quiet, and proves the revenue in the owner’s own numbers. Five steps (Capture, Respond, Book, Recover, Prove), fired by six services.',
          category: 'Marketing',
        })}
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: `${business.url}/` },
          { name: 'The Revenue Engine', url: `${business.url}/revenue-engine/` },
        ])}
      />
      <JsonLd
        data={itemListSchema({
          name: 'The Revenue Engine — by industry',
          url: `${business.url}/revenue-engine/`,
          // Live canonicals only. Home-services + dentists are built; the
          // /industries/{...} pillar dirs are not, so they stay off this list
          // until Phase 5 to avoid structured data pointing at 404s.
          items: [
            {
              name: 'Revenue Engine for Home Services',
              url: `${business.url}/revenue-engine/home-services/`,
            },
            {
              name: 'Revenue Engine for Dental Practices',
              url: `${business.url}/revenue-engine/dentists/`,
            },
          ],
        })}
      />

      <div className="h-1.5 w-full bg-brand-600" aria-hidden />

      {/* 1 — HERO: the one page where the concept leads the H1, kept concrete */}
      <RevenueHero
        eyebrow="The Revenue Engine"
        title="One system that runs your whole sale,"
        titleAccent="from getting found to getting paid again."
        lede={
          <>
            The Revenue Engine is one system that runs the whole sale: it gets you
            found where buyers look, answers and books the ones who reach you,
            wins back the ones who went quiet, and shows the revenue it drove in
            your own numbers. One operator builds it and runs it.
          </>
        }
        primaryCta={{
          label: 'Book a Revenue Leak Audit',
          href: '/revenue-engine/home-services/#audit',
        }}
        primaryCtaTag="revenue_leak_audit__re_product_router"
        selfQualifiers={[
          { label: 'I run a dental practice', href: '/revenue-engine/dentists/' },
          { label: 'See all industries', href: '/industries/' },
        ]}
        anchors={[
          { label: 'The wedge', href: '#wedge' },
          { label: 'How it works', href: '#how' },
          { label: 'Six cylinders', href: '#cylinders' },
          { label: 'Proof', href: '#prove' },
          { label: 'Pick your industry', href: '#pick' },
        ]}
      />

      {/* 2 — THE WEDGE: collapsed FlowBlock, banner form (not the full track) */}
      <ProductWedge id="wedge" />

      {/* 3 — HOW IT WORKS: the 5-step spine, vertical-agnostic prose. This is the
          depth the homepage triptych omits (3 strokes there, 5 steps here). */}
      <PlanByPillar
        id="how"
        groups={PRODUCT_PILLAR_GROUPS}
        prove={PRODUCT_PILLAR_PROVE}
        intro="Three jobs, five moving parts. We install the whole thing and run it as one system, not five tools you have to wire together yourself."
        proveLine="We prove it paid."
      />

      {/* 4 — SIX CYLINDERS: the six services grouped Bring/Convert/Retain,
          each deep-linked to its /services/{slug}/ page */}
      <SixCylinders id="cylinders" />

      {/* 5 — ITERATION LOOP: the methodology beat the homepage lacks */}
      <IterationLoop />

      {/* 6 — PROVE: two-revenue-lines mechanic, motion-neutral firm "we" */}
      <TwoRevenueLines
        id="prove"
        eyebrow="How we report it"
        headline={
          <>
            Two lines on every report.{' '}
            <span className="text-ink-300">The second is the revenue the system brought back.</span>
          </>
        }
        lede="Each cycle we split what your ads produced from what the system brought back, so you can see exactly what the engine earned on its own."
        closer={
          <>
            The system line is calls won back, quotes chased, past customers
            returning, and people who found you from new reviews. Counted in your
            own dashboard, not estimated on a spreadsheet.
          </>
        }
      />

      {/* 7 — OPERATOR CREDIBILITY: you work with the operator (no guarantee, no price) */}
      <FounderNote />

      {/* 8 — FAQ: product / methodology questions (auto-emits FAQPage schema) */}
      <FAQ
        id="faq"
        eyebrow="Before you pick"
        headline={
          <>
            How the engine works,{' '}
            in plain terms.
          </>
        }
        kicker="What a Revenue Engine is, how it beats point tools, whether you need all six, and how we prove the revenue."
        items={REVENUE_ENGINE_FAQ}
      />

      {/* 9 — DOWN-ROUTER to live niche canonicals, then the dual-door close */}
      <NicheRouter id="pick" />
      <FinalCTARail />
    </>
  )
}

const NICHES = [
  {
    href: '/revenue-engine/home-services/',
    kicker: 'Roofing · HVAC · plumbing · electrical',
    title: 'Home services',
    body: 'Answer every storm-season call, book the estimate, and chase the quote that went cold.',
  },
  {
    href: '/revenue-engine/dentists/',
    kicker: 'Group & single-location practices',
    title: 'Dental practices',
    body: 'Catch the calls your front desk can’t during chair time, book new patients, and follow up on treatment plans and recall.',
  },
]

function NicheRouter({ id }: { id?: string }) {
  return (
    <section data-section-tone="light" id={id} className="relative scroll-mt-20 bg-paper py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Pick your industry
          </p>
          <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            See the engine{' '}
            built for your trade.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            Same engine, tuned to how you work. Each page has your pricing, your
            proof, and the leaks specific to your trade.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {NICHES.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              data-cta="niche__re_product_router"
              className="group flex flex-col overflow-hidden rounded-[4px] border border-rule-strong bg-surface transition-colors duration-200 hover:border-ink-900"
            >
              <div aria-hidden className="h-1 bg-brand-600" />
              <div className="flex flex-1 flex-col p-7">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-600">
                  {n.kicker}
                </span>
                <span className="mt-3 font-display text-2xl font-semibold tracking-[-0.015em] text-ink-900">
                  {n.title}
                </span>
                <span className="mt-3 flex-1 text-ink-700">{n.body}</span>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 group-hover:text-brand-600 group-hover:decoration-brand-600">
                  See the {n.title.toLowerCase()} engine
                  <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          ))}
          <Link
            href="/industries/"
            data-cta="industries__re_product_router"
            className="group flex flex-col justify-center rounded-[4px] border border-dashed border-rule-strong bg-paper p-7 transition-colors duration-200 hover:border-ink-900 sm:col-span-2"
          >
            <span className="inline-flex items-center gap-1.5 font-display text-lg font-semibold text-ink-900">
              Sell a product, not a service? See all industries
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
