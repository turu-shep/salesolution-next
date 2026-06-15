import { defineField, defineType } from 'sanity'

/**
 * Case study — one engagement story, told from one service angle.
 *
 * The structure encodes what makes a case study convincing rather than
 * leaving it to editor memory: a metric-first headline with a baseline and
 * a timeframe, results-at-a-glance stats, a situation → constraint →
 * approach → mechanism → results arc, a measurement-methodology block, and
 * a REQUIRED disclosure mode (named / anonymized / composite) so the
 * disclaimer page's "composites are clearly marked" promise holds at
 * render time.
 *
 * Client identity lives on the referenced caseStudyClient document — one
 * client can have several case studies, one per service angle.
 */

const SERVICE_OPTIONS = [
  { title: 'AI Search & GEO', value: 'search' },
  { title: 'Catalog AI', value: 'catalog' },
  { title: 'Editorial Authority', value: 'editorial' },
  { title: 'Website Development', value: 'dev' },
  { title: 'Outbound Email', value: 'outbound' },
  { title: 'Full Growth Ownership', value: 'fullgrowth' },
]

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case study',
  type: 'document',
  groups: [
    { name: 'content', title: 'Story', default: true },
    { name: 'results', title: 'Results & proof' },
    { name: 'meta', title: 'Meta & SEO' },
  ],
  fields: [
    // ── Identity ─────────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Headline',
      type: 'string',
      group: 'content',
      description:
        'Metric-first, with the real numbers: "1,840 to 2,640 qualified leads a month." Business outcomes (leads, revenue, citations), never traffic or rankings.',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'titleMuted',
      title: 'Headline — muted clause',
      type: 'string',
      group: 'content',
      description:
        'Optional second clause rendered in muted ink after the headline, e.g. "No new ad spend." House two-tone heading style.',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 120 },
      description: 'URL path under /case-studies/.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'reference',
      group: 'content',
      to: [{ type: 'caseStudyClient' }],
      description:
        'The client this engagement belongs to. Several case studies can share one client — one per service angle.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'primaryService',
      title: 'Primary service',
      type: 'string',
      group: 'content',
      options: { list: SERVICE_OPTIONS },
      description: 'The service this story is told from. Drives the accent color and hub grouping.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'supportingServices',
      title: 'Supporting services',
      type: 'array',
      group: 'content',
      of: [{ type: 'string' }],
      options: { list: SERVICE_OPTIONS },
      description: 'Other services that ran in the same engagement.',
    }),
    defineField({
      name: 'summary',
      title: 'Summary (lede)',
      type: 'text',
      group: 'content',
      rows: 3,
      description:
        'Two or three sentences a buyer can paste into Slack: who the client is, what changed, over what window.',
      validation: (rule) => rule.required().min(50).max(400),
    }),
    defineField({
      name: 'engagementWindow',
      title: 'Engagement window',
      type: 'string',
      group: 'content',
      description: 'E.g. "Aug 2024 – Jan 2025". A missing timeframe is the #1 tell of a fake case study.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'durationLabel',
      title: 'Duration label',
      type: 'string',
      group: 'content',
      description: 'E.g. "6 months" or "10 weeks".',
      validation: (rule) => rule.required(),
    }),

    // ── Narrative arc ────────────────────────────────────────────────────
    defineField({
      name: 'situation',
      title: 'The situation',
      type: 'portableText',
      group: 'content',
      description:
        'Where the client started, with the baseline numbers, and what triggered the engagement ("why now").',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'constraint',
      title: 'The constraint',
      type: 'portableText',
      group: 'content',
      description:
        'What made it hard — budget, platform, season, internal politics. Conflict is what makes the story believable. Optional but strongly recommended.',
    }),
    defineField({
      name: 'approach',
      title: 'What we ran',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          name: 'approachPhase',
          fields: [
            defineField({
              name: 'title',
              title: 'Phase title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'detail',
              title: 'Detail',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'timeframe',
              title: 'Timeframe',
              type: 'string',
              description: 'E.g. "Weeks 1–3".',
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'timeframe' },
          },
        },
      ],
      description: 'The work, phase by phase. Specific deliverables, not service-brochure language.',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'mechanism',
      title: 'Why it worked',
      type: 'portableText',
      group: 'content',
      description:
        'The causal explanation connecting the work to the numbers. This section is what separates a believable case study from a before/after collage.',
    }),
    defineField({
      name: 'resultsNarrative',
      title: 'What happened',
      type: 'portableText',
      group: 'content',
      description:
        'The results, told honestly — include the dips and the lag before metrics moved. Monotonic up-and-to-the-right reads as fake.',
      validation: (rule) => rule.required(),
    }),

    // ── Results & proof ──────────────────────────────────────────────────
    defineField({
      name: 'keyMetric',
      title: 'Key metric',
      type: 'object',
      group: 'results',
      description: 'The one number the page is built around.',
      fields: [
        defineField({
          name: 'prefix',
          title: 'Prefix',
          type: 'string',
          description: 'Rendered in accent orange, e.g. "+", "−", "×".',
        }),
        defineField({
          name: 'value',
          title: 'Value',
          type: 'string',
          description: 'The number itself, e.g. "43.5" or "8.5". Exact figures beat round ones.',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'unit',
          title: 'Unit',
          type: 'string',
          description: 'Rendered muted after the value, e.g. "%" or "/mo".',
        }),
        defineField({
          name: 'label',
          title: 'Label',
          type: 'string',
          description: 'What the number is, e.g. "Qualified leads / month".',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'sourceLine',
          title: 'Source line',
          type: 'string',
          description: 'Mono micro-label under the metric, e.g. "Aug 2024 – Jan 2025 · client CRM".',
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'stats',
      title: 'Results at a glance',
      type: 'array',
      group: 'results',
      of: [
        {
          type: 'object',
          name: 'statItem',
          fields: [
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'value', subtitle: 'label' },
          },
        },
      ],
      description: '3–4 stats for the scannable strip under the hero.',
      validation: (rule) => rule.required().min(2).max(4),
    }),
    defineField({
      name: 'chart',
      title: 'Metric path chart',
      type: 'object',
      group: 'results',
      description:
        'Optional monthly trajectory of the headline metric. Raw counts from a named source beat percentage deltas.',
      fields: [
        defineField({
          name: 'title',
          title: 'Chart title',
          type: 'string',
          description: 'E.g. "Qualified leads · per month".',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'source',
          title: 'Source note',
          type: 'string',
          description: 'E.g. "Client’s CRM, anonymized · monthly aggregate".',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'points',
          title: 'Data points',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'chartPoint',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Label',
                  type: 'string',
                  description: 'X-axis label, e.g. "Aug".',
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: 'value',
                  title: 'Value',
                  type: 'number',
                  validation: (rule) => rule.required(),
                }),
              ],
              preview: {
                select: { title: 'label', subtitle: 'value' },
              },
            },
          ],
          validation: (rule) => rule.min(3),
        }),
        defineField({
          name: 'yMin',
          title: 'Y-axis minimum',
          type: 'number',
          description: 'Optional. Defaults to a computed bound below the data.',
        }),
        defineField({
          name: 'yMax',
          title: 'Y-axis maximum',
          type: 'number',
          description: 'Optional. Defaults to a computed bound above the data.',
        }),
      ],
    }),
    defineField({
      name: 'quote',
      title: 'Pull quote',
      type: 'object',
      group: 'results',
      description:
        'One quote, attributed at minimum by role. Must not contradict the numbers on this page.',
      fields: [
        defineField({
          name: 'text',
          title: 'Quote',
          type: 'text',
          rows: 3,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'name',
          title: 'Name',
          type: 'string',
          description: 'Only when the client is named and has approved the attribution.',
        }),
        defineField({
          name: 'role',
          title: 'Role / title',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'methodology',
      title: 'How the numbers were measured',
      type: 'array',
      group: 'results',
      of: [
        {
          type: 'object',
          name: 'methodologyItem',
          fields: [
            defineField({
              name: 'metric',
              title: 'Metric',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'method',
              title: 'Measurement method',
              type: 'text',
              rows: 2,
              description:
                'Tool, sample, baseline window, attribution model — e.g. "Qualified inbounds counted in the client’s CRM; baseline = August 2024 actual."',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'metric', subtitle: 'method' },
          },
        },
      ],
      description:
        'One entry per number on the page. Methodology disclosure is what makes a metric believable, especially AI-visibility metrics.',
      validation: (rule) => rule.required().min(1),
    }),

    // ── Disclosure ───────────────────────────────────────────────────────
    defineField({
      name: 'disclosure',
      title: 'Disclosure mode',
      type: 'string',
      group: 'results',
      options: {
        list: [
          { title: 'Named client (client signed off)', value: 'named' },
          { title: 'Anonymized (real engagement, name withheld)', value: 'anonymized' },
          { title: 'Composite (aggregated from multiple engagements)', value: 'composite' },
        ],
        layout: 'radio',
      },
      initialValue: 'anonymized',
      description:
        'Drives the on-page disclosure copy. "Named" requires the client document to have a publicName. The disclaimer page promises composites are clearly marked — this field is how that promise is kept.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'disclosureNote',
      title: 'Disclosure note override',
      type: 'text',
      group: 'results',
      rows: 3,
      description:
        'Optional. Replaces the default disclosure sentence rendered for the selected mode.',
    }),

    // ── Meta ─────────────────────────────────────────────────────────────
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      group: 'meta',
      initialValue: false,
      description: 'Featured case studies sort first on the hub.',
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
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'meta',
    }),
    defineField({
      name: 'internalNotes',
      title: 'Internal notes',
      type: 'text',
      group: 'meta',
      rows: 6,
      description:
        'Editor-only: open verification questions, sources for each number, what was changed from earlier copy. Never rendered.',
    }),
  ],
  orderings: [
    {
      title: 'Featured, then newest',
      name: 'featuredPublishedDesc',
      by: [
        { field: 'featured', direction: 'desc' },
        { field: 'publishedAt', direction: 'desc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      clientDescriptor: 'client.descriptor',
      disclosure: 'disclosure',
    },
    prepare({ title, clientDescriptor, disclosure }) {
      const flag = disclosure === 'composite' ? '⚠ composite · ' : ''
      return { title, subtitle: `${flag}${clientDescriptor ?? 'no client set'}` }
    },
  },
})
