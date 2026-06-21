import { useEffect, useRef, useState } from 'react'

import type { CallLog } from '@/lib/sales/playbook'

const KEY = 'sales.cockpit.calllog'

/**
 * Session-persistent call log backed by localStorage (no backend in v1). The logger
 * writes here; CSV/JSON export feeds Apollo between call blocks. Newest first.
 */
export function useCallLog() {
  const [logs, setLogs] = useState<CallLog[]>([])
  const hydrated = useRef(false)

  // Persist on change. Declared before the hydrate effect so on mount it runs first
  // and skips the initial empty write (guarded by `hydrated`), avoiding a clobber.
  useEffect(() => {
    if (!hydrated.current) return
    try {
      localStorage.setItem(KEY, JSON.stringify(logs))
    } catch {
      // storage unavailable / full — keep working in-memory
    }
  }, [logs])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time SSR-safe hydration from localStorage
        if (Array.isArray(parsed)) setLogs(parsed as CallLog[])
      }
    } catch {
      // ignore malformed storage
    }
    hydrated.current = true
  }, [])

  return {
    logs,
    add: (log: CallLog) => setLogs((prev) => [log, ...prev]),
    remove: (id: string) => setLogs((prev) => prev.filter((l) => l.id !== id)),
    clear: () => setLogs([]),
  }
}
