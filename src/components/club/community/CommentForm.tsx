'use client'

import { useRef, useTransition, useState } from 'react'
import { createComment } from '@/app/club/community/actions'

interface Props {
  postId: string
  parentId?: string
  onCancel?: () => void
  placeholder?: string
}

export default function CommentForm({ postId, parentId, onCancel, placeholder }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    if (parentId) formData.set('parentId', parentId)

    startTransition(async () => {
      const result = await createComment(postId, formData)
      if (result?.error) {
        setError(result.error)
      } else {
        formRef.current?.reset()
        onCancel?.()
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <p className="text-red-600 text-xs">{error}</p>
      )}
      <div className="flex gap-2">
        <textarea
          name="content"
          placeholder={placeholder || '댓글을 입력하세요...'}
          rows={2}
          required
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="flex flex-col gap-1">
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {isPending ? '...' : '등록'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              취소
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
