import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Users, Target } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getChallengeWithLeaderboard } from '@/lib/club/challenge-queries'
import Leaderboard from '@/components/club/challenges/Leaderboard'
import JoinButton from '@/components/club/challenges/JoinButton'

export const metadata = { title: '챌린지 상세 | 유니클럽' }

function getTypeLabel(type: string, targetValue: number, targetGenre: string | null) {
  switch (type) {
    case 'BOOKS_COUNT':
      return `${targetValue}권 읽기`
    case 'PAGES_COUNT':
      return `${targetValue}페이지 읽기`
    case 'GENRE_SPECIFIC':
      return `${targetGenre || '장르'} ${targetValue}권 읽기`
    default:
      return `${targetValue}권`
  }
}

function formatDate(date: Date) {
  const d = new Date(date)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/api/auth/signin')

  const challenge = await getChallengeWithLeaderboard(id)
  if (!challenge) notFound()

  const now = new Date()
  const isEnded = new Date(challenge.endDate) < now
  const daysLeft = Math.ceil(
    (new Date(challenge.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  const myParticipation = challenge.participants.find((p) => p.user.id === user.id)
  const isParticipant = !!myParticipation
  const isCompleted = myParticipation?.isCompleted ?? false

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/club/challenges"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        챌린지 목록
      </Link>

      {/* 챌린지 정보 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">{challenge.title}</h1>
        {challenge.description && (
          <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>
        )}

        <div className="flex flex-wrap gap-3 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            <Target className="w-3.5 h-3.5" />
            {getTypeLabel(challenge.type, challenge.targetValue, challenge.targetGenre)}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(challenge.startDate)} ~ {formatDate(challenge.endDate)}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
            <Users className="w-3.5 h-3.5" />
            {challenge.participants.length}명 참가
          </span>
          {!isEnded && (
            <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              D-{daysLeft}
            </span>
          )}
        </div>

        {/* 내 진행 현황 */}
        {myParticipation && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">내 진행 현황</span>
              <span className="text-sm text-blue-700">
                {myParticipation.progress}/{challenge.targetValue}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  isCompleted ? 'bg-green-500' : 'bg-blue-600'
                }`}
                style={{
                  width: `${Math.min(
                    Math.round((myParticipation.progress / challenge.targetValue) * 100),
                    100
                  )}%`,
                }}
              />
            </div>
            {isCompleted && (
              <p className="text-xs text-green-700 mt-2 font-medium">
                챌린지를 달성했습니다!
              </p>
            )}
          </div>
        )}

        <JoinButton
          challengeId={challenge.id}
          isParticipant={isParticipant}
          isCompleted={isCompleted}
          isEnded={isEnded}
        />
      </div>

      {/* 리더보드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          리더보드 ({challenge.participants.length}명)
        </h2>
        <Leaderboard
          participants={challenge.participants}
          targetValue={challenge.targetValue}
          currentUserId={user.id}
        />
      </div>

      <p className="text-xs text-gray-400 text-center">
        만든 사람: {challenge.creator.name || '관리자'}
      </p>
    </div>
  )
}
