import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ApplicationsTable } from './ApplicationsTable'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const program = await prisma.program.findUnique({
    where: { id },
    select: { title: true },
  })

  return {
    title: program ? `${program.title} 신청자 관리 | 관리자` : '프로그램 신청자 관리',
  }
}

export default async function ApplicationsPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { status: statusFilter } = await searchParams

  const program = await prisma.program.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      capacity: true,
      feeType: true,
      feeAmount: true,
      applicationCount: true,
    },
  })

  if (!program) {
    notFound()
  }

  const where: any = { programId: id }
  if (statusFilter && statusFilter !== 'all') {
    where.status = statusFilter
  }

  const applications = await prisma.programApplication.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
    },
    orderBy: { appliedAt: 'desc' },
  })

  // Get status counts
  const statusCounts = await prisma.programApplication.groupBy({
    by: ['status'],
    where: { programId: id },
    _count: true,
  })

  const counts = {
    all: applications.length,
    PENDING: 0,
    ACCEPTED: 0,
    ADDITIONAL: 0,
    REJECTED: 0,
    NO_CONTACT: 0,
  }
  statusCounts.forEach((s) => {
    counts[s.status as keyof typeof counts] = s._count
  })
  counts.all = Object.values(counts).reduce((a, b) => a + b, 0) - counts.all

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/programs/${id}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">신청자 관리</h1>
            <p className="text-gray-500">{program.title}</p>
          </div>
        </div>
        <a
          href={`/api/admin/programs/${id}/applications/export`}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          엑셀 다운로드
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{program.applicationCount}</div>
          <div className="text-sm text-gray-500">전체</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{counts.PENDING}</div>
          <div className="text-sm text-yellow-600">대기</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{counts.ACCEPTED}</div>
          <div className="text-sm text-green-600">합격</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{counts.ADDITIONAL}</div>
          <div className="text-sm text-blue-600">추가합격</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{counts.REJECTED}</div>
          <div className="text-sm text-red-600">불합격</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{counts.NO_CONTACT}</div>
          <div className="text-sm text-gray-600">연락안됨</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { value: 'all', label: '전체' },
          { value: 'PENDING', label: '대기' },
          { value: 'ACCEPTED', label: '합격' },
          { value: 'ADDITIONAL', label: '추가합격' },
          { value: 'REJECTED', label: '불합격' },
          { value: 'NO_CONTACT', label: '연락안됨' },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/programs/${id}/applications${tab.value === 'all' ? '' : `?status=${tab.value}`}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              (statusFilter || 'all') === tab.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Applications Table */}
      <ApplicationsTable
        applications={applications}
        programId={id}
        feeType={program.feeType}
        feeAmount={program.feeAmount}
      />
    </div>
  )
}
