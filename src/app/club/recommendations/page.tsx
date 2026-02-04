import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/check-role'
import {
  getRecentRecommendations,
  getSavedRecommendations,
} from '@/lib/club/recommendation-service'
import RecommendationCard from '@/components/club/recommendations/RecommendationCard'
import GenerateButton from '@/components/club/recommendations/GenerateButton'

export const metadata = { title: 'AI 책 추천 | 유니클럽' }

export default async function RecommendationsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/api/auth/signin')

  const [recent, saved] = await Promise.all([
    getRecentRecommendations(user.id),
    getSavedRecommendations(user.id),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">AI 책 추천</h1>
          <p className="text-sm text-zinc-500 mt-1">
            독서 취향을 분석해 맞춤 책을 추천해드려요
          </p>
        </div>
        <GenerateButton />
      </div>

      {/* 저장한 추천 */}
      {saved.length > 0 && (
        <section>
          <h2 className="font-semibold text-zinc-900 mb-4">
            저장한 추천 ({saved.length})
          </h2>
          <div className="space-y-3">
            {saved.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </section>
      )}

      {/* 최근 추천 */}
      {recent.length > 0 && (
        <section>
          <h2 className="font-semibold text-zinc-900 mb-4">최근 추천</h2>
          <div className="space-y-3">
            {recent.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </section>
      )}

      {/* 빈 상태 */}
      {recent.length === 0 && saved.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-zinc-500 mb-2">아직 추천이 없습니다.</p>
          <p className="text-sm text-zinc-400">
            &quot;추천 받기&quot; 버튼을 눌러 AI 맞춤 추천을 받아보세요!
          </p>
        </div>
      )}
    </div>
  )
}
