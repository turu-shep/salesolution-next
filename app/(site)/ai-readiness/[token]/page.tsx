import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'

import { AIReadPanel } from '@/components/probe/AIReadPanel'
import { ShareRow } from '@/components/probe/ShareRow'
import { getDomainMetrics } from '@/lib/probe/domain'
import { fetchHtml, fetchRobotsTxt, hasLlmsTxt, looksLikeBotWall, validateProbeUrl } from '@/lib/probe/fetch'
import { incrCounter } from '@/lib/probe/gate-server'
import { consume } from '@/lib/probe/limits.mjs'
import { computeScores } from '@/lib/probe/score.mjs'
import { decodeProbeToken } from '@/lib/probe/token'
import { cn } from '@/lib/cn'

/**
 * /ai-readiness/[token]/ — the probe's full report.
 *
 * The token encodes the scored URL (lib/probe/token.ts); nothing is stored.
 * Every view re-runs the deterministic scan, so a shared link never expires
 * and always shows the page as AI crawlers see it right now. Personal,
 * shareable, and noindex — it must never enter the sitemap or nav.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { token: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { token } = await params
  const url = decodeProbeToken(token)
  let host = ''
  try {
    host = url ? new URL(url).hostname : ''
  } catch {
    /* keep '' */
  }
  return {
    title: host ? `AI-Readiness Report — ${host}` : 'AI-Readiness Report',
    robots: { index: false, follow: false },
  }
}

const PAGE_TYPE_LABEL: Record<string, string> = {
  home: 'Homepage',
  product: 'Product / category page',
  article: 'Article',
  generic: 'Page',
}

const CATEGORY_META: Record<'schema' | 'readable' | 'authority' | 'domain', { title: string; blurb: string }> = {
  schema: {
    title: 'Schema',
    blurb: 'The machine-readable layer. This is what an answer engine parses before it reads a word of your copy.',
  },
  readable: {
    title: 'AI-readable',
    blurb: 'Whether a crawler can load real content and follow its structure. Blocked bots and JavaScript-only pages fail here.',
  },
  authority: {
    title: 'Authority',
    blurb: 'The trust signals that decide whether you get cited or skipped. Scored for this page type.',
  },
  domain: {
    title: 'Domain strength',
    blurb: 'Off-page reality: rank, referring domains, and backlinks. Perfect markup on a weak domain still loses the citation.',
  },
}

