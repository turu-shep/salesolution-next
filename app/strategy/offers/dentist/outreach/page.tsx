import Link from 'next/link'

import { MarkdownDoc } from '@/components/sales/MarkdownDoc'
import { DENTIST_OUTREACH_MANUAL_MD } from '@/lib/strategy/docs/dentist-outreach-manual'

export const metadata = { title: 'Dentist outreach manual' }

export default function DentistOutreachManualPage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/strategy" className="text-ink-400 hover:text-ink-700">
          Strategy
        </Link>
        <span className="text-ink-300">/</span>
        <Link href="/strategy/offers/dentist/" className="text-ink-400 hover:text-ink-700">
          Dentist offer
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">Outreach manual</span>
      </div>
      <MarkdownDoc markdown={DENTIST_OUTREACH_MANUAL_MD} />
    </div>
  )
}
