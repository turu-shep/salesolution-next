import { useEffect, useRef, useState } from 'react'

const KEY = 'sales.drill.mastered'

/** localStorage set of drill-card ids the learner has marked "got it". */
export function useMastered() {
  const [mastered, setMastered] = useState<Record<string, boolean>>({})
  const hydrated = useRef(false)

  useEffect(() => {
    if (!hydrated.current) return
    try {
      localStorage.setItem(KEY, JSON.stringify(mastered))
    } catch {
      // storage unavailable
    }
  }, [mastered])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time SSR-safe hydration from localStorage
      if (raw) setMastered(JSON.parse(raw))
    } catch {
      // ignore
    }
    hydrated.current = true
  }, [])

  return {
    mastered,
    mark: (id: string) => setMastered((prev) => ({ ...prev, [id]: true })),
    reset: () => setMastered({}),
  }
}
