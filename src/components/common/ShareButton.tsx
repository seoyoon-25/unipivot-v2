'use client'

import { useState } from 'react'
import { Share2, Link, Check, X } from 'lucide-react'

interface ShareButtonProps {
  title: string
  description?: string
  url?: string
  imageUrl?: string
  className?: string
}

declare global {
  interface Window {
    Kakao?: any
  }
}

export function ShareButton({
  title,
  description,
  url,
  imageUrl,
  className = '',
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleKakaoShare = () => {
    if (typeof window !== 'undefined' && window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        // You need to set your Kakao App Key
        const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY
        if (kakaoKey) {
          window.Kakao.init(kakaoKey)
        }
      }

      if (window.Kakao.isInitialized()) {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title,
            description: description || '',
            imageUrl: imageUrl || 'https://unipivot.kr/images/og-default.jpg',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
          buttons: [
            {
              title: '자세히 보기',
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
              },
            },
          ],
        })
      } else {
        // Fallback to Kakao talk share link
        const kakaoShareUrl = `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}`
        window.open(kakaoShareUrl, '_blank', 'width=600,height=400')
      }
    }
    setIsOpen(false)
  }

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or error
      }
    }
  }

  // Check for native share support
  const hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const handleShareClick = () => {
    if (hasNativeShare) {
      handleNativeShare()
    } else {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleShareClick}
        className={`flex items-center gap-2 ${className}`}
        title="공유하기"
      >
        <Share2 className="w-5 h-5" />
        <span className="hidden sm:inline">공유</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Share Menu */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border z-50 py-2">
            <div className="px-4 py-2 border-b">
              <h3 className="font-medium text-gray-900">공유하기</h3>
            </div>

            {/* Kakao */}
            <button
              onClick={handleKakaoShare}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-[#FEE500] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E">
                  <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 01-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
                </svg>
              </div>
              <span className="text-gray-700">카카오톡</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebookShare}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-[#1877F2] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <span className="text-gray-700">페이스북</span>
            </button>

            {/* Twitter/X */}
            <button
              onClick={handleTwitterShare}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <span className="text-gray-700">X (트위터)</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-t"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Link className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <span className="text-gray-700">
                {copied ? '복사됨!' : '링크 복사'}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
