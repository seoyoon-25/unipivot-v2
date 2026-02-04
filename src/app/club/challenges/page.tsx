import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getActiveChallenges } from '@/lib/club/challenge-queries'
import ChallengeCard from '@/components/club/challenges/ChallengeCard'

export const metadata = { title: '독서 챌린지 | 유니클럽' }

export default async function ChallengesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/api/auth/signin')

  const challenges = await getActiveChallenges()
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">독서 챌린지</h1>
          <p className="text-sm text-zinc-500 mt-1">함께 도전하고 성장해요</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/club/challenges/my"
            className="px-3 py-2 text-sm text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            내 챌린지
          </Link>
          {isAdmin && (
            <Link
              href="/club/challenges/create"
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              만들기
            </Link>
          )}
        </div>
      </div>

      {challenges.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🏃</div>
          <p className="text-zinc-500 mb-2">진행 중인 챌린지가 없습니다.</p>
          <p className="text-sm text-zinc-400">새로운 챌린지가 곧 시작됩니다!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  )
}
