import type { NextConfig } from 'next'

/**
 * The contacts dashboard is internal and gated. It must never be indexed and it
 * must never be framed by anything.
 *
 * Both dev and build run WEBPACK (see package.json), deliberately. Turbopack's
 * workspace-root inference (two pnpm lockfiles → repo root wins) swept the
 * MAIN SITE's instrumentation.ts + sentry.*.config.ts into this build on
 * Vercel, and the two config levers cancel each other there: turbopack.root
 * loses to Vercel's injected outputFileTracingRoot, while pinning
 * outputFileTracingRoot breaks Vercel's output collection (it derives the
 * .next location from it). Webpack scopes convention discovery to this
 * package, so neither lever is needed; postcss.config.mjs guards the CSS side
 * (its discovery is bundler-independent).
 */
const nextConfig: NextConfig = {
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
