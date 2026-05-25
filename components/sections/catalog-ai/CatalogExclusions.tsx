import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/catalog-ai/ § 8 — What's explicitly not included.
 *
 * Scope creep kills productized services. Stating exclusions on the page
 * builds trust (we know what we are and aren't) and pre-empts negotiation
 * over things that should never be in scope. Same across all three tiers.
 */

const EXCLUSIONS = [
  'Custom development outside CRM format mapping',
  'Product photography or image generation',
  'Video production',
  'Ad copy or campaign management',
  'General SEO consulting beyond the catalog',
  'Platform migrations (Shopify → Magento, etc.)',
  'Site redesigns or theme work',
  'More than 3 rounds of voice/style revisions on the brand training sample',
  'Translation to non-English languages (separate add-on at $0.50 / SKU)',
  'Manual fact-checking against your internal databases (we use source data you provide)',
]

export function CatalogExclusions() {
  return (
    <SectionRail tone="paper">
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Scope guardrails
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          What we won&rsquo;t do. <span className="text-ink-500">Same across all three tiers.</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Stated on the page so it&rsquo;s already settled before the
          proposal. If you need something below, we&rsquo;ll point you at
          who actually does it well.
        </p>
      </div>

      <ul className="mt-12 grid gap-px border border-rule bg-rule md:grid-cols-2">
        {EXCLUSIONS.map((item) => (
          <li
            key={item}
            className="flex items-start gap-4 bg-surface p-5"
          >
            <span
              aria-hidden
              className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ink-400/15 text-ink-500"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-2.5 w-2.5"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </svg>
            </span>
            <span className="text-sm text-ink-700">{item}</span>
          </li>
        ))}
      </ul>
    </SectionRail>
  )
}
