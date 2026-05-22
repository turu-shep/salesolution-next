import { defineField, defineType } from 'sanity'

export const careerPath = defineType({
  name: 'careerPath',
  title: 'Career path',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 120 },
      description: 'URL path under /career-paths/.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role focus',
      type: 'string',
      description: 'e.g. SEO Specialist, Content Strategy Specialist',
    }),
    defineField({
      name: 'level',
      title: 'Level',
      type: 'string',
      options: { list: ['Entry', 'Mid', 'Senior'] },
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'e.g. "6 weeks", "self-paced"',
    }),
    defineField({
      name: 'description',
      title: 'Lede',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'portableText',
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
})
