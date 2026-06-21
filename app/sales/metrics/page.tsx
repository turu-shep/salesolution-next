import Link from 'next/link'

import { MetricsView } from '@/components/sales/metrics/MetricsView'

export const metadata = { title: 'Metrics' }

export default function MetricsPage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/sales" className="text-ink-400 hover:text-ink-700">
          Sales HQ
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">Metrics</span>
      </div>
      <MetricsView />
    </div>
  )
}
