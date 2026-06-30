import type { Metadata } from 'next'
import Link from 'next/link'

import { AIOverviewMockup, INDUSTRIAL_SLIDES } from '@/components/sections/AIOverviewMockup'
import { CaseStudyCard } from '@/components/sections/case-studies/CaseStudyCard'
import { CaseStudyProofBand } from '@/components/sections/case-studies/CaseStudyProofBand'
import { FAQ } from '@/components/sections/FAQ'
import { ProcessTimeline } from '@/components/sections/services/ProcessTimeline'
import { EngagementShapes } from '@/components/sections/services/EngagementShapes'
import { SectionRail } from '@/components/layout/SectionRail'
import { CompositeBar } from '@/components/services/CompositeBar'
import { ServiceColorDot } from '@/components/services/ServiceColorDot'
import {
  SERVICES,
  SERVICE_CLASSES,
  FULL_GROWTH,
  type ServiceKey,
} from '@/components/services/service-colors'
import { JsonLd } from '@/components/seo/JsonLd'
import { business } from '@/lib/business'
import { breadcrumbListSchema, faqPageSchema, serviceSchema } from '@/lib/schema'
import {
  getAllCaseStudies,
  getCaseStudiesByIndustry,
  getCaseStudyBySlug,
  type CaseStudy,
  type CaseStudyCard as CaseStudyCardData,
} from '@/sanity/lib/case-studies'

/**
 * Industry pillar — The Revenue Engine for Industrial Distributors.
 *
 * Written for the buyer: the owner/president of a $5M–$75M industrial
 * distributor or technical manufacturer (not a marketer). Voice is "we".
 * Tells the full engine story — Bring (get found) → Convert (win the quote)
 * → Retain (keep the account) — not AI-search-only. No day-90 guarantee on
 * this page; the close is a single industrial door (Book a Growth Call +
 * written diagnostic). Copy follows the approved mock in
 * docs/strategy/multi-vertical-pivot/04-revenue-engine-rebrand.md (§3).
 *
 * Copy is plain on purpose. Keep it that way if you edit.
 */

const URL = `${business.url}/industries/industrial-distribution/`

export const metadata: Metadata = {
  title: 'The Revenue Engine for Industrial Distributors',
  description:
    'Get found, win the quote, and keep the account. One operator runs the whole flow — AI search, catalog, the RFQ build, and account reactivation — for distributors and manufacturers doing $5M–$75M.',
  alternates: { canonical: URL },
}

export const revalidate = 3600

// ── Who we serve: the two business types + the breadth of the catalog ───────
const BUSINESS_TYPES: { label: string; title: string; body: string }[] = [
  {
    label: 'You stock it',
    title: 'Multi-brand distributors',
    body: 'You carry hundreds of brands and tens of thousands of SKUs, and you win on selection and knowing the catalog cold. We get the AI to name you — not the manufacturer or Amazon — when a buyer searches for a part you stock.',
  },
  {
    label: 'You make it',
    title: 'Manufacturers, one brand or many',
    body: 'You build the product. We make sure buyers and the AI find you by spec and model, and credit you for what you make instead of a competitor who builds something close.',
  },
]

// Grainger-scale breadth, ending in heavy equipment so the reader knows the
// catalog has no ceiling (a fitting to a tractor).
const CATEGORIES: string[] = [
  'Hydraulics & fluid power',
  'Pneumatics',
  'Pumps',
  'Valves & fittings',
  'Bearings & power transmission',
  'Motors & drives',
  'Automation & controls',
  'Sensors & instrumentation',
  'Electrical',
  'Fasteners & fixings',
  'Material handling',
  'Safety & PPE',
  'Abrasives & cutting tools',
  'Welding',
  'Machining & metalworking',
  'HVAC/R',
  'Plumbing',
  'Lubrication',
  'Test & measurement',
  'Janitorial & facility',
  'Packaging & shipping',
  'Fleet & vehicle parts',
  'Raw materials & metals',
  'Outdoor power equipment',
  'Agricultural & heavy equipment',
  'Construction equipment',
]

