import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Target, Trophy, Calendar } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getUserChallenges } from '@/lib/club/challenge-queries'

export const metadata = { title: '내 챌린지 | 유니클럽' }

function formatDate(date: Date) {
  const d = new Date(date)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default async function MyChallengesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/api/auth/signin')

  const participations = await getUserChallenges(user.id)

  const active = participations.filter(
    (p) => !p.isCompleted && new Date(p.challenge.endDate) >= new Date()
  )
  const completed = participations.filter((p) => p.isCompleted)
  const expired = participations.filter(
    (p) => !p.isCompleted && new Date(p.challenge.endDate) < new Date()
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Link
          href="/club/challenges"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          챌린지 목록
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">내 챌린지</h1>
        <p className="text-sm text-zinc-500 mt-1">참가 중인 챌린지 현황</p>
      </div>

      {participations.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🏃</div>
          <p className="text-zinc-500 mb-2">참가 중인 챌린지가 없습니다.</p>
          <Link
            href="/club/challenges"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            챌린지 둘러보기
          </Link>
        </div>
      ) : (
        <>
          {/* 진행 중 */}
          {active.length > 0 && (
            <section>
              <h2 className="font-semibold text-zinc-900 mb-3">
                진행 중 ({active.length})
              </h2>
              <div className="space-y-3">
                {active.map((p) => {
                  const percentage = Math.min(
                    Math.round((p.progress / p.challenge.targetValue) * 100),
                    100
                  )
                  return (
                    <Link
                      key={p.id}
                      href={`/club/challenges/${p.challengeId}`}
                      className="block bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-zinc-900">{p.challenge.title}</h3>
                        <span className="flex items-center gap-1 text-xs text-blue-600">
                          <Target className="w-3.5 h-3.5" />
                          {p.progress}/{p.challenge.targetValue}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-200 rounded-full h-2 mb-2">
                        <div
                          className="h-2 rounded-full bg-blue-500 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>{percentage}% 달성</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          ~{formatDate(p.challenge.endDate)}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* 완료 */}
          {completed.length > 0 && (
            <section>
              <h2 className="font-semibold text-zinc-900 mb-3">
                달성 완료 ({completed.length})
              </h2>
              <div className="space-y-3">
                {completed.map((p) => (
                  <Link
                    key={p.id}
                    href={`/club/challenges/${p.challengeId}`}
                    className="block bg-green-50 rounded-xl border border-green-100 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-green-600" />
                        <h3 className="font-medium text-zinc-900">{p.challenge.title}</h3>
                      </div>
                      <span className="text-xs text-green-600 font-medium">
                        {p.challenge.targetValue}권 달성
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 미달성 종료 */}
          {expired.length > 0 && (
            <section>
              <h2 className="font-semibold text-zinc-900 mb-3">
                종료 ({expired.length})
              </h2>
              <div className="space-y-3">
                {expired.map((p) => (
                  <Link
                    key={p.id}
                    href={`/club/challenges/${p.challengeId}`}
                    className="block bg-zinc-50 rounded-2xl border border-zinc-100 shadow-sm p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-zinc-500">{p.challenge.title}</h3>
                      <span className="text-xs text-zinc-400">
                        {p.progress}/{p.challenge.targetValue}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
