'use server';

import { prisma } from '@/lib/db';

export type ProgramType = 'BOOKCLUB' | 'SEMINAR' | 'KMOVE' | 'DEBATE' | 'ALL';
export type ProgramStatus = 'RECRUITING' | 'ONGOING' | 'COMPLETED';

interface GetProgramsOptions {
  type?: ProgramType;
  status?: ProgramStatus;
  limit?: number;
  offset?: number;
}

// 프로그램 상태 계산
function getProgramStatus(program: {
  applicationDeadline?: Date | null;
  recruitStartDate?: Date | null;
  recruitEndDate?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
  status?: string | null;
}): ProgramStatus {
  const now = new Date();

  // status 필드가 있으면 우선 사용
  if (program.status === 'COMPLETED') return 'COMPLETED';
  if (program.status === 'RECRUITING') return 'RECRUITING';
  if (program.status === 'ONGOING') return 'ONGOING';

  // 날짜 기반 계산
  if (program.endDate && new Date(program.endDate) < now) {
    return 'COMPLETED';
  }

  // 모집 마감일 기준
  const deadline = program.recruitEndDate || program.applicationDeadline;
  if (deadline && new Date(deadline) >= now) {
    return 'RECRUITING';
  }

  if (program.startDate && new Date(program.startDate) <= now) {
    return 'ONGOING';
  }

  return 'RECRUITING';
}

// 상태별 프로그램 조회
export async function getProgramsByStatus() {
  const programs = await prisma.program.findMany({
    where: {
      status: { not: 'DRAFT' },
    },
    orderBy: { startDate: 'desc' },
  });

  const recruiting: typeof programs = [];
  const ongoing: typeof programs = [];
  const completed: typeof programs = [];

  for (const program of programs) {
    const status = getProgramStatus(program);
    if (status === 'RECRUITING') recruiting.push(program);
    else if (status === 'ONGOING') ongoing.push(program);
    else completed.push(program);
  }

  return { recruiting, ongoing, completed };
}

// 유형 필터 + 상태별 프로그램 조회
export async function getFilteredProgramsByStatus(type?: ProgramType) {
  const where: any = {
    status: { not: 'DRAFT' },
  };

  if (type && type !== 'ALL') {
    where.type = type;
  }

  const programs = await prisma.program.findMany({
    where,
    orderBy: { startDate: 'desc' },
  });

  const recruiting: typeof programs = [];
  const ongoing: typeof programs = [];
  const completed: typeof programs = [];

  for (const program of programs) {
    const status = getProgramStatus(program);
    if (status === 'RECRUITING') recruiting.push(program);
    else if (status === 'ONGOING') ongoing.push(program);
    else completed.push(program);
  }

  return { recruiting, ongoing, completed };
}

// 단일 프로그램 상세 조회
export async function getProgram(programId: string) {
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      sessions: {
        orderBy: { sessionNo: 'asc' },
        select: {
          id: true,
          sessionNo: true,
          title: true,
          date: true,
          status: true,
          bookTitle: true,
          bookRange: true,
        },
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          attendances: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      },
      _count: {
        select: {
          sessions: true,
          participants: true,
        },
      },
    },
  })

  return program
}

// 완료된 프로그램 페이지네이션 (더 보기용)
export async function getCompletedPrograms(
  type?: ProgramType,
  limit: number = 6,
  offset: number = 0
) {
  const where: any = {
    status: { not: 'DRAFT' },
  };

  if (type && type !== 'ALL') {
    where.type = type;
  }

  const allPrograms = await prisma.program.findMany({
    where,
    orderBy: { startDate: 'desc' },
  });

  // 완료된 프로그램만 필터링
  const completed = allPrograms.filter(
    (p) => getProgramStatus(p) === 'COMPLETED'
  );

  const total = completed.length;
  const programs = completed.slice(offset, offset + limit);
  const hasMore = offset + limit < total;

  return {
    programs,
    total,
    hasMore,
    nextOffset: offset + limit,
  };
}
