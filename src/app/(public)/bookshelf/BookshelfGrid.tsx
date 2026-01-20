'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Book, Star, Users, Calendar, FileText, X } from 'lucide-react'

interface ReadBook {
  id: string
  title: string
  author: string | null
  publisher: string | null
  pubYear: string | null
  image: string | null
  season: string
  sessionCount: number | null
  participants: number | null
  category: string | null
  rating: number | null
  status: string
}

interface Props {
  books: ReadBook[]
}

export default function BookshelfGrid({ books }: Props) {
  const [selectedBook, setSelectedBook] = useState<ReadBook | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {books.map((book) => (
          <div
            key={book.id}
            onClick={() => setSelectedBook(book)}
            className="group cursor-pointer"
          >
            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-gray-100 shadow-md group-hover:shadow-xl transition-all relative">
              {book.image ? (
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 p-3">
                  <Book className="w-8 h-8 text-primary/40 mb-2" />
                  <p className="text-xs text-center text-gray-600 font-medium line-clamp-3">
                    {book.title}
                  </p>
                </div>
              )}

              {/* Season Badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full">
                {book.season}
              </div>

              {/* Rating Badge */}
              {book.rating && (
                <div className="absolute top-2 right-2 flex items-center gap-0.5 px-2 py-0.5 bg-yellow-400/90 text-yellow-900 text-xs rounded-full font-medium">
                  <Star className="w-3 h-3 fill-current" />
                  {book.rating}
                </div>
              )}
            </div>

            <div className="mt-2 px-1">
              <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                {book.author || '작자 미상'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Book Detail Modal */}
      {selectedBook && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBook(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start gap-6">
                {/* Book Cover */}
                <div className="w-32 h-48 flex-shrink-0">
                  {selectedBook.image ? (
                    <img
                      src={selectedBook.image}
                      alt={selectedBook.title}
                      className="w-full h-full object-cover rounded-xl shadow-lg"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Book className="w-12 h-12 text-primary/40" />
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-2">
                        {selectedBook.season}
                      </span>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {selectedBook.title}
                      </h2>
                      <p className="text-gray-600">{selectedBook.author || '작자 미상'}</p>
                    </div>
                    <button
                      onClick={() => setSelectedBook(null)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Rating */}
                  {selectedBook.rating && (
                    <div className="flex items-center gap-1 mt-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < selectedBook.rating!
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {selectedBook.publisher && (
                      <span className="text-sm text-gray-500">
                        {selectedBook.publisher}
                      </span>
                    )}
                    {selectedBook.pubYear && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {selectedBook.pubYear}
                      </span>
                    )}
                    {selectedBook.participants && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {selectedBook.participants}명 참여
                      </span>
                    )}
                    {selectedBook.sessionCount && (
                      <span className="text-sm text-gray-500">
                        {selectedBook.sessionCount}회차 진행
                      </span>
                    )}
                    {selectedBook.category && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-sm rounded">
                        {selectedBook.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-6 border-t flex gap-3">
                <Link
                  href={`/reports?book=${selectedBook.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
                  onClick={() => setSelectedBook(null)}
                >
                  <FileText className="w-5 h-5" />
                  이 책의 독후감 보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
