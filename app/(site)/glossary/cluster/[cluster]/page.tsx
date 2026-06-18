import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { GlossaryCardGrid } from '@/components/sections/glossary/GlossaryCardGrid'
import { SectionRail } from '@/components/layout/SectionRail'
import { JsonLd } from '@/components/seo/JsonLd'
import { business } from '@/lib/business'
import {
  CLUSTER_INDEX_THRESHOLD,
  GLOSSARY_CLUSTERS,
  getClusterMeta,
} from '@/lib/glossary-config'
import { breadcrumbListSchema, clusterDefinedTermSetSchema } from '@/lib/schema'
import { getAllGlossaryTerms, type GlossaryTermCard } from '@/sanity/lib/glossary'

type Props = { params: Promise<{ cluster: string }> }

/** All five clusters are known at build time (pure config — no Sanity needed). */
export function generateStaticParams() {
  return GLOSSARY_CLUSTERS.map((c) => ({ cluster: c.value }))
}

async function clusterTerms(cluster: string): Promise<GlossaryTermCard[]> {
  const terms = await getAllGlossaryTerms().catch(() => [])
  return terms.filter((t) => t.cluster === cluster)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cluster } = await params
  const meta = getClusterMeta(cluster)
  if (!meta) return { title: 'Not found' }

  // Same quality gate as the hub: a thin cluster page stays out of the index.
  const count = (await clusterTerms(cluster)).length
  const live = count >= CLUSTER_INDEX_THRESHOLD

  return {
    title: meta.metaTitle,
    description: meta.metaDescription,
    alternates: { canonical: `${business.url}/glossary/cluster/${cluster}/` },
    robots: live ? undefined : { index: false, follow: true },
  }
}

export const revalidate = 3600

export default async function GlossaryClusterPage({ params }: Props) {
  const { cluster } = await params
  const meta = getClusterMeta(cluster)
  if (!meta) notFound()

  const terms = await clusterTerms(cluster)
  // No empty cluster pages — fall through to a 404 until the cluster has content.
  if (terms.length === 0) notFound()

  return (
    <>
      <JsonLd
        data={breadcrumbListSchema([
          { name: 'Home', url: `${business.url}/` },
          { name: 'Glossary', url: `${business.url}/glossary/` },
          { name: meta.label, url: `${business.url}/glossary/cluster/${cluster}/` },
        ])}
      />
      <JsonLd
        data={clusterDefinedTermSetSchema({
          label: meta.label,
          cluster,
          terms: terms.map((t) => ({
            term: t.term,
            slug: t.slug,
            definition: t.shortDefinition,
          })),
        })}
      />

      <SectionRail tone="paper">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            <Link
              href="/glossary/"
              className="underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
            >
              Glossary
            </Link>{' '}
            <span aria-hidden className="text-ink-300">
              /
            </span>{' '}
            {meta.label}
          </p>
          <h1 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
            {meta.label}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-700">{meta.intro}</p>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            {terms.length} {terms.length === 1 ? 'term' : 'terms'}
          </p>
        </div>

        <div className="mt-12">
          <GlossaryCardGrid terms={terms} headingLevel="h2" />
        </div>

        <p className="mt-10">
          <Link
            href="/glossary/"
            className="font-display text-sm font-semibold text-brand-600 underline decoration-transparent underline-offset-[5px] transition-colors duration-200 hover:decoration-brand-600"
          >
            &larr; All glossary terms
          </Link>
        </p>
      </SectionRail>

      <FinalCTARail />
    </>
  )
}
