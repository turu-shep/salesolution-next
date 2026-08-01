import Link from 'next/link'

import { DentistOfferSheet } from '@/components/strategy/DentistOfferSheet'

export const metadata = { title: 'Dentist offer' }

export default function DentistOfferPage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/strategy" className="text-ink-400 hover:text-ink-700">
          Strategy
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">Dentist offer</span>
      </div>
      <DentistOfferSheet />
    </div>
  )
}
