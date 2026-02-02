'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteNotice } from '@/app/club/notices/admin/actions'

interface Props {
  noticeId: string
  className?: string
}

export default function NoticeDeleteButton({ noticeId, className }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteNotice(noticeId)
      if (result.error) {
        alert(result.error)
      } else {
        router.push('/club/notices/admin')
        router.refresh()
      }
      setShowConfirm(false)
    })
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600">삭제하시겠습니까?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? '삭제 중...' : '확인'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-3 py-1 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
        >
          취소
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className={className || 'p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100'}
      title="삭제"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
