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

  // Guide permalink standardisation — singular `/guide/` → plural `/guides/`.
  {
    source: '/guide/website-launch-checklist-series-part-1-seo-and-crawling/',
    destination: '/guides/website-launch-checklist-series-part-1-seo-and-crawling/',
    permanent: true,
  },
  {
    source: '/guide/website-performance-optimization-guide/',
    destination: '/guides/website-performance-optimization-guide/',
    permanent: true,
  },

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
]