export default async function AiReadinessReportPage({ params }: { params: Promise<Params> }) {
  const { token } = await params

  const rawUrl = decodeProbeToken(token)
  if (!rawUrl) {
    return (
      <ErrorShell
        eyebrow="Broken link"
        headline="This report link doesn't decode."
        body="The address was probably truncated when it was copied. Run the score again and grab a fresh link."
      />
    )
  }

  const validated = await validateProbeUrl(rawUrl)
  if (!validated.ok) {
    return (
      <ErrorShell
        eyebrow="Can't score that"
        headline="That URL can't be scanned."
        body={validated.error}
      />
    )
  }

  const pageUrl = validated.url.toString()
  const host = validated.url.hostname

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? '0.0.0.0'
  const limit = await consume('probe', ip, incrCounter)
  if (!limit.ok) {
    return (
      <ErrorShell
        eyebrow={host}
        headline="Too many reports from your network."
        body="This page re-scans the site on every open, and your network has opened a lot of them in the last hour. The link keeps working — try it again in a bit."
      />
    )
  }

  let scores: ReturnType<typeof computeScores>
  try {
    const [{ html }, robotsTxt, llmsTxt, domainMetrics] = await Promise.all([
      fetchHtml(pageUrl),
      fetchRobotsTxt(validated.url.origin),
      hasLlmsTxt(validated.url.origin),
      getDomainMetrics(validated.url.hostname),
    ])
    scores = computeScores(html, pageUrl, { robotsTxt, llmsTxt, domainMetrics })
  } catch (err) {
    if (looksLikeBotWall(err)) {
      return (
        <ErrorShell
          eyebrow={host}
          headline="Your site turned our scanner away."
          body="Its bot protection served a block page instead of content. AI crawlers like GPTBot and ClaudeBot hit that same wall, and a page they can't load is a page they can't cite. That's finding number one, and it's fixable."
          cta={{ href: auditHref(host), label: 'Get the full audit →', dataCta: 'audit__probe_report' }}
        />
      )
    }
    return (
      <ErrorShell
        eyebrow={host}
        headline="We couldn't reach that page."
        body="The site didn't answer within five seconds, or returned something that isn't a web page. Try again in a minute, or score a different page of the same site."
      />
    )
  }

  const tier = scores.overall >= 85 ? 'clear' : scores.overall >= 55 ? 'gaps' : 'risk'
  const tierStyle = {
    clear: { pill: 'bg-data-up/10 text-data-up ring-data-up/30', label: 'On track' },
    gaps: { pill: 'bg-accent-50 text-accent-700 ring-accent-500/30', label: 'Gaps' },
    risk: { pill: 'bg-danger-50 text-data-down ring-data-down/30', label: 'At risk' },
  }[tier]

  const categories = (
    ['schema', 'readable', 'authority', 'domain'] as const
  ).filter((cat) => scores.details[cat] !== undefined)

  const misses = categories
    .flatMap((cat) =>
      (scores.details[cat] ?? [])
        .filter((s) => s.earned < s.points)
        .map((s) => ({ ...s, category: CATEGORY_META[cat].title, lost: s.points - s.earned })),
    )
    .sort((a, b) => b.lost - a.lost)
    .slice(0, 5)

  return (
    <>
      {/* Header — the verdict */}
      <section data-section-tone="light" className="bg-paper">
        <div className="mx-auto max-w-4xl px-4 pb-12 pt-14 sm:px-6 md:pt-20 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-600">
            AI-Readiness Report <span className="text-ink-400">&middot;</span> scored live just now
          </p>
          <h1 className="mt-4 break-words font-display text-4xl font-semibold leading-[1.07] tracking-[-0.02em] text-ink-900 sm:text-5xl">
            {host}
          </h1>
          <p className="mt-3 break-all font-mono text-xs text-ink-500">{pageUrl}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-rule-strong bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-700">
              Scored as: {PAGE_TYPE_LABEL[scores.pageType] ?? 'Page'}
            </span>
          </div>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-y border-rule py-6">
            <div className="flex items-center gap-4">
              <span className="font-display text-7xl font-semibold leading-none tracking-[-0.02em] text-ink-900">
                {scores.overall}
              </span>
              <span
                className={cn(
                  'inline-flex items-center rounded-[3px] px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] ring-1 ring-inset',
                  tierStyle.pill,
                )}
              >
                {tierStyle.label}
              </span>
            </div>
            <div className="flex min-w-[240px] flex-1 flex-col gap-2.5 sm:max-w-sm">
              <MiniBar label="Schema" value={scores.schema} />
              <MiniBar label="AI-readable" value={scores.readable} />
              <MiniBar label="Authority" value={scores.authority} />
              {typeof scores.domain === 'number' ? (
                <MiniBar label="Domain" value={scores.domain} />
              ) : null}
            </div>
          </div>

          <ShareRow />
        </div>
      </section>

      {/* Fix these first */}
      {misses.length > 0 && (
        <section data-section-tone="light" className="bg-paper">
          <div className="mx-auto max-w-4xl px-4 pb-4 sm:px-6 lg:px-8">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              Fix these first
            </h2>
            <ol className="mt-4 space-y-3">
              {misses.map((m, i) => (
                <li key={m.key} className="flex items-baseline gap-4 border-b border-rule pb-3">
                  <span className="font-mono text-xs text-ink-400">{String(i + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink-900">{m.label}</p>
                    <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
                      {m.category}
                    </p>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-data-down">
                    &minus;{Math.round(m.lost)} pts
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* The AI read — gated layer */}
      <section data-section-tone="light" className="bg-paper">
        <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
          <AIReadPanel pageUrl={pageUrl} auditHref={auditHref(host, scores.overall)} />
        </div>
      </section>

      {/* Full breakdown */}
      <section data-section-tone="light" className="bg-paper">
        <div className="mx-auto max-w-4xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
          {categories.map((cat) => (
            <div key={cat} className="border border-ink-300/30 bg-surface">
              <div className="flex items-baseline justify-between gap-4 border-b border-rule px-5 py-4">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink-900">
                    {CATEGORY_META[cat].title}
                  </h2>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-600">
                    {CATEGORY_META[cat].blurb}
                  </p>
                </div>
                <span className="font-display text-3xl font-semibold tabular-nums text-ink-900">
                  {scores[cat] ?? 0}
                  <span className="text-base font-normal text-ink-400">/100</span>
                </span>
              </div>
              <ul>
                {(scores.details[cat] ?? []).map((s) => {
                  const status = s.earned >= s.points ? 'pass' : s.earned > 0 ? 'partial' : 'miss'
                  return (
                    <li
                      key={s.key}
                      className="flex items-center gap-3 border-b border-rule px-5 py-2.5 last:border-b-0"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'h-2 w-2 shrink-0 rounded-full',
                          status === 'pass' && 'bg-data-up',
                          status === 'partial' && 'bg-accent-500',
                          status === 'miss' && 'bg-data-down',
                        )}
                      />
                      <span className="min-w-0 flex-1 text-sm text-ink-800">{s.label}</span>
                      <span className="font-mono text-xs tabular-nums text-ink-500">
                        {Math.round(s.earned)}/{s.points}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}

          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
            This link re-runs the scan on every open &middot; always current &middot; your scan isn&rsquo;t stored
            &middot;{' '}
            <Link href="/ai-readiness/methodology/" className="underline decoration-ink-300 underline-offset-2 transition-colors hover:text-ink-700">
              How the scoring works
            </Link>
          </p>
        </div>
      </section>

      {/* The door */}
      <section data-section-tone="dark" className="bg-ink-900">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-[-0.015em] text-white sm:text-4xl">
            The score flags the gaps. The audit names the fix.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-300">
            A written diagnosis of {host} by a senior strategist &mdash; what&rsquo;s
            costing you citations, in what order to fix it, and what to ignore.
            Free, yours to keep, back to you in 24 hours.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={auditHref(host, scores.overall)}
              data-cta="audit__probe_report"
              data-cta-location="probe-report"
              className="inline-flex items-center justify-center rounded-[4px] bg-white px-6 py-3.5 text-sm font-semibold text-ink-900 transition-colors duration-200 hover:bg-ink-100"
            >
              Get the full audit &rarr;
            </Link>
            <Link
              href="/"
              data-cta="probe_rescore__probe_report"
              data-cta-location="probe-report"
              className="font-mono text-[12px] uppercase tracking-[0.16em] text-ink-300 transition-colors hover:text-white"
            >
              Score another page &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function auditHref(host: string, score?: number): string {
  const params = new URLSearchParams({ site: host })
  if (typeof score === 'number') params.set('probe', String(score))
  return `/unlock-growth-audit/?${params.toString()}`
}

function MiniBar({ label, value }: { label: string; value: number }) {
  const tone = value >= 70 ? 'bg-data-up' : value >= 50 ? 'bg-brand-600' : 'bg-data-down'
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
        {label}
      </span>
      <div className="relative h-2 flex-1 overflow-hidden bg-surface-alt">
        <div className={cn('h-full', tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 text-right font-mono text-xs tabular-nums text-ink-700">{value}</span>
    </div>
  )
}

function ErrorShell({
  eyebrow,
  headline,
  body,
  cta,
}: {
  eyebrow: string
  headline: string
  body: string
  cta?: { href: string; label: string; dataCta: string }
}) {
  return (
    <section data-section-tone="light" className="bg-paper">
      <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 lg:px-8">
        <p className="break-all font-mono text-[11px] uppercase tracking-[0.2em] text-ink-500">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-ink-900">
          {headline}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-700">{body}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {cta ? (
            <Link
              href={cta.href}
              data-cta={cta.dataCta}
              data-cta-location="probe-report"
              className="inline-flex items-center justify-center rounded-[4px] bg-ink-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-ink-800"
            >
              {cta.label}
            </Link>
          ) : null}
          <Link
            href="/"
            data-cta="probe_rescore__probe_report"
            data-cta-location="probe-report"
            className="font-mono text-[12px] uppercase tracking-[0.16em] text-ink-600 transition-colors hover:text-ink-900"
          >
            Back to the probe &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
