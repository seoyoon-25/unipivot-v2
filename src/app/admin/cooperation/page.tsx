import Link from 'next/link'
import { prisma } from '@/lib/db'
import { MessageSquare, Mic, ClipboardList, Clock, CheckCircle, XCircle } from 'lucide-react'

async function getCooperationStats() {
  const [consulting, lecturer, survey] = await Promise.all([
    prisma.consultingRequest.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.lecturerRequest.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.surveyRequest.groupBy({
      by: ['status'],
      _count: true,
    }),
  ])

  const getStatusCount = (data: any[], status: string) =>
    data.find(d => d.status === status)?._count || 0

  const getTotal = (data: any[]) =>
    data.reduce((sum, d) => sum + d._count, 0)

  return {
    consulting: {
      total: getTotal(consulting),
      pending: getStatusCount(consulting, 'PENDING'),
      reviewing: getStatusCount(consulting, 'REVIEWING'),
      completed: getStatusCount(consulting, 'COMPLETED') + getStatusCount(consulting, 'MATCHED'),
      rejected: getStatusCount(consulting, 'REJECTED'),
    },
    lecturer: {
      total: getTotal(lecturer),
      pending: getStatusCount(lecturer, 'PENDING'),
      reviewing: getStatusCount(lecturer, 'REVIEWING'),
      completed: getStatusCount(lecturer, 'COMPLETED') + getStatusCount(lecturer, 'MATCHED'),
      rejected: getStatusCount(lecturer, 'REJECTED'),
    },
    survey: {
      total: getTotal(survey),
      pending: getStatusCount(survey, 'PENDING'),
      reviewing: getStatusCount(survey, 'REVIEWING'),
      completed: getStatusCount(survey, 'COMPLETED') + getStatusCount(survey, 'IN_PROGRESS'),
      rejected: getStatusCount(survey, 'REJECTED'),
    },
  }
}

async function getRecentRequests() {
  const [consulting, lecturer, survey] = await Promise.all([
    prisma.consultingRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        organization: true,
        contactName: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.lecturerRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        topic: true,
        organization: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.surveyRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        requesterName: true,
        requesterType: true,
        status: true,
        createdAt: true,
      },
    }),
  ])

  return { consulting, lecturer, survey }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">대기</span>
    case 'REVIEWING':
      return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">검토중</span>
    case 'MATCHED':
    case 'IN_PROGRESS':
      return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">진행중</span>
    case 'COMPLETED':
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">완료</span>
    case 'REJECTED':
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">거절</span>
    default:
      return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">{status}</span>
  }
}

export default async function CooperationDashboardPage() {
  const stats = await getCooperationStats()
  const recent = await getRecentRequests()

  const cards = [
    {
      title: '자문요청',
      icon: MessageSquare,
      color: 'blue',
      href: '/admin/cooperation/consulting',
      stats: stats.consulting,
    },
    {
      title: '강사요청',
      icon: Mic,
      color: 'purple',
      href: '/admin/cooperation/lecturer',
      stats: stats.lecturer,
    },
    {
      title: '설문·인터뷰',
      icon: ClipboardList,
      color: 'emerald',
      href: '/admin/cooperation/survey',
      stats: stats.survey,
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">협조요청 관리</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-${card.color}-100 flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 text-${card.color}-600`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{card.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{card.stats.total}건</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div>
                <p className="text-gray-500">대기</p>
                <p className="font-semibold text-yellow-600">{card.stats.pending}</p>
              </div>
              <div>
                <p className="text-gray-500">검토</p>
                <p className="font-semibold text-blue-600">{card.stats.reviewing}</p>
              </div>
              <div>
                <p className="text-gray-500">완료</p>
                <p className="font-semibold text-green-600">{card.stats.completed}</p>
              </div>
              <div>
                <p className="text-gray-500">거절</p>
                <p className="font-semibold text-red-600">{card.stats.rejected}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending Alert */}
      {(stats.consulting.pending + stats.lecturer.pending + stats.survey.pending > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-600" />
          <p className="text-yellow-800">
            처리 대기중인 요청이{' '}
            <strong>{stats.consulting.pending + stats.lecturer.pending + stats.survey.pending}건</strong>{' '}
            있습니다.
          </p>
        </div>
      )}

      {/* Recent Requests */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 자문요청 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">최근 자문요청</h3>
            <Link href="/admin/cooperation/consulting" className="text-sm text-primary hover:underline">
              전체보기
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recent.consulting.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-500">요청이 없습니다</p>
            ) : (
              recent.consulting.map((req) => (
                <div key={req.id} className="px-6 py-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 truncate">{req.organization}</p>
                    {getStatusBadge(req.status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    {req.contactName} · {new Date(req.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 강사요청 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">최근 강사요청</h3>
            <Link href="/admin/cooperation/lecturer" className="text-sm text-primary hover:underline">
              전체보기
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recent.lecturer.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-500">요청이 없습니다</p>
            ) : (
              recent.lecturer.map((req) => (
                <div key={req.id} className="px-6 py-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 truncate">{req.topic}</p>
                    {getStatusBadge(req.status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    {req.organization} · {new Date(req.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 설문요청 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">최근 설문요청</h3>
            <Link href="/admin/cooperation/survey" className="text-sm text-primary hover:underline">
              전체보기
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recent.survey.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-500">요청이 없습니다</p>
            ) : (
              recent.survey.map((req) => (
                <div key={req.id} className="px-6 py-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 truncate">{req.requesterName}</p>
                    {getStatusBadge(req.status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    {req.requesterType === 'INDIVIDUAL' ? '개인' : '기관'} · {new Date(req.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
