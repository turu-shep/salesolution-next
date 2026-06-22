/**
 * Layout for all marketing/site routes. Wraps children with Header + Footer
 * and emits the global Organization + WebSite JSON-LD graph.
 *
 * /studio and /api routes live OUTSIDE this group — they don't get the shell
 * and don't get the schema (Studio is noindex; the API has no UI).
 */
import { JsonLd } from '@/components/seo/JsonLd'
import { Footer } from '@/components/layout/Footer'
import { FooterSwitch } from '@/components/layout/FooterSwitch'
import { Header } from '@/components/layout/Header'
import { RevenueFooter } from '@/components/layout/RevenueFooter'
import { globalGraph } from '@/lib/schema'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={globalGraph()} />
      {/* Skip link — first focusable element on every site page. Visually hidden
          until focused, then pinned top-left. Targets the <main> landmark below. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>
      <Header />
      {/* Single <main> landmark for the whole site shell — gives crawlers, AI
          extractors, and reader/answer-engine parsers a clean primary-content
          region, and satisfies WCAG 1.3.1 landmark navigation. */}
      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>
      {/* Slim local-service footer on /revenue-engine/*; the industrial mega-footer
          everywhere else. Both render server-side; the switch is a thin client island. */}
      <FooterSwitch full={<Footer />} slim={<RevenueFooter />} />
    </>
  )
}
