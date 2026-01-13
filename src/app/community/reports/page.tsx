import Link from 'next/link'
import { Eye, Heart, MessageSquare, Calendar, User } from 'lucide-react'
import prisma from '@/lib/db'

interface Props {
  searchParams: { program?: string; page?: string }
}

export default async function CommunityReportsPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || '1')
  const limit = 12

  const where: any = {
    status: 'SUBMITTED',
    visibility: 'PUBLIC'
  }

  if (searchParams.program) {
    where.programId = searchParams.program
  }

  const [reports, total, programs] = await Promise.all([
    prisma.programReport.findMany({
      where,
      include: {
        user: {
          select: { name: true, image: true }
        },
        program: {
          select: { id: true, title: true }
        },
        session: {
          select: { sessionNo: true, bookTitle: true }
        }
      },
      orderBy: { submittedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.programReport.count({ where }),
    prisma.program.findMany({
      where: {
        programReports: {
          some: {
            status: 'SUBMITTED',
            visibility: 'PUBLIC'
          }
        }
      },
      select: { id: true, title: true }
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
            유니피봇 참가자들의 독후감을 함께 읽어보세요
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 mb-8 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/community/reports"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                !searchParams.program ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </Link>
            {programs.map((program) => (
              <Link
                key={program.id}
                href={`/community/reports?program=${program.id}`}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  searchParams.program === program.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {program.title}
              </Link>
            ))}
          </div>
        </div>

        {/* Reports Grid */}
        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
            <p className="text-gray-500">등록된 독후감이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/community/reports/${report.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
                >
                  {/* Photo */}
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                    {report.photoUrl ? (
                      <img
                        src={report.photoUrl}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary/20">
                          {report.title[0]}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white text-sm">{report.program.title}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {report.content.substring(0, 100)}...
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {report.user.image ? (
                            <img src={report.user.image} alt="" className="w-full h-full rounded-full" />
                          ) : (
                            <User className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{report.user.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {report.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {report.likeCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {report.commentCount}
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
                {Array.from({ length: totalPages }, (_, i) => (
                  <Link
                    key={i + 1}
                    href={`/community/reports?${searchParams.program ? `program=${searchParams.program}&` : ''}page=${i + 1}`}
                    className={`px-4 py-2 rounded-lg ${
                      page === i + 1
                        ? 'bg-primary text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
