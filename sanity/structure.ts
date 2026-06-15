import type { StructureResolver } from 'sanity/structure'

/**
 * Studio sidebar layout. `siteSettings` is rendered as a singleton (no list),
 * everything else falls through to Sanity's default document list.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      S.documentTypeListItem('post').title('Blog posts'),
      S.documentTypeListItem('guide').title('Guides'),
      S.documentTypeListItem('careerPath').title('Career paths'),
      S.documentTypeListItem('glossaryTerm').title('Glossary'),
      S.documentTypeListItem('service').title('Services'),
      S.divider(),
      S.documentTypeListItem('caseStudy').title('Case studies'),
      S.documentTypeListItem('caseStudyClient').title('Case study clients'),
      S.documentTypeListItem('testimonial').title('Testimonials'),
      S.documentTypeListItem('author').title('Authors'),
    ])
