'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, MessageSquare, ArrowRight } from 'lucide-react'

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
      className="group flex-shrink-0 w-[160px] md:w-[180px] rounded-2xl"
    >
      {/* Book Cover with 3D effect */}
      <div className="relative perspective-1000">
        <div
          className="relative w-[160px] md:w-[180px] h-[230px] md:h-[260px] rounded-2xl overflow-hidden transition-all duration-500 group-hover:shadow-2xl"
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: '0 10px 30px -8px rgba(0, 0, 0, 0.15), 0 4px 10px -4px rgba(0, 0, 0, 0.1)',
          }}
        >
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="180px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
              <span className="text-stone-500 text-sm text-center font-medium leading-snug line-clamp-3">
                {title}
              </span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

          {/* Hover content */}
          <div className="absolute inset-0 flex flex-col items-center justify-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <span className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-white text-indigo-700 text-sm font-semibold shadow-lg hover:bg-indigo-50 transition-colors">
              자세히 보기
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>

          {/* Category Badge */}
          {category && (
            <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-stone-700 text-[10px] px-2.5 py-1 rounded-lg font-semibold shadow-sm">
              {category}
            </span>
          )}

          {/* Book spine effect */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-black/5 via-black/10 to-black/5" />
        </div>
      </div>

      {/* Book Info */}
      <div className="mt-4 px-1">
        <h3 className="text-sm font-semibold text-stone-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors duration-200">
          {title}
        </h3>
        {author && (
          <p className="text-xs text-stone-500 mt-1 line-clamp-1">{author}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          {rating != null && (
            <span className="flex items-center gap-1 text-xs text-stone-500">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-medium">{rating.toFixed(1)}</span>
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-stone-400">
            <MessageSquare className="w-3.5 h-3.5" />
            {reportCount}
          </span>
        </div>
      </div>
    </Link>
  )
}
