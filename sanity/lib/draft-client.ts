import 'server-only'

import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId, readToken } from '../env'

/**
 * Server-only draft client.
 * Reads BOTH drafts and published docs (`previewDrafts` perspective).
 * Only invoked when draftMode() is enabled — see /api/draft.
 */
export const draftClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'previewDrafts',
  token: readToken,
  stega: { studioUrl: '/studio' },
})
