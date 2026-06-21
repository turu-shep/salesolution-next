import Link from 'next/link'

import { MarkdownDoc } from '@/components/sales/MarkdownDoc'
import { SALES_PSYCHOLOGY_MD } from '@/lib/sales/psychology'

export const metadata = { title: 'Sales Psychology' }

export default function SalesPsychologyPage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/sales" className="text-ink-400 hover:text-ink-700">
          Sales HQ
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">Sales Psychology</span>
      </div>
      <MarkdownDoc markdown={SALES_PSYCHOLOGY_MD} />
    </div>
  )
}
