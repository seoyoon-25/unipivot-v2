'use server'

import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/check-role'
import { revalidatePath } from 'next/cache'

// ---------------------------------------------------------------------------
// Auth helper – only ADMIN and SUPER_ADMIN may change user roles
// ---------------------------------------------------------------------------

async function checkAdminAuth() {
  const user = await getCurrentUser()
  if (!user) {
    return { error: '로그인이 필요합니다.', user: null }
  }
  const allowed = ['ADMIN', 'SUPER_ADMIN']
  if (!allowed.includes(user.role)) {
    return { error: '권한이 없습니다.', user: null }
  }
  return { error: null, user }
}

// ---------------------------------------------------------------------------
// changeUserRole
// ---------------------------------------------------------------------------

const VALID_ROLES = ['USER', 'FACILITATOR', 'ADMIN'] as const

export async function changeUserRole(userId: string, newRole: string) {
  const { error, user } = await checkAdminAuth()
  if (error || !user) {
    return { error: error ?? '인증에 실패했습니다.' }
  }

  // Validate role value
  if (!VALID_ROLES.includes(newRole as (typeof VALID_ROLES)[number])) {
    return { error: '유효하지 않은 역할입니다.' }
  }

  // Prevent changing own role
  if (user.id === userId) {
    return { error: '자신의 역할은 변경할 수 없습니다.' }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    })

    revalidatePath('/club/admin/members')
    return { success: true }
  } catch (err) {
    console.error('changeUserRole error:', err)
    return { error: '역할 변경에 실패했습니다.' }
  }
}
