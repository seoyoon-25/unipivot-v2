import Link from 'next/link'
import { TrendingUp, Users, ClipboardList, BookOpen, FlaskConical, CheckCircle, Clock, ArrowRight, Mic, Calendar } from 'lucide-react'
import { prisma } from '@/lib/db'

async function getLabStats() {
  const [
    totalExperts,
    verifiedExperts,
    pendingExperts,
    totalSurveys,
    recruitingSurveys,
    completedSurveys,
    totalTrends,
    totalParticipations,
    pendingParticipations,
    completedParticipations,
    recentExperts,
    recentSurveys,
    recentParticipations,
  ] = await Promise.all([
    prisma.expertProfile.count({ where: { isActive: true } }),
    prisma.expertProfile.count({ where: { isActive: true, isVerified: true } }),
    prisma.expertProfile.count({ where: { isActive: true, isVerified: false } }),
    prisma.labSurvey.count({ where: { status: { not: 'DRAFT' } } }),
    prisma.labSurvey.count({ where: { status: 'RECRUITING' } }),
    prisma.labSurvey.count({ where: { status: 'COMPLETED' } }),
    prisma.researchTrend.count({ where: { isActive: true } }),
    prisma.researchParticipation.count(),
    prisma.researchParticipation.count({ where: { status: 'APPLIED' } }),
    prisma.researchParticipation.count({ where: { status: 'COMPLETED' } }),
    prisma.expertProfile.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, organization: true, isVerified: true, createdAt: true },
    }),
    prisma.labSurvey.findMany({
      where: { status: { not: 'DRAFT' } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, type: true, status: true, currentCount: true, targetCount: true, createdAt: true },
    }),
    prisma.researchParticipation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        survey: { select: { title: true } },
      },
    }),
  ])

  return {
    experts: { total: totalExperts, verified: verifiedExperts, pending: pendingExperts },
    surveys: { total: totalSurveys, recruiting: recruitingSurveys, completed: completedSurveys },
    trends: { total: totalTrends },
    participations: { total: totalParticipations, pending: pendingParticipations, completed: completedParticipations },
    recentExperts,
    recentSurveys,
    recentParticipations,
  }
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })
}

export default async function LabAdminPage() {
  const stats = await getLabStats()

  const statCards = [
    {
      title: '전문가/강사',
      href: '/admin/lab/experts',
      icon: Users,
      color: 'bg-blue-500',
      stats: [
        { label: '전체', value: stats.experts.total },
        { label: '검증됨', value: stats.experts.verified, color: 'text-green-600' },
        { label: '대기중', value: stats.experts.pending, color: 'text-yellow-600' },
      ],
    },
    {
      title: '설문조사',
      href: '/admin/lab/surveys',
      icon: ClipboardList,
      color: 'bg-green-500',
      stats: [
        { label: '전체', value: stats.surveys.total },
        { label: '진행중', value: stats.surveys.recruiting, color: 'text-green-600' },
        { label: '완료', value: stats.surveys.completed, color: 'text-blue-600' },
      ],
    },
    {
      title: '연구동향',
      href: '/admin/lab/trends',
      icon: TrendingUp,
      color: 'bg-purple-500',
      stats: [
        { label: '전체', value: stats.trends.total },
      ],
    },
    {
      title: '연구참여',
      href: '/admin/lab/participations',
      icon: BookOpen,
      color: 'bg-orange-500',
      stats: [
        { label: '전체', value: stats.participations.total },
        { label: '신청대기', value: stats.participations.pending, color: 'text-yellow-600' },
        { label: '완료', value: stats.participations.completed, color: 'text-green-600' },
      ],
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <FlaskConical className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">리서치랩 관리</h1>
          <p className="text-gray-500">Research Lab Administration</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors mb-3">
              {card.title}
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {card.stats.map((stat) => (
                <div key={stat.label} className="text-sm">
                  <span className="text-gray-500">{stat.label}</span>
                  <span className={`ml-1 font-semibold ${stat.color || 'text-gray-900'}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Experts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">최근 등록 전문가</h3>
            <Link href="/admin/lab/experts" className="text-sm text-primary hover:underline">
              전체보기
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentExperts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">등록된 전문가가 없습니다</div>
            ) : (
              stats.recentExperts.map((expert) => (
                <div key={expert.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{expert.name}</p>
                    <p className="text-sm text-gray-500">{expert.organization || '-'}</p>
                  </div>
                  <div className="text-right">
                    {expert.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        검증됨
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
                        <Clock className="w-3 h-3" />
                        대기중
                      </span>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(expert.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Surveys */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">최근 설문조사</h3>
            <Link href="/admin/lab/surveys" className="text-sm text-primary hover:underline">
              전체보기
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentSurveys.length === 0 ? (
              <div className="p-6 text-center text-gray-500">등록된 설문조사가 없습니다</div>
            ) : (
              stats.recentSurveys.map((survey) => (
                <div key={survey.id} className="px-6 py-3">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-gray-900 line-clamp-1">{survey.title}</p>
                    <span className="flex items-center gap-1 text-xs text-gray-500 ml-2 shrink-0">
                      {survey.type === 'INTERVIEW' ? <Mic className="w-3 h-3" /> : <ClipboardList className="w-3 h-3" />}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      survey.status === 'RECRUITING' ? 'bg-green-100 text-green-700' :
                      survey.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {survey.status === 'RECRUITING' ? '진행중' : survey.status === 'COMPLETED' ? '완료' : '마감'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {survey.currentCount}/{survey.targetCount}명
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Participations */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">최근 참여 신청</h3>
            <Link href="/admin/lab/participations" className="text-sm text-primary hover:underline">
              전체보기
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentParticipations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">참여 신청이 없습니다</div>
            ) : (
              stats.recentParticipations.map((p) => (
                <div key={p.id} className="px-6 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900">{p.name || '익명'}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === 'APPLIED' ? 'bg-yellow-100 text-yellow-700' :
                      p.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                      p.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {p.status === 'APPLIED' ? '신청' :
                       p.status === 'APPROVED' ? '승인' :
                       p.status === 'COMPLETED' ? '완료' : '취소'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">{p.survey.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(p.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
