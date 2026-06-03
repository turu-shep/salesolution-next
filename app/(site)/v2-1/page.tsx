import type { Metadata } from 'next'

import { HomeV2Activity } from '@/components/sections/v2-1/HomeV2Activity'
import { HomeV2Calculator } from '@/components/sections/v2-1/HomeV2Calculator'
import { HomeV2CaseStudy } from '@/components/sections/v2-1/HomeV2CaseStudy'
import { HomeV2Comparison } from '@/components/sections/v2-1/HomeV2Comparison'
import { HomeV2FAQ } from '@/components/sections/v2-1/HomeV2FAQ'
import { HomeV2FinalCTA } from '@/components/sections/v2-1/HomeV2FinalCTA'
import { HomeV2Hero } from '@/components/sections/v2-1/HomeV2Hero'
import { HomeV2ServicesGrid } from '@/components/sections/v2-1/HomeV2ServicesGrid'
import { JsonLd } from '@/components/seo/JsonLd'
import { serviceSchema } from '@/lib/schema'

/**
 * /v2-1/ — experimental conversion-optimized homepage.
 *
 * This is an A/B test page. The canonical homepage at `/` is untouched.
 * The page is intentionally noindex/nofollow so search engines don't see
 * a competing homepage with the same intent.
 *
 * Section order (per v2-1 spec):
 *   1. Hero — trust strip + scarcity + TL;DR + 2 CTAs
 *   2. Interactive SKU price calculator (the conversion key)
 *   3. 6-service scannable grid with VISIBLE prices
 *   4. "Last 30 days" recent work activity strip
 *   5. Northern Hydraulics one-screen case study
 *   6. 4-row compressed comparison vs typical agency
 *   7. 5-question compressed FAQ
 *   8. Dual-CTA close (PDF download vs book a call)
 */
export const metadata: Metadata = {
  title: 'Salesolution · Industrial e-commerce growth, priced in public',
  description:
    'AI search, catalog rewrites, editorial authority, dev, and outbound for industrial distributors. From $3/SKU. Free catalog snapshot. Live pricing calculator. 30-second self-qualify.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://salesolution.net/v2-1/' },
}

export default function HomeV2Page() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Salesolution — Industrial e-commerce growth',
          description:
            'AI search engineering, catalog rewrites at SKU scale, editorial authority content, performance e-commerce builds, and deliverability-first outbound for industrial distributors with $2-25M ARR.',
          category: 'Digital Marketing',
        })}
      />

      {/* Internal-reviewer banner — flags this as the A/B test page. */}
      <div className="bg-warning-50 py-2">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-700">
            Experimental layout &middot; A/B test version &middot;{' '}
            <span className="text-ink-500">noindex</span>
          </p>
        </div>
      </div>

      <HomeV2Hero />
      <HomeV2Calculator />
      <HomeV2ServicesGrid />
      <HomeV2Activity />
      <HomeV2CaseStudy />
      <HomeV2Comparison />
      <HomeV2FAQ />
      <HomeV2FinalCTA />
    </>
  )
}
