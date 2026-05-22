import 'server-only'

import {
  allPostSlugsQuery,
  allPostsQuery,
  fallbackRelatedQuery,
  postBySlugQuery,
} from './queries'
import { sanityFetch } from './fetch'

export type PostCard = {
  _id: string
  title: string
  slug: string
  description?: string
  publishedAt?: string
  readTimeMinutes?: number
  category?: string
  tags?: string[]
  coverImage?: {
    asset?: { _id: string; url: string; metadata?: { dimensions?: { width: number; height: number } } }
    alt?: string
  }
}

export type Post = PostCard & {
  updatedAt?: string
  body?: unknown[]
  faq?: { question: string; answer: string }[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: { asset?: { url: string } }
    noindex?: boolean
    canonicalUrl?: string
  }
  author?: {
    _id: string
    name: string
    slug: string
    role?: string
    bio?: string
    image?: { asset?: { url: string } }
    social?: { linkedin?: string; twitter?: string; website?: string }
  }
  related?: PostCard[]
}

export async function getAllPosts(): Promise<PostCard[]> {
  return sanityFetch<PostCard[]>({
    query: allPostsQuery,
    tags: ['post'],
  })
}

export async function getAllPostSlugs(): Promise<string[]> {
  return sanityFetch<string[]>({
    query: allPostSlugsQuery,
    tags: ['post'],
  })
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return sanityFetch<Post | null>({
    query: postBySlugQuery,
    params: { slug },
    tags: ['post', `post:${slug}`],
  })
}

/** Falls back to category-matched recent posts when manual `related` is empty. */
export async function getRelatedPosts(
  slug: string,
  category: string | undefined,
): Promise<PostCard[]> {
  if (!category) return []
  return sanityFetch<PostCard[]>({
    query: fallbackRelatedQuery,
    params: { slug, category },
    tags: ['post'],
  })
}
