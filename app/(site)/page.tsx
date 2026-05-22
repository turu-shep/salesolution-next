import type { Metadata } from 'next'

import { EngagementModel } from '@/components/sections/EngagementModel'
import { Evidence } from '@/components/sections/Evidence'
import { FAQ } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { FrameworkTimeline } from '@/components/sections/FrameworkTimeline'
import { HeroProbe } from '@/components/sections/HeroProbe'
import { Operator } from '@/components/sections/Operator'
import { ProblemShift } from '@/components/sections/ProblemShift'
import { ServicesTabs } from '@/components/sections/ServicesTabs'
import { Signals } from '@/components/sections/Signals'

export const metadata: Metadata = {
  title: 'Digital Marketing & Sales: SEO Expert Guides and Services',
  description:
    'AI-driven SEO and Generative Engine Optimization for technical B2B and industrial e-commerce. Future-proof your organic discovery before AI Overviews eat the click.',
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
      <ProblemShift />
      <FrameworkTimeline />
      <ServicesTabs />
      <EngagementModel />
      <Evidence />
      <Operator />
      <Signals />
      <FAQ />
      <FinalCTARail />
    </>
  )
}
