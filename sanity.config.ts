/**
 * Root Sanity Studio config. Imported by `app/studio/[[...tool]]/page.tsx`
 * and by the Sanity CLI (which expects this exact filename at the project root).
 */
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { apiVersion, dataset, projectId } from './sanity/env'
import { schemaTypes } from './sanity/schemas'
import { structure } from './sanity/structure'

export default defineConfig({
  name: 'salesolution',
  title: 'Sale Solution',
  basePath: '/studio',
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({ structure }),
    // GROQ query playground at /studio/vision — useful for debugging.
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
