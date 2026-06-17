import Link from 'next/link'

import { LegalTOC, type LegalTOCItem } from './LegalTOC'

/**
 * Shared shell for the three static legal documents (privacy, terms,
 * disclaimer). Quiet by design — these are documents, not landing pages.
 *
 * Structure:
 *   1. Page header — mono eyebrow (`Legal · Last updated DATE`), simple H1,
 *      short summary lede.
 *   2. Optional sticky TOC (desktop) / inline TOC (mobile) when 5+ sections.
 *   3. Prose body — max-w-prose, line-height 1.7, hand-styled (no typography
 *      plugin installed). Children are rendered inside a `.legal-prose` div;
 *      see the matching scoped styles below.
 *   4. Footer — back-to-top link + last-updated reminder.
 *
 * The light `data-section-tone="light"` ensures the global header switches
 * to its light-mode color treatment when scrolled past the hero band.
 */
export function LegalPageLayout({
  eyebrow = 'Legal',
  title,
  summary,
  lastUpdated,
  tocItems,
  children,
}: {
  eyebrow?: string
  title: string
  summary?: string
  lastUpdated: string
  tocItems?: LegalTOCItem[]
  children: React.ReactNode
}) {
  const hasTOC = (tocItems?.length ?? 0) >= 5

  return (
    // Plain wrapper, not <main> — the site layout already provides the single
    // <main> landmark, and nesting two is invalid.
    <div data-section-tone="light" className="relative bg-paper">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <header className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 md:pb-16 md:pt-24 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
            {eyebrow} <span aria-hidden className="text-ink-300">·</span>{' '}
            <span className="text-ink-500">Last updated {lastUpdated}</span>
          </p>

          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink-900 sm:text-5xl md:text-6xl">
            {title}
          </h1>

          {summary && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-700">
              {summary}
            </p>
          )}
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        {/* Mobile / tablet TOC sits above the prose so users get the map
         * before they start reading. Hidden on lg+ in favor of the sticky
         * sidebar variant. */}
        {hasTOC && tocItems && (
          <div className="mb-10 lg:hidden">
            <LegalTOC items={tocItems} variant="mobile" />
          </div>
        )}

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-12">
          <article className="legal-prose">{children}</article>

          {hasTOC && tocItems && (
            <aside className="hidden lg:block">
              <LegalTOC items={tocItems} variant="desktop" />
            </aside>
          )}
        </div>

        {/* ── Footer rail ───────────────────────────────────────────────── */}
        <footer className="mt-20 border-t border-rule pt-8 md:mt-28">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
              Last updated {lastUpdated}
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/contact-me/"
                className="text-sm font-semibold text-ink-700 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
              >
                Questions? Contact us
              </Link>
              <a
                href="#top"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-700 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
              >
                Back to top <span aria-hidden>↑</span>
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Top anchor target for the "back to top" link. */}
      <span id="top" className="sr-only" />

      {/* Scoped prose styles. The project doesn't ship @tailwindcss/typography,
       * so we hand-roll the rules here. Keeps the legal pages quiet and
       * consistent without leaking type rules to the rest of the site. */}
      <style>{`
        .legal-prose {
          max-width: 65ch;
          font-family: var(--font-sans);
          font-size: 16px;
          line-height: 1.7;
          color: var(--color-ink-700);
        }
        .legal-prose > * + * { margin-top: 1.25em; }
        .legal-prose h2 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.25;
          letter-spacing: -0.01em;
          color: var(--color-ink-900);
          margin-top: 3rem;
          padding-top: 2.5rem;
          border-top: 1px solid var(--color-rule);
          scroll-margin-top: 6rem;
        }
        .legal-prose > h2:first-child { border-top: 0; padding-top: 0; margin-top: 0; }
        .legal-prose h3 {
          font-family: var(--font-display);
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-ink-800);
          margin-top: 2rem;
          margin-bottom: 0.5rem;
          letter-spacing: -0.01em;
        }
        .legal-prose p { color: var(--color-ink-700); }
        .legal-prose strong { color: var(--color-ink-900); font-weight: 600; }
        .legal-prose a {
          color: var(--color-brand-600);
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: var(--color-rule-strong);
          transition: text-decoration-color 0.15s, color 0.15s;
        }
        .legal-prose a:hover {
          text-decoration-color: var(--color-brand-600);
        }
        .legal-prose ul, .legal-prose ol {
          padding-left: 1.5rem;
          margin-top: 0.75em;
        }
        .legal-prose ul { list-style: disc; }
        .legal-prose ol { list-style: decimal; }
        .legal-prose li { margin-top: 0.4em; padding-left: 0.25rem; }
        .legal-prose li::marker { color: var(--color-ink-500); }
        .legal-prose blockquote {
          margin: 1.5rem 0;
          padding-left: 1rem;
          border-left: 2px solid var(--color-rule-strong);
          color: var(--color-ink-500);
          font-style: italic;
        }
        .legal-prose code {
          font-family: var(--font-mono);
          font-size: 0.875em;
          background: var(--color-surface-alt);
          padding: 0.1em 0.35em;
          border-radius: var(--radius-sm);
          color: var(--color-ink-800);
        }
        .legal-prose hr {
          border: 0;
          border-top: 1px solid var(--color-rule);
          margin: 2.5rem 0;
        }
      `}</style>
    </div>
  )
}
