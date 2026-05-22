'use client'

/**
 * Sanity Studio mounts here. The catch-all segment lets Sanity's internal
 * router handle every sub-route (e.g. /studio/structure, /studio/vision).
 *
 * `use client` is required — the Studio uses React context internally and
 * can't be rendered as a Server Component.
 *
 * Metadata + robots noindex are set in the sibling layout.tsx (server file).
 */
import { NextStudio } from 'next-sanity/studio'

import config from '@/sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
