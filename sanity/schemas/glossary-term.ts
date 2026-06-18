import { defineField, defineType } from 'sanity'

/**
 * Glossary term — one concept per document, one URL per concept.
 *
 * The citable core of the AI-search wiki (see
 * docs/strategy/career-path/05-glossary.md + 06-wiki-architecture.md).
 * `shortDefinition` is the load-bearing field: it renders first on the page,
 * feeds the DefinedTerm JSON-LD, and is the passage LLMs lift verbatim — keep
 * it one neutral, promo-free sentence answering "What is X?".
 */
export const glossaryTerm = defineType({
  name: 'glossaryTerm',
  title: 'Glossary term',
  type: 'document',
  fields: [
    defineField({
      name: 'term',
      title: 'Term',
      type: 'string',
      description: 'Canonical form, e.g. "Citation engineering".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'term', maxLength: 96 },
      description: 'URL path under /glossary/.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shortDefinition',
      title: 'Short definition',
      type: 'text',
      rows: 3,
      description:
        'The quotable definition (≤ 60 words). Rendered first on the page, used in cards + JSON-LD. Lead with one neutral sentence answering "What is X?".',
      validation: (rule) => rule.required().max(480),
    }),
    defineField({
      name: 'cluster',
      title: 'Cluster',
      type: 'string',
      options: {
        list: [
          { title: 'AI search (core)', value: 'ai-search-core' },
          { title: 'Measurement', value: 'measurement' },
          { title: 'Technical & structural', value: 'technical' },
          { title: 'Industrial e-commerce', value: 'industrial-ecommerce' },
          { title: 'Roles', value: 'roles' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'aliases',
      title: 'Aliases',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        'Synonyms / abbreviations (e.g. "GEO", "generative engine optimization") for search + alias matching.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'portableText',
      description:
        'Extended explanation. Lead "Why it matters" with an industrial e-commerce example. Tables for comparisons. End with 2–3 genuine FAQs.',
    }),
    defineField({
      name: 'relatedTerms',
      title: 'Related terms',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'glossaryTerm' }] }],
    }),
    defineField({
      name: 'relatedResources',
      title: 'Related paths & services',
      type: 'array',
      description:
        'Outbound funnel: link this term to the career paths and service pages it leads to, so authority circulates out of the glossary instead of pooling. Services are static pages, so these are plain internal links (career paths are Sanity docs but linked the same way for one consistent rail).',
      of: [
        {
          type: 'object',
          name: 'resourceLink',
          fields: [
            { name: 'label', type: 'string', title: 'Label', validation: (r) => r.required() },
            {
              name: 'href',
              type: 'string',
              title: 'Href (internal path, e.g. /services/catalog-ai/)',
              validation: (r) => r.required(),
            },
            {
              name: 'kind',
              type: 'string',
              title: 'Kind',
              options: {
                list: [
                  { title: 'Career path', value: 'career-path' },
                  { title: 'Service', value: 'service' },
                ],
                layout: 'radio',
              },
            },
            { name: 'blurb', type: 'string', title: 'Blurb (one line)' },
          ],
          preview: { select: { title: 'label', subtitle: 'kind' } },
        },
      ],
    }),
    defineField({
      name: 'opportunity',
      title: 'SEO opportunity (editorial)',
      type: 'string',
      description: 'Internal prioritization metadata — not rendered on the page.',
      options: {
        list: [
          { title: 'Own (nobody / weak owner)', value: 'own' },
          { title: 'Contest (mid-tier owners)', value: 'contest' },
          { title: 'Reference-only (giants own it)', value: 'reference-only' },
        ],
      },
    }),
    defineField({
      name: 'lastReviewed',
      title: 'Last reviewed',
      type: 'date',
      description: 'Surfaced on the page as "Reviewed <month year>". Freshness discipline.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  preview: {
    select: { title: 'term', subtitle: 'cluster' },
  },
})
