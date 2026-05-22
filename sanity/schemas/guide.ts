import { defineField, defineType } from 'sanity'

export const guide = defineType({
  name: 'guide',
  title: 'Guide',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'meta', title: 'Meta & SEO' },
    { name: 'series', title: 'Series' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 120 },
      description: 'URL path under /guides/.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Lede',
      type: 'text',
      group: 'content',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'portableText',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'meta',
      options: {
        list: [
          { title: 'SEO Guides', value: 'seo-guides' },
          { title: 'Website Development & Design', value: 'website-development-and-design-guides' },
          { title: 'Email Marketing', value: 'email-marketing-guides' },
        ],
      },
      validation: (rule) => rule.required(),
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
      name: 'series',
      title: 'Series info',
      type: 'series',
      group: 'series',
      description: 'Only fill if this guide is part of a numbered series.',
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
  ],
  preview: {
    select: {
      title: 'title',
      seriesName: 'series.name',
      part: 'series.part',
      media: 'coverImage',
    },
    prepare({ title, seriesName, part, media }) {
      const tag = seriesName && part ? `${seriesName} · Part ${part}` : 'standalone'
      return { title, subtitle: tag, media }
    },
  },
})
