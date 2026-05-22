'use client'

import Link from 'next/link'
import { useState } from 'react'

import { SectionRail } from '@/components/layout/SectionRail'
import { cn } from '@/lib/cn'

/**
 * Home § 04 — replaces the 4-up ServicesGrid + the adjacent AuthorityGEO
 * and PPC sections (both redundant on the homepage; their content lives on
 * the /services/ai-seo, /services/content-*, /services/ppc-* detail pages).
 *
 * Single tabbed block: 4 service categories surfaced as monospace tab
 * labels along a hairline rail, content swaps below. Replaces 12+ visually
 * identical white cards with one editorial slab.
 */

type Item = { title: string; body: string }
type Tab = {
  key: string
  label: string
  title: string
  description: string
  detailHref: string
  items: Item[]
}

const TABS: Tab[] = [
  {
    key: 'foundations',
    label: 'Foundations',
    title: 'AI-Ready Technical Foundations',
    description:
      'Engineering your e-commerce platform so AI crawlers can read it without ambiguity, and so AI Overviews and shopping surfaces have the structured signal they prefer to cite.',
    detailHref: '/services/ai-seo/',
    items: [
      { title: 'Advanced schema', body: 'Product specs, compatibility matrices, technical documentation marked up for LLM comprehension.' },
      { title: 'Core Web Vitals', body: 'Sub-second loads — the table-stakes preference for AI surfaces and technical buyers.' },
      { title: 'B2B feed engineering', body: 'Google Merchant Center, Amazon Business, Thomasnet, GlobalSpec — feed quality, not just feed coverage.' },
      { title: 'JS-rendered data', body: 'Real-time inventory, pricing, and spec updates that AI parsers can still consume.' },
    ],
  },
  {
    key: 'content',
    label: 'Content & Authority',
    title: 'Content Strategy for AI Visibility & Engagement',
    description:
      'Content engineered for AI scannability and citation: H-E-E-A-T signals, engineering query coverage, multimodal preparation. Past keywords, into authority.',
    detailHref: '/services/content-writing-services/',
    items: [
      { title: 'H-E-E-A-T optimization', body: 'Engineering expertise, case studies, certifications — the trust signals AI surfaces weight heavily.' },
      { title: 'Engineering query coverage', body: 'Long-tail technical and problem-solution content that captures B2B intent before the click.' },
      { title: 'AI-scannable documentation', body: 'Spec sheets, install guides, troubleshooting structured for LLM parsing.' },
      { title: 'Video & 3D model SEO', body: 'Demos, CAD previews, install videos prepared for multimodal AI surfaces.' },
    ],
  },
  {
    key: 'channels',
    label: 'Channels & Paid',
    title: 'Platform Diversification & Intelligent PPC',
    description:
      "Break single-source dependency. We extend your brand presence across the platforms technical buyers actually use — and run paid acceleration that's tuned for AI Overview ad surfaces.",
    detailHref: '/services/outbound-email-marketing-services/',
    items: [
      { title: 'YouTube technical channel', body: 'Product demos, engineering tutorials, thought leadership built for technical audiences.' },
      { title: 'Industrial marketplaces', body: 'Thomasnet, GlobalSpec, vertical directory presence engineered to convert.' },
      { title: 'LinkedIn B2B authority', body: 'Engineering community engagement, technical content distribution, lead generation.' },
      { title: 'AI-Overview-aware PPC', body: 'Bid and creative adapted to AIO-triggering queries; conversational long-tail coverage.' },
    ],
  },
  {
    key: 'conversion',
    label: 'Conversion & Data',
    title: 'Conversion, CX & First-Party Data Strategy',
    description:
      "Turn visitors into accounts. We optimize the on-site experience and the first-party data flywheel so each engagement compounds the next.",
    detailHref: '/services/website-development-design-services/',
    items: [
      { title: 'B2B checkout', body: 'Quote requests, PO processing, net terms, multi-user accounts — built for procurement workflows.' },
      { title: 'AI-powered recommendations', body: 'Compatible parts, project bundles, maintenance reminders — context-aware suggestions.' },
      { title: 'Technical-buyer intelligence', body: 'Engineer behavior tracking, spec preferences, project-based intent signals.' },
      { title: 'Community building', body: 'Forums, knowledge bases, loyalty programs for repeat technical buyers.' },
    ],
  },
]

