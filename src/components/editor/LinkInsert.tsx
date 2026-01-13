'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Link, ExternalLink } from 'lucide-react'

interface LinkInsertProps {
  initialUrl?: string
  onSubmit: (url: string) => void
  onClose: () => void
}

export function LinkInsert({ initialUrl = '', onSubmit, onClose }: LinkInsertProps) {
  const [url, setUrl] = useState(initialUrl)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(url)
  }

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-2 p-4 bg-white rounded-xl shadow-lg border border-gray-200 z-50 w-80"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">링크 삽입</span>
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
          placeholder="https://example.com"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
        />

        <div className="mt-3 flex gap-2">
          {initialUrl && (
            <button
              type="button"
              onClick={() => onSubmit('')}
              className="flex-1 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              링크 제거
            </button>
          )}
          <button
            type="submit"
            disabled={!url}
            className="flex-1 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {initialUrl ? '수정' : '삽입'}
          </button>
        </div>
      </form>
    </div>
  )
}
