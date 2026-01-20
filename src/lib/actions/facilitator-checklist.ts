'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import type {
  ChecklistItem,
  DefaultChecklistType,
  DEFAULT_CHECKLIST_TEMPLATES,
} from '@/types/facilitator'

/**
 * 1. 체크리스트 템플릿 저장
 */
export async function saveChecklistTemplate(
  programId: string,
  items: ChecklistItem[],
  isRequired: boolean = false,
  userId: string
) {
  // 권한 확인 (운영진만)
  const membership = await prisma.programMembership.findFirst({
    where: {
      programId,
      userId,
      role: 'ORGANIZER',
    },
  })

  const isAdmin = await prisma.user.findFirst({
    where: {
      id: userId,
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
    },
  })

  if (!membership && !isAdmin) {
    throw new Error('운영진만 템플릿을 저장할 수 있습니다.')
  }

  const template = await prisma.facilitatorChecklistTemplate.upsert({
    where: { programId },
    create: {
      programId,
      items: JSON.stringify(items),
      isRequired,
    },
    update: {
      items: JSON.stringify(items),
      isRequired,
    },
  })

  revalidatePath(`/admin/programs/${programId}`)
  revalidatePath(`/mypage/programs/${programId}`)

  return template
}

/**
 * 2. 기본 템플릿 로드
 */
export async function loadDefaultTemplate(
  type: DefaultChecklistType
): Promise<ChecklistItem[]> {
  const templates: Record<DefaultChecklistType, ChecklistItem[]> = {
    basic: [
      { id: '1', text: '읽기 범위 확인', category: 'preparation', order: 1 },
      { id: '2', text: '토론 질문 3개 이상 준비', category: 'content', order: 2 },
      { id: '3', text: '타임 테이블 작성', category: 'planning', order: 3 },
      { id: '4', text: '발제문 작성 (선택)', category: 'content', order: 4, optional: true },
      { id: '5', text: '진행 순서 확인', category: 'planning', order: 5 },
      { id: '6', text: '자료 준비 (선택)', category: 'materials', order: 6, optional: true },
    ],
    detailed: [
      { id: '1', text: '책 전체 읽기 완료', category: 'preparation', order: 1 },
      { id: '2', text: '읽기 범위 재확인', category: 'preparation', order: 2 },
      { id: '3', text: '핵심 키워드 정리', category: 'content', order: 3 },
      { id: '4', text: '토론 질문 5개 이상 준비', category: 'content', order: 4 },
      { id: '5', text: '발제문 작성', category: 'content', order: 5 },
      { id: '6', text: '관련 자료 조사', category: 'materials', order: 6, optional: true },
      { id: '7', text: '타임 테이블 작성 (분 단위)', category: 'planning', order: 7 },
      { id: '8', text: '진행 멘트 준비', category: 'planning', order: 8 },
      { id: '9', text: 'PPT/자료 준비 (선택)', category: 'materials', order: 9, optional: true },
      { id: '10', text: '최종 점검', category: 'preparation', order: 10 },
    ],
    simple: [
      { id: '1', text: '읽기 범위 확인', category: 'preparation', order: 1 },
      { id: '2', text: '토론 질문 준비', category: 'content', order: 2 },
      { id: '3', text: '진행 순서 확인', category: 'planning', order: 3 },
    ],
  }

  return templates[type] || templates.basic
}

/**
 * 3. 체크리스트 항목 토글
 */
export async function toggleChecklistItem(
  facilitatorId: string,
  itemId: string,
  userId: string
) {
  // 진행자 정보 확인
  const facilitator = await prisma.sessionFacilitator.findUnique({
    where: { id: facilitatorId },
    include: {
      session: {
        include: { program: true },
      },
      checklist: true,
    },
  })

  if (!facilitator) {
    throw new Error('진행자 정보를 찾을 수 없습니다.')
  }

  // 본인 확인
  if (facilitator.userId !== userId) {
    throw new Error('본인의 체크리스트만 수정할 수 있습니다.')
  }

  // 템플릿 조회
  const template = await prisma.facilitatorChecklistTemplate.findUnique({
    where: { programId: facilitator.session.programId },
  })

  if (!template) {
    throw new Error('체크리스트 템플릿이 없습니다.')
  }

  const templateItems: ChecklistItem[] = JSON.parse(template.items)
  const totalItems = templateItems.filter(item => !item.optional).length

  // 현재 완료 항목
  let completedItems: string[] = facilitator.checklist
    ? JSON.parse(facilitator.checklist.completedItems)
    : []

  // 토글
  if (completedItems.includes(itemId)) {
    completedItems = completedItems.filter(id => id !== itemId)
  } else {
    completedItems.push(itemId)
  }

  // 진행률 계산 (필수 항목만)
  const completedRequired = completedItems.filter(id => {
    const item = templateItems.find(i => i.id === id)
    return item && !item.optional
  }).length

  const progress = totalItems > 0
    ? Math.round((completedRequired / totalItems) * 100)
    : 0

  // 체크리스트 upsert
  const checklist = await prisma.facilitatorChecklist.upsert({
    where: { facilitatorId },
    create: {
      facilitatorId,
      completedItems: JSON.stringify(completedItems),
      progress,
    },
    update: {
      completedItems: JSON.stringify(completedItems),
      progress,
    },
  })

  revalidatePath(`/mypage/programs/${facilitator.session.programId}`)
  revalidatePath(`/mypage/programs/${facilitator.session.programId}/sessions/${facilitator.sessionId}`)

  return checklist
}

/**
 * 4. 체크리스트 조회
 */
export async function getFacilitatorChecklist(facilitatorId: string) {
  const facilitator = await prisma.sessionFacilitator.findUnique({
    where: { id: facilitatorId },
    include: {
      session: {
        include: { program: true },
      },
      checklist: true,
    },
  })

  if (!facilitator) {
    return null
  }

  // 템플릿 조회
  const template = await prisma.facilitatorChecklistTemplate.findUnique({
    where: { programId: facilitator.session.programId },
  })

  if (!template) {
    return null
  }

  const items: ChecklistItem[] = JSON.parse(template.items)
  const completedItems: string[] = facilitator.checklist
    ? JSON.parse(facilitator.checklist.completedItems)
    : []

  return {
    items,
    completedItems,
    progress: facilitator.checklist?.progress || 0,
    isRequired: template.isRequired,
  }
}

/**
 * 5. 프로그램 체크리스트 템플릿 조회
 */
export async function getProgramChecklistTemplate(programId: string) {
  const template = await prisma.facilitatorChecklistTemplate.findUnique({
    where: { programId },
  })

  if (!template) {
    return null
  }

  return {
    items: JSON.parse(template.items) as ChecklistItem[],
    isRequired: template.isRequired,
  }
}

/**
 * 6. 체크리스트 템플릿 삭제
 */
export async function deleteChecklistTemplate(
  programId: string,
  userId: string
) {
  // 권한 확인
  const membership = await prisma.programMembership.findFirst({
    where: {
      programId,
      userId,
      role: 'ORGANIZER',
    },
  })

  const isAdmin = await prisma.user.findFirst({
    where: {
      id: userId,
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
    },
  })

  if (!membership && !isAdmin) {
    throw new Error('운영진만 템플릿을 삭제할 수 있습니다.')
  }

  await prisma.facilitatorChecklistTemplate.delete({
    where: { programId },
  })

  revalidatePath(`/admin/programs/${programId}`)
  revalidatePath(`/mypage/programs/${programId}`)

  return { success: true }
}
