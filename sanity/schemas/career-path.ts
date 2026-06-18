import { defineField, defineType } from 'sanity'

import { enrichmentArrayMembers } from './objects/enrichments'

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
      name: 'kind',
      title: 'Kind',
      type: 'string',
      description:
        'Role = a hireable profession with a career ladder (SEO Specialist, GEO Specialist). Specialization = a skill/competency, usually bought as a project or held inside a role, not a constant full-time hire (Technical SEO, Citation Engineering).',
      options: {
        list: [
          { title: 'Role (a profession you can be hired for)', value: 'role' },
          { title: 'Specialization (a skill / project capability)', value: 'specialization' },
        ],
      },
      initialValue: 'role',
    }),
    defineField({
      name: 'role',
      title: 'Role focus',
      type: 'string',
      description: 'e.g. SEO Specialist, Content Strategy Specialist',
    }),
    defineField({
      name: 'level',
      title: 'Level / proficiency',
      type: 'string',
      description: 'For roles: career level. For specializations: proficiency depth. "Entry → Senior" for a full-arc path.',
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
            { name: 'label', type: 'string', title: 'Stage descriptor (e.g. "run the checks")' },
            { name: 'focus', type: 'text', rows: 2, title: 'Focus (the "by the end you can…" outcome)' },
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
      name: 'modules',
      title: 'Skill modules',
      type: 'array',
      description:
        'The path as a numbered progression of skills, grouped by level. This is the preferred model (replaces freeform body chapters). Each module = one competency with a real scenario, edge cases, and a proficiency check.',
      of: [
        {
          type: 'object',
          name: 'skillModule',
          fields: [
            {
              name: 'level',
              type: 'string',
              title: 'Level',
              options: { list: ['Entry', 'Mid', 'Senior'] },
              validation: (rule) => rule.required(),
            },
            {
              name: 'weight',
              type: 'string',
              title: 'Weight',
              description:
                'core = required for the role; alternative = a swap-in for a core skill (pick this or that); flexible = useful but order/inclusion is loose. "core" shows no badge.',
              options: {
                list: [
                  { title: 'Core (required)', value: 'core' },
                  { title: 'Alternative (swap-in)', value: 'alternative' },
                  { title: 'Flexible (learn anytime)', value: 'flexible' },
                ],
              },
              initialValue: 'core',
            },
            { name: 'title', type: 'string', title: 'Skill title', validation: (rule) => rule.required() },
            { name: 'skill', type: 'text', rows: 2, title: 'The skill (what you must be able to do)' },
            { name: 'why', type: 'text', rows: 3, title: 'Why it matters' },
            { name: 'scenario', type: 'text', rows: 3, title: 'In the field (a real scenario)' },
            {
              name: 'edgeCases',
              type: 'array',
              of: [{ type: 'string' }],
              title: 'Edge cases (the gotchas)',
            },
            { name: 'proficientWhen', type: 'text', rows: 2, title: 'Proficient when…' },
            {
              name: 'relatedTerms',
              type: 'array',
              title: 'Glossary terms this skill teaches',
              description:
                'The 1–3 glossary terms most central to this skill. Rendered as inline "See:" links under the module (the roadmap.sh node→concept behaviour).',
              of: [{ type: 'reference', to: [{ type: 'glossaryTerm' }] }],
            },
          ],
          preview: { select: { title: 'title', subtitle: 'level' } },
        },
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body (intro / optional prose)',
      type: 'portableText',
      description:
        'Optional short intro above the modules. (Legacy: older paths put the whole walk here as H2 chapters; new paths use Skill modules instead.)',
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
      name: 'prerequisites',
      title: 'Prerequisites (paths to learn first)',
      type: 'array',
      description:
        'The paths a reader should know before this one — e.g. SEO Specialist before GEO Specialist. Renders as a "Before this path" line and feeds the dependency map.',
      of: [{ type: 'reference', to: [{ type: 'careerPath' }] }],
    }),
    defineField({
      name: 'leadsTo',
      title: 'Leads to (where this path goes next)',
      type: 'array',
      description:
        'The natural next paths after this one. Renders as the "Where this leads" rail (replaces the default newest-first siblings when set).',
      of: [{ type: 'reference', to: [{ type: 'careerPath' }] }],
    }),
    defineField({
      name: 'relatedTerms',
      title: 'Related glossary terms',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'glossaryTerm' }] }],
    }),
    defineField({
      name: 'interactiveAidStatus',
      title: 'Enrichment status',
      type: 'string',
      description:
        'The enrichment check (doc 10 §3), made auditable. Has this path been assessed for a calculator / dataset / diagram, and what came of it?',
      options: {
        list: [
          { title: 'Not assessed', value: 'not-assessed' },
          { title: 'None needed', value: 'none-needed' },
          { title: 'Planned', value: 'planned' },
          { title: 'Built', value: 'built' },
        ],
      },
      initialValue: 'not-assessed',
    }),
    defineField({
      name: 'enrichments',
      title: 'Enrichments (optional)',
      type: 'array',
      description:
        'Optional calculators, formulas, tables, checklists, or diagrams — built only when the content needs them (doc 10/11). Each carries a placement.',
      of: enrichmentArrayMembers,
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
