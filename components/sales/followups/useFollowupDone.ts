import { useEffect, useRef, useState } from 'react'

const KEY = 'sales.followups.done'

/** localStorage set of call-log ids whose follow-up has been handled. */
export function useFollowupDone() {
  const [done, setDone] = useState<Record<string, boolean>>({})
  const hydrated = useRef(false)

  useEffect(() => {
    if (!hydrated.current) return
    try {
      localStorage.setItem(KEY, JSON.stringify(done))
    } catch {
      // storage unavailable
    }
  }, [done])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time SSR-safe hydration from localStorage
      if (raw) setDone(JSON.parse(raw))
    } catch {
      // ignore
    }
    hydrated.current = true
  }, [])

  return {
    done,
    toggle: (id: string) => setDone((prev) => ({ ...prev, [id]: !prev[id] })),
  }
}
