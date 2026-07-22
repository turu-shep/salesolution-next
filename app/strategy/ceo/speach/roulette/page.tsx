import Link from 'next/link'

import { MarkdownDoc } from '@/components/sales/MarkdownDoc'
import { CEO_SPEECH_ROULETTE_MD } from '@/lib/strategy/docs/ceo-speech-roulette'

export const metadata = { title: 'Objection roulette' }

export default function CeoSpeechRoulettePage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/strategy/ceo/speach" className="text-ink-400 hover:text-ink-700">
          Speaking program
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">Objection roulette</span>
      </div>
      <MarkdownDoc markdown={CEO_SPEECH_ROULETTE_MD} />
    </div>
  )
}
