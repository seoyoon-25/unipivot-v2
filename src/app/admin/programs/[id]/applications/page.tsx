import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ApplicationsTable } from './ApplicationsTable'
import Link from 'next/link'
import { ArrowLeft, Download, AlertTriangle, Ban, Eye, Sparkles } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string; alert?: string }>
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
  const { status: statusFilter, alert: alertFilter } = await searchParams

  const program = await prisma.program.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      capacity: true,
      maxParticipants: true,
      feeType: true,
      feeAmount: true,
      depositAmountSetting: true,
      applicationCount: true,
      autoApproveVVIP: true,
      autoApproveVIP: true,
      autoRejectBlocked: true,
    },
  })

  if (!program) {
    notFound()
  }

  // Build where clause
  const where: any = { programId: id }
  if (statusFilter && statusFilter !== 'all') {
    where.status = statusFilter
  }
  if (alertFilter) {
    where.alertLevel = alertFilter
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
      member: {
        select: {
          id: true,
          memberCode: true,
          grade: true,
          status: true,
          stats: {
            select: {
              totalPrograms: true,
              attendanceRate: true,
              noShowCount: true,
            },
          },
        },
      },
    },
    orderBy: [
      // Alert applications first
      { alertLevel: 'desc' },
      { appliedAt: 'desc' },
    ],
  })

  // Get status counts
  const statusCounts = await prisma.programApplication.groupBy({
    by: ['status'],
    where: { programId: id },
    _count: true,
  })

  // Get alert counts
  const alertCounts = await prisma.programApplication.groupBy({
    by: ['alertLevel'],
    where: { programId: id, alertLevel: { not: null } },
    _count: true,
  })

  const counts = {
    all: 0,
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    WAITLIST: 0,
    CANCELLED: 0,
    // Legacy
    ACCEPTED: 0,
    ADDITIONAL: 0,
    NO_CONTACT: 0,
  }
  statusCounts.forEach((s) => {
    counts[s.status as keyof typeof counts] = s._count
    counts.all += s._count
  })

  const alerts = {
    BLOCKED: 0,
    WARNING: 0,
    WATCH: 0,
    VVIP: 0,
    VIP: 0,
  }
  alertCounts.forEach((a) => {
    if (a.alertLevel) {
      alerts[a.alertLevel as keyof typeof alerts] = a._count
    }
  })

  const hasAlerts = alerts.BLOCKED > 0 || alerts.WARNING > 0 || alerts.WATCH > 0

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

      {/* Alert Banner */}
      {hasAlerts && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-red-700 font-medium">
              <AlertTriangle className="w-5 h-5" />
              <span>주의가 필요한 신청</span>
            </div>
            <div className="flex gap-3">
              {alerts.BLOCKED > 0 && (
                <Link
                  href={`/admin/programs/${id}/applications?alert=BLOCKED`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200"
                >
                  <Ban className="w-4 h-4" />
                  차단 {alerts.BLOCKED}
                </Link>
              )}
              {alerts.WARNING > 0 && (
                <Link
                  href={`/admin/programs/${id}/applications?alert=WARNING`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200"
                >
                  <AlertTriangle className="w-4 h-4" />
                  경고 {alerts.WARNING}
                </Link>
              )}
              {alerts.WATCH > 0 && (
                <Link
                  href={`/admin/programs/${id}/applications?alert=WATCH`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium hover:bg-yellow-200"
                >
                  <Eye className="w-4 h-4" />
                  주시 {alerts.WATCH}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{counts.all}</div>
          <div className="text-sm text-gray-500">전체</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{counts.PENDING}</div>
          <div className="text-sm text-yellow-600">검토중</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{counts.APPROVED + counts.ACCEPTED + counts.ADDITIONAL}</div>
          <div className="text-sm text-green-600">승인</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{counts.WAITLIST}</div>
          <div className="text-sm text-blue-600">대기</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{counts.REJECTED}</div>
          <div className="text-sm text-red-600">거절</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{counts.CANCELLED + counts.NO_CONTACT}</div>
          <div className="text-sm text-gray-600">취소/기타</div>
        </div>
        {(alerts.VVIP + alerts.VIP > 0) && (
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{alerts.VVIP + alerts.VIP}</div>
            <div className="text-sm text-purple-600 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              VIP
            </div>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { value: 'all', label: '전체' },
          { value: 'PENDING', label: '검토중' },
          { value: 'APPROVED', label: '승인' },
          { value: 'WAITLIST', label: '대기' },
          { value: 'REJECTED', label: '거절' },
          { value: 'CANCELLED', label: '취소' },
          // Legacy
          { value: 'ACCEPTED', label: '합격 (구)' },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/programs/${id}/applications${tab.value === 'all' ? '' : `?status=${tab.value}`}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              (statusFilter || 'all') === tab.value && !alertFilter
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Settings info */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center gap-6 text-sm text-gray-600">
        <span>자동 처리 설정:</span>
        <span className={program.autoApproveVVIP ? 'text-green-600' : 'text-gray-400'}>
          VVIP 자동승인: {program.autoApproveVVIP ? 'ON' : 'OFF'}
        </span>
        <span className={program.autoApproveVIP ? 'text-green-600' : 'text-gray-400'}>
          VIP 자동승인: {program.autoApproveVIP ? 'ON' : 'OFF'}
        </span>
        <span className={program.autoRejectBlocked ? 'text-red-600' : 'text-gray-400'}>
          차단회원 자동거절: {program.autoRejectBlocked ? 'ON' : 'OFF'}
        </span>
      </div>

      {/* Applications Table */}
      <ApplicationsTable
        applications={applications}
        programId={id}
        feeType={program.feeType}
        feeAmount={program.feeAmount}
        depositAmount={program.depositAmountSetting}
      />
    </div>
  )
}
