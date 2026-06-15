import type { Metadata } from 'next'
import Link from 'next/link'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { AuditCTA } from '@/components/sections/revenue-engine/AuditCTA'
import { EngineVsFuel } from '@/components/sections/revenue-engine/EngineVsFuel'
import { FiveSteps } from '@/components/sections/revenue-engine/FiveSteps'
import { Guarantee } from '@/components/sections/revenue-engine/Guarantee'
import { RevenuePricing } from '@/components/sections/revenue-engine/RevenuePricing'
import { TheLeak } from '@/components/sections/revenue-engine/TheLeak'
import { TwoRevenueLines } from '@/components/sections/revenue-engine/TwoRevenueLines'
import { VerticalFork } from '@/components/sections/revenue-engine/VerticalFork'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Revenue Engine · Convert demand into booked revenue',
  description:
    'A done-for-you AI revenue system for local service businesses. It answers every call 24/7, replies to every lead in under 60 seconds, books appointments, and recovers revenue from cold estimates and dormant customers — proven in a dashboard that separates system-driven from media-driven revenue.',
  alternates: { canonical: 'https://salesolution.net/revenue-engine/' },
}

const REVENUE_ENGINE_FAQ: QA[] = [
  {
    q: 'I already have an ads agency. Does this replace them?',
    a: (
      <>
        <p>
          No. Keep your ads guy. I run the engine that makes his leads
          convert: the calls get answered, the form fills get a reply in
          seconds, the cold estimates get chased. Your ad account stays
          yours, at cost, with zero markup.
        </p>
      </>
    ),
  },
  {
    q: 'Will the AI sound robotic?',
    a: (
      <>
        <p>
          A caller can always reach a human. The AI handles the calls you
          are missing today, after hours and during the rush. We A/B the
          scripts against real call recordings and tune them every week.
        </p>
      </>
    ),
  },
  {
    q: 'What happens if I cancel?',
    a: (
      <>
        <p>
          After the 3-month minimum you can leave with 30 days&rsquo;
          notice. The honest part: the system is licensed during the
          engagement, so the automations switch off when it ends. You keep
          your ad account, your data, and your Google Business Profile.
        </p>
      </>
    ),
  },
  {
    q: 'Is this HIPAA-compliant for a dental practice?',
    a: (
      <>
        <p>
          Yes. The dental stack runs BAAs on every tool that touches patient
          data: call tracking, SMS, and CRM. The compliance detail is on the{' '}
          <Link
            href="/revenue-engine/dentists/"
            className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[3px] hover:text-brand-600 hover:decoration-brand-600"
          >
            dental page
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    q: 'Do you guarantee a number of leads?',
    a: (
      <>
        <p>
          No. I guarantee system-attributed revenue against my fee. Lead
          volume promises are how lead vendors sell you shared, unworked
          contacts. The engine is measured on revenue you can see in your
          own dashboard.
        </p>
      </>
    ),
  },
]

export default function RevenueEnginePage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Revenue Engine',
          // This page lives at /revenue-engine/, not /services/revenue-engine/,
          // so pass the real URL to keep @id/url aligned with the canonical above.
          url: 'https://salesolution.net/revenue-engine/',
          description:
            'A done-for-you AI revenue system for local service businesses (home-services contractors and dental practices). Captures, responds, books, recovers, and proves — separating system-driven from media-driven revenue.',
          category: 'Marketing',
        })}
      />

      <div className="h-1.5 w-full bg-brand-600" aria-hidden />

      <ServicesHero
        eyebrow="Revenue Engine"
        title="Your ads aren't the problem."
        titleAccent="What happens after the phone rings is."
        lede={
          <>
            A done-for-you AI revenue system for local service businesses.
            It answers every call 24/7, replies to every lead in under 60
            seconds, books the appointment, and recovers revenue from cold
            estimates and dormant customers &mdash; then proves it in a
            dashboard that separates system-driven from media-driven revenue.
          </>
        }
        primaryCta={{ label: 'Book a Revenue Leak Audit', href: '#audit' }}
        secondaryCta={{ label: 'See the 5-step system', href: '#system' }}
        anchors={[
          { label: 'The leak', href: '#leak' },
          { label: 'Engine vs fuel', href: '#engine' },
          { label: 'The system', href: '#system' },
          { label: 'Proof', href: '#prove' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />

      <TheLeak id="leak" />
      <EngineVsFuel id="engine" />
      <FiveSteps id="system" />
      <TwoRevenueLines id="prove" />
      <VerticalFork id="verticals" />
      <RevenuePricing id="pricing" />
      <Guarantee id="guarantee" />

      <FAQ
        id="faq"
        eyebrow="Revenue Engine FAQ"
        headline={
          <>
            Questions <span className="text-ink-500">before the audit.</span>
          </>
        }
        kicker="Ads agencies, AI scripts, cancellation, HIPAA, lead-volume promises. Straight answers."
        items={REVENUE_ENGINE_FAQ}
      />

      <AuditCTA id="audit" />
    </>
  )
}
