'use client'

import { useState, useTransition } from 'react'
import { BookOpen, Target } from 'lucide-react'
import { setYearlyGoal, setMonthlyGoal } from '@/app/club/my/goals/actions'

interface Props {
  currentYearly: number | null
  currentMonthly: number | null
}

export default function GoalSettingForm({ currentYearly, currentMonthly }: Props) {
  const [yearly, setYearly] = useState(currentYearly ?? 12)
  const [monthly, setMonthly] = useState(currentMonthly ?? 2)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = () => {
    setMessage(null)
    startTransition(async () => {
      const yearlyResult = await setYearlyGoal(yearly)
      if (yearlyResult.error) {
        setMessage({ type: 'error', text: yearlyResult.error })
        return
      }

      const monthlyResult = await setMonthlyGoal(monthly)
      if (monthlyResult.error) {
        setMessage({ type: 'error', text: monthlyResult.error })
        return
      }

      setMessage({ type: 'success', text: '목표가 설정되었습니다.' })
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">연간 목표</h2>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          올해 읽을 책 권수를 설정하세요 (1-365권)
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={365}
            value={yearly}
            onChange={(e) => setYearly(Number(e.target.value))}
            className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-center text-lg font-medium focus:border-blue-300 focus:ring-1 focus:ring-blue-300"
          />
          <span className="text-gray-600">권</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-green-600" />
          <h2 className="font-semibold text-gray-900">월간 목표</h2>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          이번 달 읽을 책 권수를 설정하세요 (1-31권)
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={31}
            value={monthly}
            onChange={(e) => setMonthly(Number(e.target.value))}
            className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-center text-lg font-medium focus:border-blue-300 focus:ring-1 focus:ring-blue-300"
          />
          <span className="text-gray-600">권</span>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        {isPending ? '저장 중...' : '목표 저장'}
      </button>
    </div>
  )
}
