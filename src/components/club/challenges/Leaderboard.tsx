interface Participant {
  id: string
  progress: number
  isCompleted: boolean
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface LeaderboardProps {
  participants: Participant[]
  targetValue: number
  currentUserId?: string
}

function getMedalIcon(rank: number) {
  switch (rank) {
    case 1:
      return '\uD83E\uDD47'
    case 2:
      return '\uD83E\uDD48'
    case 3:
      return '\uD83E\uDD49'
    default:
      return `${rank}`
  }
}

export default function Leaderboard({
  participants,
  targetValue,
  currentUserId,
}: LeaderboardProps) {
  if (participants.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">아직 참가자가 없습니다.</div>
    )
  }

  return (
    <div className="space-y-2">
      {participants.map((p, idx) => {
        const percentage = Math.min(Math.round((p.progress / targetValue) * 100), 100)
        const isMe = currentUserId === p.user.id

        return (
          <div
            key={p.id}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              isMe ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'
            }`}
          >
            <span className="w-8 text-center text-lg shrink-0">{getMedalIcon(idx + 1)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium truncate ${isMe ? 'text-blue-700' : 'text-gray-900'}`}>
                  {p.user.name || '익명'}
                  {isMe && <span className="text-xs text-blue-500 ml-1">(나)</span>}
                </span>
                <span className="text-xs text-gray-500 shrink-0 ml-2">
                  {p.progress}/{targetValue}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    p.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-gray-500 shrink-0 w-10 text-right">
              {percentage}%
            </span>
          </div>
        )
      })}
    </div>
  )
}
