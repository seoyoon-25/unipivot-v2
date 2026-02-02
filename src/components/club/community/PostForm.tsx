'use client'

import { useTransition, useState } from 'react'
import dynamic from 'next/dynamic'
import { createPost, updatePost } from '@/app/club/community/actions'

const RichTextEditor = dynamic(
  () => import('@/components/editor/RichTextEditor').then((mod) => mod.RichTextEditor),
  { ssr: false, loading: () => <div className="h-64 bg-gray-50 rounded-lg animate-pulse" /> }
)

const categories = [
  { value: 'FREE', label: '자유' },
  { value: 'BOOK_REVIEW', label: '독후감' },
  { value: 'QUESTION', label: '질문' },
  { value: 'MEETUP', label: '모임' },
]

interface Props {
  postId?: string
  initialData?: {
    category: string
    title: string
    content: string
  }
}

export default function PostForm({ postId, initialData }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [content, setContent] = useState(initialData?.content || '')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    formData.set('content', content)

    startTransition(async () => {
      const result = postId
        ? await updatePost(postId, formData)
        : await createPost(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
      )}

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          카테고리
        </label>
        <select
          id="category"
          name="category"
          defaultValue={initialData?.category || 'FREE'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          제목
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={initialData?.title || ''}
          placeholder="제목을 입력하세요"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {isPending ? '저장 중...' : postId ? '수정' : '등록'}
        </button>
      </div>
    </form>
  )
}
