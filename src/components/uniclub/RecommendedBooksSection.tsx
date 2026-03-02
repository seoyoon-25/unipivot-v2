'use client'

import { useRef, useCallback } from 'react'
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'
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
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-600 tracking-wide">RECOMMENDED</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
              이달의 추천 도서
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Arrow nav (desktop) */}
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-stone-200 text-stone-500 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all duration-200"
              aria-label="이전"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-stone-200 text-stone-500 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all duration-200"
              aria-label="다음"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <Link
              href="/club/bookclub/bookshelf"
              className="flex items-center gap-1 ml-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
            >
              더보기
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
        <div className="flex gap-5 px-4 lg:px-8 max-w-6xl mx-auto pb-4">
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
