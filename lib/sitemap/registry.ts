/**
 * Sitemap registry — the static side of the sitemap index.
 *
 * Pure data + serializers, dependency-free beyond `business` and the tool
 * catalog (both of which import nothing heavy). Kept separate from
 * `lib/sitemap/data.ts` (which lazily pulls the Sanity client) so the index and
 * child routes share one source of truth for URL shapes and XML output without
 * forcing a Sanity import at module load — the sitemap must fail soft.
 *
 * Each child id below maps to /sitemaps/<id>.xml; the root /sitemap.xml lists
 * the non-empty ones as a <sitemapindex>.
 */
import { business } from '@/lib/business'
import { TOOL_PAGES } from '@/lib/tools/pages'

export const BASE = business.url

export type ChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never'

export type SitemapUrl = {
  /** Absolute URL. */
  loc: string
  lastmod?: Date
  changefreq?: ChangeFreq
  priority?: number
}

/** Child sitemap ids, in stable display order. */
export const CHILD_IDS = [
  'pages',
  'landing-pages',
  'blog',
  'guides',
  'glossary',
  'career-paths',
  'tools',
  'case-studies',
] as const
export type ChildId = (typeof CHILD_IDS)[number]

const u = (path: string, changefreq: ChangeFreq, priority: number): SitemapUrl => ({
  loc: `${BASE}${path}`,
  changefreq,
  priority,
})

/**
 * Core marketing + legal. Content-type section hubs (case-studies, guides,
 * career-paths, tools, blog) live in their own child for per-section GSC
 * reporting, so they are NOT here.
 *
 * Excluded on purpose: /opt-out-preferences/ and /communication-preferences/
 * (both noindex), /v2-1/ (noindex composite), /full-growth-quote/ (noindex),
 * /revenue-engine/audit-booked/ + all /thank-you/ pages (noindex).
 */
export const CORE_PAGES: SitemapUrl[] = [
  u('/', 'weekly', 1.0),
  u('/services/', 'monthly', 0.9),
  u('/services/ai-seo/', 'monthly', 0.8),
  u('/services/catalog-ai/', 'monthly', 0.8),
  u('/services/editorial-authority/', 'monthly', 0.8),
  u('/services/full-growth-ownership/', 'monthly', 0.8),
  u('/services/website-development-design-services/', 'monthly', 0.8),
  u('/services/outbound-email-marketing-services/', 'monthly', 0.8),
  u('/contact-me/', 'yearly', 0.7),
  u('/about/', 'yearly', 0.6),
  u('/industries/industrial-distribution/', 'monthly', 0.8),
  u('/revenue-engine/', 'monthly', 0.8),
  u('/revenue-engine/home-services/', 'monthly', 0.8),
  u('/revenue-engine/dentists/', 'monthly', 0.8),
  u('/revenue-engine/local-retail/', 'monthly', 0.8),
  u('/service-areas/', 'monthly', 0.5),
  u('/privacy-policy/', 'yearly', 0.2),
  u('/terms-of-service/', 'yearly', 0.2),
  u('/disclaimer/', 'yearly', 0.2),
]

/**
 * Indexable lead-gen landing pages. Their /thank-you/ confirmations are noindex
 * (excluded). /full-growth-quote/ is itself noindex, so it is omitted. The paid
 * campaign LPs under app/(campaign)/lp/* are noindex too — add one line here if
 * one is ever flipped indexable.
 */
export const LANDING_PAGES: SitemapUrl[] = [
  u('/unlock-growth-audit/', 'monthly', 0.8),
  u('/future-proof-your-seo/', 'monthly', 0.8),
  u('/book-growth-call/', 'monthly', 0.8),
  u('/constraint-sprint/', 'monthly', 0.8),
  u('/catalog-snapshot/', 'monthly', 0.8),
]

// Section hubs — bundled with their content type's child.
export const BLOG_HUBS: SitemapUrl[] = [u('/category/blog/', 'weekly', 0.7)]
export const GUIDE_HUBS: SitemapUrl[] = [
  u('/guides/', 'weekly', 0.7),
  u('/guides/seo-guides/', 'monthly', 0.6),
  u('/guides/website-development-and-design-guides/', 'monthly', 0.6),
  u('/guides/email-marketing-guides/', 'monthly', 0.6),
]
export const CAREER_HUBS: SitemapUrl[] = [u('/career-paths/', 'monthly', 0.6)]
export const TOOLS_HUB: SitemapUrl[] = [u('/tools/', 'monthly', 0.8)]
export const CASE_STUDIES_HUB: SitemapUrl[] = [u('/case-studies/', 'monthly', 0.8)]

/** Standalone tool detail pages — no Sanity dependency. */
export const TOOL_URLS: SitemapUrl[] = TOOL_PAGES.map((t) =>
  u(`/tools/${t.slug}/`, 'monthly', 0.7),
)

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Serialize a child sitemap (<urlset>). */
export function toUrlsetXml(urls: SitemapUrl[]): string {
  const body = urls
    .map((entry) => {
      const lines = [`    <loc>${xmlEscape(entry.loc)}</loc>`]
      if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod.toISOString()}</lastmod>`)
      if (entry.changefreq) lines.push(`    <changefreq>${entry.changefreq}</changefreq>`)
      if (entry.priority !== undefined)
        lines.push(`    <priority>${entry.priority.toFixed(1)}</priority>`)
      return `  <url>\n${lines.join('\n')}\n  </url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

export type IndexChild = { loc: string; lastmod?: Date }

/** Serialize the root sitemap index (<sitemapindex>). */
export function toIndexXml(children: IndexChild[]): string {
  const body = children
    .map((c) => {
      const lines = [`    <loc>${xmlEscape(c.loc)}</loc>`]
      if (c.lastmod) lines.push(`    <lastmod>${c.lastmod.toISOString()}</lastmod>`)
      return `  <sitemap>\n${lines.join('\n')}\n  </sitemap>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`
}
