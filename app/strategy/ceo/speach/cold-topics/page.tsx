import Link from 'next/link'

import { MarkdownDoc } from '@/components/sales/MarkdownDoc'
import { CEO_SPEECH_COLD_TOPICS_MD } from '@/lib/strategy/docs/ceo-speech-cold-topics'

export const metadata = { title: 'Cold-topic bank' }

export default function CeoSpeechColdTopicsPage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/strategy/ceo/speach" className="text-ink-400 hover:text-ink-700">
          Speaking program
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">Cold-topic bank</span>
      </div>
      <MarkdownDoc markdown={CEO_SPEECH_COLD_TOPICS_MD} />
    </div>
  )
}