// ── The three places a distributor leaks (the mock's §2 body) ───────────────
const LEAKS: { stroke: string; title: string; body: string }[] = [
  {
    stroke: 'Bring',
    title: 'Discovery',
    body: 'A buyer searches the part number, or asks an AI who stocks it. Your page is built for a human skimming, not a machine answering, so the answer names a competitor. You never see the search you lost.',
  },
  {
    stroke: 'Convert',
    title: 'Conversion',
    body: 'The RFQ lands. It’s read in two days, quoted in four, and by then the buyer has three other numbers. The quote you sent is a quote you already half-lost on speed.',
  },
  {
    stroke: 'Retain',
    title: 'Retention',
    body: 'The account reorders, from someone else, because no one watched the gap or sent the email first. Repeat revenue is the cheapest revenue you have, and it walks out unattended.',
  },
]

// ── The three strokes (mock §4) ─────────────────────────────────────────────
const STROKES: { name: string; body: string }[] = [
  {
    name: 'Bring',
    body: 'Get the right work coming in. Show up where buyers already look: search, the part-number query, the AI answer. New demand, brought to your door.',
  },
  {
    name: 'Convert',
    body: 'Win the demand you already have. Quote faster, on a site built to close, with the RFQ mechanics that turn an inquiry into an order.',
  },
  {
    name: 'Retain',
    body: 'Bring the account back. Reactivate the lapsed, sell deeper into the ones you have. The cheapest margin there is.',
  },
]

// ── The cylinders, grouped by stroke (mock §5). Each links to its spec. ─────
type Cylinder = {
  service: Exclude<ServiceKey, 'composite'>
  name: string
  href: string
  note?: string
  body: string
}

const BRING_CYLINDERS: Cylinder[] = [
  {
    service: 'search',
    name: SERVICES.search.name,
    href: SERVICES.search.href,
    note: 'most engines start here',
    body: 'When a buyer asks an AI who carries the part, the answer should be you. We rewrite your pages so machines can read and quote them, engineer the citations that get you named, and run paid that survives an AI-first results page. This is the gravity well. Most distributors start here.',
  },
  {
    service: 'catalog',
    name: SERVICES.catalog.name,
    href: SERVICES.catalog.href,
    note: 'fires hardest for distributors',
    body: 'A buyer searching one of 50,000 SKUs lands on a thin, duplicate page and bounces. We write per-product descriptions, structure them so machines can answer from them, link them so each SKU pulls the next, and build the FAQ a buyer (or an AI) actually asks. Per-SKU, across 1,000 to 100,000+ products.',
  },
  {
    service: 'editorial',
    name: SERVICES.editorial.name,
    href: SERVICES.editorial.href,
    body: 'Distributors win on knowing the application, not just stocking the part. We build the spec guides, sizing pages, and engineering Q&A hubs that get cited as the source. The authority layer that makes the rest rank.',
  },
  {
    service: 'outbound',
    name: SERVICES.outbound.name,
    href: SERVICES.outbound.href,
    body: 'Cold lists that land in the inbox and get a reply. We engineer the sender domain so you don’t spam-folder, hand-build the vertical list, and run multi-touch sequences that branch on what the buyer does.',
  },
]

const CONVERT_CYLINDER: Cylinder = {
  service: 'dev',
  name: SERVICES.dev.name,
  href: SERVICES.dev.href,
  body: 'A fast site that closes the RFQ instead of stalling it. Performance build with a Core Web Vitals SLA written into the SOW, machine-readable product data baked in, plugin-thin, and you own the code. Plus the quote mechanics: the RFQ form, the spec sheet, the fast-reply path that beats a competitor on speed.',
}

// ── The per-SKU catalog math, shown not hidden (mock §9) ────────────────────
const CATALOG_MATH: string[] = [
  'Standard — $3.00 down to $2.00 / SKU (min $3,000)',
  'Pro — $7.00 down to $5.00 / SKU (min $7,000)',
  'Enterprise — $15,000–$50,000+/month',
  'Ongoing maintenance: $1.00–$2.50 / SKU, 48-hour turn. Quarterly re-optimization at 25% of the per-SKU rate.',
]

