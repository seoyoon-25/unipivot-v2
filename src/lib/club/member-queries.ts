import prisma from '@/lib/db';

// 회원 목록 (관리자용) - 출석률, 독후감/명문장 카운트 포함
export async function getAdminMembersExtended(options: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  sortBy?: 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}) {
  const {
    page = 1,
    limit = 20,
    role,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const orderBy: Record<string, string> =
    sortBy === 'name' ? { name: sortOrder } : { createdAt: sortOrder };

  const [members, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            programParticipants: true,
            quotes: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const memberIds = members.map((m) => m.id);

  // Batch queries instead of N+1 (2 queries instead of 2*N)
  const [attendanceData, reportData] = await Promise.all([
    prisma.programAttendance.findMany({
      where: { participant: { userId: { in: memberIds } } },
      select: { participant: { select: { userId: true } }, status: true },
    }),
    prisma.bookReport.findMany({
      where: { author: { userId: { in: memberIds } } },
      select: { author: { select: { userId: true } } },
    }),
  ]);

  // Group attendance by userId
  const attendanceByUser = new Map<string, string[]>();
  for (const a of attendanceData) {
    const uid = a.participant.userId;
    if (!attendanceByUser.has(uid)) attendanceByUser.set(uid, []);
    attendanceByUser.get(uid)!.push(a.status);
  }

  // Count reports by userId
  const reportCountByUser = new Map<string, number>();
  for (const r of reportData) {
    const uid = r.author.userId;
    if (uid) {
      reportCountByUser.set(uid, (reportCountByUser.get(uid) || 0) + 1);
    }
  }

  const membersWithStats = members.map((member) => {
    const attendances = attendanceByUser.get(member.id) || [];
    const attendanceRate =
      attendances.length > 0
        ? Math.round(
            (attendances.filter(
              (s) => s === 'PRESENT' || s === 'LATE'
            ).length /
              attendances.length) *
              100
          )
        : 0;

    return {
      id: member.id,
      name: member.name,
      email: member.email,
      image: member.image,
      role: member.role,
      createdAt: member.createdAt,
      programCount: member._count.programParticipants,
      reportCount: reportCountByUser.get(member.id) || 0,
      quoteCount: member._count.quotes,
      attendanceRate,
    };
  });

  return {
    members: membersWithStats,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

// 회원 상세 정보
export async function getMemberDetail(userId: string) {
  const member = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          programParticipants: true,
          quotes: true,
        },
      },
    },
  });

  if (!member) return null;

  const [attendances, reportCount] = await Promise.all([
    prisma.programAttendance.findMany({
      where: { participant: { userId } },
      select: { status: true },
    }),
    prisma.bookReport.count({
      where: { author: { userId } },
    }),
  ]);

  const attendanceRate =
    attendances.length > 0
      ? Math.round(
          (attendances.filter(
            (a) => a.status === 'PRESENT' || a.status === 'LATE'
          ).length /
            attendances.length) *
            100
        )
      : 0;

  return {
    id: member.id,
    name: member.name,
    email: member.email,
    image: member.image,
    role: member.role,
    createdAt: member.createdAt,
    stats: {
      programCount: member._count.programParticipants,
      reportCount,
      quoteCount: member._count.quotes,
      attendanceRate,
      totalAttendances: attendances.length,
    },
  };
}

// 회원 활동 - 참여 프로그램
export async function getMemberPrograms(userId: string) {
  return prisma.programParticipant.findMany({
    where: { userId },
    include: {
      program: {
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          startDate: true,
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });
}

// 회원 활동 - 출석 기록
export async function getMemberAttendances(userId: string, limit = 20) {
  return prisma.programAttendance.findMany({
    where: { participant: { userId } },
    include: {
      session: {
        include: {
          program: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { session: { date: 'desc' } },
    take: limit,
  });
}

// 회원 활동 - 독후감 (BookReport는 Member를 통해 연결)
export async function getMemberReports(userId: string, limit = 20) {
  return prisma.bookReport.findMany({
    where: { author: { userId } },
    select: {
      id: true,
      bookTitle: true,
      bookAuthor: true,
      createdAt: true,
      isPublic: true,
      status: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// 회원 활동 - 명문장
export async function getMemberQuotes(userId: string, limit = 20) {
  return prisma.quote.findMany({
    where: { userId },
    select: {
      id: true,
      bookTitle: true,
      content: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
