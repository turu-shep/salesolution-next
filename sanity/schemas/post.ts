import { defineField, defineType } from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'meta', title: 'Meta & SEO' },
    { name: 'related', title: 'Related' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().min(10).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 120 },
      description:
        'URL path under root. Blog posts live at /<slug>/ to match the WordPress original.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Lede / excerpt',
      type: 'text',
      group: 'content',
      rows: 3,
      description: 'One sentence. Shown on listing cards and used as default meta description.',
      validation: (rule) => rule.required().min(50).max(220),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alt text' },
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'portableText',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      group: 'content',
      of: [{ type: 'faqItem' }],
      description: 'Emits FAQPage schema when present.',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'meta',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'meta',
      options: {
        list: [
          { title: 'SEO', value: 'seo' },
          { title: 'GEO / AI Search', value: 'geo' },
          { title: 'Content Marketing', value: 'content-marketing' },
          { title: 'Content Writing', value: 'content-writing' },
          { title: 'B2B', value: 'b2b' },
          { title: 'B2B Marketing', value: 'b2b-marketing' },
          { title: 'E-Commerce', value: 'ecommerce' },
          { title: 'Marketing Strategy', value: 'marketing-strategy' },
          { title: 'Traffic', value: 'traffic' },
          { title: 'WooCommerce', value: 'woocommerce' },
        ],
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'meta',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated at',
      type: 'datetime',
      group: 'meta',
    }),
    defineField({
      name: 'readTimeMinutes',
      title: 'Read time (minutes)',
      type: 'number',
      group: 'meta',
      validation: (rule) => rule.min(1).integer(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'meta',
    }),
    defineField({
      name: 'related',
      title: 'Related posts',
      type: 'array',
      group: 'related',
      of: [{ type: 'reference', to: [{ type: 'post' }] }],
      validation: (rule) => rule.max(3),
    }),
  ],
  preview: {
    select: { title: 'title', date: 'publishedAt', media: 'coverImage' },
    prepare({ title, date, media }) {
      return {
        title,
        subtitle: date ? new Date(date).toLocaleDateString() : 'unscheduled',
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Newest first',
      name: 'publishedDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
})