// ── Industry FAQ (owner voice; plain strings feed both the page + schema) ───
const INDUSTRIAL_FAQ: { q: string; a: string }[] = [
  {
    q: 'We’re a manufacturer, not a pure distributor. Does this fit?',
    a: 'Yes. The cylinders are the same; the framing shifts. For a manufacturer, Bring leans harder on application authority and the part-finder, and Retain leans on the distributor and rep network instead of end-buyer reorders. We tune which cylinders fire on the first call.',
  },
  {
    q: 'Our catalog is 80,000 SKUs. Can you actually do per-product work at that scale?',
    a: 'That’s the normal case, not the edge case. Catalog AI is built for 1,000 to 100,000+ SKUs, priced per unit so you see the cost before you commit, with a 48-hour maintenance turn as the catalog changes.',
  },
  {
    q: 'Why won’t you just quote a flat price for everything?',
    a: 'The per-cylinder prices are published. The total depends on which cylinders fire and at what volume, and we won’t guess that before we’ve seen your catalog and your numbers. You’ll have the full SOW, in writing, within 48 hours of the first call. No number invented to fill a silence.',
  },
  {
    q: 'How do you price it, and where do I see the numbers?',
    a: 'Three shapes, all published: a Sprint at $9K–$35K for one cylinder installed and handed over, an Operator Retainer at $4K–$15K/month for a few cylinders run by the operator directly, and Full Growth Ownership from $20K/month for the whole engine. When Catalog AI fires, the per-SKU math is on the page too. You see the model before we ever talk.',
  },
  {
    q: 'Why won’t you guarantee a number of quotes?',
    a: 'A distributor’s cycle is too long and too lumpy for a count-by-a-date to mean anything, and anyone who promises it is selling you a metric, not margin. Instead we publish the prices, show the work in week four, and put both revenue lines in front of you every month. If the system-driven line doesn’t justify the fee, you’ll see it before we do, and you can leave on 90 days’ notice.',
  },
]

function CylinderCard({ c }: { c: Cylinder }) {
  const sc = SERVICE_CLASSES[c.service]
  return (
    <li className={`group relative flex flex-col border border-rule bg-surface transition-colors duration-200 hover:border-ink-700 ${sc.borderTop}`}>
      <Link
        href={c.href}
        data-cta="cylinder__industrial"
        data-cta-location="mid_body"
        className="flex flex-1 flex-col p-7 md:p-8"
      >
        <div className="flex items-center gap-2.5">
          <ServiceColorDot service={c.service} />
          <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink-900">
            {c.name}
          </h3>
        </div>
        {c.note && (
          <p className={`mt-2 font-mono text-[10px] uppercase tracking-[0.16em] ${sc.text600}`}>
            {c.note}
          </p>
        )}
        <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-700">{c.body}</p>
        <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 group-hover:text-brand-600 group-hover:decoration-brand-600">
          See the full spec
          <span aria-hidden>&rarr;</span>
        </p>
      </Link>
    </li>
  )
}

