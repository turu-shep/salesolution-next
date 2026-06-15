import { defineField, defineType } from 'sanity'

/**
 * One document per client (= per project/engagement relationship).
 *
 * Case studies reference this document instead of repeating client facts,
 * so the descriptor, scale, and naming decision live in exactly one place.
 * This exists because the old hardcoded sections drifted: the same client
 * was "~8,500 SKUs" in one file and "all 8,500 SKUs" in another, +43% in
 * one and +43.5% in another. Facts that describe the CLIENT belong here;
 * facts that describe one ENGAGEMENT belong on the caseStudy document.
 *
 * A client can have several case studies — one per service angle
 * (e.g. the same distributor has a Catalog AI story and a replatform story).
 */
export const caseStudyClient = defineType({
  name: 'caseStudyClient',
  title: 'Case study client',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Internal name',
      type: 'string',
      description:
        'Real client name, for editors only. NEVER rendered on the site — the public sees publicName (if disclosed) or the descriptor.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publicName',
      title: 'Public name',
      type: 'string',
      description:
        'Only fill this in once the client has signed off on being named. Rendered only when a case study’s disclosure is set to "Named client".',
    }),
    defineField({
      name: 'descriptor',
      title: 'Public descriptor',
      type: 'string',
      description:
        'How the client is identified when anonymized — precise vertical + company type, e.g. "Industrial hydraulics distributor". Specificity is what keeps anonymized case studies credible.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'industry',
      title: 'Industry',
      type: 'string',
      description: 'E.g. "Industrial distribution · fluid power".',
    }),
    defineField({
      name: 'scale',
      title: 'Scale descriptor',
      type: 'string',
      description:
        'Size band the prospect can self-identify with, e.g. "~8,500 SKUs" or "12k SKUs · 17 brands". Keep the ~ when the number is approximate.',
    }),
    defineField({
      name: 'region',
      title: 'Region',
      type: 'string',
      description:
        'Optional. Omit if region + scale + vertical together would identify an anonymized client.',
    }),
    defineField({
      name: 'internalNotes',
      title: 'Internal notes',
      type: 'text',
      rows: 4,
      description: 'Editor-only context. Never rendered.',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'descriptor' },
  },
})
