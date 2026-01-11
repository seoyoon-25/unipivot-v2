'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerForProgram } from '@/lib/actions/public'

interface Props {
  programId: string
  programStatus: string
  isFull: boolean
  isLoggedIn: boolean
}

export default function RegisterButton({ programId, programStatus, isFull, isLoggedIn }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async () => {
    setLoading(true)
    setError('')

    try {
      await registerForProgram(programId)
      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '신청 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-700 font-medium text-center">신청이 완료되었습니다!</p>
        </div>
        <Link
          href="/my/programs"
          className="block w-full py-3 text-center text-primary font-medium hover:bg-primary-light rounded-xl transition-colors"
        >
          신청 내역 확인하기
        </Link>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="space-y-3">
        <Link
          href="/login"
          className="block w-full py-3 bg-primary text-white text-center font-semibold rounded-xl hover:bg-primary-dark transition-colors"
        >
          로그인하고 신청하기
        </Link>
        <p className="text-gray-500 text-sm text-center">
          아직 회원이 아니신가요?{' '}
          <Link href="/register" className="text-primary hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    )
  }

  if (programStatus !== 'OPEN') {
    return (
      <button
        disabled
        className="w-full py-3 bg-gray-200 text-gray-500 font-semibold rounded-xl cursor-not-allowed"
      >
        {programStatus === 'CLOSED' ? '모집 마감' :
         programStatus === 'COMPLETED' ? '종료된 프로그램' : '신청 불가'}
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleRegister}
        disabled={loading || isFull}
        className={`w-full py-3 font-semibold rounded-xl transition-colors ${
          isFull
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : loading
            ? 'bg-primary/70 text-white cursor-wait'
            : 'bg-primary text-white hover:bg-primary-dark'
        }`}
      >
        {loading ? '신청 중...' : isFull ? '정원 마감' : '참가 신청하기'}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm text-center">{error}</p>
        </div>
      )}

      {isFull && (
        <p className="text-gray-500 text-sm text-center">
          대기 신청을 원하시면 문의해주세요
        </p>
      )}
    </div>
  )
}
