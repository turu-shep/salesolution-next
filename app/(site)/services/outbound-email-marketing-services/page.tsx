import type { Metadata } from 'next'

import { FAQ, type QA } from '@/components/sections/FAQ'
import { FinalCTARail } from '@/components/sections/FinalCTARail'
import { DeliverabilityPillars } from '@/components/sections/outbound-email/DeliverabilityPillars'
import { DeliverabilityReality } from '@/components/sections/outbound-email/DeliverabilityReality'
import { DeliverabilityScorePanel } from '@/components/sections/outbound-email/DeliverabilityScorePanel'
import { OutboundComparison } from '@/components/sections/outbound-email/OutboundComparison'
import { OutboundEngagement } from '@/components/sections/outbound-email/OutboundEngagement'
import { SequenceFramework } from '@/components/sections/outbound-email/SequenceFramework'
import { ServicesHero } from '@/components/sections/services/ServicesHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { serviceSchema } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Outbound Email Marketing Services',
  description:
    'Hand-crafted outbound email campaigns that read like a peer — not an SDR sequence. Targeted lists, deliverability-first infrastructure, measurable replies.',
  alternates: { canonical: 'https://salesolution.net/services/outbound-email-marketing-services/' },
}

const OUTBOUND_FAQ: QA[] = [
  {
    q: 'Is cold email legal in 2026?',
    a: (
      <>
        <p>
          Yes &mdash; under CAN-SPAM in the US (clear sender identification,
          working opt-out, relevance), and under GDPR / PECR in the EU and UK
          via the legitimate-interest basis with documented suppression.
          Compliance setup is part of the engagement, not an upsell.
        </p>
      </>
    ),
  },
  {
    q: 'Will this hurt our domain reputation?',
    a: (
      <>
        <p>
          No. We never send from your primary domain. Every engagement starts
          with two to five dedicated outbound domains, four-week warm-up, and
          isolated IP pools. Your{' '}
          <em className="not-italic font-semibold text-ink-900">acme.com</em>{' '}
          stays clean for internal mail and transactional traffic.
        </p>
      </>
    ),
  },
  {
    q: 'What reply rate is realistic?',
    a: (
      <>
        <p>
          On a well-defined technical-B2B ICP with a relevant offer,{' '}
          <em className="not-italic font-semibold text-ink-900">8–15% positive reply rate</em>{' '}
          is the band we target by week six. Under 5% means the offer or the
          list needs work &mdash; we&rsquo;ll say so in the diagnostic instead
          of running a second pilot.
        </p>
      </>
    ),
  },
  {
    q: 'Why don\'t you report open rates?',
    a: (
      <>
        <p>
          Apple Mail Privacy Protection (2021) and Gmail&rsquo;s image proxy
          made open tracking statistically unreliable across every iOS device
          and most consumer email apps. Reporting opens today is reporting
          noise. We report sends, positive replies, booked meetings, and
          sourced pipeline &mdash; the metrics that survive an MQL audit.
        </p>
      </>
    ),
  },
  {
    q: 'Can we own the playbook ourselves after?',
    a: (
      <>
        <p>
          Yes &mdash; sequences, lists, deliverability infrastructure, and the
          monitoring stack are all documented and transferred. Most clients
          run with us for two to four quarters and either bring outbound
          in-house from there or graduate to the embedded program with a
          dedicated head-of-outbound seat.
        </p>
      </>
    ),
  },
  {
    q: 'Do you work with our CRM and sales engagement tool?',
    a: (
      <>
        <p>
          Yes. We&rsquo;ve shipped against HubSpot, Salesforce, Pipedrive, and
          Attio on the CRM side, and Smartlead, Instantly, Lemlist, Outreach,
          and Salesloft on the sending side. The infrastructure layer is
          platform-agnostic by design &mdash; you keep the data, we run the
          pipes.
        </p>
      </>
    ),
  },
  {
    q: 'What ICPs do you not work with?',
    a: (
      <>
        <p>
          We don&rsquo;t run B2C, e-commerce DTC, or under-$10k ACV high-velocity
          outbound &mdash; the volume math wants a different agency. We also
          decline anything in the consumer-finance, supplements, or
          gambling categories. Everything else inside technical-B2B is on the
          table.
        </p>
      </>
    ),
  },
  {
    q: 'How fast can we start?',
    a: (
      <>
        <p>
          15-minute call this week &rarr; one-page diagnostic + SOW within 48
          hours of fit confirmation &rarr; domain setup the same week &rarr;
          first production sends after the four-week warm-up. Total runway to
          first reply data: six to seven weeks. Faster than that is somebody
          skipping the deliverability layer.
        </p>
      </>
    ),
  },
]

export default function OutboundEmailServicePage() {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Outbound Email Marketing',
          description:
            'Deliverability-first cold outbound for technical B2B. Hand-built lists, sender-reputation engineering, multi-touch sequences with branching logic, and honest reporting on replies and sourced pipeline.',
          category: 'Digital Marketing',
        })}
      />

      <ServicesHero
        eyebrow="Services / Outbound email"
        title="Outbound that reads like a peer,"
        titleAccent="not an SDR sequence."
        lede={
          <>
            Deliverability-first cold outbound for technical B2B.
            Sender-reputation engineering, hand-built lists, multi-touch
            sequences with branching logic, and honest reporting on replies
            and sourced pipeline &mdash; one operator-led team, no agency
            layer.
          </>
        }
        primaryCta={{ label: 'Book a strategy call', href: '/book-growth-call/' }}
        secondaryCta={{ label: 'Skip to pilot pricing', href: '#engagement' }}
        anchors={[
          { label: 'Why most fail', href: '#reality' },
          { label: 'Approach', href: '#approach' },
          { label: 'Deliverability', href: '#deliverability' },
          { label: 'Sequence', href: '#sequence' },
          { label: 'Comparison', href: '#comparison' },
          { label: 'Engagement', href: '#engagement' },
          { label: 'FAQ', href: '#faq' },
        ]}
        serviceName="outbound-email-marketing-services"
        serviceCategory="email"
      />

      <DeliverabilityReality id="reality" />

      <DeliverabilityPillars id="approach" />

      <DeliverabilityScorePanel id="deliverability" />

      <SequenceFramework id="sequence" />

      <OutboundComparison id="comparison" />

      <OutboundEngagement id="engagement" />

      <FAQ
        id="faq"
        eyebrow="Outbound FAQ"
        headline={
          <>
            Questions <span className="text-ink-500">on the work itself.</span>
          </>
        }
        kicker="Compliance, reputation, what realistic reply rates look like. No marketing softening."
        items={OUTBOUND_FAQ}
      />

      <FinalCTARail />
    </>
  )
}
