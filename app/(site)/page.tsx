import type { Metadata } from 'next'

import { DemandSystem } from '@/components/sections/DemandSystem'
import { Evidence } from '@/components/sections/Evidence'
import { FAQ } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { FrameworkTimeline } from '@/components/sections/FrameworkTimeline'
import { GoalIndex } from '@/components/sections/GoalIndex'
import { HeroProbe } from '@/components/sections/HeroProbe'
import { Operator } from '@/components/sections/Operator'
import { ProblemShift } from '@/components/sections/ProblemShift'
import { Signals } from '@/components/sections/Signals'
import { WhoWeServe } from '@/components/sections/WhoWeServe'

export const metadata: Metadata = {
  // Layout template appends "· Sale Solution" — don't repeat the brand here.
  title: 'Revenue systems for businesses that sell parts, book jobs, and fill chairs',
  description:
    'Win the customers you already pay for. We get industrial and local-service businesses named by AI — and stop the calls, quotes, and leads they miss.',
  alternates: { canonical: 'https://salesolution.net/' },
  openGraph: {
    type: 'website',
    url: 'https://salesolution.net/',
    siteName: 'Sale Solution',
    locale: 'en_US',
  },
}

export default function HomePage() {
  return (
    <>
      <HeroProbe />
      <DemandSystem id="demand-system" />
      <ProblemShift />
      <WhoWeServe />
      <FrameworkTimeline />
      <GoalIndex />
      <Evidence />
      <Operator />
      <Signals />
      <FAQ />
      <FinalCTARail />
    </>
  )
}
