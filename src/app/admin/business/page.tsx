import Link from 'next/link'
import { prisma } from '@/lib/db'
import {
  Briefcase,
  FolderKanban,
  Users,
  Calendar,
  FileText,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

async function getBusinessStats() {
  const now = new Date()

  const [
    totalProjects,
    activeProjects,
    completedProjects,
    totalPartners,
    upcomingEvents,
    totalDocuments,
    recentProjects,
    recentDocuments,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.project.count({ where: { status: 'COMPLETED' } }),
    prisma.partner.count(),
    prisma.calendarEvent.count({
      where: {
        startDate: { gte: now },
      },
    }),
    prisma.document.count(),
    prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        partners: {
          include: {
            partner: { select: { name: true } },
          },
        },
      },
    }),
    prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        project: { select: { title: true } },
      },
    }),
  ])

  return {
    stats: {
      totalProjects,
      activeProjects,
      completedProjects,
      totalPartners,
      upcomingEvents,
      totalDocuments,
    },
    recentProjects,
    recentDocuments,
  }
}

export default async function AdminBusinessPage() {
  const { stats, recentProjects, recentDocuments } = await getBusinessStats()

  const modules = [
    {
      title: '프로젝트',
      description: '사업 프로젝트 관리',
      href: '/admin/business/projects',
      icon: FolderKanban,
      stats: `${stats.activeProjects}개 진행중`,
      color: 'bg-blue-500',
    },
    {
      title: '파트너사',
      description: '협력 기관 관리',
      href: '/admin/business/partners',
      icon: Users,
      stats: `${stats.totalPartners}개 등록`,
      color: 'bg-green-500',
    },
    {
      title: '일정 관리',
      description: '사업 일정 및 이벤트',
      href: '/admin/business/calendar',
      icon: Calendar,
      stats: `${stats.upcomingEvents}개 예정`,
      color: 'bg-purple-500',
    },
    {
      title: '문서 관리',
      description: '계약서, 보고서 등',
      href: '/admin/business/documents',
      icon: FileText,
      stats: `${stats.totalDocuments}개 문서`,
      color: 'bg-orange-500',
    },
  ]

  const statusColors: Record<string, string> = {
    PLANNING: 'bg-yellow-100 text-yellow-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    ON_HOLD: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }

  const statusLabels: Record<string, string> = {
    PLANNING: '기획중',
    IN_PROGRESS: '진행중',
    COMPLETED: '완료',
    ON_HOLD: '보류',
    CANCELLED: '취소',
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">사업 관리</h1>
          <p className="text-gray-500">프로젝트, 파트너사, 일정 및 문서를 관리합니다</p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">전체 프로젝트</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalProjects}</div>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="text-blue-600">{stats.activeProjects} 진행중</span>
            <span className="text-gray-300">|</span>
            <span className="text-green-600">{stats.completedProjects} 완료</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">파트너사</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalPartners}</div>
          <div className="text-sm text-green-600 mt-2">등록됨</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">예정된 일정</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</div>
          <div className="text-sm text-gray-500 mt-2">30일 이내</div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">문서</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</div>
        </div>
      </div>

      {/* 모듈 카드 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className={`w-10 h-10 ${module.color} rounded-lg flex items-center justify-center mb-4`}>
              <module.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
              {module.title}
            </h3>
            <p className="text-sm text-gray-500 mb-3">{module.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary font-medium">{module.stats}</span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* 최근 프로젝트 & 문서 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 최근 프로젝트 */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">최근 프로젝트</h3>
            <Link
              href="/admin/business/projects"
              className="text-sm text-primary hover:underline"
            >
              전체 보기
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentProjects.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                등록된 프로젝트가 없습니다
              </div>
            ) : (
              recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/admin/business/projects?search=${project.title}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {project.title}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {project.partners.map((p) => p.partner.name).join(', ') || '파트너 없음'}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[project.status] || 'bg-gray-100 text-gray-600'}`}>
                    {statusLabels[project.status] || project.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* 최근 문서 */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">최근 문서</h3>
            <Link
              href="/admin/business/documents"
              className="text-sm text-primary hover:underline"
            >
              전체 보기
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentDocuments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                등록된 문서가 없습니다
              </div>
            ) : (
              recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {doc.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {doc.project?.title || '프로젝트 없음'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(doc.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
