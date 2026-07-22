import Link from 'next/link'

import { MarkdownDoc } from '@/components/sales/MarkdownDoc'
import { CEO_SPEECH_HOW_AND_WHY_MD } from '@/lib/strategy/docs/ceo-speech-how-and-why'

export const metadata = { title: 'How this works, and why' }

export default function CeoSpeechHowAndWhyPage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/strategy/ceo/speach" className="text-ink-400 hover:text-ink-700">
          Speaking program
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">How this works, and why</span>
      </div>
      <MarkdownDoc markdown={CEO_SPEECH_HOW_AND_WHY_MD} />
    </div>
  )
}
