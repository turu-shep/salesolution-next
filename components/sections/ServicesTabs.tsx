'use client'

import Link from 'next/link'
import { useState } from 'react'

import { SectionRail } from '@/components/layout/SectionRail'
import { CompositeBar } from '@/components/services/CompositeBar'
import { SERVICE_CLASSES, type ServiceKey } from '@/components/services/service-colors'
import { cn } from '@/lib/cn'

/**
 * Home § 04 — Six services, one team.
 *
 * Surfaces all five productized services as service-colored tabs (per the
 * 2026-05 color system rollout), plus a Full Growth Ownership callout
 * below for buyers who want everything coordinated under one operator.
 *
 * Each tab uses its destination service's identity color on the active
 * underline + the artifact strip, so the buyer can visually thread the
 * homepage to the detail page they end up on.
 */

type ServiceTabKey = Exclude<ServiceKey, 'composite'>

type Item = { title: string; body: string }
type Tab = {
  key: ServiceTabKey
  label: string
  title: string
  description: string
  detailHref: string
  items: Item[]
}

const TABS: Tab[] = [
  {
    key: 'search',
    label: 'AI Search & GEO',
    title: 'Be cited inside AI Overviews, not just ranked underneath.',
    description:
      'Schema rewrites, citation engineering, AIO-aware paid acceleration. The gravity well — most engagements start here because schema + citation work produces the fastest visible wins.',
    detailHref: '/services/ai-seo/',
    items: [
      { title: 'Advanced schema', body: 'Product specs, compatibility matrices, technical documentation marked up for LLM comprehension.' },
      { title: 'Citation engineering', body: 'Engineered to be the source AI Overviews and ChatGPT cite ahead of the manufacturer.' },
      { title: 'B2B feed engineering', body: 'Google Merchant Center, Amazon Business, Thomasnet, GlobalSpec — feed quality, not just feed coverage.' },
      { title: 'AIO-aware PPC', body: 'Bid and creative adapted to AIO-triggering queries; conversational long-tail coverage.' },
    ],
  },
  {
    key: 'catalog',
    label: 'Catalog AI',
    title: 'Product catalogs rewritten at SKU scale.',
    description:
      'AI-drafted product descriptions, schema, FAQ blocks, and internal linking — with senior-editor review on every product at Pro tier. Built for industrial distributors with 1,000+ SKUs.',
    detailHref: '/services/catalog-ai/',
    items: [
      { title: 'AI-drafted descriptions', body: '200–800 word product descriptions structured for AIO citation, in your brand voice.' },
      { title: '100% editor review (Pro)', body: 'Senior editors review every product before delivery. Not sampled QA — every page.' },
      { title: 'Schema + FAQ at scale', body: 'Product + Offer + FAQ + HowTo + technicalSpec schema, 4–6 FAQ pairs per product.' },
      { title: 'CRM-format delivery', body: 'Shopify CSV, Magento XML, BigCommerce, or custom — we map to your import.' },
    ],
  },
  {
    key: 'editorial',
    label: 'Editorial Authority',
    title: 'Pillar pages and category content. Senior writers, no LLM drafting.',
    description:
      'Pillar pages, cluster posts, engineering Q&A hubs, and category-level content written by senior subject-matter writers. The layer above the catalog — built to be cited, not just published.',
    detailHref: '/services/editorial-authority/',
    items: [
      { title: 'Pillar + cluster system', body: '3,000–6,000 word pillars supported by 6–16 clusters per category. Built for AIO citation.' },
      { title: 'Engineering Q&A hubs', body: 'Long-tail technical and problem-solution content that captures B2B intent before the click.' },
      { title: 'No LLM ghostwriting', body: '78% of LLM-drafted content earns zero AIO citations in 90 days. We don’t ship work that doesn’t earn its keep.' },
      { title: 'Editorial calendars', body: 'Monthly topic research, schema, and 12-month plans. Volume discounts at 6 and 12 months.' },
    ],
  },
  {
    key: 'dev',
    label: 'Website Development',
    title: 'Performance-engineered e-commerce. You own the code.',
    description:
      'Headless Next.js, Shopify Plus, or WooCommerce. Core Web Vitals committed in the SOW, schema baked in, plugin-thin by policy. Zero-lock-in clause in every SOW since 2021.',
    detailHref: '/services/website-development-design-services/',
    items: [
      { title: 'Core Web Vitals SLA', body: 'LCP < 2.0s, INP < 200ms, CLS < 0.05 — committed in the SOW, held for 30 days post-launch.' },
      { title: 'AIO-ready from commit 1', body: 'Schema graph (Product, Offer, FAQ, HowTo, Breadcrumb), entity disambiguation, machine-readable answer blocks.' },
      { title: 'B2B checkout', body: 'Quote requests, PO processing, net terms, multi-user accounts — built for procurement workflows.' },
      { title: 'Own the code', body: 'Git repo in your org, hosting in your account, credentials handed over on launch day.' },
    ],
  },
  {
    key: 'outbound',
    label: 'Outbound Email',
    title: 'Deliverability-first cold outbound for technical B2B.',
    description:
      'Sender-reputation engineering, hand-built lists, multi-touch sequences with branching logic. We don’t spray-and-pray; we engineer the infrastructure so replies land.',
    detailHref: '/services/outbound-email-marketing-services/',
    items: [
      { title: 'Sender domain engineering', body: '2–5 dedicated outbound domains, 4-week warm-up, isolated IP pools. Your primary domain stays clean.' },
      { title: 'Vertical-specific lists', body: 'Hand-built ICP lists from primary sources. No bought databases, no spray contact buys.' },
      { title: 'Multi-touch sequences', body: '5-touch sequences with branching logic. We report sends, positive replies, meetings, sourced pipeline.' },
      { title: 'Honest reply targets', body: '8–15% positive reply rate by week six. Under 5% means the offer or list needs work — we say so.' },
    ],
  },
]

