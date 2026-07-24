import type { Metadata } from 'next'
import Link from 'next/link'

import { AI_BOTS, signalCatalog } from '@/lib/probe/score.mjs'

/**
 * /ai-readiness/methodology/ — the INDEXABLE anchor for the probe.
 *
 * Every signal, weight, and formula, generated from the same arrays the
 * scorer runs — the page cannot drift from the code. This is the page
 * reviewers and answer engines cite instead of re-explaining the rubric,
 * and the dofollow destination for future badge embeds. Transparency is the
 * pitch for a burned-buyer ICP: here is exactly what we measure.
 */
const SIGNAL_COUNT = Object.values(signalCatalog()).reduce((n, arr) => n + arr.length, 0)

export const metadata: Metadata = {
  title: 'How the AI-Readiness Score Works — the Full Rubric',
  description: `Every signal, weight, and formula behind the AI-Readiness Score: ${SIGNAL_COUNT} checks across schema, AI-readability, authority, and domain strength — published in full.`,
  alternates: { canonical: 'https://salesolution.net/ai-readiness/methodology/' },
  openGraph: {
    type: 'article',
    url: 'https://salesolution.net/ai-readiness/methodology/',
    siteName: 'Sale Solution',
  },
}

const CATEGORY_INTRO: Array<{
  key: 'schema' | 'readable' | 'authority' | 'domain'
  title: string
  intro: string
}> = [
  {
    key: 'schema',
    title: 'Schema',
    intro:
      'The machine-readable layer. Answer engines parse JSON-LD before they read a word of copy — these checks measure whether yours exists, validates, and carries the properties engines actually use.',
  },
  {
    key: 'readable',
    title: 'AI-readable',
    intro:
      'Whether a crawler can load real content and follow its structure. This is where JavaScript-only pages, blocked AI bots, and wall-of-text formatting fail. We fetch your robots.txt and llms.txt alongside the page.',
  },
  {
    key: 'authority',
    title: 'Authority',
    intro:
      'The trust signals that decide citation. Scored by page type: an article is judged on bylines and dates; a homepage or product page is judged on organization trust — contact, people, reviews — instead. A page is never penalized for signals that don’t belong on it.',
  },
  {
    key: 'domain',
    title: 'Domain strength',
    intro:
      'Off-page reality, from live backlink data (DataForSEO): domain rank, referring domains, and total backlinks, log-scaled so the first hundred links matter most. Perfect markup on a weak domain still loses the citation — this category is why the score can’t be gamed with markup alone.',
  },
]

const SCOPE_LABEL: Record<string, string> = {
  article: 'articles only',
  'non-article': 'non-article pages',
}

