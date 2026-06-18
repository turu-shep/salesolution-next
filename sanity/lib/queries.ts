/**
 * GROQ query strings. Centralised so the shape of fields we read stays
 * consistent across server-side fetches.
 */

// Portable-text body with inline glossary links ("termLink") resolved: each
// `glossaryRef` annotation in markDefs gets the target term's slug (to link to
// /glossary/<slug>/) plus its term + shortDefinition so the renderer can show an
// in-page hovercard preview without the reader leaving the page. Reused by every
// body projection. If the target is unpublished, slug resolves null and the
// renderer falls back to plain text.
const BODY_WITH_LINKS = `
  body[]{
    ...,
    markDefs[]{
      ...,
      _type == "glossaryRef" => {
        "slug": @->slug.current,
        "term": @->term,
        "shortDefinition": @->shortDefinition
      }
    }
  }
`

// Shared SEO projection. Spreads every seo field, but DEREFERENCES the ogImage
// asset so `seo.ogImage.asset.url` is the real CDN URL — a bare `seo` leaves it
// as an unresolved {_ref}, so og:image and Article JSON-LD images silently never
// populate (the TS types already assume the dereferenced `{ asset: { url } }`).
const SEO_FIELDS = `
  seo{
    ...,
    ogImage{ asset->{ url } }
  }
`

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
  ${BODY_WITH_LINKS},
  faq,
  ${SEO_FIELDS},
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
  ${BODY_WITH_LINKS},
  ${SEO_FIELDS}
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

// ── Case-study fields ─────────────────────────────────────────────────────

const CASE_STUDY_CARD_FIELDS = `
  _id,
  title,
  titleMuted,
  "slug": slug.current,
  summary,
  primaryService,
  supportingServices,
  engagementWindow,
  durationLabel,
  disclosure,
  keyMetric,
  stats,
  featured,
  publishedAt,
  client->{
    _id,
    publicName,
    descriptor,
    industry,
    "industryRef": industryRef->{
      _id,
      title,
      shortLabel,
      "slug": slug.current,
      "parentSlug": parent->slug.current
    },
    scale,
    region
  }
`

const CASE_STUDY_FIELDS = `
  ${CASE_STUDY_CARD_FIELDS},
  updatedAt,
  situation,
  constraint,
  approach,
  mechanism,
  resultsNarrative,
  chart,
  quote,
  methodology,
  disclosureNote,
  ${SEO_FIELDS}
`

export const allCaseStudiesQuery = `
  *[_type == "caseStudy" && defined(slug.current)] |
    order(featured desc, publishedAt desc) {
    ${CASE_STUDY_CARD_FIELDS}
  }
`

export const allCaseStudySlugsQuery = `
  *[_type == "caseStudy" && defined(slug.current)][].slug.current
`

export const caseStudyBySlugQuery = `
  *[_type == "caseStudy" && slug.current == $slug][0] {
    ${CASE_STUDY_FIELDS}
  }
`

// Case studies whose client belongs to a given industry — matched against the
// top-level vertical OR any of its sub-niches (so industrial-distribution also
// catches its fluid-power / automation / fasteners children). $slug is the
// top-level industry slug.
export const caseStudiesByIndustryQuery = `
  *[_type == "caseStudy" && defined(slug.current) &&
    (client->industryRef->slug.current == $slug ||
     client->industryRef->parent->slug.current == $slug)] |
    order(featured desc, publishedAt desc) {
    ${CASE_STUDY_CARD_FIELDS}
  }
`

// ── Industry fields ───────────────────────────────────────────────────────

const INDUSTRY_FIELDS = `
  _id,
  title,
  shortLabel,
  "slug": slug.current,
  description,
  hubHref,
  accentColor,
  order,
  "parentSlug": parent->slug.current,
  "caseStudyCount": count(*[_type == "caseStudy" && defined(slug.current) &&
    (client->industryRef->slug.current == ^.slug.current ||
     client->industryRef->parent->slug.current == ^.slug.current)])
`

// Top-level verticals only (no sub-niches), with a live case-study count so a
// hub/picker can show proof depth and hide empty verticals if desired.
export const allIndustriesQuery = `
  *[_type == "industry" && !defined(parent)] | order(order asc, title asc) {
    ${INDUSTRY_FIELDS}
  }
`

export const industryBySlugQuery = `
  *[_type == "industry" && slug.current == $slug][0] {
    ${INDUSTRY_FIELDS},
    "subNiches": *[_type == "industry" && parent._ref == ^._id] | order(order asc, title asc) {
      _id, title, shortLabel, "slug": slug.current
    }
  }
`

// ── Career-path fields ────────────────────────────────────────────────────

const CAREER_PATH_CARD_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  description,
  kind,
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
  kind,
  role,
  level,
  duration,
  aliases,
  status,
  seniorityMatrix,
  modules,
  ${BODY_WITH_LINKS},
  buyerSection,
  lastReviewed,
  publishedAt,
  ${SEO_FIELDS},
  "prerequisites": prerequisites[]->{
    _id, title, "slug": slug.current, kind, level, duration, description
  },
  "leadsTo": leadsTo[]->{
    _id, title, "slug": slug.current, kind, level, duration, description
  },
  "relatedTerms": relatedTerms[]->{
    _id,
    term,
    "slug": slug.current,
    shortDefinition,
    cluster
  }
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

// ── Glossary-term fields ──────────────────────────────────────────────────

const GLOSSARY_TERM_CARD_FIELDS = `
  _id,
  term,
  "slug": slug.current,
  shortDefinition,
  cluster,
  aliases
`

const GLOSSARY_TERM_FIELDS = `
  _id,
  term,
  "slug": slug.current,
  shortDefinition,
  cluster,
  aliases,
  ${BODY_WITH_LINKS},
  lastReviewed,
  publishedAt,
  ${SEO_FIELDS},
  "relatedTerms": relatedTerms[]->{
    _id,
    term,
    "slug": slug.current,
    shortDefinition,
    cluster
  }
`

export const allGlossaryTermsQuery = `
  *[_type == "glossaryTerm" && defined(slug.current)] | order(term asc) {
    ${GLOSSARY_TERM_CARD_FIELDS}
  }
`

export const allGlossaryTermSlugsQuery = `
  *[_type == "glossaryTerm" && defined(slug.current)][].slug.current
`

export const glossaryTermBySlugQuery = `
  *[_type == "glossaryTerm" && slug.current == $slug][0] {
    ${GLOSSARY_TERM_FIELDS}
  }
`

export const glossaryTermCountQuery = `
  count(*[_type == "glossaryTerm" && defined(slug.current)])
`
