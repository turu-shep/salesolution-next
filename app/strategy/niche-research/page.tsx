import Link from 'next/link'

import { MarkdownDoc } from '@/components/sales/MarkdownDoc'
import { NICHE_RESEARCH_MD } from '@/lib/strategy/docs/niche-research'

export const metadata = { title: 'Niche research' }

export default function NicheResearchPage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/strategy" className="text-ink-400 hover:text-ink-700">
          Strategy
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">Niche research</span>
      </div>
      <MarkdownDoc markdown={NICHE_RESEARCH_MD} />
    </div>
  )
}
