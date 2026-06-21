import Link from 'next/link'

import { Cockpit } from '@/components/sales/cockpit/Cockpit'

export const metadata = { title: 'Cold-Call Cockpit' }

export default function PlaybookPage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/sales" className="text-ink-400 hover:text-ink-700">
          Sales HQ
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">Cockpit</span>
      </div>
      <Cockpit />
    </div>
  )
}
