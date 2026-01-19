import { prisma } from '@/lib/db';

/**
 * 단일 회원의 통계 재계산
 */
export async function calculateMemberStats(memberId: string) {
  // 회원의 모든 출석 기록 조회
  const attendances = await prisma.memberAttendance.findMany({
    where: { memberId },
    include: {
      program: {
        select: { id: true, title: true },
      },
    },
  });

  // 참여한 프로그램 ID 집합 (중복 제거)
  const programIds = new Set(attendances.map((a) => a.programId));

  // 통계 계산
  const totalPrograms = programIds.size;
  const totalSessions = attendances.length;
  const totalAttended = attendances.filter((a) => a.attended).length;
  const totalAbsent = attendances.filter((a) => !a.attended).length;
  const totalReports = attendances.filter((a) => a.reportSubmitted).length;

  // 비율 계산
  const attendanceRate = totalSessions > 0 ? (totalAttended / totalSessions) * 100 : 0;
  const reportRate = totalSessions > 0 ? (totalReports / totalSessions) * 100 : 0;

  // 노쇼 횟수 (BLOCKED 상태로 기록된 회차 수 또는 별도 로직)
  // 기본적으로 결석 횟수를 노쇼로 간주 (필요시 별도 필드 추가)
  const noShowCount = totalAbsent;

  // 마지막 참여일
  const lastAttendance = attendances
    .filter((a) => a.attended && a.sessionDate)
    .sort((a, b) => (b.sessionDate?.getTime() || 0) - (a.sessionDate?.getTime() || 0))[0];

  // 통계 저장 (upsert)
  const stats = await prisma.memberStats.upsert({
    where: { memberId },
    update: {
      totalPrograms,
      totalSessions,
      totalBooks: totalPrograms, // 책 수는 프로그램 수와 동일하게 가정
      totalAttended,
      totalAbsent,
      totalReports,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      reportRate: Math.round(reportRate * 10) / 10,
      noShowCount,
      lastParticipatedAt: lastAttendance?.sessionDate || null,
    },
    create: {
      memberId,
      totalPrograms,
      totalSessions,
      totalBooks: totalPrograms,
      totalAttended,
      totalAbsent,
      totalReports,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      reportRate: Math.round(reportRate * 10) / 10,
      noShowCount,
      lastParticipatedAt: lastAttendance?.sessionDate || null,
    },
  });

  return stats;
}

/**
 * 모든 회원의 통계 재계산
 */
export async function recalculateAllMemberStats() {
  const members = await prisma.member.findMany({
    select: { id: true },
  });

  const results = {
    total: members.length,
    success: 0,
    failed: 0,
    errors: [] as { memberId: string; error: string }[],
  };

  for (const member of members) {
    try {
      await calculateMemberStats(member.id);
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        memberId: member.id,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      });
    }
  }

  return results;
}

/**
 * 프로그램별 회원 통계 조회
 */
export async function getProgramMemberStats(programId: string) {
  const attendances = await prisma.memberAttendance.findMany({
    where: { programId },
    include: {
      member: {
        select: {
          id: true,
          memberCode: true,
          name: true,
          grade: true,
          status: true,
        },
      },
    },
  });

  // 회원별 통계
  const memberStatsMap = new Map<
    string,
    {
      member: {
        id: string;
        memberCode: string;
        name: string;
        grade: string;
        status: string;
      };
      sessions: number;
      attended: number;
      reports: number;
      attendanceRate: number;
      reportRate: number;
    }
  >();

  for (const att of attendances) {
    const existing = memberStatsMap.get(att.memberId);

    if (existing) {
      existing.sessions++;
      if (att.attended) existing.attended++;
      if (att.reportSubmitted) existing.reports++;
    } else {
      memberStatsMap.set(att.memberId, {
        member: att.member,
        sessions: 1,
        attended: att.attended ? 1 : 0,
        reports: att.reportSubmitted ? 1 : 0,
        attendanceRate: 0,
        reportRate: 0,
      });
    }
  }

  // 비율 계산
  const stats = Array.from(memberStatsMap.values()).map((s) => ({
    ...s,
    attendanceRate: s.sessions > 0 ? Math.round((s.attended / s.sessions) * 1000) / 10 : 0,
    reportRate: s.sessions > 0 ? Math.round((s.reports / s.sessions) * 1000) / 10 : 0,
  }));

  // 출석률 기준 정렬
  stats.sort((a, b) => b.attendanceRate - a.attendanceRate);

  return {
    totalMembers: stats.length,
    stats,
    summary: {
      averageAttendanceRate:
        stats.length > 0
          ? Math.round(
              (stats.reduce((sum, s) => sum + s.attendanceRate, 0) / stats.length) * 10
            ) / 10
          : 0,
      averageReportRate:
        stats.length > 0
          ? Math.round((stats.reduce((sum, s) => sum + s.reportRate, 0) / stats.length) * 10) /
            10
          : 0,
    },
  };
}

