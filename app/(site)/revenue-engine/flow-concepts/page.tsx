import type { Metadata } from 'next'

import { FlowConceptsShowcase } from '@/components/sections/revenue-engine/flow-concepts/FlowConceptsShowcase'

/**
 * Internal review page: four candidate "Bring -> Sell -> Retain" intro blocks
 * (the reframed engine-vs-fuel beat), shown one after another. Not linked in
 * nav and noindex — delete once a concept is chosen and wired in.
 */
export const metadata: Metadata = {
  title: 'Bring · Sell · Retain — concept review',
  robots: { index: false, follow: false },
}

export default function FlowConceptsPage() {
  return (
    <>
      <div className="h-1.5 w-full bg-brand-600" aria-hidden />
      <FlowConceptsShowcase />
    </>
  )
}
