/**
 * Pure calculation for the AI-visibility tool — kept out of the React component
 * so the logic is testable and reusable (career paths + the glossary measurement
 * terms both embed it). No I/O, no state.
 *
 *  mention rate  = answers that named you / prompts tested
 *  citation rate = answers that cited you (linked you as a source) / prompts tested
 *  share of voice = your mentions / (your mentions + a competitor's mentions)
 */
export type AiVisibilityInputs = {
  prompts: number
  mentions: number
  citations: number
  competitorMentions?: number
}

export type AiVisibilityResult = {
  mentionRate: number // 0..1
  citationRate: number // 0..1
  shareOfVoice: number | null // 0..1, or null when no competitor figure given
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(Number.isFinite(n) ? n : 0, min), max)

export function computeAiVisibility(i: AiVisibilityInputs): AiVisibilityResult {
  const prompts = Math.max(0, Math.floor(i.prompts || 0))
  const cap = prompts || Math.max(i.mentions || 0, i.citations || 0)
  const mentions = clamp(Math.floor(i.mentions || 0), 0, cap)
  const citations = clamp(Math.floor(i.citations || 0), 0, cap)
  const comp = i.competitorMentions == null ? null : Math.max(0, Math.floor(i.competitorMentions))

  return {
    mentionRate: prompts > 0 ? mentions / prompts : 0,
    citationRate: prompts > 0 ? citations / prompts : 0,
    shareOfVoice: comp != null && mentions + comp > 0 ? mentions / (mentions + comp) : null,
  }
}
