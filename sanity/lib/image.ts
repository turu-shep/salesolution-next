import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'

import { dataset, projectId } from '../env'

const builder = imageUrlBuilder({ projectId, dataset })

/**
 * `urlFor(image).width(800).height(600).fit('crop').url()`
 *
 * Wraps the Sanity image-url builder so we don't recreate it per call.
 * Always returns the canonical Sanity CDN URL.
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