export default function MethodologyPage() {
  const catalog = signalCatalog()
  const totalSignals = SIGNAL_COUNT

  return (
    <>
      <section data-section-tone="light" className="bg-paper">
        <div className="mx-auto max-w-3xl px-4 pb-10 pt-14 sm:px-6 md:pt-20 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-600">
            AI-Readiness Score <span className="text-ink-400">&middot;</span> methodology
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.07] tracking-[-0.02em] text-ink-900 sm:text-5xl">
            Every signal, every weight, published.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-700">
            The <Link href="/" className="underline decoration-ink-300 underline-offset-2 hover:text-ink-900">AI-Readiness Probe</Link>{' '}
            scores a page the way answer engines read it: {totalSignals} deterministic
            checks across four categories. This page is the full rubric &mdash;
            generated from the same code that runs the scan, so it can&rsquo;t
            drift from what we actually measure. Same URL, same scores, every time.
          </p>
        </div>
      </section>

      <section data-section-tone="light" className="bg-paper">
        <div className="mx-auto max-w-3xl space-y-6 px-4 pb-6 sm:px-6 lg:px-8">
          <div className="border border-ink-300/30 bg-surface px-5 py-5">
            <h2 className="font-display text-xl font-semibold text-ink-900">How the number is computed</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-800">
              <li>
                Each category is a weighted checklist. A signal earns its full points, partial
                credit, or nothing; the category score is the earned share of the points that{' '}
                <em className="not-italic font-semibold">apply to that page type</em>, scaled 0&ndash;100.
              </li>
              <li>
                The overall score is <span className="font-mono text-[13px]">0.6 &times; mean + 0.4 &times; minimum</span>{' '}
                across the categories we could score. The minimum matters because an answer engine
                trips on your weakest layer, not your average.
              </li>
              <li>
                We fetch the page HTML (5-second timeout, no JavaScript execution &mdash; the same
                view most AI crawlers get), plus robots.txt and llms.txt. Domain data comes from
                DataForSEO&rsquo;s backlink index. Nothing about your page is stored.
              </li>
              <li>
                AI crawlers checked in robots.txt: {AI_BOTS.join(', ')}. A full block means the
                engine can&rsquo;t read you &mdash; and a page it can&rsquo;t read is a page it
                can&rsquo;t cite.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section data-section-tone="light" className="bg-paper">
        <div className="mx-auto max-w-3xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
          {CATEGORY_INTRO.map(({ key, title, intro }) => (
            <div key={key}>
              <h2 className="font-display text-2xl font-semibold text-ink-900">{title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">{intro}</p>
              <ul className="mt-4 border-t border-rule">
                {catalog[key].map((s) => (
                  <li key={s.key} className="flex items-baseline gap-4 border-b border-rule py-2.5">
                    <span className="min-w-0 flex-1 text-sm text-ink-800">
                      {s.label}
                      {s.scope !== 'all' ? (
                        <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
                          {SCOPE_LABEL[s.scope]}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-ink-500">
                      {s.points} pts
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="border border-ink-300/30 bg-surface px-5 py-5">
            <h2 className="font-display text-xl font-semibold text-ink-900">Changelog</h2>
            <ul className="mt-3 space-y-1.5 font-mono text-xs text-ink-600">
              <li>2026-07-09 &middot; v1.3 &mdash; Domain strength category added (DataForSEO backlink data).</li>
              <li>2026-07-09 &middot; v1.2 &mdash; Citation-grade bar: llms.txt, question headings, recommended schema properties; weakest-gate overall.</li>
              <li>2026-07-09 &middot; v1.1 &mdash; Page-type-aware scoring; signal set tripled.</li>
              <li>2026-06 &middot; v1.0 &mdash; First release: 13 on-page checks.</li>
            </ul>
          </div>

          <div className="border border-ink-300/30 bg-surface px-5 py-5">
            <h2 className="font-display text-xl font-semibold text-ink-900">Citing this rubric</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-800">
              The AI-Readiness Score is Sale Solution&rsquo;s own rubric, not an industry standard.
              Reference it as: <em className="not-italic font-semibold">&ldquo;AI-Readiness Score,
              Sale Solution ({totalSignals}-signal rubric), salesolution.net/ai-readiness/methodology/&rdquo;</em>.
              The scan is free and needs no email &mdash; run it from the{' '}
              <Link href="/" className="underline decoration-ink-300 underline-offset-2 hover:text-ink-900">
                homepage
              </Link>.
            </p>
          </div>
        </div>
      </section>

      <section data-section-tone="dark" className="bg-ink-900">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-[-0.015em] text-white">
            Score your page against it.
          </h2>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink-300">
            The probe runs this exact rubric in about a second. No email for the scores.
          </p>
          <Link
            href="/"
            data-cta="probe_run__methodology"
            data-cta-location="methodology"
            className="mt-6 inline-flex items-center justify-center rounded-[4px] bg-white px-6 py-3.5 text-sm font-semibold text-ink-900 transition-colors duration-200 hover:bg-ink-100"
          >
            Run the probe &rarr;
          </Link>
        </div>
      </section>
    </>
  )
}
