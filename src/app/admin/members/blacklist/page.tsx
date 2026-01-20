import { Suspense } from 'react'
import { getBlacklistMembers, changeMemberStatus } from '@/lib/actions/members'
import { MEMBER_STATUS } from '@/lib/services/member-matching'
import Link from 'next/link'
import {
  ArrowLeft,
  Eye,
  AlertTriangle,
  Ban,
  User,
  Calendar,
  ChevronRight,
} from 'lucide-react'

// 탭 타입
type TabType = 'watch' | 'warning' | 'blocked'

interface Props {
  searchParams: {
    tab?: string
  }
}

// 상태 배지 컴포넌트
function StatusBadge({ status }: { status: string }) {
  const info = MEMBER_STATUS[status as keyof typeof MEMBER_STATUS]
  if (!info) return <span className="text-gray-500">{status}</span>

  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    WATCH: 'bg-yellow-100 text-yellow-700',
    WARNING: 'bg-orange-100 text-orange-700',
    BLOCKED: 'bg-red-100 text-red-700',
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {info.emoji} {info.label}
    </span>
  )
}

// 회원 카드 컴포넌트
function MemberCard({ member }: { member: any }) {
  const lastLog = member.statusLogs?.[0]
  const lastReason = lastLog?.reason || '사유 없음'
  const lastDate = lastLog?.createdAt
    ? new Date(lastLog.createdAt).toLocaleDateString('ko-KR')
    : '-'

  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{member.name}</span>
              <StatusBadge status={member.status} />
            </div>
            <p className="text-sm text-gray-500">{member.memberCode}</p>
          </div>
        </div>
        <Link
          href={`/admin/members/${member.id}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>
      </div>

      {/* 최근 사유 */}
      <div className="mt-3 pt-3 border-t">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
          <div>
            <p className="text-sm text-gray-700">{lastReason}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {lastDate}
            </div>
          </div>
        </div>
      </div>

      {/* 통계 */}
      {member.stats && (
        <div className="mt-3 flex gap-4 text-xs text-gray-500">
          <span>출석률: {Math.round(member.stats.attendanceRate || 0)}%</span>
          <span>노쇼: {member.stats.noShowCount || 0}회</span>
        </div>
      )}
    </div>
  )
}

// 탭 컴포넌트
function TabButton({
  active,
  icon: Icon,
  label,
  count,
  color,
  href,
}: {
  active: boolean
  icon: any
  label: string
  count: number
  color: string
  href: string
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
        active
          ? `${color} shadow-sm`
          : 'bg-white hover:bg-gray-50 text-gray-600 border'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      <span className={`px-2 py-0.5 rounded-full text-sm ${
        active ? 'bg-white/20' : 'bg-gray-100'
      }`}>
        {count}
      </span>
    </Link>
  )
}

export default async function BlacklistPage({ searchParams }: Props) {
  const tab = (searchParams.tab as TabType) || 'watch'
  const data = await getBlacklistMembers()

  const tabs = [
    {
      key: 'watch',
      label: '관찰',
      icon: Eye,
      count: data.watchCount,
      color: 'bg-yellow-500 text-white',
      members: data.grouped.WATCH,
    },
    {
      key: 'warning',
      label: '경고',
      icon: AlertTriangle,
      count: data.warningCount,
      color: 'bg-orange-500 text-white',
      members: data.grouped.WARNING,
    },
    {
      key: 'blocked',
      label: '차단',
      icon: Ban,
      count: data.blockedCount,
      color: 'bg-red-500 text-white',
      members: data.grouped.BLOCKED,
    },
  ]

  const activeTab = tabs.find(t => t.key === tab) || tabs[0]

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/members"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">블랙리스트 관리</h1>
          <p className="text-gray-500 text-sm mt-1">
            관찰, 경고, 차단 상태의 회원을 관리합니다
          </p>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-700">
            <Eye className="w-5 h-5" />
            <span className="font-medium">관찰</span>
          </div>
          <p className="text-2xl font-bold text-yellow-800 mt-1">{data.watchCount}명</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-2 text-orange-700">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">경고</span>
          </div>
          <p className="text-2xl font-bold text-orange-800 mt-1">{data.warningCount}명</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <Ban className="w-5 h-5" />
            <span className="font-medium">차단</span>
          </div>
          <p className="text-2xl font-bold text-red-800 mt-1">{data.blockedCount}명</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <TabButton
            key={t.key}
            active={tab === t.key}
            icon={t.icon}
            label={t.label}
            count={t.count}
            color={t.color}
            href={`/admin/members/blacklist?tab=${t.key}`}
          />
        ))}
      </div>

      {/* 회원 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTab.members.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">해당 상태의 회원이 없습니다.</p>
          </div>
        ) : (
          activeTab.members.map((member: any) => (
            <MemberCard key={member.id} member={member} />
          ))
        )}
      </div>
    </div>
  )
}
