import Link from 'next/link'

import { DrillApp } from '@/components/sales/drill/DrillApp'

export const metadata = { title: 'Drill' }

export default function DrillPage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/sales" className="text-ink-400 hover:text-ink-700">
          Sales HQ
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">Drill</span>
      </div>
      <DrillApp />
    </div>
  )
}
