import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you were looking for could not be found.',
  robots: { index: false, follow: true },
}

/**
 * Branded 404. Default for any route that isn't matched and isn't covered by
 * a redirect in [lib/redirects.ts](lib/redirects.ts). Quiet treatment — no
 * marketing chrome, just a clear next-step grid.
 */
export default function NotFound() {
  return (
    <main
      data-section-tone="light"
      className="relative flex min-h-[70vh] flex-col bg-paper"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-24 sm:px-6 md:py-32 lg:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          404 · Page not found
        </p>

        <h1 className="mt-5 font-display text-5xl font-semibold leading-[1] tracking-[-0.03em] text-ink-900 sm:text-6xl md:text-7xl">
          <span className="block">Wrong turn.</span>
          <span className="block text-ink-500">No page here.</span>
        </h1>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-700">
          The URL you tried doesn&rsquo;t match anything on the new site. If you
          followed a link, it&rsquo;s probably an old one we missed when we
          rebuilt &mdash;{' '}
          <Link
            href="/contact-me/"
            className="font-semibold text-ink-900 underline decoration-rule-strong underline-offset-[5px] transition-colors duration-200 hover:text-brand-600 hover:decoration-brand-600"
          >
            let us know
          </Link>{' '}
          and we&rsquo;ll fix it.
        </p>

        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          <NextStep
            href="/"
            label="Homepage"
            description="Start over."
          />
          <NextStep
            href="/services/"
            label="Services"
            description="What we do and how we price it."
          />
          <NextStep
            href="/category/blog/"
            label="Insights"
            description="Latest writing on AI search & B2B growth."
          />
          <NextStep
            href="/guides/"
            label="Guides"
            description="Long-form how-tos and frameworks."
          />
        </div>

        <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Or jump to the{' '}
          <Link
            href="/sitemap.xml"
            className="underline decoration-rule-strong underline-offset-[3px] hover:text-brand-600 hover:decoration-brand-600"
          >
            sitemap
          </Link>
          .
        </p>
      </div>
    </main>
  )
}

function NextStep({
  href,
  label,
  description,
}: {
  href: string
  label: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-1 rounded-xl border border-rule bg-surface px-5 py-4 transition-colors duration-200 hover:border-brand-600 hover:bg-brand-50/40"
    >
      <span className="font-display text-base font-semibold text-ink-900 group-hover:text-brand-600">
        {label} <span aria-hidden>→</span>
      </span>
      <span className="text-sm text-ink-500">{description}</span>
    </Link>
  )
}
