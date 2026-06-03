import { FAQ, type QA } from '@/components/sections/FAQ'

/**
 * /v2-1/ — Compressed 5-question FAQ.
 *
 * Down from 7-8 on the canonical homepage. Picks the five questions that
 * actually come up on the first call. Operator voice, specific answers.
 */

const FAQ_ITEMS: QA[] = [
  {
    q: 'How fast can we start?',
    a: (
      <>
        <p>
          Catalog work: 5-product snapshot back in 48 hours, signed SOW
          within a week, pilot batch (500 SKUs) shipped at day 7 of project
          start. Retainers (search, editorial, outbound) start the Monday
          after the SOW is signed.
        </p>
        <p className="mt-3">
          The bottleneck is usually your platform access (Shopify admin,
          Magento credentials, CRM SSO) &mdash; not our calendar.
        </p>
      </>
    ),
  },
  {
    q: "What's the minimum spend to engage?",
    a: (
      <>
        <p>
          Catalog AI: $3,000 minimum project (1,000 SKUs on Standard).
          Editorial: $500 single article, or $4K/mo on retainer. AI Search:
          $8K/mo retainer or $12K Sprint. Outbound: $6K/mo retainer or $9K
          Pilot. Full Growth Ownership: $12K/mo for the 4-in-1 Coordinated
          Retainer.
        </p>
        <p className="mt-3">
          Below those thresholds, the setup cost doesn&rsquo;t amortize and
          you&rsquo;re better off with a SaaS tool or freelancer.
        </p>
      </>
    ),
  },
  {
    q: 'Do you actually work with our stack? (Shopify, WooCommerce, Magento, headless)',
    a: (
      <>
        <p>
          Yes to all four, plus BigCommerce and custom carts. Catalog
          deliverables ship in your platform&rsquo;s native import format
          (Shopify CSV, Magento XML, WooCommerce XML, BigCommerce JSON, or
          custom mapping). Schema is the same across all platforms &mdash;
          we add it through your existing structured-data mechanism.
        </p>
        <p className="mt-3">
          Website dev work is Next.js / Shopify Plus / WooCommerce; we
          don&rsquo;t take Wix or Squarespace dev work.
        </p>
      </>
    ),
  },
  {
    q: "What if we're not the right fit?",
    a: (
      <>
        <p>
          We say so on the first call, before the SOW. The free snapshot
          also doubles as a fit-check &mdash; if the work doesn&rsquo;t
          look right for your catalog, we tell you and recommend a SaaS
          tool or a different vendor instead.
        </p>
        <p className="mt-3">
          The wrong-fit signals: under 500 SKUs, no e-commerce surface,
          pure-commodity products with no specification depth, or a
          marketing team that already has the work covered.
        </p>
      </>
    ),
  },
  {
    q: 'Do you sign an NDA before sharing the snapshot?',
    a: (
      <>
        <p>
          Yes, mutual NDA in 24 hours on request &mdash; or we use yours.
          The snapshot itself uses publicly-available product URLs from
          your site, so most clients don&rsquo;t feel they need one. If
          you&rsquo;re sending us internal SKU data or supplier
          relationships, the NDA goes in place first.
        </p>
      </>
    ),
  },
]

export function HomeV2FAQ() {
  return (
    <FAQ
      items={FAQ_ITEMS}
      eyebrow="Common questions"
      headline={
        <>
          What buyers ask <span className="text-ink-500">in the first call.</span>
        </>
      }
      kicker="The five most common questions. Honest answers."
    />
  )
}
