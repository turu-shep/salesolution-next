import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { SectionRail } from '@/components/layout/SectionRail'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { getTool } from '@/components/tools/registry'
import { JsonLd } from '@/components/seo/JsonLd'
import { business } from '@/lib/business'
import { breadcrumbListSchema, softwareToolSchema } from '@/lib/schema'
import { TOOL_PAGES, getToolPage } from '@/lib/tools/pages'

type Props = { params: Promise<{ tool: string }> }

export function generateStaticParams() {
  return TOOL_PAGES.map((t) => ({ tool: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool } = await params
  const meta = getToolPage(tool)
  if (!meta) return { title: 'Not found' }
  return {
    title: meta.metaTitle,
    description: meta.metaDescription,
    alternates: { canonical: `${business.url}/tools/${tool}/` },
  }
}

export const revalidate = 3600

export default async function ToolPage({ params }: Props) {
  const { tool } = await params
  const meta = getToolPage(tool)
  if (!meta) notFound()
  const Tool = getTool(meta.toolKey)
  if (!Tool) notFound()

  return (
    <>
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: `${business.url}/` },
          { name: 'Tools', url: `${business.url}/tools/` },
          { name: meta.name, url: `${business.url}/tools/${tool}/` },
        ])}
      />
      <JsonLd
        data={softwareToolSchema({
          name: meta.name,
          slug: tool,
          description: meta.metaDescription,
        })}
      />

      <SectionRail tone="paper">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            <Link
              href="/tools/"
              className="underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
            >
              Free tools
            </Link>
          </p>
          <h1 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            {meta.name}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-700">{meta.intro}</p>
        </div>

        <div className="mt-10 max-w-2xl">
          <Tool />
        </div>

        {meta.related.length > 0 && (
          <div className="mt-12 max-w-2xl border-t border-rule pt-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              The concepts behind it
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {meta.related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/glossary/${r.slug}/`}
                    className="text-sm font-medium text-brand-600 underline decoration-transparent underline-offset-[4px] transition-colors duration-200 hover:decoration-brand-600"
                  >
                    {r.term}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </SectionRail>

      <FinalCTARail />
    </>
  )
}
