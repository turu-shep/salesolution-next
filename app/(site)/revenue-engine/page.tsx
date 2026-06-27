import type { Metadata } from 'next'
import Link from 'next/link'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { AuditCTA } from '@/components/sections/revenue-engine/AuditCTA'
import { Guarantee } from '@/components/sections/revenue-engine/Guarantee'
import { PlanByPillar } from '@/components/sections/revenue-engine/PlanByPillar'
import { RevenueHero } from '@/components/sections/revenue-engine/RevenueHero'
import { RevenuePricing } from '@/components/sections/revenue-engine/RevenuePricing'
import { TheLeak } from '@/components/sections/revenue-engine/TheLeak'
import { TwoRevenueLines } from '@/components/sections/revenue-engine/TwoRevenueLines'
import { FlowBlock } from '@/components/sections/revenue-engine/flow-concepts/FlowBlock'
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
    q: 'Is my patient data safe to run through this?',
    a: (
      <>
        <p>
          Yes. Every tool that touches patient records runs under a signed
          compliance agreement &mdash; call tracking, texts, and CRM. The full
          detail is on the{' '}
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

// Generic, vertical-agnostic plan content for the pillar (PlanByPillar defaults to
// roofing). The 5 steps grouped under Bring / Convert / Retain.
const PILLAR_GROUPS = [
  {
    pillar: 'Bring',
    outcome: 'Get found when they’re looking',
    steps: [
      {
        key: 'Capture',
        what: 'Show up on Google, Maps, and your own pages when someone nearby searches your trade — with an easy way to reach you. New demand, brought to your door.',
        metric: 'More of the right searches turn into calls',
      },
    ],
  },
  {
    pillar: 'Convert',
    outcome: 'Win the ones who reach you',
    steps: [
      {
        key: 'Respond',
        what: 'Every call answered, 24/7 — even when you’re with a customer. Missed calls get an instant text back, every form a reply in under a minute, and a caller can always reach a human.',
        metric: 'No job lost to a missed call or a slow reply',
      },
      {
        key: 'Book',
        what: 'Jobs and appointments qualified and booked straight to your calendar, with reminders so they show. Every call recorded and sorted, so nothing slips.',
        metric: 'More of the leads you have turn into booked work',
      },
    ],
  },
  {
    pillar: 'Retain',
    outcome: 'Bring them back',
    steps: [
      {
        key: 'Recover',
        what: 'The quotes and plans that went cold get chased automatically, past customers get a reason to come back, and a steady stream of reviews lifts you in local search.',
        metric: 'Revenue won back from work you already earned',
      },
    ],
  },
]

const PILLAR_PROVE = {
  key: 'Prove',
  what: 'A dispute-proof log of every call, and a monthly dashboard showing what the system brought in — on its own line, separate from your ads.',
  metric: 'What the system earned, against the fee',
}

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
        eyebrow={'For roofers, dentists & local shops'}
        title="Get found. Win the sale. Keep them coming back."
        lede={
          <>
            The phone rings while you&rsquo;re on a roof or with a patient, and
            it goes to voicemail. You pay for leads nobody calls back. You send
            the quote and never hear back. At month&rsquo;s end you can&rsquo;t
            say what your marketing actually did.
          </>
        }
        primaryCta={{ label: 'Book a Revenue Leak Audit', href: '#audit' }}
        founder={{
          name: 'Artur Shepel',
          src: '/artur-shepel-480.webp',
          caption: 'I run every account myself.',
          specs: [
            { label: 'Setup', value: '90 days, one-time fee' },
            { label: 'Minimum', value: '3 months' },
            { label: 'Lock-in', value: 'none' },
          ],
        }}
        selfQualifiers={[
          { label: 'I run a clinic or practice', href: '/revenue-engine/medical/' },
          { label: "I'm a contractor", href: '/revenue-engine/home-services/' },
          { label: 'I run a shop or brand', href: '/revenue-engine/local-retail/' },
        ]}
        anchors={[
          { label: 'The leak', href: '#leak' },
          { label: 'The plan', href: '#how' },
          { label: 'Proof', href: '#prove' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'FAQ', href: '#faq' },
        ]}
      />

      {/* 2 — THE LEAK (the villain; make them feel the bleed first) */}
      <TheLeak id="leak" />

      {/* 3 — THE FIX: "you've been sold pieces / I run the whole flow" (the mechanism) */}
      <div id="flow">
        <FlowBlock />
      </div>

      {/* 4 — THE PLAN: the five steps grouped under Bring / Convert / Retain */}
      <PlanByPillar id="how" groups={PILLAR_GROUPS} prove={PILLAR_PROVE} />

      {/* 5 — HOW I REPORT IT (the method, dark) — closer hands into the guarantee */}
      <TwoRevenueLines id="prove" />

      {/* 6 — GUARANTEE (dark, abutted — reads as one conviction field with the report) */}
      <Guarantee id="guarantee" abut />

      {/* 7 — OFFER (the price, now that the risk is reversed) */}
      <RevenuePricing id="pricing" />

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
        kicker="Lead-volume promises, shared leads, patient privacy. Straight answers."
        items={REVENUE_ENGINE_FAQ}
      />

      {/* 8 — FREE-AUDIT CLOSE (one confident step, no re-fork) */}
      <AuditCTA id="audit" />
    </>
  )
}
