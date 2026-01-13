'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Youtube } from 'lucide-react'

interface YoutubeInsertProps {
  onSubmit: (url: string) => void
  onClose: () => void
}

export function YoutubeInsert({ onSubmit, onClose }: YoutubeInsertProps) {
  const [url, setUrl] = useState('')
  const [isValid, setIsValid] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // URL 유효성 검사
  useEffect(() => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    setIsValid(youtubeRegex.test(url))
  }, [url])

  // 유튜브 비디오 ID 추출
  const getVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url && isValid) {
      onSubmit(url)
    }
  }

  const videoId = getVideoId(url)

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-2 p-4 bg-white rounded-xl shadow-lg border border-gray-200 z-50 w-96"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Youtube className="w-4 h-4 text-red-500" />
          <span className="text-sm font-medium text-gray-700">유튜브 영상 삽입</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
            url && !isValid
              ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
              : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
          }`}
        />

        {url && !isValid && (
          <p className="mt-1 text-xs text-red-500">올바른 유튜브 URL을 입력해주세요.</p>
        )}

        {/* 미리보기 */}
        {videoId && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">미리보기</p>
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video preview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!isValid}
          className="mt-3 w-full px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          삽입
        </button>
      </form>

      <p className="mt-3 text-xs text-gray-400">
        지원: youtube.com, youtu.be, YouTube Shorts
      </p>
    </div>
  )
}
