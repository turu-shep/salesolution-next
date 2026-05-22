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
}

export default nextConfig
