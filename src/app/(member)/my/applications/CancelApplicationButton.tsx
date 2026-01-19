'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cancelApplication } from '@/lib/actions/applications'

interface CancelApplicationButtonProps {
  applicationId: string
}

export function CancelApplicationButton({ applicationId }: CancelApplicationButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelApplication(applicationId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || '취소 처리 중 오류가 발생했습니다.')
      }
      setShowConfirm(false)
    })
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
        >
          {isPending ? '취소 중...' : '확인'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="text-xs text-gray-500 hover:text-gray-600"
        >
          아니오
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-xs text-gray-500 hover:text-red-600 transition-colors"
    >
      신청 취소
    </button>
  )
}
