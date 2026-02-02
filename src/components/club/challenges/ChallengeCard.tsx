import Link from 'next/link'
import { Users, Calendar } from 'lucide-react'

interface ChallengeCardProps {
  challenge: {
    id: string
    title: string
    description: string | null
    type: string
    targetValue: number
    targetGenre: string | null
    startDate: Date
    endDate: Date
    isActive: boolean
    _count: { participants: number }
  }
}

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

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const now = new Date()
  const endDate = new Date(challenge.endDate)
  const startDate = new Date(challenge.startDate)
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isUpcoming = startDate > now
  const isEnded = endDate < now

  return (
    <Link
      href={`/club/challenges/${challenge.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 truncate">{challenge.title}</h3>
          {challenge.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{challenge.description}</p>
          )}
          <p className="text-sm text-blue-600 font-medium mb-3">
            {getTypeLabel(challenge.type, challenge.targetValue, challenge.targetGenre)}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {challenge._count.participants}명 참가
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {isEnded ? '종료' : isUpcoming ? '시작 예정' : `D-${daysLeft}`}
            </span>
          </div>
        </div>
        {!isEnded && !isUpcoming && (
          <span className="shrink-0 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
            진행 중
          </span>
        )}
        {isUpcoming && (
          <span className="shrink-0 px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full">
            예정
          </span>
        )}
        {isEnded && (
          <span className="shrink-0 px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
            종료
          </span>
        )}
      </div>
    </Link>
  )
}
