import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle, FileText, Quote } from 'lucide-react';
import {
  getMemberDetail,
  getMemberPrograms,
  getMemberAttendances,
  getMemberReports,
  getMemberQuotes,
} from '@/lib/club/member-queries';
import MemberDetailCard from '@/components/club/admin/MemberDetailCard';
import MemberActivityTabs from '@/components/club/admin/MemberActivityTabs';
import StatCard from '@/components/club/admin/StatCard';

export const metadata = { title: '회원 상세' };

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function MemberDetailPage({ params }: Props) {
  const { userId } = await params;
  const member = await getMemberDetail(userId);
  if (!member) notFound();

  const [programs, attendances, reports, quotes] = await Promise.all([
    getMemberPrograms(userId),
    getMemberAttendances(userId),
    getMemberReports(userId),
    getMemberQuotes(userId),
  ]);

  return (
    <div className="space-y-6">
      {/* 뒤로가기 */}
      <Link
        href="/club/admin/members"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        회원 목록
      </Link>

      {/* 기본 정보 */}
      <MemberDetailCard member={member} />

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="참여 프로그램"
          value={member.stats.programCount}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="출석률"
          value={`${member.stats.attendanceRate}%`}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="작성 독후감"
          value={member.stats.reportCount}
          icon={FileText}
          color="amber"
        />
        <StatCard
          title="등록 명문장"
          value={member.stats.quoteCount}
          icon={Quote}
          color="purple"
        />
      </div>

      {/* 활동 내역 탭 */}
      <MemberActivityTabs
        programs={programs}
        attendances={attendances}
        reports={reports}
        quotes={quotes}
      />
    </div>
  );
}
