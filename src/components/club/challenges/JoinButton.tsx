'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { joinChallenge, leaveChallenge } from '@/app/club/challenges/actions'

interface JoinButtonProps {
  challengeId: string
  isParticipant: boolean
  isCompleted: boolean
  isEnded: boolean
}

export default function JoinButton({
  challengeId,
  isParticipant,
  isCompleted,
  isEnded,
}: JoinButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  if (isEnded) {
    return (
      <button
        disabled
        className="w-full py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
      >
        종료된 챌린지
      </button>
    )
  }

  if (isCompleted) {
    return (
      <button
        disabled
        className="w-full py-2.5 rounded-lg text-sm font-medium bg-green-100 text-green-700 cursor-not-allowed"
      >
        달성 완료
      </button>
    )
  }

  const handleClick = () => {
    setError('')
    startTransition(async () => {
      const result = isParticipant
        ? await leaveChallenge(challengeId)
        : await joinChallenge(challengeId)

      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
          isParticipant
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isPending
          ? '처리 중...'
          : isParticipant
            ? '참가 취소'
            : '참가하기'}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
