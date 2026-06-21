/** Registry for the learning system — the single import surface. */
import type { Skill, SkillCategory } from './types'
import { PATH } from './path'
import { SKILLS } from './skills'

export * from './types'
export { SKILLS } from './skills'
export { PATH } from './path'

export function skillsByCategory(category: SkillCategory): Skill[] {
  return SKILLS.filter((s) => s.category === category)
}

export function getSkill(id: string): Skill | undefined {
  return SKILLS.find((s) => s.id === id)
}

export const PATH_LENGTH = PATH.length
