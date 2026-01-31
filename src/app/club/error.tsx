'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function ClubError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Club error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-orange-50 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">
          페이지를 불러올 수 없습니다
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          유니클럽 페이지에서 오류가 발생했습니다.
          <br />
          다시 시도하거나 클럽 메인으로 돌아가 주세요.
        </p>

        {error.digest && (
          <p className="text-xs text-gray-400 mb-5">
            오류 코드: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-[#FF6B35] text-white rounded-xl text-sm font-semibold hover:bg-[#E55A2B] transition-colors"
          >
            다시 시도
          </button>
          <Link
            href="/club"
            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            클럽 메인으로 이동
          </Link>
        </div>
      </div>
    </div>
  )
}
