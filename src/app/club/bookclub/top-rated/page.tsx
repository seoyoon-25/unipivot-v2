import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/check-role'
import { getTopRatedBooks } from '@/lib/club/rating-queries'
import BookRatingDisplay from '@/components/club/rating/BookRatingDisplay'

export const metadata = { title: '평점 높은 책 | 유니클럽' }

export default async function TopRatedBooksPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/api/auth/signin')

  const books = await getTopRatedBooks(20)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">평점 높은 책</h1>

      {books.length === 0 ? (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">아직 평점 데이터가 충분하지 않습니다.</p>
          <p className="text-sm text-gray-400 mt-1">
            독후감 작성 시 별점을 남기면 이곳에 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {books.map((book, index) => (
            <div
              key={`${book.bookTitle}-${index}`}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
            >
              <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{book.bookTitle}</h3>
                {book.bookAuthor && (
                  <p className="text-sm text-gray-500 truncate">{book.bookAuthor}</p>
                )}
              </div>
              <div className="shrink-0">
                <BookRatingDisplay
                  avgRating={book.avgRating}
                  ratingCount={book.ratingCount}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
