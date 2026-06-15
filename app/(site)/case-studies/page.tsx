import type { Metadata } from 'next'

import { SectionRail } from '@/components/layout/SectionRail'
import { CaseStudyCard } from '@/components/sections/case-studies/CaseStudyCard'
import { CaseStudyCTA } from '@/components/sections/case-studies/CaseStudyCTA'
import { CaseStudyFeature } from '@/components/sections/case-studies/CaseStudyFeature'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { JsonLd } from '@/components/seo/JsonLd'
import { business } from '@/lib/business'
import { breadcrumbListSchema } from '@/lib/schema'
import {
  getAllCaseStudies,
  type CaseStudyCard as CaseStudyCardData,
} from '@/sanity/lib/case-studies'

export const metadata: Metadata = {
  title: 'Case Studies — Measured Results from Real Engagements',
  description:
    'SEO, AI-search, catalog, and replatform case studies for industrial distributors — every number carries a baseline, a timeframe, and a named source. Anonymity disclosed, methodology attached.',
  alternates: { canonical: `${business.url}/case-studies/` },
}

export const revalidate = 3600

/**
 * The proof standard, framed as the differentiator it is — these are
 * requirements the case-study publishing model enforces (required timeframe,
 * required per-metric methodology, required disclosure mode), not marketing
 * promises.
 */
const PROOF_STANDARDS = [
  {
    label: 'Every number',
    value:
      'States its baseline and timeframe. “+43.5%” always says from what, and over how long.',
  },
  {
    label: 'Every source',
    value:
      'Named on the page — client CRM, Search Console, citation tracker. Enforced by the publishing model, not promised in a footnote.',
  },
  {
    label: 'Every client',
    value:
      'A real industrial distributor or technical B2B operator. Named with consent, or anonymized under NDA — reference calls on request.',
  },
]

export default async function CaseStudiesPage() {
  let studies: CaseStudyCardData[] = []
  try {
    studies = await getAllCaseStudies()
  } catch (err) {
    console.warn('[case studies hub] Sanity fetch failed:', err)
  }

  // Lead with the featured study (falls back to the first) as the hub anchor;
  // the rest fill the grid below.
  const featured = studies.find((s) => s.featured) ?? studies[0]
  const rest = featured ? studies.filter((s) => s._id !== featured._id) : []
  const count = studies.length

  return (
    <>
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: business.url },
          { name: 'Case Studies', url: `${business.url}/case-studies/` },
        ])}
      />

      <SectionRail tone="paper" size="lg">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Case studies · Industrial distribution &amp; technical B2B
          </p>
          <h1 className="mt-4 font-display text-balance text-5xl font-semibold leading-[1.06] tracking-[-0.02em] text-ink-900 sm:text-6xl">
            The work, with receipts.{' '}
            <span className="text-ink-500">Baselines, timeframes, sources.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-700">
            Every study here is a mid-market industrial distributor or technical
            B2B operator — large SKU catalogs, losing ground in organic and AI
            search. Each one states where the client started, what we ran, how
            long it took, and how every number was measured.
          </p>
        </div>

        {/* The proof standard — the differentiator, stated as a standard,
            not buried as fine print. */}
        <div className="mt-14 border-t border-rule pt-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            {count > 0 ? `${count} engagements · ` : ''}The standard every page is held to
          </p>
          <dl className="mt-6 grid gap-y-8 sm:grid-cols-3 sm:gap-x-0 sm:divide-x sm:divide-rule">
            {PROOF_STANDARDS.map((s, i) => (
              <div key={s.label} className={i > 0 ? 'sm:pl-8' : 'sm:pr-8'}>
                <dt className="font-display text-base font-semibold text-ink-900">
                  {s.label}
                </dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-ink-700">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </SectionRail>

      {studies.length === 0 ? (
        <>
          <SectionRail tone="paper" size="sm">
            <div className="border border-rule bg-surface p-10">
              <p className="text-ink-700">
                Case studies are being prepared for publication. In the
                meantime, engagement references are available on request —{' '}
                <a
                  href="/book-growth-call/"
                  className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
                >
                  book a call
                </a>{' '}
                and ask.
              </p>
            </div>
          </SectionRail>
          <FinalCTARail />
        </>
      ) : (
        <>
          {featured && <CaseStudyFeature study={featured} />}

          {rest.length > 0 && (
            <SectionRail tone="paper">
              <div className="max-w-3xl">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                  More case studies
                </p>
                <h2 className="mt-3 font-display text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.015em] text-ink-900 sm:text-4xl">
                  Other distributors.{' '}
                  <span className="text-ink-500">Same standard of proof.</span>
                </h2>
              </div>
              <ul className="mt-12 grid gap-6 md:grid-cols-2 md:gap-8">
                {rest.map((study) => (
                  <CaseStudyCard key={study._id} study={study} />
                ))}
              </ul>
            </SectionRail>
          )}

          <CaseStudyCTA />
        </>
      )}
    </>
  )
}