const ARTIFACT: Record<ServiceTabKey, React.ReactNode> = {
  search: <SchemaArtifact />,
  catalog: <CatalogArtifact />,
  editorial: <CitationArtifact />,
  dev: <CWVArtifact />,
  outbound: <DeliverabilityArtifact />,
}

function ArtifactShell({
  label,
  meta,
  accentClass,
  children,
}: {
  label: string
  meta?: string
  accentClass: string
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-md border border-white/10 bg-black/30 backdrop-blur">
      <div className={cn('h-1', accentClass)} aria-hidden />
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
          {label}
        </span>
        {meta && (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
            {meta}
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function SchemaArtifact() {
  return (
    <ArtifactShell label="schema.org/Product · JSON-LD" meta="excerpt" accentClass="bg-service-search-500">
      <pre className="overflow-x-auto font-mono text-[12px] leading-relaxed text-ink-300">
        <code>
          <span className="text-ink-500">{'{'}</span>
          {'\n  '}
          <span className="text-service-search-500">&quot;@type&quot;</span>: <span className="text-data-up">&quot;Product&quot;</span>,
          {'\n  '}
          <span className="text-service-search-500">&quot;name&quot;</span>: <span className="text-data-up">&quot;1/2&quot; NPT–JIC Fitting&quot;</span>,
          {'\n  '}
          <span className="text-service-search-500">&quot;brand&quot;</span>: <span className="text-data-up">&quot;Parker Hannifin&quot;</span>,
          {'\n  '}
          <span className="text-service-search-500">&quot;sku&quot;</span>: <span className="text-data-up">&quot;P-37-NPT-08&quot;</span>,
          {'\n  '}
          <span className="text-service-search-500">&quot;offers&quot;</span>: <span className="text-ink-500">{'{'}</span>
          {'\n    '}
          <span className="text-service-search-500">&quot;price&quot;</span>: <span className="text-data-up">&quot;24.50&quot;</span>,
          {'\n    '}
          <span className="text-service-search-500">&quot;availability&quot;</span>: <span className="text-data-up">&quot;InStock&quot;</span>
          {'\n  '}
          <span className="text-ink-500">{'}'}</span>
          {'\n'}
          <span className="text-ink-500">{'}'}</span>
        </code>
      </pre>
      <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
        <svg className="h-3.5 w-3.5 text-data-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-data-up">
          AIO-parseable · 9/9 required properties
        </span>
      </div>
    </ArtifactShell>
  )
}

function CatalogArtifact() {
  return (
    <ArtifactShell label="Catalog rewrite · before / after" meta="1 SKU sample" accentClass="bg-service-catalog-500">
      <div className="space-y-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">Before · manufacturer copy</p>
          <p className="mt-2 text-sm text-ink-300">
            1/2&quot; NPT-to-JIC hydraulic adapter. 37° flare. Steel.
          </p>
        </div>
        <div className="border-t border-white/10 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-service-catalog-500">After · Pro tier rewrite</p>
          <p className="mt-2 text-sm text-ink-200">
            Carbon steel adapter connecting 1/2&quot; female NPT to male JIC 37° flare. Used in high-pressure hydraulic systems above 3,000 PSI where a secure metal-to-metal seal is required — pumps, presses, mobile equipment.
          </p>
        </div>
        <div className="border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
          + 4 FAQ pairs, application content, structured schema. <span className="text-service-catalog-500">100% editor reviewed.</span>
        </div>
      </div>
    </ArtifactShell>
  )
}

function CitationArtifact() {
  return (
    <ArtifactShell label="AI Overview · citation slot" meta="ranked #1" accentClass="bg-service-editorial-500">
      <p className="text-sm leading-relaxed text-ink-200">
        For high-pressure hydraulic systems, JIC fittings are ideal due to their
        37° flare seal design.{' '}
        <span className="rounded-[3px] bg-service-editorial-500/20 px-1.5 py-0.5 font-semibold text-service-editorial-500 ring-1 ring-service-editorial-500/40">
          Northern Hydraulics
        </span>
        <sup className="ml-0.5 font-mono text-[10px] text-service-editorial-500">[1]</sup>{' '}
        notes that the 1/2&quot; NPT-to-JIC adapter is the most commonly
        specified connector above 3,000 PSI.
      </p>

      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
          Citation rank · last 28 days
        </p>
        <ul className="mt-3 space-y-2 font-mono text-[11px]">
          <li className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-white">
              <span className="rounded-[2px] bg-service-editorial-500 px-1 text-[9px] text-white">[1]</span>
              northernhydraulics.com
            </span>
            <span className="text-ink-400">87%</span>
          </li>
          <li className="flex items-center justify-between text-ink-400">
            <span className="flex items-center gap-2">
              <span>[2]</span>
              parker.com
            </span>
            <span>9%</span>
          </li>
          <li className="flex items-center justify-between text-ink-400">
            <span className="flex items-center gap-2">
              <span>[3]</span>
              eaton.com
            </span>
            <span>4%</span>
          </li>
        </ul>
      </div>
    </ArtifactShell>
  )
}

function CWVArtifact() {
  const metrics = [
    { label: 'LCP',  value: '1.4s',  target: '< 2.0s', pct: 70 },
    { label: 'INP',  value: '142ms', target: '< 200ms', pct: 71 },
    { label: 'CLS',  value: '0.02',  target: '< 0.05', pct: 40 },
  ]
  return (
    <ArtifactShell label="Core Web Vitals · 4-build median" meta="CrUX p75" accentClass="bg-service-dev-500">
      <ul className="space-y-4">
        {metrics.map((m) => (
          <li key={m.label} className="grid grid-cols-12 items-center gap-3">
            <span className="col-span-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
              {m.label}
            </span>
            <div className="col-span-6 h-2 overflow-hidden bg-white/10">
              <div className="h-full bg-service-dev-500" style={{ width: `${m.pct}%` }} />
            </div>
            <span className="col-span-2 text-right font-mono text-[11px] tabular-nums text-white">
              {m.value}
            </span>
            <span className="col-span-2 text-right font-mono text-[10px] tabular-nums text-data-up">
              {m.target}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
        SLA in every SOW. <span className="text-data-up">Held for 30 days post-launch.</span>
      </div>
    </ArtifactShell>
  )
}

function DeliverabilityArtifact() {
  const items = [
    { label: 'SPF / DKIM / DMARC', status: 'PASS' },
    { label: 'Sender reputation',  status: '94 / 100' },
    { label: 'Spam complaint rate', status: '0.02%' },
    { label: 'Inbox placement',    status: '96%' },
  ]
  return (
    <ArtifactShell label="Sender health · week 5" meta="2 domains" accentClass="bg-service-outbound-500">
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.label} className="flex items-center justify-between border-b border-white/10 pb-2 last:border-b-0 last:pb-0">
            <span className="text-sm text-ink-200">{it.label}</span>
            <span className="font-mono text-[11px] tabular-nums text-service-outbound-500">{it.status}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
        Reply rate target · <span className="text-service-outbound-500">8–15%</span> by week six.
      </div>
    </ArtifactShell>
  )
}

export function ServicesTabs({ id }: { id?: string }) {
  const [active, setActive] = useState<ServiceTabKey>(TABS[0].key)
  const tab = TABS.find((t) => t.key === active) ?? TABS[0]
  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
          What we ship
        </p>
        <h2 className="mt-3 font-display text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.015em] text-white sm:text-4xl">
          Six services. <span className="text-ink-400">One operator-led team.</span>
        </h2>
      </div>

      {/* Tab rail — active tab gets a thicker color underline + faint background
          tint so the selected state is unmistakable at a glance. */}
      <div
        role="tablist"
        aria-label="Service practice areas"
        className="mt-10 flex flex-wrap gap-x-2 gap-y-1 border-b border-white/15"
      >
        {TABS.map((t) => {
          const isActive = t.key === tab.key
          const c = SERVICE_CLASSES[t.key]
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`servicetab-${t.key}`}
              aria-controls={`servicepanel-${t.key}`}
              aria-selected={isActive}
              onClick={() => setActive(t.key)}
              className={cn(
                'group relative -mb-px inline-flex cursor-pointer items-center gap-2 px-3 py-3 font-display text-sm font-semibold transition-colors duration-200',
                isActive ? 'text-white' : 'text-ink-300 hover:text-white',
              )}
            >
              <span aria-hidden className={cn('inline-block h-2 w-2 rounded-full', c.dot)} />
              {t.label}
              <span
                aria-hidden
                className={cn(
                  'absolute inset-x-0 bottom-0 h-[3px] transition-colors',
                  isActive ? c.bg500 : 'bg-transparent',
                )}
              />
            </button>
          )
        })}
      </div>

      {/* All five panels render into the DOM; inactive ones use the `hidden`
          attribute (display:none) rather than being unmounted. That keeps every
          service's copy AND its detail-page link in the server-rendered HTML, so
          crawlers and AI answer engines see all five — not just the active tab.
          The wrapping panel carries no display utility, so [hidden] wins. */}
      <div className="mt-10">
        {TABS.map((t) => (
          <div
            key={t.key}
            id={`servicepanel-${t.key}`}
            role="tabpanel"
            aria-labelledby={`servicetab-${t.key}`}
            hidden={t.key !== tab.key}
          >
            {/* `min-w-0` on both columns so the JSON-LD <pre> artifact's intrinsic
                min-content can't push the grid track past its track-size cap. */}
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
              <div className="min-w-0 lg:col-span-6">
                <h3 className="font-display text-2xl font-semibold leading-[1.15] tracking-[-0.01em] text-white sm:text-[2rem]">
                  {t.title}
                </h3>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-300">
                  {t.description}
                </p>
                <Link
                  href={t.detailHref}
                  className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline decoration-white/30 underline-offset-[6px] transition-colors duration-200 hover:decoration-white hover:decoration-2"
                >
                  See the {t.label} page
                  <span aria-hidden>→</span>
                </Link>
              </div>

              {/* Artifact: a small visual proof of what the practice produces.
                  This replaces the redundant 4-bullet capability grid — the detail
                  page already covers capabilities; the homepage tab should tease. */}
              <div className="min-w-0 lg:col-span-6">{ARTIFACT[t.key]}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Growth Ownership callout — the 6th service, surfaced below the
          five productized tabs because it's a different shape (coordinated
          multi-service engagement) and shouldn't share the tab UI. */}
      <div className="mt-16 overflow-hidden border border-white/10 bg-black/30 backdrop-blur">
        <CompositeBar weight="hero" />
        <div className="grid gap-6 px-6 py-7 md:grid-cols-12 md:items-center md:gap-8 md:px-8">
          <div className="md:col-span-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
              The sixth service
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
              Need all five coordinated under one operator?
            </h3>
            <p className="mt-3 max-w-2xl text-ink-300">
              Full Growth Ownership runs AI search, catalog, editorial,
              dev, and outbound as a single accountable engagement.
              Fractional GTM Engineer (Shape A) from $20K/mo, or 4-in-1
              Coordinated Retainer (Shape B) from $12K/mo.
            </p>
          </div>
          <div className="md:col-span-4 md:text-right">
            <Link
              href="/services/full-growth-ownership/"
              data-cta="full_growth_ownership__home_tabs"
              data-cta-location="mid_body"
              className="inline-flex items-center gap-1.5 rounded-[4px] border border-white/30 bg-transparent px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:border-white hover:bg-white/5"
            >
              See Full Growth Ownership
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </SectionRail>
  )
}
