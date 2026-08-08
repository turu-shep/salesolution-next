import type { Metadata } from 'next'

import { OfferMirror } from '@/components/strategy/OfferMirror'

export const metadata: Metadata = {
  title: 'Offer Mirror',
}

export default function OfferMirrorPage() {
  return <OfferMirror />
}
