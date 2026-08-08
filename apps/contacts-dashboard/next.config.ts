import path from 'node:path'

import type { NextConfig } from 'next'

/**
 * The contacts dashboard is internal and gated. It must never be indexed and it
 * must never be framed by anything.
 */
const nextConfig: NextConfig = {
  // Two pnpm lockfiles exist (repo root + this app), and Next's root inference
  // picks the outermost — which sweeps the MAIN SITE's instrumentation.ts,
  // sentry.*.config.ts and postcss config into this build (they need deps this
  // app deliberately lacks). Pin the project root to this package; files above
  // it are not resolved.
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },
}

export default nextConfig
