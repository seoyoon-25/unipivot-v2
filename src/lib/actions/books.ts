'use server';

import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// 모든 책 제안 조회 (투표수 순)
export async function getBookSuggestions(options?: {
  sortBy?: 'votes' | 'recent';
  includeSelected?: boolean;
}) {
  const { sortBy = 'votes', includeSelected = false } = options || {};

  const where = includeSelected ? {} : { isSelected: false };

  const suggestions = await prisma.bookSuggestion.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: { votes: true },
      },
    },
    orderBy: sortBy === 'votes'
      ? { voteCount: 'desc' }
      : { createdAt: 'desc' },
  });

  return suggestions;
}

// 내가 투표한 책 ID 목록 조회
export async function getMyVotes() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const votes = await prisma.bookVote.findMany({
    where: { userId: session.user.id },
    select: { suggestionId: true },
  });

  return votes.map((v) => v.suggestionId);
}

// 책 제안 등록
export async function createBookSuggestion(data: {
  title: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  image?: string;
  description?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  try {
    // 같은 제목의 책이 이미 있는지 확인
    const existing = await prisma.bookSuggestion.findFirst({
      where: {
        title: data.title,
        isSelected: false,
      },
    });

    if (existing) {
      return {
        success: false,
        error: '이미 등록된 책입니다. 해당 책에 투표해주세요!',
        existingId: existing.id,
      };
    }

    const suggestion = await prisma.bookSuggestion.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });

    revalidatePath('/books');
    return { success: true, suggestion };
  } catch (error) {
    console.error('Create book suggestion error:', error);
    return { success: false, error: '책 등록에 실패했습니다.' };
  }
}

// 투표하기/취소하기
export async function toggleVote(suggestionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  try {
    // 기존 투표 확인
    const existingVote = await prisma.bookVote.findUnique({
      where: {
        userId_suggestionId: {
          userId: session.user.id,
          suggestionId,
        },
      },
    });

    if (existingVote) {
      // 투표 취소
      await prisma.$transaction([
        prisma.bookVote.delete({
          where: { id: existingVote.id },
        }),
        prisma.bookSuggestion.update({
          where: { id: suggestionId },
          data: { voteCount: { decrement: 1 } },
        }),
      ]);

      revalidatePath('/books');
      return { success: true, voted: false };
    } else {
      // 투표 추가
      await prisma.$transaction([
        prisma.bookVote.create({
          data: {
            userId: session.user.id,
            suggestionId,
          },
        }),
        prisma.bookSuggestion.update({
          where: { id: suggestionId },
          data: { voteCount: { increment: 1 } },
        }),
      ]);

      revalidatePath('/books');
      return { success: true, voted: true };
    }
  } catch (error) {
    console.error('Toggle vote error:', error);
    return { success: false, error: '투표 처리에 실패했습니다.' };
  }
}

// 책 제안 삭제 (본인만 가능)
export async function deleteBookSuggestion(suggestionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  try {
    const suggestion = await prisma.bookSuggestion.findUnique({
      where: { id: suggestionId },
    });

    if (!suggestion) {
      return { success: false, error: '존재하지 않는 책입니다.' };
    }

    // 본인 또는 관리자만 삭제 가능
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
    if (suggestion.userId !== session.user.id && !isAdmin) {
      return { success: false, error: '삭제 권한이 없습니다.' };
    }

    await prisma.bookSuggestion.delete({
      where: { id: suggestionId },
    });

    revalidatePath('/books');
    return { success: true };
  } catch (error) {
    console.error('Delete book suggestion error:', error);
    return { success: false, error: '삭제에 실패했습니다.' };
  }
}

// 책 선정하기 (관리자 전용)
export async function selectBook(suggestionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
  if (!isAdmin) {
    return { success: false, error: '관리자 권한이 필요합니다.' };
  }

  try {
    await prisma.bookSuggestion.update({
      where: { id: suggestionId },
      data: { isSelected: true },
    });

    revalidatePath('/books');
    return { success: true };
  } catch (error) {
    console.error('Select book error:', error);
    return { success: false, error: '선정 처리에 실패했습니다.' };
  }
}
