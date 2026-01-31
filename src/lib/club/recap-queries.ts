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
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      sessions: true,
      participants: true,
    },
  });

  if (!program) throw new Error('Program not found');

  const totalSessions = program.sessions.length;
  const totalParticipants = program.participants.length;

  // 출석률 계산
  const attendances = await prisma.programAttendance.findMany({
    where: { session: { programId } },
    select: { status: true },
  });

  const presentCount = attendances.filter(
    (a) => a.status === 'PRESENT' || a.status === 'LATE',
  ).length;
  const avgAttendanceRate =
    attendances.length > 0
      ? Math.round((presentCount / attendances.length) * 100)
      : 0;

  // 독후감 수 - BookReport는 Member를 통해 참조됨
  // programId가 있는 독후감만 카운트하거나, 세션의 bookTitle 기준으로 매칭
  const totalReports = await prisma.bookReport.count({
    where: { programId },
  });

  // 명문장 수 - Quote는 User 소속이며 bookTitle로 매칭
  const bookTitles = program.sessions
    .map((s) => s.bookTitle)
    .filter((t): t is string => !!t);

  const totalQuotes =
    bookTitles.length > 0
      ? await prisma.quote.count({
          where: { bookTitle: { in: bookTitles } },
        })
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
