'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { generateMemberCode, normalizePhone, MEMBER_GRADES, MEMBER_STATUS } from '@/lib/services/member-matching';
import { calculateMemberStats } from '@/lib/services/member-stats';

// 회원 목록 조회 옵션
interface GetMembersOptions {
  page?: number;
  limit?: number;
  search?: string;
  grade?: string;
  status?: string;
  sortBy?: 'name' | 'memberCode' | 'joinedAt' | 'attendanceRate';
  sortOrder?: 'asc' | 'desc';
}

// 회원 생성 데이터
interface CreateMemberData {
  name: string;
  birthYear?: number;
  birthDate?: Date;
  gender?: string;
  email?: string;
  phone?: string;
  kakaoId?: string;
  organization?: string;
  origin?: string;
  hometown?: string;
  residence?: string;
  grade?: string;
  status?: string;
  joinedAt?: Date;
  userId?: string;
}

// 회원 수정 데이터
interface UpdateMemberData extends Partial<CreateMemberData> {
  id: string;
}

/**
 * 회원 목록 조회
 */
export async function getMembers(options: GetMembersOptions = {}) {
  const {
    page = 1,
    limit = 20,
    search,
    grade,
    status,
    sortBy = 'name',
    sortOrder = 'asc',
  } = options;

  const skip = (page - 1) * limit;

  // 검색 조건
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' as const } },
      { memberCode: { contains: search, mode: 'insensitive' as const } },
      { email: { contains: search, mode: 'insensitive' as const } },
      { phone: { contains: search, mode: 'insensitive' as const } },
    ];
  }

  if (grade) {
    where.grade = grade;
  }

  if (status) {
    where.status = status;
  }

  // 정렬
  let orderBy: any = {};
  if (sortBy === 'attendanceRate') {
    orderBy = { stats: { attendanceRate: sortOrder } };
  } else {
    orderBy = { [sortBy]: sortOrder };
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        stats: {
          select: {
            attendanceRate: true,
            reportRate: true,
            totalPrograms: true,
            noShowCount: true,
          },
        },
      },
    }),
    prisma.member.count({ where }),
  ]);

  return {
    members,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * 회원 상세 조회
 */
export async function getMember(id: string) {
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      stats: true,
      statusLogs: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      notes: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      attendances: {
        orderBy: [{ programId: 'asc' }, { sessionNumber: 'asc' }],
        include: {
          program: {
            select: { id: true, title: true, slug: true, type: true },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      applications: {
        orderBy: { appliedAt: 'desc' },
        include: {
          program: {
            select: {
              id: true,
              title: true,
              slug: true,
              type: true,
              startDate: true,
              endDate: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!member) return null;

  // 프로그램별 역할 조회 (member.userId가 있는 경우)
  let membershipRoles: Record<string, string> = {};
  if (member.userId) {
    const memberships = await prisma.programMembership.findMany({
      where: { userId: member.userId },
      select: { programId: true, role: true },
    });
    membershipRoles = memberships.reduce((acc, m) => {
      acc[m.programId] = m.role;
      return acc;
    }, {} as Record<string, string>);
  }

  // 출석 데이터를 프로그램별로 그룹핑하여 통계 계산
  const programMap = new Map<string, {
    programId: string;
    programTitle: string;
    programType: string;
    role: string | null;
    totalSessions: number;
    attendedSessions: number;
    reportSubmitted: number;
    sessions: Array<{
      sessionNumber: number;
      sessionDate: Date | null;
      attended: boolean;
      reportSubmitted: boolean;
    }>;
  }>();

  for (const att of member.attendances) {
    const existing = programMap.get(att.programId);
    const sessionData = {
      sessionNumber: att.sessionNumber,
      sessionDate: att.sessionDate,
      attended: att.attended,
      reportSubmitted: att.reportSubmitted,
    };

    if (existing) {
      existing.totalSessions++;
      if (att.attended) existing.attendedSessions++;
      if (att.reportSubmitted) existing.reportSubmitted++;
      existing.sessions.push(sessionData);
    } else {
      programMap.set(att.programId, {
        programId: att.programId,
        programTitle: att.program.title,
        programType: att.program.type,
        role: membershipRoles[att.programId] || null,
        totalSessions: 1,
        attendedSessions: att.attended ? 1 : 0,
        reportSubmitted: att.reportSubmitted ? 1 : 0,
        sessions: [sessionData],
      });
    }
  }

  // 통계 계산 및 배열 변환
  const programParticipations = Array.from(programMap.values()).map(p => ({
    ...p,
    attendanceRate: p.totalSessions > 0 ? Math.round((p.attendedSessions / p.totalSessions) * 100) : 0,
    reportRate: p.totalSessions > 0 ? Math.round((p.reportSubmitted / p.totalSessions) * 100) : 0,
    sessions: p.sessions.sort((a, b) => a.sessionNumber - b.sessionNumber),
  }));

  // User를 통한 신청 이력도 가져오기 (memberId가 없는 것만)
  if (member.userId) {
    const userApplications = await prisma.programApplication.findMany({
      where: {
        userId: member.userId,
        memberId: null, // memberId가 없는 것만 (중복 방지)
      },
      orderBy: { appliedAt: 'desc' },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    // 두 리스트 합치기
    const allApplications = [...member.applications, ...userApplications];
    // 날짜순 정렬
    allApplications.sort((a, b) =>
      new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
    );

    return {
      ...member,
      applications: allApplications,
      programParticipations,
    };
  }

  return {
    ...member,
    programParticipations,
  };
}

/**
 * 회원 생성
 */
export async function createMember(data: CreateMemberData) {
  // 고유번호 생성
  const memberCode = await generateMemberCode(
    data.birthYear || null,
    data.joinedAt || new Date()
  );

  // 전화번호 정규화
  const phone = data.phone ? normalizePhone(data.phone) : undefined;

  const member = await prisma.member.create({
    data: {
      memberCode,
      name: data.name,
      birthYear: data.birthYear,
      birthDate: data.birthDate,
      gender: data.gender,
      email: data.email,
      phone,
      kakaoId: data.kakaoId,
      organization: data.organization,
      origin: data.origin,
      hometown: data.hometown,
      residence: data.residence,
      grade: data.grade || 'NEW',
      status: data.status || 'ACTIVE',
      joinedAt: data.joinedAt || new Date(),
      userId: data.userId,
    },
  });

  // 통계 초기화
  await prisma.memberStats.create({
    data: { memberId: member.id },
  });

  revalidatePath('/admin/members');
  return member;
}

/**
 * 회원 수정
 */
export async function updateMember(data: UpdateMemberData) {
  const { id, ...updateData } = data;

  // 전화번호 정규화
  if (updateData.phone) {
    updateData.phone = normalizePhone(updateData.phone);
  }

  const member = await prisma.member.update({
    where: { id },
    data: updateData,
  });

  revalidatePath('/admin/members');
  revalidatePath(`/admin/members/${id}`);
  return member;
}

/**
 * 회원 삭제
 */
export async function deleteMember(id: string) {
  await prisma.member.delete({ where: { id } });
  revalidatePath('/admin/members');
}

/**
 * 회원 등급 변경
 */
export async function changeMemberGrade(
  memberId: string,
  newGrade: string,
  reason: string,
  changedBy: string
) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { grade: true, status: true },
  });

  if (!member) {
    throw new Error('회원을 찾을 수 없습니다.');
  }

  // 변경 이력 기록
  await prisma.memberStatusLog.create({
    data: {
      memberId,
      previousGrade: member.grade,
      newGrade,
      reason,
      createdBy: changedBy,
    },
  });

  // 등급 업데이트
  const updated = await prisma.member.update({
    where: { id: memberId },
    data: { grade: newGrade },
  });

  revalidatePath('/admin/members');
  revalidatePath(`/admin/members/${memberId}`);
  return updated;
}

/**
 * 회원 상태 변경
 */
export async function changeMemberStatus(
  memberId: string,
  newStatus: string,
  reason: string,
  changedBy: string
) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { grade: true, status: true },
  });

  if (!member) {
    throw new Error('회원을 찾을 수 없습니다.');
  }

  // 변경 이력 기록
  await prisma.memberStatusLog.create({
    data: {
      memberId,
      previousStatus: member.status,
      newStatus,
      reason,
      createdBy: changedBy,
    },
  });

  // 상태 업데이트
  const updated = await prisma.member.update({
    where: { id: memberId },
    data: { status: newStatus },
  });

  revalidatePath('/admin/members');
  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath('/admin/members/blacklist');
  return updated;
}

/**
 * 회원 메모 추가
 */
export async function addMemberNote(memberId: string, content: string, createdBy: string) {
  const note = await prisma.memberNote.create({
    data: {
      memberId,
      content,
      createdBy,
    },
  });

  revalidatePath(`/admin/members/${memberId}`);
  return note;
}

/**
 * 회원 메모 삭제
 */
export async function deleteMemberNote(noteId: string) {
  const note = await prisma.memberNote.delete({
    where: { id: noteId },
  });

  revalidatePath(`/admin/members/${note.memberId}`);
  return note;
}

/**
 * 블랙리스트 (WATCH, WARNING, BLOCKED) 회원 목록 조회
 */
export async function getBlacklistMembers() {
  const members = await prisma.member.findMany({
    where: {
      status: { in: ['WATCH', 'WARNING', 'BLOCKED'] },
    },
    include: {
      stats: {
        select: {
          attendanceRate: true,
          noShowCount: true,
        },
      },
      statusLogs: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: [
      { status: 'desc' }, // BLOCKED > WARNING > WATCH
      { name: 'asc' },
    ],
  });

  // 상태별 그룹화
  const grouped = {
    BLOCKED: members.filter((m) => m.status === 'BLOCKED'),
    WARNING: members.filter((m) => m.status === 'WARNING'),
    WATCH: members.filter((m) => m.status === 'WATCH'),
  };

  return {
    total: members.length,
    blockedCount: grouped.BLOCKED.length,
    warningCount: grouped.WARNING.length,
    watchCount: grouped.WATCH.length,
    grouped,
    members,
  };
}

/**
 * VVIP/VIP 회원 목록 조회
 */
export async function getVIPMembers() {
  const members = await prisma.member.findMany({
    where: {
      grade: { in: ['VVIP', 'VIP', 'STAFF'] },
    },
    include: {
      stats: {
        select: {
          attendanceRate: true,
          totalPrograms: true,
        },
      },
    },
    orderBy: [{ grade: 'asc' }, { name: 'asc' }],
  });

  const grouped = {
    STAFF: members.filter((m) => m.grade === 'STAFF'),
    VVIP: members.filter((m) => m.grade === 'VVIP'),
    VIP: members.filter((m) => m.grade === 'VIP'),
  };

  return {
    total: members.length,
    grouped,
    members,
  };
}

/**
 * 회원과 웹사이트 사용자 연동
 */
export async function linkMemberToUser(memberId: string, userId: string) {
  // 이미 연동된 회원이 있는지 확인
  const existingMember = await prisma.member.findFirst({
    where: { userId },
  });

  if (existingMember) {
    throw new Error('이미 다른 회원과 연동된 사용자입니다.');
  }

  const member = await prisma.member.update({
    where: { id: memberId },
    data: { userId },
  });

  revalidatePath(`/admin/members/${memberId}`);
  return member;
}

/**
 * 회원-사용자 연동 해제
 */
export async function unlinkMemberFromUser(memberId: string) {
  const member = await prisma.member.update({
    where: { id: memberId },
    data: { userId: null },
  });

  revalidatePath(`/admin/members/${memberId}`);
  return member;
}

/**
 * 회원 출석 기록 추가
 */
export async function addMemberAttendance(
  memberId: string,
  programId: string,
  sessionNumber: number,
  data: {
    sessionDate?: Date;
    attended: boolean;
    reportSubmitted?: boolean;
    note?: string;
  }
) {
  const attendance = await prisma.memberAttendance.upsert({
    where: {
      memberId_programId_sessionNumber: {
        memberId,
        programId,
        sessionNumber,
      },
    },
    update: {
      ...data,
    },
    create: {
      memberId,
      programId,
      sessionNumber,
      ...data,
    },
  });

  // 통계 재계산
  await calculateMemberStats(memberId);

  revalidatePath(`/admin/members/${memberId}`);
  return attendance;
}

/**
 * 회원 CSV 다운로드용 데이터
 */
export async function getMembersForExport(options: { grade?: string; status?: string } = {}) {
  const where: any = {};

  if (options.grade) {
    where.grade = options.grade;
  }

  if (options.status) {
    where.status = options.status;
  }

  const members = await prisma.member.findMany({
    where,
    include: {
      stats: true,
    },
    orderBy: { memberCode: 'asc' },
  });

  return members.map((m) => ({
    고유번호: m.memberCode,
    이름: m.name,
    출생년도: m.birthYear || '',
    성별: m.gender === 'MALE' ? '남' : m.gender === 'FEMALE' ? '여' : '',
    이메일: m.email || '',
    연락처: m.phone || '',
    출신: m.origin || '',
    고향: m.hometown || '',
    거주지: m.residence || '',
    소속: m.organization || '',
    등급: MEMBER_GRADES[m.grade as keyof typeof MEMBER_GRADES]?.label || m.grade,
    상태: MEMBER_STATUS[m.status as keyof typeof MEMBER_STATUS]?.label || m.status,
    출석률: m.stats?.attendanceRate || 0,
    독후감제출률: m.stats?.reportRate || 0,
    총참여프로그램: m.stats?.totalPrograms || 0,
    노쇼횟수: m.stats?.noShowCount || 0,
    가입일: m.joinedAt.toISOString().split('T')[0],
  }));
}

/**
 * 회원 통계 재계산
 */
export async function recalculateMemberStats(memberId: string) {
  const stats = await calculateMemberStats(memberId);
  revalidatePath(`/admin/members/${memberId}`);
  return stats;
}
