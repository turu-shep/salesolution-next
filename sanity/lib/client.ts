import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

/**
 * Public read client. Returns only PUBLISHED documents — drafts are invisible here.
 * Safe to use in any RSC, page, or component.
 *
 * CDN in production only. In dev we read straight from the API so content edits
 * show up immediately instead of lagging a minute behind the CDN cache.
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
  perspective: 'published',
  stega: { studioUrl: '/studio' },
})
