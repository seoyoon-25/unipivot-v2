'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, ArrowRight } from 'lucide-react'

const STORAGE_KEY = 'club-banner-dismissed'

export function ClubBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      setDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setDismissed(true)
  }

  // CLS 방지: placeholder → null 전환 대신 opacity/height 트랜지션 사용
  // SSR: 배너 렌더링 (공간 확보), mounted 후 dismissed면 접기 애니메이션
  const isHidden = mounted && dismissed

  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-out"
      style={{
        maxHeight: isHidden ? '0px' : '200px',
        opacity: isHidden ? 0 : 1,
        marginBottom: isHidden ? '0px' : '2rem',
      }}
    >
      <div className="relative bg-gradient-to-r from-[#FF6B35] to-[#FF8F5E] rounded-2xl p-5 md:p-6 text-white overflow-hidden">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="배너 닫기"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-bold text-lg">프로그램 끝나도 계속! 유니클럽에서 만나요</p>
            <p className="text-white/80 text-sm mt-1">독후감 공유 · 독서 챌린지 · 멤버들과 소통</p>
          </div>
          <Link
            href="/club"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#FF6B35] rounded-xl font-semibold hover:bg-white/90 transition-colors shrink-0"
          >
            유니클럽 둘러보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
