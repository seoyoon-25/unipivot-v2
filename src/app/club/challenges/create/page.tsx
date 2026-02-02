import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import ChallengeForm from '@/components/club/challenges/ChallengeForm'

export const metadata = { title: '챌린지 만들기 | 유니클럽' }

export default async function CreateChallengePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/api/auth/signin')

  if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    redirect('/club/challenges')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <Link
        href="/club/challenges"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        챌린지 목록
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">챌린지 만들기</h1>
        <p className="text-sm text-gray-500 mt-1">
          새로운 독서 챌린지를 만들어 회원들과 함께 도전해보세요
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ChallengeForm />
      </div>
    </div>
  )
}
