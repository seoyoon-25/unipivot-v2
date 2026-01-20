'use client'

import { Share2 } from 'lucide-react'

interface ShareButtonProps {
  title: string
  className?: string
}

export function ShareButton({ title, className }: ShareButtonProps) {
  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title, url: window.location.href })
    } else {
      // Fallback: copy to clipboard
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href)
        alert('링크가 복사되었습니다.')
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className={className || "flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"}
    >
      <Share2 className="w-4 h-4" />
      공유하기
    </button>
  )
}
