'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createChallenge } from '@/app/club/challenges/actions'

export default function ChallengeForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('BOOKS_COUNT')
  const [targetValue, setTargetValue] = useState(5)
  const [targetGenre, setTargetGenre] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    startTransition(async () => {
      const result = await createChallenge({
        title,
        description: description || undefined,
        type,
        targetValue,
        targetGenre: type === 'GENRE_SPECIFIC' ? targetGenre : undefined,
        startDate,
        endDate,
      })

      if (result.error) {
        setError(result.error)
      } else if (result.id) {
        router.push(`/club/challenges/${result.id}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          챌린지 제목
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 2월 독서 마라톤"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          설명 (선택)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="챌린지에 대한 설명을 입력하세요"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          챌린지 유형
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="BOOKS_COUNT">권수 챌린지</option>
          <option value="GENRE_SPECIFIC">장르별 챌린지</option>
        </select>
      </div>

      {type === 'GENRE_SPECIFIC' && (
        <div>
          <label htmlFor="targetGenre" className="block text-sm font-medium text-gray-700 mb-1">
            대상 장르
          </label>
          <input
            id="targetGenre"
            type="text"
            required
            value={targetGenre}
            onChange={(e) => setTargetGenre(e.target.value)}
            placeholder="예: 소설, 자기개발, 에세이"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      )}

      <div>
        <label htmlFor="targetValue" className="block text-sm font-medium text-gray-700 mb-1">
          목표 권수
        </label>
        <input
          id="targetValue"
          type="number"
          required
          min={1}
          max={100}
          value={targetValue}
          onChange={(e) => setTargetValue(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            시작일
          </label>
          <input
            id="startDate"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            종료일
          </label>
          <input
            id="endDate"
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? '생성 중...' : '챌린지 만들기'}
      </button>
    </form>
  )
}
