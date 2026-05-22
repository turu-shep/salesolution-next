import type { NextConfig } from 'next'
import path from 'node:path'

import { redirects as redirectMap } from './lib/redirects'

const nextConfig: NextConfig = {
  // Match the WordPress original — every indexed URL ends with /.
  // Flipping this breaks every existing 200 → forces a 308 on every link.
  trailingSlash: true,

  // Pin the Turbopack root. Without this, Turbopack walks up looking for
  // a lockfile and gets confused by sibling node_modules trees under
  // docs/strategy/scripts/ and backup/.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },

  images: {
    // Pull client logos and any legacy media directly from the WordPress CDN
    // during transition. Once we re-host assets in /public or R2, narrow
    // this back down.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'salesolution.net',
        pathname: '/wp-content/**',
      },
    ],
  },

  async redirects() {
    return redirectMap
  },

  /**
   * Security headers — applied to every response.
   *
   * No Content-Security-Policy: gtag/GTM/Meta Pixel/HubSpot/Calendly all
   * inject inline + cross-origin scripts that would require per-vendor nonces
   * to allowlist. The trade-off — risk a CSP that breaks tracking, or skip
   * CSP — leans toward "skip" for a marketing site. Revisit when consolidating
   * tags inside a GTM container.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Force HTTPS for 2 years; allow subdomain coverage; preload list eligible.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Prevent MIME-type sniffing.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Allow embedding only from same origin (defense-in-depth alongside CSP frame-ancestors).
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Send only the origin on cross-origin nav, full referrer same-origin.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Deny powerful features by default — opt in per-feature if we ever need them.
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'payment=()',
              'usb=()',
              'magnetometer=()',
              'gyroscope=()',
              'accelerometer=()',
              'interest-cohort=()',
            ].join(', '),
          },
          // Modern XSS mitigation; XSS-Protection header is deprecated but harmless.
          { key: 'X-XSS-Protection', value: '0' },
        ],
      },
    ]
  },
}

export default nextConfig
