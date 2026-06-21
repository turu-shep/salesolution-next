'use client'

import Link from 'next/link'
import { useState } from 'react'

import type { Level, Skill } from '@/lib/sales/learn'
import { LEVELS } from '@/lib/sales/learn'

function ParamList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wide text-ink-400">{label}</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-ink-700">
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  )
}

/** One skill: name + summary, a 5-step level selector, and expandable params/criteria/drills. */
export function SkillCard({
  skill,
  level,
  onLevel,
}: {
  skill: Skill
  level: Level
  onLevel: (level: Level) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border border-rule bg-surface p-3">
      <button onClick={() => setOpen(!open)} className="block w-full text-left">
        <span className="text-sm font-semibold text-ink-800">{skill.name}</span>
        <span className="mt-0.5 block text-[13px] text-ink-500">{skill.summary}</span>
      </button>

      <div className="mt-3 flex flex-wrap gap-1">
        {LEVELS.map((lv) => {
          const active = lv.id === level
          return (
            <button
              key={lv.id}
              onClick={() => onLevel(lv.id)}
              title={lv.blurb}
              aria-pressed={active}
              className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                active ? 'bg-accent-600 text-ink-inverse' : 'bg-surface-alt text-ink-500 hover:bg-rule'
              }`}
            >
              {lv.label}
            </button>
          )
        })}
      </div>

      <button onClick={() => setOpen(!open)} className="mt-2 text-xs text-accent-600 hover:underline">
        {open ? 'Hide' : 'Params & drills'}
      </button>

      {open ? (
        <div className="mt-3 space-y-3 text-[13px]">
          <ParamList label="Params to master" items={skill.params} />
          <ParamList label="Proficient when" items={skill.proficientWhen} />
          <ParamList label="Drills" items={skill.drills} />
          {skill.link ? (
            <Link href={skill.link.href} className="inline-block text-xs text-accent-600 hover:underline">
              {skill.link.label} →
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
