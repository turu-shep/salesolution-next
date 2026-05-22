import 'server-only'

import { draftMode } from 'next/headers'
import type { QueryParams } from 'next-sanity'

import { draftClient } from './draft-client'
import { sanityClient } from './client'

/**
 * Single read entry point. Routes to the draft client when draftMode is on,
 * the published client otherwise. Tags every fetch so revalidation by tag works.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
  revalidate,
}: {
  query: string
  params?: QueryParams
  tags?: string[]
  revalidate?: number | false
}): Promise<T> {
  const { isEnabled: isDraft } = await draftMode()
  const client = isDraft ? draftClient : sanityClient

  return client.fetch<T>(query, params, {
    next: {
      revalidate: isDraft ? 0 : (revalidate ?? 60),
      tags,
    },
  })
}
