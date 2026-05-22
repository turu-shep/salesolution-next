import 'server-only'

import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId, writeToken } from '../env'

/**
 * Server-only write client.
 *
 * Use ONLY from:
 *   - Server Actions
 *   - Route handlers under app/api/**
 *   - Build-time migration scripts
 *
 * Powers the AI-generation workflow: agent creates a draft via this client,
 * which becomes reviewable in Studio + previewable on the site before publish.
 */
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: writeToken,
})
