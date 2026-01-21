'use client'

interface TopSpeaker {
  userId: string
  duration: number
  percentage: number
}

interface Participant {
  userId: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface Props {
  stats: {
    totalSpeakingTime: number
    averageSpeakingTime: number
    participantCount: number
    balanceScore: number
    topSpeakers: string | null
    silentParticipants: string | null
  }
  participants: Participant[]
}

export default function SpeakingStatsReport({ stats, participants }: Props) {
  const topSpeakers: TopSpeaker[] = stats.topSpeakers
    ? JSON.parse(stats.topSpeakers)
    : []
  const silentParticipants: string[] = stats.silentParticipants
    ? JSON.parse(stats.silentParticipants)
    : []

  const getBalanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${mins}분 ${secs}초`
    }
    return `${secs}초`
  }

  const getUserName = (userId: string) => {
    const participant = participants.find(p => p.userId === userId)
    return participant?.user.name || '알 수 없음'
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <span>&#128202;</span> 토론 통계
      </h3>

      {/* 종합 점수 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">총 발언 시간</p>
          <p className="text-2xl font-bold">
            {Math.floor(stats.totalSpeakingTime / 60)}분
          </p>
        </div>

        <div className="border rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">평균 발언 시간</p>
          <p className="text-2xl font-bold">
            {Math.floor(stats.averageSpeakingTime / 60)}분
          </p>
        </div>

        <div className="border rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">발언한 참가자</p>
          <p className="text-2xl font-bold">{stats.participantCount}명</p>
        </div>

        <div className="border rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">발언 균형도</p>
          <p className={`text-2xl font-bold ${getBalanceColor(stats.balanceScore)}`}>
            {stats.balanceScore}점
          </p>
        </div>
      </div>

      {/* 상위 발언자 */}
      {topSpeakers.length > 0 && (
        <div className="border rounded-lg p-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <span>&#127942;</span> 발언 순위
          </h4>
          <div className="space-y-3">
            {topSpeakers.map((speaker, idx) => (
              <div key={speaker.userId} className="flex items-center gap-3">
                <span className="text-2xl">
                  {idx === 0 ? '&#129351;' : idx === 1 ? '&#129352;' : idx === 2 ? '&#129353;' : `${idx + 1}위`}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{getUserName(speaker.userId)}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${speaker.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatTime(speaker.duration)} ({speaker.percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 미발언자 */}
      {silentParticipants.length > 0 && (
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-6">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <span>&#9888;&#65039;</span> 발언하지 않은 참가자
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            다음 모임에서는 이분들의 의견도 들어보면 좋겠어요!
          </p>
          <div className="flex gap-2 flex-wrap">
            {silentParticipants.map(userId => (
              <span
                key={userId}
                className="px-3 py-1 bg-white border rounded-full text-sm"
              >
                {getUserName(userId)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 발언 균형도 해석 */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <span>&#128161;</span> 발언 균형도 해석
        </h4>
        <p className="text-sm text-gray-700">
          {stats.balanceScore >= 80 && (
            <>&#9989; 훌륭해요! 모든 참가자가 고르게 발언했습니다.</>
          )}
          {stats.balanceScore >= 60 && stats.balanceScore < 80 && (
            <>&#9888;&#65039; 괜찮아요. 일부 참가자의 발언이 좀 더 필요합니다.</>
          )}
          {stats.balanceScore < 60 && (
            <>&#128308; 개선이 필요해요. 발언 기회가 편중되어 있습니다. 다음 모임에서는 진행자가 미발언자에게 의견을 물어보면 좋겠습니다.</>
          )}
        </p>
      </div>
    </div>
  )
}
