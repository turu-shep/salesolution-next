import { defineField, defineType } from 'sanity'

/** Used on `guide` documents that belong to a multi-part series. */
export const series = defineType({
  name: 'series',
  title: 'Series',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Series name',
      type: 'string',
      description: 'e.g. "Website Launch Checklist"',
    }),
    defineField({
      name: 'part',
      title: 'Part number',
      type: 'number',
      validation: (rule) => rule.min(1).integer(),
    }),
    defineField({
      name: 'totalParts',
      title: 'Total parts',
      type: 'number',
      validation: (rule) => rule.min(1).integer(),
    }),
  ],
})
