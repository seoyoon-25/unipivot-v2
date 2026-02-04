import Image from 'next/image'
import Link from 'next/link'
import { Star, MessageSquare } from 'lucide-react'

interface BookCardProps {
  id: string
  title: string
  author: string | null
  image: string | null
  rating: number | null
  category: string | null
  reportCount: number
}

export default function BookCard({
  id,
  title,
  author,
  image,
  rating,
  category,
  reportCount,
}: BookCardProps) {
  return (
    <Link
      href={`/club/bookclub/bookshelf/${id}`}
      className="group flex-shrink-0 w-[148px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-xl"
    >
      {/* Book Cover */}
      <div className="relative w-[148px] h-[210px] rounded-xl overflow-hidden shadow-sm group-hover:shadow-lg transition-all duration-200">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-200 group-hover:-translate-y-2"
            sizes="148px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
            <span className="text-zinc-400 text-xs text-center px-3 font-medium leading-snug">
              {title}
            </span>
          </div>
        )}

        {/* Gradient black overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-end pb-4 gap-2">
          <span className="px-4 py-1.5 rounded-md bg-white text-zinc-900 text-xs font-semibold hover:bg-zinc-100 transition-colors">
            상세보기
          </span>
          <span className="px-4 py-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
            북클럽 참가
          </span>
        </div>

        {/* Category Badge */}
        {category && (
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-zinc-700 text-[10px] px-2 py-0.5 rounded font-semibold shadow-sm">
            {category}
          </span>
        )}
      </div>

      {/* Book Info */}
      <div className="mt-3 px-0.5">
        <h3 className="text-sm font-semibold text-zinc-900 line-clamp-1 group-hover:text-blue-600 transition-colors duration-200">
          {title}
        </h3>
        {author && (
          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{author}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400">
          {rating != null && (
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              {rating}
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <MessageSquare className="w-3 h-3" />
            {reportCount}
          </span>
        </div>
      </div>
    </Link>
  )
}
