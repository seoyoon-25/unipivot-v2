'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * 읽고 싶은 책 추가
 */
export async function addWishBook(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' };
  }

  const userId = session.user.id;
  const readBookId = formData.get('readBookId') as string | null;
  const customTitle = formData.get('customTitle') as string | null;
  const customAuthor = formData.get('customAuthor') as string | null;
  const memo = formData.get('memo') as string | null;

  try {
    if (readBookId) {
      const existing = await prisma.wishBook.findFirst({
        where: { userId, readBookId },
      });
      if (existing) {
        return { error: '이미 추가된 책입니다.' };
      }
    }

    await prisma.wishBook.create({
      data: {
        userId,
        readBookId: readBookId || null,
        customTitle: readBookId ? null : customTitle,
        customAuthor: readBookId ? null : customAuthor,
        memo: memo || null,
      },
    });

    revalidatePath('/club/bookclub/my-bookshelf');
    return { success: true };
  } catch (error) {
    console.error('addWishBook error:', error);
    return { error: '추가에 실패했습니다.' };
  }
}

/**
 * 읽고 싶은 책 삭제
 */
export async function removeWishBook(wishBookId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' };
  }

  try {
    await prisma.wishBook.delete({
      where: {
        id: wishBookId,
        userId: session.user.id,
      },
    });

    revalidatePath('/club/bookclub/my-bookshelf');
    return { success: true };
  } catch (error) {
    console.error('removeWishBook error:', error);
    return { error: '삭제에 실패했습니다.' };
  }
}

/**
 * 인생 책 추가
 */
export async function addFavoriteBook(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' };
  }

  const userId = session.user.id;
  const readBookId = formData.get('readBookId') as string;
  const comment = formData.get('comment') as string | null;

  if (!readBookId) {
    return { error: '책을 선택해주세요.' };
  }

  try {
    const count = await prisma.favoriteBook.count({ where: { userId } });
    if (count >= 3) {
      return { error: '인생 책은 최대 3권까지 선정할 수 있습니다.' };
    }

    const existing = await prisma.favoriteBook.findFirst({
      where: { userId, readBookId },
    });
    if (existing) {
      return { error: '이미 인생 책으로 선정된 책입니다.' };
    }

    await prisma.favoriteBook.create({
      data: {
        userId,
        readBookId,
        comment: comment || null,
        displayOrder: count + 1,
      },
    });

    revalidatePath('/club/bookclub/my-bookshelf');
    return { success: true };
  } catch (error) {
    console.error('addFavoriteBook error:', error);
    return { error: '추가에 실패했습니다.' };
  }
}

/**
 * 인생 책 삭제
 */
export async function removeFavoriteBook(favoriteBookId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' };
  }

  try {
    await prisma.favoriteBook.delete({
      where: {
        id: favoriteBookId,
        userId: session.user.id,
      },
    });

    revalidatePath('/club/bookclub/my-bookshelf');
    return { success: true };
  } catch (error) {
    console.error('removeFavoriteBook error:', error);
    return { error: '삭제에 실패했습니다.' };
  }
}

/**
 * 인생 책 소감 수정
 */
export async function updateFavoriteComment(favoriteBookId: string, comment: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다.' };
  }

  try {
    await prisma.favoriteBook.update({
      where: {
        id: favoriteBookId,
        userId: session.user.id,
      },
      data: { comment },
    });

    revalidatePath('/club/bookclub/my-bookshelf');
    return { success: true };
  } catch (error) {
    console.error('updateFavoriteComment error:', error);
    return { error: '수정에 실패했습니다.' };
  }
}
