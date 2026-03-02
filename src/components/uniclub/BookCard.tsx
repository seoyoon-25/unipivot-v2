'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, MessageSquare, ArrowRight, BookOpen } from 'lucide-react'

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
      className="group flex-shrink-0 w-[160px] md:w-[180px]"
    >
      {/* Book Cover with 3D Realistic Effect */}
      <div className="relative" style={{ perspective: '1000px' }}>
        <div
          className="relative w-[160px] md:w-[180px] h-[230px] md:h-[260px] rounded-lg overflow-hidden transition-all duration-500 group-hover:-translate-y-2"
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: '0 15px 35px -10px rgba(120, 113, 108, 0.3), 0 5px 15px -5px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Book spine effect - left side */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[6px] z-10"
            style={{
              background: 'linear-gradient(90deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 50%, rgba(255,255,255,0.1) 100%)',
            }}
          />

          {/* Book cover */}
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="180px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100 flex flex-col items-center justify-center p-4">
              <BookOpen className="w-10 h-10 text-amber-400/60 mb-3" />
              <span className="text-stone-600 text-sm text-center font-medium leading-snug line-clamp-3">
                {title}
              </span>
            </div>
          )}

          {/* Top page effect */}
          <div
            className="absolute top-0 left-[6px] right-0 h-[3px]"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(245,245,244,0.6) 100%)',
            }}
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

          {/* Hover content */}
          <div className="absolute inset-0 flex flex-col items-center justify-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <span className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-white text-teal-700 text-sm font-semibold shadow-lg hover:bg-amber-50 transition-colors">
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
        </div>

        {/* Book shadow underneath */}
        <div
          className="absolute -bottom-2 left-2 right-2 h-4 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Book Info */}
      <div className="mt-5 px-1">
        <h3 className="text-sm font-semibold text-stone-800 line-clamp-2 leading-snug group-hover:text-teal-700 transition-colors duration-200">
          {title}
        </h3>
        {author && (
          <p className="text-xs text-stone-500 mt-1.5 line-clamp-1">{author}</p>
        )}
        <div className="flex items-center gap-3 mt-2.5">
          {rating != null && (
            <span className="flex items-center gap-1 text-xs text-stone-600">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
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
