import { prisma } from '@/lib/db';
import { startOfDay, endOfDay, addDays } from 'date-fns';

/**
 * 사용자의 참여 중인 프로그램 조회
 */
export async function getMyPrograms(userId: string) {
  const programs = await prisma.programParticipant.findMany({
    where: {
      userId,
      program: {
        status: { in: ['RECRUITING', 'ONGOING'] },
      },
    },
    include: {
      program: {
        include: {
          sessions: {
            where: {
              date: { gte: new Date() },
            },
            orderBy: { date: 'asc' },
            take: 1,
            select: {
              sessionNo: true,
              date: true,
            },
          },
          _count: {
            select: { sessions: true },
          },
        },
      },
    },
    orderBy: {
      program: { startDate: 'desc' },
    },
  });

  return programs.map((p) => ({
    id: p.program.id,
    title: p.program.title,
    type: p.program.type,
    status: p.program.status,
    image: p.program.thumbnailSquare || p.program.image,
    totalSessions: p.program._count.sessions,
    nextSession: p.program.sessions[0] || null,
  }));
}

/**
 * 다음 모임 정보 조회 (7일 이내)
 */
export async function getNextMeetings(userId: string, limit = 3) {
  const now = new Date();
  const weekLater = addDays(now, 7);

  const sessions = await prisma.programSession.findMany({
    where: {
      date: {
        gte: now,
        lte: weekLater,
      },
      program: {
        participants: {
          some: { userId },
        },
        status: 'ONGOING',
      },
    },
    select: {
      id: true,
      sessionNo: true,
      date: true,
      location: true,
      bookTitle: true,
      bookAuthor: true,
      program: {
        select: {
          id: true,
          title: true,
          type: true,
        },
      },
    },
    orderBy: { date: 'asc' },
    take: limit,
  });

  return sessions;
}

/**
 * 사용자 활동 통계 조회
 */
export async function getMyStats(userId: string) {
  // Member ID 조회 (BookReport는 Member 기준)
  const member = await prisma.member.findUnique({
    where: { userId },
    select: { id: true },
  });

  const [
    totalPrograms,
    attendanceCount,
    totalSessions,
    reviewCount,
  ] = await Promise.all([
    prisma.programParticipant.count({
      where: { userId },
    }),
    prisma.programAttendance.count({
      where: {
        participant: { userId },
        status: { in: ['PRESENT', 'LATE'] },
      },
    }),
    prisma.programSession.count({
      where: {
        program: {
          participants: { some: { userId } },
        },
        date: { lte: new Date() },
      },
    }),
    member
      ? prisma.bookReport.count({ where: { authorId: member.id } })
      : Promise.resolve(0),
  ]);

  const attendanceRate = totalSessions > 0
    ? Math.round((attendanceCount / totalSessions) * 100)
    : 0;

  return {
    totalPrograms,
    attendanceRate,
    totalReviews: reviewCount,
    totalStamps: 0,
  };
}

/**
 * 오늘 모임 여부 확인
 */
export async function getTodayMeeting(userId: string) {
  const today = new Date();

  const session = await prisma.programSession.findFirst({
    where: {
      date: {
        gte: startOfDay(today),
        lte: endOfDay(today),
      },
      program: {
        participants: { some: { userId } },
        status: 'ONGOING',
      },
    },
    select: {
      id: true,
      program: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return session;
}
