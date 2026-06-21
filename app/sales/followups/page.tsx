import Link from 'next/link'

import { FollowupsView } from '@/components/sales/followups/FollowupsView'

export const metadata = { title: 'Follow-ups' }

export default function FollowupsPage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/sales" className="text-ink-400 hover:text-ink-700">
          Sales HQ
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">Follow-ups</span>
      </div>
      <FollowupsView />
    </div>
  )
}
