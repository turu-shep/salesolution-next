import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

/**
 * Public read client. Uses Sanity's CDN for speed.
 * Returns only PUBLISHED documents — drafts are invisible here.
 * Safe to use in any RSC, page, or component.
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  stega: { studioUrl: '/studio' },
})
