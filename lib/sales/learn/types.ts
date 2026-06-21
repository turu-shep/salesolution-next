/**
 * The learning system: a skills dashboard (skills broken into the params to master,
 * with a proficiency level you track) and a step-by-step path from zero to first
 * booked calls. Tuned for a first-time caller, non-native English speaker, with a
 * voice that needs conditioning. Rendered + tracked at /sales/learn.
 */

export type SkillCategory = 'foundations' | 'voice' | 'the-call' | 'psychology' | 'your-head'

export const SKILL_CATEGORIES: { id: SkillCategory; label: string; blurb: string }[] = [
  { id: 'foundations', label: 'Foundations', blurb: 'Know the game before you dial.' },
  { id: 'voice', label: 'Voice & English', blurb: 'The instrument — warm it up, slow it down, be understood.' },
  { id: 'the-call', label: 'The call', blurb: 'Open, discover, pitch, close — the mechanics.' },
  { id: 'psychology', label: 'Psychology', blurb: 'The craft underneath the words.' },
  { id: 'your-head', label: 'Your head', blurb: 'State, nerves, and the long game.' },
]

/** A proficiency level the learner sets per skill (and the dashboard summarizes). */
export type Level = 'not-started' | 'learning' | 'drilling' | 'live' | 'instinct'

export const LEVELS: { id: Level; label: string; blurb: string }[] = [
  { id: 'not-started', label: 'Not started', blurb: "Haven't touched it yet." },
  { id: 'learning', label: 'Learning', blurb: 'Reading it, understanding it.' },
  { id: 'drilling', label: 'Drilling', blurb: 'Practicing solo — out loud, recorded.' },
  { id: 'live', label: 'Live', blurb: 'Using it on real calls.' },
  { id: 'instinct', label: 'Instinct', blurb: 'It happens without thinking.' },
]

export interface Skill {
  id: string
  category: SkillCategory
  name: string
  /** One line: what it is. */
  summary: string
  /** The components to master — the "params." */
  params: string[]
  /** Observable criteria — you've got it when… */
  proficientWhen: string[]
  /** How to practice it. */
  drills: string[]
  /** Where to read more (manual section / cockpit). */
  link?: { label: string; href: string }
}

export interface PathStep {
  id: string
  stage: number
  title: string
  /** What you'll be able to do after this stage. */
  outcome: string
  /** Concrete actions to take. */
  doThis: string[]
  /** Voice-specific guidance for this stage. */
  voiceNote?: string
  /** Non-native-English guidance for this stage. */
  nonNativeNote?: string
  drills?: string[]
  /** Gate: you're ready for the next stage when… */
  readyWhen: string[]
  /** Skill ids this stage builds. */
  buildsSkills?: string[]
}
