'use client'

import type { Level } from '@/lib/sales/learn'
import { LEVELS, PATH, SKILLS, SKILL_CATEGORIES } from '@/lib/sales/learn'

import { PathStepCard } from './PathStepCard'
import { SkillCard } from './SkillCard'
import { useLearnProgress } from './useLearnProgress'

export function LearnApp() {
  const { levels, setLevel, doneSteps, toggleStep } = useLearnProgress()

  const doneCount = PATH.filter((s) => doneSteps[s.id]).length

  const counts = LEVELS.reduce<Record<Level, number>>(
    (acc, lv) => ({ ...acc, [lv.id]: 0 }),
    { 'not-started': 0, learning: 0, drilling: 0, live: 0, instinct: 0 },
  )
  for (const s of SKILLS) counts[levels[s.id] ?? 'not-started']++

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Learn it, step by step</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Never sold on a cold call, voice still warming up, English as a second language — all fine. This is the
          order to build it, plus a dashboard to track every skill from &ldquo;not started&rdquo; to &ldquo;instinct.&rdquo;
          Go slow. One stage at a time.
        </p>
      </div>

      <div className="rounded-lg border-l-2 border-accent-600 bg-surface-alt p-4">
        <p className="text-sm font-semibold text-ink-800">A note on your voice — read this first</p>
        <p className="mt-1 text-[13px] text-ink-600">
          The warmups and habits here keep a healthy voice healthy; they don&apos;t fix an underlying problem. Since your
          voice already tires and strains, book a one-time voice assessment with a speech-language pathologist (SLP) —
          that&apos;s genuinely recommended, not optional. And stop and see an ENT if you get pain, voice loss, or
          hoarseness that lasts more than two weeks. None of these drills replace that.
        </p>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-900">The path</h2>
          <span className="font-mono text-[11px] uppercase tracking-wide text-ink-400">
            {doneCount} / {PATH.length} done
          </span>
        </div>
        <div className="space-y-2">
          {PATH.map((s) => (
            <PathStepCard key={s.id} step={s} done={!!doneSteps[s.id]} onToggle={() => toggleStep(s.id)} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-ink-900">Skills dashboard</h2>
        <div className="mt-2 mb-4 flex flex-wrap gap-2 text-[11px]">
          {LEVELS.map((lv) => (
            <span key={lv.id} className="rounded bg-surface-alt px-2 py-1 text-ink-500">
              <span className="font-semibold text-ink-700">{counts[lv.id]}</span> {lv.label}
            </span>
          ))}
        </div>

        <div className="space-y-6">
          {SKILL_CATEGORIES.map((cat) => {
            const skills = SKILLS.filter((s) => s.category === cat.id)
            if (!skills.length) return null
            return (
              <div key={cat.id}>
                <p className="text-sm font-semibold text-ink-800">{cat.label}</p>
                <p className="mb-2 text-[12px] text-ink-400">{cat.blurb}</p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {skills.map((s) => (
                    <SkillCard
                      key={s.id}
                      skill={s}
                      level={levels[s.id] ?? 'not-started'}
                      onLevel={(l) => setLevel(s.id, l)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
