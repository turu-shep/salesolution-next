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
      name: 'aliases',
      title: 'Aliases (real job titles)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Other titles this role appears under in real postings.',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['drafting', 'published', 'archived'] },
      initialValue: 'drafting',
    }),
    defineField({
      name: 'seniorityMatrix',
      title: 'Seniority matrix',
      type: 'array',
      description: 'What the role does / must learn at each level. Rendered as a table.',
      of: [
        {
          type: 'object',
          name: 'levelRow',
          fields: [
            {
              name: 'level',
              type: 'string',
              title: 'Level',
              options: { list: ['Entry', 'Mid', 'Senior'] },
            },
            { name: 'focus', type: 'text', rows: 2, title: 'Focus' },
            {
              name: 'mustLearn',
              type: 'array',
              of: [{ type: 'string' }],
              title: 'Must learn',
            },
          ],
          preview: { select: { title: 'level', subtitle: 'focus' } },
        },
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body (the walk)',
      type: 'portableText',
      description: 'The path walk. Use H2 per chapter — chapters drive the table of contents.',
    }),
    defineField({
      name: 'buyerSection',
      title: 'Buyer section — "Hiring this role?"',
      type: 'object',
      description: 'The only revenue-touching surface. Speaks to the distributor deciding hire vs agency.',
      fields: [
        { name: 'whatTheyDo', type: 'text', rows: 3, title: 'What this role does' },
        {
          name: 'signsYouNeedOne',
          type: 'array',
          of: [{ type: 'string' }],
          title: 'Signs your business needs one',
        },
        { name: 'inHouseVsAgency', type: 'portableText', title: 'In-house vs agency vs fractional' },
        { name: 'costReality', type: 'text', rows: 2, title: 'Cost reality' },
      ],
    }),
    defineField({
      name: 'relatedTerms',
      title: 'Related glossary terms',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'glossaryTerm' }] }],
    }),
    defineField({
      name: 'lastReviewed',
      title: 'Last reviewed',
      type: 'date',
      description: 'Surfaced on the page. Career content rots fast — keep current.',
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