/**
 * Per-tab artifact panel — a small visual demonstrating what the practice
 * produces. JSON-LD code for Foundations, citation card for Content, channel
 * presence for Channels, funnel for Conversion. Each lives inline because
 * each is one-off and shares the dark-tab styling context.
 */
function TabArtifact({ tabKey }: { tabKey: string }) {
  switch (tabKey) {
    case 'foundations':
      return <SchemaArtifact />
    case 'content':
      return <CitationArtifact />
    case 'channels':
      return <ChannelArtifact />
    case 'conversion':
      return <FunnelArtifact />
    default:
      return null
  }
}

function ArtifactShell({
  label,
  meta,
  children,
}: {
  label: string
  meta?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-md border border-white/10 bg-black/30 backdrop-blur">
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
    <ArtifactShell label="schema.org/Product · JSON-LD" meta="excerpt">
      <pre className="overflow-x-auto font-mono text-[12px] leading-relaxed text-ink-300">
        <code>
          <span className="text-ink-500">{'{'}</span>
          {'\n  '}
          <span className="text-accent-500">&quot;@context&quot;</span>: <span className="text-data-up">&quot;schema.org&quot;</span>,
          {'\n  '}
          <span className="text-accent-500">&quot;@type&quot;</span>: <span className="text-data-up">&quot;Product&quot;</span>,
          {'\n  '}
          <span className="text-accent-500">&quot;name&quot;</span>: <span className="text-data-up">&quot;1/2&quot; NPT–JIC Hydraulic Fitting&quot;</span>,
          {'\n  '}
          <span className="text-accent-500">&quot;brand&quot;</span>: <span className="text-data-up">&quot;Parker Hannifin&quot;</span>,
          {'\n  '}
          <span className="text-accent-500">&quot;sku&quot;</span>: <span className="text-data-up">&quot;P-37-NPT-08&quot;</span>,
          {'\n  '}
          <span className="text-accent-500">&quot;description&quot;</span>: <span className="text-data-up">&quot;37° flare seal, 3000 PSI working pressure...&quot;</span>,
          {'\n  '}
          <span className="text-accent-500">&quot;offers&quot;</span>: <span className="text-ink-500">{'{'}</span>
          {'\n    '}
          <span className="text-accent-500">&quot;@type&quot;</span>: <span className="text-data-up">&quot;Offer&quot;</span>,
          {'\n    '}
          <span className="text-accent-500">&quot;price&quot;</span>: <span className="text-data-up">&quot;24.50&quot;</span>,
          {'\n    '}
          <span className="text-accent-500">&quot;priceCurrency&quot;</span>: <span className="text-data-up">&quot;USD&quot;</span>,
          {'\n    '}
          <span className="text-accent-500">&quot;availability&quot;</span>: <span className="text-data-up">&quot;InStock&quot;</span>
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

function CitationArtifact() {
  return (
    <ArtifactShell label="AI Overview · citation slot" meta="ranked #1">
      <p className="text-sm leading-relaxed text-ink-200">
        For high-pressure hydraulic systems, JIC fittings are ideal due to their
        37° flare seal design.{' '}
        <span className="rounded-[3px] bg-accent-500/20 px-1.5 py-0.5 font-semibold text-accent-500 ring-1 ring-accent-500/40">
          Northern Hydraulics
        </span>
        <sup className="ml-0.5 font-mono text-[10px] text-accent-500">[1]</sup>{' '}
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
              <span className="rounded-[2px] bg-accent-500 px-1 text-[9px] text-white">[1]</span>
              northernhydraulics.com
            </span>
            <span className="text-ink-400">87%</span>
          </li>
          <li className="flex items-center justify-between text-ink-400">
            <span className="flex items-center gap-2">
              <span className="text-ink-400">[2]</span>
              parker.com
            </span>
            <span>9%</span>
          </li>
          <li className="flex items-center justify-between text-ink-400">
            <span className="flex items-center gap-2">
              <span className="text-ink-400">[3]</span>
              eaton.com
            </span>
            <span>4%</span>
          </li>
        </ul>
      </div>
    </ArtifactShell>
  )
}

function ChannelArtifact() {
  const channels = [
    { name: 'Thomasnet', presence: 92, kind: 'Marketplace' },
    { name: 'GlobalSpec', presence: 78, kind: 'Marketplace' },
    { name: 'LinkedIn',  presence: 88, kind: 'Authority' },
    { name: 'YouTube',   presence: 64, kind: 'Demo / Tech' },
    { name: 'Google Merchant', presence: 95, kind: 'Feed' },
  ]
  return (
    <ArtifactShell label="Channel presence · index" meta="last refresh · 12h">
      <ul className="space-y-3.5">
        {channels.map((c) => (
          <li key={c.name} className="grid grid-cols-12 items-center gap-3">
            <span className="col-span-4 truncate text-sm font-medium text-white">{c.name}</span>
            <div className="col-span-6 h-2 overflow-hidden bg-white/10">
              <div
                className="h-full bg-accent-500"
                style={{ width: `${c.presence}%` }}
              />
            </div>
            <span className="col-span-2 text-right font-mono text-[11px] tabular-nums text-ink-300">
              {c.presence}
            </span>
          </li>
        ))}
      </ul>
    </ArtifactShell>
  )
}

function FunnelArtifact() {
  const stages = [
    { label: 'Spec view',      count: 12480, pct: 100 },
    { label: 'Compat. check',  count:  4920, pct: 39 },
    { label: 'Quote request',  count:  1620, pct: 13 },
    { label: 'PO issued',      count:   312, pct: 2.5 },
  ]
  return (
    <ArtifactShell label="Technical buyer funnel · 28d" meta="qualified only">
      <ul className="space-y-3">
        {stages.map((s, i) => (
          <li key={s.label} className="grid grid-cols-12 items-center gap-3">
            <span className="col-span-4 text-sm text-white">{s.label}</span>
            <div className="col-span-5 h-3 bg-white/10">
              <div
                className={i === 0 ? 'h-full bg-brand-600' : 'h-full bg-accent-500'}
                style={{ width: `${s.pct}%` }}
              />
            </div>
            <span className="col-span-3 text-right font-mono text-[11px] tabular-nums text-ink-300">
              {s.count.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
        Conversion · Spec → PO &nbsp;·&nbsp; <span className="text-data-up">2.5%</span>
      </div>
    </ArtifactShell>
  )
}

export function ServicesTabs({ id }: { id?: string }) {
  const [active, setActive] = useState(TABS[0].key)
  const tab = TABS.find((t) => t.key === active) ?? TABS[0]

  return (
    <SectionRail tone="dark" id={id}>
      <div className="max-w-3xl">
        <h2 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.015em] text-white sm:text-5xl">
          Four practice areas. One team.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-300">
          A single engineering-and-content team across the full discovery
          stack &mdash; technical foundations, content authority, channel
          diversification, conversion data. No handoffs, no agencies of
          agencies.
        </p>
      </div>

      {/* Tab rail */}
      <div
        role="tablist"
        aria-label="Service practice areas"
        className="mt-14 flex flex-wrap gap-x-6 gap-y-1 border-b border-white/15"
      >
        {TABS.map((t) => {
          const isActive = t.key === tab.key
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.key)}
              className={cn(
                'group relative -mb-px cursor-pointer px-1 py-3 font-display text-sm font-semibold transition-colors duration-200',
                isActive ? 'text-white' : 'text-ink-300 hover:text-white',
              )}
            >
              {t.label}
              <span
                aria-hidden
                className={cn(
                  'absolute inset-x-0 bottom-0 h-px transition-colors',
                  isActive ? 'bg-accent-500' : 'bg-transparent',
                )}
              />
            </button>
          )
        })}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* `min-w-0` on both columns so the JSON-LD <pre> artifact's intrinsic
            min-content can't push the grid track past its track-size cap. */}
        <div className="min-w-0 lg:col-span-7">
          <h3 className="font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
            {tab.title}
          </h3>
          <p className="mt-4 max-w-xl text-ink-300">{tab.description}</p>
          <Link
            href={tab.detailHref}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline decoration-white/30 underline-offset-[6px] transition-colors duration-200 hover:text-accent-500 hover:decoration-accent-500"
          >
            See the {tab.label.toLowerCase()} detail page
            <span aria-hidden>→</span>
          </Link>

          <ul className="mt-10 grid gap-x-10 gap-y-7 border-t border-white/10 pt-8 sm:grid-cols-2">
            {tab.items.map((item) => (
              <li key={item.title}>
                <h4 className="font-display text-base font-semibold text-white">
                  {item.title}
                </h4>
                <p className="mt-1.5 text-sm text-ink-300">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Artifact: a small visual proof of what the practice produces */}
        <div className="min-w-0 lg:col-span-5">
          <TabArtifact tabKey={tab.key} />
        </div>
      </div>
    </SectionRail>
  )
}
