import type { Metadata } from 'next'
import Link from 'next/link'

import { AIOverviewMockup, INDUSTRIAL_SLIDES } from '@/components/sections/AIOverviewMockup'
import { CaseStudyCard } from '@/components/sections/case-studies/CaseStudyCard'
import { CaseStudyProofBand } from '@/components/sections/case-studies/CaseStudyProofBand'
import { FAQ } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { ProcessTimeline } from '@/components/sections/services/ProcessTimeline'
import { ServicesByLeak } from '@/components/sections/ServicesByLeak'
import { ServicesSystem } from '@/components/sections/ServicesSystem'
import { SectionRail } from '@/components/layout/SectionRail'
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
 * Industry hub — Industrial Distribution & Technical B2B.
 *
 * Written for the buyer: the owner/president of a $5M–$75M industrial
 * distributor or technical manufacturer. "Somewhat" AI-literate (ChatGPT /
 * Google AI / AI Overviews are fair game; no schema/GEO/ERP jargon). The
 * problem is framed as the two sides an owner is stuck on — not enough
 * business coming in, or too messed up to handle what they have.
 *
 * Copy is plain on purpose. Keep it that way if you edit.
 */

const URL = `${business.url}/industries/industrial-distribution/`

export const metadata: Metadata = {
  title: 'AI Search & SEO for Industrial Distributors & Manufacturers',
  description:
    'Your buyers ask Google’s AI and ChatGPT for the part now — and the answer names the manufacturer, not you. We get distributors and equipment makers named in those answers, so the quote comes to you.',
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

// ── The three reasons the AI skips a distributor (plain) ────────────────────
const REASONS: { n: string; title: string; body: string }[] = [
  {
    n: '01',
    title: 'Your pages read like everyone’s',
    body: 'Most product pages use the same description the manufacturer hands every distributor. To Google and ChatGPT, your catalog looks identical to ten competitors’ — so none of it stands out, and none of it gets picked.',
  },
  {
    n: '02',
    title: 'The brand looks like the expert',
    body: 'When the manufacturer’s own site is the most complete source online, the AI credits them for the part — even though you stock it, configure it, and ship it today.',
  },
  {
    n: '03',
    title: 'The AI can’t read your catalog',
    body: 'Quote-only prices and product data scattered across systems mean the AI can’t tell what you carry or what it costs. If it can’t read your catalog, it won’t recommend you.',
  },
]

// ── Industry FAQ (owner voice; plain strings feed both the page + schema) ───
const INDUSTRIAL_FAQ: { q: string; a: string }[] = [
  {
    q: 'How is this different from regular SEO?',
    a: 'Regular SEO is about ranking on Google’s results page. This is about whether Google’s AI and ChatGPT name you when they answer a buyer’s question directly — like the cross-reference for a Parker fitting. We set up your product pages so you’re the company they name, not just the manufacturer.',
  },
  {
    q: 'Can you help with part-number and cross-reference searches?',
    a: 'Yes, and those are your best buyers — they know exactly what they want. We make sure that when someone searches a part number, a spec, or a cross-reference, the answer points to the product you stock.',
  },
  {
    q: 'Our product copy comes from the manufacturer and our prices are quote-only. Does that matter?',
    a: 'It’s most of the problem. The manufacturer copy on your pages is the same copy every other distributor uses, so nothing stands out. We rewrite it at scale with a real editor on every page, and add the product details and price or availability signals the AI needs to read your catalog — even when pricing stays quote-only.',
  },
  {
    q: 'Will this cause friction with the manufacturers we carry?',
    a: 'No. We position you as the distributor who stocks, configures, and ships — the buyer’s source, not a rival to the brand. The goal is to get you named right alongside and ahead of the manufacturer for the products you carry.',
  },
  {
    q: 'We have 50,000+ SKUs. How do you do this without junk pages?',
    a: 'We start with the products and categories that bring the most quotes and rewrite those first, with a real editor on each one. Thin, copy-paste pages are the problem we fix, not a shortcut we take.',
  },
  {
    q: 'How fast do we see results, and how do you measure them?',
    a: 'The first changes go live within a couple of weeks. More quotes and AI mentions on your priority searches usually follow over the first quarter. We report quote requests, real deals, and where the AI names you — not rankings for their own sake.',
  },
]

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
          { name: 'Industrial Distribution & Technical B2B', url: URL },
        ])}
      />
      <JsonLd
        data={serviceSchema({
          name: 'AI search & SEO for industrial distributors and manufacturers',
          url: URL,
          description:
            'We get industrial distributors and equipment manufacturers named in AI answers (Google AI Overviews, ChatGPT) for the part numbers, specs, and cross-references their buyers search.',
          category: 'Digital Marketing',
        })}
      />
      <JsonLd
        data={faqPageSchema(
          INDUSTRIAL_FAQ.map(({ q, a }) => ({ question: q, answer: a })),
        )}
      />

      {/* 1 — HERO: the shift, in an owner's words, with the AI answer in view.
          Full-contrast headline (no muted clause), responsive type, decluttered. */}
      <section data-section-tone="light" className="relative bg-paper">
        <div className="mx-auto grid grid-cols-1 max-w-6xl gap-10 px-4 pb-16 pt-14 sm:px-6 md:pt-20 lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-8 lg:pb-24">
          <div className="lg:col-span-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              Who we serve · Industrial distribution &amp; technical B2B
            </p>
            <h1 className="mt-6 text-balance font-display text-[2.125rem] font-semibold leading-[1.1] tracking-[-0.02em] text-ink-900 sm:text-[2.5rem] lg:text-[3.125rem] lg:leading-[1.08]">
              Your buyers ask AI for the part now.{' '}
              <span className="block sm:mt-1">It names the manufacturer, not you.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-700">
              An engineer or buyer used to come to your site to find a part. Now
              they ask Google or ChatGPT, and the answer names the brand that
              makes it, not the distributor who stocks 80,000 of them. You never
              get the visit. Your rep never gets the quote. We make the AI point
              to you instead.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/book-growth-call/"
                data-cta="book_call__industrial_hero"
                data-cta-location="hero"
                className="inline-flex items-center justify-center rounded-[4px] bg-brand-600 px-6 py-3.5 text-base font-semibold text-white shadow-cta transition-colors duration-200 hover:bg-brand-700"
              >
                Book a strategy call
              </Link>
              <Link
                href="/unlock-growth-audit/"
                data-cta="audit__industrial_hero"
                data-cta-location="hero"
                className="inline-flex items-center gap-1.5 py-3 text-base font-semibold text-ink-800 underline decoration-rule-strong underline-offset-[6px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
              >
                See who AI names for your products
                <span aria-hidden>&rarr;</span>
              </Link>
            </div>
          </div>

          {/* The exact thing the page argues, shown — this is the proof, and
              the larger visual anchor (7 of 12 cols) so it isn't secondary. */}
          <div className="min-w-0 lg:col-span-6">
            <AIOverviewMockup slides={INDUSTRIAL_SLIDES} />
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">
              What we build: your products named in the AI answer, ahead of the brands you carry.
            </p>
          </div>
        </div>
      </section>

      {/* 2 — THE TWO SIDES (replaces the analyst chart; the owner's own framing) */}
      <SectionRail tone="dark" glow="strong" id="shift">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
            Where it hurts
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
            You&rsquo;re probably on one of two sides.{' '}
            <span className="text-ink-400">Often both at once.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-200">
            Almost every distributor who calls me is stuck in one of two places.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <div className="border border-white/10 bg-white/[0.03] p-7 md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
              Side one
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.01em] text-white">
              Not enough coming in
            </h3>
            <p className="mt-4 leading-relaxed text-ink-200">
              The phone&rsquo;s quieter than it was. Fewer quotes, longer gaps
              between the good ones. You&rsquo;ve slipped on Google for searches
              you used to own, and Amazon and the manufacturers are picking off
              business that used to be yours.
            </p>
          </div>
          <div className="border border-white/10 bg-white/[0.03] p-7 md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
              Side two
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.01em] text-white">
              Can&rsquo;t keep up with what you&rsquo;ve got
            </h3>
            <p className="mt-4 leading-relaxed text-ink-200">
              The work comes in, then leaks back out. Quotes go out and never get
              chased. Your website is a parts dump nobody can search. And you
              can&rsquo;t say which of your marketing actually turned into a sale.
            </p>
          </div>
        </div>

        <p className="mt-10 max-w-3xl text-lg font-semibold leading-relaxed text-white">
          Both trace back to the same change. Buyers find and pick parts through
          Google&rsquo;s AI and ChatGPT now, and your catalog was built for a web
          that&rsquo;s already gone. Fix how you show up there and both sides ease
          at once.
        </p>
      </SectionRail>

      {/* 3 — WHY IT HAPPENS (three plain reasons; replaces the jargon "leak") */}
      <SectionRail tone="surface" id="leak">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Why it happens
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            Why the AI names the manufacturer{' '}
            <span className="text-ink-500">and skips past you.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-700">
            You stock the part, ship it today, and know it better than anyone.
            The AI still points to the brand. Three reasons why.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-3">
          {REASONS.map((r) => (
            <li key={r.n}>
              <p className="font-mono text-sm font-semibold tabular-nums text-ink-400">
                {r.n}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.01em] text-ink-900">
                {r.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{r.body}</p>
            </li>
          ))}
        </ol>

        <p className="mt-10 max-w-2xl text-lg font-semibold text-ink-900">
          Every one of these is fixable. It&rsquo;s how your catalog is built, not
          how much you spend.
        </p>
      </SectionRail>

      {/* 4 — PROOF: loud moment, then the grid */}
      {featuredStudy && <CaseStudyProofBand study={featuredStudy} id="proof" />}

      {gridStudies.length > 0 && (
        <SectionRail tone="surface" id={featuredStudy ? undefined : 'proof'}>
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              More receipts
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.08] tracking-[-0.015em] text-ink-900 sm:text-4xl">
              Distributors we&rsquo;ve moved the numbers for.
              <span className="block text-ink-500">More quotes, not just more traffic.</span>
            </h2>
          </div>
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
        </SectionRail>
      )}

      {/* 5 — THE SERVICES, industrial-framed.
          TEMP A/B COMPARE — moved here from the homepage (distributor-specific).
          Pick one, then delete the loser + these banners. NOTE: Option A ("two
          leaks") overlaps this page's "two sides" (§2) + "why it happens" (§3),
          so Option B is likely the keeper here. */}
      <div className="bg-amber-400 px-4 py-2 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-black">
        Option A · Two leaks → the fix
      </div>
      <ServicesByLeak id="services" />
      <div className="bg-amber-400 px-4 py-2 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-black">
        Option B · The Answer Engine
      </div>
      <ServicesSystem />

      {/* 6 — WHO WE SERVE: two business types + catalog breadth */}
      <SectionRail tone="paper" id="segments">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Who we serve
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.08] tracking-[-0.015em] text-ink-900 sm:text-4xl">
            Whether you stock it or make it.
            <span className="block text-ink-500">We get you found for it.</span>
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

      {/* 7 — HOW WE WORK (de-risk the engagement) */}
      <ProcessTimeline id="process" />

      {/* 8 — INDUSTRY FAQ (also the FAQ schema above) */}
      <FAQ
        id="faq"
        eyebrow="Questions distributors ask"
        headline={
          <>
            Straight answers{' '}
            <span className="text-ink-500">for technical distributors.</span>
          </>
        }
        kicker="AI vs SEO, part-number search, manufacturer copy, channel friction, catalog scale, how we measure it."
        items={INDUSTRIAL_FAQ.map(({ q, a }) => ({ q, a: <p>{a}</p> }))}
      />

      {/* 9 — CLOSE */}
      <FinalCTARail />
    </>
  )
}
