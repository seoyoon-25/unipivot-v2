'use client'

import { Archive, ExternalLink } from 'lucide-react'

interface LegacyProgramContentProps {
  html: string
  title: string
  originalUrl?: string | null
  migratedAt?: Date | string | null
}

export function LegacyProgramContent({
  html,
  title,
  originalUrl,
  migratedAt
}: LegacyProgramContentProps) {
  return (
    <div className="legacy-program-wrapper">
      {/* 레거시 표시 배지 (관리자/사용자 모두 볼 수 있음) */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg inline-flex">
        <Archive className="w-4 h-4" />
        <span>아카이브 콘텐츠</span>
        {migratedAt && (
          <span className="text-gray-400 ml-2">
            (이전일: {new Date(migratedAt).toLocaleDateString('ko-KR')})
          </span>
        )}
      </div>

      {/* 원본 HTML 렌더링 */}
      <div
        className="legacy-content prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* 원본 링크 (있는 경우만) */}
      {originalUrl && (
        <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-400 flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          <span>원본:</span>
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600 transition-colors"
          >
            {originalUrl}
          </a>
        </div>
      )}
    </div>
  )
}
