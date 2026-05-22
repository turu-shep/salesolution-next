/**
 * Layout for all marketing/site routes. Wraps children with Header + Footer
 * and emits the global Organization + WebSite JSON-LD graph.
 *
 * /studio and /api routes live OUTSIDE this group — they don't get the shell
 * and don't get the schema (Studio is noindex; the API has no UI).
 */
import { JsonLd } from '@/components/seo/JsonLd'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { globalGraph } from '@/lib/schema'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={globalGraph()} />
      <Header />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </>
  )
}
