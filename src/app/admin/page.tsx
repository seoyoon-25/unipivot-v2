import { Users, BookOpen, Wallet, TrendingUp } from 'lucide-react'
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

export default async function AdminDashboardPage() {
  const { stats, recentMembers, recentActivities } = await getDashboardStats()

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
