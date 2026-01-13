'use client'

import { RotateCcw } from 'lucide-react'

interface DraftRestoreAlertProps {
  onRestore: () => void
  onDiscard: () => void
}

export function DraftRestoreAlert({ onRestore, onDiscard }: DraftRestoreAlertProps) {
  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <RotateCcw className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <span className="text-blue-800 text-sm sm:text-base">
          이전에 작성 중이던 내용이 있습니다. 복원하시겠습니까?
        </span>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <button
          type="button"
          onClick={onRestore}
          className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          복원하기
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="flex-1 sm:flex-none px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          삭제하기
        </button>
      </div>
    </div>
  )
}

interface AutoSaveIndicatorProps {
  lastSaved: Date | null
}

export function AutoSaveIndicator({ lastSaved }: AutoSaveIndicatorProps) {
  if (!lastSaved) return null

  return (
    <span className="text-sm text-gray-500">
      자동 저장됨: {lastSaved.toLocaleTimeString('ko-KR')}
    </span>
  )
}
