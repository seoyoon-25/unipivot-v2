'use client'

import { useState } from 'react'
import { Share2, Link2, Check } from 'lucide-react'
import KakaoShareButton from './KakaoShareButton'
import type { KakaoShareParams } from '@/lib/kakao'

interface Props {
  shareParams: KakaoShareParams
  url: string
}

export default function ShareMenu({ shareParams, url }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <KakaoShareButton params={shareParams} />

      <button
        onClick={handleCopyLink}
        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            복사됨
          </>
        ) : (
          <>
            <Link2 className="w-4 h-4" />
            링크 복사
          </>
        )}
      </button>
    </div>
  )
}
