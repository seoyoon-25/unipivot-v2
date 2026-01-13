import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Heart, ArrowLeft } from 'lucide-react'
import { getProgramStatus, getStatusBadgeClass, getFeeDisplay } from '@/lib/program/status-calculator'

export const metadata: Metadata = {
  title: '관심 프로그램 | 마이페이지',
}

export default async function MyLikesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login')
  }

  const likes = await prisma.programLike.findMany({
    where: { userId: session.user.id },
    include: {
      program: {
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          image: true,
          thumbnailSquare: true,
          feeType: true,
          feeAmount: true,
          fee: true,
          status: true,
          recruitStartDate: true,
          recruitEndDate: true,
          startDate: true,
          endDate: true,
          likeCount: true,
          applicationCount: true,
          capacity: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const typeLabels: Record<string, string> = {
    BOOKCLUB: '독서모임',
    SEMINAR: '세미나',
    WORKSHOP: '워크숍',
    KMOVE: 'K-Move',
    OTHER: '기타',
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/my"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">관심 프로그램</h1>
          <p className="text-gray-500">좋아요 표시한 프로그램 목록입니다</p>
        </div>
      </div>

      {likes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            관심 프로그램이 없습니다
          </h2>
          <p className="text-gray-500 mb-6">
            프로그램 목록에서 하트를 눌러 관심 표시해 보세요
          </p>
          <Link
            href="/programs"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
          >
            프로그램 둘러보기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {likes.map((like) => {
            const program = like.program
            const status = getProgramStatus({
              status: program.status,
              recruitStartDate: program.recruitStartDate,
              recruitEndDate: program.recruitEndDate,
              startDate: program.startDate,
              endDate: program.endDate,
            })
            const statusClass = getStatusBadgeClass(status)
            const feeDisplay = getFeeDisplay(program.feeType, program.feeAmount || program.fee)

            return (
              <Link
                key={like.id}
                href={`/programs/${program.slug}`}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative aspect-square">
                  <img
                    src={program.thumbnailSquare || program.image || '/images/placeholder-program.jpg'}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                    {status}
                  </span>
                  <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </div>
                </div>
                <div className="p-4">
                  <span className="text-xs text-primary font-medium">
                    {typeLabels[program.type] || program.type}
                  </span>
                  <h3 className="font-bold text-gray-900 mt-1 line-clamp-2">
                    {program.title}
                  </h3>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-gray-500">{feeDisplay}</span>
                    <span className="text-xs text-gray-400">
                      좋아요 {program.likeCount}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
