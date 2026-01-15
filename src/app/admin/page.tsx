import { Users, BookOpen, Wallet, TrendingUp, ClipboardList, Clock, CheckCircle, AlertCircle, ChevronRight, Palette } from 'lucide-react'
import Link from 'next/link'
import { getDashboardStats } from '@/lib/actions/admin'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount)
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('ko-KR')
}

function getOriginLabel(origin: string | null) {
  switch (origin) {
    case 'SOUTH': return '남한'
    case 'NORTH': return '북한'
    case 'OVERSEAS': return '해외'
    default: return '미설정'
  }
}

function getActionLabel(action: string) {
  const actions: Record<string, string> = {
    'LOGIN': '로그인',
    'LOGOUT': '로그아웃',
    'REGISTER': '회원가입',
    'PROGRAM_REGISTER': '프로그램 신청',
    'DONATION': '후원',
    'UPDATE_PROFILE': '프로필 수정'
  }
  return actions[action] || action
}

function getProgramTypeBadge(type: string) {
  const types: Record<string, { label: string; className: string }> = {
    BOOK_CLUB: { label: '북클럽', className: 'bg-blue-100 text-blue-700' },
    SEMINAR: { label: '세미나', className: 'bg-purple-100 text-purple-700' },
    WORKSHOP: { label: '워크샵', className: 'bg-green-100 text-green-700' },
    LECTURE: { label: '강연', className: 'bg-orange-100 text-orange-700' },
    OTHER: { label: '기타', className: 'bg-gray-100 text-gray-700' },
  }
  return types[type] || types.OTHER
}

export default async function AdminDashboardPage() {
  const { stats, recentMembers, recentActivities, activeSurveys } = await getDashboardStats()

  const statCards = [
    { label: '전체 회원', value: stats.totalMembers.toString(), icon: Users },
    { label: '진행중 프로그램', value: stats.activePrograms.toString(), icon: BookOpen },
    { label: '이번 달 후원', value: formatCurrency(stats.monthlyDonations), icon: Wallet },
    { label: '총 활동 기록', value: recentActivities.length.toString(), icon: TrendingUp },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">대시보드</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">디자인 관리</h2>
              <p className="text-white/80 text-sm">사이트 디자인과 콘텐츠를 편집하세요</p>
            </div>
          </div>
          <Link
            href="/admin/design"
            className="flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors"
          >
            디자인 관리
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Survey Status Widget */}
      {activeSurveys.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">진행 중인 만족도 조사</h2>
                <p className="text-sm text-gray-500">
                  {activeSurveys.length}개 조사 진행 중 · 반환 대기 {stats.pendingRefunds}건
                </p>
              </div>
            </div>
            <Link
              href="/admin/surveys"
              className="flex items-center gap-1 text-primary hover:text-primary-dark text-sm font-medium"
            >
              전체보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSurveys.map((survey) => {
              const typeBadge = getProgramTypeBadge(survey.programType)
              const isUrgent = survey.daysLeft <= 3 && survey.daysLeft >= 0
              const isOverdue = survey.daysLeft < 0

              return (
                <Link
                  key={survey.id}
                  href={`/admin/surveys/${survey.id}/results`}
                  className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeBadge.className}`}>
                      {typeBadge.label}
                    </span>
                    {isOverdue ? (
                      <span className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        마감됨
                      </span>
                    ) : isUrgent ? (
                      <span className="flex items-center gap-1 text-xs text-yellow-600">
                        <Clock className="w-3 h-3" />
                        D-{survey.daysLeft}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        D-{survey.daysLeft}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                    {survey.programTitle}
                  </h3>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">응답률</span>
                      <span className={`text-sm font-bold ${
                        survey.responseRate >= 80 ? 'text-green-600' :
                        survey.responseRate >= 50 ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {survey.responseRate}%
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {survey.responseCount}/{survey.targetCount}명
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        survey.responseRate >= 80 ? 'bg-green-500' :
                        survey.responseRate >= 50 ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${survey.responseRate}%` }}
                    />
                  </div>
                </Link>
              )
            })}
          </div>

          {stats.pendingRefunds > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Link
                href="/admin/finance/refunds"
                className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-yellow-800">보증금 반환 대기</p>
                    <p className="text-sm text-yellow-600">{stats.pendingRefunds}건의 반환 처리가 필요합니다</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-yellow-600" />
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">최근 가입 회원</h2>
          {recentMembers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">아직 가입된 회원이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {recentMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium">
                    {member.name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{member.name || '이름 없음'}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-primary-light text-primary text-xs rounded">
                      {getOriginLabel(member.origin)}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(member.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">최근 활동</h2>
          {recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">최근 활동이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="flex-1">
                    <p className="text-gray-900">
                      <span className="font-medium">{getActionLabel(activity.action)}</span>
                      {activity.target && (
                        <>
                          {' - '}
                          <span className="text-gray-600">{activity.target}</span>
                        </>
                      )}
                    </p>
                    {activity.user && (
                      <p className="text-sm text-gray-500">{activity.user.name}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: ko })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
