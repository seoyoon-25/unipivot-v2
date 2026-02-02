import { Star } from 'lucide-react'

interface Props {
  avgRating: number | null
  ratingCount: number
  showCount?: boolean
}

export default function BookRatingDisplay({ avgRating, ratingCount, showCount = true }: Props) {
  if (!avgRating || ratingCount === 0) {
    return <span className="text-sm text-gray-400">평점 없음</span>
  }

  return (
    <div className="flex items-center gap-1">
      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      <span className="font-medium text-gray-900">{avgRating}</span>
      {showCount && (
        <span className="text-sm text-gray-500">({ratingCount}명)</span>
      )}
    </div>
  )
}
