'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

// 모든 페이지 조회 (어드민용)
export async function getAllPages() {
  return await prisma.page.findMany({
    orderBy: [
      { menuGroup: 'asc' },
      { menuOrder: 'asc' },
    ],
  });
}

// 공개된 페이지만 조회 (메뉴용)
export async function getPublishedPages() {
  return await prisma.page.findMany({
    where: {
      isPublished: true,
      showInMenu: true,
    },
    orderBy: [
      { menuGroup: 'asc' },
      { menuOrder: 'asc' },
    ],
  });
}

// 특정 페이지 조회
export async function getPageBySlug(slug: string) {
  return await prisma.page.findUnique({
    where: { slug },
  });
}

// 페이지 공개 상태 변경
export async function togglePagePublished(id: string) {
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) throw new Error('Page not found');

  await prisma.page.update({
    where: { id },
    data: { isPublished: !page.isPublished },
  });

  revalidatePath('/admin/pages');
  revalidatePath('/');
  return { success: true };
}

// 페이지 정보 수정
export async function updatePage(
  id: string,
  data: {
    title?: string;
    description?: string;
    isPublished?: boolean;
    unpublishedMessage?: string;
    seoTitle?: string;
    seoDescription?: string;
  }
) {
  await prisma.page.update({
    where: { id },
    data,
  });

  revalidatePath('/admin/pages');
  revalidatePath('/');
  return { success: true };
}
