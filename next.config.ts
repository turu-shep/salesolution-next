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
    // Custom loader: see lib/image-loader.ts. Routes Sanity assets straight
    // through cdn.sanity.io (clean URLs + Sanity-side resize/WebP), passes
    // everything else through unchanged.
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
    // remotePatterns is still honored for any explicit `unoptimized={false}`
    // images that fall back through the proxy in development.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'salesolution.net',
        pathname: '/wp-content/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
  },

  async redirects() {
    return [
      // Canonical host is the apex (non-www). Send any www request to the apex
      // with a 308 so backlinks/citations pointing at www.salesolution.net
      // don't split ranking signal or dead-end.
      //
      // ⚠ This only fires once www.salesolution.net actually terminates TLS:
      //   add www as a domain in the Vercel project (Settings → Domains) so a
      //   cert is issued. Until then a www request fails the SSL handshake
      //   before it ever reaches Next, and no redirect can run.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.salesolution.net' }],
        destination: 'https://salesolution.net/:path*',
        permanent: true,
      },
      ...redirectMap,
    ]
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
