import type { Metadata } from 'next'

import { LeakConceptsShowcase } from '@/components/sections/revenue-engine/leak-concepts/LeakConceptsShowcase'

/**
 * Internal review page: four candidate replacements for the Revenue Engine
 * "TheLeak" block, shown side by side with a vertical switch. Not linked in nav
 * and noindex — delete once a concept is chosen and wired into TheLeak.
 */
export const metadata: Metadata = {
  title: 'Leak block — concept review',
  robots: { index: false, follow: false },
}

export default function LeakConceptsPage() {
  return (
    <>
      <div className="h-1.5 w-full bg-brand-600" aria-hidden />
      <LeakConceptsShowcase />
    </>
  )
}
