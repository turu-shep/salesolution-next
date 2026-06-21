import Link from 'next/link'

import { MarkdownDoc } from '@/components/sales/MarkdownDoc'
import { CADENCE_MD } from '@/lib/sales/docs/cadence'

export const metadata = { title: 'Cadence & templates' }

export default function CadencePage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/sales" className="text-ink-400 hover:text-ink-700">
          Sales HQ
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">Cadence & templates</span>
      </div>
      <MarkdownDoc markdown={CADENCE_MD} />
    </div>
  )
}