/**
 * 등급별 회원 수 통계
 */
export async function getGradeDistribution() {
  const grades = await prisma.member.groupBy({
    by: ['grade'],
    _count: { id: true },
  });

  return grades.map((g) => ({
    grade: g.grade,
    count: g._count.id,
  }));
}

/**
 * 상태별 회원 수 통계
 */
export async function getStatusDistribution() {
  const statuses = await prisma.member.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  return statuses.map((s) => ({
    status: s.status,
    count: s._count.id,
  }));
}

/**
 * 회원 요약 통계
 */
export async function getMemberSummary() {
  const [total, gradeDistribution, statusDistribution, recentMembers] = await Promise.all([
    prisma.member.count(),
    getGradeDistribution(),
    getStatusDistribution(),
    prisma.member.findMany({
      take: 5,
      orderBy: { joinedAt: 'desc' },
      select: {
        id: true,
        memberCode: true,
        name: true,
        grade: true,
        joinedAt: true,
      },
    }),
  ]);

  return {
    total,
    gradeDistribution,
    statusDistribution,
    recentMembers,
    blacklistCount:
      statusDistribution.find((s) => s.status === 'BLOCKED')?.count ||
      0 +
        (statusDistribution.find((s) => s.status === 'WARNING')?.count || 0) +
        (statusDistribution.find((s) => s.status === 'WATCH')?.count || 0),
  };
}

/**
 * 출석률 기준 회원 랭킹
 */
export async function getMemberRanking(limit: number = 10) {
  const stats = await prisma.memberStats.findMany({
    take: limit,
    orderBy: { attendanceRate: 'desc' },
    include: {
      member: {
        select: {
          id: true,
          memberCode: true,
          name: true,
          grade: true,
          status: true,
        },
      },
    },
  });

  return stats.map((s, index) => ({
    rank: index + 1,
    member: s.member,
    attendanceRate: s.attendanceRate,
    reportRate: s.reportRate,
    totalPrograms: s.totalPrograms,
    totalSessions: s.totalSessions,
  }));
}

/**
 * 노쇼 많은 회원 목록
 */
export async function getNoShowMembers(minNoShowCount: number = 2) {
  const stats = await prisma.memberStats.findMany({
    where: {
      noShowCount: { gte: minNoShowCount },
    },
    orderBy: { noShowCount: 'desc' },
    include: {
      member: {
        select: {
          id: true,
          memberCode: true,
          name: true,
          grade: true,
          status: true,
        },
      },
    },
  });

  return stats.map((s) => ({
    member: s.member,
    noShowCount: s.noShowCount,
    attendanceRate: s.attendanceRate,
    totalSessions: s.totalSessions,
  }));
}

/**
 * 최근 활동이 없는 회원 목록 (휴면 회원)
 */
export async function getInactiveMembers(monthsInactive: number = 6) {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsInactive);

  const stats = await prisma.memberStats.findMany({
    where: {
      OR: [{ lastParticipatedAt: { lt: cutoffDate } }, { lastParticipatedAt: null }],
    },
    include: {
      member: {
        select: {
          id: true,
          memberCode: true,
          name: true,
          grade: true,
          status: true,
          joinedAt: true,
        },
      },
    },
  });

  return stats.map((s) => ({
    member: s.member,
    lastParticipatedAt: s.lastParticipatedAt,
    totalPrograms: s.totalPrograms,
  }));
}
