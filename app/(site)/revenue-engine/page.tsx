import type { Metadata } from 'next'
import Link from 'next/link'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { AuditCTA } from '@/components/sections/revenue-engine/AuditCTA'
import { EngineVsFuel } from '@/components/sections/revenue-engine/EngineVsFuel'
import { FiveSteps } from '@/components/sections/revenue-engine/FiveSteps'
import { Guarantee } from '@/components/sections/revenue-engine/Guarantee'
import { HowItWorks } from '@/components/sections/revenue-engine/HowItWorks'
import { RevenueHero } from '@/components/sections/revenue-engine/RevenueHero'
import { RevenuePricing } from '@/components/sections/revenue-engine/RevenuePricing'
import { TheLeak } from '@/components/sections/revenue-engine/TheLeak'
import { TwoRevenueLines } from '@/components/sections/revenue-engine/TwoRevenueLines'
import { JsonLd } from '@/components/seo/JsonLd'
import { serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Revenue Engine · Convert demand into booked revenue',
  description:
    'A done-for-you system for local service businesses — roofers and dental practices. It answers every call, replies in seconds, books the job, and chases the quotes that go cold, then shows you which revenue it drove. Book a free Revenue Leak Audit.',
  alternates: { canonical: 'https://salesolution.net/revenue-engine/' },
}

const REVENUE_ENGINE_FAQ: QA[] = [
  {
    q: 'Do you guarantee a number of leads?',
    a: (
      <>
        <p>
          No. I guarantee revenue the system can prove against my fee &mdash;
          not lead counts. Volume promises are how lead vendors sell you
          shared, unworked contacts. You see the revenue in your own
          dashboard.
        </p>
      </>
    ),
  },
  {
    q: 'Is this just reselling me the same leads three other contractors got?',
    a: (
      <>
        <p>
          No. The engine works the demand you already create and the contacts
          already in your phone and CRM &mdash; your calls, your forms, your
          customers. No shared pool. Every call is recorded and logged to you.
        </p>
      </>
    ),
  },
  {
    q: 'Is this HIPAA-compliant for a dental practice?',
    a: (
      <>
        <p>
          Yes. The dental setup runs BAAs on every tool that touches patient
          data &mdash; call tracking, SMS, and CRM. The full compliance detail
          is on the{' '}
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
            'A done-for-you AI revenue system for local service businesses (home-services contractors and dental practices). It answers every call, replies in seconds, books the job, and chases the quotes that go cold — then proves the revenue it earned against the fee.',
          category: 'Marketing',
        })}
      />

      <div className="h-1.5 w-full bg-brand-600" aria-hidden />

      {/* 1 — HOOK + self-qualifier (reserved VSL slot until video is recorded) */}
      <RevenueHero
        title="Get found. Get booked. Get paid."
        titleAccent="The whole growth engine for local service businesses."
        lede={
          <>
            The phone rings while you&rsquo;re on a roof or with a patient. You
            pay for leads nobody calls back. You send the quote and never hear
            back &mdash; and you can&rsquo;t tell what your marketing actually
            did.
          </>
        }
        primaryCta={{ label: 'Book a Revenue Leak Audit', href: '#audit' }}
        selfQualifiers={[
          { label: 'I run a clinic or practice', href: '/revenue-engine/medical/' },
          { label: "I'm a contractor", href: '/revenue-engine/home-services/' },
          { label: 'I run a shop or brand', href: '/revenue-engine/local-retail/' },
        ]}
        anchors={[
          { label: 'The leak', href: '#leak' },
          { label: 'How it works', href: '#how' },
          { label: 'Proof', href: '#prove' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />

      {/* 2 — THE LEAK (the villain; make them feel the bleed first) */}
      <TheLeak id="leak" />

      {/* 3 — ENGINE VS FUEL (the guide + the mechanism that shifts belief) */}
      <EngineVsFuel id="engine" />

      {/* 4 — THE PLAN (simple 3-phase, then the machine in plain terms) */}
      <HowItWorks id="how" />
      <FiveSteps id="system" />

      {/* 5 — PROOF BY LOGIC (your own numbers, not a stock chart) */}
      <TwoRevenueLines id="prove" />

      {/* 6 — OFFER + RISK REVERSAL (model+terms, then the guarantee adjacent) */}
      <RevenuePricing id="pricing" />
      <Guarantee id="guarantee" />

      {/* 7 — SLIM FAQ (the heavy objections already died in-story) */}
      <FAQ
        id="faq"
        eyebrow="A few last questions"
        headline={
          <>
            The rest{' '}
            <span className="text-ink-500">I answered in the story above.</span>
          </>
        }
        kicker="Lead-volume promises, shared leads, HIPAA. Straight answers."
        items={REVENUE_ENGINE_FAQ}
      />

      {/* 8 — FREE-AUDIT CLOSE (one confident step, no re-fork) */}
      <AuditCTA id="audit" />
    </>
  )
}
