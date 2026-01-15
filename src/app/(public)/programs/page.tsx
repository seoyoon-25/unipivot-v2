export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ProgramCard } from '@/components/public/ProgramCard'
import { ProgramFilters } from './ProgramFilters'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: '프로그램 | 유니피벗',
  description: '유니피벗에서 진행하는 다양한 프로그램을 만나보세요.',
}

interface PageProps {
  searchParams: Promise<{
    status?: string
    type?: string
    mode?: string
  }>
}

export default async function ProgramsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  const params = await searchParams

  const statusFilter = params.status || 'all'
  const typeFilter = params.type || 'all'
  const modeFilter = params.mode || 'all'

  // Build where clause
  const where: any = {
    status: { not: 'DRAFT' },
  }

  if (statusFilter !== 'all') {
    where.status = statusFilter
  }

  if (typeFilter !== 'all') {
    where.type = typeFilter
  }

  if (modeFilter === 'online') {
    where.isOnline = true
  } else if (modeFilter === 'offline') {
    where.isOnline = false
  }

  // Get programs
  const programs = await prisma.program.findMany({
    where,
    orderBy: [
      { status: 'asc' },
      { createdAt: 'desc' },
    ],
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      description: true,
      image: true,
      thumbnailSquare: true,
      isOnline: true,
      feeType: true,
      feeAmount: true,
      status: true,
      recruitStartDate: true,
      recruitEndDate: true,
      startDate: true,
      endDate: true,
      likeCount: true,
      applicationCount: true,
    },
  })

  // Get user's likes and applications if logged in
  let userLikes: Set<string> = new Set()
  let userApplications: Set<string> = new Set()

  if (session?.user?.id) {
    const [likes, applications] = await Promise.all([
      prisma.programLike.findMany({
        where: { userId: session.user.id },
        select: { programId: true },
      }),
      prisma.programApplication.findMany({
        where: { userId: session.user.id },
        select: { programId: true },
      }),
    ])

    userLikes = new Set(likes.map((l) => l.programId))
    userApplications = new Set(applications.map((a) => a.programId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">프로그램</h1>
            <p className="text-gray-600">
              유니피벗에서 진행하는 다양한 프로그램을 만나보세요.
            </p>
          </div>
          {/* 관리자 전용 글쓰기 버튼 */}
          {(session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') && (
            <Link
              href="/programs/write"
              className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">프로그램 등록</span>
            </Link>
          )}
        </div>

        {/* Filters */}
        <ProgramFilters
          currentStatus={statusFilter}
          currentType={typeFilter}
          currentMode={modeFilter}
        />

        {/* Programs Grid */}
        {programs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                id={program.id}
                title={program.title}
                slug={program.slug}
                type={program.type}
                description={program.description}
                image={program.image}
                thumbnailSquare={program.thumbnailSquare}
                isOnline={program.isOnline}
                feeType={program.feeType}
                feeAmount={program.feeAmount}
                status={program.status}
                recruitStartDate={program.recruitStartDate}
                recruitEndDate={program.recruitEndDate}
                startDate={program.startDate}
                endDate={program.endDate}
                likeCount={program.likeCount}
                applicationCount={program.applicationCount}
                isLiked={userLikes.has(program.id)}
                hasApplied={userApplications.has(program.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              프로그램이 없습니다
            </h3>
            <p className="text-gray-500">
              조건에 맞는 프로그램이 없습니다. 다른 필터를 선택해 보세요.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
