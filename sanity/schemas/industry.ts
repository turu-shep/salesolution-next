import { defineField, defineType } from 'sanity'

/**
 * Industry — a vertical (or sub-niche) the business serves.
 *
 * This replaces the brittle freeform `industry` STRING on caseStudyClient with
 * a real, queryable taxonomy so case studies can be faceted by industry, the
 * "Who We Serve" surfaces can be data-driven, and future /industries/* hub
 * pages can auto-populate from it.
 *
 * Two levels: a top-level vertical (industrial-distribution, home-services,
 * dental) and optional sub-niches (e.g. fluid power, automation, fasteners)
 * that reference their parent. Keep slugs STABLE — they become URL segments
 * and routing keys.
 *
 * `hubHref` is routing metadata: where this industry currently sends visitors
 * until it earns its own hub page (industrial -> /services/, home-services ->
 * /revenue-engine/home-services/, dental -> /revenue-engine/dentists/).
 */
export const industry = defineType({
  name: 'industry',
  title: 'Industry',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Full name, e.g. "Industrial Distribution & Technical B2B".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shortLabel',
      title: 'Short label',
      type: 'string',
      description: 'Compact label for chips / nav, e.g. "Industrial". Falls back to title.',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 60 },
      description:
        'Stable URL/routing key. Use kebab-case: industrial-distribution, home-services, dental. Do NOT change once published.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'parent',
      title: 'Parent industry',
      type: 'reference',
      to: [{ type: 'industry' }],
      description:
        'Leave empty for a top-level vertical. Set it to nest a sub-niche (e.g. "Fluid power" under "Industrial Distribution").',
    }),
    defineField({
      name: 'hubHref',
      title: 'Current destination',
      type: 'string',
      description:
        'Where this industry routes visitors today, until it earns a dedicated hub page. E.g. "/services/", "/revenue-engine/home-services/".',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description: 'One or two sentences on who this is, for hub intros and meta.',
    }),
    defineField({
      name: 'accentColor',
      title: 'Accent color token',
      type: 'string',
      description: 'Optional design token key for this vertical, mirroring the service color system.',
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      description: 'Lower numbers sort first on hubs and pickers.',
      initialValue: 100,
    }),
  ],
  orderings: [
    {
      title: 'Manual order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', parent: 'parent.title' },
    prepare({ title, slug, parent }) {
      return {
        title,
        subtitle: parent ? `↳ ${parent} · ${slug ?? ''}` : (slug ?? 'no slug'),
      }
    },
  },
})
