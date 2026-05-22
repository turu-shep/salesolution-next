import { defineField, defineType } from 'sanity'

/**
 * Singleton: there should be exactly ONE document of this type.
 * The Studio structure (sanity/structure.ts) enforces that by hiding the
 * "create new" action and routing the sidebar entry to the single instance.
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({
      name: 'businessName',
      title: 'Business name',
      type: 'string',
      validation: (rule) => rule.required(),
      initialValue: 'Sale Solution',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Used in default Twitter card + meta where description is missing.',
    }),
    defineField({
      name: 'defaultDescription',
      title: 'Default meta description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'defaultOgImage',
      title: 'Default OG image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
    }),
    defineField({
      name: 'address',
      title: 'Office address',
      type: 'object',
      fields: [
        { name: 'street', type: 'string', title: 'Street' },
        { name: 'city', type: 'string', title: 'City' },
        { name: 'region', type: 'string', title: 'State / region' },
        { name: 'postalCode', type: 'string', title: 'Postal code' },
        { name: 'country', type: 'string', title: 'Country (ISO 3166-1 alpha-2)' },
      ],
      description:
        'CANONICAL address. Three different addresses appear on the live site today — this is the single source of truth for the rebuild.',
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),
    defineField({
      name: 'emails',
      title: 'Public email addresses',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', type: 'string', title: 'Label (e.g. General, Leads)' },
            { name: 'address', type: 'string', title: 'Email address' },
          ],
        },
      ],
    }),
    defineField({
      name: 'social',
      title: 'Social links',
      type: 'object',
      fields: [
        { name: 'facebook', type: 'url', title: 'Facebook' },
        { name: 'twitter', type: 'url', title: 'X / Twitter' },
        { name: 'linkedin', type: 'url', title: 'LinkedIn' },
        { name: 'youtube', type: 'url', title: 'YouTube' },
      ],
    }),
    defineField({
      name: 'navigation',
      title: 'Primary navigation',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', type: 'string', title: 'Label' },
            { name: 'href', type: 'string', title: 'Href' },
            {
              name: 'children',
              type: 'array',
              title: 'Children',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'label', type: 'string', title: 'Label' },
                    { name: 'href', type: 'string', title: 'Href' },
                  ],
                },
              ],
            },
          ],
          preview: { select: { title: 'label', subtitle: 'href' } },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site settings' }),
  },
})
