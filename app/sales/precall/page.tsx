import Link from 'next/link'

import { MarkdownDoc } from '@/components/sales/MarkdownDoc'
import { PRECALL_MD } from '@/lib/sales/docs/precall'

export const metadata = { title: 'Pre-call scanner' }

export default function PrecallScannerPage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/sales" className="text-ink-400 hover:text-ink-700">
          Sales HQ
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">Pre-call scanner</span>
      </div>
      <MarkdownDoc markdown={PRECALL_MD} />
    </div>
  )
}
