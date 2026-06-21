import Link from 'next/link'

import { MarkdownDoc } from '@/components/sales/MarkdownDoc'
import { COMPLIANCE_MD } from '@/lib/sales/docs/compliance'

export const metadata = { title: 'Compliance' }

export default function CompliancePage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/sales" className="text-ink-400 hover:text-ink-700">
          Sales HQ
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">Compliance</span>
      </div>
      <MarkdownDoc markdown={COMPLIANCE_MD} />
    </div>
  )
}
