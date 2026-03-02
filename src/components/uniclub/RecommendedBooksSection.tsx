'use client'

import { useRef, useCallback } from 'react'
import { ChevronRight, ChevronLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'
import BookCard from './BookCard'

interface Book {
  id: string
  title: string
  author: string | null
  image: string | null
  rating: number | null
  category: string | null
  season: string
  _count: { bookReports: number }
}

export default function RecommendedBooksSection({ books }: { books: Book[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' })
  }, [])

  if (books.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-[#faf8f5]">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 mb-4">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700 tracking-wide uppercase">Curated Selection</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-800 tracking-tight">
              이달의 추천 도서
            </h2>
            <p className="text-stone-500 mt-2 text-sm md:text-base">
              유니클럽 멤버들이 선정한 이달의 베스트 도서
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Arrow nav (desktop) */}
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-stone-200 text-stone-500 hover:border-teal-300 hover:text-teal-600 hover:shadow-lg hover:shadow-teal-100/50 transition-all duration-200"
              aria-label="이전"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-stone-200 text-stone-500 hover:border-teal-300 hover:text-teal-600 hover:shadow-lg hover:shadow-teal-100/50 transition-all duration-200"
              aria-label="다음"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <Link
              href="/club/bookclub/bookshelf"
              className="flex items-center gap-1 ml-3 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors duration-200"
            >
              전체보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll */}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        <div className="flex gap-6 px-4 lg:px-8 max-w-6xl mx-auto pb-6">
          {books.map((book, index) => (
            <div
              key={book.id}
              style={{
                scrollSnapAlign: 'start',
                animationDelay: `${index * 50}ms`,
              }}
            >
              <BookCard
                id={book.id}
                title={book.title}
                author={book.author}
                image={book.image}
                rating={book.rating}
                category={book.category}
                reportCount={book._count.bookReports}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
