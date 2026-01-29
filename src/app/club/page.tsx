import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { getMyPrograms, getNextMeetings, getMyStats, getTodayMeeting } from '@/lib/club/queries';
import StatsCard from '@/components/club/dashboard/StatsCard';
import QuickActionsCard from '@/components/club/dashboard/QuickActionsCard';
import NextMeetingCard from '@/components/club/dashboard/NextMeetingCard';
import MyProgramsCard from '@/components/club/dashboard/MyProgramsCard';

export const metadata = {
  title: '홈 | 유니클럽',
};

export default async function ClubHomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            유니클럽에 오신 것을 환영합니다
          </h1>
          <p className="text-gray-600 mb-8">
            독서모임에 참여하고, 함께 성장해요.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            로그인하고 시작하기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const userId = session.user.id;

  const [programs, meetings, stats, todayMeeting] = await Promise.all([
    getMyPrograms(userId),
    getNextMeetings(userId),
    getMyStats(userId),
    getTodayMeeting(userId),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* 인사 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          안녕하세요, {session.user?.name || '회원'}님!
        </h1>
        <p className="text-gray-500 mt-1">
          {todayMeeting
            ? `오늘 "${todayMeeting.program.title}" 모임이 있어요!`
            : '오늘도 좋은 하루 되세요.'
          }
        </p>
      </div>

      {/* 통계 */}
      <div className="mb-6">
        <StatsCard stats={stats} />
      </div>

      {/* 빠른 액션 */}
      <div className="mb-6">
        <QuickActionsCard hasTodayMeeting={!!todayMeeting} />
      </div>

      {/* 프로그램 & 다음 모임 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MyProgramsCard programs={programs} />
        <NextMeetingCard meetings={meetings} />
      </div>
    </div>
  );
}
