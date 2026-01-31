'use server'

import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/check-role'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

async function checkAdminAuth() {
  const user = await getCurrentUser()
  if (!user) {
    return { error: '로그인이 필요합니다.', user: null }
  }
  const allowed = ['ADMIN', 'SUPER_ADMIN', 'FACILITATOR']
  if (!allowed.includes(user.role)) {
    return { error: '권한이 없습니다.', user: null }
  }
  return { error: null, user }
}

// ---------------------------------------------------------------------------
// Slug helper
// ---------------------------------------------------------------------------

function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[가-힣]/g, () => '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  if (!slug) {
    return `program-${Date.now()}`
  }

  return `${slug}-${Date.now().toString(36)}`
}

// ---------------------------------------------------------------------------
// createProgram
// ---------------------------------------------------------------------------

export async function createProgram(formData: {
  title: string
  type: string
  description?: string
  status?: string
  startDate?: string
  endDate?: string
}) {
  const { error, user } = await checkAdminAuth()
  if (error || !user) {
    return { error: error ?? '인증에 실패했습니다.' }
  }

  try {
    const slug = generateSlug(formData.title)

    const program = await prisma.program.create({
      data: {
        title: formData.title,
        slug,
        type: formData.type,
        description: formData.description ?? null,
        status: formData.status ?? 'DRAFT',
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
      },
    })

    revalidatePath('/club/admin/programs')
    redirect(`/club/admin/programs/${program.id}/edit`)
  } catch (err: unknown) {
    // Next.js redirect throws a special error that must be re-thrown
    if (err && typeof err === 'object' && 'digest' in err) {
      throw err
    }
    console.error('createProgram error:', err)
    return { error: '프로그램 생성에 실패했습니다.' }
  }
}

// ---------------------------------------------------------------------------
// updateProgram
// ---------------------------------------------------------------------------

export async function updateProgram(
  programId: string,
  data: {
    title?: string
    description?: string
    type?: string
    status?: string
    startDate?: string | null
    endDate?: string | null
  },
) {
  const { error, user } = await checkAdminAuth()
  if (error || !user) {
    return { error: error ?? '인증에 실패했습니다.' }
  }

  try {
    await prisma.program.update({
      where: { id: programId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.startDate !== undefined && {
          startDate: data.startDate ? new Date(data.startDate) : null,
        }),
        ...(data.endDate !== undefined && {
          endDate: data.endDate ? new Date(data.endDate) : null,
        }),
      },
    })

    revalidatePath('/club/admin/programs')
    revalidatePath(`/club/admin/programs/${programId}`)
    return { success: true }
  } catch (err) {
    console.error('updateProgram error:', err)
    return { error: '프로그램 수정에 실패했습니다.' }
  }
}

// ---------------------------------------------------------------------------
// deleteProgram
// ---------------------------------------------------------------------------

export async function deleteProgram(programId: string) {
  const { error, user } = await checkAdminAuth()
  if (error || !user) {
    return { error: error ?? '인증에 실패했습니다.' }
  }

  try {
    await prisma.program.delete({
      where: { id: programId },
    })

    revalidatePath('/club/admin/programs')
    return { success: true }
  } catch (err) {
    console.error('deleteProgram error:', err)
    return { error: '프로그램 삭제에 실패했습니다.' }
  }
}

// ---------------------------------------------------------------------------
// addSession
// ---------------------------------------------------------------------------

export async function addSession(data: {
  programId: string
  date: string
  title?: string
  bookTitle?: string
  bookAuthor?: string
  location?: string
}) {
  const { error, user } = await checkAdminAuth()
  if (error || !user) {
    return { error: error ?? '인증에 실패했습니다.' }
  }

  try {
    // Auto-calculate sessionNo based on existing sessions
    const lastSession = await prisma.programSession.findFirst({
      where: { programId: data.programId },
      orderBy: { sessionNo: 'desc' },
      select: { sessionNo: true },
    })

    const sessionNo = (lastSession?.sessionNo ?? 0) + 1

    await prisma.programSession.create({
      data: {
        programId: data.programId,
        sessionNo,
        date: new Date(data.date),
        title: data.title ?? null,
        bookTitle: data.bookTitle ?? null,
        bookAuthor: data.bookAuthor ?? null,
        location: data.location ?? null,
      },
    })

    revalidatePath(`/club/admin/programs/${data.programId}`)
    return { success: true }
  } catch (err) {
    console.error('addSession error:', err)
    return { error: '세션 추가에 실패했습니다.' }
  }
}

// ---------------------------------------------------------------------------
// deleteSession
// ---------------------------------------------------------------------------

export async function deleteSession(sessionId: string, programId: string) {
  const { error, user } = await checkAdminAuth()
  if (error || !user) {
    return { error: error ?? '인증에 실패했습니다.' }
  }

  try {
    await prisma.programSession.delete({
      where: { id: sessionId },
    })

    revalidatePath(`/club/admin/programs/${programId}`)
    return { success: true }
  } catch (err) {
    console.error('deleteSession error:', err)
    return { error: '세션 삭제에 실패했습니다.' }
  }
}

// ---------------------------------------------------------------------------
// addParticipant
// ---------------------------------------------------------------------------

export async function addParticipant(programId: string, userId: string) {
  const { error, user } = await checkAdminAuth()
  if (error || !user) {
    return { error: error ?? '인증에 실패했습니다.' }
  }

  try {
    await prisma.programParticipant.create({
      data: {
        programId,
        userId,
      },
    })

    revalidatePath(`/club/admin/programs/${programId}`)
    return { success: true }
  } catch (err) {
    console.error('addParticipant error:', err)
    return { error: '참가자 추가에 실패했습니다.' }
  }
}

// ---------------------------------------------------------------------------
// removeParticipant
// ---------------------------------------------------------------------------

export async function removeParticipant(participantId: string, programId: string) {
  const { error, user } = await checkAdminAuth()
  if (error || !user) {
    return { error: error ?? '인증에 실패했습니다.' }
  }

  try {
    await prisma.programParticipant.delete({
      where: { id: participantId },
    })

    revalidatePath(`/club/admin/programs/${programId}`)
    return { success: true }
  } catch (err) {
    console.error('removeParticipant error:', err)
    return { error: '참가자 제거에 실패했습니다.' }
  }
}

// ---------------------------------------------------------------------------
// changeParticipantRole (uses ProgramMembership model)
// ---------------------------------------------------------------------------

export async function changeParticipantRole(
  programId: string,
  userId: string,
  role: 'ORGANIZER' | 'PARTICIPANT',
) {
  const { error, user } = await checkAdminAuth()
  if (error || !user) {
    return { error: error ?? '인증에 실패했습니다.' }
  }

  try {
    await prisma.programMembership.upsert({
      where: {
        programId_userId: {
          programId,
          userId,
        },
      },
      create: {
        programId,
        userId,
        role,
      },
      update: {
        role,
      },
    })

    revalidatePath(`/club/admin/programs/${programId}`)
    return { success: true }
  } catch (err) {
    console.error('changeParticipantRole error:', err)
    return { error: '역할 변경에 실패했습니다.' }
  }
}
