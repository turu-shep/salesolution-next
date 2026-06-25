import type { SchemaTypeDefinition } from 'sanity'

import { author } from './author'
import { careerPath } from './career-path'
import { caseStudy } from './case-study'
import { caseStudyClient } from './case-study-client'
import { glossaryTerm } from './glossary-term'
import { guide } from './guide'
import { industry } from './industry'
import { enrichmentTypes } from './objects/enrichments'
import { faqItem } from './objects/faq-item'
import { portableText } from './objects/portable-text'
import { seo } from './objects/seo'
import { series } from './objects/series'
import { post } from './post'
import { precallLead } from './precall-lead'
import { service } from './service'
import { siteSettings } from './site-settings'
import { testimonial } from './testimonial'

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  post,
  guide,
  careerPath,
  glossaryTerm,
  caseStudy,
  caseStudyClient,
  industry,
  service,
  testimonial,
  author,
  siteSettings,
  precallLead,
  // Reusable objects
  portableText,
  seo,
  series,
  faqItem,
  ...enrichmentTypes,
]
