'use client'

import { Check, Loader2, CloudOff } from 'lucide-react'

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSavedAt?: string | null
}

export default function AutoSaveIndicator({ status, lastSavedAt }: AutoSaveIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {status === 'saving' && (
        <>
          <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
          <span className="text-blue-500">저장 중...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="w-3.5 h-3.5 text-green-500" />
          <span className="text-green-600">
            자동 저장됨
            {lastSavedAt && (
              <span className="text-gray-400 ml-1">
                {new Date(lastSavedAt).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </span>
        </>
      )}
      {status === 'error' && (
        <>
          <CloudOff className="w-3.5 h-3.5 text-red-500" />
          <span className="text-red-500">저장 실패</span>
        </>
      )}
    </div>
  )
}
