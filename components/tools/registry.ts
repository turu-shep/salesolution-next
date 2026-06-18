import type { ComponentType } from 'react'

import { AiVisibilityCalculator } from './AiVisibilityCalculator'

/**
 * The single tool registry for the whole learning hub — maps a stable `toolKey`
 * to a real, code-defined React component (no CMS-authored logic, nothing
 * eval'd). Career-path and glossary enrichments both embed tools by key through
 * here. Add a tool: build the component, register it, add its key to the Sanity
 * `toolKey` option list (sanity/schemas/objects/enrichments.ts).
 */
export const toolRegistry: Record<string, ComponentType> = {
  'ai-visibility-calculator': AiVisibilityCalculator,
}

/** Stable list of valid keys — keep in sync with the Sanity `toolKey` options. */
export const TOOL_KEYS = Object.keys(toolRegistry)

export function getTool(key?: string): ComponentType | null {
  if (!key) return null
  return toolRegistry[key] ?? null
}
