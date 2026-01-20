import Link from 'next/link'
import { Eye, Heart, MessageSquare, Calendar, User, Book, Star } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface Props {
  searchParams: { book?: string; page?: string }
}

export default async function PublicReportsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  const page = parseInt(searchParams.page || '1')
  const limit = 12

  const where: any = {
    visibility: 'PUBLIC',
    status: 'APPROVED'
  }

  if (searchParams.book) {
    where.bookId = searchParams.book
  }

  const [reports, total, books] = await Promise.all([
    prisma.bookReport.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true }
        },
        book: {
          select: { id: true, title: true, author: true, image: true }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.bookReport.count({ where }),
    prisma.readBook.findMany({
      where: {
        bookReports: {
          some: {
            visibility: 'PUBLIC',
            status: 'APPROVED'
          }
        }
      },
      select: { id: true, title: true, author: true },
      orderBy: { title: 'asc' }
    })
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">독후감 나눔</h1>
          <p className="text-lg text-white/80">
            유니피벗 회원들의 독서 기록을 함께 읽어보세요
          </p>
          {session?.user && (
            <Link
              href="/my/reports/new"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white text-primary font-medium rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Book className="w-5 h-5" />
              독후감 작성하기
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Filters */}
        {books.length > 0 && (
          <div className="bg-white rounded-2xl p-4 mb-8 shadow-sm">
            <p className="text-sm text-gray-500 mb-3">책으로 필터링</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/reports"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  !searchParams.book ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                전체
              </Link>
              {books.slice(0, 10).map((book) => (
                <Link
                  key={book.id}
                  href={`/reports?book=${book.id}`}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    searchParams.book === book.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {book.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reports Grid */}
        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
            <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">등록된 독후감이 없습니다</h3>
            <p className="text-gray-500 mb-6">첫 번째 독후감을 공유해보세요!</p>
            {session?.user && (
              <Link
                href="/my/reports/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors"
              >
                <Book className="w-5 h-5" />
                독후감 작성하기
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/reports/${report.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
                >
                  {/* Book Info Header */}
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                    {report.book?.image ? (
                      <img
                        src={report.book.image}
                        alt={report.book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary/20">
                          {(report.book?.title || report.bookTitle)[0]}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white text-sm">{report.book?.title || report.bookTitle}</p>
                      {(report.book?.author || report.bookAuthor) && (
                        <p className="text-white/70 text-xs">{report.book?.author || report.bookAuthor}</p>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {report.title}
                    </h3>

                    {/* Rating */}
                    {report.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < report.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {report.content.substring(0, 100)}...
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm text-gray-600">{report.author.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {report.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {report._count.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {report._count.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1
                  if (totalPages > 5 && page > 3) {
                    pageNum = page - 2 + i
                    if (pageNum > totalPages) pageNum = totalPages - 4 + i
                  }
                  return (
                    <Link
                      key={pageNum}
                      href={`/reports?${searchParams.book ? `book=${searchParams.book}&` : ''}page=${pageNum}`}
                      className={`px-4 py-2 rounded-lg ${
                        page === pageNum
                          ? 'bg-primary text-white'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
