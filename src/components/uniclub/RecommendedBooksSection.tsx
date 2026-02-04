'use client'

import { useRef, useCallback } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
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
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-2">
              Recommended
            </p>
            <h2 className="text-2xl md:text-[26px] font-bold text-zinc-900 tracking-tight">
              이달의 추천 도서
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Arrow nav (desktop) */}
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="이전"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full border border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="다음"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <Link
              href="/club/bookclub/bookshelf"
              className="flex items-center gap-0.5 text-sm font-medium text-zinc-500 hover:text-blue-600 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded ml-2"
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
          {books.map((book) => (
            <div key={book.id} style={{ scrollSnapAlign: 'start' }}>
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
