/**
 * GROQ query strings. Centralised so the shape of fields we read stays
 * consistent across server-side fetches.
 */

// ── Post fields ───────────────────────────────────────────────────────────

const POST_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  description,
  publishedAt,
  updatedAt,
  readTimeMinutes,
  category,
  tags,
  coverImage{
    asset->{
      _id,
      url,
      metadata { dimensions { width, height } }
    },
    alt
  },
  body,
  faq,
  seo,
  author->{
    _id,
    name,
    "slug": slug.current,
    role,
    bio,
    image,
    social
  },
  "related": related[]->{
    _id,
    title,
    "slug": slug.current,
    description,
    publishedAt,
    coverImage{
      asset->{ _id, url, metadata { dimensions { width, height } } },
      alt
    }
  }
`

const POST_CARD_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  description,
  publishedAt,
  readTimeMinutes,
  category,
  tags,
  coverImage{
    asset->{ _id, url, metadata { dimensions { width, height } } },
    alt
  }
`

export const allPostsQuery = `
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    ${POST_CARD_FIELDS}
  }
`

export const allPostSlugsQuery = `
  *[_type == "post" && defined(slug.current)][].slug.current
`

export const postBySlugQuery = `
  *[_type == "post" && slug.current == $slug][0] {
    ${POST_FIELDS}
  }
`

export const fallbackRelatedQuery = `
  *[_type == "post" && slug.current != $slug && category == $category] |
    order(publishedAt desc)[0...3] {
    ${POST_CARD_FIELDS}
  }
`

// ── Guide fields ──────────────────────────────────────────────────────────

const GUIDE_CARD_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  description,
  publishedAt,
  readTimeMinutes,
  category,
  tags,
  series,
  coverImage{
    asset->{ _id, url, metadata { dimensions { width, height } } },
    alt
  }
`

const GUIDE_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  description,
  publishedAt,
  updatedAt,
  readTimeMinutes,
  category,
  tags,
  series,
  coverImage{
    asset->{ _id, url, metadata { dimensions { width, height } } },
    alt
  },
  body,
  seo
`

export const allGuidesQuery = `
  *[_type == "guide" && defined(slug.current)] | order(series.part asc, publishedAt desc) {
    ${GUIDE_CARD_FIELDS}
  }
`

export const allGuideSlugsQuery = `
  *[_type == "guide" && defined(slug.current)][].slug.current
`

export const guideBySlugQuery = `
  *[_type == "guide" && slug.current == $slug][0] {
    ${GUIDE_FIELDS}
  }
`

export const guidesByCategoryQuery = `
  *[_type == "guide" && category == $category] |
    order(series.part asc, publishedAt desc) {
    ${GUIDE_CARD_FIELDS}
  }
`

export const guidesInSeriesQuery = `
  *[_type == "guide" && series.name == $name] |
    order(series.part asc) {
    _id,
    title,
    "slug": slug.current,
    series
  }
`

// ── Career-path fields ────────────────────────────────────────────────────

const CAREER_PATH_CARD_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  description,
  role,
  level,
  duration,
  publishedAt
`

const CAREER_PATH_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  description,
  role,
  level,
  duration,
  body,
  publishedAt,
  seo
`

export const allCareerPathsQuery = `
  *[_type == "careerPath" && defined(slug.current)] | order(publishedAt desc) {
    ${CAREER_PATH_CARD_FIELDS}
  }
`

export const allCareerPathSlugsQuery = `
  *[_type == "careerPath" && defined(slug.current)][].slug.current
`

export const careerPathBySlugQuery = `
  *[_type == "careerPath" && slug.current == $slug][0] {
    ${CAREER_PATH_FIELDS}
  }
`
