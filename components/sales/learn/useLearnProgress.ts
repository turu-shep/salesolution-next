import { useEffect, useRef, useState } from 'react'

import type { Level } from '@/lib/sales/learn'

const LEVELS_KEY = 'sales.learn.levels'
const STEPS_KEY = 'sales.learn.steps'

/**
 * localStorage-backed learning progress: a level per skill and a done flag per path
 * step. No backend — it's the learner's own private tracker.
 */
export function useLearnProgress() {
  const [levels, setLevels] = useState<Record<string, Level>>({})
  const [doneSteps, setDoneSteps] = useState<Record<string, boolean>>({})
  const hydrated = useRef(false)

  // Persist on change. Declared before the hydrate effect so the initial empty write is skipped.
  useEffect(() => {
    if (!hydrated.current) return
    try {
      localStorage.setItem(LEVELS_KEY, JSON.stringify(levels))
      localStorage.setItem(STEPS_KEY, JSON.stringify(doneSteps))
    } catch {
      // storage unavailable — keep working in-memory
    }
  }, [levels, doneSteps])

  useEffect(() => {
    try {
      const l = localStorage.getItem(LEVELS_KEY)
      const s = localStorage.getItem(STEPS_KEY)
      /* eslint-disable react-hooks/set-state-in-effect -- one-time SSR-safe hydration from localStorage */
      if (l) setLevels(JSON.parse(l))
      if (s) setDoneSteps(JSON.parse(s))
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {
      // ignore malformed storage
    }
    hydrated.current = true
  }, [])

  return {
    levels,
    setLevel: (skillId: string, level: Level) => setLevels((prev) => ({ ...prev, [skillId]: level })),
    doneSteps,
    toggleStep: (stepId: string) => setDoneSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] })),
  }
}
