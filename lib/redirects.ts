import type { Redirect } from 'next/dist/lib/load-custom-routes'

/**
 * Static redirect map applied at the edge by Next.js. Bakes in the migration
 * plan from docs/strategy/05-seo-strategy.md §6.
 *
 * ⚠ Before WordPress is decommissioned, EXPORT the active Rank Math redirects
 * (WP admin → Rank Math → Redirections → Export) and merge them here.
 * The set below is only the structural / known cases.
 */
export const redirects: Redirect[] = [
  // ── Duplicate / superseded routes ──────────────────────────────────────
  { source: '/contact/', destination: '/contact-me/', permanent: true },
  { source: '/strategy-session/', destination: '/book-growth-call/', permanent: true },
  { source: '/unlock-growth-audit/book-slot/', destination: '/book-growth-call/', permanent: true },

  // Guide permalink standardisation — singular `/guide/*` → plural `/guides/*`.
  // Wildcard covers both known cases (part-1 SEO, performance optimization) and
  // any future legacy singular-path inbound links.
  { source: '/guide/:slug*', destination: '/guides/:slug*', permanent: true },

  // Old WordPress slugs that were renamed in Sanity — catch external backlinks.
  { source: '/content-marketing-101-guide-2023/', destination: '/content-marketing-101/', permanent: true },

  // ── WordPress sitemap URLs → new sitemap ───────────────────────────────
  { source: '/sitemap_index.xml', destination: '/sitemap.xml', permanent: true },
  { source: '/post-sitemap.xml', destination: '/sitemap.xml', permanent: true },
  { source: '/page-sitemap.xml', destination: '/sitemap.xml', permanent: true },
  { source: '/guide-sitemap.xml', destination: '/sitemap.xml', permanent: true },
  { source: '/careers-sitemap.xml', destination: '/sitemap.xml', permanent: true },
  { source: '/local-sitemap.xml', destination: '/sitemap.xml', permanent: true },

  // ── Dropped WooCommerce + client portal (D3 locked) ────────────────────
  // Re-route to homepage rather than 404 so any lingering inbound links land
  // softly. Search engines treat 301-to-/ as a strong "this URL is gone" signal.
  { source: '/shop/', destination: '/', permanent: true },
  { source: '/cart/', destination: '/', permanent: true },
  { source: '/checkout/', destination: '/', permanent: true },
  { source: '/my-account/', destination: '/', permanent: true },
  { source: '/clients/', destination: '/', permanent: true },
  { source: '/client-portal-login/', destination: '/', permanent: true },

  // ── WordPress cruft — discourage scraping ──────────────────────────────
  { source: '/wp-login.php', destination: '/', permanent: true },
  { source: '/wp-admin/:path*', destination: '/', permanent: true },
  { source: '/xmlrpc.php', destination: '/', permanent: true },

  // ── Decommissioned WP pages (referenced from sitemap or backlinks) ─────
  // `/content-restricted/` was a WP gated-content gate; `/sitemap/` was a
  // human-readable HTML sitemap. Send to homepage / sitemap.xml respectively.
  { source: '/content-restricted/', destination: '/', permanent: true },
  { source: '/sitemap/', destination: '/sitemap.xml', permanent: true },

  // RSS — feed isn't regenerated on the new build. Send subscribers and any
  // syndicated readers to the blog hub so they can re-discover content.
  { source: '/feed/', destination: '/category/blog/', permanent: true },
  { source: '/feed/:path*', destination: '/category/blog/', permanent: true },
  { source: '/comments/feed/', destination: '/category/blog/', permanent: true },

  // ── Career paths not yet migrated to Sanity ────────────────────────────
  // The legacy site had two career-path pages (SEO Specialist, Content Strategy
  // Specialist) that haven't been ported. Send to the hub so backlinks land
  // softly. Migrate to Sanity later and remove these if/when content returns.
  {
    source: '/career-paths/seo-specialist-qualification/',
    destination: '/career-paths/',
    permanent: true,
  },
  {
    source: '/career-paths/content-strategy-specialist-qualifications/',
    destination: '/career-paths/',
    permanent: true,
  },
]