export default async function IndustrialDistributionPage() {
  // All current studies are industrial, so the faceted query and the all-query
  // return the same set today. Prefer the faceted query; fall back to all if
  // the industry backfill (scripts/seed-industries.mjs) hasn't run yet.
  let cards: CaseStudyCardData[] = []
  try {
    cards = await getCaseStudiesByIndustry('industrial-distribution')
    if (cards.length === 0) cards = await getAllCaseStudies()
  } catch (err) {
    console.warn('[industrial hub] case-study fetch failed:', err)
  }

  // The "loud moment" needs a full study (quote + key metric); fetch the
  // featured one by slug and let the grid show the rest.
  const featuredCard = cards.find((c) => c.featured) ?? cards[0]
  let featuredStudy: CaseStudy | null = null
  if (featuredCard) {
    try {
      featuredStudy = await getCaseStudyBySlug(featuredCard.slug)
    } catch (err) {
      console.warn('[industrial hub] featured study fetch failed:', err)
    }
  }
  const gridStudies = featuredCard
    ? cards.filter((c) => c._id !== featuredCard._id)
    : cards

  return (
    <>
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: `${business.url}/` },
          { name: 'Revenue Engine for Industrial Distributors', url: URL },
        ])}
      />
      <JsonLd
        data={serviceSchema({
          name: 'Revenue Engine for industrial distributors and manufacturers',
          url: URL,
          description:
            'One operator runs the whole growth flow for industrial distributors and manufacturers — getting found in AI answers, winning the RFQ, and reactivating lapsed accounts.',
          category: 'Digital Marketing',
        })}
      />
      <JsonLd
        data={faqPageSchema(
          INDUSTRIAL_FAQ.map(({ q, a }) => ({ question: q, answer: a })),
        )}
      />

      {/* 1 — ENGINE HERO: the shift in the owner's words + the AI answer in view. */}
      <section data-section-tone="light" className="relative bg-paper">
        <div className="mx-auto grid grid-cols-1 max-w-6xl gap-10 px-4 pb-16 pt-14 sm:px-6 md:pt-20 lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-8 lg:pb-24">
          <div className="lg:col-span-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              Revenue Engine for Industrial Distributors
            </p>
            <h1 className="mt-6 text-balance font-display text-[2.125rem] font-semibold leading-[1.1] tracking-[-0.02em] text-ink-900 sm:text-[2.5rem] lg:text-[3.125rem] lg:leading-[1.08]">
              Get found.{' '}
              <span className="block sm:mt-1">Win the quote.</span>
              <span className="block sm:mt-1">Keep the account.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-700">
              A buyer asks an AI which supplier carries the part, and it names
              someone else. The RFQ that does reach you sits in an inbox over a
              long weekend. The account you won last year reorders from whoever
              emailed them first. We close all three.
            </p>

            {/* Founder spec-card */}
            <dl className="mt-8 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4 border-y border-rule py-6">
              <div className="col-span-2">
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  Who runs it
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink-900">
                  Artur Shepel. We run every account ourselves.
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  Pricing
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink-900">Published prices</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  Scope
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink-900">SOW in 48 hours</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
                  Lock-in
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink-900">
                  Leave on 90 days&rsquo; notice
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/book-growth-call/"
                data-cta="book_call__industrial_hero"
                data-cta-location="hero"
                className="inline-flex items-center justify-center rounded-[4px] bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
              >
                Book a Growth Call
              </Link>
              <Link
                href="/unlock-growth-audit/"
                data-cta="audit__industrial_hero"
                data-cta-location="hero"
                className="inline-flex items-center gap-1.5 py-3 text-base font-semibold text-ink-800 underline decoration-rule-strong underline-offset-[6px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
              >
                Or get a written diagnostic first
                <span aria-hidden>&rarr;</span>
              </Link>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-ink-500">
              Built for distributors and manufacturers doing $5M&ndash;$75M. Not
              sure it&rsquo;s you?{' '}
              <Link href="#leak" className="font-semibold text-ink-700 underline decoration-rule-strong underline-offset-[3px] hover:text-brand-600">
                Read the leak first.
              </Link>
            </p>
          </div>

          {/* The exact thing the page argues, shown — the Bring beat, in view. */}
          <div className="min-w-0 lg:col-span-6">
            <AIOverviewMockup slides={INDUSTRIAL_SLIDES} />
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
              Bring: your products named in the AI answer, ahead of the brands you carry.
            </p>
          </div>
        </div>
      </section>

      {/* 2 — THE LEAK: three places a distributor leaks. */}
      <SectionRail tone="dark" glow="strong" id="leak">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            The leak
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            You don&rsquo;t have a traffic problem.{' '}
            You have a handoff problem.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-200">
            More clicks won&rsquo;t fix a quote nobody chased or an account
            nobody called back. The hole sits between the pieces, where one
            vendor&rsquo;s job ends and the next one&rsquo;s never picks up.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {LEAKS.map((l) => (
            <div key={l.title} className="border border-white/10 bg-white/[0.03] p-7 md:p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
                {l.stroke}
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.01em] text-white">
                {l.title}
              </h3>
              <p className="mt-4 leading-relaxed text-ink-200">{l.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-3xl text-lg font-semibold leading-relaxed text-white">
          Every RFQ that didn&rsquo;t close is margin you already spent to win.
          The leak isn&rsquo;t the ad budget. It&rsquo;s everything the ad budget
          hands off to.
        </p>
      </SectionRail>

      {/* 3 — FIVE AGENCIES, NO ACCOUNTABILITY + the mechanism (Bring/Convert/Retain). */}
      <SectionRail tone="surface" id="mechanism">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Why the gaps exist
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            Five agencies. No accountability.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            Five vendors. Five reports. Five Slack channels. Nobody owns the
            connection between them. The SEO shop doesn&rsquo;t talk to the
            catalog vendor. The web build doesn&rsquo;t know what the email list
            is doing. Each one was hired by someone who never saw the other two,
            and your buyers fall into the gaps.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-ink-700">
            That&rsquo;s the problem the engine is built to remove. One operator.
            One owner. The whole flow running as one motion.
          </p>
        </div>

        <div className="mt-14 border-t border-rule pt-12">
          <h3 className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900 sm:text-3xl">
            You&rsquo;ve been sold pieces.{' '}
            We run the whole flow.
          </h3>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-700">
            A website, a catalog, an email list, an SEO retainer. Each sold by
            someone who never saw the other two. Buyers fall into the gaps
            between them. We run all of it as one system, so they don&rsquo;t.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {STROKES.map((s, i) => (
              <div key={s.name} className="border border-rule bg-surface p-7 md:p-8">
                <p className="font-mono text-sm font-semibold tabular-nums text-ink-400">
                  {(i + 1).toString().padStart(2, '0')}
                </p>
                <h4 className="mt-3 font-display text-xl font-semibold tracking-[-0.01em] text-ink-900">
                  {s.name}
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-ink-700">{s.body}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-3xl text-lg font-semibold text-ink-900">
            Retain feeds Bring. A repeat customer or a referral costs almost
            nothing to win. A one-off campaign can&rsquo;t do that.
          </p>
          <p className="mt-4 text-sm text-ink-500">
            No markup on your ad spend. We don&rsquo;t resell your leads. No lock-in.
          </p>
        </div>
      </SectionRail>

      {/* 4 — HOW THE ENGINE RUNS: the cylinder firing, grouped Bring/Convert/Retain. */}
      <SectionRail tone="paper" id="engine">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            How the engine runs
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            Three jobs. The cylinders. One engine.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            Each cylinder is a service we run in-house. A distributor doesn&rsquo;t
            fire all of them on day one. We light the ones that pay back first, then
            add the rest as the work compounds. Each one links to the full spec.
          </p>
        </div>

        {/* BRING */}
        <div className="mt-14">
          <div className="flex items-baseline gap-3">
            <h3 className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
              Bring
            </h3>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
              get the right work coming in
            </p>
          </div>
          <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
            {BRING_CYLINDERS.map((c) => (
              <CylinderCard key={c.service} c={c} />
            ))}
          </ul>
        </div>

        {/* CONVERT */}
        <div className="mt-12">
          <div className="flex items-baseline gap-3">
            <h3 className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
              Convert
            </h3>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
              win the demand you already have
            </p>
          </div>
          <ul className="mt-6 grid grid-cols-1 gap-6 md:gap-8">
            <CylinderCard c={CONVERT_CYLINDER} />
          </ul>
        </div>

        {/* RETAIN — Full Growth Ownership, the engine assembled */}
        <div className="mt-12">
          <div className="flex items-baseline gap-3">
            <h3 className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
              Retain
            </h3>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
              bring the account back &mdash; and the whole engine assembled
            </p>
          </div>
          <div className="mt-6 border border-ink-900 bg-surface shadow-[0_30px_80px_-30px_rgba(15,20,30,0.25)]">
            <CompositeBar weight="hero" />
            <div className="p-7 md:p-9">
              <div className="flex items-center gap-2.5">
                <ServiceColorDot service="composite" />
                <h4 className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
                  {FULL_GROWTH.name}
                </h4>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">
                  the engine, fully assembled
                </span>
              </div>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-700">
                One operator runs all of the above as one motion, plus the
                retention work: spotting the account that&rsquo;s gone quiet, the
                reorder that didn&rsquo;t come, the win-back email nobody sent.
                This is the default. The standalone cylinders are honest on-ramps
                to it.
              </p>
              <Link
                href={FULL_GROWTH.href}
                data-cta="cylinder__industrial"
                data-cta-location="mid_body"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
              >
                See the full spec
                <span aria-hidden>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-10 max-w-3xl text-sm leading-relaxed text-ink-500">
          Cylinders we&rsquo;ll add as the engine earns it, not bolted on day one
          because a deck said so.
        </p>
        <p className="mt-4 max-w-3xl text-lg font-semibold text-ink-900">
          And then, Prove. Every month we show which cylinder brought back the
          most, in your numbers, not ours.
        </p>
      </SectionRail>

      {/* 5 — THE ITERATION LOOP */}
      <SectionRail tone="dark" glow="quiet" id="loop">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            The iteration loop
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            We strengthen the cylinder that pays back hardest.{' '}
            Every month.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-200">
            An engine isn&rsquo;t a launch. It&rsquo;s a thing you tune.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-ink-200">
            Each month the report shows which cylinder recovered the most margin:
            the RFQ speed work, the catalog pages, the reactivation emails. The
            next iteration leans into that one. If Catalog AI is what&rsquo;s
            clearing real orders, that&rsquo;s where the next month&rsquo;s hours
            go. If it&rsquo;s the cold-RFQ recovery, we shift there.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-ink-200">
            You&rsquo;re not paying for a fixed scope that ignores what&rsquo;s
            actually working. You&rsquo;re paying for an operator who reads the
            result and moves the weight to where it pays. That&rsquo;s the
            difference between five vendors defending their line item and one
            owner moving budget to the cylinder that earns it.
          </p>
        </div>
      </SectionRail>

      {/* 6 — PROOF: loud moment, then the grid, with the two-revenue-lines frame. */}
      {featuredStudy && <CaseStudyProofBand study={featuredStudy} id="proof" />}

      <SectionRail tone="surface" id={featuredStudy ? undefined : 'proof'}>
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Proof
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            Two lines on every report.{' '}
            The second one is the test.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            Each month we split what your paid spend produced from what the
            system brought back. The honest read: the recovered line should
            justify what you pay us.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <div className="border border-rule bg-paper p-7 md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
              Media-driven
            </p>
            <p className="mt-3 leading-relaxed text-ink-700">
              Orders that came from the ad spend you funded.
            </p>
          </div>
          <div className="border border-ink-900 bg-paper p-7 md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-900">
              System-driven
            </p>
            <p className="mt-3 leading-relaxed text-ink-700">
              The line the engine brought back. Recovered RFQs, reactivated
              accounts, deeper share of the wallet you already own.
            </p>
          </div>
        </div>

        <p className="mt-8 max-w-3xl text-base leading-relaxed text-ink-700">
          Counted in your numbers, not estimated on our spreadsheet. We
          won&rsquo;t pretend a chart proves it. The structure does: two lines,
          our fee shown as its own row, and you decide if the second line earns
          the first.
        </p>

        {gridStudies.length > 0 && (
          <div className="mt-14 border-t border-rule pt-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              More receipts
            </p>
            <h3 className="mt-3 font-display text-3xl font-semibold leading-[1.08] tracking-[-0.015em] text-ink-900 sm:text-4xl">
              Distributors we&rsquo;ve moved the numbers for.
              <span className="block">More quotes, not more traffic.</span>
            </h3>
            <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              {gridStudies.map((study) => (
                <CaseStudyCard key={study._id} study={study} />
              ))}
            </ul>
            <p className="mt-10">
              <Link
                href="/case-studies/"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
              >
                All case studies
                <span aria-hidden>&rarr;</span>
              </Link>
            </p>
          </div>
        )}
      </SectionRail>

      {/* 7 — WHY NO GUARANTEE */}
      <SectionRail tone="paper" id="no-guarantee">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Why no guarantee
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            No guarantee on a count of quotes.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            We don&rsquo;t promise you a number of RFQs by a date. A
            distributor&rsquo;s cycle is too long and too lumpy for that to mean
            anything, and anyone who promises it is selling you a metric, not
            margin.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-ink-700">
            What we&rsquo;ll do instead: publish the prices, show the work in week
            four, and put both revenue lines in front of you every month. If the
            system-driven line doesn&rsquo;t justify the fee, you&rsquo;ll see it
            before we do, and you can leave on 90 days&rsquo; notice. That&rsquo;s
            the trade. No theater, no clawback fine print, no lock-in standing in
            for results.
          </p>
        </div>
      </SectionRail>

      {/* 8 — PRICING & ENGAGEMENT (generic shapes) + the per-SKU catalog math. */}
      <div id="pricing">
        <EngagementShapes />
      </div>

      <SectionRail tone="surface">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              Proof of fairness
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.08] tracking-[-0.015em] text-ink-900 sm:text-4xl">
              The catalog math, in the open.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-700">
              When Catalog AI fires, here&rsquo;s exactly how it&rsquo;s priced.
              Per SKU, by volume, so you can do the arithmetic before the call.
            </p>
            <p className="mt-5 text-base leading-relaxed text-ink-700">
              We publish this because the price isn&rsquo;t the risk. The handoff
              is. You&rsquo;ll never get a &ldquo;depends on your needs&rdquo;
              runaround from us. The number&rsquo;s on the page.
            </p>
          </div>
          <div className="md:col-span-7">
            <ul className="divide-y divide-rule border border-rule bg-paper">
              {CATALOG_MATH.map((row) => (
                <li key={row} className="px-6 py-5 text-base leading-relaxed text-ink-800">
                  {row}
                </li>
              ))}
            </ul>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
              Published prices &middot; SOW in 48 hours &middot; Leave on 90 days&rsquo; notice
            </p>
          </div>
        </div>
      </SectionRail>

      {/* 9 — CMO-REPLACEMENT ANCHOR */}
      <SectionRail tone="dark" glow="strong" id="cmo">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            What it replaces
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            Priced against the hire you&rsquo;d otherwise make.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          <div className="border border-white/10 bg-white/[0.03] p-7 md:p-8">
            <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-white">
              Versus a full-time growth hire
            </h3>
            <p className="mt-4 leading-relaxed text-ink-200">
              A growth lead runs about $200K base plus benefits, equity, and
              recruiting. Call it $300K/year all-in. Full Growth Ownership is
              $20K&ndash;$35K/month. It ships faster, scales down on 30 days&rsquo;
              notice, and carries no severance risk.
            </p>
          </div>
          <div className="border border-white/10 bg-white/[0.03] p-7 md:p-8">
            <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-white">
              Versus five separate retainers
            </h3>
            <p className="mt-4 leading-relaxed text-ink-200">
              If you&rsquo;re already spending $20K+/month across disjointed
              vendors, you&rsquo;re paying a coordination tax to yourself, in your
              own hours. We collect a portion of that in exchange for doing the
              coordinating.
            </p>
          </div>
          <div className="border border-white/10 bg-white/[0.03] p-7 md:p-8">
            <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-white">
              Does it replace a CMO?
            </h3>
            <p className="mt-4 leading-relaxed text-ink-200">
              For most $5M&ndash;$25M distributors, yes. The exception is exit
              prep, raising capital, or building toward $50M+. We&rsquo;ve also
              placed three CMOs from our network in the last 18 months, no fee. If
              that&rsquo;s the real need, we&rsquo;ll say so.
            </p>
          </div>
        </div>
      </SectionRail>

      {/* 10 — THE TWO-STATE ON-RAMP */}
      <SectionRail tone="surface" id="on-ramp">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Where to start
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            Where&rsquo;s your engine right now?
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <div className="flex flex-col border border-rule bg-paper p-7 md:p-8">
            <h3 className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
              No engine yet, or it&rsquo;s leaking
            </h3>
            <p className="mt-4 flex-1 leading-relaxed text-ink-700">
              Buyers can&rsquo;t find you, RFQs stall, accounts drift, and you
              can&rsquo;t say what your marketing did last quarter. We build the
              whole engine and run it. Start with Full Growth Ownership, or light
              the gravity-well cylinder (AI Search) first and add from there.
            </p>
            <Link
              href="/book-growth-call/"
              data-cta="book_call__industrial_onramp"
              data-cta-location="mid_body"
              className="mt-6 inline-flex items-center justify-center rounded-[4px] bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
            >
              Book a Growth Call
            </Link>
          </div>
          <div className="flex flex-col border border-rule bg-paper p-7 md:p-8">
            <h3 className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
              Engine runs, but a cylinder&rsquo;s dead
            </h3>
            <p className="mt-4 flex-1 leading-relaxed text-ink-700">
              The site&rsquo;s fine, the demand&rsquo;s there, but one part
              stopped paying back. The catalog&rsquo;s thin. The RFQ reply is
              slow. The cold list went quiet. We rebuild that one part and hand it
              back.
            </p>
            <Link
              href="/book-growth-call/"
              data-cta="book_call__industrial_onramp_sprint"
              data-cta-location="mid_body"
              className="mt-6 inline-flex items-center justify-center rounded-[4px] border border-ink-300 bg-paper px-6 py-3 text-base font-semibold text-ink-900 transition-colors duration-200 hover:border-ink-900"
            >
              Start with a Sprint
            </Link>
          </div>
        </div>

        <p className="mt-8 max-w-3xl text-base leading-relaxed text-ink-700">
          Either way, the first call tightens the scope and the SOW lands in 48
          hours. No deck. No SDR loop.
        </p>
      </SectionRail>

      {/* 11 — WHO WE SERVE: two business types + catalog breadth (kept). */}
      <SectionRail tone="paper" id="segments">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Who we serve
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.08] tracking-[-0.015em] text-ink-900 sm:text-4xl">
            Whether you stock it or make it.
            <span className="block">We get you found for it.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            Two kinds of business, one problem: buyers and the AI need to find
            you by part, spec, or model, and name you instead of the brand or
            Amazon.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {BUSINESS_TYPES.map((b) => (
            <div key={b.title} className="border border-rule bg-surface p-7 md:p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-600">
                {b.label}
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.01em] text-ink-900">
                {b.title}
              </h3>
              <p className="mt-4 leading-relaxed text-ink-700">{b.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-rule pt-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Across the whole catalog
          </p>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {CATEGORIES.map((c) => (
              <li
                key={c}
                className="border border-rule bg-surface px-3 py-1.5 text-sm text-ink-700"
              >
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-2xl text-lg font-semibold text-ink-900">
            From a single hydraulic fitting to a tractor &mdash; if it has a part
            number, a spec, or a model, we get you found for it.
          </p>
        </div>
      </SectionRail>

      {/* 12 — HOW WE WORK */}
      <ProcessTimeline id="process" />

      {/* 13 — FAQ (also the FAQ schema above) */}
      <FAQ
        id="faq"
        eyebrow="Questions distributors ask"
        headline={
          <>
            Straight answers{' '}
            for technical distributors.
          </>
        }
        kicker="Manufacturer fit, catalog scale, pricing, flat-rate quotes, and why we won't guarantee a count."
        items={INDUSTRIAL_FAQ.map(({ q, a }) => ({ q, a: <p>{a}</p> }))}
      />

      {/* 14 — SINGLE-DOOR CLOSE (industrial only — no Revenue Leak Audit). */}
      <SectionRail tone="dark" glow="strong" id="close">
        <div className="max-w-3xl">
          <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            One operator. One accountable owner.{' '}
            Your entire growth function.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-200">
            Stop paying five vendors to defend five line items. Run the whole flow
            as one engine, tuned every month to the cylinder that pays back.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/book-growth-call/"
              data-cta="book_call__industrial_close"
              data-cta-location="footer"
              className="inline-flex items-center justify-center rounded-[4px] bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
            >
              Book a Growth Call
            </Link>
            <Link
              href="/unlock-growth-audit/"
              data-cta="audit__industrial_close"
              data-cta-location="footer"
              className="inline-flex items-center gap-1.5 py-3 text-base font-semibold text-white underline decoration-white/40 underline-offset-[6px] transition-colors duration-200 hover:decoration-white"
            >
              Or get the written diagnostic first
              <span aria-hidden>&rarr;</span>
            </Link>
          </div>

          <p className="mt-7 text-sm leading-relaxed text-ink-300">
            Response within 24 hours. A 30-minute call, no deck. A one-page
            diagnostic, no SDR loop. SOW in 48 hours.
          </p>
        </div>
      </SectionRail>
    </>
  )
}
