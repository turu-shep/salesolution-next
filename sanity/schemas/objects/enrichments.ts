import { defineField, defineType } from 'sanity'

/**
 * Reusable enrichment object types (doc 11 §T6). An `enrichments[]` array on a
 * careerPath (or later a glossaryTerm) can carry any of these — OPTIONAL, built
 * only when the content needs it (the enrichment check, doc 10 §3). They obey
 * the guardrails: no state/login, static-first, sourced. Interactive tools are
 * code components looked up by `toolKey` in components/tools/registry.ts — no
 * CMS-authored math is ever eval'd.
 *
 * Shared shape on every type: title, intro (plain-English + citable), placement,
 * source.
 */

const placement = () =>
  defineField({
    name: 'placement',
    title: 'Placement',
    type: 'string',
    description: 'Where on the page this enrichment renders.',
    options: {
      list: [
        { title: 'Top (above the modules)', value: 'top' },
        { title: 'After the modules', value: 'after-modules' },
        { title: 'Near the buyer section', value: 'buyer' },
      ],
    },
    initialValue: 'after-modules',
  })

// Keep this list in sync with components/tools/registry.ts (TOOL_KEYS).
const TOOL_KEY_OPTIONS = [
  { title: 'AI-visibility calculator', value: 'ai-visibility-calculator' },
  { title: 'Catalog AI-readiness scorecard', value: 'catalog-readiness-scorecard' },
]

export const enrichmentTool = defineType({
  name: 'enrichmentTool',
  title: 'Interactive tool',
  type: 'object',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'intro', type: 'text', rows: 2, description: 'Plain-English framing; explain the calc in words so the concept is citable without the widget.' }),
    defineField({
      name: 'toolKey',
      type: 'string',
      title: 'Tool',
      description: 'Which registered tool to embed (components/tools/registry.ts).',
      options: { list: TOOL_KEY_OPTIONS },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'source', type: 'string', description: 'Source/attribution if the tool cites data.' }),
    placement(),
  ],
  preview: { select: { title: 'title', subtitle: 'toolKey' }, prepare: ({ title, subtitle }) => ({ title: title || 'Interactive tool', subtitle }) },
})

export const enrichmentFormula = defineType({
  name: 'enrichmentFormula',
  title: 'Formula',
  type: 'object',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'intro', type: 'text', rows: 2 }),
    defineField({ name: 'expression', type: 'string', description: 'e.g. "Share of voice = your mentions / (your mentions + competitor mentions)"', validation: (r) => r.required() }),
    defineField({ name: 'plainExplanation', type: 'text', rows: 3, title: 'Plain explanation' }),
    defineField({
      name: 'variables',
      type: 'array',
      of: [{ type: 'object', fields: [{ name: 'symbol', type: 'string' }, { name: 'meaning', type: 'string' }] }],
    }),
    defineField({ name: 'source', type: 'string' }),
    placement(),
  ],
  preview: { select: { title: 'title', subtitle: 'expression' }, prepare: ({ title, subtitle }) => ({ title: title || 'Formula', subtitle }) },
})

export const enrichmentTable = defineType({
  name: 'enrichmentTable',
  title: 'Data table',
  type: 'object',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'intro', type: 'text', rows: 2 }),
    defineField({ name: 'columns', type: 'array', of: [{ type: 'string' }], validation: (r) => r.required().min(1) }),
    defineField({
      name: 'rows',
      type: 'array',
      of: [{ type: 'object', name: 'row', fields: [{ name: 'cells', type: 'array', of: [{ type: 'string' }] }], preview: { select: { cells: 'cells' }, prepare: ({ cells }) => ({ title: (cells || []).join(' · ') }) } }],
    }),
    defineField({ name: 'downloadable', type: 'boolean', description: 'Include in the open data artifact.', initialValue: false }),
    defineField({ name: 'source', type: 'string', description: 'Required if the table carries real numbers.' }),
    placement(),
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }) => ({ title: title || 'Data table' }) },
})

export const enrichmentChecklist = defineType({
  name: 'enrichmentChecklist',
  title: 'Checklist',
  type: 'object',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'intro', type: 'text', rows: 2 }),
    defineField({
      name: 'items',
      type: 'array',
      of: [{ type: 'object', name: 'item', fields: [{ name: 'text', type: 'string' }, { name: 'note', type: 'string' }], preview: { select: { title: 'text', subtitle: 'note' } } }],
      validation: (r) => r.required().min(1),
    }),
    defineField({ name: 'source', type: 'string' }),
    placement(),
  ],
  preview: { select: { title: 'title' }, prepare: ({ title }) => ({ title: title || 'Checklist' }) },
})

export const enrichmentDiagram = defineType({
  name: 'enrichmentDiagram',
  title: 'Diagram / image',
  type: 'object',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'intro', type: 'text', rows: 2 }),
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text', validation: (r) => r.required() }],
      validation: (r) => r.required(),
    }),
    defineField({ name: 'caption', type: 'string' }),
    defineField({ name: 'source', type: 'string' }),
    placement(),
  ],
  preview: { select: { title: 'title', media: 'image' }, prepare: ({ title, media }) => ({ title: title || 'Diagram', media }) },
})

export const enrichmentTypes = [
  enrichmentTool,
  enrichmentFormula,
  enrichmentTable,
  enrichmentChecklist,
  enrichmentDiagram,
]

/** The `of: [...]` member list for an `enrichments` array field. */
export const enrichmentArrayMembers = enrichmentTypes.map((t) => ({ type: t.name }))
