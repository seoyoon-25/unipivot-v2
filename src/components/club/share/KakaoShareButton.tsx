'use client'

import { useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { initKakao, shareToKakao, type KakaoShareParams } from '@/lib/kakao'

interface Props {
  params: KakaoShareParams
  className?: string
}

export default function KakaoShareButton({ params, className }: Props) {
  useEffect(() => {
    const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.6.0/kakao.min.js'

    // Prevent duplicate script loading
    const existing = document.querySelector(`script[src="${KAKAO_SDK_URL}"]`)
    if (existing) {
      initKakao()
      return
    }

    const script = document.createElement('script')
    script.src = KAKAO_SDK_URL
    script.async = true
    script.crossOrigin = 'anonymous'
    script.onload = () => initKakao()
    document.head.appendChild(script)
  }, [])

  const handleShare = () => {
    shareToKakao(params)
  }

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-4 py-2 bg-[#FEE500] text-[#391B1B] rounded-lg hover:bg-[#FDD835] transition-colors text-sm ${className || ''}`}
    >
      <MessageCircle className="w-4 h-4" />
      카카오톡 공유
    </button>
  )
}
