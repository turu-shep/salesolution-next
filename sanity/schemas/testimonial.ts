import { defineField, defineType } from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'customerName',
      title: 'Customer name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'customerRole',
      title: 'Role / title',
      type: 'string',
    }),
    defineField({
      name: 'customerCompany',
      title: 'Company',
      type: 'string',
    }),
    defineField({
      name: 'customerPhoto',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating (1–5)',
      type: 'number',
      validation: (rule) => rule.min(1).max(5).integer(),
      initialValue: 5,
    }),
    defineField({
      name: 'featuredOn',
      title: 'Featured on pages',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Home', value: 'home' },
          { title: 'Services hub', value: 'services' },
          { title: 'Unlock growth audit', value: 'unlock-growth-audit' },
          { title: 'Book growth call', value: 'book-growth-call' },
          { title: 'Future-proof your SEO', value: 'future-proof-your-seo' },
          { title: 'Constraint sprint', value: 'constraint-sprint' },
        ],
      },
    }),
    defineField({
      name: 'isFabricated',
      title: '⚠ Composite / placeholder',
      type: 'boolean',
      initialValue: false,
      description:
        'Mark TRUE for testimonials that are not literal quotes from a real customer. Used to honor FTC/ASA disclosure rules at render time.',
    }),
  ],
  preview: {
    select: {
      title: 'customerName',
      company: 'customerCompany',
      media: 'customerPhoto',
      flagged: 'isFabricated',
    },
    prepare({ title, company, media, flagged }) {
      return {
        title: flagged ? `⚠ ${title}` : title,
        subtitle: company,
        media,
      }
    },
  },
})
