import Link from 'next/link'

import { SectionRail } from '@/components/layout/SectionRail'

/**
 * /services/catalog-ai/ § — Positioning: where AI is used, where humans are.
 *
 * Openly resolves the apparent contradiction between Catalog AI (AI-drafted)
 * and Editorial Authority (senior human writers, no LLM drafting). Two
 * side-by-side cards with service-coloured accent strips on top.
 */
export function CatalogWhereAIUsed({ id }: { id?: string }) {
  return (
    <SectionRail tone="surface" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Positioning
        </p>
        <h2 className="mt-3 font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-ink-900 sm:text-5xl">
          Where AI is used. Where humans are used.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Salesolution uses AI where it ships better outputs than humans can
          at sustainable economics. We use senior human writers where AI
          ships worse outputs than humans can, regardless of cost.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="flex flex-col border border-rule bg-paper">
          <div className="h-1 w-full bg-service-catalog-500" aria-hidden />
          <div className="flex-1 px-6 py-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              This service
            </p>
            <h3 className="mt-3 font-display text-xl font-semibold leading-snug tracking-[-0.01em] text-ink-900">
              AI-drafted, human-reviewed (this service)
            </h3>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-700">
              Product catalog at scale &mdash; descriptions, FAQs, schema,
              internal linking &mdash; for catalogs of 1,000+ SKUs where no
              human team can write 10,000 product descriptions in 30 days at
              sustainable per-product economics. AI handles drafting; human
              editors handle structural review on every product at Pro tier
              and above.
            </p>
          </div>
        </div>

        <div className="flex flex-col border border-rule bg-paper">
          <div className="h-1 w-full bg-service-editorial-500" aria-hidden />
          <div className="flex-1 px-6 py-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              Editorial Authority
            </p>
            <h3 className="mt-3 font-display text-xl font-semibold leading-snug tracking-[-0.01em] text-ink-900">
              Senior human writers, no LLM drafting
            </h3>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-700">
              Pillar pages, cluster posts, category content, engineering
              Q&amp;A hubs, trade-press bylined content. These pieces
              require argument construction, primary research, and judgment
              that AI ships worse than experienced subject-matter writers.
            </p>
            <Link
              href="/services/editorial-authority/"
              data-cta="editorial_authority__where_ai_used"
              data-cta-location="mid_body"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
            >
              See Editorial Authority
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-12 max-w-3xl text-[15px] leading-relaxed text-ink-700">
        Both services run as separate engagements. Most clients eventually
        buy both &mdash; catalog work for product pages, editorial work for
        the category and authority layer above them. The two services
        cross-link in the work they produce, which is most of the value.
      </p>
    </SectionRail>
  )
}
