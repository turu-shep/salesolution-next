import { defineField, defineType } from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'pricing', title: 'Pricing' },
    { name: 'meta', title: 'Meta & SEO' },
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
      description: 'URL path under /services/.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      group: 'content',
      description: 'One-liner shown in hero + service grid.',
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
      name: 'heroImage',
      title: 'Hero image / illustration',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'portableText',
      group: 'content',
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      group: 'content',
      of: [{ type: 'faqItem' }],
    }),
    defineField({
      name: 'pricingTiers',
      title: 'Pricing tiers',
      type: 'array',
      group: 'pricing',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', type: 'string', title: 'Tier name' },
            { name: 'price', type: 'string', title: 'Price label (e.g. $2,400/mo)' },
            {
              name: 'features',
              type: 'array',
              of: [{ type: 'string' }],
              title: 'Features',
            },
            { name: 'highlight', type: 'boolean', title: 'Highlight as most-popular' },
            { name: 'ctaLabel', type: 'string', title: 'CTA label' },
            { name: 'ctaHref', type: 'string', title: 'CTA href' },
          ],
          preview: {
            select: { title: 'name', subtitle: 'price' },
          },
        },
      ],
    }),
    defineField({
      name: 'ctaVariant',
      title: 'Primary CTA variant',
      type: 'string',
      group: 'meta',
      options: {
        list: [
          { title: 'Blue (audit funnel)', value: 'blue' },
          { title: 'Green (strategy call)', value: 'green' },
          { title: 'Purple (packages)', value: 'purple' },
        ],
      },
      initialValue: 'blue',
      description:
        'Per the locked decision, each service page picks one of the three semantic CTA colors.',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'meta',
    }),
  ],
})
