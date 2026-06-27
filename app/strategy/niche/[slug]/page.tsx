import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { NicheBriefView } from '@/components/strategy/NicheBrief'
import { getBrief } from '@/lib/strategy/niches/data'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const brief = getBrief(slug)
  return { title: brief ? `${brief.industry} — niche brief` : 'Niche brief' }
}

export default async function NicheBriefPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const brief = getBrief(slug)
  if (!brief) notFound()
  return <NicheBriefView brief={brief} />
}
