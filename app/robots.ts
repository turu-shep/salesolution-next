import type { MetadataRoute } from 'next'

import { business } from '@/lib/business'

/**
 * Generates /robots.txt. Replaces the WordPress-shaped robots from the current
 * site — most rules there were WP-specific (no /wp-admin/, no ?s= search,
 * no /xmlrpc.php, no /author/) and don't apply to the Next.js build.
 *
 * Spec: docs/strategy/05-seo-strategy.md §2.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dev/',
          '/studio/',
          // Tracking-param URLs (still relevant from the WP robots).
          '/*?utm_*',
          '/*?openstat*',
          '/*?fbclid*',
          '/*?gclid*',
        ],
      },
    ],
    sitemap: `${business.url}/sitemap.xml`,
    host: business.url,
  }
}
