import prisma from '@/lib/db';

/**
 * 프로그램 회고 데이터 조회 (없으면 생성)
 */
export async function getProgramRecap(programId: string) {
  let recap = await prisma.programRecap.findUnique({
    where: { programId },
  });

  if (!recap) {
    recap = await generateProgramRecap(programId);
  }

  return recap;
}

/**
 * 프로그램 회고 데이터 자동 생성
 */
export async function generateProgramRecap(programId: string) {
  // Use _count + select to avoid loading full session/participant objects
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      sessions: { select: { bookTitle: true } },
      _count: { select: { sessions: true, participants: true } },
    },
  });

  if (!program) throw new Error('Program not found');

  const totalSessions = program._count.sessions;
  const totalParticipants = program._count.participants;

  const bookTitles = program.sessions
    .map((s) => s.bookTitle)
    .filter((t): t is string => !!t);

  // Run remaining queries in parallel (3 concurrent instead of 3 serial)
  const [attendances, totalReports, totalQuotes] = await Promise.all([
    prisma.programAttendance.findMany({
      where: { session: { programId } },
      select: { status: true },
    }),
    prisma.bookReport.count({ where: { programId } }),
    bookTitles.length > 0
      ? prisma.quote.count({ where: { bookTitle: { in: bookTitles } } })
      : Promise.resolve(0),
  ]);

  const presentCount = attendances.filter(
    (a) => a.status === 'PRESENT' || a.status === 'LATE',
  ).length;
  const avgAttendanceRate =
    attendances.length > 0
      ? Math.round((presentCount / attendances.length) * 100)
      : 0;

  return prisma.programRecap.create({
    data: {
      programId,
      totalSessions,
      totalParticipants,
      avgAttendanceRate,
      totalReports,
      totalQuotes,
    },
  });
}

/**
 * 참가자별 통계
 */
export async function getParticipantStats(programId: string) {
  const participants = await prisma.programParticipant.findMany({
    where: { programId },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
      attendances: {
        select: { status: true },
      },
    },
  });

  return participants.map((p) => {
    const attended = p.attendances.filter(
      (a) => a.status === 'PRESENT' || a.status === 'LATE',
    ).length;
    const total = p.attendances.length;

    return {
      id: p.id,
      user: p.user,
      attendanceRate: total > 0 ? Math.round((attended / total) * 100) : 0,
      attendedCount: attended,
    };
  });
}

/**
 * 프로그램 하이라이트 (인기 책 등)
 */
export async function getProgramHighlights(programId: string) {
  const sessions = await prisma.programSession.findMany({
    where: { programId },
    include: {
      _count: { select: { attendances: true } },
    },
    orderBy: { date: 'asc' },
  });

  // 가장 참석자가 많았던 세션의 책
  const topSessions = [...sessions]
    .sort((a, b) => b._count.attendances - a._count.attendances)
    .slice(0, 3);

  return {
    topBooks: topSessions
      .filter((s) => s.bookTitle)
      .map((s) => ({
        title: s.bookTitle!,
        author: s.bookAuthor,
        attendees: s._count.attendances,
      })),
  };
}
