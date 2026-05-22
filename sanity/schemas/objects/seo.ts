import { defineField, defineType } from 'sanity'

/**
 * Reusable SEO/social meta object. Each content type embeds one of these.
 * AI-generated content must fill every field — empty SEO breaks rich results.
 */
export const seo = defineType({
  name: 'seo',
  title: 'SEO & Social',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      description: 'Overrides the document title in <title> + OG. Aim for 50–60 chars.',
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 2,
      description: '140–160 chars. Shown in search snippets + OG description.',
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: 'ogImage',
      title: 'OG image (1200 × 630)',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional. Falls back to coverImage, then site default.',
    }),
    defineField({
      name: 'noindex',
      title: 'Hide from search engines (noindex)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL override',
      type: 'url',
      description: 'Leave empty unless the canonical lives off-site.',
    }),
  ],
})
