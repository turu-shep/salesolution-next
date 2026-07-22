import Link from 'next/link'

import { MarkdownDoc } from '@/components/sales/MarkdownDoc'
import { CEO_SPEECH_CALENDAR_MD } from '@/lib/strategy/docs/ceo-speech-calendar'

export const metadata = { title: 'Training calendar' }

export default function CeoSpeechCalendarPage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm">
        <Link href="/strategy/ceo/speach" className="text-ink-400 hover:text-ink-700">
          Speaking program
        </Link>
        <span className="text-ink-300">/</span>
        <span className="text-ink-700">Training calendar</span>
      </div>
      <MarkdownDoc markdown={CEO_SPEECH_CALENDAR_MD} />
    </div>
  )
}
