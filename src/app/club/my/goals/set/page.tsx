import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getCurrentGoals } from '@/lib/club/goal-queries'
import GoalSettingForm from '@/components/club/goals/GoalSettingForm'

export const metadata = { title: '독서 목표 설정 | 유니클럽' }

export default async function GoalSetPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/api/auth/signin')

  const { yearlyGoal, monthlyGoal } = await getCurrentGoals(user.id)

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link
        href="/club/my/goals"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        목표 현황으로
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">독서 목표 설정</h1>

      <GoalSettingForm
        currentYearly={yearlyGoal?.targetBooks ?? null}
        currentMonthly={monthlyGoal?.targetBooks ?? null}
      />
    </div>
  )
}
