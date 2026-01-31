'use server';

import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/check-role';
import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

async function checkAdminAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: '로그인이 필요합니다.', user: null };
  }
  const allowed = ['ADMIN', 'SUPER_ADMIN', 'FACILITATOR'];
  if (!allowed.includes(user.role)) {
    return { error: '권한이 없습니다.', user: null };
  }
  return { error: null, user };
}

// ---------------------------------------------------------------------------
// createResource
// ---------------------------------------------------------------------------

export async function createResource(data: {
  sessionId: string;
  title: string;
  description?: string;
  type: string;
  url?: string;
}) {
  const { error, user } = await checkAdminAuth();
  if (error || !user) {
    return { error: error ?? '인증에 실패했습니다.' };
  }

  try {
    await prisma.facilitatorResource.create({
      data: {
        sessionId: data.sessionId,
        userId: user.id,
        title: data.title,
        description: data.description ?? null,
        type: data.type || 'NOTE',
        url: data.url ?? null,
      },
    });

    revalidatePath('/club/admin/resources');
    return { success: true };
  } catch (err) {
    console.error('createResource error:', err);
    return { error: '자료 등록에 실패했습니다.' };
  }
}

// ---------------------------------------------------------------------------
// deleteResource
// ---------------------------------------------------------------------------

export async function deleteResource(resourceId: string) {
  const { error, user } = await checkAdminAuth();
  if (error || !user) {
    return { error: error ?? '인증에 실패했습니다.' };
  }

  try {
    await prisma.facilitatorResource.delete({
      where: { id: resourceId },
    });

    revalidatePath('/club/admin/resources');
    return { success: true };
  } catch (err) {
    console.error('deleteResource error:', err);
    return { error: '자료 삭제에 실패했습니다.' };
  }
}
