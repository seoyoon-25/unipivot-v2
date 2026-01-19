'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export type TeamMemberRole = 'STAFF' | 'ADVISOR' | 'ALUMNI';

// 모든 팀 멤버 조회
export async function getAllTeamMembers() {
  return await prisma.teamMember.findMany({
    orderBy: [
      { role: 'asc' },
      { displayOrder: 'asc' },
    ],
  });
}

// 역할별 팀 멤버 조회
export async function getTeamMembersByRole(role: TeamMemberRole) {
  return await prisma.teamMember.findMany({
    where: {
      role,
      isVisible: true,
    },
    orderBy: { displayOrder: 'asc' },
  });
}

// 공개된 팀 멤버 조회 (페이지용)
export async function getVisibleTeamMembers() {
  const members = await prisma.teamMember.findMany({
    where: { isVisible: true },
    orderBy: [
      { role: 'asc' },
      { displayOrder: 'asc' },
    ],
  });

  return {
    staff: members.filter(m => m.role === 'STAFF'),
    advisors: members.filter(m => m.role === 'ADVISOR'),
    alumni: members.filter(m => m.role === 'ALUMNI'),
  };
}

// 팀 멤버 생성
export async function createTeamMember(data: {
  name: string;
  role: TeamMemberRole;
  position?: string;
  photo?: string;
  programs?: string[];
  introduction?: string;
  period?: string;
}) {
  await prisma.teamMember.create({
    data: {
      ...data,
      programs: data.programs ? JSON.stringify(data.programs) : null,
    },
  });

  revalidatePath('/admin/team-members');
  revalidatePath('/people');
  return { success: true };
}

// 팀 멤버 수정
export async function updateTeamMember(
  id: string,
  data: {
    name?: string;
    role?: TeamMemberRole;
    position?: string;
    photo?: string;
    programs?: string[];
    introduction?: string;
    period?: string;
    isVisible?: boolean;
    displayOrder?: number;
  }
) {
  await prisma.teamMember.update({
    where: { id },
    data: {
      ...data,
      programs: data.programs ? JSON.stringify(data.programs) : undefined,
    },
  });

  revalidatePath('/admin/team-members');
  revalidatePath('/people');
  return { success: true };
}

// 팀 멤버 삭제
export async function deleteTeamMember(id: string) {
  await prisma.teamMember.delete({
    where: { id },
  });

  revalidatePath('/admin/team-members');
  revalidatePath('/people');
  return { success: true };
}

// 순서 변경
export async function reorderTeamMembers(
  updates: { id: string; displayOrder: number }[]
) {
  for (const update of updates) {
    await prisma.teamMember.update({
      where: { id: update.id },
      data: { displayOrder: update.displayOrder },
    });
  }

  revalidatePath('/admin/team-members');
  revalidatePath('/people');
  return { success: true };
}
