import { Users, BookOpen, CheckCircle, UserPlus, Calendar } from 'lucide-react';
import { getAdminStats, getRecentActivity } from '@/lib/club/admin-queries';
import Image from 'next/image';
import StatCard from '@/components/club/admin/StatCard';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';

export const metadata = { title: '관리자 대시보드' };

export default async function AdminDashboardPage() {
  const [stats, activity] = await Promise.all([
    getAdminStats(),
    getRecentActivity(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="전체 회원" value={stats.totalMembers} icon={Users} color="blue" />
        <StatCard
          title="진행 중 프로그램"
          value={stats.ongoingPrograms}
          icon={BookOpen}
          color="green"
        />
        <StatCard
          title="이번 달 출석률"
          value={`${stats.attendanceRate}%`}
          icon={CheckCircle}
          color="amber"
        />
        <StatCard
          title="이번 주 신규 가입"
          value={stats.newMembersThisWeek}
          icon={UserPlus}
          color="purple"
        />
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 최근 가입 회원 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">최근 가입 회원</h2>
          <div className="space-y-3">
            {activity.recentMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt=""
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-500">
                      {(member.name || '?').charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.name || '(이름 없음)'}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
              </div>
            ))}
            {activity.recentMembers.length === 0 && (
              <p className="text-sm text-gray-400">최근 가입 회원이 없습니다.</p>
            )}
          </div>
          <Link
            href="/club/admin/members"
            className="block mt-4 text-sm text-blue-600 hover:underline"
          >
            전체 보기 &rarr;
          </Link>
        </div>

        {/* 최근 생성 프로그램 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">최근 프로그램</h2>
          <div className="space-y-3">
            {activity.recentPrograms.map((program) => (
              <div key={program.id} className="flex items-center justify-between">
                <p className="text-sm font-medium truncate flex-1 mr-2">{program.title}</p>
                <span
                  className={`px-2 py-0.5 text-xs rounded whitespace-nowrap ${
                    program.status === 'ONGOING'
                      ? 'bg-blue-100 text-blue-700'
                      : program.status === 'RECRUITING'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {program.status === 'ONGOING'
                    ? '진행중'
                    : program.status === 'RECRUITING'
                      ? '모집중'
                      : '완료'}
                </span>
              </div>
            ))}
            {activity.recentPrograms.length === 0 && (
              <p className="text-sm text-gray-400">프로그램이 없습니다.</p>
            )}
          </div>
          <Link
            href="/club/admin/programs"
            className="block mt-4 text-sm text-blue-600 hover:underline"
          >
            전체 보기 &rarr;
          </Link>
        </div>

        {/* 다가오는 세션 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">다가오는 모임</h2>
          <div className="space-y-3">
            {activity.upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.program.title}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(session.date), 'M월 d일 (EEE) HH:mm', { locale: ko })}
                  </p>
                </div>
              </div>
            ))}
            {activity.upcomingSessions.length === 0 && (
              <p className="text-sm text-gray-400">예정된 모임이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
