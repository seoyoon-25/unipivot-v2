'use client'

import { useTransition, useState } from 'react'
import { deleteAccount } from '@/app/club/settings/actions'

export default function DeleteAccountForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [step, setStep] = useState(1)

  const isConfirmationValid = confirmation === '계정 삭제'

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await deleteAccount(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  if (step === 1) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">정말 탈퇴하시겠습니까?</h2>
        <p className="text-sm text-gray-500 mb-6">
          계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setStep(2)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            계속 진행
          </button>
          <a
            href="/club/settings"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
          >
            취소
          </a>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">최종 확인</h2>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg mb-4">{error}</div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호 확인
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="소셜 로그인 계정은 비워두세요"
          />
        </div>

        <div>
          <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-1">
            아래에 <span className="font-bold text-red-600">계정 삭제</span>를 입력하세요
          </label>
          <input
            id="confirmation"
            name="confirmation"
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="계정 삭제"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={isPending || !isConfirmationValid}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
        >
          {isPending ? '처리 중...' : '계정 삭제'}
        </button>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
        >
          뒤로
        </button>
      </div>
    </form>
  )
}
