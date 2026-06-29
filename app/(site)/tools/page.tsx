import type { Metadata } from 'next'
import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { JsonLd } from '@/components/seo/JsonLd'
import { business } from '@/lib/business'
import { breadcrumbListSchema, itemListSchema } from '@/lib/schema'
import { TOOL_PAGES } from '@/lib/tools/pages'

export const metadata: Metadata = {
  title: 'Free AI-search tools',
  description:
    'Free, in-browser tools for AI search: an AI visibility calculator and a catalog AI-readiness scorecard for industrial e-commerce. No sign-up, nothing saved.',
  alternates: { canonical: `${business.url}/tools/` },
}

export const revalidate = 3600

export default function ToolsIndexPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: `${business.url}/` },
          { name: 'Tools', url: `${business.url}/tools/` },
        ])}
      />
      <JsonLd
        data={itemListSchema({
          name: 'Free AI-search tools',
          url: `${business.url}/tools/`,
          items: TOOL_PAGES.map((t) => ({ name: t.name, url: `${business.url}/tools/${t.slug}/` })),
        })}
      />

      <SectionRail tone="paper">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            Free tools
          </p>
          <h1 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            AI-search tools,{' '}
            free and in your browser.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-700">
            No sign-up, nothing saved. Calculators and scorecards for getting an industrial catalog
            found and cited in AI answers &mdash; the same tools we use in engagements.
          </p>
        </div>

        <ul className="mt-12 grid max-w-3xl gap-px overflow-hidden rounded-[4px] border border-rule bg-rule sm:grid-cols-2">
          {TOOL_PAGES.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/tools/${t.slug}/`}
                className="group flex h-full flex-col bg-surface p-6 transition-colors duration-200 hover:bg-paper"
              >
                <h2 className="font-display text-lg font-semibold tracking-[-0.01em] text-ink-900 transition-colors duration-200 group-hover:text-brand-600">
                  {t.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">{t.intro}</p>
              </Link>
            </li>
          ))}
        </ul>
      </SectionRail>

      <FinalCTARail />
    </>
  )
}
