'use client'

import { useState } from 'react'
import CategoryFilter from './CategoryFilter'
import BookCard from './BookCard'

interface Book {
  id: string
  title: string
  author: string | null
  image: string | null
  rating: number | null
  category: string | null
  season: string | null
}

interface BooksSectionProps {
  books: Book[]
}

const CATEGORIES = ['전체', '소설', '인문', '과학', '자기계발', '에세이']

export default function BooksSection({ books }: BooksSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체')

  const filteredBooks =
    selectedCategory === '전체'
      ? books
      : books.filter((book) => book.category === selectedCategory)

  return (
    <section>
      <h2>이번 달 책</h2>

      {/* Category Filter */}
      <div className="mt-6">
        <CategoryFilter
          categories={CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              title={book.title}
              author={book.author || '작자 미상'}
              date={book.season || ''}
              coverImage={book.image || '/placeholder.jpg'}
              category={book.category || '기타'}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-neutral-500 py-12">
            해당 카테고리의 책이 없습니다.
          </p>
        )}
      </div>
    </section>
  )
}
