import prisma from '@/lib/db';

// 대시보드 통계
export async function getAdminStats() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalMembers, newMembersThisWeek, ongoingPrograms, monthlyAttendance] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.program.count({ where: { status: 'ONGOING' } }),
      // ProgramAttendance에 createdAt이 없으므로 세션 날짜 기준으로 조회
      prisma.programAttendance.findMany({
        where: {
          session: { date: { gte: monthStart } },
        },
        select: { status: true },
      }),
    ]);

  const attendanceRate =
    monthlyAttendance.length > 0
      ? Math.round(
          (monthlyAttendance.filter(
            (a) => a.status === 'PRESENT' || a.status === 'LATE'
          ).length /
            monthlyAttendance.length) *
            100
        )
      : 0;

  return {
    totalMembers,
    newMembersThisWeek,
    ongoingPrograms,
    attendanceRate,
  };
}

// 최근 활동
export async function getRecentActivity() {
  const [recentMembers, recentPrograms, upcomingSessions] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    }),
    prisma.program.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.programSession.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      take: 5,
      include: { program: { select: { id: true, title: true } } },
    }),
  ]);

  return { recentMembers, recentPrograms, upcomingSessions };
}

// 프로그램 목록 (관리자용)
export async function getAdminPrograms(options: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
}) {
  const { page = 1, limit = 20, status, type, search } = options;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (search) where.title = { contains: search, mode: 'insensitive' };

  const [programs, total] = await Promise.all([
    prisma.program.findMany({
      where,
      include: {
        _count: { select: { participants: true, sessions: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.program.count({ where }),
  ]);

  return {
    programs: programs.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      type: p.type,
      status: p.status,
      startDate: p.startDate,
      createdAt: p.createdAt,
      participantCount: p._count.participants,
      sessionCount: p._count.sessions,
    })),
    total,
    totalPages: Math.ceil(total / limit),
  };
}

// 회원 목록 (관리자용)
export async function getAdminMembers(options: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}) {
  const { page = 1, limit = 20, role, search } = options;

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [members, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        _count: { select: { programParticipants: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    members: members.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      image: m.image,
      role: m.role,
      createdAt: m.createdAt,
      programCount: m._count.programParticipants,
    })),
    total,
    totalPages: Math.ceil(total / limit),
  };
}

// 프로그램 상세 (수정용)
export async function getProgramForEdit(programId: string) {
  return prisma.program.findUnique({
    where: { id: programId },
    include: {
      sessions: { orderBy: { sessionNo: 'asc' } },
      participants: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      },
      memberships: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      },
    },
  });
}

// 출석 현황 (프로그램별)
export async function getAttendanceByProgram(programId: string) {
  const sessions = await prisma.programSession.findMany({
    where: { programId },
    orderBy: { sessionNo: 'asc' },
    include: {
      attendances: {
        include: {
          participant: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      },
    },
  });

  return sessions;
}

// 출석 관리용 프로그램 목록
export async function getProgramsForAttendance() {
  return prisma.program.findMany({
    where: { status: { in: ['ONGOING', 'RECRUITING'] } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      _count: { select: { sessions: true, participants: true } },
    },
  });
}

// 자료 목록
export async function getResources(options: {
  page?: number;
  limit?: number;
  sessionId?: string;
}) {
  const { page = 1, limit = 20, sessionId } = options;

  const where: Record<string, unknown> = {};
  if (sessionId) where.sessionId = sessionId;

  const [resources, total] = await Promise.all([
    prisma.facilitatorResource.findMany({
      where,
      include: {
        session: {
          include: { program: { select: { id: true, title: true } } },
        },
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.facilitatorResource.count({ where }),
  ]);

  return {
    resources,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
