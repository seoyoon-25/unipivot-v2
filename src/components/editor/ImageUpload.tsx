'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Image, Upload, Link, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  onSubmit: (url: string) => void
  onClose: () => void
}

export function ImageUpload({ onSubmit, onClose }: ImageUploadProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload')
  const [url, setUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('업로드 실패')
      }

      const data = await res.json()
      setPreview(data.url)
      onSubmit(data.url)
    } catch (error) {
      console.error('Upload error:', error)
      alert('이미지 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
    }
  }, [onSubmit])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFileUpload(file)
      }
    },
    [handleFileUpload]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url) {
      onSubmit(url)
    }
  }

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-2 p-4 bg-white rounded-xl shadow-lg border border-gray-200 z-50 w-96"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">이미지 삽입</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 탭 */}
      <div className="flex mb-4 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`flex-1 pb-2 text-sm font-medium transition-colors ${
            tab === 'upload'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload className="w-4 h-4 inline-block mr-1" />
          파일 업로드
        </button>
        <button
          type="button"
          onClick={() => setTab('url')}
          className={`flex-1 pb-2 text-sm font-medium transition-colors ${
            tab === 'url'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Link className="w-4 h-4 inline-block mr-1" />
          URL 입력
        </button>
      </div>

      {/* 업로드 탭 */}
      {tab === 'upload' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
              <p className="text-sm text-gray-500">업로드 중...</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                클릭하거나 이미지를 드래그하세요
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, GIF, WebP (최대 10MB)
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
            className="hidden"
          />
        </div>
      )}

      {/* URL 탭 */}
      {tab === 'url' && (
        <form onSubmit={handleUrlSubmit}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          />

          {url && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">미리보기</p>
              <img
                src={url}
                alt="Preview"
                className="max-h-40 rounded-lg mx-auto"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={!url}
            className="mt-3 w-full px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            삽입
          </button>
        </form>
      )}

      {/* 미리보기 */}
      {preview && tab === 'upload' && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">업로드 완료</p>
          <img src={preview} alt="Uploaded" className="max-h-40 rounded-lg mx-auto" />
        </div>
      )}
    </div>
  )
}
